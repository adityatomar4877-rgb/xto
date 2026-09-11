from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.schemas.twin import (
    Asset,
    Identity,
    Relationship,
    SecurityControl,
    DigitalTwinTopology,
    EnvironmentChange,
)
from app.schemas.threat import (
    ThreatVector,
    ThreatAssessmentRequest,
    ThreatAssessmentResponse,
)
from app.schemas.simulation import (
    AttackerAgentProfile,
    SimulationRequest,
    SimulationTrace,
    AttackerPersona,
)
from app.schemas.defense import (
    WhatIfRequest,
    WhatIfComparison,
    DecisionProof,
)
from app.schemas.evidence import (
    EvidenceRecord,
    RemediationPriority,
)
from app.schemas.mitre import (
    MitrePostureReport,
    AssetMitreProfile,
)
from app.schemas.lab import (
    AttackPathEdgeEvidence,
    RedBlueSimulationRequest,
    RedBlueSimulationResult,
    CounterfactualRequest,
    CounterfactualResult,
    ControlAnalysisRequest,
    ControlEffectivenessResult,
    SecurityBudgetRequest,
    BudgetOptimizationResult,
    EnhancedBlastRadiusRequest,
    EnhancedBlastRadiusResult,
    SnapshotCreateRequest,
    SnapshotSummary,
    SnapshotCompareRequest,
    SnapshotComparisonResult,
    ResilienceScoreResult,
    NaturalLanguageQueryRequest,
    NaturalLanguageQueryResult,
    SimulationSummaryItem,
    AutomatedAuditReport,
)
from app.core.dependencies import (
    get_twin,
    get_evidence_collector,
    get_threat_engine,
    get_blast_engine,
    get_remediation_engine,
    get_sync_engine,
    get_xai_engine,
    get_proof_generator,
    get_simulator,
    get_mitre_analyzer,
    get_red_blue_engine,
    get_control_evaluator,
    get_budget_optimizer,
    get_snapshot_time_machine,
    get_resilience_engine,
    get_nl_query_engine,
    get_defense_sandbox,
    get_audit_engine,
)
from xto_core.graph.security_graph import SecurityGraph
from xto_core.graph.path_engine import AttackPathEngine
from xto_core.simulation.attacker_agent import get_default_attacker_profiles
from xto_core.mitre.mitre_catalog import get_all_mitre_techniques, get_mitre_technique

router = APIRouter(prefix="/api", tags=["XTO Cyber Decision Digital Twin"])

# Unified cache for standard and Red/Blue simulations
_simulation_history: Dict[str, Any] = {}


# ── Health ───────────────────────────────────────────────────────────────────

@router.get("/health")
def health_check():
    twin = get_twin()
    topo = twin.get_topology()
    return {
        "status": "ONLINE",
        "service": "XTO — Cyber Decision Digital Twin",
        "product_version": "1.0.0-hackx",
        "snapshot_id": topo.snapshot_id,
        "assets_loaded": len(topo.assets),
        "identities_loaded": len(topo.identities),
        "relationships_loaded": len(topo.relationships),
        "active_controls": len([c for c in topo.controls if c.is_active]),
    }


# ── Digital Twin Topology & Entities ─────────────────────────────────────────

@router.get("/twin", response_model=DigitalTwinTopology)
def get_digital_twin_topology():
    return get_twin().get_topology()


@router.post("/twin/assets")
def add_asset(asset: Asset):
    twin = get_twin()
    # Add asset to topology
    twin._topology.assets.append(asset)
    twin._rebuild_indices()
    twin._record_change(
        change_type="ASSET_ADDED",
        target_id=asset.id,
        details={"name": asset.name, "zone": asset.zone.value, "type": asset.type.value},
    )
    return {"status": "SUCCESS", "asset_id": asset.id}


@router.post("/twin/relationships")
def add_relationship(rel: Relationship):
    twin = get_twin()
    twin.add_relationship(rel)
    return {"status": "SUCCESS", "relationship_id": rel.id}


@router.post("/twin/identities")
def add_identity(identity: Identity):
    twin = get_twin()
    twin._topology.identities.append(identity)
    twin._rebuild_indices()
    twin._record_change(
        change_type="IDENTITY_ADDED",
        target_id=identity.id,
        details={"name": identity.name, "role": identity.role, "privilege": identity.privilege_level.value},
    )
    return {"status": "SUCCESS", "identity_id": identity.id}


