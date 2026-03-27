"""
Tests for NonPrioritySectorExplorer.

Covers the bug where the agent leaks its chain-of-thought JSON (including the
'reasoning' field) directly to the user instead of returning only the 'message'
field.
"""

import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.agent.career_explorer_agent.non_priority_sector_explorer import NonPrioritySectorExplorer
from app.conversation_memory.conversation_memory_types import ConversationContext
from app.context_vars import user_language_ctx_var
from app.i18n.types import Locale


# Raw JSON string that mirrors the bug report — LLM returned the full
# chain-of-thought JSON as plain text.
_BUG_REPORT_RAW_TEXT = json.dumps({
    "reasoning": (
        "The user's request is about the role of an ICT Data Engineer, which falls under the ICT sector. "
        "Since ICT is not one of the priority sectors in Zambia (Agriculture, Energy, Mining, Hospitality, Water), "
        "I need to use the Google Search tool to gather current information. The search results provide details on "
        "data engineering roles in Zambia, required skills, and salary expectations. I will use this information "
        "to provide a comprehensive answer to the user."
    ),
    "finished": False,
    "message": (
        "An ICT Data Engineer in Zambia is responsible for designing, building, and maintaining data pipelines "
        "and infrastructure. This involves ingesting, storing, and cataloging data, ensuring its quality, and "
        "making it accessible for analysis. Key skills for this role include strong proficiency in SQL and Python, "
        "understanding of software development methodologies, and experience with data warehousing, ETL "
        "(Extract, Transform, Load) processes, and cloud platforms like AWS, Azure, or Google Cloud. Some roles "
        "may also require experience with big data technologies such as Hadoop and Spark. In terms of salary, a "
        "Data Engineer in Lusaka can expect an average base salary of around 220,900 ZMW annually, though this "
        "can vary based on experience, employer type, and specific skills."
    ),
})

_EXPECTED_MESSAGE = (
    "An ICT Data Engineer in Zambia is responsible for designing, building, and maintaining data pipelines "
    "and infrastructure. This involves ingesting, storing, and cataloging data, ensuring its quality, and "
    "making it accessible for analysis. Key skills for this role include strong proficiency in SQL and Python, "
    "understanding of software development methodologies, and experience with data warehousing, ETL "
    "(Extract, Transform, Load) processes, and cloud platforms like AWS, Azure, or Google Cloud. Some roles "
    "may also require experience with big data technologies such as Hadoop and Spark. In terms of salary, a "
    "Data Engineer in Lusaka can expect an average base salary of around 220,900 ZMW annually, though this "
    "can vary based on experience, employer type, and specific skills."
)


def _make_mock_response(text: str) -> MagicMock:
    """Build a minimal mock of the genai GenerateContentResponse."""
    mock_response = MagicMock()
    mock_response.text = text
    mock_response.usage_metadata.prompt_token_count = 100
    mock_response.usage_metadata.candidates_token_count = 200
    # No grounding metadata for these unit tests.
    mock_response.candidates = []
    return mock_response


def _make_empty_context() -> ConversationContext:
    return ConversationContext()


@pytest.fixture(autouse=True)
def set_locale():
    """Set the user_language context var required by get_language_style()."""
    token = user_language_ctx_var.set(Locale.EN_US)
    yield
    user_language_ctx_var.reset(token)


@pytest.fixture
def explorer():
    return NonPrioritySectorExplorer()


@pytest.fixture
def mock_app_config():
    """Minimal application config so _build_non_priority_instructions() doesn't blow up."""
    config = MagicMock()
    config.career_explorer_config.sectors = [
        {"name": "Agriculture"},
        {"name": "Energy"},
        {"name": "Mining"},
        {"name": "Hospitality"},
        {"name": "Water"},
    ]
    config.career_explorer_config.country = "Zambia"
    return config


