/**
 * XTO — Cyber Decision Digital Twin
 * Frontend API Client & TypeScript Interfaces
 */

// ── Types & Interfaces ────────────────────────────────────────────────────────

export type AssetType =
  | "WORKSTATION"
  | "SERVER"
  | "APPLICATION_SERVER"
  | "DOMAIN_CONTROLLER"
  | "DATABASE"
  | "FIREWALL"
  | "VPN_GATEWAY"
  | "BACKUP_SERVER"
  | "CLOUD_INSTANCE"
  | "ROUTER"
  | "IOT_DEVICE";

export type ZoneType =
  | "INTERNET"
  | "DMZ"
  | "CORPORATE_LAN"
  | "MANAGEMENT"
  | "SECURE_TIER"
  | "BACKUP_VAULT"
  | "CLOUD_VPC";

export type CriticalityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type PrivilegeLevel =
  | "STANDARD"
  | "ELEVATED"
  | "LOCAL_ADMIN"
  | "DOMAIN_ADMIN"
  | "SYSTEM";

export type CredentialState =
  | "ACTIVE"
  | "COMPROMISED"
  | "REVOKED"
  | "EXPIRED"
  | "LEAKED";

export type RelationshipType =
  | "NETWORK_REACHABILITY"
  | "TRUST"
  | "AUTHENTICATION"
  | "PRIVILEGE"
  | "SESSION"
  | "CREDENTIAL_ACCESS"
  | "REMOTE_EXECUTION";

export interface Vulnerability {
  cve: string;
  name: string;
  severity: CriticalityLevel | string;
  cvss_score: number;
  affected_service: string;
  exploitable_technique: string;
  patch_available: boolean;
  description: string;
}

export interface SecurityControl {
  id: string;
  name: string;
  type: string;
  description: string;
  is_active: boolean;
  coverage_scope: string[];
  effectiveness: number;
  is_virtual?: boolean;
}

export interface Identity {
  id: string;
  name: string;
  type: string;
  role: string;
  privilege_level: PrivilegeLevel | string;
  accessible_assets: string[];
  credential_state: CredentialState | string;
  auth_methods: string[];
  mfa_enabled: boolean;
  trust_relationships: string[];
}

export interface Relationship {
  id: string;
  source_id: string;
  target_id: string;
  type: RelationshipType | string;
  protocol?: string;
  port?: number | null;
  bidirectional: boolean;
  trust_level: number;
  is_blocked: boolean;
  properties: Record<string, any>;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType | string;
  zone: ZoneType | string;
  criticality: CriticalityLevel | string;
  ip_address: string;
  os: string;
  department: string;
  services: string[];
  vulnerabilities: Vulnerability[];
  controls: string[];
  identities: string[];
  is_compromised: boolean;
  criticality_score: number;
  login_history?: LoginEvent[];
  traffic_flows?: TrafficFlow[];
  process_activity?: ProcessEvent[];
  behavioural_baseline?: BehaviouralBaseline | null;
  anomaly_score?: number;
}

export interface LoginEvent {
  timestamp: string;
  user: string;
  source_ip: string;
  success: boolean;
  auth_method: string;
}

export interface TrafficFlow {
  timestamp: string;
  dest_ip: string;
  dest_port: number;
  protocol: string;
  bytes_transferred: number;
  direction: string;
}

export interface ProcessEvent {
  timestamp: string;
  process_name: string;
  user: string;
  command_line: string;
  is_anomalous: boolean;
}

export interface BehaviouralBaseline {
  normal_login_hours: string;
  normal_source_ips: string[];
  normal_destinations: string[];
  baseline_avg_outbound_bytes: number;
  whitelisted_processes: string[];
}

export interface DigitalTwinTopology {
  snapshot_id: string;
  version: number;
  timestamp: string;
  name: string;
  assets: Asset[];
  identities: Identity[];
  relationships: Relationship[];
  controls: SecurityControl[];
  stats: Record<string, any>;
}

export interface EnvironmentChange {
  change_id: string;
  timestamp: string;
  change_type: string;
  target_id: string;
  details: Record<string, any>;
  impact_level: CriticalityLevel | string;
}

export interface ThreatVector {
  id: string;
  name: string;
  category: string;
  entry_mechanism: string;
  prerequisites: string[];
  attacker_capabilities: string[];
  relevant_techniques: string[];
  possible_initial_footholds: string[];
  possible_transitions: string[];
  vulnerable_controls: string[];
  severity: string;
  description: string;
  supporting_evidence_types?: string[];
}

