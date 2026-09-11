import React, { useState } from "react";
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
  AlertTriangle,
  ChevronDown,
  ShieldAlert,
} from "lucide-react";
import { Tactical3DScene } from "@/components/Tactical3DScene";
import { useStaggerEntrance } from "@/lib/animations";

export const CommandCenterPage: React.FC = () => {
  const [selectedControl, setSelectedControl] = useState("Network Segmentation");
  const containerRef = useStaggerEntrance(".gsap-box", []);

  return (
    <div ref={containerRef} className="space-y-4 font-sans text-slate-900 select-none pb-4">
      {/* 1. HERO SECTION & TOP RIGHT METRICS */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left 9 Cols: Hero Banner */}
        <div className="gsap-box col-span-12 lg:col-span-9 bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all duration-200 hover:shadow-md">
          {/* Left Text Block */}
          <div className="space-y-3 max-w-md z-10">
            <div className="text-[9.5px] font-bold text-slate-500 tracking-[0.2em] uppercase">
              PROACTIVE SECURITY FOR A CONNECTED WORLD
            </div>

            <h1 className="text-3xl lg:text-[34px] font-black text-slate-900 leading-[1.15] tracking-tight font-display">
              Model Today.
              <br />
              Stay Ahead <span className="text-[#FF4500]">Tomorrow.</span>
            </h1>

            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              A real-time digital twin to simulate attacks, validate defenses, and protect what matters.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <Link
                to="/simulation"
                className="px-4 py-2 rounded-lg bg-[#181B20] hover:bg-black text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
              >
                <span>Run Simulation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/twin"
                className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-[#D1D5DB] text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <span>Explore Digital Twin</span>
              </Link>
            </div>
          </div>

          {/* Center: 3D Isometric Layered Stack Graphic */}
          <div className="relative w-44 h-36 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 160 140" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="topPlate" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFA07A" />
                  <stop offset="100%" stopColor="#FF4500" />
                </linearGradient>
                <linearGradient id="midPlate" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>
                <linearGradient id="basePlate" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E2E8F0" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>
              </defs>

              {/* Base Isometric Plate */}
              <polygon points="80,105 130,80 80,55 30,80" fill="url(#basePlate)" opacity="0.6" />
              <polygon points="80,105 130,80 130,86 80,111" fill="#94A3B8" opacity="0.6" />
              <polygon points="30,80 80,105 80,111 30,86" fill="#64748B" opacity="0.6" />

              {/* Mid Layer Dark Server Block */}
              <polygon points="80,82 120,62 80,42 40,62" fill="url(#midPlate)" />
              <polygon points="80,82 120,62 120,70 80,90" fill="#0F172A" />
              <polygon points="40,62 80,82 80,90 40,70" fill="#1E293B" />

              {/* Glowing Top Orange Tile */}
              <polygon points="80,52 110,37 80,22 50,37" fill="url(#topPlate)" />
              <polygon points="80,52 110,37 110,43 80,58" fill="#E64A19" />
              <polygon points="50,37 80,52 80,58 50,43" fill="#D84315" />

              {/* Connecting vertical grid lines */}
              <line x1="80" y1="22" x2="80" y2="111" stroke="#FF5722" strokeWidth="1" strokeDasharray="2,3" opacity="0.4" />
            </svg>
          </div>

          {/* Right Feature List */}
          <div className="hidden xl:flex flex-col justify-center space-y-3 pl-6 border-l border-[#F1F3F5] text-left">
            {[
              "REAL ENVIRONMENTS",
              "REAL ATTACK PATHS",
              "REAL IMPACT",
              "ACTIONABLE INSIGHTS",
            ].map((feature, i) => (
              <div
                key={i}
                className="text-[10px] font-bold text-slate-800 tracking-wider uppercase font-sans"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Right 3 Cols: 3 Stacked Metric Cards */}
        <div className="col-span-12 lg:col-span-3 flex flex-col justify-between gap-3">
          {/* Metric 1: Assets Monitored */}
          <div className="gsap-box flex-1 bg-white rounded-xl border border-[#E5E7EB] p-3.5 shadow-xs flex items-center gap-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="w-10 h-10 rounded-lg bg-[#FFF2EB] border border-[#FF5722]/20 flex items-center justify-center text-[#FF5722] flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none font-display">
                236
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">Assets Monitored</div>
            </div>
          </div>

          {/* Metric 2: Active Threats */}
          <div className="gsap-box flex-1 bg-white rounded-xl border border-[#E5E7EB] p-3.5 shadow-xs flex items-center gap-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] border border-amber-500/20 flex items-center justify-center text-amber-600 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none font-display">
                4
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">Active Threats</div>
            </div>
          </div>

          {/* Metric 3: Simulation Running */}
          <div className="gsap-box flex-1 bg-white rounded-xl border border-[#E5E7EB] p-3.5 shadow-xs flex items-center gap-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="w-10 h-10 rounded-lg bg-[#FFF2EB] border border-[#FF5722]/20 flex items-center justify-center text-[#FF5722] flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none font-display">
                1
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">Simulation Running</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN DIGITAL TWIN & RIGHT-SIDE ACTIVE SIMULATION + THREATS */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left 8 Cols: Environment Digital Twin */}
        <div className="gsap-box col-span-12 lg:col-span-8 flex flex-col">
          <Tactical3DScene
            height="h-[430px]"
            highlightPath={["EXT-INTERNET", "FW-EDGE-01", "VPN-GW-01", "WS-ENG-04", "DC-CORP-01"]}
            compromisedNodes={["FW-EDGE-01", "VPN-GW-01", "WS-ENG-04", "DC-CORP-01"]}
            predictedNextHop={{
              sourceId: "DC-CORP-01",
              targetId: "DB-PROD-01",
              techniqueId: "T1021.002",
              techniqueName: "SMB / Admin Shares",
              confidence: 94,
              phase: "Lateral Movement",
            }}
          />
        </div>

        {/* Right 4 Cols: Active Simulation & Top Threat Vectors */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Active Simulation Card */}
          <div className="gsap-box bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs space-y-3.5 transition-all duration-200 hover:shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#FFF2EB] border border-[#FF5722]/30 flex items-center justify-center text-[#FF5722]">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 tracking-wide">
                    Active Simulation
                  </h3>
                  <p className="text-[9.5px] text-slate-400">Adversary agent in action...</p>
                </div>
              </div>

              <Link
                to="/simulation"
                className="px-2.5 py-1 rounded-md bg-[#FFF2EB] text-[#FF5722] text-[10.5px] font-bold flex items-center gap-1 hover:bg-[#FFE5D6] transition-colors"
              >
                <span>Running</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Gauge & Stepper Grid */}
            <div className="grid grid-cols-12 gap-3 pt-1 items-center">
              {/* Left: 72% Circular Gauge */}
              <div className="col-span-5 flex flex-col items-center justify-center text-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#F1F4F8"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#FF5722"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={(2 * Math.PI * 40) * (1 - 0.72)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-black text-slate-900 font-display">72%</span>
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">
                  Simulation Progress
                </div>
                <div className="text-xs font-extrabold text-slate-900 font-mono mt-0.5">
                  00:02:14
                </div>
                <div className="text-[8px] text-slate-400">Estimated time: 1 min</div>
              </div>

              {/* Right: Current Phase Stepper */}
              <div className="col-span-7 space-y-1.5 pl-2 border-l border-slate-100">
                <div className="text-[9px] text-slate-400 uppercase font-mono font-bold tracking-wider mb-2">
                  CURRENT PHASE
                </div>
                <div className="space-y-1.5 text-[10.5px]">
                  <div className="flex items-center gap-2 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Reconnaissance</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Initial Access</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Credential Access</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#FF5722] font-bold">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#FF5722] flex items-center justify-center flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] animate-pulse" />
                    </div>
                    <span>Privilege Escalation</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0" />
                    <span>Lateral Movement</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0" />
                    <span>Objective Reached</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Threat Vectors Card */}
          <div className="gsap-box bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs space-y-3 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 tracking-wide font-display">
                Top Threat Vectors
              </h3>
              <Link
                to="/threat-vectors"
                className="text-[10.5px] text-[#FF5722] hover:underline flex items-center gap-0.5 font-semibold"
              >
                <span>View All</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {[
                { code: "T1003", name: "Credential Dumping", level: "High", barColor: "bg-red-500", badgeColor: "bg-red-50 text-red-600 border-red-200" },
                { code: "T1021", name: "Remote Services", level: "High", barColor: "bg-red-500", badgeColor: "bg-red-50 text-red-600 border-red-200" },
                { code: "T1068", name: "Privilege Escalation", level: "Medium", barColor: "bg-amber-500", badgeColor: "bg-amber-50 text-amber-600 border-amber-200" },
                { code: "T1190", name: "Exploit Public-Facing App", level: "Medium", barColor: "bg-amber-500", badgeColor: "bg-amber-50 text-amber-600 border-amber-200" },
                { code: "T1041", name: "Exfiltration Over C2", level: "Low", barColor: "bg-emerald-500", badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200" },
              ].map((t) => (
                <div
                  key={t.code}
                  className="flex items-center justify-between py-1 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-0.5 h-3.5 rounded-full ${t.barColor}`} />
                    <span className="text-[10px] font-mono text-slate-900 font-bold">
                      {t.code}
                    </span>
                    <span className="text-slate-600 text-[10.5px] truncate max-w-[140px] font-medium">
                      {t.name}
                    </span>
                  </div>
                  <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded border ${t.badgeColor}`}>
                    {t.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. LOWER SECTION: BLAST RADIUS, CONTROL EFFECTIVENESS, REMEDIATION PRIORITIZATION */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Module 1: Blast Radius */}
        <div className="gsap-box md:col-span-4 bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md">
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-[#FFF2EB] border border-[#FF5722]/30 flex items-center justify-center text-[#FF5722]">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 tracking-wide">Blast Radius</h3>
                <p className="text-[9.5px] text-slate-400">If this asset falls, what's next?</p>
              </div>
            </div>

            {/* Radar Spider Diagram & Split Stats */}
            <div className="grid grid-cols-12 gap-2 items-center py-2">
              {/* Left: Spider Web Radar */}
              <div className="col-span-6 h-32 flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
                  {/* Concentric rings */}
                  <circle cx="60" cy="60" r="22" fill="none" stroke="#FED7AA" strokeWidth="1" strokeDasharray="2,3" />
                  <circle cx="60" cy="60" r="38" fill="none" stroke="#FFEDD5" strokeWidth="1" strokeDasharray="2,3" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#FFF7ED" strokeWidth="1" />

                  {/* Radiating lines & nodes */}
                  {[30, 80, 130, 190, 240, 290, 340].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180;
                    const r = 35 + (i % 3) * 12;
                    const nx = 60 + r * Math.cos(rad);
                    const ny = 60 + r * Math.sin(rad);
                    return (
                      <g key={i}>
                        <line x1="60" y1="60" x2={nx} y2={ny} stroke="#FED7AA" strokeWidth="1" />
                        <circle cx={nx} cy={ny} r="4" fill="#FFFFFF" stroke="#FB923C" strokeWidth="1.5" />
                      </g>
                    );
                  })}

                  {/* Center Root Node */}
                  <circle cx="60" cy="60" r="14" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2" />
                  <text x="60" y="63" textAnchor="middle" fill="#B91C1C" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
                    db-01
                  </text>
                </svg>
              </div>

              {/* Right: Numerical Metrics */}
              <div className="col-span-6 space-y-2 pl-2">
                <div>
                  <div className="text-xl font-black text-slate-900 leading-none font-display">18</div>
                  <div className="text-[9px] text-slate-500 mt-0.5 font-medium">Assets Reachable</div>
                </div>
                <div>
                  <div className="text-xl font-black text-[#FF4500] leading-none font-display">3</div>
                  <div className="text-[9px] text-slate-500 mt-0.5 font-medium">Critical Systems</div>
                </div>
                <div>
                  <div className="text-xl font-black text-[#F97316] leading-none font-display">5</div>
                  <div className="text-[9px] text-slate-500 mt-0.5 font-medium">External Connections</div>
                </div>
              </div>
            </div>
          </div>

          {/* Button: View Full Blast Radius */}
          <Link
            to="/blast-radius"
            className="w-full mt-2 py-2 px-3 rounded-lg border border-[#E5E7EB] hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>View Full Blast Radius</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Module 2: Control Effectiveness */}
        <div className="gsap-box md:col-span-4 bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#FFF2EB] border border-[#FF5722]/30 flex items-center justify-center text-[#FF5722]">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 tracking-wide">
                    Control Effectiveness
                  </h3>
                  <p className="text-[9.5px] text-slate-400">Test how a control reduces risk.</p>
                </div>
              </div>

              {/* Dropdown */}
              <select
                value={selectedControl}
                onChange={(e) => setSelectedControl(e.target.value)}
                className="bg-[#F8F9FA] border border-[#E5E7EB] text-slate-800 rounded px-2 py-1 text-[10px] font-semibold focus:outline-none focus:border-[#FF5722]"
              >
                <option value="Network Segmentation">Network Segmentation</option>
                <option value="Enforce MFA">Enforce MFA (Admin)</option>
              </select>
            </div>

            {/* Split Comparison: Before (Red) vs After (Green) + 75% Risk Reduction */}
            <div className="grid grid-cols-12 gap-2 items-center py-2">
              {/* Before Graphic */}
              <div className="col-span-4 flex flex-col items-center text-center">
                <span className="text-[9.5px] font-bold text-red-500 mb-1">Before</span>
                <svg viewBox="0 0 70 70" className="w-16 h-16">
                  {/* Red dense spider network */}
                  {[
                    [35, 35, 15, 20], [35, 35, 55, 18], [35, 35, 18, 52], [35, 35, 52, 55],
                    [15, 20, 30, 10], [55, 18, 62, 35], [18, 52, 32, 62], [52, 55, 62, 50],
                  ].map(([x1, y1, x2, y2], i) => (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#EF4444" strokeWidth="1.2" opacity="0.6" />
                  ))}
                  {[
                    [35, 35], [15, 20], [55, 18], [18, 52], [52, 55], [30, 10], [62, 35], [32, 62], [62, 50]
                  ].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="3" fill="#EF4444" />
                  ))}
                </svg>
                <span className="text-[9px] font-bold text-red-600 mt-1">12 critical paths</span>
              </div>

              {/* After Graphic */}
              <div className="col-span-4 flex flex-col items-center text-center">
                <span className="text-[9.5px] font-bold text-emerald-600 mb-1">After</span>
                <svg viewBox="0 0 70 70" className="w-16 h-16">
                  {/* Green sparse severed network */}
                  {[
                    [35, 35, 55, 18], [35, 35, 18, 52], [55, 18, 62, 35]
                  ].map(([x1, y1, x2, y2], i) => (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#10B981" strokeWidth="1.2" opacity="0.6" />
                  ))}
                  {[
                    [35, 35], [55, 18], [18, 52], [62, 35]
                  ].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="3" fill="#10B981" />
                  ))}
                </svg>
                <span className="text-[9px] font-bold text-emerald-600 mt-1">3 critical paths</span>
              </div>

              {/* Right: 75% Risk Reduction */}
              <div className="col-span-4 flex flex-col items-center justify-center text-center pl-1">
                <div className="text-2xl font-black text-emerald-500 font-display leading-none">
                  75%
                </div>
                <div className="text-[8.5px] text-slate-500 font-semibold mt-1">
                  Risk Reduction
                </div>
                <Link
                  to="/defense"
                  className="mt-2 text-[9.5px] font-bold text-slate-700 hover:text-slate-900 flex items-center gap-0.5"
                >
                  <span>View Comparison</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Module 3: Remediation Prioritization */}
        <div className="gsap-box md:col-span-4 bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#FFF2EB] border border-[#FF5722]/30 flex items-center justify-center text-[#FF5722]">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 tracking-wide font-display">
                    Remediation Prioritization
                  </h3>
                  <p className="text-[9.5px] text-slate-400">Ranked by critical paths eliminated.</p>
                </div>
              </div>

              <Link
                to="/remediation"
                className="text-[10px] text-[#FF5722] hover:underline font-bold"
              >
                View All &rarr;
              </Link>
            </div>

            {/* Ranked List */}
            <div className="space-y-1.5 pt-1 text-xs">
              {[
                { rank: 1, name: "Segment DB Network", paths: "11 paths" },
                { rank: 2, name: "Enforce MFA (Admin)", paths: "7 paths" },
                { rank: 3, name: "Restrict App Server Egress", paths: "5 paths" },
                { rank: 4, name: "Patch Public-Facing Service", paths: "3 paths" },
                { rank: 5, name: "Update Firewall Rules", paths: "2 paths" },
              ].map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between py-1 px-2 rounded hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 text-center font-bold text-slate-400 text-[10.5px]">
                      {item.rank}
                    </span>
                    <span className="text-slate-700 text-[10.5px] font-semibold truncate max-w-[150px]">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[9.5px] font-mono text-emerald-600 font-bold flex items-center gap-0.5">
                    <span>↓</span>
                    <span>{item.paths}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
