import React, { useState, useMemo } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Asset, Relationship } from "@/lib/api";
import { EASE } from "@/lib/animations";

// ── Node positions (matching seed data topology) ───────────────────
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  "EXT-INTERNET": { x: 60, y: 250 },
  "FW-EDGE-01": { x: 170, y: 250 },
  "WEB-SRV-01": { x: 270, y: 170 },
  "VPN-GW-01": { x: 270, y: 330 },
  "WS-FIN-02": { x: 400, y: 150 },
  "WS-ENG-04": { x: 400, y: 270 },
  "APP-SRV-01": { x: 530, y: 170 },
  "DC-CORP-01": { x: 530, y: 290 },
  "SIEM-SOC-01": { x: 530, y: 400 },
  "CLOUD-K8S-01": { x: 670, y: 160 },
  "DB-PROD-01": { x: 670, y: 260 },
  "VAULT-BACKUP-01": { x: 800, y: 300 },
};

const CROWN_JEWELS = new Set(["DC-CORP-01", "DB-PROD-01", "VAULT-BACKUP-01"]);

interface TopologyCanvasProps {
  assets?: Asset[];
  relationships?: Relationship[];
  highlightPath?: string[];
  compromisedNodes?: string[];
  blastOrigin?: string | null;
  blastReachable?: string[];
  hoveredNode?: string | null;
  onNodeClick?: (id: string) => void;
  onNodeHover?: (id: string | null) => void;
  className?: string;
  showLabels?: boolean;
  progressiveReveal?: boolean;
  revealProgress?: number;
  scanningNode?: string | null;
  scannedNodes?: string[];
  anomalyNodes?: string[];
}