export interface ThreatAssessmentRequest {
  threat_vector_id: string;
  initial_foothold_id: string;
  attacker_persona?: string;
  target_objective_id?: string;
}

export interface ThreatAssessmentResponse {
  threat_vector: ThreatVector;
  foothold_asset_id: string;
  foothold_asset_name: string;
  reachable_assets_count: number;
  critical_assets_reachable: string[];
  viable_attack_paths_count: number;
  easiest_attack_path?: string[] | null;
  vulnerable_controls_identified: string[];
  risk_level: string;
  summary: string;
}

export type AttackerPersona =
  | "APT"
  | "RANSOMWARE"
  | "INSIDER"
  | "FINANCIAL_CRIMINAL"
  | "HACKTIVIST"
  | "SCRIPT_KIDDIE"
  | "CUSTOM";

export interface AttackerProfile {
  id: string;
  persona: AttackerPersona | string;
  name: string;
  description: string;
  capabilities: string[];
  preferred_techniques: string[];
  stealth: number;
  patience: number;
  risk_tolerance: number;
}

export type AttackerAgentProfile = AttackerProfile;

export type SimulationPhase =
  | "FOOTHOLD"
  | "DISCOVERY"
  | "CREDENTIAL_ACCESS"
  | "LATERAL_MOVEMENT"
  | "PRIVILEGE_ESCALATION"
  | "IMPACT"
  | "OBJECTIVE_COMPLETED"
  | "CONTAINED";

export interface SimulationEvent {
  step: number;
  timestamp_offset_seconds: number;
  phase: SimulationPhase | string;
  source_asset_id: string;
  source_asset_name: string;
  target_asset_id: string;
  target_asset_name: string;
  action_name: string;
  technique_id: string;
  technique_name: string;
  identity_used?: string | null;
  privilege_obtained?: string | null;
  success: boolean;
  evidence_ids: string[];
  explanation: string;
  blocked_by_control?: string | null;
  reason?: string[];
}

export interface SimulationRequest {
  threat_vector_id: string;
  attacker_persona?: AttackerPersona | string;
  initial_foothold_id: string;
  target_objective_id: string;
  max_steps?: number;
  stealth_mode?: boolean;
  custom_capabilities?: string[];
}

export interface SimulationTrace {
  simulation_id: string;
  started_at: string;
  completed_at: string;
  attacker_persona: AttackerPersona | string;
  threat_vector_id: string;
  initial_foothold_id: string;
  target_objective_id: string;
  objective_achieved: boolean;
  total_steps: number;
  timeline: SimulationEvent[];
  compromised_assets: string[];
  compromised_identities: string[];
  total_attacker_effort_score: number;
  blast_radius_percent: number;
  summary: string;
}

export interface DefenseIntervention {
  id: string;
  control_type: string;
  name: string;
  target_scope: string[];
  description?: string;
  parameters?: Record<string, any>;
  is_enabled: boolean;
}

export interface WhatIfRequest {
  base_snapshot_id?: string;
  threat_vector_id: string;
  attacker_persona?: AttackerPersona | string;
  initial_foothold_id: string;
  target_objective_id: string;
  defenses: DefenseIntervention[];
}

export interface DecisionProof {
  proof_id: string;
  generated_at: string;
  threat_vector: string;
  attacker_persona: string;
  target_crown_jewel: string;
  defenses_applied: string[];
  paths_before_count: number;
  paths_after_count: number;
  paths_eliminated_count: number;
  critical_paths_eliminated_count: number;
  critical_assets_reachable_before: number;
  critical_assets_reachable_after: number;
  blast_radius_before_percent: number;
  blast_radius_after_percent: number;
  blast_radius_reduction_percent: number;
  attacker_effort_before: number;
  attacker_effort_after: number;
  objective_reached_before: boolean;
  objective_reached_after: boolean;
  eliminated_path_explanations: Array<Record<string, any>>;
  control_effectiveness_breakdown: Array<Record<string, any>>;
  verdict: string;
  executive_statement: string;
}

export interface WhatIfComparison {
  simulation_before_id: string;
  simulation_after_id: string;
  decision_proof: DecisionProof;
  timeline_before: Array<Record<string, any>>;
  timeline_after: Array<Record<string, any>>;
  recommendations: string[];
}