@router.post("/twin/controls")
def add_or_update_control(control: SecurityControl):
    twin = get_twin()
    twin.add_or_update_control(control)
    return {"status": "SUCCESS", "control_id": control.id}


@router.get("/twin/changes", response_model=List[EnvironmentChange])
def get_environment_changes():
    return get_twin().get_changes_log()


@router.post("/twin/sync")
def sync_environment(payload: Optional[Dict[str, Any]] = None):
    sync_engine = get_sync_engine()
    if payload and "assets" in payload:
        return sync_engine.sync_from_json(payload)
    return sync_engine.trigger_synthetic_sync()


# ── Threat Vectors ───────────────────────────────────────────────────────────

@router.get("/threat-vectors", response_model=List[ThreatVector])
def get_threat_vectors():
    return get_threat_engine().get_all_vectors()


@router.post("/threat-vectors/assess", response_model=ThreatAssessmentResponse)
def assess_threat_vector(req: ThreatAssessmentRequest):
    try:
        return get_threat_engine().assess_threat(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Attacker Personas & Capabilities ─────────────────────────────────────────

@router.get("/attackers", response_model=List[AttackerAgentProfile])
def get_attackers():
    profiles = get_default_attacker_profiles()
    return list(profiles.values())


# ── Attack Simulation ────────────────────────────────────────────────────────

@router.post("/simulations", response_model=SimulationTrace)
def create_and_run_simulation(req: SimulationRequest):
    simulator = get_simulator()
    try:
        trace = simulator.run_simulation(req)
        _simulation_history[trace.simulation_id] = trace
        return trace
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Simulation error: {str(e)}")


@router.post("/simulations/red-blue", response_model=RedBlueSimulationResult)
def create_and_run_red_blue_simulation(req: RedBlueSimulationRequest):
    engine = get_red_blue_engine()
    try:
        res = engine.run_red_blue_simulation(req)
        _simulation_history[res.simulation_id] = res
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Red/Blue simulation error: {str(e)}")


@router.post("/simulations/what-if", response_model=CounterfactualResult)
def run_counterfactual_simulation(req: CounterfactualRequest):
    sandbox = get_defense_sandbox()
    try:
        return sandbox.evaluate_counterfactual(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Counterfactual error: {str(e)}")


@router.get("/simulations", response_model=List[SimulationSummaryItem])
def list_all_simulations():
    summaries: List[SimulationSummaryItem] = []
    for sim_id, item in _simulation_history.items():
        if isinstance(item, SimulationTrace):
            summaries.append(
                SimulationSummaryItem(
                    simulation_id=item.simulation_id,
                    simulation_type="STANDARD",
                    timestamp=item.started_at,
                    initial_foothold_id=item.initial_foothold_id,
                    target_objective_id=item.target_objective_id,
                    outcome="OBJECTIVE_COMPLETED" if item.objective_achieved else "CONTAINED_BY_DEFENSE",
                    blast_radius_percent=item.blast_radius_percent,
                    events_count=len(item.timeline),
                )
            )
        elif isinstance(item, RedBlueSimulationResult):
            summaries.append(
                SimulationSummaryItem(
                    simulation_id=item.simulation_id,
                    simulation_type="RED_BLUE",
                    timestamp=item.started_at,
                    initial_foothold_id=item.initial_foothold_id,
                    target_objective_id=item.target_objective_id,
                    outcome=item.outcome,
                    risk_reduction_percent=item.total_risk_reduction_percent,
                    total_rounds=item.total_rounds,
                )
            )
        elif isinstance(item, dict):
            summaries.append(
                SimulationSummaryItem(
                    simulation_id=sim_id,
                    simulation_type=item.get("simulation_type", "STANDARD"),
                    timestamp=item.get("timestamp", ""),
                    initial_foothold_id=item.get("initial_foothold_id", ""),
                    target_objective_id=item.get("target_objective_id", ""),
                    outcome=item.get("outcome", "COMPLETED"),
                )
            )
    return summaries


@router.get("/simulations/{sim_id}")
def get_simulation_trace(sim_id: str):
    trace = _simulation_history.get(sim_id)
    if not trace:
        raise HTTPException(status_code=404, detail=f"Simulation trace '{sim_id}' not found")
    return trace


@router.post("/simulations/{sim_id}/run")
def rerun_simulation(sim_id: str):
    past_trace = _simulation_history.get(sim_id)
    if not past_trace:
        raise HTTPException(status_code=404, detail=f"Simulation '{sim_id}' not found")

    if isinstance(past_trace, RedBlueSimulationResult):
        engine = get_red_blue_engine()
        req = RedBlueSimulationRequest(
            initial_foothold_id=past_trace.initial_foothold_id,
            target_objective_id=past_trace.target_objective_id,
        )
        res = engine.run_red_blue_simulation(req)
        _simulation_history[res.simulation_id] = res
        return res

    req = SimulationRequest(
        threat_vector_id=past_trace.threat_vector_id,
        attacker_persona=past_trace.attacker_persona,
        initial_foothold_id=past_trace.initial_foothold_id,
        target_objective_id=past_trace.target_objective_id,
    )
    simulator = get_simulator()
    trace = simulator.run_simulation(req)
    _simulation_history[trace.simulation_id] = trace
    return trace


# ── Attack Paths & Chokepoints ───────────────────────────────────────────────

class AttackPathAnalysisRequest(BaseModel):
    entry_point_id: str
    target_id: str
    cutoff: int = 7
    sort_by: Optional[str] = "effort"


@router.post("/attack-paths/analyze")
def analyze_attack_paths(req: AttackPathAnalysisRequest):
    twin = get_twin()
    sec_graph = SecurityGraph(twin)
    path_engine = AttackPathEngine(sec_graph)

    all_paths = path_engine.find_all_attack_paths(req.entry_point_id, req.target_id, cutoff=req.cutoff)
    if req.sort_by == "effort":
        all_paths.sort(key=lambda p: p.get("total_effort", 999))
    elif req.sort_by in ("hops", "length", "shortest"):
        all_paths.sort(key=lambda p: p.get("hop_count", 999))

    shortest = path_engine.get_shortest_path(req.entry_point_id, req.target_id)
    lowest_effort = path_engine.get_lowest_effort_path(req.entry_point_id, req.target_id)
    chokepoints = path_engine.find_chokepoints(req.entry_point_id, req.target_id)

    return {
        "entry_point": req.entry_point_id,
        "target": req.target_id,
        "total_paths_found": len(all_paths),
        "paths": all_paths,
        "shortest_path": shortest,
        "lowest_effort_path": lowest_effort,
        "chokepoints": chokepoints,
    }


@router.get("/attack-paths")
def get_default_attack_paths(
    entry_point_id: str = Query("WS-ENG-04"),
    target_id: str = Query("VAULT-BACKUP-01"),
    sort_by: Optional[str] = Query("effort"),
):
    req = AttackPathAnalysisRequest(entry_point_id=entry_point_id, target_id=target_id, sort_by=sort_by)
    return analyze_attack_paths(req)


@router.get("/simulations/{sim_id}/attack-paths")
def get_simulation_attack_paths(sim_id: str):
    trace = _simulation_history.get(sim_id)
    if not trace:
        raise HTTPException(status_code=404, detail=f"Simulation '{sim_id}' not found")

    entry = getattr(trace, "initial_foothold_id", "WS-ENG-04")
    target = getattr(trace, "target_objective_id", "VAULT-BACKUP-01")

    sec_graph = SecurityGraph(get_twin())
    path_engine = AttackPathEngine(sec_graph)
    paths = path_engine.find_all_attack_paths(entry, target, cutoff=8)
    return {
        "simulation_id": sim_id,
        "entry_point": entry,
        "target": target,
        "total_paths": len(paths),
        "paths": paths,
    }


@router.get("/simulations/{sim_id}/attack-paths/{path_id}/evidence")
def get_simulation_path_evidence(sim_id: str, path_id: str):
    trace = _simulation_history.get(sim_id)
    if not trace:
        raise HTTPException(status_code=404, detail=f"Simulation '{sim_id}' not found")

    entry = getattr(trace, "initial_foothold_id", "WS-ENG-04")
    target = getattr(trace, "target_objective_id", "VAULT-BACKUP-01")

    sec_graph = SecurityGraph(get_twin())
    path_engine = AttackPathEngine(sec_graph)
    paths = path_engine.find_all_attack_paths(entry, target, cutoff=8)
    matched = next((p for p in paths if p.get("path_id") == path_id), None)
    if not matched:
        try:
            idx = int(path_id)
            if 0 <= idx < len(paths):
                matched = paths[idx]
        except ValueError:
            pass

    if not matched:
        raise HTTPException(status_code=404, detail=f"Attack path '{path_id}' not found for simulation '{sim_id}'")

    return {
        "simulation_id": sim_id,
        "path_id": path_id,
        "summary": matched.get("summary"),
        "transitions": matched.get("transitions", []),
        "evidence_chain": matched.get("transitions", []),
        "damage_assessment": matched.get("damage_assessment", {}),
        "compromised_area": matched.get("compromised_area", {}),
        "hop_by_hop_damage": matched.get("hop_by_hop_damage", []),
    }


# ── Blast Radius ─────────────────────────────────────────────────────────────

@router.get("/blast-radius/{asset_id}")
def get_asset_blast_radius(asset_id: str):
    blast_engine = get_blast_engine()
    try:
        return blast_engine.calculate_blast_radius(asset_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/blast-radius", response_model=EnhancedBlastRadiusResult)
def calculate_enhanced_blast_radius(req: EnhancedBlastRadiusRequest):
    blast_engine = get_blast_engine()
    try:
        return blast_engine.calculate_blast_radius(
            compromised_asset_id=req.compromised_asset_id,
            max_depth=req.max_depth,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Defense Sandbox & Decision Proof (Core USP) ──────────────────────────────

@router.post("/what-if", response_model=WhatIfComparison)
def run_what_if_defense_sandbox(req: WhatIfRequest):
    proof_gen = get_proof_generator()
    try:
        comparison = proof_gen.evaluate_what_if(req)
        return comparison
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"What-If error: {str(e)}")


@router.post("/what-if/compare", response_model=WhatIfComparison)
def compare_defense_scenarios(req: WhatIfRequest):
    return run_what_if_defense_sandbox(req)


# ── Remediation Prioritisation ───────────────────────────────────────────────

@router.get("/remediation/priorities", response_model=List[RemediationPriority])
def get_remediation_priorities():
    return get_remediation_engine().compute_priorities()


# ── Evidence Explorer ────────────────────────────────────────────────────────

@router.get("/evidence", response_model=List[EvidenceRecord])
def get_all_evidence():
    return get_evidence_collector().get_all_evidence()


@router.get("/evidence/{sim_id}", response_model=List[EvidenceRecord])
def get_simulation_evidence(sim_id: str):
    trace = _simulation_history.get(sim_id)
    if not trace:
        return get_evidence_collector().get_all_evidence()
    
    # Collect all evidence IDs referenced in this simulation
    ev_ids = set()
    for e in trace.timeline:
        ev_ids.update(e.evidence_ids)
    
    records = []
    for ev_id in ev_ids:
        rec = get_evidence_collector().get_evidence(ev_id)
        if rec:
            records.append(rec)
    return records if records else get_evidence_collector().get_all_evidence()


# ── MITRE ATT&CK Framework Analysis ──────────────────────────────────────────

@router.get("/mitre/techniques")
def get_mitre_catalog():
    return get_all_mitre_techniques()


@router.get("/mitre/coverage", response_model=MitrePostureReport)
def get_mitre_coverage_report():
    analyzer = get_mitre_analyzer()
    return analyzer.analyze_enterprise_coverage()


@router.get("/mitre/matrix")
def get_mitre_matrix():
    analyzer = get_mitre_analyzer()
    return analyzer.get_full_matrix()


@router.get("/mitre/asset/{asset_id}", response_model=AssetMitreProfile)
def get_asset_mitre_profile(asset_id: str):
    analyzer = get_mitre_analyzer()
    profile = analyzer.analyze_asset_profile(asset_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Asset '{asset_id}' not found in Digital Twin")
    return profile


# ── Explainable AI Reasoning ─────────────────────────────────────────────────

class ExplainRequest(BaseModel):
    type: str  # "TRANSITION", "DEFENSE", "PRIORITIZATION"
    params: Dict[str, Any]


@router.post("/explain")
def generate_xai_explanation(req: ExplainRequest):
    xai = get_xai_engine()
    if req.type == "DEFENSE":
        text = xai.explain_defense_success(
            control_name=req.params.get("control_name", "Network Micro-segmentation"),
            target_name=req.params.get("target_name", "VAULT-BACKUP-01"),
            paths_eliminated=req.params.get("paths_eliminated", 11),
        )
    elif req.type == "PRIORITIZATION":
        text = xai.explain_prioritization(
            top_control_name=req.params.get("control_name", "Micro-Segment Backup Vault"),
            paths_eliminated=req.params.get("paths_eliminated", 11),
            blast_reduction=req.params.get("blast_reduction", 47.0),
        )
    else:
        text = xai.explain_transition(
            source_name=req.params.get("source_name", "WS-ENG-04"),
            target_name=req.params.get("target_name", "DC-CORP-01"),
            technique_name=req.params.get("technique_name", "Pass the Hash / SMB Admin Pivot"),
            evidence_list=req.params.get("evidence", ["TCP 445 open", "Domain Admin NTLM Hash extracted from LSASS"]),
        )
    return {"explanation": text}


# ── Security Control Effectiveness Analysis (Feature #4) ─────────────────────

@router.post("/control-analysis", response_model=ControlEffectivenessResult)
def analyze_control_effectiveness(req: ControlAnalysisRequest):
    evaluator = get_control_evaluator()
    try:
        return evaluator.evaluate_controls(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Control analysis error: {str(e)}")


# ── Security Budget Optimizer (Feature #5) ───────────────────────────────────

@router.post("/security-optimization", response_model=BudgetOptimizationResult)
def optimize_security_budget(req: SecurityBudgetRequest):
    optimizer = get_budget_optimizer()
    try:
        return optimizer.optimize_budget(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Security optimization error: {str(e)}")


# ── Attack Path Time Machine & Snapshots (Feature #8) ─────────────────────────

@router.post("/snapshots")
def create_environment_snapshot(req: SnapshotCreateRequest):
    twin = get_twin()
    snap_id = twin.create_snapshot(req.name)
    topo = twin.get_snapshot(snap_id)
    return {
        "status": "SUCCESS",
        "snapshot_id": snap_id,
        "name": topo.name if topo else req.name,
        "version": topo.version if topo else 1,
        "timestamp": topo.timestamp if topo else "",
        "asset_count": len(topo.assets) if topo else 0,
        "control_count": len(topo.controls) if topo else 0,
    }


@router.get("/snapshots", response_model=List[SnapshotSummary])
def list_environment_snapshots():
    time_machine = get_snapshot_time_machine()
    return time_machine.list_snapshots_summary()


@router.get("/snapshots/{snapshot_id}")
def get_environment_snapshot(snapshot_id: str):
    twin = get_twin()
    snap = twin.get_snapshot(snapshot_id)
    if not snap:
        raise HTTPException(status_code=404, detail=f"Snapshot '{snapshot_id}' not found")
    return snap


@router.post("/snapshots/compare", response_model=SnapshotComparisonResult)
def compare_environment_snapshots(req: SnapshotCompareRequest):
    time_machine = get_snapshot_time_machine()
    try:
        return time_machine.compare_snapshots(req.snapshot_a_id, req.snapshot_b_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Attack Path Enterprise Resilience Score (Feature #9) ──────────────────────

@router.get("/resilience", response_model=ResilienceScoreResult)
def get_enterprise_resilience_score():
    resilience_engine = get_resilience_engine()
    try:
        return resilience_engine.compute_resilience_score()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resilience calculation error: {str(e)}")


# ── Deterministic Natural Language Security Queries (Feature #10) ─────────────

@router.post("/queries/natural-language", response_model=NaturalLanguageQueryResult)
def process_natural_language_query(req: NaturalLanguageQueryRequest):
    nl_engine = get_nl_query_engine()
    try:
        return nl_engine.process_query(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Natural language query error: {str(e)}")


# ── Feature #12: Autonomous Vulnerability, Path & Remediation Audit ───────────

@router.post("/automation/audit", response_model=AutomatedAuditReport)
@router.get("/automation/audit", response_model=AutomatedAuditReport)
def run_autonomous_audit():
    """Execute end-to-end automated security audit:
    1. Scan all enterprise assets for CVE vulnerabilities and credential risks.
    2. Map viable lateral attack paths from vulnerable assets to Crown Jewels.
    3. Identify critical graph chokepoints and calculate damage scores.
    4. Synthesize optimal prioritized remediations with Jira tickets and scripts.
    5. Compile complete executive and technical report with resilience posture delta.
    """
    audit_engine = get_audit_engine()
    try:
        return audit_engine.run_full_audit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Automated audit execution failure: {str(e)}")
