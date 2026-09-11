import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useTheme } from "@/context/ThemeContext";
import { Shield, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";

interface ControlSimulatorProps {
  controlType: string;
  onReductionChange?: (percent: number) => void;
}

export const ControlSimulator: React.FC<ControlSimulatorProps> = ({
  controlType,
  onReductionChange,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const containerRef = useRef<HTMLDivElement>(null);

  const statsByControl: Record<string, { reduction: number; pathsSevered: number; label: string }> = {
    "Network Segmentation": { reduction: 75, pathsSevered: 11, label: "Strict VLAN + Microsegmentation" },
    "Enforce MFA": { reduction: 88, pathsSevered: 15, label: "FIDO2 / Hardware Security Keys" },
  };

  const current = statsByControl[controlType] || statsByControl["Network Segmentation"];

  useEffect(() => {
    if (onReductionChange) {
      onReductionChange(current.reduction);
    }
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".pulse-effect"),
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [controlType, current.reduction, onReductionChange]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-36 grid grid-cols-2 gap-1.5 p-1 select-none font-sans text-xs"
    >
      {/* 1. BEFORE PANEL */}
      <div className="relative rounded-lg bg-[var(--bg-input)] border border-red-500/20 p-2 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            BEFORE
          </span>
          <span className="text-[7.5px] font-mono text-red-400/80 px-1 py-0.2 rounded bg-red-950/40">
            UNMITIGATED
          </span>
        </div>

        {/* Attack diagram: Ingress -> App -> DB */}
        <div className="my-auto py-1 flex items-center justify-between text-center relative">
          {/* Node 1: Ingress */}
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-red-950/70 border border-red-500/40 flex items-center justify-center text-[9px] font-bold text-red-300">
              WAN
            </div>
            <span className="text-[7.5px] text-[var(--text-muted)] mt-0.5">Ingress</span>
          </div>

          {/* Red attacking conduit */}
          <div className="flex-1 px-1 relative">
            <div className="h-0.5 bg-gradient-to-r from-red-500 to-red-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/40 animate-pulse" />
            </div>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[7px] font-mono text-red-400 font-bold">
              T1190
            </span>
          </div>

          {/* Node 2: App */}
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-red-950/70 border border-red-500/60 flex items-center justify-center text-[9px] font-bold text-red-300">
              APP
            </div>
            <span className="text-[7.5px] text-[var(--text-muted)] mt-0.5">Pivot</span>
          </div>

          {/* Red attacking conduit */}
          <div className="flex-1 px-1 relative">
            <div className="h-0.5 bg-gradient-to-r from-red-500 to-red-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/40 animate-pulse" />
            </div>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[7px] font-mono text-red-400 font-bold">
              T1003
            </span>
          </div>

          {/* Node 3: Crown Jewel DB */}
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-red-600 border border-red-400 flex items-center justify-center text-[9px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]">
              DB
            </div>
            <span className="text-[7.5px] text-red-400 font-bold mt-0.5">Breached</span>
          </div>
        </div>

        <div className="text-[8px] font-mono text-red-400 flex items-center justify-between border-t border-red-500/10 pt-1">
          <span>Paths: 12 Active</span>
          <span className="font-bold">CRITICAL RISK</span>
        </div>
      </div>

      {/* 2. AFTER PANEL */}
      <div className="relative rounded-lg bg-[var(--bg-input)] border border-emerald-500/30 p-2 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AFTER CONTROL
          </span>
          <span className="text-[7.5px] font-mono text-emerald-400 px-1 py-0.2 rounded bg-emerald-950/40 border border-emerald-500/30">
            ACTIVE
          </span>
        </div>

        {/* Mitigated diagram: Ingress -> App -||- DB */}
        <div className="my-auto py-1 flex items-center justify-between text-center relative">
          {/* Node 1: Ingress */}
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-[9px] font-bold text-amber-300">
              WAN
            </div>
            <span className="text-[7.5px] text-[var(--text-muted)] mt-0.5">Contained</span>
          </div>

          {/* Blocked Conduit */}
          <div className="flex-1 px-1 relative flex items-center justify-center">
            <div className="h-0.5 w-full bg-slate-700/50" />
            <div className="absolute w-4 h-4 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center text-emerald-400 pulse-effect shadow-md">
              <Shield className="w-2.5 h-2.5" />
            </div>
          </div>

          {/* Node 2: App */}
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-blue-950/60 border border-blue-500/40 flex items-center justify-center text-[9px] font-bold text-blue-300">
              APP
            </div>
            <span className="text-[7.5px] text-[var(--text-muted)] mt-0.5">Isolated</span>
          </div>

          {/* Severed Conduit */}
          <div className="flex-1 px-1 relative flex items-center justify-center">
            <div className="h-0.5 w-full border-t border-dashed border-slate-700" />
            <div className="absolute w-4 h-4 rounded-full bg-red-950/90 border border-red-500/60 flex items-center justify-center text-red-400 pulse-effect">
              <span className="text-[8px] font-bold leading-none">✕</span>
            </div>
          </div>

          {/* Node 3: Protected Crown Jewel DB */}
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center text-[9px] font-bold text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              DB
            </div>
            <span className="text-[7.5px] text-emerald-400 font-bold mt-0.5">Protected</span>
          </div>
        </div>

        <div className="text-[8px] font-mono text-emerald-400 flex items-center justify-between border-t border-emerald-500/10 pt-1">
          <span>↓ {current.pathsSevered} Severed</span>
          <span className="font-bold">+{current.reduction}% DEFENSE</span>
        </div>
      </div>
    </div>
  );
};
