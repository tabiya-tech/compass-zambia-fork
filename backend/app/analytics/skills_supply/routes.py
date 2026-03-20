"""
Skills supply analytics routes.
"""
import logging
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.analytics.skills_supply.repository import (
    ISkillsSupplyAnalyticsRepository,
    SkillsSupplyAnalyticsRepository,
)
from app.analytics.skills_supply.types import SkillsSupplyStatsResponse
from app.constants.errors import HTTPErrorResponse
from app.server_dependencies.db_dependencies import CompassDBProvider
from app.users.auth import Authentication

logger = logging.getLogger(__name__)


async def _get_skills_supply_repository(
    application_db: AsyncIOMotorDatabase = Depends(CompassDBProvider.get_application_db),
) -> ISkillsSupplyAnalyticsRepository:
    return SkillsSupplyAnalyticsRepository(application_db)


def add_skills_supply_analytics_routes(router: APIRouter, auth: Authentication) -> None:
    @router.get(
        path="/skills-supply-stats",
        response_model=SkillsSupplyStatsResponse,
        responses={
            HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse},
        },
        description=(
            "Aggregate the most common skills identified by students during skills discovery. "
            "Returns top skills ranked by how many students have them, with average relevance score."
        ),
    )
    async def _skills_supply_stats(
        limit: int = Query(default=10, ge=1, le=50, description="Number of top skills to return"),
        _user_info=Depends(auth.get_user_info()),
        repo: ISkillsSupplyAnalyticsRepository = Depends(_get_skills_supply_repository),
    ) -> SkillsSupplyStatsResponse:
        try:
            return await repo.get_skills_supply_stats(limit=limit)
        except Exception as e:
            logger.exception(e)
            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail="Unexpected error"
            ) from e
