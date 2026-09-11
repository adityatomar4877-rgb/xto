import csv
import io
import json
import logging
import re
import xml.etree.ElementTree as ET
from typing import Any, Dict, List, Optional, Tuple

from app.schemas.twin import (
    Asset,
    AssetType,
    CriticalityLevel,
    Identity,
    PrivilegeLevel,
    Relationship,
    RelationshipType,
    SecurityControl,
    Vulnerability,
    ZoneType,
)

logger = logging.getLogger(__name__)


def map_cve_to_mitre(cve: str, desc: str, name: str) -> str:
    """Heuristic mapping from CVE & description to primary MITRE ATT&CK technique."""
    text = (cve + " " + desc + " " + name).lower()
    if "log4j" in text or "remote code execution" in text or "rce" in text:
        return "T1190"
    if "sql injection" in text or "sqli" in text:
        return "T1190"
    if "zerologon" in text or "elevation of privilege" in text or "privilege escalation" in text:
        return "T1068"
    if "credential" in text or "lsass" in text or "dump" in text or "ntlm" in text:
        return "T1003"
    if "smb" in text or "wmi" in text or "winrm" in text or "lateral" in text:
        return "T1021.002"
    if "rdp" in text:
        return "T1021.001"
    if "vpn" in text or "gateway" in text:
        return "T1133"
    if "ransomware" in text or "encrypt" in text:
        return "T1486"
    return "T1190"


class NmapParser:
    """Parses real Nmap XML (-oX) or JSON output files."""

    @staticmethod
    def parse_xml(xml_content: str) -> Tuple[List[Asset], List[Relationship]]:
        assets: List[Asset] = []
        relationships: List[Relationship] = []

        try:
            root = ET.fromstring(xml_content)
        except Exception as e:
            logger.error(f"Failed to parse Nmap XML: {e}")
            raise ValueError(f"Invalid Nmap XML format: {e}")

        # Gateway or scanner representation
        scanner_id = "EXT-INTERNET"

        for host_elem in root.findall("host"):
            status_elem = host_elem.find("status")
            if status_elem is not None and status_elem.get("state") != "up":
                continue

            # 1. IP Address
            ip = "0.0.0.0"
            for addr in host_elem.findall("address"):
                if addr.get("addrtype") in ("ipv4", "ipv6"):
                    ip = addr.get("addr", "0.0.0.0")
                    break

            # 2. Hostname
            hostname = ip
            hostnames_elem = host_elem.find("hostnames")
            if hostnames_elem is not None:
                first_h = hostnames_elem.find("hostname")
                if first_h is not None and first_h.get("name"):
                    hostname = first_h.get("name")

            # 3. OS Detection
            os_name = "Linux"
            os_elem = host_elem.find("os")
            if os_elem is not None:
                match = os_elem.find("osmatch")
                if match is not None and match.get("name"):
                    os_name = match.get("name")

            # 4. Open Ports & Services
            services_list: List[str] = []
            open_ports: List[Tuple[int, str, str]] = []  # (port, protocol, service_name)
            vulns: List[Vulnerability] = []

            ports_elem = host_elem.find("ports")
            if ports_elem is not None:
                for port_elem in ports_elem.findall("port"):
                    state = port_elem.find("state")
                    if state is None or state.get("state") != "open":
                        continue

                    port_id = int(port_elem.get("portid", 0))
                    protocol = port_elem.get("protocol", "tcp").upper()
                    srv_elem = port_elem.find("service")
                    srv_name = srv_elem.get("name", "unknown") if srv_elem is not None else "unknown"
                    product = srv_elem.get("product", "") if srv_elem is not None else ""
                    version = srv_elem.get("version", "") if srv_elem is not None else ""

                    display_srv = f"{srv_name} :{port_id}"
                    if product:
                        display_srv += f" ({product} {version})".strip()
                    services_list.append(display_srv)
                    open_ports.append((port_id, protocol, srv_name))

                    # Check script elements for CVE vulnerabilities
                    for script in port_elem.findall("script"):
                        output = script.get("output", "")
                        cve_matches = re.findall(r"CVE-\d{4}-\d{4,7}", output)
                        for cve in set(cve_matches):
                            vulns.append(
                                Vulnerability(
                                    cve=cve,
                                    name=f"Vulnerability in {product or srv_name}",
                                    severity=CriticalityLevel.CRITICAL if "9." in output or "10." in output else CriticalityLevel.HIGH,
                                    cvss_score=9.0 if "9." in output or "10." in output else 7.5,
                                    affected_service=f"{srv_name} :{port_id}",
                                    exploitable_technique=map_cve_to_mitre(cve, output, srv_name),
                                    patch_available=True,
                                    description=output[:200],
                                )
                            )

            # 5. Asset ID and Type Classification
            clean_host = re.sub(r"[^a-zA-Z0-9_\-]", "-", hostname).upper()
            asset_id = f"HOST-{clean_host}" if not clean_host.startswith("HOST-") else clean_host

            ports_set = {p[0] for p in open_ports}
            if 88 in ports_set or 389 in ports_set or "domain controller" in os_name.lower():
                asset_type = AssetType.DOMAIN_CONTROLLER
                zone = ZoneType.SECURE_TIER
                crit = CriticalityLevel.CRITICAL
                crit_score = 9.8
            elif 5432 in ports_set or 3306 in ports_set or 1433 in ports_set or 1521 in ports_set:
                asset_type = AssetType.DATABASE
                zone = ZoneType.SECURE_TIER
                crit = CriticalityLevel.CRITICAL
                crit_score = 9.0
            elif 443 in ports_set or 80 in ports_set or 8080 in ports_set:
                asset_type = AssetType.APPLICATION_SERVER
                zone = ZoneType.DMZ if ip.startswith("192.168.10.") or "web" in hostname.lower() else ZoneType.CORPORATE_LAN
                crit = CriticalityLevel.HIGH
                crit_score = 7.5
            elif "windows" in os_name.lower() and "server" not in os_name.lower():
                asset_type = AssetType.WORKSTATION
                zone = ZoneType.CORPORATE_LAN
                crit = CriticalityLevel.MEDIUM
                crit_score = 5.0
            elif "router" in hostname.lower() or "firewall" in hostname.lower():
                asset_type = AssetType.FIREWALL
                zone = ZoneType.DMZ
                crit = CriticalityLevel.HIGH
                crit_score = 8.0
            else:
                asset_type = AssetType.SERVER
                zone = ZoneType.CORPORATE_LAN
                crit = CriticalityLevel.MEDIUM
                crit_score = 6.0

            asset = Asset(
                id=asset_id,
                name=hostname,
                type=asset_type,
                zone=zone,
                criticality=crit,
                ip_address=ip,
                os=os_name,
                department="Imported Infrastructure",
                services=services_list,
                vulnerabilities=vulns,
                criticality_score=crit_score,
            )
            assets.append(asset)

            # 6. Generate Ingress Relationships for open services
            for port_id, proto, srv_name in open_ports:
                rel_id = f"REL-NMAP-{asset_id}-{port_id}"
                relationships.append(
                    Relationship(
                        id=rel_id,
                        source_id=scanner_id,
                        target_id=asset_id,
                        type=RelationshipType.NETWORK_REACHABILITY,
                        protocol=proto,
                        port=port_id,
                        properties={"service": srv_name, "discovery": "Nmap Port Scan"},
                    )
                )

        return assets, relationships


