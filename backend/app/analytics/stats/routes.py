import asyncio
import logging
from http import HTTPStatus

from fastapi import APIRouter, Depends

from app.analytics.stats.repository import DashboardStatsRepository, get_dashboard_stats_repository
from app.analytics.types import DashboardStats
from app.constants.errors import HTTPErrorResponse
from app.users.auth import Authentication, UserInfo

logger = logging.getLogger(__name__)


def add_stats_routes(router: APIRouter, auth: Authentication):
    @router.get(
        "/stats",
        response_model=DashboardStats,
        responses={HTTPStatus.BAD_REQUEST: {"model": HTTPErrorResponse}, HTTPStatus.UNAUTHORIZED: {"model": HTTPErrorResponse}},
        description="Get aggregated dashboard statistics: active institutions, total students, and students active in the last 7 days. Requires authentication.",
    )
    async def get_dashboard_stats(
        user_info: UserInfo = Depends(auth.get_user_info()),
        repository: DashboardStatsRepository = Depends(get_dashboard_stats_repository),
    ):
        institutions_active, total_users, active_users_7_days = await asyncio.gather(
            repository.count_active_institutions(),
            repository.count_total_users(),
            repository.count_active_users_last_7_days(),
        )
        return DashboardStats(
            institutions_active=institutions_active,
            total_students=total_users,
            active_students_7_days=active_users_7_days,
        )
