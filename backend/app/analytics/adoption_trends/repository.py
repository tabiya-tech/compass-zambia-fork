import logging
from datetime import date, datetime, timedelta, timezone

from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.server_dependencies.database_collections import Collections
from app.server_dependencies.db_dependencies import CompassDBProvider
from app.metrics.constants import EventType
from common_libs.time_utilities import datetime_to_mongo_date

logger = logging.getLogger(__name__)


class AdoptionTrendsRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self._collection = db.get_collection(Collections.COMPASS_METRICS)

    async def get_adoption_trends(
        self,
        *,
        start_date: datetime,
        end_date: datetime,
        interval: str = "day",
    ) -> list[dict]:
        if interval != "day":
            logger.warning("Only 'day' interval is supported; using day")

        start_mongo = datetime_to_mongo_date(start_date)
        end_mongo = datetime_to_mongo_date(end_date)

        date_format = "%Y-%m-%d"
        dates_in_range = []
        current = datetime.strptime(start_date.strftime(date_format), date_format).replace(tzinfo=timezone.utc)
        end_dt = datetime.strptime(end_date.strftime(date_format), date_format).replace(tzinfo=timezone.utc)
        while current <= end_dt:
            dates_in_range.append(current.strftime(date_format))
            current = current + timedelta(days=1)

        reg_match = {
            "timestamp": {"$gte": start_mongo, "$lte": end_mongo},
            "event_type": EventType.USER_ACCOUNT_CREATED.value,
        }
        dau_match = {"timestamp": {"$gte": start_mongo, "$lte": end_mongo}}

        reg_pipeline = [
            {"$match": reg_match},
            {"$addFields": {"date_str": {"$dateToString": {"format": date_format, "date": "$timestamp"}}}},
            {"$group": {"_id": "$date_str", "count": {"$sum": 1}}},
        ]
        dau_pipeline = [
            {"$match": dau_match},
            {"$addFields": {"date_str": {"$dateToString": {"format": date_format, "date": "$timestamp"}}}},
            {"$group": {"_id": "$date_str", "count": {"$addToSet": "$anonymized_user_id"}}},
            {"$project": {"_id": 1, "count": {"$size": "$count"}}},
        ]

        reg_results = await self._collection.aggregate(reg_pipeline).to_list(length=None)
        dau_results = await self._collection.aggregate(dau_pipeline).to_list(length=None)

        reg_by_date = {r["_id"]: r["count"] for r in reg_results}
        dau_by_date = {r["_id"]: r["count"] for r in dau_results}

        result = []
        for d in dates_in_range:
            result.append({
                "date": d,
                "new_registrations": reg_by_date.get(d, 0),
                "daily_active_users": dau_by_date.get(d, 0),
            })
        return result


async def get_adoption_trends_repository(
    db: AsyncIOMotorDatabase = Depends(CompassDBProvider.get_metrics_db),
) -> AdoptionTrendsRepository:
    return AdoptionTrendsRepository(db)