export const TopologyCanvas: React.FC<TopologyCanvasProps> = ({
  assets,
  relationships,
  highlightPath = [],
  compromisedNodes = [],
  blastOrigin = null,
  blastReachable = [],
  hoveredNode = null,
  onNodeClick,
  onNodeHover,
  className,
  showLabels = false,
  progressiveReveal = false,
  revealProgress = 1,
  scanningNode = null,
  scannedNodes = [],
  anomalyNodes = [],
}) => {
  const nodes = useMemo(() => {
    if (assets && assets.length > 0) {
      return assets.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        zone: a.zone,
        criticality: a.criticality,
        x: NODE_POSITIONS[a.id]?.x ?? 100,
        y: NODE_POSITIONS[a.id]?.y ?? 100,
        isCrownJewel: CROWN_JEWELS.has(a.id) || a.criticality === "CRITICAL",
      }));
    }
    return [];
  }, [assets]);

  const edges = useMemo(() => {
    if (relationships && relationships.length > 0) {
      return relationships.map((r) => ({
        id: r.id,
        from: r.source_id,
        to: r.target_id,
        type: r.type,
      }));
    }
    return [];
  }, [relationships]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, typeof nodes[number]>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  // Determine connected nodes for hover highlighting
  const connectedToHovered = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const connected = new Set<string>([hoveredNode]);
    edges.forEach((e) => {
      if (e.from === hoveredNode) connected.add(e.to);
      if (e.to === hoveredNode) connected.add(e.from);
    });
    return connected;
  }, [hoveredNode, edges]);

  const isNodeVisible = (idx: number) => {
    if (!progressiveReveal) return true;
    return idx / nodes.length < revealProgress;
  };

  const isEdgeVisible = (idx: number) => {
    if (!progressiveReveal) return true;
    return idx / edges.length < revealProgress;
  };

  const isEdgeHighlighted = (from: string, to: string) => {
    if (!highlightPath || highlightPath.length < 2) return false;
    for (let i = 0; i < highlightPath.length - 1; i++) {
      if (
        (highlightPath[i] === from && highlightPath[i + 1] === to) ||
        (highlightPath[i] === to && highlightPath[i + 1] === from)
      ) {
        return true;
      }
    }
    return false;
  };

  const getNodeColor = (nodeId: string) => {
    if (compromisedNodes.includes(nodeId)) return "#EF4444";
    if (blastOrigin === nodeId) return "#F25C1F";
    if (blastReachable.includes(nodeId)) return "#F59E0B";
    if (hoveredNode && !connectedToHovered.has(nodeId)) return "#3F3F46";
    if (hoveredNode && connectedToHovered.has(nodeId) && nodeId !== hoveredNode) return "#F25C1F";
    if (anomalyNodes.includes(nodeId)) return "#F97316";
    if (CROWN_JEWELS.has(nodeId)) return "#8B5CF6";
    return "#52525B";
  };

  const getEdgeColor = (from: string, to: string) => {
    if (isEdgeHighlighted(from, to)) return "#EF4444";
    if (blastOrigin && (blastReachable.includes(from) || blastReachable.includes(to))) return "#F59E0B";
    if (hoveredNode && connectedToHovered.has(from) && connectedToHovered.has(to)) return "#F25C1F";
    return "#27272A";
  };

  return (
    <svg
      className={className}
      viewBox="0 0 860 460"
      fill="none"
      onMouseLeave={() => onNodeHover?.(null)}
    >
      <defs>
        <filter id="topo-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="topo-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {edges.map((edge, i) => {
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);
        if (!from || !to) return null;
        if (!isEdgeVisible(i)) return null;

        const highlighted = isEdgeHighlighted(edge.from, edge.to);
        const isBlast = blastOrigin && (blastReachable.includes(edge.from) || blastReachable.includes(edge.to));
        const isHoverConnected = hoveredNode && connectedToHovered.has(edge.from) && connectedToHovered.has(edge.to);

        return (
          <motion.line
            key={edge.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={getEdgeColor(edge.from, edge.to)}
            strokeWidth={highlighted ? 2 : isBlast || isHoverConnected ? 1.5 : 0.8}
            strokeDasharray={highlighted ? "0" : "3,3"}
            opacity={progressiveReveal ? 0 : (hoveredNode && !isHoverConnected && !highlighted ? 0.15 : 0.5)}
            initial={progressiveReveal ? { opacity: 0, pathLength: 0 } : false}
            whileInView={progressiveReveal ? { opacity: 0.5, pathLength: 1 } : undefined}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.03, ease: EASE }}
          />
        );
      })}

      {/* Highlighted attack path edges (drawn on top) */}
      {highlightPath.length > 1 && highlightPath.map((nodeId, i) => {
        if (i >= highlightPath.length - 1) return null;
        const from = nodeMap.get(highlightPath[i]);
        const to = nodeMap.get(highlightPath[i + 1]);
        if (!from || !to) return null;
        return (
          <motion.line
            key={`attack-${i}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#EF4444"
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={progressiveReveal ? { pathLength: 0, opacity: 0 } : { opacity: 1 }}
            animate={progressiveReveal ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.3, ease: EASE }}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node, i) => {
        if (!isNodeVisible(i)) return null;
        const isCompromised = compromisedNodes.includes(node.id);
        const isBlastOrigin = blastOrigin === node.id;
        const isBlastReachable = blastReachable.includes(node.id);
        const isHighlighted = highlightPath.includes(node.id);
        const isHovered = hoveredNode === node.id;
        const isDimmed = hoveredNode && !connectedToHovered.has(node.id);
        const isScanning = scanningNode === node.id;
        const isScanned = scannedNodes.includes(node.id);
        const color = getNodeColor(node.id);
        const radius = node.isCrownJewel ? 7 : 5;

        return (
          <motion.g
            key={node.id}
            initial={progressiveReveal ? { opacity: 0, scale: 0 } : false}
            whileInView={progressiveReveal ? { opacity: 1, scale: 1 } : undefined}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: EASE }}
            onMouseEnter={() => onNodeHover?.(node.id)}
            onClick={() => onNodeClick?.(node.id)}
            style={{ cursor: onNodeClick ? "pointer" : "default" }}
          >
            {/* Glow for special nodes */}
            {(isCompromised || isBlastOrigin || isHighlighted || isHovered || isScanning) && (
              <circle
                cx={node.x}
                cy={node.y}
                r={radius + 8}
                fill={isScanning ? "#FF6B3D" : color}
                opacity={isScanning ? 0.25 : 0.15}
                filter="url(#topo-glow)"
              />
            )}

            {/* Scanning radar sweep */}
            {isScanning && (
              <>
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={radius + 4}
                  fill="none"
                  stroke="#FF6B3D"
                  strokeWidth={1.5}
                  animate={{ r: [radius + 4, radius + 22, radius + 4], opacity: [0.9, 0, 0.9] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={radius + 8}
                  fill="none"
                  stroke="#FF6B3D"
                  strokeWidth={1}
                  animate={{ r: [radius + 8, radius + 28, radius + 8], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                />
              </>
            )}

            {/* Pulse ring for compromised */}
            {isCompromised && (
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={radius + 4}
                fill="none"
                stroke="#EF4444"
                strokeWidth={1}
                animate={{ r: [radius + 4, radius + 14, radius + 4], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* Scanned check ring */}
            {isScanned && !isScanning && (
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={radius + 3}
                fill="none"
                stroke="#10B981"
                strokeWidth={1}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ duration: 0.3, ease: EASE }}
              />
            )}

            {/* Blast radius ring */}
            {isBlastOrigin && (
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={radius + 4}
                fill="none"
                stroke="#F25C1F"
                strokeWidth={1.5}
                animate={{ r: [radius + 4, radius + 20, radius + 4], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
              />
            )}

            {/* Main node */}
            <circle
              cx={node.x}
              cy={node.y}
              r={radius}
              fill={isScanning ? "#FF6B3D" : isScanned && !isCompromised ? "#10B981" : color}
              opacity={isDimmed ? 0.2 : 1}
              style={{ transition: "opacity 0.3s, fill 0.3s" }}
            />

            {/* Inner ring for crown jewels */}
            {node.isCrownJewel && (
              <circle
                cx={node.x}
                cy={node.y}
                r={radius + 2}
                fill="none"
                stroke={isScanning ? "#FF6B3D" : isScanned && !isCompromised ? "#10B981" : color}
                strokeWidth={0.8}
                opacity={isDimmed ? 0.1 : 0.5}
              />
            )}

            {/* Labels */}
            {showLabels && (
              <text
                x={node.x}
                y={node.y + radius + 14}
                textAnchor="middle"
                fill={isDimmed ? "#3F3F46" : isScanning ? "#FF6B3D" : isScanned && !isCompromised ? "#10B981" : "#71717A"}
                fontSize={9}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={isScanning || isScanned ? 700 : 500}
              >
                {node.id}
              </text>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
};
