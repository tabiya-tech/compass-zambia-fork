"""
Tests for the plain personal data routes.
"""
from http import HTTPStatus
from typing import Optional

import pytest
import pytest_mock
from fastapi import FastAPI, APIRouter
from fastapi.testclient import TestClient

from app.users.auth import UserInfo
from app.users.plain_personal_data.errors import UserPreferencesNotFoundError
from app.users.plain_personal_data.routes import add_user_plain_personal_data_routes, get_plain_personal_data_service
from app.users.plain_personal_data.service import IPlainPersonalDataService
from app.users.plain_personal_data.types import PlainPersonalData
from common_libs.test_utilities.mock_auth import MockAuth
from common_libs.test_utilities.random_data import get_random_user_id
from datetime import datetime, timezone

TestClientWithMocks = tuple[TestClient, IPlainPersonalDataService, UserInfo | None]


@pytest.fixture(scope="function")
def client_with_mocks() -> TestClientWithMocks:
    class MockPlainPersonalDataService(IPlainPersonalDataService):
        async def upsert(self, user_id: str, data: dict) -> None:
            return None

        async def get(self, user_id: str) -> Optional[PlainPersonalData]:
            return PlainPersonalData(
                user_id=user_id,
                created_at=datetime(2025, 1, 1, tzinfo=timezone.utc),
                updated_at=datetime(2025, 1, 1, tzinfo=timezone.utc),
                data={"age": "25"},
            )

    _instance_service = MockPlainPersonalDataService()

    def _mocked_get_service() -> IPlainPersonalDataService:
        return _instance_service

    _instance_auth = MockAuth()

    api_router = APIRouter()
    app = FastAPI()

    app.dependency_overrides[get_plain_personal_data_service] = _mocked_get_service

    add_user_plain_personal_data_routes(api_router, auth=_instance_auth)
    app.include_router(api_router)

    yield TestClient(app), _instance_service, _instance_auth.mocked_user
    app.dependency_overrides = {}


class TestHandleUpsertPlainPersonalData:
    @pytest.mark.asyncio
    async def test_upsert_success_returns_200(self, client_with_mocks: TestClientWithMocks, mocker: pytest_mock.MockerFixture):
        client, mocked_service, mocked_authed_user = client_with_mocks

        # GIVEN a valid payload and the authenticated user's id
        given_user_id = mocked_authed_user.user_id
        given_payload = {"data": {"age": "25"}}

        upsert_spy = mocker.spy(mocked_service, "upsert")

        # WHEN a POST request is made
        response = client.post(f"/{given_user_id}/plain-personal-data", json=given_payload)

        # THEN the response is 200 OK
        assert response.status_code == HTTPStatus.OK

        # AND upsert was called with the correct arguments
        upsert_spy.assert_called_once_with(given_user_id, {"age": "25"})

    @pytest.mark.asyncio
    async def test_upsert_forbidden_when_user_id_mismatch(self, client_with_mocks: TestClientWithMocks):
        client, _, _ = client_with_mocks

        # GIVEN a different user_id in the path than the authenticated user
        different_user_id = get_random_user_id()
        given_payload = {"data": {"age": "25"}}

        # WHEN a POST request is made
        response = client.post(f"/{different_user_id}/plain-personal-data", json=given_payload)

        # THEN the response is 403 FORBIDDEN
        assert response.status_code == HTTPStatus.FORBIDDEN

    @pytest.mark.asyncio
    async def test_upsert_returns_404_when_user_preferences_not_found(
        self, client_with_mocks: TestClientWithMocks, mocker: pytest_mock.MockerFixture
    ):
        client, mocked_service, mocked_authed_user = client_with_mocks

        # GIVEN upsert raises UserPreferencesNotFoundError
        given_user_id = mocked_authed_user.user_id
        mocker.patch.object(mocked_service, "upsert", side_effect=UserPreferencesNotFoundError(given_user_id))

        # WHEN a POST request is made
        response = client.post(f"/{given_user_id}/plain-personal-data", json={"data": {"age": "25"}})

        # THEN the response is 404 NOT FOUND
        assert response.status_code == HTTPStatus.NOT_FOUND


class TestHandleGetPlainPersonalData:
    @pytest.mark.asyncio
    async def test_get_success_returns_200(self, client_with_mocks: TestClientWithMocks):
        client, _, mocked_authed_user = client_with_mocks

        # GIVEN the authenticated user's id
        given_user_id = mocked_authed_user.user_id

        # WHEN a GET request is made
        response = client.get(f"/{given_user_id}/plain-personal-data")

        # THEN the response is 200 OK
        assert response.status_code == HTTPStatus.OK
        body = response.json()
        assert body["user_id"] == given_user_id
        assert body["data"] == {"age": "25"}

    @pytest.mark.asyncio
    async def test_get_forbidden_when_user_id_mismatch(self, client_with_mocks: TestClientWithMocks):
        client, _, _ = client_with_mocks

        # GIVEN a different user_id in the path
        different_user_id = get_random_user_id()

        # WHEN a GET request is made
        response = client.get(f"/{different_user_id}/plain-personal-data")

        # THEN the response is 403 FORBIDDEN
        assert response.status_code == HTTPStatus.FORBIDDEN

    @pytest.mark.asyncio
    async def test_get_returns_404_when_not_found(
        self, client_with_mocks: TestClientWithMocks, mocker: pytest_mock.MockerFixture
    ):
        client, mocked_service, mocked_authed_user = client_with_mocks

        # GIVEN get returns None (no data)
        given_user_id = mocked_authed_user.user_id
        mocker.patch.object(mocked_service, "get", return_value=None)

        # WHEN a GET request is made
        response = client.get(f"/{given_user_id}/plain-personal-data")

        # THEN the response is 404 NOT FOUND
        assert response.status_code == HTTPStatus.NOT_FOUND
