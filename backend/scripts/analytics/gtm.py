"""GTM API operations for creating containers, tags, triggers, and variables."""

import time

# GTM API has a rate limit of 0.25 QPS (1 request per 4 seconds)
GTM_API_DELAY_SECONDS = 4

# Custom events to track
CUSTOM_EVENTS = [
    {
        "name": "user_registered",
        "parameters": [{"key": "method", "type": "template"}],
    },
    {
        "name": "user_login",
        "parameters": [{"key": "method", "type": "template"}],
    },
]


def create_gtm_container(tagmanager, account_id: str, container_name: str) -> dict:
    """Create a GTM web container."""
    print(f"\nCreating GTM container '{container_name}'...")
    body = {
        "name": container_name,
        "usageContext": ["web"],
    }
    container = tagmanager.accounts().containers().create(
        parent=f"accounts/{account_id}",
        body=body,
    ).execute()

    print(f"  Created container: {container['name']}")
    print(f"  Container ID: {container['publicId']}")
    return container


def get_default_workspace(tagmanager, container_path: str) -> dict:
    """Get the default workspace for a container."""
    time.sleep(GTM_API_DELAY_SECONDS)
    workspaces = tagmanager.accounts().containers().workspaces().list(
        parent=container_path,
    ).execute()

    workspace = workspaces["workspace"][0]
    print(f"  Using workspace: {workspace['name']}")
    return workspace


def create_gtm_variable(tagmanager, workspace_path: str, name: str, value: str) -> dict:
    """Create a constant variable in GTM."""
    time.sleep(GTM_API_DELAY_SECONDS)
    print(f"  Creating variable: {name}...")
    body = {
        "name": name,
        "type": "c",
        "parameter": [
            {"type": "template", "key": "value", "value": value},
        ],
    }
    return tagmanager.accounts().containers().workspaces().variables().create(
        parent=workspace_path,
        body=body,
    ).execute()


def create_gtm_custom_event_trigger(tagmanager, workspace_path: str, event_name: str) -> dict:
    """Create a custom event trigger in GTM."""
    time.sleep(GTM_API_DELAY_SECONDS)
    trigger_name = f"CE - {event_name}"
    print(f"  Creating trigger: {trigger_name}...")
    body = {
        "name": trigger_name,
        "type": "customEvent",
        "customEventFilter": [
            {
                "type": "equals",
                "parameter": [
                    {"type": "template", "key": "arg0", "value": "{{_event}}"},
                    {"type": "template", "key": "arg1", "value": event_name},
                ],
            }
        ],
    }
    return tagmanager.accounts().containers().workspaces().triggers().create(
        parent=workspace_path,
        body=body,
    ).execute()


def create_gtm_ga4_config_tag(tagmanager, workspace_path: str, measurement_id_var: str) -> dict:
    """Create a GA4 Configuration tag (Google Tag) that fires on all pages.

    Page view tracking is disabled here because the app uses HashRouter (URLs like /#/path),
    and GA4's default page_view only sees "/" as the path. Instead, page views are tracked
    by a separate tag that normalizes hash URLs into proper paths for GA4 reporting.
    See create_gtm_page_view_tag().
    """
    time.sleep(GTM_API_DELAY_SECONDS)
    print("  Creating GA4 Config tag...")
    body = {
        "name": "GA4 Config",
        "type": "gaawc",
        "parameter": [
            {"type": "template", "key": "measurementId", "value": f"{{{{{measurement_id_var}}}}}"},
            {"type": "boolean", "key": "sendPageView", "value": "false"},
        ],
        # Fire on All Pages (built-in trigger ID)
        "firingTriggerId": ["2147479553"],
    }
    return tagmanager.accounts().containers().workspaces().tags().create(
        parent=workspace_path,
        body=body,
    ).execute()


def create_gtm_virtual_page_url_variable(tagmanager, workspace_path: str) -> dict:
    """Create a Custom JavaScript variable that normalizes hash-based URLs.

    The app uses HashRouter, so URLs look like https://example.com/#/skills-interests.
    GA4 extracts page_path from page_location, but the hash fragment is not part of the URL path,
    so GA4 only ever sees "/". This variable converts the hash into a proper path:
      https://example.com/#/skills-interests → https://example.com/skills-interests
    """
    time.sleep(GTM_API_DELAY_SECONDS)
    print("  Creating Custom JS Variable: Virtual Page URL...")
    js_code = (
        "function() {"
        " var hash = window.location.hash;"
        " if (hash && hash.length > 1) {"
        " return window.location.origin + hash.substring(1);"
        " }"
        " return window.location.href;"
        " }"
    )
    body = {
        "name": "Virtual Page URL",
        "type": "jsm",
        "parameter": [
            {"type": "template", "key": "javascript", "value": js_code},
        ],
    }
    return tagmanager.accounts().containers().workspaces().variables().create(
        parent=workspace_path,
        body=body,
    ).execute()


