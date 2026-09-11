import uuid
import logging
from typing import Any, Dict, List, Optional
import networkx as nx

from app.schemas.lab import (
    CandidateControl,
    ControlAnalysisRequest,
    SingleControlEffectiveness,
    ControlEffectivenessResult,
)
from app.schemas.twin import SecurityControl, CriticalityLevel
from xto_core.twin.security_twin import SecurityTwin
from xto_core.graph.security_graph import SecurityGraph
from xto_core.graph.path_engine import AttackPathEngine
from xto_core.blast_radius.blast_engine import BlastRadiusEngine

logger = logging.getLogger(__name__)


class ControlEffectivenessEvaluator:
    """Evaluates the empirical effectiveness of candidate security controls
    by testing them in an ephemeral virtual sandbox against digital twin attack paths.
    """

    def __init__(self, twin: SecurityTwin):
        self.twin = twin

    def evaluate_controls(self, req: ControlAnalysisRequest) -> ControlEffectivenessResult:
        analysis_id = f"CTRL-EVAL-{uuid.uuid4().hex[:8].upper()}"
        entry_point = req.entry_point_id or "WS-ENG-04"
        target_obj = req.target_objective_id or "VAULT-BACKUP-01"

        # Baseline measurements on current environment
        base_graph = SecurityGraph(self.twin)
        base_path_engine = AttackPathEngine(base_graph)
        base_blast_engine = BlastRadiusEngine(self.twin)

        base_paths = base_path_engine.find_all_attack_paths(entry_point, target_obj, cutoff=8)
        base_paths_count = len(base_paths)
        base_blast = base_blast_engine.calculate_blast_radius(entry_point)
        base_blast_pct = base_blast.get("total_blast_radius_percent", 0.0)

        critical_assets = [
            a for a in self.twin.get_all_assets()
            if a.criticality == CriticalityLevel.CRITICAL
        ]

        evaluated_controls: List[SingleControlEffectiveness] = []

        # If user didn't specify controls, use default benchmark controls
        candidate_controls = req.controls
        if not candidate_controls:
            candidate_controls = [
                CandidateControl(
                    id="CTRL-CAND-MFA",
                    name="Enforce FIDO2 Hardware MFA on Admin Logins",
                    control_type="MFA",
                    target_scope=["ID-DOMAIN-ADMIN", "ID-ENG-DEV"],
                    description="Requires hardware key for lateral administrative pivots",
                    cost=25000.0,
                ),
                CandidateControl(
                    id="CTRL-CAND-SEG",
                    name="Micro-Segment Backup Vault from Corporate LAN",
                    control_type="NETWORK_SEGMENTATION",
                    target_scope=["VAULT-BACKUP-01"],
                    description="Blocks inbound SMB 445 and WinRM from workstations",
                    cost=40000.0,
                ),
                CandidateControl(
                    id="CTRL-CAND-EDR",
                    name="Deploy Behavioral EDR with LSASS Credential Guard",
                    control_type="EDR",
                    target_scope=["WS-ENG-04", "APP-SRV-01"],
                    description="Blocks LSASS memory dumping and credential harvesting",
                    cost=30000.0,
                ),
                CandidateControl(
                    id="CTRL-CAND-LEAST-PRIV",
                    name="Tiered Administration & Token Revocation",
                    control_type="LEAST_PRIVILEGE",
                    target_scope=["WS-ENG-04"],
                    description="Revokes domain admin tokens from developer workstations",
                    cost=15000.0,
                ),
            ]

        for cand in candidate_controls:
            # Fork virtual twin for completely isolated testing
            virt_twin = self.twin.fork_virtual_sandbox()
            v_ctrl_id = f"VIRT-{cand.id}"

            v_ctrl = SecurityControl(
                id=v_ctrl_id,
                name=cand.name,
                type=cand.control_type,
                description=cand.description or "",
                is_active=True,
                coverage_scope=cand.target_scope,
                effectiveness=0.95,
                is_virtual=True,
            )
            virt_twin.add_or_update_control(v_ctrl)

            # Re-evaluate graph in virtual sandbox
            virt_graph = SecurityGraph(virt_twin)
            virt_path_engine = AttackPathEngine(virt_graph)
            virt_blast_engine = BlastRadiusEngine(virt_twin)

            virt_paths = virt_path_engine.find_all_attack_paths(entry_point, target_obj, cutoff=8)
            virt_paths_count = len(virt_paths)
            paths_eliminated = max(0, base_paths_count - virt_paths_count)

            virt_blast = virt_blast_engine.calculate_blast_radius(entry_point)
            virt_blast_pct = virt_blast.get("total_blast_radius_percent", 0.0)

            # Check critical assets still reachable
            crit_reachable = 0
            for ca in critical_assets:
                if nx.has_path(virt_graph.nx_graph, entry_point, ca.id):
                    crit_reachable += 1

            risk_reduction_pct = (
                round((paths_eliminated / max(1, base_paths_count)) * 100.0, 1)
            )

            # ROI score: paths eliminated per $1,000 cost (if cost provided)
            cost_thousands = max(1.0, (cand.cost or 10000.0) / 1000.0)
            roi = round(risk_reduction_pct / cost_thousands, 2)

            reasoning = (
                f"Deploying '{cand.name}' ({cand.control_type}) on scope {cand.target_scope} "
                f"eliminates {paths_eliminated} of {base_paths_count} viable attack paths, "
                f"reducing adversary blast radius by {round(base_blast_pct - virt_blast_pct, 1)}%. "
                f"{crit_reachable} critical assets remain exposed."
            )

            evaluated_controls.append(
                SingleControlEffectiveness(
                    control_id=cand.id,
                    control_name=cand.name,
                    control_type=cand.control_type,
                    paths_before=base_paths_count,
                    paths_after=virt_paths_count,
                    critical_paths_eliminated=paths_eliminated,
                    critical_assets_still_reachable=crit_reachable,
                    blast_radius_before_percent=base_blast_pct,
                    blast_radius_after_percent=virt_blast_pct,
                    estimated_risk_reduction_percent=risk_reduction_pct,
                    remaining_attack_routes_count=virt_paths_count,
                    roi_score=roi,
                    reasoning=reasoning,
                )
            )

        # Sort by paths eliminated (highest first)
        evaluated_controls.sort(key=lambda x: (x.critical_paths_eliminated, x.roi_score), reverse=True)
        top_control = evaluated_controls[0] if evaluated_controls else None

        summary = (
            f"Evaluated {len(evaluated_controls)} candidate controls against baseline {base_paths_count} attack paths. "
            f"Top ranked control is '{top_control.control_name if top_control else 'N/A'}' "
            f"eliminating {top_control.critical_paths_eliminated if top_control else 0} critical paths "
            f"({top_control.estimated_risk_reduction_percent if top_control else 0}% risk reduction)."
        )

        return ControlEffectivenessResult(
            analysis_id=analysis_id,
            baseline_critical_paths=base_paths_count,
            baseline_blast_radius_percent=base_blast_pct,
            evaluated_controls=evaluated_controls,
            top_effective_control=top_control,
            summary=summary,
        )
