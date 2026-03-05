"""
Tests for the career readiness agent.
"""
from unittest.mock import AsyncMock, patch

import pytest

from app.agent.agent_types import AgentInput, AgentType, LLMStats
from app.career_readiness.agent import (
    CareerReadinessAgent,
    CareerReadinessAgentOutput,
    CareerReadinessModelResponse,
    _build_instruction_mode_instructions,
    _build_support_mode_instructions,
)
from app.career_readiness.types import ConversationMode
from app.conversation_memory.conversation_memory_types import (
    ConversationContext,
    ConversationHistory,
)


class TestBuildInstructionModeInstructions:
    """Tests for the instruction mode system instructions builder."""

    def test_includes_module_title(self):
        # GIVEN a module title, content, and topics
        given_title = "CV Development"
        given_content = "How to write a great CV."
        given_topics = ["CV Structure", "Writing Tips"]

        # WHEN the instruction mode instructions are built
        actual_instructions = _build_instruction_mode_instructions(given_title, given_content, given_topics)

        # THEN the module title is included
        assert given_title in actual_instructions

    def test_includes_module_content(self):
        # GIVEN a module title, content, and topics
        given_title = "Interview Preparation"
        given_content = "Practice answering behavioral questions using the STAR method."
        given_topics = ["STAR Method"]

        # WHEN the instruction mode instructions are built
        actual_instructions = _build_instruction_mode_instructions(given_title, given_content, given_topics)

        # THEN the module content is included
        assert given_content in actual_instructions

    def test_includes_topics_list(self):
        # GIVEN topics for the module
        given_topics = ["Types of Skills", "How to Identify Skills", "Professional Identity"]

        # WHEN the instruction mode instructions are built
        actual_instructions = _build_instruction_mode_instructions("Module", "Content", given_topics)

        # THEN each topic appears in the instructions
        for topic in given_topics:
            assert topic in actual_instructions

    def test_includes_scaffolded_socratic_instructions(self):
        # GIVEN any module
        # WHEN the instruction mode instructions are built
        actual_instructions = _build_instruction_mode_instructions("Module", "Content", ["Topic"])

        # THEN the scaffolded Socratic tutoring approach is present
        assert "ASSESS" in actual_instructions
        assert "GUIDE" in actual_instructions
        assert "HINT" in actual_instructions
        assert "EXPLAIN" in actual_instructions
        assert "FADE" in actual_instructions

    def test_includes_comprehension_check_instructions(self):
        # GIVEN any module
        # WHEN the instruction mode instructions are built
        actual_instructions = _build_instruction_mode_instructions("Module", "Content", ["Topic"])

        # THEN comprehension check techniques are mentioned
        assert "explain" in actual_instructions.lower()
        assert "application" in actual_instructions.lower()

    def test_includes_topics_covered_in_response_schema(self):
        # GIVEN any module
        # WHEN the instruction mode instructions are built
        actual_instructions = _build_instruction_mode_instructions("Module", "Content", ["Topic"])

        # THEN the response schema mentions topics_covered
        assert "topics_covered" in actual_instructions

    def test_instructs_not_to_reveal_quiz(self):
        # GIVEN any module
        # WHEN the instruction mode instructions are built
        actual_instructions = _build_instruction_mode_instructions("Module", "Content", ["Topic"])

        # THEN there is an instruction not to discuss the quiz
        assert "quiz" in actual_instructions.lower()
        assert "do not" in actual_instructions.lower()


    def test_instructs_to_handle_minimal_responses(self):
        # GIVEN any module
        # WHEN the instruction mode instructions are built
        actual_instructions = _build_instruction_mode_instructions("Module", "Content", ["Topic"])

        # THEN there are instructions to not accept minimal responses as understanding
        assert "minimal" in actual_instructions.lower()
        assert "demonstrate" in actual_instructions.lower()


