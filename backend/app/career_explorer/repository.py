import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

from app.career_explorer.types import (
    CareerExplorerConversationDocument,
    CareerExplorerConversationResponse,
    CareerExplorerMessage,
    CareerExplorerMessageSender,
)
from app.server_dependencies.database_collections import Collections


class ICareerExplorerConversationRepository(ABC):
    @abstractmethod
    async def get_or_create_conversation(self, user_id: str, welcome_message: str) -> CareerExplorerConversationResponse:
        raise NotImplementedError()

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

    @abstractmethod
    async def find_response_by_user(self, user_id: str) -> CareerExplorerConversationResponse | None:
        raise NotImplementedError()


class CareerExplorerConversationRepository(ICareerExplorerConversationRepository):
    def __init__(self, db: AsyncIOMotorDatabase):
        self._collection = db.get_collection(Collections.CAREER_EXPLORER_CONVERSATIONS)
        self._logger = logging.getLogger(self.__class__.__name__)

    @classmethod
    def _from_db_doc(cls, document: CareerExplorerConversationDocument, finished: bool = False) -> CareerExplorerConversationResponse:
        """
        Convert a CareerExplorerConversationDocument to a CareerExplorerConversationResponse.
        Strips metadata from messages as it should not be exposed to the frontend.
        """
        messages_without_metadata = [m.model_copy(update={"metadata": None}) for m in document.messages]
        return CareerExplorerConversationResponse(
            messages=messages_without_metadata,
            finished=finished,
        )

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

    async def find_response_by_user(self, user_id: str) -> CareerExplorerConversationResponse | None:
        document = await self.find_by_user(user_id)
        if document is None:
            return None
        return self._from_db_doc(document, finished=False)

    async def get_or_create_conversation(self, user_id: str, welcome_message: str) -> CareerExplorerConversationResponse:
        existing = await self.find_response_by_user(user_id)
        if existing:
            return existing

        now = datetime.now(timezone.utc)
        intro = CareerExplorerMessage(
            message_id=str(ObjectId()),
            message=welcome_message,
            sent_at=now,
            sender=CareerExplorerMessageSender.AGENT,
        )
        doc = CareerExplorerConversationDocument(
            user_id=user_id,
            messages=[intro],
            created_at=now,
            updated_at=now,
        )
        try:
            await self.create(doc)
        except DuplicateKeyError:
            self._logger.debug("Race condition: conversation already exists for user %s, fetching existing", user_id)
            existing = await self.find_response_by_user(user_id)
            if existing:
                return existing
            raise

        return self._from_db_doc(doc, finished=False)
