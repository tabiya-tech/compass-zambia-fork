"""
Tests for the career readiness service layer.
"""
from datetime import datetime, timezone

import pytest
from bson import ObjectId

from app.agent.agent_types import AgentOutput, AgentType, LLMStats
from app.career_readiness.agent import CareerReadinessAgent
from app.career_readiness.errors import (
    ConversationAccessDeniedError,
    ConversationAlreadyExistsError,
    ConversationModuleMismatchError,
    ConversationNotFoundError,
    CareerReadinessModuleNotFoundError,
)
from app.career_readiness.module_loader import ModuleConfig, ModuleRegistry
from app.career_readiness.repository import ICareerReadinessConversationRepository
from app.career_readiness.service import CareerReadinessService, _build_conversation_context
from app.career_readiness.types import (
    CareerReadinessConversationDocument,
    CareerReadinessMessage,
    CareerReadinessMessageSender,
    ModuleStatus,
)


# ---------------------------------------------------------------------------
# Mock helpers
# ---------------------------------------------------------------------------

def _make_module_config(
    module_id: str = "cv-development",
    title: str = "CV Development",
    sort_order: int = 1,
) -> ModuleConfig:
    return ModuleConfig(
        id=module_id,
        title=title,
        description="A test module.",
        icon="cv",
        sort_order=sort_order,
        input_placeholder="Ask about CVs...",
        content="# CV Content\nWrite your CV.",
    )


def _make_message(
    sender: CareerReadinessMessageSender = CareerReadinessMessageSender.AGENT,
    message: str = "Hello",
) -> CareerReadinessMessage:
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
    now = datetime.now(timezone.utc)
    return CareerReadinessConversationDocument(
        conversation_id=str(ObjectId()),
        module_id=module_id,
        user_id=user_id,
        messages=messages or [_make_message()],
        created_at=now,
        updated_at=now,
    )


class MockRepository(ICareerReadinessConversationRepository):
    """In-memory mock repository for testing."""

    def __init__(self):
        self._conversations: dict[str, CareerReadinessConversationDocument] = {}

    async def create(self, document: CareerReadinessConversationDocument) -> None:
        self._conversations[document.conversation_id] = document

    async def find_by_conversation_id(self, conversation_id: str) -> CareerReadinessConversationDocument | None:
        return self._conversations.get(conversation_id)

    async def find_by_user_and_module(self, user_id: str, module_id: str) -> CareerReadinessConversationDocument | None:
        for conv in self._conversations.values():
            if conv.user_id == user_id and conv.module_id == module_id:
                return conv
        return None

    async def find_all_by_user(self, user_id: str) -> list[CareerReadinessConversationDocument]:
        return [conv for conv in self._conversations.values() if conv.user_id == user_id]

    async def append_message(self, conversation_id: str, message: CareerReadinessMessage) -> None:
        conv = self._conversations.get(conversation_id)
        if conv:
            conv.messages.append(message)
            conv.updated_at = datetime.now(timezone.utc)

    async def delete_by_conversation_id(self, conversation_id: str) -> bool:
        if conversation_id in self._conversations:
            del self._conversations[conversation_id]
            return True
        return False


class MockModuleRegistry(ModuleRegistry):
    """Module registry that uses in-memory modules instead of loading from disk."""

    def __init__(self, modules: list[ModuleConfig] | None = None):
        # Skip parent __init__ to avoid loading from disk
        self._modules: dict[str, ModuleConfig] = {}
        for m in (modules or []):
            self._modules[m.id] = m


def _make_mock_agent_output(message: str = "Agent response", finished: bool = False) -> AgentOutput:
    return AgentOutput(
        message_id=str(ObjectId()),
        message_for_user=message,
        finished=finished,
        agent_type=AgentType.CAREER_READINESS_AGENT,
        agent_response_time_in_sec=0.5,
        llm_stats=[],
        sent_at=datetime.now(timezone.utc),
    )


class MockCareerReadinessAgent:
    """Mock agent that returns canned responses without calling an LLM."""

    def __init__(self, intro_message: str = "Welcome!", response_message: str = "Agent response"):
        self._intro_message = intro_message
        self._response_message = response_message

    async def generate_intro_message(self, context):
        return _make_mock_agent_output(message=self._intro_message)

    async def execute(self, user_input, context):
        return _make_mock_agent_output(message=self._response_message)


def _make_mock_agent_factory(agent: MockCareerReadinessAgent | None = None):
    """Factory that returns a mock agent."""
    mock_agent = agent or MockCareerReadinessAgent()

    def factory(module_config):
        return mock_agent

    return factory


