import base64
import logging
from typing import Optional

from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.server_dependencies.database_collections import Collections
from app.server_dependencies.db_dependencies import CompassDBProvider
from app.analytics.types import User

logger = logging.getLogger(__name__)

SCHOOL_DATA_KEY = "school"


class UsersRepository:
    def __init__(
        self,
        application_db: AsyncIOMotorDatabase,
        userdata_db: AsyncIOMotorDatabase,
    ):
        self._prefs_collection = application_db.get_collection(Collections.USER_PREFERENCES)
        self._plain_data_collection = userdata_db.get_collection(Collections.PLAIN_PERSONAL_DATA)

    async def _get_user_ids_by_filters(
        self,
        institution: Optional[str] = None,
        province: Optional[str] = None,
    ) -> Optional[list[str]]:
        ids_by_institution: Optional[list[str]] = None
        if institution is not None:
            ppd = await self._plain_data_collection.find(
                {f"data.{SCHOOL_DATA_KEY}": institution}
            ).to_list(length=None)
            ids = [d["user_id"] for d in ppd if d.get("user_id")]
            if not ids:
                return []
            ids_by_institution = ids

        ids_by_province: Optional[list[str]] = None
        if province is not None:
            ppd = await self._plain_data_collection.find(
                {"data.province": province}
            ).to_list(length=None)
            ids = [d["user_id"] for d in ppd if d.get("user_id")]
            if not ids:
                return []
            ids_by_province = ids

        if ids_by_institution is not None and ids_by_province is not None:
            return list(set(ids_by_institution) & set(ids_by_province))
        if ids_by_institution is not None:
            return ids_by_institution
        if ids_by_province is not None:
            return ids_by_province
        return None

    async def list_users(
        self,
        *,
        active: Optional[bool] = None,
        institution: Optional[str] = None,
        province: Optional[str] = None,
        cursor: Optional[str] = None,
        limit: int = 20,
    ) -> tuple[list[User], Optional[str], bool]:
        query: dict = {}
        user_ids_filter = await self._get_user_ids_by_filters(institution, province)
        if user_ids_filter is not None:
            if not user_ids_filter:
                return [], None, False
            query["user_id"] = {"$in": user_ids_filter}

        if active is not None:
            if active:
                query["accepted_tc"] = {"$exists": True, "$ne": None}
            else:
                query["$or"] = [
                    {"accepted_tc": {"$exists": False}},
                    {"accepted_tc": None},
                ]

        if cursor:
            try:
                pad = 4 - len(cursor) % 4
                if pad != 4:
                    cursor = cursor + "=" * pad
                last_user_id = base64.urlsafe_b64decode(cursor).decode("utf-8")
                if "user_id" in query and "$in" in query["user_id"]:
                    query["$and"] = [
                        {"user_id": {"$in": query["user_id"]["$in"]}},
                        {"user_id": {"$gt": last_user_id}},
                    ]
                    del query["user_id"]
                else:
                    query["user_id"] = {"$gt": last_user_id}
            except (ValueError, UnicodeDecodeError) as e:
                logger.warning("Invalid pagination cursor, ignoring: %s", e)

        sort = [("user_id", 1)]
        cursor_obj = self._prefs_collection.find(query).sort(sort).limit(limit + 1)
        docs = await cursor_obj.to_list(length=limit + 1)
        has_more = len(docs) > limit
        if has_more:
            docs = docs[:limit]

        school_province_by_user: dict[str, tuple[str | None, str | None]] = {}
        if docs:
            user_ids = [d["user_id"] for d in docs]
            ppd_docs = await self._plain_data_collection.find(
                {"user_id": {"$in": user_ids}}
            ).to_list(length=None)
            for d in ppd_docs:
                data = d.get("data", {})
                school_province_by_user[d["user_id"]] = (
                    data.get(SCHOOL_DATA_KEY),
                    data.get("province"),
                )

        items = []
        for d in docs:
            user_id = d.get("user_id", "")
            inst, prov = school_province_by_user.get(user_id, (None, None))
            items.append(User(
                id=user_id,
                institution=inst,
                province=prov,
                active=d.get("accepted_tc") is not None,
            ))

        next_cursor = None
        if has_more and docs:
            last_id = docs[-1].get("user_id", "")
            next_cursor = base64.urlsafe_b64encode(last_id.encode()).decode().rstrip("=")

        return items, next_cursor, has_more

    async def count_users(
        self,
        *,
        active: Optional[bool] = None,
        institution: Optional[str] = None,
        province: Optional[str] = None,
    ) -> int:
        query: dict = {}
        user_ids_filter = await self._get_user_ids_by_filters(institution, province)
        if user_ids_filter is not None:
            if not user_ids_filter:
                return 0
            query["user_id"] = {"$in": user_ids_filter}

        if active is not None:
            if active:
                query["accepted_tc"] = {"$exists": True, "$ne": None}
            else:
                query["$or"] = [
                    {"accepted_tc": {"$exists": False}},
                    {"accepted_tc": None},
                ]

        return await self._prefs_collection.count_documents(query)


UserRepository = UsersRepository


async def get_user_repository(
    application_db: AsyncIOMotorDatabase = Depends(CompassDBProvider.get_application_db),
    userdata_db: AsyncIOMotorDatabase = Depends(CompassDBProvider.get_userdata_db),
) -> UsersRepository:
    return UsersRepository(application_db, userdata_db)
