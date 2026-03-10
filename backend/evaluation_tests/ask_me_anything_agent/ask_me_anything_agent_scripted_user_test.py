import logging
import os
from dataclasses import dataclass, field

import pytest

from app.agent.constants import PlatformRoute, VALID_PLATFORM_ROUTES
from app.i18n.translation_service import get_i18n_manager
from app.i18n.types import Locale
from evaluation_tests.conversation_libs.conversation_generator import generate
from evaluation_tests.conversation_libs.conversation_test_function import ScriptedSimulatedUser
from evaluation_tests.conversation_libs.evaluators.evaluation_result import Actor, ConversationRecord
from evaluation_tests.ask_me_anything_agent.ask_me_anything_agent_executors import (
    AskMeAnythingExecutor,
    AskMeAnythingGetConversationContextExecutor,
    AskMeAnythingIsFinished,
)
from app.conversation_memory.save_conversation_context import (
    save_conversation_context_to_json,
    save_conversation_context_to_markdown,
)


@dataclass
class AMATestCase:
    """Test case with scripted questions and expected routes in suggested actions."""
    name: str
    scripted_user: list[str]
    description: str
    expected_routes_by_turn: list[list[str]] = field(default_factory=list)
    """
    For each agent response, at least one route in the list must appear in suggested_actions.
    Turn 0 = welcome message. Turn 1 = response to scripted_user[0], etc.
    Routes should be exact paths like "/career-readiness", "/knowledge-hub", etc.
    """


