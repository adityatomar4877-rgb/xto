from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.simulation import AttackerPersona


class DefenseIntervention(BaseModel):
    id: str
    control_type: str  # e.g., "ENABLE_MFA", "SEGMENT_NETWORK", "REVOKE_PRIVILEGE", "DEPLOY_EDR", "ISOLATE_HOST", "DISABLE_CREDENTIAL", "DEPLOY_WAF"
    name: str
    target_scope: List[str]  # asset IDs, identity IDs, zone names, or relationship IDs
    description: str = ""
    parameters: Dict[str, Any] = Field(default_factory=dict)
    is_enabled: bool = True


class WhatIfRequest(BaseModel):
    base_snapshot_id: str = "snapshot_001"
    threat_vector_id: str
    attacker_persona: AttackerPersona = AttackerPersona.RANSOMWARE
    initial_foothold_id: str
    target_objective_id: str
    defenses: List[DefenseIntervention]


class DecisionProof(BaseModel):
    proof_id: str
    generated_at: str
    threat_vector: str
    attacker_persona: str
    target_crown_jewel: str
    defenses_applied: List[str]
    
    # Quantitative comparison
    paths_before_count: int
    paths_after_count: int
    paths_eliminated_count: int
    critical_paths_eliminated_count: int
    
    critical_assets_reachable_before: int
    critical_assets_reachable_after: int
    
    blast_radius_before_percent: float
    blast_radius_after_percent: float
    blast_radius_reduction_percent: float
    
    attacker_effort_before: float
    attacker_effort_after: float
    
    objective_reached_before: bool
    objective_reached_after: bool
    
    # Detailed causal reasoning
    eliminated_path_explanations: List[Dict[str, Any]]
    control_effectiveness_breakdown: List[Dict[str, Any]]
    verdict: str  # e.g. "PROVEN_DEFENSE_SUCCESS", "PARTIAL_MITIGATION", "INEFFECTIVE"
    executive_statement: str


class WhatIfComparison(BaseModel):
    simulation_before_id: str
    simulation_after_id: str
    decision_proof: DecisionProof
    timeline_before: List[Dict[str, Any]]
    timeline_after: List[Dict[str, Any]]
    recommendations: List[str]
