from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field, field_serializer, field_validator


class CareerExplorerMessageSender(str, Enum):
    USER = "USER"
    AGENT = "AGENT"


class CareerExplorerMessage(BaseModel):
    message_id: str
    message: str
    sent_at: datetime
    sender: CareerExplorerMessageSender

    @field_serializer("sent_at")
    def _serialize_sent_at(self, value: datetime) -> str:
        return value.astimezone(timezone.utc).isoformat()

    @field_serializer("sender")
    def _serialize_sender(self, sender: CareerExplorerMessageSender, _info) -> str:
        return sender.name

    @classmethod
    @field_validator("sender", mode="before")
    def _deserialize_sender(cls, value: str | CareerExplorerMessageSender) -> CareerExplorerMessageSender:
        if isinstance(value, str):
            return CareerExplorerMessageSender[value]
        return value

    class Config:
        extra = "forbid"


class CareerExplorerConversationResponse(BaseModel):
    messages: list[CareerExplorerMessage]
    finished: bool = False

    class Config:
        extra = "forbid"


class CareerExplorerConversationInput(BaseModel):
    user_input: str

    class Config:
        extra = "forbid"


class CareerExplorerConversationDocument(BaseModel):
    user_id: str
    messages: list[CareerExplorerMessage] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    summary: str = ""
    num_turns_summarized: int = 0

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
            raise ValueError(f"Invalid datetime: {value}")
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)

    @staticmethod
    def from_dict(d: dict) -> "CareerExplorerConversationDocument":
        return CareerExplorerConversationDocument(
            user_id=str(d["user_id"]),
            messages=[CareerExplorerMessage(**m) for m in d.get("messages", [])],
            created_at=d["created_at"],
            updated_at=d["updated_at"],
            summary=d.get("summary", ""),
            num_turns_summarized=d.get("num_turns_summarized", 0),
        )

    class Config:
        extra = "forbid"