def create_gtm_history_change_trigger(tagmanager, workspace_path: str) -> dict:
    """Create a History Change trigger that fires on hash-based route navigation."""
    time.sleep(GTM_API_DELAY_SECONDS)
    print("  Creating trigger: History Change - SPA Navigation...")
    body = {
        "name": "History Change - SPA Navigation",
        "type": "historyChange",
    }
    return tagmanager.accounts().containers().workspaces().triggers().create(
        parent=workspace_path,
        body=body,
    ).execute()


def create_gtm_page_view_tag(
    tagmanager, workspace_path: str, measurement_id_var: str, history_trigger_id: str
) -> dict:
    """Create a GA4 page_view event tag that fires on initial load and SPA navigation.

    Uses the Virtual Page URL variable to override page_location so that
    hash-based routes (/#/path) appear as proper paths (/path) in GA4 reports.
    """
    time.sleep(GTM_API_DELAY_SECONDS)
    print("  Creating tag: GA4 Page View (SPA)...")
    body = {
        "name": "GA4 Page View - SPA",
        "type": "gaawe",
        "parameter": [
            {"type": "template", "key": "eventName", "value": "page_view"},
            {"type": "template", "key": "measurementIdOverride", "value": f"{{{{{measurement_id_var}}}}}"},
            {
                "type": "list",
                "key": "eventParameters",
                "list": [
                    {
                        "type": "map",
                        "map": [
                            {"type": "template", "key": "name", "value": "page_location"},
                            {"type": "template", "key": "value", "value": "{{Virtual Page URL}}"},
                        ],
                    },
                ],
            },
        ],
        # Fire on All Pages (initial load) + History Change (SPA navigation)
        "firingTriggerId": ["2147479553", history_trigger_id],
    }
    return tagmanager.accounts().containers().workspaces().tags().create(
        parent=workspace_path,
        body=body,
    ).execute()


def create_gtm_ga4_event_tag(
    tagmanager, workspace_path: str, event_name: str,
    trigger_id: str, measurement_id_var: str, event_params: list
) -> dict:
    """Create a GA4 Event tag."""
    time.sleep(GTM_API_DELAY_SECONDS)
    tag_name = f"GA4 Event - {event_name}"
    print(f"  Creating tag: {tag_name}...")

    # Build event parameters list for the tag
    param_list = []
    for param in event_params:
        param_list.append({
            "type": "map",
            "map": [
                {"type": "template", "key": "name", "value": param["key"]},
                {"type": "template", "key": "value", "value": f"{{{{{param['key']}}}}}"},
            ],
        })

    parameters = [
        {"type": "template", "key": "eventName", "value": event_name},
        {"type": "template", "key": "measurementIdOverride", "value": f"{{{{{measurement_id_var}}}}}"},
    ]

    if param_list:
        parameters.append({
            "type": "list",
            "key": "eventParameters",
            "list": param_list,
        })

    body = {
        "name": tag_name,
        "type": "gaawe",
        "parameter": parameters,
        "firingTriggerId": [trigger_id],
    }
    return tagmanager.accounts().containers().workspaces().tags().create(
        parent=workspace_path,
        body=body,
    ).execute()


def create_gtm_data_layer_variables(tagmanager, workspace_path: str) -> None:
    """Create Data Layer Variables for event parameters."""
    # Collect all unique parameter keys across events
    created_vars = set()
    for event in CUSTOM_EVENTS:
        for param in event["parameters"]:
            param_key = param["key"]
            if param_key not in created_vars:
                time.sleep(GTM_API_DELAY_SECONDS)
                print(f"  Creating Data Layer Variable: {param_key}...")
                body = {
                    "name": param_key,
                    "type": "v",
                    "parameter": [
                        {"type": "integer", "key": "dataLayerVersion", "value": "2"},
                        {"type": "boolean", "key": "setDefaultValue", "value": "false"},
                        {"type": "template", "key": "name", "value": param_key},
                    ],
                }
                tagmanager.accounts().containers().workspaces().variables().create(
                    parent=workspace_path,
                    body=body,
                ).execute()
                created_vars.add(param_key)


def publish_gtm_version(tagmanager, workspace_path: str) -> dict:
    """Create and publish a GTM container version."""
    time.sleep(GTM_API_DELAY_SECONDS)
    print("\nPublishing GTM container version...")
    version = tagmanager.accounts().containers().workspaces().create_version(
        path=workspace_path,
        body={
            "name": "Initial analytics setup",
            "notes": "Automated GA4+GTM setup by setup_analytics.py",
        },
    ).execute()

    container_version = version.get("containerVersion", {})
    version_id = container_version.get("containerVersionId", "")

    # Extract the container path from the workspace path
    container_path = "/".join(workspace_path.split("/")[:4])

    time.sleep(GTM_API_DELAY_SECONDS)
    tagmanager.accounts().containers().versions().publish(
        path=f"{container_path}/versions/{version_id}",
    ).execute()

    print(f"  Published version {version_id}")
    return version
