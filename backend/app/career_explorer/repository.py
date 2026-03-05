import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.career_explorer.types import CareerExplorerConversationDocument, CareerExplorerMessage
from app.server_dependencies.database_collections import Collections


class ICareerExplorerConversationRepository(ABC):
    @abstractmethod
    async def create(self, document: CareerExplorerConversationDocument) -> None:
        raise NotImplementedError()

    @abstractmethod
    async def find_by_user(self, user_id: str) -> CareerExplorerConversationDocument | None:
        raise NotImplementedError()

    @abstractmethod
    async def append_message(self, user_id: str, message: CareerExplorerMessage) -> None:
        raise NotImplementedError()

    @abstractmethod
    async def update_memory_state(
        self,
        user_id: str,
        summary: str,
        num_turns_summarized: int,
    ) -> None:
        raise NotImplementedError()

    @abstractmethod
    async def delete_by_user(self, user_id: str) -> bool:
        raise NotImplementedError()


class CareerExplorerConversationRepository(ICareerExplorerConversationRepository):
    def __init__(self, db: AsyncIOMotorDatabase):
        self._collection = db.get_collection(Collections.CAREER_EXPLORER_CONVERSATIONS)
        self._logger = logging.getLogger(self.__class__.__name__)

    async def create(self, document: CareerExplorerConversationDocument) -> None:
        await self._collection.insert_one(document.model_dump())

    async def find_by_user(self, user_id: str) -> CareerExplorerConversationDocument | None:
        result = await self._collection.find_one({"user_id": user_id})
        if result is None:
            return None
        return CareerExplorerConversationDocument.from_dict(result)

    async def append_message(self, user_id: str, message: CareerExplorerMessage) -> None:
        now = datetime.now(timezone.utc)
        await self._collection.update_one(
            {"user_id": user_id},
            {"$push": {"messages": message.model_dump()}, "$set": {"updated_at": now}},
        )

    async def update_memory_state(
        self,
        user_id: str,
        summary: str,
        num_turns_summarized: int,
    ) -> None:
        now = datetime.now(timezone.utc)
        await self._collection.update_one(
            {"user_id": user_id},
            {"$set": {
                "summary": summary,
                "num_turns_summarized": num_turns_summarized,
                "updated_at": now,
            }},
        )

    async def delete_by_user(self, user_id: str) -> bool:
        result = await self._collection.delete_one({"user_id": user_id})
        return result.deleted_count > 0
