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
  highlightPath?: string[];
  compromisedNodes?: string[];
  predictedNextHop?: PredictedNextHop | null;
  activeStepNode?: string;
}

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
      {/* Header — minimal */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-bold tracking-tight">Digital Twin</h2>
          <p className="text-[11px] text-[#A1A1AA] mt-0.5">
            {assetCount} assets · {routeCount} routes
          </p>
        </div>
        <button
          onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
          className="w-8 h-8 rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1E] flex items-center justify-center text-[#A1A1AA] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Predicted next move — minimal inline */}
      {predictedNextHop && (
        <div className="px-5 py-2 flex items-center gap-2 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          <span className="text-[11px] font-mono text-[#A1A1AA]">Predicted</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-900 font-mono font-bold text-[10px]">
            {predictedNextHop.techniqueId || "T1003"}
          </span>
          <span className="text-[12px] text-[#71717A] dark:text-[#9B9BA4]">
            {predictedNextHop.techniqueName || "Credential Dumping"}
          </span>
          <span className="text-[#A1A1AA]">→</span>
          <span className="font-mono font-semibold text-[#18181B] dark:text-[#FAFAFA] text-[11px]">
            {predictedNextHop.targetId}
          </span>
          <span className="text-[10px] text-[#A1A1AA] ml-auto">{predictedNextHop.confidence || 94}%</span>
        </div>
      )}

      {/* Topology viewport */}
      <div className="relative flex-1 w-full overflow-hidden bg-[#FAFAFA] dark:bg-[#0A0A0B]">
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
          className="relative w-full h-full"
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

            {/* 2. DETECTED ATTACK PATH (RED) */}
            {(() => {
              if (!highlightPath || highlightPath.length < 2) return null;
              const segments: { fromId: string; toId: string; key: string; d: string }[] = [];
              for (let i = 0; i < highlightPath.length - 1; i++) {
                const fId = highlightPath[i];
                const tId = highlightPath[i + 1];
                if (fId && tId && fId !== tId && fId !== "EXT-INTERNET") {
                  const from = nodeMap.get(fId);
                  const to = nodeMap.get(tId);
                  if (from && to) {
                    segments.push({ fromId: fId, toId: tId, key: `${fId}-${tId}-${i}`, d: generateRoutePath(from, to) });
                  }
                }
              }
              return segments.map((seg) => (
                <g key={`detected-direct-${seg.key}`}>
                  <motion.path
                    d={seg.d}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="8"
                    strokeOpacity="0.28"
                    strokeLinecap="round"
                    filter="url(#redDetectedGlow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.28 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                  />
                  <motion.path
                    d={seg.d}
                    fill="none"
                    stroke="#DC2626"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                  />
                  <circle r="4" fill="#EF4444">
                    <animateMotion path={seg.d} dur="2.4s" repeatCount="indefinite" />
                  </circle>
                </g>
              ));
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
                <g key={`predicted-direct-${predictedNextHop.sourceId}-${predictedNextHop.targetId}`}>
                  <motion.path
                    d={d}
                    fill="none"
                    stroke="#FACC15"
                    strokeWidth="8"
                    strokeOpacity="0.35"
                    strokeLinecap="round"
                    filter="url(#yellowPredictedGlow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                  <motion.path
                    d={d}
                    fill="none"
                    stroke="#EAB308"
                    strokeWidth="2.8"
                    strokeDasharray="6,4"
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                  />
                  <circle r="4.5" fill="#FACC15">
                    <animateMotion path={d} dur="1.6s" repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })()}

            {/* 4. RENDER TOPOLOGY NODES */}
            {realNodes.map((n) => {
              const isSelected = activeNodeId === n.id || selectedAssetId === n.id || activeStepNode === n.id;
              const isTraversed = highlightPath.includes(n.id);
              const isCompromised = compromisedNodes.includes(n.id) || (isTraversed && !n.isInternet);
              const isPredictedTarget = predictedNextHop?.targetId === n.id;
              const Icon = n.icon;

              return (
                <g
                  key={n.id}
                  data-node={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  onClick={() => {
                    setActiveNodeId(n.id);
                    if (onSelectAsset) onSelectAsset(n);
                  }}
                  className="cursor-pointer group/node"
                >
                  {/* Animated Golden Radar Ring for Predicted Next Move */}
                  {isPredictedTarget && (
                    <circle r="32" fill="none" stroke="#EAB308" strokeWidth="2" strokeDasharray="4,3" opacity="0.9">
                      <animate attributeName="r" values="22;38;22" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Compromise Burst Ring */}
                  {isCompromised && (
                    <motion.circle
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2"
                      initial={{ r: 20, opacity: 0.8 }}
                      animate={{ r: 48, opacity: 0 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
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
                    style={{ transition: "fill 0.5s ease" }}
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
                    style={{ transition: "fill 0.5s ease" }}
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
                    style={{ transition: "fill 0.5s ease, stroke 0.5s ease, stroke-width 0.5s ease" }}
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
                      style={{ transition: "fill 0.5s ease" }}
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
                </g>
              );
            })}
          </svg>
        </div>

      </div>
    </motion.div>
  );
};
