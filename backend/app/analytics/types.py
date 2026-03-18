from typing import Generic, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginatedListMeta(BaseModel):
    limit: int
    next_cursor: Optional[str] = None
    has_more: bool
    total: Optional[int] = None


class PaginatedListResponse(BaseModel, Generic[T]):
    data: list[T]
    meta: PaginatedListMeta


class Institution(BaseModel):
    id: str
    name: str
    active: bool = True
    students: Optional[int] = None
    active_7_days: Optional[int] = None
    skills_discovery_started_pct: Optional[float] = None
    skills_discovery_completed_pct: Optional[float] = None
    career_readiness_started_pct: Optional[float] = None
    career_readiness_completed_pct: Optional[float] = None
    career_explorer_started_pct: Optional[float] = None


class User(BaseModel):
    id: str
    institution: Optional[str] = None
    province: Optional[str] = None
    active: bool = True


class AdoptionTrendPoint(BaseModel):
    date: str
    new_registrations: int
    daily_active_users: int


class AdoptionTrendsMeta(BaseModel):
    start_date: str
    end_date: str
    interval: str


class AdoptionTrendsResponse(BaseModel):
    data: list[AdoptionTrendPoint]
    meta: AdoptionTrendsMeta


class DashboardStats(BaseModel):
    institutions_active: int
    total_students: int
    active_students_7_days: int
