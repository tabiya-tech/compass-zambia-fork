"""
LLM-based classifier that decides whether user input relates to priority sectors
or non-priority sectors. Replaces RAG score threshold to avoid embedding bias.
"""

import logging
from enum import Enum
from textwrap import dedent

from pydantic import BaseModel, Field

from app.agent.config import AgentsConfig
from app.agent.llm_caller import LLMCaller
from app.app_config import get_application_config
from app.conversation_memory.conversation_formatter import ConversationHistoryFormatter
from app.conversation_memory.conversation_memory_manager import ConversationContext
from common_libs.llm.generative_models import GeminiGenerativeLLM
from common_libs.llm.models_utils import LLMConfig, ZERO_TEMPERATURE_GENERATION_CONFIG, JSON_GENERATION_CONFIG
from common_libs.llm.schema_builder import with_response_schema

MAX_REASONING_LENGTH = 150

class SectorRelevance(str, Enum):
    PRIORITY_SECTOR = "PRIORITY_SECTOR"
    NON_PRIORITY_SECTOR = "NON_PRIORITY_SECTOR"


class SectorRelevanceClassification(BaseModel):
    relevance: SectorRelevance
    reasoning: str = Field(default="")

    class Config:
        extra = "forbid"


def _build_classifier_instructions() -> str:
    config = get_application_config()
    sectors = config.career_explorer_config.sectors
    sector_names = [s["name"] for s in sectors] if sectors else []
    sector_list_str = ", ".join(sector_names) if sector_names else "the priority sectors"
    country_name = config.career_explorer_config.country

    return dedent(f"""\
        Classify whether the user's message is about careers in one of {country_name}'s priority sectors or about careers outside them.

        Priority sectors: {sector_list_str}

        Return PRIORITY_SECTOR if the user is asking about, expressing interest in, or discussing careers in any of these sectors (or closely related sub-fields, e.g. irrigation within Agriculture, solar within Energy).
        Return NON_PRIORITY_SECTOR if the user is asking about careers in other sectors (e.g. aeronautical engineering, IT, healthcare) or general career topics not covered by the priority sectors.

        Be inclusive: if the user mentions multiple sectors and at least one is a priority sector, return PRIORITY_SECTOR.
        Keep reasoning under {MAX_REASONING_LENGTH} characters.
        """)


class SectorRelevanceClassifier:
    def __init__(self):
        self._llm_config = LLMConfig(
            language_model_name=AgentsConfig.deep_reasoning_model,
            generation_config=ZERO_TEMPERATURE_GENERATION_CONFIG
            | JSON_GENERATION_CONFIG
            | with_response_schema(SectorRelevanceClassification),
        )
        self._llm_caller = LLMCaller[SectorRelevanceClassification](model_response_type=SectorRelevanceClassification)
        self._logger = logging.getLogger(self.__class__.__name__)

    async def classify(
        self,
        user_input: str,
        context: ConversationContext,
    ) -> tuple[SectorRelevance, str, list]:
        llm = GeminiGenerativeLLM(
            system_instructions=_build_classifier_instructions(),
            config=self._llm_config,
        )
        result, stats = await self._llm_caller.call_llm(
            llm=llm,
            llm_input=ConversationHistoryFormatter.format_for_agent_generative_prompt(
                model_response_instructions="Classify the user's message. Return JSON with relevance and reasoning.",
                context=context,
                user_input=user_input,
            ),
            logger=self._logger,
        )
        if result is None:
            self._logger.warning("Sector relevance classification failed, defaulting to NON_PRIORITY_SECTOR")
            return SectorRelevance.NON_PRIORITY_SECTOR, "", stats
        reasoning = (result.reasoning or "")[:MAX_REASONING_LENGTH]
        self._logger.info(
            "Sector relevance for '%s': %s (%s)",
            user_input[:50],
            result.relevance.value,
            reasoning,
        )
        return result.relevance, reasoning, stats
