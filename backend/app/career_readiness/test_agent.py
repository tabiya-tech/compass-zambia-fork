"""
Tests for the career readiness agent.
"""
from unittest.mock import AsyncMock, patch, MagicMock

import pytest

from app.agent.agent_types import AgentInput, AgentType, LLMStats
from app.agent.simple_llm_agent.llm_response import ModelResponse
from app.career_readiness.agent import CareerReadinessAgent, _build_system_instructions
from app.conversation_memory.conversation_memory_types import (
    ConversationContext,
    ConversationHistory,
)


class TestBuildSystemInstructions:
    """Tests for the system instructions builder."""

    def test_includes_module_title(self):
        # GIVEN a module title and content
        given_title = "CV Development"
        given_content = "How to write a great CV."

        # WHEN the system instructions are built
        actual_instructions = _build_system_instructions(given_title, given_content)

        # THEN the module title is included in the instructions
        assert given_title in actual_instructions

    def test_includes_module_content(self):
        # GIVEN a module title and content
        given_title = "Interview Preparation"
        given_content = "Practice answering behavioral questions using the STAR method."

        # WHEN the system instructions are built
        actual_instructions = _build_system_instructions(given_title, given_content)

        # THEN the module content is included in the instructions
        assert given_content in actual_instructions

    def test_includes_json_response_instructions(self):
        # GIVEN a module title and content
        given_title = "Cover Letter"
        given_content = "A cover letter should be tailored to the job."

        # WHEN the system instructions are built
        actual_instructions = _build_system_instructions(given_title, given_content)

        # THEN the JSON response schema instructions are included
        assert "reasoning" in actual_instructions
        assert "finished" in actual_instructions
        assert "message" in actual_instructions

    def test_includes_finish_instructions(self):
        # GIVEN a module title and content
        given_title = "Workplace Readiness"
        given_content = "Understanding workplace norms."

        # WHEN the system instructions are built
        actual_instructions = _build_system_instructions(given_title, given_content)

        # THEN the finish instructions are included
        assert "finished" in actual_instructions
        assert "true" in actual_instructions


@patch("app.career_readiness.agent.GeminiGenerativeLLM")
class TestCareerReadinessAgent:
    """Tests for the CareerReadinessAgent class."""

    def test_initializes_with_correct_system_instructions(self, mock_llm_cls):
        # GIVEN a module title and content
        given_title = "CV Development"
        given_content = "Write your CV with clear structure."

        # WHEN the agent is created
        actual_agent = CareerReadinessAgent(module_title=given_title, module_content=given_content)

        # THEN the system instructions contain the module title and content
        assert given_title in actual_agent.system_instructions
        assert given_content in actual_agent.system_instructions

    @pytest.mark.asyncio
    async def test_execute_returns_agent_output(self, mock_llm_cls):
        # GIVEN an agent with a mocked LLM caller
        given_agent = CareerReadinessAgent(module_title="Test Module", module_content="Test content.")
        given_model_response = ModelResponse(
            reasoning="The user asked about CVs, therefore I will set the finished flag to false.",
            finished=False,
            message="Here are some tips for writing a CV.",
        )
        given_llm_stats = [LLMStats(
            prompt_token_count=100,
            response_token_count=50,
            response_time_in_sec=1.0,
        )]
        given_agent._llm_caller.call_llm = AsyncMock(return_value=(given_model_response, given_llm_stats))

        # AND a user input and empty context
        given_input = AgentInput(message="How do I write a CV?")
        given_context = ConversationContext(
            all_history=ConversationHistory(),
            history=ConversationHistory(),
        )

        # WHEN execute is called
        actual_output = await given_agent.execute(given_input, given_context)

        # THEN the output contains the expected message
        assert actual_output.message_for_user == "Here are some tips for writing a CV."
        # AND the finished flag matches the model response
        assert actual_output.finished is False
        # AND the agent type is correct
        assert actual_output.agent_type == AgentType.CAREER_READINESS_AGENT

    @pytest.mark.asyncio
    async def test_execute_handles_empty_input(self, mock_llm_cls):
        # GIVEN an agent with a mocked LLM caller
        given_agent = CareerReadinessAgent(module_title="Test Module", module_content="Test content.")
        given_model_response = ModelResponse(
            reasoning="The user sent empty input, I will greet them.",
            finished=False,
            message="Hello! How can I help you today?",
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
        given_agent = CareerReadinessAgent(module_title="Test Module", module_content="Test content.")
        given_agent._llm_caller.call_llm = AsyncMock(side_effect=Exception("LLM service unavailable"))

        given_input = AgentInput(message="Tell me about CVs")
        given_context = ConversationContext(
            all_history=ConversationHistory(),
            history=ConversationHistory(),
        )

        # WHEN execute is called
        actual_output = await given_agent.execute(given_input, given_context)

        # THEN a fallback error message is returned
        assert "difficulties" in actual_output.message_for_user
        # AND the agent does not claim to be finished
        assert actual_output.finished is False

    @pytest.mark.asyncio
    async def test_generate_intro_message_sends_artificial_input(self, mock_llm_cls):
        # GIVEN an agent with a mocked LLM caller
        given_agent = CareerReadinessAgent(module_title="Test Module", module_content="Test content.")
        given_model_response = ModelResponse(
            reasoning="Starting a new conversation, introducing the module.",
            finished=False,
            message="Welcome to the CV Development module!",
        )
        given_agent._llm_caller.call_llm = AsyncMock(return_value=(given_model_response, []))

        given_context = ConversationContext(
            all_history=ConversationHistory(),
            history=ConversationHistory(),
        )

        # WHEN generate_intro_message is called
        actual_output = await given_agent.generate_intro_message(given_context)

        # THEN the output contains the introductory message
        assert actual_output.message_for_user == "Welcome to the CV Development module!"
        # AND the LLM is called with "(silence)" as the user message
        call_args = given_agent._llm_caller.call_llm.call_args
        llm_input = call_args.kwargs["llm_input"]
        assert any("(silence)" in turn.content for turn in llm_input.turns)

    @pytest.mark.asyncio
    async def test_execute_strips_quotes_from_message(self, mock_llm_cls):
        # GIVEN an agent whose LLM returns a message wrapped in quotes
        given_agent = CareerReadinessAgent(module_title="Test Module", module_content="Test content.")
        given_model_response = ModelResponse(
            reasoning="Responding to user.",
            finished=False,
            message='"Here is some advice."',
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
        assert actual_output.message_for_user == "Here is some advice."
