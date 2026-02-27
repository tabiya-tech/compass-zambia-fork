"""
This module contains domain-specific exceptions for plain personal data.
"""


class UserPreferencesNotFoundError(Exception):
    """
    Exception raised when user preferences are not found.
    """

    def __init__(self, user_id: str):
        super().__init__(f"User preferences not found for user {user_id}")
