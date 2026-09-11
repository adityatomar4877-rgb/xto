from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ThreatVectorType(str):
    PHISHING = "Phishing"
    STOLEN_CREDENTIALS = "Stolen Credentials"
    EXPOSED_VPN = "Exposed VPN"
    EXPOSED_SERVICE = "Exposed Service"
    VULNERABLE_APPLICATION = "Vulnerable Application"
    INSIDER = "Insider"
    SUPPLY_CHAIN = "Supply Chain"
    PRIVILEGE_ABUSE = "Privilege Abuse"
    REMOTE_SERVICE = "Remote Service"
    CLOUD_EXPOSURE = "Cloud Exposure"
    MISCONFIGURATION = "Misconfiguration"
    AI_AGENT_EXPOSURE = "AI/Agent Exposure"


class ThreatVector(BaseModel):
    id: str
    name: str
    category: str
    entry_mechanism: str
    prerequisites: List[str]
    attacker_capabilities: List[str]
    relevant_techniques: List[str]  # MITRE technique IDs e.g. T1566.001
    possible_initial_footholds: List[str]  # Asset types or asset IDs
    possible_transitions: List[str]  # e.g., Lateral movement types
    vulnerable_controls: List[str]  # Controls whose absence/bypass enables this
    severity: str = "HIGH"
    description: str = ""
    supporting_evidence_types: List[str] = Field(default_factory=list)


class ThreatAssessmentRequest(BaseModel):
    threat_vector_id: str
    initial_foothold_id: str
    attacker_persona: str = "APT"
    target_objective_id: Optional[str] = None


class ThreatAssessmentResponse(BaseModel):
    threat_vector: ThreatVector
    foothold_asset_id: str
    foothold_asset_name: str
    reachable_assets_count: int
    critical_assets_reachable: List[str]
    viable_attack_paths_count: int
    easiest_attack_path: Optional[List[str]] = None
    vulnerable_controls_identified: List[str]
    risk_level: str
    summary: str
