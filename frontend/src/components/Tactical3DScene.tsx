import React, { useRef, useEffect, useState } from "react";
import { Asset, Relationship } from "@/lib/api";

interface Tactical3DSceneProps {
  assets: Asset[];
  relationships: Relationship[];
  selectedAssetId?: string;
  onSelectAsset?: (asset: Asset) => void;
  highlightPath?: string[]; // Array of node IDs representing the active attack path
  compromisedNodes?: string[];
}

export const Tactical3DScene: React.FC<Tactical3DSceneProps> = ({
  assets,
  relationships,
  selectedAssetId,
  onSelectAsset,
  highlightPath = [],
  compromisedNodes = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Fixed zone coordinates for layout
  const zoneCoordinates: Record<string, { x: number; y: number }> = {
    INTERNET: { x: 80, y: 300 },
    DMZ: { x: 260, y: 300 },
    CORPORATE_LAN: { x: 460, y: 220 },
    MANAGEMENT: { x: 460, y: 380 },
    SECURE_TIER: { x: 680, y: 260 },
    BACKUP_VAULT: { x: 880, y: 300 },
    CLOUD_VPC: { x: 460, y: 90 },
  };

  // Node position map with staggered offsets per zone
  const nodePositions: Record<string, { x: number; y: number }> = {};
  const zoneCounters: Record<string, number> = {};

  assets.forEach((asset) => {
    const zone = asset.zone || "CORPORATE_LAN";
    const base = zoneCoordinates[zone] || { x: 500, y: 300 };
    const count = zoneCounters[zone] || 0;
    zoneCounters[zone] = count + 1;

    // Stagger vertically
    const offsetY = (count - 1) * 70;
    nodePositions[asset.id] = {
      x: base.x + (count % 2 === 0 ? 20 : -20),
      y: base.y + offsetY,
    };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let pulseOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Apply zoom & pan
      ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-500, -250);

      pulseOffset = (pulseOffset + 0.05) % 1;

      // 1. Draw Zone Boundaries
      Object.entries(zoneCoordinates).forEach(([zoneName, coord]) => {
        ctx.strokeStyle = "rgba(0, 229, 255, 0.08)";
        ctx.fillStyle = "rgba(11, 14, 20, 0.4)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        const boxW = 160;
        const boxH = 220;
        ctx.strokeRect(coord.x - 70, coord.y - 100, boxW, boxH);
        ctx.fillRect(coord.x - 70, coord.y - 100, boxW, boxH);

        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(0, 229, 255, 0.35)";
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillText(zoneName.replace("_", " "), coord.x - 60, coord.y - 85);
      });

      // 2. Draw Relationships (Edges)
      relationships.forEach((rel) => {
        const src = nodePositions[rel.source_id];
        const tgt = nodePositions[rel.target_id];
        if (!src || !tgt) return;

        const isPathEdge =
          highlightPath.includes(rel.source_id) &&
          highlightPath.includes(rel.target_id) &&
          Math.abs(highlightPath.indexOf(rel.source_id) - highlightPath.indexOf(rel.target_id)) === 1;

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);

        if (rel.is_blocked) {
          ctx.strokeStyle = "rgba(255, 59, 48, 0.25)";
          ctx.setLineDash([2, 4]);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (isPathEdge) {
          ctx.strokeStyle = "#FF3B30";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#FF3B30";
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Animated particle on active attack path
          const px = src.x + (tgt.x - src.x) * pulseOffset;
          const py = src.y + (tgt.y - src.y) * pulseOffset;
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = "#FFB300";
          ctx.fill();
        } else {
          ctx.strokeStyle =
            rel.type === "CREDENTIAL_ACCESS"
              ? "rgba(255, 179, 0, 0.35)"
              : "rgba(0, 229, 255, 0.2)";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      });

      // 3. Draw Nodes (Assets)
      assets.forEach((asset) => {
        const pos = nodePositions[asset.id];
        if (!pos) return;

        const isSelected = selectedAssetId === asset.id;
        const isCompromised =
          asset.is_compromised || compromisedNodes.includes(asset.id);
        const isCrownJewel = asset.criticality === "CRITICAL";

        // Glow ring if selected or compromised
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 22, 0, Math.PI * 2);
          ctx.strokeStyle = "#00E5FF";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#00E5FF";
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (isCompromised) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
          ctx.strokeStyle = "#FF3B30";
          ctx.lineWidth = 1.8;
          ctx.shadowColor = "#FF3B30";
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);

        if (isCompromised) {
          ctx.fillStyle = "#7F1D1D";
        } else if (isCrownJewel) {
          ctx.fillStyle = "#78350F";
        } else {
          ctx.fillStyle = "#0F172A";
        }
        ctx.fill();

        ctx.strokeStyle = isCompromised
          ? "#EF4444"
          : isCrownJewel
          ? "#F59E0B"
          : isSelected
          ? "#00E5FF"
          : "#334155";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node ID label
        ctx.fillStyle = isSelected ? "#00E5FF" : isCompromised ? "#FCA5A5" : "#E2E8F0";
        ctx.font = "bold 10px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(asset.id, pos.x, pos.y + 26);

        // Subtitle / Name
        ctx.fillStyle = "#64748B";
        ctx.font = "8px 'Space Grotesk', sans-serif";
        ctx.fillText(asset.name.slice(0, 18), pos.x, pos.y + 36);
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [assets, relationships, selectedAssetId, highlightPath, compromisedNodes, zoom, pan]);

  // Click handler to select asset
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Transform screen click back to world coordinate
    const worldX = (clickX - (canvas.width / 2 + pan.x)) / zoom + 500;
    const worldY = (clickY - (canvas.height / 2 + pan.y)) / zoom + 250;

    let found: Asset | undefined;
    for (const asset of assets) {
      const pos = nodePositions[asset.id];
      if (!pos) continue;
      const dist = Math.hypot(worldX - pos.x, worldY - pos.y);
      if (dist <= 18) {
        found = asset;
        break;
      }
    }

    if (found && onSelectAsset) {
      onSelectAsset(found);
    }
  };

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
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="relative w-full h-full bg-[#05070A] rounded-lg border border-cyan-950/40 overflow-hidden select-none">
      {/* HUD Overlay Controls */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 font-mono text-[11px]">
        <div className="px-2 py-1 rounded bg-[#0B0E14]/80 border border-cyan-900/40 text-cyan-300">
          NODES: <span className="text-white font-bold">{assets.length}</span>
        </div>
        <div className="px-2 py-1 rounded bg-[#0B0E14]/80 border border-cyan-900/40 text-cyan-300">
          EDGES: <span className="text-white font-bold">{relationships.length}</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 font-mono text-[11px]">
        <button
          onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
          className="w-7 h-7 rounded bg-slate-900 border border-slate-700 text-slate-200 hover:text-[#00E5FF] hover:border-[#00E5FF] flex items-center justify-center font-bold"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
          className="w-7 h-7 rounded bg-slate-900 border border-slate-700 text-slate-200 hover:text-[#00E5FF] hover:border-[#00E5FF] flex items-center justify-center font-bold"
        >
          -
        </button>
        <button
          onClick={() => {
            setZoom(1.0);
            setPan({ x: 0, y: 0 });
          }}
          className="px-2 h-7 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-[10px]"
        >
          RESET
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={1000}
        height={500}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
