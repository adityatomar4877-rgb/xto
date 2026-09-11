import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ── Feature #1: Attack Simulation with Evidence Reasons ───────────────────────

def test_feature1_simulation_evidence_reasons():
    payload = {
        "threat_vector_id": "THREAT-PHISH",
        "attacker_persona": "RANSOMWARE",
        "initial_foothold_id": "WS-ENG-04",
        "target_objective_id": "VAULT-BACKUP-01",
    }
    res = client.post("/api/simulations", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "simulation_id" in data
    assert "timeline" in data
    assert len(data["timeline"]) > 0

    # Verify every simulation event has step-by-step evidence reasons
    for event in data["timeline"]:
        assert "reason" in event
        assert isinstance(event["reason"], list)
        assert len(event["reason"]) > 0
        assert isinstance(event["reason"][0], str)


# ── Feature #2: Adaptive Red vs Blue Simulation ──────────────────────────────

def test_feature2_adaptive_red_blue_simulation():
    payload = {
        "initial_foothold_id": "WS-ENG-04",
        "target_objective_id": "VAULT-BACKUP-01",
        "threat_vector_id": "THREAT-PHISH",
        "attacker_persona": "RANSOMWARE",
        "max_rounds": 4,
        "allow_adaptive_rerouting": True,
        "auto_blue_response": True,
    }
    res = client.post("/api/simulations/red-blue", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "simulation_id" in data
    assert "rounds" in data
    assert len(data["rounds"]) > 0
    assert data["initial_paths_count"] > 0
    assert "outcome" in data
    assert data["total_paths_eliminated"] >= 0

    # Verify round structure
    first_round = data["rounds"][0]
    assert "red_action" in first_round
    assert "round_number" in first_round
    assert first_round["paths_before"] >= first_round["paths_after"]


# ── Feature #3: Counterfactual "What If?" Simulation ─────────────────────────

def test_feature3_counterfactual_what_if():
    payload = {
        "changes": [
            {
                "type": "enable_control",
                "target": "VAULT-BACKUP-01",
                "control": "NETWORK_SEGMENTATION",
            },
            {
                "type": "enable_control",
                "target": "ID-DOMAIN-ADMIN",
                "control": "MFA",
            }
        ],
        "initial_foothold_id": "WS-ENG-04",
        "target_objective_id": "VAULT-BACKUP-01",
    }
    res = client.post("/api/simulations/what-if", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "experiment_id" in data
    assert "before" in data
    assert "after" in data
    assert "paths_eliminated" in data
    assert "risk_reduction" in data
    assert "blast_radius_reduction_percent" in data
    assert len(data["changes_applied"]) == 2
    assert len(data["explanation"]) > 0


# ── Feature #4: Security Control Effectiveness Engine ────────────────────────

def test_feature4_control_effectiveness_analysis():
    payload = {
        "entry_point_id": "WS-ENG-04",
        "target_objective_id": "VAULT-BACKUP-01",
        "controls": [
            {
                "id": "CTRL-TEST-MFA",
                "name": "Enforce FIDO2 Hardware MFA",
                "control_type": "MFA",
                "target_scope": ["ID-DOMAIN-ADMIN", "ID-ENG-DEV"],
                "cost": 15000.0,
            },
            {
                "id": "CTRL-TEST-SEG",
                "name": "Micro-Segment Backup Vault",
                "control_type": "NETWORK_SEGMENTATION",
                "target_scope": ["VAULT-BACKUP-01"],
                "cost": 30000.0,
            }
        ]
    }
    res = client.post("/api/control-analysis", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "analysis_id" in data
    assert "evaluated_controls" in data
    assert len(data["evaluated_controls"]) == 2
    assert data["top_effective_control"] is not None

    top_ctrl = data["top_effective_control"]
    assert "roi_score" in top_ctrl
    assert "paths_before" in top_ctrl
    assert "paths_after" in top_ctrl
    assert top_ctrl["paths_before"] >= top_ctrl["paths_after"]


# ── Feature #5: Security Budget Optimizer ────────────────────────────────────

def test_feature5_security_budget_optimizer():
    payload = {
        "available_budget": 50000.0,
        "entry_point_id": "WS-ENG-04",
        "target_objective_id": "VAULT-BACKUP-01",
        "candidate_controls": [
            {
                "id": "CTRL-OPT-MFA",
                "name": "MFA for Admin",
                "control_type": "MFA",
                "target_scope": ["ID-DOMAIN-ADMIN"],
                "cost": 12000.0,
            },
            {
                "id": "CTRL-OPT-SEG",
                "name": "Air-Gap Vault",
                "control_type": "NETWORK_SEGMENTATION",
                "target_scope": ["VAULT-BACKUP-01"],
                "cost": 25000.0,
            },
            {
                "id": "CTRL-OPT-EDR",
                "name": "EDR Agent Fleet",
                "control_type": "EDR",
                "target_scope": ["WS-ENG-04", "DC-CORP-01"],
                "cost": 40000.0,
            }
        ]
    }
    res = client.post("/api/security-optimization", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "optimization_id" in data
    assert data["available_budget"] == 50000.0
    assert data["total_cost"] <= 50000.0
    assert data["remaining_budget"] >= 0.0
    assert "recommended_controls" in data
    assert len(data["recommended_controls"]) > 0
    assert "disclaimer" in data


# ── Feature #6: Depth-Configurable Blast Radius ──────────────────────────────

def test_feature6_depth_configurable_blast_radius():
    payload = {
        "compromised_asset_id": "WS-ENG-04",
        "max_depth": 3,
    }
    res = client.post("/api/blast-radius", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["compromised_asset_id"] == "WS-ENG-04"
    assert data["max_depth_evaluated"] == 3
    assert "directly_reachable_assets" in data
    assert "indirectly_reachable_assets" in data
    assert "reachable_identities" in data
    assert "privilege_escalation_opportunities" in data
    assert "relationship_evidence" in data
    assert isinstance(data["relationship_evidence"], list)


# ── Feature #7: Attack Path Evidence Graph & Damage Detection ────────────────

def test_feature7_attack_path_evidence_and_damage():
    # Analyze paths with sort_by
    payload = {
        "entry_point_id": "WS-ENG-04",
        "target_id": "VAULT-BACKUP-01",
        "cutoff": 7,
        "sort_by": "effort",
    }
    res = client.post("/api/attack-paths/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_paths_found"] > 0
    first_path = data["paths"][0]

    # Verify per-edge transition evidence
    assert "transitions" in first_path
    assert len(first_path["transitions"]) > 0
    first_trans = first_path["transitions"][0]
    assert "reasons" in first_trans
    assert "evidence" in first_trans
    assert "network" in first_trans

    # Verify damage assessment & compromised area
    assert "damage_assessment" in first_path
    assert "compromised_area" in first_path
    assert "hop_by_hop_damage" in first_path
    assert "breached_zones" in first_path["compromised_area"]
    assert "collateral_assets" in first_path["compromised_area"]


# ── Feature #8: Attack Path Time Machine & Snapshots ─────────────────────────

def test_feature8_snapshots_and_time_machine():
    # 1. Create snapshot A
    res_a = client.post("/api/snapshots", json={"name": "Pre-Hardening Topology"})
    assert res_a.status_code == 200
    snap_a = res_a.json()
    assert "snapshot_id" in snap_a

    # 2. Create snapshot B
    res_b = client.post("/api/snapshots", json={"name": "Post-MFA Hardened Topology"})
    assert res_b.status_code == 200
    snap_b = res_b.json()
    assert "snapshot_id" in snap_b

    # 3. List snapshots
    res_list = client.get("/api/snapshots")
    assert res_list.status_code == 200
    snapshots = res_list.json()
    assert len(snapshots) >= 2

    # 4. Get specific snapshot
    res_get = client.get(f"/api/snapshots/{snap_a['snapshot_id']}")
    assert res_get.status_code == 200

    # 5. Compare snapshots
    diff_payload = {
        "snapshot_a_id": snap_a["snapshot_id"],
        "snapshot_b_id": snap_b["snapshot_id"],
    }
    res_diff = client.post("/api/snapshots/compare", json=diff_payload)
    assert res_diff.status_code == 200
    diff_data = res_diff.json()
    assert "comparison_id" in diff_data
    assert "natural_language_explanation" in diff_data


# ── Feature #9: Attack Path Resilience Score ─────────────────────────────────

def test_feature9_attack_path_resilience_score():
    res = client.get("/api/resilience")
    assert res.status_code == 200
    data = res.json()
    assert "resilience_score" in data
    assert 0.0 <= data["resilience_score"] <= 100.0
    assert "posture_rating" in data
    assert data["posture_rating"] in ["CRITICAL", "FRAGILE", "DEFENSIBLE", "HARDENED", "RESILIENT"]
    assert "factor_breakdown" in data
    factors = data["factor_breakdown"]
    assert "path_redundancy_score" in factors
    assert "control_density_score" in factors
    assert "chokepoint_mitigation_score" in factors
    assert "depth_defense_score" in factors
    assert "privilege_tiering_score" in factors
    assert "calculation_methodology" in data
    assert len(data["improvement_recommendations"]) > 0


# ── Feature #10: Deterministic Natural Language Security Queries ──────────────

def test_feature10_natural_language_queries():
    # Test reachability question
    res1 = client.post(
        "/api/queries/natural-language",
        json={"query": "Can an attacker reach the backup vault from engineering workstation?"},
    )
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["detected_intent"] == "REACHABILITY_CHECK"
    assert "VAULT-BACKUP-01" in d1["target_entities"]
    assert len(d1["deterministic_answer"]) > 0
    assert "supporting_metrics" in d1

    # Test what-if question
    res2 = client.post(
        "/api/queries/natural-language",
        json={"query": "What if we deploy MFA on domain admin?"},
    )
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["detected_intent"] == "WHAT_IF_QUERY"
    assert "MFA" in d2["deterministic_answer"]

    # Test blast radius question
    res3 = client.post(
        "/api/queries/natural-language",
        json={"query": "What is the blast radius if workstation WS-ENG-04 is compromised?"},
    )
    assert res3.status_code == 200
    d3 = res3.json()
    assert d3["detected_intent"] == "BLAST_RADIUS_QUERY"
    assert "blast radius" in d3["deterministic_answer"].lower()


# ── Feature #11: Simulation History Listing & Granular Path Retrieval ────────

def test_feature11_simulation_history_and_path_retrieval():
    # Run a simulation to populate history
    sim_res = client.post(
        "/api/simulations",
        json={
            "threat_vector_id": "THREAT-PHISH",
            "attacker_persona": "RANSOMWARE",
            "initial_foothold_id": "WS-ENG-04",
            "target_objective_id": "VAULT-BACKUP-01",
        },
    )
    assert sim_res.status_code == 200
    sim_id = sim_res.json()["simulation_id"]

    # 1. Retrieve all simulations
    hist_res = client.get("/api/simulations")
    assert hist_res.status_code == 200
    hist_list = hist_res.json()
    assert len(hist_list) > 0
    assert any(s["simulation_id"] == sim_id for s in hist_list)

    # 2. Retrieve attack paths for this simulation
    paths_res = client.get(f"/api/simulations/{sim_id}/attack-paths")
    assert paths_res.status_code == 200
    paths_data = paths_res.json()
    assert paths_data["total_paths"] > 0
    assert len(paths_data["paths"]) > 0

    # 3. Retrieve granular evidence for path
    path_id = paths_data["paths"][0]["path_id"]
    ev_res = client.get(f"/api/simulations/{sim_id}/attack-paths/{path_id}/evidence")
    assert ev_res.status_code == 200
    ev_data = ev_res.json()
    assert ev_data["path_id"] == path_id
    assert "transitions" in ev_data
    assert "damage_assessment" in ev_data
    assert "compromised_area" in ev_data
