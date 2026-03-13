import logging
from datetime import datetime, timezone

import pytest

from app.agent.agent_director.abstract_agent_director import ConversationPhase
from app.agent.agent_types import AgentInput, AgentOutput, AgentType, LLMStats
from app.agent.experience import WorkType, ExperienceEntity
from app.agent.explore_experiences_agent_director import ExperienceState, DiveInPhase
from app.application_state import ApplicationState
from app.conversation_memory.conversation_memory_types import (
    ConversationTurn, ConversationHistory, ConversationContext,
)
from app.conversations.constants import BEGINNING_CONVERSATION_PERCENTAGE, FINISHED_CONVERSATION_PERCENTAGE, \
    COLLECT_EXPERIENCES_PERCENTAGE, DIVE_IN_EXPERIENCES_PERCENTAGE, PREFERENCE_ELICITATION_PERCENTAGE
from app.conversations.types import (
    ConversationPhaseResponse, CurrentConversationPhaseResponse,
    ConversationMessageSender,
)
from app.conversations.utils import (
    get_current_conversation_phase_response,
    filter_conversation_history,
    get_messages_from_conversation_manager,
)
from app.agent.explore_experiences_agent_director import ConversationPhase as CounselingConversationPhase
from common_libs.test_utilities import get_random_session_id

logger = logging.getLogger(__name__)

all_work_types = [
    WorkType.PAID_WORK,
    WorkType.UNPAID_WORK,
]


def _get_experience_entity() -> ExperienceEntity:
    return ExperienceEntity(
        experience_title="Foo",
    )


class TestConversationPhase:
    def test_new_conversation(self):
        # GIVEN a random session id
        given_session_id = get_random_session_id()

        # AND a brand-new application sate
        application_state = ApplicationState.new_state(session_id=given_session_id)

        # WHEN the conversation phase is calculated
        conversation_phase = get_current_conversation_phase_response(application_state, logger)

        # THEN the conversation phase is the initial phase, and the percentage is zero.
        assert conversation_phase == ConversationPhaseResponse(
            phase=CurrentConversationPhaseResponse.INTRO,
            percentage=BEGINNING_CONVERSATION_PERCENTAGE
        )

    def test_completed_conversation(self):
        # GIVEN a random session id
        given_session_id = get_random_session_id()

        # AND a completed conversation state
        application_state = ApplicationState.new_state(session_id=given_session_id)
        application_state.agent_director_state.current_phase = ConversationPhase.ENDED

        # WHEN the conversation phase is calculated
        conversation_phase = get_current_conversation_phase_response(application_state, logger)

        # THEN the conversation phase is the finished phase, and the percentage is 100.
        assert conversation_phase == ConversationPhaseResponse(
            phase=CurrentConversationPhaseResponse.ENDED,
            percentage=FINISHED_CONVERSATION_PERCENTAGE
        )

    @pytest.mark.parametrize("explored_work_types, expected_percentage", [
        (0, COLLECT_EXPERIENCES_PERCENTAGE),
        (1, 22),  # round((1/2) * (40 - 5) + 5)
        (2, DIVE_IN_EXPERIENCES_PERCENTAGE),
    ])
    def test_n_explored_work_types(self, explored_work_types: int, expected_percentage: int):
        # GIVEN a random session id
        given_session_id = get_random_session_id()

        # AND a collect experiences phase with n explored work types
        application_state = ApplicationState.new_state(session_id=given_session_id)
        application_state.agent_director_state.current_phase = ConversationPhase.COUNSELING
        application_state.collect_experience_state.explored_types = all_work_types[:explored_work_types]

        # GUARD the unexplored work types are the rest of the work types.
        application_state.collect_experience_state.unexplored_types = [
            item for item in all_work_types if item not in application_state.collect_experience_state.explored_types
        ]

        # WHEN the conversation phase is calculated
        conversation_phase = get_current_conversation_phase_response(application_state, logger)

        # THEN the conversation phase is the collect experiences phase, and changed based on the explored work types.
        expected_current_work_type = explored_work_types + 1
        if expected_current_work_type > len(all_work_types):
            # if we have explored all work types, we should not count the current work type.
            expected_current_work_type = len(all_work_types)

        assert conversation_phase == ConversationPhaseResponse(
            phase=CurrentConversationPhaseResponse.COLLECT_EXPERIENCES,
            percentage=expected_percentage,
            current=expected_current_work_type,
            total=len(all_work_types)
        )

    @pytest.mark.parametrize("explored, total, expected_percentage", [
        (0, 10, DIVE_IN_EXPERIENCES_PERCENTAGE),
        (1, 10, DIVE_IN_EXPERIENCES_PERCENTAGE + 3),  # (1/10) * (70 - 40)
        (3, 10, DIVE_IN_EXPERIENCES_PERCENTAGE + 9),  # (3/10) * (70 - 40)
        (5, 10, DIVE_IN_EXPERIENCES_PERCENTAGE + 15),  # (5/10) * (70 - 40)
        (7, 10, DIVE_IN_EXPERIENCES_PERCENTAGE + 21),  # (7/10) * (70 - 40)
        (10, 10, PREFERENCE_ELICITATION_PERCENTAGE)  # Dive-in ends at preference elicitation phase
    ])
    def test_n_explored_experiences(self, explored: int, total: int, expected_percentage: int):
        # GIVEN a random session id
        given_session_id = get_random_session_id()

        # AND n experiences are already explored
        given_experiences_state = dict()
        for i in range(explored):
            given_experiences_state[f"explored_experience_{i}"] = ExperienceState(
                dive_in_phase=DiveInPhase.PROCESSED,
                experience=_get_experience_entity()
            )

        # AND (total - explored) experiences are unexplored
        for i in range(total - explored):
            given_experiences_state[f"not_explored_experience_{i}"] = ExperienceState(
                dive_in_phase=DiveInPhase.NOT_STARTED,
                experience=_get_experience_entity()
            )

        # and we are in dive in phase with n explored and (10 - n) unexplored experiences.
        application_state = ApplicationState.new_state(session_id=given_session_id)
        application_state.agent_director_state.current_phase = ConversationPhase.COUNSELING
        application_state.explore_experiences_director_state.conversation_phase = CounselingConversationPhase.DIVE_IN
        application_state.explore_experiences_director_state.experiences_state = given_experiences_state

        # WHEN the conversation phase is calculated
        conversation_phase = get_current_conversation_phase_response(application_state, logger)

        # THEN the conversation phase is the collect experiences phase, and changed based on the explored work types.
        # Current is capped at total to prevent showing "11/10 experiences"
        expected_current = explored + 1
        if expected_current > total:
            expected_current = total

        assert conversation_phase == ConversationPhaseResponse(
            phase=CurrentConversationPhaseResponse.DIVE_IN,
            percentage=expected_percentage,
            current=expected_current,
            total=total
        )


