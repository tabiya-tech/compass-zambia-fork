"""
Career readiness agent that chats with users grounded in module content.

Uses composition to wrap a SimpleLLMAgent — this agent is standalone and is
NOT part of the AgentDirector pipeline.
"""
import logging
import time
from textwrap import dedent

from app.agent.agent_types import AgentInput, AgentOutput, AgentType, LLMStats, AgentOutputWithReasoning
from app.agent.llm_caller import LLMCaller
from app.agent.prompt_template.locale_style import get_language_style
from app.agent.simple_llm_agent.llm_response import ModelResponse
from app.agent.simple_llm_agent.prompt_response_template import (
    get_json_response_instructions,
    get_conversation_finish_instructions,
)
from app.conversation_memory.conversation_formatter import ConversationHistoryFormatter
from app.conversation_memory.conversation_memory_types import ConversationContext
from common_libs.llm.generative_models import GeminiGenerativeLLM
from common_libs.llm.models_utils import LLMConfig, LOW_TEMPERATURE_GENERATION_CONFIG, JSON_GENERATION_CONFIG
from common_libs.llm.schema_builder import with_response_schema


def _build_system_instructions(module_title: str, module_content: str) -> str:
    """Build the system instructions for the career readiness agent."""
    response_part = get_json_response_instructions()
    finish_instructions = get_conversation_finish_instructions(
        dedent("""Once the user explicitly indicates they are done or have no more questions about this topic""")
    )
    language_style = get_language_style(with_locale=False, for_json_output=True)

    template = dedent("""\
        You are a career readiness coach specialising in "{module_title}".
        Your role is to help the user develop practical skills and knowledge related to this topic.

        # Grounding Content
        Use the following content as your primary knowledge base for this conversation.
        Always ground your responses in this material. Do not invent facts or techniques
        that are not supported by the content below.

        {module_content}

        # Instructions
        - Guide the user step by step through the topic.
        - Be encouraging, supportive, and practical.
        - Provide concrete examples and actionable advice grounded in the content above.
        - Ask follow-up questions to understand the user's situation and tailor your guidance.
        - Keep responses concise and focused (under 200 words per message).
        - Do not make things up. If the user asks something outside the scope of the grounding content,
          politely redirect them to the topics you can help with.
        - Do not format or style your response with markdown.

        {language_style}

        {response_part}

        {finish_instructions}
        """)

    return template.format(
        module_title=module_title,
        module_content=module_content,
        language_style=language_style,
        response_part=response_part,
        finish_instructions=finish_instructions,
    )


class CareerReadinessAgent:
    """
    AI agent that coaches users on a specific career readiness module.

    Uses composition — wraps a GeminiGenerativeLLM + LLMCaller rather than
    inheriting from Agent/SimpleLLMAgent, because this agent operates outside
    the AgentDirector pipeline.
    """

    def __init__(self, module_title: str, module_content: str):
        self._logger = logging.getLogger(CareerReadinessAgent.__name__)
        self._system_instructions = _build_system_instructions(module_title, module_content)
        config = LLMConfig(
            generation_config=LOW_TEMPERATURE_GENERATION_CONFIG | JSON_GENERATION_CONFIG | with_response_schema(
                ModelResponse)
        )
        self._llm = GeminiGenerativeLLM(system_instructions=self._system_instructions, config=config)
        self._llm_caller: LLMCaller[ModelResponse] = LLMCaller[ModelResponse](model_response_type=ModelResponse)

    @property
    def system_instructions(self) -> str:
        return self._system_instructions

    async def execute(self, user_input: AgentInput, context: ConversationContext) -> AgentOutput:
        """
        Process user input and return the agent's response.

        :param user_input: The user's message
        :param context: The conversation context with history
        :return: The agent's output
        """
        agent_start_time = time.time()

        msg = user_input.message.strip()
        if msg == "":
            msg = "(silence)"

        model_response: ModelResponse | None
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
            self._logger.exception("An error occurred while calling the LLM: %s", e)
            model_response = None
            llm_stats_list = []

        if model_response is None:
            model_response = ModelResponse(
                reasoning="Failed to get a response",
                message="I am facing some difficulties right now, could you please repeat what you said?",
                finished=False,
            )

        agent_end_time = time.time()
        return AgentOutputWithReasoning(
            message_for_user=model_response.message.strip('"'),
            finished=model_response.finished,
            reasoning=model_response.reasoning,
            agent_type=AgentType.CAREER_READINESS_AGENT,
            agent_response_time_in_sec=round(agent_end_time - agent_start_time, 2),
            llm_stats=llm_stats_list,
        )

    async def generate_intro_message(self, context: ConversationContext) -> AgentOutput:
        """
        Generate the introductory message for a new conversation.

        Sends an artificial "(silence)" input to trigger the agent's greeting.

        :param context: An empty conversation context
        :return: The agent's introductory output
        """
        artificial_input = AgentInput(
            message="(silence)",
            is_artificial=True,
        )
        return await self.execute(artificial_input, context)
