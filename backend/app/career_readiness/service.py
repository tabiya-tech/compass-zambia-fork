"""
Service layer for the career readiness module.

Orchestrates the module registry, repository, and agent to implement
the career readiness business logic.
"""
import logging
import math
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Callable

from bson import ObjectId

from app.agent.agent_types import AgentInput, AgentOutput
from app.career_readiness.agent import CareerReadinessAgent, CareerReadinessAgentOutput
from app.career_readiness.errors import (
    ConversationAccessDeniedError,
    ConversationAlreadyExistsError,
    ConversationModuleMismatchError,
    ConversationNotFoundError,
    CareerReadinessModuleNotFoundError,
    ModuleNotUnlockedError,
    QuizAlreadyPassedError,
    QuizNotAvailableError,
)
from app.career_readiness.module_loader import ModuleConfig, ModuleRegistry, QuizConfig
from app.career_readiness.repository import ICareerReadinessConversationRepository
from app.career_readiness.types import (
    CareerReadinessConversationDocument,
    CareerReadinessConversationResponse,
    CareerReadinessMessage,
    CareerReadinessMessageSender,
    ConversationMode,
    ModuleDetail,
    ModuleListResponse,
    ModuleStatus,
    ModuleSummary,
    QuizQuestionResponse,
    QuizQuestionResult,
    QuizResponse,
    QuizSubmissionResponse,
)
from app.conversation_memory.conversation_memory_types import (
    ConversationContext,
    ConversationHistory,
    ConversationTurn,
)


SILENCE_MESSAGE = "(silence)"
"""Synthetic user message stored alongside the agent intro, matching the core Compass pattern."""


def _filter_silence(messages: list[CareerReadinessMessage]) -> list[CareerReadinessMessage]:
    """Filter out synthetic silence messages before returning to the frontend."""
    return [m for m in messages if m.message != SILENCE_MESSAGE]


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
    async def get_quiz(self, user_id: str, module_id: str,
                       conversation_id: str) -> QuizResponse:
        """Get quiz questions for the active quiz."""
        raise NotImplementedError()

    @abstractmethod
    async def submit_quiz(self, user_id: str, module_id: str,
                          conversation_id: str, answers: dict[int, str]) -> QuizSubmissionResponse:
        """Submit quiz answers for evaluation."""
        raise NotImplementedError()

    @abstractmethod
    async def delete_conversation(self, user_id: str, module_id: str, conversation_id: str) -> None:
        """Delete a conversation."""
        raise NotImplementedError()


def _default_agent_factory(module_config: ModuleConfig, mode: ConversationMode) -> CareerReadinessAgent:
    """Default factory that creates a real CareerReadinessAgent."""
    return CareerReadinessAgent(
        module_title=module_config.title,
        module_content=module_config.content,
        mode=mode,
        topics=module_config.topics,
    )


def _derive_module_statuses(
    all_modules: list[ModuleConfig],
    user_conversations: list[CareerReadinessConversationDocument],
) -> dict[str, ModuleStatus]:
    """
    Derive the status of all modules based on sequential unlock logic.

    Rules:
    - First module is always UNLOCKED (if no conversation exists)
    - Subsequent modules unlock when the previous module is COMPLETED (quiz passed)
    - A module with a conversation is IN_PROGRESS (unless quiz passed → COMPLETED)
    - Only one module can be UNLOCKED at a time (the next eligible one)
    """
    conv_by_module = {c.module_id: c for c in user_conversations}
    sorted_modules = sorted(all_modules, key=lambda m: m.sort_order)

    statuses: dict[str, ModuleStatus] = {}
    previous_completed = True  # First module is always unlocked

    for module in sorted_modules:
        conversation = conv_by_module.get(module.id)

        if conversation is not None:
            if conversation.quiz_passed:
                statuses[module.id] = ModuleStatus.COMPLETED
                previous_completed = True
            else:
                statuses[module.id] = ModuleStatus.IN_PROGRESS
                previous_completed = False
        elif previous_completed:
            statuses[module.id] = ModuleStatus.UNLOCKED
            previous_completed = False
        else:
            statuses[module.id] = ModuleStatus.NOT_STARTED
            previous_completed = False

    return statuses


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


