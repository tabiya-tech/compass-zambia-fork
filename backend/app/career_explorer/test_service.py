"""
Tests for the career explorer service layer.
"""
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch, MagicMock

import pytest
from bson import ObjectId

from app.agent.agent_types import AgentOutput, AgentType
from app.career_explorer.repository import ICareerExplorerConversationRepository
from app.career_explorer.service import CareerExplorerService
from app.career_explorer.types import (
    CareerExplorerConversationDocument,
    CareerExplorerConversationResponse,
    CareerExplorerMessage,
    CareerExplorerMessageSender,
)
from app.conversation_memory.conversation_memory_types import (
    ConversationContext,
    ConversationHistory,
)
from app.metrics.services.service import IMetricsService
from app.metrics.types import SectorEngagementEvent


# ---------------------------------------------------------------------------
# Helper factories
# ---------------------------------------------------------------------------

def _make_message(
    sender: CareerExplorerMessageSender = CareerExplorerMessageSender.AGENT,
    message: str = "Hello",
) -> CareerExplorerMessage:
    return CareerExplorerMessage(
        message_id=str(ObjectId()),
        message=message,
        sender=sender,
        sent_at=datetime.now(timezone.utc),
    )


def _make_conversation_document(
    user_id: str = "test_user",
    messages: list[CareerExplorerMessage] | None = None,
    summary: str = "",
    num_turns_summarized: int = 0,
) -> CareerExplorerConversationDocument:
    now = datetime.now(timezone.utc)
    return CareerExplorerConversationDocument(
        user_id=user_id,
        messages=messages or [_make_message()],
        created_at=now,
        updated_at=now,
        summary=summary,
        num_turns_summarized=num_turns_summarized,
    )


def _make_conversation_response(
    messages: list[CareerExplorerMessage] | None = None,
    finished: bool = False,
) -> CareerExplorerConversationResponse:
    return CareerExplorerConversationResponse(
        messages=messages or [_make_message()],
        finished=finished,
    )


def _make_agent_output(
    message: str = "Agent response",
    finished: bool = False,
    metadata: dict | None = None,
) -> AgentOutput:
    return AgentOutput(
        message_id=str(ObjectId()),
        message_for_user=message,
        finished=finished,
        agent_type=AgentType.CAREER_EXPLORER_AGENT,
        agent_response_time_in_sec=0.5,
        llm_stats=[],
        sent_at=datetime.now(timezone.utc),
        metadata=metadata,
    )


def _make_empty_context() -> ConversationContext:
    return ConversationContext(
        all_history=ConversationHistory(turns=[]),
        history=ConversationHistory(turns=[]),
        summary="",
    )


def _make_service(
    repository: AsyncMock | None = None,
    agent_mock: AsyncMock | None = None,
    metrics_service: AsyncMock | None = None,
) -> CareerExplorerService:
    """Create a CareerExplorerService with mocked dependencies."""
    repo = repository or AsyncMock(spec=ICareerExplorerConversationRepository)
    metrics = metrics_service or AsyncMock(spec=IMetricsService)
    agent = agent_mock or AsyncMock()
    agent_factory = MagicMock(return_value=agent)
    return CareerExplorerService(
        repository=repo,
        agent_factory=agent_factory,
        metrics_service=metrics,
    )


# ---------------------------------------------------------------------------
# Tests — send_message with sector engagement metrics
# ---------------------------------------------------------------------------

