import logging
from datetime import datetime, timedelta, timezone

from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.server_dependencies.database_collections import Collections
from app.server_dependencies.db_dependencies import CompassDBProvider
from common_libs.time_utilities import datetime_to_mongo_date

logger = logging.getLogger(__name__)


class DashboardStatsRepository:
    def __init__(
        self,
        application_db: AsyncIOMotorDatabase,
        userdata_db: AsyncIOMotorDatabase,
        metrics_db: AsyncIOMotorDatabase,
    ):
        self._prefs_collection = application_db.get_collection(Collections.USER_PREFERENCES)
        self._plain_data_collection = userdata_db.get_collection(Collections.PLAIN_PERSONAL_DATA)
        self._metrics_collection = metrics_db.get_collection(Collections.COMPASS_METRICS)

    async def count_active_institutions(self) -> int:
        """Count institutions that have at least one registered user (from MongoDB activity)."""
        pipeline = [
            {"$match": {
                "data.school": {"$exists": True, "$ne": None, "$ne": ""},
            }},
            {"$group": {"_id": "$data.school"}},
            {"$count": "total"},
        ]
        result = await self._plain_data_collection.aggregate(pipeline).to_list(length=1)
        return result[0]["total"] if result else 0

    async def count_total_users(self) -> int:
        """Count all registered users."""
        return await self._prefs_collection.count_documents({})

    async def count_active_users_last_7_days(self) -> int:
        """Count distinct users who had any metric event in the last 7 days."""
        now = datetime.now(tz=timezone.utc)
        seven_days_ago = now - timedelta(days=7)
        start_mongo = datetime_to_mongo_date(seven_days_ago)

        pipeline = [
            {"$match": {
                "timestamp": {"$gte": start_mongo},
                "anonymized_user_id": {"$exists": True, "$ne": None},
            }},
            {"$group": {"_id": "$anonymized_user_id"}},
            {"$count": "total"},
        ]
        result = await self._metrics_collection.aggregate(pipeline).to_list(length=1)
        return result[0]["total"] if result else 0


async def get_dashboard_stats_repository(
    application_db: AsyncIOMotorDatabase = Depends(CompassDBProvider.get_application_db),
    userdata_db: AsyncIOMotorDatabase = Depends(CompassDBProvider.get_userdata_db),
    metrics_db: AsyncIOMotorDatabase = Depends(CompassDBProvider.get_metrics_db),
) -> DashboardStatsRepository:
    return DashboardStatsRepository(application_db, userdata_db, metrics_db)
