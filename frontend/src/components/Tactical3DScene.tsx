import React, { useState, useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
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
  Grid,
  Laptop,
  Radio,
  HardDrive,
  Key,
  ShieldAlert,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export interface Tactical3DSceneProps {
  height?: string;
  assets?: any[];
  relationships?: any[];
  selectedAssetId?: string;
  onSelectAsset?: (asset: any) => void;
  highlightPath?: string[];
  compromisedNodes?: string[];
  activeStepNode?: string;
}

// Canonical positions in an 820x400 coordinate canvas
const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  "EXT-INTERNET": { x: 70, y: 200 },
  "FW-EDGE-01": { x: 175, y: 200 },
  "WEB-SRV-01": { x: 260, y: 110 },
  "VPN-GW-01": { x: 260, y: 280 },
  "WS-ENG-04": { x: 380, y: 220 },
  "WS-FIN-02": { x: 380, y: 95 },
  "APP-SRV-01": { x: 500, y: 110 },
  "DC-CORP-01": { x: 500, y: 250 },
  "SIEM-SOC-01": { x: 500, y: 350 },
  "CLOUD-K8S-01": { x: 630, y: 95 },
  "DB-PROD-01": { x: 630, y: 195 },
  "VAULT-BACKUP-01": { x: 740, y: 250 },
};

// Fallback assets if none provided
const FALLBACK_ASSETS = [
  { id: "EXT-INTERNET", name: "External Internet", type: "ROUTER", zone: "INTERNET", criticality: "LOW", ip_address: "198.51.100.1" },
  { id: "FW-EDGE-01", name: "Perimeter Firewall", type: "FIREWALL", zone: "DMZ", criticality: "HIGH", ip_address: "203.0.113.1" },
  { id: "WEB-SRV-01", name: "Public Web Portal", type: "APPLICATION_SERVER", zone: "DMZ", criticality: "HIGH", ip_address: "192.168.10.15" },
  { id: "VPN-GW-01", name: "SSL-VPN Gateway", type: "VPN_GATEWAY", zone: "DMZ", criticality: "HIGH", ip_address: "192.168.10.5" },
  { id: "WS-ENG-04", name: "Senior DevOps Laptop", type: "WORKSTATION", zone: "CORPORATE_LAN", criticality: "MEDIUM", ip_address: "10.100.4.45" },
  { id: "WS-FIN-02", name: "Finance Workstation", type: "WORKSTATION", zone: "CORPORATE_LAN", criticality: "MEDIUM", ip_address: "10.100.2.22" },
  { id: "APP-SRV-01", name: "Core API Server", type: "APPLICATION_SERVER", zone: "MANAGEMENT", criticality: "HIGH", ip_address: "10.200.1.10" },
  { id: "DC-CORP-01", name: "Active Directory DC", type: "DOMAIN_CONTROLLER", zone: "SECURE_TIER", criticality: "CRITICAL", ip_address: "10.200.0.1" },
  { id: "SIEM-SOC-01", name: "SIEM & SOAR", type: "SERVER", zone: "MANAGEMENT", criticality: "MEDIUM", ip_address: "10.200.5.10" },
  { id: "CLOUD-K8S-01", name: "AWS EKS Cluster", type: "CLOUD_INSTANCE", zone: "CLOUD_VPC", criticality: "HIGH", ip_address: "172.16.0.4" },
  { id: "DB-PROD-01", name: "Customer Financial DB", type: "DATABASE", zone: "SECURE_TIER", criticality: "CRITICAL", ip_address: "10.200.2.50" },
  { id: "VAULT-BACKUP-01", name: "Immutable Backup Vault", type: "BACKUP_SERVER", zone: "BACKUP_VAULT", criticality: "CRITICAL", ip_address: "10.250.99.10" },
];

