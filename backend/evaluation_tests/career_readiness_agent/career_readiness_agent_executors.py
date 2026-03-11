from app.agent.agent_types import AgentInput, AgentOutput
from app.career_readiness.agent import CareerReadinessAgent
from app.career_readiness.module_loader import ModuleRegistry
from app.career_readiness.types import ConversationMode
from app.conversation_memory.conversation_memory_types import (
    ConversationContext,
    ConversationHistory,
    ConversationTurn,
)


class CareerReadinessExecutor:
    """
    Executes the Career Readiness agent with a simple in-memory conversation history.
    """

    def __init__(self, module_id: str, mode: ConversationMode = ConversationMode.INSTRUCTION):
        registry = ModuleRegistry()
        module_config = registry.get_module(module_id)
        if module_config is None:
            raise ValueError(f"Module '{module_id}' not found in registry")
        self._agent = CareerReadinessAgent(
            module_title=module_config.title,
            module_content=module_config.content,
            topics=module_config.topics,
            mode=mode,
        )
        self._turns: list[ConversationTurn] = []
        self._topics_covered_per_turn: list[list[str]] = []

    def _build_context(self) -> ConversationContext:
        history = ConversationHistory(turns=list(self._turns))
        return ConversationContext(all_history=history, history=history, summary="")

    async def __call__(self, agent_input: AgentInput) -> AgentOutput:
        context = self._build_context()
        result = await self._agent.execute(agent_input, context)
        self._topics_covered_per_turn.append(result.topics_covered)
        turn = ConversationTurn(
            index=len(self._turns) + 1,
            input=agent_input,
            output=result.agent_output,
        )
        self._turns.append(turn)
        return result.agent_output


class CareerReadinessIsFinished:
    """
    Checks whether the Career Readiness agent has finished the conversation.
    """

    def __call__(self, agent_output: AgentOutput) -> bool:
        return agent_output.finished


class CareerReadinessGetConversationContextExecutor:
    """
    Returns the conversation context for the Career Readiness eval.
    """

    def __init__(self, executor: CareerReadinessExecutor):
        self._executor = executor

    async def __call__(self) -> ConversationContext:
        return self._executor._build_context()
