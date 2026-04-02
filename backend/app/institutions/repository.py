import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorCollection


class IInstitutionRepository(ABC):
    @abstractmethod
    async def search_institutions(
        self,
        keywords: Optional[str],
        province: Optional[str],
        sector: Optional[str],
        offset: int,
        limit: int,
    ) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def count_institutions(
        self,
        keywords: Optional[str],
        province: Optional[str],
        sector: Optional[str],
    ) -> int:
        pass

    @abstractmethod
    async def get_programmes_by_institution(self, institution_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    async def get_institution_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        pass


class InstitutionRepository(IInstitutionRepository):
    """Handles MongoDB queries for the institutions collection."""

    _PROJECTION = {"_id": 0}

    def __init__(self, collection: AsyncIOMotorCollection):
        self._collection = collection
        self._logger = logging.getLogger(self.__class__.__name__)

    def _build_filter(
        self,
        keywords: Optional[str],
        province: Optional[str],
        sector: Optional[str],
    ) -> Dict[str, Any]:
        query: Dict[str, Any] = {}
        if keywords:
            query["$text"] = {"$search": keywords}
        if province:
            query["location.province"] = {"$regex": province, "$options": "i"}
        if sector:
            query["sectors_covered"] = {"$regex": sector, "$options": "i"}
        return query

    async def search_institutions(
        self,
        keywords: Optional[str],
        province: Optional[str],
        sector: Optional[str],
        offset: int,
        limit: int,
    ) -> List[Dict[str, Any]]:
        query = self._build_filter(keywords, province, sector)
        cursor = self._collection.find(query, projection=self._PROJECTION).skip(offset).limit(limit + 1)
        docs: List[Dict[str, Any]] = []
        async for doc in cursor:
            docs.append(doc)
        return docs

    async def count_institutions(
        self,
        keywords: Optional[str],
        province: Optional[str],
        sector: Optional[str],
    ) -> int:
        query = self._build_filter(keywords, province, sector)
        return await self._collection.count_documents(query)

    async def get_programmes_by_institution(self, institution_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a single institution by reg_no, returning only its name and programmes."""
        doc = await self._collection.find_one(
            {"reg_no": institution_id},
            projection={"_id": 0, "name": 1, "reg_no": 1, "programmes": 1},
        )
        return doc

    async def get_institution_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """Fetch a single institution by exact name, returning only its name and programmes."""
        doc = await self._collection.find_one(
            {"name": name},
            projection={"_id": 0, "name": 1, "reg_no": 1, "programmes": 1},
        )
        return doc
