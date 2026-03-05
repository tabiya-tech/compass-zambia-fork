import logging
import os
from dataclasses import dataclass, field

import pytest

from app.i18n.translation_service import get_i18n_manager
from app.i18n.types import Locale
from evaluation_tests.conversation_libs.conversation_generator import generate
from evaluation_tests.conversation_libs.conversation_test_function import ScriptedSimulatedUser
from evaluation_tests.conversation_libs.evaluators.evaluation_result import Actor, ConversationRecord
from evaluation_tests.career_explorer_agent.career_explorer_agent_executors import (
    CareerExplorerExecutor,
    CareerExplorerGetConversationContextExecutor,
    CareerExplorerIsFinished,
)
from app.conversation_memory.save_conversation_context import (
    save_conversation_context_to_json,
    save_conversation_context_to_markdown,
)


@dataclass
class SectorContentTestCase:
    """Test case with scripted questions and expected phrases from RAG content."""
    name: str
    scripted_user: list[str]
    description: str
    expected_phrases_by_turn: list[list[str]] = field(default_factory=list)
    """
    For each agent response (after welcome), at least one phrase in the list must appear.
    Turn 0 = welcome message (skipped). Turn 1 = response to scripted_user[0], etc.
    """


TEST_CASES = [
    SectorContentTestCase(
        name="ask_agriculture",
        description="User asks about Agriculture sector",
        scripted_user=[
            "Tell me about Agriculture",
        ],
        expected_phrases_by_turn=[
            ["Agriculture", "irrigation", "Zambeef", "TEVET", "commercial", "aquaculture", "crop"],
        ],
    ),
    SectorContentTestCase(
        name="ask_mining",
        description="User asks about Mining sector",
        scripted_user=[
            "What roles are there in mining?",
        ],
        expected_phrases_by_turn=[
            ["Mining", "Copperbelt", "Barrick", "Heavy Equipment", "gemstone", "K7,500", "Driller"],
        ],
    ),
    SectorContentTestCase(
        name="ask_agriculture_then_mining",
        description="User asks about Agriculture then Mining",
        scripted_user=[
            "I'm interested in Agriculture",
            "What about mining?",
        ],
        expected_phrases_by_turn=[
            ["Agriculture", "irrigation", "Zambeef", "TEVET", "commercial", "aquaculture"],
            ["Mining", "Copperbelt", "Barrick", "Heavy Equipment", "gemstone", "K7,500"],
        ],
    ),
]


def _agent_responses(conversation: list[ConversationRecord]) -> list[str]:
    return [r.message for r in conversation if r.actor == Actor.EVALUATED_AGENT]


def _assert_rag_content(conversation: list[ConversationRecord], test_case: SectorContentTestCase) -> None:
    agent_responses = _agent_responses(conversation)
    assert len(agent_responses) >= 1, "Expected at least one agent response"
    for i, expected_phrases in enumerate(test_case.expected_phrases_by_turn):
        response_index = i + 1
        if response_index >= len(agent_responses):
            break
        response_text = agent_responses[response_index].lower()
        found = any(phrase.lower() in response_text for phrase in expected_phrases)
        excerpt = agent_responses[response_index][:400] + "..." if len(agent_responses[response_index]) > 400 else agent_responses[response_index]
        assert found, (
            f"Agent response to '{test_case.scripted_user[i]}' should contain "
            f"at least one of {expected_phrases} but got: {excerpt}"
        )


@pytest.mark.asyncio
@pytest.mark.evaluation_test("gemini-2.5-flash-lite/")
@pytest.mark.parametrize("test_case", TEST_CASES, ids=[tc.name for tc in TEST_CASES])
async def test_career_explorer_sector_content(evals_setup, setup_multi_locale_app_config, test_case: SectorContentTestCase):
    """
    Scripted conversation test. Asserts agent responses include content from the
    embedded sector markdown files (simulated via mock RAG).
    """
    logging.info("Running Career Explorer test case: %s", test_case.name)
    get_i18n_manager().set_locale(Locale.EN_US)

    executor = CareerExplorerExecutor()
    max_iterations = len(test_case.scripted_user) + 1

    conversation = await generate(
        max_iterations=max_iterations,
        execute_evaluated_agent=executor,
        execute_simulated_user=ScriptedSimulatedUser(script=test_case.scripted_user),
        is_finished=CareerExplorerIsFinished(),
    )

    _assert_rag_content(conversation, test_case)

    output_folder = os.path.join(
        os.getcwd(),
        "test_output",
        "career_explorer_agent",
        "scripted",
        test_case.name,
    )
    os.makedirs(output_folder, exist_ok=True)

    from datetime import datetime, timezone
    time_now = datetime.now(timezone.utc).isoformat()
    base_name = f"{test_case.name}_{time_now}"

    from evaluation_tests.conversation_libs.evaluators.evaluation_result import ConversationEvaluationRecord
    record = ConversationEvaluationRecord(
        simulated_user_prompt=test_case.description,
        test_case=test_case.name,
    )
    record.add_conversation_records(conversation)
    record.save_data(folder=output_folder, base_file_name=base_name)

    context = await CareerExplorerGetConversationContextExecutor(executor)()
    ctx_path = os.path.join(output_folder, f"{base_name}_context")
    save_conversation_context_to_json(context=context, file_path=ctx_path + ".json")
    save_conversation_context_to_markdown(
        title=f"Career Explorer: {test_case.name}",
        context=context,
        file_path=ctx_path + ".md",
    )
