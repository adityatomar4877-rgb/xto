import React, { useState } from "react";
import {
  Plus,
  Minus,
  RotateCcw,
  Search,
  Filter,
  Maximize2,
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
} from "lucide-react";

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
  assets?: any[];
  relationships?: any[];
  selectedAssetId?: string;
  onSelectAsset?: (asset: any) => void;
  highlightPath?: string[]; // Traversed / detected nodes [e.g. "EXT-INTERNET", "FW-EDGE-01", "WS-ENG-04"]
  compromisedNodes?: string[]; // Compromised node IDs
  predictedNextHop?: PredictedNextHop | null; // MITRE predicted next move
}

export interface TopologyNode {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  x: number;
  y: number;
  icon: any;
  isPurple?: boolean;
  centerDark?: boolean;
}

// Exactly 12 enterprise assets matching reference screenshot
const TOPOLOGY_NODES: TopologyNode[] = [
  {
    id: "EXT-INTERNET",
    name: "EXT-INTERNET",
    subtitle: "External Internet ...",
    type: "Adversary Space",
    x: 80,
    y: 280,
    icon: Globe,
    centerDark: true,
  },
  {
    id: "FW-EDGE-01",
    name: "FW-EDGE-01",
    subtitle: "Perimeter NextGen ...",
    type: "Firewall",
    x: 210,
    y: 280,
    icon: Shield,
  },
  {
    id: "WEB-SRV-01",
    name: "WEB-SRV-01",
    subtitle: "Public Customer Po...",
    type: "Application Server",
    x: 310,
    y: 195,
    icon: Server,
  },
  {
    id: "VPN-GW-01",
    name: "VPN-GW-01",
    subtitle: "Corporate SSL-VPN ...",
    type: "VPN Gateway",
    x: 310,
    y: 365,
    icon: Shield,
  },
  {
    id: "WS-FIN-02",
    name: "WS-FIN-02",
    subtitle: "Finance Lead Works...",
    type: "Workstation",
    x: 460,
    y: 175,
    icon: Monitor,
  },
  {
    id: "WS-ENG-04",
    name: "WS-ENG-04",
    subtitle: "Senior DevOps Engi...",
    type: "Workstation",
    x: 460,
    y: 295,
    icon: Monitor,
  },
  {
    id: "APP-SRV-01",
    name: "APP-SRV-01",
    subtitle: "Core Banking & API...",
    type: "Application Server",
    x: 610,
    y: 195,
    icon: Server,
  },
  {
    id: "DC-CORP-01",
    name: "DC-CORP-01",
    subtitle: "Corporate Active D...",
    type: "Domain Controller",
    x: 610,
    y: 320,
    icon: User,
    isPurple: true,
  },
  {
    id: "SIEM-SOC-01",
    name: "SIEM-SOC-01",
    subtitle: "Security Operation...",
    type: "Security Monitoring",
    x: 610,
    y: 430,
    icon: Radio,
  },
  {
    id: "CLOUD-K8S-01",
    name: "CLOUD-K8S-01",
    subtitle: "AWS Production EKS...",
    type: "Cloud Infrastructure",
    x: 770,
    y: 185,
    icon: Cloud,
  },
  {
    id: "DB-PROD-01",
    name: "DB-PROD-01",
    subtitle: "Primary Customer F...",
    type: "Database",
    x: 770,
    y: 280,
    icon: Database,
    isPurple: true,
  },
  {
    id: "VAULT-BACKUP-01",
    name: "VAULT-BACKUP-01",
    subtitle: "Immutable Ransomwa...",
    type: "Crown Jewel Vault",
    x: 910,
    y: 325,
    icon: HardDrive,
    isPurple: true,
  },
];

