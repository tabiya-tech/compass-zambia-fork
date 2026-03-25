import asyncio
import logging
from http import HTTPStatus

from fastapi import APIRouter, Depends

from app.analytics.stats.repository import DashboardStatsRepository, get_dashboard_stats_repository
from app.analytics.types import DashboardStats
from app.constants.errors import HTTPErrorResponse
from app.users.auth import Authentication
from app.users.access_role import AccessRole, get_access_role_dependency, decode_institution_id

logger = logging.getLogger(__name__)


def add_stats_routes(router: APIRouter, auth: Authentication):
    @router.get(
        "/stats",
        response_model=DashboardStats,
        responses={HTTPStatus.BAD_REQUEST: {"model": HTTPErrorResponse}, HTTPStatus.UNAUTHORIZED: {"model": HTTPErrorResponse}},
        description="Get aggregated dashboard statistics: active institutions, total students, and students active in the last 7 days. Requires authentication.",
    )
    async def get_dashboard_stats(
        access_role: AccessRole = Depends(get_access_role_dependency(auth)),
        repository: DashboardStatsRepository = Depends(get_dashboard_stats_repository),
    ):
        institution_name: str | None = None
        if access_role.is_institution_staff and access_role.institution_id:
            institution_name = decode_institution_id(access_role.institution_id)

        if institution_name is not None:
            # Institution staff: skip institution count (always 1, their own)
            total_users, active_users_7_days = await asyncio.gather(
                repository.count_total_users(institution_name),
                repository.count_active_users_last_7_days(institution_name),
            )
            return DashboardStats(
                institutions_active=1,
                total_students=total_users,
                active_students_7_days=active_users_7_days,
            )

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
