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
from app.constants.errors import HTTPErrorResponse
from app.conversations.constants import MAX_MESSAGE_LENGTH
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
        path="/conversations",
        status_code=HTTPStatus.CREATED,
        response_model=AMAConversationResponse,
        responses={
            HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse},
        },
        description=(
            "Start a new Ask Me Anything conversation. "
            "Returns a fresh conversation_id and the agent's opening greeting."
        ),
    )
    async def _start_conversation(
        _user_info: UserInfo = Depends(authentication.get_user_info()),
        service: AskMeAnythingService = Depends(_get_ama_service),
    ) -> AMAConversationResponse:
        try:
            return await service.start_conversation()
        except Exception as e:
            logger.exception("Error starting AMA conversation: %s", e)
            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                detail="Unexpected error",
            ) from e

    @router.post(
        path="/conversations/{conversation_id}/messages",
        status_code=HTTPStatus.CREATED,
        response_model=AMAConversationResponse,
        responses={
            HTTPStatus.REQUEST_ENTITY_TOO_LARGE: {"model": HTTPErrorResponse},
            HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse},
        },
        description=(
            "Send a message in an AMA conversation. "
            "The client must supply the full prior history in the request body."
        ),
    )
    async def _send_message(
        conversation_id: Annotated[str, Path(description="The conversation identifier.")],
        body: AMAConversationInput,
        _user_info: UserInfo = Depends(authentication.get_user_info()),
        service: AskMeAnythingService = Depends(_get_ama_service),
    ) -> AMAConversationResponse:
        if len(body.user_input) > MAX_MESSAGE_LENGTH:
            logger.warning("AMA user input exceeded max length of %d chars", MAX_MESSAGE_LENGTH)
            raise HTTPException(
                status_code=HTTPStatus.REQUEST_ENTITY_TOO_LARGE,
                detail="Too long user input",
            )
        try:
            return await service.send_message(
                conversation_id=conversation_id,
                user_input=body.user_input,
                history=body.history,
            )
        except Exception as e:
            logger.exception("Error sending AMA message: %s", e)
            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                detail="Unexpected error",
            ) from e

    app.include_router(router)
