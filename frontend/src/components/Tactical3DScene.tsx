import React, { useRef, useEffect, useState } from "react";
import { Plus, Minus, Search, Filter, Maximize2, Shield, Eye } from "lucide-react";
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

interface TacticalNode {
  id: string;
  name: string;
  category: "INTERNET" | "CLOUD" | "OFFICE" | "IDENTITY" | "WEB" | "APP" | "DATABASE" | "CRITICAL";
  x: number;
  y: number;
  z: number;
  assetCount: number;
  status: "normal" | "at_risk" | "compromised";
  color: string;
}

export const Tactical3DScene: React.FC<Tactical3DSceneProps> = ({
  selectedAssetId,
  onSelectAsset,
  height = "h-[440px]",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<"3D" | "2D">("3D");
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<TacticalNode | null>(null);

  // Nodes arranged matching the photo's isometric infrastructure layout
  const nodes: TacticalNode[] = [
    {
      id: "internet",
      name: "External Internet",
      category: "INTERNET",
      x: 140,
      y: 280,
      z: 0,
      assetCount: 1,
      status: "normal",
      color: "#94A3B8",
    },
    {
      id: "office",
      name: "Office Network",
      category: "OFFICE",
      x: 350,
      y: 130,
      z: 20,
      assetCount: 12,
      status: "normal",
      color: "#38BDF8",
    },
    {
      id: "cloud",
      name: "Cloud (AWS)",
      category: "CLOUD",
      x: 520,
      y: 110,
      z: 40,
      assetCount: 26,
      status: "normal",
      color: "#60A5FA",
    },
    {
      id: "identity",
      name: "Identity (AD)",
      category: "IDENTITY",
      x: 340,
      y: 310,
      z: 15,
      assetCount: 6,
      status: "normal",
      color: "#38BDF8",
    },
    {
      id: "web",
      name: "Web Tier",
      category: "WEB",
      x: 400,
      y: 220,
      z: 30,
      assetCount: 8,
      status: "at_risk",
      color: "#FF9800",
    },
    {
      id: "app",
      name: "App Tier",
      category: "APP",
      x: 520,
      y: 250,
      z: 35,
      assetCount: 15,
      status: "at_risk",
      color: "#00E5FF",
    },
    {
      id: "database",
      name: "Database",
      category: "DATABASE",
      x: 680,
      y: 220,
      z: 25,
      assetCount: 4,
      status: "compromised",
      color: "#FF3D00",
    },
    {
      id: "critical",
      name: "Critical Assets",
      category: "CRITICAL",
      x: 550,
      y: 340,
      z: 45,
      assetCount: 3,
      status: "compromised",
      color: "#FF1744",
    },
  ];

  // Connections matching the photo
  const conduits = [
    // Attack Path (Glowing red animated)
    { from: "internet", to: "web", type: "attack", active: true },
    { from: "web", to: "app", type: "attack", active: true },
    { from: "app", to: "critical", type: "attack", active: true },
    { from: "critical", to: "database", type: "attack", active: true },
    
    // Trust Relationships (Blue)
    { from: "office", to: "identity", type: "trust", active: false },
    { from: "identity", to: "web", type: "trust", active: false },
    { from: "cloud", to: "app", type: "trust", active: false },
    { from: "office", to: "cloud", type: "trust", active: false },
    { from: "identity", to: "critical", type: "trust", active: false },
  ];

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let pulseProgress = 0;

    const render = () => {
      // Auto-resize canvas to match container size
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
          canvas.width = clientWidth;
          canvas.height = clientHeight;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Pan & Zoom transform
      const centerX = canvas.width / 2 + pan.x;
      const centerY = canvas.height / 2 + pan.y;
      ctx.translate(centerX, centerY);
      ctx.scale(zoom, zoom);
      ctx.translate(-450, -240);

      pulseProgress = (pulseProgress + 0.015) % 1;

      // 1. Isometric Grid Floor
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";

      const gridSize = 45;
      const numLines = 18;
      const startX = 50;
      const startY = 80;

      // Isometric slant grid lines
      for (let i = 0; i <= numLines; i++) {
        // Diagonal 1
        ctx.beginPath();
        ctx.moveTo(startX + i * gridSize, startY);
        ctx.lineTo(startX + (i - 6) * gridSize, startY + numLines * (gridSize * 0.55));
        ctx.stroke();

        // Diagonal 2
        ctx.beginPath();
        ctx.moveTo(startX - 6 * gridSize + i * gridSize, startY + numLines * (gridSize * 0.55));
        ctx.lineTo(startX + i * gridSize + 6 * gridSize, startY);
        ctx.stroke();
      }

      // 2. Draw Conduits / Relationships
      conduits.forEach((edge) => {
        const source = nodes.find((n) => n.id === edge.from);
        const target = nodes.find((n) => n.id === edge.to);
        if (!source || !target) return;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (edge.type === "attack") {
          // Intense neon red attack conduit
          ctx.strokeStyle = "rgba(255, 59, 48, 0.6)";
          ctx.lineWidth = 3;
          ctx.shadowColor = "#FF3B30";
          ctx.shadowBlur = 12;
          ctx.stroke();

          // Outer ambient glow
          ctx.strokeStyle = "rgba(255, 87, 34, 0.25)";
          ctx.lineWidth = 7;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Animated energy pulse traveling along the conduit
          const px = source.x + (target.x - source.x) * pulseProgress;
          const py = source.y + (target.y - source.y) * pulseProgress;

          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#FFB300";
          ctx.shadowColor = "#FFA000";
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Blue trust relationship conduit
          ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // 3. Draw 3D Isometric Nodes
      nodes.forEach((node) => {
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedAssetId === node.id;

        // Base Pedestal Glow
        ctx.beginPath();
        ctx.ellipse(node.x, node.y + 12, 28, 14, 0, 0, Math.PI * 2);
        if (node.status === "compromised") {
          ctx.fillStyle = "rgba(255, 38, 0, 0.25)";
          ctx.shadowColor = "#FF2600";
          ctx.shadowBlur = 20;
        } else if (node.status === "at_risk") {
          ctx.fillStyle = "rgba(255, 152, 0, 0.2)";
          ctx.shadowColor = "#FF9800";
          ctx.shadowBlur = 15;
        } else {
          ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
          ctx.shadowColor = "#38BDF8";
          ctx.shadowBlur = 10;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Custom Render by Node Category
        if (node.category === "INTERNET") {
          // Wireframe Globe
          ctx.save();
          ctx.translate(node.x, node.y);
          ctx.strokeStyle = "#E2E8F0";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.stroke();

          // Globe latitude / longitude rings
          ctx.beginPath();
          ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
          ctx.ellipse(0, 0, 7, 16, 0, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(226, 232, 240, 0.4)";
          ctx.stroke();
          ctx.restore();
        } else if (node.category === "CLOUD") {
          // 3D Cloud
          ctx.save();
          ctx.translate(node.x, node.y);
          ctx.fillStyle = "#1E293B";
          ctx.strokeStyle = "#60A5FA";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(-8, 0, 9, 0, Math.PI * 2);
          ctx.arc(4, -6, 11, 0, Math.PI * 2);
          ctx.arc(12, 2, 8, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        } else if (node.category === "CRITICAL" || node.category === "DATABASE") {
          // Glowing Cylinder Stack
          const cylColor = node.category === "CRITICAL" ? "#FF1744" : "#FF5722";
          ctx.save();
          ctx.translate(node.x, node.y);

          // Cylinder body
          ctx.fillStyle = node.category === "CRITICAL" ? "rgba(255, 23, 68, 0.4)" : "rgba(255, 87, 34, 0.35)";
          ctx.strokeStyle = cylColor;
          ctx.lineWidth = 2;
          ctx.shadowColor = cylColor;
          ctx.shadowBlur = 15;

          // 3-tiered cylinder disks
          for (let l = 0; l < 3; l++) {
            ctx.beginPath();
            ctx.ellipse(0, 10 - l * 8, 18, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
          ctx.restore();
        } else {
          // Server Tier 3D isometric cuboids / towers
          ctx.save();
          ctx.translate(node.x, node.y);

          const w = 18;
          const h = 26;
          const boxColor = node.color;

          // Front face
          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.strokeStyle = boxColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.rect(-w / 2, -h / 2, w, h);
          ctx.fill();
          ctx.stroke();

          // Server LEDs
          ctx.fillStyle = boxColor;
          ctx.beginPath();
          ctx.arc(-w / 4, -h / 4, 1.5, 0, Math.PI * 2);
          ctx.arc(w / 4, -h / 4, 1.5, 0, Math.PI * 2);
          ctx.arc(-w / 4, 0, 1.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }

        // Selection / Hover Indicator Ring
        if (isHovered || isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 26, 0, Math.PI * 2);
          ctx.strokeStyle = "#00E5FF";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Node Title Label
        ctx.fillStyle = node.status === "compromised" ? "#FF8A80" : "#FFFFFF";
        ctx.font = "bold 11px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(node.name, node.x, node.y + 28);

        // Asset Count Subtitle
        ctx.fillStyle = "#94A3B8";
        ctx.font = "9px 'Inter', sans-serif";
        ctx.fillText(`${node.assetCount} assets`, node.x, node.y + 39);
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [zoom, pan, hoveredNode, selectedAssetId, viewMode]);

  // Mouse event listeners for Pan & Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
      return;
    }

    // Check hover
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const worldX = (clickX - (canvas.width / 2 + pan.x)) / zoom + 450;
    const worldY = (clickY - (canvas.height / 2 + pan.y)) / zoom + 240;

    const hit = nodes.find(
      (n) => Math.hypot(worldX - n.x, worldY - n.y) < 30
    );
    setHoveredNode(hit || null);
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${height} bg-[#0A0D14] rounded-xl border border-[#1E2638] overflow-hidden select-none group`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Canvas Element */}
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />

      {/* Top Controls Overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        {/* 3D / 2D View Switch */}
        <div className="flex rounded-lg bg-[#0D111A]/90 border border-slate-800 p-0.5 text-xs font-medium backdrop-blur-md">
          <button
            onClick={() => setViewMode("3D")}
            className={`px-3 py-1 rounded-md transition-all ${
              viewMode === "3D"
                ? "bg-[#1E2638] text-white shadow-sm font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            3D View
          </button>
          <button
            onClick={() => setViewMode("2D")}
            className={`px-3 py-1 rounded-md transition-all ${
              viewMode === "2D"
                ? "bg-[#1E2638] text-white shadow-sm font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            2D View
          </button>
        </div>

        {/* View Action Icons */}
        <button
          title="Search in graph"
          className="w-8 h-8 rounded-lg bg-[#0D111A]/90 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all backdrop-blur-md"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
        <button
          title="Filter layers"
          className="w-8 h-8 rounded-lg bg-[#0D111A]/90 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all backdrop-blur-md"
        >
          <Filter className="w-3.5 h-3.5" />
        </button>
        <button
          title="Reset Zoom / Pan"
          onClick={() => {
            setZoom(1.0);
            setPan({ x: 0, y: 0 });
          }}
          className="w-8 h-8 rounded-lg bg-[#0D111A]/90 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all backdrop-blur-md"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Left Zoom Controls Pill */}
      <div className="absolute left-3 top-1/3 -translate-y-1/2 flex flex-col items-center bg-[#0D111A]/90 border border-slate-800 rounded-lg p-1 backdrop-blur-md z-10 shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
          className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom In"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <div className="w-1 h-12 bg-slate-800 rounded-full my-1 relative">
          <div
            className="w-2.5 h-2.5 rounded-full bg-orange-500 absolute left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_6px_#FF5722]"
            style={{
              top: `${Math.max(10, Math.min(90, ((zoom - 0.5) / 1.7) * 100))}%`,
            }}
          />
        </div>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
          className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Left Inset Minimap */}
      <div className="absolute left-3 bottom-3 w-36 h-24 rounded-lg bg-[#080A0F]/85 border border-slate-800/80 p-1.5 backdrop-blur-md pointer-events-none">
        <div className="text-[8px] text-slate-500 font-mono uppercase tracking-wider mb-1">
          Topological Map
        </div>
        <div className="relative w-full h-16 border border-dashed border-slate-800 rounded">
          {nodes.map((n) => (
            <div
              key={n.id}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                left: `${(n.x / 800) * 100}%`,
                top: `${(n.y / 450) * 100}%`,
                backgroundColor:
                  n.status === "compromised"
                    ? "#FF1744"
                    : n.status === "at_risk"
                    ? "#FF9800"
                    : "#38BDF8",
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Right Legend */}
      <div className="absolute right-3 bottom-3 rounded-lg bg-[#080A0F]/85 border border-slate-800/80 px-3 py-2 text-[10px] font-sans text-slate-400 backdrop-blur-md flex items-center gap-4 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FF9800]" />
          <span>At Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FF1744] animate-pulse" />
          <span>Compromised</span>
        </div>
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
          <span className="w-3.5 h-0.5 bg-[#FF1744] shadow-[0_0_4px_#FF1744]" />
          <span>Attack Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-0.5 bg-[#38BDF8]" />
          <span>Trust Relationship</span>
        </div>
      </div>
    </div>
  );
};
