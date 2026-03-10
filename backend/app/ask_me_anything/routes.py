"""
Routes for the Ask Me Anything module.
"""
import asyncio
import logging
from http import HTTPStatus
from typing import Annotated, Optional

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Path

from app.agent.ask_me_anything_agent import AskMeAnythingAgent
from app.ask_me_anything.service import AskMeAnythingService
from app.ask_me_anything.types import AMAConversationInput, AMAConversationResponse
from app.app_config import get_application_config
from app.constants.errors import HTTPErrorResponse
from app.conversations.constants import MAX_MESSAGE_LENGTH
from app.i18n.translation_service import get_i18n_manager
from app.users.auth import Authentication, UserInfo

logger = logging.getLogger(__name__)

_ama_service_lock = asyncio.Lock()
_ama_service_singleton: Optional[AskMeAnythingService] = None


async def _get_ama_service() -> AskMeAnythingService:
    """Get or create the AMA service singleton (thread-safe)."""
    global _ama_service_singleton
    if _ama_service_singleton is None:
        async with _ama_service_lock:
            if _ama_service_singleton is None:
                _ama_service_singleton = AskMeAnythingService(agent=AskMeAnythingAgent())
    return _ama_service_singleton


def add_ask_me_anything_routes(app: FastAPI, authentication: Authentication) -> None:
    """
    Register all Ask Me Anything routes on the FastAPI app.

    :param app: The FastAPI application instance.
    :param authentication: The authentication dependency.
    """
    router = APIRouter(prefix="/ask-me-anything", tags=["ask-me-anything"])

    @router.post(
        path="/messages",
        status_code=HTTPStatus.CREATED,
        response_model=AMAConversationResponse,
        responses={
            HTTPStatus.REQUEST_ENTITY_TOO_LARGE: {"model": HTTPErrorResponse},
            HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse},
        },
        description=(
            "Send a message in the AMA conversation or get the initial greeting. "
            "If user_input is None or empty and history is empty, returns the agent's greeting. "
            "Otherwise processes the user's message. "
            "The client must supply the full prior history in the request body."
        ),
    )
    async def _send_message(
        body: AMAConversationInput,
        _user_info: UserInfo = Depends(authentication.get_user_info()),
        service: AskMeAnythingService = Depends(_get_ama_service),
    ) -> AMAConversationResponse:
        app_config = get_application_config()
        get_i18n_manager().set_locale(app_config.language_config.default_locale)
        
        if body.user_input and len(body.user_input) > MAX_MESSAGE_LENGTH:
            logger.warning("AMA user input exceeded max length of %d chars", MAX_MESSAGE_LENGTH)
            raise HTTPException(
                status_code=HTTPStatus.REQUEST_ENTITY_TOO_LARGE,
                detail="Too long user input",
            )
        try:
            return await service.send_message(
                user_input=body.user_input,
                history=body.history,
            )
        except ValueError as e:
            logger.warning("Invalid AMA request: %s", e)
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail=str(e),
            ) from e
        except Exception as e:
            logger.exception("Error processing AMA message: %s", e)
            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                detail="Unexpected error",
            ) from e

    app.include_router(router)
