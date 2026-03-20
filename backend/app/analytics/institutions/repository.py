import asyncio
import base64
import hashlib
import json
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.server_dependencies.database_collections import Collections
from app.server_dependencies.db_dependencies import CompassDBProvider
from app.analytics.types import Institution
from common_libs.time_utilities import datetime_to_mongo_date

logger = logging.getLogger(__name__)

PLAIN_DATA_SCHOOL_KEY = "school"


def _anonymize(user_id: str) -> str:
    return hashlib.md5(user_id.encode(), usedforsecurity=False).hexdigest()


def _load_institution_list() -> list[str]:
    """
    Load the canonical list of institutions from the PLAIN_PERSONAL_DATA_FIELDS env var.

    The env var is expected to be a JSON array of field definitions (same schema as
    FRONTEND_SENSITIVE_DATA_FIELDS). We look for the field with dataKey="school" and
    type="ENUM" and return its values["en-US"] list.

    Falls back to an empty list if the env var is not set or the field is not found.
    """
    raw = os.getenv("PLAIN_PERSONAL_DATA_FIELDS")
    if not raw:
        logger.warning("PLAIN_PERSONAL_DATA_FIELDS env var not set; institution list will be empty")
        return []
    try:
        fields = json.loads(raw)
        # Support both array-of-objects and object-of-objects formats
        if isinstance(fields, dict):
            fields = list(fields.values())
        for field in fields:
            if field.get("dataKey") == PLAIN_DATA_SCHOOL_KEY and field.get("type") == "ENUM":
                values = field.get("values", {})
                # Prefer en-US, fall back to first available locale
                locale_values = values.get("en-US") or next(iter(values.values()), [])
                return list(locale_values)
    except Exception:
        logger.exception("Failed to parse PLAIN_PERSONAL_DATA_FIELDS for institution list")
    return []


# Cache the list at import time so we don't re-parse on every request
_INSTITUTION_LIST: list[str] = _load_institution_list()


