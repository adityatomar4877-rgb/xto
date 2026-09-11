import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  Flame,
  Sliders,
  Activity,
  Play,
  Eye,
  Shield,
} from "lucide-react";
import gsap from "gsap";
import { Tactical3DScene } from "@/components/Tactical3DScene";
import { CyberGlobe3D } from "@/components/CyberGlobe3D";
import { SimulationGauge } from "@/components/SimulationGauge";
import { BlastRadiusGraph } from "@/components/BlastRadiusGraph";
import { ControlSimulator } from "@/components/ControlSimulator";
import { useTheme } from "@/context/ThemeContext";

export const CommandCenterPage: React.FC = () => {
  const { theme } = useTheme();
  const pageRef = useRef<HTMLDivElement>(null);
  const [selectedAsset, setSelectedAsset] = useState("db-01");
  const [selectedControl, setSelectedControl] = useState("Network Segmentation");
  const [riskReduction, setRiskReduction] = useState(75);

  // Dynamic blast stats based on asset
  const blastStats: Record<string, { reachable: number; critical: number; external: number }> = {
    "db-01": { reachable: 18, critical: 3, external: 5 },
    "ws-eng-04": { reachable: 8, critical: 1, external: 2 },
    "dc-corp-01": { reachable: 24, critical: 4, external: 7 },
  };

  const currentBlast = blastStats[selectedAsset] || blastStats["db-01"];

  // GSAP Entrance animation
  useEffect(() => {
    if (pageRef.current) {
      const cards = pageRef.current.querySelectorAll(".soc-card-anim");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.out",
          clearProps: "all",
        }
      );
    }
  }, []);

  return (
    <div ref={pageRef} className="space-y-4 font-sans text-[var(--text-primary)]">
      {/* 1. HERO / OVERVIEW SECTION */}
      <div className="relative overflow-hidden py-1 px-1">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          {/* Left Title, Subtitle, and Action Buttons */}
          <div className="space-y-2.5 flex-1 max-w-lg">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#FF5722] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] animate-pulse" />
              LIVE ENVIRONMENT • DIGITAL TWIN ACTIVE
            </div>

            <h1 className="text-3xl lg:text-[38px] font-black tracking-wide font-display leading-[1.1] uppercase">
              SEE TOMORROW'S
              <br />
              <span className="text-[#FF3D00]">ATTACKS TODAY.</span>
            </h1>

            <p className="text-xs text-[var(--text-secondary)] font-medium tracking-wide">
              Model. Simulate. Analyze. Prevent.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <Link
                to="/simulation"
                className="px-3.5 py-1.5 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run Simulation</span>
              </Link>
              <Link
                to="/twin"
                className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-main)] text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Eye className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Explore Digital Twin</span>
              </Link>
            </div>
          </div>

          {/* Center: Live 3D Cyber Globe (replaces static png) */}
          <div className="flex items-center justify-center">
            <CyberGlobe3D className="h-[145px] w-[270px]" />
          </div>

          {/* Right Quote Callout */}
          <div className="hidden xl:block max-w-[260px] pl-6 border-l border-[var(--border-main)] text-left space-y-2">
            <div className="text-xs text-[var(--text-primary)] font-serif italic leading-snug">
              “A digital twin
              <br />
              for a safer tomorrow.”
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] leading-relaxed font-sans">
              Model your world.
              <br />
              Stop attacks before they happen.
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN DIGITAL TWIN & RIGHT-SIDE SECURITY PANEL */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left 8 Cols: Main Digital Twin (Centerpiece) */}
        <div className="soc-card-anim col-span-12 lg:col-span-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] p-3.5 flex flex-col shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#211410] border border-[#FF5722]/40 flex items-center justify-center text-[#FF5722]">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[var(--text-primary)] tracking-wide font-display">
                  Environment Digital Twin
                </h2>
                <p className="text-[10px] text-[var(--text-secondary)]">
                  Live model of your infrastructure, identities and trust relationships.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Topology Viewport (Real Three.js WebGL & 2D Graph Flow Modes) */}
          <div className="flex-1 min-h-[390px]">
            <Tactical3DScene height="h-[390px]" />
          </div>
        </div>

        {/* Right 4 Cols: Active Simulation & Top Threat Vectors */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Active Simulation Card */}
          <div className="soc-card-anim rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] p-3.5 shadow-xl space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#211410] border border-[#FF5722]/40 flex items-center justify-center text-[#FF5722]">
                  <Activity className="w-3 h-3" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wide">
                    Active Simulation
                  </h3>
                  <p className="text-[9.5px] text-[var(--text-secondary)]">Adversary agent in action...</p>
                </div>
              </div>

              <Link
                to="/simulation"
                className="px-2.5 py-0.5 rounded-md bg-[#211410] border border-[#FF5722]/50 text-[#FF5722] hover:bg-orange-950/40 text-[10px] font-semibold flex items-center gap-1 transition-all"
              >
                <span>Running</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Gauge & Stepper Grid (replaces static png) */}
            <div className="grid grid-cols-12 gap-2 pt-1 items-center">
              {/* Left: Dynamic SVG Radial Gauge */}
              <div className="col-span-5 flex flex-col items-center justify-center">
                <SimulationGauge progress={72} phase="Privilege Escalation" size={105} />
              </div>

              {/* Right: Kill Chain Stepper Checklist */}
              <div className="col-span-7 space-y-1.5 pl-2 border-l border-[var(--border-main)]">
                <div className="text-[9px] text-[var(--text-muted)] uppercase font-mono tracking-wider">
                  Current Phase
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                    <span>Reconnaissance</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                    <span>Initial Access</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                    <span>Credential Access</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#FF5722] font-semibold">
                    <div className="w-3 h-3 rounded-full border border-[#FF5722] flex items-center justify-center flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] animate-pulse" />
                    </div>
                    <span>Privilege Escalation</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <div className="w-3 h-3 rounded-full border border-slate-600/40 flex-shrink-0" />
                    <span>Lateral Movement</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <div className="w-3 h-3 rounded-full border border-slate-600/40 flex-shrink-0" />
                    <span>Objective Reached</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Threat Vectors Card */}
          <div className="soc-card-anim rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] p-3.5 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wide font-display">
                Top Threat Vectors
              </h3>
              <Link
                to="/threat-vectors"
                className="text-[10px] text-[#FF5722] hover:underline flex items-center gap-0.5 font-medium"
              >
                <span>View All</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>

            <div className="space-y-1.5">
              {[
                { code: "T1003", name: "Credential Dumping", level: "High", color: "bg-red-950/80 text-red-400 border-red-500/40" },
                { code: "T1021", name: "Remote Services", level: "High", color: "bg-red-950/80 text-red-400 border-red-500/40" },
                { code: "T1068", name: "Privilege Escalation", level: "Medium", color: "bg-amber-950/80 text-amber-400 border-amber-500/40" },
                { code: "T1190", name: "Exploit Public-Facing App", level: "Medium", color: "bg-amber-950/80 text-amber-400 border-amber-500/40" },
                { code: "T1041", name: "Exfiltration Over C2", level: "Low", color: "bg-emerald-950/80 text-emerald-400 border-emerald-500/40" },
              ].map((t) => (
                <div
                  key={t.code}
                  className="flex items-center justify-between py-1 px-2 rounded-md bg-[var(--bg-input)] border border-[var(--border-main)] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#FF5722] font-semibold">
                      | {t.code}
                    </span>
                    <span className="text-[var(--text-secondary)] text-[10.5px] truncate max-w-[140px]">
                      {t.name}
                    </span>
                  </div>
                  <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded border ${t.color}`}>
                    {t.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. LOWER ANALYTICS: BLAST RADIUS, CONTROL EFFECTIVENESS, REMEDIATION PRIORITIZATION */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Module 1: Blast Radius (4 cols) */}
        <div className="soc-card-anim md:col-span-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] p-3.5 shadow-xl space-y-2 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#211410] border border-[#FF5722]/40 flex items-center justify-center text-[#FF5722]">
                  <Flame className="w-3 h-3" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wide">Blast Radius</h3>
                  <p className="text-[9px] text-[var(--text-secondary)]">If this asset falls, what's next?</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="bg-[var(--bg-input)] border border-[var(--border-main)] text-[var(--text-primary)] rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-[#FF5722] font-mono"
                >
                  <option value="db-01">db-01</option>
                  <option value="ws-eng-04">ws-eng-04</option>
                  <option value="dc-corp-01">dc-corp-01</option>
                </select>
                <Link to="/blast-radius" className="p-1 rounded bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-main)] text-[var(--text-secondary)]">
                  <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>

            {/* Spider Graph & Metrics Split (replaces static png) */}
            <div className="grid grid-cols-12 gap-2 items-center pt-1">
              <div className="col-span-7 h-36 flex items-center justify-center overflow-hidden">
                <BlastRadiusGraph assetId={selectedAsset} />
              </div>

              <div className="col-span-5 space-y-2.5 font-mono pl-1">
                <div>
                  <div className="text-xl font-black text-[var(--text-primary)] leading-none font-display">
                    {currentBlast.reachable}
                  </div>
                  <div className="text-[8.5px] text-[var(--text-muted)] mt-0.5">Assets Reachable</div>
                </div>
                <div>
                  <div className="text-xl font-black text-[#FF3D00] leading-none font-display">
                    {currentBlast.critical}
                  </div>
                  <div className="text-[8.5px] text-[var(--text-muted)] mt-0.5">Critical Systems</div>
                </div>
                <div>
                  <div className="text-xl font-black text-[#FF9800] leading-none font-display">
                    {currentBlast.external}
                  </div>
                  <div className="text-[8.5px] text-[var(--text-muted)] mt-0.5">External Conns</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Control Effectiveness (4 cols) */}
        <div className="soc-card-anim md:col-span-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] p-3.5 shadow-xl space-y-2 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#211410] border border-[#FF5722]/40 flex items-center justify-center text-[#FF5722]">
                  <Sliders className="w-3 h-3" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wide">
                    Control Effectiveness
                  </h3>
                  <p className="text-[9px] text-[var(--text-secondary)]">Test how a control reduces risk.</p>
                </div>
              </div>

              <div className="relative">
                <select
                  value={selectedControl}
                  onChange={(e) => setSelectedControl(e.target.value)}
                  className="bg-[var(--bg-input)] border border-[var(--border-main)] text-[var(--text-primary)] rounded px-1.5 py-0.5 text-[9.5px] focus:outline-none focus:border-[#FF5722] truncate max-w-[125px]"
                >
                  <option value="Network Segmentation">Network Segmentation</option>
                  <option value="Enforce MFA">Enforce MFA (Admin)</option>
                </select>
              </div>
            </div>

            {/* Split Before / After + Dynamic Risk Reduction (replaces static png) */}
            <div className="grid grid-cols-12 gap-1 items-center h-36 pt-1">
              <div className="col-span-8 h-full flex items-center justify-center overflow-hidden">
                <ControlSimulator
                  controlType={selectedControl}
                  onReductionChange={(val) => setRiskReduction(val)}
                />
              </div>

              <div className="col-span-4 flex flex-col items-center justify-center space-y-1 text-center pl-1">
                <div className="text-2xl font-black text-emerald-400 font-display leading-none">
                  {riskReduction}%
                </div>
                <div className="text-[8px] text-[var(--text-muted)] uppercase font-mono">Risk Reduction</div>
                <Link
                  to="/defense"
                  className="mt-1 px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/40 text-[9px] font-medium flex items-center gap-0.5 transition-all"
                >
                  <span>Sandbox</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Module 3: Remediation Prioritization (4 cols) */}
        <div className="soc-card-anim md:col-span-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] p-3.5 shadow-xl space-y-2.5 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#211410] border border-[#FF5722]/40 flex items-center justify-center text-[#FF5722]">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wide">
                    Remediation Prioritization
                  </h3>
                  <p className="text-[9px] text-[var(--text-secondary)]">Ranked by critical paths eliminated.</p>
                </div>
              </div>
            </div>

            {/* Ranked List */}
            <div className="space-y-1 pt-0.5 text-xs">
              {[
                { rank: 1, name: "Segment DB Network", paths: "11 paths" },
                { rank: 2, name: "Enforce MFA (Admin)", paths: "7 paths" },
                { rank: 3, name: "Restrict App Server Egress", paths: "5 paths" },
                { rank: 4, name: "Patch Public-Facing Service", paths: "3 paths" },
                { rank: 5, name: "Update Firewall Rules", paths: "2 paths" },
              ].map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 text-center font-mono text-[var(--text-muted)] font-bold text-[10px]">
                      {item.rank}
                    </span>
                    <span className="text-[var(--text-primary)] text-[10.5px] font-medium truncate max-w-[150px]">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-500 font-semibold flex items-center gap-0.5">
                    <span>↓</span>
                    <span>{item.paths}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Solid Coral/Orange Button */}
          <Link
            to="/remediation"
            className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-[#FF5722] to-[#FF3D00] hover:from-[#F4511E] hover:to-[#E64A19] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,87,34,0.35)]"
          >
            <span>Generate Remediation Plan</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
