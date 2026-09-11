import logging
from typing import Any, Dict, List, Optional, Set, Tuple
import networkx as nx
from app.schemas.twin import Asset, Relationship, RelationshipType, SecurityControl
from xto_core.twin.security_twin import SecurityTwin

logger = logging.getLogger(__name__)


class SecurityGraph:
    """Directional, typed multigraph representation of the Cyber Decision Digital Twin."""

    def __init__(self, twin: SecurityTwin):
        self.twin = twin
        self.nx_graph = nx.MultiDiGraph()
        self._build_graph()

    def _build_graph(self) -> None:
        self.nx_graph.clear()

        # Add Asset Nodes
        for asset in self.twin.get_all_assets():
            self.nx_graph.add_node(
                asset.id,
                name=asset.name,
                type=asset.type.value,
                zone=asset.zone.value,
                criticality=asset.criticality.value,
                criticality_score=asset.criticality_score,
                is_compromised=asset.is_compromised,
                controls=asset.controls,
                vulnerabilities=[v.model_dump() for v in asset.vulnerabilities],
                identities=asset.identities,
            )

        # Add Edges
        for rel in self.twin.get_all_relationships():
            if rel.is_blocked:
                continue  # Blocked edges are pruned from the active attack surface

            # Check if any active control in the twin blocks this relationship
            if self._is_edge_blocked_by_controls(rel):
                continue

            edge_attrs = {
                "id": rel.id,
                "type": rel.type.value,
                "protocol": rel.protocol,
                "port": rel.port,
                "trust_level": rel.trust_level,
                "weight": self._compute_edge_difficulty_weight(rel),
                "properties": rel.properties,
            }

            self.nx_graph.add_edge(rel.source_id, rel.target_id, key=rel.id, **edge_attrs)

            if rel.bidirectional:
                self.nx_graph.add_edge(
                    rel.target_id, rel.source_id, key=f"{rel.id}_rev", **edge_attrs
                )

    def _is_edge_blocked_by_controls(self, rel: Relationship) -> bool:
        """Evaluate whether any active control in the twin eliminates this transition."""
        for ctrl in self.twin.get_all_controls():
            if not ctrl.is_active:
                continue

            # Vault Isolation / Network Segmentation
            if ctrl.type == "NETWORK_SEGMENTATION":
                if rel.target_id in ctrl.coverage_scope or rel.source_id in ctrl.coverage_scope:
                    # If target is segmented backup vault, block non-approved inbound ports
                    if "VAULT-BACKUP-01" in ctrl.coverage_scope and rel.target_id == "VAULT-BACKUP-01":
                        if rel.port != 6160:  # Only permit legitimate backup agent port
                            return True

            # Host Isolation
            if ctrl.type == "HOST_ISOLATION":
                if rel.source_id in ctrl.coverage_scope or rel.target_id in ctrl.coverage_scope:
                    return True

            # MFA Enforcement blocks unauthenticated credential lateral movement
            if ctrl.type == "MFA":
                if rel.type == RelationshipType.CREDENTIAL_ACCESS:
                    if rel.properties.get("cached_identity") in ctrl.coverage_scope:
                        return True

        return False

    def _compute_edge_difficulty_weight(self, rel: Relationship) -> float:
        """Compute traversal difficulty weight (1.0 = trivial, 10.0 = highly defended)."""
        weight = 2.0
        if rel.type == RelationshipType.CREDENTIAL_ACCESS:
            weight = 1.5  # Stolen credentials allow easy pivoting
        elif rel.type == RelationshipType.REMOTE_EXECUTION:
            weight = 2.5
        elif rel.type == RelationshipType.NETWORK_REACHABILITY:
            weight = 3.0

        # Trust level reduces difficulty
        weight = max(1.0, weight - (rel.trust_level * 1.5))
        return round(weight, 2)

    def get_neighbors(self, asset_id: str) -> List[str]:
        if asset_id in self.nx_graph:
            return list(self.nx_graph.successors(asset_id))
        return []

    def get_edge_data(self, source_id: str, target_id: str) -> List[Dict[str, Any]]:
        if self.nx_graph.has_edge(source_id, target_id):
            edge_dict = self.nx_graph.get_edge_data(source_id, target_id)
            return list(edge_dict.values())
        return []
