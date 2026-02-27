"""
Plain Personal Data Repository
"""

import logging
from typing import Optional
from abc import ABC, abstractmethod
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.server_dependencies.database_collections import Collections
from app.users.plain_personal_data.types import PlainPersonalData


class IPlainPersonalDataRepository(ABC):
    """
    Interface for the Plain Personal Data Repository.

    Allows mocking the repository in tests.
    """

    @abstractmethod
    async def find_by_user_id(self, user_id: str) -> Optional[PlainPersonalData]:
        """
        Find plain personal data by user_id.

        :param user_id: user_id
        :return: The found PlainPersonalData or None if not found
        """
        raise NotImplementedError()

    @abstractmethod
    async def upsert(self, user_id: str, data: dict) -> None:
        """
        Create or update plain personal data for a user.

        If a document for user_id already exists, the provided data keys are merged/updated.
        If no document exists, a new one is created.

        :param user_id: user_id
        :param data: dict mapping dataKey -> value(s)
        """
        raise NotImplementedError()


class PlainPersonalDataRepository(IPlainPersonalDataRepository):
    def __init__(self, db: AsyncIOMotorDatabase):
        self._db = db
        self._logger = logging.getLogger(PlainPersonalDataRepository.__name__)
        self._collection = db.get_collection(Collections.PLAIN_PERSONAL_DATA)

    async def find_by_user_id(self, user_id: str) -> Optional[PlainPersonalData]:
        # Use $eq to prevent NoSQL injection
        _doc = await self._collection.find_one({"user_id": {"$eq": user_id}})

        if _doc is None:
            return None

        return PlainPersonalData.from_dict(_doc)

    async def upsert(self, user_id: str, data: dict) -> None:
        now = datetime.now(timezone.utc)

        # Build $set payload: update each data key individually so existing keys are preserved
        set_payload: dict = {
            "updated_at": now.isoformat(),
        }
        for key, value in data.items():
            set_payload[f"data.{key}"] = value

        await self._collection.update_one(
            {"user_id": {"$eq": user_id}},
            {
                "$set": set_payload,
                "$setOnInsert": {
                    "user_id": user_id,
                    "created_at": now.isoformat(),
                },
            },
            upsert=True,
        )
