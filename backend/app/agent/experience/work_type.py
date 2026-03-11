from __future__ import annotations
from enum import Enum
from textwrap import dedent
from typing import Optional


class WorkType(Enum):
    """
    Represents the work-type of a user experience.

    See https://docs.tabiya.org/overview/projects/inclusive-livelihoods-taxonomy/methodology for more information.

    Storage types (stored in CollectedData.work_type and used for CV/reporting):
    - FORMAL_SECTOR_WAGED_EMPLOYMENT: Paid work as an employee
    - FORMAL_SECTOR_UNPAID_TRAINEE_WORK: Unpaid trainee/internship
    - UNSEEN_UNPAID: Unpaid other (volunteering, caregiving, household)

    Phase-only types (used only in collect-experiences state machine for 2-question flow):
    - PAID_WORK: First phase – "Did you do any paid work?"
    - UNPAID_WORK: Second phase – "Did you do any unpaid work?"
    """
    # Storage types (stored in CollectedData.work_type and used for CV/reporting)
    FORMAL_SECTOR_WAGED_EMPLOYMENT = "Formal sector/Wage employment"
    FORMAL_SECTOR_UNPAID_TRAINEE_WORK = "Formal sector/Unpaid trainee work"
    UNSEEN_UNPAID = "Unpaid other"  # All unseen work is grouped under this category

    # Phase-only types (not stored on CollectedData; used only in collect-experiences state machine)
    PAID_WORK = "Paid work (phase)"
    UNPAID_WORK = "Unpaid work (phase)"

    @staticmethod
    def from_string_key(key: Optional[str]) -> Optional["WorkType"]:
        if key in WorkType.__members__:
            return WorkType[key]
        return None

    @staticmethod
    def work_type_short(work_type: "WorkType") -> str:
        if work_type == WorkType.FORMAL_SECTOR_WAGED_EMPLOYMENT:
            return "Wage Employment"
        elif work_type == WorkType.FORMAL_SECTOR_UNPAID_TRAINEE_WORK:
            return "Trainee"
        elif work_type == WorkType.UNSEEN_UNPAID:
            return "Volunteer/Unpaid"
        elif work_type in (WorkType.PAID_WORK, WorkType.UNPAID_WORK):
            return ""
        else:
            return ""

    @staticmethod
    def work_type_short_i18n_key(work_type: "WorkType") -> str:
        if work_type == WorkType.FORMAL_SECTOR_WAGED_EMPLOYMENT:
            return "experience.workType.short.formalSectorWagedEmployment"
        elif work_type == WorkType.FORMAL_SECTOR_UNPAID_TRAINEE_WORK:
            return "experience.workType.short.formalSectorUnpaidTraineeWork"
        elif work_type == WorkType.UNSEEN_UNPAID:
            return "experience.workType.short.unseenUnpaid"
        else:
            return ""

    @staticmethod
    def work_type_long(work_type: "WorkType | None") -> str:
        if work_type == WorkType.FORMAL_SECTOR_WAGED_EMPLOYMENT:
            return "Waged work or paid work as an employee. Working for someone else, for a company or an organization, in exchange for a salary or wage."
        elif work_type == WorkType.FORMAL_SECTOR_UNPAID_TRAINEE_WORK:
            return "Unpaid Trainee Work."
        elif work_type == WorkType.UNSEEN_UNPAID:
            return dedent("""\
            Represents all unpaid work, including:
                - Unpaid domestic services for own household or family members.
                - Unpaid caregiving for own household or family members.
                - Unpaid direct volunteering for other households.
                - Unpaid community- and organization-based volunteering.
            excluding:
                - Unpaid trainee work.
            """)
        elif work_type == WorkType.PAID_WORK:
            return "Paid work (exploration phase: collect paid employment experiences)."
        elif work_type == WorkType.UNPAID_WORK:
            return "Unpaid work (exploration phase: collect unpaid trainee, volunteering, caregiving, household)."
        elif work_type is None:
            return "When there isn't adequate information to classify the work type in any of the categories below."
        else:
            return ""


# Work types stored on CollectedData (used for CV/reporting). Excludes phase-only PAID_WORK, UNPAID_WORK.
_STORAGE_WORK_TYPES = frozenset({
    WorkType.FORMAL_SECTOR_WAGED_EMPLOYMENT,
    WorkType.FORMAL_SECTOR_UNPAID_TRAINEE_WORK,
    WorkType.UNSEEN_UNPAID,
})


def is_storage_work_type(work_type: WorkType | None) -> bool:
    """True if this work type is stored on CollectedData (not phase-only)."""
    return work_type is not None and work_type in _STORAGE_WORK_TYPES


def get_storage_work_types_for_phase(phase: WorkType | None) -> list[WorkType]:
    """
    Return the storage work type(s) that belong to the given exploration phase.
    Used for fill_incomplete_fields_as_declined and transition incomplete check.
    - PAID_WORK -> [FORMAL_SECTOR_WAGED_EMPLOYMENT]
    - UNPAID_WORK -> [FORMAL_SECTOR_UNPAID_TRAINEE_WORK, UNSEEN_UNPAID]
    - Storage type -> [that type]
    """
    if phase is None:
        return []
    if phase == WorkType.PAID_WORK:
        return [WorkType.FORMAL_SECTOR_WAGED_EMPLOYMENT]
    if phase == WorkType.UNPAID_WORK:
        return [WorkType.FORMAL_SECTOR_UNPAID_TRAINEE_WORK, WorkType.UNSEEN_UNPAID]
    if phase in _STORAGE_WORK_TYPES:
        return [phase]
    return []


WORK_TYPE_DEFINITIONS_FOR_PROMPT = dedent(f"""\
- None: {WorkType.work_type_long(None)}
- {WorkType.FORMAL_SECTOR_WAGED_EMPLOYMENT.name}: {WorkType.work_type_long(WorkType.FORMAL_SECTOR_WAGED_EMPLOYMENT)}
- {WorkType.FORMAL_SECTOR_UNPAID_TRAINEE_WORK.name}: {WorkType.work_type_long(WorkType.FORMAL_SECTOR_UNPAID_TRAINEE_WORK)}
- {WorkType.UNSEEN_UNPAID.name}: {WorkType.work_type_long(WorkType.UNSEEN_UNPAID)}
""")
