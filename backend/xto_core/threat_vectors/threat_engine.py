import logging
from typing import Any, Dict, List, Optional
import networkx as nx
from app.schemas.threat import (
    ThreatVector,
    ThreatVectorType,
    ThreatAssessmentRequest,
    ThreatAssessmentResponse,
)
from xto_core.twin.security_twin import SecurityTwin
from xto_core.graph.security_graph import SecurityGraph
from xto_core.graph.path_engine import AttackPathEngine

logger = logging.getLogger(__name__)


class ThreatVectorEngine:
    """First-class Threat Vector Engine for XTO."""

    def __init__(self, twin: SecurityTwin):
        self.twin = twin
        self._catalog: Dict[str, ThreatVector] = {}
        self._init_catalog()

    def _init_catalog(self) -> None:
        vectors = [
            ThreatVector(
                id="THREAT-PHISH",
                name="Spearphishing Attachment / Link",
                category="Initial Access",
                entry_mechanism="Social engineering email payload delivered to corporate inbox with malicious macro/executable.",
                prerequisites=["Corporate email gateway bypass", "User execution of attachment", "Endpoint execution permitted"],
                attacker_capabilities=["PHISHING_DELIVERY", "USER_EXECUTION", "LOCAL_RECON"],
                relevant_techniques=["T1566.001", "T1566.002", "T1204.002", "T1059.001"],
                possible_initial_footholds=["WS-ENG-04", "WS-FIN-02"],
                possible_transitions=["CREDENTIAL_ACCESS", "LATERAL_MOVEMENT via SMB/RPC"],
                vulnerable_controls=["CTRL-EDR-01 (if behavioral heuristics disabled)", "Email Anti-Spam Sandbox"],
                severity="HIGH",
                description="Targets corporate employees with contextual invoice/HR payloads to gain initial foothold.",
                supporting_evidence_types=["EMAIL_HEADER_LOG", "EDR_PROCESS_SPAWN", "USER_INTERACTION_EVENT"],
            ),
            ThreatVector(
                id="THREAT-STOLEN-CREDS",
                name="Stolen Credentials / Password Spray",
                category="Credential Access",
                entry_mechanism="Authentication against exposed internal/external endpoints using credentials harvested from dark web dumps or memory.",
                prerequisites=["Valid username/hash pair", "Single-factor auth allowed or MFA fatigue exploit"],
                attacker_capabilities=["PASS_THE_HASH", "KERBEROAST", "CREDENTIAL_STUFFING"],
                relevant_techniques=["T1078.002", "T1110.003", "T1558.003", "T1003.001"],
                possible_initial_footholds=["VPN-GW-01", "WEB-SRV-01", "WS-ENG-04"],
                possible_transitions=["PRIVILEGE_ESCALATION", "REMOTE_EXECUTION"],
                vulnerable_controls=["CTRL-MFA-CORP (absence on internal protocols)", "Conditional Access Policies"],
                severity="CRITICAL",
                description="Leverages existing valid accounts to bypass perimeter defenses without generating exploit signatures.",
                supporting_evidence_types=["NTLM_AUTH_LOG", "KERBEROS_TGS_REQUEST", "LSASS_DUMP_ARTIFACT"],
            ),
            ThreatVector(
                id="THREAT-EXPOSED-VPN",
                name="Exposed VPN / Perimeter Gateway Exploit",
                category="External Remote Services",
                entry_mechanism="Direct exploitation of unpatched vulnerabilities on internet-facing SSL-VPN appliances.",
                prerequisites=["Publicly reachable VPN port :443", "Unpatched firmware (e.g. CVE-2024-21887)"],
                attacker_capabilities=["EXPLOIT_RCE", "NETWORK_SNIFFING", "PIVOT_INTERNAL"],
                relevant_techniques=["T1190", "T1133", "T1021.001"],
                possible_initial_footholds=["VPN-GW-01", "FW-EDGE-01"],
                possible_transitions=["NETWORK_REACHABILITY into Corporate LAN", "Direct Workstation RDP"],
                vulnerable_controls=["Perimeter Vulnerability Patch Management", "WAF / Geo-IP Blocking"],
                severity="CRITICAL",
                description="Exploits edge network gateway to gain unauthenticated direct route into internal DMZ and LAN.",
                supporting_evidence_types=["FIREWALL_CONN_LOG", "VPN_AUTH_BYPASS_ALERT", "ROOT_SHELL_TELEMETRY"],
            ),
            ThreatVector(
                id="THREAT-EXPOSED-SERVICE",
                name="Exposed Public Facing Service",
                category="Initial Access",
                entry_mechanism="Discovery and brute-force or exploitation of exposed ports (SSH, RDP, Web).",
                prerequisites=["Public IP reachability", "Weak or default authentication credentials"],
                attacker_capabilities=["PORT_SCANNING", "BRUTE_FORCE", "REMOTE_SHELL"],
                relevant_techniques=["T1190", "T1021.004", "T1110"],
                possible_initial_footholds=["WEB-SRV-01", "FW-EDGE-01"],
                possible_transitions=["LATERAL_MOVEMENT", "DMZ to App Server API bridge"],
                vulnerable_controls=["CTRL-WAF-01", "Network Access Control List"],
                severity="HIGH",
                description="Scans public range for open management services to establish reverse interactive C2.",
                supporting_evidence_types=["NETFLOW_BURST", "NMAP_FINGERPRINT", "FAILED_AUTH_CLUSTER"],
            ),
            ThreatVector(
                id="THREAT-VULN-APP",
                name="Vulnerable Application (Log4j / RCE)",
                category="Exploitation",
                entry_mechanism="Injecting malicious payloads into application web/API endpoints to trigger unauthenticated code execution.",
                prerequisites=["Public or LAN accessible HTTP endpoint", "Vulnerable component library present"],
                attacker_capabilities=["EXPLOIT_RCE", "IN_MEMORY_LOADER", "LOCAL_PRIVILEGE_ESCALATION"],
                relevant_techniques=["T1190", "T1059.004", "T1505.003"],
                possible_initial_footholds=["WEB-SRV-01", "APP-SRV-01"],
                possible_transitions=["Database connection extraction", "Domain Controller Kerberos ticket request"],
                vulnerable_controls=["CTRL-WAF-01", "Software Composition Analysis (SCA)"],
                severity="CRITICAL",
                description="Takes advantage of unpatched application layer vulnerabilities to execute arbitrary shellcode.",
                supporting_evidence_types=["HTTP_REQ_PAYLOAD", "OUTBOUND_LDAP_BURST", "JVM_SUBPROCESS_SPAWN"],
            ),
            ThreatVector(
                id="THREAT-INSIDER",
                name="Malicious / Compromised Insider",
                category="Privilege Abuse",
                entry_mechanism="Authorized employee abuse of existing credentials, network shares, and internal tooling.",
                prerequisites=["Valid corporate identity", "Physical or VPN access to internal LAN"],
                attacker_capabilities=["DATA_EXFILTRATION", "UNAUTHORIZED_DOWNLOAD", "LOCAL_RECON"],
                relevant_techniques=["T1078.004", "T1530", "T1567"],
                possible_initial_footholds=["WS-ENG-04", "WS-FIN-02"],
                possible_transitions=["Mass DB query", "Direct access to crown jewel repositories"],
                vulnerable_controls=["Data Loss Prevention (DLP)", "Privileged Access Management (PAM)"],
                severity="HIGH",
                description="Bypasses all perimeter security entirely by originating from authenticated internal endpoints.",
                supporting_evidence_types=["MASS_FILE_COPY", "UNUSUAL_ACCESS_HOURS", "USB_STORAGE_MOUNT"],
            ),
            ThreatVector(
                id="THREAT-SUPPLY-CHAIN",
                name="Software Supply Chain / CI/CD Tampering",
                category="Initial Access",
                entry_mechanism="Poisoning build artifacts, npm/pip dependencies, or developer workstation git remotes.",
                prerequisites=["Access to development pipeline", "Unsigned code deployment pipeline"],
                attacker_capabilities=["CODE_INJECTION", "BUILD_SERVER_TAKEOVER", "SECRET_EXTRACTION"],
                relevant_techniques=["T1195.002", "T1552.001", "T1609"],
                possible_initial_footholds=["WS-ENG-04", "CLOUD-K8S-01"],
                possible_transitions=["Cluster admin takeover", "Secret extraction into database"],
                vulnerable_controls=["Code Signing Verification", "Dependency Lockfile Verification"],
                severity="CRITICAL",
                description="Injects malicious backdoors directly into validated production deployment pipelines.",
                supporting_evidence_types=["GIT_COMMIT_ANOMALY", "PACKAGE_HASH_MISMATCH", "UNAUTHORIZED_PIPELINE_TRIGGER"],
            ),
            ThreatVector(
                id="THREAT-PRIV-ABUSE",
                name="Active Directory Privilege Escalation",
                category="Privilege Escalation",
                entry_mechanism="Abuse of misconfigured Active Directory ACLs, unconstrained delegation, or DCSync rights.",
                prerequisites=["Any authenticated domain user account", "Reachability to Domain Controller RPC :445"],
                attacker_capabilities=["DCSYNC", "KERBEROAST", "SHADOW_ADMIN_TAKEOVER"],
                relevant_techniques=["T1484", "T1003.006", "T1068"],
                possible_initial_footholds=["WS-ENG-04", "APP-SRV-01"],
                possible_transitions=["Tier-0 Domain Controller compromise", "Complete environment takeover"],
                vulnerable_controls=["Active Directory Tiering Model", "BloodHound ACL Hardening"],
                severity="CRITICAL",
                description="Leverages hidden permission loops in Active Directory to escalate from domain user to Enterprise Admin.",
                supporting_evidence_types=["RPC_REPLICATION_ALERT", "LDAP_GENERIC_ALL_QUERY", "KERBEROS_SPN_ENUM"],
            ),
            ThreatVector(
                id="THREAT-REMOTE-SERVICE",
                name="Remote Service Pivoting (WinRM / RDP)",
                category="Lateral Movement",
                entry_mechanism="Pivoting across internal subnets using administrative remote management protocols.",
                prerequisites=["Stolen administrator credentials", "Inbound TCP 3389/5985 unsegmented"],
                attacker_capabilities=["WINRM_EXEC", "RDP_TUNNEL", "FILELESS_EXECUTION"],
                relevant_techniques=["T1021.001", "T1021.002", "T1021.006"],
                possible_initial_footholds=["WS-ENG-04", "APP-SRV-01"],
                possible_transitions=["Workstation to Server lateral jumps"],
                vulnerable_controls=["Internal Subnet Micro-segmentation", "Jump Host / Bastion Enforcers"],
                severity="HIGH",
                description="Uses legitimate administrative utilities to travel between network zones unnoticed.",
                supporting_evidence_types=["WINRM_LOGON_TYPE_3", "RDP_SESSION_INITIATED", "POWERSHELL_REMOTING_TRACE"],
            ),
            ThreatVector(
                id="THREAT-CLOUD-EXPOSURE",
                name="Cloud Metadata / IAM Role Exploitation",
                category="Cloud Credential Theft",
                entry_mechanism="Querying cloud instance metadata service (IMDSv1) to acquire temporary IAM instance profile tokens.",
                prerequisites=["SSRF vulnerability or container breakout", "IMDSv1 enabled"],
                attacker_capabilities=["IMDS_TOKEN_THEFT", "AWS_API_ASSUME_ROLE", "S3_BUCKET_DUMP"],
                relevant_techniques=["T1552.005", "T1526", "T1530"],
                possible_initial_footholds=["CLOUD-K8S-01", "APP-SRV-01"],
                possible_transitions=["Cloud account compromise to internal on-prem DB"],
                vulnerable_controls=["IMDSv2 Enforced", "Least Privilege IAM Policies"],
                severity="HIGH",
                description="Leverages cloud identity tokens to pivot across hybrid-cloud infrastructures.",
                supporting_evidence_types=["IMDS_HTTP_GET", "ASSUME_ROLE_CALL", "CLOUDTRAIL_ANOMALY"],
            ),
            ThreatVector(
                id="THREAT-MISCONFIG",
                name="SMB Signing Disabled / NTLM Relay",
                category="Lateral Movement",
                entry_mechanism="Coercing authentication and relaying NTLM hashes to hosts with SMB signing disabled.",
                prerequisites=["SMB signing disabled on destination servers", "Local network broadcast presence"],
                attacker_capabilities=["NTLM_RELAY", "PETITPOTAM_COERCE", "MACHINE_ACCOUNT_TAKEOVER"],
                relevant_techniques=["T1557.001", "T1187", "T1212"],
                possible_initial_footholds=["WS-ENG-04", "WS-FIN-02"],
                possible_transitions=["Coerce DC auth -> Domain takeover"],
                vulnerable_controls=["Enforce SMB Signing", "Disable NTLMv1 / Extended Protection for Auth"],
                severity="CRITICAL",
                description="Abuses legacy NTLM authentication quirks to execute code without needing account passwords.",
                supporting_evidence_types=["LLMNR_POISONING_EVENT", "RELAY_SESSION_CREATED", "SMB_NO_SIGNING_FLAG"],
            ),
            ThreatVector(
                id="THREAT-AI-AGENT",
                name="AI / Autonomous Agent Exploitation",
                category="Emerging Threat",
                entry_mechanism="Indirect prompt injection or insecure tool execution in agentic pipelines.",
                prerequisites=["LLM / Agent service with privileged system tool access", "Unsanitized external inputs"],
                attacker_capabilities=["PROMPT_INJECTION", "AGENT_TOOL_HIJACK", "ARBITRARY_API_INVOCATION"],
                relevant_techniques=["T1059", "T1565", "T1499"],
                possible_initial_footholds=["WEB-SRV-01", "SIEM-SOC-01"],
                possible_transitions=["Execution of unauthorized admin actions via agent backend"],
                vulnerable_controls=["Prompt Guard / Input Filtering", "Strict Tool Capability Scoping"],
                severity="HIGH",
                description="Tricks automated AI agents into executing privileged operating system commands or querying sensitive data.",
                supporting_evidence_types=["INJECTION_PAYLOAD_MATCH", "UNEXPECTED_TOOL_INVOCATION", "POLICY_VIOLATION_TRACE"],
            ),
        ]
        for v in vectors:
            self._catalog[v.id] = v

    def get_all_vectors(self) -> List[ThreatVector]:
        return list(self._catalog.values())

    def get_vector(self, vector_id: str) -> Optional[ThreatVector]:
        return self._catalog.get(vector_id)

    def assess_threat(self, req: ThreatAssessmentRequest) -> ThreatAssessmentResponse:
        """Perform comprehensive threat vector assessment: 'What can this threat vector reach from this foothold?'"""
        vector = self.get_vector(req.threat_vector_id)
        if not vector:
            raise ValueError(f"Threat vector '{req.threat_vector_id}' not found")

        foothold = self.twin.get_asset(req.initial_foothold_id)
        if not foothold:
            raise ValueError(f"Foothold asset '{req.initial_foothold_id}' not found")

        sec_graph = SecurityGraph(self.twin)
        path_engine = AttackPathEngine(sec_graph)

        critical_assets = self.twin.get_critical_assets()
        reachable_critical = []
        total_paths = 0
        easiest_path = None
        min_effort = float("inf")

        for ca in critical_assets:
            paths = path_engine.find_all_attack_paths(req.initial_foothold_id, ca.id, cutoff=7)
            if paths:
                reachable_critical.append(ca.name)
                total_paths += len(paths)
                for p in paths:
                    if p["attacker_effort_score"] < min_effort:
                        min_effort = p["attacker_effort_score"]
                        easiest_path = [n["name"] for n in p["nodes"]]

        reachable_all_nodes = nx.descendants(sec_graph.nx_graph, req.initial_foothold_id)
        reachable_count = len(reachable_all_nodes)

        risk = "CRITICAL" if len(reachable_critical) >= 2 else ("HIGH" if reachable_critical else "MEDIUM")

        summary = (
            f"Adversary using '{vector.name}' starting from '{foothold.name}' ({foothold.ip_address}) "
            f"can traverse to {reachable_count} internal assets, directly threatening critical crown jewels: "
            f"{', '.join(reachable_critical) if reachable_critical else 'None'}. "
            f"Total viable critical paths discovered: {total_paths}."
        )

        return ThreatAssessmentResponse(
            threat_vector=vector,
            foothold_asset_id=foothold.id,
            foothold_asset_name=foothold.name,
            reachable_assets_count=reachable_count,
            critical_assets_reachable=reachable_critical,
            viable_attack_paths_count=total_paths,
            easiest_attack_path=easiest_path,
            vulnerable_controls_identified=vector.vulnerable_controls,
            risk_level=risk,
            summary=summary,
        )
