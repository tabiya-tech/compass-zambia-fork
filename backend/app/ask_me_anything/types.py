"""
Types for the Ask Me Anything module.
"""
from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field, field_serializer, field_validator


class SuggestedAction(BaseModel):
    """A navigation action suggested by the AMA agent."""

    label: str
    """Button text shown to the user, e.g. 'Explore Career Readiness'"""

    route: str
    """Frontend route to navigate to, e.g. '/career-readiness'"""

    class Config:
        extra = "forbid"


class AMAMessageSender(str, Enum):
    USER = "USER"
    AGENT = "AGENT"


class AMAMessage(BaseModel):
    """A single message in an AMA conversation."""

    message_id: str
    """Unique identifier for the message"""

    message: str
    """The message content"""

    sent_at: datetime
    """When the message was sent, in UTC"""

    sender: AMAMessageSender
    """Who sent the message"""

    suggested_actions: list[SuggestedAction] = Field(default_factory=list)
    """Navigation actions suggested by the agent (only populated on AGENT messages)"""

    @field_serializer("sent_at")
    def _serialize_sent_at(self, value: datetime) -> str:
        return value.astimezone(timezone.utc).isoformat()

    @field_serializer("sender")
    def _serialize_sender(self, sender: AMAMessageSender, _info) -> str:
        return sender.name

    @classmethod
    @field_validator("sender", mode="before")
    def _deserialize_sender(cls, value: str | AMAMessageSender) -> AMAMessageSender:
        if isinstance(value, str):
            return AMAMessageSender[value]
        elif isinstance(value, AMAMessageSender):
            return value
        else:
            raise ValueError(f"Invalid message sender: {value}")

    @classmethod
    @field_validator("sent_at", mode="before")
    def _deserialize_sent_at(cls, value: str | datetime) -> datetime:
        if isinstance(value, str):
            dt = datetime.fromisoformat(value)
        elif isinstance(value, datetime):
            dt = value
        else:
            raise ValueError(f"Invalid datetime value: {value}")
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)

    class Config:
        extra = "forbid"


class AMAConversationInput(BaseModel):
    """Input for sending a message in an AMA conversation."""

    user_input: str | None = None
    """The user's message (None for initial greeting request)"""

    history: list[AMAMessage] = Field(default_factory=list)
    """Full prior conversation history, sent by the client on each request"""

    class Config:
        extra = "forbid"


class AMAConversationResponse(BaseModel):
    """Response for an AMA conversation, including all messages."""

    messages: list[AMAMessage]
    """All messages in the conversation (including the new ones)"""

    class Config:
        extra = "forbid"
