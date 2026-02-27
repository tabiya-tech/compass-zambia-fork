"""
This module contains the service layer for the plain personal data module.
"""
import logging
from abc import ABC, abstractmethod
from typing import Optional

from app.users.plain_personal_data.repository import IPlainPersonalDataRepository
from app.users.plain_personal_data.types import PlainPersonalData
from app.users.repositories import IUserPreferenceRepository
from app.users.plain_personal_data.errors import UserPreferencesNotFoundError


class IPlainPersonalDataService(ABC):
    """
    Interface for the Plain Personal Data Service.

    Allows mocking the service in tests.
    """

    @abstractmethod
    async def upsert(self, user_id: str, data: dict) -> None:
        """
        Create or update plain personal data for a user.

        :param user_id: user_id
        :param data: dict mapping dataKey -> value(s)
        :raises UserPreferencesNotFoundError: if user preferences are not found
        :raises Exception: if any other error occurs
        """
        raise NotImplementedError()

    @abstractmethod
    async def get(self, user_id: str) -> Optional[PlainPersonalData]:
        """
        Get plain personal data for a user.

        :param user_id: user_id
        :return: PlainPersonalData or None if not found
        :raises Exception: if any error occurs
        """
        raise NotImplementedError()


class PlainPersonalDataService(IPlainPersonalDataService):
    def __init__(
        self,
        repository: IPlainPersonalDataRepository,
        user_preference_repository: IUserPreferenceRepository,
    ):
        self._repository = repository
        self._user_preference_repository = user_preference_repository
        self._logger = logging.getLogger(PlainPersonalDataService.__name__)

    async def upsert(self, user_id: str, data: dict) -> None:
        # Ensure the user has preferences (i.e. the user exists)
        user_preferences = await self._user_preference_repository.get_user_preference_by_user_id(user_id)
        if user_preferences is None:
            raise UserPreferencesNotFoundError(user_id)

        await self._repository.upsert(user_id, data)

    async def get(self, user_id: str) -> Optional[PlainPersonalData]:
        return await self._repository.find_by_user_id(user_id)
