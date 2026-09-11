import uuid
import logging
from typing import Any, Dict, List, Optional, Set
import networkx as nx

from app.schemas.lab import (
    PathDiff,
    SnapshotComparisonResult,
    SnapshotSummary,
)
from app.schemas.twin import DigitalTwinTopology, CriticalityLevel
from xto_core.twin.security_twin import SecurityTwin
from xto_core.graph.security_graph import SecurityGraph
from xto_core.graph.path_engine import AttackPathEngine

logger = logging.getLogger(__name__)


class SnapshotTimeMachine:
    """Attack Path Time Machine and Snapshot Comparison Engine.
    Enables defenders to travel between Digital Twin snapshots across time,
    identifying newly created attack paths, eliminated attack routes, and configuration drift.
    """

    def __init__(self, twin: SecurityTwin):
        self.twin = twin

    def list_snapshots_summary(self) -> List[SnapshotSummary]:
        """List all environment snapshots with high-level path metrics."""
        summaries = []
        for snap_id, topo in self.twin._snapshots.items():
            temp_twin = SecurityTwin(initial_topology=topo)
            sec_graph = SecurityGraph(temp_twin)
            path_engine = AttackPathEngine(sec_graph)

            # Measure paths to critical vault
            paths = path_engine.find_all_attack_paths("WS-ENG-04", "VAULT-BACKUP-01", cutoff=8)
            crit_paths = [p for p in paths if p.get("is_critical", False)]

            summaries.append(
                SnapshotSummary(
                    snapshot_id=snap_id,
                    version=topo.version,
                    name=topo.name,
                    timestamp=topo.timestamp,
                    asset_count=len(topo.assets),
                    relationship_count=len(topo.relationships),
                    control_count=len(topo.controls),
                    critical_paths_count=len(crit_paths),
                )
            )

        summaries.sort(key=lambda s: s.version)
        return summaries

    def compare_snapshots(self, snapshot_a_id: str, snapshot_b_id: str) -> SnapshotComparisonResult:
        """Compare two Digital Twin snapshots and detect newly opened or closed attack routes."""
        topo_a = self.twin.get_snapshot(snapshot_a_id)
        topo_b = self.twin.get_snapshot(snapshot_b_id)

        if not topo_a:
            raise ValueError(f"Snapshot '{snapshot_a_id}' not found in Digital Twin history")
        if not topo_b:
            raise ValueError(f"Snapshot '{snapshot_b_id}' not found in Digital Twin history")

        twin_a = SecurityTwin(initial_topology=topo_a)
        twin_b = SecurityTwin(initial_topology=topo_b)

        graph_a = SecurityGraph(twin_a)
        graph_b = SecurityGraph(twin_b)

        path_engine_a = AttackPathEngine(graph_a)
        path_engine_b = AttackPathEngine(graph_b)

        paths_a = path_engine_a.find_all_attack_paths("WS-ENG-04", "VAULT-BACKUP-01", cutoff=8)
        paths_b = path_engine_b.find_all_attack_paths("WS-ENG-04", "VAULT-BACKUP-01", cutoff=8)

        paths_a_signatures = {" -> ".join(p["path_node_ids"]): p for p in paths_a}
        paths_b_signatures = {" -> ".join(p["path_node_ids"]): p for p in paths_b}

        new_paths_list: List[PathDiff] = []
        for sig, p in paths_b_signatures.items():
            if sig not in paths_a_signatures:
                new_paths_list.append(
                    PathDiff(
                        path_id=p["path_id"],
                        hop_count=p["hop_count"],
                        summary=p["summary"],
                        critical=p["is_critical"],
                    )
                )

        eliminated_paths_list: List[PathDiff] = []
        for sig, p in paths_a_signatures.items():
            if sig not in paths_b_signatures:
                eliminated_paths_list.append(
                    PathDiff(
                        path_id=p["path_id"],
                        hop_count=p["hop_count"],
                        summary=p["summary"],
                        critical=p["is_critical"],
                    )
                )

        # Detect changed assets
        assets_a = {a.id: a for a in topo_a.assets}
        assets_b = {a.id: a for a in topo_b.assets}
        changed_assets = []

        for aid, a in assets_b.items():
            if aid not in assets_a:
                changed_assets.append({"asset_id": aid, "name": a.name, "action": "ADDED", "zone": a.zone.value})
        for aid, a in assets_a.items():
            if aid not in assets_b:
                changed_assets.append({"asset_id": aid, "name": a.name, "action": "REMOVED", "zone": a.zone.value})

        # Detect changed controls
        controls_a = {c.id: c for c in topo_a.controls}
        controls_b = {c.id: c for c in topo_b.controls}
        changed_controls = []

        for cid, c in controls_b.items():
            if cid not in controls_a:
                changed_controls.append({"control_id": cid, "name": c.name, "action": "DEPLOYED", "type": c.type})
            elif controls_a[cid].is_active != c.is_active:
                status = "ACTIVATED" if c.is_active else "DEACTIVATED"
                changed_controls.append({"control_id": cid, "name": c.name, "action": status, "type": c.type})

        for cid, c in controls_a.items():
            if cid not in controls_b:
                changed_controls.append({"control_id": cid, "name": c.name, "action": "REMOVED", "type": c.type})

        # Changed relationships
        rels_a = {r.id: r for r in topo_a.relationships}
        rels_b = {r.id: r for r in topo_b.relationships}
        changed_rels = []

        for rid, r in rels_b.items():
            if rid not in rels_a:
                changed_rels.append({"relationship_id": rid, "action": "ADDED", "from": r.source_id, "to": r.target_id})
        for rid, r in rels_a.items():
            if rid not in rels_b:
                changed_rels.append({"relationship_id": rid, "action": "REMOVED", "from": r.source_id, "to": r.target_id})

        # Changed identities
        ident_a = {i.id: i for i in topo_a.identities}
        ident_b = {i.id: i for i in topo_b.identities}
        changed_privs = []

        for iid, ident in ident_b.items():
            if iid not in ident_a:
                changed_privs.append({"identity_id": iid, "name": ident.name, "action": "ADDED", "privilege": ident.privilege_level.value})
            elif ident_a[iid].privilege_level != ident.privilege_level:
                changed_privs.append({
                    "identity_id": iid,
                    "name": ident.name,
                    "action": "PRIVILEGE_CHANGED",
                    "from": ident_a[iid].privilege_level.value,
                    "to": ident.privilege_level.value,
                })

        diff_count = len(paths_b) - len(paths_a)
        if diff_count > 0:
            explanation = (
                f"{diff_count} new attack paths opened between '{topo_a.name}' and '{topo_b.name}'. "
                f"Root cause: {len(changed_assets)} asset changes, {len(changed_rels)} new network edges, "
                f"or modified privilege credentials."
            )
        elif diff_count < 0:
            explanation = (
                f"{abs(diff_count)} critical attack paths were eliminated between '{topo_a.name}' and '{topo_b.name}'. "
                f"Root cause: {len(changed_controls)} defensive interventions were deployed successfully."
            )
        else:
            explanation = (
                f"Attack path count remained steady at {len(paths_a)} between '{topo_a.name}' and '{topo_b.name}'. "
                f"Environmental baseline is stable."
            )

        return SnapshotComparisonResult(
            comparison_id=f"DIFF-{uuid.uuid4().hex[:8].upper()}",
            snapshot_a_id=snapshot_a_id,
            snapshot_b_id=snapshot_b_id,
            timestamp_a=topo_a.timestamp,
            timestamp_b=topo_b.timestamp,
            critical_paths_before=len(paths_a),
            critical_paths_after=len(paths_b),
            paths_diff_count=diff_count,
            newly_created_attack_paths=new_paths_list,
            eliminated_attack_paths=eliminated_paths_list,
            changed_assets=changed_assets,
            changed_controls=changed_controls,
            changed_privileges=changed_privs,
            changed_relationships=changed_rels,
            natural_language_explanation=explanation,
        )
