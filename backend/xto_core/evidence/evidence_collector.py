import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.schemas.evidence import EvidenceRecord, EpistemicStatus, EvidenceType


class EvidenceCollector:
    """Evidence-First Architecture Engine.
    Ensures every attack transition and control evaluation is backed by verified evidence
    tagged with strict epistemic status: FACT, ASSUMPTION, or INFERENCE.
    """

    def __init__(self):
        self._evidence_store: Dict[str, EvidenceRecord] = {}

    def record_evidence(
        self,
        source: str,
        evidence_type: EvidenceType,
        epistemic_status: EpistemicStatus,
        subject_asset_id: str,
        finding: str,
        target_asset_id: Optional[str] = None,
        confidence: float = 0.95,
        technical_details: Optional[Dict[str, Any]] = None,
        applicable_technique_id: Optional[str] = None,
        blocking_controls_tested: Optional[List[str]] = None,
    ) -> EvidenceRecord:
        now = datetime.now(timezone.utc).isoformat()
        ev_id = f"EV-{len(self._evidence_store) + 1:04d}"

        record = EvidenceRecord(
            id=ev_id,
            timestamp=now,
            source=source,
            evidence_type=evidence_type,
            epistemic_status=epistemic_status,
            confidence=confidence,
            subject_asset_id=subject_asset_id,
            target_asset_id=target_asset_id,
            finding=finding,
            technical_details=technical_details or {},
            applicable_technique_id=applicable_technique_id,
            blocking_controls_tested=blocking_controls_tested or [],
        )

        self._evidence_store[ev_id] = record
        return record

    def get_evidence(self, evidence_id: str) -> Optional[EvidenceRecord]:
        return self._evidence_store.get(evidence_id)

    def get_all_evidence(self) -> List[EvidenceRecord]:
        return list(self._evidence_store.values())

    def get_evidence_for_assets(self, source_id: str, target_id: str) -> List[EvidenceRecord]:
        return [
            ev for ev in self._evidence_store.values()
            if ev.subject_asset_id == source_id and ev.target_asset_id == target_id
        ]
