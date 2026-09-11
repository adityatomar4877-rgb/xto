import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus,
  Minus,
  RotateCcw,
  Globe,
  Shield,
  Server,
  Cloud,
  Layers,
  User,
  Database,
  Monitor,
  HardDrive,
  Radio,
  Zap,
  Info,
  X,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Asset, Relationship } from "@/lib/api";
import { EASE } from "@/lib/animations";

export interface PredictedNextHop {
  sourceId: string;
  targetId: string;
  techniqueId?: string;
  techniqueName?: string;
  confidence?: number;
  phase?: string;
  explanation?: string;
}

export interface Tactical3DSceneProps {
  height?: string;
  assets?: Asset[];
  relationships?: Relationship[];
  selectedAssetId?: string;
  onSelectAsset?: (asset: any) => void;
  highlightPath?: string[]; // Traversed / detected nodes [e.g. "EXT-INTERNET", "FW-EDGE-01", "WS-ENG-04"]
  compromisedNodes?: string[]; // Compromised node IDs
  predictedNextHop?: PredictedNextHop | null; // MITRE predicted next move
  activeStepNode?: string; // Current step active target node
}

export const COLOR_CODE_GUIDE = [
  {
    id: "normal",
    label: "Normal / Monitored Asset",
    color: "#0284C7",
    badgeBg: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
    summary: "Healthy operational enterprise host without detected adversary foothold.",
    meaning: "Baseline system under active security monitoring. Operational services are mapped in the digital twin.",
    examples: "Web Servers, App Servers, Finance Workstations, SIEM SOC, EKS Cluster nodes",
    action: "Maintain continuous posture monitoring and EDR telemetry collection.",
  },
  {
    id: "compromised",
    label: "Compromised Asset / Foothold",
    color: "#EF4444",
    badgeBg: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    summary: "Penetrated asset with confirmed adversary interactive execution or stolen session.",
    meaning: "The attacker has established execution via phished credentials, exploited RCE, or credential dumping.",
    examples: "DevOps Laptop (WS-ENG-04), Penetrated VPN Gateway, Compromised App Container",
    action: "Isolate host immediately, revoke active sessions, and purge cached LSASS / NTLM tokens.",
  },
  {
    id: "predicted",
    label: "MITRE ATT&CK Predicted Move",
    color: "#EAB308",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    summary: "High-probability next adversary target predicted by graph trust & MITRE tactics.",
    meaning: "Identified via multi-hop pathfinding as the next logical transition (e.g. pivoting to DC via ZeroLogon).",
    examples: "Active Directory Domain Controller (DC-CORP-01), Central Database",
    action: "Deploy preventive controls (MFA enforcement, RPC filtering) before the adversary pivots.",
  },
  {
    id: "crown_jewel",
    label: "Crown Jewel (Tier-0 Target)",
    color: "#8B5CF6",
    badgeBg: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    summary: "Mission-critical high-value asset whose compromise represents catastrophic business loss.",
    meaning: "Core assets targeted by ransomware syndicates for encryption, data exfiltration, or domain dominance.",
    examples: "Immutable Ransomware Backup Vault (VAULT-BACKUP-01), Production Customer Database (DB-PROD-01)",
    action: "Air-gap, enforce Tier-0 Hardware MFA, and restrict all inbound administrative execution channels.",
  },
  {
    id: "adversary",
    label: "Adversary Space / External Internet",
    color: "#0F172A",
    badgeBg: "bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
    summary: "Untrusted external space where phishing, C2 servers, and threat actors originate.",
    meaning: "Initial external attack surface. Serves as root origin for external penetration simulations.",
    examples: "External Threat Actor / Internet (EXT-INTERNET)",
    action: "Maintain strict perimeter firewall policies and block known malicious C2 IP feeds.",
  },
  {
    id: "attack_path",
    label: "Traversed Attack Path (Red Conduit)",
    color: "#DC2626",
    isLine: true,
    badgeBg: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    summary: "Confirmed chronological movement executed by the adversary during the simulation.",
    meaning: "A lateral network connection, credential pass, or remote execution successfully exploited by the attacker.",
    examples: "WS-ENG-04 → DC-CORP-01 via Kerberos / RPC (T1068 / T1003)",
    action: "Sever the underlying network or authentication relationship to break the attack kill chain.",
  },
  {
    id: "trust_route",
    label: "Trust Route / Baseline Channel (Gray Dashed)",
    color: "#94A3B8",
    isLine: true,
    isDashed: true,
    badgeBg: "bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
    summary: "Authorized network reachability or normal operational data flow.",
    meaning: "Permitted communication paths existing in normal enterprise infrastructure.",
    examples: "APP-SRV-01 → DB-PROD-01 (TCP :5432), DC-CORP-01 → SIEM (Syslog :514)",
    action: "Review for over-permissive trust boundaries and enforce network micro-segmentation.",
  },
];

