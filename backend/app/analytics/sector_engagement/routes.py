import logging
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException

from app.analytics.sector_engagement.types import (
    SectorEngagementSummaryItem,
    SectorEngagementSummaryMeta,
    SectorEngagementSummaryResponse,
    UserSectorEngagementItem,
    UserSectorEngagementMeta,
    UserSectorEngagementResponse,
)
from app.constants.errors import HTTPErrorResponse
from app.metrics.services.get_metrics_service import get_metrics_service
from app.metrics.services.service import IMetricsService
from app.users.auth import Authentication, UserInfo
from common_libs.time_utilities import mongo_date_to_datetime

logger = logging.getLogger(__name__)


def add_sector_engagement_routes(router: APIRouter, auth: Authentication):
    @router.get(
        path="/sector-engagement",
        status_code=HTTPStatus.OK,
        response_model=SectorEngagementSummaryResponse,
        responses={HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse}},
        description="Aggregated sector engagement data with total inquiries and unique users per sector.",
    )
    async def _get_sector_engagement_summary(
        _user_info: UserInfo = Depends(auth.get_user_info()),
        metrics_service: IMetricsService = Depends(get_metrics_service),
    ) -> SectorEngagementSummaryResponse:
        try:
            results = await metrics_service.get_aggregated_sector_engagement()
            data = [SectorEngagementSummaryItem(**item) for item in results]
            return SectorEngagementSummaryResponse(
                data=data,
                meta=SectorEngagementSummaryMeta(total_sectors=len(data)),
            )
        except Exception as e:
            logger.exception("Error fetching aggregated sector engagement: %s", e)
            raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, "Unexpected error") from e

    @router.get(
        path="/sector-engagement/me",
        status_code=HTTPStatus.OK,
        response_model=UserSectorEngagementResponse,
        responses={HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse}},
        description="Sector engagement breakdown for the authenticated user.",
    )
    async def _get_my_sector_engagement(
        user_info: UserInfo = Depends(auth.get_user_info()),
        metrics_service: IMetricsService = Depends(get_metrics_service),
    ) -> UserSectorEngagementResponse:
        try:
            results = await metrics_service.get_sector_engagement_for_user(user_info.user_id)
            data = [
                UserSectorEngagementItem(
                    sector_name=item["sector_name"],
                    is_priority=item["is_priority"],
                    inquiry_count=item["inquiry_count"],
                    last_asked_at=mongo_date_to_datetime(item.get("timestamp")),
                )
                for item in results
            ]
            return UserSectorEngagementResponse(
                data=data,
                meta=UserSectorEngagementMeta(total_sectors=len(data)),
            )
        except Exception as e:
            logger.exception("Error fetching sector engagement for user: %s", e)
            raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, "Unexpected error") from e
