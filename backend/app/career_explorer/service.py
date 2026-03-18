import logging
from datetime import datetime, timezone
from typing import Callable

from bson import ObjectId

from app.agent.agent_types import AgentInput
from app.agent.career_explorer_agent.agent import CareerExplorerAgent, _get_welcome_message, _get_welcome_metadata
from app.career_explorer.context_builder import build_windowed_context
from app.career_explorer.repository import ICareerExplorerConversationRepository
from app.career_explorer.types import (
    CareerExplorerConversationResponse,
    CareerExplorerMessage,
    CareerExplorerMessageSender,
)
from app.metrics.services.service import IMetricsService
from app.metrics.types import SectorEngagementEvent


class CareerExplorerService:
    def __init__(
        self,
        repository: ICareerExplorerConversationRepository,
        agent_factory: Callable[[], CareerExplorerAgent],
        metrics_service: IMetricsService,
    ):
        self._repository = repository
        self._agent_factory = agent_factory
        self._metrics_service = metrics_service
        self._logger = logging.getLogger(self.__class__.__name__)

    async def get_or_create_conversation(self, user_id: str) -> CareerExplorerConversationResponse:
        return await self._repository.get_or_create_conversation(user_id, _get_welcome_message(), metadata=_get_welcome_metadata())

    async def send_message(self, user_id: str, user_input: str) -> CareerExplorerConversationResponse:
        conv = await self._repository.find_by_user(user_id)
        if conv is None:
            raise ValueError("Conversation not found")

        now = datetime.now(timezone.utc)
        user_msg = CareerExplorerMessage(
            message_id=str(ObjectId()),
            message=user_input,
            sent_at=now,
            sender=CareerExplorerMessageSender.USER,
        )
        await self._repository.append_message(user_id, user_msg)

        context, new_summary, new_num_turns = await build_windowed_context(
            conv.messages,
            summary=conv.summary,
            num_turns_summarized=conv.num_turns_summarized,
        )
        if new_summary != conv.summary or new_num_turns != conv.num_turns_summarized:
            await self._repository.update_memory_state(
                user_id,
                new_summary,
                new_num_turns,
            )

        existing_sectors = await self._metrics_service.get_sector_names_for_user(user_id)

        agent = self._agent_factory()
        agent_input = AgentInput(message=user_input, sent_at=now)
        agent_output = await agent.execute(agent_input, context, existing_sectors=existing_sectors)

        agent_msg = CareerExplorerMessage(
            message_id=agent_output.message_id or str(ObjectId()),
            message=agent_output.message_for_user,
            sent_at=datetime.now(timezone.utc),
            sender=CareerExplorerMessageSender.AGENT,
            metadata=agent_output.metadata,
        )
        await self._repository.append_message(user_id, agent_msg)

        try:
            sector_classification = (agent_output.metadata or {}).get("sector_classification")
            if sector_classification:
                await self._metrics_service.record_event(
                    SectorEngagementEvent(
                        user_id=user_id,
                        sector_name=sector_classification["sector_name"],
                        is_priority=sector_classification["is_priority"],
                    )
                )
        except Exception as e:
            self._logger.exception("Failed to record sector engagement metric: %s", e)

        updated_response = await self._repository.find_response_by_user(user_id)
        if updated_response is None:
            raise ValueError("Conversation not found after appending message")
        updated_response.finished = agent_output.finished
        return updated_response

    async def get_conversation(self, user_id: str) -> CareerExplorerConversationResponse:
        response = await self._repository.find_response_by_user(user_id)
        if response is None:
            raise ValueError("Conversation not found")
        return response
