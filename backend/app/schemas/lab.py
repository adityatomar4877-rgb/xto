from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ── Feature #1 & #7: Attack Path Evidence Graph Models ───────────────────────

class AttackPathEdgeEvidence(BaseModel):
    from_node: str
    to_node: str
    network: str = "reachable"
    service: Optional[str] = None
    port: Optional[int] = None
    identity: Optional[str] = None
    privilege: Optional[str] = None
    control: Optional[str] = None
    technique_id: Optional[str] = None
    technique_name: Optional[str] = None
    reasons: List[str] = Field(default_factory=list)


# ── Feature #2: Adaptive Red vs Blue Simulation ──────────────────────────────

class RedAction(BaseModel):
    action_type: str  # e.g., "EXPLORE_PATH", "ATTEMPT_TRANSITION", "RECALCULATE_ROUTE"
    source_asset_id: str
    target_asset_id: str
    technique_id: str
    technique_name: str
    success: bool
    blocked_by: Optional[str] = None
    alternative_path_found: bool = False
    evidence: List[str] = Field(default_factory=list)


class BlueAction(BaseModel):
    action_type: str  # e.g., "DEPLOY_MFA", "SEGMENT_NETWORK", "ISOLATE_HOST", "REVOKE_PRIVILEGE"
    control_id: str
    control_name: str
    control_type: str
    target_scope: List[str]
    paths_severed: int
    assets_protected: List[str]


class RedBlueRound(BaseModel):
    round_number: int
    red_action: RedAction
    blue_action: Optional[BlueAction] = None
    paths_before: int
    paths_after: int
    paths_eliminated: int
    active_controls_count: int
    current_risk_reduction_percent: float
    state_summary: str


class RedBlueSimulationRequest(BaseModel):
    initial_foothold_id: str = "WS-ENG-04"
    target_objective_id: str = "VAULT-BACKUP-01"
    threat_vector_id: str = "THREAT-PHISH"
    attacker_persona: str = "RANSOMWARE"
    max_rounds: int = 5
    allow_adaptive_rerouting: bool = True
    auto_blue_response: bool = True  # Blue automatically analyzes chokepoints and deploys top countermeasure


class RedBlueSimulationResult(BaseModel):
    simulation_id: str
    started_at: str
    completed_at: str
    initial_foothold_id: str
    target_objective_id: str
    total_rounds: int
    outcome: str  # "OBJECTIVE_COMPLETED", "CONTAINED_BY_DEFENSE", "MAX_ROUNDS_REACHED"
    rounds: List[RedBlueRound]
    initial_paths_count: int
    final_paths_count: int
    total_paths_eliminated: int
    total_risk_reduction_percent: float
    final_controls_deployed: List[str]
    summary: str


# ── Feature #3: Counterfactual "What If?" Engine ─────────────────────────────

class CounterfactualChange(BaseModel):
    type: str  # "enable_control", "disable_control", "isolate_asset", "revoke_privilege", "compromise_asset", "add_firewall_rule"
    target: str  # asset ID, identity ID, or zone
    control: Optional[str] = None  # e.g. "mfa", "segmentation", "edr"
    parameters: Dict[str, Any] = Field(default_factory=dict)


class CounterfactualRequest(BaseModel):
    changes: List[CounterfactualChange]
    threat_vector_id: Optional[str] = "THREAT-PHISH"
    initial_foothold_id: Optional[str] = "WS-ENG-04"
    target_objective_id: Optional[str] = "VAULT-BACKUP-01"


class CounterfactualResult(BaseModel):
    experiment_id: str
    before: Dict[str, Any]
    after: Dict[str, Any]
    paths_eliminated: int
    critical_paths_eliminated: int
    risk_reduction: float  # Percentage
    blast_radius_reduction_percent: float
    changes_applied: List[Dict[str, Any]]
    explanation: str


# ── Feature #4: Security Control Effectiveness Engine ────────────────────────

class CandidateControl(BaseModel):
    id: str
    name: str
    control_type: str  # "MFA", "NETWORK_SEGMENTATION", "EDR", "LEAST_PRIVILEGE", "HOST_ISOLATION", "VULNERABILITY_PATCH", "WAF"
    target_scope: List[str]
    description: Optional[str] = ""
    cost: Optional[float] = 0.0


class ControlAnalysisRequest(BaseModel):
    controls: List[CandidateControl]
    entry_point_id: Optional[str] = "WS-ENG-04"
    target_objective_id: Optional[str] = "VAULT-BACKUP-01"


