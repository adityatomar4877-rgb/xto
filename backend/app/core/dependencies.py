from xto_core.twin.security_twin import SecurityTwin
from xto_core.evidence.evidence_collector import EvidenceCollector
from xto_core.threat_vectors.threat_engine import ThreatVectorEngine
from xto_core.blast_radius.blast_engine import BlastRadiusEngine
from xto_core.prioritization.remediation_engine import RemediationPrioritizationEngine
from xto_core.synchronization.sync_engine import SynchronizationEngine
from xto_core.reasoning.xai_engine import XAIReasoningEngine
from xto_core.what_if.proof_generator import DecisionProofGenerator
from xto_core.simulation.simulator import AttackSimulator
from xto_core.mitre.framework_analyzer import MITREFrameworkAnalyzer
from xto_core.simulation.red_blue_engine import AdaptiveRedBlueEngine
from xto_core.prioritization.control_evaluator import ControlEffectivenessEvaluator
from xto_core.prioritization.budget_optimizer import SecurityBudgetOptimizer
from xto_core.synchronization.snapshot_comparator import SnapshotTimeMachine
from xto_core.resilience.resilience_engine import ResilienceScoringEngine
from xto_core.reasoning.nl_query_engine import NaturalLanguageQueryEngine
from xto_core.automation.audit_engine import AutonomousAuditEngine

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
_mitre_analyzer = MITREFrameworkAnalyzer(_twin_instance)
_red_blue_engine = AdaptiveRedBlueEngine(_twin_instance)
_control_evaluator = ControlEffectivenessEvaluator(_twin_instance)
_budget_optimizer = SecurityBudgetOptimizer(_twin_instance)
_snapshot_time_machine = SnapshotTimeMachine(_twin_instance)
_resilience_engine = ResilienceScoringEngine(_twin_instance)
_nl_query_engine = NaturalLanguageQueryEngine(_twin_instance)
_audit_engine = AutonomousAuditEngine(_twin_instance)


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


def get_mitre_analyzer() -> MITREFrameworkAnalyzer:
    return _mitre_analyzer


def get_red_blue_engine() -> AdaptiveRedBlueEngine:
    return _red_blue_engine


def get_control_evaluator() -> ControlEffectivenessEvaluator:
    return _control_evaluator


def get_budget_optimizer() -> SecurityBudgetOptimizer:
    return _budget_optimizer


def get_snapshot_time_machine() -> SnapshotTimeMachine:
    return _snapshot_time_machine


def get_resilience_engine() -> ResilienceScoringEngine:
    return _resilience_engine


def get_nl_query_engine() -> NaturalLanguageQueryEngine:
    return _nl_query_engine


def get_defense_sandbox():
    return _proof_generator.sandbox


def get_audit_engine() -> AutonomousAuditEngine:
    return _audit_engine



