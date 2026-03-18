"""Tests for setup_analytics.py — focused on functions that modify existing state."""

import json
from unittest.mock import MagicMock, patch

import pytest

from setup_analytics import (
    step_spa_tracking,
    step_publish,
    update_config,
    run_inject_config,
)


@pytest.fixture(autouse=True)
def _skip_api_delays():
    """Patch time.sleep globally so tests don't wait for GTM API rate limits."""
    with patch("setup_analytics.time.sleep"), patch("gtm.time.sleep"):
        yield


class TestUpdateConfig:
    """Tests for update_config() — merges analytics IDs into an existing config file."""

    def test_merges_analytics_into_existing_config(self, tmp_path):
        # GIVEN an existing config file with branding and no analytics section
        given_config_path = tmp_path / "config.json"
        given_config_path.write_text(json.dumps({
            "branding": {"appName": "Compass"},
        }))
        # AND analytics IDs to add
        given_updates = {
            "ga4AccountId": "111",
            "ga4PropertyId": "222",
            "ga4MeasurementId": "G-XXXXX",
        }

        # WHEN update_config is called
        update_config(given_config_path, given_updates)

        # THEN expect the config file to contain the analytics section
        actual_config = json.loads(given_config_path.read_text())
        assert actual_config["analytics"]["ga4AccountId"] == "111"
        assert actual_config["analytics"]["ga4PropertyId"] == "222"
        assert actual_config["analytics"]["ga4MeasurementId"] == "G-XXXXX"
        # AND expect analytics to be enabled
        assert actual_config["analytics"]["enabled"] is True
        # AND expect the existing branding section to be preserved
        assert actual_config["branding"]["appName"] == "Compass"

    def test_merges_into_existing_analytics_section(self, tmp_path):
        # GIVEN an existing config file with an analytics section
        given_config_path = tmp_path / "config.json"
        given_config_path.write_text(json.dumps({
            "analytics": {
                "ga4AccountId": "old-id",
                "gtmContainerId": "GTM-OLD",
            },
        }))
        # AND new analytics IDs to merge
        given_updates = {
            "ga4AccountId": "new-id",
            "ga4MeasurementId": "G-NEW",
        }

        # WHEN update_config is called
        update_config(given_config_path, given_updates)

        # THEN expect the updated fields to be overwritten
        actual_config = json.loads(given_config_path.read_text())
        assert actual_config["analytics"]["ga4AccountId"] == "new-id"
        assert actual_config["analytics"]["ga4MeasurementId"] == "G-NEW"
        # AND expect the existing fields to be preserved
        assert actual_config["analytics"]["gtmContainerId"] == "GTM-OLD"


class TestRunInjectConfig:
    """Tests for run_inject_config() — calls inject-config.py subprocess."""

    @patch("setup_analytics.subprocess.run")
    def test_calls_inject_script_with_correct_args(self, mock_subprocess_run, tmp_path):
        # GIVEN an existing inject-config.py script in the config directory
        given_config_path = tmp_path / "config" / "default.json"
        given_config_path.parent.mkdir(parents=True)
        given_config_path.write_text("{}")
        given_inject_script = given_config_path.parent / "inject-config.py"
        given_inject_script.write_text("# placeholder")

        # WHEN run_inject_config is called
        run_inject_config(given_config_path)

        # THEN expect subprocess.run to be called with the inject script path
        mock_subprocess_run.assert_called_once()
        actual_args = mock_subprocess_run.call_args
        actual_cmd = actual_args[0][0]
        # AND expect the command to include the config path and analytics namespace
        assert str(given_inject_script) in actual_cmd
        assert "--config" in actual_cmd
        assert str(given_config_path) in actual_cmd
        assert "--namespaces" in actual_cmd
        assert "analytics" in actual_cmd

    @patch("setup_analytics.subprocess.run")
    def test_skips_when_inject_script_missing(self, mock_subprocess_run, tmp_path):
        # GIVEN a config path where inject-config.py does NOT exist
        given_config_path = tmp_path / "config" / "default.json"
        given_config_path.parent.mkdir(parents=True)
        given_config_path.write_text("{}")

        # WHEN run_inject_config is called
        run_inject_config(given_config_path)

        # THEN expect subprocess.run NOT to be called
        mock_subprocess_run.assert_not_called()


