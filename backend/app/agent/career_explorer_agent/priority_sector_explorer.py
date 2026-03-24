"""
Explorer for priority sectors using RAG (vector search). Answers based on retrieved content only.
"""

import logging
from textwrap import dedent

from pydantic import BaseModel

from app.agent.agent_types import LLMStats, LLMQuickReplyOption
from app.agent.llm_caller import LLMCaller
from app.agent.prompt_template.locale_style import get_language_style
from app.agent.prompt_template.agent_prompt_template import STD_AGENT_CHARACTER
from app.agent.prompt_template.quick_reply_prompt import QUICK_REPLY_PROMPT
from app.agent.simple_llm_agent.prompt_response_template import get_conversation_finish_instructions, get_json_response_instructions
from app.app_config import get_application_config
from app.i18n.translation_service import t
from common_libs.llm.generative_models import GeminiGenerativeLLM
from common_libs.llm.models_utils import LLMConfig, LOW_TEMPERATURE_GENERATION_CONFIG, JSON_GENERATION_CONFIG
from common_libs.llm.schema_builder import with_response_schema
from app.conversation_memory.conversation_formatter import ConversationHistoryFormatter

from .sector_search_service import SectorChunkEntity, SectorSearchService


class _PrioritySectorResponse(BaseModel):
    reasoning: str
    finished: bool
    message: str
    quick_reply_options: list[LLMQuickReplyOption] | None = None

    class Config:
        extra = "forbid"


def _build_base_instructions(retrieved_content: str) -> str:
    config = get_application_config()
    # Escape braces in QUICK_REPLY_PROMPT so .format() treats them as literals
    escaped_quick_reply = QUICK_REPLY_PROMPT.replace("{", "{{").replace("}", "}}")
    sectors = config.career_explorer_config.sectors
    sector_names = [s["name"] for s in sectors] if sectors else []
    sector_list_str = ", ".join(sector_names) if sector_names else "the priority sectors"
    country_name = config.default_country_of_user.value
    language_style = get_language_style(with_locale=True)
    finish_instructions = get_conversation_finish_instructions(
        "When the user explicitly indicates they are done or want to exit"
    )
    return dedent(f"""\
        <system_instructions>
        # Role
            You are a career exploration counselor helping TEVET graduates in {country_name} discover career opportunities
            in priority sectors. You start by suggesting topics and wait for the user to choose or ask questions.

        {language_style}

        {STD_AGENT_CHARACTER}

        # Instructions
            - Start by suggesting the priority sectors ({sector_list_str}) and ask which interests the user most
            - Answer questions based ONLY on the retrieved content provided below
            - Stay on topic: focus on the priority sectors ({sector_list_str})
            - If asked about something outside this scope, politely redirect to the priority sectors
            - Be encouraging and conversational
            - Do not invent information not in the provided content

        # Retrieved Content
            Use the following content to answer user questions. Cite specifics when relevant.

        {{retrieved_content}}

        {finish_instructions}

        {escaped_quick_reply}
        </system_instructions>
    """).format(sector_list_str=sector_list_str, retrieved_content=retrieved_content)


def _format_chunks(chunks: list[SectorChunkEntity]) -> str:
    if not chunks:
        config = get_application_config()
        sectors = config.career_explorer_config.sectors
        sector_names = [s["name"] for s in sectors] if sectors else []
        sector_list_str = ", ".join(sector_names) if sector_names else "the priority sectors"
        return f"(No relevant content found. Suggest the user pick a sector or ask a question related to {sector_list_str}.)"
    parts = []
    for c in chunks:
        parts.append(f"[{c.sector}]\n{c.text}")
    return "\n\n---\n\n".join(parts)


def _build_pending_sectors_section(pending_sectors: list[dict] | None) -> str:
    if not pending_sectors:
        return ""
    formatted = ", ".join(s["sector_name"] for s in pending_sectors)
    next_sector = pending_sectors[0]["sector_name"]
    return dedent(f"""\

        # Pending Sectors
            The user has also expressed interest in these sectors (not yet explored): {formatted}
            When the current topic reaches a natural pause (user's question has been answered, they say "ok"/"thanks",
            or the conversation on this sector winds down), proactively transition to the next pending sector.
            Example: "Now, you also mentioned interest in {next_sector}. Let me tell you about opportunities there..."
            Do NOT rush — finish the current topic first, then transition naturally.
    """)


class PrioritySectorExplorer:
    def __init__(self, sector_search_service: SectorSearchService):
        self._sector_search = sector_search_service
        self._llm_config = LLMConfig(
            generation_config=LOW_TEMPERATURE_GENERATION_CONFIG
            | JSON_GENERATION_CONFIG
            | with_response_schema(_PrioritySectorResponse)
        )
        self._llm_caller = LLMCaller[_PrioritySectorResponse](model_response_type=_PrioritySectorResponse)
        self._logger = logging.getLogger(self.__class__.__name__)

    async def explore(
        self,
        user_input: str,
        context,
        pending_sectors: list[dict] | None = None,
    ) -> tuple[str, bool, str, list[LLMStats], dict | None]:
        chunks = await self._sector_search.search(query=user_input, k=5)
        retrieved = _format_chunks(chunks)
        full_instructions = _build_base_instructions(retrieved)
        full_instructions += _build_pending_sectors_section(pending_sectors)

        self._logger.info(
            "Priority sector RAG for query '%s': found %d chunks",
            user_input,
            len(chunks),
        )
        for i, chunk in enumerate(chunks):
            preview = chunk.text[:200] + "..." if len(chunk.text) > 200 else chunk.text
            self._logger.info("  Chunk %d [%s] (score=%.4f): %s", i + 1, chunk.sector, chunk.score, preview.replace("\n", " "))

        llm = GeminiGenerativeLLM(system_instructions=full_instructions, config=self._llm_config)
        model_response, llm_stats = await self._llm_caller.call_llm(
            llm=llm,
            llm_input=ConversationHistoryFormatter.format_for_agent_generative_prompt(
                model_response_instructions=get_json_response_instructions(),
                context=context,
                user_input=user_input,
            ),
            logger=self._logger,
        )

        if model_response is None:
            error_msg = t("messages", "careerExplorer.errorRetry", "I'm having trouble right now. Could you try again?")
            return error_msg, False, "", llm_stats, None

        metadata = None
        if model_response.quick_reply_options:
            metadata = {"quick_reply_options": [opt.model_dump() for opt in model_response.quick_reply_options]}
        return (
            model_response.message.strip('"'),
            model_response.finished,
            model_response.reasoning,
            llm_stats,
            metadata,
        )
