import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, List

from motor.motor_asyncio import AsyncIOMotorCollection

class IJobRepository(ABC):
    """
    Interface for the Job Repository.
    Allows to mock the repository in tests.
    """

    @abstractmethod
    async def list_jobs(
        self,
        filter_query: Dict[str, Any],
        offset: int,
        limit: int,
    ) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def count_jobs(self, filter_query: Dict[str, Any]) -> int:
        pass


class JobRepository(IJobRepository):
    """
    JobRepository class is responsible for managing job records in the database.
    """

    def __init__(self, collection: AsyncIOMotorCollection):
        self._collection = collection
        self._logger = logging.getLogger(self.__class__.__name__)

    async def list_jobs(
        self,
        filter_query: Dict[str, Any],
        offset: int,
        limit: int,
    ) -> List[Dict[str, Any]]:
        query = self._collection.find(filter_query, projection={"_id": 0}).skip(offset).limit(limit + 1)
        docs: List[Dict[str, Any]] = []
        async for doc in query:
            docs.append(doc)
        return docs

    async def count_jobs(self, filter_query: Dict[str, Any]) -> int:
        return await self._collection.count_documents(filter_query)
