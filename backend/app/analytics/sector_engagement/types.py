from datetime import datetime

from pydantic import BaseModel


class SectorEngagementSummaryItem(BaseModel):
    sector_name: str
    is_priority: bool
    total_inquiries: int
    unique_users: int

    class Config:
        extra = "forbid"


class SectorEngagementSummaryMeta(BaseModel):
    total_sectors: int

    class Config:
        extra = "forbid"


class SectorEngagementSummaryResponse(BaseModel):
    data: list[SectorEngagementSummaryItem]
    meta: SectorEngagementSummaryMeta

    class Config:
        extra = "forbid"


class UserSectorEngagementItem(BaseModel):
    sector_name: str
    is_priority: bool
    inquiry_count: int
    last_asked_at: datetime

    class Config:
        extra = "forbid"


class UserSectorEngagementMeta(BaseModel):
    total_sectors: int

    class Config:
        extra = "forbid"


class UserSectorEngagementResponse(BaseModel):
    data: list[UserSectorEngagementItem]
    meta: UserSectorEngagementMeta

    class Config:
        extra = "forbid"
