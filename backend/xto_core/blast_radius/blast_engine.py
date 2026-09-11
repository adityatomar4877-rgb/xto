import logging
from typing import Any, Dict, List, Set
import networkx as nx
from app.schemas.twin import CriticalityLevel
from xto_core.twin.security_twin import SecurityTwin
from xto_core.graph.security_graph import SecurityGraph

logger = logging.getLogger(__name__)


class BlastRadiusEngine:
    """Flagship Blast Radius Engine for XTO: 'Asset X has fallen'."""

    def __init__(self, twin: SecurityTwin):
        self.twin = twin

    def calculate_blast_radius(self, compromised_asset_id: str) -> Dict[str, Any]:
        asset = self.twin.get_asset(compromised_asset_id)
        if not asset:
            raise ValueError(f"Asset '{compromised_asset_id}' not found in Digital Twin")

        sec_graph = SecurityGraph(self.twin)
        g = sec_graph.nx_graph

        total_assets_count = max(1, len(self.twin.get_all_assets()))

        if compromised_asset_id not in g:
            return {
                "compromised_asset_id": compromised_asset_id,
                "asset_name": asset.name,
                "direct_impact_assets": [],
                "indirect_impact_assets": [],
                "critical_crown_jewels_threatened": [],
                "total_blast_radius_percent": 0.0,
                "summary": f"Asset {asset.name} has no outbound lateral movement reachability.",
            }

        # 1-Hop direct neighbors
        direct_successors = list(g.successors(compromised_asset_id))
        direct_nodes = []
        for d_id in direct_successors:
            a = self.twin.get_asset(d_id)
            direct_nodes.append({
                "id": d_id,
                "name": a.name if a else d_id,
                "zone": a.zone.value if a else "UNKNOWN",
                "criticality": a.criticality.value if a else "MEDIUM",
                "ip": a.ip_address if a else "",
            })

        # All descendants (transitive closure)
        all_descendants = list(nx.descendants(g, compromised_asset_id))
        indirect_nodes = []
        critical_crown_jewels = []

        for ind_id in all_descendants:
            if ind_id not in direct_successors:
                a = self.twin.get_asset(ind_id)
                indirect_nodes.append({
                    "id": ind_id,
                    "name": a.name if a else ind_id,
                    "zone": a.zone.value if a else "UNKNOWN",
                    "criticality": a.criticality.value if a else "MEDIUM",
                })

            a_obj = self.twin.get_asset(ind_id)
            if a_obj and a_obj.criticality == CriticalityLevel.CRITICAL:
                critical_crown_jewels.append({
                    "id": ind_id,
                    "name": a_obj.name,
                    "zone": a_obj.zone.value,
                    "criticality_score": a_obj.criticality_score,
                })

        # Check if the compromised asset itself exposed identities
        affected_identities = []
        for ident_id in asset.identities:
            ident = self.twin.get_identity(ident_id)
            if ident:
                affected_identities.append({
                    "id": ident.id,
                    "name": ident.name,
                    "role": ident.role,
                    "privilege": ident.privilege_level.value,
                })

        total_impacted_count = len(all_descendants) + 1  # Including the compromised node itself
        blast_percent = round((total_impacted_count / total_assets_count) * 100, 1)

        summary = (
            f"If {asset.name} ({asset.ip_address}) falls, the adversary gains immediate 1-hop access to "
            f"{len(direct_successors)} assets and transitive k-hop access to {len(all_descendants)} total assets "
            f"({blast_percent}% of enterprise infrastructure). "
            f"{len(critical_crown_jewels)} critical crown jewels are in direct exposure line."
        )

        return {
            "compromised_asset_id": compromised_asset_id,
            "asset_name": asset.name,
            "asset_zone": asset.zone.value,
            "asset_criticality": asset.criticality.value,
            "direct_impact_count": len(direct_nodes),
            "direct_impact_assets": direct_nodes,
            "indirect_impact_count": len(indirect_nodes),
            "indirect_impact_assets": indirect_nodes,
            "critical_crown_jewels_threatened": critical_crown_jewels,
            "affected_identities": affected_identities,
            "total_reachable_assets": total_impacted_count,
            "total_blast_radius_percent": blast_percent,
            "summary": summary,
        }
