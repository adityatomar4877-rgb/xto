import uuid
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import networkx as nx

from app.schemas.lab import (
    RedAction,
    BlueAction,
    RedBlueRound,
    RedBlueSimulationRequest,
    RedBlueSimulationResult,
)
from app.schemas.twin import SecurityControl
from xto_core.twin.security_twin import SecurityTwin
from xto_core.graph.security_graph import SecurityGraph
from xto_core.graph.path_engine import AttackPathEngine

logger = logging.getLogger(__name__)


class AdaptiveRedBlueEngine:
    """Adaptive Red vs Blue Simulation Engine.
    Simulates iterative adversarial chess between an adapting attacker (Red)
    and an automated or human-directed defender (Blue) deploying countermeasures.
    """

    def __init__(self, twin: SecurityTwin):
        self.baseline_twin = twin

    def run_red_blue_simulation(self, req: RedBlueSimulationRequest) -> RedBlueSimulationResult:
        sim_id = f"REDBLUE-{uuid.uuid4().hex[:8].upper()}"
        started_at = datetime.now(timezone.utc).isoformat()

        # Fork virtual twin so baseline is NEVER mutated
        virtual_twin = self.baseline_twin.fork_virtual_sandbox()
        sec_graph = SecurityGraph(virtual_twin)
        path_engine = AttackPathEngine(sec_graph)

        initial_paths = path_engine.find_all_attack_paths(
            req.initial_foothold_id, req.target_objective_id, cutoff=8
        )
        initial_paths_count = len(initial_paths)
        current_paths_count = initial_paths_count

        rounds: List[RedBlueRound] = []
        deployed_controls: List[str] = []
        compromised_nodes = {req.initial_foothold_id}

        round_num = 0
        outcome = "MAX_ROUNDS_REACHED"

        # Blue potential playbook countermeasures in priority order
        blue_playbook = [
            {
                "type": "ENABLE_MFA",
                "name": "Enforce Hardware FIDO2 MFA on Admin Sessions",
                "target_scope": ["ID-DOMAIN-ADMIN", "ID-ENG-DEV"],
                "control_id": "CTRL-VIRT-MFA",
            },
            {
                "type": "NETWORK_SEGMENTATION",
                "name": "Air-Gap & Micro-Segment Backup Vault",
                "target_scope": [req.target_objective_id],
                "control_id": "CTRL-VIRT-SEG-VAULT",
            },
            {
                "type": "HOST_ISOLATION",
                "name": "Isolate Compromised Engineering Endpoint",
                "target_scope": [req.initial_foothold_id],
                "control_id": "CTRL-VIRT-ISOLATE",
            },
            {
                "type": "LEAST_PRIVILEGE",
                "name": "Purge Cached LSASS Domain Credentials",
                "target_scope": ["WS-ENG-04", "APP-SRV-01"],
                "control_id": "CTRL-VIRT-LSASS-PURGE",
            },
        ]

        while round_num < req.max_rounds:
            round_num += 1
            paths_before_round = current_paths_count

            # ── RED AGENT TURN ──────────────────────────────────────────────
            current_paths = path_engine.find_all_attack_paths(
                req.initial_foothold_id, req.target_objective_id, cutoff=8
            )

            if not current_paths:
                # Red is completely contained
                outcome = "CONTAINED_BY_DEFENSE"
                red_act = RedAction(
                    action_type="SEARCH_PATH",
                    source_asset_id=req.initial_foothold_id,
                    target_asset_id=req.target_objective_id,
                    technique_id="T1018",
                    technique_name="Remote System Discovery",
                    success=False,
                    blocked_by="Active boundary controls",
                    alternative_path_found=False,
                    evidence=["Graph traversal returned 0 viable paths to objective."],
                )
                rounds.append(
                    RedBlueRound(
                        round_number=round_num,
                        red_action=red_act,
                        blue_action=None,
                        paths_before=paths_before_round,
                        paths_after=0,
                        paths_eliminated=paths_before_round,
                        active_controls_count=len(deployed_controls),
                        current_risk_reduction_percent=100.0,
                        state_summary="Red Agent found zero viable attack paths. Target is fully secured.",
                    )
                )
                break

            # Red picks the best path
            active_path = current_paths[0]
            path_nodes = active_path["path_node_ids"]

            # Red attempts the next hop along this path
            next_hop = None
            for n in path_nodes:
                if n not in compromised_nodes:
                    next_hop = n
                    break

            if not next_hop:
                # Target already reached!
                outcome = "OBJECTIVE_COMPLETED"
                break

            curr_node = path_nodes[path_nodes.index(next_hop) - 1]
            curr_asset = virtual_twin.get_asset(curr_node)
            next_asset = virtual_twin.get_asset(next_hop)

            # Check if any deployed control blocks this transition
            blocked_by = None
            for cid in deployed_controls:
                ctrl = virtual_twin.get_control(cid)
                if ctrl and ctrl.is_active:
                    if next_hop in ctrl.coverage_scope or curr_node in ctrl.coverage_scope:
                        blocked_by = ctrl.name
                        break

            if blocked_by:
                # Red transition is blocked! Red adapts and searches alternative route
                red_success = False
                alt_paths = [p for p in current_paths if next_hop not in p["path_node_ids"]]
                has_alt = len(alt_paths) > 0

                red_act = RedAction(
                    action_type="RECALCULATE_ROUTE" if has_alt else "TRANSITION_BLOCKED",
                    source_asset_id=curr_node,
                    target_asset_id=next_hop,
                    technique_id="T1021.002",
                    technique_name="Lateral Movement Attempt",
                    success=False,
                    blocked_by=blocked_by,
                    alternative_path_found=has_alt,
                    evidence=[
                        f"Transition blocked by control: {blocked_by}",
                        f"Adversary {'rerouted to alternative path' if has_alt else 'has no alternative route'}",
                    ],
                )
            else:
                red_success = True
                compromised_nodes.add(next_hop)
                has_alt = True

                red_act = RedAction(
                    action_type="ATTEMPT_TRANSITION",
                    source_asset_id=curr_node,
                    target_asset_id=next_hop,
                    technique_id="T1021.002",
                    technique_name="SMB / Admin Lateral Pivot",
                    success=True,
                    alternative_path_found=True,
                    evidence=[
                        f"Transitioned from {curr_asset.name if curr_asset else curr_node} to {next_asset.name if next_asset else next_hop}",
                        "Network connectivity verified; credentials accepted",
                    ],
                )

                if next_hop == req.target_objective_id:
                    outcome = "OBJECTIVE_COMPLETED"

            # ── BLUE AGENT TURN ─────────────────────────────────────────────
            blue_act = None
            if req.auto_blue_response and round_num <= len(blue_playbook):
                play = blue_playbook[round_num - 1]
                ctrl_id = f"REDBLUE-{play['control_id']}-{round_num}"

                new_ctrl = SecurityControl(
                    id=ctrl_id,
                    name=play["name"],
                    type=play["type"],
                    description=f"Adaptive Blue response deployed in round {round_num}",
                    is_active=True,
                    coverage_scope=play["target_scope"],
                    effectiveness=0.95,
                    is_virtual=True,
                )
                virtual_twin.add_or_update_control(new_ctrl)
                deployed_controls.append(ctrl_id)

                # Rebuild graph to reflect new control
                sec_graph = SecurityGraph(virtual_twin)
                path_engine = AttackPathEngine(sec_graph)

                new_paths = path_engine.find_all_attack_paths(
                    req.initial_foothold_id, req.target_objective_id, cutoff=8
                )
                current_paths_count = len(new_paths)
                severed = max(0, paths_before_round - current_paths_count)

                blue_act = BlueAction(
                    action_type=play["type"],
                    control_id=ctrl_id,
                    control_name=play["name"],
                    control_type=play["type"],
                    target_scope=play["target_scope"],
                    paths_severed=severed,
                    assets_protected=play["target_scope"],
                )

            paths_eliminated_so_far = max(0, initial_paths_count - current_paths_count)
            risk_reduction_pct = (
                round((paths_eliminated_so_far / max(1, initial_paths_count)) * 100.0, 1)
            )

            rounds.append(
                RedBlueRound(
                    round_number=round_num,
                    red_action=red_act,
                    blue_action=blue_act,
                    paths_before=paths_before_round,
                    paths_after=current_paths_count,
                    paths_eliminated=paths_eliminated_so_far,
                    active_controls_count=len(deployed_controls),
                    current_risk_reduction_percent=risk_reduction_pct,
                    state_summary=(
                        f"Round {round_num}: Red attempted {red_act.technique_name}. "
                        f"{'Blue deployed ' + blue_act.control_name if blue_act else 'No Blue intervention'}. "
                        f"{current_paths_count} viable paths remain."
                    ),
                )
            )

            if current_paths_count == 0:
                outcome = "CONTAINED_BY_DEFENSE"
                break

            if outcome == "OBJECTIVE_COMPLETED":
                break

        completed_at = datetime.now(timezone.utc).isoformat()
        total_eliminated = max(0, initial_paths_count - current_paths_count)
        final_risk_reduction = (
            round((total_eliminated / max(1, initial_paths_count)) * 100.0, 1)
        )

        summary = (
            f"Adaptive Red vs Blue simulation completed over {len(rounds)} rounds. "
            f"Outcome: {outcome}. Initial viable paths: {initial_paths_count}, final remaining: {current_paths_count}. "
            f"Severed {total_eliminated} critical routes ({final_risk_reduction}% risk reduction) via {len(deployed_controls)} deployed controls."
        )

        return RedBlueSimulationResult(
            simulation_id=sim_id,
            started_at=started_at,
            completed_at=completed_at,
            initial_foothold_id=req.initial_foothold_id,
            target_objective_id=req.target_objective_id,
            total_rounds=len(rounds),
            outcome=outcome,
            rounds=rounds,
            initial_paths_count=initial_paths_count,
            final_paths_count=current_paths_count,
            total_paths_eliminated=total_eliminated,
            total_risk_reduction_percent=final_risk_reduction,
            final_controls_deployed=deployed_controls,
            summary=summary,
        )