def _make_service(
    modules: list[ModuleConfig] | None = None,
    repository: MockRepository | None = None,
    agent: MockCareerReadinessAgent | None = None,
) -> tuple[CareerReadinessService, MockRepository]:
    """Helper to create a service with mocked dependencies."""
    repo = repository or MockRepository()
    registry = MockModuleRegistry(modules or [_make_module_config()])
    factory = _make_mock_agent_factory(agent)
    service = CareerReadinessService(repository=repo, module_registry=registry, agent_factory=factory)
    return service, repo


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestBuildConversationContext:
    """Tests for the _build_conversation_context helper."""

    def test_builds_context_from_message_pairs(self):
        # GIVEN a list of messages with intro + user/agent pairs
        given_messages = [
            _make_message(sender=CareerReadinessMessageSender.AGENT, message="Welcome!"),
            _make_message(sender=CareerReadinessMessageSender.USER, message="Help me"),
            _make_message(sender=CareerReadinessMessageSender.AGENT, message="Sure!"),
        ]

        # WHEN the context is built
        actual_context = _build_conversation_context(given_messages)

        # THEN there is one conversation turn (user+agent pair)
        assert len(actual_context.history.turns) == 1
        assert actual_context.history.turns[0].input.message == "Help me"
        assert actual_context.history.turns[0].output.message_for_user == "Sure!"

    def test_builds_empty_context_from_intro_only(self):
        # GIVEN only an intro message
        given_messages = [
            _make_message(sender=CareerReadinessMessageSender.AGENT, message="Welcome!"),
        ]

        # WHEN the context is built
        actual_context = _build_conversation_context(given_messages)

        # THEN the context has no turns
        assert len(actual_context.history.turns) == 0

    def test_builds_context_with_multiple_pairs(self):
        # GIVEN a conversation with multiple exchanges
        given_messages = [
            _make_message(sender=CareerReadinessMessageSender.AGENT, message="Welcome!"),
            _make_message(sender=CareerReadinessMessageSender.USER, message="Q1"),
            _make_message(sender=CareerReadinessMessageSender.AGENT, message="A1"),
            _make_message(sender=CareerReadinessMessageSender.USER, message="Q2"),
            _make_message(sender=CareerReadinessMessageSender.AGENT, message="A2"),
        ]

        # WHEN the context is built
        actual_context = _build_conversation_context(given_messages)

        # THEN there are two conversation turns
        assert len(actual_context.history.turns) == 2
        assert actual_context.history.turns[0].input.message == "Q1"
        assert actual_context.history.turns[1].input.message == "Q2"


class TestListModules:
    """Tests for listing modules with user progress."""

    @pytest.mark.asyncio
    async def test_returns_all_modules_with_not_started_status(self):
        # GIVEN a service with two modules and no conversations
        given_modules = [
            _make_module_config(module_id="cv-development", sort_order=1),
            _make_module_config(module_id="interview-prep", title="Interview Prep", sort_order=2),
        ]
        service, _ = _make_service(modules=given_modules)

        # WHEN modules are listed for a user
        actual_result = await service.list_modules("user_abc")

        # THEN all modules are returned with NOT_STARTED status
        assert len(actual_result.modules) == 2
        assert all(m.status == ModuleStatus.NOT_STARTED for m in actual_result.modules)

    @pytest.mark.asyncio
    async def test_returns_in_progress_when_conversation_exists(self):
        # GIVEN a service with a module and an existing conversation
        given_module = _make_module_config(module_id="cv-development")
        service, repo = _make_service(modules=[given_module])
        given_conversation = _make_conversation(user_id="user_abc", module_id="cv-development")
        await repo.create(given_conversation)

        # WHEN modules are listed for the user
        actual_result = await service.list_modules("user_abc")

        # THEN the module with a conversation has IN_PROGRESS status
        assert len(actual_result.modules) == 1
        assert actual_result.modules[0].status == ModuleStatus.IN_PROGRESS