// Exactly 14 active routes matching reference screenshot
const TOPOLOGY_ROUTES = [
  { id: "R1", from: "EXT-INTERNET", to: "FW-EDGE-01", defaultTech: "T1190 / T1566" },
  { id: "R2", from: "FW-EDGE-01", to: "WEB-SRV-01", defaultTech: "T1190" },
  { id: "R3", from: "FW-EDGE-01", to: "VPN-GW-01", defaultTech: "T1133" },
  { id: "R4", from: "WEB-SRV-01", to: "APP-SRV-01", defaultTech: "T1210" },
  { id: "R5", from: "VPN-GW-01", to: "WS-ENG-04", defaultTech: "T1078" },
  { id: "R6", from: "WS-FIN-02", to: "APP-SRV-01", defaultTech: "T1021.001" },
  { id: "R7", from: "WS-ENG-04", to: "APP-SRV-01", defaultTech: "T1021.004" },
  { id: "R8", from: "WS-ENG-04", to: "DC-CORP-01", defaultTech: "T1003" },
  { id: "R9", from: "APP-SRV-01", to: "CLOUD-K8S-01", defaultTech: "T1078.004" },
  { id: "R10", from: "APP-SRV-01", to: "DB-PROD-01", defaultTech: "T1005" },
  { id: "R11", from: "DC-CORP-01", to: "DB-PROD-01", defaultTech: "T1021.002" },
  { id: "R12", from: "DC-CORP-01", to: "SIEM-SOC-01", defaultTech: "T1562.001" },
  { id: "R13", from: "CLOUD-K8S-01", to: "DB-PROD-01", defaultTech: "T1530" },
  { id: "R14", from: "DB-PROD-01", to: "VAULT-BACKUP-01", defaultTech: "T1486" },
];

function generateRoutePath(fromNode: TopologyNode, toNode: TopologyNode): string {
  const { x: x1, y: y1 } = fromNode;
  const { x: x2, y: y2 } = toNode;
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (Math.abs(dx) < 6) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  if (Math.abs(dy) < 6) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  const cx1 = x1 + dx * 0.45;
  const cy1 = y1;
  const cx2 = x2 - dx * 0.45;
  const cy2 = y2;
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}

