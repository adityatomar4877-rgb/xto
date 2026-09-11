import React, { useState, useRef, useEffect } from "react";
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
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface Tactical3DSceneProps {
  height?: string;
  assets?: any[];
  relationships?: any[];
  selectedAssetId?: string;
  onSelectAsset?: (asset: any) => void;
  highlightPath?: string[];
  compromisedNodes?: string[];
}

export const Tactical3DScene: React.FC<Tactical3DSceneProps> = ({
  height = "h-[420px]",
  onSelectAsset,
}) => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<"3D" | "2D">("2D"); // 2D is the exact visual from screenshot
  const [activeNode, setActiveNode] = useState<any | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Nodes exactly from the reference screenshot
  const nodes = [
    {
      id: "internet",
      name: "Internet",
      type: "External Ingress",
      status: "normal",
      x: 140,
      y: 190,
      color: "#1E293B",
      glowColor: "rgba(30, 41, 59, 0.15)",
      icon: Globe,
      assets: "1 asset",
    },
    {
      id: "firewall",
      name: "Firewall",
      type: "Perimeter Security",
      status: "compromised",
      x: 270,
      y: 180,
      color: "#EF4444",
      glowColor: "rgba(239, 68, 68, 0.25)",
      icon: Shield,
      assets: "1 asset",
    },
    {
      id: "office",
      name: "Office Network",
      type: "User Workstations",
      status: "normal",
      x: 370,
      y: 95,
      color: "#0284C7",
      glowColor: "rgba(2, 132, 199, 0.18)",
      icon: Server,
      assets: "12 assets",
    },
    {
      id: "cloud",
      name: "Cloud (AWS)",
      type: "Cloud VPC / EKS",
      status: "normal",
      x: 620,
      y: 90,
      color: "#0284C7",
      glowColor: "rgba(2, 132, 199, 0.18)",
      icon: Cloud,
      assets: "28 assets",
    },
    {
      id: "web-tier",
      name: "Web Tier",
      type: "DMZ Ingress",
      status: "at_risk",
      x: 430,
      y: 190,
      color: "#F59E0B",
      glowColor: "rgba(245, 158, 11, 0.25)",
      icon: Server,
      assets: "8 assets",
    },
    {
      id: "identity",
      name: "Identity (AD)",
      type: "Directory Services",
      status: "normal",
      x: 350,
      y: 285,
      color: "#0284C7",
      glowColor: "rgba(2, 132, 199, 0.18)",
      icon: User,
      assets: "6 assets",
    },
    {
      id: "app-tier",
      name: "App Tier",
      type: "Core Microservices",
      status: "normal",
      x: 580,
      y: 195,
      color: "#0284C7",
      glowColor: "rgba(2, 132, 199, 0.18)",
      icon: Layers,
      assets: "15 assets",
    },
    {
      id: "internal",
      name: "Internal Services",
      type: "Internal VPC",
      status: "normal",
      x: 500,
      y: 295,
      color: "#0284C7",
      glowColor: "rgba(2, 132, 199, 0.18)",
      icon: Grid,
      assets: "10 assets",
    },
    {
      id: "database",
      name: "Database",
      type: "Production DB",
      status: "normal",
      x: 700,
      y: 205,
      color: "#0284C7",
      glowColor: "rgba(2, 132, 199, 0.18)",
      icon: Database,
      assets: "4 assets",
    },
    {
      id: "critical",
      name: "Critical Assets",
      type: "Tier-0 Crown Jewel",
      status: "compromised",
      x: 650,
      y: 290,
      color: "#DC2626",
      glowColor: "rgba(220, 38, 38, 0.35)",
      icon: Database,
      assets: "3 assets",
    },
  ];

  // Attack Path (red curve through Internet -> Firewall -> Web Tier -> App Tier -> Critical Assets)
  const attackPathD = "M 140 190 C 200 185, 220 180, 270 180 C 330 180, 380 190, 430 190 C 490 190, 520 195, 580 195 C 610 195, 620 250, 650 290";

  // Trust Relationships (subtle blue dashed lines)
  const trustPaths = [
    "M 370 95 C 385 140, 410 160, 430 190", // Office -> Web
    "M 620 90 C 610 135, 595 165, 580 195", // Cloud -> App
    "M 350 285 C 440 255, 510 230, 580 195", // Identity -> App
    "M 500 295 C 560 290, 600 290, 650 290", // Internal -> Critical
    "M 700 205 C 685 240, 665 265, 650 290", // DB -> Critical
  ];

  // 3D Scene Initialization
  useEffect(() => {
    if (viewMode !== "3D") return;
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF9FAFC);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(16, 18, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    dirLight.position.set(15, 25, 15);
    scene.add(dirLight);

    // Light grid
    const grid = new THREE.GridHelper(40, 30, 0xE2E8F0, 0xEDF2F7);
    grid.position.y = -0.01;
    scene.add(grid);

    // Procedural 3D nodes
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    nodes.forEach((n, idx) => {
      const x3d = (n.x - 450) * 0.04;
      const z3d = (n.y - 190) * 0.04;
      const isCrit = n.status === "compromised";
      const isRisk = n.status === "at_risk";
      const cHex = isCrit ? 0xEF4444 : isRisk ? 0xF59E0B : 0x0284C7;

      // Base cylinder
      const baseGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.25, 32);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.set(x3d, 0.12, z3d);
      nodeGroup.add(baseMesh);

      // Core shape
      const coreGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.8, 16);
      const coreMat = new THREE.MeshStandardMaterial({ color: cHex, metalness: 0.3, roughness: 0.2 });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.set(x3d, 0.6, z3d);
      nodeGroup.add(coreMesh);
    });

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      nodeGroup.rotation.y += 0.002;
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
  }, [viewMode]);

  return (
    <div
      className={`relative w-full ${height} bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] overflow-hidden select-none flex flex-col shadow-xs`}
    >
      {/* 1. CARD HEADER */}
      <div className="p-4 pb-2 flex items-center justify-between border-b border-[#F1F3F5] z-10 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#FFF2EB] border border-[#FF5722]/30 flex items-center justify-center text-[#FF5722]">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 tracking-wide font-display">
              Environment Digital Twin
            </h2>
            <p className="text-[10px] text-slate-500">
              Live model of your infrastructure, identities and trust relationships.
            </p>
          </div>
        </div>

        {/* Right Controls: View Switcher, Search, Filter, Maximize */}
        <div className="flex items-center gap-2">
          {/* Mode Pill Switcher */}
          <div className="flex rounded-lg bg-[#F1F4F8] p-0.5 text-xs font-semibold">
            <button
              onClick={() => setViewMode("3D")}
              className={`px-3 py-1 rounded-md transition-all text-xs ${
                viewMode === "3D"
                  ? "bg-[#181B20] text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              3D View
            </button>
            <button
              onClick={() => setViewMode("2D")}
              className={`px-3 py-1 rounded-md transition-all text-xs ${
                viewMode === "2D"
                  ? "bg-[#181B20] text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              2D View
            </button>
          </div>

          <button className="w-7 h-7 rounded-lg border border-[#E5E7EB] hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
            <Search className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 rounded-lg border border-[#E5E7EB] hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
            <Filter className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 rounded-lg border border-[#E5E7EB] hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. TOPOLOGY VIEWPORT */}
      <div className="relative flex-1 w-full overflow-hidden bg-[#FAFBFC]">
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

        {/* 2D Vector Canvas (Exact to Reference Photo) */}
        {viewMode === "2D" && (
          <div
            className="relative w-full h-full"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center", transition: "transform 0.2s ease" }}
          >
            <svg className="w-full h-full" viewBox="0 0 820 380">
              <defs>
                {/* Glow Filter */}
                <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Trust Relationship Dashed Curves */}
              {trustPaths.map((d, i) => (
                <path
                  key={`trust-${i}`}
                  d={d}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.2"
                  strokeDasharray="4,4"
                  strokeOpacity="0.7"
                />
              ))}

              {/* Attack Path Conduit (Glowing Red/Orange) */}
              {/* Outer Glow */}
              <path
                d={attackPathD}
                fill="none"
                stroke="#FF5722"
                strokeWidth="7"
                strokeOpacity="0.2"
                strokeLinecap="round"
              />
              {/* Core Solid Line */}
              <path
                d={attackPathD}
                fill="none"
                stroke="#FF3D00"
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Animated Attack Pulse */}
              <circle r="4" fill="#FF5722">
                <animateMotion path={attackPathD} dur="4s" repeatCount="indefinite" />
              </circle>

              {/* Render Nodes */}
              {nodes.map((n) => {
                const isSelected = activeNode?.id === n.id;
                const isCrit = n.status === "compromised";
                const isRisk = n.status === "at_risk";
                const Icon = n.icon;

                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x}, ${n.y})`}
                    onClick={() => {
                      setActiveNode(n);
                      if (onSelectAsset) onSelectAsset(n);
                    }}
                    className="cursor-pointer group/node"
                  >
                    {/* Soft Glowing Circular Halo */}
                    <circle
                      r={n.id === "critical" ? 36 : 28}
                      fill={n.glowColor}
                      filter="url(#softGlow)"
                    />

                    {/* Outer Border / Ring */}
                    <circle
                      r={n.id === "critical" ? 22 : 18}
                      fill="#FFFFFF"
                      stroke={isCrit ? "#EF4444" : isRisk ? "#F59E0B" : "#0284C7"}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all duration-200"
                    />

                    {/* Icon or Graphic inside */}
                    {n.id === "internet" ? (
                      <circle r="14" fill="#1E293B" />
                    ) : n.id === "firewall" ? (
                      <rect x="-8" y="-8" width="16" height="16" rx="3" fill="#EF4444" />
                    ) : n.id === "critical" ? (
                      <rect x="-9" y="-9" width="18" height="18" rx="4" fill="#DC2626" />
                    ) : (
                      <circle
                        r="14"
                        fill={isCrit ? "#FEE2E2" : isRisk ? "#FEF3C7" : "#E0F2FE"}
                      />
                    )}

                    {/* Center Icon */}
                    <foreignObject x="-9" y="-9" width="18" height="18">
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon
                          className={`w-3.5 h-3.5 ${
                            n.id === "internet" || n.id === "firewall" || n.id === "critical"
                              ? "text-white"
                              : isRisk
                              ? "text-amber-600"
                              : "text-sky-600"
                          }`}
                        />
                      </div>
                    </foreignObject>

                    {/* Node Text Label */}
                    <text
                      y={n.y > 220 ? -26 : 30}
                      textAnchor="middle"
                      fill={isCrit ? "#DC2626" : "#0F172A"}
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="Inter, sans-serif"
                    >
                      {n.name}
                    </text>
                    {n.assets && (
                      <text
                        y={n.y > 220 ? -16 : 41}
                        textAnchor="middle"
                        fill="#64748B"
                        fontSize="8"
                        fontFamily="Inter, sans-serif"
                      >
                        {n.assets}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Floating Zoom Controls (Left) */}
        <div className="absolute top-4 left-4 flex flex-col bg-white rounded-lg border border-[#E5E7EB] shadow-sm z-20 overflow-hidden">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
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
            onClick={() => setZoomLevel(1)}
            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Bottom Legend (Matching Exact Reference Photo) */}
        <div className="absolute bottom-3 left-4 flex items-center gap-4 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[10px] font-sans shadow-xs z-10">
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
            <span className="w-4 h-0.5 bg-[#FF3D00] rounded" />
            <span className="text-slate-700 font-medium">Attack Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-[#94A3B8]" />
            <span className="text-slate-700 font-medium">Trust Relationship</span>
          </div>
        </div>
      </div>
    </div>
  );
};