export type EpistemicStatus = "FACT" | "ASSUMPTION" | "INFERENCE";

export type EvidenceType =
  | "NETWORK_REACHABILITY"
  | "CREDENTIAL_EXPOSURE"
  | "PRIVILEGE_HIERARCHY"
  | "CONTROL_BYPASS"
  | "VULNERABILITY_EXPLOIT"
  | "SESSION_INHERITANCE"
  | "TRUST_DELEGATION";

export interface EvidenceRecord {
  id: string;
  timestamp: string;
  source: string;
  evidence_type: EvidenceType | string;
  epistemic_status: EpistemicStatus | string;
  confidence: number;
  subject_asset_id: string;
  target_asset_id?: string | null;
  finding: string;
  technical_details: Record<string, any>;
  applicable_technique_id?: string | null;
  blocking_controls_tested: string[];
}

export interface RemediationPriority {
  rank: number;
  control_name: string;
  control_type: string;
  target_assets_or_identities: string[];
  critical_paths_eliminated: number;
  blast_radius_reduction_percent: number;
  attacker_effort_increase: number;
  implementation_complexity: "LOW" | "MEDIUM" | "HIGH" | string;
  priority_score: number;
  reasoning: string;
  affected_techniques_blocked: string[];
}

export interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
  description: string;
  mitigations: string[];
  required_privilege: string;
  applicable_platforms: string[];
  data_sources: string[];
  status: "MITIGATED" | "VULNERABLE" | "PARTIAL" | string;
  mitigating_controls: string[];
  affected_assets: string[];
}

export interface MitreMitigation {
  id: string;
  name: string;
  description: string;
  mapped_control_types: string[];
  active_in_twin: boolean;
  covering_controls: string[];
}

export interface TacticCoverage {
  tactic: string;
  total_techniques: number;
  mitigated_count: number;
  vulnerable_count: number;
  coverage_percent: number;
  blocked_techniques: string[];
  exposed_techniques: string[];
}

export interface MitrePostureReport {
  posture_score: number;
  total_techniques_evaluated: number;
  total_mitigated: number;
  total_exposed: number;
  total_active_mitigations: number;
  tactics_breakdown: TacticCoverage[];
  critical_blind_spots: MitreTechnique[];
  top_recommended_mitigations: MitreMitigation[];
}

export interface MitreMatrixTactic {
  tactic: string;
  techniques_count: number;
  mitigated_count: number;
  techniques: MitreTechnique[];
}

export interface AssetMitreProfile {
  asset_id: string;
  asset_name: string;
  zone: string;
  criticality: string;
  applicable_techniques: MitreTechnique[];
  mitigated_techniques: string[];
  vulnerable_techniques: string[];
  asset_coverage_percent: number;
}

export interface HealthResponse {
  status: string;
  service: string;
  product_version: string;
  snapshot_id: string;
  assets_loaded: number;
  identities_loaded: number;
  relationships_loaded: number;
  active_controls: number;
}

export interface AttackPathAnalysisResponse {
  entry_point: string;
  target: string;
  total_paths_found: number;
  paths: any[];
  shortest_path: any;
  lowest_effort_path: any;
  chokepoints: any[];
}

export interface BlastRadiusAsset {
  id: string;
  name: string;
  zone: string;
  criticality: string;
  ip?: string;
  hop_distance?: number;
  criticality_score?: number;
}

export interface BlastRadiusIdentity {
  id: string;
  name: string;
  role: string;
  privilege: string;
  privilege_level?: string;
  credential_state?: string;
  located_on_asset?: string;
}

export interface BlastRadiusResponse {
  compromised_asset_id: string;
  asset_name: string;
  asset_zone: string;
  asset_criticality: string;
  max_depth_evaluated: number;
  attack_depth: number;
  direct_impact_count: number;
  direct_impact_assets: BlastRadiusAsset[];
  directly_reachable_assets: BlastRadiusAsset[];
  indirect_impact_count: number;
  indirect_impact_assets: BlastRadiusAsset[];
  indirectly_reachable_assets: BlastRadiusAsset[];
  critical_crown_jewels_threatened: BlastRadiusAsset[];
  affected_identities: BlastRadiusIdentity[];
  reachable_identities: BlastRadiusIdentity[];
  privilege_escalation_opportunities: any[];
  total_path_count: number;
  maximum_impact_score: number;
  total_reachable_assets: number;
  total_blast_radius_percent: number;
  relationship_evidence: any[];
  summary: string;
}

