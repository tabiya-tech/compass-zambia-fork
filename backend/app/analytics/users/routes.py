import logging
from http import HTTPStatus

from fastapi import APIRouter, Depends, Query

from app.analytics.users.repository import UserRepository, get_user_repository
from app.analytics.types import PaginatedListMeta, PaginatedListResponse, User
from app.constants.errors import HTTPErrorResponse
from app.users.auth import Authentication, UserInfo

logger = logging.getLogger(__name__)


def add_users_routes(router: APIRouter, auth: Authentication):
    @router.get(
        "",
        response_model=PaginatedListResponse[User],
        responses={HTTPStatus.BAD_REQUEST: {"model": HTTPErrorResponse}, HTTPStatus.UNAUTHORIZED: {"model": HTTPErrorResponse}},
        description="List students with optional filters, search, and cursor-based pagination. Requires authentication.",
    )
    async def list_users(
        user_info: UserInfo = Depends(auth.get_user_info()),
        active: bool | None = Query(default=None, description="Filter by active status"),
        institution: str | None = Query(default=None, description="Filter by institution name"),
        province: str | None = Query(default=None, description="Filter by province"),
        programme: str | None = Query(default=None, description="Filter by programme"),
        year: str | None = Query(default=None, description="Filter by year of study"),
        search: str | None = Query(default=None, description="Search across institution, programme, and year"),
        cursor: str | None = Query(default=None, description="Pagination cursor from previous response"),
        limit: int = Query(default=20, ge=1, le=100, description="Max items per page"),
        include: str | None = Query(default=None, description="Comma-separated: 'count' to include total"),
        repository: UserRepository = Depends(get_user_repository),
    ):
        include_count = include and "count" in include.split(",")

        items, next_cursor_str, has_more = await repository.list_users(
            active=active,
            institution=institution,
            province=province,
            programme=programme,
            year=year,
            search=search,
            cursor=cursor,
            limit=limit,
        )
        total = await repository.count_users(
            active=active,
            institution=institution,
            province=province,
            programme=programme,
            year=year,
            search=search,
        ) if include_count else None

        meta = PaginatedListMeta(
            limit=limit,
            next_cursor=next_cursor_str,
            has_more=has_more,
            total=total if include_count else None,
        )
        return PaginatedListResponse(data=items, meta=meta)
