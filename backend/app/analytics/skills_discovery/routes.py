"""
Skills discovery analytics routes.
"""
import logging
from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.analytics.skills_discovery.repository import (
    ISkillsDiscoveryAnalyticsRepository,
    SkillsDiscoveryAnalyticsRepository,
)
from app.analytics.skills_discovery.types import SkillsDiscoveryStatsResponse
from app.constants.errors import HTTPErrorResponse
from app.server_dependencies.db_dependencies import CompassDBProvider
from app.users.auth import Authentication

logger = logging.getLogger(__name__)


async def _get_skills_discovery_analytics_repository(
    application_db: AsyncIOMotorDatabase = Depends(CompassDBProvider.get_application_db),
    userdata_db: AsyncIOMotorDatabase = Depends(CompassDBProvider.get_userdata_db),
) -> ISkillsDiscoveryAnalyticsRepository:
    return SkillsDiscoveryAnalyticsRepository(application_db, userdata_db)


def add_skills_discovery_analytics_routes(router: APIRouter, auth: Authentication) -> None:
    """Register skills discovery analytics routes on the given router."""

    @router.get(
        path="/skills-discovery-stats",
        response_model=SkillsDiscoveryStatsResponse,
        responses={
            HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse},
        },
        description=(
            "Aggregate skills discovery statistics across all registered students. "
            "Optionally filter by institution (school), location (province), program (qualification), "
            "and year. Returns overall started and completed rates."
        ),
    )
    async def _skills_discovery_stats(
        institution: Optional[str] = Query(default=None, description="Filter by institution name (data.school)"),
        location: Optional[str] = Query(default=None, description="Filter by province/location (data.location)"),
        program: Optional[str] = Query(default=None, description="Filter by program/qualification (data.program)"),
        year: Optional[str] = Query(default=None, description="Filter by academic year (data.year)"),
        _user_info=Depends(auth.get_user_info()),
        repo: ISkillsDiscoveryAnalyticsRepository = Depends(_get_skills_discovery_analytics_repository),
    ) -> SkillsDiscoveryStatsResponse:
        try:
            user_ids = await repo._resolve_user_ids(
                institution=institution,
                location=location,
                program=program,
                year=year,
            )
            return await repo.get_skills_discovery_stats(user_ids=user_ids)
        except Exception as e:
            logger.exception(e)
            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail="Unexpected error"
            ) from e
