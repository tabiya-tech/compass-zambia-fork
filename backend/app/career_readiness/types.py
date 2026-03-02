from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field, field_serializer, field_validator


class ModuleStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class CareerReadinessMessageSender(str, Enum):
    USER = "USER"
    AGENT = "AGENT"


class ModuleSummary(BaseModel):
    """
    Summary of a career readiness module, used in listing endpoints.
    """

    id: str
    """The unique identifier (slug) of the module, e.g. 'cv-resume-creation'"""

    title: str
    """The display title of the module"""

    description: str
    """A short description of what the module covers"""

    icon: str
    """Icon identifier for the module"""

    status: ModuleStatus
    """The user's current progress status for this module"""

    sort_order: int
    """Display order of the module in the list"""

    input_placeholder: str
    """Placeholder text shown in the chat input for this module"""

    class Config:
        extra = "forbid"


class ModuleDetail(BaseModel):
    """
    Detailed view of a career readiness module, including active conversation info.
    """

    id: str
    """The unique identifier (slug) of the module"""

    title: str
    """The display title of the module"""

    description: str
    """A short description of what the module covers"""

    icon: str
    """Icon identifier for the module"""

    status: ModuleStatus
    """The user's current progress status for this module"""

    sort_order: int
    """Display order of the module in the list"""

    input_placeholder: str
    """Placeholder text shown in the chat input for this module"""

    scope: str
    """The full scope/content description of the module"""

    active_conversation_id: str | None = None
    """The ID of the active conversation for this module, if one exists"""

    class Config:
        extra = "forbid"


class ModuleListResponse(BaseModel):
    """
    Response containing the list of all career readiness modules.
    """

    modules: list[ModuleSummary]
    """The list of available modules with user progress"""

    class Config:
        extra = "forbid"


class CareerReadinessMessage(BaseModel):
    """
    Represents a single message in a career readiness conversation.
    """

    message_id: str
    """The unique id of the message"""

    message: str
    """The message content"""

    sent_at: datetime
    """The time the message was sent, in ISO format, in UTC"""

    sender: CareerReadinessMessageSender
    """The sender of the message, either USER or AGENT"""

    @field_serializer('sent_at')
    def _serialize_sent_at(self, value: datetime) -> str:
        return value.astimezone(timezone.utc).isoformat()

    @field_serializer("sender")
    def _serialize_sender(self, sender: CareerReadinessMessageSender, _info) -> str:
        return sender.name

    @classmethod
    @field_validator("sender", mode='before')
    def _deserialize_sender(cls, value: str | CareerReadinessMessageSender) -> CareerReadinessMessageSender:
        if isinstance(value, str):
            return CareerReadinessMessageSender[value]
        elif isinstance(value, CareerReadinessMessageSender):
            return value
        else:
            raise ValueError(f"Invalid message sender: {value}")

    class Config:
        extra = "forbid"


class CareerReadinessConversationResponse(BaseModel):
    """
    Response for a career readiness conversation, including messages and completion status.
    """

    conversation_id: str
    """The unique id of the conversation"""

    module_id: str
    """The module this conversation belongs to"""

    messages: list[CareerReadinessMessage]
    """The messages in the conversation"""

    module_completed: bool = False
    """Whether the module has been completed through this conversation"""

    class Config:
        extra = "forbid"


class CareerReadinessConversationInput(BaseModel):
    """
    Input for sending a message in a career readiness conversation.
    """

    user_input: str
    """The user input"""

    class Config:
        extra = "forbid"


class CareerReadinessConversationDocument(BaseModel):
    """
    Represents a career readiness conversation document in MongoDB.
    """

    conversation_id: str
    """The unique identifier for the conversation"""

    module_id: str
    """The module this conversation belongs to"""

    user_id: str
    """The user who owns this conversation"""

    messages: list[CareerReadinessMessage] = Field(default_factory=list)
    """The messages in the conversation"""

    created_at: datetime
    """When the conversation was created"""

    updated_at: datetime
    """When the conversation was last updated"""

    @field_serializer("created_at", "updated_at")
    def _serialize_datetime(self, value: datetime) -> str:
        return value.astimezone(timezone.utc).isoformat()

    @classmethod
    @field_validator("created_at", "updated_at", mode="before")
    def _deserialize_datetime(cls, value: str | datetime) -> datetime:
        if isinstance(value, str):
            dt = datetime.fromisoformat(value)
        elif isinstance(value, datetime):
            dt = value
        else:
            raise ValueError(f"Invalid datetime value: {value}")
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)

    @staticmethod
    def from_dict(_dict: dict) -> "CareerReadinessConversationDocument":
        """Convert a MongoDB document dictionary to a typed object."""
        return CareerReadinessConversationDocument(
            conversation_id=str(_dict["conversation_id"]),
            module_id=str(_dict["module_id"]),
            user_id=str(_dict["user_id"]),
            messages=[CareerReadinessMessage(**msg) for msg in _dict.get("messages", [])],
            created_at=_dict["created_at"],
            updated_at=_dict["updated_at"],
        )

    class Config:
        extra = "forbid"
