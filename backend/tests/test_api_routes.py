import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ONLINE"
    assert data["assets_loaded"] >= 12


def test_api_twin():
    res = client.get("/api/twin")
    assert res.status_code == 200
    data = res.json()
    assert "assets" in data
    assert "relationships" in data


def test_api_threat_vectors():
    res = client.get("/api/threat-vectors")
    assert res.status_code == 200
    vectors = res.json()
    assert len(vectors) >= 10


def test_api_attackers():
    res = client.get("/api/attackers")
    assert res.status_code == 200
    profiles = res.json()
    assert len(profiles) >= 5


def test_api_attack_paths():
    res = client.get("/api/attack-paths?entry_point_id=WS-ENG-04&target_id=VAULT-BACKUP-01")
    assert res.status_code == 200
    data = res.json()
    assert data["total_paths_found"] > 0
    assert len(data["chokepoints"]) > 0


def test_api_blast_radius():
    res = client.get("/api/blast-radius/WS-ENG-04")
    assert res.status_code == 200
    data = res.json()
    assert data["total_blast_radius_percent"] > 0


def test_api_what_if():
    payload = {
        "threat_vector_id": "THREAT-PHISH",
        "attacker_persona": "RANSOMWARE",
        "initial_foothold_id": "WS-ENG-04",
        "target_objective_id": "VAULT-BACKUP-01",
        "defenses": [
            {
                "id": "DEF-01",
                "control_type": "SEGMENT_NETWORK",
                "name": "Air-Gap Backup Vault",
                "target_scope": ["VAULT-BACKUP-01"],
                "is_enabled": True
            }
        ]
    }
    res = client.post("/api/what-if", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "decision_proof" in data
    assert data["decision_proof"]["verdict"] == "PROVEN_DEFENSE_SUCCESS"


def test_api_remediation_priorities():
    res = client.get("/api/remediation/priorities")
    assert res.status_code == 200
    priorities = res.json()
    assert len(priorities) >= 5
    assert priorities[0]["rank"] == 1


def test_api_evidence():
    res = client.get("/api/evidence")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_api_mitre():
    res = client.get("/api/mitre/techniques")
    assert res.status_code == 200
    assert len(res.json()) >= 8
