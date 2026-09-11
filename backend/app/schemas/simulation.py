from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AttackerPersona(str, Enum):
    APT = "APT"
    RANSOMWARE = "RANSOMWARE"
    INSIDER = "INSIDER"
    FINANCIAL_CRIMINAL = "FINANCIAL_CRIMINAL"
    HACKTIVIST = "HACKTIVIST"
    SCRIPT_KIDDIE = "SCRIPT_KIDDIE"
    CUSTOM = "CUSTOM"


class AttackerCapability(str, Enum):
    PHISHING_DELIVERY = "PHISHING_DELIVERY"
    EXPLOIT_RCE = "EXPLOIT_RCE"
    DUMP_LSASS = "DUMP_LSASS"
    KERBEROAST = "KERBEROAST"
    PASS_THE_HASH = "PASS_THE_HASH"
    PIVOT_SMB = "PIVOT_SMB"
    PIVOT_SSH = "PIVOT_SSH"
    PIVOT_RDP = "PIVOT_RDP"
    WMI_EXECUTION = "WMI_EXECUTION"
    ENCRYPT_FILES = "ENCRYPT_FILES"
    EXFILTRATE_DATA = "EXFILTRATE_DATA"
    PRIVILEGE_ESCALATION = "PRIVILEGE_ESCALATION"
    DISCOVERY_INTERNAL = "DISCOVERY_INTERNAL"


class SimulationPhase(str, Enum):
    FOOTHOLD = "FOOTHOLD"
    DISCOVERY = "DISCOVERY"
    CREDENTIAL_ACCESS = "CREDENTIAL_ACCESS"
    LATERAL_MOVEMENT = "LATERAL_MOVEMENT"
    PRIVILEGE_ESCALATION = "PRIVILEGE_ESCALATION"
    IMPACT = "IMPACT"
    OBJECTIVE_COMPLETED = "OBJECTIVE_COMPLETED"
    CONTAINED = "CONTAINED"


class AttackerAgentProfile(BaseModel):
    id: str
    persona: AttackerPersona
    name: str
    description: str
    capabilities: List[str]
    preferred_techniques: List[str]  # MITRE technique IDs
    stealth: float = 0.8  # 0.0 (noisy) to 1.0 (ultra-stealthy)
    patience: float = 0.7
    risk_tolerance: float = 0.5


class SimulationEvent(BaseModel):
    step: int
    timestamp_offset_seconds: int
    phase: SimulationPhase
    source_asset_id: str
    source_asset_name: str
    target_asset_id: str
    target_asset_name: str
    action_name: str
    technique_id: str
    technique_name: str
    identity_used: Optional[str] = None
    privilege_obtained: Optional[str] = None
    success: bool
    evidence_ids: List[str] = Field(default_factory=list)
    explanation: str
    blocked_by_control: Optional[str] = None


class SimulationRequest(BaseModel):
    threat_vector_id: str
    attacker_persona: AttackerPersona = AttackerPersona.RANSOMWARE
    initial_foothold_id: str
    target_objective_id: str
    max_steps: int = 15
    stealth_mode: bool = False
    custom_capabilities: Optional[List[str]] = None


class SimulationTrace(BaseModel):
    simulation_id: str
    started_at: str
    completed_at: str
    attacker_persona: AttackerPersona
    threat_vector_id: str
    initial_foothold_id: str
    target_objective_id: str
    objective_achieved: bool
    total_steps: int
    timeline: List[SimulationEvent]
    compromised_assets: List[str]
    compromised_identities: List[str]
    total_attacker_effort_score: float
    blast_radius_percent: float
    summary: str
