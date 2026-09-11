import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Flame,
  ShieldAlert,
  Sliders,
  Activity,
  Atom,
  Radio,
  ExternalLink,
} from "lucide-react";
import { Tactical3DScene } from "@/components/Tactical3DScene";
import { HeroGlobe } from "@/components/HeroGlobe";

export const CommandCenterPage: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState("db-01");
  const [selectedControl, setSelectedControl] = useState("Network Segmentation");

  return (
    <div className="space-y-4 font-sans text-slate-200">
      {/* 1. HERO SECTION matching photo */}
      <div className="relative overflow-hidden py-3 px-2">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          {/* Left Title & Tagline */}
          <div className="space-y-2 flex-1 max-w-xl">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#FF5722] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] animate-pulse" />
              LIVE ENVIRONMENT • DIGITAL TWIN ACTIVE
            </div>

            <h1 className="text-3xl lg:text-[40px] font-black tracking-wide text-white font-display leading-[1.1] uppercase">
              SEE TOMORROW'S
              <br />
              <span className="text-[#FF3D00]">ATTACKS TODAY.</span>
            </h1>

            <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
              Model. Simulate. Analyze. Prevent.
            </p>
          </div>

          {/* Center: Glowing Particle Globe + Vertical Stats Ribbon */}
          <div className="relative flex items-center justify-center min-w-[340px] h-[130px]">
            {/* Globe Canvas */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none -top-12">
              <HeroGlobe />
            </div>

            {/* Floating Stats Next to Globe matching photo */}
            <div className="relative z-10 space-y-2.5 font-mono">
              {/* Stat 1: 236 Assets Monitored */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-[#241613] border border-[#FF5722]/50 flex items-center justify-center text-[#FF5722]">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-none font-display">236</div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                    ASSETS MONITORED
                  </div>
                </div>
              </div>

              {/* Stat 2: 4 Active Threats */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-[#241613] border border-[#FF5722]/50 flex items-center justify-center text-[#FF5722]">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-none font-display">4</div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                    ACTIVE THREATS
                  </div>
                </div>
              </div>

              {/* Stat 3: 1 Simulation Running */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-[#241613] border border-[#FF5722]/50 flex items-center justify-center text-[#FF5722]">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-none font-display">1</div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                    SIMULATION RUNNING
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Quote Callout matching photo */}
          <div className="hidden xl:block max-w-[260px] pl-6 border-l border-[#191F2D]/80 text-left space-y-2.5">
            <div className="text-xs text-slate-200 font-serif italic leading-snug">
              “A digital twin
              <br />
              for a safer tomorrow.”
            </div>
            <div className="text-[10px] text-slate-400 leading-relaxed font-sans">
              Model your world.
              <br />
              Stop attacks before they happen.
            </div>
          </div>
        </div>
      </div>

      {/* 2. CENTRAL SECTION: 3D DIGITAL TWIN + SIMULATION & THREATS */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left 8 Cols: Environment Digital Twin */}
        <div className="col-span-12 lg:col-span-8 rounded-xl bg-[#0D1017] border border-[#1A202C] p-3.5 flex flex-col shadow-xl">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#241613] border border-[#FF5722]/40 flex items-center justify-center text-[#FF5722]">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white tracking-wide font-display">
                  Environment Digital Twin
                </h2>
                <p className="text-[10px] text-slate-400">
                  Live model of your infrastructure, identities and trust relationships.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive 3D Canvas */}
          <div className="flex-1 min-h-[380px]">
            <Tactical3DScene height="h-[380px]" />
          </div>
        </div>

        {/* Right 4 Cols: Active Simulation & Top Threat Vectors */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Active Simulation Card matching photo */}
          <div className="rounded-xl bg-[#0D1017] border border-[#1A202C] p-3.5 shadow-xl space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#241613] border border-[#FF5722]/40 flex items-center justify-center text-[#FF5722]">
                  <Activity className="w-3 h-3" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-wide">
                    Active Simulation
                  </h3>
                  <p className="text-[9.5px] text-slate-400">Adversary agent in action...</p>
                </div>
              </div>

              <Link
                to="/simulation"
                className="px-2.5 py-0.5 rounded-md bg-[#241613] border border-[#FF5722]/50 text-[#FF5722] hover:bg-orange-950/40 text-[10px] font-semibold flex items-center gap-1 transition-all"
              >
                <span>Running</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Gauge & Checklist Grid */}
            <div className="grid grid-cols-12 gap-2 pt-1 items-center">
              {/* Left Column: Circular Progress Gauge */}
              <div className="col-span-5 flex flex-col items-center justify-center text-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#FF5722]"
                      strokeDasharray="72, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-base font-extrabold text-white font-display">
                    72%
                  </div>
                </div>

                <div className="mt-1">
                  <div className="text-[9px] text-slate-400">Simulation Progress</div>
                  <div className="text-sm font-bold text-white font-mono leading-tight mt-0.5">
                    00:02:14
                  </div>
                  <div className="text-[8px] text-slate-500 font-mono">Estimated time: 1 min</div>
                </div>
              </div>

              {/* Right Column: Kill Chain Stepper */}
              <div className="col-span-7 space-y-1.5 pl-2 border-l border-slate-800/80">
                <div className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">
                  Current Phase
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span>Reconnaissance</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span>Initial Access</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span>Credential Access</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#FF5722] font-semibold">
                    <div className="w-3 h-3 rounded-full border border-[#FF5722] flex items-center justify-center flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] animate-pulse" />
                    </div>
                    <span>Privilege Escalation</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <div className="w-3 h-3 rounded-full border border-slate-700 flex-shrink-0" />
                    <span>Lateral Movement</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <div className="w-3 h-3 rounded-full border border-slate-700 flex-shrink-0" />
                    <span>Objective Reached</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Threat Vectors Card matching photo */}
          <div className="rounded-xl bg-[#0D1017] border border-[#1A202C] p-3.5 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white tracking-wide font-display">
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
                  className="flex items-center justify-between py-1 px-2 rounded-md bg-[#080B10]/80 border border-slate-800/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#FF5722] font-semibold">
                      | {t.code}
                    </span>
                    <span className="text-slate-200 text-[10.5px] truncate max-w-[140px]">
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

      {/* 3. BOTTOM ROW: BLAST RADIUS, CONTROL EFFECTIVENESS, REMEDIATION PRIORITIZATION */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Card 1: Blast Radius (4 cols) matching photo */}
        <div className="md:col-span-4 rounded-xl bg-[#0D1017] border border-[#1A202C] p-3.5 shadow-xl space-y-2.5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#241613] border border-[#FF5722]/40 flex items-center justify-center text-[#FF5722]">
                <Flame className="w-3 h-3" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">Blast Radius</h3>
                <p className="text-[9px] text-slate-400">If this asset falls, what's next?</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="bg-[#080B10] border border-slate-700 text-slate-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-[#FF5722] font-mono"
              >
                <option value="db-01">db-01</option>
                <option value="ws-eng-04">ws-eng-04</option>
                <option value="dc-corp-01">dc-corp-01</option>
              </select>
              <Link to="/blast-radius" className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>

          {/* Spider Graph & Metrics Split matching photo */}
          <div className="grid grid-cols-12 gap-2 items-center pt-1">
            {/* Spider Canvas on Left */}
            <div className="col-span-7 h-36 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 180 140">
                {/* Radiation Spoke Lines */}
                {[
                  { x: 30, y: 35 },
                  { x: 150, y: 35 },
                  { x: 25, y: 95 },
                  { x: 155, y: 95 },
                  { x: 90, y: 15 },
                  { x: 90, y: 125 },
                  { x: 50, y: 120 },
                  { x: 130, y: 120 },
                ].map((pt, i) => (
                  <line
                    key={i}
                    x1="90"
                    y1="70"
                    x2={pt.x}
                    y2={pt.y}
                    stroke={i < 3 ? "#FF1744" : "rgba(255, 87, 34, 0.4)"}
                    strokeWidth="1.2"
                  />
                ))}

                {/* Outer Nodes */}
                {[
                  { x: 30, y: 35, color: "#FF5722" },
                  { x: 150, y: 35, color: "#FF1744" },
                  { x: 25, y: 95, color: "#FF5722" },
                  { x: 155, y: 95, color: "#FFA000" },
                  { x: 90, y: 15, color: "#FF1744" },
                  { x: 90, y: 125, color: "#FF5722" },
                  { x: 50, y: 120, color: "#FFA000" },
                  { x: 130, y: 120, color: "#FF1744" },
                ].map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill={pt.color}
                    stroke="#0A0D14"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Central Red Target Node db-01 */}
                <circle cx="90" cy="70" r="15" fill="rgba(255, 23, 68, 0.25)" stroke="#FF1744" strokeWidth="1.5" />
                <circle cx="90" cy="70" r="10" fill="#B71C1C" />
                <text
                  x="90"
                  y="73"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="6.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  db-01
                </text>
              </svg>
            </div>

            {/* Vertical Stacked Metrics on Right matching photo */}
            <div className="col-span-5 space-y-2.5 font-mono">
              <div>
                <div className="text-xl font-black text-white leading-none font-display">18</div>
                <div className="text-[8.5px] text-slate-400 mt-0.5">Assets Reachable</div>
              </div>
              <div>
                <div className="text-xl font-black text-[#FF3D00] leading-none font-display">3</div>
                <div className="text-[8.5px] text-slate-400 mt-0.5">Critical Systems</div>
              </div>
              <div>
                <div className="text-xl font-black text-[#FF9800] leading-none font-display">5</div>
                <div className="text-[8.5px] text-slate-400 mt-0.5">External Connections</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Control Effectiveness (4 cols) matching photo */}
        <div className="md:col-span-4 rounded-xl bg-[#0D1017] border border-[#1A202C] p-3.5 shadow-xl space-y-2.5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#241613] border border-[#FF5722]/40 flex items-center justify-center text-[#FF5722]">
                <Sliders className="w-3 h-3" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Control Effectiveness
                </h3>
                <p className="text-[9px] text-slate-400">Test how a control reduces risk.</p>
              </div>
            </div>

            <div className="relative">
              <select
                value={selectedControl}
                onChange={(e) => setSelectedControl(e.target.value)}
                className="bg-[#080B10] border border-slate-700 text-slate-200 rounded px-1.5 py-0.5 text-[9.5px] focus:outline-none focus:border-[#FF5722] truncate max-w-[125px]"
              >
                <option value="Network Segmentation">Network Segmentation</option>
                <option value="Enforce MFA">Enforce MFA (Admin)</option>
              </select>
            </div>
          </div>

          {/* 3-Column Split: Before | After | 75% Risk Reduction matching photo */}
          <div className="h-36 pt-1 flex items-center justify-between gap-2 text-center">
            {/* Before (Red) */}
            <div className="flex-1 flex flex-col items-center justify-between h-full py-1">
              <span className="text-[9px] text-slate-400 uppercase font-medium">Before</span>
              <div className="relative w-14 h-14">
                <svg className="w-full h-full" viewBox="0 0 50 50">
                  <line x1="10" y1="10" x2="35" y2="25" stroke="#EF4444" strokeWidth="1.5" />
                  <line x1="10" y1="40" x2="35" y2="25" stroke="#EF4444" strokeWidth="1.5" />
                  <line x1="35" y1="25" x2="40" y2="42" stroke="#EF4444" strokeWidth="1.5" />
                  <circle cx="10" cy="10" r="3.5" fill="#EF4444" />
                  <circle cx="10" cy="40" r="3.5" fill="#EF4444" />
                  <circle cx="35" cy="25" r="4.5" fill="#DC2626" stroke="#FCA5A5" strokeWidth="1" />
                  <circle cx="40" cy="42" r="3.5" fill="#EF4444" />
                </svg>
              </div>
              <span className="text-[9px] font-mono text-[#FF3D00] font-bold">12 critical paths</span>
            </div>

            <div className="h-24 w-[1px] bg-slate-800/80" />

            {/* After (Green/Teal) */}
            <div className="flex-1 flex flex-col items-center justify-between h-full py-1">
              <span className="text-[9px] text-slate-400 uppercase font-medium">After</span>
              <div className="relative w-14 h-14">
                <svg className="w-full h-full" viewBox="0 0 50 50">
                  <line x1="10" y1="10" x2="35" y2="25" stroke="#10B981" strokeWidth="1.5" />
                  <circle cx="10" cy="10" r="3.5" fill="#10B981" />
                  <circle cx="10" cy="40" r="3.5" fill="#10B981" opacity="0.3" />
                  <circle cx="35" cy="25" r="4" fill="#059669" />
                </svg>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">3 critical paths</span>
            </div>

            <div className="h-24 w-[1px] bg-slate-800/80" />

            {/* Metric & Button */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-1">
              <div className="text-2xl font-black text-emerald-400 font-display leading-none">
                75%
              </div>
              <div className="text-[8px] text-slate-400 uppercase font-mono">Risk Reduction</div>
              <Link
                to="/defense"
                className="mt-1 px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/40 text-[9px] font-medium flex items-center gap-0.5 transition-all"
              >
                <span>View Comparison</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Remediation Prioritization (4 cols) matching photo */}
        <div className="md:col-span-4 rounded-xl bg-[#0D1017] border border-[#1A202C] p-3.5 shadow-xl space-y-2.5 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#241613] border border-[#FF5722]/40 flex items-center justify-center text-[#FF5722]">
                  <Layers className="w-3 h-3" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-wide">
                    Remediation Prioritization
                  </h3>
                  <p className="text-[9px] text-slate-400">Ranked by critical paths eliminated.</p>
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
                  className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-900/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 text-center font-mono text-slate-500 font-bold text-[10px]">
                      {item.rank}
                    </span>
                    <span className="text-slate-200 text-[10.5px] font-medium truncate max-w-[150px]">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 font-semibold flex items-center gap-0.5">
                    <span>↓</span>
                    <span>{item.paths}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Solid Vibrant Coral/Orange Button matching photo */}
          <Link
            to="/remediation"
            className="w-full mt-2 py-1.5 px-3 rounded-lg bg-gradient-to-r from-[#FF5722] to-[#FF3D00] hover:from-[#F4511E] hover:to-[#E64A19] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,87,34,0.35)]"
          >
            <span>Generate Remediation Plan</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