TEST_CASES = [
    AMATestCase(
        name="greeting_and_general_question",
        description="User receives greeting and asks a general question",
        scripted_user=[
            "What can you help me with?",
        ],
        expected_routes_by_turn=[
            VALID_PLATFORM_ROUTES,  # Welcome message can suggest any valid route
            [PlatformRoute.CAREER_READINESS, PlatformRoute.KNOWLEDGE_HUB, PlatformRoute.SKILLS_INTERESTS, PlatformRoute.CAREER_EXPLORER],  # Should suggest relevant modules
        ],
    ),
    AMATestCase(
        name="ask_about_career_readiness",
        description="User asks about career readiness",
        scripted_user=[
            "I want to improve my job readiness",
        ],
        expected_routes_by_turn=[
            VALID_PLATFORM_ROUTES,  # Welcome message can suggest any valid route
            [PlatformRoute.CAREER_READINESS],  # Must suggest career readiness route
        ],
    ),
    AMATestCase(
        name="ask_about_cv_development",
        description="User asks specifically about CV development",
        scripted_user=[
            "How can I create a good CV?",
        ],
        expected_routes_by_turn=[
            VALID_PLATFORM_ROUTES,  # Welcome message can suggest any valid route
            [PlatformRoute.CAREER_READINESS_CV_DEVELOPMENT],  # Must suggest CV development route
        ],
    ),
    AMATestCase(
        name="ask_about_knowledge_hub",
        description="User asks about knowledge hub",
        scripted_user=[
            "What information is available in the knowledge hub?",
        ],
        expected_routes_by_turn=[
            VALID_PLATFORM_ROUTES,  # Welcome message can suggest any valid route
            [PlatformRoute.KNOWLEDGE_HUB],  # Must suggest knowledge hub route
        ],
    ),
    AMATestCase(
        name="ask_about_career_explorer",
        description="User asks about career explorer",
        scripted_user=[
            "I want to explore different careers",
        ],
        expected_routes_by_turn=[
            VALID_PLATFORM_ROUTES,  # Welcome message can suggest any valid route
            [PlatformRoute.CAREER_EXPLORER],  # Must suggest career explorer route
        ],
    ),
    AMATestCase(
        name="ask_about_interview_preparation",
        description="User asks about interview preparation",
        scripted_user=[
            "How can I prepare for job interviews?",
        ],
        expected_routes_by_turn=[
            VALID_PLATFORM_ROUTES,  # Welcome message can suggest any valid route
            [PlatformRoute.CAREER_READINESS_INTERVIEW_PREPARATION],  # Must suggest interview preparation route
        ],
    ),
    AMATestCase(
        name="ask_about_skills_interests",
        description="User asks about skills and interests module",
        scripted_user=[
            "How can I discover my skills?",
        ],
        expected_routes_by_turn=[
            VALID_PLATFORM_ROUTES,  # Welcome message can suggest any valid route
            [PlatformRoute.SKILLS_INTERESTS],  # Must suggest skills & interests route
        ],
    ),
    AMATestCase(
        name="multi_turn_navigation",
        description="User asks multiple questions about different modules",
        scripted_user=[
            "What modules are available?",
            "Tell me about interview preparation",
        ],
        expected_routes_by_turn=[
            VALID_PLATFORM_ROUTES,  # Welcome message can suggest any valid route
            [PlatformRoute.CAREER_READINESS, PlatformRoute.KNOWLEDGE_HUB, PlatformRoute.SKILLS_INTERESTS, PlatformRoute.CAREER_EXPLORER],  # Should suggest multiple modules
            [PlatformRoute.CAREER_READINESS_INTERVIEW_PREPARATION],  # Must suggest interview preparation route
        ],
    ),
    AMATestCase(
        name="random_conversation",
        description="User engages in random, off-topic conversation",
        scripted_user=[
            "How's the weather?",
            "What's your favorite color?",
            "Tell me a joke",
        ],
        expected_routes_by_turn=[
            VALID_PLATFORM_ROUTES,  # Welcome message can suggest any valid route
            VALID_PLATFORM_ROUTES,  # Should still suggest routes despite off-topic question
            VALID_PLATFORM_ROUTES,  # Should still suggest routes despite off-topic question
            VALID_PLATFORM_ROUTES,  # Should still suggest routes despite off-topic question
        ],
    ),
    AMATestCase(
        name="asking_for_advice",
        description="User asks for career advice instead of navigation",
        scripted_user=[
            "What should I do with my career?",
            "I'm confused about my future, can you help?",
        ],
        expected_routes_by_turn=[
            VALID_PLATFORM_ROUTES,  # Welcome message can suggest any valid route
            [PlatformRoute.CAREER_READINESS, PlatformRoute.CAREER_EXPLORER, PlatformRoute.SKILLS_INTERESTS],  # Should suggest relevant modules for career guidance
            [PlatformRoute.CAREER_READINESS, PlatformRoute.CAREER_EXPLORER, PlatformRoute.SKILLS_INTERESTS],  # Should continue suggesting relevant modules
        ],
    ),
    AMATestCase(
        name="cryptic_messages",
        description="User sends deliberately cryptic or unclear messages",
        scripted_user=[
            "???",
            "hmm",
            "idk",
        ],
        expected_routes_by_turn=[
            VALID_PLATFORM_ROUTES,  # Welcome message can suggest any valid route
            VALID_PLATFORM_ROUTES,  # Should handle cryptic messages gracefully and still suggest routes
            VALID_PLATFORM_ROUTES,  # Should handle cryptic messages gracefully
            VALID_PLATFORM_ROUTES,  # Should handle cryptic messages gracefully
        ],
    ),
    AMATestCase(
        name="long_conversation_history",
        description="User has a long conversation with many turns",
        scripted_user=[
            "What can you help with?",
            "Tell me about CVs",
            "What about interviews?",
            "How about cover letters?",
            "What's in the knowledge hub?",
            "Tell me about mining",
            "What about agriculture?",
            "How do I explore careers?",
        ],
        expected_routes_by_turn=[
            VALID_PLATFORM_ROUTES,  # Welcome message can suggest any valid route
            [PlatformRoute.CAREER_READINESS, PlatformRoute.KNOWLEDGE_HUB, PlatformRoute.SKILLS_INTERESTS, PlatformRoute.CAREER_EXPLORER],
            [PlatformRoute.CAREER_READINESS_CV_DEVELOPMENT],
            [PlatformRoute.CAREER_READINESS_INTERVIEW_PREPARATION],
            [PlatformRoute.CAREER_READINESS_COVER_LETTER],
            [PlatformRoute.KNOWLEDGE_HUB],
            [PlatformRoute.KNOWLEDGE_HUB_MINING_PATHWAY],
            [PlatformRoute.KNOWLEDGE_HUB_AGRICULTURE_PATHWAY],
            [PlatformRoute.CAREER_EXPLORER],
        ],
    ),
    AMATestCase(
        name="asking_about_nonexistent_feature",
        description="User asks about features that don't exist",
        scripted_user=[
            "Do you have a job board?",
            "Can you help me find a job?",
        ],
        expected_routes_by_turn=[
            VALID_PLATFORM_ROUTES,  # Welcome message can suggest any valid route
            VALID_PLATFORM_ROUTES,  # Should not suggest non-existent routes, but should still provide helpful response with valid routes
            VALID_PLATFORM_ROUTES,  # Should redirect to available modules
        ],
    ),
    AMATestCase(
        name="empty_and_whitespace_messages",
        description="User sends empty or whitespace-only messages",
        scripted_user=[
            "",
            "   ",
            "What can you help with?",
        ],
        expected_routes_by_turn=[
            VALID_PLATFORM_ROUTES,  # Welcome message can suggest any valid route
            VALID_PLATFORM_ROUTES,  # Should handle empty messages gracefully
            VALID_PLATFORM_ROUTES,  # Should handle whitespace gracefully
            [PlatformRoute.CAREER_READINESS, PlatformRoute.KNOWLEDGE_HUB, PlatformRoute.SKILLS_INTERESTS, PlatformRoute.CAREER_EXPLORER],
        ],
    ),
]


