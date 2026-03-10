"""
Constants for the agent module.

Platform modules and pages the agent knows about.
Use the most specific route available when a user asks about something specific.
"""
from typing import Final


class PlatformRoute:
    """Constants for platform routes that the AMA agent can suggest."""
    
    HOME = "/"
    SKILLS_INTERESTS = "/skills-interests"
    CAREER_READINESS = "/career-readiness"
    CAREER_READINESS_CV_DEVELOPMENT = "/career-readiness/cv-development"
    CAREER_READINESS_COVER_LETTER = "/career-readiness/cover-letter"
    CAREER_READINESS_INTERVIEW_PREPARATION = "/career-readiness/interview-preparation"
    CAREER_READINESS_PROFESSIONAL_IDENTITY = "/career-readiness/professional-identity"
    CAREER_READINESS_WORKPLACE_READINESS = "/career-readiness/workplace-readiness"
    CAREER_READINESS_ENTREPRENEURSHIP = "/career-readiness/entrepreneurship"
    CAREER_EXPLORER = "/career-explorer"
    KNOWLEDGE_HUB = "/knowledge-hub"
    KNOWLEDGE_HUB_MINING_PATHWAY = "/knowledge-hub/mining-pathway"
    KNOWLEDGE_HUB_ENERGY_PATHWAY = "/knowledge-hub/energy-pathway"
    KNOWLEDGE_HUB_HOSPITALITY_PATHWAY = "/knowledge-hub/hospitality-pathway"
    KNOWLEDGE_HUB_AGRICULTURE_PATHWAY = "/knowledge-hub/agriculture-pathway"
    KNOWLEDGE_HUB_WATER_PATHWAY = "/knowledge-hub/water-pathway"

VALID_PLATFORM_ROUTES: Final[list[str]] = [
    value
    for key, value in vars(PlatformRoute).items()
    if isinstance(value, str) and not key.startswith("_")
]
"""
All valid platform routes that the AMA agent can suggest.
Automatically derived from PlatformRoute constants to ensure consistency.
"""

PLATFORM_MODULES_CONFIG = [
    {
        "name_key": "askMeAnything.platformModules.skillsInterests.name",
        "route": PlatformRoute.SKILLS_INTERESTS,
        "description_key": "askMeAnything.platformModules.skillsInterests.description",
    },
    {
        "name_key": "askMeAnything.platformModules.careerReadiness.name",
        "route": PlatformRoute.CAREER_READINESS,
        "description_key": "askMeAnything.platformModules.careerReadiness.description",
    },
    {
        "name_key": "askMeAnything.platformModules.cvDevelopment.name",
        "route": PlatformRoute.CAREER_READINESS_CV_DEVELOPMENT,
        "description_key": "askMeAnything.platformModules.cvDevelopment.description",
    },
    {
        "name_key": "askMeAnything.platformModules.coverLetter.name",
        "route": PlatformRoute.CAREER_READINESS_COVER_LETTER,
        "description_key": "askMeAnything.platformModules.coverLetter.description",
    },
    {
        "name_key": "askMeAnything.platformModules.interviewPreparation.name",
        "route": PlatformRoute.CAREER_READINESS_INTERVIEW_PREPARATION,
        "description_key": "askMeAnything.platformModules.interviewPreparation.description",
    },
    {
        "name_key": "askMeAnything.platformModules.professionalIdentity.name",
        "route": PlatformRoute.CAREER_READINESS_PROFESSIONAL_IDENTITY,
        "description_key": "askMeAnything.platformModules.professionalIdentity.description",
    },
    {
        "name_key": "askMeAnything.platformModules.workplaceReadiness.name",
        "route": PlatformRoute.CAREER_READINESS_WORKPLACE_READINESS,
        "description_key": "askMeAnything.platformModules.workplaceReadiness.description",
    },
    {
        "name_key": "askMeAnything.platformModules.entrepreneurship.name",
        "route": PlatformRoute.CAREER_READINESS_ENTREPRENEURSHIP,
        "description_key": "askMeAnything.platformModules.entrepreneurship.description",
    },
    {
        "name_key": "askMeAnything.platformModules.careerExplorer.name",
        "route": PlatformRoute.CAREER_EXPLORER,
        "description_key": "askMeAnything.platformModules.careerExplorer.description",
    },
    {
        "name_key": "askMeAnything.platformModules.knowledgeHub.name",
        "route": PlatformRoute.KNOWLEDGE_HUB,
        "description_key": "askMeAnything.platformModules.knowledgeHub.description",
    },
    {
        "name_key": "askMeAnything.platformModules.miningPathway.name",
        "route": PlatformRoute.KNOWLEDGE_HUB_MINING_PATHWAY,
        "description_key": "askMeAnything.platformModules.miningPathway.description",
    },
    {
        "name_key": "askMeAnything.platformModules.energyPathway.name",
        "route": PlatformRoute.KNOWLEDGE_HUB_ENERGY_PATHWAY,
        "description_key": "askMeAnything.platformModules.energyPathway.description",
    },
    {
        "name_key": "askMeAnything.platformModules.hospitalityPathway.name",
        "route": PlatformRoute.KNOWLEDGE_HUB_HOSPITALITY_PATHWAY,
        "description_key": "askMeAnything.platformModules.hospitalityPathway.description",
    },
    {
        "name_key": "askMeAnything.platformModules.agriculturePathway.name",
        "route": PlatformRoute.KNOWLEDGE_HUB_AGRICULTURE_PATHWAY,
        "description_key": "askMeAnything.platformModules.agriculturePathway.description",
    },
    {
        "name_key": "askMeAnything.platformModules.waterPathway.name",
        "route": PlatformRoute.KNOWLEDGE_HUB_WATER_PATHWAY,
        "description_key": "askMeAnything.platformModules.waterPathway.description",
    },
    {
        "name_key": "askMeAnything.platformModules.home.name",
        "route": PlatformRoute.HOME,
        "description_key": "askMeAnything.platformModules.home.description",
    },
]

def get_localized_platform_modules():
    """
    Get platform modules with localized names and descriptions based on current locale.
    
    Returns:
        List of dictionaries with 'name', 'route', and 'description' keys.
    """
    from app.i18n.translation_service import t
    
    modules = []
    for module_config in PLATFORM_MODULES_CONFIG:
        modules.append({
            "name": t("messages", module_config["name_key"], fallback_message=module_config["name_key"]),
            "route": module_config["route"],
            "description": t("messages", module_config["description_key"], fallback_message=module_config["description_key"]),
        })
    return modules