class TestNonPrioritySectorExplorer:

    @pytest.mark.asyncio
    async def test_bug_reproduction_reasoning_not_leaked_to_user(self, explorer, mock_app_config):
        """
        REGRESSION: LLM returns the full chain-of-thought JSON as plain text.

        The 'message' returned to the caller must contain only the user-facing
        text — NOT the raw JSON blob that includes the 'reasoning' field.
        """
        mock_response = _make_mock_response(_BUG_REPORT_RAW_TEXT)

        with patch("app.agent.career_explorer_agent.non_priority_sector_explorer.get_application_config",
                   return_value=mock_app_config), \
             patch("app.agent.career_explorer_agent.non_priority_sector_explorer.genai") as mock_genai, \
             patch("app.agent.career_explorer_agent.non_priority_sector_explorer."
                   "extract_grounding_metadata_from_genai_response", return_value=None):

            mock_client = AsyncMock()
            mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)
            mock_genai.Client.return_value = mock_client

            message, finished, reasoning, llm_stats, grounding = await explorer.explore(
                user_input="What does an ICT Data Engineer do in Zambia?",
                context=_make_empty_context(),
            )

        # THEN the user-facing message must be only the human-readable text
        assert message == _EXPECTED_MESSAGE, (
            f"Expected only the human-readable message.\n"
            f"Got: {message[:200]}..."
        )

        # AND the raw JSON must NOT appear in what the user sees
        assert '"reasoning"' not in message, "reasoning field leaked into user-facing message"
        assert '"finished"' not in message, "finished field leaked into user-facing message"

        # AND finished and reasoning are correctly extracted
        assert finished is False
        assert "ICT" in reasoning or reasoning != ""

    @pytest.mark.asyncio
    async def test_happy_path_plain_message_returned(self, explorer, mock_app_config):
        """
        When the LLM returns well-formed JSON, only model_response.message is
        returned to the caller (no reasoning leakage).
        """
        raw_text = json.dumps({
            "reasoning": "This is an internal thought the user should never see.",
            "finished": False,
            "message": "Software development is a growing field in Zambia.",
        })
        mock_response = _make_mock_response(raw_text)

        with patch("app.agent.career_explorer_agent.non_priority_sector_explorer.get_application_config",
                   return_value=mock_app_config), \
             patch("app.agent.career_explorer_agent.non_priority_sector_explorer.genai") as mock_genai, \
             patch("app.agent.career_explorer_agent.non_priority_sector_explorer."
                   "extract_grounding_metadata_from_genai_response", return_value=None):

            mock_client = AsyncMock()
            mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)
            mock_genai.Client.return_value = mock_client

            message, finished, reasoning, llm_stats, grounding = await explorer.explore(
                user_input="Tell me about software jobs in Zambia.",
                context=_make_empty_context(),
            )

        assert message == "Software development is a growing field in Zambia."
        assert '"reasoning"' not in message
        assert finished is False

    @pytest.mark.asyncio
    async def test_llm_returns_plain_text_no_json(self, explorer, mock_app_config):
        """
        When the LLM returns plain prose (no JSON at all), the plain text is
        used as-is for the message — no crash.
        """
        plain_text = "Data engineering in Zambia is a growing field."
        mock_response = _make_mock_response(plain_text)

        with patch("app.agent.career_explorer_agent.non_priority_sector_explorer.get_application_config",
                   return_value=mock_app_config), \
             patch("app.agent.career_explorer_agent.non_priority_sector_explorer.genai") as mock_genai, \
             patch("app.agent.career_explorer_agent.non_priority_sector_explorer."
                   "extract_grounding_metadata_from_genai_response", return_value=None):

            mock_client = AsyncMock()
            mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)
            mock_genai.Client.return_value = mock_client

            message, finished, reasoning, llm_stats, grounding = await explorer.explore(
                user_input="Tell me about data engineering.",
                context=_make_empty_context(),
            )

        assert message == plain_text
        assert finished is False

    # -------------------------------------------------------------------------
    # Edge cases that can trigger the NoJSONFound fallback (the bug path)
    # -------------------------------------------------------------------------

    @pytest.mark.asyncio
    async def test_edge_case_malformed_json_returns_generic_error(self, explorer, mock_app_config):
        """
        EDGE CASE — ExtractedDataValidationError (not NoJSONFound):
        When the LLM returns something that looks like JSON but fails pydantic
        validation (e.g. empty object {}), extract_json raises
        ExtractedDataValidationError — which is NOT caught by the inner except.
        It bubbles to the outer except, model_response stays None, and the user
        gets the generic error message. This is safe (no reasoning leak) but
        means the user hits an error even though the LLM responded.
        """
        raw_text = "Here are some { data } about careers."
        mock_response = _make_mock_response(raw_text)

        with patch("app.agent.career_explorer_agent.non_priority_sector_explorer.get_application_config",
                   return_value=mock_app_config), \
             patch("app.agent.career_explorer_agent.non_priority_sector_explorer.genai") as mock_genai, \
             patch("app.agent.career_explorer_agent.non_priority_sector_explorer."
                   "extract_grounding_metadata_from_genai_response", return_value=None):

            mock_client = AsyncMock()
            mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)
            mock_genai.Client.return_value = mock_client

            message, finished, reasoning, llm_stats, grounding = await explorer.explore(
                user_input="Tell me about careers.",
                context=_make_empty_context(),
            )

        # The outer except catches ExtractedDataValidationError → generic error returned
        # No reasoning leaks, but user gets an unhelpful error message
        assert finished is False
        assert '"reasoning"' not in message
        # Error is logged in llm_stats
        assert any(s.error for s in llm_stats)

    @pytest.mark.asyncio
    async def test_edge_case_double_json_from_tool_call_intermediate(self, explorer, mock_app_config):
        """
        EDGE CASE — Google Search tool produces two JSON blobs concatenated:
        The genai SDK can return a response where response.text is two
        back-to-back JSON objects (tool-call result + final answer).
        The greedy regex r'{.*}' with DOTALL matches from the first '{' to the
        last '}', producing an unparseable super-blob.

        If extract_json fails (NoJSONFound or InvalidJSON), the full double-JSON
        string becomes the message — leaking reasoning to the user.
        """
        single_json = json.dumps({
            "reasoning": "I searched for ICT Data Engineer roles.",
            "finished": False,
            "message": "ICT Data Engineers in Zambia earn around 220,900 ZMW per year.",
        })
        # Two JSON objects concatenated — the edge case from the search tool
        double_json = single_json + "\n" + single_json
        mock_response = _make_mock_response(double_json)

        with patch("app.agent.career_explorer_agent.non_priority_sector_explorer.get_application_config",
                   return_value=mock_app_config), \
             patch("app.agent.career_explorer_agent.non_priority_sector_explorer.genai") as mock_genai, \
             patch("app.agent.career_explorer_agent.non_priority_sector_explorer."
                   "extract_grounding_metadata_from_genai_response", return_value=None):

            mock_client = AsyncMock()
            mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)
            mock_genai.Client.return_value = mock_client

            message, finished, reasoning, llm_stats, grounding = await explorer.explore(
                user_input="What does an ICT Data Engineer do in Zambia?",
                context=_make_empty_context(),
            )

        # THEN reasoning must NOT leak into the user-facing message regardless of
        # how extract_json handles the double-blob
        assert '"reasoning"' not in message, (
            "BUG: reasoning field leaked to user when LLM returned double JSON blob.\n"
            f"message was: {message[:300]}"
        )
        assert '"finished"' not in message, (
            "BUG: finished field leaked to user when LLM returned double JSON blob."
        )

    @pytest.mark.asyncio
    async def test_edge_case_json_with_preamble_prose(self, explorer, mock_app_config):
        """
        EDGE CASE — LLM adds prose before the JSON:
        Some models output explanatory text before the JSON object.
        extract_json handles this via _find_json_start(), so this should work —
        but we confirm reasoning never reaches the user.
        """
        prose_then_json = (
            "Based on my research, here is a detailed answer:\n\n"
            + json.dumps({
                "reasoning": "The user asked about ICT, a non-priority sector. I searched.",
                "finished": False,
                "message": "ICT is a fast-growing sector in Zambia with many opportunities.",
            })
        )
        mock_response = _make_mock_response(prose_then_json)

        with patch("app.agent.career_explorer_agent.non_priority_sector_explorer.get_application_config",
                   return_value=mock_app_config), \
             patch("app.agent.career_explorer_agent.non_priority_sector_explorer.genai") as mock_genai, \
             patch("app.agent.career_explorer_agent.non_priority_sector_explorer."
                   "extract_grounding_metadata_from_genai_response", return_value=None):

            mock_client = AsyncMock()
            mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)
            mock_genai.Client.return_value = mock_client

            message, finished, reasoning, llm_stats, grounding = await explorer.explore(
                user_input="Tell me about ICT in Zambia.",
                context=_make_empty_context(),
            )

        assert message == "ICT is a fast-growing sector in Zambia with many opportunities."
        assert '"reasoning"' not in message
        assert finished is False

    @pytest.mark.asyncio
    async def test_hypothesis1_message_field_contains_json_string(self, explorer, mock_app_config):
        """
        CONFIRMED BUG — Hypothesis 1:
        The LLM outputs a valid outer JSON but the 'message' field value is
        itself the full chain-of-thought JSON string (the LLM echoed its own
        response format inside the message field).

        Backend parses the outer JSON, extracts model_response.message — but
        that value IS the raw JSON blob — and sends it straight to the user.
        """
        inner_json = json.dumps({
            "reasoning": (
                "The user's request is about the role of an ICT Data Engineer, which falls under the ICT sector. "
                "Since ICT is not one of the priority sectors in Zambia (Agriculture, Energy, Mining, Hospitality, Water), "
                "I need to use the Google Search tool to gather current information."
            ),
            "finished": False,
            "message": "An ICT Data Engineer in Zambia is responsible for designing data pipelines.",
        })

        # The LLM wraps the inner JSON as the value of the outer 'message' field
        outer_json = json.dumps({
            "reasoning": "I searched and found relevant information.",
            "finished": False,
            "message": inner_json,  # <-- the raw JSON blob as the message
        })
        mock_response = _make_mock_response(outer_json)

        with patch("app.agent.career_explorer_agent.non_priority_sector_explorer.get_application_config",
                   return_value=mock_app_config), \
             patch("app.agent.career_explorer_agent.non_priority_sector_explorer.genai") as mock_genai, \
             patch("app.agent.career_explorer_agent.non_priority_sector_explorer."
                   "extract_grounding_metadata_from_genai_response", return_value=None):

            mock_client = AsyncMock()
            mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)
            mock_genai.Client.return_value = mock_client

            message, finished, reasoning, llm_stats, grounding = await explorer.explore(
                user_input="What does an ICT Data Engineer do in Zambia?",
                context=_make_empty_context(),
            )

        # THEN the raw JSON must NOT reach the user
        assert '"reasoning"' not in message, (
            "BUG CONFIRMED: LLM embedded JSON in the message field — reasoning leaked to user.\n"
            f"message was: {message[:300]}"
        )
        assert '"finished"' not in message, (
            "BUG CONFIRMED: finished field leaked to user via embedded JSON in message."
        )
        # AND the actual human-readable text should be returned
        assert "ICT Data Engineer" in message

    @pytest.mark.asyncio
    async def test_edge_case_response_text_raises_valueerror(self, explorer, mock_app_config):
        """
        EDGE CASE — response.text raises ValueError (known genai SDK behaviour):
        When the model uses the Google Search tool mid-generation, accessing
        response.text on a multi-part response can raise ValueError.
        The outer except should catch this and return the generic error message.
        """
        mock_response = MagicMock()
        mock_response.usage_metadata.prompt_token_count = 100
        mock_response.usage_metadata.candidates_token_count = 0
        mock_response.candidates = []
        # Simulate the SDK raising ValueError on .text access
        type(mock_response).text = property(lambda self: (_ for _ in ()).throw(
            ValueError("Multiple content parts — cannot access .text directly")
        ))

        with patch("app.agent.career_explorer_agent.non_priority_sector_explorer.get_application_config",
                   return_value=mock_app_config), \
             patch("app.agent.career_explorer_agent.non_priority_sector_explorer.genai") as mock_genai, \
             patch("app.agent.career_explorer_agent.non_priority_sector_explorer."
                   "extract_grounding_metadata_from_genai_response", return_value=None):

            mock_client = AsyncMock()
            mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)
            mock_genai.Client.return_value = mock_client

            message, finished, reasoning, llm_stats, grounding = await explorer.explore(
                user_input="Tell me about data engineering.",
                context=_make_empty_context(),
            )

        # Should return the generic fallback error — not crash, not leak JSON
        assert finished is False
        assert '"reasoning"' not in message
        assert len(llm_stats) > 0 and llm_stats[-1].error is not None
