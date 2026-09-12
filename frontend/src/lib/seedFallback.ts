import type { DigitalTwinTopology, HealthResponse, ThreatVector, RemediationPriority, ResilienceScoreResult } from "./api";

export const FALLBACK_HEALTH: HealthResponse = {
    "status":  "ONLINE",
    "service":  "XTO â Cyber Decision Digital Twin",
    "product_version":  "1.0.0-hackx",
    "snapshot_id":  "snapshot_001",
    "assets_loaded":  12,
    "identities_loaded":  6,
    "relationships_loaded":  16,
    "active_controls":  3
};

export const FALLBACK_TWIN: DigitalTwinTopology = {
    "snapshot_id":  "snapshot_001",
    "version":  1,
    "timestamp":  "2026-09-11T23:27:44.383796+00:00",
    "name":  "Corporate Cyber War Room - Ground Truth Baseline",
    "assets":  [
                   {
                       "id":  "EXT-INTERNET",
                       "name":  "External Internet Adversary Space",
                       "type":  "ROUTER",
                       "zone":  "INTERNET",
                       "criticality":  "LOW",
                       "ip_address":  "198.51.100.1",
                       "os":  "Routing Edge",
                       "department":  "External",
                       "services":  [
                                        "BGP",
                                        "DNS"
                                    ],
                       "vulnerabilities":  [

                                           ],
                       "controls":  [

                                    ],
                       "identities":  [

                                      ],
                       "is_compromised":  false,
                       "criticality_score":  1.0,
                       "login_history":  [
                                             {
                                                 "timestamp":  "2026-09-10T09:00:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "198.51.100.1",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-11T10:15:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "198.51.100.1",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             }
                                         ],
                       "traffic_flows":  [

                                         ],
                       "process_activity":  [
                                                {
                                                    "timestamp":  "2026-09-11T12:00:00Z",
                                                    "process_name":  "systemd",
                                                    "user":  "system",
                                                    "command_line":  "",
                                                    "is_anomalous":  false
                                                }
                                            ],
                       "behavioural_baseline":  {
                                                    "normal_login_hours":  "06:00-19:00",
                                                    "normal_source_ips":  [
                                                                              "198.51.100.1",
                                                                              "10.100.0.0/16"
                                                                          ],
                                                    "normal_destinations":  [
                                                                                "203.0.113.1"
                                                                            ],
                                                    "baseline_avg_outbound_bytes":  500000,
                                                    "whitelisted_processes":  [
                                                                                  "systemd",
                                                                                  "sshd",
                                                                                  "cron"
                                                                              ]
                                                },
                       "anomaly_score":  0.0
                   },
                   {
                       "id":  "FW-EDGE-01",
                       "name":  "Perimeter NextGen Firewall",
                       "type":  "FIREWALL",
                       "zone":  "DMZ",
                       "criticality":  "HIGH",
                       "ip_address":  "203.0.113.1",
                       "os":  "Palo Alto PAN-OS",
                       "department":  "Infrastructure Security",
                       "services":  [
                                        "HTTPS :443",
                                        "IPSec :500"
                                    ],
                       "vulnerabilities":  [

                                           ],
                       "controls":  [
                                        "CTRL-MFA-CORP"
                                    ],
                       "identities":  [

                                      ],
                       "is_compromised":  false,
                       "criticality_score":  7.0,
                       "login_history":  [
                                             {
                                                 "timestamp":  "2026-09-10T09:00:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "203.0.113.1",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-11T10:15:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "203.0.113.1",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             }
                                         ],
                       "traffic_flows":  [

                                         ],
                       "process_activity":  [
                                                {
                                                    "timestamp":  "2026-09-11T12:00:00Z",
                                                    "process_name":  "systemd",
                                                    "user":  "system",
                                                    "command_line":  "",
                                                    "is_anomalous":  false
                                                }
                                            ],
                       "behavioural_baseline":  {
                                                    "normal_login_hours":  "06:00-19:00",
                                                    "normal_source_ips":  [
                                                                              "203.0.113.1",
                                                                              "10.100.0.0/16"
                                                                          ],
                                                    "normal_destinations":  [
                                                                                "192.168.10.15",
                                                                                "192.168.10.5"
                                                                            ],
                                                    "baseline_avg_outbound_bytes":  500000,
                                                    "whitelisted_processes":  [
                                                                                  "systemd",
                                                                                  "sshd",
                                                                                  "cron"
                                                                              ]
                                                },
                       "anomaly_score":  0.0
                   },
                   {
                       "id":  "WEB-SRV-01",
                       "name":  "Public Customer Portal (DMZ)",
                       "type":  "APPLICATION_SERVER",
                       "zone":  "DMZ",
                       "criticality":  "HIGH",
                       "ip_address":  "192.168.10.15",
                       "os":  "Ubuntu Linux 22.04",
                       "department":  "Digital Operations",
                       "services":  [
                                        "Nginx :443",
                                        "Node.js :3000"
                                    ],
                       "vulnerabilities":  [
                                               {
                                                   "cve":  "CVE-2023-38606",
                                                   "name":  "Customer Portal SQL Injection",
                                                   "severity":  "HIGH",
                                                   "cvss_score":  8.6,
                                                   "affected_service":  "Public Web Application :443",
                                                   "exploitable_technique":  "T1190",
                                                   "patch_available":  false,
                                                   "description":  "Unsanitized query parameters allow extraction of internal database records."
                                               }
                                           ],
                       "controls":  [
                                        "CTRL-WAF-01"
                                    ],
                       "identities":  [

                                      ],
                       "is_compromised":  false,
                       "criticality_score":  7.5,
                       "login_history":  [
                                             {
                                                 "timestamp":  "2026-09-10T09:00:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "192.168.10.15",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-11T10:15:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "192.168.10.15",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             }
                                         ],
                       "traffic_flows":  [

                                         ],
                       "process_activity":  [
                                                {
                                                    "timestamp":  "2026-09-11T12:00:00Z",
                                                    "process_name":  "nginx",
                                                    "user":  "system",
                                                    "command_line":  "",
                                                    "is_anomalous":  false
                                                }
                                            ],
                       "behavioural_baseline":  {
                                                    "normal_login_hours":  "06:00-19:00",
                                                    "normal_source_ips":  [
                                                                              "192.168.10.15",
                                                                              "10.100.0.0/16"
                                                                          ],
                                                    "normal_destinations":  [
                                                                                "10.200.1.10"
                                                                            ],
                                                    "baseline_avg_outbound_bytes":  500000,
                                                    "whitelisted_processes":  [
                                                                                  "nginx",
                                                                                  "node",
                                                                                  "rsyslog"
                                                                              ]
                                                },
                       "anomaly_score":  0.0
                   },
                   {
                       "id":  "VPN-GW-01",
                       "name":  "Corporate SSL-VPN Concentrator",
                       "type":  "VPN_GATEWAY",
                       "zone":  "DMZ",
                       "criticality":  "HIGH",
                       "ip_address":  "192.168.10.5",
                       "os":  "Ivanti ICS Appliance",
                       "department":  "IT Infrastructure",
                       "services":  [
                                        "SSL-VPN :443"
                                    ],
                       "vulnerabilities":  [
                                               {
                                                   "cve":  "CVE-2024-21887",
                                                   "name":  "Ivanti Connect Secure Command Injection",
                                                   "severity":  "CRITICAL",
                                                   "cvss_score":  9.8,
                                                   "affected_service":  "SSL-VPN Web Interface :443",
                                                   "exploitable_technique":  "T1190",
                                                   "patch_available":  true,
                                                   "description":  "Command injection in web components allows arbitrary command execution as root."
                                               }
                                           ],
                       "controls":  [
                                        "CTRL-MFA-CORP"
                                    ],
                       "identities":  [

                                      ],
                       "is_compromised":  false,
                       "criticality_score":  8.0,
                       "login_history":  [
                                             {
                                                 "timestamp":  "2026-09-12T04:50:00Z",
                                                 "user":  "admin",
                                                 "source_ip":  "185.220.101.7",
                                                 "success":  false,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-12T04:50:30Z",
                                                 "user":  "admin",
                                                 "source_ip":  "185.220.101.7",
                                                 "success":  false,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-12T04:51:00Z",
                                                 "user":  "admin",
                                                 "source_ip":  "185.220.101.7",
                                                 "success":  false,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-12T04:51:30Z",
                                                 "user":  "admin",
                                                 "source_ip":  "185.220.101.7",
                                                 "success":  false,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-12T04:52:00Z",
                                                 "user":  "admin",
                                                 "source_ip":  "185.220.101.7",
                                                 "success":  false,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-12T04:52:30Z",
                                                 "user":  "admin",
                                                 "source_ip":  "185.220.101.7",
                                                 "success":  false,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-12T04:53:00Z",
                                                 "user":  "admin",
                                                 "source_ip":  "185.220.101.7",
                                                 "success":  false,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-12T04:53:22Z",
                                                 "user":  "admin",
                                                 "source_ip":  "185.220.101.7",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             }
                                         ],
                       "traffic_flows":  [

                                         ],
                       "process_activity":  [
                                                {
                                                    "timestamp":  "2026-09-11T12:00:00Z",
                                                    "process_name":  "systemd",
                                                    "user":  "system",
                                                    "command_line":  "",
                                                    "is_anomalous":  false
                                                }
                                            ],
                       "behavioural_baseline":  {
                                                    "normal_login_hours":  "06:00-19:00",
                                                    "normal_source_ips":  [
                                                                              "192.168.10.5",
                                                                              "10.100.0.0/16"
                                                                          ],
                                                    "normal_destinations":  [
                                                                                "10.100.0.0/16"
                                                                            ],
                                                    "baseline_avg_outbound_bytes":  500000,
                                                    "whitelisted_processes":  [
                                                                                  "systemd",
                                                                                  "sshd",
                                                                                  "cron"
                                                                              ]
                                                },
                       "anomaly_score":  65.0
                   },
                   {
                       "id":  "WS-ENG-04",
                       "name":  "Senior DevOps Engineer Laptop",
                       "type":  "WORKSTATION",
                       "zone":  "CORPORATE_LAN",
                       "criticality":  "MEDIUM",
                       "ip_address":  "10.100.4.45",
                       "os":  "Windows 11 Enterprise",
                       "department":  "Engineering",
                       "services":  [
                                        "SSH Client",
                                        "Docker Desktop",
                                        "RDP :3389"
                                    ],
                       "vulnerabilities":  [

                                           ],
                       "controls":  [
                                        "CTRL-EDR-01"
                                    ],
                       "identities":  [
                                          "ID-ENG-DEV"
                                      ],
                       "is_compromised":  false,
                       "criticality_score":  5.5,
                       "login_history":  [
                                             {
                                                 "timestamp":  "2026-09-08T09:12:00Z",
                                                 "user":  "ID-ENG-DEV",
                                                 "source_ip":  "10.100.4.45",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-09T10:30:00Z",
                                                 "user":  "ID-ENG-DEV",
                                                 "source_ip":  "10.100.4.45",
                                                 "success":  true,
                                                 "auth_method":  "SSH_KEY"
                                             },
                                             {
                                                 "timestamp":  "2026-09-12T02:13:00Z",
                                                 "user":  "unknown\\svc_diag",
                                                 "source_ip":  "185.220.101.7",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             }
                                         ],
                       "traffic_flows":  [

                                         ],
                       "process_activity":  [
                                                {
                                                    "timestamp":  "2026-09-12T02:14:00Z",
                                                    "process_name":  "powershell.exe",
                                                    "user":  "svc_diag",
                                                    "command_line":  "powershell -enc JABjAD0ATgBlAHcALQBPAGIAagBlAGMAdAA...,",
                                                    "is_anomalous":  true
                                                },
                                                {
                                                    "timestamp":  "2026-09-12T02:15:00Z",
                                                    "process_name":  "rundll32.exe",
                                                    "user":  "svc_diag",
                                                    "command_line":  "rundll32.exe C:\\Windows\\Temp\\stg.dll,Start",
                                                    "is_anomalous":  true
                                                }
                                            ],
                       "behavioural_baseline":  {
                                                    "normal_login_hours":  "06:00-19:00",
                                                    "normal_source_ips":  [
                                                                              "10.100.4.45",
                                                                              "10.100.0.0/16"
                                                                          ],
                                                    "normal_destinations":  [
                                                                                "10.200.1.10",
                                                                                "172.16.0.4"
                                                                            ],
                                                    "baseline_avg_outbound_bytes":  500000,
                                                    "whitelisted_processes":  [
                                                                                  "code",
                                                                                  "docker",
                                                                                  "ssh",
                                                                                  "git"
                                                                              ]
                                                },
                       "anomaly_score":  90.0
                   },
                   {
                       "id":  "WS-FIN-02",
                       "name":  "Finance Lead Workstation",
                       "type":  "WORKSTATION",
                       "zone":  "CORPORATE_LAN",
                       "criticality":  "MEDIUM",
                       "ip_address":  "10.100.2.22",
                       "os":  "Windows 11 Enterprise",
                       "department":  "Finance",
                       "services":  [
                                        "Office 365",
                                        "ERP Client"
                                    ],
                       "vulnerabilities":  [

                                           ],
                       "controls":  [
                                        "CTRL-EDR-01"
                                    ],
                       "identities":  [
                                          "ID-FIN-LEAD"
                                      ],
                       "is_compromised":  false,
                       "criticality_score":  5.0,
                       "login_history":  [
                                             {
                                                 "timestamp":  "2026-09-10T09:00:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "10.100.2.22",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-11T10:15:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "10.100.2.22",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             }
                                         ],
                       "traffic_flows":  [
                                             {
                                                 "timestamp":  "2026-09-12T05:04:00Z",
                                                 "dest_ip":  "10.200.2.50",
                                                 "dest_port":  5432,
                                                 "protocol":  "TCP",
                                                 "bytes_transferred":  12000000,
                                                 "direction":  "OUTBOUND"
                                             },
                                             {
                                                 "timestamp":  "2026-09-12T05:05:00Z",
                                                 "dest_ip":  "10.200.2.50",
                                                 "dest_port":  5432,
                                                 "protocol":  "TCP",
                                                 "bytes_transferred":  8500000,
                                                 "direction":  "OUTBOUND"
                                             }
                                         ],
                       "process_activity":  [
                                                {
                                                    "timestamp":  "2026-09-11T12:00:00Z",
                                                    "process_name":  "excel",
                                                    "user":  "system",
                                                    "command_line":  "",
                                                    "is_anomalous":  false
                                                }
                                            ],
                       "behavioural_baseline":  {
                                                    "normal_login_hours":  "06:00-19:00",
                                                    "normal_source_ips":  [
                                                                              "10.100.2.22",
                                                                              "10.100.0.0/16"
                                                                          ],
                                                    "normal_destinations":  [
                                                                                "10.200.1.20"
                                                                            ],
                                                    "baseline_avg_outbound_bytes":  500000,
                                                    "whitelisted_processes":  [
                                                                                  "excel",
                                                                                  "outlook",
                                                                                  "erp-client"
                                                                              ]
                                                },
                       "anomaly_score":  50.0
                   },
                   {
                       "id":  "APP-SRV-01",
                       "name":  "Core Banking \u0026 API Microservice",
                       "type":  "APPLICATION_SERVER",
                       "zone":  "MANAGEMENT",
                       "criticality":  "HIGH",
                       "ip_address":  "10.200.1.10",
                       "os":  "Red Hat Enterprise Linux 9",
                       "department":  "Core Platform",
                       "services":  [
                                        "Java SpringBoot :8080",
                                        "SSH :22"
                                    ],
                       "vulnerabilities":  [
                                               {
                                                   "cve":  "CVE-2021-44228",
                                                   "name":  "Apache Log4j RCE (Log4Shell)",
                                                   "severity":  "CRITICAL",
                                                   "cvss_score":  10.0,
                                                   "affected_service":  "Java Application Gateway :8080",
                                                   "exploitable_technique":  "T1190",
                                                   "patch_available":  true,
                                                   "description":  "JNDI lookup injection allows unauthenticated remote code execution."
                                               }
                                           ],
                       "controls":  [
                                        "CTRL-EDR-01"
                                    ],
                       "identities":  [
                                          "ID-SVC-APP"
                                      ],
                       "is_compromised":  false,
                       "criticality_score":  8.5,
                       "login_history":  [
                                             {
                                                 "timestamp":  "2026-09-10T09:00:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "10.200.1.10",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-11T10:15:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "10.200.1.10",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             }
                                         ],
                       "traffic_flows":  [
                                             {
                                                 "timestamp":  "2026-09-12T03:15:00Z",
                                                 "dest_ip":  "45.137.21.9",
                                                 "dest_port":  443,
                                                 "protocol":  "TCP",
                                                 "bytes_transferred":  8200000000,
                                                 "direction":  "OUTBOUND"
                                             },
                                             {
                                                 "timestamp":  "2026-09-12T03:22:00Z",
                                                 "dest_ip":  "45.137.21.9",
                                                 "dest_port":  443,
                                                 "protocol":  "TCP",
                                                 "bytes_transferred":  1400000000,
                                                 "direction":  "OUTBOUND"
                                             }
                                         ],
                       "process_activity":  [
                                                {
                                                    "timestamp":  "2026-09-11T12:00:00Z",
                                                    "process_name":  "java",
                                                    "user":  "system",
                                                    "command_line":  "",
                                                    "is_anomalous":  false
                                                }
                                            ],
                       "behavioural_baseline":  {
                                                    "normal_login_hours":  "06:00-19:00",
                                                    "normal_source_ips":  [
                                                                              "10.200.1.10",
                                                                              "10.100.0.0/16"
                                                                          ],
                                                    "normal_destinations":  [
                                                                                "10.200.2.50"
                                                                            ],
                                                    "baseline_avg_outbound_bytes":  500000,
                                                    "whitelisted_processes":  [
                                                                                  "java",
                                                                                  "sshd",
                                                                                  "systemd"
                                                                              ]
                                                },
                       "anomaly_score":  80.0
                   },
                   {
                       "id":  "DC-CORP-01",
                       "name":  "Corporate Active Directory Domain Controller",
                       "type":  "DOMAIN_CONTROLLER",
                       "zone":  "SECURE_TIER",
                       "criticality":  "CRITICAL",
                       "ip_address":  "10.200.0.1",
                       "os":  "Windows Server 2022 Datacenter",
                       "department":  "Enterprise Identity",
                       "services":  [
                                        "Kerberos :88",
                                        "LDAP :389",
                                        "SMB :445",
                                        "DNS :53"
                                    ],
                       "vulnerabilities":  [
                                               {
                                                   "cve":  "CVE-2020-1472",
                                                   "name":  "Netlogon Elevation of Privilege (ZeroLogon)",
                                                   "severity":  "CRITICAL",
                                                   "cvss_score":  10.0,
                                                   "affected_service":  "Netlogon RPC :445",
                                                   "exploitable_technique":  "T1068",
                                                   "patch_available":  true,
                                                   "description":  "Flaw in Netlogon cryptographic protocol allows unauthenticated DC takeover."
                                               }
                                           ],
                       "controls":  [

                                    ],
                       "identities":  [
                                          "ID-DOMAIN-ADMIN"
                                      ],
                       "is_compromised":  false,
                       "criticality_score":  10.0,
                       "login_history":  [
                                             {
                                                 "timestamp":  "2026-09-12T01:40:00Z",
                                                 "user":  "ID-DOMAIN-ADMIN",
                                                 "source_ip":  "10.200.0.1",
                                                 "success":  true,
                                                 "auth_method":  "KERBEROS"
                                             },
                                             {
                                                 "timestamp":  "2026-09-12T01:55:00Z",
                                                 "user":  "ID-ENG-DEV",
                                                 "source_ip":  "10.100.4.45",
                                                 "success":  true,
                                                 "auth_method":  "KERBEROS"
                                             }
                                         ],
                       "traffic_flows":  [

                                         ],
                       "process_activity":  [
                                                {
                                                    "timestamp":  "2026-09-12T01:56:00Z",
                                                    "process_name":  "lsass.exe",
                                                    "user":  "ID-ENG-DEV",
                                                    "command_line":  "DRSUAPI.DsBind DRSUAPI_DsGetNCChanges (DCSync)",
                                                    "is_anomalous":  true
                                                }
                                            ],
                       "behavioural_baseline":  {
                                                    "normal_login_hours":  "06:00-19:00",
                                                    "normal_source_ips":  [
                                                                              "10.200.0.1",
                                                                              "10.100.0.0/16"
                                                                          ],
                                                    "normal_destinations":  [
                                                                                "10.200.0.0/24"
                                                                            ],
                                                    "baseline_avg_outbound_bytes":  500000,
                                                    "whitelisted_processes":  [
                                                                                  "lsass",
                                                                                  "dns",
                                                                                  "kdc",
                                                                                  "ntds"
                                                                              ]
                                                },
                       "anomaly_score":  90.0
                   },
                   {
                       "id":  "DB-PROD-01",
                       "name":  "Primary Customer Financial Database",
                       "type":  "DATABASE",
                       "zone":  "SECURE_TIER",
                       "criticality":  "CRITICAL",
                       "ip_address":  "10.200.2.50",
                       "os":  "Oracle Enterprise Linux 8",
                       "department":  "Data Platform",
                       "services":  [
                                        "PostgreSQL :5432",
                                        "Oracle TNS :1521"
                                    ],
                       "vulnerabilities":  [

                                           ],
                       "controls":  [

                                    ],
                       "identities":  [
                                          "ID-DBA-ROOT"
                                      ],
                       "is_compromised":  false,
                       "criticality_score":  9.5,
                       "login_history":  [
                                             {
                                                 "timestamp":  "2026-09-10T09:00:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "10.200.2.50",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-11T10:15:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "10.200.2.50",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             }
                                         ],
                       "traffic_flows":  [

                                         ],
                       "process_activity":  [
                                                {
                                                    "timestamp":  "2026-09-11T12:00:00Z",
                                                    "process_name":  "postgres",
                                                    "user":  "system",
                                                    "command_line":  "",
                                                    "is_anomalous":  false
                                                }
                                            ],
                       "behavioural_baseline":  {
                                                    "normal_login_hours":  "06:00-19:00",
                                                    "normal_source_ips":  [
                                                                              "10.200.2.50",
                                                                              "10.100.0.0/16"
                                                                          ],
                                                    "normal_destinations":  [

                                                                            ],
                                                    "baseline_avg_outbound_bytes":  500000,
                                                    "whitelisted_processes":  [
                                                                                  "postgres",
                                                                                  "oracle",
                                                                                  "sshd"
                                                                              ]
                                                },
                       "anomaly_score":  0.0
                   },
                   {
                       "id":  "VAULT-BACKUP-01",
                       "name":  "Immutable Ransomware Backup Repository",
                       "type":  "BACKUP_SERVER",
                       "zone":  "BACKUP_VAULT",
                       "criticality":  "CRITICAL",
                       "ip_address":  "10.250.99.10",
                       "os":  "Hardened Veeam Linux Appliance",
                       "department":  "Disaster Recovery",
                       "services":  [
                                        "Veeam Data Mover :6160",
                                        "SSH :22"
                                    ],
                       "vulnerabilities":  [

                                           ],
                       "controls":  [
                                        "CTRL-VAULT-ISOLATE"
                                    ],
                       "identities":  [
                                          "ID-BACKUP-OPERATOR"
                                      ],
                       "is_compromised":  false,
                       "criticality_score":  10.0,
                       "login_history":  [
                                             {
                                                 "timestamp":  "2026-09-10T09:00:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "10.250.99.10",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-11T10:15:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "10.250.99.10",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             }
                                         ],
                       "traffic_flows":  [

                                         ],
                       "process_activity":  [
                                                {
                                                    "timestamp":  "2026-09-11T12:00:00Z",
                                                    "process_name":  "veeam",
                                                    "user":  "system",
                                                    "command_line":  "",
                                                    "is_anomalous":  false
                                                }
                                            ],
                       "behavioural_baseline":  {
                                                    "normal_login_hours":  "06:00-19:00",
                                                    "normal_source_ips":  [
                                                                              "10.250.99.10",
                                                                              "10.100.0.0/16"
                                                                          ],
                                                    "normal_destinations":  [

                                                                            ],
                                                    "baseline_avg_outbound_bytes":  500000,
                                                    "whitelisted_processes":  [
                                                                                  "veeam",
                                                                                  "sshd"
                                                                              ]
                                                },
                       "anomaly_score":  0.0
                   },
                   {
                       "id":  "CLOUD-K8S-01",
                       "name":  "AWS Production EKS Cluster",
                       "type":  "CLOUD_INSTANCE",
                       "zone":  "CLOUD_VPC",
                       "criticality":  "HIGH",
                       "ip_address":  "172.16.0.4",
                       "os":  "Amazon Linux 2023",
                       "department":  "Cloud Engineering",
                       "services":  [
                                        "Kubernetes API :6443",
                                        "Envoy Ingress :443"
                                    ],
                       "vulnerabilities":  [

                                           ],
                       "controls":  [

                                    ],
                       "identities":  [

                                      ],
                       "is_compromised":  false,
                       "criticality_score":  8.0,
                       "login_history":  [
                                             {
                                                 "timestamp":  "2026-09-10T09:00:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "172.16.0.4",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-11T10:15:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "172.16.0.4",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             }
                                         ],
                       "traffic_flows":  [

                                         ],
                       "process_activity":  [
                                                {
                                                    "timestamp":  "2026-09-11T12:00:00Z",
                                                    "process_name":  "kubelet",
                                                    "user":  "system",
                                                    "command_line":  "",
                                                    "is_anomalous":  false
                                                }
                                            ],
                       "behavioural_baseline":  {
                                                    "normal_login_hours":  "06:00-19:00",
                                                    "normal_source_ips":  [
                                                                              "172.16.0.4",
                                                                              "10.100.0.0/16"
                                                                          ],
                                                    "normal_destinations":  [
                                                                                "10.200.1.10"
                                                                            ],
                                                    "baseline_avg_outbound_bytes":  500000,
                                                    "whitelisted_processes":  [
                                                                                  "kubelet",
                                                                                  "envoy",
                                                                                  "containerd"
                                                                              ]
                                                },
                       "anomaly_score":  0.0
                   },
                   {
                       "id":  "SIEM-SOC-01",
                       "name":  "Security Operations Monitoring \u0026 SOAR",
                       "type":  "SERVER",
                       "zone":  "MANAGEMENT",
                       "criticality":  "MEDIUM",
                       "ip_address":  "10.200.5.10",
                       "os":  "Ubuntu 22.04 LTS",
                       "department":  "Cyber Defense",
                       "services":  [
                                        "Elasticsearch :9200",
                                        "Syslog :514"
                                    ],
                       "vulnerabilities":  [

                                           ],
                       "controls":  [

                                    ],
                       "identities":  [

                                      ],
                       "is_compromised":  false,
                       "criticality_score":  6.0,
                       "login_history":  [
                                             {
                                                 "timestamp":  "2026-09-10T09:00:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "10.200.5.10",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             },
                                             {
                                                 "timestamp":  "2026-09-11T10:15:00Z",
                                                 "user":  "system",
                                                 "source_ip":  "10.200.5.10",
                                                 "success":  true,
                                                 "auth_method":  "PASSWORD"
                                             }
                                         ],
                       "traffic_flows":  [

                                         ],
                       "process_activity":  [
                                                {
                                                    "timestamp":  "2026-09-11T12:00:00Z",
                                                    "process_name":  "elasticsearch",
                                                    "user":  "system",
                                                    "command_line":  "",
                                                    "is_anomalous":  false
                                                }
                                            ],
                       "behavioural_baseline":  {
                                                    "normal_login_hours":  "06:00-19:00",
                                                    "normal_source_ips":  [
                                                                              "10.200.5.10",
                                                                              "10.100.0.0/16"
                                                                          ],
                                                    "normal_destinations":  [
                                                                                "10.200.0.0/24"
                                                                            ],
                                                    "baseline_avg_outbound_bytes":  500000,
                                                    "whitelisted_processes":  [
                                                                                  "elasticsearch",
                                                                                  "logstash",
                                                                                  "filebeat"
                                                                              ]
                                                },
                       "anomaly_score":  0.0
                   }
               ],
    "identities":  [
                       {
                           "id":  "ID-ENG-DEV",
                           "name":  "Rahul Sharma (Senior DevOps)",
                           "type":  "USER",
                           "role":  "DevOps Engineer",
                           "privilege_level":  "LOCAL_ADMIN",
                           "accessible_assets":  [
                                                     "WS-ENG-04",
                                                     "APP-SRV-01",
                                                     "CLOUD-K8S-01"
                                                 ],
                           "credential_state":  "ACTIVE",
                           "auth_methods":  [
                                                "PASSWORD",
                                                "SSH_KEY"
                                            ],
                           "mfa_enabled":  false,
                           "trust_relationships":  [

                                                   ]
                       },
                       {
                           "id":  "ID-FIN-LEAD",
                           "name":  "Ananya Iyer (Finance VP)",
                           "type":  "USER",
                           "role":  "Finance Approver",
                           "privilege_level":  "STANDARD",
                           "accessible_assets":  [
                                                     "WS-FIN-02"
                                                 ],
                           "credential_state":  "ACTIVE",
                           "auth_methods":  [
                                                "PASSWORD"
                                            ],
                           "mfa_enabled":  true,
                           "trust_relationships":  [

                                                   ]
                       },
                       {
                           "id":  "ID-SVC-APP",
                           "name":  "svc_banking_core",
                           "type":  "SERVICE_ACCOUNT",
                           "role":  "Application Microservice",
                           "privilege_level":  "ELEVATED",
                           "accessible_assets":  [
                                                     "APP-SRV-01",
                                                     "DB-PROD-01"
                                                 ],
                           "credential_state":  "ACTIVE",
                           "auth_methods":  [
                                                "KERBEROS_KEYTAB",
                                                "CERTIFICATE"
                                            ],
                           "mfa_enabled":  false,
                           "trust_relationships":  [

                                                   ]
                       },
                       {
                           "id":  "ID-DOMAIN-ADMIN",
                           "name":  "vikram.admin (Enterprise Admin)",
                           "type":  "ADMIN",
                           "role":  "Tier-0 Domain Administrator",
                           "privilege_level":  "DOMAIN_ADMIN",
                           "accessible_assets":  [
                                                     "DC-CORP-01",
                                                     "APP-SRV-01",
                                                     "WS-ENG-04",
                                                     "WS-FIN-02",
                                                     "VAULT-BACKUP-01"
                                                 ],
                           "credential_state":  "ACTIVE",
                           "auth_methods":  [
                                                "PASSWORD",
                                                "KERBEROS"
                                            ],
                           "mfa_enabled":  false,
                           "trust_relationships":  [

                                                   ]
                       },
                       {
                           "id":  "ID-DBA-ROOT",
                           "name":  "dba_master",
                           "type":  "ADMIN",
                           "role":  "Database Administrator",
                           "privilege_level":  "ELEVATED",
                           "accessible_assets":  [
                                                     "DB-PROD-01"
                                                 ],
                           "credential_state":  "ACTIVE",
                           "auth_methods":  [
                                                "PASSWORD"
                                            ],
                           "mfa_enabled":  true,
                           "trust_relationships":  [

                                                   ]
                       },
                       {
                           "id":  "ID-BACKUP-OPERATOR",
                           "name":  "svc_backup_agent",
                           "type":  "SERVICE_ACCOUNT",
                           "role":  "Backup \u0026 Recovery Agent",
                           "privilege_level":  "SYSTEM",
                           "accessible_assets":  [
                                                     "VAULT-BACKUP-01",
                                                     "DB-PROD-01",
                                                     "APP-SRV-01"
                                                 ],
                           "credential_state":  "ACTIVE",
                           "auth_methods":  [
                                                "CERTIFICATE"
                                            ],
                           "mfa_enabled":  false,
                           "trust_relationships":  [

                                                   ]
                       }
                   ],
    "relationships":  [
                          {
                              "id":  "REL-01",
                              "source_id":  "EXT-INTERNET",
                              "target_id":  "FW-EDGE-01",
                              "type":  "NETWORK_REACHABILITY",
                              "protocol":  "TCP",
                              "port":  443,
                              "bidirectional":  false,
                              "trust_level":  0.5,
                              "is_blocked":  false,
                              "properties":  {

                                             }
                          },
                          {
                              "id":  "REL-02",
                              "source_id":  "FW-EDGE-01",
                              "target_id":  "WEB-SRV-01",
                              "type":  "NETWORK_REACHABILITY",
                              "protocol":  "TCP",
                              "port":  443,
                              "bidirectional":  false,
                              "trust_level":  0.5,
                              "is_blocked":  false,
                              "properties":  {

                                             }
                          },
                          {
                              "id":  "REL-03",
                              "source_id":  "FW-EDGE-01",
                              "target_id":  "VPN-GW-01",
                              "type":  "NETWORK_REACHABILITY",
                              "protocol":  "TCP",
                              "port":  443,
                              "bidirectional":  false,
                              "trust_level":  0.5,
                              "is_blocked":  false,
                              "properties":  {

                                             }
                          },
                          {
                              "id":  "REL-WEB-APP",
                              "source_id":  "WEB-SRV-01",
                              "target_id":  "APP-SRV-01",
                              "type":  "NETWORK_REACHABILITY",
                              "protocol":  "TCP",
                              "port":  8080,
                              "bidirectional":  false,
                              "trust_level":  0.5,
                              "is_blocked":  false,
                              "properties":  {
                                                 "service":  "REST API Gateway"
                                             }
                          },
                          {
                              "id":  "REL-FIN-APP",
                              "source_id":  "WS-FIN-02",
                              "target_id":  "APP-SRV-01",
                              "type":  "NETWORK_REACHABILITY",
                              "protocol":  "TCP",
                              "port":  443,
                              "bidirectional":  false,
                              "trust_level":  0.5,
                              "is_blocked":  false,
                              "properties":  {
                                                 "service":  "Internal Banking Web UI"
                                             }
                          },
                          {
                              "id":  "REL-04",
                              "source_id":  "VPN-GW-01",
                              "target_id":  "WS-ENG-04",
                              "type":  "NETWORK_REACHABILITY",
                              "protocol":  "TCP",
                              "port":  3389,
                              "bidirectional":  false,
                              "trust_level":  0.5,
                              "is_blocked":  false,
                              "properties":  {
                                                 "auth":  "Single Factor fallback"
                                             }
                          },
                          {
                              "id":  "REL-05",
                              "source_id":  "WS-ENG-04",
                              "target_id":  "APP-SRV-01",
                              "type":  "NETWORK_REACHABILITY",
                              "protocol":  "TCP",
                              "port":  22,
                              "bidirectional":  false,
                              "trust_level":  0.5,
                              "is_blocked":  false,
                              "properties":  {

                                             }
                          },
                          {
                              "id":  "REL-06",
                              "source_id":  "WS-ENG-04",
                              "target_id":  "DC-CORP-01",
                              "type":  "NETWORK_REACHABILITY",
                              "protocol":  "TCP",
                              "port":  445,
                              "bidirectional":  false,
                              "trust_level":  0.5,
                              "is_blocked":  false,
                              "properties":  {
                                                 "service":  "SMBv2 / RPC"
                                             }
                          },
                          {
                              "id":  "REL-CRED-01",
                              "source_id":  "WS-ENG-04",
                              "target_id":  "DC-CORP-01",
                              "type":  "CREDENTIAL_ACCESS",
                              "protocol":  "TCP",
                              "port":  null,
                              "bidirectional":  false,
                              "trust_level":  0.5,
                              "is_blocked":  false,
                              "properties":  {
                                                 "cached_identity":  "ID-DOMAIN-ADMIN",
                                                 "store":  "LSASS Memory / NTLM Hash"
                                             }
                          },
                          {
                              "id":  "REL-07",
                              "source_id":  "APP-SRV-01",
                              "target_id":  "DB-PROD-01",
                              "type":  "NETWORK_REACHABILITY",
                              "protocol":  "TCP",
                              "port":  5432,
                              "bidirectional":  false,
                              "trust_level":  0.5,
                              "is_blocked":  false,
                              "properties":  {

                                             }
                          },
                          {
                              "id":  "REL-08",
                              "source_id":  "APP-SRV-01",
                              "target_id":  "DC-CORP-01",
                              "type":  "AUTHENTICATION",
                              "protocol":  "TCP",
                              "port":  88,
                              "bidirectional":  false,
                              "trust_level":  0.5,
                              "is_blocked":  false,
                              "properties":  {
                                                 "mechanism":  "Kerberos TGT"
                                             }
                          },
                          {
                              "id":  "REL-09",
                              "source_id":  "DC-CORP-01",
                              "target_id":  "VAULT-BACKUP-01",
                              "type":  "REMOTE_EXECUTION",
                              "protocol":  "TCP",
                              "port":  445,
                              "bidirectional":  false,
                              "trust_level":  0.5,
                              "is_blocked":  false,
                              "properties":  {
                                                 "method":  "WinRM / WMI / SMB Administrator Session"
                                             }
                          },
                          {
                              "id":  "REL-10",
                              "source_id":  "DC-CORP-01",
                              "target_id":  "DB-PROD-01",
                              "type":  "PRIVILEGE",
                              "protocol":  "TCP",
                              "port":  null,
                              "bidirectional":  false,
                              "trust_level":  0.5,
                              "is_blocked":  false,
                              "properties":  {
                                                 "privilege":  "Domain Controller Backup Delegation"
                                             }
                          },
                          {
                              "id":  "REL-11",
                              "source_id":  "APP-SRV-01",
                              "target_id":  "VAULT-BACKUP-01",
                              "type":  "NETWORK_REACHABILITY",
                              "protocol":  "TCP",
                              "port":  6160,
                              "bidirectional":  false,
                              "trust_level":  0.5,
                              "is_blocked":  false,
                              "properties":  {

                                             }
                          },
                          {
                              "id":  "REL-12",
                              "source_id":  "WS-ENG-04",
                              "target_id":  "CLOUD-K8S-01",
                              "type":  "REMOTE_EXECUTION",
                              "protocol":  "TCP",
                              "port":  6443,
                              "bidirectional":  false,
                              "trust_level":  0.5,
                              "is_blocked":  false,
                              "properties":  {
                                                 "auth":  "Kubernetes kubeconfig admin token"
                                             }
                          },
                          {
                              "id":  "REL-13",
                              "source_id":  "DC-CORP-01",
                              "target_id":  "SIEM-SOC-01",
                              "type":  "NETWORK_REACHABILITY",
                              "protocol":  "UDP",
                              "port":  514,
                              "bidirectional":  false,
                              "trust_level":  0.5,
                              "is_blocked":  false,
                              "properties":  {

                                             }
                          }
                      ],
    "controls":  [
                     {
                         "id":  "CTRL-EDR-01",
                         "name":  "CrowdStrike EDR Agent Fleet",
                         "type":  "EDR",
                         "description":  "Behavioral endpoint detection and response on all corporate workstations.",
                         "is_active":  true,
                         "coverage_scope":  [
                                                "WS-ENG-04",
                                                "WS-FIN-02",
                                                "APP-SRV-01"
                                            ],
                         "effectiveness":  0.88,
                         "is_virtual":  false
                     },
                     {
                         "id":  "CTRL-WAF-01",
                         "name":  "Cloudflare Web Application Firewall",
                         "type":  "WAF",
                         "description":  "Inspects incoming HTTPS traffic for OWASP Top 10 exploits.",
                         "is_active":  true,
                         "coverage_scope":  [
                                                "WEB-SRV-01"
                                            ],
                         "effectiveness":  0.85,
                         "is_virtual":  false
                     },
                     {
                         "id":  "CTRL-MFA-CORP",
                         "name":  "FIDO2 / TOTP Multi-Factor Authentication",
                         "type":  "MFA",
                         "description":  "Enforced on VPN and External portals, but NOT internal Kerberos/SMB pivots.",
                         "is_active":  true,
                         "coverage_scope":  [
                                                "VPN-GW-01",
                                                "WEB-SRV-01"
                                            ],
                         "effectiveness":  0.95,
                         "is_virtual":  false
                     },
                     {
                         "id":  "CTRL-VAULT-ISOLATE",
                         "name":  "Immutable Backup Storage Air-Gap",
                         "type":  "NETWORK_SEGMENTATION",
                         "description":  "Restricts network access to backup vaults to dedicated backup windows only.",
                         "is_active":  false,
                         "coverage_scope":  [
                                                "VAULT-BACKUP-01"
                                            ],
                         "effectiveness":  0.98,
                         "is_virtual":  false
                     }
                 ],
    "stats":  {
                  "total_assets":  12,
                  "total_identities":  6,
                  "total_relationships":  16,
                  "total_controls":  4,
                  "critical_crown_jewels":  [
                                                "DC-CORP-01",
                                                "DB-PROD-01",
                                                "VAULT-BACKUP-01"
                                            ],
                  "unprotected_paths_to_crown_jewels":  17,
                  "baseline_posture_score":  54.0
              }
};

export const FALLBACK_THREATS: ThreatVector[] = [
    {
        "id":  "THREAT-PHISH",
        "name":  "Spearphishing Attachment / Link",
        "category":  "Initial Access",
        "entry_mechanism":  "Social engineering email payload delivered to corporate inbox with malicious macro/executable.",
        "prerequisites":  [
                              "Corporate email gateway bypass",
                              "User execution of attachment",
                              "Endpoint execution permitted"
                          ],
        "attacker_capabilities":  [
                                      "PHISHING_DELIVERY",
                                      "USER_EXECUTION",
                                      "LOCAL_RECON"
                                  ],
        "relevant_techniques":  [
                                    "T1566.001",
                                    "T1566.002",
                                    "T1204.002",
                                    "T1059.001"
                                ],
        "possible_initial_footholds":  [
                                           "WS-ENG-04",
                                           "WS-FIN-02"
                                       ],
        "possible_transitions":  [
                                     "CREDENTIAL_ACCESS",
                                     "LATERAL_MOVEMENT via SMB/RPC"
                                 ],
        "vulnerable_controls":  [
                                    "CTRL-EDR-01 (if behavioral heuristics disabled)",
                                    "Email Anti-Spam Sandbox"
                                ],
        "severity":  "HIGH",
        "description":  "Targets corporate employees with contextual invoice/HR payloads to gain initial foothold.",
        "supporting_evidence_types":  [
                                          "EMAIL_HEADER_LOG",
                                          "EDR_PROCESS_SPAWN",
                                          "USER_INTERACTION_EVENT"
                                      ]
    },
    {
        "id":  "THREAT-STOLEN-CREDS",
        "name":  "Stolen Credentials / Password Spray",
        "category":  "Credential Access",
        "entry_mechanism":  "Authentication against exposed internal/external endpoints using credentials harvested from dark web dumps or memory.",
        "prerequisites":  [
                              "Valid username/hash pair",
                              "Single-factor auth allowed or MFA fatigue exploit"
                          ],
        "attacker_capabilities":  [
                                      "PASS_THE_HASH",
                                      "KERBEROAST",
                                      "CREDENTIAL_STUFFING"
                                  ],
        "relevant_techniques":  [
                                    "T1078.002",
                                    "T1110.003",
                                    "T1558.003",
                                    "T1003.001"
                                ],
        "possible_initial_footholds":  [
                                           "VPN-GW-01",
                                           "WEB-SRV-01",
                                           "WS-ENG-04"
                                       ],
        "possible_transitions":  [
                                     "PRIVILEGE_ESCALATION",
                                     "REMOTE_EXECUTION"
                                 ],
        "vulnerable_controls":  [
                                    "CTRL-MFA-CORP (absence on internal protocols)",
                                    "Conditional Access Policies"
                                ],
        "severity":  "CRITICAL",
        "description":  "Leverages existing valid accounts to bypass perimeter defenses without generating exploit signatures.",
        "supporting_evidence_types":  [
                                          "NTLM_AUTH_LOG",
                                          "KERBEROS_TGS_REQUEST",
                                          "LSASS_DUMP_ARTIFACT"
                                      ]
    },
    {
        "id":  "THREAT-EXPOSED-VPN",
        "name":  "Exposed VPN / Perimeter Gateway Exploit",
        "category":  "External Remote Services",
        "entry_mechanism":  "Direct exploitation of unpatched vulnerabilities on internet-facing SSL-VPN appliances.",
        "prerequisites":  [
                              "Publicly reachable VPN port :443",
                              "Unpatched firmware (e.g. CVE-2024-21887)"
                          ],
        "attacker_capabilities":  [
                                      "EXPLOIT_RCE",
                                      "NETWORK_SNIFFING",
                                      "PIVOT_INTERNAL"
                                  ],
        "relevant_techniques":  [
                                    "T1190",
                                    "T1133",
                                    "T1021.001"
                                ],
        "possible_initial_footholds":  [
                                           "VPN-GW-01",
                                           "FW-EDGE-01"
                                       ],
        "possible_transitions":  [
                                     "NETWORK_REACHABILITY into Corporate LAN",
                                     "Direct Workstation RDP"
                                 ],
        "vulnerable_controls":  [
                                    "Perimeter Vulnerability Patch Management",
                                    "WAF / Geo-IP Blocking"
                                ],
        "severity":  "CRITICAL",
        "description":  "Exploits edge network gateway to gain unauthenticated direct route into internal DMZ and LAN.",
        "supporting_evidence_types":  [
                                          "FIREWALL_CONN_LOG",
                                          "VPN_AUTH_BYPASS_ALERT",
                                          "ROOT_SHELL_TELEMETRY"
                                      ]
    },
    {
        "id":  "THREAT-EXPOSED-SERVICE",
        "name":  "Exposed Public Facing Service",
        "category":  "Initial Access",
        "entry_mechanism":  "Discovery and brute-force or exploitation of exposed ports (SSH, RDP, Web).",
        "prerequisites":  [
                              "Public IP reachability",
                              "Weak or default authentication credentials"
                          ],
        "attacker_capabilities":  [
                                      "PORT_SCANNING",
                                      "BRUTE_FORCE",
                                      "REMOTE_SHELL"
                                  ],
        "relevant_techniques":  [
                                    "T1190",
                                    "T1021.004",
                                    "T1110"
                                ],
        "possible_initial_footholds":  [
                                           "WEB-SRV-01",
                                           "FW-EDGE-01"
                                       ],
        "possible_transitions":  [
                                     "LATERAL_MOVEMENT",
                                     "DMZ to App Server API bridge"
                                 ],
        "vulnerable_controls":  [
                                    "CTRL-WAF-01",
                                    "Network Access Control List"
                                ],
        "severity":  "HIGH",
        "description":  "Scans public range for open management services to establish reverse interactive C2.",
        "supporting_evidence_types":  [
                                          "NETFLOW_BURST",
                                          "NMAP_FINGERPRINT",
                                          "FAILED_AUTH_CLUSTER"
                                      ]
    },
    {
        "id":  "THREAT-VULN-APP",
        "name":  "Vulnerable Application (Log4j / RCE)",
        "category":  "Exploitation",
        "entry_mechanism":  "Injecting malicious payloads into application web/API endpoints to trigger unauthenticated code execution.",
        "prerequisites":  [
                              "Public or LAN accessible HTTP endpoint",
                              "Vulnerable component library present"
                          ],
        "attacker_capabilities":  [
                                      "EXPLOIT_RCE",
                                      "IN_MEMORY_LOADER",
                                      "LOCAL_PRIVILEGE_ESCALATION"
                                  ],
        "relevant_techniques":  [
                                    "T1190",
                                    "T1059.004",
                                    "T1505.003"
                                ],
        "possible_initial_footholds":  [
                                           "WEB-SRV-01",
                                           "APP-SRV-01"
                                       ],
        "possible_transitions":  [
                                     "Database connection extraction",
                                     "Domain Controller Kerberos ticket request"
                                 ],
        "vulnerable_controls":  [
                                    "CTRL-WAF-01",
                                    "Software Composition Analysis (SCA)"
                                ],
        "severity":  "CRITICAL",
        "description":  "Takes advantage of unpatched application layer vulnerabilities to execute arbitrary shellcode.",
        "supporting_evidence_types":  [
                                          "HTTP_REQ_PAYLOAD",
                                          "OUTBOUND_LDAP_BURST",
                                          "JVM_SUBPROCESS_SPAWN"
                                      ]
    },
    {
        "id":  "THREAT-INSIDER",
        "name":  "Malicious / Compromised Insider",
        "category":  "Privilege Abuse",
        "entry_mechanism":  "Authorized employee abuse of existing credentials, network shares, and internal tooling.",
        "prerequisites":  [
                              "Valid corporate identity",
                              "Physical or VPN access to internal LAN"
                          ],
        "attacker_capabilities":  [
                                      "DATA_EXFILTRATION",
                                      "UNAUTHORIZED_DOWNLOAD",
                                      "LOCAL_RECON"
                                  ],
        "relevant_techniques":  [
                                    "T1078.004",
                                    "T1530",
                                    "T1567"
                                ],
        "possible_initial_footholds":  [
                                           "WS-ENG-04",
                                           "WS-FIN-02"
                                       ],
        "possible_transitions":  [
                                     "Mass DB query",
                                     "Direct access to crown jewel repositories"
                                 ],
        "vulnerable_controls":  [
                                    "Data Loss Prevention (DLP)",
                                    "Privileged Access Management (PAM)"
                                ],
        "severity":  "HIGH",
        "description":  "Bypasses all perimeter security entirely by originating from authenticated internal endpoints.",
        "supporting_evidence_types":  [
                                          "MASS_FILE_COPY",
                                          "UNUSUAL_ACCESS_HOURS",
                                          "USB_STORAGE_MOUNT"
                                      ]
    },
    {
        "id":  "THREAT-SUPPLY-CHAIN",
        "name":  "Software Supply Chain / CI/CD Tampering",
        "category":  "Initial Access",
        "entry_mechanism":  "Poisoning build artifacts, npm/pip dependencies, or developer workstation git remotes.",
        "prerequisites":  [
                              "Access to development pipeline",
                              "Unsigned code deployment pipeline"
                          ],
        "attacker_capabilities":  [
                                      "CODE_INJECTION",
                                      "BUILD_SERVER_TAKEOVER",
                                      "SECRET_EXTRACTION"
                                  ],
        "relevant_techniques":  [
                                    "T1195.002",
                                    "T1552.001",
                                    "T1609"
                                ],
        "possible_initial_footholds":  [
                                           "WS-ENG-04",
                                           "CLOUD-K8S-01"
                                       ],
        "possible_transitions":  [
                                     "Cluster admin takeover",
                                     "Secret extraction into database"
                                 ],
        "vulnerable_controls":  [
                                    "Code Signing Verification",
                                    "Dependency Lockfile Verification"
                                ],
        "severity":  "CRITICAL",
        "description":  "Injects malicious backdoors directly into validated production deployment pipelines.",
        "supporting_evidence_types":  [
                                          "GIT_COMMIT_ANOMALY",
                                          "PACKAGE_HASH_MISMATCH",
                                          "UNAUTHORIZED_PIPELINE_TRIGGER"
                                      ]
    },
    {
        "id":  "THREAT-PRIV-ABUSE",
        "name":  "Active Directory Privilege Escalation",
        "category":  "Privilege Escalation",
        "entry_mechanism":  "Abuse of misconfigured Active Directory ACLs, unconstrained delegation, or DCSync rights.",
        "prerequisites":  [
                              "Any authenticated domain user account",
                              "Reachability to Domain Controller RPC :445"
                          ],
        "attacker_capabilities":  [
                                      "DCSYNC",
                                      "KERBEROAST",
                                      "SHADOW_ADMIN_TAKEOVER"
                                  ],
        "relevant_techniques":  [
                                    "T1484",
                                    "T1003.006",
                                    "T1068"
                                ],
        "possible_initial_footholds":  [
                                           "WS-ENG-04",
                                           "APP-SRV-01"
                                       ],
        "possible_transitions":  [
                                     "Tier-0 Domain Controller compromise",
                                     "Complete environment takeover"
                                 ],
        "vulnerable_controls":  [
                                    "Active Directory Tiering Model",
                                    "BloodHound ACL Hardening"
                                ],
        "severity":  "CRITICAL",
        "description":  "Leverages hidden permission loops in Active Directory to escalate from domain user to Enterprise Admin.",
        "supporting_evidence_types":  [
                                          "RPC_REPLICATION_ALERT",
                                          "LDAP_GENERIC_ALL_QUERY",
                                          "KERBEROS_SPN_ENUM"
                                      ]
    },
    {
        "id":  "THREAT-REMOTE-SERVICE",
        "name":  "Remote Service Pivoting (WinRM / RDP)",
        "category":  "Lateral Movement",
        "entry_mechanism":  "Pivoting across internal subnets using administrative remote management protocols.",
        "prerequisites":  [
                              "Stolen administrator credentials",
                              "Inbound TCP 3389/5985 unsegmented"
                          ],
        "attacker_capabilities":  [
                                      "WINRM_EXEC",
                                      "RDP_TUNNEL",
                                      "FILELESS_EXECUTION"
                                  ],
        "relevant_techniques":  [
                                    "T1021.001",
                                    "T1021.002",
                                    "T1021.006"
                                ],
        "possible_initial_footholds":  [
                                           "WS-ENG-04",
                                           "APP-SRV-01"
                                       ],
        "possible_transitions":  [
                                     "Workstation to Server lateral jumps"
                                 ],
        "vulnerable_controls":  [
                                    "Internal Subnet Micro-segmentation",
                                    "Jump Host / Bastion Enforcers"
                                ],
        "severity":  "HIGH",
        "description":  "Uses legitimate administrative utilities to travel between network zones unnoticed.",
        "supporting_evidence_types":  [
                                          "WINRM_LOGON_TYPE_3",
                                          "RDP_SESSION_INITIATED",
                                          "POWERSHELL_REMOTING_TRACE"
                                      ]
    },
    {
        "id":  "THREAT-CLOUD-EXPOSURE",
        "name":  "Cloud Metadata / IAM Role Exploitation",
        "category":  "Cloud Credential Theft",
        "entry_mechanism":  "Querying cloud instance metadata service (IMDSv1) to acquire temporary IAM instance profile tokens.",
        "prerequisites":  [
                              "SSRF vulnerability or container breakout",
                              "IMDSv1 enabled"
                          ],
        "attacker_capabilities":  [
                                      "IMDS_TOKEN_THEFT",
                                      "AWS_API_ASSUME_ROLE",
                                      "S3_BUCKET_DUMP"
                                  ],
        "relevant_techniques":  [
                                    "T1552.005",
                                    "T1526",
                                    "T1530"
                                ],
        "possible_initial_footholds":  [
                                           "CLOUD-K8S-01",
                                           "APP-SRV-01"
                                       ],
        "possible_transitions":  [
                                     "Cloud account compromise to internal on-prem DB"
                                 ],
        "vulnerable_controls":  [
                                    "IMDSv2 Enforced",
                                    "Least Privilege IAM Policies"
                                ],
        "severity":  "HIGH",
        "description":  "Leverages cloud identity tokens to pivot across hybrid-cloud infrastructures.",
        "supporting_evidence_types":  [
                                          "IMDS_HTTP_GET",
                                          "ASSUME_ROLE_CALL",
                                          "CLOUDTRAIL_ANOMALY"
                                      ]
    },
    {
        "id":  "THREAT-MISCONFIG",
        "name":  "SMB Signing Disabled / NTLM Relay",
        "category":  "Lateral Movement",
        "entry_mechanism":  "Coercing authentication and relaying NTLM hashes to hosts with SMB signing disabled.",
        "prerequisites":  [
                              "SMB signing disabled on destination servers",
                              "Local network broadcast presence"
                          ],
        "attacker_capabilities":  [
                                      "NTLM_RELAY",
                                      "PETITPOTAM_COERCE",
                                      "MACHINE_ACCOUNT_TAKEOVER"
                                  ],
        "relevant_techniques":  [
                                    "T1557.001",
                                    "T1187",
                                    "T1212"
                                ],
        "possible_initial_footholds":  [
                                           "WS-ENG-04",
                                           "WS-FIN-02"
                                       ],
        "possible_transitions":  [
                                     "Coerce DC auth -\u003e Domain takeover"
                                 ],
        "vulnerable_controls":  [
                                    "Enforce SMB Signing",
                                    "Disable NTLMv1 / Extended Protection for Auth"
                                ],
        "severity":  "CRITICAL",
        "description":  "Abuses legacy NTLM authentication quirks to execute code without needing account passwords.",
        "supporting_evidence_types":  [
                                          "LLMNR_POISONING_EVENT",
                                          "RELAY_SESSION_CREATED",
                                          "SMB_NO_SIGNING_FLAG"
                                      ]
    },
    {
        "id":  "THREAT-AI-AGENT",
        "name":  "AI / Autonomous Agent Exploitation",
        "category":  "Emerging Threat",
        "entry_mechanism":  "Indirect prompt injection or insecure tool execution in agentic pipelines.",
        "prerequisites":  [
                              "LLM / Agent service with privileged system tool access",
                              "Unsanitized external inputs"
                          ],
        "attacker_capabilities":  [
                                      "PROMPT_INJECTION",
                                      "AGENT_TOOL_HIJACK",
                                      "ARBITRARY_API_INVOCATION"
                                  ],
        "relevant_techniques":  [
                                    "T1059",
                                    "T1565",
                                    "T1499"
                                ],
        "possible_initial_footholds":  [
                                           "WEB-SRV-01",
                                           "SIEM-SOC-01"
                                       ],
        "possible_transitions":  [
                                     "Execution of unauthorized admin actions via agent backend"
                                 ],
        "vulnerable_controls":  [
                                    "Prompt Guard / Input Filtering",
                                    "Strict Tool Capability Scoping"
                                ],
        "severity":  "HIGH",
        "description":  "Tricks automated AI agents into executing privileged operating system commands or querying sensitive data.",
        "supporting_evidence_types":  [
                                          "INJECTION_PAYLOAD_MATCH",
                                          "UNEXPECTED_TOOL_INVOCATION",
                                          "POLICY_VIOLATION_TRACE"
                                      ]
    }
];

export const FALLBACK_REMEDIATIONS: RemediationPriority[] = [
    {
        "rank":  1,
        "control_name":  "Micro-Segment Backup Vault Infrastructure",
        "control_type":  "NETWORK_SEGMENTATION",
        "target_assets_or_identities":  [
                                            "VAULT-BACKUP-01"
                                        ],
        "critical_paths_eliminated":  11,
        "blast_radius_reduction_percent":  47.0,
        "attacker_effort_increase":  6.5,
        "implementation_complexity":  "MEDIUM",
        "priority_score":  96.5,
        "reasoning":  "Blocks all lateral SMB/WinRM inbound execution from compromised corporate workstations and Domain Controllers to the immutable backup server.",
        "affected_techniques_blocked":  [
                                            "T1021.002",
                                            "T1486",
                                            "T1490"
                                        ]
    },
    {
        "rank":  2,
        "control_name":  "Enforce Cryptographic MFA on Tier-0 Admin Sessions",
        "control_type":  "MFA",
        "target_assets_or_identities":  [
                                            "ID-DOMAIN-ADMIN",
                                            "ID-ENG-DEV"
                                        ],
        "critical_paths_eliminated":  8,
        "blast_radius_reduction_percent":  38.5,
        "attacker_effort_increase":  5.0,
        "implementation_complexity":  "LOW",
        "priority_score":  92.0,
        "reasoning":  "Renders pass-the-hash and credential dumping from LSASS ineffective for lateral movement between developer workstations and core infrastructure.",
        "affected_techniques_blocked":  [
                                            "T1003.001",
                                            "T1078.002",
                                            "T1558.003"
                                        ]
    },
    {
        "rank":  3,
        "control_name":  "Purge Cached Domain Admin Tokens from Dev Endpoints",
        "control_type":  "LEAST_PRIVILEGE",
        "target_assets_or_identities":  [
                                            "WS-ENG-04"
                                        ],
        "critical_paths_eliminated":  6,
        "blast_radius_reduction_percent":  31.0,
        "attacker_effort_increase":  4.2,
        "implementation_complexity":  "LOW",
        "priority_score":  85.0,
        "reasoning":  "Eliminates the critical LSASS credential dumping attack vector on engineering endpoints, breaking the primary privilege escalation chain.",
        "affected_techniques_blocked":  [
                                            "T1003.001",
                                            "T1068"
                                        ]
    },
    {
        "rank":  4,
        "control_name":  "Patch Critical Ivanti SSL-VPN Gateway (CVE-2024-21887)",
        "control_type":  "VULNERABILITY_PATCH",
        "target_assets_or_identities":  [
                                            "VPN-GW-01"
                                        ],
        "critical_paths_eliminated":  5,
        "blast_radius_reduction_percent":  26.0,
        "attacker_effort_increase":  4.0,
        "implementation_complexity":  "MEDIUM",
        "priority_score":  81.5,
        "reasoning":  "Closes the perimeter remote code execution vector allowing direct unauthenticated ingress into the internal DMZ.",
        "affected_techniques_blocked":  [
                                            "T1190",
                                            "T1133"
                                        ]
    },
    {
        "rank":  5,
        "control_name":  "Patch ZeroLogon RPC Flaw on Domain Controller (CVE-2020-1472)",
        "control_type":  "VULNERABILITY_PATCH",
        "target_assets_or_identities":  [
                                            "DC-CORP-01"
                                        ],
        "critical_paths_eliminated":  4,
        "blast_radius_reduction_percent":  22.0,
        "attacker_effort_increase":  3.8,
        "implementation_complexity":  "MEDIUM",
        "priority_score":  78.0,
        "reasoning":  "Removes cryptographic flaw allowing unauthenticated attackers with network reachability to reset DC machine accounts.",
        "affected_techniques_blocked":  [
                                            "T1068",
                                            "T1484"
                                        ]
    }
];

export const FALLBACK_RESILIENCE: ResilienceScoreResult = {
    "resilience_score":  36.3,
    "posture_rating":  "FRAGILE",
    "total_attack_paths_count":  27,
    "independent_path_clusters":  3,
    "single_points_of_failure":  [
                                     {
                                         "asset_id":  "APP-SRV-01",
                                         "name":  "Core Banking \u0026 API Microservice",
                                         "zone":  "MANAGEMENT",
                                         "criticality":  "HIGH",
                                         "vulnerabilities_count":  1,
                                         "is_mitigated":  true
                                     },
                                     {
                                         "asset_id":  "DC-CORP-01",
                                         "name":  "Corporate Active Directory Domain Controller",
                                         "zone":  "SECURE_TIER",
                                         "criticality":  "CRITICAL",
                                         "vulnerabilities_count":  1,
                                         "is_mitigated":  false
                                     },
                                     {
                                         "asset_id":  "WS-ENG-04",
                                         "name":  "Senior DevOps Engineer Laptop",
                                         "zone":  "CORPORATE_LAN",
                                         "criticality":  "MEDIUM",
                                         "vulnerabilities_count":  0,
                                         "is_mitigated":  true
                                     }
                                 ],
    "chokepoint_assets":  [
                              {
                                  "asset_id":  "APP-SRV-01",
                                  "asset_name":  "Core Banking \u0026 API Microservice",
                                  "zone":  "MANAGEMENT",
                                  "paths_intersected":  1,
                                  "total_paths":  3,
                                  "paths_eliminated_if_isolated_percent":  33.3,
                                  "recommended_intervention":  "Isolate host or enforce strict egress micro-segmentation"
                              },
                              {
                                  "asset_id":  "DC-CORP-01",
                                  "asset_name":  "Corporate Active Directory Domain Controller",
                                  "zone":  "SECURE_TIER",
                                  "paths_intersected":  3,
                                  "total_paths":  4,
                                  "paths_eliminated_if_isolated_percent":  75.0,
                                  "recommended_intervention":  "Isolate host or enforce strict egress micro-segmentation"
                              },
                              {
                                  "asset_id":  "APP-SRV-01",
                                  "asset_name":  "Core Banking \u0026 API Microservice",
                                  "zone":  "MANAGEMENT",
                                  "paths_intersected":  2,
                                  "total_paths":  4,
                                  "paths_eliminated_if_isolated_percent":  50.0,
                                  "recommended_intervention":  "Isolate host or enforce strict egress micro-segmentation"
                              },
                              {
                                  "asset_id":  "DC-CORP-01",
                                  "asset_name":  "Corporate Active Directory Domain Controller",
                                  "zone":  "SECURE_TIER",
                                  "paths_intersected":  3,
                                  "total_paths":  4,
                                  "paths_eliminated_if_isolated_percent":  75.0,
                                  "recommended_intervention":  "Isolate host or enforce strict egress micro-segmentation"
                              }
                          ],
    "factor_breakdown":  {
                             "path_redundancy_score":  15.0,
                             "control_density_score":  37.5,
                             "chokepoint_mitigation_score":  75.0,
                             "depth_defense_score":  42.2,
                             "privilege_tiering_score":  0.0
                         },
    "calculation_methodology":  "Resilience Score formula: 25% Path Redundancy + 25% Chokepoint Mitigation + 20% Defensive Control Density + 15% Depth of Defense + 15% Privilege Tiering.",
    "improvement_recommendations":  [
                                        "Sever secondary lateral paths to critical backups with micro-segmentation.",
                                        "Enforce cryptographic MFA on Domain Admin sessions and purge dev workstation tokens.",
                                        "Deploy behavioral endpoint detection (EDR) on developer endpoints."
                                    ]
};