class TestBuildSupportModeInstructions:
    """Tests for the support mode system instructions builder."""

    def test_includes_module_title(self):
        # GIVEN a module title and content
        given_title = "CV Development"
        given_content = "How to write a great CV."

        # WHEN the support mode instructions are built
        actual_instructions = _build_support_mode_instructions(given_title, given_content)

        # THEN the module title is included
        assert given_title in actual_instructions

    def test_includes_module_content(self):
        # GIVEN a module title and content
        given_content = "Practice answering behavioral questions."

        # WHEN the support mode instructions are built
        actual_instructions = _build_support_mode_instructions("Module", given_content)

        # THEN the module content is included
        assert given_content in actual_instructions

    def test_instructs_finished_always_false(self):
        # GIVEN any module
        # WHEN the support mode instructions are built
        actual_instructions = _build_support_mode_instructions("Module", "Content")

        # THEN it instructs finished to always be false
        assert "false" in actual_instructions.lower()
        assert "finished" in actual_instructions.lower()

    def test_instructs_not_to_reinitiate_lesson(self):
        # GIVEN any module
        # WHEN the support mode instructions are built
        actual_instructions = _build_support_mode_instructions("Module", "Content")

        # THEN there is an instruction not to re-initiate the lesson plan
        assert "lesson plan" in actual_instructions.lower()