export interface ResilienceScoreResult {
  resilience_score: number;
  posture_rating: string;
  total_attack_paths_count: number;
  independent_path_clusters: number;
  single_points_of_failure: any[];
  chokepoint_assets: any[];
  factor_breakdown: {
    path_redundancy_score: number;
    control_density_score: number;
    chokepoint_mitigation_score: number;
    depth_defense_score: number;
    privilege_tiering_score: number;
  };
  calculation_methodology: string;
  improvement_recommendations: string[];
}

export interface NaturalLanguageQueryResult {
  query: string;
  detected_intent: string;
  target_entities: string[];
  deterministic_answer: string;
  supporting_metrics: Record<string, any>;
  relevant_paths: Record<string, any>[] | null;
  recommended_action: string | null;
}

export interface SimulationSummaryItem {
  simulation_id: string;
  simulation_type: string;
  timestamp: string;
  initial_foothold_id: string;
  target_objective_id: string;
  outcome: string;
  blast_radius_percent?: number;
  events_count?: number;
  risk_reduction_percent?: number;
  total_rounds?: number;
}

export interface RedBlueSimulationResult {
  simulation_id: string;
  started_at: string;
  completed_at: string;
  initial_foothold_id: string;
  target_objective_id: string;
  outcome: string;
  total_rounds: number;
  total_risk_reduction_percent: number;
  rounds: any[];
  summary: string;
}

export interface SnapshotSummary {
  snapshot_id: string;
  name: string;
  version: number;
  timestamp: string;
  asset_count: number;
  control_count: number;
}

export interface SupportedFormatInfo {
  format_id: string;
  name: string;
  extension: string;
  description: string;
  sample_available: boolean;
}

export interface IngestionResponse {
  status: string;
  source_format: string;
  filename: string;
  mode: string;
  snapshot_id: string;
  assets_imported: number;
  relationships_created: number;
  vulnerabilities_ingested: number;
  identities_mapped: number;
  critical_crown_jewels_identified: string[];
  viable_attack_paths_count: number;
  message: string;
  timestamp: string;
}

export interface VulnerabilityFinding {
  cve: string;
  name: string;
  severity: string;
  cvss_score: number;
  affected_asset_id: string;
  affected_asset_name: string;
  affected_service?: string | null;
  exploitable_technique: string;
  description: string;
  patch_available: boolean;
  remediation_action: string;
}

export interface AuditedAttackPath {
  path_id: string;
  entry_cve?: string | null;
  source_asset_id: string;
  source_asset_name: string;
  target_crown_jewel_id: string;
  target_crown_jewel_name: string;
  hop_count: number;
  attacker_effort_score: number;
  damage_score: number;
  damage_tier: string;
  nodes_sequence: string[];
  techniques_used: string[];
  critical_chokepoint_node?: string | null;
}

export interface ChokepointAnalysis {
  asset_id: string;
  asset_name: string;
  paths_intersected: number;
  paths_eliminated_percent: number;
  recommended_control: string;
}

export interface RemediationTask {
  rank: number;
  title: string;
  control_type: string;
  target_assets_or_identities: string[];
  critical_paths_severed: number;
  blast_radius_reduction_percent: number;
  attacker_effort_increase: number;
  priority_score: number;
  implementation_complexity: string;
  jira_ticket_template: {
    project: string;
    issue_type: string;
    summary: string;
    priority: string;
    description: string;
    acceptance_criteria: string;
  };
  remediation_command: string;
  reasoning: string;
}

export interface BehaviouralAnomalyFinding {
  anomaly_id: string;
  asset_id: string;
  asset_name: string;
  anomaly_type: string;
  severity: string;
  description: string;
  detected_at: string;
  evidence: Record<string, any>;
  mitre_technique: string;
  recommended_action: string;
}

export interface AutomatedAuditReport {
  audit_id: string;
  generated_at: string;
  assets_scanned_count: number;
  vulnerabilities_detected_count: number;
  vulnerabilities: VulnerabilityFinding[];
  behavioural_anomalies_count?: number;
  behavioural_anomalies?: BehaviouralAnomalyFinding[];
  viable_attack_paths_count: number;
  attack_paths: AuditedAttackPath[];
  chokepoints: ChokepointAnalysis[];
  baseline_resilience_score: number;
  projected_resilience_score: number;
  resilience_improvement_percent: number;
  remediation_tasks: RemediationTask[];
  executive_verdict: string;
  executive_summary: string;
}

