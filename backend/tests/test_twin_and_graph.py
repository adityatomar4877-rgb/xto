import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from xto_core.twin.security_twin import SecurityTwin
from xto_core.graph.security_graph import SecurityGraph
from xto_core.graph.path_engine import AttackPathEngine
from xto_core.blast_radius.blast_engine import BlastRadiusEngine
from xto_core.threat_vectors.threat_engine import ThreatVectorEngine
from app.schemas.threat import ThreatAssessmentRequest


def test_digital_twin_topology():
    twin = SecurityTwin()
    topo = twin.get_topology()
    assert len(topo.assets) >= 12
    assert len(topo.identities) >= 6
    assert len(topo.relationships) >= 12
    assert len(topo.controls) >= 4

    # Critical assets check
    crit_assets = twin.get_critical_assets()
    crit_names = [a.name for a in crit_assets]
    assert any("Domain Controller" in n for n in crit_names)
    assert any("Backup" in n for n in crit_names)
    assert any("Database" in n for n in crit_names)


def test_security_graph_and_paths():
    twin = SecurityTwin()
    sec_graph = SecurityGraph(twin)
    path_engine = AttackPathEngine(sec_graph)

    # Find paths from Employee Workstation (WS-ENG-04) to Backup Vault (VAULT-BACKUP-01)
    paths = path_engine.find_all_attack_paths("WS-ENG-04", "VAULT-BACKUP-01", cutoff=6)
    assert len(paths) > 0, "Should find viable paths to crown jewel backup vault"

    # Verify chokepoints
    chokepoints = path_engine.find_chokepoints("WS-ENG-04", "VAULT-BACKUP-01")
    assert len(chokepoints) > 0
    # DC-CORP-01 or APP-SRV-01 should be a top chokepoint
    cp_ids = [cp["asset_id"] for cp in chokepoints]
    assert "DC-CORP-01" in cp_ids or "APP-SRV-01" in cp_ids


def test_blast_radius():
    twin = SecurityTwin()
    blast_engine = BlastRadiusEngine(twin)

    res = blast_engine.calculate_blast_radius("WS-ENG-04")
    assert res["direct_impact_count"] >= 2
    assert res["total_blast_radius_percent"] > 20.0
    assert len(res["critical_crown_jewels_threatened"]) >= 1


def test_threat_assessment():
    twin = SecurityTwin()
    threat_engine = ThreatVectorEngine(twin)

    req = ThreatAssessmentRequest(
        threat_vector_id="THREAT-PHISH",
        initial_foothold_id="WS-ENG-04",
        attacker_persona="RANSOMWARE",
    )
    assessment = threat_engine.assess_threat(req)
    assert assessment.reachable_assets_count > 3
    assert len(assessment.critical_assets_reachable) >= 2
    assert assessment.risk_level in ("HIGH", "CRITICAL")
