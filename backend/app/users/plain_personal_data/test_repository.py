"""
Tests for the PlainPersonalDataRepository class.
"""
from typing import Awaitable

import pytest

from app.users.plain_personal_data.repository import PlainPersonalDataRepository
from common_libs.test_utilities.random_data import get_random_printable_string


@pytest.fixture(scope="function")
async def get_plain_personal_data_repository(in_memory_userdata_database) -> PlainPersonalDataRepository:
    userdata_db = await in_memory_userdata_database
    return PlainPersonalDataRepository(userdata_db)


class TestFindByUserId:
    @pytest.mark.asyncio
    async def test_returns_none_when_not_found(self, get_plain_personal_data_repository: Awaitable[PlainPersonalDataRepository]):
        repository = await get_plain_personal_data_repository

        # GIVEN a user_id that has no document in the collection
        given_user_id = get_random_printable_string(10)

        # WHEN find_by_user_id is called
        result = await repository.find_by_user_id(given_user_id)

        # THEN None is returned
        assert result is None

    @pytest.mark.asyncio
    async def test_returns_data_when_found(self, get_plain_personal_data_repository: Awaitable[PlainPersonalDataRepository]):
        repository = await get_plain_personal_data_repository

        # GIVEN a document that exists in the collection
        given_user_id = get_random_printable_string(10)
        given_data = {"age": "25", "gender": "Male"}
        await repository.upsert(given_user_id, given_data)

        # WHEN find_by_user_id is called
        result = await repository.find_by_user_id(given_user_id)

        # THEN the document is returned
        assert result is not None
        assert result.user_id == given_user_id
        assert result.data == given_data


class TestUpsert:
    @pytest.mark.asyncio
    async def test_creates_new_document_when_none_exists(self, get_plain_personal_data_repository: Awaitable[PlainPersonalDataRepository]):
        repository = await get_plain_personal_data_repository

        # GIVEN no existing document for a user
        given_user_id = get_random_printable_string(10)
        given_data = {"age": "30"}

        # WHEN upsert is called
        await repository.upsert(given_user_id, given_data)

        # THEN a document is created
        result = await repository.find_by_user_id(given_user_id)
        assert result is not None
        assert result.user_id == given_user_id
        assert result.data["age"] == "30"
        assert result.created_at is not None
        assert result.updated_at is not None

    @pytest.mark.asyncio
    async def test_updates_existing_document(self, get_plain_personal_data_repository: Awaitable[PlainPersonalDataRepository]):
        repository = await get_plain_personal_data_repository

        # GIVEN an existing document
        given_user_id = get_random_printable_string(10)
        await repository.upsert(given_user_id, {"age": "25"})

        # WHEN upsert is called with updated data
        await repository.upsert(given_user_id, {"age": "26"})

        # THEN the value is updated
        result = await repository.find_by_user_id(given_user_id)
        assert result is not None
        assert result.data["age"] == "26"

    @pytest.mark.asyncio
    async def test_merges_new_keys_on_upsert(self, get_plain_personal_data_repository: Awaitable[PlainPersonalDataRepository]):
        repository = await get_plain_personal_data_repository

        # GIVEN an existing document with key "age"
        given_user_id = get_random_printable_string(10)
        await repository.upsert(given_user_id, {"age": "25"})

        # WHEN upsert is called with a new key "gender"
        await repository.upsert(given_user_id, {"gender": "Male"})

        # THEN both keys are present
        result = await repository.find_by_user_id(given_user_id)
        assert result is not None
        assert result.data["age"] == "25"
        assert result.data["gender"] == "Male"

    @pytest.mark.asyncio
    async def test_preserves_created_at_on_second_upsert(self, get_plain_personal_data_repository: Awaitable[PlainPersonalDataRepository]):
        repository = await get_plain_personal_data_repository

        # GIVEN an existing document
        given_user_id = get_random_printable_string(10)
        await repository.upsert(given_user_id, {"age": "25"})
        first_result = await repository.find_by_user_id(given_user_id)
        assert first_result is not None
        original_created_at = first_result.created_at

        # WHEN upsert is called again
        await repository.upsert(given_user_id, {"age": "26"})

        # THEN created_at is unchanged
        second_result = await repository.find_by_user_id(given_user_id)
        assert second_result is not None
        assert second_result.created_at == original_created_at
