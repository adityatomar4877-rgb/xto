import uuid
import random
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
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


# ── Threat vector → initial access technique mapping ──────────────────
THREAT_VECTOR_TECHNIQUES: Dict[str, Tuple[str, str]] = {
    "THREAT-PHISH": ("T1566.001", "Spearphishing Attachment"),
    "THREAT-STOLEN-CREDS": ("T1078.002", "Valid Accounts: Domain Credentials"),
    "THREAT-EXPOSED-VPN": ("T1190", "Exploit Public-Facing Application"),
    "THREAT-EXPOSED-SERVICE": ("T1190", "Exploit Public-Facing Application"),
    "THREAT-VULN-APP": ("T1190", "Exploit Public-Facing Application"),
    "THREAT-INSIDER": ("T1078.004", "Valid Accounts: Cloud Accounts"),
    "THREAT-SUPPLY-CHAIN": ("T1195.002", "Compromise Software Supply Chain"),
    "THREAT-PRIV-ABUSE": ("T1068", "Exploitation for Privilege Escalation"),
    "THREAT-REMOTE-SERVICE": ("T1021.001", "Remote Desktop Protocol"),
    "THREAT-CLOUD-EXPOSURE": ("T1525", "Implant Internal Image"),
    "THREAT-MISCONFIG": ("T1557.001", "LLMNR/NBT-NS Poisoning"),
    "THREAT-AI-AGENT": ("T1190", "Exploit Public-Facing Application"),
}

# ── Port → service/technique mapping for lateral movement ────────────
PORT_TECHNIQUE_MAP: Dict[int, Tuple[str, str]] = {
    22: ("T1021.004", "SSH"),
    445: ("T1021.002", "SMB/Windows Admin Shares"),
    3389: ("T1021.001", "Remote Desktop Protocol"),
    5432: ("T1005", "Database Access via PostgreSQL"),
    1521: ("T1005", "Database Access via Oracle TNS"),
    6443: ("T1525", "Kubernetes API Server Exploitation"),
    6160: ("T1210", "Exploitation of Remote Services"),
    88: ("T1558.003", "Kerberoasting"),
    514: ("T1562.001", "Impair Defenses: Disable or Modify Tools"),
    8080: ("T1190", "Exploit Web Application API"),
    443: ("T1190", "Exploit Public-Facing Application"),
}

# ── Persona → objective technique (what they do when they reach the target) ──
PERSONA_OBJECTIVE_TECHNIQUE: Dict[str, Tuple[str, str]] = {
    AttackerPersona.RANSOMWARE: ("T1486", "Data Encrypted for Impact"),
    AttackerPersona.APT: ("T1041", "Exfiltration Over C2 Channel"),
    AttackerPersona.INSIDER: ("T1567.002", "Exfiltration via Cloud Storage"),
    AttackerPersona.FINANCIAL_CRIMINAL: ("T1565.001", "Stored Data Manipulation"),
    AttackerPersona.SCRIPT_KIDDIE: ("T1485", "Data Destruction"),
}

