from datetime import datetime, timezone

import pytest

from app.conversations.types import (
    QuickReplyOption,
    ConversationMessage,
    ConversationMessageSender,
)


class TestQuickReplyOption:
    """Tests for the QuickReplyOption model"""

    def test_serialization(self):
        """should serialize a QuickReplyOption to a dict with the label field"""
        # GIVEN a quick-reply option with a label
        given_label = "Yes"
        given_option = QuickReplyOption(label=given_label)

        # WHEN the option is serialized to a dict
        actual_dict = given_option.model_dump()

        # THEN the dict should contain the label
        assert actual_dict == {"label": given_label}

    def test_deserialization_from_dict(self):
        """should deserialize a QuickReplyOption from a dict"""
        # GIVEN a dict with a label field
        given_dict = {"label": "No"}

        # WHEN a QuickReplyOption is created from the dict
        actual_option = QuickReplyOption(**given_dict)

        # THEN the option should have the correct label
        assert actual_option.label == "No"

    def test_rejects_extra_fields(self):
        """should reject extra fields due to Config extra='forbid'"""
        # GIVEN a dict with an extra field
        given_dict = {"label": "Yes", "color": "blue"}

        # WHEN a QuickReplyOption is created with the extra field
        # THEN a validation error should be raised
        with pytest.raises(Exception):
            QuickReplyOption(**given_dict)

    def test_requires_label(self):
        """should require the label field"""
        # GIVEN an empty dict (no label)
        given_dict = {}

        # WHEN a QuickReplyOption is created without a label
        # THEN a validation error should be raised
        with pytest.raises(Exception):
            QuickReplyOption(**given_dict)


class TestConversationMessageWithQuickReplyOptions:
    """Tests for ConversationMessage with quick_reply_options"""

    def test_message_with_quick_reply_options(self):
        """should include quick_reply_options in serialized output when provided"""
        # GIVEN a list of quick-reply options
        given_options = [QuickReplyOption(label="Yes"), QuickReplyOption(label="No")]

        # AND a conversation message with those quick-reply options
        given_message = ConversationMessage(
            message_id="msg-1",
            message="Do you have paid work experience?",
            sent_at=datetime(2024, 1, 1, tzinfo=timezone.utc),
            sender=ConversationMessageSender.COMPASS,
            quick_reply_options=given_options,
        )

        # WHEN the message is serialized
        actual_dict = given_message.model_dump()

        # THEN the quick_reply_options field should contain the serialized options
        assert actual_dict["quick_reply_options"] == [{"label": "Yes"}, {"label": "No"}]

    def test_message_without_quick_reply_options(self):
        """should have quick_reply_options as None by default"""
        # GIVEN a conversation message without quick-reply options
        given_message = ConversationMessage(
            message_id="msg-2",
            message="Tell me more about your work.",
            sent_at=datetime(2024, 1, 1, tzinfo=timezone.utc),
            sender=ConversationMessageSender.COMPASS,
        )

        # WHEN the message is serialized
        actual_dict = given_message.model_dump()

        # THEN the quick_reply_options field should be None
        assert actual_dict["quick_reply_options"] is None

    def test_message_deserialization_with_quick_reply_options(self):
        """should deserialize a ConversationMessage with quick_reply_options from a dict"""
        # GIVEN a dict representing a conversation message with quick-reply options
        given_dict = {
            "message_id": "msg-3",
            "message": "Ready to get started?",
            "sent_at": "2024-01-01T00:00:00+00:00",
            "sender": "COMPASS",
            "quick_reply_options": [{"label": "Let's start!"}, {"label": "What can you help with?"}],
        }

        # WHEN a ConversationMessage is created from the dict
        actual_message = ConversationMessage(**given_dict)

        # THEN the quick_reply_options should be deserialized as QuickReplyOption instances
        assert len(actual_message.quick_reply_options) == 2
        assert actual_message.quick_reply_options[0].label == "Let's start!"
        assert actual_message.quick_reply_options[1].label == "What can you help with?"

    def test_message_roundtrip_serialization(self):
        """should survive a serialization/deserialization roundtrip with quick_reply_options"""
        # GIVEN a conversation message with quick-reply options
        given_options = [QuickReplyOption(label="That's all"), QuickReplyOption(label="I want to add something")]
        given_message = ConversationMessage(
            message_id="msg-4",
            message="Anything else?",
            sent_at=datetime(2024, 6, 15, 12, 0, 0, tzinfo=timezone.utc),
            sender=ConversationMessageSender.COMPASS,
            quick_reply_options=given_options,
        )

        # WHEN the message is serialized and then deserialized
        serialized = given_message.model_dump()
        actual_message = ConversationMessage(**serialized)

        # THEN the deserialized message should match the original
        assert actual_message.quick_reply_options is not None
        assert len(actual_message.quick_reply_options) == 2
        assert actual_message.quick_reply_options[0].label == "That's all"
        assert actual_message.quick_reply_options[1].label == "I want to add something"