export interface TopologyNode {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  zone: string;
  x: number;
  y: number;
  icon: any;
  isCrownJewel?: boolean;
  isInternet?: boolean;
}

const ICON_MAP: Record<string, any> = {
  WORKSTATION: Monitor,
  SERVER: Server,
  APPLICATION_SERVER: Server,
  DOMAIN_CONTROLLER: User,
  DATABASE: Database,
  FIREWALL: Shield,
  VPN_GATEWAY: Shield,
  BACKUP_SERVER: HardDrive,
  CLOUD_INSTANCE: Cloud,
  ROUTER: Globe,
  IOT_DEVICE: Radio,
};

const CROWN_JEWEL_ZONES = ["SECURE_TIER", "BACKUP_VAULT"];

// Preset positions for known seed assets (best visual layout)
const PRESET_POSITIONS: Record<string, { x: number; y: number }> = {
  "EXT-INTERNET": { x: 80, y: 280 },
  "FW-EDGE-01": { x: 210, y: 280 },
  "WEB-SRV-01": { x: 310, y: 195 },
  "VPN-GW-01": { x: 310, y: 365 },
  "WS-FIN-02": { x: 460, y: 175 },
  "WS-ENG-04": { x: 460, y: 295 },
  "APP-SRV-01": { x: 610, y: 195 },
  "DC-CORP-01": { x: 610, y: 320 },
  "SIEM-SOC-01": { x: 610, y: 430 },
  "CLOUD-K8S-01": { x: 770, y: 185 },
  "DB-PROD-01": { x: 770, y: 280 },
  "VAULT-BACKUP-01": { x: 910, y: 325 },
};

function generateLayout(assets: Asset[]): { nodes: TopologyNode[]; routes: { from: string; to: string; id: string }[] } {
  const nodes: TopologyNode[] = assets.map((a, i) => {
    const preset = PRESET_POSITIONS[a.id];
    const isInternet = a.id === "EXT-INTERNET" || a.zone === "INTERNET";
    const isCrownJewel = CROWN_JEWEL_ZONES.includes(a.zone) || a.criticality === "CRITICAL";

    let x: number, y: number;
    if (preset) {
      x = preset.x;
      y = preset.y;
    } else {
      // Auto-layout for unknown assets: arrange in a grid
      const cols = Math.ceil(Math.sqrt(assets.length));
      const col = i % cols;
      const row = Math.floor(i / cols);
      x = 100 + col * 130;
      y = 120 + row * 120;
    }

    return {
      id: a.id,
      name: a.id,
      subtitle: a.name.length > 24 ? a.name.slice(0, 24) + "..." : a.name,
      type: a.type,
      zone: a.zone,
      x,
      y,
      icon: ICON_MAP[a.type] || Server,
      isCrownJewel,
      isInternet,
    };
  });

  return { nodes, routes: [] };
}

function generateRoutePath(fromNode: TopologyNode, toNode: TopologyNode): string {
  const { x: x1, y: y1 } = fromNode;
  const { x: x2, y: y2 } = toNode;
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (Math.abs(dx) < 6 || Math.abs(dy) < 6) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  const cx1 = x1 + dx * 0.45;
  const cy1 = y1;
  const cx2 = x2 - dx * 0.45;
  const cy2 = y2;
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}