@patch("app.career_readiness.agent.GeminiGenerativeLLM")
class TestCareerReadinessAgent:
    """Tests for the CareerReadinessAgent class."""

    def test_initializes_in_instruction_mode_by_default(self, mock_llm_cls):
        # GIVEN a module title, content, and topics
        given_title = "CV Development"
        given_content = "Write your CV with clear structure."
        given_topics = ["CV Structure", "Writing Tips"]

        # WHEN the agent is created without specifying mode
        actual_agent = CareerReadinessAgent(
            module_title=given_title, module_content=given_content, topics=given_topics)

        # THEN the system instructions contain scaffolded Socratic content
        assert "ASSESS" in actual_agent.system_instructions
        assert given_title in actual_agent.system_instructions
        assert given_content in actual_agent.system_instructions

    def test_initializes_in_support_mode(self, mock_llm_cls):
        # GIVEN a module title and content
        given_title = "CV Development"
        given_content = "Write your CV with clear structure."

        # WHEN the agent is created in support mode
        actual_agent = CareerReadinessAgent(
            module_title=given_title, module_content=given_content,
            mode=ConversationMode.SUPPORT)

        # THEN the system instructions contain support mode content
        assert "follow-up" in actual_agent.system_instructions.lower()
        # AND do NOT contain instruction mode content
        assert "ASSESS" not in actual_agent.system_instructions

    @pytest.mark.asyncio
    async def test_execute_returns_career_readiness_agent_output(self, mock_llm_cls):
        # GIVEN an agent with a mocked LLM caller
        given_agent = CareerReadinessAgent(
            module_title="Test Module", module_content="Test content.",
            topics=["Topic A", "Topic B"])
        given_model_response = CareerReadinessModelResponse(
            reasoning="The user asked about Topic A.",
            finished=False,
            message="Let's start with Topic A. What do you already know?",
            topics_covered=["Topic A"],
        )
        given_llm_stats = [LLMStats(
            prompt_token_count=100,
            response_token_count=50,
            response_time_in_sec=1.0,
        )]
        given_agent._llm_caller.call_llm = AsyncMock(return_value=(given_model_response, given_llm_stats))

        # AND a user input and empty context
        given_input = AgentInput(message="Hi, I'd like to learn about Topic A")
        given_context = ConversationContext(
            all_history=ConversationHistory(),
            history=ConversationHistory(),
        )

        # WHEN execute is called
        actual_output = await given_agent.execute(given_input, given_context)

        # THEN the output is a CareerReadinessAgentOutput
        assert isinstance(actual_output, CareerReadinessAgentOutput)
        # AND the agent output contains the expected message
        assert actual_output.agent_output.message_for_user == "Let's start with Topic A. What do you already know?"
        # AND the finished flag matches the model response
        assert actual_output.agent_output.finished is False
        # AND the topics_covered are propagated
        assert actual_output.topics_covered == ["Topic A"]
        # AND the agent type is correct
        assert actual_output.agent_output.agent_type == AgentType.CAREER_READINESS_AGENT

    @pytest.mark.asyncio
    async def test_execute_handles_empty_input(self, mock_llm_cls):
        # GIVEN an agent with a mocked LLM caller
        given_agent = CareerReadinessAgent(
            module_title="Test Module", module_content="Test content.", topics=["Topic A"])
        given_model_response = CareerReadinessModelResponse(
            reasoning="The user sent empty input, I will greet them.",
            finished=False,
            message="Hello! How can I help you today?",
            topics_covered=[],
        )
        given_agent._llm_caller.call_llm = AsyncMock(return_value=(given_model_response, []))

        # AND an empty user input
        given_input = AgentInput(message="   ")
        given_context = ConversationContext(
            all_history=ConversationHistory(),
            history=ConversationHistory(),
        )

        # WHEN execute is called
        actual_output = await given_agent.execute(given_input, given_context)

        # THEN the LLM is called with "(silence)" as the user message
        call_args = given_agent._llm_caller.call_llm.call_args
        llm_input = call_args.kwargs["llm_input"]
        assert any("(silence)" in turn.content for turn in llm_input.turns)

    @pytest.mark.asyncio
    async def test_execute_handles_llm_error(self, mock_llm_cls):
        # GIVEN an agent whose LLM caller raises an exception
        given_agent = CareerReadinessAgent(
            module_title="Test Module", module_content="Test content.", topics=["Topic A"])
        given_agent._llm_caller.call_llm = AsyncMock(side_effect=Exception("LLM service unavailable"))

        given_input = AgentInput(message="Tell me about CVs")
        given_context = ConversationContext(
            all_history=ConversationHistory(),
            history=ConversationHistory(),
        )

        # WHEN execute is called
        actual_output = await given_agent.execute(given_input, given_context)

        # THEN a fallback error message is returned
        assert "difficulties" in actual_output.agent_output.message_for_user
        # AND the agent does not claim to be finished
        assert actual_output.agent_output.finished is False
        # AND topics_covered is empty
        assert actual_output.topics_covered == []

    @pytest.mark.asyncio
    async def test_generate_intro_message_sends_artificial_input(self, mock_llm_cls):
        # GIVEN an agent with a mocked LLM caller
        given_agent = CareerReadinessAgent(
            module_title="Test Module", module_content="Test content.", topics=["Topic A"])
        given_model_response = CareerReadinessModelResponse(
            reasoning="Starting a new conversation, introducing the module.",
            finished=False,
            message="Welcome to the CV Development module!",
            topics_covered=[],
        )
        given_agent._llm_caller.call_llm = AsyncMock(return_value=(given_model_response, []))

        given_context = ConversationContext(
            all_history=ConversationHistory(),
            history=ConversationHistory(),
        )

        # WHEN generate_intro_message is called
        actual_output = await given_agent.generate_intro_message(given_context)

        # THEN the output contains the introductory message
        assert actual_output.agent_output.message_for_user == "Welcome to the CV Development module!"
        # AND the LLM is called with "(silence)" as the user message
        call_args = given_agent._llm_caller.call_llm.call_args
        llm_input = call_args.kwargs["llm_input"]
        assert any("(silence)" in turn.content for turn in llm_input.turns)

    @pytest.mark.asyncio
    async def test_execute_strips_quotes_from_message(self, mock_llm_cls):
        # GIVEN an agent whose LLM returns a message wrapped in quotes
        given_agent = CareerReadinessAgent(
            module_title="Test Module", module_content="Test content.", topics=["Topic A"])
        given_model_response = CareerReadinessModelResponse(
            reasoning="Responding to user.",
            finished=False,
            message='"Here is some advice."',
            topics_covered=[],
        )
        given_agent._llm_caller.call_llm = AsyncMock(return_value=(given_model_response, []))

        given_input = AgentInput(message="Help me")
        given_context = ConversationContext(
            all_history=ConversationHistory(),
            history=ConversationHistory(),
        )

        # WHEN execute is called
        actual_output = await given_agent.execute(given_input, given_context)

        # THEN the leading and trailing quotes are stripped
        assert actual_output.agent_output.message_for_user == "Here is some advice."
