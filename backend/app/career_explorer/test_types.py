"""
Tests for career explorer types.
"""
from datetime import datetime, timezone

from app.career_explorer.types import (
    CareerExplorerConversationDocument,
    PendingSector,
)


class TestPendingSector:
    """Tests for the PendingSector model."""

    def test_serializes_mentioned_at_to_iso_format(self):
        """PendingSector should serialize mentioned_at to ISO format in UTC."""
        # GIVEN a PendingSector with a specific datetime
        given_dt = datetime(2026, 3, 24, 10, 30, 0, tzinfo=timezone.utc)
        given_sector = PendingSector(sector_name="Agriculture", is_priority=True, mentioned_at=given_dt)

        # WHEN serialized to dict
        actual_dump = given_sector.model_dump()

        # THEN mentioned_at is an ISO string
        assert actual_dump["mentioned_at"] == "2026-03-24T10:30:00+00:00"


class TestConversationDocumentPendingSectors:
    """Tests for pending_sectors field on CareerExplorerConversationDocument."""

    def test_from_dict_with_pending_sectors(self):
        """from_dict should deserialize pending_sectors correctly."""
        # GIVEN a dict with pending_sectors
        given_now = datetime.now(timezone.utc)
        given_dict = {
            "user_id": "user_123",
            "messages": [],
            "created_at": given_now,
            "updated_at": given_now,
            "pending_sectors": [
                {"sector_name": "Mining", "is_priority": True, "mentioned_at": given_now.isoformat()},
            ],
        }

        # WHEN from_dict is called
        actual_doc = CareerExplorerConversationDocument.from_dict(given_dict)

        # THEN pending_sectors contains the correct PendingSector
        assert len(actual_doc.pending_sectors) == 1
        assert actual_doc.pending_sectors[0].sector_name == "Mining"
        assert actual_doc.pending_sectors[0].is_priority is True

    def test_pending_sector_roundtrip_through_model_dump_and_from_dict(self):
        """PendingSector should survive a model_dump -> from_dict roundtrip (simulating MongoDB write/read)."""
        # GIVEN a conversation document with a pending sector
        given_now = datetime(2026, 3, 24, 10, 30, 0, tzinfo=timezone.utc)
        given_doc = CareerExplorerConversationDocument(
            user_id="user_rt",
            messages=[],
            created_at=given_now,
            updated_at=given_now,
            pending_sectors=[
                PendingSector(sector_name="Mining", is_priority=True, mentioned_at=given_now),
            ],
        )

        # WHEN the document is serialized via model_dump and deserialized via from_dict
        actual_doc = CareerExplorerConversationDocument.from_dict(given_doc.model_dump())

        # THEN the pending sector survives the roundtrip
        assert len(actual_doc.pending_sectors) == 1
        assert actual_doc.pending_sectors[0].sector_name == "Mining"
        assert actual_doc.pending_sectors[0].is_priority is True
        assert actual_doc.pending_sectors[0].mentioned_at == given_now

    def test_from_dict_without_pending_sectors_defaults_to_empty(self):
        """from_dict should default pending_sectors to empty list for backward compatibility."""
        # GIVEN a dict without pending_sectors key (legacy document)
        given_now = datetime.now(timezone.utc)
        given_dict = {
            "user_id": "user_456",
            "messages": [],
            "created_at": given_now,
            "updated_at": given_now,
        }

        # WHEN from_dict is called
        actual_doc = CareerExplorerConversationDocument.from_dict(given_dict)

        # THEN pending_sectors defaults to empty list
        assert actual_doc.pending_sectors == []