def _make_mock_tagmanager(existing_variables=None, trigger_id="99"):
    """Helper to create a mock tagmanager client with common response patterns."""
    mock = MagicMock()

    # Workspace list response
    mock.accounts().containers().workspaces().list().execute.return_value = {
        "workspace": [{"path": "accounts/123/containers/456/workspaces/1", "name": "Default"}],
    }

    # Variable list response (for checking existing variables)
    mock.accounts().containers().workspaces().variables().list().execute.return_value = {
        "variable": [{"name": v} for v in (existing_variables or [])],
    }

    # Trigger creation response
    mock.accounts().containers().workspaces().triggers().create().execute.return_value = {
        "triggerId": trigger_id,
    }

    # Version creation response
    mock.accounts().containers().workspaces().create_version().execute.return_value = {
        "containerVersion": {"containerVersionId": "1"},
    }

    return mock


class TestStepSpaTracking:
    """Tests for step_spa_tracking() — adds SPA page view tracking to an existing container."""

    def test_creates_all_spa_resources(self):
        # GIVEN an existing GTM container with no measurement ID variable
        given_tagmanager = _make_mock_tagmanager(existing_variables=[])
        given_container_path = "accounts/123/containers/456"
        given_measurement_id = "G-XXXXX"

        # WHEN step_spa_tracking is called
        step_spa_tracking(given_tagmanager, given_container_path, given_measurement_id)

        # THEN expect variables().create() to be called (measurement ID + Virtual Page URL)
        actual_var_calls = given_tagmanager.accounts().containers().workspaces().variables().create.call_args_list
        assert len(actual_var_calls) >= 2
        # AND expect triggers().create() to be called (History Change trigger)
        given_tagmanager.accounts().containers().workspaces().triggers().create.assert_called()
        # AND expect tags().create() to be called (Page View tag)
        given_tagmanager.accounts().containers().workspaces().tags().create.assert_called()

    def test_skips_measurement_id_variable_when_exists(self):
        # GIVEN an existing GTM container that already has the measurement ID variable
        given_tagmanager = _make_mock_tagmanager(existing_variables=["GA4 Measurement ID"])
        given_container_path = "accounts/123/containers/456"
        given_measurement_id = "G-XXXXX"

        # WHEN step_spa_tracking is called
        step_spa_tracking(given_tagmanager, given_container_path, given_measurement_id)

        # THEN expect variables().create() to be called only once (Virtual Page URL, not measurement ID)
        actual_var_create_calls = given_tagmanager.accounts().containers().workspaces().variables().create.call_args_list
        assert len(actual_var_create_calls) == 1

    def test_page_view_tag_uses_history_trigger_id(self):
        # GIVEN a container where the history trigger will return ID "42"
        given_trigger_id = "42"
        given_tagmanager = _make_mock_tagmanager(
            existing_variables=["GA4 Measurement ID"],
            trigger_id=given_trigger_id,
        )
        given_container_path = "accounts/123/containers/456"
        given_measurement_id = "G-XXXXX"

        # WHEN step_spa_tracking is called
        step_spa_tracking(given_tagmanager, given_container_path, given_measurement_id)

        # THEN expect the page view tag to include the history trigger ID in its firing triggers
        actual_tag_call = given_tagmanager.accounts().containers().workspaces().tags().create.call_args
        actual_body = actual_tag_call[1]["body"]
        assert given_trigger_id in actual_body["firingTriggerId"]


class TestStepPublish:
    """Tests for step_publish() — publishes an existing GTM container."""

    def test_creates_version_and_publishes(self):
        # GIVEN an existing GTM container
        given_tagmanager = _make_mock_tagmanager()
        given_container_path = "accounts/123/containers/456"

        # WHEN step_publish is called
        step_publish(given_tagmanager, given_container_path)

        # THEN expect a container version to be created
        given_tagmanager.accounts().containers().workspaces().create_version.assert_called()
        # AND expect the version to be published
        given_tagmanager.accounts().containers().versions().publish.assert_called()