class TestSendMessageSectorEngagement:
    """Tests for send_message sector classification and metrics recording."""

    @pytest.mark.asyncio
    @patch("app.career_explorer.service.build_windowed_context")
    async def test_passes_existing_sectors_to_agent_and_records_sector_engagement_event(
        self, mock_build_context, setup_application_config
    ):
        """send_message should fetch existing sectors, pass them to the agent,
        and record a SectorEngagementEvent when sector_classification is in the metadata."""
        # GIVEN a user with an existing conversation
        given_user_id = "user_123"
        given_conversation = _make_conversation_document(user_id=given_user_id)
        given_context = _make_empty_context()
        mock_build_context.return_value = (given_context, "", 0)

        given_repository = AsyncMock(spec=ICareerExplorerConversationRepository)
        given_repository.find_by_user.return_value = given_conversation
        given_repository.append_message.return_value = None
        given_repository.update_memory_state.return_value = None
        given_repository.find_response_by_user.return_value = _make_conversation_response()

        # AND the metrics service returns ["Agriculture", "Tech/ICT"] as existing sectors
        given_metrics_service = AsyncMock(spec=IMetricsService)
        given_existing_sectors = ["Agriculture", "Tech/ICT"]
        given_metrics_service.get_sector_names_for_user.return_value = given_existing_sectors

        # AND the agent returns output with sector_classification metadata
        given_sector_metadata = {"sector_name": "Agriculture", "is_priority": True}
        given_agent_output = _make_agent_output(
            metadata={"sector_classification": given_sector_metadata}
        )
        given_agent = AsyncMock()
        given_agent.execute.return_value = given_agent_output

        service = _make_service(
            repository=given_repository,
            agent_mock=given_agent,
            metrics_service=given_metrics_service,
        )

        # WHEN send_message is called
        await service.send_message(given_user_id, "Tell me about agriculture")

        # THEN the agent is called with existing_sectors=["Agriculture", "Tech/ICT"]
        given_agent.execute.assert_called_once()
        actual_call_kwargs = given_agent.execute.call_args
        assert actual_call_kwargs.kwargs["existing_sectors"] == given_existing_sectors

        # AND metrics_service.record_event is called with a SectorEngagementEvent
        given_metrics_service.record_event.assert_called_once()
        actual_event = given_metrics_service.record_event.call_args[0][0]
        assert isinstance(actual_event, SectorEngagementEvent)
        assert actual_event.sector_name == "Agriculture"
        assert actual_event.is_priority is True

    @pytest.mark.asyncio
    @patch("app.career_explorer.service.build_windowed_context")
    async def test_does_not_record_metric_when_no_sector_classification(
        self, mock_build_context
    ):
        """send_message should NOT record a metric event when the agent output has no sector_classification."""
        # GIVEN a user with an existing conversation
        given_user_id = "user_456"
        given_conversation = _make_conversation_document(user_id=given_user_id)
        given_context = _make_empty_context()
        mock_build_context.return_value = (given_context, "", 0)

        given_repository = AsyncMock(spec=ICareerExplorerConversationRepository)
        given_repository.find_by_user.return_value = given_conversation
        given_repository.append_message.return_value = None
        given_repository.update_memory_state.return_value = None
        given_repository.find_response_by_user.return_value = _make_conversation_response()

        # AND the metrics service returns [] as existing sectors
        given_metrics_service = AsyncMock(spec=IMetricsService)
        given_metrics_service.get_sector_names_for_user.return_value = []

        # AND the agent returns output with NO sector_classification in metadata
        given_agent_output = _make_agent_output(metadata=None)
        given_agent = AsyncMock()
        given_agent.execute.return_value = given_agent_output

        service = _make_service(
            repository=given_repository,
            agent_mock=given_agent,
            metrics_service=given_metrics_service,
        )

        # WHEN send_message is called
        await service.send_message(given_user_id, "Hello there")

        # THEN metrics_service.record_event is NOT called
        given_metrics_service.record_event.assert_not_called()

    @pytest.mark.asyncio
    @patch("app.career_explorer.service.build_windowed_context")
    async def test_metrics_failure_does_not_crash_send_message(
        self, mock_build_context, setup_application_config
    ):
        """send_message should complete successfully even when metrics_service.record_event raises an exception."""
        # GIVEN a user with an existing conversation
        given_user_id = "user_789"
        given_conversation = _make_conversation_document(user_id=given_user_id)
        given_context = _make_empty_context()
        mock_build_context.return_value = (given_context, "", 0)

        given_repository = AsyncMock(spec=ICareerExplorerConversationRepository)
        given_repository.find_by_user.return_value = given_conversation
        given_repository.append_message.return_value = None
        given_repository.update_memory_state.return_value = None
        given_expected_response = _make_conversation_response()
        given_repository.find_response_by_user.return_value = given_expected_response

        # AND the metrics service returns [] as existing sectors
        given_metrics_service = AsyncMock(spec=IMetricsService)
        given_metrics_service.get_sector_names_for_user.return_value = []

        # AND the agent returns output with sector_classification metadata
        given_sector_metadata = {"sector_name": "Mining", "is_priority": False}
        given_agent_output = _make_agent_output(
            metadata={"sector_classification": given_sector_metadata}
        )
        given_agent = AsyncMock()
        given_agent.execute.return_value = given_agent_output

        # AND metrics_service.record_event raises an Exception
        given_metrics_service.record_event.side_effect = Exception("Metrics database unavailable")

        service = _make_service(
            repository=given_repository,
            agent_mock=given_agent,
            metrics_service=given_metrics_service,
        )

        # WHEN send_message is called
        # THEN send_message completes successfully (no exception raised)
        actual_response = await service.send_message(given_user_id, "Tell me about mining")

        # AND the response is returned normally
        assert actual_response is not None
        assert actual_response.messages == given_expected_response.messages
