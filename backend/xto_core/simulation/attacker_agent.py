import logging
from typing import Any, Dict, List, Optional, Set
from app.schemas.simulation import (
    AttackerPersona,
    AttackerCapability,
    AttackerAgentProfile,
    SimulationPhase,
)

logger = logging.getLogger(__name__)


def get_default_attacker_profiles() -> Dict[AttackerPersona, AttackerAgentProfile]:
    return {
        AttackerPersona.RANSOMWARE: AttackerAgentProfile(
            id="AGENT-RANSOMWARE",
            persona=AttackerPersona.RANSOMWARE,
            name="DarkVault Ransomware Syndicate",
            description="High-velocity destructive operator focused on locating backups, disabling shadow copies, and encrypting critical hypervisors and databases.",
            capabilities=[
                "EXPLOIT_RCE",
                "DUMP_LSASS",
                "PIVOT_SMB",
                "PASS_THE_HASH",
                "ENCRYPT_FILES",
                "DISCOVERY_INTERNAL",
            ],
            preferred_techniques=["T1486", "T1003.001", "T1021.002", "T1059.001", "T1490"],
            stealth=0.3,  # Fast and noisy
            patience=0.2,
            risk_tolerance=0.9,
        ),
        AttackerPersona.APT: AttackerAgentProfile(
            id="AGENT-APT",
            persona=AttackerPersona.APT,
            name="ViperLotus (State-Sponsored APT)",
            description="Patient, highly stealthy intelligence collector prioritizing long-term persistence, credential extraction, and zero-day execution.",
            capabilities=[
                "PHISHING_DELIVERY",
                "EXPLOIT_RCE",
                "DUMP_LSASS",
                "KERBEROAST",
                "PASS_THE_HASH",
                "PIVOT_SSH",
                "PIVOT_SMB",
                "EXFILTRATE_DATA",
                "PRIVILEGE_ESCALATION",
                "DISCOVERY_INTERNAL",
            ],
            preferred_techniques=["T1566.001", "T1003.001", "T1558.003", "T1021.001", "T1041"],
            stealth=0.95,
            patience=0.9,
            risk_tolerance=0.3,
        ),
        AttackerPersona.INSIDER: AttackerAgentProfile(
            id="AGENT-INSIDER",
            persona=AttackerPersona.INSIDER,
            name="Disgruntled Senior Operator",
            description="Authenticates with legitimate credentials from authorized workstations, abusing existing access privileges to exfiltrate financial records.",
            capabilities=[
                "EXFILTRATE_DATA",
                "PRIVILEGE_ESCALATION",
                "DISCOVERY_INTERNAL",
            ],
            preferred_techniques=["T1078.004", "T1530", "T1567", "T1083"],
            stealth=0.85,
            patience=0.6,
            risk_tolerance=0.4,
        ),
        AttackerPersona.FINANCIAL_CRIMINAL: AttackerAgentProfile(
            id="AGENT-FINANCIAL",
            persona=AttackerPersona.FINANCIAL_CRIMINAL,
            name="Carbanak Swift Heist Group",
            description="Targets core banking applications, customer databases, and automated payment gateways to execute fraudulent fund transfers.",
            capabilities=[
                "EXPLOIT_RCE",
                "DUMP_LSASS",
                "PASS_THE_HASH",
                "PIVOT_SMB",
                "DISCOVERY_INTERNAL",
            ],
            preferred_techniques=["T1059", "T1003", "T1021.002", "T1565.001"],
            stealth=0.7,
            patience=0.7,
            risk_tolerance=0.6,
        ),
        AttackerPersona.SCRIPT_KIDDIE: AttackerAgentProfile(
            id="AGENT-SKID",
            persona=AttackerPersona.SCRIPT_KIDDIE,
            name="Automated Botnet / Script Scanner",
            description="Uncoordinated brute force scanning for known unpatched public vulnerabilities.",
            capabilities=["PORT_SCANNING", "BRUTE_FORCE"],
            preferred_techniques=["T1190", "T1110"],
            stealth=0.1,
            patience=0.1,
            risk_tolerance=1.0,
        ),
    }


class AttackerAgentState:
    """Dynamic operational state of an attacker agent during simulation execution."""

    def __init__(self, profile: AttackerAgentProfile, foothold_id: str, objective_id: str):
        self.profile = profile
        self.current_foothold = foothold_id
        self.objective_id = objective_id

        self.compromised_assets: Set[str] = {foothold_id}
        self.compromised_identities: Set[str] = set()
        self.known_network_map: Set[str] = {foothold_id}
        self.held_privileges: Set[str] = {"STANDARD"}
        self.accumulated_effort: float = 0.0
        self.current_phase: SimulationPhase = SimulationPhase.FOOTHOLD
