"""
This module contains the routes for the career readiness module.
"""
from http import HTTPStatus
from typing import Annotated

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Path

from app.career_readiness.types import (
    ModuleListResponse,
    ModuleDetail,
    ModuleStatusUpdateRequest,
    CareerReadinessConversationResponse,
    CareerReadinessConversationInput,
)
from app.constants.errors import HTTPErrorResponse
from app.users.auth import Authentication, UserInfo


def add_career_readiness_routes(app: FastAPI, authentication: Authentication):
    """
    Adds all the career readiness routes to the FastAPI app.

    :param app: FastAPI: The FastAPI app to add the routes to.
    :param authentication: Authentication Module Dependency: The authentication instance to use for the routes.
    """

    router = APIRouter(prefix="/career-readiness", tags=["career-readiness"])

    @router.get(
        path="/modules",
        response_model=ModuleListResponse,
        responses={
            HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse},
        },
        description="List all career readiness modules with the current user's progress status.",
    )
    async def _list_modules(
        user_info: UserInfo = Depends(authentication.get_user_info()),  # noqa: ARG001
    ):
        raise HTTPException(status_code=HTTPStatus.NOT_IMPLEMENTED, detail="Not implemented yet")

    @router.get(
        path="/modules/{module_id}",
        response_model=ModuleDetail,
        responses={
            HTTPStatus.NOT_FOUND: {"model": HTTPErrorResponse},
            HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse},
        },
        description="Get details of a specific career readiness module, including active conversation ID.",
    )
    async def _get_module(
        module_id: Annotated[str, Path(description="The module identifier slug.", examples=["cv-resume-creation"])],
        user_info: UserInfo = Depends(authentication.get_user_info()),  # noqa: ARG001
    ):
        raise HTTPException(status_code=HTTPStatus.NOT_IMPLEMENTED, detail="Not implemented yet")

    @router.patch(
        path="/modules/{module_id}/status",
        response_model=ModuleDetail,
        responses={
            HTTPStatus.NOT_FOUND: {"model": HTTPErrorResponse},
            HTTPStatus.BAD_REQUEST: {"model": HTTPErrorResponse},
            HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse},
        },
        description="Manually update the status of a career readiness module (e.g. to reset it).",
    )
    async def _update_module_status(
        module_id: Annotated[str, Path(description="The module identifier slug.", examples=["cv-resume-creation"])],
        body: ModuleStatusUpdateRequest,  # noqa: ARG001
        user_info: UserInfo = Depends(authentication.get_user_info()),  # noqa: ARG001
    ):
        raise HTTPException(status_code=HTTPStatus.NOT_IMPLEMENTED, detail="Not implemented yet")

    @router.post(
        path="/modules/{module_id}/conversations",
        status_code=HTTPStatus.CREATED,
        response_model=CareerReadinessConversationResponse,
        responses={
            HTTPStatus.NOT_FOUND: {"model": HTTPErrorResponse},
            HTTPStatus.CONFLICT: {"model": HTTPErrorResponse},
            HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse},
        },
        description="Start a new conversation for a career readiness module. Returns the introductory message.",
    )
    async def _create_conversation(
        module_id: Annotated[str, Path(description="The module identifier slug.", examples=["cv-resume-creation"])],
        user_info: UserInfo = Depends(authentication.get_user_info()),  # noqa: ARG001
    ):
        raise HTTPException(status_code=HTTPStatus.NOT_IMPLEMENTED, detail="Not implemented yet")

    @router.post(
        path="/modules/{module_id}/conversations/{conversation_id}/messages",
        status_code=HTTPStatus.CREATED,
        response_model=CareerReadinessConversationResponse,
        responses={
            HTTPStatus.NOT_FOUND: {"model": HTTPErrorResponse},
            HTTPStatus.FORBIDDEN: {"model": HTTPErrorResponse},
            HTTPStatus.REQUEST_ENTITY_TOO_LARGE: {"model": HTTPErrorResponse},
            HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse},
        },
        description="Send a message in an active career readiness conversation and receive the AI response.",
    )
    async def _send_message(
        module_id: Annotated[str, Path(description="The module identifier slug.", examples=["cv-resume-creation"])],
        conversation_id: Annotated[str, Path(description="The conversation identifier.", examples=["conv_abc123"])],
        body: CareerReadinessConversationInput,  # noqa: ARG001
        user_info: UserInfo = Depends(authentication.get_user_info()),  # noqa: ARG001
    ):
        raise HTTPException(status_code=HTTPStatus.NOT_IMPLEMENTED, detail="Not implemented yet")

    @router.get(
        path="/modules/{module_id}/conversations/{conversation_id}/messages",
        response_model=CareerReadinessConversationResponse,
        responses={
            HTTPStatus.NOT_FOUND: {"model": HTTPErrorResponse},
            HTTPStatus.FORBIDDEN: {"model": HTTPErrorResponse},
            HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse},
        },
        description="Retrieve the full message history for a career readiness conversation.",
    )
    async def _get_conversation_history(
        module_id: Annotated[str, Path(description="The module identifier slug.", examples=["cv-resume-creation"])],
        conversation_id: Annotated[str, Path(description="The conversation identifier.", examples=["conv_abc123"])],
        user_info: UserInfo = Depends(authentication.get_user_info()),  # noqa: ARG001
    ):
        raise HTTPException(status_code=HTTPStatus.NOT_IMPLEMENTED, detail="Not implemented yet")

    @router.delete(
        path="/modules/{module_id}/conversations/{conversation_id}",
        status_code=HTTPStatus.NO_CONTENT,
        responses={
            HTTPStatus.NOT_FOUND: {"model": HTTPErrorResponse},
            HTTPStatus.FORBIDDEN: {"model": HTTPErrorResponse},
            HTTPStatus.INTERNAL_SERVER_ERROR: {"model": HTTPErrorResponse},
        },
        description="Delete a career readiness conversation and reset the module status to NOT_STARTED.",
    )
    async def _delete_conversation(
        module_id: Annotated[str, Path(description="The module identifier slug.", examples=["cv-resume-creation"])],
        conversation_id: Annotated[str, Path(description="The conversation identifier.", examples=["conv_abc123"])],
        user_info: UserInfo = Depends(authentication.get_user_info()),  # noqa: ARG001
    ):
        raise HTTPException(status_code=HTTPStatus.NOT_IMPLEMENTED, detail="Not implemented yet")

    app.include_router(router)