# ── Persona → objective action name ──────────────────────────────────
PERSONA_OBJECTIVE_ACTION: Dict[str, str] = {
    AttackerPersona.RANSOMWARE: "Deploy Ransomware Payload & Encrypt Backups",
    AttackerPersona.APT: "Establish Persistent C2 & Exfiltrate Sensitive Data",
    AttackerPersona.INSIDER: "Exfiltrate Financial Records to Personal Cloud",
    AttackerPersona.FINANCIAL_CRIMINAL: "Execute Fraudulent SWIFT Transfer & Modify Ledger",
    AttackerPersona.SCRIPT_KIDDIE: "Wipe Data & Deface Systems",
}


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

        # ── Step 0: Establish Initial Foothold ──────────────────────────
        # Map the actual threat vector to a real MITRE technique
        tv_tech = THREAT_VECTOR_TECHNIQUES.get(
            req.threat_vector_id,
            ("T1190", "Exploit Public-Facing Application"),
        )
        technique_id_0 = tv_tech[0]
        technique_name_0 = tv_tech[1]

        # Build realistic initial access explanation from the threat vector
        tv = self._get_threat_vector(req.threat_vector_id)
        entry_desc = tv.entry_mechanism if tv else f"Exploitation of {req.initial_foothold_id}"

        ev0 = self.evidence_collector.record_evidence(
            source="EDR_PROCESS_MONITOR",
            evidence_type=EvidenceType.VULNERABILITY_EXPLOIT,
            epistemic_status=EpistemicStatus.FACT,
            subject_asset_id=req.initial_foothold_id,
            finding=f"Initial access established on {foothold_name} via {req.threat_vector_id}.",
            technical_details={"threat_vector": req.threat_vector_id, "persona": profile.persona.value},
            applicable_technique_id=technique_id_0,
        )

        reasons_0 = [
            f"Threat vector '{req.threat_vector_id}' executed against {foothold_name} ({foothold_asset.ip_address if foothold_asset else 'target'})",
            entry_desc[:120] + ("..." if len(entry_desc) > 120 else ""),
        ]
        # Add vulnerability-specific reason if the foothold has vulns
        if foothold_asset and foothold_asset.vulnerabilities:
            v = foothold_asset.vulnerabilities[0]
            reasons_0.append(f"Unpatched vulnerability {v.cve} (CVSS {v.cvss_score}) exploited on {v.affected_service}")

        # Add persona-specific initial behavior
        if profile.stealth > 0.7:
            reasons_0.append(f"Low-noise execution — {profile.name} maintained stealth (stealth rating {profile.stealth})")
        else:
            reasons_0.append(f"High-velocity execution — {profile.name} prioritized speed over stealth")

        timeline.append(
            SimulationEvent(
                step=step,
                timestamp_offset_seconds=current_time_offset,
                phase=SimulationPhase.FOOTHOLD,
                source_asset_id="EXT-INTERNET",
                source_asset_name="External Threat Actor",
                target_asset_id=req.initial_foothold_id,
                target_asset_name=foothold_name,
                action_name=f"Establish Foothold on {foothold_name}",
                technique_id=technique_id_0,
                technique_name=technique_name_0,
                identity_used="ID-ENG-DEV" if "WS-ENG" in req.initial_foothold_id else None,
                success=True,
                evidence_ids=[ev0.id],
                explanation=f"Adversary gained execution on {foothold_name} using {technique_name_0}.",
                reason=reasons_0,
            )
        )

        # ── Simulation Loop ─────────────────────────────────────────────
        objective_achieved = False
        contained = False

        while step < req.max_steps and not objective_achieved and not contained:
            step += 1
            # Variable timing based on edge complexity
            current_time_offset += random.randint(3, 12)

            # Determine best next move using graph shortest path
            try:
                best_path = None
                shortest_len = float("inf")
                for comp_node in state.compromised_assets:
                    if nx.has_path(g, comp_node, req.target_objective_id):
                        p = nx.shortest_path(g, comp_node, req.target_objective_id)
                        if len(p) < shortest_len:
                            shortest_len = len(p)
                            best_path = p

                if not best_path or len(best_path) < 2:
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
            edge_data = edge_data_list[0] if edge_data_list else {}
            edge_type = edge_data.get("type", "NETWORK_REACHABILITY")
            edge_props = edge_data.get("properties", {})
            edge_port = edge_data.get("port")
            edge_proto = edge_data.get("protocol", "TCP")

            # ── Determine phase ──────────────────────────────────────────
            if next_node == req.target_objective_id:
                phase = SimulationPhase.IMPACT
            elif edge_type == "CREDENTIAL_ACCESS":
                phase = SimulationPhase.CREDENTIAL_ACCESS
            elif edge_type in ("REMOTE_EXECUTION", "NETWORK_REACHABILITY"):
                # Check if we're escalating or moving laterally
                if next_asset and next_asset.criticality_score and next_asset.criticality_score >= 9.0:
                    phase = SimulationPhase.PRIVILEGE_ESCALATION
                else:
                    phase = SimulationPhase.LATERAL_MOVEMENT
            elif edge_type == "AUTHENTICATION":
                phase = SimulationPhase.PRIVILEGE_ESCALATION
            else:
                phase = SimulationPhase.LATERAL_MOVEMENT

            # ── Check defenses ───────────────────────────────────────────
            blocking_control = self._evaluate_step_defenses(curr_node, next_node, edge_type, edge_props)

            if blocking_control:
                # Step BLOCKED
                blocked_tech_id, blocked_tech_name = self._map_blocked_technique(
                    edge_type, edge_port, edge_props, next_asset
                )
                ev_block = self.evidence_collector.record_evidence(
                    source="DEFENSIVE_CONTROL_TELEMETRY",
                    evidence_type=EvidenceType.CONTROL_BYPASS,
                    epistemic_status=EpistemicStatus.FACT,
                    subject_asset_id=curr_node,
                    target_asset_id=next_node,
                    finding=f"Lateral transition to {n_name} was BLOCKED by {blocking_control.name}",
                    technical_details={"control_id": blocking_control.id, "control_type": blocking_control.type},
                    blocking_controls_tested=[blocking_control.id],
                )

                block_reasons = self._build_block_reasons(
                    blocking_control, curr_asset, next_asset, edge_type, edge_port, edge_props
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
                        action_name=f"Attempt {blocked_tech_name} to {n_name}",
                        technique_id=blocked_tech_id,
                        technique_name=blocked_tech_name,
                        success=False,
                        evidence_ids=[ev_block.id],
                        explanation=f"Blocked by '{blocking_control.name}' — adversary could not traverse to {n_name}.",
                        blocked_by_control=blocking_control.name,
                        reason=block_reasons,
                    )
                )
                contained = True
                break

            # ── Step SUCCESSFUL: Map technique from real edge data ────────
            state.compromised_assets.add(next_node)
            edge_weight = edge_data.get("weight", 2.0)
            state.accumulated_effort += edge_weight

            technique_id, technique_name, id_used = self._map_step_technique(
                edge_type, edge_port, edge_props, next_asset, curr_asset, profile
            )

            if id_used:
                state.compromised_identities.add(id_used)
                if id_used == "ID-DOMAIN-ADMIN":
                    state.held_privileges.add("DOMAIN_ADMIN")
                elif "DBA" in id_used:
                    state.held_privileges.add("ELEVATED")
                elif "BACKUP" in id_used:
                    state.held_privileges.add("SYSTEM")

            # ── Build realistic, data-driven explanation ────────────────
            ev_step = self.evidence_collector.record_evidence(
                source=self._map_evidence_source(edge_type),
                evidence_type=EvidenceType.NETWORK_REACHABILITY if edge_type == "NETWORK_REACHABILITY" else EvidenceType.CREDENTIAL_EXPOSURE,
                epistemic_status=EpistemicStatus.FACT,
                subject_asset_id=curr_node,
                target_asset_id=next_node,
                finding=f"Attacker transitioned from {c_name} to {n_name} via {technique_name}.",
                technical_details={"edge_type": edge_type, "port": edge_port, "protocol": edge_proto, "properties": edge_props},
                applicable_technique_id=technique_id,
            )

            action_name = self._build_action_name(phase, edge_type, technique_name, n_name, edge_port, edge_props)
            step_reasons = self._build_step_reasons(
                curr_asset, next_asset, edge_type, edge_port, edge_proto, edge_props,
                technique_id, technique_name, id_used, profile
            )

            # Determine privilege obtained
            privilege_obtained = None
            if id_used == "ID-DOMAIN-ADMIN":
                privilege_obtained = "DOMAIN_ADMIN"
            elif id_used and "DBA" in id_used:
                privilege_obtained = "ELEVATED"
            elif id_used and "BACKUP" in id_used:
                privilege_obtained = "SYSTEM"
            elif next_asset and next_asset.type == "DOMAIN_CONTROLLER":
                privilege_obtained = "DOMAIN_ADMIN"

            timeline.append(
                SimulationEvent(
                    step=step,
                    timestamp_offset_seconds=current_time_offset,
                    phase=phase,
                    source_asset_id=curr_node,
                    source_asset_name=c_name,
                    target_asset_id=next_node,
                    target_asset_name=n_name,
                    action_name=action_name,
                    technique_id=technique_id,
                    technique_name=technique_name,
                    identity_used=id_used,
                    privilege_obtained=privilege_obtained,
                    success=True,
                    evidence_ids=[ev_step.id],
                    explanation=self._build_explanation(curr_asset, next_asset, edge_type, edge_port, technique_name, edge_props),
                    reason=step_reasons,
                )
            )

            # ── Objective achieved? ──────────────────────────────────────
            if next_node == req.target_objective_id:
                objective_achieved = True
                step += 1
                current_time_offset += random.randint(5, 20)

                obj_tech = PERSONA_OBJECTIVE_TECHNIQUE.get(
                    req.attacker_persona, ("T1486", "Data Encrypted for Impact")
                )
                obj_action = PERSONA_OBJECTIVE_ACTION.get(
                    req.attacker_persona, "Achieve Adversary Objective"
                )

                obj_reasons = [
                    f"Crown jewel '{n_name}' fully compromised — adversary holds {privilege_obtained or 'administrative'} privilege",
                    f"{profile.name} executed objective: {obj_action}",
                ]
                # Add target-specific context
                if target_asset:
                    obj_reasons.append(f"Target: {target_asset.os} running {', '.join(target_asset.services[:3])}")
                obj_reasons.append(f"Impact technique {obj_tech[0]} ({obj_tech[1]}) deployed successfully")

                timeline.append(
                    SimulationEvent(
                        step=step,
                        timestamp_offset_seconds=current_time_offset,
                        phase=SimulationPhase.OBJECTIVE_COMPLETED,
                        source_asset_id=next_node,
                        source_asset_name=n_name,
                        target_asset_id=next_node,
                        target_asset_name=n_name,
                        action_name=obj_action,
                        technique_id=obj_tech[0],
                        technique_name=obj_tech[1],
                        identity_used=id_used,
                        success=True,
                        evidence_ids=[ev_step.id],
                        explanation=f"{profile.name} completed primary objective on {n_name}: {obj_tech[1]}.",
                        reason=obj_reasons,
                    )
                )
                break

        # ── Calculate blast radius ──────────────────────────────────────
        total_twin_assets = len(self.twin.get_all_assets())
        blast_percent = round((len(state.compromised_assets) / max(1, total_twin_assets)) * 100, 1)

        # ── Build summary ───────────────────────────────────────────────
        if objective_achieved:
            outcome = "OBJECTIVE ACHIEVED — CRITICAL BREACH"
        elif contained:
            outcome = "ATTACK CONTAINED BY DEFENSES"
        else:
            outcome = "SIMULATION EXHAUSTED — NO PATH TO OBJECTIVE"

        summary = (
            f"{profile.name} ({profile.persona.value}) initiated from {foothold_name} "
            f"via {req.threat_vector_id} targeting {target_name}. "
            f"{outcome}. "
            f"Compromised {len(state.compromised_assets)}/{total_twin_assets} assets "
            f"({blast_percent}% blast) in {len(timeline)} steps "
            f"over ~{current_time_offset}s of simulated time."
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

    # ── Helper: Map edge data to real MITRE technique ───────────────────

    def _map_step_technique(
        self,
        edge_type: str,
        edge_port: Optional[int],
        edge_props: Dict[str, Any],
        next_asset: Optional[Any],
        curr_asset: Optional[Any],
        profile: Any,
    ) -> Tuple[str, str, Optional[str]]:
        """Map edge type + port + properties to a real MITRE technique."""

        id_used = None

        # 1. Credential access edge (LSASS dumping, cached creds)
        if edge_type == "CREDENTIAL_ACCESS":
            technique_id = "T1003.001"
            technique_name = "LSASS Memory Credential Dumping"
            id_used = edge_props.get("cached_identity", "ID-DOMAIN-ADMIN")
            return technique_id, technique_name, id_used

        # 2. Authentication edge (Kerberos, etc.)
        if edge_type == "AUTHENTICATION":
            mechanism = edge_props.get("mechanism", "")
            if "Kerberos" in mechanism:
                technique_id = "T1558.003"
                technique_name = f"Kerberoasting ({mechanism})"
            else:
                technique_id = "T1078"
                technique_name = "Valid Accounts"
            # Use the service account if target is app server
            if next_asset and next_asset.identities:
                id_used = next_asset.identities[0]
            return technique_id, technique_name, id_used

        # 3. Remote execution edge
        if edge_type == "REMOTE_EXECUTION":
            method = edge_props.get("method", "")
            if "WinRM" in method or "WMI" in method:
                technique_id = "T1047"
                technique_name = "Windows Management Instrumentation (WMI)"
            elif "SMB" in method:
                technique_id = "T1021.002"
                technique_name = "SMB/Windows Admin Shares"
            elif "kube" in method.lower() or "kubernetes" in method.lower():
                technique_id = "T1525"
                technique_name = "Kubernetes API Abuse"
            else:
                technique_id = "T1021"
                technique_name = "Remote Services"
            id_used = "ID-DOMAIN-ADMIN"
            return technique_id, technique_name, id_used

        # 4. Privilege edge
        if edge_type == "PRIVILEGE":
            priv = edge_props.get("privilege", "")
            technique_id = "T1078"
            technique_name = f"Abuse {priv}" if priv else "Valid Accounts"
            if next_asset and next_asset.identities:
                id_used = next_asset.identities[0]
            return technique_id, technique_name, id_used

        # 5. Network reachability — map by port
        if edge_port and edge_port in PORT_TECHNIQUE_MAP:
            tech_id, tech_name = PORT_TECHNIQUE_MAP[edge_port]
            # For SSH, use the dev identity if on engineering workstation
            if edge_port == 22 and curr_asset and "ENG" in curr_asset.id:
                id_used = "ID-ENG-DEV"
            return tech_id, tech_name, id_used

        # 6. Check if target asset has a vulnerability we're exploiting
        if next_asset and next_asset.vulnerabilities:
            v = next_asset.vulnerabilities[0]
            return v.exploitable_technique, f"Exploit {v.name}", id_used

        # 7. Fallback: determine by service/protocol
        service = edge_props.get("service", "")
        if "SMB" in service or "RPC" in service:
            return "T1021.002", "SMB/Windows Admin Shares", id_used
        if "SSH" in service:
            return "T1021.004", "SSH", id_used

        # 8. Final fallback based on target OS
        if next_asset and "Linux" in (next_asset.os or ""):
            return "T1021.004", "SSH Remote Execution", id_used
        if next_asset and "Windows" in (next_asset.os or ""):
            return "T1021.002", "SMB/Windows Admin Shares", id_used

        return "T1021", "Remote Services", id_used

    def _map_blocked_technique(
        self, edge_type: str, edge_port: Optional[int], edge_props: Dict, next_asset: Optional[Any]
    ) -> Tuple[str, str]:
        """Map the technique that was attempted but blocked."""
        tech_id, tech_name, _ = self._map_step_technique(
            edge_type, edge_port, edge_props, next_asset, None, None
        )
        return tech_id, tech_name

    def _build_action_name(
        self, phase: str, edge_type: str, technique_name: str, target_name: str,
        edge_port: Optional[int], edge_props: Dict
    ) -> str:
        """Build a realistic, varied action name."""
        if phase == SimulationPhase.CREDENTIAL_ACCESS:
            store = edge_props.get("store", "LSASS")
            return f"Dump {store} Credentials on {target_name}"
        if phase == SimulationPhase.PRIVILEGE_ESCALATION:
            return f"Escalate Privileges via {technique_name}"
        if edge_type == "AUTHENTICATION":
            return f"Authenticate via {edge_props.get('mechanism', 'Kerberos')}"
        if edge_type == "REMOTE_EXECUTION":
            method = edge_props.get("method", "")
            if method:
                return f"Execute Remote Command via {method.split('/')[0].strip()}"
        if edge_port == 22:
            return f"Pivot via SSH to {target_name}"
        if edge_port == 445:
            return f"Mount SMB Share on {target_name}"
        if edge_port == 3389:
            return f"RDP Session to {target_name}"
        if edge_port == 5432:
            return f"Query Database on {target_name}"
        if edge_port == 6443:
            return f"Access Kubernetes API on {target_name}"
        # Generic
        return f"Pivot to {target_name}"

    def _build_step_reasons(
        self,
        curr_asset: Optional[Any],
        next_asset: Optional[Any],
        edge_type: str,
        edge_port: Optional[int],
        edge_proto: str,
        edge_props: Dict,
        technique_id: str,
        technique_name: str,
        id_used: Optional[str],
        profile: Any,
    ) -> List[str]:
        """Build data-driven causal reasons referencing actual twin data."""
        reasons: List[str] = []
        c_name = curr_asset.name if curr_asset else "attacker"
        n_name = next_asset.name if next_asset else "target"

        # 1. Network connectivity reason (port/protocol)
        port_str = f"{edge_proto} {edge_port}" if edge_port else edge_proto
        service = edge_props.get("service", "")
        if service:
            reasons.append(f"{port_str} open: {c_name} → {n_name} ({service})")
        else:
            reasons.append(f"{port_str} open: {c_name} → {n_name}")

        # 2. Technique execution reason
        reasons.append(f"{technique_id} ({technique_name}) executed successfully")

        # 3. Identity/credential reason
        if id_used:
            if edge_type == "CREDENTIAL_ACCESS":
                store = edge_props.get("store", "LSASS Memory")
                reasons.append(f"Cached credential '{id_used}' extracted from {store}")
            else:
                reasons.append(f"Identity '{id_used}' used for authentication")
        else:
            # Check if no auth required
            auth = edge_props.get("auth", "")
            if "Single Factor" in auth:
                reasons.append(f"Single-factor authentication bypassed on {port_str}")
            elif auth:
                reasons.append(f"Authentication: {auth}")
            else:
                reasons.append("No authentication barrier on this channel")

        # 4. Vulnerability reason (if exploiting a CVE)
        if next_asset and next_asset.vulnerabilities:
            v = next_asset.vulnerabilities[0]
            reasons.append(f"Unpatched: {v.cve} (CVSS {v.cvss_score}) on {v.affected_service}")

        # 5. Control absence reason
        reasons.append("No active security control blocked this transition")

        # 6. Persona-specific behavior note (occasionally)
        if profile and profile.stealth > 0.7 and random.random() < 0.4:
            reasons.append(f"Stealth maintained — {profile.name} avoided detection signatures")
        elif profile and profile.stealth < 0.3 and random.random() < 0.4:
            reasons.append(f"Noisy execution — {profile.name} prioritized speed (stealth {profile.stealth})")

        return reasons

    def _build_block_reasons(
        self, control: Any, curr_asset: Optional[Any], next_asset: Optional[Any],
        edge_type: str, edge_port: Optional[int], edge_props: Dict
    ) -> List[str]:
        """Build reasons for why a control blocked the step."""
        reasons: List[str] = []
        n_name = next_asset.name if next_asset else "target"
        c_name = curr_asset.name if curr_asset else "attacker"

        reasons.append(f"Control '{control.name}' ({control.type}) intercepted transition to {n_name}")
        if control.type == "NETWORK_SEGMENTATION":
            reasons.append(f"Network segmentation severed the route from {c_name} to {n_name}")
            reasons.append(f"Inbound traffic to {n_name} on port {edge_port or 'N/A'} dropped by ACL")
        elif control.type == "MFA":
            reasons.append(f"MFA challenge blocked credential replay for {edge_props.get('cached_identity', 'admin')}")
            reasons.append("Pass-the-hash invalidated by out-of-band authentication requirement")
        elif control.type == "HOST_ISOLATION":
            reasons.append(f"Host isolation quarantined {c_name} — all network adapters severed")
        elif control.type == "LEAST_PRIVILEGE":
            reasons.append("Cached admin tokens purged — credential dumping returned no usable hashes")

        reasons.append(f"Adversary must recalculate alternative route (control effectiveness: {control.effectiveness:.0%})")
        return reasons

    def _build_explanation(
        self, curr_asset: Optional[Any], next_asset: Optional[Any],
        edge_type: str, edge_port: Optional[int], technique_name: str, edge_props: Dict
    ) -> str:
        """Build a concise explanation for the step."""
        c_name = curr_asset.name if curr_asset else "attacker"
        n_name = next_asset.name if next_asset else "target"

        if edge_type == "CREDENTIAL_ACCESS":
            store = edge_props.get("store", "LSASS Memory")
            return f"Dumped credentials from {store} on {c_name}, extracting {edge_props.get('cached_identity', 'admin')} hash."
        if edge_type == "AUTHENTICATION":
            return f"Authenticated to {n_name} using {edge_props.get('mechanism', 'Kerberos')} ticket."
        if edge_type == "REMOTE_EXECUTION":
            method = edge_props.get("method", "remote execution")
            return f"Executed remote commands on {n_name} via {method}."
        if edge_port == 22:
            return f"Established SSH session on {n_name} ({edge_port}/tcp) — interactive shell obtained."
        if edge_port == 445:
            return f"Mounted SMB admin share on {n_name} ({edge_port}/tcp) — file system access gained."
        if edge_port == 3389:
            return f"Opened RDP session to {n_name} ({edge_port}/tcp) — graphical desktop control."
        if edge_port == 5432:
            return f"Connected to PostgreSQL on {n_name} ({edge_port}/tcp) — database records accessible."
        if edge_port == 6443:
            return f"Accessed Kubernetes API on {n_name} ({edge_port}/tcp) — cluster takeover."
        return f"Pivoted from {c_name} to {n_name} using {technique_name}."

    def _map_evidence_source(self, edge_type: str) -> str:
        if edge_type == "CREDENTIAL_ACCESS":
            return "LSASS_MEMORY_ANALYSIS"
        if edge_type == "AUTHENTICATION":
            return "KERBEROS_TICKET_AUDIT"
        if edge_type == "REMOTE_EXECUTION":
            return "WINRM_WMI_LOG"
        return "NETWORK_FLOW_ANALYZER"

    def _get_threat_vector(self, tv_id: str):
        try:
            from app.core.dependencies import get_threat_engine
            return get_threat_engine().get_all_vectors_dict().get(tv_id)
        except Exception:
            return None

    def _evaluate_step_defenses(
        self,
        curr_node: str,
        next_node: str,
        edge_type: str,
        edge_props: Dict[str, Any],
    ) -> Optional[Any]:
        """Check if any active defense control halts this transition."""
        for ctrl in self.twin.get_all_controls():
            if not ctrl.is_active:
                continue

            if ctrl.type == "NETWORK_SEGMENTATION" and "VAULT-BACKUP-01" in ctrl.coverage_scope:
                if next_node == "VAULT-BACKUP-01":
                    return ctrl

            if ctrl.type == "HOST_ISOLATION":
                if curr_node in ctrl.coverage_scope or next_node in ctrl.coverage_scope:
                    return ctrl

            if ctrl.type == "MFA":
                cached_id = edge_props.get("cached_identity")
                if cached_id in ctrl.coverage_scope or "ID-DOMAIN-ADMIN" in ctrl.coverage_scope:
                    if edge_type == "CREDENTIAL_ACCESS":
                        return ctrl

            if ctrl.type == "LEAST_PRIVILEGE":
                if edge_type == "CREDENTIAL_ACCESS" and "WS-ENG-04" in ctrl.coverage_scope:
                    return ctrl

        return None
