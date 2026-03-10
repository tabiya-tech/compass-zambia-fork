"""
Constants for the agent module.

Platform modules and pages the agent knows about.
Use the most specific route available when a user asks about something specific.
"""

PLATFORM_MODULES = [
    {
        "name": "Skills & Interests",
        "route": "/skills-interests",
        "description": (
            "A chat-based experience where the user talks with an AI to uncover their skills and interests "
            "from their studies, work, and everyday life."
        ),
    },
    # Career Readiness — top-level list + individual modules
    {
        "name": "Career Readiness (all modules)",
        "route": "/career-readiness",
        "description": "Lists all Career Readiness modules. Use when the user wants to explore job readiness in general.",
    },
    {
        "name": "CV Development",
        "route": "/career-readiness/cv-development",
        "description": "AI-guided module for building and tailoring a professional CV.",
    },
    {
        "name": "Cover Letter Writing",
        "route": "/career-readiness/cover-letter",
        "description": "AI-guided module for writing a compelling cover letter.",
    },
    {
        "name": "Interview Preparation",
        "route": "/career-readiness/interview-preparation",
        "description": "AI-guided module for preparing for job interviews.",
    },
    {
        "name": "Professional Identity",
        "route": "/career-readiness/professional-identity",
        "description": "AI-guided module for developing a professional identity and personal brand.",
    },
    {
        "name": "Workplace Readiness",
        "route": "/career-readiness/workplace-readiness",
        "description": "AI-guided module covering workplace skills and professional conduct.",
    },
    {
        "name": "Entrepreneurship & Enterprise Development",
        "route": "/career-readiness/entrepreneurship",
        "description": "AI-guided module for developing an entrepreneurial mindset, starting and managing a business, and pitching ideas.",
    },
    # Knowledge Hub — top-level list + individual documents
    {
        "name": "Knowledge Hub (all documents)",
        "route": "/knowledge-hub",
        "description": "Lists all Knowledge Hub documents. Use when the user wants to browse resources in general.",
    },
    {
        "name": "Mining Sector Pathway",
        "route": "/knowledge-hub/mining-pathway",
        "description": "Sector profile, salary data, and qualification pathways for the mining industry.",
    },
    {
        "name": "Energy Sector Pathway",
        "route": "/knowledge-hub/energy-pathway",
        "description": "Sector profile, salary data, and qualification pathways for the energy industry.",
    },
    {
        "name": "Hospitality Sector Pathway",
        "route": "/knowledge-hub/hospitality-pathway",
        "description": "Sector profile, salary data, and qualification pathways for the hospitality industry.",
    },
    {
        "name": "Agriculture Sector Pathway",
        "route": "/knowledge-hub/agriculture-pathway",
        "description": "Sector profile, salary data, and qualification pathways for the agriculture industry.",
    },
    {
        "name": "Water Sector Pathway",
        "route": "/knowledge-hub/water-pathway",
        "description": "Sector profile, salary data, and qualification pathways for the water industry.",
    },
    {
        "name": "Home",
        "route": "/",
        "description": "The main dashboard where the user can see all available modules and their overall progress.",
    },
]
