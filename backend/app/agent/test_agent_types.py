import pytest

from app.agent.agent_types import LLMQuickReplyOption


class TestLLMQuickReplyOption:
    """Tests for the LLMQuickReplyOption model"""

    def test_serialization(self):
        """should serialize an LLMQuickReplyOption to a dict with the label field"""
        # GIVEN an LLM quick-reply option with a label
        given_label = "Let's start!"
        given_option = LLMQuickReplyOption(label=given_label)

        # WHEN the option is serialized to a dict
        actual_dict = given_option.model_dump()

        # THEN the dict should contain the label
        assert actual_dict == {"label": given_label}

    def test_deserialization_from_dict(self):
        """should deserialize an LLMQuickReplyOption from a dict"""
        # GIVEN a dict with a label field
        given_dict = {"label": "What can you help with?"}

        # WHEN an LLMQuickReplyOption is created from the dict
        actual_option = LLMQuickReplyOption(**given_dict)

        # THEN the option should have the correct label
        assert actual_option.label == "What can you help with?"

    def test_rejects_extra_fields(self):
        """should reject extra fields due to Config extra='forbid'"""
        # GIVEN a dict with an extra field
        given_dict = {"label": "Yes", "icon": "thumbs-up"}

        # WHEN an LLMQuickReplyOption is created with the extra field
        # THEN a validation error should be raised
        with pytest.raises(Exception):
            LLMQuickReplyOption(**given_dict)

    def test_requires_label(self):
        """should require the label field"""
        # GIVEN an empty dict (no label)
        given_dict = {}

        # WHEN an LLMQuickReplyOption is created without a label
        # THEN a validation error should be raised
        with pytest.raises(Exception):
            LLMQuickReplyOption(**given_dict)

    def test_roundtrip_serialization(self):
        """should survive a serialization/deserialization roundtrip"""
        # GIVEN an LLM quick-reply option
        given_option = LLMQuickReplyOption(label="How long does it take?")

        # WHEN the option is serialized and deserialized
        serialized = given_option.model_dump()
        actual_option = LLMQuickReplyOption(**serialized)

        # THEN the deserialized option should match the original
        assert actual_option.label == given_option.label
