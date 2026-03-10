from app.agent.agent_types import AgentInput, AgentOutput
from app.agent.ask_me_anything_agent import AskMeAnythingAgent
from app.conversation_memory.conversation_memory_types import (
    ConversationContext,
    ConversationHistory,
    ConversationTurn,
)


class AskMeAnythingExecutor:
    """
    Executes the Ask Me Anything agent with a simple in-memory conversation history.
    """

    def __init__(self):
        self._agent = AskMeAnythingAgent()
        self._turns: list[ConversationTurn] = []
        self._agent_outputs: list[AgentOutput] = []
        self._is_first_call = True

    def _build_context(self) -> ConversationContext:
        history = ConversationHistory(turns=list(self._turns))
        return ConversationContext(all_history=history, history=history)

    async def __call__(self, agent_input: AgentInput) -> AgentOutput:
        context = self._build_context()
        
        if self._is_first_call and (not agent_input.message or agent_input.message.strip() == "" or agent_input.message == "(silence)"):
            agent_output = await self._agent.generate_intro_message(context)
            self._is_first_call = False
        else:
            agent_output = await self._agent.execute(agent_input, context)
            self._is_first_call = False
        
        turn = ConversationTurn(
            index=len(self._turns),
            input=agent_input,
            output=agent_output,
        )
        self._turns.append(turn)
        self._agent_outputs.append(agent_output)
        return agent_output
    
    def get_agent_outputs(self) -> list[AgentOutput]:
        """Get all agent outputs for accessing metadata."""
        return self._agent_outputs


class AskMeAnythingIsFinished:
    """
    AMA agent conversation is open-ended, so we stop after a fixed script length.
    """

    def __call__(self, agent_output: AgentOutput) -> bool:
        return agent_output.finished


class AskMeAnythingGetConversationContextExecutor:
    """
    Returns the conversation context for the AMA eval.
    """

    def __init__(self, executor: AskMeAnythingExecutor):
        self._executor = executor

    async def __call__(self) -> ConversationContext:
        return self._executor._build_context()
