from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class MitreTechnique(BaseModel):
    id: str
    name: str
    tactic: str
    description: str
    mitigations: List[str] = Field(default_factory=list)  # Mitigation IDs like M1030
    required_privilege: Optional[str] = "STANDARD"  # STANDARD, LOCAL_ADMIN, DOMAIN_ADMIN
    applicable_platforms: List[str] = Field(default_factory=lambda: ["Windows", "Linux"])
    data_sources: List[str] = Field(default_factory=list)
    status: Optional[str] = "VULNERABLE"  # MITIGATED, VULNERABLE, PARTIAL
    mitigating_controls: List[str] = Field(default_factory=list)  # Active control IDs in twin
    affected_assets: List[str] = Field(default_factory=list)  # Asset IDs exposed


class MitreMitigation(BaseModel):
    id: str
    name: str
    description: str
    mapped_control_types: List[str] = Field(default_factory=list)  # MFA, NETWORK_SEGMENTATION, EDR, etc.
    active_in_twin: bool = False
    covering_controls: List[str] = Field(default_factory=list)


class TacticCoverage(BaseModel):
    tactic: str
    total_techniques: int
    mitigated_count: int
    vulnerable_count: int
    coverage_percent: float
    blocked_techniques: List[str]
    exposed_techniques: List[str]


class MitrePostureReport(BaseModel):
    posture_score: float  # 0.0 - 100.0 overall defense index
    total_techniques_evaluated: int
    total_mitigated: int
    total_exposed: int
    total_active_mitigations: int
    tactics_breakdown: List[TacticCoverage]
    critical_blind_spots: List[MitreTechnique]
    top_recommended_mitigations: List[MitreMitigation]


class AssetMitreProfile(BaseModel):
    asset_id: str
    asset_name: str
    zone: str
    criticality: str
    applicable_techniques: List[MitreTechnique]
    mitigated_techniques: List[str]
    vulnerable_techniques: List[str]
    asset_coverage_percent: float
