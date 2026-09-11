import React, { useRef, useEffect, useState } from "react";
import { Plus, Minus, Search, Filter, Maximize2, RefreshCw } from "lucide-react";
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

export const Tactical3DScene: React.FC<Tactical3DSceneProps> = ({
  selectedAssetId,
  onSelectAsset,
  height = "h-[420px]",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<"3D" | "2D">("3D");
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Node positions matching the photo's exact layout
  const nodes = [
    {
      id: "internet",
      title: "External",
      subtitle: "Internet",
      type: "globe",
      x: 170,
      y: 280,
      assets: 1,
      color: "#94A3B8",
      glowColor: "rgba(255, 255, 255, 0.2)",
    },
    {
      id: "office",
      title: "Office Network",
      subtitle: "12 assets",
      type: "tower_blue",
      x: 370,
      y: 135,
      assets: 12,
      color: "#38BDF8",
      glowColor: "rgba(56, 189, 248, 0.25)",
    },
    {
      id: "cloud",
      title: "Cloud (AWS)",
      subtitle: "26 assets",
      type: "cloud",
      x: 520,
      y: 115,
      assets: 26,
      color: "#60A5FA",
      glowColor: "rgba(96, 165, 250, 0.25)",
    },
    {
      id: "web",
      title: "Web Tier",
      subtitle: "8 assets",
      type: "tower_amber",
      x: 430,
      y: 215,
      assets: 8,
      color: "#FFA000",
      glowColor: "rgba(255, 160, 0, 0.35)",
    },
    {
      id: "identity",
      title: "Identity (AD)",
      subtitle: "6 assets",
      type: "tower_blue",
      x: 365,
      y: 305,
      assets: 6,
      color: "#38BDF8",
      glowColor: "rgba(56, 189, 248, 0.25)",
    },
    {
      id: "app",
      title: "App Tier",
      subtitle: "15 assets",
      type: "tower_cyan",
      x: 535,
      y: 235,
      assets: 15,
      color: "#00E5FF",
      glowColor: "rgba(0, 229, 255, 0.3)",
    },
    {
      id: "database",
      title: "Database",
      subtitle: "4 assets",
      type: "cylinder_orange",
      x: 690,
      y: 200,
      assets: 4,
      color: "#FF5722",
      glowColor: "rgba(255, 87, 34, 0.4)",
    },
    {
      id: "critical",
      title: "Critical Assets",
      subtitle: "3 assets",
      type: "beacon_red",
      x: 565,
      y: 325,
      assets: 3,
      color: "#FF1744",
      glowColor: "rgba(255, 23, 68, 0.5)",
    },
  ];

  // Conduits matching the photo
  const conduits = [
    // Attack Path (red/orange glowing line)
    { from: "internet", to: "web", isAttack: true },
    { from: "web", to: "app", isAttack: true },
    { from: "app", to: "critical", isAttack: true },
    { from: "critical", to: "database", isAttack: true },

    // Trust Relationships (blue dashed lines)
    { from: "office", to: "identity", isAttack: false },
    { from: "identity", to: "web", isAttack: false },
    { from: "cloud", to: "app", isAttack: false },
    { from: "office", to: "cloud", isAttack: false },
    { from: "identity", to: "critical", isAttack: false },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let pulseProgress = 0;

    const render = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
          canvas.width = clientWidth;
          canvas.height = clientHeight;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Pan & Zoom
      const cx = canvas.width / 2 + pan.x;
      const cy = canvas.height / 2 + pan.y;
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom);
      ctx.translate(-460, -220);

      pulseProgress = (pulseProgress + 0.012) % 1;

      // 1. ISOMETRIC FLOOR GRID
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";

      const gridSpacing = 42;
      const xStart = 40;
      const yStart = 60;
      const gridCount = 20;

      for (let i = 0; i <= gridCount; i++) {
        // Diagonal 1
        ctx.beginPath();
        ctx.moveTo(xStart + i * gridSpacing, yStart);
        ctx.lineTo(xStart + (i - 7) * gridSpacing, yStart + gridCount * (gridSpacing * 0.52));
        ctx.stroke();

        // Diagonal 2
        ctx.beginPath();
        ctx.moveTo(xStart - 7 * gridSpacing + i * gridSpacing, yStart + gridCount * (gridSpacing * 0.52));
        ctx.lineTo(xStart + i * gridSpacing + 7 * gridSpacing, yStart);
        ctx.stroke();
      }

      // 2. CONDUITS (Attack Paths & Trust Relationships)
      conduits.forEach((c) => {
        const src = nodes.find((n) => n.id === c.from);
        const tgt = nodes.find((n) => n.id === c.to);
        if (!src || !tgt) return;

        if (c.isAttack) {
          // Curved smooth attack path with red/orange glow
          const midX = (src.x + tgt.x) / 2;
          const midY = (src.y + tgt.y) / 2 + 5;

          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.quadraticCurveTo(midX, midY, tgt.x, tgt.y);

          // Outer Glow
          ctx.strokeStyle = "rgba(255, 87, 34, 0.25)";
          ctx.lineWidth = 8;
          ctx.stroke();

          // Core Beam
          ctx.strokeStyle = "rgba(255, 59, 48, 0.85)";
          ctx.lineWidth = 3;
          ctx.shadowColor = "#FF3B30";
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Inner White/Orange Core
          ctx.strokeStyle = "#FFA000";
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Traveling Spark Particles
          const t = pulseProgress;
          const px = (1 - t) * (1 - t) * src.x + 2 * (1 - t) * t * midX + t * t * tgt.x;
          const py = (1 - t) * (1 - t) * src.y + 2 * (1 - t) * t * midY + t * t * tgt.y;

          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowColor = "#FFA000";
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Blue dashed trust relationships
          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(tgt.x, tgt.y);
          ctx.strokeStyle = "rgba(56, 189, 248, 0.28)";
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // 3. NODES (3D Isometric representations matching photo)
      nodes.forEach((n) => {
        // Pedestal Glow
        ctx.beginPath();
        ctx.ellipse(n.x, n.y + 12, 28, 14, 0, 0, Math.PI * 2);
        ctx.fillStyle = n.glowColor;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw isometric pedestal base
        ctx.beginPath();
        ctx.ellipse(n.x, n.y + 10, 24, 11, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(15, 20, 30, 0.9)";
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 1.2;
        ctx.fill();
        ctx.stroke();

        if (n.type === "globe") {
          // Wireframe 3D Globe for External Internet
          ctx.save();
          ctx.translate(n.x, n.y);
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.stroke();

          // Ellipses
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.beginPath();
          ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
          ctx.ellipse(0, 0, 7, 16, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } else if (n.type === "cloud") {
          // 3D Puffy Cloud Icon
          ctx.save();
          ctx.translate(n.x, n.y);
          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
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
        } else if (n.type === "cylinder_orange") {
          // Layered Database Cylinders
          ctx.save();
          ctx.translate(n.x, n.y);
          ctx.fillStyle = "rgba(255, 87, 34, 0.35)";
          ctx.strokeStyle = "#FF5722";
          ctx.lineWidth = 1.8;
          ctx.shadowColor = "#FF5722";
          ctx.shadowBlur = 12;

          for (let l = 0; l < 3; l++) {
            ctx.beginPath();
            ctx.ellipse(0, 8 - l * 7, 17, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
          ctx.restore();
        } else if (n.type === "beacon_red") {
          // Critical Assets Beacon Cylinder with Forcefield Rays
          ctx.save();
          ctx.translate(n.x, n.y);

          // Forcefield Ring Pulse
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255, 23, 68, 0.4)";
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Cylinder stack
          ctx.fillStyle = "rgba(255, 23, 68, 0.45)";
          ctx.strokeStyle = "#FF1744";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#FF1744";
          ctx.shadowBlur = 18;

          for (let l = 0; l < 3; l++) {
            ctx.beginPath();
            ctx.ellipse(0, 8 - l * 7, 18, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.shadowBlur = 0;

          // Crosshair icon in front
          ctx.beginPath();
          ctx.arc(-22, -2, 7, 0, Math.PI * 2);
          ctx.strokeStyle = "#FF1744";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-22, -9);
          ctx.lineTo(-22, 5);
          ctx.moveTo(-29, -2);
          ctx.lineTo(-15, -2);
          ctx.stroke();

          ctx.restore();
        } else {
          // Server Tier 3D Towers
          ctx.save();
          ctx.translate(n.x, n.y);

          const w = 18;
          const h = 26;

          // Main tower face
          ctx.fillStyle = "rgba(13, 17, 26, 0.9)";
          ctx.strokeStyle = n.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.rect(-w / 2, -h / 2, w, h);
          ctx.fill();
          ctx.stroke();

          // LEDs
          ctx.fillStyle = n.color;
          ctx.beginPath();
          ctx.arc(-w / 4, -h / 4, 1.5, 0, Math.PI * 2);
          ctx.arc(w / 4, -h / 4, 1.5, 0, Math.PI * 2);
          ctx.arc(-w / 4, 2, 1.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }

        // Labels matching photo
        ctx.font = "bold 11px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = n.type === "beacon_red" ? "#FF5252" : "#FFFFFF";
        ctx.fillText(n.title, n.x, n.y + 26);

        ctx.font = "9px 'Inter', sans-serif";
        ctx.fillStyle = "#8E98A8";
        ctx.fillText(n.subtitle, n.x, n.y + 37);
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [zoom, pan]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${height} bg-[#0A0D14] rounded-xl border border-[#191F2D] overflow-hidden select-none`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />

      {/* Top Right Controls Overlay matching photo */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        {/* 3D View / 2D View Switch */}
        <div className="flex rounded-lg bg-[#0D1017] border border-[#1E2536] p-0.5 text-xs font-medium backdrop-blur-md">
          <button
            onClick={() => setViewMode("3D")}
            className={`px-3 py-1 rounded-md transition-all text-xs font-medium ${
              viewMode === "3D"
                ? "bg-[#1E2638] text-white font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            3D View
          </button>
          <button
            onClick={() => setViewMode("2D")}
            className={`px-3 py-1 rounded-md transition-all text-xs font-medium ${
              viewMode === "2D"
                ? "bg-[#1E2638] text-white font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            2D View
          </button>
        </div>

        {/* View Action Icons */}
        <button className="w-7 h-7 rounded-lg bg-[#0D1017] border border-[#1E2536] hover:border-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-all">
          <Search className="w-3.5 h-3.5" />
        </button>
        <button className="w-7 h-7 rounded-lg bg-[#0D1017] border border-[#1E2536] hover:border-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-all">
          <Filter className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            setZoom(1.0);
            setPan({ x: 0, y: 0 });
          }}
          className="w-7 h-7 rounded-lg bg-[#0D1017] border border-[#1E2536] hover:border-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-all"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Left Zoom & View Controls Pill matching photo */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center bg-[#0D1017] border border-[#1E2536] rounded-lg p-1 z-10 shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
          className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <div className="w-0.5 h-10 bg-slate-800 rounded-full my-1 relative">
          <div
            className="w-2 h-2 rounded-full bg-[#FF5722] absolute left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_6px_#FF5722]"
            style={{
              top: `${Math.max(10, Math.min(90, ((zoom - 0.5) / 1.7) * 100))}%`,
            }}
          />
        </div>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
          className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <div className="w-4 h-[1px] bg-slate-800 my-0.5" />
        <button
          onClick={() => {
            setZoom(1.0);
            setPan({ x: 0, y: 0 });
          }}
          title="Reset Orientation"
          className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {/* Bottom Left Inset Topological Minimap matching photo */}
      <div className="absolute left-3 bottom-3 w-36 h-20 rounded-lg bg-[#080B10]/90 border border-[#1E2536] p-1.5 pointer-events-none">
        <div className="text-[8px] text-slate-500 font-mono uppercase tracking-wider mb-1">
          Topological Map
        </div>
        <div className="relative w-full h-12 border border-dashed border-slate-800 rounded">
          {nodes.map((n) => (
            <div
              key={n.id}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                left: `${(n.x / 850) * 100}%`,
                top: `${(n.y / 420) * 100}%`,
                backgroundColor: n.color,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Right Legend matching photo */}
      <div className="absolute right-3 bottom-3 rounded-lg bg-[#080B10]/90 border border-[#1E2536] px-3 py-1.5 text-[10px] font-sans text-slate-400 flex items-center gap-3.5 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FFA000]" />
          <span>At Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FF1744] animate-pulse" />
          <span>Compromised</span>
        </div>
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
          <span className="w-3 h-0.5 bg-[#FF1744] shadow-[0_0_4px_#FF1744]" />
          <span>Attack Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#38BDF8]" />
          <span>Trust Relationship</span>
        </div>
      </div>
    </div>
  );
};
