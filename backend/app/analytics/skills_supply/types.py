"""
Pydantic types for skills supply analytics responses.
"""
from pydantic import BaseModel


class SkillSupplyEntry(BaseModel):
    skill_id: str
    skill_label: str
    student_count: int
    avg_score: float


class SkillsSupplyStatsResponse(BaseModel):
    total_students_with_skills: int
    top_skills: list[SkillSupplyEntry]
