import logging
from typing import Any, Dict, List, Optional
from app.schemas.defense import DefenseIntervention
from app.schemas.twin import SecurityControl
from xto_core.twin.security_twin import SecurityTwin

logger = logging.getLogger(__name__)


class DefenseSandbox:
    """Defense Sandbox Engine (Core USP).
    Enables defenders to test security interventions in an ephemeral in-memory clone
    of the digital twin without ever modifying the immutable baseline environment.
    """

    def __init__(self, baseline_twin: SecurityTwin):
        self.baseline_twin = baseline_twin

    def create_virtual_environment(self, interventions: List[DefenseIntervention]) -> SecurityTwin:
        """Fork baseline into an ephemeral virtual twin and apply all selected defensive interventions."""
        virtual_twin = self.baseline_twin.fork_virtual_sandbox()

        for d in interventions:
            if not d.is_enabled:
                continue

            ctrl_id = f"VIRTUAL-{d.control_type}-{d.id}"

            if d.control_type == "ENABLE_MFA":
                # Apply MFA to target identities or default to privileged admins
                ctrl = SecurityControl(
                    id=ctrl_id,
                    name=d.name or "Virtual MFA Enforcement",
                    type="MFA",
                    description=d.description or "Virtual enforcement of phishing-resistant MFA on admin logins",
                    is_active=True,
                    coverage_scope=d.target_scope or ["ID-DOMAIN-ADMIN", "ID-ENG-DEV"],
                    effectiveness=0.98,
                    is_virtual=True,
                )
                virtual_twin.add_or_update_control(ctrl)

            elif d.control_type == "SEGMENT_NETWORK":
                # Isolate target zones or crown jewel servers
                ctrl = SecurityControl(
                    id=ctrl_id,
                    name=d.name or "Virtual Air-Gap / Micro-Segmentation",
                    type="NETWORK_SEGMENTATION",
                    description=d.description or "Isolates target asset from unapproved internal subnets",
                    is_active=True,
                    coverage_scope=d.target_scope or ["VAULT-BACKUP-01"],
                    effectiveness=0.99,
                    is_virtual=True,
                )
                virtual_twin.add_or_update_control(ctrl)

            elif d.control_type == "ISOLATE_HOST":
                ctrl = SecurityControl(
                    id=ctrl_id,
                    name=d.name or "Virtual Host Quarantine",
                    type="HOST_ISOLATION",
                    description=d.description or "Sever all network connections to compromised host",
                    is_active=True,
                    coverage_scope=d.target_scope,
                    effectiveness=1.0,
                    is_virtual=True,
                )
                virtual_twin.add_or_update_control(ctrl)

            elif d.control_type == "REVOKE_PRIVILEGE":
                ctrl = SecurityControl(
                    id=ctrl_id,
                    name=d.name or "Least Privilege Credential Purge",
                    type="LEAST_PRIVILEGE",
                    description=d.description or "Purge cached domain administrator credentials from memory",
                    is_active=True,
                    coverage_scope=d.target_scope or ["WS-ENG-04"],
                    effectiveness=0.95,
                    is_virtual=True,
                )
                virtual_twin.add_or_update_control(ctrl)

            elif d.control_type == "DEPLOY_EDR":
                ctrl = SecurityControl(
                    id=ctrl_id,
                    name=d.name or "Virtual Extended EDR Fleet",
                    type="EDR",
                    description=d.description or "Block LSASS access and PowerShell script payloads",
                    is_active=True,
                    coverage_scope=d.target_scope,
                    effectiveness=0.90,
                    is_virtual=True,
                )
                virtual_twin.add_or_update_control(ctrl)

        return virtual_twin

    def evaluate_counterfactual(self, req: "CounterfactualRequest") -> "CounterfactualResult":
        """Run a counterfactual 'What-If' experiment in an ephemeral virtual twin without mutating baseline."""
        import uuid
        from app.schemas.lab import CounterfactualResult
        from app.schemas.twin import PrivilegeLevel
        from xto_core.graph.security_graph import SecurityGraph
        from xto_core.graph.path_engine import AttackPathEngine
        from xto_core.blast_radius.blast_engine import BlastRadiusEngine

        entry_point = req.initial_foothold_id or "WS-ENG-04"
        target_obj = req.target_objective_id or "VAULT-BACKUP-01"

        # 1. Baseline analysis
        base_graph = SecurityGraph(self.baseline_twin)
        base_path_engine = AttackPathEngine(base_graph)
        paths_before = base_path_engine.find_all_attack_paths(entry_point, target_obj, cutoff=8)
        crit_paths_before = [p for p in paths_before if p.get("is_critical", False)]
        blast_base = BlastRadiusEngine(self.baseline_twin).calculate_blast_radius(entry_point)

        # 2. Fork immutable sandbox
        virtual_twin = self.baseline_twin.fork_virtual_sandbox()
        applied_log: List[Dict[str, Any]] = []

        for chg in req.changes:
            chg_type = chg.type.lower()
            if chg_type in ("enable_control", "deploy_control"):
                ctrl_type = (chg.control or "MFA").upper()
                ctrl_id = f"VIRT-CF-{uuid.uuid4().hex[:6]}"
                name = f"Counterfactual {ctrl_type} on {chg.target}"
                ctrl = SecurityControl(
                    id=ctrl_id,
                    name=name,
                    type=ctrl_type,
                    description=f"Counterfactual simulation control: {ctrl_type}",
                    is_active=True,
                    coverage_scope=[chg.target],
                    effectiveness=0.98 if ctrl_type in ("MFA", "NETWORK_SEGMENTATION") else 0.90,
                    is_virtual=True,
                )
                virtual_twin.add_or_update_control(ctrl)
                applied_log.append({"change": "CONTROL_ENABLED", "type": ctrl_type, "target": chg.target})

            elif chg_type in ("disable_control", "remove_control"):
                for c in virtual_twin.get_all_controls():
                    if c.id == chg.target or chg.target in c.coverage_scope:
                        c.is_active = False
                applied_log.append({"change": "CONTROL_DISABLED", "target": chg.target})

            elif chg_type in ("isolate_asset", "quarantine_host"):
                ctrl = SecurityControl(
                    id=f"VIRT-ISO-{chg.target}",
                    name=f"Host Isolation on {chg.target}",
                    type="HOST_ISOLATION",
                    description="Counterfactual isolation",
                    is_active=True,
                    coverage_scope=[chg.target],
                    effectiveness=1.0,
                    is_virtual=True,
                )
                virtual_twin.add_or_update_control(ctrl)
                for r in list(virtual_twin.get_all_relationships()):
                    if r.source_id == chg.target or r.target_id == chg.target:
                        virtual_twin.block_relationship(r.id)
                applied_log.append({"change": "HOST_ISOLATED", "target": chg.target})

            elif chg_type in ("revoke_privilege", "least_privilege"):
                ctrl = SecurityControl(
                    id=f"VIRT-REV-{chg.target}",
                    name=f"Revoke Privileges on {chg.target}",
                    type="LEAST_PRIVILEGE",
                    description="Counterfactual least privilege",
                    is_active=True,
                    coverage_scope=[chg.target],
                    effectiveness=0.95,
                    is_virtual=True,
                )
                virtual_twin.add_or_update_control(ctrl)
                ident = virtual_twin.get_identity(chg.target)
                if ident:
                    ident.privilege_level = PrivilegeLevel.USER
                applied_log.append({"change": "PRIVILEGE_REVOKED", "target": chg.target})

            elif chg_type == "add_firewall_rule":
                src = chg.parameters.get("source", chg.target)
                dst = chg.parameters.get("destination", target_obj)
                for r in list(virtual_twin.get_all_relationships()):
                    if (r.source_id == src and r.target_id == dst) or (r.source_id == dst and r.target_id == src):
                        virtual_twin.block_relationship(r.id)
                applied_log.append({"change": "FIREWALL_RULE_ADDED", "source": src, "destination": dst})

            elif chg_type == "compromise_asset":
                asset = virtual_twin.get_asset(chg.target)
                if asset:
                    asset.tags.append("COMPROMISED")
                applied_log.append({"change": "ASSET_COMPROMISED", "target": chg.target})

        # 3. Post-intervention sandbox metrics
        virt_graph = SecurityGraph(virtual_twin)
        virt_path_engine = AttackPathEngine(virt_graph)
        paths_after = virt_path_engine.find_all_attack_paths(entry_point, target_obj, cutoff=8)
        crit_paths_after = [p for p in paths_after if p.get("is_critical", False)]
        blast_virt = BlastRadiusEngine(virtual_twin).calculate_blast_radius(entry_point)

        # 4. Deltas
        paths_eliminated = max(0, len(paths_before) - len(paths_after))
        crit_eliminated = max(0, len(crit_paths_before) - len(crit_paths_after))
        blast_before_pct = float(blast_base.get("total_blast_radius_percent", 0.0))
        blast_after_pct = float(blast_virt.get("total_blast_radius_percent", 0.0))
        blast_reduction = round(max(0.0, blast_before_pct - blast_after_pct), 1)

        total_before = len(paths_before)
        risk_reduction = round((paths_eliminated / total_before) * 100.0, 1) if total_before > 0 else 0.0

        if paths_eliminated > 0:
            explanation = (
                f"Virtual intervention successfully eliminated {paths_eliminated} attack path(s) "
                f"({crit_eliminated} critical). Blast radius reduced by {blast_reduction}% "
                f"(from {blast_before_pct}% to {blast_after_pct}%). Overall risk reduced by {risk_reduction}%."
            )
        elif len(paths_after) > 0:
            explanation = (
                f"Virtual intervention did not eliminate the attack path between {entry_point} and {target_obj}. "
                f"{len(paths_after)} viable lateral routes remain accessible."
            )
        else:
            explanation = "Baseline environment had no active attack paths between specified endpoints."

        return CounterfactualResult(
            experiment_id=f"CF-{uuid.uuid4().hex[:8].upper()}",
            before={
                "paths_count": len(paths_before),
                "critical_paths_count": len(crit_paths_before),
                "blast_radius_percent": blast_before_pct,
            },
            after={
                "paths_count": len(paths_after),
                "critical_paths_count": len(crit_paths_after),
                "blast_radius_percent": blast_after_pct,
            },
            paths_eliminated=paths_eliminated,
            critical_paths_eliminated=crit_eliminated,
            risk_reduction=risk_reduction,
            blast_radius_reduction_percent=blast_reduction,
            changes_applied=applied_log,
            explanation=explanation,
        )

