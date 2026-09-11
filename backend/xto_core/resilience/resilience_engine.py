import logging
from typing import Any, Dict, List, Optional
import networkx as nx

from app.schemas.lab import (
    ResilienceScoreResult,
    ResilienceFactorBreakdown,
)
from app.schemas.twin import CriticalityLevel
from xto_core.twin.security_twin import SecurityTwin
from xto_core.graph.security_graph import SecurityGraph
from xto_core.graph.path_engine import AttackPathEngine

logger = logging.getLogger(__name__)


class ResilienceScoringEngine:
    """Evaluates how resilient an enterprise digital twin environment is
    against attack-path disruption, lateral movement, and cascading compromise.
    """

    def __init__(self, twin: SecurityTwin):
        self.twin = twin

    def compute_resilience_score(self) -> ResilienceScoreResult:
        sec_graph = SecurityGraph(self.twin)
        g = sec_graph.nx_graph
        path_engine = AttackPathEngine(sec_graph)

        all_assets = self.twin.get_all_assets()
        total_assets = max(1, len(all_assets))
        active_controls = [c for c in self.twin.get_all_controls() if c.is_active]

        critical_assets = [a for a in all_assets if a.criticality == CriticalityLevel.CRITICAL]

        # 1. Path Redundancy & Independent Paths
        entry_points = ["WS-ENG-04", "VPN-GW-01", "WEB-SRV-01"]
        all_discovered_paths = []
        for ep in entry_points:
            for ca in critical_assets:
                paths = path_engine.find_all_attack_paths(ep, ca.id, cutoff=7)
                all_discovered_paths.extend(paths)

        total_paths_count = len(all_discovered_paths)

        # Factor 1: Path Redundancy (fewer alternate paths -> higher score)
        # 0 paths = 100, 1-5 paths = 80, 6-15 paths = 50, >25 paths = 20
        if total_paths_count == 0:
            path_redundancy_score = 100.0
        elif total_paths_count <= 5:
            path_redundancy_score = 80.0
        elif total_paths_count <= 15:
            path_redundancy_score = 55.0
        elif total_paths_count <= 25:
            path_redundancy_score = 35.0
        else:
            path_redundancy_score = 15.0

        # Factor 2: Control Density (ratio of active controls to assets)
        ctrl_ratio = len(active_controls) / total_assets
        control_density_score = min(100.0, round(ctrl_ratio * 150.0, 1))

        # Factor 3: Chokepoints & Single Points of Failure
        chokepoints = []
        for ep in entry_points:
            for ca in critical_assets:
                cps = path_engine.find_chokepoints(ep, ca.id, top_k=2)
                chokepoints.extend(cps)

        unique_chokepoint_ids = {cp["asset_id"] for cp in chokepoints}
        spofs = []
        for c_id in unique_chokepoint_ids:
            asset = self.twin.get_asset(c_id)
            if asset:
                spofs.append({
                    "asset_id": asset.id,
                    "name": asset.name,
                    "zone": asset.zone.value,
                    "criticality": asset.criticality.value,
                    "vulnerabilities_count": len(asset.vulnerabilities),
                    "is_mitigated": any(asset.id in c.coverage_scope for c in active_controls),
                })

        unmitigated_spofs = [s for s in spofs if not s["is_mitigated"]]
        chokepoint_mitigation_score = max(
            0.0, 100.0 - (len(unmitigated_spofs) * 25.0)
        )

        # Factor 4: Depth of Defense (Average hops to reach critical assets)
        hop_counts = [p["hop_count"] for p in all_discovered_paths] if all_discovered_paths else [6]
        avg_hops = sum(hop_counts) / max(1, len(hop_counts))
        # 1-2 hops = 20 score, 3-4 hops = 60 score, >= 5 hops = 90 score
        depth_defense_score = min(100.0, round((avg_hops / 5.0) * 85.0, 1))

        # Factor 5: Privilege Tiering (Are admin identities restricted?)
        admin_idents = [i for i in self.twin.get_all_identities() if "ADMIN" in i.privilege_level.value]
        mfa_admins = [i for i in admin_idents if i.mfa_enabled]
        priv_ratio = len(mfa_admins) / max(1, len(admin_idents))
        privilege_tiering_score = round(priv_ratio * 100.0, 1)

        # Weighted Normalized Score (0–100)
        weighted_score = round(
            (path_redundancy_score * 0.25) +
            (control_density_score * 0.20) +
            (chokepoint_mitigation_score * 0.25) +
            (depth_defense_score * 0.15) +
            (privilege_tiering_score * 0.15),
            1,
        )

        if weighted_score >= 85.0:
            rating = "RESILIENT"
        elif weighted_score >= 70.0:
            rating = "HARDENED"
        elif weighted_score >= 50.0:
            rating = "DEFENSIBLE"
        elif weighted_score >= 30.0:
            rating = "FRAGILE"
        else:
            rating = "CRITICAL"

        recommendations = []
        if path_redundancy_score < 60:
            recommendations.append("Sever secondary lateral paths to critical backups with micro-segmentation.")
        if privilege_tiering_score < 70:
            recommendations.append("Enforce cryptographic MFA on Domain Admin sessions and purge dev workstation tokens.")
        if chokepoint_mitigation_score < 75:
            recommendations.append(f"Deploy isolation controls on top graph chokepoints: {[s['name'] for s in unmitigated_spofs[:2]]}.")
        if control_density_score < 50:
            recommendations.append("Deploy behavioral endpoint detection (EDR) on developer endpoints.")

        breakdown = ResilienceFactorBreakdown(
            path_redundancy_score=path_redundancy_score,
            control_density_score=control_density_score,
            chokepoint_mitigation_score=chokepoint_mitigation_score,
            depth_defense_score=depth_defense_score,
            privilege_tiering_score=privilege_tiering_score,
        )

        methodology = (
            "Resilience Score formula: 25% Path Redundancy + 25% Chokepoint Mitigation + "
            "20% Defensive Control Density + 15% Depth of Defense + 15% Privilege Tiering."
        )

        return ResilienceScoreResult(
            resilience_score=weighted_score,
            posture_rating=rating,
            total_attack_paths_count=total_paths_count,
            independent_path_clusters=len(entry_points),
            single_points_of_failure=spofs,
            chokepoint_assets=chokepoints[:4],
            factor_breakdown=breakdown,
            calculation_methodology=methodology,
            improvement_recommendations=recommendations,
        )
