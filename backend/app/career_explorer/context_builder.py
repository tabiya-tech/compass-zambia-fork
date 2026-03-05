from app.agent.agent_types import AgentInput, AgentOutput
from app.career_explorer.types import CareerExplorerMessage, CareerExplorerMessageSender
from app.conversation_memory.conversation_memory_types import (
    ConversationContext,
    ConversationHistory,
    ConversationTurn,
)
from app.conversation_memory.summarizer import Summarizer
from app.server_config import UNSUMMARIZED_WINDOW_SIZE, TO_BE_SUMMARIZED_WINDOW_SIZE


def _messages_to_turns(messages: list[CareerExplorerMessage]) -> list[ConversationTurn]:
    turns: list[ConversationTurn] = []
    idx = 0
    i = 0
    while i < len(messages):
        msg = messages[i]
        if msg.sender == CareerExplorerMessageSender.AGENT and (
            i + 1 >= len(messages) or messages[i + 1].sender != CareerExplorerMessageSender.USER
        ):
            i += 1
            continue
        if (
            msg.sender == CareerExplorerMessageSender.USER
            and i + 1 < len(messages)
            and messages[i + 1].sender == CareerExplorerMessageSender.AGENT
        ):
            agent_msg = messages[i + 1]
            turns.append(
                ConversationTurn(
                    index=idx,
                    input=AgentInput(
                        message_id=msg.message_id,
                        message=msg.message,
                        sent_at=msg.sent_at,
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
            idx += 1
            i += 2
        else:
            i += 1
    return turns


async def build_windowed_context(
    messages: list[CareerExplorerMessage],
    summary: str = "",
    num_turns_summarized: int = 0,
    unsummarized_window_size: int = UNSUMMARIZED_WINDOW_SIZE,
    to_be_summarized_window_size: int = TO_BE_SUMMARIZED_WINDOW_SIZE,
) -> tuple[ConversationContext, str, int]:
    turns = _messages_to_turns(messages)
    total_window = unsummarized_window_size + to_be_summarized_window_size

    if len(turns) <= total_window:
        history = ConversationHistory(turns=turns)
        return (
            ConversationContext(all_history=history, history=history, summary=""),
            summary,
            num_turns_summarized,
        )

    to_summarize_count = len(turns) - total_window
    to_summarize_turns = turns[0:to_summarize_count]
    recent_turns = turns[to_summarize_count:]

    summarizer = Summarizer()
    turns_already_in_summary = min(num_turns_summarized, len(to_summarize_turns))
    new_turns_to_summarize = to_summarize_turns[turns_already_in_summary:]

    if new_turns_to_summarize:
        current_summary = summary
        for batch_start in range(0, len(new_turns_to_summarize), to_be_summarized_window_size):
            batch = new_turns_to_summarize[
                batch_start : batch_start + to_be_summarized_window_size
            ]
            ctx = ConversationContext(
                all_history=ConversationHistory(turns=[]),
                history=ConversationHistory(turns=batch),
                summary=current_summary,
            )
            current_summary = await summarizer.summarize(ctx)
        summary = current_summary
        num_turns_summarized = len(to_summarize_turns)

    history = ConversationHistory(turns=recent_turns)
    all_history = ConversationHistory(turns=turns)
    return (
        ConversationContext(
            all_history=all_history,
            history=history,
            summary=summary,
        ),
        summary,
        num_turns_summarized,
    )
