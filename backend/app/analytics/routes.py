"""
Analytics routes for the admin dashboard.
"""
import logging
from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.analytics.repository import AnalyticsRepository, IAnalyticsRepository
from app.analytics.types import CareerReadinessStatsResponse, SkillGapStatsResponse
from app.career_readiness.module_loader import get_module_registry
from app.constants.errors import HTTPErrorResponse
from app.server_dependencies.db_dependencies import CompassDBProvider
from app.users.auth import Authentication, UserInfo

logger = logging.getLogger(__name__)


async def _get_analytics_repository(
    application_db: AsyncIOMotorDatabase = Depends(CompassDBProvider.get_application_db),
) -> IAnalyticsRepository:
    return AnalyticsRepository(application_db)


def add_analytics_routes(app: FastAPI, authentication: Authentication) -> None:
    """Add analytics routes for the admin dashboard."""

    router = APIRouter(prefix="/analytics", tags=["analytics"])

    @router.get(
        path="/career-readiness-stats",
        response_model=CareerReadinessStatsResponse,
        responses={
            HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse},
        },
        description=(
            "Aggregate career readiness statistics across all registered students. "
            "Returns overall completion rates and a per-module breakdown."
        ),
    )
    async def _career_readiness_stats(
        _user_info: UserInfo = Depends(authentication.get_user_info()),
        repo: IAnalyticsRepository = Depends(_get_analytics_repository),
    ) -> CareerReadinessStatsResponse:
        try:
            registry = get_module_registry()
            modules = registry.get_all_modules()
            module_ids = [m.id for m in modules]
            module_titles = {m.id: m.title for m in modules}
            return await repo.get_career_readiness_stats(module_ids, module_titles)
        except Exception as e:
            logger.exception(e)
            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail="Unexpected error"
            ) from e

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
        _user_info: UserInfo = Depends(authentication.get_user_info()),
        repo: IAnalyticsRepository = Depends(_get_analytics_repository),
    ) -> SkillGapStatsResponse:
        try:
            return await repo.get_skill_gap_stats(limit)
        except Exception as e:
            logger.exception(e)
            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail="Unexpected error"
            ) from e

    app.include_router(router)
