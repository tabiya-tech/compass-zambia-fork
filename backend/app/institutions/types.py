from typing import Optional
from pydantic import BaseModel


class Programme(BaseModel):
    """A training programme offered by an institution."""

    model_config = {"extra": "ignore"}

    name: str
    qualification_type: Optional[str] = None
    zqf_level: Optional[str] = None
    sectors: Optional[list[str]] = None


class InstitutionLocation(BaseModel):
    """Geographic location of an institution."""

    model_config = {"extra": "ignore"}

    province: Optional[str] = None
    address: Optional[str] = None


class InstitutionDocument(BaseModel):
    """A TEVETA-registered training institution with its programmes and location."""

    model_config = {"extra": "ignore"}

    name: str
    grade: Optional[str] = None
    highest_qualification: Optional[str] = None
    reg_no: Optional[str] = None
    physical_address: Optional[str] = None
    province: Optional[str] = None
    contact_details: Optional[str] = None
    ownership: Optional[str] = None
    pilot_institution: Optional[bool] = None
    mots_bursary: Optional[bool] = None
    sectors_covered: Optional[list[str]] = None
    location: Optional[InstitutionLocation] = None
    programmes: Optional[list[Programme]] = None
