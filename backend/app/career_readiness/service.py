"""
Service layer for the career readiness module.

Orchestrates the module registry, repository, and agent to implement
the career readiness business logic.
"""
import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Callable

from bson import ObjectId

from app.agent.agent_types import AgentInput, AgentOutput
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
from app.career_readiness.types import (
    CareerReadinessConversationDocument,
    CareerReadinessConversationResponse,
    CareerReadinessMessage,
    CareerReadinessMessageSender,
    ModuleDetail,
    ModuleListResponse,
    ModuleStatus,
    ModuleSummary,
)
from app.conversation_memory.conversation_memory_types import (
    ConversationContext,
    ConversationHistory,
    ConversationTurn,
)


class ICareerReadinessService(ABC):
    """Interface for the career readiness service."""

    @abstractmethod
    async def list_modules(self, user_id: str) -> ModuleListResponse:
        """List all modules with the user's progress status."""
        raise NotImplementedError()

    @abstractmethod
    async def get_module(self, user_id: str, module_id: str) -> ModuleDetail:
        """Get detailed information about a specific module."""
        raise NotImplementedError()

    @abstractmethod
    async def create_conversation(self, user_id: str, module_id: str) -> CareerReadinessConversationResponse:
        """Start a new conversation for a module."""
        raise NotImplementedError()

    @abstractmethod
    async def send_message(self, user_id: str, module_id: str,
                           conversation_id: str, user_input: str) -> CareerReadinessConversationResponse:
        """Send a user message and get the agent's response."""
        raise NotImplementedError()

    @abstractmethod
    async def get_conversation_history(self, user_id: str, module_id: str,
                                       conversation_id: str) -> CareerReadinessConversationResponse:
        """Retrieve the full message history for a conversation."""
        raise NotImplementedError()

    @abstractmethod
    async def delete_conversation(self, user_id: str, module_id: str, conversation_id: str) -> None:
        """Delete a conversation."""
        raise NotImplementedError()


def _default_agent_factory(module_config: ModuleConfig) -> CareerReadinessAgent:
    """Default factory that creates a real CareerReadinessAgent."""
    return CareerReadinessAgent(
        module_title=module_config.title,
        module_content=module_config.content,
    )


def _derive_status(conversation: CareerReadinessConversationDocument | None) -> ModuleStatus:
    """Derive the module status from the conversation state."""
    if conversation is None:
        return ModuleStatus.NOT_STARTED
    return ModuleStatus.IN_PROGRESS


def _build_conversation_context(messages: list[CareerReadinessMessage]) -> ConversationContext:
    """
    Build a ConversationContext from stored messages.

    Pairs user+agent messages into ConversationTurns for the LLM history.
    """
    turns: list[ConversationTurn] = []
    index = 0

    i = 0
    while i < len(messages):
        msg = messages[i]

        # Skip agent messages that are not paired with a user message (e.g. intro message)
        if msg.sender == CareerReadinessMessageSender.AGENT and (i + 1 >= len(messages) or messages[i + 1].sender != CareerReadinessMessageSender.USER):
            i += 1
            continue

        # Look for user+agent pairs
        if msg.sender == CareerReadinessMessageSender.USER and i + 1 < len(messages) and messages[i + 1].sender == CareerReadinessMessageSender.AGENT:
            user_msg = msg
            agent_msg = messages[i + 1]
            turns.append(ConversationTurn(
                index=index,
                input=AgentInput(
                    message_id=user_msg.message_id,
                    message=user_msg.message,
                    sent_at=user_msg.sent_at,
                ),
                output=AgentOutput(
                    message_id=agent_msg.message_id,
                    message_for_user=agent_msg.message,
                    finished=False,
                    agent_response_time_in_sec=0,
                    llm_stats=[],
                    sent_at=agent_msg.sent_at,
                ),
            ))
            index += 1
            i += 2
        else:
            i += 1

    history = ConversationHistory(turns=turns)
    return ConversationContext(all_history=history, history=history)