// ── API Client Helper ─────────────────────────────────────────────────────────

import {
  FALLBACK_HEALTH,
  FALLBACK_TWIN,
  FALLBACK_THREATS,
  FALLBACK_REMEDIATIONS,
  FALLBACK_RESILIENCE,
} from "./seedFallback";

const getApiBase = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "";
    }
  }
  return "https://xto.onrender.com";
};

const API_BASE = getApiBase();

async function request<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      const text = await response.text().catch(() => "");
      if (text) errorDetail = text;
    }
    throw new Error(`API Error [${response.status}]: ${errorDetail}`);
  }

  return response.json();
}

// ── Exported API Object ───────────────────────────────────────────────────────

export const api = {
  // Health
  getHealth: async (): Promise<HealthResponse> => {
    try {
      return await request<HealthResponse>("/api/health");
    } catch (err) {
      console.warn("[XTO API] Backend offline/connecting, using cached health:", err);
      return { ...FALLBACK_HEALTH, status: "ONLINE" };
    }
  },

  // Digital Twin
  getTwin: async (): Promise<DigitalTwinTopology> => {
    try {
      return await request<DigitalTwinTopology>("/api/twin");
    } catch (err) {
      console.warn("[XTO API] Backend offline/connecting, using seed fallback topology:", err);
      return FALLBACK_TWIN;
    }
  },
  addAsset: (asset: Asset) =>
    request<{ status: string; asset_id: string }>("/api/twin/assets", {
      method: "POST",
      body: JSON.stringify(asset),
    }),
  addRelationship: (rel: Relationship) =>
    request<{ status: string; relationship_id: string }>("/api/twin/relationships", {
      method: "POST",
      body: JSON.stringify(rel),
    }),
  addIdentity: (identity: Identity) =>
    request<{ status: string; identity_id: string }>("/api/twin/identities", {
      method: "POST",
      body: JSON.stringify(identity),
    }),
  addOrUpdateControl: (control: SecurityControl) =>
    request<{ status: string; control_id: string }>("/api/twin/controls", {
      method: "POST",
      body: JSON.stringify(control),
    }),
  getTwinChanges: () => request<EnvironmentChange[]>("/api/twin/changes"),
  syncTwin: (payload?: any) =>
    request<any>("/api/twin/sync", {
      method: "POST",
      body: payload ? JSON.stringify(payload) : undefined,
    }),

  // Threat Vectors
  getThreatVectors: async (): Promise<ThreatVector[]> => {
    try {
      return await request<ThreatVector[]>("/api/threat-vectors");
    } catch (err) {
      console.warn("[XTO API] Backend offline/connecting, using fallback threat vectors:", err);
      return FALLBACK_THREATS;
    }
  },
  assessThreat: (req: ThreatAssessmentRequest) =>
    request<ThreatAssessmentResponse>("/api/threat-vectors/assess", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  // Attacker Personas
  getAttackers: () => request<AttackerProfile[]>("/api/attackers"),

  // Simulation
  runSimulation: (req: SimulationRequest) =>
    request<SimulationTrace>("/api/simulations", {
      method: "POST",
      body: JSON.stringify(req),
    }),
  getSimulationTrace: (simId: string) =>
    request<SimulationTrace>(`/api/simulations/${encodeURIComponent(simId)}`),
  rerunSimulation: (simId: string) =>
    request<SimulationTrace>(`/api/simulations/${encodeURIComponent(simId)}/run`, {
      method: "POST",
    }),

  // Attack Paths & Chokepoints
  getAttackPaths: (entryPointId: string = "WS-ENG-04", targetId: string = "VAULT-BACKUP-01", cutoff: number = 7) =>
    request<AttackPathAnalysisResponse>(
      `/api/attack-paths?entry_point_id=${encodeURIComponent(entryPointId)}&target_id=${encodeURIComponent(targetId)}&cutoff=${cutoff}`
    ),
  analyzeAttackPaths: (req: { entry_point_id: string; target_id: string; cutoff?: number }) =>
    request<AttackPathAnalysisResponse>("/api/attack-paths/analyze", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  // Blast Radius
  getBlastRadius: (assetId: string) =>
    request<BlastRadiusResponse>(`/api/blast-radius/${encodeURIComponent(assetId)}`),

  // Defense Sandbox & Decision Proof (Core USP)
  runWhatIf: (req: WhatIfRequest) =>
    request<WhatIfComparison>("/api/what-if", {
      method: "POST",
      body: JSON.stringify(req),
    }),
  compareWhatIf: (req: WhatIfRequest) =>
    request<WhatIfComparison>("/api/what-if/compare", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  // Remediation
  getRemediationPriorities: async (): Promise<RemediationPriority[]> => {
    try {
      return await request<RemediationPriority[]>("/api/remediation/priorities");
    } catch (err) {
      console.warn("[XTO API] Backend offline/connecting, using fallback remediations:", err);
      return FALLBACK_REMEDIATIONS;
    }
  },

  // Evidence
  getEvidence: (simId?: string) =>
    request<EvidenceRecord[]>(simId ? `/api/evidence/${encodeURIComponent(simId)}` : "/api/evidence"),

  // MITRE ATT&CK Framework
  getMitreTechniques: () => request<any[]>("/api/mitre/techniques"),
  getMitreCoverage: () => request<MitrePostureReport>("/api/mitre/coverage"),
  getMitreMatrix: () => request<MitreMatrixTactic[]>("/api/mitre/matrix"),
  getAssetMitreProfile: (assetId: string) =>
    request<AssetMitreProfile>(`/api/mitre/asset/${encodeURIComponent(assetId)}`),

  // Explainable AI
  explain: (req: { type: string; params: Record<string, any> }) =>
    request<{ explanation: string }>("/api/explain", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  // Autonomous Audit & Remediation Pipeline (Feature #12)
  runAutomatedAudit: () =>
    request<AutomatedAuditReport>("/api/automation/audit", {
      method: "POST",
    }),
  getAutomatedAudit: () =>
    request<AutomatedAuditReport>("/api/automation/audit"),

  // Resilience Score (Feature #9)
  getResilience: async (): Promise<ResilienceScoreResult> => {
    try {
      return await request<ResilienceScoreResult>("/api/resilience");
    } catch (err) {
      console.warn("[XTO API] Backend offline/connecting, using fallback resilience score:", err);
      return FALLBACK_RESILIENCE;
    }
  },

  // Natural Language Query (Feature #10)
  processNaturalLanguageQuery: (query: string) =>
    request<NaturalLanguageQueryResult>("/api/queries/natural-language", {
      method: "POST",
      body: JSON.stringify({ query }),
    }),

  // Simulation History (Feature #11)
  listSimulations: () =>
    request<SimulationSummaryItem[]>("/api/simulations"),

  // Red / Blue Simulation (Feature #2)
  runRedBlueSimulation: (req: { initial_foothold_id: string; target_objective_id: string }) =>
    request<RedBlueSimulationResult>("/api/simulations/red-blue", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  // Snapshot Time Machine (Feature #8)
  createSnapshot: (name: string) =>
    request<any>("/api/snapshots", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  listSnapshots: () =>
    request<SnapshotSummary[]>("/api/snapshots"),
  getSnapshot: (snapshotId: string) =>
    request<any>(`/api/snapshots/${encodeURIComponent(snapshotId)}`),
  compareSnapshots: (snapshotAId: string, snapshotBId: string) =>
    request<any>("/api/snapshots/compare", {
      method: "POST",
      body: JSON.stringify({ snapshot_a_id: snapshotAId, snapshot_b_id: snapshotBId }),
    }),

  // Real Scan Ingestion (Feature #13)
  getIngestionFormats: () =>
    request<SupportedFormatInfo[]>("/api/ingest/formats"),
  uploadScanFile: async (file: File, mode: string = "MERGE") => {
    const text = await file.text();
    return request<IngestionResponse>(`/api/ingest/upload?mode=${mode}`, {
      method: "POST",
      body: JSON.stringify({
        content: text,
        filename: file.name,
        mode: mode,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
  loadSampleScan: (sampleId: string, mode: string = "MERGE") =>
    request<IngestionResponse>(`/api/ingest/sample?sample_id=${encodeURIComponent(sampleId)}&mode=${mode}`, {
      method: "POST",
    }),
  resetTwin: () =>
    request<any>("/api/twin/reset", {
      method: "POST",
    }),
};
