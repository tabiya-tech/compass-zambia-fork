"""
Skill gap analytics routes.
"""
import logging
from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.analytics.skill_gap.repository import (
    ISkillGapAnalyticsRepository,
    SkillGapAnalyticsRepository,
)
from app.analytics.skill_gap.types import SkillGapStatsResponse
from app.constants.errors import HTTPErrorResponse
from app.server_dependencies.db_dependencies import CompassDBProvider
from app.users.auth import Authentication

logger = logging.getLogger(__name__)


async def _get_skill_gap_analytics_repository(
    application_db: AsyncIOMotorDatabase = Depends(CompassDBProvider.get_application_db),
) -> ISkillGapAnalyticsRepository:
    return SkillGapAnalyticsRepository(application_db)


def add_skill_gap_analytics_routes(router: APIRouter, auth: Authentication) -> None:
    """Register skill gap analytics routes on the given router."""

    @router.get(
        path="/skill-gap-stats",
        response_model=SkillGapStatsResponse,
        responses={
            HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse},
        },
        description=(
            "Aggregate skill gap statistics across all students with pre-computed recommendations. "
            "Returns the most commonly missing skills platform-wide, ranked by how many students share each gap."
        ),
    )
    async def _skill_gap_stats(
        limit: Annotated[int, Query(ge=1, le=100, description="Maximum number of top skill gaps to return.")] = 10,
        _user_info=Depends(auth.get_user_info()),
        repo: ISkillGapAnalyticsRepository = Depends(_get_skill_gap_analytics_repository),
    ) -> SkillGapStatsResponse:
        try:
            return await repo.get_skill_gap_stats(limit)
        except Exception as e:
            logger.exception(e)
            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail="Unexpected error"
            ) from e