export function getNodeColorStatus(
  node: TopologyNode,
  isCompromised: boolean,
  isPredictedTarget: boolean
) {
  if (isCompromised) {
    return {
      statusId: "compromised",
      name: "Compromised Foothold",
      haloColor: "#EF4444",
      bgFill: "#FEE2E2",
      textColor: "text-red-600",
      badgeClass: "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800",
      description: "Confirmed active adversary execution or stolen session credentials.",
    };
  }
  if (isPredictedTarget) {
    return {
      statusId: "predicted",
      name: "Predicted Next Move",
      haloColor: "#EAB308",
      bgFill: "#FEF9C3",
      textColor: "text-amber-700",
      badgeClass: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
      description: "Highest probability next target predicted by MITRE ATT&CK tactics.",
    };
  }
  if (node.isCrownJewel) {
    return {
      statusId: "crown_jewel",
      name: "Crown Jewel (Tier-0)",
      haloColor: "#8B5CF6",
      bgFill: "#F3E8FF",
      textColor: "text-purple-600",
      badgeClass: "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800",
      description: "Mission-critical corporate asset requiring absolute isolation & Tier-0 controls.",
    };
  }
  if (node.isInternet) {
    return {
      statusId: "adversary",
      name: "Adversary Space",
      haloColor: "#0F172A",
      bgFill: "#0F172A",
      textColor: "text-slate-400",
      badgeClass: "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
      description: "External untrusted origin / remote threat actor network.",
    };
  }
  return {
    statusId: "normal",
    name: "Monitored Asset",
    haloColor: "#0284C7",
    bgFill: "#E0F2FE",
    textColor: "text-sky-600",
    badgeClass: "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800",
    description: "Operational enterprise system under continuous telemetry & monitoring.",
  };
}

