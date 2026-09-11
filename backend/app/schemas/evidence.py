from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class EpistemicStatus(str, Enum):
    FACT = "FACT"              # Directly verified from system config / network scan
    ASSUMPTION = "ASSUMPTION"  # Baseline attacker capability or external prerequisite
    INFERENCE = "INFERENCE"    # Mathematically derived via path analysis or credential exposure


class EvidenceType(str, Enum):
    NETWORK_REACHABILITY = "NETWORK_REACHABILITY"
    CREDENTIAL_EXPOSURE = "CREDENTIAL_EXPOSURE"
    PRIVILEGE_HIERARCHY = "PRIVILEGE_HIERARCHY"
    CONTROL_BYPASS = "CONTROL_BYPASS"
    VULNERABILITY_EXPLOIT = "VULNERABILITY_EXPLOIT"
    SESSION_INHERITANCE = "SESSION_INHERITANCE"
    TRUST_DELEGATION = "TRUST_DELEGATION"


class EvidenceRecord(BaseModel):
    id: str
    timestamp: str
    source: str  # e.g., "EDR_TELEMETRY", "PORT_SCAN", "IAM_AUDIT", "ACTIVE_DIRECTORY_RECON"
    evidence_type: EvidenceType
    epistemic_status: EpistemicStatus
    confidence: float = 0.95  # 0.0 to 1.0
    subject_asset_id: str
    target_asset_id: Optional[str] = None
    finding: str
    technical_details: Dict[str, Any] = Field(default_factory=dict)
    applicable_technique_id: Optional[str] = None
    blocking_controls_tested: List[str] = Field(default_factory=list)


class RemediationPriority(BaseModel):
    rank: int
    control_name: str
    control_type: str
    target_assets_or_identities: List[str]
    critical_paths_eliminated: int
    blast_radius_reduction_percent: float
    attacker_effort_increase: float
    implementation_complexity: str  # "LOW", "MEDIUM", "HIGH"
    priority_score: float  # Weighted multi-factor score
    reasoning: str
    affected_techniques_blocked: List[str]
