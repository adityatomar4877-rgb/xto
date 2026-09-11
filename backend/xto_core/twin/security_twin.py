import copy
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from app.schemas.twin import (
    Asset,
    Identity,
    Relationship,
    SecurityControl,
    DigitalTwinTopology,
    EnvironmentChange,
    CriticalityLevel,
)
from xto_core.twin.seed_data import create_demo_topology

logger = logging.getLogger(__name__)


class SecurityTwin:
    """Queryable Security Digital Twin Engine for MUJ HACKX PS #13."""

    def __init__(self, initial_topology: Optional[DigitalTwinTopology] = None):
        if initial_topology is None:
            self._topology = create_demo_topology()
        else:
            self._topology = initial_topology

        # Snapshots and audit log of environment changes
        self._snapshots: Dict[str, DigitalTwinTopology] = {
            self._topology.snapshot_id: copy.deepcopy(self._topology)
        }
        self._changes_log: List[EnvironmentChange] = []
        self._rebuild_indices()

    def _rebuild_indices(self) -> None:
        """Fast in-memory hash indices for assets, identities, and edges."""
        self._assets_map: Dict[str, Asset] = {a.id: a for a in self._topology.assets}
        self._identities_map: Dict[str, Identity] = {i.id: i for i in self._topology.identities}
        self._controls_map: Dict[str, SecurityControl] = {c.id: c for c in self._topology.controls}
        self._relationships_map: Dict[str, Relationship] = {r.id: r for r in self._topology.relationships}

    # ── Inspection & Querying ───────────────────────────────────────────────

    def get_topology(self) -> DigitalTwinTopology:
        """Return the current baseline topology."""
        return self._topology

    def get_asset(self, asset_id: str) -> Optional[Asset]:
        return self._assets_map.get(asset_id)

    def get_all_assets(self) -> List[Asset]:
        return list(self._assets_map.values())

    def get_identity(self, identity_id: str) -> Optional[Identity]:
        return self._identities_map.get(identity_id)

    def get_all_identities(self) -> List[Identity]:
        return list(self._identities_map.values())

    def get_all_controls(self) -> List[SecurityControl]:
        return list(self._controls_map.values())

    def get_control(self, control_id: str) -> Optional[SecurityControl]:
        return self._controls_map.get(control_id)

    def get_all_relationships(self) -> List[Relationship]:
        return list(self._relationships_map.values())

    def get_critical_assets(self) -> List[Asset]:
        return [
            a for a in self._topology.assets
            if a.criticality == CriticalityLevel.CRITICAL
        ]

    # ── Immutability & Ephemeral Cloning for Sandbox ────────────────────────

    def fork_virtual_sandbox(self) -> "SecurityTwin":
        """Create an independent in-memory clone of the twin for Defense Sandbox testing.
        Guarantees that what-if modifications never touch or mutate the baseline.
        """
        cloned_topo = copy.deepcopy(self._topology)
        cloned_topo.snapshot_id = f"sandbox_{datetime.now(timezone.utc).strftime('%H%M%S')}"
        cloned_twin = SecurityTwin(initial_topology=cloned_topo)
        return cloned_twin

    # ── Modifications with Change Tracking ──────────────────────────────────

    def add_or_update_control(self, control: SecurityControl) -> None:
        now = datetime.now(timezone.utc).isoformat()
        exists = control.id in self._controls_map
        self._controls_map[control.id] = control

        # Update topology list
        idx = next((i for i, c in enumerate(self._topology.controls) if c.id == control.id), None)
        if idx is not None:
            self._topology.controls[idx] = control
        else:
            self._topology.controls.append(control)

        self._record_change(
            change_type="CONTROL_UPDATED" if exists else "CONTROL_ADDED",
            target_id=control.id,
            details={"name": control.name, "type": control.type, "is_active": control.is_active},
        )

    def add_relationship(self, relationship: Relationship) -> None:
        self._relationships_map[relationship.id] = relationship
        self._topology.relationships.append(relationship)
        self._record_change(
            change_type="RELATIONSHIP_ADDED",
            target_id=relationship.id,
            details={"source": relationship.source_id, "target": relationship.target_id, "type": relationship.type},
        )

    def block_relationship(self, relationship_id: str) -> bool:
        rel = self._relationships_map.get(relationship_id)
        if rel:
            rel.is_blocked = True
            self._record_change(
                change_type="RELATIONSHIP_ALTERED",
                target_id=relationship_id,
                details={"action": "BLOCKED"},
            )
            return True
        return False

    def create_snapshot(self, name: str) -> str:
        snap_id = f"snapshot_{len(self._snapshots) + 1:03d}"
        now = datetime.now(timezone.utc).isoformat()
        topo_copy = copy.deepcopy(self._topology)
        topo_copy.snapshot_id = snap_id
        topo_copy.name = name
        topo_copy.timestamp = now
        topo_copy.version = len(self._snapshots) + 1
        self._snapshots[snap_id] = topo_copy
        return snap_id

    def get_snapshot(self, snapshot_id: str) -> Optional[DigitalTwinTopology]:
        return self._snapshots.get(snapshot_id)

    def get_all_snapshots(self) -> List[Dict[str, Any]]:
        return [
            {
                "snapshot_id": s.snapshot_id,
                "version": s.version,
                "name": s.name,
                "timestamp": s.timestamp,
                "asset_count": len(s.assets),
            }
            for s in self._snapshots.values()
        ]

    def get_changes_log(self) -> List[EnvironmentChange]:
        return self._changes_log

    def _record_change(self, change_type: str, target_id: str, details: Dict[str, Any]) -> None:
        now = datetime.now(timezone.utc).isoformat()
        change = EnvironmentChange(
            change_id=f"CHG-{len(self._changes_log) + 1:04d}",
            timestamp=now,
            change_type=change_type,
            target_id=target_id,
            details=details,
        )
        self._changes_log.append(change)