class SingleControlEffectiveness(BaseModel):
    control_id: str
    control_name: str
    control_type: str
    paths_before: int
    paths_after: int
    critical_paths_eliminated: int
    critical_assets_still_reachable: int
    blast_radius_before_percent: float
    blast_radius_after_percent: float
    estimated_risk_reduction_percent: float
    remaining_attack_routes_count: int
    roi_score: float
    reasoning: str


class ControlEffectivenessResult(BaseModel):
    analysis_id: str
    baseline_critical_paths: int
    baseline_blast_radius_percent: float
    evaluated_controls: List[SingleControlEffectiveness]
    top_effective_control: Optional[SingleControlEffectiveness] = None
    summary: str


# ── Feature #5: Security Budget Optimizer ────────────────────────────────────

class SecurityBudgetRequest(BaseModel):
    available_budget: float = 100000.0
    candidate_controls: Optional[List[CandidateControl]] = None
    entry_point_id: Optional[str] = "WS-ENG-04"
    target_objective_id: Optional[str] = "VAULT-BACKUP-01"


class RecommendedControl(BaseModel):
    id: str
    name: str
    control_type: str
    cost: float
    critical_paths_eliminated: int
    risk_reduction_percent: float
    security_efficiency_ratio: float  # risk reduction % per $1,000


class BudgetOptimizationResult(BaseModel):
    optimization_id: str
    available_budget: float
    total_cost: float
    remaining_budget: float
    recommended_controls: List[RecommendedControl]
    critical_paths_eliminated: int
    remaining_critical_paths: int
    total_risk_reduction_percent: float
    roi_security_efficiency: float
    disclaimer: str = (
        "Simulation-based decision support result: calculations reflect Digital Twin graph reachability "
        "and do not constitute an empirical financial guarantee."
    )


# ── Feature #6: Enhanced Depth-Configurable Blast Radius ─────────────────────

class EnhancedBlastRadiusRequest(BaseModel):
    compromised_asset_id: str
    max_depth: int = 5


class ReachableIdentityInfo(BaseModel):
    id: str
    name: str
    role: str
    privilege_level: Optional[str] = None
    privilege: Optional[str] = None
    credential_state: Optional[str] = None
    located_on_asset: Optional[str] = None


class EnhancedBlastRadiusResult(BaseModel):
    compromised_asset_id: str
    asset_name: str
    max_depth_evaluated: int
    directly_reachable_assets: List[Dict[str, Any]]
    indirectly_reachable_assets: List[Dict[str, Any]]
    reachable_identities: List[ReachableIdentityInfo]
    privilege_escalation_opportunities: List[Dict[str, Any]]
    critical_crown_jewels_threatened: List[Dict[str, Any]]
    attack_depth: int
    total_path_count: int
    maximum_impact_score: float
    total_blast_radius_percent: float
    relationship_evidence: List[AttackPathEdgeEvidence]
    summary: str


# ── Feature #8: Attack Path Time Machine / Snapshot Comparison ───────────────

class SnapshotCreateRequest(BaseModel):
    name: str
    description: Optional[str] = ""


class SnapshotSummary(BaseModel):
    snapshot_id: str
    version: int
    name: str
    timestamp: str
    asset_count: int
    relationship_count: int
    control_count: int
    critical_paths_count: int


class PathDiff(BaseModel):
    path_id: str
    hop_count: int
    summary: str
    critical: bool


class SnapshotCompareRequest(BaseModel):
    snapshot_a_id: str
    snapshot_b_id: str


class SimulationSummaryItem(BaseModel):
    simulation_id: str
    simulation_type: str  # "STANDARD" or "RED_BLUE"
    timestamp: str
    initial_foothold_id: str
    target_objective_id: str
    outcome: str
    blast_radius_percent: Optional[float] = None
    risk_reduction_percent: Optional[float] = None
    total_rounds: Optional[int] = None
    events_count: Optional[int] = None


class SnapshotComparisonResult(BaseModel):
    comparison_id: str
    snapshot_a_id: str
    snapshot_b_id: str
    timestamp_a: str
    timestamp_b: str
    critical_paths_before: int
    critical_paths_after: int
    paths_diff_count: int
    newly_created_attack_paths: List[PathDiff]
    eliminated_attack_paths: List[PathDiff]
    changed_assets: List[Dict[str, Any]]
    changed_controls: List[Dict[str, Any]]
    changed_privileges: List[Dict[str, Any]]
    changed_relationships: List[Dict[str, Any]]
    natural_language_explanation: str


# ── Feature #9: Attack Path Resilience Score ─────────────────────────────────

class ResilienceFactorBreakdown(BaseModel):
    path_redundancy_score: float  # Lower alternative routes -> Higher resilience
    control_density_score: float  # Controls per asset
    chokepoint_mitigation_score: float  # Are critical chokepoints guarded?
    depth_defense_score: float  # Average hops required to reach crown jewels
    privilege_tiering_score: float  # How well is admin credential access restricted?


