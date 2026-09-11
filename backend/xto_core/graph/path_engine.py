from collections import Counter
import logging
from typing import Any, Dict, List, Optional, Set, Tuple
import networkx as nx
from app.schemas.twin import CriticalityLevel
from xto_core.graph.security_graph import SecurityGraph

logger = logging.getLogger(__name__)


class AttackPathEngine:
    """Dedicated Attack Path Discovery and Chokepoint Engine for XTO."""

    def __init__(self, security_graph: SecurityGraph):
        self.sec_graph = security_graph
        self.g = security_graph.nx_graph

    def find_all_attack_paths(
        self,
        entry_point_id: str,
        target_id: str,
        cutoff: int = 7,
        max_paths: int = 50,
    ) -> List[Dict[str, Any]]:
        """Compute all simple directional paths from entry_point to target up to cutoff depth."""
        if entry_point_id not in self.g or target_id not in self.g:
            return []

        try:
            # nx.all_simple_paths finds all cycle-free paths
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

        # Sort by attacker difficulty effort (lowest effort first)
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
        """Identify critical chokepoints: nodes that appear most frequently across all viable attack paths.
        Cutting a chokepoint breaks the maximum number of simultaneous paths!
        """
        all_paths = self.find_all_attack_paths(entry_point_id, target_id, cutoff=8, max_paths=100)
        if not all_paths:
            return []

        total_paths = len(all_paths)
        # Exclude entry point and target itself from chokepoint calculation
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
        """Enrich a list of asset IDs into a structured attack path object."""
        nodes_detail = []
        total_effort = 0.0
        max_impact = 0.0
        techniques = []
        controls_encountered = []
        transitions = []

        for i in range(len(path_nodes)):
            node_id = path_nodes[i]
            asset = self.sec_graph.twin.get_asset(node_id)
            c_score = asset.criticality_score if asset else 5.0
            max_impact = max(max_impact, c_score)

            nodes_detail.append({
                "id": node_id,
                "name": asset.name if asset else node_id,
                "type": asset.type.value if asset else "UNKNOWN",
                "zone": asset.zone.value if asset else "UNKNOWN",
                "criticality": asset.criticality.value if asset else "MEDIUM",
                "ip": asset.ip_address if asset else "",
            })

            if i > 0:
                prev_id = path_nodes[i - 1]
                edge_data_list = self.sec_graph.get_edge_data(prev_id, node_id)
                edge_type = edge_data_list[0].get("type", "NETWORK_REACHABILITY") if edge_data_list else "NETWORK_REACHABILITY"
                edge_weight = edge_data_list[0].get("weight", 2.0) if edge_data_list else 2.0
                total_effort += edge_weight

                # Map transition techniques
                if edge_type == "CREDENTIAL_ACCESS":
                    t_id = "T1003.001"
                    t_name = "OS Credential Dumping (LSASS)"
                elif edge_type == "REMOTE_EXECUTION":
                    t_id = "T1021.002"
                    t_name = "SMB/Windows Admin Shares"
                else:
                    t_id = "T1059"
                    t_name = "Command and Scripting Interpreter"

                techniques.append(t_id)
                transitions.append({
                    "from_node": prev_id,
                    "to_node": node_id,
                    "type": edge_type,
                    "technique_id": t_id,
                    "technique_name": t_name,
                    "difficulty_weight": edge_weight,
                })

        # Calculate path criticality
        is_critical = max_impact >= 8.5 or len(path_nodes) <= 4

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
            "summary": " -> ".join([n["name"] for n in nodes_detail]),
        }
