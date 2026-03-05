import logging
import time
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorCollection
from pydantic import BaseModel

from app.vector_search.embeddings_model import EmbeddingService
from app.vector_search.similarity_search_service import FilterSpec, SimilaritySearchService


class SectorChunkEntity(BaseModel):
    chunk_id: str
    sector: str
    text: str
    metadata: dict = {}
    score: float = 0.0


class SectorSearchService(SimilaritySearchService[SectorChunkEntity]):
    def __init__(
        self,
        collection: AsyncIOMotorCollection,
        embedding_service: EmbeddingService,
        embedding_key: str = "embedding",
        index_name: str = "sector_chunks_embedding_index",
    ):
        self._collection = collection
        self._embedding_service = embedding_service
        self._embedding_key = embedding_key
        self._index_name = index_name
        self._logger = logging.getLogger(self.__class__.__name__)

    async def search(
        self,
        *,
        query: str | list[float],
        filter_spec: FilterSpec | None = None,
        k: int = 5,
        sector: Optional[str] = None,
    ) -> list[SectorChunkEntity]:
        if isinstance(query, str):
            q = query.strip()
            if not q:
                self._logger.warning("Empty text query; returning no results")
                return []
            embedding = await self._embedding_service.embed(q)
        else:
            embedding = query

        search_start = time.time()
        filter_dict: dict = {}
        if sector:
            filter_dict["sector"] = sector
        if filter_spec:
            filter_dict.update(filter_spec.to_query_filter())

        params = {
            "queryVector": embedding,
            "path": self._embedding_key,
            "numCandidates": k * 10,
            "limit": k,
            "index": self._index_name,
            "filter": filter_dict,
        }

        pipeline = [
            {"$vectorSearch": params},
            {"$set": {"score": {"$meta": "vectorSearchScore"}}},
            {"$sort": {"score": -1}},
            {"$limit": k},
        ]

        results = await self._collection.aggregate(pipeline).to_list(length=k)
        self._logger.debug(
            "Sector search took %.2fs, found %d chunks",
            time.time() - search_start,
            len(results),
        )
        return [self._to_entity(doc) for doc in results]

    def _to_entity(self, doc: dict) -> SectorChunkEntity:
        return SectorChunkEntity(
            chunk_id=doc.get("chunk_id", ""),
            sector=doc.get("sector", ""),
            text=doc.get("text", ""),
            metadata=doc.get("metadata", {}),
            score=doc.get("score", 0.0),
        )
