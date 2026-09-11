import logging
from typing import Any, Dict, List, Optional, Set

from app.schemas.mitre import (
    MitreTechnique,
    MitreMitigation,
    TacticCoverage,
    MitrePostureReport,
    AssetMitreProfile,
)
from xto_core.twin.security_twin import SecurityTwin
from xto_core.mitre.mitre_catalog import (
    get_all_mitre_techniques,
    get_all_mitre_mitigations,
    get_mitre_technique,
    get_mitre_mitigation,
)

logger = logging.getLogger(__name__)

# Kill chain order for standard MITRE ATT&CK enterprise tactics
TACTIC_ORDER = [
    "Initial Access",
    "Execution",
    "Persistence",
    "Privilege Escalation",
    "Defense Evasion",
    "Credential Access",
    "Discovery",
    "Lateral Movement",
    "Collection",
    "Exfiltration",
    "Impact",
]


class MITREFrameworkAnalyzer:
    """Analytical engine performing dynamic MITRE ATT&CK analysis against the Digital Twin."""

    def __init__(self, twin: SecurityTwin):
        self.twin = twin

    def resolve_active_mitigations(self) -> Dict[str, MitreMitigation]:
        """Maps the Digital Twin's active and virtual security controls to standard MITRE Mitigations."""
        topo = self.twin.get_topology()
        active_controls = [c for c in topo.controls if c.is_active]
        catalog_mitigations = get_all_mitre_mitigations()

        active_map: Dict[str, MitreMitigation] = {}

        for m_data in catalog_mitigations:
            m_id = m_data["id"]
            mapped_types = set(m_data.get("mapped_control_types", []))

            covering_controls = []
            for ctrl in active_controls:
                ctrl_type_normalized = ctrl.type.upper()
                if any(m_type in ctrl_type_normalized or ctrl_type_normalized in m_type for m_type in mapped_types):
                    covering_controls.append(ctrl.id)

            active_map[m_id] = MitreMitigation(
                id=m_id,
                name=m_data["name"],
                description=m_data["description"],
                mapped_control_types=list(mapped_types),
                active_in_twin=len(covering_controls) > 0,
                covering_controls=covering_controls,
            )

        return active_map

    def analyze_enterprise_coverage(self) -> MitrePostureReport:
        """Evaluates all MITRE techniques against active digital twin controls to compute real-time coverage."""
        active_mitigations = self.resolve_active_mitigations()
        all_techniques = get_all_mitre_techniques()
        topo = self.twin.get_topology()

        # Group techniques by tactic
        tactic_groups: Dict[str, List[Dict[str, Any]]] = {t: [] for t in TACTIC_ORDER}
        for tech in all_techniques:
            tac = tech["tactic"]
            if tac not in tactic_groups:
                tactic_groups[tac] = []
            tactic_groups[tac].append(tech)

        tactic_coverages: List[TacticCoverage] = []
        total_mitigated_count = 0
        total_exposed_count = 0
        critical_blind_spots: List[MitreTechnique] = []

        # Find which assets are affected by specific techniques
        for tac in TACTIC_ORDER:
            tech_list = tactic_groups.get(tac, [])
            if not tech_list:
                continue

            blocked_in_tactic: List[str] = []
            exposed_in_tactic: List[str] = []

            for t in tech_list:
                t_id = t["id"]
                req_mitigations = t.get("mitigations", [])

                # Check if any required mitigation is currently active
                active_covers = [
                    active_mitigations[m_id].id
                    for m_id in req_mitigations
                    if m_id in active_mitigations and active_mitigations[m_id].active_in_twin
                ]

                # Map covering control IDs
                covering_ctrl_ids = []
                for m_id in active_covers:
                    covering_ctrl_ids.extend(active_mitigations[m_id].covering_controls)

                # Find affected assets in the digital twin
                affected_assets = []
                for a in topo.assets:
                    # If technique requires privilege or vulnerability, evaluate applicability
                    if t["required_privilege"] in ("LOCAL_ADMIN", "DOMAIN_ADMIN"):
                        if any("ADMIN" in i for i in a.identities) or a.criticality.value in ("HIGH", "CRITICAL"):
                            affected_assets.append(a.id)
                    elif t["id"] == "T1190":  # Public application exploit
                        if a.zone.value in ("DMZ", "INTERNET") or any(v for v in a.vulnerabilities):
                            affected_assets.append(a.id)
                    elif t["id"] == "T1021.002":  # SMB Admin shares
                        if "445" in str(a.services) or "SMB" in str(a.services) or "Windows" in a.os:
                            affected_assets.append(a.id)
                    else:
                        affected_assets.append(a.id)

                if active_covers:
                    status = "MITIGATED"
                    blocked_in_tactic.append(t_id)
                    total_mitigated_count += 1
                else:
                    status = "VULNERABLE"
                    exposed_in_tactic.append(t_id)
                    total_exposed_count += 1

                    # Flag high severity blind spots in lateral movement / credential access / impact
                    if tac in ("Credential Access", "Lateral Movement", "Impact", "Initial Access"):
                        critical_blind_spots.append(
                            MitreTechnique(
                                id=t_id,
                                name=t["name"],
                                tactic=tac,
                                description=t["description"],
                                mitigations=req_mitigations,
                                required_privilege=t.get("required_privilege", "STANDARD"),
                                applicable_platforms=t.get("applicable_platforms", []),
                                data_sources=t.get("data_sources", []),
                                status="VULNERABLE",
                                mitigating_controls=[],
                                affected_assets=affected_assets[:5],
                            )
                        )

            t_total = len(tech_list)
            t_mitigated = len(blocked_in_tactic)
            t_pct = round((t_mitigated / t_total) * 100.0, 1) if t_total > 0 else 0.0

            tactic_coverages.append(
                TacticCoverage(
                    tactic=tac,
                    total_techniques=t_total,
                    mitigated_count=t_mitigated,
                    vulnerable_count=len(exposed_in_tactic),
                    coverage_percent=t_pct,
                    blocked_techniques=blocked_in_tactic,
                    exposed_techniques=exposed_in_tactic,
                )
            )

        total_evaluated = len(all_techniques)
        overall_score = (
            round((total_mitigated_count / total_evaluated) * 100.0, 1) if total_evaluated > 0 else 0.0
        )

        # Generate top recommended mitigations based on exposed techniques
        recommended_mitigations: List[MitreMitigation] = []
        for m_id, mit in active_mitigations.items():
            if not mit.active_in_twin:
                recommended_mitigations.append(mit)

        return MitrePostureReport(
            posture_score=overall_score,
            total_techniques_evaluated=total_evaluated,
            total_mitigated=total_mitigated_count,
            total_exposed=total_exposed_count,
            total_active_mitigations=len([m for m in active_mitigations.values() if m.active_in_twin]),
            tactics_breakdown=tactic_coverages,
            critical_blind_spots=critical_blind_spots[:6],
            top_recommended_mitigations=recommended_mitigations[:5],
        )

    def get_full_matrix(self) -> List[Dict[str, Any]]:
        """Returns the full Enterprise MITRE Matrix organized by tactic with current defensive status."""
        active_mitigations = self.resolve_active_mitigations()
        all_techniques = get_all_mitre_techniques()
        topo = self.twin.get_topology()

        matrix = []
        for tac in TACTIC_ORDER:
            techs = [t for t in all_techniques if t["tactic"] == tac]
            tech_models = []

            for t in techs:
                req_mits = t.get("mitigations", [])
                active_covers = [
                    m_id
                    for m_id in req_mits
                    if m_id in active_mitigations and active_mitigations[m_id].active_in_twin
                ]

                covering_ctrls = []
                for m_id in active_covers:
                    covering_ctrls.extend(active_mitigations[m_id].covering_controls)

                status = "MITIGATED" if active_covers else "VULNERABLE"

                tech_models.append(
                    MitreTechnique(
                        id=t["id"],
                        name=t["name"],
                        tactic=tac,
                        description=t["description"],
                        mitigations=req_mits,
                        required_privilege=t.get("required_privilege", "STANDARD"),
                        applicable_platforms=t.get("applicable_platforms", []),
                        data_sources=t.get("data_sources", []),
                        status=status,
                        mitigating_controls=covering_ctrls,
                        affected_assets=[a.id for a in topo.assets if a.zone.value != "INTERNET"][:4],
                    )
                )

            matrix.append({
                "tactic": tac,
                "techniques_count": len(tech_models),
                "mitigated_count": len([tm for tm in tech_models if tm.status == "MITIGATED"]),
                "techniques": [tm.model_dump() for tm in tech_models],
            })

        return matrix

    def analyze_asset_profile(self, asset_id: str) -> Optional[AssetMitreProfile]:
        """Calculates asset-specific MITRE technique vulnerability and mitigation status."""
        asset = self.twin.get_asset(asset_id)
        if not asset:
            return None

        active_mitigations = self.resolve_active_mitigations()
        all_techniques = get_all_mitre_techniques()

        applicable_techs: List[MitreTechnique] = []
        mitigated: List[str] = []
        vulnerable: List[str] = []

        for t in all_techniques:
            # Check if technique is relevant to this asset's OS, services, or credentials
            applies = False
            if asset.os in t.get("applicable_platforms", []):
                applies = True
            elif "Windows" in asset.os and "Windows" in t.get("applicable_platforms", []):
                applies = True
            elif "Linux" in asset.os and "Linux" in t.get("applicable_platforms", []):
                applies = True

            # If asset has specific vulnerabilities or is a critical server
            if asset.vulnerabilities and any(v.exploitable_technique == t["id"] for v in asset.vulnerabilities):
                applies = True

            if not applies:
                continue

            # Check if this asset has covering controls
            req_mits = t.get("mitigations", [])
            covering_ctrl_ids = []
            for m_id in req_mits:
                if m_id in active_mitigations and active_mitigations[m_id].active_in_twin:
                    # Verify if control applies specifically to this asset or globally
                    for c_id in active_mitigations[m_id].covering_controls:
                        ctrl = self.twin.get_control(c_id)
                        if ctrl and (not ctrl.coverage_scope or asset.id in ctrl.coverage_scope or asset.zone.value in ctrl.coverage_scope):
                            covering_ctrl_ids.append(c_id)

            status = "MITIGATED" if covering_ctrl_ids else "VULNERABLE"
            if status == "MITIGATED":
                mitigated.append(t["id"])
            else:
                vulnerable.append(t["id"])

            applicable_techs.append(
                MitreTechnique(
                    id=t["id"],
                    name=t["name"],
                    tactic=t["tactic"],
                    description=t["description"],
                    mitigations=req_mits,
                    required_privilege=t.get("required_privilege", "STANDARD"),
                    applicable_platforms=t.get("applicable_platforms", []),
                    data_sources=t.get("data_sources", []),
                    status=status,
                    mitigating_controls=covering_ctrl_ids,
                    affected_assets=[asset.id],
                )
            )

        total = len(applicable_techs)
        coverage_pct = round((len(mitigated) / total) * 100.0, 1) if total > 0 else 0.0

        return AssetMitreProfile(
            asset_id=asset.id,
            asset_name=asset.name,
            zone=asset.zone.value,
            criticality=asset.criticality.value,
            applicable_techniques=applicable_techs,
            mitigated_techniques=mitigated,
            vulnerable_techniques=vulnerable,
            asset_coverage_percent=coverage_pct,
        )
