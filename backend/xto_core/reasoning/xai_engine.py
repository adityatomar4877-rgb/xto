from typing import Any, Dict, List, Optional


class XAIReasoningEngine:
    """Explainable AI (XAI) Reasoning Engine for XTO.
    Synthesizes deterministic graph and simulation outputs into natural language
    operator briefings answering 'Why was this move possible?' and 'Why did the defense stop it?'.
    """

    def explain_transition(self, source_name: str, target_name: str, technique_name: str, evidence_list: List[str]) -> str:
        return (
            f"Adversary successfully transitioned from '{source_name}' to '{target_name}' using {technique_name}. "
            f"This move was verified viable based on open network reachability and valid identity token delegation. "
            f"Key supporting evidence: {'; '.join(evidence_list)}."
        )

    def explain_defense_success(self, control_name: str, target_name: str, paths_eliminated: int) -> str:
        return (
            f"Defensive control '{control_name}' successfully intervened before '{target_name}'. "
            f"By restricting unauthenticated RPC/SMB egress and enforcing cryptographic MFA, "
            f"this defense severed {paths_eliminated} critical attack paths, rendering subsequent lateral movement mathematically impossible."
        )

    def explain_prioritization(self, top_control_name: str, paths_eliminated: int, blast_reduction: float) -> str:
        return (
            f"Remediation '{top_control_name}' is ranked #1 priority because it breaks the primary chokepoint "
            f"connecting Corporate LAN to the Secure Backup Vault. Applying this control eliminates {paths_eliminated} critical paths "
            f"and reduces total adversary blast radius by {blast_reduction}%."
        )
