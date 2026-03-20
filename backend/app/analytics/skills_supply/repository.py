"""
Repository for skills supply analytics.

Aggregates top_skills from explore_experiences_director_state.experiences_state[*].experience.top_skills
across all users who have completed at least one experience (dive_in_phase == PROCESSED).

Uses user_preferences.sessions to map session_id -> user_id.
"""
import logging
from abc import ABC, abstractmethod

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.analytics.skills_supply.types import SkillSupplyEntry, SkillsSupplyStatsResponse
from app.server_dependencies.database_collections import Collections

logger = logging.getLogger(__name__)


class ISkillsSupplyAnalyticsRepository(ABC):
    @abstractmethod
    async def get_skills_supply_stats(self, limit: int) -> SkillsSupplyStatsResponse:
        raise NotImplementedError()


class SkillsSupplyAnalyticsRepository(ISkillsSupplyAnalyticsRepository):
    def __init__(self, application_db: AsyncIOMotorDatabase):
        self._db = application_db

    async def get_skills_supply_stats(self, limit: int) -> SkillsSupplyStatsResponse:
        """
        Aggregate the most common skills across all students who have completed
        skills discovery (at least one experience with dive_in_phase == PROCESSED).

        Skills come from experiences_state[*].experience.top_skills in
        explore_experiences_director_state. We deduplicate by user (via
        user_preferences.sessions) so each user is counted once per skill.
        """
        # Build session_id -> user_id map from user_preferences
        prefs = await self._db.get_collection(
            Collections.USER_PREFERENCES
        ).find({}, {"user_id": 1, "sessions": 1, "_id": 0}).to_list(length=None)

        session_to_user: dict = {}
        for doc in prefs:
            uid = doc.get("user_id")
            if not uid:
                continue
            for s in doc.get("sessions", []):
                session_to_user[s] = uid
                session_to_user[str(s)] = uid

        # Aggregate skills from explore_experiences_director_state
        pipeline = [
            # Only sessions that have reached DIVE_IN (have processed experiences)
            {"$match": {"conversation_phase": "DIVE_IN"}},
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
                # Fall back to using session_id as user identifier
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

        total_students = len({
            session_to_user.get(doc["_id"]["session_id"])
            or session_to_user.get(str(doc["_id"]["session_id"]))
            or str(doc["_id"]["session_id"])
            for doc in docs
        })

        return SkillsSupplyStatsResponse(
            total_students_with_skills=total_students,
            top_skills=top,
        )