class ResilienceScoreResult(BaseModel):
    resilience_score: float  # 0.0 - 100.0 (Higher is more resilient)
    posture_rating: str  # "CRITICAL", "FRAGILE", "DEFENSIBLE", "HARDENED", "RESILIENT"
    total_attack_paths_count: int
    independent_path_clusters: int
    single_points_of_failure: List[Dict[str, Any]]
    chokepoint_assets: List[Dict[str, Any]]
    factor_breakdown: ResilienceFactorBreakdown
    calculation_methodology: str
    improvement_recommendations: List[str]


# ── Feature #10: Deterministic Natural Language Security Queries ─────────────

class NaturalLanguageQueryRequest(BaseModel):
    query: str


class NaturalLanguageQueryResult(BaseModel):
    query: str
    detected_intent: str  # "REACHABILITY_CHECK", "WHAT_IF_QUERY", "TOP_CONTROL_QUERY", "BLAST_RADIUS_QUERY", "SPOF_QUERY", "PATH_EXPLANATION"
    target_entities: List[str]
    deterministic_answer: str
    supporting_metrics: Dict[str, Any]
    relevant_paths: Optional[List[Dict[str, Any]]] = None
    recommended_action: Optional[str] = None


# ── Feature #12: Autonomous Vulnerability, Path & Remediation Audit ───────────

class VulnerabilityFinding(BaseModel):
    cve: str
    name: str
    severity: str
    cvss_score: float
    affected_asset_id: str
    affected_asset_name: str
    affected_service: Optional[str] = None
    exploitable_technique: str
    description: str
    patch_available: bool
    remediation_action: str


class AuditedAttackPath(BaseModel):
    path_id: str
    entry_cve: Optional[str] = None
    source_asset_id: str
    source_asset_name: str
    target_crown_jewel_id: str
    target_crown_jewel_name: str
    hop_count: int
    attacker_effort_score: float
    damage_score: float
    damage_tier: str
    nodes_sequence: List[str]
    techniques_used: List[str]
    critical_chokepoint_node: Optional[str] = None


class ChokepointAnalysis(BaseModel):
    asset_id: str
    asset_name: str
    paths_intersected: int
    paths_eliminated_percent: float
    recommended_control: str


class RemediationTask(BaseModel):
    rank: int
    title: str
    control_type: str
    target_assets_or_identities: List[str]
    critical_paths_severed: int
    blast_radius_reduction_percent: float
    attacker_effort_increase: float
    priority_score: float
    implementation_complexity: str
    jira_ticket_template: Dict[str, str]
    remediation_command: str
    reasoning: str


class BehaviouralAnomalyFinding(BaseModel):
    anomaly_id: str
    asset_id: str
    asset_name: str
    anomaly_type: str  # OFF_HOURS_LOGIN, FAILED_AUTH_SPIKE, UNUSUAL_LATERAL_MOVEMENT, PRIVILEGE_ESCALATION, DATA_EXFILTRATION, ANOMALOUS_PROCESS
    severity: str  # LOW / MEDIUM / HIGH / CRITICAL
    description: str
    detected_at: str
    evidence: Dict[str, Any]
    mitre_technique: str = ""
    recommended_action: str


class AutomatedAuditReport(BaseModel):
    audit_id: str
    generated_at: str
    assets_scanned_count: int
    vulnerabilities_detected_count: int
    vulnerabilities: List[VulnerabilityFinding]
    behavioural_anomalies_count: int = 0
    behavioural_anomalies: List[BehaviouralAnomalyFinding] = Field(default_factory=list)
    viable_attack_paths_count: int
    attack_paths: List[AuditedAttackPath]
    chokepoints: List[ChokepointAnalysis]
    baseline_resilience_score: float
    projected_resilience_score: float
    resilience_improvement_percent: float
    remediation_tasks: List[RemediationTask]
    executive_verdict: str
    executive_summary: str


# ── Feature #13: Real Scan & Telemetry Ingestion Models ───────────────────────

class SupportedFormatInfo(BaseModel):
    format_id: str
    name: str
    extension: str
    description: str
    sample_available: bool = True


class IngestionResponse(BaseModel):
    status: str = "SUCCESS"
    source_format: str
    filename: str
    mode: str  # "MERGE" or "REPLACE"
    snapshot_id: str
    assets_imported: int
    relationships_created: int
    vulnerabilities_ingested: int
    identities_mapped: int
    critical_crown_jewels_identified: List[str] = Field(default_factory=list)
    viable_attack_paths_count: int = 0
    message: str
    timestamp: str

