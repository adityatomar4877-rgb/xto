from typing import Any, Dict, List, Optional


MITRE_TECHNIQUES = [
    {
        "id": "T1566.001",
        "name": "Spearphishing Attachment",
        "tactic": "Initial Access",
        "description": "Adversaries send spearphishing emails with malicious attachments to gain code execution.",
        "mitigations": ["M1049 Antivirus/Antimalware", "M1054 Software Configuration", "M1031 Network Intrusion Prevention"],
    },
    {
        "id": "T1190",
        "name": "Exploit Public-Facing Application",
        "tactic": "Initial Access",
        "description": "Exploitation of vulnerabilities in internet-accessible software or appliances.",
        "mitigations": ["M1051 Update Software", "M1050 Exploit Protection", "M1048 Application Isolation"],
    },
    {
        "id": "T1003.001",
        "name": "OS Credential Dumping: LSASS Memory",
        "tactic": "Credential Access",
        "description": "Adversaries dump plaintext credentials or NTLM hashes from the Local Security Authority Subsystem Service (LSASS).",
        "mitigations": ["M1027 Password Policies", "M1026 Privileged Account Management", "M1038 Run as PPL"],
    },
    {
        "id": "T1021.002",
        "name": "Remote Services: SMB/Windows Admin Shares",
        "tactic": "Lateral Movement",
        "description": "Adversaries leverage SMB and administrative shares (C$, ADMIN$) to move laterally and execute commands.",
        "mitigations": ["M1030 Network Segmentation", "M1035 Limit Access to Resource Over Network", "M1032 Multi-factor Authentication"],
    },
    {
        "id": "T1047",
        "name": "Windows Management Instrumentation (WMI)",
        "tactic": "Execution",
        "description": "Adversaries abuse WMI to execute malicious commands and scripts remotely across internal systems.",
        "mitigations": ["M1038 Execution Prevention", "M1030 Network Segmentation"],
    },
    {
        "id": "T1486",
        "name": "Data Encrypted for Impact",
        "tactic": "Impact",
        "description": "Adversaries encrypt data on target systems to interrupt availability and demand ransom.",
        "mitigations": ["M1053 Data Backup", "M1055 Inactive Account Management", "M1041 Encrypt Sensitive Information"],
    },
    {
        "id": "T1490",
        "name": "Inhibit System Recovery",
        "tactic": "Impact",
        "description": "Adversaries delete or corrupt system recovery features like Volume Shadow Copies (vssadmin) to prevent rollback.",
        "mitigations": ["M1053 Data Backup", "M1026 Privileged Account Management"],
    },
    {
        "id": "T1068",
        "name": "Exploitation for Privilege Escalation",
        "tactic": "Privilege Escalation",
        "description": "Adversaries exploit software vulnerabilities to elevate from standard user to SYSTEM or Domain Admin.",
        "mitigations": ["M1051 Update Software", "M1028 Operating System Configuration"],
    },
    {
        "id": "T1078.002",
        "name": "Valid Accounts: Domain Accounts",
        "tactic": "Defense Evasion",
        "description": "Adversaries obtain and abuse legitimate credentials of domain accounts to blend into normal enterprise traffic.",
        "mitigations": ["M1032 Multi-factor Authentication", "M1027 Password Policies"],
    },
]


def get_all_mitre_techniques() -> List[Dict[str, Any]]:
    return MITRE_TECHNIQUES


def get_mitre_technique(technique_id: str) -> Optional[Dict[str, Any]]:
    for t in MITRE_TECHNIQUES:
        if t["id"].lower() == technique_id.lower():
            return t
    return None