class CareerReadinessService(ICareerReadinessService):
    """Implementation of the career readiness service."""

    def __init__(
        self,
        repository: ICareerReadinessConversationRepository,
        module_registry: ModuleRegistry,
        agent_factory: Callable[[ModuleConfig], CareerReadinessAgent] | None = None,
    ):
        self._repository = repository
        self._module_registry = module_registry
        self._agent_factory = agent_factory or _default_agent_factory
        self._logger = logging.getLogger(CareerReadinessService.__name__)

    def _get_module_or_raise(self, module_id: str) -> ModuleConfig:
        """Get a module from the registry or raise CareerReadinessModuleNotFoundError."""
        module = self._module_registry.get_module(module_id)
        if module is None:
            raise CareerReadinessModuleNotFoundError(module_id)
        return module

    async def _get_conversation_or_raise(self, conversation_id: str) -> CareerReadinessConversationDocument:
        """Find a conversation or raise ConversationNotFoundError."""
        conversation = await self._repository.find_by_conversation_id(conversation_id)
        if conversation is None:
            raise ConversationNotFoundError(conversation_id)
        return conversation

    def _validate_access(self, conversation: CareerReadinessConversationDocument,
                         user_id: str, module_id: str) -> None:
        """Validate that the user owns the conversation and it belongs to the correct module."""
        if conversation.user_id != user_id:
            raise ConversationAccessDeniedError(conversation.conversation_id, user_id)
        if conversation.module_id != module_id:
            raise ConversationModuleMismatchError(conversation.conversation_id, module_id)

    async def list_modules(self, user_id: str) -> ModuleListResponse:
        all_modules = self._module_registry.get_all_modules()
        user_conversations = await self._repository.find_all_by_user(user_id)

        # Build a lookup from module_id to conversation
        conv_by_module = {conv.module_id: conv for conv in user_conversations}

        summaries = []
        for module in all_modules:
            conversation = conv_by_module.get(module.id)
            summaries.append(ModuleSummary(
                id=module.id,
                title=module.title,
                description=module.description,
                icon=module.icon,
                status=_derive_status(conversation),
                sort_order=module.sort_order,
                input_placeholder=module.input_placeholder,
            ))

        return ModuleListResponse(modules=summaries)

    async def get_module(self, user_id: str, module_id: str) -> ModuleDetail:
        module = self._get_module_or_raise(module_id)
        conversation = await self._repository.find_by_user_and_module(user_id, module_id)

        return ModuleDetail(
            id=module.id,
            title=module.title,
            description=module.description,
            icon=module.icon,
            status=_derive_status(conversation),
            sort_order=module.sort_order,
            input_placeholder=module.input_placeholder,
            scope=module.content,
            active_conversation_id=conversation.conversation_id if conversation else None,
        )

    async def create_conversation(self, user_id: str, module_id: str) -> CareerReadinessConversationResponse:
        module = self._get_module_or_raise(module_id)

        # Check for existing conversation
        existing = await self._repository.find_by_user_and_module(user_id, module_id)
        if existing is not None:
            raise ConversationAlreadyExistsError(module_id, user_id)

        # Create agent and generate intro message
        agent = self._agent_factory(module)
        empty_context = ConversationContext(
            all_history=ConversationHistory(),
            history=ConversationHistory(),
        )
        intro_output = await agent.generate_intro_message(empty_context)

        # Build conversation document
        now = datetime.now(timezone.utc)
        conversation_id = str(ObjectId())
        intro_message = CareerReadinessMessage(
            message_id=intro_output.message_id or str(ObjectId()),
            message=intro_output.message_for_user,
            sender=CareerReadinessMessageSender.AGENT,
            sent_at=intro_output.sent_at,
        )

        document = CareerReadinessConversationDocument(
            conversation_id=conversation_id,
            module_id=module_id,
            user_id=user_id,
            messages=[intro_message],
            created_at=now,
            updated_at=now,
        )
        await self._repository.create(document)

        return CareerReadinessConversationResponse(
            conversation_id=conversation_id,
            module_id=module_id,
            messages=[intro_message],
        )

    async def send_message(self, user_id: str, module_id: str,
                           conversation_id: str, user_input: str) -> CareerReadinessConversationResponse:
        module = self._get_module_or_raise(module_id)
        conversation = await self._get_conversation_or_raise(conversation_id)
        self._validate_access(conversation, user_id, module_id)

        # Snapshot existing messages before any mutation
        existing_messages = list(conversation.messages)

        # Build user message
        now = datetime.now(timezone.utc)
        user_message = CareerReadinessMessage(
            message_id=str(ObjectId()),
            message=user_input,
            sender=CareerReadinessMessageSender.USER,
            sent_at=now,
        )

        # Persist user message before calling the LLM (crash-safety)
        await self._repository.append_message(conversation_id, user_message)

        # Build context from in-memory state (existing messages + new user message)
        all_messages = existing_messages + [user_message]
        context = _build_conversation_context(all_messages)

        # Get agent response
        agent = self._agent_factory(module)
        agent_input = AgentInput(
            message=user_input,
            sent_at=now,
        )
        agent_output = await agent.execute(agent_input, context)

        # Build and persist agent response
        agent_message = CareerReadinessMessage(
            message_id=agent_output.message_id or str(ObjectId()),
            message=agent_output.message_for_user,
            sender=CareerReadinessMessageSender.AGENT,
            sent_at=agent_output.sent_at,
        )
        await self._repository.append_message(conversation_id, agent_message)

        # Build response from in-memory state (no re-read needed)
        return CareerReadinessConversationResponse(
            conversation_id=conversation_id,
            module_id=module_id,
            messages=all_messages + [agent_message],
            module_completed=agent_output.finished,
        )

    async def get_conversation_history(self, user_id: str, module_id: str,
                                       conversation_id: str) -> CareerReadinessConversationResponse:
        self._get_module_or_raise(module_id)
        conversation = await self._get_conversation_or_raise(conversation_id)
        self._validate_access(conversation, user_id, module_id)

        return CareerReadinessConversationResponse(
            conversation_id=conversation.conversation_id,
            module_id=conversation.module_id,
            messages=conversation.messages,
        )

    async def delete_conversation(self, user_id: str, module_id: str, conversation_id: str) -> None:
        self._get_module_or_raise(module_id)
        conversation = await self._get_conversation_or_raise(conversation_id)
        self._validate_access(conversation, user_id, module_id)

        deleted = await self._repository.delete_by_conversation_id(conversation_id)
        if not deleted:
            raise ConversationNotFoundError(conversation_id)
