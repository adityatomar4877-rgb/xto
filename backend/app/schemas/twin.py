from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AssetType(str, Enum):
    WORKSTATION = "WORKSTATION"
    SERVER = "SERVER"
    APPLICATION_SERVER = "APPLICATION_SERVER"
    DOMAIN_CONTROLLER = "DOMAIN_CONTROLLER"
    DATABASE = "DATABASE"
    FIREWALL = "FIREWALL"
    VPN_GATEWAY = "VPN_GATEWAY"
    BACKUP_SERVER = "BACKUP_SERVER"
    CLOUD_INSTANCE = "CLOUD_INSTANCE"
    ROUTER = "ROUTER"
    IOT_DEVICE = "IOT_DEVICE"


class ZoneType(str, Enum):
    INTERNET = "INTERNET"
    DMZ = "DMZ"
    CORPORATE_LAN = "CORPORATE_LAN"
    MANAGEMENT = "MANAGEMENT"
    SECURE_TIER = "SECURE_TIER"
    BACKUP_VAULT = "BACKUP_VAULT"
    CLOUD_VPC = "CLOUD_VPC"


class CriticalityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class PrivilegeLevel(str, Enum):
    STANDARD = "STANDARD"
    ELEVATED = "ELEVATED"
    LOCAL_ADMIN = "LOCAL_ADMIN"
    DOMAIN_ADMIN = "DOMAIN_ADMIN"
    SYSTEM = "SYSTEM"


class CredentialState(str, Enum):
    ACTIVE = "ACTIVE"
    COMPROMISED = "COMPROMISED"
    REVOKED = "REVOKED"
    EXPIRED = "EXPIRED"
    LEAKED = "LEAKED"


class RelationshipType(str, Enum):
    NETWORK_REACHABILITY = "NETWORK_REACHABILITY"
    TRUST = "TRUST"
    AUTHENTICATION = "AUTHENTICATION"
    PRIVILEGE = "PRIVILEGE"
    SESSION = "SESSION"
    CREDENTIAL_ACCESS = "CREDENTIAL_ACCESS"
    REMOTE_EXECUTION = "REMOTE_EXECUTION"


class Vulnerability(BaseModel):
    cve: str
    name: str
    severity: CriticalityLevel = CriticalityLevel.HIGH
    cvss_score: float = 7.5
    affected_service: str
    exploitable_technique: str
    patch_available: bool = True
    description: str = ""


class SecurityControl(BaseModel):
    id: str
    name: str
    type: str  # e.g., MFA, NETWORK_SEGMENTATION, EDR, WAF, LEAST_PRIVILEGE, HOST_ISOLATION
    description: str = ""
    is_active: bool = True
    coverage_scope: List[str] = Field(default_factory=list)  # asset_ids, zones, or identities
    effectiveness: float = 0.9  # 0.0 - 1.0 blocking probability
    is_virtual: bool = False  # Set to True when simulated in Defense Sandbox


class Identity(BaseModel):
    id: str
    name: str
    type: str = "USER"  # USER, SERVICE_ACCOUNT, ADMIN
    role: str
    privilege_level: PrivilegeLevel = PrivilegeLevel.STANDARD
    accessible_assets: List[str] = Field(default_factory=list)
    credential_state: CredentialState = CredentialState.ACTIVE
    auth_methods: List[str] = Field(default_factory=lambda: ["PASSWORD"])
    mfa_enabled: bool = False
    trust_relationships: List[str] = Field(default_factory=list)


class Relationship(BaseModel):
    id: str
    source_id: str
    target_id: str
    type: RelationshipType
    protocol: Optional[str] = "TCP"
    port: Optional[int] = None
    bidirectional: bool = False
    trust_level: float = 0.5  # 0.0 to 1.0
    is_blocked: bool = False
    properties: Dict[str, Any] = Field(default_factory=dict)


# ── Behavioural Telemetry Models (anomaly-detection inputs) ────────────────

class LoginEvent(BaseModel):
    timestamp: str  # ISO 8601
    user: str
    source_ip: str
    success: bool = True
    auth_method: str = "PASSWORD"


class TrafficFlow(BaseModel):
    timestamp: str  # ISO 8601
    dest_ip: str
    dest_port: int
    protocol: str = "TCP"
    bytes_transferred: int = 0
    direction: str = "OUTBOUND"  # OUTBOUND / INBOUND


class ProcessEvent(BaseModel):
    timestamp: str  # ISO 8601
    process_name: str
    user: str
    command_line: str = ""
    is_anomalous: bool = False


class BehaviouralBaseline(BaseModel):
    normal_login_hours: str = "06:00-19:00"  # 24h local-time window
    normal_source_ips: List[str] = Field(default_factory=list)
    normal_destinations: List[str] = Field(default_factory=list)
    baseline_avg_outbound_bytes: int = 500_000
    whitelisted_processes: List[str] = Field(default_factory=list)


class Asset(BaseModel):
    id: str
    name: str
    type: AssetType
    zone: ZoneType
    criticality: CriticalityLevel = CriticalityLevel.MEDIUM
    ip_address: str = "10.0.0.1"
    os: str = "Linux"
    department: str = "IT"
    services: List[str] = Field(default_factory=list)
    vulnerabilities: List[Vulnerability] = Field(default_factory=list)
    controls: List[str] = Field(default_factory=list)  # Control IDs applied to this asset
    identities: List[str] = Field(default_factory=list)  # Identity IDs associated
    is_compromised: bool = False
    criticality_score: float = 5.0  # 1.0 - 10.0 numeric weight
    # Behavioural telemetry
    login_history: List[LoginEvent] = Field(default_factory=list)
    traffic_flows: List[TrafficFlow] = Field(default_factory=list)
    process_activity: List[ProcessEvent] = Field(default_factory=list)
    behavioural_baseline: Optional[BehaviouralBaseline] = None
    anomaly_score: float = 0.0  # 0.0 - 100.0 computed by behavioural scanner


class DigitalTwinTopology(BaseModel):
    snapshot_id: str = "snapshot_001"
    version: int = 1
    timestamp: str
    name: str = "Corporate Enterprise Digital Twin"
    assets: List[Asset]
    identities: List[Identity]
    relationships: List[Relationship]
    controls: List[SecurityControl]
    stats: Dict[str, Any] = Field(default_factory=dict)


class EnvironmentChange(BaseModel):
    change_id: str
    timestamp: str
    change_type: str  # ASSET_ADDED, ASSET_REMOVED, CONTROL_UPDATED, RELATIONSHIP_ALTERED, VULNERABILITY_DETECTED
    target_id: str
    details: Dict[str, Any]
    impact_level: CriticalityLevel = CriticalityLevel.MEDIUM
