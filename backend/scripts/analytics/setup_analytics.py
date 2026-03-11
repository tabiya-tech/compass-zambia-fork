#!/usr/bin/env python3
"""
Automated GA4 + GTM setup for Compass forks.

Creates a GA4 property with web data stream, a GTM container with tags/triggers/variables
for tracking user_registered and user_login events, publishes the GTM version, and updates
the fork's config JSON with the generated IDs.

The script supports step-by-step execution via --step (ga4, gtm, publish, config) to allow
resuming after partial failures. Checkpoints are saved to the config file after each major step.

Prerequisites:
  1. GA4 account created at analytics.google.com
  2. GTM account created at tagmanager.google.com
  3. Service account created in GCP project with JSON key downloaded
  4. Service account email added as Editor in GA4 and as Publisher in GTM
  5. Google Analytics Admin API and Tag Manager API enabled in GCP project

Usage:
  # Full run (all steps):
  python3 setup_analytics.py \\
    --ga4-account-id 123456789 \\
    --gtm-account-id 987654321 \\
    --url "https://your-fork.compass.tabiya.tech" \\
    --config ../../config/default.json \\
    --credentials path/to/service_account_key.json

  # Resume from a specific step after failure:
  python3 setup_analytics.py \\
    --ga4-account-id 123456789 \\
    --gtm-account-id 987654321 \\
    --url "https://your-fork.compass.tabiya.tech" \\
    --config ../../config/default.json \\
    --credentials path/to/service_account_key.json \\
    --step publish \\
    --gtm-container-path accounts/123/containers/456

Dependencies:
  pip install -r requirements.txt

For full documentation, see config/ANALYTICS_SETUP.md (from repo root)
"""

import argparse
import json
import subprocess  # nosec B404 - subprocess is used to call inject-config.py with validated paths
import sys
import time
from pathlib import Path


try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    print("Missing dependencies. Install with: pip install -r requirements.txt")
    sys.exit(1)

SCOPES = [
    "https://www.googleapis.com/auth/analytics.edit",
    "https://www.googleapis.com/auth/tagmanager.edit.containers",
    "https://www.googleapis.com/auth/tagmanager.edit.containerversions",
    "https://www.googleapis.com/auth/tagmanager.publish",
]

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


def authenticate(credentials_path: str) -> service_account.Credentials:
    """Authenticate using a GCP service account key file."""
    if not credentials_path:
        print("Error: --credentials is required (path to service account JSON key file).")
        sys.exit(1)

    credentials_file = Path(credentials_path)
    if not credentials_file.exists():
        print(f"Error: Credentials file not found: {credentials_path}")
        sys.exit(1)

    print(f"Authenticating with service account: {credentials_path}")
    creds = service_account.Credentials.from_service_account_file(
        str(credentials_file),
        scopes=SCOPES,
    )
    print(f"  Service account: {creds.service_account_email}")
    return creds


def create_ga4_property(analytics_admin, account_id: str, property_name: str) -> dict:
    """Create a GA4 property."""
    print(f"\nCreating GA4 property '{property_name}'...")
    body = {
        "parent": f"accounts/{account_id}",
        "displayName": property_name,
        "timeZone": "UTC",
        "currencyCode": "USD",
    }
    prop = analytics_admin.properties().create(
        body=body,
    ).execute()

    # Link to account
    property_id = prop["name"].split("/")[-1]
    print(f"  Created property: {prop['name']} (ID: {property_id})")
    return prop


