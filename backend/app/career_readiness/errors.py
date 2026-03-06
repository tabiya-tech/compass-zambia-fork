"""
Domain-specific exceptions for the career readiness module.
"""


class CareerReadinessModuleNotFoundError(Exception):
    """Raised when a career readiness module is not found."""

    def __init__(self, module_id: str):
        super().__init__(f"Career readiness module not found: {module_id}")


class ConversationNotFoundError(Exception):
    """Raised when a career readiness conversation is not found."""

    def __init__(self, conversation_id: str):
        super().__init__(f"Career readiness conversation not found: {conversation_id}")


class ConversationAlreadyExistsError(Exception):
    """Raised when a conversation already exists for a module and user."""

    def __init__(self, module_id: str, user_id: str):
        super().__init__(f"A conversation already exists for module {module_id} and user {user_id}")


class ConversationAccessDeniedError(Exception):
    """Raised when a user attempts to access a conversation they do not own."""

    def __init__(self, conversation_id: str, user_id: str):
        super().__init__(f"User {user_id} does not have access to conversation {conversation_id}")


class ConversationModuleMismatchError(Exception):
    """Raised when a conversation does not belong to the specified module."""

    def __init__(self, conversation_id: str, module_id: str):
        super().__init__(f"Conversation {conversation_id} does not belong to module {module_id}")


class ModuleNotUnlockedError(Exception):
    """Raised when attempting to start a conversation for a locked module."""

    def __init__(self, module_id: str):
        super().__init__(f"Module {module_id} is not yet unlocked")


class QuizNotAvailableError(Exception):
    """Raised when the quiz is not available for this conversation."""

    def __init__(self, conversation_id: str):
        super().__init__(f"Quiz is not available for conversation {conversation_id}")


class QuizAlreadyPassedError(Exception):
    """Raised when quiz was already passed."""

    def __init__(self, conversation_id: str):
        super().__init__(f"Quiz already passed for conversation {conversation_id}")
