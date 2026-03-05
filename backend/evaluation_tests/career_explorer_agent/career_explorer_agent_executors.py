from app.agent.agent_types import AgentInput, AgentOutput
from app.agent.career_explorer_agent.agent import CareerExplorerAgent
from app.agent.career_explorer_agent.sector_search_service import SectorChunkEntity, SectorSearchService
from app.conversation_memory.conversation_memory_types import (
    ConversationContext,
    ConversationHistory,
    ConversationTurn,
)


class MockSectorSearchService:
    """
    Mock search that returns predefined chunks based on query keywords.
    Content matches the embedded markdown files (agriculture.md, mining.md, etc.).
    """

    _SECTOR_CHUNKS = {
        "agriculture": [
            "Agriculture is the largest employer in Zambia. The sector needs professionals who can manage irrigation, crop health, aquaculture, and machinery. Roles include Agricultural Extensionist, Horticulturist, Aquaculture Technician, Farm Machinery Operator. Commercial farms, agri-processing companies like Zambeef, and aquaculture farms are key employers. Central Province is a major commercial farming hub. TEVET qualifications help access higher-paying commercial roles.",
            "Skilled Technicians in Irrigation or Machinery earn K4,000 to K8,000 monthly. Precision Agriculture uses drones and data for crop management. Climate-Smart Agriculture techniques help farm sustainably. Value Addition processing turns raw produce into finished goods like peanut butter and jams.",
        ],
        "mining": [
            "The mining sector is the economic backbone of Zambia. Roles include Heavy Equipment Repair, Driller/Blaster, Mining Surveyor, Ventilation Technician, Geologist. Copperbelt Province has 58.9% of mining employment. Large-scale mining consortiums include Mopani, KCM, FQM, Barrick. Over 48% of mining employees earn above K7,500 per month. Heavy Equipment Repair has a critical shortage of mechanics. Gemstone mines in Lufwanyama extract emeralds.",
            "Skilled Artisans and Technicians in mining earn K6,300 to K15,000+ monthly. The sector offers some of the highest earning potential in Zambia for skilled technical professionals. Mining contractor firms supply equipment maintenance and drilling services.",
        ],
        "energy": [
            "The energy sector in Zambia includes power generation, solar, and renewables. Roles for TEVET graduates include solar technicians, electrical technicians, and power plant operators. The sector is growing with renewable energy projects.",
        ],
        "hospitality": [
            "Hospitality covers hotels, tourism, and safari lodges. TEVET graduates can work as chefs, hotel front desk staff, tour guides, and lodge attendants. The sector supports Zambia's tourism industry.",
        ],
        "water": [
            "The water sector includes treatment, supply, and sanitation. Roles include Water Treatment Plant Operator, Plumbing Technician, and Sanitation Technician. Urban and rural water supply projects create demand for skilled workers.",
        ],
    }

    # mock search implementation that returns relevant chunks from the predefined content based on query keywords
    async def search(
        self,
        *,
        query: str | list[float],
        filter_spec=None,
        k: int = 5,
        sector=None,
    ) -> list[SectorChunkEntity]:
        if isinstance(query, list):
            return []
        q = query.lower().strip()
        if not q:
            return []

        chunks = []
        for sector_key, texts in self._SECTOR_CHUNKS.items():
            if sector_key in q or any(w in q for w in sector_key.split()):
                for j, text in enumerate(texts[:2]):
                    chunks.append(
                        SectorChunkEntity(
                            chunk_id=f"{sector_key}_{j}",
                            sector=sector_key.title(),
                            text=text,
                            score=0.9 - j * 0.1,
                        )
                    )
                break

        if not chunks:
            fallback = (
                "Energy covers power generation and solar. Mining includes copper and gemstones. "
                "Agriculture involves commercial farming. Hospitality covers hotels and tourism. "
                "Water covers treatment and sanitation. Which sector interests you?"
            )
            chunks = [
                SectorChunkEntity(
                    chunk_id="general_0",
                    sector="General",
                    text=fallback,
                    score=0.8,
                )
            ]
        return chunks[:k]


class CareerExplorerExecutor:
    """
    Executes the Career Explorer agent with a simple in-memory conversation history.
    """

    def __init__(self, sector_search_service: SectorSearchService | MockSectorSearchService | None = None):
        self._search = sector_search_service or MockSectorSearchService()
        self._agent = CareerExplorerAgent(sector_search_service=self._search)
        self._turns: list[ConversationTurn] = []

    def _build_context(self) -> ConversationContext:
        history = ConversationHistory(turns=list(self._turns))
        return ConversationContext(all_history=history, history=history, summary="")

    async def __call__(self, agent_input: AgentInput) -> AgentOutput:
        context = self._build_context()
        agent_output = await self._agent.execute(agent_input, context)
        turn = ConversationTurn(
            index=len(self._turns) + 1,
            input=agent_input,
            output=agent_output,
        )
        self._turns.append(turn)
        return agent_output


class CareerExplorerIsFinished:
    """
    Career Explorer has no definitive end; we stop after a fixed script length.
    """

    def __call__(self, agent_output: AgentOutput) -> bool:
        return agent_output.finished


class CareerExplorerGetConversationContextExecutor:
    """
    Returns the conversation context for the Career Explorer eval.
    """

    def __init__(self, executor: CareerExplorerExecutor):
        self._executor = executor

    async def __call__(self) -> ConversationContext:
        return self._executor._build_context()
