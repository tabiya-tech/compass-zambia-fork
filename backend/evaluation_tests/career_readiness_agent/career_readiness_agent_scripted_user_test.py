import logging
import os
from dataclasses import dataclass, field

import pytest

from app.i18n.translation_service import get_i18n_manager
from app.i18n.types import Locale
from evaluation_tests.conversation_libs.conversation_generator import generate
from evaluation_tests.conversation_libs.conversation_test_function import ScriptedSimulatedUser
from evaluation_tests.conversation_libs.evaluators.evaluation_result import Actor, ConversationRecord
from evaluation_tests.career_readiness_agent.career_readiness_agent_executors import (
    CareerReadinessExecutor,
    CareerReadinessGetConversationContextExecutor,
    CareerReadinessIsFinished,
)
from app.conversation_memory.save_conversation_context import (
    save_conversation_context_to_json,
    save_conversation_context_to_markdown,
)


@dataclass
class CareerReadinessTestCase:
    """Test case with scripted user messages and expected phrases from module content."""
    name: str
    module_id: str
    scripted_user: list[str]
    description: str
    expected_phrases_by_turn: list[list[str]] = field(default_factory=list)
    """
    For each agent response (after welcome), at least one phrase in the list must appear.
    Turn 0 = welcome message (skipped). Turn 1 = response to scripted_user[0], etc.
    """


TEST_CASES = [
    CareerReadinessTestCase(
        name="professional_identity_basics",
        module_id="professional-identity",
        description="Student explores professional identity concepts with partial knowledge",
        scripted_user=[
            "I'm not really sure, maybe it's just about what job I have?",
            "I think skills are things like using computers and being good with people",
        ],
        expected_phrases_by_turn=[
            ["professional identity", "values", "skills", "experiences", "aspirations", "career"],
            ["technical", "transferable", "knowledge", "communication", "problem-solving", "categories", "types"],
        ],
    ),
    CareerReadinessTestCase(
        name="cv_development_structure",
        module_id="cv-development",
        description="Student explores CV development with partial knowledge of structure",
        scripted_user=[
            "I think it's like a list of jobs I've had, right?",
            "Maybe I should start with my name and then write about what I did at my jobs?",
        ],
        expected_phrases_by_turn=[
            ["CV", "education", "experience", "skills", "achievements", "employers", "document", "summarize"],
            ["contact", "personal statement", "professional summary", "work experience", "education", "structure",
             "sections", "skills", "accomplishments", "qualifications", "organize"],
        ],
    ),
    CareerReadinessTestCase(
        name="interview_preparation_types",
        module_id="interview-preparation",
        description="Student explores interview types and the STAR method",
        scripted_user=[
            "I've only done face-to-face interviews, I don't know much about other types",
            "In the behavioral one, you describe what happened at a past job?",
        ],
        expected_phrases_by_turn=[
            ["structured", "behavioral", "situational", "panel", "types", "interview"],
            ["STAR", "Situation", "Task", "Action", "Result", "method"],
        ],
    ),
]


def _agent_responses(conversation: list[ConversationRecord]) -> list[str]:
    return [r.message for r in conversation if r.actor == Actor.EVALUATED_AGENT]


def _assert_module_content(conversation: list[ConversationRecord], test_case: CareerReadinessTestCase) -> None:
    agent_responses = _agent_responses(conversation)
    assert len(agent_responses) >= 1, "Expected at least one agent response"
    for i, expected_phrases in enumerate(test_case.expected_phrases_by_turn):
        response_index = i + 1
        if response_index >= len(agent_responses):
            break
        response_text = agent_responses[response_index].lower()
        found = any(phrase.lower() in response_text for phrase in expected_phrases)
        excerpt = agent_responses[response_index][:400] + "..." if len(
            agent_responses[response_index]) > 400 else agent_responses[response_index]
        assert found, (
            f"Agent response to '{test_case.scripted_user[i]}' should contain "
            f"at least one of {expected_phrases} but got: {excerpt}"
        )


@pytest.mark.asyncio
@pytest.mark.evaluation_test("gemini-2.5-flash-lite/")
@pytest.mark.parametrize("test_case", TEST_CASES, ids=[tc.name for tc in TEST_CASES])
async def test_career_readiness_scripted(evals_setup, setup_multi_locale_app_config,
                                         test_case: CareerReadinessTestCase):
    """
    Scripted conversation test for the Career Readiness agent.
    Asserts agent responses include relevant module content phrases.
    """
    logging.info("Running Career Readiness test case: %s", test_case.name)
    get_i18n_manager().set_locale(Locale.EN_US)

    executor = CareerReadinessExecutor(module_id=test_case.module_id)
    max_iterations = len(test_case.scripted_user) + 1

    conversation = await generate(
        max_iterations=max_iterations,
        execute_evaluated_agent=executor,
        execute_simulated_user=ScriptedSimulatedUser(script=test_case.scripted_user),
        is_finished=CareerReadinessIsFinished(),
    )

    _assert_module_content(conversation, test_case)

    output_folder = os.path.join(
        os.getcwd(),
        "test_output",
        "career_readiness_agent",
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

    context = await CareerReadinessGetConversationContextExecutor(executor)()
    ctx_path = os.path.join(output_folder, f"{base_name}_context")
    save_conversation_context_to_json(context=context, file_path=ctx_path + ".json")
    save_conversation_context_to_markdown(
        title=f"Career Readiness: {test_case.name}",
        context=context,
        file_path=ctx_path + ".md",
    )
