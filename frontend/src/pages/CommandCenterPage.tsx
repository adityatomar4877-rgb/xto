import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Layers,
  Shield,
  Activity,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  CircleDot,
  Radio,
  Sliders,
  ChevronDown,
  ExternalLink,
  Flame,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { api, DigitalTwinTopology, RemediationPriority } from "@/lib/api";
import { Tactical3DScene } from "@/components/Tactical3DScene";

export const CommandCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [twin, setTwin] = useState<DigitalTwinTopology | null>(null);
  const [remediations, setRemediations] = useState<RemediationPriority[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState("db-01");
  const [selectedControl, setSelectedControl] = useState("Network Segmentation");

  useEffect(() => {
    // Attempt to load from API if backend is running, otherwise use rich defaults
    api.getTwin()
      .then((data) => setTwin(data))
      .catch(() => {
        // Fallback default twin
        setTwin({
          snapshot_id: "SNAP-DEMO-01",
          name: "Rakshastra Corporate Digital Twin",
          version: 1,
          timestamp: new Date().toISOString(),
          assets: [],
          identities: [],
          relationships: [],
          controls: [],
          stats: { total_assets: 236, monitored: 236 },
        });
      });

    api.getRemediationPriorities()
      .then((data) => setRemediations(data))
      .catch(() => {
        // Fallback remediation priorities
        setRemediations([
          {
            rank: 1,
            control_name: "Segment DB Network",
            control_type: "NETWORK_SEGMENTATION",
            target_assets_or_identities: ["DB-01", "VAULT-BACKUP-01"],
            critical_paths_eliminated: 11,
            blast_radius_reduction_percent: 75.0,
            attacker_effort_increase: 4.5,
            implementation_complexity: "MEDIUM",
            priority_score: 96.5,
            reasoning: "Isolates database tier from lateral movement",
            affected_techniques_blocked: ["T1021", "T1003"],
          },
          {
            rank: 2,
            control_name: "Enforce MFA (Admin)",
            control_type: "AUTHENTICATION",
            target_assets_or_identities: ["DC-CORP-01"],
            critical_paths_eliminated: 7,
            blast_radius_reduction_percent: 45.0,
            attacker_effort_increase: 3.8,
            implementation_complexity: "LOW",
            priority_score: 88.0,
            reasoning: "Blocks Kerberoasting and credential relay attacks",
            affected_techniques_blocked: ["T1078", "T1003"],
          },
          {
            rank: 3,
            control_name: "Restrict App Server Egress",
            control_type: "FIREWALL",
            target_assets_or_identities: ["APP-PROD-01"],
            critical_paths_eliminated: 5,
            blast_radius_reduction_percent: 32.0,
            attacker_effort_increase: 3.0,
            implementation_complexity: "LOW",
            priority_score: 79.5,
            reasoning: "Prevents C2 beaconing and exfiltration",
            affected_techniques_blocked: ["T1041"],
          },
        ]);
      });
  }, []);

  return (
    <div className="space-y-5 font-sans">
      {/* 1. HERO BANNER SECTION */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0E131F] via-[#121826] to-[#0A0D14] border border-[#1E2638] p-6 overflow-hidden shadow-2xl">
        {/* Glowing Cyber Wireframe Sphere in Hero Background */}
        <div className="absolute right-40 -top-10 w-96 h-96 rounded-full pointer-events-none opacity-20">
          <div className="w-full h-full rounded-full border border-orange-500/40 animate-pulse-slow shadow-[0_0_80px_rgba(255,87,34,0.3)]" />
          <div className="absolute inset-4 rounded-full border border-dashed border-red-500/30" />
          <div className="absolute inset-10 rounded-full border border-cyan-500/20" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Hero Headlines */}
          <div className="space-y-2">
            {/* Live Environment Tag */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-950/40 border border-orange-500/30 text-[10px] font-mono text-orange-400 font-semibold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] animate-pulse" />
              LIVE ENVIRONMENT • DIGITAL TWIN ACTIVE
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-display">
              SEE TOMORROW'S{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-400">
                ATTACKS TODAY.
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Model. Simulate. Analyze. Prevent.
            </p>

            {/* Hero Quick Stats */}
            <div className="flex items-center gap-6 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-orange-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm leading-none font-display">236</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                    Assets Monitored
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm leading-none font-display">4</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                    Active Threats
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-[#FF5722]">
                  <Activity className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm leading-none font-display">1</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                    Simulation Running
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Quote Card on the Right */}
          <div className="p-4 rounded-xl bg-[#080A0F]/70 border border-slate-800/80 backdrop-blur-md max-w-xs space-y-2">
            <div className="text-xs text-slate-300 italic leading-relaxed">
              "A digital twin for a safer tomorrow."
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">
              Model your world.
              <br />
              Stop attacks before they happen.
            </div>
          </div>
        </div>
      </div>

      {/* 2. CENTRAL SECTION: DIGITAL TWIN 3D (LEFT) + ACTIVE SIMULATION & THREATS (RIGHT) */}
      <div className="grid grid-cols-12 gap-5">
        {/* Center-Left: Environment Digital Twin (8 Cols) */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl bg-[#0D111A] border border-[#1E2638] p-4 flex flex-col shadow-xl">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-[#FF5722]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide font-display">
                  Environment Digital Twin
                </h2>
                <p className="text-[11px] text-slate-400">
                  Live model of your infrastructure, identities and trust relationships.
                </p>
              </div>
            </div>
          </div>

          {/* Tactical 3D Scene Viewport */}
          <div className="flex-1 min-h-[380px]">
            <Tactical3DScene height="h-[380px]" />
          </div>
        </div>

        {/* Center-Right: Active Simulation & Top Threat Vectors (4 Cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Active Simulation Card */}
          <div className="rounded-2xl bg-[#0D111A] border border-[#1E2638] p-4 shadow-xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-[#FF5722]">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-wide">
                    Active Simulation
                  </h3>
                  <p className="text-[10px] text-slate-400">Adversary agent in action...</p>
                </div>
              </div>
              <Link
                to="/simulation"
                className="px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-[#FF5722] hover:bg-orange-500/30 text-[10px] font-semibold flex items-center gap-1 transition-all"
              >
                <span>Running</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Circular Gauge Progress */}
            <div className="flex items-center justify-between bg-[#080A0F]/60 rounded-xl p-3 border border-slate-800/80">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Circle (72%) */}
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
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-extrabold text-white font-display">72%</span>
                </div>
              </div>

              <div className="space-y-1 text-right">
                <div className="text-[10px] text-slate-400 font-medium">Simulation Progress</div>
                <div className="text-base font-bold text-white font-mono">00:02:14</div>
                <div className="text-[9px] text-slate-500 font-mono">Estimated time: 1 min</div>
              </div>
            </div>

            {/* Kill Chain Phase Stepper */}
            <div className="space-y-2 pt-1 font-sans text-xs">
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                Current Phase
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Reconnaissance</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Initial Access</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Credential Access</span>
                </div>
                <div className="flex items-center gap-2 text-[#FF5722] font-semibold">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#FF5722] flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] animate-pulse" />
                  </div>
                  <span>Privilege Escalation</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <CircleDot className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                  <span>Lateral Movement</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <CircleDot className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                  <span>Objective Reached</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Threat Vectors Card */}
          <div className="rounded-2xl bg-[#0D111A] border border-[#1E2638] p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white tracking-wide font-display">
                Top Threat Vectors
              </h3>
              <Link
                to="/threat-vectors"
                className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {[
                { code: "T1003", name: "Credential Dumping", severity: "High" },
                { code: "T1021", name: "Remote Services", severity: "High" },
                { code: "T1068", name: "Privilege Escalation", severity: "Medium" },
                { code: "T1190", name: "Exploit Public-Facing App", severity: "Medium" },
                { code: "T1041", name: "Exfiltration Over C2", severity: "Low" },
              ].map((threat) => (
                <div
                  key={threat.code}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#080A0F]/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                      {threat.code}
                    </span>
                    <span className="text-slate-200 text-[11px] font-medium truncate max-w-[150px]">
                      {threat.name}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      threat.severity === "High"
                        ? "bg-red-950/60 text-red-400 border border-red-500/40"
                        : threat.severity === "Medium"
                        ? "bg-amber-950/60 text-amber-400 border border-amber-500/40"
                        : "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                    }`}
                  >
                    {threat.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ROW: BLAST RADIUS, CONTROL EFFECTIVENESS, REMEDIATION PRIORITIZATION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Blast Radius */}
        <div className="rounded-2xl bg-[#0D111A] border border-[#1E2638] p-4 shadow-xl space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-[#FF5722]">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">Blast Radius</h3>
                <p className="text-[10px] text-slate-400">If this asset falls, what's next?</p>
              </div>
            </div>

            {/* Asset Selector */}
            <div className="flex items-center gap-1.5">
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="bg-[#080A0F] border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-orange-500 font-mono"
              >
                <option value="db-01">db-01</option>
                <option value="ws-eng-04">ws-eng-04</option>
                <option value="dc-corp-01">dc-corp-01</option>
                <option value="app-prod-01">app-prod-01</option>
              </select>
              <Link
                to="/blast-radius"
                className="p-1 rounded-md bg-slate-800 text-slate-300 hover:text-white"
              >
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Radial Spider Network Visualization */}
          <div className="relative h-44 bg-[#080A0F]/80 rounded-xl border border-slate-800/80 flex items-center justify-center overflow-hidden">
            {/* Ambient Background Radial Gradient */}
            <div className="absolute w-32 h-32 rounded-full bg-red-600/10 blur-xl pointer-events-none" />

            {/* Radial SVG Spider */}
            <svg className="w-full h-full" viewBox="0 0 200 160">
              {/* Radiating Spoke Lines */}
              {[
                { x: 40, y: 40 },
                { x: 160, y: 40 },
                { x: 30, y: 110 },
                { x: 170, y: 110 },
                { x: 100, y: 20 },
                { x: 100, y: 140 },
                { x: 60, y: 135 },
                { x: 140, y: 135 },
              ].map((pt, idx) => (
                <line
                  key={idx}
                  x1="100"
                  y1="80"
                  x2={pt.x}
                  y2={pt.y}
                  stroke={idx < 3 ? "#FF1744" : "rgba(255, 87, 34, 0.4)"}
                  strokeWidth="1.2"
                  strokeDasharray={idx % 2 === 0 ? "2,2" : undefined}
                />
              ))}

              {/* Surrounding Nodes */}
              {[
                { x: 40, y: 40, color: "#FF5722", label: "WS" },
                { x: 160, y: 40, color: "#FF1744", label: "ADM" },
                { x: 30, y: 110, color: "#FF5722", label: "ENG" },
                { x: 170, y: 110, color: "#FF9800", label: "APP" },
                { x: 100, y: 20, color: "#FF1744", label: "DC" },
                { x: 100, y: 140, color: "#FF5722", label: "S3" },
                { x: 60, y: 135, color: "#FF9800", label: "API" },
                { x: 140, y: 135, color: "#FF1744", label: "VLT" },
              ].map((n, idx) => (
                <circle
                  key={idx}
                  cx={n.x}
                  cy={n.y}
                  r="5"
                  fill={n.color}
                  stroke="#080A0F"
                  strokeWidth="1.5"
                />
              ))}

              {/* Central Glowing Target db-01 */}
              <circle
                cx="100"
                cy="80"
                r="18"
                fill="#FF1744"
                fillOpacity="0.2"
                stroke="#FF1744"
                strokeWidth="1.5"
                className="animate-pulse"
              />
              <circle cx="100" cy="80" r="12" fill="#B71C1C" stroke="#FF5252" strokeWidth="1.5" />
              <text
                x="100"
                y="83"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="7"
                fontWeight="bold"
                fontFamily="monospace"
              >
                db-01
              </text>
            </svg>

            {/* Impact Metric Stats */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-400 bg-[#080A0F]/90 px-2 py-1 rounded border border-slate-800">
              <div>
                <span className="text-white font-bold">18</span> Reachable
              </div>
              <div>
                <span className="text-red-400 font-bold">3</span> Critical
              </div>
              <div>
                <span className="text-orange-400 font-bold">5</span> External
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Control Effectiveness (What-If) */}
        <div className="rounded-2xl bg-[#0D111A] border border-[#1E2638] p-4 shadow-xl space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Control Effectiveness
                </h3>
                <p className="text-[10px] text-slate-400">Test how a control reduces risk.</p>
              </div>
            </div>

            {/* Control Dropdown Selector */}
            <div className="relative">
              <select
                value={selectedControl}
                onChange={(e) => setSelectedControl(e.target.value)}
                className="bg-[#080A0F] border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-[10px] focus:outline-none focus:border-emerald-500 truncate max-w-[130px]"
              >
                <option value="Network Segmentation">Network Segmentation</option>
                <option value="Admin MFA">Enforce MFA (Admin)</option>
                <option value="Egress Restriction">Restrict App Egress</option>
              </select>
            </div>
          </div>

          {/* Split Before & After Visual Display */}
          <div className="h-44 bg-[#080A0F]/80 rounded-xl border border-slate-800/80 p-2.5 flex items-center justify-between gap-3">
            {/* Before (Red Network) */}
            <div className="flex-1 flex flex-col items-center justify-between h-full py-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Before</div>
              {/* Red node graph */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-red-500 absolute top-0 left-2" />
                <div className="w-3 h-3 rounded-full bg-red-500 absolute bottom-1 left-0" />
                <div className="w-3.5 h-3.5 rounded-full bg-red-600 border border-red-400 absolute top-5 right-2 animate-pulse" />
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 absolute bottom-3 right-1" />
                <svg className="w-full h-full">
                  <line x1="16" y1="6" x2="48" y2="26" stroke="#EF4444" strokeWidth="1.2" />
                  <line x1="8" y1="48" x2="48" y2="26" stroke="#EF4444" strokeWidth="1.2" />
                  <line x1="48" y1="26" x2="52" y2="50" stroke="#EF4444" strokeWidth="1.2" />
                </svg>
              </div>
              <div className="text-[10px] font-mono text-red-400 font-bold">12 critical paths</div>
            </div>

            <div className="h-28 w-[1px] bg-slate-800" />

            {/* After (Emerald Green Network) */}
            <div className="flex-1 flex flex-col items-center justify-between h-full py-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">After</div>
              {/* Green node graph */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-emerald-400 absolute top-0 left-2" />
                <div className="w-3 h-3 rounded-full bg-emerald-400 absolute bottom-1 left-0" />
                <div className="w-3 h-3 rounded-full bg-emerald-500 absolute top-5 right-2" />
                <svg className="w-full h-full">
                  <line x1="16" y1="6" x2="48" y2="26" stroke="#10B981" strokeWidth="1.2" />
                </svg>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 font-bold">3 critical paths</div>
            </div>

            <div className="h-28 w-[1px] bg-slate-800" />

            {/* Risk Reduction Metric & Button */}
            <div className="flex flex-col items-center justify-center space-y-1 pr-1">
              <div className="text-2xl font-extrabold text-emerald-400 font-display">75%</div>
              <div className="text-[9px] text-slate-400 uppercase font-mono text-center">
                Risk Reduction
              </div>
              <Link
                to="/defense"
                className="mt-2 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80 text-[10px] font-medium flex items-center gap-1 transition-all"
              >
                <span>View Comparison</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Remediation Prioritization */}
        <div className="rounded-2xl bg-[#0D111A] border border-[#1E2638] p-4 shadow-xl space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-[#FF5722]">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Remediation Prioritization
                </h3>
                <p className="text-[10px] text-slate-400">Ranked by critical paths eliminated.</p>
              </div>
            </div>
          </div>

          {/* Remediation List */}
          <div className="space-y-1.5 pt-0.5">
            {[
              { rank: 1, name: "Segment DB Network", eliminated: "11 paths" },
              { rank: 2, name: "Enforce MFA (Admin)", eliminated: "7 paths" },
              { rank: 3, name: "Restrict App Server Egress", eliminated: "5 paths" },
              { rank: 4, name: "Patch Public-Facing Service", eliminated: "3 paths" },
              { rank: 5, name: "Update Firewall Rules", eliminated: "2 paths" },
            ].map((item) => (
              <div
                key={item.rank}
                className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-[#080A0F]/60 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 text-center font-mono text-slate-400 font-bold text-[11px]">
                    {item.rank}
                  </span>
                  <span className="text-slate-200 text-[11px] font-medium truncate max-w-[150px]">
                    {item.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                  <span>↓</span>
                  <span>{item.eliminated}</span>
                </span>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <Link
            to="/remediation"
            className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,87,34,0.25)]"
          >
            <span>Generate Remediation Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
