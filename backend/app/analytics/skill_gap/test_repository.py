"""
Tests for the skill gap analytics repository.
"""
from typing import Awaitable

import pytest
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.analytics.skill_gap.repository import SkillGapAnalyticsRepository
from app.analytics.skill_gap.types import SkillGapStatsResponse
from app.server_dependencies.database_collections import Collections


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_skill_gap_rec(skill_id: str, skill_label: str, job_unlock_count: int, proximity_score: float) -> dict:
    return {
        "skill_id": skill_id,
        "skill_label": skill_label,
        "job_unlock_count": job_unlock_count,
        "proximity_score": proximity_score,
    }


# ---------------------------------------------------------------------------
# Shared fixture
# ---------------------------------------------------------------------------

@pytest.fixture(scope="function")
async def populated_repository(
    in_memory_application_database: Awaitable[AsyncIOMotorDatabase],
) -> SkillGapAnalyticsRepository:
    """
    Fixture that pre-populates the DB and returns a ready SkillGapAnalyticsRepository.

    Data layout:
      - user-a + user-b: have skill gap recommendations (sk-1 shared, sk-2 user-a only)
      - user-c: empty skill_gap_recommendations
    """
    db = await in_memory_application_database

    await db.get_collection(Collections.USER_RECOMMENDATIONS).insert_many([
        {
            "user_id": "user-a",
            "skill_gap_recommendations": [
                _make_skill_gap_rec("sk-1", "Communication", 4, 0.8),
                _make_skill_gap_rec("sk-2", "Leadership", 2, 0.6),
            ],
        },
        {
            "user_id": "user-b",
            "skill_gap_recommendations": [
                _make_skill_gap_rec("sk-1", "Communication", 6, 0.9),
            ],
        },
        {
            "user_id": "user-c",
            "skill_gap_recommendations": [],
        },
    ])

    return SkillGapAnalyticsRepository(db)


# ---------------------------------------------------------------------------
# Skill gap stats tests
# ---------------------------------------------------------------------------

class TestGetSkillGapStats:
    @pytest.mark.asyncio
    async def test_total_students_with_skill_gaps(
        self, populated_repository: Awaitable[SkillGapAnalyticsRepository]
    ):
        repo = await populated_repository
        result: SkillGapStatsResponse = await repo.get_skill_gap_stats(limit=10)
        # user-a and user-b have non-empty lists; user-c's is empty
        assert result.total_students_with_skill_gaps == 2

    @pytest.mark.asyncio
    async def test_top_skill_gaps_sorted_by_student_count(
        self, populated_repository: Awaitable[SkillGapAnalyticsRepository]
    ):
        repo = await populated_repository
        result = await repo.get_skill_gap_stats(limit=10)
        # sk-1 appears in user-a and user-b; sk-2 only in user-a
        assert result.top_skill_gaps[0].skill_id == "sk-1"
        assert result.top_skill_gaps[0].students_with_gap_count == 2
        assert result.top_skill_gaps[1].skill_id == "sk-2"
        assert result.top_skill_gaps[1].students_with_gap_count == 1

    @pytest.mark.asyncio
    async def test_avg_scores_computed_correctly(
        self, populated_repository: Awaitable[SkillGapAnalyticsRepository]
    ):
        repo = await populated_repository
        result = await repo.get_skill_gap_stats(limit=10)
        sk1 = result.top_skill_gaps[0]
        # job_unlock_count: (4 + 6) / 2 = 5.0; proximity: (0.8 + 0.9) / 2 = 0.85
        assert sk1.avg_job_unlock_count == 5.0
        assert sk1.avg_proximity_score == 0.85

    @pytest.mark.asyncio
    async def test_limit_is_respected(
        self, populated_repository: Awaitable[SkillGapAnalyticsRepository]
    ):
        repo = await populated_repository
        result = await repo.get_skill_gap_stats(limit=1)
        assert len(result.top_skill_gaps) == 1
        assert result.top_skill_gaps[0].skill_id == "sk-1"

    @pytest.mark.asyncio
    async def test_no_recommendations_returns_empty(
        self, in_memory_application_database: Awaitable[AsyncIOMotorDatabase]
    ):
        db = await in_memory_application_database
        repo = SkillGapAnalyticsRepository(db)
        result = await repo.get_skill_gap_stats(limit=10)

        assert result.total_students_with_skill_gaps == 0
        assert result.top_skill_gaps == []
