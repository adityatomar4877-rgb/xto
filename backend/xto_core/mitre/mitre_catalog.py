from typing import Any, Dict, List, Optional


MITRE_MITIGATIONS: List[Dict[str, Any]] = [
    {
        "id": "M1030",
        "name": "Network Segmentation",
        "description": "Architect sections of the network to isolate critical systems, functions, or resources with internal firewalls and VLAN ACLs.",
        "mapped_control_types": ["NETWORK_SEGMENTATION", "FIREWALL", "MICRO_SEGMENTATION"],
    },
    {
        "id": "M1032",
        "name": "Multi-factor Authentication",
        "description": "Require two or more authentication factors such as out-of-band tokens or hardware security keys (FIDO2) for access.",
        "mapped_control_types": ["MFA", "FIDO2", "HARDWARE_TOKEN"],
    },
    {
        "id": "M1049",
        "name": "Antivirus/Antimalware & EDR",
        "description": "Deploy automated behavioral endpoint detection and response heuristics to identify and quarantine malicious code.",
        "mapped_control_types": ["EDR", "ANTIVIRUS", "ENDPOINT_PROTECTION"],
    },
    {
        "id": "M1026",
        "name": "Privileged Account Management",
        "description": "Manage the creation, modification, use, and permissions of privileged accounts, enforcing least privilege and credential hygiene.",
        "mapped_control_types": ["LEAST_PRIVILEGE", "PAM", "TIERING_MODEL"],
    },
    {
        "id": "M1027",
        "name": "Password Policies",
        "description": "Set and enforce password complexity, history, and automated rotation policies to reduce credential stuffing efficacy.",
        "mapped_control_types": ["PASSWORD_POLICY", "CREDENTIAL_HYGIENE"],
    },
    {
        "id": "M1051",
        "name": "Update Software",
        "description": "Perform timely patching of operating systems, third-party software, libraries, and firmware to remediate known vulnerabilities.",
        "mapped_control_types": ["VULNERABILITY_PATCH", "PATCHING", "SOFTWARE_UPDATE"],
    },
    {
        "id": "M1053",
        "name": "Data Backup",
        "description": "Take regular, verified, and isolated/immutable offline or air-gapped data backups to protect against ransomware disruption.",
        "mapped_control_types": ["BACKUP", "AIR_GAP_BACKUP", "IMMUTABLE_STORAGE"],
    },
    {
        "id": "M1038",
        "name": "Execution Prevention",
        "description": "Block execution of unauthorized code or scripts through application control policies such as AppLocker or WDAC.",
        "mapped_control_types": ["APPLOCKER", "EXECUTION_PREVENTION", "HOST_ISOLATION"],
    },
    {
        "id": "M1048",
        "name": "Application Isolation",
        "description": "Restrict execution of untrusted applications to containers, sandboxes, or virtual machines.",
        "mapped_control_types": ["SANDBOX", "CONTAINER_ISOLATION"],
    },
    {
        "id": "M1035",
        "name": "Limit Access to Resource Over Network",
        "description": "Prevent access to internal administrative protocols (SMB, RDP, WinRM) from unauthorized subnets or internet gateways.",
        "mapped_control_types": ["NETWORK_SEGMENTATION", "IP_WHITELIST", "BASTION_HOST"],
    },
    {
        "id": "M1050",
        "name": "Exploit Protection",
        "description": "Deploy Web Application Firewalls (WAF), memory protection (DEP/ASLR), or exploit mitigation toolkits.",
        "mapped_control_types": ["WAF", "EXPLOIT_PROTECTION"],
    },
]


