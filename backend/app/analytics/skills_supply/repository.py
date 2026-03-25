"""
Repository for skills supply analytics.

Aggregates top_skills from explore_experiences_director_state.experiences_state[*].experience.top_skills
across all users who have completed at least one experience (dive_in_phase == PROCESSED).

Uses user_preferences.sessions to map session_id -> user_id.
"""
import logging
from abc import ABC, abstractmethod
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.analytics.skills_supply.types import SkillSupplyEntry, SkillsSupplyStatsResponse
from app.server_dependencies.database_collections import Collections

logger = logging.getLogger(__name__)


class ISkillsSupplyAnalyticsRepository(ABC):
    @abstractmethod
    async def get_skills_supply_stats(self, limit: int, user_ids: Optional[list[str]] = None) -> SkillsSupplyStatsResponse:
        raise NotImplementedError()


class SkillsSupplyAnalyticsRepository(ISkillsSupplyAnalyticsRepository):
    def __init__(self, application_db: AsyncIOMotorDatabase):
        self._db = application_db

    async def get_skills_supply_stats(self, limit: int, user_ids: Optional[list[str]] = None) -> SkillsSupplyStatsResponse:
        """
        Aggregate the most common skills across students who have completed
        skills discovery (at least one experience with dive_in_phase == PROCESSED).

        Skills come from experiences_state[*].experience.top_skills in
        explore_experiences_director_state. We deduplicate by user (via
        user_preferences.sessions) so each user is counted once per skill.

        :param user_ids: If provided, restrict results to these user_ids.
        """
        # Build session_id -> user_id map from user_preferences
        prefs_filter = {"user_id": {"$in": user_ids}} if user_ids is not None else {}
        prefs = await self._db.get_collection(
            Collections.USER_PREFERENCES
        ).find(prefs_filter, {"user_id": 1, "sessions": 1, "_id": 0}).to_list(length=None)

        session_to_user: dict = {}
        for doc in prefs:
            uid = doc.get("user_id")
            if not uid:
                continue
            for s in doc.get("sessions", []):
                session_to_user[s] = uid
                session_to_user[str(s)] = uid

        # Aggregate skills from explore_experiences_director_state
        # If we have a restricted session set, only query those sessions
        known_session_ids = list(session_to_user.keys()) if user_ids is not None else None
        base_session_match: dict = {"conversation_phase": "DIVE_IN"}
        if known_session_ids is not None:
            base_session_match["session_id"] = {"$in": known_session_ids}

        pipeline = [
            {"$match": base_session_match},
            # Convert experiences_state object to array of {k, v} pairs
            {"$addFields": {
                "exp_array": {"$objectToArray": "$experiences_state"}
            }},
            # Only keep experiences that are PROCESSED
            {"$addFields": {
                "processed_exps": {
                    "$filter": {
                        "input": "$exp_array",
                        "as": "e",
                        "cond": {"$eq": ["$$e.v.dive_in_phase", "PROCESSED"]}
                    }
                }
            }},
            # Unwind to one doc per processed experience
            {"$unwind": "$processed_exps"},
            # Unwind to one doc per skill
            {"$unwind": "$processed_exps.v.experience.top_skills"},
            # Project just what we need
            {"$project": {
                "session_id": 1,
                "skill_uuid": "$processed_exps.v.experience.top_skills.UUID",
                "skill_label": "$processed_exps.v.experience.top_skills.preferredLabel",
                "score": "$processed_exps.v.experience.top_skills.score",
            }},
            # Group by session + skill to deduplicate skills within the same session
            {"$group": {
                "_id": {
                    "session_id": "$session_id",
                    "skill_uuid": "$skill_uuid",
                },
                "skill_label": {"$first": "$skill_label"},
                "score": {"$max": "$score"},
            }},
        ]

        docs = await self._db.get_collection(
            Collections.EXPLORE_EXPERIENCES_DIRECTOR_STATE
        ).aggregate(pipeline).to_list(length=None)

        # Map session -> user, then aggregate per skill per user
        # skill_uuid -> {label, user_id -> max_score}
        skill_data: dict[str, dict] = {}
        for doc in docs:
            sid = doc["_id"]["session_id"]
            uid = session_to_user.get(sid) or session_to_user.get(str(sid))
            if not uid:
                # Session not mapped to a known user — skip when filtering by institution
                if user_ids is not None:
                    continue
                uid = str(sid)

            skill_uuid = doc["_id"]["skill_uuid"]
            if not skill_uuid:
                continue

            if skill_uuid not in skill_data:
                skill_data[skill_uuid] = {
                    "label": doc.get("skill_label", ""),
                    "users": {},
                }
            # Keep max score per user per skill
            prev = skill_data[skill_uuid]["users"].get(uid, 0)
            skill_data[skill_uuid]["users"][uid] = max(prev, doc.get("score", 0))

        # Compute per-skill aggregates
        entries = []
        for skill_uuid, data in skill_data.items():
            users = data["users"]
            student_count = len(users)
            avg_score = sum(users.values()) / student_count if student_count > 0 else 0.0
            entries.append(SkillSupplyEntry(
                skill_id=skill_uuid,
                skill_label=data["label"],
                student_count=student_count,
                avg_score=round(avg_score, 3),
            ))

        # Sort by student_count desc, then avg_score desc
        entries.sort(key=lambda e: (-e.student_count, -e.avg_score))
        top = entries[:limit]

        resolved_users = set()
        for doc in docs:
            sid = doc["_id"]["session_id"]
            uid = session_to_user.get(sid) or session_to_user.get(str(sid)) or (None if user_ids is not None else str(sid))
            if uid:
                resolved_users.add(uid)
        total_students = len(resolved_users)

        return SkillsSupplyStatsResponse(
            total_students_with_skills=total_students,
            top_skills=top,
        )
