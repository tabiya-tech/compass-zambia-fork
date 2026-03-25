"""
Repository for skill gap analytics aggregation queries.
"""
import logging
from abc import ABC, abstractmethod
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.analytics.skill_gap.types import SkillGapEntry, SkillGapStatsResponse
from app.server_dependencies.database_collections import Collections

logger = logging.getLogger(__name__)


class ISkillGapAnalyticsRepository(ABC):
    """Interface for skill gap analytics aggregation queries."""

    @abstractmethod
    async def get_skill_gap_stats(self, limit: int, user_ids: Optional[list[str]] = None) -> SkillGapStatsResponse:
        """Return aggregated skill gap stats, optionally scoped to a set of user_ids."""
        raise NotImplementedError()


class SkillGapAnalyticsRepository(ISkillGapAnalyticsRepository):
    """MongoDB implementation for skill gap analytics aggregation queries."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self._db = db

    async def get_skill_gap_stats(self, limit: int, user_ids: Optional[list[str]] = None) -> SkillGapStatsResponse:
        """
        Aggregate skill gap recommendations to find the most commonly missing skills.

        :param limit: Maximum number of top skill gaps to return.
        :param user_ids: If provided, restrict results to these user_ids.
        """
        collection = self._db.get_collection(Collections.USER_RECOMMENDATIONS)
        base_match: dict = {"skill_gap_recommendations": {"$exists": True, "$ne": []}}
        if user_ids is not None:
            base_match["user_id"] = {"$in": user_ids}

        total_with_gaps = await collection.count_documents(base_match)

        results = await collection.aggregate([
            {"$match": base_match},
            {"$unwind": "$skill_gap_recommendations"},
            {
                "$group": {
                    "_id": {
                        "skill_id": "$skill_gap_recommendations.skill_id",
                        "skill_label": "$skill_gap_recommendations.skill_label",
                    },
                    "students_with_gap_count": {"$sum": 1},
                    "avg_job_unlock_count": {
                        "$avg": "$skill_gap_recommendations.job_unlock_count"
                    },
                    "avg_proximity_score": {
                        "$avg": "$skill_gap_recommendations.proximity_score"
                    },
                }
            },
            {"$sort": {"students_with_gap_count": -1}},
            {"$limit": limit},
        ]).to_list(length=limit)

        top_skill_gaps = [
            SkillGapEntry(
                skill_id=r["_id"]["skill_id"],
                skill_label=r["_id"]["skill_label"],
                students_with_gap_count=r["students_with_gap_count"],
                avg_job_unlock_count=round(r["avg_job_unlock_count"], 2),
                avg_proximity_score=round(r["avg_proximity_score"], 3),
            )
            for r in results
        ]

        return SkillGapStatsResponse(
            total_students_with_skill_gaps=total_with_gaps,
            top_skill_gaps=top_skill_gaps,
        )
