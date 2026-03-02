"""
Tests for the career readiness conversation repository.
"""
from datetime import datetime, timezone
from typing import Awaitable

import pytest
from bson import ObjectId

from app.career_readiness.repository import CareerReadinessConversationRepository
from app.career_readiness.types import (
    CareerReadinessConversationDocument,
    CareerReadinessMessage,
    CareerReadinessMessageSender,
)


def _make_message(sender: CareerReadinessMessageSender = CareerReadinessMessageSender.AGENT,
                  message: str = "Hello") -> CareerReadinessMessage:
    """Helper to create a test message."""
    return CareerReadinessMessage(
        message_id=str(ObjectId()),
        message=message,
        sender=sender,
        sent_at=datetime.now(timezone.utc),
    )


def _make_conversation(
        user_id: str = "test_user",
        module_id: str = "cv-development",
        messages: list[CareerReadinessMessage] | None = None,
) -> CareerReadinessConversationDocument:
    """Helper to create a test conversation document."""
    now = datetime.now(timezone.utc)
    return CareerReadinessConversationDocument(
        conversation_id=str(ObjectId()),
        module_id=module_id,
        user_id=user_id,
        messages=messages or [_make_message()],
        created_at=now,
        updated_at=now,
    )


@pytest.fixture(scope="function")
async def get_repository(in_memory_application_database) -> CareerReadinessConversationRepository:
    application_db = await in_memory_application_database
    return CareerReadinessConversationRepository(application_db)


class TestCreate:
    """Tests for creating conversation documents."""

    @pytest.mark.asyncio
    async def test_creates_and_finds_document(self, get_repository: Awaitable[CareerReadinessConversationRepository]):
        # GIVEN a repository and a conversation document
        repo = await get_repository
        given_conversation = _make_conversation()

        # WHEN the document is created
        await repo.create(given_conversation)

        # THEN the document can be found by conversation_id
        actual_result = await repo.find_by_conversation_id(given_conversation.conversation_id)
        assert actual_result is not None
        assert actual_result.conversation_id == given_conversation.conversation_id
        assert actual_result.module_id == given_conversation.module_id
        assert actual_result.user_id == given_conversation.user_id
        assert len(actual_result.messages) == 1


class TestFindByConversationId:
    """Tests for finding a conversation by its ID."""

    @pytest.mark.asyncio
    async def test_returns_none_when_not_found(self, get_repository: Awaitable[CareerReadinessConversationRepository]):
        # GIVEN a repository with no documents
        repo = await get_repository

        # WHEN a nonexistent conversation is requested
        actual_result = await repo.find_by_conversation_id("nonexistent")

        # THEN None is returned
        assert actual_result is None

    @pytest.mark.asyncio
    async def test_returns_document_when_found(self, get_repository: Awaitable[CareerReadinessConversationRepository]):
        # GIVEN a repository with a conversation
        repo = await get_repository
        given_conversation = _make_conversation()
        await repo.create(given_conversation)

        # WHEN the conversation is requested by ID
        actual_result = await repo.find_by_conversation_id(given_conversation.conversation_id)

        # THEN the correct document is returned
        assert actual_result is not None
        assert actual_result.conversation_id == given_conversation.conversation_id


class TestFindByUserAndModule:
    """Tests for finding a conversation by user and module."""

    @pytest.mark.asyncio
    async def test_returns_none_when_not_found(self, get_repository: Awaitable[CareerReadinessConversationRepository]):
        # GIVEN a repository with no documents
        repo = await get_repository

        # WHEN a conversation is requested for a user and module
        actual_result = await repo.find_by_user_and_module("some_user", "some_module")

        # THEN None is returned
        assert actual_result is None

    @pytest.mark.asyncio
    async def test_returns_correct_document(self, get_repository: Awaitable[CareerReadinessConversationRepository]):
        # GIVEN a repository with a conversation for a specific user and module
        repo = await get_repository
        given_user_id = "user_abc"
        given_module_id = "cv-development"
        given_conversation = _make_conversation(user_id=given_user_id, module_id=given_module_id)
        await repo.create(given_conversation)

        # WHEN the conversation is requested by user and module
        actual_result = await repo.find_by_user_and_module(given_user_id, given_module_id)

        # THEN the correct document is returned
        assert actual_result is not None
        assert actual_result.user_id == given_user_id
        assert actual_result.module_id == given_module_id


