"""
Evaluation tests for SectorRelevanceClassifier.
Asserts the LLM correctly classifies user input as PRIORITY_SECTOR or NON_PRIORITY_SECTOR.
"""

import logging
from dataclasses import dataclass

import pytest

from app.app_config import get_application_config, set_application_config
from app.career_explorer.config import CareerExplorerConfig
from app.i18n.translation_service import get_i18n_manager
from app.i18n.types import Locale
from evaluation_tests.conversation_libs.fake_conversation_context import FakeConversationContext
from app.agent.career_explorer_agent.sector_relevance_classifier import (
    SectorRelevance,
    SectorRelevanceClassifier,
)

DEFAULT_SECTORS = [
    {"name": "Agriculture", "description": "Commercial farming", "file": "agriculture.md"},
    {"name": "Energy", "description": "Power generation", "file": "energy.md"},
    {"name": "Mining", "description": "Copper, gold", "file": "mining.md"},
    {"name": "Hospitality", "description": "Hotels, tourism", "file": "hospitality.md"},
    {"name": "Water", "description": "Treatment, supply", "file": "water.md"},
]


@dataclass
class ClassifierTestCase:
    name: str
    user_input: str
    expected_relevance: SectorRelevance


CLASSIFIER_TEST_CASES = [
    ClassifierTestCase("agriculture", "Tell me about Agriculture", SectorRelevance.PRIORITY_SECTOR),
    ClassifierTestCase("mining", "What roles are there in mining?", SectorRelevance.PRIORITY_SECTOR),
    ClassifierTestCase("energy_solar", "I want to know about solar careers", SectorRelevance.PRIORITY_SECTOR),
    ClassifierTestCase("water", "Careers in water treatment?", SectorRelevance.PRIORITY_SECTOR),
    ClassifierTestCase("hospitality", "What about tourism jobs?", SectorRelevance.PRIORITY_SECTOR),
    ClassifierTestCase("aeronautical", "I want to talk about aeronautical engineering", SectorRelevance.NON_PRIORITY_SECTOR),
    ClassifierTestCase("it_software", "What about software development careers?", SectorRelevance.NON_PRIORITY_SECTOR),
    ClassifierTestCase("healthcare", "Careers in nursing or healthcare?", SectorRelevance.NON_PRIORITY_SECTOR),
    ClassifierTestCase("general_career", "How do I find a job?", SectorRelevance.NON_PRIORITY_SECTOR),
]


@pytest.fixture
def career_explorer_config_with_sectors(setup_multi_locale_app_config):
    config = get_application_config()
    updated = config.model_copy(
        update={"career_explorer_config": CareerExplorerConfig(sectors=DEFAULT_SECTORS, country="Zambia")}
    )
    set_application_config(updated)
    yield updated


@pytest.mark.asyncio
@pytest.mark.evaluation_test("gemini-2.5-flash-lite/")
@pytest.mark.parametrize("test_case", CLASSIFIER_TEST_CASES, ids=[tc.name for tc in CLASSIFIER_TEST_CASES])
async def test_sector_relevance_classifier(
    evals_setup,
    career_explorer_config_with_sectors,
    test_case: ClassifierTestCase,
):
    get_i18n_manager().set_locale(Locale.EN_US)

    context = FakeConversationContext()
    context.add_turn("", "Welcome! Which sector interests you?")
    context.add_turn(test_case.user_input, "")

    classifier = SectorRelevanceClassifier()
    relevance, _reasoning, _ = await classifier.classify(user_input=test_case.user_input, context=context)

    assert relevance == test_case.expected_relevance, (
        f"For '{test_case.user_input}' expected {test_case.expected_relevance.value} but got {relevance.value}"
    )
    logging.info("Classifier test %s: %s -> %s (correct)", test_case.name, test_case.user_input[:40], relevance.value)
