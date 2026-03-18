"""
Response models for analytics endpoints.
"""
from pydantic import BaseModel


class StartedStats(BaseModel):
    """Count and percentage of students who started career readiness."""

    count: int
    percentage: float

    class Config:
        """Pydantic config."""

        extra = "forbid"


class CompletedAllStats(BaseModel):
    """Count and percentage of students who completed all modules."""

    count: int
    percentage_of_started: float

    class Config:
        """Pydantic config."""

        extra = "forbid"


class ModuleBreakdown(BaseModel):
    """Per-module started and completed counts."""

    module_id: str
    module_title: str
    started_count: int
    completed_count: int

    class Config:
        """Pydantic config."""

        extra = "forbid"


class CareerReadinessStatsResponse(BaseModel):
    """Aggregated career readiness statistics for the admin dashboard."""

    total_registered_students: int
    started: StartedStats
    completed_all_modules: CompletedAllStats
    avg_modules_completed: float
    total_modules: int
    module_breakdown: list[ModuleBreakdown]

    class Config:
        """Pydantic config."""

        extra = "forbid"


class SkillGapEntry(BaseModel):
    """A single skill gap entry aggregated across all students."""

    skill_id: str
    skill_label: str
    students_with_gap_count: int
    avg_job_unlock_count: float
    avg_proximity_score: float

    class Config:
        """Pydantic config."""

        extra = "forbid"


class SkillGapStatsResponse(BaseModel):
    """Aggregated skill gap statistics for the admin dashboard."""

    total_students_with_skill_gaps: int
    top_skill_gaps: list[SkillGapEntry]

    class Config:
        """Pydantic config."""

        extra = "forbid"
