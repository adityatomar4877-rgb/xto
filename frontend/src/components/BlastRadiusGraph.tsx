import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useTheme } from "@/context/ThemeContext";

interface BlastRadiusGraphProps {
  assetId: string;
}

interface NodePoint {
  id: string;
  label: string;
  tier: 1 | 2 | 3;
  angle: number;
  ip: string;
  critical: boolean;
}

export const BlastRadiusGraph: React.FC<BlastRadiusGraphProps> = ({ assetId }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [hoveredNode, setHoveredNode] = useState<NodePoint | null>(null);
  const containerRef = useRef<SVGSVGElement>(null);

  // Generate dynamic nodes based on the selected asset
  const getNodes = (id: string): NodePoint[] => {
    if (id === "ws-eng-04") {
      return [
        { id: "vpn-gw", label: "VPN Gateway", tier: 1, angle: 45, ip: "10.0.1.1", critical: false },
        { id: "nas-share", label: "NAS Shared Drive", tier: 1, angle: 160, ip: "10.0.1.40", critical: false },
        { id: "dev-git", label: "Internal GitLab", tier: 2, angle: 280, ip: "10.0.2.15", critical: false },
        { id: "ci-runner", label: "CI/CD Runner", tier: 2, angle: 330, ip: "10.0.2.18", critical: false },
        { id: "ad-read", label: "Read-Only DC", tier: 3, angle: 210, ip: "10.0.9.10", critical: true },
      ];
    } else if (id === "dc-corp-01") {
      return [
        { id: "db-01", label: "db-01 (Prod)", tier: 1, angle: 30, ip: "10.10.30.4", critical: true },
        { id: "vault", label: "Key Vault", tier: 1, angle: 90, ip: "10.10.99.1", critical: true },
        { id: "k8s-master", label: "K8s Control", tier: 1, angle: 150, ip: "10.10.20.1", critical: true },
        { id: "iam-broker", label: "IAM Sync", tier: 2, angle: 210, ip: "10.10.5.2", critical: false },
        { id: "corp-exchange", label: "Mail Exchange", tier: 2, angle: 270, ip: "10.10.1.50", critical: false },
        { id: "erp-core", label: "ERP Finance", tier: 2, angle: 320, ip: "10.10.80.12", critical: true },
        { id: "jump-host", label: "Bastion Jump", tier: 3, angle: 60, ip: "10.10.0.5", critical: false },
        { id: "syslog", label: "SIEM Collector", tier: 3, angle: 180, ip: "10.10.90.8", critical: false },
      ];
    } else {
      // db-01 default
      return [
        { id: "app-srv-01", label: "App Server 1", tier: 1, angle: 35, ip: "10.10.20.15", critical: false },
        { id: "vault-core", label: "Credentials Vault", tier: 1, angle: 110, ip: "10.10.99.1", critical: true },
        { id: "backup-s3", label: "Cold Backup S3", tier: 1, angle: 190, ip: "172.31.8.4", critical: false },
        { id: "fin-ledger", label: "Financial Ledger", tier: 2, angle: 260, ip: "10.10.80.20", critical: true },
        { id: "redis-cache", label: "Session Cache", tier: 2, angle: 315, ip: "10.10.20.18", critical: false },
        { id: "etl-pipeline", label: "ETL Pipeline", tier: 3, angle: 75, ip: "10.10.45.10", critical: false },
        { id: "bi-tableau", label: "Analytics BI", tier: 3, angle: 145, ip: "10.10.60.5", critical: false },
      ];
    }
  };

  const nodes = getNodes(assetId);
  const center = { x: 115, y: 72 };

  // GSAP animation on assetId change
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".satellite-node"),
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, stagger: 0.05, ease: "back.out(1.7)" }
      );
      gsap.fromTo(
        containerRef.current.querySelectorAll(".radar-line"),
        { strokeDashoffset: 100 },
        { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" }
      );
    }
  }, [assetId]);

  const getTierRadius = (tier: number) => {
    switch (tier) {
      case 1:
        return 34;
      case 2:
        return 52;
      case 3:
      default:
        return 65;
    }
  };

  return (
    <div className="relative w-full h-36 flex items-center justify-center select-none">
      <svg
        ref={containerRef}
        viewBox="0 0 230 144"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF3D00" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FF3D00" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Concentric Impact Rings */}
        <circle
          cx={center.x}
          cy={center.y}
          r="34"
          fill="none"
          stroke={isDark ? "rgba(239, 68, 68, 0.25)" : "rgba(239, 68, 68, 0.35)"}
          strokeWidth="1"
          strokeDasharray="2,4"
        />
        <circle
          cx={center.x}
          cy={center.y}
          r="52"
          fill="none"
          stroke={isDark ? "rgba(249, 115, 22, 0.2)" : "rgba(249, 115, 22, 0.3)"}
          strokeWidth="1"
          strokeDasharray="3,5"
        />
        <circle
          cx={center.x}
          cy={center.y}
          r="65"
          fill="none"
          stroke={isDark ? "rgba(56, 189, 248, 0.15)" : "rgba(2, 132, 199, 0.25)"}
          strokeWidth="1"
          strokeDasharray="4,6"
        />

        {/* Radial Connection Lines */}
        {nodes.map((node) => {
          const rad = (node.angle * Math.PI) / 180;
          const r = getTierRadius(node.tier);
          const nx = center.x + r * Math.cos(rad);
          const ny = center.y + r * Math.sin(rad);

          return (
            <line
              key={`line-${node.id}`}
              className="radar-line"
              x1={center.x}
              y1={center.y}
              x2={nx}
              y2={ny}
              stroke={node.critical ? "#EF4444" : node.tier === 1 ? "#F97316" : "#38BDF8"}
              strokeWidth={node.critical ? "1.5" : "1"}
              strokeOpacity={node.critical ? 0.7 : 0.4}
              strokeDasharray="3,3"
            />
          );
        })}

        {/* Center Root Asset Beacon */}
        <circle
          cx={center.x}
          cy={center.y}
          r="22"
          fill="url(#centerGlow)"
        />
        <circle
          cx={center.x}
          cy={center.y}
          r="12"
          fill={isDark ? "#450A0A" : "#FEE2E2"}
          stroke="#EF4444"
          strokeWidth="2"
        />
        <circle
          cx={center.x}
          cy={center.y}
          r="4"
          fill="#EF4444"
          className="animate-ping origin-center"
        />
        <text
          x={center.x}
          y={center.y + 3}
          textAnchor="middle"
          fill={isDark ? "#FFFFFF" : "#7F1D1D"}
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="JetBrains Mono, monospace"
        >
          {assetId}
        </text>

        {/* Satellite Nodes */}
        {nodes.map((node) => {
          const rad = (node.angle * Math.PI) / 180;
          const r = getTierRadius(node.tier);
          const nx = center.x + r * Math.cos(rad);
          const ny = center.y + r * Math.sin(rad);
          const isHovered = hoveredNode?.id === node.id;

          const fillColor = node.critical
            ? "#EF4444"
            : node.tier === 1
            ? "#F97316"
            : "#0284C7";

          return (
            <g
              key={node.id}
              className="satellite-node cursor-pointer transition-transform"
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Pulsing ring for critical nodes */}
              {node.critical && (
                <circle
                  cx={nx}
                  cy={ny}
                  r="9"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />
              )}

              <circle
                cx={nx}
                cy={ny}
                r={isHovered ? 7 : node.critical ? 6 : 5}
                fill={isDark ? "#0A0D14" : "#FFFFFF"}
                stroke={fillColor}
                strokeWidth="2"
              />

              {/* Node small label */}
              <text
                x={nx}
                y={ny + (node.angle > 90 && node.angle < 270 ? 10 : -8)}
                textAnchor="middle"
                fill={isDark ? "#CBD5E1" : "#334155"}
                fontSize="6"
                fontFamily="Inter, sans-serif"
                fontWeight="600"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredNode && (
        <div className="absolute top-1 left-1 bg-[var(--bg-card)] border border-[var(--border-hover)] rounded-md px-2 py-1 text-[9px] font-mono text-[var(--text-primary)] shadow-lg z-20 pointer-events-none">
          <div className="font-bold text-[#FF5722]">{hoveredNode.label}</div>
          <div className="text-[8px] text-[var(--text-secondary)]">IP: {hoveredNode.ip}</div>
          <div className="text-[7.5px] text-red-400">
            {hoveredNode.critical ? "CRITICAL CROWN JEWEL" : `Tier ${hoveredNode.tier} Lateral Reach`}
          </div>
        </div>
      )}
    </div>
  );
};
