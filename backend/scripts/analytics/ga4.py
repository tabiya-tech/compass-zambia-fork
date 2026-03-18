"""GA4 Admin API operations for creating properties and data streams."""


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