export const Tactical3DScene: React.FC<Tactical3DSceneProps> = ({
  height = "h-[440px]",
  onSelectAsset,
  highlightPath = [],
  compromisedNodes = [],
  predictedNextHop = null,
  selectedAssetId,
}) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(selectedAssetId || null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const nodeMap = new Map<string, TopologyNode>();
  TOPOLOGY_NODES.forEach((n) => nodeMap.set(n.id, n));

  // Determine if a route is in the detected (red) path
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

  // Determine if a route is the predicted next move (yellow)
  const isRoutePredicted = (fromId: string, toId: string) => {
    if (!predictedNextHop) return false;
    return (
      (predictedNextHop.sourceId === fromId && predictedNextHop.targetId === toId) ||
      (predictedNextHop.sourceId === toId && predictedNextHop.targetId === fromId)
    );
  };

  // Find predicted target node if any
  const predictedTargetNode = predictedNextHop ? nodeMap.get(predictedNextHop.targetId) : null;

  return (
    <div
      className={`relative w-full ${height} bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] overflow-hidden select-none flex flex-col shadow-xs`}
    >
      {/* 1. CARD HEADER (Matching Reference Screenshot) */}
      <div className="p-4 pb-2.5 flex items-center justify-between border-b border-[#F1F3F5] z-10 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#FFF2EB] border border-[#FF5722]/30 flex items-center justify-center text-[#FF5722]">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 tracking-wide font-display">
              Environment Digital Twin
            </h2>
            <p className="text-[10px] text-slate-500">
              Live model: 12 enterprise assets & 14 active routes
            </p>
          </div>
        </div>

        {/* Right Controls: View Switcher & Reload (Matching Photo) */}
        <div className="flex items-center gap-2">
          {/* Mode Pill Switcher */}
          <div className="flex rounded-lg bg-[#F1F4F8] p-0.5 text-xs font-semibold">
            <button
              className="px-3 py-1 rounded-md text-xs text-slate-400 cursor-not-allowed opacity-60"
              title="3D mode disabled (2D Realtime Model Active)"
            >
              3D View
            </button>
            <button
              className="px-3 py-1 rounded-md transition-all text-xs bg-[#181B20] text-white shadow-xs font-bold"
            >
              2D View
            </button>
          </div>

          <button
            onClick={() => {
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="w-7 h-7 rounded-lg border border-[#E5E7EB] hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
            title="Reset Topology View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. MITRE PREDICTED NEXT MOVE HUD (If active) */}
      {predictedNextHop && (
        <div className="px-4 py-1.5 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-b border-amber-200/60 flex items-center justify-between text-xs z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-900 tracking-wider">
              MITRE ATT&CK PREDICTED NEXT MOVE:
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-black text-[10px] shadow-xs">
              {predictedNextHop.techniqueId || "T1003"}
            </span>
            <span className="text-slate-700 font-semibold text-[11px]">
              {predictedNextHop.techniqueName || "OS Credential Dumping"}
            </span>
            <span className="text-slate-400">&rarr;</span>
            <span className="font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
              {predictedNextHop.targetId}
            </span>
          </div>

          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>CONFIDENCE: <strong>{predictedNextHop.confidence || 94}%</strong></span>
          </div>
        </div>
      )}

      {/* 3. 2D TOPOLOGY VIEWPORT (Pure Vector Canvas matching photo) */}
      <div className="relative flex-1 w-full overflow-hidden bg-[#FAFBFC]">
        {/* Dot matrix grid */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#CBD5E1 1.2px, transparent 1.2px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Scalable Vector Canvas */}
        <div
          className="relative w-full h-full"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: "center center",
            transition: "transform 0.15s ease-out",
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 990 500">
            <defs>
              {/* Soft Halos */}
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

            {/* 1. BASE TRUST ROUTES (Dashed gray lines matching screenshot) */}
            {TOPOLOGY_ROUTES.map((route) => {
              const from = nodeMap.get(route.from);
              const to = nodeMap.get(route.to);
              if (!from || !to) return null;
              const d = generateRoutePath(from, to);
              const detected = isRouteDetected(route.from, route.to);
              const predicted = isRoutePredicted(route.from, route.to);

              // Don't render base line if highlighted as detected or predicted
              if (detected || predicted) return null;

              return (
                <path
                  key={`base-route-${route.id}`}
                  d={d}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.25"
                  strokeDasharray="4,4"
                  strokeOpacity="0.65"
                />
              );
            })}

            {/* 2. DETECTED ATTACK PATH (RED: stroke #EF4444 / #DC2626) */}
            {TOPOLOGY_ROUTES.map((route) => {
              const detected = isRouteDetected(route.from, route.to);
              if (!detected) return null;
              const from = nodeMap.get(route.from);
              const to = nodeMap.get(route.to);
              if (!from || !to) return null;
              const d = generateRoutePath(from, to);

              return (
                <g key={`detected-route-${route.id}`}>
                  {/* Outer Red Glow */}
                  <path
                    d={d}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="8"
                    strokeOpacity="0.25"
                    strokeLinecap="round"
                    filter="url(#redDetectedGlow)"
                  />
                  {/* Core Red Conduit Line */}
                  <path
                    d={d}
                    fill="none"
                    stroke="#DC2626"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                  {/* Flowing Red Particle Pulse */}
                  <circle r="4" fill="#EF4444">
                    <animateMotion path={d} dur="2.4s" repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })}

            {/* 3. PREDICTED NEXT MOVE PATH (YELLOW: stroke #EAB308 / #FACC15 based on MITRE) */}
            {TOPOLOGY_ROUTES.map((route) => {
              const predicted = isRoutePredicted(route.from, route.to);
              if (!predicted) return null;
              const from = nodeMap.get(route.from);
              const to = nodeMap.get(route.to);
              if (!from || !to) return null;
              const d = generateRoutePath(from, to);

              return (
                <g key={`predicted-route-${route.id}`}>
                  {/* Outer Gold Glow */}
                  <path
                    d={d}
                    fill="none"
                    stroke="#FACC15"
                    strokeWidth="8"
                    strokeOpacity="0.35"
                    strokeLinecap="round"
                    filter="url(#yellowPredictedGlow)"
                  />
                  {/* Core Pulsing Yellow Dashed Line */}
                  <path
                    d={d}
                    fill="none"
                    stroke="#EAB308"
                    strokeWidth="2.8"
                    strokeDasharray="6,4"
                    strokeLinecap="round"
                  />
                  {/* Fast Golden Particle Pulse */}
                  <circle r="4.5" fill="#FACC15">
                    <animateMotion path={d} dur="1.6s" repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })}

            {/* 4. RENDER 12 TOPOLOGY NODES */}
            {TOPOLOGY_NODES.map((n) => {
              const isSelected = activeNodeId === n.id || selectedAssetId === n.id;
              const isTraversed = highlightPath.includes(n.id);
              const isCompromised = compromisedNodes.includes(n.id) || (isTraversed && n.id !== "EXT-INTERNET");
              const isPredictedTarget = predictedNextHop?.targetId === n.id;
              const Icon = n.icon;

              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  onClick={() => {
                    setActiveNodeId(n.id);
                    if (onSelectAsset) onSelectAsset(n);
                  }}
                  className="cursor-pointer group/node"
                >
                  {/* Animated Golden Radar Ring for Predicted Next Move */}
                  {isPredictedTarget && (
                    <circle
                      r="32"
                      fill="none"
                      stroke="#EAB308"
                      strokeWidth="2"
                      strokeDasharray="4,3"
                      opacity="0.9"
                    >
                      <animate
                        attributeName="r"
                        values="22;38;22"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.9;0.1;0.9"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Soft Diffuse Halo (Cyan or Purple or Red or Yellow) */}
                  <circle
                    r={n.isPurple ? 38 : 30}
                    fill={
                      isCompromised
                        ? "rgba(239, 68, 68, 0.28)"
                        : isPredictedTarget
                        ? "rgba(234, 179, 8, 0.32)"
                        : n.isPurple
                        ? "rgba(168, 85, 247, 0.22)"
                        : "rgba(2, 132, 199, 0.20)"
                    }
                    filter={n.isPurple ? "url(#softPurpleGlow)" : "url(#softCyanGlow)"}
                  />

                  {/* Secondary Inner Halo */}
                  <circle
                    r={n.isPurple ? 28 : 24}
                    fill={
                      isCompromised
                        ? "rgba(239, 68, 68, 0.15)"
                        : isPredictedTarget
                        ? "rgba(234, 179, 8, 0.2)"
                        : n.isPurple
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
                        : n.isPurple
                        ? "#8B5CF6"
                        : "#0284C7"
                    }
                    strokeWidth={isSelected ? 3 : isCompromised || isPredictedTarget ? 2.5 : 2}
                    className="transition-all duration-200"
                  />

                  {/* Inner Node Graphic */}
                  {n.centerDark ? (
                    <circle r="14" fill="#0F172A" />
                  ) : (
                    <circle
                      r="14"
                      fill={
                        isCompromised
                          ? "#FEE2E2"
                          : isPredictedTarget
                          ? "#FEF9C3"
                          : n.isPurple
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
                          n.centerDark
                            ? "text-white"
                            : isCompromised
                            ? "text-red-600"
                            : isPredictedTarget
                            ? "text-amber-700"
                            : n.isPurple
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
                          ⚡ {predictedNextHop?.techniqueId || "NEXT"}
                        </span>
                      </div>
                    </foreignObject>
                  )}

                  {/* Node Title Label (Purple for Crown Jewels, Dark for Others, Red if Compromised) */}
                  <text
                    y={32}
                    textAnchor="middle"
                    fill={
                      isCompromised
                        ? "#DC2626"
                        : n.isPurple
                        ? "#7C3AED"
                        : "#0F172A"
                    }
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
                </g>
              );
            })}
          </svg>
        </div>

        {/* Floating Zoom Controls (Left, Matching Photo) */}
        <div className="absolute top-4 left-4 flex flex-col bg-white rounded-lg border border-[#E5E7EB] shadow-sm z-20 overflow-hidden">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors border-b border-[#F1F3F5]"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors border-b border-[#F1F3F5]"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Bottom Legend (Matching Exact Reference Photo + MITRE Predicted Path) */}
        <div className="absolute bottom-3 left-4 flex items-center gap-3.5 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[10px] font-sans shadow-xs z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
            <span className="text-slate-700 font-medium">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className="text-slate-700 font-medium">At Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span className="text-slate-700 font-medium">Compromised</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#DC2626] rounded" />
            <span className="text-slate-700 font-medium">Attack Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#EAB308] border-b border-dashed border-amber-500" />
            <span className="text-slate-700 font-medium">Predicted Next Move (MITRE)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-[#94A3B8]" />
            <span className="text-slate-700 font-medium">Trust Route</span>
          </div>
        </div>
      </div>
    </div>
  );
};
