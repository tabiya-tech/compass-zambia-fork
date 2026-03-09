import logging
import time
from textwrap import dedent

from app.agent.agent import Agent
from app.agent.agent_types import AgentInput, AgentOutput, AgentType, LLMStats, AgentOutputWithReasoning
from app.agent.llm_caller import LLMCaller
from app.agent.prompt_template.locale_style import get_language_style
from app.agent.prompt_template.agent_prompt_template import STD_AGENT_CHARACTER
from app.agent.simple_llm_agent.llm_response import ModelResponse
from app.agent.simple_llm_agent.prompt_response_template import get_json_response_instructions, \
    get_conversation_finish_instructions
from app.conversation_memory.conversation_formatter import ConversationHistoryFormatter
from app.conversation_memory.conversation_memory_manager import ConversationContext
from app.app_config import get_application_config
from app.i18n.translation_service import t
from common_libs.llm.generative_models import GeminiGenerativeLLM
from common_libs.llm.models_utils import LLMConfig, LOW_TEMPERATURE_GENERATION_CONFIG, JSON_GENERATION_CONFIG
from common_libs.llm.schema_builder import with_response_schema

from .sector_search_service import SectorChunkEntity, SectorSearchService


def _get_sectors_list() -> str:
    config = get_application_config()
    sectors = config.career_explorer_sectors
    if not sectors:
        return ""
    return "\n".join(f"{s['name']} — {s.get('description', '')}" for s in sectors)


def _get_welcome_message() -> str:
    config = get_application_config()
    sectors = config.career_explorer_sectors
    sectors_list = _get_sectors_list()
    country_name = config.default_country_of_user.value
    return t(
        "messages",
        "careerExplorer.welcomeMessage",
        "Welcome to the Career Explorer! Based on {country}'s development priorities, there are {sector_count} key sectors where TEVET graduates are in high demand:\n\n{sectors_list}\n\nWhich sector interests you most?",
        country=country_name,
        sector_count=len(sectors) if sectors else 0,
        sectors_list=sectors_list,
    )


def _build_base_instructions(retrieved_content: str) -> str:
    config = get_application_config()
    sectors = config.career_explorer_sectors
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
        </system_instructions>
    """).format(sector_list_str=sector_list_str, retrieved_content=retrieved_content)


def _format_chunks(chunks: list[SectorChunkEntity]) -> str:
    if not chunks:
        config = get_application_config()
        sectors = config.career_explorer_sectors
        sector_names = [s["name"] for s in sectors] if sectors else []
        sector_list_str = ", ".join(sector_names) if sector_names else "the priority sectors"
        return f"(No relevant content found. Suggest the user pick a sector or ask a question related to {sector_list_str}.)"
    parts = []
    for c in chunks:
        parts.append(f"[{c.sector}]\n{c.text}")
    return "\n\n---\n\n".join(parts)


def _construct_output(
        message: str,
        finished: bool,
        agent_start: float,
        reasoning: str = "",
        llm_stats: list[LLMStats] | None = None,
) -> AgentOutput:
    return AgentOutputWithReasoning(
        message_for_user=message,
        finished=finished,
        reasoning=reasoning,
        agent_type=AgentType.CAREER_EXPLORER_AGENT,
        agent_response_time_in_sec=round(time.time() - agent_start, 2),
        llm_stats=llm_stats or [],
    )


class CareerExplorerAgent(Agent):
    def __init__(self, sector_search_service: SectorSearchService):
        super().__init__(
            agent_type=AgentType.CAREER_EXPLORER_AGENT,
            is_responsible_for_conversation_history=False,
        )
        self._sector_search = sector_search_service
        self._llm_config = LLMConfig(
            generation_config=LOW_TEMPERATURE_GENERATION_CONFIG
                              | JSON_GENERATION_CONFIG
                              | with_response_schema(ModelResponse)
        )
        self._llm_caller = LLMCaller[ModelResponse](model_response_type=ModelResponse)
        self._logger = logging.getLogger(self.__class__.__name__)

    def _get_base_instructions(self, retrieved_content: str) -> str:
        return _build_base_instructions(retrieved_content)

    async def execute(self, user_input: AgentInput, context: ConversationContext) -> AgentOutput:
        agent_start = time.time()

        msg = (user_input.message or "").strip()
        if msg in ("", "(silence)"):
            return _construct_output(
                _get_welcome_message(),
                finished=False,
                agent_start=agent_start,
            )

        chunks = await self._sector_search.search(query=msg, k=5)
        self._logger.info(
            "RAG search for query '%s': found %d chunks",
            msg,
            len(chunks),
        )
        for i, chunk in enumerate(chunks):
            preview = chunk.text[:200] + "..." if len(chunk.text) > 200 else chunk.text
            self._logger.info(
                "  Chunk %d [%s] (score=%.4f): %s",
                i + 1,
                chunk.sector,
                chunk.score,
                preview.replace("\n", " "),
            )
        retrieved = _format_chunks(chunks)
        full_instructions = self._get_base_instructions(retrieved_content=retrieved)

        llm = GeminiGenerativeLLM(system_instructions=full_instructions, config=self._llm_config)
        model_response, llm_stats = await self._llm_caller.call_llm(
            llm=llm,
            llm_input=ConversationHistoryFormatter.format_for_agent_generative_prompt(
                model_response_instructions=get_json_response_instructions(),
                context=context,
                user_input=msg,
            ),
            logger=self._logger,
        )

        if model_response is None:
            error_msg = t(
                "messages",
                "careerExplorer.errorRetry",
                "I'm having trouble right now. Could you try again?",
            )
            model_response = ModelResponse(
                reasoning="Error",
                message=error_msg,
                finished=False,
            )

        return _construct_output(
            model_response.message.strip('"'),
            finished=model_response.finished,
            agent_start=agent_start,
            reasoning=model_response.reasoning,
            llm_stats=llm_stats,
        )
