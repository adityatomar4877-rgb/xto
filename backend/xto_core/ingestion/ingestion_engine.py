import json
import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.schemas.lab import IngestionResponse, SupportedFormatInfo
from app.schemas.twin import Asset, CriticalityLevel, DigitalTwinTopology, Identity, Relationship, Vulnerability
from xto_core.graph.path_engine import AttackPathEngine
from xto_core.graph.security_graph import SecurityGraph
from xto_core.ingestion.scan_parser import BloodHoundParser, NessusParser, NmapParser
from xto_core.twin.security_twin import SecurityTwin
from xto_core.twin.seed_data import create_demo_topology

logger = logging.getLogger(__name__)


class IngestionEngine:
    """Enterprise Ingestion Engine for Real Scan Files & Telemetry.
    Transforms raw outputs from Nmap, Nessus, BloodHound, and native JSON
    into operational Digital Twin multigraph structures.
    """

    SUPPORTED_FORMATS = [
        SupportedFormatInfo(
            format_id="NMAP_XML",
            name="Nmap Network Discovery (XML)",
            extension=".xml",
            description="Imports real IP addresses, hostnames, OS fingerprinting, and open ports/services.",
            sample_available=True,
        ),
        SupportedFormatInfo(
            format_id="NESSUS_JSON",
            name="Nessus / Trivy Vulnerability Report (JSON)",
            extension=".json",
            description="Imports real CVE vulnerabilities, CVSS base scores, affected services, and MITRE tactics.",
            sample_available=True,
        ),
        SupportedFormatInfo(
            format_id="NESSUS_CSV",
            name="Nessus Vulnerability Export (CSV)",
            extension=".csv",
            description="Imports tabular vulnerability scan reports directly from Nessus / Tenable.io exports.",
            sample_available=True,
        ),
        SupportedFormatInfo(
            format_id="BLOODHOUND_JSON",
            name="BloodHound Active Directory Export (JSON)",
            extension=".json",
            description="Imports real Active Directory domain controllers, computers, domain admins, and trust delegations.",
            sample_available=True,
        ),
        SupportedFormatInfo(
            format_id="DIGITAL_TWIN_JSON",
            name="Native Digital Twin Inventory (JSON)",
            extension=".json",
            description="Direct custom infrastructure models with typed assets, network channels, and trust boundaries.",
            sample_available=True,
        ),
    ]

    def __init__(self, twin: SecurityTwin):
        self.twin = twin

    def get_supported_formats(self) -> List[SupportedFormatInfo]:
        return self.SUPPORTED_FORMATS

    def detect_format(self, content: str, filename: str) -> str:
        """Heuristically identifies the format of the uploaded scan file."""
        low_filename = filename.lower()
        snippet = content[:1500].strip()

        if snippet.startswith("<?xml") or "<nmaprun" in snippet:
            return "NMAP_XML"

        if low_filename.endswith(".csv") or ("Plugin ID" in snippet and "Host" in snippet):
            return "NESSUS_CSV"

        # Check JSON formats
        if snippet.startswith("{") or snippet.startswith("["):
            try:
                parsed = json.loads(content)
                if isinstance(parsed, dict):
                    if "computers" in parsed or "users" in parsed:
                        return "BLOODHOUND_JSON"
                    if "assets" in parsed and "relationships" in parsed:
                        return "DIGITAL_TWIN_JSON"
                    if "vulnerabilities" in parsed or "findings" in parsed or "NessusClientData_v2" in snippet:
                        return "NESSUS_JSON"
                elif isinstance(parsed, list):
                    if len(parsed) > 0 and isinstance(parsed[0], dict):
                        if "cve" in parsed[0] or "vulnerability_id" in parsed[0] or "cvss" in parsed[0]:
                            return "NESSUS_JSON"
            except Exception:
                pass

        if low_filename.endswith(".xml"):
            return "NMAP_XML"
        if low_filename.endswith(".csv"):
            return "NESSUS_CSV"
        return "DIGITAL_TWIN_JSON"

    def ingest(self, content: str, filename: str, mode: str = "MERGE") -> IngestionResponse:
        """Main ingestion pipeline."""
        now = datetime.now(timezone.utc).isoformat()
        fmt = self.detect_format(content, filename)
        mode = mode.upper()
        if mode not in ("MERGE", "REPLACE"):
            mode = "MERGE"

        imported_assets: List[Asset] = []
        imported_relationships: List[Relationship] = []
        imported_identities: List[Identity] = []
        vuln_count = 0

        # 1. Parse File Content based on Detected Format
        if fmt == "NMAP_XML":
            imported_assets, imported_relationships = NmapParser.parse_xml(content)
            vuln_count = sum(len(a.vulnerabilities) for a in imported_assets)

        elif fmt == "NESSUS_CSV":
            findings = NessusParser.parse_csv(content)
            vuln_count = len(findings)
            # Match findings to existing assets or create stub assets
            existing_assets_by_id = {a.id.upper(): a for a in self.twin.get_all_assets()}
            existing_assets_by_ip = {a.ip_address: a for a in self.twin.get_all_assets()}

            for host, vuln in findings:
                clean_host = host.strip()
                matched = existing_assets_by_ip.get(clean_host) or existing_assets_by_id.get(clean_host.upper())
                if matched:
                    # Append vulnerability to asset
                    matched.vulnerabilities.append(vuln)
                else:
                    # Create asset for host
                    asset_id = f"HOST-{clean_host.replace('.', '-')}"
                    asset = Asset(
                        id=asset_id,
                        name=clean_host,
                        type="SERVER",
                        zone="CORPORATE_LAN",
                        criticality=vuln.severity,
                        ip_address=clean_host if re.match(r"^\d+\.\d+\.\d+\.\d+$", clean_host) else "10.100.2.1",
                        os="Linux / Windows",
                        vulnerabilities=[vuln],
                        services=[vuln.affected_service],
                        criticality_score=float(vuln.cvss_score),
                    )
                    imported_assets.append(asset)
                    existing_assets_by_id[asset_id.upper()] = asset
                    existing_assets_by_ip[asset.ip_address] = asset

        elif fmt == "NESSUS_JSON":
            findings = NessusParser.parse_json(content)
            vuln_count = len(findings)
            existing_assets_by_id = {a.id.upper(): a for a in self.twin.get_all_assets()}
            existing_assets_by_ip = {a.ip_address: a for a in self.twin.get_all_assets()}

            for host, vuln in findings:
                clean_host = host.strip()
                matched = existing_assets_by_ip.get(clean_host) or existing_assets_by_id.get(clean_host.upper())
                if matched:
                    matched.vulnerabilities.append(vuln)
                else:
                    asset_id = f"HOST-{clean_host.replace('.', '-')}"
                    asset = Asset(
                        id=asset_id,
                        name=clean_host,
                        type="APPLICATION_SERVER" if "http" in vuln.affected_service.lower() else "SERVER",
                        zone="DMZ" if "web" in clean_host.lower() else "CORPORATE_LAN",
                        criticality=vuln.severity,
                        ip_address=clean_host if re.match(r"^\d+\.\d+\.\d+\.\d+$", clean_host) else "10.100.2.1",
                        vulnerabilities=[vuln],
                        services=[vuln.affected_service],
                        criticality_score=float(vuln.cvss_score),
                    )
                    imported_assets.append(asset)
                    existing_assets_by_id[asset_id.upper()] = asset
                    existing_assets_by_ip[asset.ip_address] = asset

        elif fmt == "BLOODHOUND_JSON":
            imported_assets, imported_identities, imported_relationships = BloodHoundParser.parse_json(content)

        elif fmt == "DIGITAL_TWIN_JSON":
            data = json.loads(content)
            for a_dict in data.get("assets", []):
                imported_assets.append(Asset(**a_dict))
            for r_dict in data.get("relationships", []):
                imported_relationships.append(Relationship(**r_dict))
            for i_dict in data.get("identities", []):
                imported_identities.append(Identity(**i_dict))
            vuln_count = sum(len(a.vulnerabilities) for a in imported_assets)

        # 2. Apply Mode: REPLACE vs MERGE
        current_topo = self.twin.get_topology()

        if mode == "REPLACE":
            # Preserve only external internet entry anchor if needed
            ext_anchor = next((a for a in current_topo.assets if a.id == "EXT-INTERNET"), None)
            new_assets = [ext_anchor] if ext_anchor else []
            for a in imported_assets:
                if not any(x.id == a.id for x in new_assets):
                    new_assets.append(a)

            current_topo.assets = new_assets
            current_topo.relationships = imported_relationships
            current_topo.identities = imported_identities
            current_topo.name = f"Live Imported Topology ({filename})"
            self.twin._refresh_indices()

        else:
            # MERGE mode
            existing_ids = {a.id for a in current_topo.assets}
            for a in imported_assets:
                if a.id not in existing_ids:
                    current_topo.assets.append(a)
                    existing_ids.add(a.id)

            existing_rel_ids = {r.id for r in current_topo.relationships}
            for r in imported_relationships:
                if r.id not in existing_rel_ids:
                    current_topo.relationships.append(r)
                    existing_rel_ids.add(r.id)

            existing_ident_ids = {i.id for i in current_topo.identities}
            for i in imported_identities:
                if i.id not in existing_ident_ids:
                    current_topo.identities.append(i)
                    existing_ident_ids.add(i.id)

            self.twin._refresh_indices()

        # 3. Create Immutable Snapshot
        snap_id = self.twin.create_snapshot(name=f"Ingestion from {filename} ({fmt})")

        # 4. Identify Crown Jewels & Viable Attack Paths
        crown_jewels = [
            a.id for a in current_topo.assets
            if a.criticality == CriticalityLevel.CRITICAL or a.criticality_score >= 8.5
        ]

        sec_graph = SecurityGraph(self.twin)
        path_engine = AttackPathEngine(sec_graph)
        paths_count = 0
        if crown_jewels and len(current_topo.assets) > 1:
            entry_id = "EXT-INTERNET" if any(a.id == "EXT-INTERNET" for a in current_topo.assets) else current_topo.assets[0].id
            for cj in crown_jewels[:3]:
                if entry_id != cj:
                    paths = path_engine.find_all_attack_paths(entry_id, cj, cutoff=6)
                    paths_count += len(paths)

        return IngestionResponse(
            status="SUCCESS",
            source_format=fmt,
            filename=filename,
            mode=mode,
            snapshot_id=snap_id,
            assets_imported=len(imported_assets),
            relationships_created=len(imported_relationships),
            vulnerabilities_ingested=vuln_count,
            identities_mapped=len(imported_identities),
            critical_crown_jewels_identified=crown_jewels,
            viable_attack_paths_count=paths_count,
            message=(
                f"Successfully ingested {filename} ({fmt}) in {mode} mode. "
                f"Populated {len(imported_assets)} assets, {len(imported_relationships)} relationships, "
                f"and {vuln_count} vulnerabilities into digital twin snapshot '{snap_id}'."
            ),
            timestamp=now,
        )

    def reset_to_default(self) -> Dict[str, Any]:
        """Restores the baseline corporate reference environment from seed data."""
        default_topo = create_demo_topology()
        self.twin._topology = default_topo
        self.twin._refresh_indices()
        snap_id = self.twin.create_snapshot(name="Restored Default Reference Topology")

        return {
            "status": "RESET_SUCCESSFUL",
            "snapshot_id": snap_id,
            "assets_count": len(default_topo.assets),
            "relationships_count": len(default_topo.relationships),
            "controls_count": len(default_topo.controls),
            "message": "Digital Twin reset to default corporate reference environment (12 assets, 17 relationships).",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