export const Tactical3DScene: React.FC<Tactical3DSceneProps> = ({
  height = "h-[440px]",
  assets,
  relationships,
  onSelectAsset,
  highlightPath = [],
  compromisedNodes = [],
  predictedNextHop = null,
  activeStepNode,
  selectedAssetId,
}) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(selectedAssetId || activeStepNode || null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showColorGuide, setShowColorGuide] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);
  const [activeFilterStatus, setActiveFilterStatus] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Build nodes and routes from real data, fall back to empty if no assets
  const { nodes: realNodes, routes: realRoutes } = useMemo(() => {
    if (assets && assets.length > 0) {
      return generateLayout(assets);
    }
    return { nodes: [], routes: [] };
  }, [assets]);

  // GSAP staggered entrance for topology nodes
  useEffect(() => {
    if (!svgRef.current || realNodes.length === 0) return;
    const nodeGroups = svgRef.current.querySelectorAll("g[data-node]");
    if (nodeGroups.length === 0) return;
    gsap.fromTo(
      nodeGroups,
      { opacity: 0, scale: 0.5, transformOrigin: "center center" },
      { opacity: 1, scale: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" }
    );
  }, [realNodes]);

  // Build routes from real relationships
  const routes = useMemo(() => {
    if (relationships && relationships.length > 0) {
      return relationships.map((r) => ({ id: r.id, from: r.source_id, to: r.target_id }));
    }
    return realRoutes;
  }, [relationships, realRoutes]);

  const nodeMap = new Map<string, TopologyNode>();
  realNodes.forEach((n) => nodeMap.set(n.id, n));

  const assetCount = realNodes.length;
  const routeCount = routes.length;

  const isRouteDetected = (fromId: string, toId: string) => {
    if (!highlightPath || highlightPath.length < 2) return false;
    for (let i = 0; i < highlightPath.length - 1; i++) {
      if (
        (highlightPath[i] === fromId && highlightPath[i + 1] === toId) ||
        (highlightPath[i] === toId && highlightPath[i + 1] === fromId)
      ) {
        return true;
      }
    }
    return false;
  };

  const isRoutePredicted = (fromId: string, toId: string) => {
    if (!predictedNextHop) return false;
    return (
      (predictedNextHop.sourceId === fromId && predictedNextHop.targetId === toId) ||
      (predictedNextHop.sourceId === toId && predictedNextHop.targetId === fromId)
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className={`relative w-full ${height} bg-[#FFFFFF] dark:bg-[#131316] rounded-2xl border border-[#ECECEF] dark:border-[#25252A] overflow-hidden select-none flex flex-col`}
    >
      {/* Header with Quick Color Key & Guide Toggle */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#ECECEF]/60 dark:border-[#25252A]/60 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-[14px] font-bold tracking-tight text-slate-900 dark:text-white">Digital Twin Topology</h2>
            <p className="text-[10.5px] text-[#A1A1AA]">
              {assetCount} assets · {routeCount} routes
            </p>
          </div>

          {/* Active Filter Badge */}
          {activeFilterStatus && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[10.5px] font-semibold text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800 animate-in fade-in">
              <span>Filter: <strong className="uppercase">{activeFilterStatus.replace('_', ' ')}</strong></span>
              <button
                onClick={() => setActiveFilterStatus(null)}
                className="hover:text-red-600 font-bold ml-1 cursor-pointer"
                title="Clear filter"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Quick Color Code Key Chips & Controls */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#1A1A1E] px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 text-[9.5px] uppercase font-mono mr-1">Color Key:</span>
            <button
              onClick={() => setActiveFilterStatus(activeFilterStatus === "normal" ? null : "normal")}
              className={`flex items-center gap-1 hover:opacity-80 px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                activeFilterStatus === "normal" ? "bg-sky-100 dark:bg-sky-950/80 text-sky-700 font-bold" : ""
              }`}
              title="Click to spotlight Normal / Monitored hosts"
            >
              <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
              <span>Normal</span>
            </button>
            <button
              onClick={() => setActiveFilterStatus(activeFilterStatus === "compromised" ? null : "compromised")}
              className={`flex items-center gap-1 hover:opacity-80 px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                activeFilterStatus === "compromised" ? "bg-red-100 dark:bg-red-950/80 text-red-700 font-bold" : "text-red-600 font-semibold"
              }`}
              title="Click to spotlight Compromised Footholds"
            >
              <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
              <span>Compromised</span>
            </button>
            <button
              onClick={() => setActiveFilterStatus(activeFilterStatus === "predicted" ? null : "predicted")}
              className={`flex items-center gap-1 hover:opacity-80 px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                activeFilterStatus === "predicted" ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 font-bold" : "text-amber-600 font-semibold"
              }`}
              title="Click to spotlight MITRE Predicted Next Moves"
            >
              <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
              <span>Predicted Target</span>
            </button>
            <button
              onClick={() => setActiveFilterStatus(activeFilterStatus === "crown_jewel" ? null : "crown_jewel")}
              className={`flex items-center gap-1 hover:opacity-80 px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                activeFilterStatus === "crown_jewel" ? "bg-purple-100 dark:bg-purple-950/80 text-purple-700 font-bold" : "text-purple-600 font-semibold"
              }`}
              title="Click to spotlight Crown Jewels (Tier-0 Targets)"
            >
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
              <span>Crown Jewel</span>
            </button>
          </div>

          {/* Color Code Guide Button */}
          <button
            onClick={() => setShowColorGuide(!showColorGuide)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FF5722]/10 hover:bg-[#FF5722]/20 text-[#FF5722] font-semibold text-[11px] border border-[#FF5722]/30 transition-all cursor-pointer"
            title="Open comprehensive color code guide"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showColorGuide ? "Hide Guide" : "Color Guide"}</span>
          </button>

          {/* Reset View Button */}
          <button
            onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); setActiveFilterStatus(null); }}
            className="w-7 h-7 rounded-xl hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1E] flex items-center justify-center text-[#A1A1AA] transition-colors cursor-pointer"
            title="Reset Zoom & Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Predicted Next Move Banner with explicit yellow status indicator */}
      {predictedNextHop && (
        <div className="px-5 py-2 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-transparent dark:from-amber-950/30 dark:via-amber-950/10 border-b border-amber-200/60 dark:border-amber-800/40 flex items-center gap-2 z-10 flex-shrink-0 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping flex-shrink-0" />
          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[9.5px] shadow-xs">
            🟡 PREDICTED NEXT TARGET
          </span>
          <span className="px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-mono font-bold text-[10px]">
            {predictedNextHop.techniqueId || "T1003"}
          </span>
          <span className="text-[#71717A] dark:text-[#9B9BA4] font-medium">
            {predictedNextHop.techniqueName || "Credential Dumping"}
          </span>
          <span className="text-[#A1A1AA]">→</span>
          <span className="font-mono font-bold text-amber-900 dark:text-amber-300">
            {predictedNextHop.targetId}
          </span>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold ml-auto">{predictedNextHop.confidence || 94}% confidence</span>
        </div>
      )}

      {/* Topology viewport */}
      <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-[#FAFAFA] dark:bg-[#0A0A0B] flex flex-col">
        {/* Dot grid — very subtle */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#D4D4D8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Scalable Vector Canvas */}
        <div
          className="relative w-full flex-1 min-h-0"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: "center center",
            transition: "transform 0.15s ease-out",
          }}
        >
          <svg ref={svgRef} className="w-full h-full" viewBox="0 0 990 500">
            <defs>
              <filter id="softCyanGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="9" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="softPurpleGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="11" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="redDetectedGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="yellowPredictedGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. BASE TRUST ROUTES */}
            {routes.map((route) => {
              const from = nodeMap.get(route.from);
              const to = nodeMap.get(route.to);
              if (!from || !to) return null;
              const d = generateRoutePath(from, to);
              const detected = isRouteDetected(route.from, route.to);
              const predicted = isRoutePredicted(route.from, route.to);
              if (detected || predicted) return null;

              return (
                <g
                  key={`base-route-${route.id}`}
                  onMouseEnter={() => setHoveredRouteId(route.id)}
                  onMouseLeave={() => setHoveredRouteId(null)}
                  className="transition-opacity"
                  opacity={activeFilterStatus ? 0.2 : 1}
                >
                  <path
                    d={d}
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="1.6"
                    strokeDasharray="4,4"
                    className="dark:stroke-[#27272D] transition-all hover:stroke-[#94A3B8]"
                  />
                </g>
              );
            })}

            {/* 2. CONFIRMED TRAVERSED ATTACK PATHS (RED) */}
            {(() => {
              if (!highlightPath || highlightPath.length < 2) return null;
              const hops: { from: string; to: string; index: number }[] = [];
              for (let i = 0; i < highlightPath.length - 1; i++) {
                hops.push({ from: highlightPath[i], to: highlightPath[i + 1], index: i });
              }
              return hops.map((hop) => {
                const from = nodeMap.get(hop.from);
                const to = nodeMap.get(hop.to);
                if (!from || !to) return null;
                const d = generateRoutePath(from, to);
                return (
                  <g
                    key={`detected-direct-${hop.from}-${hop.to}-${hop.index}`}
                    onMouseEnter={() => setHoveredRouteId(`detected-${hop.from}-${hop.to}`)}
                    onMouseLeave={() => setHoveredRouteId(null)}
                  >
                    <path d={d} fill="none" stroke="#EF4444" strokeWidth="8" strokeOpacity="0.28" strokeLinecap="round" filter="url(#redDetectedGlow)" />
                    <path d={d} fill="none" stroke="#DC2626" strokeWidth="2.8" strokeLinecap="round" />
                    <circle r="4" fill="#EF4444">
                      <animateMotion path={d} dur="2.4s" repeatCount="indefinite" />
                    </circle>
                  </g>
                );
              });
            })()}

            {/* 3. PREDICTED NEXT MOVE PATH (YELLOW) */}
            {(() => {
              if (!predictedNextHop || !predictedNextHop.sourceId || !predictedNextHop.targetId) return null;
              if (predictedNextHop.sourceId === predictedNextHop.targetId) return null;
              const from = nodeMap.get(predictedNextHop.sourceId);
              const to = nodeMap.get(predictedNextHop.targetId);
              if (!from || !to) return null;
              const d = generateRoutePath(from, to);
              return (
                <g
                  key={`predicted-direct-${predictedNextHop.sourceId}-${predictedNextHop.targetId}`}
                  onMouseEnter={() => setHoveredRouteId("predicted-hop")}
                  onMouseLeave={() => setHoveredRouteId(null)}
                >
                  <path d={d} fill="none" stroke="#FACC15" strokeWidth="8" strokeOpacity="0.35" strokeLinecap="round" filter="url(#yellowPredictedGlow)" />
                  <path d={d} fill="none" stroke="#EAB308" strokeWidth="2.8" strokeDasharray="6,4" strokeLinecap="round" />
                  <circle r="4.5" fill="#FACC15">
                    <animateMotion path={d} dur="1.6s" repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })()}

            {/* 4. RENDER TOPOLOGY NODES WITH RICH STATUS HOVER HUD */}
            {realNodes.map((n) => {
              const isSelected = activeNodeId === n.id || selectedAssetId === n.id || activeStepNode === n.id;
              const isTraversed = highlightPath.includes(n.id);
              const isCompromised = compromisedNodes.includes(n.id) || (isTraversed && !n.isInternet);
              const isPredictedTarget = predictedNextHop?.targetId === n.id;
              const status = getNodeColorStatus(n, isCompromised, isPredictedTarget);
              const isHovered = hoveredNodeId === n.id;
              const Icon = n.icon;

              // Filter spotlighting
              const isDimmed = activeFilterStatus && status.statusId !== activeFilterStatus;

              return (
                <g
                  key={n.id}
                  data-node={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  onClick={() => {
                    setActiveNodeId(n.id);
                    if (onSelectAsset) onSelectAsset(n);
                  }}
                  onMouseEnter={() => setHoveredNodeId(n.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  opacity={isDimmed ? 0.15 : 1}
                  className="cursor-pointer group/node transition-opacity duration-200"
                >
                  {/* Animated Golden Radar Ring for Predicted Next Move */}
                  {isPredictedTarget && (
                    <circle r="32" fill="none" stroke="#EAB308" strokeWidth="2" strokeDasharray="4,3" opacity="0.9">
                      <animate attributeName="r" values="22;38;22" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Soft Diffuse Halo */}
                  <circle
                    r={n.isCrownJewel ? 38 : 30}
                    fill={
                      isCompromised
                        ? "rgba(239, 68, 68, 0.28)"
                        : isPredictedTarget
                        ? "rgba(234, 179, 8, 0.32)"
                        : n.isCrownJewel
                        ? "rgba(168, 85, 247, 0.22)"
                        : "rgba(2, 132, 199, 0.20)"
                    }
                    filter={n.isCrownJewel ? "url(#softPurpleGlow)" : "url(#softCyanGlow)"}
                  />

                  {/* Secondary Inner Halo */}
                  <circle
                    r={n.isCrownJewel ? 28 : 24}
                    fill={
                      isCompromised
                        ? "rgba(239, 68, 68, 0.15)"
                        : isPredictedTarget
                        ? "rgba(234, 179, 8, 0.2)"
                        : n.isCrownJewel
                        ? "rgba(168, 85, 247, 0.14)"
                        : "rgba(2, 132, 199, 0.12)"
                    }
                  />

                  {/* Outer Ring Circle */}
                  <circle
                    r={20}
                    fill="#FFFFFF"
                    stroke={
                      isCompromised
                        ? "#EF4444"
                        : isPredictedTarget
                        ? "#EAB308"
                        : isSelected
                        ? "#FF5722"
                        : n.isCrownJewel
                        ? "#8B5CF6"
                        : "#0284C7"
                    }
                    strokeWidth={isSelected ? 3 : isCompromised || isPredictedTarget ? 2.5 : 2}
                    className="transition-all duration-200"
                  />

                  {/* Inner Node Graphic */}
                  {n.isInternet ? (
                    <circle r="14" fill="#0F172A" />
                  ) : (
                    <circle
                      r="14"
                      fill={
                        isCompromised
                          ? "#FEE2E2"
                          : isPredictedTarget
                          ? "#FEF9C3"
                          : n.isCrownJewel
                          ? "#F3E8FF"
                          : "#E0F2FE"
                      }
                    />
                  )}

                  {/* Center Icon */}
                  <foreignObject x="-9" y="-9" width="18" height="18">
                    <div className="w-full h-full flex items-center justify-center pointer-events-none">
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          n.isInternet
                            ? "text-white"
                            : isCompromised
                            ? "text-red-600"
                            : isPredictedTarget
                            ? "text-amber-700"
                            : n.isCrownJewel
                            ? "text-purple-600"
                            : "text-sky-600"
                        }`}
                      />
                    </div>
                  </foreignObject>

                  {/* Floating MITRE Technique Tag on Predicted Target */}
                  {isPredictedTarget && (
                    <foreignObject x="-60" y="-48" width="120" height="26">
                      <div className="w-full flex items-center justify-center">
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[8.5px] font-black font-mono shadow-md border border-amber-300 animate-bounce">
                          {predictedNextHop?.techniqueId || "NEXT"}
                        </span>
                      </div>
                    </foreignObject>
                  )}

                  {/* Node Title Label */}
                  <text
                    y={32}
                    textAnchor="middle"
                    fill={isCompromised ? "#DC2626" : n.isCrownJewel ? "#7C3AED" : "#0F172A"}
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="Inter, sans-serif"
                    letterSpacing="0.01em"
                  >
                    {n.name}
                  </text>

                  {/* Node Subtitle */}
                  <text
                    y={43}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="8"
                    fontFamily="Inter, sans-serif"
                  >
                    {n.subtitle}
                  </text>

                  {/* ── INTERACTIVE FLOATING HOVER HUD CARD ── */}
                  {isHovered && (
                    <foreignObject
                      x="-105"
                      y={n.y < 120 ? 46 : -112}
                      width="210"
                      height="110"
                      className="pointer-events-none z-50 overflow-visible"
                    >
                      <div className="p-2.5 rounded-xl bg-slate-950/95 dark:bg-[#18181D]/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-white text-[10px] space-y-1 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between gap-1 pb-1 border-b border-slate-800">
                          <span className="font-bold text-white font-mono text-[11px] truncate">{n.name}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold font-mono border ${status.badgeClass}`}>
                            {status.statusId.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-[9.5px]">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: status.haloColor,
                              boxShadow: `0 0 6px ${status.haloColor}`,
                            }}
                          />
                          <span style={{ color: status.haloColor }}>{status.name}</span>
                        </div>
                        <p className="text-[9px] text-slate-300 leading-tight">
                          {status.description}
                        </p>
                        <div className="pt-1 border-t border-slate-800/80 text-[8.5px] text-slate-400 flex justify-between font-mono">
                          <span>Zone: {n.zone}</span>
                          <span>Type: {n.type}</span>
                        </div>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── EXPANDABLE COLOR CODE GUIDE MODAL / DRAWER ── */}
        {showColorGuide && (
          <div className="absolute inset-0 bg-white/98 dark:bg-[#131316]/98 backdrop-blur-xl z-30 p-5 overflow-y-auto flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#ECECEF] dark:border-[#25252A]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#FFF2EB] dark:bg-[#2A1711] border border-[#FF5722]/30 flex items-center justify-center text-[#FF5722]">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                      DIGITAL TWIN TOPOLOGY COLOR CODE SPECIFICATION
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Standardized visual security posture indicators across assets, attack paths, and predicted MITRE transitions.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowColorGuide(false)}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Color Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
                {COLOR_CODE_GUIDE.map((item) => {
                  const isSelected = selectedGuideId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedGuideId(isSelected ? null : item.id);
                        setActiveFilterStatus(item.id);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-orange-50/70 dark:bg-orange-950/30 border-[#FF5722] shadow-md ring-1 ring-[#FF5722]/20"
                          : "bg-slate-50/70 dark:bg-[#1A1A1E]/70 border-[#ECECEF] dark:border-[#2A2A30] hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {item.isLine ? (
                            item.isDashed ? (
                              <div className="w-5 border-b-2 border-dashed border-[#94A3B8]" />
                            ) : (
                              <div className="w-5 h-1 bg-[#EF4444] rounded shadow-[0_0_6px_#EF4444]" />
                            )
                          ) : (
                            <span
                              className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: item.color,
                                boxShadow: `0 0 10px ${item.color}90`,
                              }}
                            />
                          )}
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.label}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${item.badgeBg}`}>
                          {item.id.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.meaning}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/70 dark:border-slate-800/80 space-y-1 text-[10.5px]">
                        <div>
                          <span className="text-slate-400 uppercase font-semibold text-[9.5px]">Examples: </span>
                          <span className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">{item.examples}</span>
                        </div>
                        <div>
                          <span className="text-amber-600 dark:text-amber-400 uppercase font-semibold text-[9.5px]">Defender Action: </span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium text-[10px]">{item.action}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>All color states update dynamically in real time during attack simulations and what-if defense validations.</span>
              <button
                onClick={() => setShowColorGuide(false)}
                className="px-4 py-1.5 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] text-white font-semibold cursor-pointer shadow-sm"
              >
                Close Guide
              </button>
            </div>
          </div>
        )}

        {/* ── DOCKED MINIMAL COLOR CODE LEGEND BAR (Always visible at bottom) ── */}
        <div className="flex-shrink-0 border-t border-[#ECECEF] dark:border-[#25252A] px-4 py-2 bg-white/98 dark:bg-[#131316]/98 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 text-[11px] z-20 shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Normal */}
            <div
              onClick={() => {
                setActiveFilterStatus(activeFilterStatus === "normal" ? null : "normal");
              }}
              className={`flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity px-1.5 py-0.5 rounded ${activeFilterStatus === "normal" ? "bg-sky-100 dark:bg-sky-950 font-bold" : ""}`}
              title="Click to spotlight Normal / Monitored hosts"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] ring-2 ring-[#0284C7]/20 flex-shrink-0 shadow-[0_0_6px_#0284C7]" />
              <span className="text-slate-600 dark:text-slate-400 font-medium text-[10.5px]">🔵 Normal (Monitored)</span>
            </div>

            {/* Compromised */}
            <div
              onClick={() => {
                setActiveFilterStatus(activeFilterStatus === "compromised" ? null : "compromised");
              }}
              className={`flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity px-1.5 py-0.5 rounded ${activeFilterStatus === "compromised" ? "bg-red-100 dark:bg-red-950 font-bold" : ""}`}
              title="Click to spotlight Compromised Footholds"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-2 ring-[#EF4444]/30 animate-pulse flex-shrink-0 shadow-[0_0_8px_#EF4444]" />
              <span className="text-red-600 font-bold text-[10.5px]">🔴 Compromised Foothold</span>
            </div>

            {/* Predicted Next Move */}
            <div
              onClick={() => {
                setActiveFilterStatus(activeFilterStatus === "predicted" ? null : "predicted");
              }}
              className={`flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity px-1.5 py-0.5 rounded ${activeFilterStatus === "predicted" ? "bg-amber-100 dark:bg-amber-950 font-bold" : ""}`}
              title="Click to spotlight MITRE Predicted Next Move"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308] ring-2 ring-[#EAB308]/30 flex-shrink-0 shadow-[0_0_8px_#EAB308]" />
              <span className="text-amber-600 font-bold text-[10.5px]">🟡 Predicted Move</span>
            </div>

            {/* Crown Jewel */}
            <div
              onClick={() => {
                setActiveFilterStatus(activeFilterStatus === "crown_jewel" ? null : "crown_jewel");
              }}
              className={`flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity px-1.5 py-0.5 rounded ${activeFilterStatus === "crown_jewel" ? "bg-purple-100 dark:bg-purple-950 font-bold" : ""}`}
              title="Click to spotlight Tier-0 Crown Jewels"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] ring-2 ring-[#8B5CF6]/30 flex-shrink-0 shadow-[0_0_8px_#8B5CF6]" />
              <span className="text-purple-600 font-bold text-[10.5px]">🟣 Crown Jewel</span>
            </div>

            {/* Adversary Space */}
            <div
              onClick={() => {
                setActiveFilterStatus(activeFilterStatus === "adversary" ? null : "adversary");
              }}
              className={`flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity px-1.5 py-0.5 rounded ${activeFilterStatus === "adversary" ? "bg-slate-200 dark:bg-slate-800 font-bold" : ""}`}
              title="Click to spotlight Adversary Space"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F172A] ring-2 ring-slate-400/20 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400 font-medium text-[10.5px]">⚫ Adversary Space</span>
            </div>

            {/* Traversed Attack Path */}
            <div
              className="flex items-center gap-1.5 hidden sm:flex"
              title="Red solid conduit: Confirmed lateral movement"
            >
              <div className="w-4 h-0.5 bg-[#EF4444] rounded flex-shrink-0 shadow-[0_0_5px_#EF4444]" />
              <span className="text-red-600 font-medium text-[10.5px]">── Attack Path</span>
            </div>

            {/* Trust Route */}
            <div
              className="flex items-center gap-1.5 hidden sm:flex"
              title="Gray dashed line: Normal authorized network channel"
            >
              <div className="w-4 border-b border-dashed border-[#94A3B8] flex-shrink-0" />
              <span className="text-slate-400 font-medium text-[10.5px]">╌╌ Trust Route</span>
            </div>
          </div>

          {/* Color Code Guide Button */}
          <button
            onClick={() => setShowColorGuide(!showColorGuide)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF5722]/10 hover:bg-[#FF5722]/20 text-[#FF5722] font-bold text-[11px] border border-[#FF5722]/30 transition-colors cursor-pointer ml-auto"
          >
            <Info className="w-3.5 h-3.5 text-[#FF5722]" />
            <span>{showColorGuide ? "Close Guide" : "Color Code Guide"}</span>
          </button>
        </div>

      </div>
    </motion.div>
  );
};
