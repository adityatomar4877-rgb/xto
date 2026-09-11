import logging
from typing import Any, Dict, List, Set, Optional
import networkx as nx

from app.schemas.twin import CriticalityLevel
from app.schemas.lab import AttackPathEdgeEvidence
from xto_core.twin.security_twin import SecurityTwin
from xto_core.graph.security_graph import SecurityGraph

logger = logging.getLogger(__name__)


class BlastRadiusEngine:
    """Flagship Blast Radius Engine for XTO: 'Asset X has fallen'."""

    def __init__(self, twin: SecurityTwin):
        self.twin = twin

    def calculate_blast_radius(self, compromised_asset_id: str, max_depth: int = 5) -> Dict[str, Any]:
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
                "asset_zone": asset.zone.value,
                "asset_criticality": asset.criticality.value,
                "direct_impact_count": 0,
                "direct_impact_assets": [],
                "directly_reachable_assets": [],
                "indirect_impact_count": 0,
                "indirect_impact_assets": [],
                "indirectly_reachable_assets": [],
                "critical_crown_jewels_threatened": [],
                "affected_identities": [],
                "reachable_identities": [],
                "privilege_escalation_opportunities": [],
                "max_depth_evaluated": max_depth,
                "attack_depth": 0,
                "total_path_count": 0,
                "maximum_impact_score": 0.0,
                "total_reachable_assets": 1,
                "total_blast_radius_percent": 0.0,
                "relationship_evidence": [],
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

        # Bounded BFS traversal up to max_depth
        depth_map = nx.single_source_shortest_path_length(g, compromised_asset_id, cutoff=max_depth)
        # Exclude the starting node itself from descendants
        reached_nodes = [nid for nid in depth_map if nid != compromised_asset_id]

        indirect_nodes = []
        critical_crown_jewels = []
        max_depth_observed = max(depth_map.values()) if depth_map else 0
        total_impact_score = asset.criticality_score

        for ind_id in reached_nodes:
            a_obj = self.twin.get_asset(ind_id)
            if ind_id not in direct_successors:
                indirect_nodes.append({
                    "id": ind_id,
                    "name": a_obj.name if a_obj else ind_id,
                    "zone": a_obj.zone.value if a_obj else "UNKNOWN",
                    "criticality": a_obj.criticality.value if a_obj else "MEDIUM",
                    "hop_distance": depth_map[ind_id],
                })

            if a_obj:
                total_impact_score = max(total_impact_score, a_obj.criticality_score)
                if a_obj.criticality == CriticalityLevel.CRITICAL:
                    critical_crown_jewels.append({
                        "id": ind_id,
                        "name": a_obj.name,
                        "zone": a_obj.zone.value,
                        "criticality_score": a_obj.criticality_score,
                        "hop_distance": depth_map[ind_id],
                    })

        # Collect identities and privilege escalation opportunities
        all_affected_identity_ids = set(asset.identities)
        reachable_identities_list = []
        priv_escalation_opps = []

        for nid in [compromised_asset_id] + reached_nodes:
            node_asset = self.twin.get_asset(nid)
            if not node_asset:
                continue
            for ident_id in node_asset.identities:
                all_affected_identity_ids.add(ident_id)
                ident = self.twin.get_identity(ident_id)
                if ident:
                    reachable_identities_list.append({
                        "id": ident.id,
                        "name": ident.name,
                        "role": ident.role,
                        "privilege": ident.privilege_level.value,
                        "privilege_level": ident.privilege_level.value,
                        "credential_state": ident.credential_state.value,
                        "located_on_asset": node_asset.name,
                    })
                    if ident.privilege_level.value in ("DOMAIN_ADMIN", "LOCAL_ADMIN"):
                        priv_escalation_opps.append({
                            "asset_id": node_asset.id,
                            "asset_name": node_asset.name,
                            "identity_id": ident.id,
                            "identity_name": ident.name,
                            "privilege": ident.privilege_level.value,
                            "mechanism": "Cached Credential Dumping / Token Impersonation",
                        })

        # Build edge relationship evidence for all direct transitions
        relationship_evidence = []
        for src in [compromised_asset_id] + direct_successors:
            for tgt in g.successors(src):
                if tgt in depth_map:
                    edge_data_list = sec_graph.get_edge_data(src, tgt)
                    for ed in edge_data_list:
                        e_type = ed.get("type", "NETWORK_REACHABILITY")
                        e_props = ed.get("properties", {})
                        s_asset = self.twin.get_asset(src)
                        t_asset = self.twin.get_asset(tgt)

                        relationship_evidence.append(
                            AttackPathEdgeEvidence(
                                from_node=s_asset.name if s_asset else src,
                                to_node=t_asset.name if t_asset else tgt,
                                network="reachable",
                                service=e_props.get("service", "SMB/RPC" if e_type == "CREDENTIAL_ACCESS" else "TCP"),
                                port=e_props.get("port", 445 if e_type == "CREDENTIAL_ACCESS" else 80),
                                identity=e_props.get("cached_identity", "Domain Admin"),
                                privilege="ELEVATED" if "ADMIN" in str(e_props) else "STANDARD",
                                control=None,
                                technique_id="T1021.002" if e_type == "REMOTE_EXECUTION" else "T1003.001",
                                technique_name="Lateral Movement / Credential Pivot",
                                reasons=[
                                    f"Direct transition from {s_asset.name if s_asset else src} to {t_asset.name if t_asset else tgt}",
                                    f"Protocol: {e_type}",
                                ],
                            )
                        )

        # Count total simple paths from compromised node to all reached nodes (bounded)
        path_count = 0
        for tgt in reached_nodes[:10]:
            try:
                paths = list(nx.all_simple_paths(g, compromised_asset_id, tgt, cutoff=max_depth))
                path_count += len(paths)
            except Exception:
                pass

        total_impacted_count = len(reached_nodes) + 1
        blast_percent = round((total_impacted_count / total_assets_count) * 100, 1)

        summary = (
            f"If {asset.name} ({asset.ip_address}) falls, the adversary gains immediate 1-hop access to "
            f"{len(direct_successors)} assets and transitive k-hop access to {len(reached_nodes)} total assets "
            f"({blast_percent}% of enterprise infrastructure within depth {max_depth}). "
            f"{len(critical_crown_jewels)} critical crown jewels and {len(priv_escalation_opps)} privilege escalation opportunities are exposed."
        )

        return {
            "compromised_asset_id": compromised_asset_id,
            "asset_name": asset.name,
            "asset_zone": asset.zone.value,
            "asset_criticality": asset.criticality.value,
            "max_depth_evaluated": max_depth,
            "attack_depth": max_depth_observed,
            "direct_impact_count": len(direct_nodes),
            "direct_impact_assets": direct_nodes,
            "directly_reachable_assets": direct_nodes,
            "indirect_impact_count": len(indirect_nodes),
            "indirect_impact_assets": indirect_nodes,
            "indirectly_reachable_assets": indirect_nodes,
            "critical_crown_jewels_threatened": critical_crown_jewels,
            "affected_identities": [
                {"id": i["id"], "name": i["name"], "role": i["role"], "privilege": i["privilege"]}
                for i in reachable_identities_list[:5]
            ],
            "reachable_identities": reachable_identities_list,
            "privilege_escalation_opportunities": priv_escalation_opps,
            "total_path_count": max(path_count, len(reached_nodes)),
            "maximum_impact_score": round(total_impact_score, 1),
            "total_reachable_assets": total_impacted_count,
            "total_blast_radius_percent": blast_percent,
            "relationship_evidence": [e.model_dump() for e in relationship_evidence[:15]],
            "summary": summary,
        }