class TestFindAllByUser:
    """Tests for finding all conversations for a user."""

    @pytest.mark.asyncio
    async def test_returns_empty_list_when_no_conversations(self,
                                                            get_repository: Awaitable[CareerReadinessConversationRepository]):
        # GIVEN a repository with no documents
        repo = await get_repository

        # WHEN all conversations for a user are requested
        actual_result = await repo.find_all_by_user("some_user")

        # THEN an empty list is returned
        assert actual_result == []

    @pytest.mark.asyncio
    async def test_returns_all_conversations_for_user(self,
                                                      get_repository: Awaitable[CareerReadinessConversationRepository]):
        # GIVEN a repository with multiple conversations for the same user
        repo = await get_repository
        given_user_id = "user_abc"
        given_conv_1 = _make_conversation(user_id=given_user_id, module_id="cv-development")
        given_conv_2 = _make_conversation(user_id=given_user_id, module_id="interview-preparation")
        # AND a conversation for a different user
        given_other_conv = _make_conversation(user_id="other_user", module_id="cv-development")
        await repo.create(given_conv_1)
        await repo.create(given_conv_2)
        await repo.create(given_other_conv)

        # WHEN all conversations for the user are requested
        actual_result = await repo.find_all_by_user(given_user_id)

        # THEN only the user's conversations are returned
        assert len(actual_result) == 2
        actual_ids = {r.conversation_id for r in actual_result}
        assert given_conv_1.conversation_id in actual_ids
        assert given_conv_2.conversation_id in actual_ids


class TestAppendMessage:
    """Tests for appending a message to a conversation."""

    @pytest.mark.asyncio
    async def test_appends_message_to_conversation(self,
                                                   get_repository: Awaitable[CareerReadinessConversationRepository]):
        # GIVEN a repository with a conversation containing one message
        repo = await get_repository
        given_conversation = _make_conversation()
        await repo.create(given_conversation)

        # WHEN a new message is appended
        given_new_message = _make_message(
            sender=CareerReadinessMessageSender.USER,
            message="How do I write a CV?",
        )
        await repo.append_message(given_conversation.conversation_id, given_new_message)

        # THEN the conversation now has two messages
        actual_result = await repo.find_by_conversation_id(given_conversation.conversation_id)
        assert actual_result is not None
        assert len(actual_result.messages) == 2
        assert actual_result.messages[1].message == "How do I write a CV?"

    @pytest.mark.asyncio
    async def test_updates_updated_at_timestamp(self,
                                                get_repository: Awaitable[CareerReadinessConversationRepository]):
        # GIVEN a repository with a conversation
        repo = await get_repository
        given_conversation = _make_conversation()
        given_original_updated_at = given_conversation.updated_at
        await repo.create(given_conversation)

        # WHEN a message is appended
        given_new_message = _make_message(message="New message")
        await repo.append_message(given_conversation.conversation_id, given_new_message)

        # THEN the updated_at timestamp is changed
        actual_result = await repo.find_by_conversation_id(given_conversation.conversation_id)
        assert actual_result is not None
        assert actual_result.updated_at >= given_original_updated_at


class TestDeleteByConversationId:
    """Tests for deleting a conversation."""

    @pytest.mark.asyncio
    async def test_returns_false_when_not_found(self,
                                                get_repository: Awaitable[CareerReadinessConversationRepository]):
        # GIVEN a repository with no documents
        repo = await get_repository

        # WHEN a nonexistent conversation is deleted
        actual_result = await repo.delete_by_conversation_id("nonexistent")

        # THEN False is returned
        assert actual_result is False

    @pytest.mark.asyncio
    async def test_deletes_and_returns_true(self,
                                            get_repository: Awaitable[CareerReadinessConversationRepository]):
        # GIVEN a repository with a conversation
        repo = await get_repository
        given_conversation = _make_conversation()
        await repo.create(given_conversation)

        # WHEN the conversation is deleted
        actual_result = await repo.delete_by_conversation_id(given_conversation.conversation_id)

        # THEN True is returned
        assert actual_result is True
        # AND the conversation can no longer be found
        assert await repo.find_by_conversation_id(given_conversation.conversation_id) is None