MITRE_TECHNIQUES: List[Dict[str, Any]] = [
    # ── Initial Access ──────────────────────────────────────────────────────────
    {
        "id": "T1566.001",
        "name": "Spearphishing Attachment",
        "tactic": "Initial Access",
        "description": "Adversaries send spearphishing emails with malicious attachments to gain code execution.",
        "mitigations": ["M1049", "M1038", "M1048"],
        "required_privilege": "STANDARD",
        "applicable_platforms": ["Windows", "macOS", "Linux"],
        "data_sources": ["File creation", "Process creation", "Email Gateway logs"],
    },
    {
        "id": "T1190",
        "name": "Exploit Public-Facing Application",
        "tactic": "Initial Access",
        "description": "Exploitation of vulnerabilities in internet-accessible software or appliances (e.g. SSL-VPN gateways, Web Apps).",
        "mitigations": ["M1051", "M1050", "M1048", "M1030"],
        "required_privilege": "STANDARD",
        "applicable_platforms": ["Windows", "Linux", "Network appliances"],
        "data_sources": ["Application logs", "Network traffic", "Web server access logs"],
    },
    {
        "id": "T1078.002",
        "name": "Valid Accounts: Domain Accounts",
        "tactic": "Initial Access",
        "description": "Adversaries obtain and abuse legitimate credentials of enterprise domain accounts to blend into normal traffic.",
        "mitigations": ["M1032", "M1027", "M1026"],
        "required_privilege": "STANDARD",
        "applicable_platforms": ["Windows", "Active Directory"],
        "data_sources": ["Active Directory authentication", "Logon sessions"],
    },
    {
        "id": "T1133",
        "name": "External Remote Services",
        "tactic": "Initial Access",
        "description": "Adversaries leverage exposed VPN, Citrix, or RDP endpoints without MFA to establish footholds.",
        "mitigations": ["M1032", "M1035", "M1030"],
        "required_privilege": "STANDARD",
        "applicable_platforms": ["Windows", "Linux"],
        "data_sources": ["VPN logs", "Remote service authentication"],
    },

    # ── Execution ───────────────────────────────────────────────────────────────
    {
        "id": "T1059.001",
        "name": "Command and Scripting: PowerShell",
        "tactic": "Execution",
        "description": "Adversaries abuse PowerShell commands and scripts to execute payloads and conduct discovery.",
        "mitigations": ["M1038", "M1049", "M1026"],
        "required_privilege": "STANDARD",
        "applicable_platforms": ["Windows"],
        "data_sources": ["Script Block Logging (Event 4104)", "Process Creation (4688)"],
    },
    {
        "id": "T1047",
        "name": "Windows Management Instrumentation (WMI)",
        "tactic": "Execution",
        "description": "Adversaries abuse WMI to execute malicious commands and scripts remotely across internal systems.",
        "mitigations": ["M1038", "M1030", "M1026"],
        "required_privilege": "LOCAL_ADMIN",
        "applicable_platforms": ["Windows"],
        "data_sources": ["WMI-Activity logs", "Network connection on port 135"],
    },
    {
        "id": "T1204.002",
        "name": "User Execution: Malicious File",
        "tactic": "Execution",
        "description": "Adversaries rely on users opening an executable, macro-enabled office doc, or script.",
        "mitigations": ["M1049", "M1038", "M1048"],
        "required_privilege": "STANDARD",
        "applicable_platforms": ["Windows", "macOS", "Linux"],
        "data_sources": ["Process creation", "File modification"],
    },

    # ── Persistence ────────────────────────────────────────────────────────────
    {
        "id": "T1053.005",
        "name": "Scheduled Task/Job: Scheduled Task",
        "tactic": "Persistence",
        "description": "Adversaries abuse Windows Task Scheduler to execute programs at system startup or regular intervals.",
        "mitigations": ["M1026", "M1038", "M1049"],
        "required_privilege": "LOCAL_ADMIN",
        "applicable_platforms": ["Windows"],
        "data_sources": ["Task Scheduler Operational logs", "Registry modifications"],
    },
    {
        "id": "T1543.003",
        "name": "Create or Modify System Process: Windows Service",
        "tactic": "Persistence",
        "description": "Adversaries install or reconfigure Windows services to maintain persistent remote execution as SYSTEM.",
        "mitigations": ["M1026", "M1049", "M1038"],
        "required_privilege": "LOCAL_ADMIN",
        "applicable_platforms": ["Windows"],
        "data_sources": ["Service creation Event 7045", "Registry services key"],
    },

    # ── Privilege Escalation ───────────────────────────────────────────────────
    {
        "id": "T1068",
        "name": "Exploitation for Privilege Escalation",
        "tactic": "Privilege Escalation",
        "description": "Adversaries exploit software or kernel vulnerabilities to elevate from standard user to SYSTEM or Domain Admin.",
        "mitigations": ["M1051", "M1026", "M1050"],
        "required_privilege": "STANDARD",
        "applicable_platforms": ["Windows", "Linux"],
        "data_sources": ["Crash dump", "Kernel logs", "Privilege assigned Event 4672"],
    },
    {
        "id": "T1484",
        "name": "Domain Policy Modification: Group Policy",
        "tactic": "Privilege Escalation",
        "description": "Adversaries alter Active Directory Group Policy Objects (GPOs) to push malicious payloads across all domain endpoints.",
        "mitigations": ["M1026", "M1032"],
        "required_privilege": "DOMAIN_ADMIN",
        "applicable_platforms": ["Windows", "Active Directory"],
        "data_sources": ["GPO changes Event 5136", "SYSVOL folder audit"],
    },

    # ── Defense Evasion ────────────────────────────────────────────────────────
    {
        "id": "T1562.001",
        "name": "Impair Defenses: Disable or Modify Tools",
        "tactic": "Defense Evasion",
        "description": "Adversaries disable security software (Windows Defender, EDR agents, Sysmon) or uninstall telemetry drivers.",
        "mitigations": ["M1026", "M1049"],
        "required_privilege": "LOCAL_ADMIN",
        "applicable_platforms": ["Windows", "Linux"],
        "data_sources": ["Service stop events", "Tamper Protection alerts"],
    },
    {
        "id": "T1070",
        "name": "Indicator Removal: Clear Windows Event Logs",
        "tactic": "Defense Evasion",
        "description": "Adversaries clear security, system, and PowerShell event logs using wevtutil or PowerShell to blind defenders.",
        "mitigations": ["M1026"],
        "required_privilege": "LOCAL_ADMIN",
        "applicable_platforms": ["Windows"],
        "data_sources": ["Event Log cleared Event 1102"],
    },

    # ── Credential Access ──────────────────────────────────────────────────────
    {
        "id": "T1003.001",
        "name": "OS Credential Dumping: LSASS Memory",
        "tactic": "Credential Access",
        "description": "Adversaries dump plaintext credentials or NTLM hashes from the Local Security Authority Subsystem Service (LSASS).",
        "mitigations": ["M1027", "M1026", "M1049", "M1032"],
        "required_privilege": "LOCAL_ADMIN",
        "applicable_platforms": ["Windows"],
        "data_sources": ["Process access to lsass.exe", "Sysmon Event 10"],
    },
    {
        "id": "T1558.003",
        "name": "Steal or Forge Kerberos Tickets: Kerberoasting",
        "tactic": "Credential Access",
        "description": "Adversaries request Service Principal Name (SPN) Kerberos TGS tickets and crack the password offline.",
        "mitigations": ["M1027", "M1026", "M1032"],
        "required_privilege": "STANDARD",
        "applicable_platforms": ["Windows", "Active Directory"],
        "data_sources": ["Kerberos Service Ticket request Event 4769"],
    },
    {
        "id": "T1110.003",
        "name": "Brute Force: Password Spraying",
        "tactic": "Credential Access",
        "description": "Adversaries test a single common password against many enterprise user accounts to avoid lockout thresholds.",
        "mitigations": ["M1032", "M1027"],
        "required_privilege": "STANDARD",
        "applicable_platforms": ["Windows", "Linux", "Cloud"],
        "data_sources": ["Logon failures Event 4625", "Identity Provider authentication"],
    },

    # ── Discovery ──────────────────────────────────────────────────────────────
    {
        "id": "T1087.002",
        "name": "Account Discovery: Domain Account",
        "tactic": "Discovery",
        "description": "Adversaries query Active Directory via LDAP/RPC to enumerate high-privilege administrators and group memberships.",
        "mitigations": ["M1026", "M1030"],
        "required_privilege": "STANDARD",
        "applicable_platforms": ["Windows", "Active Directory"],
        "data_sources": ["LDAP queries", "net.exe process creation"],
    },
    {
        "id": "T1018",
        "name": "Remote System Discovery",
        "tactic": "Discovery",
        "description": "Adversaries scan network IP ranges or query DNS/AD to locate high-value servers, backup systems, and domain controllers.",
        "mitigations": ["M1030"],
        "required_privilege": "STANDARD",
        "applicable_platforms": ["Windows", "Linux"],
        "data_sources": ["Internal port scanning", "DNS query logs"],
    },

    # ── Lateral Movement ───────────────────────────────────────────────────────
    {
        "id": "T1021.002",
        "name": "Remote Services: SMB/Windows Admin Shares",
        "tactic": "Lateral Movement",
        "description": "Adversaries leverage SMB and administrative shares (C$, ADMIN$) to move laterally and execute commands.",
        "mitigations": ["M1030", "M1035", "M1032", "M1026"],
        "required_privilege": "LOCAL_ADMIN",
        "applicable_platforms": ["Windows"],
        "data_sources": ["SMB session creation Event 5140", "Named pipes"],
    },
    {
        "id": "T1021.001",
        "name": "Remote Services: Remote Desktop Protocol (RDP)",
        "tactic": "Lateral Movement",
        "description": "Adversaries connect to internal interactive graphical sessions across systems using compromised credentials.",
        "mitigations": ["M1032", "M1030", "M1035"],
        "required_privilege": "STANDARD",
        "applicable_platforms": ["Windows"],
        "data_sources": ["RDP connection Event 1149", "Logon type 10"],
    },
    {
        "id": "T1550.002",
        "name": "Use Alternate Authentication Material: Pass the Hash",
        "tactic": "Lateral Movement",
        "description": "Adversaries authenticate using extracted NTLM password hashes directly over NTLMv2 without needing the plaintext password.",
        "mitigations": ["M1032", "M1026", "M1030"],
        "required_privilege": "LOCAL_ADMIN",
        "applicable_platforms": ["Windows"],
        "data_sources": ["NTLM authentication Event 4624 (Logon type 3)"],
    },

    # ── Collection ─────────────────────────────────────────────────────────────
    {
        "id": "T1005",
        "name": "Data from Local System",
        "tactic": "Collection",
        "description": "Adversaries search and stage sensitive files, databases, source code, and configuration keys on the compromised endpoint.",
        "mitigations": ["M1026", "M1049"],
        "required_privilege": "STANDARD",
        "applicable_platforms": ["Windows", "Linux"],
        "data_sources": ["File access events", "PowerShell file searches"],
    },
    {
        "id": "T1560.001",
        "name": "Archive Collected Data: Archive via Utility",
        "tactic": "Collection",
        "description": "Adversaries compress and encrypt staged data using 7-Zip, tar, or PowerShell before exfiltration.",
        "mitigations": ["M1049", "M1038"],
        "required_privilege": "STANDARD",
        "applicable_platforms": ["Windows", "Linux"],
        "data_sources": ["7z/zip process creation", "Archive file creations"],
    },

    # ── Exfiltration ───────────────────────────────────────────────────────────
    {
        "id": "T1048.003",
        "name": "Exfiltration Over Alternative Protocol",
        "tactic": "Exfiltration",
        "description": "Adversaries exfiltrate sensitive data over unauthorized protocols such as DNS tunneling, FTP, or ICMP.",
        "mitigations": ["M1030", "M1035"],
        "required_privilege": "STANDARD",
        "applicable_platforms": ["Windows", "Linux"],
        "data_sources": ["Outbound firewall drops", "DNS query volume spikes"],
    },

    # ── Impact ─────────────────────────────────────────────────────────────────
    {
        "id": "T1486",
        "name": "Data Encrypted for Impact",
        "tactic": "Impact",
        "description": "Adversaries encrypt data on target systems to interrupt availability and demand ransom.",
        "mitigations": ["M1053", "M1030", "M1049", "M1026"],
        "required_privilege": "LOCAL_ADMIN",
        "applicable_platforms": ["Windows", "Linux"],
        "data_sources": ["Rapid file modifications", "Ransom note generation"],
    },
    {
        "id": "T1490",
        "name": "Inhibit System Recovery",
        "tactic": "Impact",
        "description": "Adversaries delete or corrupt system recovery features like Volume Shadow Copies (vssadmin delete shadows) to prevent rollback.",
        "mitigations": ["M1053", "M1026", "M1049"],
        "required_privilege": "LOCAL_ADMIN",
        "applicable_platforms": ["Windows"],
        "data_sources": ["vssadmin.exe execution", "bcdedit.exe modifications"],
    },
    {
        "id": "T1489",
        "name": "Service Stop",
        "tactic": "Impact",
        "description": "Adversaries stop database, virtualization, and backup services (e.g., MSSQL, Veeam, Hyper-V) to unlock files for encryption.",
        "mitigations": ["M1026", "M1049"],
        "required_privilege": "LOCAL_ADMIN",
        "applicable_platforms": ["Windows", "Linux"],
        "data_sources": ["net stop / sc stop commands", "Service state changes"],
    },
]


def get_all_mitre_techniques() -> List[Dict[str, Any]]:
    return MITRE_TECHNIQUES


def get_mitre_technique(technique_id: str) -> Optional[Dict[str, Any]]:
    for t in MITRE_TECHNIQUES:
        if t["id"].lower() == technique_id.lower():
            return t
    return None


def get_all_mitre_mitigations() -> List[Dict[str, Any]]:
    return MITRE_MITIGATIONS


def get_mitre_mitigation(mitigation_id: str) -> Optional[Dict[str, Any]]:
    for m in MITRE_MITIGATIONS:
        if m["id"].lower() == mitigation_id.lower():
            return m
    return None
