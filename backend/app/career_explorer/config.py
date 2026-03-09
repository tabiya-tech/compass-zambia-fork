import json
from typing import Any

from pydantic import BaseModel, Field


def parse_career_explorer_config(raw: str | None) -> "CareerExplorerConfig":
    if not raw or not raw.strip():
        return CareerExplorerConfig()
    try:
        data: dict[str, Any] = json.loads(raw)
        return CareerExplorerConfig(**data)
    except (json.JSONDecodeError, TypeError) as e:
        raise ValueError(f"Invalid CAREER_EXPLORER_CONFIG JSON: {e}") from e


class CareerExplorerConfig(BaseModel):
    sectors: list[dict[str, str]] = Field(default_factory=list)
    country: str = "Zambia"

    class Config:
        extra = "forbid"
