import logging

from fastapi import APIRouter, FastAPI

from app.analytics.institutions.routes import add_institutions_routes
from app.analytics.users.routes import add_users_routes
from app.analytics.adoption_trends.routes import add_adoption_trends_routes
from app.analytics.stats.routes import add_stats_routes
from app.users.auth import Authentication

logger = logging.getLogger(__name__)


def add_analytics_routes(app: FastAPI, auth: Authentication):
    institutions_router = APIRouter(prefix="/institutions", tags=["analytics", "institutions"])
    add_institutions_routes(institutions_router, auth)
    app.include_router(institutions_router)

    users_router = APIRouter(prefix="/students", tags=["analytics", "users"])
    add_users_routes(users_router, auth)
    app.include_router(users_router)

    analytics_router = APIRouter(prefix="/analytics", tags=["analytics"])
    add_adoption_trends_routes(analytics_router, auth)
    add_stats_routes(analytics_router, auth)
    app.include_router(analytics_router)
