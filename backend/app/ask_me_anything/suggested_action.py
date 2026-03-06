from pydantic import BaseModel


class SuggestedAction(BaseModel):
    """A navigation action suggested by the AMA agent."""

    label: str
    """Button text shown to the user, e.g. 'Explore Career Readiness'"""

    route: str
    """Frontend route to navigate to, e.g. '/career-readiness'"""

    class Config:
        extra = "forbid"
