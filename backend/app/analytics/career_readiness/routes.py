"""
Career readiness analytics routes.
"""
import logging
from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.analytics.career_readiness.repository import (
    CareerReadinessAnalyticsRepository,
    ICareerReadinessAnalyticsRepository,
)
from app.analytics.career_readiness.types import CareerReadinessStatsResponse
from app.career_readiness.module_loader import get_module_registry
from app.constants.errors import HTTPErrorResponse
from app.server_dependencies.db_dependencies import CompassDBProvider
from app.users.auth import Authentication

logger = logging.getLogger(__name__)


async def _get_career_readiness_analytics_repository(
    application_db: AsyncIOMotorDatabase = Depends(CompassDBProvider.get_application_db),
    userdata_db: AsyncIOMotorDatabase = Depends(CompassDBProvider.get_userdata_db),
) -> ICareerReadinessAnalyticsRepository:
    return CareerReadinessAnalyticsRepository(application_db, userdata_db)


def add_career_readiness_analytics_routes(router: APIRouter, auth: Authentication) -> None:
    """Register career readiness analytics routes on the given router."""

    @router.get(
        path="/career-readiness-stats",
        response_model=CareerReadinessStatsResponse,
        responses={
            HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse},
        },
        description=(
            "Aggregate career readiness statistics across all registered students. "
            "Optionally filter by institution (school), location (province), program (qualification), "
            "and year. Returns overall completion rates and a per-module breakdown."
        ),
    )
    async def _career_readiness_stats(
        institution: Optional[str] = Query(default=None, description="Filter by institution name (data.school)"),
        location: Optional[str] = Query(default=None, description="Filter by province/location (data.location)"),
        program: Optional[str] = Query(default=None, description="Filter by program/qualification (data.program)"),
        year: Optional[str] = Query(default=None, description="Filter by academic year (data.year)"),
        _user_info=Depends(auth.get_user_info()),
        repo: ICareerReadinessAnalyticsRepository = Depends(_get_career_readiness_analytics_repository),
    ) -> CareerReadinessStatsResponse:
        try:
            registry = get_module_registry()
            modules = registry.get_all_modules()
            module_ids = [m.id for m in modules]
            module_titles = {m.id: m.title for m in modules}

            user_ids = await repo._resolve_user_ids(
                institution=institution,
                location=location,
                program=program,
                year=year,
            )

            return await repo.get_career_readiness_stats(module_ids, module_titles, user_ids=user_ids)
        except Exception as e:
            logger.exception(e)
            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail="Unexpected error"
            ) from e