class InstitutionsRepository:
    def __init__(
        self,
        userdata_db: AsyncIOMotorDatabase,
        metrics_db: AsyncIOMotorDatabase,
        application_db: AsyncIOMotorDatabase,
    ):
        self._collection = userdata_db.get_collection(Collections.PLAIN_PERSONAL_DATA)
        self._metrics_collection = metrics_db.get_collection(Collections.COMPASS_METRICS)
        self._cr_conversations = application_db.get_collection(Collections.CAREER_READINESS_CONVERSATIONS)
        self._ce_conversations = application_db.get_collection(Collections.CAREER_EXPLORER_CONVERSATIONS)

    async def _get_active_anon_ids_last_7_days(self) -> set[str]:
        """Return the set of anonymized_user_ids active in the last 7 days from metrics."""
        now = datetime.now(tz=timezone.utc)
        seven_days_ago = now - timedelta(days=7)
        start_mongo = datetime_to_mongo_date(seven_days_ago)
        pipeline = [
            {"$match": {
                "timestamp": {"$gte": start_mongo},
                "anonymized_user_id": {"$exists": True, "$ne": None},
            }},
            {"$group": {"_id": "$anonymized_user_id"}},
        ]
        results = await self._metrics_collection.aggregate(pipeline).to_list(length=None)
        return {r["_id"] for r in results}

    async def _get_counts_by_institution(self) -> dict[str, tuple[int, set[str]]]:
        """
        Return a dict mapping institution name → (student_count, set_of_user_ids).
        Fetches all plain_personal_data records that have a school field.
        """
        pipeline = [
            {"$match": {f"data.{PLAIN_DATA_SCHOOL_KEY}": {"$exists": True, "$ne": None, "$ne": ""}}},
            {"$group": {
                "_id": f"$data.{PLAIN_DATA_SCHOOL_KEY}",
                "user_ids": {"$addToSet": "$user_id"},
            }},
        ]
        docs = await self._collection.aggregate(pipeline).to_list(length=None)
        return {
            d["_id"]: (len(d["user_ids"]), set(uid for uid in d["user_ids"] if uid))
            for d in docs
        }

    async def list_institutions(
        self,
        *,
        active: Optional[bool] = None,
        province: Optional[str] = None,
        cursor: Optional[str] = None,
        limit: int = 20,
    ) -> tuple[list[Institution], Optional[str], bool]:
        institution_names = _INSTITUTION_LIST

        # Apply province filter: province info is per-user, not per-institution in this model.
        # We skip province filtering at the institution level since the canonical list
        # does not carry province information. Callers who need per-province breakdown
        # should use the students endpoint.
        if province is not None:
            logger.warning("Province filter on institutions is not supported with static institution list; ignoring")

        # Decode cursor (index into the sorted list)
        start_index = 0
        if cursor:
            try:
                pad = 4 - len(cursor) % 4
                decoded = base64.urlsafe_b64decode(cursor + ("=" * (pad if pad != 4 else 0))).decode()
                start_index = int(decoded)
            except (ValueError, UnicodeDecodeError) as e:
                logger.warning("Invalid pagination cursor, ignoring: %s", e)

        # Slice the list for pagination
        page = institution_names[start_index:start_index + limit + 1]
        has_more = len(page) > limit
        if has_more:
            page = page[:limit]

        next_cursor: Optional[str] = None
        if has_more:
            next_idx = start_index + limit
            next_cursor = base64.urlsafe_b64encode(str(next_idx).encode()).decode().rstrip("=")

        # Fetch MongoDB counts in parallel
        counts_by_inst, active_anon_ids, cr_started_ids, cr_completed_ids, ce_started_ids = \
            await self._fetch_activity_data()

        items = []
        for name in page:
            inst_id = base64.urlsafe_b64encode(name.encode()).decode().rstrip("=")
            student_count, user_ids = counts_by_inst.get(name, (0, set()))
            anon_ids = {_anonymize(uid) for uid in user_ids}
            active_count = len(anon_ids & active_anon_ids)

            def _pct(count: int) -> Optional[float]:
                if student_count <= 0:
                    return None
                return round(count / student_count * 100, 1)

            cr_started_count = len(user_ids & cr_started_ids)
            cr_completed_count = len(user_ids & cr_completed_ids)
            ce_started_count = len(user_ids & ce_started_ids)

            items.append(Institution(
                id=inst_id,
                name=name,
                active=True,
                students=student_count if student_count > 0 else None,
                active_7_days=active_count if student_count > 0 else None,
                skills_discovery_started_pct=None,
                skills_discovery_completed_pct=None,
                career_readiness_started_pct=_pct(cr_started_count),
                career_readiness_completed_pct=_pct(cr_completed_count),
                career_explorer_started_pct=_pct(ce_started_count),
            ))

        return items, next_cursor, has_more

    async def _get_cr_user_ids(self) -> tuple[set[str], set[str]]:
        """
        Return (started_user_ids, completed_user_ids) for career readiness.
        Started = has at least one conversation record.
        Completed = has at least one conversation record with quiz_passed=True.
        """
        pipeline = [
            {"$group": {
                "_id": "$user_id",
                "any_passed": {"$max": {"$cond": [{"$eq": ["$quiz_passed", True]}, 1, 0]}},
            }},
        ]
        docs = await self._cr_conversations.aggregate(pipeline).to_list(length=None)
        started = {d["_id"] for d in docs if d["_id"]}
        completed = {d["_id"] for d in docs if d["_id"] and d["any_passed"] == 1}
        return started, completed

    async def _get_ce_started_user_ids(self) -> set[str]:
        """Return the set of user_ids that have started career explorer (have any conversation record)."""
        docs = await self._ce_conversations.distinct("user_id")
        return {uid for uid in docs if uid}

    async def _fetch_activity_data(self) -> tuple[
        dict[str, tuple[int, set[str]]],
        set[str],
        set[str],
        set[str],
        set[str],
    ]:
        counts_task = self._get_counts_by_institution()
        active_task = self._get_active_anon_ids_last_7_days()
        cr_task = self._get_cr_user_ids()
        ce_task = self._get_ce_started_user_ids()
        counts, active, (cr_started, cr_completed), ce_started = await asyncio.gather(
            counts_task, active_task, cr_task, ce_task
        )
        return counts, active, cr_started, cr_completed, ce_started

    async def count_institutions(
        self,
        *,
        active: Optional[bool] = None,
        province: Optional[str] = None,
    ) -> int:
        return len(_INSTITUTION_LIST)


InstitutionRepository = InstitutionsRepository


async def get_institution_repository(
    userdata_db: AsyncIOMotorDatabase = Depends(CompassDBProvider.get_userdata_db),
    metrics_db: AsyncIOMotorDatabase = Depends(CompassDBProvider.get_metrics_db),
    application_db: AsyncIOMotorDatabase = Depends(CompassDBProvider.get_application_db),
) -> InstitutionsRepository:
    return InstitutionsRepository(userdata_db, metrics_db, application_db)
