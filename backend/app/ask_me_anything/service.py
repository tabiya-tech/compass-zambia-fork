"""
Service layer for the Ask Me Anything module.

Stateless — no database persistence. The client holds conversation history and
sends it with each request. This service builds ConversationContext from the
client-supplied history, calls the agent, and returns the updated message list.
"""
import logging
from datetime import datetime, timezone

from bson import ObjectId

from app.agent.agent_types import AgentInput, AgentOutput
from app.agent.ask_me_anything_agent import AskMeAnythingAgent
from app.ask_me_anything.types import (
    AMAConversationResponse,
    AMAMessage,
    AMAMessageSender,
    SuggestedAction,
)
from app.conversation_memory.conversation_memory_types import (
    ConversationContext,
    ConversationHistory,
    ConversationTurn,
)


def _build_conversation_context(history: list[AMAMessage]) -> ConversationContext:
    """
    Build a ConversationContext from the client-supplied message history.

    Pairs USER+AGENT messages into ConversationTurns. Unpaired messages
    (e.g. the agent's intro greeting) are skipped.
    """
    turns: list[ConversationTurn] = []
    index = 0
    i = 0

    while i < len(history):
        msg = history[i]

        # Skip standalone AGENT messages (e.g. intro message with no prior user turn)
        if msg.sender == AMAMessageSender.AGENT:
            i += 1
            continue

        # Pair USER message with the following AGENT message
        if (
            msg.sender == AMAMessageSender.USER
            and i + 1 < len(history)
            and history[i + 1].sender == AMAMessageSender.AGENT
        ):
            user_msg = msg
            agent_msg = history[i + 1]
            turns.append(
                ConversationTurn(
                    index=index,
                    input=AgentInput(
                        message_id=user_msg.message_id,
                        message=user_msg.message,
                        sent_at=user_msg.sent_at,
                    ),
                    output=AgentOutput(
                        message_id=agent_msg.message_id,
                        message_for_user=agent_msg.message,
                        finished=False,
                        agent_response_time_in_sec=0,
                        llm_stats=[],
                        sent_at=agent_msg.sent_at,
                    ),
                )
            )
            index += 1
            i += 2
        else:
            i += 1

    history_obj = ConversationHistory(turns=turns)
    return ConversationContext(all_history=history_obj, history=history_obj)


def _extract_suggested_actions(agent_output: AgentOutput) -> list[SuggestedAction]:
    """Extract suggested_actions from agent output metadata."""
    if not agent_output.metadata:
        return []
    raw = agent_output.metadata.get("suggested_actions", [])
    actions = []
    for item in raw:
        try:
            actions.append(SuggestedAction(label=item["label"], route=item["route"]))
        except (KeyError, TypeError):
            pass
    return actions


class AskMeAnythingService:
    """
    Stateless service for the AMA agent.

    No repository — conversation history is owned by the client and supplied
    on every request.
    """

    def __init__(self, agent: AskMeAnythingAgent | None = None) -> None:
        self._agent = agent or AskMeAnythingAgent()
        self._logger = logging.getLogger(AskMeAnythingService.__name__)

    async def start_conversation(self) -> AMAConversationResponse:
        """
        Start a new AMA conversation.

        Generates the agent's greeting message and returns a fresh conversation_id.
        No database writes occur.
        """
        empty_context = ConversationContext(
            all_history=ConversationHistory(),
            history=ConversationHistory(),
        )
        intro_output = await self._agent.generate_intro_message(empty_context)

        conversation_id = str(ObjectId())
        now = datetime.now(timezone.utc)

        intro_message = AMAMessage(
            message_id=intro_output.message_id or str(ObjectId()),
            message=intro_output.message_for_user,
            sender=AMAMessageSender.AGENT,
            sent_at=intro_output.sent_at or now,
            suggested_actions=_extract_suggested_actions(intro_output),
        )

        return AMAConversationResponse(
            conversation_id=conversation_id,
            messages=[intro_message],
        )

    async def send_message(
        self,
        conversation_id: str,
        user_input: str,
        history: list[AMAMessage],
    ) -> AMAConversationResponse:
        """
        Process a user message and return the updated conversation.

        :param conversation_id: The conversation identifier (used to group messages client-side)
        :param user_input: The user's latest message
        :param history: Full prior conversation history supplied by the client
        :return: Updated message list including the new user message and agent response
        """
        now = datetime.now(timezone.utc)

        user_message = AMAMessage(
            message_id=str(ObjectId()),
            message=user_input,
            sender=AMAMessageSender.USER,
            sent_at=now,
        )

        all_messages = list(history) + [user_message]
        context = _build_conversation_context(all_messages)

        agent_input = AgentInput(message=user_input, sent_at=now)
        agent_output = await self._agent.execute(agent_input, context)

        agent_message = AMAMessage(
            message_id=agent_output.message_id or str(ObjectId()),
            message=agent_output.message_for_user,
            sender=AMAMessageSender.AGENT,
            sent_at=agent_output.sent_at or now,
            suggested_actions=_extract_suggested_actions(agent_output),
        )

        return AMAConversationResponse(
            conversation_id=conversation_id,
            messages=all_messages + [agent_message],
        )
