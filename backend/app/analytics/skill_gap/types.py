"""
Response models for skill gap analytics endpoints.
"""
from pydantic import BaseModel


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