const FALLBACK_RELATIONSHIPS = [
  { id: "R1", source_id: "EXT-INTERNET", target_id: "FW-EDGE-01" },
  { id: "R2", source_id: "FW-EDGE-01", target_id: "WEB-SRV-01" },
  { id: "R3", source_id: "FW-EDGE-01", target_id: "VPN-GW-01" },
  { id: "R4", source_id: "VPN-GW-01", target_id: "WS-ENG-04" },
  { id: "R5", source_id: "WS-ENG-04", target_id: "APP-SRV-01" },
  { id: "R6", source_id: "WS-ENG-04", target_id: "DC-CORP-01" },
  { id: "R7", source_id: "APP-SRV-01", target_id: "DB-PROD-01" },
  { id: "R8", source_id: "DC-CORP-01", target_id: "VAULT-BACKUP-01" },
  { id: "R9", source_id: "DC-CORP-01", target_id: "DB-PROD-01" },
  { id: "R10", source_id: "APP-SRV-01", target_id: "VAULT-BACKUP-01" },
  { id: "R11", source_id: "WS-ENG-04", target_id: "CLOUD-K8S-01" },
  { id: "R12", source_id: "DC-CORP-01", target_id: "SIEM-SOC-01" },
];

export const Tactical3DScene: React.FC<Tactical3DSceneProps> = ({
  height = "h-[420px]",
  assets,
  relationships,
  selectedAssetId,
  onSelectAsset,
  highlightPath = [],
  compromisedNodes = [],
  activeStepNode,
}) => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<"3D" | "2D">("2D");
  const [zoomLevel, setZoomLevel] = useState(1);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const rawAssets = assets && assets.length > 0 ? assets : FALLBACK_ASSETS;
  const rawRelationships = relationships && relationships.length > 0 ? relationships : FALLBACK_RELATIONSHIPS;

  // Resolve icon per asset type
  const getAssetIcon = (asset: any) => {
    const type = String(asset.type || "").toUpperCase();
    const id = String(asset.id || "").toUpperCase();
    if (id.includes("INTERNET") || type === "ROUTER") return Globe;
    if (id.includes("FW") || type === "FIREWALL") return Shield;
    if (id.includes("VPN") || type === "VPN_GATEWAY") return Shield;
    if (type === "WORKSTATION" || id.includes("WS-")) return Laptop;
    if (id.includes("DC-") || type === "DOMAIN_CONTROLLER") return User;
    if (id.includes("DB-") || type === "DATABASE") return Database;
    if (id.includes("VAULT") || type === "BACKUP_SERVER") return HardDrive;
    if (id.includes("CLOUD") || id.includes("K8S") || type === "CLOUD_INSTANCE") return Cloud;
    if (id.includes("SIEM") || id.includes("SOC")) return Radio;
    return Server;
  };

  // Map each asset to display coordinates and status
  const displayNodes = useMemo(() => {
    return rawAssets.map((asset, idx) => {
      const pos = DEFAULT_POSITIONS[asset.id] || {
        x: 100 + ((idx * 65) % 650),
        y: 100 + ((idx * 45) % 250),
      };

      const isCompromised = compromisedNodes.includes(asset.id) || asset.is_compromised;
      const isPathNode = highlightPath.includes(asset.id);
      const isSelected = selectedAssetId === asset.id;
      const isCrownJewel = asset.criticality === "CRITICAL" || asset.id === "VAULT-BACKUP-01" || asset.id === "DC-CORP-01";
      const isActiveTarget = activeStepNode === asset.id;

      let status: "compromised" | "at_risk" | "normal" = "normal";
      if (isCompromised) {
        status = "compromised";
      } else if (isPathNode) {
        status = "at_risk";
      }

      let color = "#0284C7";
      let glowColor = "rgba(2, 132, 199, 0.18)";

      if (status === "compromised") {
        color = "#EF4444";
        glowColor = "rgba(239, 68, 68, 0.35)";
      } else if (status === "at_risk") {
        color = "#F59E0B";
        glowColor = "rgba(245, 158, 11, 0.28)";
      } else if (isCrownJewel) {
        color = "#7C3AED";
        glowColor = "rgba(124, 58, 237, 0.20)";
      }

      return {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        ip: asset.ip_address,
        zone: asset.zone,
        status,
        isCompromised,
        isPathNode,
        isSelected,
        isCrownJewel,
        isActiveTarget,
        x: pos.x,
        y: pos.y,
        color,
        glowColor,
        icon: getAssetIcon(asset),
        rawAsset: asset,
      };
    });
  }, [rawAssets, compromisedNodes, highlightPath, selectedAssetId, activeStepNode]);

  // Quick coordinate lookup by node ID
  const nodeMap = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    displayNodes.forEach((n) => {
      map[n.id] = { x: n.x, y: n.y };
    });
    return map;
  }, [displayNodes]);

  // Compute trust relationship dashed curves
  const trustCurves = useMemo(() => {
    return rawRelationships
      .map((rel) => {
        const src = nodeMap[rel.source_id];
        const tgt = nodeMap[rel.target_id];
        if (!src || !tgt) return null;
        if (rel.source_id === rel.target_id) return null;

        const midX = (src.x + tgt.x) / 2;
        return {
          id: rel.id || `${rel.source_id}-${rel.target_id}`,
          d: `M ${src.x} ${src.y} C ${midX} ${src.y}, ${midX} ${tgt.y}, ${tgt.x} ${tgt.y}`,
          sourceId: rel.source_id,
          targetId: rel.target_id,
        };
      })
      .filter(Boolean) as { id: string; d: string; sourceId: string; targetId: string }[];
  }, [rawRelationships, nodeMap]);

  // Compute attack path conduit connecting current simulation path
  const attackPathD = useMemo(() => {
    if (!highlightPath || highlightPath.length < 2) return null;
    const coords = highlightPath.map((id) => nodeMap[id]).filter(Boolean);
    if (coords.length < 2) return null;

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const p0 = coords[i - 1];
      const p1 = coords[i];
      const midX = (p0.x + p1.x) / 2;
      d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [highlightPath, nodeMap]);

  // 3D Scene Initialization
  useEffect(() => {
    if (viewMode !== "3D") return;
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === "dark" ? 0x0A0D14 : 0xF9FAFC);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(16, 20, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.6);
    dirLight.position.set(15, 25, 15);
    scene.add(dirLight);

    // Subtle 3D grid
    const grid = new THREE.GridHelper(36, 24, theme === "dark" ? 0x1E293B : 0xE2E8F0, theme === "dark" ? 0x0F172A : 0xEDF2F7);
    grid.position.y = -0.01;
    scene.add(grid);

    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    // Procedural 3D nodes
    displayNodes.forEach((n) => {
      const x3d = (n.x - 410) * 0.04;
      const z3d = (n.y - 200) * 0.04;

      let cHex = 0x0284C7;
      if (n.status === "compromised") cHex = 0xEF4444;
      else if (n.status === "at_risk") cHex = 0xF59E0B;
      else if (n.isCrownJewel) cHex = 0x7C3AED;

      // Base pedestal
      const baseGeo = new THREE.CylinderGeometry(0.7, 0.8, 0.2, 24);
      const baseMat = new THREE.MeshStandardMaterial({
        color: theme === "dark" ? 0x1E2533 : 0xFFFFFF,
        roughness: 0.3,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.set(x3d, 0.1, z3d);
      nodeGroup.add(baseMesh);

      // Core shape
      const coreGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.7, 16);
      const coreMat = new THREE.MeshStandardMaterial({
        color: cHex,
        metalness: 0.25,
        roughness: 0.2,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.set(x3d, 0.55, z3d);
      nodeGroup.add(coreMesh);
    });

    // 3D Trust Relationship Lines
    const lineMat = new THREE.LineBasicMaterial({
      color: theme === "dark" ? 0x334155 : 0x94A3B8,
      transparent: true,
      opacity: 0.4,
    });
    trustCurves.forEach((tc) => {
      const s = nodeMap[tc.sourceId];
      const t = nodeMap[tc.targetId];
      if (!s || !t) return;
      const points = [
        new THREE.Vector3((s.x - 410) * 0.04, 0.3, (s.y - 200) * 0.04),
        new THREE.Vector3((t.x - 410) * 0.04, 0.3, (t.y - 200) * 0.04),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, lineMat);
      nodeGroup.add(line);
    });

    // 3D Attack Path Conduit
    if (highlightPath.length >= 2) {
      const pathPoints = highlightPath
        .map((id) => nodeMap[id])
        .filter(Boolean)
        .map((p) => new THREE.Vector3((p.x - 410) * 0.04, 0.55, (p.y - 200) * 0.04));

      if (pathPoints.length >= 2) {
        const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);
        const pathMat = new THREE.LineBasicMaterial({
          color: 0xFF3D00,
          linewidth: 3,
        });
        const pathLine = new THREE.Line(pathGeo, pathMat);
        nodeGroup.add(pathLine);
      }
    }

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      nodeGroup.rotation.y += 0.0012;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [viewMode, displayNodes, trustCurves, highlightPath, theme]);

  return (
    <div
      className={`relative w-full ${height} bg-[#FFFFFF] dark:bg-[#0C0E14] rounded-xl border border-[#E5E7EB] dark:border-[#171B26] overflow-hidden select-none flex flex-col shadow-xs`}
    >
      {/* 1. CARD HEADER */}
      <div className="p-3.5 pb-2 flex items-center justify-between border-b border-[#F1F3F5] dark:border-[#171B26] z-10 bg-white dark:bg-[#0C0E14]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#FFF2EB] dark:bg-[#211410] border border-[#FF5722]/30 flex items-center justify-center text-[#FF5722]">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide font-display">
              Environment Digital Twin
            </h2>
            <p className="text-[10px] text-slate-500">
              Live model: {displayNodes.length} enterprise assets & {rawRelationships.length} active routes
            </p>
          </div>
        </div>

        {/* Right Controls: View Switcher, Search, Filter, Maximize */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-[#F1F4F8] dark:bg-[#161C28] p-0.5 text-xs font-semibold">
            <button
              onClick={() => setViewMode("3D")}
              className={`px-3 py-1 rounded-md transition-all text-xs cursor-pointer ${
                viewMode === "3D"
                  ? "bg-[#181B20] text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              3D View
            </button>
            <button
              onClick={() => setViewMode("2D")}
              className={`px-3 py-1 rounded-md transition-all text-xs cursor-pointer ${
                viewMode === "2D"
                  ? "bg-[#181B20] text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              2D View
            </button>
          </div>

          <button
            onClick={() => setZoomLevel(1)}
            className="w-7 h-7 rounded-lg border border-[#E5E7EB] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. TOPOLOGY VIEWPORT */}
      <div className="relative flex-1 w-full overflow-hidden bg-[#FAFBFC] dark:bg-[#080A0F]">
        {/* Subtle dot matrix grid */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* 3D WebGL Canvas */}
        {viewMode === "3D" && (
          <div ref={canvasContainerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        )}

        {/* 2D Vector Canvas */}
        {viewMode === "2D" && (
          <div
            className="relative w-full h-full"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease",
            }}
          >
            <svg className="w-full h-full" viewBox="0 0 820 400">
              <defs>
                {/* Soft Glow Filter */}
                <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="7" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="crimsonGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="9" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Trust Relationship Dashed Curves */}
              {trustCurves.map((tc) => (
                <path
                  key={tc.id}
                  d={tc.d}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.2"
                  strokeDasharray="4,4"
                  strokeOpacity="0.45"
                />
              ))}

              {/* Attack Path Conduit (Glowing Red/Orange) */}
              {attackPathD && (
                <>
                  {/* Outer Glow */}
                  <path
                    d={attackPathD}
                    fill="none"
                    stroke="#FF5722"
                    strokeWidth="8"
                    strokeOpacity="0.25"
                    strokeLinecap="round"
                  />
                  {/* Core Solid Line */}
                  <path
                    d={attackPathD}
                    fill="none"
                    stroke="#FF3D00"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                  {/* Animated Attack Pulse Particle */}
                  <circle r="4.5" fill="#FF5722">
                    <animateMotion path={attackPathD} dur="2.8s" repeatCount="indefinite" />
                  </circle>
                </>
              )}

              {/* Render Nodes */}
              {displayNodes.map((n) => {
                const Icon = n.icon;
                const isCrit = n.status === "compromised";
                const isRisk = n.status === "at_risk";
                const isTarget = n.isActiveTarget;

                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x}, ${n.y})`}
                    onClick={() => onSelectAsset && onSelectAsset(n.rawAsset)}
                    className="cursor-pointer group/node"
                  >
                    {/* Active Frontier Radar Pulse Ring */}
                    {isTarget && (
                      <circle
                        r="24"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="1.5"
                        opacity="0.8"
                      >
                        <animate attributeName="r" values="22;38" dur="1.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Soft Glowing Circular Halo */}
                    <circle
                      r={n.isCrownJewel ? 32 : 25}
                      fill={n.glowColor}
                      filter="url(#softGlow)"
                    />

                    {/* Outer Ring Border */}
                    <circle
                      r={n.isCrownJewel ? 20 : 16}
                      fill="#FFFFFF"
                      stroke={
                        isCrit
                          ? "#EF4444"
                          : isRisk
                          ? "#F59E0B"
                          : n.isCrownJewel
                          ? "#7C3AED"
                          : "#0284C7"
                      }
                      strokeWidth={n.isSelected || isTarget ? 3 : 2}
                      className="transition-all duration-200"
                    />

                    {/* Inner Circle Fill */}
                    <circle
                      r="12"
                      fill={
                        n.id === "EXT-INTERNET"
                          ? "#1E293B"
                          : isCrit
                          ? "#FEE2E2"
                          : isRisk
                          ? "#FEF3C7"
                          : n.isCrownJewel
                          ? "#F5F3FF"
                          : "#E0F2FE"
                      }
                    />

                    {/* Center Icon */}
                    <foreignObject x="-8" y="-8" width="16" height="16">
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon
                          className={`w-3.5 h-3.5 ${
                            n.id === "EXT-INTERNET"
                              ? "text-white"
                              : isCrit
                              ? "text-red-600"
                              : isRisk
                              ? "text-amber-600"
                              : n.isCrownJewel
                              ? "text-purple-600"
                              : "text-sky-600"
                          }`}
                        />
                      </div>
                    </foreignObject>

                    {/* Primary Asset ID Label */}
                    <text
                      y={n.y > 240 ? -24 : 26}
                      textAnchor="middle"
                      fill={isCrit ? "#DC2626" : n.isCrownJewel ? "#6D28D9" : "#0F172A"}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {n.id}
                    </text>

                    {/* Subtitle / Asset Name */}
                    <text
                      y={n.y > 240 ? -15 : 36}
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="7.5"
                      fontFamily="Inter, sans-serif"
                    >
                      {n.name.length > 20 ? n.name.slice(0, 18) + "..." : n.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Floating Zoom Controls (Left) */}
        <div className="absolute top-4 left-4 flex flex-col bg-white dark:bg-[#0C0E14] rounded-lg border border-[#E5E7EB] dark:border-slate-800 shadow-sm z-20 overflow-hidden">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-[#F1F3F5] dark:border-slate-800 cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
            className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-[#F1F3F5] dark:border-slate-800 cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset View"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-3 left-4 flex items-center gap-4 bg-white/90 dark:bg-[#0C0E14]/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-800 text-[10px] font-sans shadow-xs z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">At Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Compromised</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#FF3D00] rounded" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Attack Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-[#94A3B8]" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Trust Route</span>
          </div>
        </div>
      </div>
    </div>
  );
};
