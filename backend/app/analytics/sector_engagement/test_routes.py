"""
Tests for the sector engagement analytics routes.
"""
from datetime import datetime
from http import HTTPStatus
from typing import Generator
from unittest.mock import AsyncMock

import pytest
from fastapi import FastAPI, APIRouter
from starlette.testclient import TestClient

from app.analytics.sector_engagement.routes import add_sector_engagement_routes
from app.metrics.services.get_metrics_service import get_metrics_service
from app.metrics.services.service import IMetricsService
from common_libs.test_utilities.mock_auth import MockAuth, UnauthenticatedMockAuth

TestClientWithMocks = tuple[TestClient, IMetricsService]


def _create_test_client_with_mocks(auth) -> TestClientWithMocks:
    """
    Factory function to create a test client with mocked dependencies.
    """

    # Mock the metrics service
    class MockedMetricsService(IMetricsService):
        async def record_event(self, event) -> None:
            raise NotImplementedError()

        async def bulk_record_events(self, events) -> None:
            raise NotImplementedError()

        async def get_aggregated_sector_engagement(self) -> list[dict]:
            raise NotImplementedError()

        async def get_sector_engagement_for_user(self, user_id: str) -> list[dict]:
            raise NotImplementedError()

    mocked_metrics_service = MockedMetricsService()

    # Set up the FastAPI app with the mocked dependencies
    app = FastAPI()

    # Set up the app dependency override
    app.dependency_overrides[get_metrics_service] = lambda: mocked_metrics_service

    # Add the sector engagement routes via a router (matching main's pattern)
    router = APIRouter(prefix="/analytics", tags=["analytics"])
    add_sector_engagement_routes(router, auth)
    app.include_router(router)

    # Create a test client
    client = TestClient(app, raise_server_exceptions=False)

    return client, mocked_metrics_service


@pytest.fixture(scope="function")
def authenticated_client_with_mocks() -> Generator[TestClientWithMocks, None, None]:
    """
    Returns a test client with authenticated mock auth.
    """
    _instance_auth = MockAuth()
    client, service = _create_test_client_with_mocks(_instance_auth)
    yield client, service


@pytest.fixture(scope="function")
def unauthenticated_client_with_mocks() -> Generator[TestClientWithMocks, None, None]:
    """
    Returns a test client with unauthenticated mock auth.
    """
    _instance_auth = UnauthenticatedMockAuth()
    client, service = _create_test_client_with_mocks(_instance_auth)
    yield client, service


class TestGetSectorEngagementSummary:
    """Tests for the GET /analytics/sector-engagement endpoint."""

    def test_returns_200_with_sector_engagement_data_when_authenticated(
        self,
        authenticated_client_with_mocks: TestClientWithMocks,
    ):
        client, mocked_service = authenticated_client_with_mocks

        # GIVEN a metrics service that returns aggregated sector engagement data
        given_sector_data = [
            {"sector_name": "Agriculture", "is_priority": True, "total_inquiries": 100, "unique_users": 20},
            {"sector_name": "Tech/ICT", "is_priority": False, "total_inquiries": 50, "unique_users": 10},
        ]
        mocked_service.get_aggregated_sector_engagement = AsyncMock(return_value=given_sector_data)

        # WHEN the endpoint is called by an authenticated user
        actual_response = client.get("/analytics/sector-engagement")

        # THEN the response status is OK
        assert actual_response.status_code == HTTPStatus.OK

        # AND the response body contains the sector engagement data
        actual_body = actual_response.json()
        assert len(actual_body["data"]) == 2
        assert actual_body["data"][0]["sector_name"] == "Agriculture"
        assert actual_body["data"][0]["is_priority"] is True
        assert actual_body["data"][0]["total_inquiries"] == 100
        assert actual_body["data"][0]["unique_users"] == 20
        assert actual_body["data"][1]["sector_name"] == "Tech/ICT"
        assert actual_body["data"][1]["is_priority"] is False
        assert actual_body["data"][1]["total_inquiries"] == 50
        assert actual_body["data"][1]["unique_users"] == 10

        # AND the meta section contains the correct total sectors count
        assert actual_body["meta"]["total_sectors"] == 2

        # AND the metrics service was called once
        mocked_service.get_aggregated_sector_engagement.assert_called_once()

    def test_returns_401_when_not_authenticated(
        self,
        unauthenticated_client_with_mocks: TestClientWithMocks,
    ):
        client, mocked_service = unauthenticated_client_with_mocks

        # GIVEN a metrics service (should not be called)
        mocked_service.get_aggregated_sector_engagement = AsyncMock()

        # WHEN the endpoint is called without authentication
        actual_response = client.get("/analytics/sector-engagement")

        # THEN the response status is UNAUTHORIZED
        assert actual_response.status_code == HTTPStatus.UNAUTHORIZED

        # AND the metrics service was not called
        mocked_service.get_aggregated_sector_engagement.assert_not_called()

    def test_returns_500_when_service_raises_exception(
        self,
        authenticated_client_with_mocks: TestClientWithMocks,
    ):
        client, mocked_service = authenticated_client_with_mocks

        # GIVEN a metrics service that raises an exception
        mocked_service.get_aggregated_sector_engagement = AsyncMock(
            side_effect=Exception("Database connection failed")
        )

        # WHEN the endpoint is called by an authenticated user
        actual_response = client.get("/analytics/sector-engagement")

        # THEN the response status is INTERNAL SERVER ERROR
        assert actual_response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR


