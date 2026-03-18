import logging
from datetime import date, datetime, time, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from http import HTTPStatus

from app.analytics.adoption_trends.repository import AdoptionTrendsRepository, get_adoption_trends_repository
from app.analytics.types import AdoptionTrendsResponse, AdoptionTrendPoint, AdoptionTrendsMeta
from app.constants.errors import HTTPErrorResponse
from app.users.auth import Authentication, UserInfo

logger = logging.getLogger(__name__)


def add_adoption_trends_routes(router: APIRouter, auth: Authentication):
    @router.get(
        "/adoption-trends",
        response_model=AdoptionTrendsResponse,
        responses={HTTPStatus.BAD_REQUEST: {"model": HTTPErrorResponse}, HTTPStatus.UNAUTHORIZED: {"model": HTTPErrorResponse}},
        description="Get adoption trends: new registrations and daily active users per interval. Requires authentication.",
    )
    async def get_adoption_trends(
        user_info: UserInfo = Depends(auth.get_user_info()),
        start_date: date = Query(..., description="Start of date range (inclusive)"),
        end_date: date = Query(..., description="End of date range (inclusive)"),
        interval: str = Query(default="day", description="Aggregation interval: 'day' or 'week'"),
        institution: str | None = Query(default=None, description="Filter by institution id (when supported)"),
        province: str | None = Query(default=None, description="Filter by province (when supported)"),
        repository: AdoptionTrendsRepository = Depends(get_adoption_trends_repository),
    ):
        if start_date > end_date:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail="start_date must be before or equal to end_date",
            )
        if interval not in ("day", "week"):
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail="interval must be 'day' or 'week'",
            )

        start_dt = datetime.combine(start_date, time.min).replace(tzinfo=timezone.utc)
        end_dt = datetime.combine(end_date, time.max).replace(tzinfo=timezone.utc)
        raw = await repository.get_adoption_trends(
            start_date=start_dt,
            end_date=end_dt,
            interval=interval,
        )
        data = [AdoptionTrendPoint(**r) for r in raw]
        return AdoptionTrendsResponse(
            data=data,
            meta=AdoptionTrendsMeta(
                start_date=start_date.isoformat(),
                end_date=end_date.isoformat(),
                interval=interval,
            ),
        )
