from xto_core.twin.security_twin import SecurityTwin
from xto_core.evidence.evidence_collector import EvidenceCollector
from xto_core.threat_vectors.threat_engine import ThreatVectorEngine
from xto_core.blast_radius.blast_engine import BlastRadiusEngine
from xto_core.prioritization.remediation_engine import RemediationPrioritizationEngine
from xto_core.synchronization.sync_engine import SynchronizationEngine
from xto_core.reasoning.xai_engine import XAIReasoningEngine
from xto_core.what_if.proof_generator import DecisionProofGenerator
from xto_core.simulation.simulator import AttackSimulator

# Singleton instances for XTO backend
_twin_instance = SecurityTwin()
_evidence_collector = EvidenceCollector()
_threat_engine = ThreatVectorEngine(_twin_instance)
_blast_engine = BlastRadiusEngine(_twin_instance)
_remediation_engine = RemediationPrioritizationEngine(_twin_instance)
_sync_engine = SynchronizationEngine(_twin_instance)
_xai_engine = XAIReasoningEngine()
_proof_generator = DecisionProofGenerator(_twin_instance)
_simulator = AttackSimulator(_twin_instance, _evidence_collector)


def get_twin() -> SecurityTwin:
    return _twin_instance


def get_evidence_collector() -> EvidenceCollector:
    return _evidence_collector


def get_threat_engine() -> ThreatVectorEngine:
    return _threat_engine


def get_blast_engine() -> BlastRadiusEngine:
    return _blast_engine


def get_remediation_engine() -> RemediationPrioritizationEngine:
    return _remediation_engine


def get_sync_engine() -> SynchronizationEngine:
    return _sync_engine


def get_xai_engine() -> XAIReasoningEngine:
    return _xai_engine


def get_proof_generator() -> DecisionProofGenerator:
    return _proof_generator


def get_simulator() -> AttackSimulator:
    return _simulator
