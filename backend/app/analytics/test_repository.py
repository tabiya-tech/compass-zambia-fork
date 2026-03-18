"""
Tests for the analytics repository.
"""
from typing import Awaitable

import pytest
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.analytics.repository import AnalyticsRepository
from app.analytics.types import CareerReadinessStatsResponse, SkillGapStatsResponse
from app.server_dependencies.database_collections import Collections

# ---------------------------------------------------------------------------
# Module IDs and titles used across tests
# ---------------------------------------------------------------------------
_MODULE_IDS = ["m1", "m2"]
_MODULE_TITLES = {"m1": "Module One", "m2": "Module Two"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_conversation(user_id: str, module_id: str, quiz_passed: bool, conv_id: str) -> dict:
    return {
        "conversation_id": conv_id,
        "user_id": user_id,
        "module_id": module_id,
        "quiz_passed": quiz_passed,
    }


def _make_user_prefs(user_id: str) -> dict:
    return {"user_id": user_id}


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
) -> AnalyticsRepository:
    """
    Fixture that pre-populates the DB and returns a ready AnalyticsRepository.

    Data layout:
      - 3 registered students: user-a, user-b, user-c
      - user-a: completed m1 and m2 (quiz_passed=True for both)
      - user-b: started m1 but not passed
      - user-c: no career readiness activity
      - user-a + user-b: have skill gap recommendations (sk-1 shared, sk-2 user-a only)
      - user-c: empty skill_gap_recommendations
    """
    db = await in_memory_application_database

    await db.get_collection(Collections.USER_PREFERENCES).insert_many([
        _make_user_prefs("user-a"),
        _make_user_prefs("user-b"),
        _make_user_prefs("user-c"),
    ])

    await db.get_collection(Collections.CAREER_READINESS_CONVERSATIONS).insert_many([
        _make_conversation("user-a", "m1", quiz_passed=True, conv_id="conv-a-m1"),
        _make_conversation("user-a", "m2", quiz_passed=True, conv_id="conv-a-m2"),
        _make_conversation("user-b", "m1", quiz_passed=False, conv_id="conv-b-m1"),
    ])

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

    return AnalyticsRepository(db)


# ---------------------------------------------------------------------------
# Career readiness stats tests
# ---------------------------------------------------------------------------

class TestGetCareerReadinessStats:
    @pytest.mark.asyncio
    async def test_total_registered_students(
        self, populated_repository: Awaitable[AnalyticsRepository]
    ):
        repo = await populated_repository
        result: CareerReadinessStatsResponse = await repo.get_career_readiness_stats(
            _MODULE_IDS, _MODULE_TITLES
        )
        assert result.total_registered_students == 3

    @pytest.mark.asyncio
    async def test_started_excludes_users_with_no_conversations(
        self, populated_repository: Awaitable[AnalyticsRepository]
    ):
        repo = await populated_repository
        result = await repo.get_career_readiness_stats(_MODULE_IDS, _MODULE_TITLES)
        # user-a and user-b have conversations; user-c does not
        assert result.started.count == 2
        assert result.started.percentage == 66.7

    @pytest.mark.asyncio
    async def test_completed_all_modules(
        self, populated_repository: Awaitable[AnalyticsRepository]
    ):
        repo = await populated_repository
        result = await repo.get_career_readiness_stats(_MODULE_IDS, _MODULE_TITLES)
        # Only user-a passed both m1 and m2
        assert result.completed_all_modules.count == 1
        assert result.completed_all_modules.percentage_of_started == 50.0

    @pytest.mark.asyncio
    async def test_avg_modules_completed(
        self, populated_repository: Awaitable[AnalyticsRepository]
    ):
        repo = await populated_repository
        result = await repo.get_career_readiness_stats(_MODULE_IDS, _MODULE_TITLES)
        # user-a: 2 completed, user-b: 0 → avg = 1.0
        assert result.avg_modules_completed == 1.0

    @pytest.mark.asyncio
    async def test_module_breakdown(
        self, populated_repository: Awaitable[AnalyticsRepository]
    ):
        repo = await populated_repository
        result = await repo.get_career_readiness_stats(_MODULE_IDS, _MODULE_TITLES)

        m1 = next(m for m in result.module_breakdown if m.module_id == "m1")
        m2 = next(m for m in result.module_breakdown if m.module_id == "m2")

        assert m1.module_title == "Module One"
        assert m1.started_count == 2   # user-a and user-b
        assert m1.completed_count == 1  # user-a only

        assert m2.module_title == "Module Two"
        assert m2.started_count == 1   # user-a only
        assert m2.completed_count == 1  # user-a passed

    @pytest.mark.asyncio
    async def test_no_data_returns_zeroes(
        self, in_memory_application_database: Awaitable[AsyncIOMotorDatabase]
    ):
        db = await in_memory_application_database
        repo = AnalyticsRepository(db)
        result = await repo.get_career_readiness_stats(_MODULE_IDS, _MODULE_TITLES)

        assert result.total_registered_students == 0
        assert result.started.count == 0
        assert result.started.percentage == 0.0
        assert result.completed_all_modules.count == 0
        assert result.avg_modules_completed == 0.0


# ---------------------------------------------------------------------------
# Skill gap stats tests
# ---------------------------------------------------------------------------

class TestGetSkillGapStats:
    @pytest.mark.asyncio
    async def test_total_students_with_skill_gaps(
        self, populated_repository: Awaitable[AnalyticsRepository]
    ):
        repo = await populated_repository
        result: SkillGapStatsResponse = await repo.get_skill_gap_stats(limit=10)
        # user-a and user-b have non-empty lists; user-c's is empty
        assert result.total_students_with_skill_gaps == 2

    @pytest.mark.asyncio
    async def test_top_skill_gaps_sorted_by_student_count(
        self, populated_repository: Awaitable[AnalyticsRepository]
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
        self, populated_repository: Awaitable[AnalyticsRepository]
    ):
        repo = await populated_repository
        result = await repo.get_skill_gap_stats(limit=10)
        sk1 = result.top_skill_gaps[0]
        # job_unlock_count: (4 + 6) / 2 = 5.0; proximity: (0.8 + 0.9) / 2 = 0.85
        assert sk1.avg_job_unlock_count == 5.0
        assert sk1.avg_proximity_score == 0.85

    @pytest.mark.asyncio
    async def test_limit_is_respected(
        self, populated_repository: Awaitable[AnalyticsRepository]
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
        repo = AnalyticsRepository(db)
        result = await repo.get_skill_gap_stats(limit=10)

        assert result.total_students_with_skill_gaps == 0
        assert result.top_skill_gaps == []