class NessusParser:
    """Parses real Nessus CSV or JSON vulnerability export reports."""

    @staticmethod
    def parse_csv(csv_content: str) -> List[Tuple[str, Vulnerability]]:
        findings: List[Tuple[str, Vulnerability]] = []
        reader = csv.DictReader(io.StringIO(csv_content))

        for row in reader:
            # Handle standard Nessus CSV columns
            host = row.get("Host") or row.get("IP Address") or row.get("Target") or ""
            if not host:
                continue

            cve = row.get("CVE", "")
            if not cve or not re.match(r"CVE-\d{4}-\d{4,7}", cve):
                cve_match = re.search(r"CVE-\d{4}-\d{4,7}", row.get("Description", "") + " " + row.get("Synopsis", ""))
                cve = cve_match.group(0) if cve_match else "CVE-GENERIC-RISK"

            name = row.get("Name") or row.get("Plugin Name") or "Security Flaw"
            desc = row.get("Description") or row.get("Synopsis") or ""
            port_str = row.get("Port", "0")
            port = int(port_str) if port_str.isdigit() else 0
            proto = row.get("Protocol", "TCP").upper()
            svc = row.get("Service") or f"Port {port}/{proto}"

            cvss_str = row.get("CVSS v3.0 Base Score") or row.get("CVSS") or row.get("Score", "7.5")
            try:
                cvss_score = float(cvss_str)
            except ValueError:
                cvss_score = 7.5

            risk = (row.get("Risk") or row.get("Severity") or "High").upper()
            if cvss_score >= 9.0 or "CRITICAL" in risk:
                crit = CriticalityLevel.CRITICAL
            elif cvss_score >= 7.0 or "HIGH" in risk:
                crit = CriticalityLevel.HIGH
            elif cvss_score >= 4.0 or "MEDIUM" in risk:
                crit = CriticalityLevel.MEDIUM
            else:
                crit = CriticalityLevel.LOW

            mitre_tech = map_cve_to_mitre(cve, desc, name)

            vuln = Vulnerability(
                cve=cve,
                name=name,
                severity=crit,
                cvss_score=cvss_score,
                affected_service=svc,
                exploitable_technique=mitre_tech,
                patch_available=bool(row.get("Solution", "Available")),
                description=desc[:240],
            )
            findings.append((host, vuln))

        return findings

    @staticmethod
    def parse_json(json_content: str) -> List[Tuple[str, Vulnerability]]:
        findings: List[Tuple[str, Vulnerability]] = []
        data = json.loads(json_content)

        # Support both Nessus JSON export and Trivy / generic vulnerability JSON
        items = []
        if isinstance(data, list):
            items = data
        elif isinstance(data, dict):
            items = data.get("vulnerabilities") or data.get("findings") or data.get("reports") or [data]

        for item in items:
            host = item.get("host") or item.get("target") or item.get("ip") or "127.0.0.1"
            cve = item.get("cve") or item.get("cve_id") or item.get("vulnerability_id") or "CVE-2024-DEFENSE"
            name = item.get("name") or item.get("title") or "Vulnerability"
            desc = item.get("description") or ""
            cvss = float(item.get("cvss_score") or item.get("cvss") or 7.5)
            svc = item.get("affected_service") or item.get("service") or item.get("package") or "Default Service"

            crit = CriticalityLevel.CRITICAL if cvss >= 9.0 else (CriticalityLevel.HIGH if cvss >= 7.0 else CriticalityLevel.MEDIUM)
            mitre_tech = item.get("exploitable_technique") or map_cve_to_mitre(cve, desc, name)

            vuln = Vulnerability(
                cve=cve,
                name=name,
                severity=crit,
                cvss_score=cvss,
                affected_service=svc,
                exploitable_technique=mitre_tech,
                patch_available=item.get("patch_available", True),
                description=desc[:240],
            )
            findings.append((host, vuln))

        return findings