def create_ga4_data_stream(analytics_admin, property_name: str, url: str, display_name: str) -> dict:
    """Create a web data stream for a GA4 property."""
    print(f"\nCreating GA4 web data stream for {url}...")
    body = {
        "type": "WEB_DATA_STREAM",
        "webStreamData": {
            "defaultUri": url,
        },
        "displayName": f"{display_name} Web Stream",
    }
    stream = analytics_admin.properties().dataStreams().create(
        parent=property_name,
        body=body,
    ).execute()

    measurement_id = stream.get("webStreamData", {}).get("measurementId", "")
    print(f"  Created data stream: {stream['name']}")
    print(f"  Measurement ID: {measurement_id}")
    return stream


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
    """Create a GA4 Configuration tag (Google Tag) that fires on all pages."""
    time.sleep(GTM_API_DELAY_SECONDS)
    print("  Creating GA4 Config tag...")
    body = {
        "name": "GA4 Config",
        "type": "gaawc",
        "parameter": [
            {"type": "template", "key": "measurementId", "value": f"{{{{{measurement_id_var}}}}}"},
            {"type": "boolean", "key": "sendPageView", "value": "true"},
        ],
        # Fire on All Pages (built-in trigger ID)
        "firingTriggerId": ["2147479553"],
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


def update_config(config_path: Path, updates: dict) -> None:
    """Update the config JSON with generated analytics IDs."""
    config = json.loads(config_path.read_text())

    if "analytics" not in config:
        config["analytics"] = {}

    config["analytics"].update(updates)
    config["analytics"]["enabled"] = True

    config_path.write_text(json.dumps(config, indent=2, ensure_ascii=False) + "\n")
    print(f"\nUpdated {config_path} with analytics configuration")


def run_inject_config(config_path: Path) -> None:
    """Run inject-config.py to propagate config to env.js."""
    inject_script = config_path.parent / "inject-config.py"
    if inject_script.exists():
        print("\nRunning inject-config.py to propagate GTM container ID...")
        subprocess.run(  # nosec B603 - arguments are constructed from validated Path objects, not user input
            [sys.executable, str(inject_script), "--config", str(config_path), "--namespaces", "analytics"],
            cwd=str(config_path.parent),
            check=True,
        )
        print("Config injection complete")
    else:
        print(f"\nWarning: inject-config.py not found at {inject_script}. Run it manually.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Automated GA4 + GTM setup for Compass forks",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 setup_analytics.py \\
    --ga4-account-id 123456789 \\
    --gtm-account-id 987654321 \\
    --url "https://njira.compass.tabiya.tech" \\
    --config ../../config/default.json \\
    --credentials path/to/service_account_key.json

Prerequisites:
  1. Create a GA4 account at analytics.google.com
  2. Create a GTM account at tagmanager.google.com
  3. Create a service account in GCP and download the JSON key
  4. Add the service account email as Editor in GA4 and Publisher in GTM
  5. Enable Analytics Admin API and Tag Manager API in GCP
        """,
    )
    parser.add_argument("--ga4-account-id", required=True, help="GA4 account ID (numeric)")
    parser.add_argument("--gtm-account-id", required=True, help="GTM account ID (numeric)")
    parser.add_argument("--url", required=True, help="Deployed URL of the fork (e.g., https://njira.compass.tabiya.tech)")
    default_config = str(Path(__file__).parent.parent.parent.parent / "config" / "default.json")
    parser.add_argument("--config", default=default_config, help="Config JSON file to update (default: config/default.json)")
    parser.add_argument("--credentials", required=True, help="Path to service account JSON key file")
    parser.add_argument("--property-name", default=None, help="GA4 property name (defaults to appName from config)")
    parser.add_argument("--dry-run", action="store_true", help="Validate inputs without creating resources")
    parser.add_argument(
        "--step", default=None,
        choices=["ga4", "gtm", "publish", "config"],
        help=(
            "Run only a specific step (uses IDs from config for dependencies):\n"
            "  ga4     - Create GA4 property + data stream\n"
            "  gtm     - Create GTM container + tags/triggers/variables\n"
            "  publish - Publish the GTM container version\n"
            "  config  - Update config JSON and run inject-config.py"
        ),
    )
    # For --step=publish or --step=config, allow passing existing IDs directly
    parser.add_argument("--ga4-property-id", default=None, help="Existing GA4 property ID (for --step resume)")
    parser.add_argument("--ga4-measurement-id", default=None, help="Existing GA4 measurement ID (for --step resume)")
    parser.add_argument("--gtm-container-id", default=None, help="Existing GTM container public ID, e.g. GTM-XXXXXXX (for --step resume)")
    parser.add_argument("--gtm-container-path", default=None, help="Existing GTM container path, e.g. accounts/123/containers/456 (for --step resume)")

    return parser.parse_args()


def get_ids_from_config(config: dict) -> dict:
    """Read existing analytics IDs from config (used as checkpoints)."""
    analytics = config.get("analytics", {})
    return {
        "ga4_property_id": analytics.get("ga4PropertyId", ""),
        "ga4_measurement_id": analytics.get("ga4MeasurementId", ""),
        "gtm_container_id": analytics.get("gtmContainerId", ""),
        "gtm_account_id": analytics.get("gtmAccountId", ""),
    }


def resolve_ids(args, config: dict) -> dict:
    """Resolve IDs from CLI args, falling back to config file."""
    saved = get_ids_from_config(config)
    return {
        "ga4_property_id": args.ga4_property_id or saved["ga4_property_id"],
        "ga4_measurement_id": args.ga4_measurement_id or saved["ga4_measurement_id"],
        "gtm_container_id": args.gtm_container_id or saved["gtm_container_id"],
        "gtm_container_path": args.gtm_container_path or "",
    }


def step_ga4(analytics_admin, account_id: str, property_name: str, url: str) -> tuple:
    """Run GA4 setup: create property + data stream. Returns (property_id, measurement_id)."""
    print("\n" + "=" * 60)
    print("STEP: GA4 — Create property and data stream")
    print("=" * 60)

    ga4_property = create_ga4_property(analytics_admin, account_id, property_name)
    property_resource_name = ga4_property["name"]
    property_id = property_resource_name.split("/")[-1]

    data_stream = create_ga4_data_stream(analytics_admin, property_resource_name, url, property_name)
    measurement_id = data_stream.get("webStreamData", {}).get("measurementId", "")

    print(f"\n  [OK] GA4 Property ID: {property_id}")
    print(f"  [OK] Measurement ID: {measurement_id}")
    return property_id, measurement_id


def step_gtm(tagmanager, account_id: str, container_name: str, measurement_id: str) -> tuple:
    """Run GTM setup: create container + tags/triggers/variables. Returns (container_public_id, container_path, workspace_path)."""
    print("\n" + "=" * 60)
    print("STEP: GTM — Create container, tags, triggers, variables")
    print("=" * 60)

    gtm_container = create_gtm_container(tagmanager, account_id, container_name)
    gtm_container_id = gtm_container["publicId"]
    container_path = gtm_container["path"]

    print(f"\n  Getting workspace...")
    workspace = get_default_workspace(tagmanager, container_path)
    workspace_path = workspace["path"]

    measurement_id_var_name = "GA4 Measurement ID"
    print(f"\n  Creating GTM variables...")
    create_gtm_variable(tagmanager, workspace_path, measurement_id_var_name, measurement_id)
    create_gtm_data_layer_variables(tagmanager, workspace_path)

    print(f"\n  Creating GTM triggers and event tags...")
    for event in CUSTOM_EVENTS:
        trigger = create_gtm_custom_event_trigger(tagmanager, workspace_path, event["name"])
        trigger_id = trigger["triggerId"]
        create_gtm_ga4_event_tag(
            tagmanager, workspace_path, event["name"],
            trigger_id, measurement_id_var_name, event["parameters"],
        )

    print(f"\n  Creating GA4 Config tag...")
    create_gtm_ga4_config_tag(tagmanager, workspace_path, measurement_id_var_name)

    print(f"\n  [OK] GTM Container ID: {gtm_container_id}")
    print(f"  [OK] Container path: {container_path}")
    print(f"  [OK] Workspace path: {workspace_path}")
    return gtm_container_id, container_path, workspace_path


def step_publish(tagmanager, container_path: str) -> None:
    """Publish the GTM container version."""
    print("\n" + "=" * 60)
    print("STEP: PUBLISH — Create and publish GTM container version")
    print("=" * 60)

    # Find the workspace
    print(f"\n  Looking up workspace for container: {container_path}")
    workspace = get_default_workspace(tagmanager, container_path)
    workspace_path = workspace["path"]

    publish_gtm_version(tagmanager, workspace_path)
    print(f"\n  [OK] GTM container published")


def step_config(config_path: Path, ids: dict) -> None:
    """Update config JSON and run inject-config.py."""
    print("\n" + "=" * 60)
    print("STEP: CONFIG — Update config and inject")
    print("=" * 60)

    update_config(config_path, ids)
    run_inject_config(config_path)
    print(f"\n  [OK] Config updated and injected")


def main():
    args = parse_args()

    config_path = Path(args.config)
    if not config_path.exists():
        print(f"Error: Config file not found: {config_path}")
        sys.exit(1)

    config = json.loads(config_path.read_text())
    property_name = args.property_name or config.get("branding", {}).get("appName", "Compass")
    step = args.step

    print(f"Setting up analytics for '{property_name}'")
    print(f"  GA4 Account:  {args.ga4_account_id}")
    print(f"  GTM Account:  {args.gtm_account_id}")
    print(f"  URL:          {args.url}")
    print(f"  Config:       {config_path}")
    print(f"  Step:         {step or 'all'}")

    if args.dry_run:
        print("\n[DRY RUN] Would create:")
        print(f"  - GA4 property '{property_name}' with web data stream for {args.url}")
        print(f"  - GTM container '{property_name}' with:")
        for event in CUSTOM_EVENTS:
            params = ", ".join(p["key"] for p in event["parameters"])
            print(f"    - Event: {event['name']} (params: {params})")
        print("  - GA4 Config tag (all pages)")
        print(f"  - Would update {config_path} with generated IDs")
        return

    # Authenticate
    creds = authenticate(args.credentials)

    # Resolve any existing IDs from config or CLI args
    ids = resolve_ids(args, config)

    # Build API clients as needed
    tagmanager = None
    property_id = ""
    measurement_id = ""
    gtm_container_id = ""
    container_path = ""

    try:
        # --- GA4 step ---
        if step in (None, "ga4"):
            analytics_admin = build("analyticsadmin", "v1beta", credentials=creds)
            property_id, measurement_id = step_ga4(
                analytics_admin, args.ga4_account_id, property_name, args.url,
            )
            # Save checkpoint immediately
            update_config(config_path, {
                "ga4AccountId": args.ga4_account_id,
                "ga4PropertyId": property_id,
                "ga4MeasurementId": measurement_id,
                "gtmAccountId": args.gtm_account_id,
            })
            print("\n  [CHECKPOINT] GA4 IDs saved to config")
            # Reload config for next steps
            config = json.loads(config_path.read_text())
            ids = resolve_ids(args, config)
        else:
            property_id = ids["ga4_property_id"]
            measurement_id = ids["ga4_measurement_id"]
            if not measurement_id:
                print("Error: No GA4 measurement ID found. Run --step=ga4 first or pass --ga4-measurement-id.")
                sys.exit(1)
            print(f"\n  [SKIP] GA4 — using existing Measurement ID: {measurement_id}")

        # --- GTM step ---
        if step in (None, "gtm"):
            tagmanager = build("tagmanager", "v2", credentials=creds)
            gtm_container_id, container_path, _ = step_gtm(
                tagmanager, args.gtm_account_id, property_name, measurement_id,
            )
            # Save checkpoint immediately
            update_config(config_path, {
                "ga4AccountId": args.ga4_account_id,
                "ga4PropertyId": property_id,
                "ga4MeasurementId": measurement_id,
                "gtmAccountId": args.gtm_account_id,
                "gtmContainerId": gtm_container_id,
            })
            print("\n  [CHECKPOINT] GTM IDs saved to config")
            config = json.loads(config_path.read_text())
            ids = resolve_ids(args, config)
        else:
            gtm_container_id = ids["gtm_container_id"]
            container_path = ids.get("gtm_container_path") or args.gtm_container_path or ""
            if step == "publish" and not container_path:
                print("Error: No GTM container path found. Pass --gtm-container-path (e.g. accounts/123/containers/456).")
                sys.exit(1)
            if gtm_container_id:
                print(f"\n  [SKIP] GTM — using existing Container ID: {gtm_container_id}")

        # --- Publish step ---
        if step in (None, "publish"):
            if tagmanager is None:
                tagmanager = build("tagmanager", "v2", credentials=creds)
            if not container_path:
                print("Error: No GTM container path. Pass --gtm-container-path (e.g. accounts/123/containers/456).")
                sys.exit(1)
            step_publish(tagmanager, container_path)

        # --- Config step ---
        if step in (None, "config"):
            step_config(config_path, {
                "ga4AccountId": args.ga4_account_id,
                "ga4PropertyId": property_id,
                "ga4MeasurementId": measurement_id,
                "gtmAccountId": args.gtm_account_id,
                "gtmContainerId": gtm_container_id,
            })

        print("\n" + "=" * 60)
        print(f"{'Step' if step else 'Setup'} complete!")
        print(f"  GA4 Property ID:    {property_id}")
        print(f"  GA4 Measurement ID: {measurement_id}")
        print(f"  GTM Container ID:   {gtm_container_id}")
        print("=" * 60)

    except HttpError as e:
        print(f"\n[ERROR] API Error: {e}")
        print(f"Details: {e.content.decode()}")
        print(f"\nTip: Check config file for saved checkpoints. Resume with --step=<step>")
        sys.exit(1)


if __name__ == "__main__":
    main()