def _evaluate_quiz(quiz: QuizConfig, answers: dict[int, str]) -> tuple[int, int, list[bool]]:
    """
    Evaluate quiz answers deterministically.
    Returns (score, total, list_of_correct_booleans).
    """
    total = len(quiz.questions)
    results = []
    score = 0
    for i, question in enumerate(quiz.questions, 1):
        user_answer = answers.get(i, "")
        correct = user_answer == question.correct_answer
        results.append(correct)
        if correct:
            score += 1
    return score, total, results


class CareerReadinessService(ICareerReadinessService):
    """Implementation of the career readiness service."""

    def __init__(
        self,
        repository: ICareerReadinessConversationRepository,
        module_registry: ModuleRegistry,
        agent_factory: Callable[[ModuleConfig, ConversationMode], CareerReadinessAgent] | None = None,
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
        statuses = _derive_module_statuses(all_modules, user_conversations)

        summaries = []
        for module in all_modules:
            summaries.append(ModuleSummary(
                id=module.id,
                title=module.title,
                description=module.description,
                icon=module.icon,
                status=statuses.get(module.id, ModuleStatus.NOT_STARTED),
                sort_order=module.sort_order,
                input_placeholder=module.input_placeholder,
            ))

        return ModuleListResponse(modules=summaries)

    async def get_module(self, user_id: str, module_id: str) -> ModuleDetail:
        module = self._get_module_or_raise(module_id)
        all_modules = self._module_registry.get_all_modules()
        user_conversations = await self._repository.find_all_by_user(user_id)
        statuses = _derive_module_statuses(all_modules, user_conversations)
        conversation = next((c for c in user_conversations if c.module_id == module_id), None)

        return ModuleDetail(
            id=module.id,
            title=module.title,
            description=module.description,
            icon=module.icon,
            status=statuses.get(module.id, ModuleStatus.NOT_STARTED),
            sort_order=module.sort_order,
            input_placeholder=module.input_placeholder,
            scope=module.content,
            active_conversation_id=conversation.conversation_id if conversation else None,
        )

    async def create_conversation(self, user_id: str, module_id: str) -> CareerReadinessConversationResponse:
        module = self._get_module_or_raise(module_id)

        # Check sequential unlock
        all_modules = self._module_registry.get_all_modules()
        user_conversations = await self._repository.find_all_by_user(user_id)
        statuses = _derive_module_statuses(all_modules, user_conversations)
        module_status = statuses.get(module_id, ModuleStatus.NOT_STARTED)

        if module_status == ModuleStatus.NOT_STARTED:
            raise ModuleNotUnlockedError(module_id)

        # Check for existing conversation
        existing = next((c for c in user_conversations if c.module_id == module_id), None)
        if existing is not None:
            raise ConversationAlreadyExistsError(module_id, user_id)

        # Create agent in instruction mode and generate intro
        agent = self._agent_factory(module, ConversationMode.INSTRUCTION)
        empty_context = ConversationContext(
            all_history=ConversationHistory(),
            history=ConversationHistory(),
        )
        intro_result = await agent.generate_intro_message(empty_context)
        intro_output = intro_result.agent_output

        # Build conversation document with synthetic silence + intro (matches core Compass pattern)
        now = datetime.now(timezone.utc)
        conversation_id = str(ObjectId())
        silence_message = CareerReadinessMessage(
            message_id=str(ObjectId()),
            message=SILENCE_MESSAGE,
            sender=CareerReadinessMessageSender.USER,
            sent_at=now,
        )
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
            messages=[silence_message, intro_message],
            conversation_mode=ConversationMode.INSTRUCTION,
            created_at=now,
            updated_at=now,
        )
        await self._repository.create(document)

        return CareerReadinessConversationResponse(
            conversation_id=conversation_id,
            module_id=module_id,
            messages=_filter_silence([intro_message]),
            covered_topics=[],
            conversation_mode=ConversationMode.INSTRUCTION,
        )

    async def send_message(self, user_id: str, module_id: str,
                           conversation_id: str, user_input: str) -> CareerReadinessConversationResponse:
        module = self._get_module_or_raise(module_id)
        conversation = await self._get_conversation_or_raise(conversation_id)
        self._validate_access(conversation, user_id, module_id)

        if conversation.conversation_mode == ConversationMode.SUPPORT:
            return await self._handle_support_message(module, conversation, user_input)
        return await self._handle_instruction_message(module, conversation, user_input)

    async def _handle_instruction_message(
        self, module: ModuleConfig,
        conversation: CareerReadinessConversationDocument,
        user_input: str,
    ) -> CareerReadinessConversationResponse:
        """Handle a message in instruction mode with topic tracking and quiz trigger."""
        existing_messages = list(conversation.messages)

        # Build and persist user message
        now = datetime.now(timezone.utc)
        user_message = CareerReadinessMessage(
            message_id=str(ObjectId()),
            message=user_input,
            sender=CareerReadinessMessageSender.USER,
            sent_at=now,
        )
        await self._repository.append_message(conversation.conversation_id, user_message)

        # Build context and call agent
        all_messages = existing_messages + [user_message]
        context = _build_conversation_context(all_messages)
        agent = self._agent_factory(module, ConversationMode.INSTRUCTION)
        agent_input = AgentInput(message=user_input, sent_at=now)
        agent_result: CareerReadinessAgentOutput = await agent.execute(agent_input, context)

        # Accumulate covered topics
        new_covered = set(conversation.covered_topics) | set(agent_result.topics_covered)
        covered_topics_list = sorted(new_covered)
        await self._repository.update_covered_topics(conversation.conversation_id, covered_topics_list)

        # Build and persist agent response
        agent_output = agent_result.agent_output
        agent_message = CareerReadinessMessage(
            message_id=agent_output.message_id or str(ObjectId()),
            message=agent_output.message_for_user,
            sender=CareerReadinessMessageSender.AGENT,
            sent_at=agent_output.sent_at,
        )
        await self._repository.append_message(conversation.conversation_id, agent_message)
        response_messages = all_messages + [agent_message]

        # Check if all topics are covered AND agent says finished → deliver quiz
        quiz_available = conversation.quiz_delivered and not conversation.quiz_passed
        all_topics_covered = set(module.topics).issubset(new_covered) if module.topics else True
        if (all_topics_covered and agent_output.finished
                and module.quiz is not None and not conversation.quiz_delivered):
            marker_message = CareerReadinessMessage(
                message_id=str(ObjectId()),
                message="Great work! You've covered the key topics. "
                        "It's time for a short quiz to check your understanding.",
                sender=CareerReadinessMessageSender.AGENT,
                sent_at=datetime.now(timezone.utc),
            )
            await self._repository.append_message(conversation.conversation_id, marker_message)
            await self._repository.update_quiz_delivered(conversation.conversation_id, True)
            response_messages.append(marker_message)
            quiz_available = True

        return CareerReadinessConversationResponse(
            conversation_id=conversation.conversation_id,
            module_id=conversation.module_id,
            messages=_filter_silence(response_messages),
            covered_topics=covered_topics_list,
            conversation_mode=ConversationMode.INSTRUCTION,
            quiz_available=quiz_available,
        )

    async def _handle_support_message(
        self, module: ModuleConfig,
        conversation: CareerReadinessConversationDocument,
        user_input: str,
    ) -> CareerReadinessConversationResponse:
        """Handle a message in support mode (post-quiz follow-up Q&A)."""
        existing_messages = list(conversation.messages)

        now = datetime.now(timezone.utc)
        user_message = CareerReadinessMessage(
            message_id=str(ObjectId()),
            message=user_input,
            sender=CareerReadinessMessageSender.USER,
            sent_at=now,
        )
        await self._repository.append_message(conversation.conversation_id, user_message)

        all_messages = existing_messages + [user_message]
        context = _build_conversation_context(all_messages)
        agent = self._agent_factory(module, ConversationMode.SUPPORT)
        agent_input = AgentInput(message=user_input, sent_at=now)
        agent_result: CareerReadinessAgentOutput = await agent.execute(agent_input, context)
        agent_output = agent_result.agent_output

        agent_message = CareerReadinessMessage(
            message_id=agent_output.message_id or str(ObjectId()),
            message=agent_output.message_for_user,
            sender=CareerReadinessMessageSender.AGENT,
            sent_at=agent_output.sent_at,
        )
        await self._repository.append_message(conversation.conversation_id, agent_message)

        return CareerReadinessConversationResponse(
            conversation_id=conversation.conversation_id,
            module_id=conversation.module_id,
            messages=_filter_silence(all_messages + [agent_message]),
            covered_topics=conversation.covered_topics,
            quiz_passed=True,
            conversation_mode=ConversationMode.SUPPORT,
        )

    async def get_conversation_history(self, user_id: str, module_id: str,
                                       conversation_id: str) -> CareerReadinessConversationResponse:
        self._get_module_or_raise(module_id)
        conversation = await self._get_conversation_or_raise(conversation_id)
        self._validate_access(conversation, user_id, module_id)

        return CareerReadinessConversationResponse(
            conversation_id=conversation.conversation_id,
            module_id=conversation.module_id,
            messages=_filter_silence(list(conversation.messages)),
            covered_topics=conversation.covered_topics,
            conversation_mode=conversation.conversation_mode,
            quiz_passed=conversation.quiz_passed if conversation.quiz_delivered else None,
            quiz_available=conversation.quiz_delivered and not conversation.quiz_passed,
        )

    async def get_quiz(self, user_id: str, module_id: str,
                       conversation_id: str) -> QuizResponse:
        module = self._get_module_or_raise(module_id)
        conversation = await self._get_conversation_or_raise(conversation_id)
        self._validate_access(conversation, user_id, module_id)

        if conversation.quiz_passed:
            raise QuizAlreadyPassedError(conversation_id)
        if not conversation.quiz_delivered or module.quiz is None:
            raise QuizNotAvailableError(conversation_id)

        return QuizResponse(questions=[
            QuizQuestionResponse(question=q.question, options=q.options)
            for q in module.quiz.questions
        ])

    async def submit_quiz(self, user_id: str, module_id: str,
                          conversation_id: str, answers: dict[int, str]) -> QuizSubmissionResponse:
        module = self._get_module_or_raise(module_id)
        conversation = await self._get_conversation_or_raise(conversation_id)
        self._validate_access(conversation, user_id, module_id)

        if not conversation.quiz_delivered or module.quiz is None:
            raise QuizNotAvailableError(conversation_id)
        if conversation.quiz_passed:
            raise QuizAlreadyPassedError(conversation_id)

        # Persist user answer message for audit trail
        now = datetime.now(timezone.utc)
        answer_text = "Quiz answers: " + ", ".join(f"{k}.{v}" for k, v in sorted(answers.items()))
        user_message = CareerReadinessMessage(
            message_id=str(ObjectId()),
            message=answer_text,
            sender=CareerReadinessMessageSender.USER,
            sent_at=now,
        )
        await self._repository.append_message(conversation.conversation_id, user_message)

        score, total, results = _evaluate_quiz(module.quiz, answers)
        passed = (score / total) >= module.quiz.pass_threshold if total > 0 else False

        question_results = [
            QuizQuestionResult(question_index=i + 1, is_correct=correct)
            for i, correct in enumerate(results)
        ]

        if passed:
            feedback = (f"You scored {score}/{total}. Congratulations, you passed! "
                        "You can now continue to ask me any follow-up questions about this topic.")
            await self._repository.update_quiz_passed(conversation.conversation_id, True)
            await self._repository.update_conversation_mode(
                conversation.conversation_id, ConversationMode.SUPPORT)
            result_mode = ConversationMode.SUPPORT
        else:
            threshold_count = math.ceil(module.quiz.pass_threshold * total)
            feedback = (f"You scored {score}/{total}. You need at least {threshold_count} "
                        "correct answers to pass. Let's review the topics and try again.")
            await self._repository.update_quiz_delivered(conversation.conversation_id, False)
            result_mode = ConversationMode.INSTRUCTION

        feedback_message = CareerReadinessMessage(
            message_id=str(ObjectId()),
            message=feedback,
            sender=CareerReadinessMessageSender.AGENT,
            sent_at=datetime.now(timezone.utc),
        )
        await self._repository.append_message(conversation.conversation_id, feedback_message)

        return QuizSubmissionResponse(
            score=score,
            total=total,
            passed=passed,
            question_results=question_results,
            module_completed=passed,
            conversation_mode=result_mode,
        )

    async def delete_conversation(self, user_id: str, module_id: str, conversation_id: str) -> None:
        self._get_module_or_raise(module_id)
        conversation = await self._get_conversation_or_raise(conversation_id)
        self._validate_access(conversation, user_id, module_id)

        deleted = await self._repository.delete_by_conversation_id(conversation_id)
        if not deleted:
            raise ConversationNotFoundError(conversation_id)
