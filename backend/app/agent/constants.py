"""
Constants for the agent module.

Platform modules and pages the agent knows about.
Use the most specific route available when a user asks about something specific.
"""

PLATFORM_MODULES_CONFIG = [
    {
        "name_key": "askMeAnything.platformModules.skillsInterests.name",
        "route": "/skills-interests",
        "description_key": "askMeAnything.platformModules.skillsInterests.description",
    },
    {
        "name_key": "askMeAnything.platformModules.careerReadiness.name",
        "route": "/career-readiness",
        "description_key": "askMeAnything.platformModules.careerReadiness.description",
    },
    {
        "name_key": "askMeAnything.platformModules.cvDevelopment.name",
        "route": "/career-readiness/cv-development",
        "description_key": "askMeAnything.platformModules.cvDevelopment.description",
    },
    {
        "name_key": "askMeAnything.platformModules.coverLetter.name",
        "route": "/career-readiness/cover-letter",
        "description_key": "askMeAnything.platformModules.coverLetter.description",
    },
    {
        "name_key": "askMeAnything.platformModules.interviewPreparation.name",
        "route": "/career-readiness/interview-preparation",
        "description_key": "askMeAnything.platformModules.interviewPreparation.description",
    },
    {
        "name_key": "askMeAnything.platformModules.professionalIdentity.name",
        "route": "/career-readiness/professional-identity",
        "description_key": "askMeAnything.platformModules.professionalIdentity.description",
    },
    {
        "name_key": "askMeAnything.platformModules.workplaceReadiness.name",
        "route": "/career-readiness/workplace-readiness",
        "description_key": "askMeAnything.platformModules.workplaceReadiness.description",
    },
    {
        "name_key": "askMeAnything.platformModules.entrepreneurship.name",
        "route": "/career-readiness/entrepreneurship",
        "description_key": "askMeAnything.platformModules.entrepreneurship.description",
    },
    {
        "name_key": "askMeAnything.platformModules.careerExplorer.name",
        "route": "/career-explorer",
        "description_key": "askMeAnything.platformModules.careerExplorer.description",
    },
    {
        "name_key": "askMeAnything.platformModules.knowledgeHub.name",
        "route": "/knowledge-hub",
        "description_key": "askMeAnything.platformModules.knowledgeHub.description",
    },
    {
        "name_key": "askMeAnything.platformModules.miningPathway.name",
        "route": "/knowledge-hub/mining-pathway",
        "description_key": "askMeAnything.platformModules.miningPathway.description",
    },
    {
        "name_key": "askMeAnything.platformModules.energyPathway.name",
        "route": "/knowledge-hub/energy-pathway",
        "description_key": "askMeAnything.platformModules.energyPathway.description",
    },
    {
        "name_key": "askMeAnything.platformModules.hospitalityPathway.name",
        "route": "/knowledge-hub/hospitality-pathway",
        "description_key": "askMeAnything.platformModules.hospitalityPathway.description",
    },
    {
        "name_key": "askMeAnything.platformModules.agriculturePathway.name",
        "route": "/knowledge-hub/agriculture-pathway",
        "description_key": "askMeAnything.platformModules.agriculturePathway.description",
    },
    {
        "name_key": "askMeAnything.platformModules.waterPathway.name",
        "route": "/knowledge-hub/water-pathway",
        "description_key": "askMeAnything.platformModules.waterPathway.description",
    },
    {
        "name_key": "askMeAnything.platformModules.home.name",
        "route": "/",
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