def _make_llm_stats() -> list[LLMStats]:
    """Helper to create a minimal LLMStats list for AgentOutput."""
    return [LLMStats(prompt_token_count=10, response_token_count=20, response_time_in_sec=0.5)]


def _make_turn(*, index: int, user_message: str, compass_message: str,
               metadata: dict | None = None, is_artificial: bool = False) -> ConversationTurn:
    """Helper to create a ConversationTurn for testing."""
    return ConversationTurn(
        index=index,
        input=AgentInput(
            message=user_message,
            is_artificial=is_artificial,
            sent_at=datetime(2024, 1, 1, tzinfo=timezone.utc),
        ),
        output=AgentOutput(
            message_for_user=compass_message,
            finished=False,
            agent_type=AgentType.COLLECT_EXPERIENCES_AGENT,
            agent_response_time_in_sec=0.5,
            llm_stats=_make_llm_stats(),
            sent_at=datetime(2024, 1, 1, tzinfo=timezone.utc),
            metadata=metadata,
        ),
    )


class TestFilterConversationHistoryQuickReplyOptions:
    """Tests for quick_reply_options propagation in filter_conversation_history"""

    @pytest.mark.asyncio
    async def test_last_turn_with_quick_reply_options(self):
        """should attach quick_reply_options only to the last COMPASS message"""
        # GIVEN a conversation history with two turns
        given_quick_reply_options = [{"label": "Yes"}, {"label": "No"}]
        given_turn_1 = _make_turn(
            index=0,
            user_message="Hello",
            compass_message="Welcome!",
            metadata=None,
        )
        given_turn_2 = _make_turn(
            index=1,
            user_message="I have experience",
            compass_message="Do you have paid work?",
            metadata={"quick_reply_options": given_quick_reply_options},
        )
        given_history = ConversationHistory(turns=[given_turn_1, given_turn_2])

        # WHEN the conversation history is filtered
        actual_messages = await filter_conversation_history(given_history, reactions_for_session=[])

        # THEN the last COMPASS message should have quick_reply_options
        actual_last_compass_message = actual_messages[-1]
        assert actual_last_compass_message.sender == ConversationMessageSender.COMPASS
        assert actual_last_compass_message.quick_reply_options is not None
        assert len(actual_last_compass_message.quick_reply_options) == 2
        assert actual_last_compass_message.quick_reply_options[0].label == "Yes"
        assert actual_last_compass_message.quick_reply_options[1].label == "No"

    @pytest.mark.asyncio
    async def test_non_last_turn_does_not_have_quick_reply_options(self):
        """should NOT attach quick_reply_options to non-last COMPASS messages even if metadata is present"""
        # GIVEN a conversation history where the first turn has quick_reply_options in metadata
        given_turn_1 = _make_turn(
            index=0,
            user_message="Hello",
            compass_message="Welcome!",
            metadata={"quick_reply_options": [{"label": "Yes"}, {"label": "No"}]},
        )
        # AND a second turn without quick_reply_options
        given_turn_2 = _make_turn(
            index=1,
            user_message="I do",
            compass_message="Tell me more about your paid work.",
            metadata=None,
        )
        given_history = ConversationHistory(turns=[given_turn_1, given_turn_2])

        # WHEN the conversation history is filtered
        actual_messages = await filter_conversation_history(given_history, reactions_for_session=[])

        # THEN the first COMPASS message should NOT have quick_reply_options
        actual_first_compass_message = actual_messages[1]  # index 1 because index 0 is the user message
        assert actual_first_compass_message.sender == ConversationMessageSender.COMPASS
        assert actual_first_compass_message.quick_reply_options is None

        # AND the last COMPASS message should also have no quick_reply_options (no metadata)
        actual_last_compass_message = actual_messages[-1]
        assert actual_last_compass_message.sender == ConversationMessageSender.COMPASS
        assert actual_last_compass_message.quick_reply_options is None

    @pytest.mark.asyncio
    async def test_no_metadata_results_in_no_quick_reply_options(self):
        """should result in no quick_reply_options when metadata is None"""
        # GIVEN a conversation history with a single turn that has no metadata
        given_turn = _make_turn(
            index=0,
            user_message="Hello",
            compass_message="Welcome!",
            metadata=None,
        )
        given_history = ConversationHistory(turns=[given_turn])

        # WHEN the conversation history is filtered
        actual_messages = await filter_conversation_history(given_history, reactions_for_session=[])

        # THEN the COMPASS message should have no quick_reply_options
        actual_compass_message = actual_messages[-1]
        assert actual_compass_message.sender == ConversationMessageSender.COMPASS
        assert actual_compass_message.quick_reply_options is None

    @pytest.mark.asyncio
    async def test_metadata_without_quick_reply_options_key(self):
        """should result in no quick_reply_options when metadata exists but has no quick_reply_options key"""
        # GIVEN a conversation history with metadata that does not contain quick_reply_options
        given_turn = _make_turn(
            index=0,
            user_message="Hello",
            compass_message="Welcome!",
            metadata={"some_other_key": "value"},
        )
        given_history = ConversationHistory(turns=[given_turn])

        # WHEN the conversation history is filtered
        actual_messages = await filter_conversation_history(given_history, reactions_for_session=[])

        # THEN the COMPASS message should have no quick_reply_options
        actual_compass_message = actual_messages[-1]
        assert actual_compass_message.quick_reply_options is None


