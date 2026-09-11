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
