import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import networkx as nx

from app.schemas.simulation import (
    AttackerPersona,
    SimulationPhase,
    SimulationEvent,
    SimulationRequest,
    SimulationTrace,
)
from app.schemas.evidence import EpistemicStatus, EvidenceType
from xto_core.twin.security_twin import SecurityTwin
from xto_core.graph.security_graph import SecurityGraph
from xto_core.simulation.attacker_agent import (
    AttackerAgentState,
    get_default_attacker_profiles,
)
from xto_core.evidence.evidence_collector import EvidenceCollector


class AttackSimulator:
    """Agent-based Adversary Attack Simulator for XTO."""

    def __init__(self, twin: SecurityTwin, evidence_collector: Optional[EvidenceCollector] = None):
        self.twin = twin
        self.evidence_collector = evidence_collector or EvidenceCollector()
        self.profiles = get_default_attacker_profiles()

    def run_simulation(self, req: SimulationRequest) -> SimulationTrace:
        sim_id = f"SIM-{uuid.uuid4().hex[:8].upper()}"
        start_time = datetime.now(timezone.utc).isoformat()

        profile = self.profiles.get(req.attacker_persona, self.profiles[AttackerPersona.RANSOMWARE])
        state = AttackerAgentState(profile, req.initial_foothold_id, req.target_objective_id)

        sec_graph = SecurityGraph(self.twin)
        g = sec_graph.nx_graph

        timeline: List[SimulationEvent] = []
        step = 0
        current_time_offset = 0

        foothold_asset = self.twin.get_asset(req.initial_foothold_id)
        target_asset = self.twin.get_asset(req.target_objective_id)
        foothold_name = foothold_asset.name if foothold_asset else req.initial_foothold_id
        target_name = target_asset.name if target_asset else req.target_objective_id

        # Step 0: Establish Initial Foothold
        ev0 = self.evidence_collector.record_evidence(
            source="EDR_PROCESS_MONITOR",
            evidence_type=EvidenceType.VULNERABILITY_EXPLOIT,
            epistemic_status=EpistemicStatus.FACT,
            subject_asset_id=req.initial_foothold_id,
            finding=f"Initial access established on {foothold_name} via {req.threat_vector_id}.",
            technical_details={"threat_vector": req.threat_vector_id, "persona": profile.persona.value},
            applicable_technique_id="T1566.001",
        )

        timeline.append(
            SimulationEvent(
                step=step,
                timestamp_offset_seconds=current_time_offset,
                phase=SimulationPhase.FOOTHOLD,
                source_asset_id="EXT-INTERNET",
                source_asset_name="External Threat Actor",
                target_asset_id=req.initial_foothold_id,
                target_asset_name=foothold_name,
                action_name=f"Execute {req.threat_vector_id} Entry Vector",
                technique_id="T1566.001",
                technique_name="Spearphishing Attachment / Initial Exploitation",
                identity_used="ID-ENG-DEV" if "WS-ENG" in req.initial_foothold_id else None,
                success=True,
                evidence_ids=[ev0.id],
                explanation=f"Adversary gained unprivileged interactive user execution on {foothold_name}.",
                reason=[
                    f"Initial entry vector '{req.threat_vector_id}' delivered to '{foothold_name}'",
                    f"Local execution context established on {foothold_asset.ip_address if foothold_asset else 'target'}",
                    "No perimeter control prevented initial execution",
                ],
            )
        )

        # Simulation Loop
        objective_achieved = False
        contained = False

        while step < req.max_steps and not objective_achieved and not contained:
            step += 1
            current_time_offset += 4  # 4 seconds between major phases

            # Determine best next move towards objective using graph Dijkstra / paths
            try:
                # Find shortest path from any compromised node to the objective
                best_path = None
                shortest_len = float("inf")
                for comp_node in state.compromised_assets:
                    if nx.has_path(g, comp_node, req.target_objective_id):
                        p = nx.shortest_path(g, comp_node, req.target_objective_id)
                        if len(p) < shortest_len:
                            shortest_len = len(p)
                            best_path = p

                if not best_path or len(best_path) < 2:
                    # No viable path remaining in the graph to reach objective!
                    contained = True
                    break

                curr_node = best_path[0]
                next_node = best_path[1]
            except Exception:
                contained = True
                break

            curr_asset = self.twin.get_asset(curr_node)
            next_asset = self.twin.get_asset(next_node)
            c_name = curr_asset.name if curr_asset else curr_node
            n_name = next_asset.name if next_asset else next_node

            edge_data_list = sec_graph.get_edge_data(curr_node, next_node)
            edge_type = edge_data_list[0].get("type", "NETWORK_REACHABILITY") if edge_data_list else "NETWORK_REACHABILITY"
            edge_props = edge_data_list[0].get("properties", {}) if edge_data_list else {}

            # Phase detection
            if next_node == req.target_objective_id:
                phase = SimulationPhase.IMPACT
            elif edge_type == "CREDENTIAL_ACCESS":
                phase = SimulationPhase.CREDENTIAL_ACCESS
            elif edge_type in ("REMOTE_EXECUTION", "NETWORK_REACHABILITY"):
                phase = SimulationPhase.LATERAL_MOVEMENT
            else:
                phase = SimulationPhase.PRIVILEGE_ESCALATION

            # Check if any active defense control blocks this specific step!
            blocking_control = self._evaluate_step_defenses(curr_node, next_node, edge_type, edge_props)

            if blocking_control:
                # Step is BLOCKED by a security control!
                ev_block = self.evidence_collector.record_evidence(
                    source="DEFENSIVE_CONTROL_TELEMETRY",
                    evidence_type=EvidenceType.CONTROL_BYPASS,
                    epistemic_status=EpistemicStatus.FACT,
                    subject_asset_id=curr_node,
                    target_asset_id=next_node,
                    finding=f"Lateral transition to {n_name} was BLOCKED by active control: {blocking_control.name}",
                    technical_details={"control_id": blocking_control.id, "control_type": blocking_control.type},
                    blocking_controls_tested=[blocking_control.id],
                )

                timeline.append(
                    SimulationEvent(
                        step=step,
                        timestamp_offset_seconds=current_time_offset,
                        phase=phase,
                        source_asset_id=curr_node,
                        source_asset_name=c_name,
                        target_asset_id=next_node,
                        target_asset_name=n_name,
                        action_name=f"Attempt Lateral Pivot to {n_name}",
                        technique_id="T1021.002",
                        technique_name="SMB/Remote Administrative Pivot",
                        success=False,
                        evidence_ids=[ev_block.id],
                        explanation=f"Move blocked by defense control: '{blocking_control.name}' ({blocking_control.type}). Attacker could not traverse boundary.",
                        blocked_by_control=blocking_control.name,
                        reason=[
                            f"Target '{n_name}' protected by active control '{blocking_control.name}'",
                            f"Control type '{blocking_control.type}' enforced boundary containment",
                            "Lateral transition blocked; adversary must recalculate route",
                        ],
                    )
                )
                contained = True
                break

            # Step SUCCESSFUL: Advance attacker state
            state.compromised_assets.add(next_node)
            state.accumulated_effort += edge_data_list[0].get("weight", 2.0) if edge_data_list else 2.0

            # Map technique and identities
            technique_id = "T1021.002"
            technique_name = "SMB/Windows Admin Shares"
            id_used = None

            if edge_type == "CREDENTIAL_ACCESS":
                technique_id = "T1003.001"
                technique_name = "LSASS Memory Credential Dumping"
                id_used = edge_props.get("cached_identity", "ID-DOMAIN-ADMIN")
                state.compromised_identities.add(id_used)
                state.held_privileges.add("DOMAIN_ADMIN")
            elif edge_type == "REMOTE_EXECUTION":
                technique_id = "T1047"
                technique_name = "Windows Management Instrumentation (WMI)"
                id_used = "ID-DOMAIN-ADMIN"
            elif next_asset and next_asset.vulnerabilities:
                technique_id = next_asset.vulnerabilities[0].exploitable_technique
                technique_name = f"Exploit {next_asset.vulnerabilities[0].name}"

            ev_step = self.evidence_collector.record_evidence(
                source="HOST_INSPECTION_AUDIT",
                evidence_type=EvidenceType.NETWORK_REACHABILITY if edge_type == "NETWORK_REACHABILITY" else EvidenceType.CREDENTIAL_EXPOSURE,
                epistemic_status=EpistemicStatus.FACT,
                subject_asset_id=curr_node,
                target_asset_id=next_node,
                finding=f"Attacker successfully transitioned from {c_name} to {n_name} using {technique_name}.",
                technical_details={"edge_type": edge_type, "properties": edge_props},
                applicable_technique_id=technique_id,
            )

            timeline.append(
                SimulationEvent(
                    step=step,
                    timestamp_offset_seconds=current_time_offset,
                    phase=phase,
                    source_asset_id=curr_node,
                    source_asset_name=c_name,
                    target_asset_id=next_node,
                    target_asset_name=n_name,
                    action_name=f"Compromise & Pivot to {n_name}",
                    technique_id=technique_id,
                    technique_name=technique_name,
                    identity_used=id_used,
                    privilege_obtained="DOMAIN_ADMIN" if id_used == "ID-DOMAIN-ADMIN" else "LOCAL_ADMIN",
                    success=True,
                    evidence_ids=[ev_step.id],
                    explanation=f"Successfully exploited {edge_type.lower()} channel. Gained interactive control of {n_name}.",
                    reason=[
                        f"Network connectivity open between {c_name} and {n_name} ({edge_type})",
                        f"Technique {technique_id} ({technique_name}) successfully executed",
                        f"Identity '{id_used}' held with required privilege" if id_used else "Standard session token sufficient",
                        "No active security control blocked communication",
                    ],
                )
            )

            if next_node == req.target_objective_id:
                objective_achieved = True
                # Final Objective Event
                step += 1
                current_time_offset += 3
                timeline.append(
                    SimulationEvent(
                        step=step,
                        timestamp_offset_seconds=current_time_offset,
                        phase=SimulationPhase.OBJECTIVE_COMPLETED,
                        source_asset_id=next_node,
                        source_asset_name=n_name,
                        target_asset_id=next_node,
                        target_asset_name=n_name,
                        action_name="Achieve Adversary Objective (Payload Detonation)",
                        technique_id="T1486",
                        technique_name="Data Encrypted for Impact / Backup Erasure",
                        identity_used=id_used,
                        success=True,
                        evidence_ids=[ev_step.id],
                        explanation=f"Adversary completed primary objective: fully compromised {n_name}.",
                        reason=[
                            f"Target crown jewel '{n_name}' reached",
                            "Data encryption and backup inhibition payload deployed",
                            "Full compromise impact verified",
                        ],
                    )
                )
                break

        # Calculate blast radius
        total_twin_assets = len(self.twin.get_all_assets())
        blast_percent = round((len(state.compromised_assets) / max(1, total_twin_assets)) * 100, 1)

        summary = (
            f"Adversary '{profile.name}' ({profile.persona.value}) initiated attack from '{foothold_name}' "
            f"targeting crown jewel '{target_name}'. "
            f"Result: {'OBJECTIVE ACHIEVED — CRITICAL BREACH' if objective_achieved else 'ATTACK CONTAINED BY DEFENSES'}. "
            f"Compromised {len(state.compromised_assets)} of {total_twin_assets} assets ({blast_percent}% blast radius) "
            f"over {len(timeline)} chronological operations."
        )

        completed_time = datetime.now(timezone.utc).isoformat()
        return SimulationTrace(
            simulation_id=sim_id,
            started_at=start_time,
            completed_at=completed_time,
            attacker_persona=profile.persona,
            threat_vector_id=req.threat_vector_id,
            initial_foothold_id=req.initial_foothold_id,
            target_objective_id=req.target_objective_id,
            objective_achieved=objective_achieved,
            total_steps=len(timeline),
            timeline=timeline,
            compromised_assets=list(state.compromised_assets),
            compromised_identities=list(state.compromised_identities),
            total_attacker_effort_score=round(state.accumulated_effort, 2),
            blast_radius_percent=blast_percent,
            summary=summary,
        )

    def _evaluate_step_defenses(
        self,
        curr_node: str,
        next_node: str,
        edge_type: str,
        edge_props: Dict[str, Any],
    ) -> Optional[Any]:
        """Check if any active defense control in the twin halts this transition."""
        for ctrl in self.twin.get_all_controls():
            if not ctrl.is_active:
                continue

            # 1. Network Segmentation on Backup Vault
            if ctrl.type == "NETWORK_SEGMENTATION" and "VAULT-BACKUP-01" in ctrl.coverage_scope:
                if next_node == "VAULT-BACKUP-01":
                    return ctrl

            # 2. Host Isolation
            if ctrl.type == "HOST_ISOLATION":
                if curr_node in ctrl.coverage_scope or next_node in ctrl.coverage_scope:
                    return ctrl

            # 3. MFA enforcement on Domain Admin credentials
            if ctrl.type == "MFA":
                cached_id = edge_props.get("cached_identity")
                if cached_id in ctrl.coverage_scope or "ID-DOMAIN-ADMIN" in ctrl.coverage_scope:
                    if edge_type == "CREDENTIAL_ACCESS":
                        return ctrl

            # 4. Least Privilege / Privilege Revocation
            if ctrl.type == "LEAST_PRIVILEGE":
                if edge_type == "CREDENTIAL_ACCESS" and "WS-ENG-04" in ctrl.coverage_scope:
                    return ctrl

        return None
