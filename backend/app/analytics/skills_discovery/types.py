"""
Pydantic types for skills discovery analytics responses.
"""
from pydantic import BaseModel


class CountWithPercentage(BaseModel):
    count: int
    percentage: float


class FunnelStage(BaseModel):
    label: str
    count: int
    total: int


class SkillsDiscoveryStatsResponse(BaseModel):
    total_registered_students: int
    started: CountWithPercentage
    completed: CountWithPercentage
    in_progress_count: int
    funnel: list[FunnelStage]
