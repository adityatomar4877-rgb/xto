import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from xto_core.twin.security_twin import SecurityTwin
from xto_core.simulation.simulator import AttackSimulator
from xto_core.what_if.proof_generator import DecisionProofGenerator
from app.schemas.simulation import SimulationRequest, AttackerPersona
from app.schemas.defense import WhatIfRequest, DefenseIntervention


def test_attack_simulation_baseline():
    twin = SecurityTwin()
    sim = AttackSimulator(twin)

    req = SimulationRequest(
        threat_vector_id="THREAT-PHISH",
        attacker_persona=AttackerPersona.RANSOMWARE,
        initial_foothold_id="WS-ENG-04",
        target_objective_id="VAULT-BACKUP-01",
    )
    trace = sim.run_simulation(req)
    assert trace.objective_achieved is True, "In undefended baseline, Ransomware reaches backup vault"
    assert len(trace.timeline) >= 3
    assert trace.blast_radius_percent > 30.0


def test_defense_sandbox_and_decision_proof():
    twin = SecurityTwin()
    proof_gen = DecisionProofGenerator(twin)

    # Interventions: Segment the backup vault and enforce MFA on admin accounts
    interventions = [
        DefenseIntervention(
            id="DEF-01",
            control_type="SEGMENT_NETWORK",
            name="Air-Gap Backup Vault",
            target_scope=["VAULT-BACKUP-01"],
            is_enabled=True,
        ),
        DefenseIntervention(
            id="DEF-02",
            control_type="ENABLE_MFA",
            name="Enforce MFA on Tier-0 Admin",
            target_scope=["ID-DOMAIN-ADMIN"],
            is_enabled=True,
        ),
    ]

    what_if_req = WhatIfRequest(
        threat_vector_id="THREAT-PHISH",
        attacker_persona=AttackerPersona.RANSOMWARE,
        initial_foothold_id="WS-ENG-04",
        target_objective_id="VAULT-BACKUP-01",
        defenses=interventions,
    )

    comparison = proof_gen.evaluate_what_if(what_if_req)
    proof = comparison.decision_proof

    # Core USP assertions
    assert proof.objective_reached_before is True
    assert proof.objective_reached_after is False, "Defenses should block ransomware before reaching backup vault"
    assert proof.verdict == "PROVEN_DEFENSE_SUCCESS"
    assert proof.paths_eliminated_count > 0
    assert proof.blast_radius_reduction_percent > 0.0
    assert len(proof.eliminated_path_explanations) >= 2
    assert "PROVEN" in proof.executive_statement
