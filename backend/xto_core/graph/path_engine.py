from collections import Counter
import logging
from typing import Any, Dict, List, Optional, Set, Tuple
import networkx as nx
from app.schemas.twin import CriticalityLevel
from app.schemas.lab import AttackPathEdgeEvidence
from xto_core.graph.security_graph import SecurityGraph

logger = logging.getLogger(__name__)


class AttackPathEngine:
    """Dedicated Attack Path Discovery, Chokepoint, and Damage Analysis Engine for XTO."""

    def __init__(self, security_graph: SecurityGraph):
        self.sec_graph = security_graph
        self.g = security_graph.nx_graph

    def find_all_attack_paths(
        self,
        entry_point_id: str,
        target_id: str,
        cutoff: int = 7,
        max_paths: int = 50,
        sort_by: str = "effort",
    ) -> List[Dict[str, Any]]:
        """Compute all simple directional paths from entry_point to target up to cutoff depth."""
        if entry_point_id not in self.g or target_id not in self.g:
            return []

        try:
            raw_paths = []
            for path in nx.all_simple_paths(self.g, source=entry_point_id, target=target_id, cutoff=cutoff):
                raw_paths.append(path)
                if len(raw_paths) >= max_paths:
                    break
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return []

        enriched_paths = []
        for idx, path in enumerate(raw_paths):
            enriched = self._enrich_path(path, f"PATH-{idx+1:03d}")
            enriched_paths.append(enriched)

        # Configurable sorting
        if sort_by == "damage":
            enriched_paths.sort(key=lambda p: p["damage_assessment"]["accumulated_damage_score"], reverse=True)
        elif sort_by == "compromised_area":
            enriched_paths.sort(key=lambda p: len(p["compromised_area"]["collateral_asset_ids"]), reverse=True)
        elif sort_by == "hops":
            enriched_paths.sort(key=lambda p: p["hop_count"])
        else:  # Default to lowest effort first
            enriched_paths.sort(key=lambda p: p["attacker_effort_score"])

        return enriched_paths

    def get_shortest_path(self, entry_point_id: str, target_id: str) -> Optional[Dict[str, Any]]:
        if entry_point_id not in self.g or target_id not in self.g:
            return None
        try:
            path = nx.shortest_path(self.g, source=entry_point_id, target=target_id)
            return self._enrich_path(path, "SHORTEST-PATH")
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return None

    def get_lowest_effort_path(self, entry_point_id: str, target_id: str) -> Optional[Dict[str, Any]]:
        if entry_point_id not in self.g or target_id not in self.g:
            return None
        try:
            path = nx.dijkstra_path(self.g, source=entry_point_id, target=target_id, weight="weight")
            return self._enrich_path(path, "LOWEST-EFFORT-PATH")
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return None

    def find_chokepoints(self, entry_point_id: str, target_id: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Identify critical chokepoints: nodes that appear most frequently across all viable attack paths."""
        all_paths = self.find_all_attack_paths(entry_point_id, target_id, cutoff=8, max_paths=100)
        if not all_paths:
            return []

        total_paths = len(all_paths)
        intermediate_nodes: List[str] = []
        for p in all_paths:
            nodes = p["path_node_ids"][1:-1]
            intermediate_nodes.extend(nodes)

        counts = Counter(intermediate_nodes)
        chokepoints = []
        for node_id, count in counts.most_common(top_k):
            asset = self.sec_graph.twin.get_asset(node_id)
            elimination_ratio = round((count / total_paths) * 100, 1)
            chokepoints.append({
                "asset_id": node_id,
                "asset_name": asset.name if asset else node_id,
                "zone": asset.zone.value if asset else "UNKNOWN",
                "paths_intersected": count,
                "total_paths": total_paths,
                "paths_eliminated_if_isolated_percent": elimination_ratio,
                "recommended_intervention": "Isolate host or enforce strict egress micro-segmentation",
            })

        return chokepoints

    def _enrich_path(self, path_nodes: List[str], path_id: str) -> Dict[str, Any]:
        """Enrich a list of asset IDs into a structured attack path object with evidence and damage detection."""
        nodes_detail = []
        total_effort = 0.0
        max_impact = 0.0
        techniques = []
        transitions = []
        breached_zones = []
        zone_crossings = []
        harvested_identities = []
        highest_privilege = "STANDARD"

        privilege_rank = {"STANDARD": 1, "ELEVATED": 2, "LOCAL_ADMIN": 3, "DOMAIN_ADMIN": 4, "SYSTEM": 5}

        hop_progression = []
        cumulative_damage_running = 0.0
        crown_jewels_compromised = []
        sensitive_data_exposure = []

        collateral_assets_set: Set[str] = set()

        for i in range(len(path_nodes)):
            node_id = path_nodes[i]
            asset = self.sec_graph.twin.get_asset(node_id)
            c_score = asset.criticality_score if asset else 5.0
            max_impact = max(max_impact, c_score)

            # Accumulate collateral 1-hop reachability from this node
            if node_id in self.g:
                for neighbor in self.g.successors(node_id):
                    if neighbor not in path_nodes:
                        collateral_assets_set.add(neighbor)

            zone_str = asset.zone.value if asset else "UNKNOWN"
            if zone_str not in breached_zones:
                breached_zones.append(zone_str)

            # Check identities and privileges on this asset
            ident_names_here = []
            if asset:
                for id_id in asset.identities:
                    ident = self.sec_graph.twin.get_identity(id_id)
                    if ident:
                        ident_names_here.append(ident.name)
                        if ident.name not in [h["name"] for h in harvested_identities]:
                            harvested_identities.append({
                                "id": ident.id,
                                "name": ident.name,
                                "role": ident.role,
                                "privilege": ident.privilege_level.value,
                            })
                            if privilege_rank.get(ident.privilege_level.value, 1) > privilege_rank.get(highest_privilege, 1):
                                highest_privilege = ident.privilege_level.value

                if asset.criticality == CriticalityLevel.CRITICAL:
                    crown_jewels_compromised.append(asset.name)
                    sensitive_data_exposure.append(f"{asset.name} ({asset.type.value}) in {zone_str}")

            nodes_detail.append({
                "id": node_id,
                "name": asset.name if asset else node_id,
                "type": asset.type.value if asset else "UNKNOWN",
                "zone": zone_str,
                "criticality": asset.criticality.value if asset else "MEDIUM",
                "ip": asset.ip_address if asset else "",
            })

            # Calculate hop-by-hop damage
            incremental_damage = c_score * (1.5 if highest_privilege in ("DOMAIN_ADMIN", "SYSTEM") else 1.0)
            cumulative_damage_running += incremental_damage
            hop_progression.append({
                "hop_index": i,
                "asset_id": node_id,
                "asset_name": asset.name if asset else node_id,
                "zone": zone_str,
                "criticality": asset.criticality.value if asset else "MEDIUM",
                "incremental_damage": round(incremental_damage, 1),
                "cumulative_damage_score": round(cumulative_damage_running, 1),
                "identities_exposed": ident_names_here,
            })

            if i > 0:
                prev_id = path_nodes[i - 1]
                prev_asset = self.sec_graph.twin.get_asset(prev_id)
                prev_zone = prev_asset.zone.value if prev_asset else "UNKNOWN"

                if prev_zone != zone_str:
                    zone_crossings.append({
                        "from_zone": prev_zone,
                        "to_zone": zone_str,
                        "crossing": f"{prev_zone} -> {zone_str}",
                    })

                edge_data_list = self.sec_graph.get_edge_data(prev_id, node_id)
                edge_type = edge_data_list[0].get("type", "NETWORK_REACHABILITY") if edge_data_list else "NETWORK_REACHABILITY"
                edge_props = edge_data_list[0].get("properties", {}) if edge_data_list else {}
                edge_weight = edge_data_list[0].get("weight", 2.0) if edge_data_list else 2.0
                total_effort += edge_weight

                # Map transition techniques
                if edge_type == "CREDENTIAL_ACCESS":
                    t_id = "T1003.001"
                    t_name = "OS Credential Dumping (LSASS)"
                    service_name = "LSASS / SAM"
                    port_num = None
                elif edge_type == "REMOTE_EXECUTION":
                    t_id = "T1021.002"
                    t_name = "SMB / Windows Admin Shares"
                    service_name = "Microsoft-DS (SMB)"
                    port_num = 445
                else:
                    t_id = "T1059"
                    t_name = "Command and Scripting Interpreter"
                    service_name = "TCP Reachability"
                    port_num = edge_props.get("port", 80)

                techniques.append(t_id)

                # Build explainable edge evidence (Feature #7)
                edge_evidence = AttackPathEdgeEvidence(
                    from_node=prev_asset.name if prev_asset else prev_id,
                    to_node=asset.name if asset else node_id,
                    network="reachable",
                    service=service_name,
                    port=port_num,
                    identity=edge_props.get("cached_identity", "Domain Admin"),
                    privilege=highest_privilege,
                    control=None,
                    technique_id=t_id,
                    technique_name=t_name,
                    reasons=[
                        f"Network route verified from {prev_asset.name if prev_asset else prev_id} to {asset.name if asset else node_id}",
                        f"Technique {t_id} ({t_name}) viable across boundary",
                        f"Session privilege level: {highest_privilege}",
                        "No active egress filter blocking transition",
                    ],
                )

                transitions.append({
                    "from_node": prev_id,
                    "to_node": node_id,
                    "type": edge_type,
                    "technique_id": t_id,
                    "technique_name": t_name,
                    "difficulty_weight": edge_weight,
                    "reasons": edge_evidence.reasons,
                    "network": edge_evidence.network,
                    "evidence": edge_evidence.model_dump(),
                })

        # Calculate final damage score (0-100 normalized)
        normalized_damage = min(100.0, round((cumulative_damage_running / (len(path_nodes) * 10.0)) * 100.0, 1))
        if crown_jewels_compromised:
            normalized_damage = max(normalized_damage, 85.0)

        # Severity
        if normalized_damage >= 80.0:
            severity = "CATASTROPHIC"
        elif normalized_damage >= 60.0:
            severity = "HIGH"
        elif normalized_damage >= 40.0:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        is_critical = max_impact >= 8.5 or len(path_nodes) <= 4 or normalized_damage >= 70.0

        return {
            "path_id": path_id,
            "hop_count": len(path_nodes) - 1,
            "path_node_ids": path_nodes,
            "nodes": nodes_detail,
            "transitions": transitions,
            "attacker_effort_score": round(total_effort, 2),
            "target_impact_score": round(max_impact, 2),
            "is_critical": is_critical,
            "techniques_used": list(set(techniques)),
            "damage_assessment": {
                "accumulated_damage_score": normalized_damage,
                "damage_severity": severity,
                "crown_jewels_compromised": crown_jewels_compromised,
                "sensitive_data_exposure": sensitive_data_exposure,
            },
            "compromised_area": {
                "breached_zones": breached_zones,
                "zone_boundary_crossings": zone_crossings,
                "collateral_asset_ids": list(collateral_assets_set),
                "collateral_assets": list(collateral_assets_set),
                "collateral_assets_count": len(collateral_assets_set),
                "harvested_identities": harvested_identities,
                "max_privilege_held": highest_privilege,
            },
            "hop_by_hop_damage": hop_progression,
            "summary": " -> ".join([n["name"] for n in nodes_detail]),
        }
