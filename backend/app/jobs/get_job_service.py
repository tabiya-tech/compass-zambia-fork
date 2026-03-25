import asyncio

from fastapi import Depends
from app.jobs.repository import JobRepository
from app.jobs.service import IJobService, JobService
from app.server_dependencies.db_dependencies import CompassDBProvider
from common_libs.environment_settings.mongo_db_settings import MongoDbSettings

_job_service_singleton: IJobService | None = None
_job_service_lock = asyncio.Lock()


async def get_job_service(
        zambia_jobs_db=Depends(CompassDBProvider.get_zambia_jobs_db)
) -> IJobService:
    global _job_service_singleton

    if _job_service_singleton is None:
        async with _job_service_lock:
            if _job_service_singleton is None:
                settings = MongoDbSettings()
                collection = zambia_jobs_db.get_collection(settings.zambia_collection_name)
                _job_service_singleton = JobService(repository=JobRepository(collection))

    return _job_service_singleton