class TestGetMessagesFromConversationManagerQuickReplyOptions:
    """Tests for quick_reply_options propagation in get_messages_from_conversation_manager"""

    @pytest.mark.asyncio
    async def test_extracts_quick_reply_options_from_last_turn(self):
        """should extract quick_reply_options from the last turn's metadata"""
        # GIVEN a conversation context with two turns where the last has quick_reply_options
        given_quick_reply_options = [{"label": "That's all"}, {"label": "I want to add something"}]
        given_turn_1 = _make_turn(
            index=0,
            user_message="Hello",
            compass_message="Welcome!",
            metadata=None,
        )
        given_turn_2 = _make_turn(
            index=1,
            user_message="I worked as a driver",
            compass_message="Anything else?",
            metadata={"quick_reply_options": given_quick_reply_options},
        )
        given_all_history = ConversationHistory(turns=[given_turn_1, given_turn_2])
        given_context = ConversationContext(all_history=given_all_history)

        # WHEN get_messages_from_conversation_manager is called starting from index 0
        actual_messages = await get_messages_from_conversation_manager(given_context, from_index=0)

        # THEN the last message should have quick_reply_options
        actual_last_message = actual_messages[-1]
        assert actual_last_message.quick_reply_options is not None
        assert len(actual_last_message.quick_reply_options) == 2
        assert actual_last_message.quick_reply_options[0].label == "That's all"
        assert actual_last_message.quick_reply_options[1].label == "I want to add something"

    @pytest.mark.asyncio
    async def test_does_not_extract_quick_reply_options_from_non_last_turn(self):
        """should NOT extract quick_reply_options from non-last turns"""
        # GIVEN a conversation context where the first turn has quick_reply_options but the last does not
        given_turn_1 = _make_turn(
            index=0,
            user_message="Hello",
            compass_message="Do you have paid work?",
            metadata={"quick_reply_options": [{"label": "Yes"}, {"label": "No"}]},
        )
        given_turn_2 = _make_turn(
            index=1,
            user_message="Yes I do",
            compass_message="Tell me about your first job.",
            metadata=None,
        )
        given_all_history = ConversationHistory(turns=[given_turn_1, given_turn_2])
        given_context = ConversationContext(all_history=given_all_history)

        # WHEN get_messages_from_conversation_manager is called starting from index 0
        actual_messages = await get_messages_from_conversation_manager(given_context, from_index=0)

        # THEN the first message should NOT have quick_reply_options
        assert actual_messages[0].quick_reply_options is None

        # AND the last message should also have no quick_reply_options (no metadata)
        assert actual_messages[-1].quick_reply_options is None

    @pytest.mark.asyncio
    async def test_single_turn_with_quick_reply_options(self):
        """should extract quick_reply_options when there is only one turn"""
        # GIVEN a conversation context with a single turn that has quick_reply_options
        given_quick_reply_options = [{"label": "Let's start!"}]
        given_turn = _make_turn(
            index=0,
            user_message="Hi",
            compass_message="Ready to get started?",
            metadata={"quick_reply_options": given_quick_reply_options},
        )
        given_all_history = ConversationHistory(turns=[given_turn])
        given_context = ConversationContext(all_history=given_all_history)

        # WHEN get_messages_from_conversation_manager is called
        actual_messages = await get_messages_from_conversation_manager(given_context, from_index=0)

        # THEN the only message should have quick_reply_options
        assert len(actual_messages) == 1
        assert actual_messages[0].quick_reply_options is not None
        assert actual_messages[0].quick_reply_options[0].label == "Let's start!"

    @pytest.mark.asyncio
    async def test_from_index_respects_quick_reply_on_last_in_batch(self):
        """should attach quick_reply_options only to the last turn in the requested batch"""
        # GIVEN a conversation context with three turns
        given_turn_1 = _make_turn(
            index=0,
            user_message="Hello",
            compass_message="Welcome!",
            metadata=None,
        )
        given_turn_2 = _make_turn(
            index=1,
            user_message="I have experience",
            compass_message="Tell me more.",
            metadata={"quick_reply_options": [{"label": "Option A"}]},
        )
        given_turn_3 = _make_turn(
            index=2,
            user_message="I was a teacher",
            compass_message="Anything else?",
            metadata={"quick_reply_options": [{"label": "That's all"}]},
        )
        given_all_history = ConversationHistory(turns=[given_turn_1, given_turn_2, given_turn_3])
        given_context = ConversationContext(all_history=given_all_history)

        # WHEN get_messages_from_conversation_manager is called starting from index 1 (skipping the first turn)
        actual_messages = await get_messages_from_conversation_manager(given_context, from_index=1)

        # THEN the batch contains only turns 1 and 2
        assert len(actual_messages) == 2

        # AND the first message in the batch (turn index 1) should NOT have quick_reply_options
        assert actual_messages[0].quick_reply_options is None

        # AND the last message in the batch (turn index 2) should have quick_reply_options
        assert actual_messages[-1].quick_reply_options is not None
        assert actual_messages[-1].quick_reply_options[0].label == "That's all"