class TestGetModule:
    """Tests for getting module details."""

    @pytest.mark.asyncio
    async def test_returns_module_detail(self):
        # GIVEN a service with a module
        given_module = _make_module_config()
        service, _ = _make_service(modules=[given_module])

        # WHEN the module is retrieved
        actual_result = await service.get_module("user_abc", "cv-development")

        # THEN the module detail is returned
        assert actual_result.id == "cv-development"
        assert actual_result.title == "CV Development"
        assert actual_result.active_conversation_id is None

    @pytest.mark.asyncio
    async def test_returns_active_conversation_id(self):
        # GIVEN a service with an existing conversation
        given_module = _make_module_config()
        service, repo = _make_service(modules=[given_module])
        given_conversation = _make_conversation(user_id="user_abc", module_id="cv-development")
        await repo.create(given_conversation)

        # WHEN the module is retrieved
        actual_result = await service.get_module("user_abc", "cv-development")

        # THEN the active conversation ID is included
        assert actual_result.active_conversation_id == given_conversation.conversation_id
        assert actual_result.status == ModuleStatus.IN_PROGRESS

    @pytest.mark.asyncio
    async def test_raises_module_not_found(self):
        # GIVEN a service with no modules
        service, _ = _make_service(modules=[])

        # WHEN a non-existent module is requested
        # THEN CareerReadinessModuleNotFoundError is raised
        with pytest.raises(CareerReadinessModuleNotFoundError):
            await service.get_module("user_abc", "nonexistent")


class TestCreateConversation:
    """Tests for creating a new conversation."""

    @pytest.mark.asyncio
    async def test_creates_conversation_with_intro_message(self):
        # GIVEN a service with a module and a mock agent
        given_module = _make_module_config()
        given_agent = MockCareerReadinessAgent(intro_message="Welcome to CV Development!")
        service, repo = _make_service(modules=[given_module], agent=given_agent)

        # WHEN a conversation is created
        actual_result = await service.create_conversation("user_abc", "cv-development")

        # THEN a conversation response is returned with the intro message
        assert actual_result.module_id == "cv-development"
        assert len(actual_result.messages) == 1
        assert actual_result.messages[0].message == "Welcome to CV Development!"
        assert actual_result.messages[0].sender == CareerReadinessMessageSender.AGENT

    @pytest.mark.asyncio
    async def test_raises_already_exists_when_duplicate(self):
        # GIVEN a service with an existing conversation
        given_module = _make_module_config()
        service, repo = _make_service(modules=[given_module])
        given_conversation = _make_conversation(user_id="user_abc", module_id="cv-development")
        await repo.create(given_conversation)

        # WHEN a duplicate conversation is attempted
        # THEN ConversationAlreadyExistsError is raised
        with pytest.raises(ConversationAlreadyExistsError):
            await service.create_conversation("user_abc", "cv-development")

    @pytest.mark.asyncio
    async def test_raises_module_not_found(self):
        # GIVEN a service with no modules
        service, _ = _make_service(modules=[])

        # WHEN a conversation is created for a non-existent module
        # THEN CareerReadinessModuleNotFoundError is raised
        with pytest.raises(CareerReadinessModuleNotFoundError):
            await service.create_conversation("user_abc", "nonexistent")


class TestSendMessage:
    """Tests for sending a message in a conversation."""

    @pytest.mark.asyncio
    async def test_sends_message_and_returns_response(self):
        # GIVEN a service with a conversation
        given_module = _make_module_config()
        given_agent = MockCareerReadinessAgent(response_message="Here is CV advice.")
        service, repo = _make_service(modules=[given_module], agent=given_agent)
        given_conversation = _make_conversation(user_id="user_abc", module_id="cv-development")
        await repo.create(given_conversation)

        # WHEN a message is sent
        actual_result = await service.send_message(
            "user_abc", "cv-development", given_conversation.conversation_id, "How do I write a CV?",
        )

        # THEN the response includes the user message and agent response
        assert len(actual_result.messages) == 3  # intro + user + agent
        assert actual_result.messages[1].message == "How do I write a CV?"
        assert actual_result.messages[1].sender == CareerReadinessMessageSender.USER
        assert actual_result.messages[2].message == "Here is CV advice."
        assert actual_result.messages[2].sender == CareerReadinessMessageSender.AGENT

    @pytest.mark.asyncio
    async def test_raises_conversation_not_found(self):
        # GIVEN a service with a module but no conversation
        given_module = _make_module_config()
        service, _ = _make_service(modules=[given_module])

        # WHEN a message is sent to a non-existent conversation
        # THEN ConversationNotFoundError is raised
        with pytest.raises(ConversationNotFoundError):
            await service.send_message("user_abc", "cv-development", "nonexistent", "Hello")

    @pytest.mark.asyncio
    async def test_raises_access_denied_for_wrong_user(self):
        # GIVEN a conversation owned by user_abc
        given_module = _make_module_config()
        service, repo = _make_service(modules=[given_module])
        given_conversation = _make_conversation(user_id="user_abc", module_id="cv-development")
        await repo.create(given_conversation)

        # WHEN a different user tries to send a message
        # THEN ConversationAccessDeniedError is raised
        with pytest.raises(ConversationAccessDeniedError):
            await service.send_message(
                "other_user", "cv-development", given_conversation.conversation_id, "Hello",
            )

    @pytest.mark.asyncio
    async def test_raises_module_mismatch(self):
        # GIVEN a conversation for cv-development
        given_modules = [
            _make_module_config(module_id="cv-development"),
            _make_module_config(module_id="interview-prep", title="Interview Prep", sort_order=2),
        ]
        service, repo = _make_service(modules=given_modules)
        given_conversation = _make_conversation(user_id="user_abc", module_id="cv-development")
        await repo.create(given_conversation)

        # WHEN a message is sent under a different module
        # THEN ConversationModuleMismatchError is raised
        with pytest.raises(ConversationModuleMismatchError):
            await service.send_message(
                "user_abc", "interview-prep", given_conversation.conversation_id, "Hello",
            )


