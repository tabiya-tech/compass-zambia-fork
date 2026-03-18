"""
Repository for analytics aggregation queries.
"""
import logging
from abc import ABC, abstractmethod

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.analytics.types import (
    CareerReadinessStatsResponse,
    CompletedAllStats,
    ModuleBreakdown,
    SkillGapEntry,
    SkillGapStatsResponse,
    StartedStats,
)
from app.server_dependencies.database_collections import Collections

logger = logging.getLogger(__name__)


class IAnalyticsRepository(ABC):
    """Interface for analytics aggregation queries."""

    @abstractmethod
    async def get_career_readiness_stats(
        self, module_ids: list[str], module_titles: dict[str, str]
    ) -> CareerReadinessStatsResponse:
        """Return aggregated career readiness stats across all students."""
        raise NotImplementedError()

    @abstractmethod
    async def get_skill_gap_stats(self, limit: int) -> SkillGapStatsResponse:
        """Return aggregated skill gap stats across all students."""
        raise NotImplementedError()


class AnalyticsRepository(IAnalyticsRepository):
    """MongoDB implementation for analytics aggregation queries."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self._db = db

    async def _get_per_user_module_stats(self) -> list[dict]:
        """Aggregate per-user started/completed module counts from career_readiness_conversations."""
        return await self._db.get_collection(
            Collections.CAREER_READINESS_CONVERSATIONS
        ).aggregate([
            {
                "$group": {
                    "_id": "$user_id",
                    "modules_started": {"$sum": 1},
                    "modules_completed": {
                        "$sum": {"$cond": [{"$eq": ["$quiz_passed", True]}, 1, 0]}
                    },
                }
            }
        ]).to_list(length=None)

    async def _get_per_module_stats(self) -> list[dict]:
        """Aggregate started/completed counts per module_id."""
        return await self._db.get_collection(
            Collections.CAREER_READINESS_CONVERSATIONS
        ).aggregate([
            {
                "$group": {
                    "_id": "$module_id",
                    "started_count": {"$sum": 1},
                    "completed_count": {
                        "$sum": {"$cond": [{"$eq": ["$quiz_passed", True]}, 1, 0]}
                    },
                }
            }
        ]).to_list(length=None)

    async def get_career_readiness_stats(
        self, module_ids: list[str], module_titles: dict[str, str]
    ) -> CareerReadinessStatsResponse:
        """
        Aggregate career readiness stats across all students.

        :param module_ids: Ordered list of module IDs from the module registry.
        :param module_titles: Mapping of module_id → display title.
        """
        total_modules = len(module_ids)
        total_students = await self._db.get_collection(
            Collections.USER_PREFERENCES
        ).count_documents({})

        user_stats = await self._get_per_user_module_stats()
        started_count = len(user_stats)
        completed_all_count = sum(
            1 for u in user_stats if u["modules_completed"] >= total_modules
        )
        avg_completed = (
            sum(u["modules_completed"] for u in user_stats) / started_count
            if started_count > 0 else 0.0
        )

        module_stats_by_id = {m["_id"]: m for m in await self._get_per_module_stats()}
        module_breakdown = [
            ModuleBreakdown(
                module_id=mid,
                module_title=module_titles.get(mid, mid),
                started_count=module_stats_by_id.get(mid, {}).get("started_count", 0),
                completed_count=module_stats_by_id.get(mid, {}).get("completed_count", 0),
            )
            for mid in module_ids
        ]

        return CareerReadinessStatsResponse(
            total_registered_students=total_students,
            started=StartedStats(
                count=started_count,
                percentage=round(started_count / total_students * 100, 1) if total_students > 0 else 0.0,
            ),
            completed_all_modules=CompletedAllStats(
                count=completed_all_count,
                percentage_of_started=round(completed_all_count / started_count * 100, 1) if started_count > 0 else 0.0,
            ),
            avg_modules_completed=round(avg_completed, 1),
            total_modules=total_modules,
            module_breakdown=module_breakdown,
        )

    async def get_skill_gap_stats(self, limit: int) -> SkillGapStatsResponse:
        """
        Aggregate skill gap recommendations across all users to find the most
        commonly missing skills platform-wide.

        :param limit: Maximum number of top skill gaps to return.
        """
        collection = self._db.get_collection(Collections.USER_RECOMMENDATIONS)
        total_with_gaps = await collection.count_documents(
            {"skill_gap_recommendations": {"$exists": True, "$ne": []}}
        )

        results = await collection.aggregate([
            {"$match": {"skill_gap_recommendations": {"$exists": True, "$ne": []}}},
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
