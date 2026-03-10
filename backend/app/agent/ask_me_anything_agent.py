"""
Ask Me Anything agent — acts as a platform receptionist.

Composition-based (not inheriting from Agent), operating outside the AgentDirector pipeline.
Knows all platform modules and returns navigation suggestions alongside its response.
"""
import logging
import time
from textwrap import dedent

from pydantic import BaseModel

from app.agent.agent_types import AgentInput, AgentOutput, AgentType, LLMStats, AgentOutputWithReasoning
from app.agent.constants import PLATFORM_MODULES
from app.agent.llm_caller import LLMCaller
from app.agent.prompt_template.locale_style import get_language_style
from app.agent.simple_llm_agent.prompt_response_template import get_json_response_instructions
from app.ask_me_anything.suggested_action import SuggestedAction
from app.conversation_memory.conversation_formatter import ConversationHistoryFormatter
from app.conversation_memory.conversation_memory_types import ConversationContext
from common_libs.llm.generative_models import GeminiGenerativeLLM
from common_libs.llm.models_utils import LLMConfig, LOW_TEMPERATURE_GENERATION_CONFIG, JSON_GENERATION_CONFIG
from common_libs.llm.schema_builder import with_response_schema


class AMAModelResponse(BaseModel):
    """
    Structured LLM response for the AMA agent.

    Field order is intentional: reasoning first (context), finished next, then
    message and suggested_actions last (depend on the above).
    """
    reasoning: str
    """Chain of Thought reasoning"""

    finished: bool
    """Always False for this agent — the conversation is open-ended"""

    message: str
    """The agent's message to the user"""

    suggested_actions: list[SuggestedAction]
    """1–3 platform navigation suggestions relevant to the user's question"""

    class Config:
        extra = "forbid"


def _build_modules_description() -> str:
    lines = []
    for mod in PLATFORM_MODULES:
        lines.append(f'  - "{mod["name"]}" (route: {mod["route"]}): {mod["description"]}')
    return "\n".join(lines)


def _build_system_instructions() -> str:
    response_part = get_json_response_instructions()
    language_style = get_language_style(with_locale=False, for_json_output=True)
    modules_desc = _build_modules_description()

    # Extend the standard response instructions with suggested_actions
    extended_response_part = dedent("""\
        {response_part}

        In addition to the standard fields, your JSON response MUST also include:
            - suggested_actions: A JSON array of 1 to 3 navigation suggestions.
              Each item must have exactly two fields:
                - label: A short, friendly button label (e.g. "Explore Career Readiness")
                - route: The exact frontend route string (e.g. "/career-readiness")
              Only suggest routes from the platform modules listed above.
              Choose the most relevant modules based on what the user is asking about.
              Always include at least one suggestion.
        """).format(response_part=response_part)

    template = dedent("""\
        You are a friendly platform guide for the Compass career platform.
        Your role is to help users understand what the platform offers and direct them
        to the most relevant section for their needs.

        You do NOT need to know the exact content of each module you only need to understand
        what each module does and guide users there when relevant.

        # Platform Modules
        The platform has the following modules. These are the ONLY routes you may suggest:
        {modules_desc}

        # Your Behaviour
        - Greet new users warmly and briefly describe what you can help with.
        - Listen to what the user wants to do or learn, then explain which module(s) are most relevant.
        - Always include 1 to 3 suggested_actions pointing to the most relevant modules.
        - Keep responses short and conversational (under 150 words).
        - Do not invent features that do not exist on the platform.
        - Do not format your message with markdown.
        - The "finished" flag must always be false — this conversation is open-ended.

        {language_style}

        {extended_response_part}
        """)

    return template.format(
        modules_desc=modules_desc,
        language_style=language_style,
        extended_response_part=extended_response_part,
    )


class AskMeAnythingAgent:
    """
    Platform receptionist agent.

    Uses composition — wraps GeminiGenerativeLLM + LLMCaller. Operates outside the
    AgentDirector pipeline, similar to CareerReadinessAgent.
    """

    def __init__(self) -> None:
        self._logger = logging.getLogger(AskMeAnythingAgent.__name__)
        self._system_instructions = _build_system_instructions()
        config = LLMConfig(
            generation_config=(
                LOW_TEMPERATURE_GENERATION_CONFIG
                | JSON_GENERATION_CONFIG
                | with_response_schema(AMAModelResponse)
            )
        )
        self._llm = GeminiGenerativeLLM(system_instructions=self._system_instructions, config=config)
        self._llm_caller: LLMCaller[AMAModelResponse] = LLMCaller[AMAModelResponse](
            model_response_type=AMAModelResponse
        )

    @property
    def system_instructions(self) -> str:
        return self._system_instructions

    async def execute(self, user_input: AgentInput, context: ConversationContext) -> AgentOutput:
        """
        Process user input and return the agent's response with navigation suggestions.

        :param user_input: The user's message
        :param context: Conversation context built from prior history
        :return: AgentOutput carrying the message; suggested_actions stored in metadata
        """
        agent_start_time = time.time()

        msg = user_input.message.strip() or "(silence)"

        model_response: AMAModelResponse | None
        llm_stats_list: list[LLMStats]

        try:
            model_response, llm_stats_list = await self._llm_caller.call_llm(
                llm=self._llm,
                llm_input=ConversationHistoryFormatter.format_for_agent_generative_prompt(
                    model_response_instructions=get_json_response_instructions(),
                    context=context,
                    user_input=msg,
                ),
                logger=self._logger,
            )
        except Exception as e:
            self._logger.exception("Error calling LLM: %s", e)
            model_response = None
            llm_stats_list = []

        if model_response is None:
            model_response = AMAModelResponse(
                reasoning="LLM call failed",
                finished=False,
                message="I'm having some trouble right now. Please try again in a moment.",
                suggested_actions=[
                    SuggestedAction(label="Go to Home", route="/"),
                ],
            )

        agent_end_time = time.time()
        return AgentOutputWithReasoning(
            message_for_user=model_response.message.strip('"'),
            finished=False,  # AMA conversation is always open-ended
            reasoning=model_response.reasoning,
            agent_type=AgentType.ASK_ME_ANYTHING_AGENT,
            agent_response_time_in_sec=round(agent_end_time - agent_start_time, 2),
            llm_stats=llm_stats_list,
            metadata={"suggested_actions": [a.model_dump() for a in model_response.suggested_actions]},
        )

    async def generate_intro_message(self, context: ConversationContext) -> AgentOutput:
        """
        Generate the opening greeting shown when the page loads.

        :param context: An empty conversation context
        :return: The agent's introductory output
        """
        artificial_input = AgentInput(
            message="(silence)",
            is_artificial=True,
        )
        return await self.execute(artificial_input, context)