class TestGetConversationHistory:
    """Tests for retrieving conversation history."""

    @pytest.mark.asyncio
    async def test_returns_conversation_history(self):
        # GIVEN a conversation with messages
        given_module = _make_module_config()
        service, repo = _make_service(modules=[given_module])
        given_messages = [
            _make_message(sender=CareerReadinessMessageSender.AGENT, message="Welcome!"),
            _make_message(sender=CareerReadinessMessageSender.USER, message="Hello!"),
        ]
        given_conversation = _make_conversation(user_id="user_abc", module_id="cv-development", messages=given_messages)
        await repo.create(given_conversation)

        # WHEN the history is requested
        actual_result = await service.get_conversation_history(
            "user_abc", "cv-development", given_conversation.conversation_id,
        )

        # THEN all messages are returned
        assert len(actual_result.messages) == 2
        assert actual_result.conversation_id == given_conversation.conversation_id

    @pytest.mark.asyncio
    async def test_raises_conversation_not_found(self):
        # GIVEN a service with no conversations
        given_module = _make_module_config()
        service, _ = _make_service(modules=[given_module])

        # WHEN a non-existent conversation is requested
        # THEN ConversationNotFoundError is raised
        with pytest.raises(ConversationNotFoundError):
            await service.get_conversation_history("user_abc", "cv-development", "nonexistent")

    @pytest.mark.asyncio
    async def test_raises_access_denied_for_wrong_user(self):
        # GIVEN a conversation owned by user_abc
        given_module = _make_module_config()
        service, repo = _make_service(modules=[given_module])
        given_conversation = _make_conversation(user_id="user_abc", module_id="cv-development")
        await repo.create(given_conversation)

        # WHEN a different user requests the history
        # THEN ConversationAccessDeniedError is raised
        with pytest.raises(ConversationAccessDeniedError):
            await service.get_conversation_history(
                "other_user", "cv-development", given_conversation.conversation_id,
            )


class TestDeleteConversation:
    """Tests for deleting a conversation."""

    @pytest.mark.asyncio
    async def test_deletes_conversation(self):
        # GIVEN a conversation
        given_module = _make_module_config()
        service, repo = _make_service(modules=[given_module])
        given_conversation = _make_conversation(user_id="user_abc", module_id="cv-development")
        await repo.create(given_conversation)

        # WHEN the conversation is deleted
        await service.delete_conversation("user_abc", "cv-development", given_conversation.conversation_id)

        # THEN the conversation no longer exists
        actual_result = await repo.find_by_conversation_id(given_conversation.conversation_id)
        assert actual_result is None

    @pytest.mark.asyncio
    async def test_raises_conversation_not_found(self):
        # GIVEN a service with no conversations
        given_module = _make_module_config()
        service, _ = _make_service(modules=[given_module])

        # WHEN a non-existent conversation is deleted
        # THEN ConversationNotFoundError is raised
        with pytest.raises(ConversationNotFoundError):
            await service.delete_conversation("user_abc", "cv-development", "nonexistent")

    @pytest.mark.asyncio
    async def test_raises_access_denied_for_wrong_user(self):
        # GIVEN a conversation owned by user_abc
        given_module = _make_module_config()
        service, repo = _make_service(modules=[given_module])
        given_conversation = _make_conversation(user_id="user_abc", module_id="cv-development")
        await repo.create(given_conversation)

        # WHEN a different user tries to delete
        # THEN ConversationAccessDeniedError is raised
        with pytest.raises(ConversationAccessDeniedError):
            await service.delete_conversation(
                "other_user", "cv-development", given_conversation.conversation_id,
            )