def _extract_suggested_routes(agent_output) -> list[str]:
    """Extract route strings from agent output metadata."""
    if not agent_output.metadata:
        return []
    raw = agent_output.metadata.get("suggested_actions", [])
    routes = []
    for item in raw:
        if isinstance(item, dict) and "route" in item:
            routes.append(item["route"])
    return routes


def _assert_ama_routes(executor: AskMeAnythingExecutor, test_case: AMATestCase) -> None:
    """Assert that agent responses include expected routes in suggested_actions."""
    agent_outputs = executor.get_agent_outputs()
    assert len(agent_outputs) >= len(test_case.expected_routes_by_turn), (
        f"Expected at least {len(test_case.expected_routes_by_turn)} agent responses, "
        f"got {len(agent_outputs)}"
    )
    for i, expected_routes in enumerate(test_case.expected_routes_by_turn):
        if i >= len(agent_outputs):
            break
        agent_output = agent_outputs[i]
        suggested_routes = _extract_suggested_routes(agent_output)
        found = any(route in suggested_routes for route in expected_routes)
        user_message = ""
        if i > 0 and i - 1 < len(test_case.scripted_user):
            user_message = f" (in response to '{test_case.scripted_user[i - 1]}')"
        assert found, (
            f"Agent response {i}{user_message} should suggest at least one of {expected_routes} "
            f"but got suggested routes: {suggested_routes}"
        )


@pytest.mark.asyncio
@pytest.mark.evaluation_test("gemini-2.5-flash-lite/")
@pytest.mark.parametrize("test_case", TEST_CASES, ids=[tc.name for tc in TEST_CASES])
async def test_ask_me_anything_agent(
    evals_setup, setup_multi_locale_app_config, test_case: AMATestCase
):
    """
    Scripted conversation test for the Ask Me Anything agent.
    Asserts agent responses are helpful and suggest relevant platform modules.
    """
    logging.info("Running AMA test case: %s", test_case.name)
    get_i18n_manager().set_locale(Locale.EN_US)

    executor = AskMeAnythingExecutor()
    max_iterations = len(test_case.scripted_user) + 1

    conversation = await generate(
        max_iterations=max_iterations,
        execute_evaluated_agent=executor,
        execute_simulated_user=ScriptedSimulatedUser(script=test_case.scripted_user),
        is_finished=AskMeAnythingIsFinished(),
    )

    _assert_ama_routes(executor, test_case)

    output_folder = os.path.join(
        os.getcwd(),
        "test_output",
        "ask_me_anything_agent",
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

    context = await AskMeAnythingGetConversationContextExecutor(executor)()
    ctx_path = os.path.join(output_folder, f"{base_name}_context")
    save_conversation_context_to_json(context=context, file_path=ctx_path + ".json")
    save_conversation_context_to_markdown(
        title=f"Ask Me Anything: {test_case.name}",
        context=context,
        file_path=ctx_path + ".md",
    )
