"""
Tests for the career readiness analytics repository.
"""
from typing import Awaitable

import pytest
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.analytics.career_readiness.repository import CareerReadinessAnalyticsRepository
from app.analytics.career_readiness.types import CareerReadinessStatsResponse
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


# ---------------------------------------------------------------------------
# Shared fixture
# ---------------------------------------------------------------------------

@pytest.fixture(scope="function")
async def populated_repository(
    in_memory_application_database: Awaitable[AsyncIOMotorDatabase],
) -> CareerReadinessAnalyticsRepository:
    """
    Fixture that pre-populates the DB and returns a ready CareerReadinessAnalyticsRepository.

    Data layout:
      - 3 registered students: user-a, user-b, user-c
      - user-a: completed m1 and m2 (quiz_passed=True for both)
      - user-b: started m1 but not passed
      - user-c: no career readiness activity
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

    return CareerReadinessAnalyticsRepository(db, db)


# ---------------------------------------------------------------------------
# Career readiness stats tests
# ---------------------------------------------------------------------------

class TestGetCareerReadinessStats:
    @pytest.mark.asyncio
    async def test_total_registered_students(
        self, populated_repository: Awaitable[CareerReadinessAnalyticsRepository]
    ):
        repo = await populated_repository
        result: CareerReadinessStatsResponse = await repo.get_career_readiness_stats(
            _MODULE_IDS, _MODULE_TITLES
        )
        assert result.total_registered_students == 3

    @pytest.mark.asyncio
    async def test_started_excludes_users_with_no_conversations(
        self, populated_repository: Awaitable[CareerReadinessAnalyticsRepository]
    ):
        repo = await populated_repository
        result = await repo.get_career_readiness_stats(_MODULE_IDS, _MODULE_TITLES)
        # user-a and user-b have conversations; user-c does not
        assert result.started.count == 2
        assert result.started.percentage == 66.7

    @pytest.mark.asyncio
    async def test_completed_all_modules(
        self, populated_repository: Awaitable[CareerReadinessAnalyticsRepository]
    ):
        repo = await populated_repository
        result = await repo.get_career_readiness_stats(_MODULE_IDS, _MODULE_TITLES)
        # Only user-a passed both m1 and m2
        assert result.completed_all_modules.count == 1
        assert result.completed_all_modules.percentage_of_started == 50.0

    @pytest.mark.asyncio
    async def test_avg_modules_completed(
        self, populated_repository: Awaitable[CareerReadinessAnalyticsRepository]
    ):
        repo = await populated_repository
        result = await repo.get_career_readiness_stats(_MODULE_IDS, _MODULE_TITLES)
        # user-a: 2 completed, user-b: 0 → avg = 1.0
        assert result.avg_modules_completed == 1.0

    @pytest.mark.asyncio
    async def test_module_breakdown(
        self, populated_repository: Awaitable[CareerReadinessAnalyticsRepository]
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
        repo = CareerReadinessAnalyticsRepository(db, db)
        result = await repo.get_career_readiness_stats(_MODULE_IDS, _MODULE_TITLES)

        assert result.total_registered_students == 0
        assert result.started.count == 0
        assert result.started.percentage == 0.0
        assert result.completed_all_modules.count == 0
        assert result.avg_modules_completed == 0.0