class BloodHoundParser:
    """Parses real BloodHound Active Directory JSON exports (computers, users, sessions)."""

    @staticmethod
    def parse_json(json_content: str) -> Tuple[List[Asset], List[Identity], List[Relationship]]:
        assets: List[Asset] = []
        identities: List[Identity] = []
        relationships: List[Relationship] = []

        data = json.loads(json_content)

        # 1. Computers
        computers = data.get("computers") or data.get("data") or []
        for c in computers:
            props = c.get("Properties") or c
            name = props.get("name") or props.get("samaccountname") or "AD-COMPUTER"
            cid = f"AD-{re.sub(r'[^a-zA-Z0-9_-]', '-', name).upper()}"
            os_name = props.get("operatingsystem") or "Windows Server 2022"
            is_dc = bool(props.get("primarygroupid") == 516 or "domain controller" in os_name.lower() or "DC-" in cid)

            asset = Asset(
                id=cid,
                name=name,
                type=AssetType.DOMAIN_CONTROLLER if is_dc else AssetType.WORKSTATION,
                zone=ZoneType.SECURE_TIER if is_dc else ZoneType.CORPORATE_LAN,
                criticality=CriticalityLevel.CRITICAL if is_dc else CriticalityLevel.MEDIUM,
                ip_address=props.get("ip_address") or "10.100.1.50",
                os=os_name,
                department="Active Directory Domain",
                services=["LDAP :389", "Kerberos :88", "SMB :445"] if is_dc else ["SMB :445", "RDP :3389"],
                criticality_score=10.0 if is_dc else 5.0,
            )
            assets.append(asset)

        # 2. Users & Admins
        users = data.get("users") or []
        for u in users:
            uprops = u.get("Properties") or u
            uname = uprops.get("name") or uprops.get("samaccountname") or "AD-User"
            uid = f"ID-{re.sub(r'[^a-zA-Z0-9_-]', '-', uname).upper()}"
            admin_count = uprops.get("admincount", 0)

            identity = Identity(
                id=uid,
                name=uname,
                type="ADMIN" if admin_count == 1 else "USER",
                role="Domain Administrator" if admin_count == 1 else "Domain Member",
                privilege_level=PrivilegeLevel.DOMAIN_ADMIN if admin_count == 1 else PrivilegeLevel.STANDARD,
                accessible_assets=[a.id for a in assets],
                mfa_enabled=False,
            )
            identities.append(identity)

        # 3. Active Directory Relationships
        relations = data.get("relationships") or data.get("edges") or []
        for r in relations:
            src = r.get("source") or r.get("from")
            tgt = r.get("target") or r.get("to")
            rel_type_str = (r.get("type") or r.get("edge_name") or "Trust").upper()

            if not src or not tgt:
                continue

            rel_type = RelationshipType.PRIVILEGE
            if "SESSION" in rel_type_str:
                rel_type = RelationshipType.SESSION
            elif "KERBEROAS" in rel_type_str:
                rel_type = RelationshipType.CREDENTIAL_ACCESS
            elif "EXEC" in rel_type_str or "RDP" in rel_type_str:
                rel_type = RelationshipType.REMOTE_EXECUTION

            relationships.append(
                Relationship(
                    id=f"REL-AD-{src}-{tgt}-{len(relationships)}",
                    source_id=src,
                    target_id=tgt,
                    type=rel_type,
                    protocol="TCP",
                    port=445,
                    properties={"ad_relation": rel_type_str},
                )
            )

        return assets, identities, relationships
