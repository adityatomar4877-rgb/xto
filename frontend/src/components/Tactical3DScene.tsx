import React, { useState } from "react";
import {
  Plus,
  Minus,
  Search,
  Filter,
  Maximize2,
  RefreshCw,
  Globe,
  Shield,
  Server,
  Cloud,
  Layers,
  Key,
  Database,
  Crosshair,
  AlertTriangle,
  Lock,
  ArrowRight,
  Info,
  Laptop,
} from "lucide-react";
import { Asset, Relationship } from "@/lib/api";

interface Tactical3DSceneProps {
  assets?: Asset[];
  relationships?: Relationship[];
  selectedAssetId?: string;
  onSelectAsset?: (asset: Asset) => void;
  highlightPath?: string[];
  compromisedNodes?: string[];
  height?: string;
}

interface EnterpriseNode {
  id: string;
  name: string;
  type: string;
  zone: string;
  x: number;
  y: number;
  icon: any;
  status: "normal" | "at_risk" | "compromised";
  chokePointScore: number;
  compromiseScore: number;
  cves: string[];
  ip: string;
  os: string;
}

export const Tactical3DScene: React.FC<Tactical3DSceneProps> = ({
  selectedAssetId,
  onSelectAsset,
  height = "h-[420px]",
}) => {
  const [viewMode, setViewMode] = useState<"3D" | "2D">("3D");
  const [directionFilter, setDirectionFilter] = useState<"Inbound" | "Outbound">("Outbound");
  const [activeNode, setActiveNode] = useState<EnterpriseNode | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Enterprise Graph Flow Nodes (inspired by Photo 3)
  const enterpriseNodes: EnterpriseNode[] = [
    {
      id: "EXT-INET-01",
      name: "External Internet",
      type: "Breach Point",
      zone: "WAN",
      x: 60,
      y: 190,
      icon: Globe,
      status: "normal",
      chokePointScore: 40,
      compromiseScore: 10,
      cves: ["CVE-2023-46604"],
      ip: "198.51.100.24",
      os: "Edge Gateway",
    },
    {
      id: "FW-EDGE-01",
      name: "Perimeter Firewall",
      type: "Security Gateway",
      zone: "DMZ",
      x: 180,
      y: 130,
      icon: Shield,
      status: "normal",
      chokePointScore: 65,
      compromiseScore: 25,
      cves: [],
      ip: "10.0.0.1",
      os: "PAN-OS 10.2",
    },
    {
      id: "OFFICE-LAN",
      name: "Office Network",
      type: "User Subnet",
      zone: "CORP",
      x: 230,
      y: 280,
      icon: Laptop,
      status: "normal",
      chokePointScore: 50,
      compromiseScore: 35,
      cves: ["CVE-2021-34527"],
      ip: "10.10.0.0/24",
      os: "Windows 11 / Mac",
    },
    {
      id: "CLOUD-AWS",
      name: "Cloud (AWS VPC)",
      type: "Cloud Infrastructure",
      zone: "CLOUD",
      x: 370,
      y: 90,
      icon: Cloud,
      status: "normal",
      chokePointScore: 70,
      compromiseScore: 20,
      cves: [],
      ip: "172.31.0.0/16",
      os: "Amazon Linux 2023",
    },
    {
      id: "WEB-TIER-01",
      name: "Web Tier (Nginx)",
      type: "Application Ingress",
      zone: "DMZ",
      x: 350,
      y: 200,
      icon: Server,
      status: "at_risk",
      chokePointScore: 85,
      compromiseScore: 78,
      cves: ["CVE-2023-46604", "T1190"],
      ip: "10.0.10.5",
      os: "Ubuntu 22.04 LTS",
    },
    {
      id: "ID-CORP-AD",
      name: "Identity (AD / DC)",
      type: "Directory Chokepoint",
      zone: "INTERNAL",
      x: 480,
      y: 310,
      icon: Key,
      status: "at_risk",
      chokePointScore: 98,
      compromiseScore: 82,
      cves: ["T1003", "Kerberoasting"],
      ip: "10.10.1.10",
      os: "Windows Server 2022",
    },
    {
      id: "APP-TIER-01",
      name: "App Tier (Cluster)",
      type: "Microservices Core",
      zone: "INTERNAL",
      x: 550,
      y: 190,
      icon: Layers,
      status: "at_risk",
      chokePointScore: 80,
      compromiseScore: 75,
      cves: ["T1068", "Overprivileged Token"],
      ip: "10.10.20.15",
      os: "Kubernetes v1.28",
    },
    {
      id: "DB-PRIMARY",
      name: "Database (PostgreSQL)",
      type: "Core Data Store",
      zone: "SECURE_TIER",
      x: 720,
      y: 130,
      icon: Database,
      status: "compromised",
      chokePointScore: 92,
      compromiseScore: 95,
      cves: ["T1021", "Weak Vault Segregation"],
      ip: "10.10.30.4",
      os: "RHEL 9.2",
    },
    {
      id: "CRIT-VAULT-01",
      name: "Critical Assets (Vault)",
      type: "Tier-0 Crown Jewel",
      zone: "SECURE_TIER",
      x: 740,
      y: 270,
      icon: Crosshair,
      status: "compromised",
      chokePointScore: 100,
      compromiseScore: 99,
      cves: ["T1041", "Crown Jewel Reachable"],
      ip: "10.10.99.1",
      os: "Air-Gapped HSM Vault",
    },
  ];

  // Attack Path Connections (smooth flow curves)
  const attackPathEdges = [
    { from: "EXT-INET-01", to: "WEB-TIER-01", status: "compromised" },
    { from: "WEB-TIER-01", to: "APP-TIER-01", status: "compromised" },
    { from: "APP-TIER-01", to: "CRIT-VAULT-01", status: "compromised" },
    { from: "CRIT-VAULT-01", to: "DB-PRIMARY", status: "compromised" },
  ];

  const trustEdges = [
    { from: "EXT-INET-01", to: "FW-EDGE-01" },
    { from: "FW-EDGE-01", to: "WEB-TIER-01" },
    { from: "OFFICE-LAN", to: "ID-CORP-AD" },
    { from: "ID-CORP-AD", to: "APP-TIER-01" },
    { from: "CLOUD-AWS", to: "APP-TIER-01" },
  ];

  return (
    <div className={`relative w-full ${height} bg-[#0A0D14] rounded-xl border border-[#171B26] overflow-hidden select-none group`}>
      {/* 1. VIEW MODE: 3D PHOTO-REAL ISOMETRIC SCENE */}
      {viewMode === "3D" && (
        <div className="relative w-full h-full">
          <img
            src="/digital_twin_3d.png"
            alt="Environment Digital Twin 3D View"
            className="w-full h-full object-cover block"
          />

          {/* Interactive Clickable Hotspots mapped directly over 3D towers */}
          {[
            { id: "EXT-INET-01", name: "External Internet", x: "12%", y: "55%", w: "8%", h: "15%" },
            { id: "OFFICE-LAN", name: "Office Network (12 assets)", x: "32%", y: "18%", w: "10%", h: "18%" },
            { id: "CLOUD-AWS", name: "Cloud AWS (28 assets)", x: "50%", y: "14%", w: "10%", h: "18%" },
            { id: "WEB-TIER-01", name: "Web Tier (8 assets)", x: "42%", y: "40%", w: "8%", h: "18%" },
            { id: "ID-CORP-AD", name: "Identity AD (6 assets)", x: "32%", y: "63%", w: "8%", h: "18%" },
            { id: "APP-TIER-01", name: "App Tier (15 assets)", x: "57%", y: "43%", w: "8%", h: "18%" },
            { id: "DB-PRIMARY", name: "Database (4 assets)", x: "78%", y: "33%", w: "8%", h: "18%" },
            { id: "CRIT-VAULT-01", name: "Critical Assets (3 assets)", x: "60%", y: "68%", w: "10%", h: "20%" },
          ].map((spot) => (
            <div
              key={spot.id}
              style={{ left: spot.x, top: spot.y, width: spot.w, height: spot.h }}
              onClick={() => {
                const node = enterpriseNodes.find((n) => n.id === spot.id);
                setActiveNode(node || null);
                if (onSelectAsset && node) onSelectAsset(node as any);
              }}
              className="absolute cursor-pointer rounded-lg hover:border hover:border-[#FF5722]/50 hover:bg-[#FF5722]/10 transition-all z-10"
              title={spot.name}
            />
          ))}
        </div>
      )}

      {/* 2. VIEW MODE: 2D CLEAN ENTERPRISE GRAPH FLOW (XM Cyber Style from Photo 3) */}
      {viewMode === "2D" && (
        <div className="relative w-full h-full canvas-grid flex flex-col justify-between p-4">
          {/* Top Remediable Exposures Bar (from Photo 3) */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 bg-[#0C0E14]/90 px-3 py-1.5 rounded-lg border border-[#171B26] z-10">
            <div className="flex items-center gap-4">
              <span className="text-[#FF5722] font-bold flex items-center gap-1">
                <span>&gt;&gt;&gt;</span>
                <span>Active Attack Chain:</span>
              </span>
              <span className="text-slate-200">
                Internet &rarr; Web Tier (CVE-2023-46604) &rarr; App Tier &rarr; Critical Vault
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-red-950/70 text-red-400 border border-red-500/40 font-bold">
                12 Critical Paths
              </span>
            </div>
          </div>

          {/* SVG Graph Flow Canvas with Smooth Cubic Bezier Curves */}
          <div className="relative flex-1 w-full my-2">
            <svg className="w-full h-full" viewBox="0 0 850 360">
              {/* Trust Relationship Curves (subtle blue) */}
              {trustEdges.map((e, idx) => {
                const src = enterpriseNodes.find((n) => n.id === e.from);
                const tgt = enterpriseNodes.find((n) => n.id === e.to);
                if (!src || !tgt) return null;
                const dx = tgt.x - src.x;
                const pathD = `M ${src.x} ${src.y} C ${src.x + dx * 0.5} ${src.y}, ${tgt.x - dx * 0.5} ${tgt.y}, ${tgt.x} ${tgt.y}`;
                return (
                  <path
                    key={`trust-${idx}`}
                    d={pathD}
                    fill="none"
                    stroke="rgba(56, 189, 248, 0.3)"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                );
              })}

              {/* Active Attack Path (smooth glowing red conduit) */}
              {attackPathEdges.map((e, idx) => {
                const src = enterpriseNodes.find((n) => n.id === e.from);
                const tgt = enterpriseNodes.find((n) => n.id === e.to);
                if (!src || !tgt) return null;
                const dx = tgt.x - src.x;
                const pathD = `M ${src.x} ${src.y} C ${src.x + dx * 0.5} ${src.y}, ${tgt.x - dx * 0.5} ${tgt.y}, ${tgt.x} ${tgt.y}`;
                return (
                  <g key={`attack-${idx}`}>
                    {/* Outer Glow */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="rgba(239, 68, 68, 0.2)"
                      strokeWidth="8"
                    />
                    {/* Core Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2.5"
                    />
                  </g>
                );
              })}

              {/* Render Enterprise Nodes matching Photo 3 styling */}
              {enterpriseNodes.map((node) => {
                const isSelected = activeNode?.id === node.id;
                const isCrit = node.status === "compromised";
                const isRisk = node.status === "at_risk";

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => {
                      setActiveNode(node);
                      if (onSelectAsset) onSelectAsset(node as any);
                    }}
                    className="cursor-pointer"
                  >
                    {/* Selection Ring */}
                    {isSelected && (
                      <circle
                        r="24"
                        fill="none"
                        stroke="#FF5722"
                        strokeWidth="2"
                        strokeDasharray="3,3"
                      />
                    )}

                    {/* Node Base Shape */}
                    {node.id === "CRIT-VAULT-01" ? (
                      // Hexagon badge for critical vault (like Photo 3)
                      <polygon
                        points="0,-18 16,-9 16,9 0,18 -16,9 -16,-9"
                        fill="#7F1D1D"
                        stroke="#EF4444"
                        strokeWidth="2"
                      />
                    ) : (
                      <circle
                        r="18"
                        fill={isCrit ? "#450A0A" : isRisk ? "#261505" : "#0C1322"}
                        stroke={isCrit ? "#EF4444" : isRisk ? "#F59E0B" : "#0284C7"}
                        strokeWidth="2"
                      />
                    )}

                    {/* Choke Point Severity Badge Indicator */}
                    <circle
                      cx="14"
                      cy="-12"
                      r="6"
                      fill={node.chokePointScore >= 80 ? "#DC2626" : "#0284C7"}
                    />
                    <text
                      x="14"
                      y="-10"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="6"
                      fontWeight="bold"
                    >
                      {node.chokePointScore}
                    </text>

                    {/* Node Label */}
                    <text
                      y="32"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="600"
                      fontFamily="Inter, sans-serif"
                    >
                      {node.name}
                    </text>
                    <text
                      y="44"
                      textAnchor="middle"
                      fill="#8E98A8"
                      fontSize="8"
                      fontFamily="Inter, sans-serif"
                    >
                      {node.zone} // {node.ip}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Inbound / Outbound Direction Pill (from Photo 3) */}
            <div className="absolute left-3 bottom-3 flex items-center bg-[#0C0E14] border border-[#171B26] rounded-lg p-0.5 text-[10px] font-mono">
              <button
                onClick={() => setDirectionFilter("Inbound")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  directionFilter === "Inbound"
                    ? "bg-[#1E2536] text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Inbound
              </button>
              <button
                onClick={() => setDirectionFilter("Outbound")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  directionFilter === "Outbound"
                    ? "bg-[#1E2536] text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Outbound
              </button>
            </div>

            {/* Clean Floating Graph Legend (from Photo 3) */}
            <div className="absolute right-3 top-3 bg-[#0C0E14]/95 border border-[#171B26] rounded-xl p-2.5 text-[10px] font-sans shadow-xl w-44 z-10">
              <div className="font-bold text-white mb-2 flex items-center justify-between border-b border-slate-800 pb-1">
                <span>Graph Legend</span>
                <span className="text-[9px] text-slate-500 font-mono">PS #13</span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                    <span>Critical Asset</span>
                  </span>
                  <span className="font-mono text-slate-400">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span>Breach Point</span>
                  </span>
                  <span className="font-mono text-slate-400">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <span>Risks & Vulnerabilities</span>
                  </span>
                  <span className="font-mono text-slate-400">46</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                    <span>Trust Relationship</span>
                  </span>
                  <span className="font-mono text-slate-400">5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entity Properties Modal/Drawer on click (from Photo 3 left sidebar) */}
      {activeNode && (
        <div className="absolute left-3 top-3 w-72 rounded-xl bg-[#0C0E14]/95 border border-[#171B26] shadow-2xl p-3 z-30 font-sans backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <div className="font-bold text-white text-xs">{activeNode.name}</div>
              <div className="text-[10px] text-slate-400">{activeNode.type}</div>
            </div>
            <button
              onClick={() => setActiveNode(null)}
              className="text-slate-400 hover:text-white"
            >
              &times;
            </button>
          </div>

          <div className="mt-2 space-y-2 text-[10.5px]">
            {/* Choke Point & Impact Scores */}
            <div className="grid grid-cols-2 gap-2 bg-[#07090D] p-2 rounded-lg border border-slate-800">
              <div>
                <div className="text-[9px] text-slate-400">Choke point:</div>
                <div className="text-sm font-bold text-red-400 font-mono">
                  {activeNode.chokePointScore} / 100
                </div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400">Compromise score:</div>
                <div className="text-sm font-bold text-orange-400 font-mono">
                  {activeNode.compromiseScore} / 100
                </div>
              </div>
            </div>

            {/* Properties */}
            <div className="space-y-1 font-mono text-[10px] text-slate-300">
              <div>OS: <span className="text-white">{activeNode.os}</span></div>
              <div>IP Address: <span className="text-white">{activeNode.ip}</span></div>
              <div>Zone: <span className="text-white">{activeNode.zone}</span></div>
            </div>

            {/* Remediable Exposures */}
            {activeNode.cves.length > 0 && (
              <div className="pt-1">
                <div className="text-[9.5px] font-bold text-slate-400 mb-1">REMEDIABLE EXPOSURES</div>
                <div className="flex flex-wrap gap-1">
                  {activeNode.cves.map((cve, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/30 text-red-300 text-[9px] font-mono"
                    >
                      {cve}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Right View Controls Overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
        {/* 3D / 2D View Switch */}
        <div className="flex rounded-lg bg-[#0C0E14] border border-[#1E2536] p-0.5 text-xs font-medium backdrop-blur-md">
          <button
            onClick={() => setViewMode("3D")}
            className={`px-3 py-1 rounded-md transition-all text-xs font-medium ${
              viewMode === "3D"
                ? "bg-[#211410] text-[#FF5722] border border-[#FF5722]/40 font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            3D View
          </button>
          <button
            onClick={() => setViewMode("2D")}
            className={`px-3 py-1 rounded-md transition-all text-xs font-medium ${
              viewMode === "2D"
                ? "bg-[#211410] text-[#FF5722] border border-[#FF5722]/40 font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            2D View
          </button>
        </div>

        {/* Action Icons */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-7 h-7 rounded-lg bg-[#0C0E14] border border-[#1E2536] hover:border-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-all backdrop-blur-md"
          title="Filter layers"
        >
          <Filter className="w-3.5 h-3.5" />
        </button>
        <button
          className="w-7 h-7 rounded-lg bg-[#0C0E14] border border-[#1E2536] hover:border-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-all backdrop-blur-md"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