class TestGetMySectorEngagement:
    """Tests for the GET /analytics/sector-engagement/me endpoint."""

    def test_returns_200_with_user_sector_engagement_data_when_authenticated(
        self,
        authenticated_client_with_mocks: TestClientWithMocks,
    ):
        client, mocked_service = authenticated_client_with_mocks

        # GIVEN a metrics service that returns per-user sector engagement data
        given_timestamp = datetime(2026, 3, 18, 12, 0, 0)
        given_user_data = [
            {
                "sector_name": "Agriculture",
                "is_priority": True,
                "inquiry_count": 5,
                "timestamp": given_timestamp,
            },
            {
                "sector_name": "Education",
                "is_priority": False,
                "inquiry_count": 3,
                "timestamp": given_timestamp,
            },
        ]
        mocked_service.get_sector_engagement_for_user = AsyncMock(return_value=given_user_data)

        # WHEN the endpoint is called by an authenticated user
        actual_response = client.get("/analytics/sector-engagement/me")

        # THEN the response status is OK
        assert actual_response.status_code == HTTPStatus.OK

        # AND the response body contains the user's sector engagement data
        actual_body = actual_response.json()
        assert len(actual_body["data"]) == 2
        assert actual_body["data"][0]["sector_name"] == "Agriculture"
        assert actual_body["data"][0]["is_priority"] is True
        assert actual_body["data"][0]["inquiry_count"] == 5
        expected_last_asked_at = given_timestamp.isoformat() + "Z"
        assert actual_body["data"][0]["last_asked_at"] == expected_last_asked_at
        assert actual_body["data"][1]["sector_name"] == "Education"
        assert actual_body["data"][1]["is_priority"] is False
        assert actual_body["data"][1]["inquiry_count"] == 3
        assert actual_body["data"][1]["last_asked_at"] == expected_last_asked_at

        # AND the meta section contains the correct total sectors count
        assert actual_body["meta"]["total_sectors"] == 2

        # AND the metrics service was called with the authenticated user's ID
        actual_call_args = mocked_service.get_sector_engagement_for_user.call_args
        assert actual_call_args is not None
        assert actual_call_args[0][0] is not None  # user_id was passed

    def test_returns_401_when_not_authenticated(
        self,
        unauthenticated_client_with_mocks: TestClientWithMocks,
    ):
        client, mocked_service = unauthenticated_client_with_mocks

        # GIVEN a metrics service (should not be called)
        mocked_service.get_sector_engagement_for_user = AsyncMock()

        # WHEN the endpoint is called without authentication
        actual_response = client.get("/analytics/sector-engagement/me")

        # THEN the response status is UNAUTHORIZED
        assert actual_response.status_code == HTTPStatus.UNAUTHORIZED

        # AND the metrics service was not called
        mocked_service.get_sector_engagement_for_user.assert_not_called()

    def test_returns_500_when_service_raises_exception(
        self,
        authenticated_client_with_mocks: TestClientWithMocks,
    ):
        client, mocked_service = authenticated_client_with_mocks

        # GIVEN a metrics service that raises an exception
        mocked_service.get_sector_engagement_for_user = AsyncMock(
            side_effect=Exception("Database connection failed")
        )

        # WHEN the endpoint is called by an authenticated user
        actual_response = client.get("/analytics/sector-engagement/me")

        # THEN the response status is INTERNAL SERVER ERROR
        assert actual_response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
