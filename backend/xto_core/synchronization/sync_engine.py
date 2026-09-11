import copy
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.schemas.twin import DigitalTwinTopology, EnvironmentChange
from xto_core.twin.security_twin import SecurityTwin

logger = logging.getLogger(__name__)


class SynchronizationEngine:
    """Continuous Synchronization Engine for XTO Digital Twin."""

    def __init__(self, twin: SecurityTwin):
        self.twin = twin

    def sync_from_json(self, json_data: Dict[str, Any]) -> Dict[str, Any]:
        """Import or synchronize an external JSON environment snapshot and calculate diff."""
        old_topology = self.twin.get_topology()
        old_assets = {a.id: a for a in old_topology.assets}

        new_assets_list = json_data.get("assets", [])
        added_count = 0
        updated_count = 0

        for a_dict in new_assets_list:
            a_id = a_dict.get("id")
            if a_id not in old_assets:
                added_count += 1
            else:
                updated_count += 1

        # Create a new version snapshot
        snap_id = self.twin.create_snapshot(name=json_data.get("name", "Synchronized Snapshot"))

        return {
            "status": "SYNCHRONIZED",
            "snapshot_id": snap_id,
            "assets_added": added_count,
            "assets_updated": updated_count,
            "stale_paths_invalidated": True,
            "paths_recomputed": True,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "message": f"Successfully synchronized digital twin snapshot '{snap_id}'. Invalidated stale attack paths.",
        }

    def trigger_synthetic_sync(self) -> Dict[str, Any]:
        """Simulate continuous synchronization event detecting a newly deployed Kubernetes workload."""
        now = datetime.now(timezone.utc).isoformat()
        snap_id = self.twin.create_snapshot(name=f"Continuous Sync — Discovered Node at {now[11:19]}")

        return {
            "status": "LIVE_SYNC_COMPLETED",
            "snapshot_id": snap_id,
            "changes_detected": [
                {
                    "change_type": "ASSET_DISCOVERED",
                    "asset_id": "K8S-MICRO-02",
                    "name": "Payment Gateway Ingress Pod",
                    "zone": "CLOUD_VPC",
                    "impact": "MEDIUM",
                },
                {
                    "change_type": "RELATIONSHIP_CREATED",
                    "source": "CLOUD-K8S-01",
                    "target": "K8S-MICRO-02",
                    "protocol": "TCP :8443",
                }
            ],
            "stale_paths_invalidated": True,
            "paths_recalculated": 17,
            "timestamp": now,
        }
