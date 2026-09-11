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
)
from xto_core.graph.security_graph import SecurityGraph
from xto_core.graph.path_engine import AttackPathEngine
from xto_core.simulation.attacker_agent import get_default_attacker_profiles
from xto_core.mitre.mitre_catalog import get_all_mitre_techniques, get_mitre_technique

router = APIRouter(prefix="/api", tags=["XTO Cyber Decision Digital Twin"])

# Cache for past simulations
_simulation_history: Dict[str, SimulationTrace] = {}


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


@router.get("/simulations/{sim_id}", response_model=SimulationTrace)
def get_simulation_trace(sim_id: str):
    trace = _simulation_history.get(sim_id)
    if not trace:
        raise HTTPException(status_code=404, detail=f"Simulation trace '{sim_id}' not found")
    return trace


@router.post("/simulations/{sim_id}/run", response_model=SimulationTrace)
def rerun_simulation(sim_id: str):
    past_trace = _simulation_history.get(sim_id)
    if not past_trace:
        raise HTTPException(status_code=404, detail=f"Simulation '{sim_id}' not found")
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


@router.post("/attack-paths/analyze")
def analyze_attack_paths(req: AttackPathAnalysisRequest):
    twin = get_twin()
    sec_graph = SecurityGraph(twin)
    path_engine = AttackPathEngine(sec_graph)

    all_paths = path_engine.find_all_attack_paths(req.entry_point_id, req.target_id, cutoff=req.cutoff)
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
):
    req = AttackPathAnalysisRequest(entry_point_id=entry_point_id, target_id=target_id)
    return analyze_attack_paths(req)


# ── Blast Radius ─────────────────────────────────────────────────────────────

@router.get("/blast-radius/{asset_id}")
def get_asset_blast_radius(asset_id: str):
    blast_engine = get_blast_engine()
    try:
        return blast_engine.calculate_blast_radius(asset_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


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


# ── MITRE ATT&CK Catalog ─────────────────────────────────────────────────────

@router.get("/mitre/techniques")
def get_mitre_catalog():
    return get_all_mitre_techniques()


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
