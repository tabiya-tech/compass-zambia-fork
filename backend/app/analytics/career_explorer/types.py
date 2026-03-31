"""
Response models for career explorer analytics endpoints.
"""
from pydantic import BaseModel


class CountPercentage(BaseModel):
    """Count and percentage wrapper."""

    count: int
    percentage: float

    class Config:
        """Pydantic config."""

        extra = "forbid"


class SectorStat(BaseModel):
    """Per-sector engagement stats."""

    sector_name: str
    is_priority: bool
    unique_users: int
    total_inquiries: int

    class Config:
        """Pydantic config."""

        extra = "forbid"


class CareerExplorerStatsResponse(BaseModel):
    """Aggregated career explorer statistics for the admin dashboard."""

    total_registered_students: int
    started: CountPercentage
    returned_2_plus: CountPercentage
    priority_sector_users: int
    non_priority_sector_users: int
    top_sectors: list[SectorStat]

    class Config:
        """Pydantic config."""

        extra = "forbid"
