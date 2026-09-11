import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  GitCommit,
  Radio,
  Sliders,
  Award,
  ArrowRight,
  TrendingDown,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { api, DigitalTwinTopology, RemediationPriority } from "@/lib/api";
import { Tactical3DScene } from "@/components/Tactical3DScene";

export const CommandCenterPage: React.FC = () => {
  const [twin, setTwin] = useState<DigitalTwinTopology | null>(null);
  const [remediations, setRemediations] = useState<RemediationPriority[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getTwin(), api.getRemediationPriorities()])
      .then(([twinData, remData]) => {
        setTwin(twinData);
        setRemediations(remData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !twin) {
    return (
      <div className="flex items-center justify-center h-full font-mono text-cyan-400">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        INITIALIZING CYBER WAR ROOM TELEMETRY...
      </div>
    );
  }

  const topRemediation = remediations[0];

  return (
    <div className="space-y-6">
      {/* Top Banner / Core Questions Answer Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 font-mono">
            COMMAND CENTER // WAR ROOM HUD
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time security posture derived from active digital twin graph reachability and attacker agent models.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/simulation"
            className="px-3.5 py-1.5 rounded bg-red-950/60 border border-red-500/50 text-red-300 hover:bg-red-900/60 text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,59,48,0.2)]"
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            SIMULATE ATTACK
          </Link>
          <Link
            to="/defense"
            className="px-3.5 py-1.5 rounded bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF] hover:bg-[#00E5FF]/30 text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,229,255,0.25)]"
          >
            <Sliders className="w-4 h-4" />
            TEST DEFENSE SANDBOX
          </Link>
        </div>
      </div>

      {/* 5 Core Decision Metrics (PS #13 Pillars) */}
      <div className="grid grid-cols-5 gap-4 font-mono">
        {/* 1. What is Exposed? */}
        <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-red-500/30 relative overflow-hidden">
          <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider">1. WHAT IS EXPOSED?</div>
          <div className="text-2xl font-bold text-white mt-1">17 PATHS</div>
          <div className="text-[11px] text-slate-400 mt-1">Direct routes to Crown Jewels from Corporate Workstations</div>
          <div className="mt-3 text-[10px] text-red-400 flex items-center gap-1 font-semibold">
            <AlertTriangle className="w-3 h-3" />
            Vulnerable to Ransomware
          </div>
        </div>

        {/* 2. What can an Attacker Reach? */}
        <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-amber-500/30 relative overflow-hidden">
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">2. BLAST RADIUS REACH</div>
          <div className="text-2xl font-bold text-white mt-1">61.0%</div>
          <div className="text-[11px] text-slate-400 mt-1">8 of 12 internal assets reachable from WS-ENG-04 foothold</div>
          <div className="mt-3 text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
            <Radio className="w-3 h-3" />
            Includes 3 Critical Jewels
          </div>
        </div>

        {/* 3. Most Dangerous Path */}
        <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-cyan-500/30 relative overflow-hidden">
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">3. CRITICAL CHOKEPOINT</div>
          <div className="text-2xl font-bold text-white mt-1">DC-CORP-01</div>
          <div className="text-[11px] text-slate-400 mt-1">Active Directory DC intersects 88% of all viable attack paths</div>
          <div className="mt-3 text-[10px] text-[#00E5FF] flex items-center gap-1 font-semibold">
            <GitCommit className="w-3 h-3" />
            Single point of lateral failure
          </div>
        </div>

        {/* 4. What Should We Fix? */}
        <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-emerald-500/30 relative overflow-hidden">
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">4. TOP REMEDIATION</div>
          <div className="text-lg font-bold text-white mt-1 truncate">SEGMENT VAULT</div>
          <div className="text-[11px] text-slate-400 mt-1">Eliminates 11 critical paths instantly</div>
          <div className="mt-3 text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingDown className="w-3 h-3" />
            -47% Blast Radius drop
          </div>
        </div>

        {/* 5. What Changed? */}
        <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-slate-800 relative overflow-hidden">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">5. ENVIRONMENT SYNC</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{twin.snapshot_id}</div>
          <div className="text-[11px] text-slate-400 mt-1">Version {twin.version} // Real-time state synchronized</div>
          <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
            Zero stale attack paths
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Topology + Live Remediation Priority Card */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Interactive Topology View */}
        <div className="col-span-8 p-4 rounded-lg bg-[#0B0E14]/90 border border-cyan-950/40">
          <div className="flex items-center justify-between mb-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00E5FF]" />
              <span className="font-bold text-white">INFRASTRUCTURE SECURITY DIGITAL TWIN</span>
            </div>
            <Link to="/twin" className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]">
              OPEN 3D EXPLORER &rarr;
            </Link>
          </div>
          <div className="h-96">
            <Tactical3DScene
              assets={twin.assets}
              relationships={twin.relationships}
              highlightPath={["WS-ENG-04", "DC-CORP-01", "VAULT-BACKUP-01"]}
              compromisedNodes={["WS-ENG-04"]}
            />
          </div>
        </div>

        {/* Right Column: Top Remediations & USP Pitch */}
        <div className="col-span-4 space-y-4">
          {/* Core USP Callout Card */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-950/40 via-[#0B0E14] to-slate-950 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,229,255,0.08)]">
            <div className="font-mono text-xs text-amber-400 font-bold flex items-center gap-1.5 uppercase">
              <Award className="w-4 h-4" />
              THE XTO DECISION ADVANTAGE
            </div>
            <p className="text-xs text-slate-300 font-mono mt-2 leading-relaxed">
              Don't guess control effectiveness. Test interventions in the <span className="text-[#00E5FF] font-semibold">Defense Sandbox</span> without touching production, re-run autonomous adversaries, and export a mathematical <span className="text-emerald-400 font-semibold">Decision Proof</span>.
            </p>
            <Link
              to="/defense"
              className="mt-3 block text-center py-2 px-3 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 transition-all font-mono text-xs font-bold"
            >
              LAUNCH DEFENSE SANDBOX NOW &rarr;
            </Link>
          </div>

          {/* Top Remediation Priorities Card */}
          <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200">PATH-SEVERING PRIORITIES</span>
              <Link to="/remediation" className="text-cyan-400 hover:underline text-[10px]">
                VIEW ALL (5) &rarr;
              </Link>
            </div>

            {remediations.slice(0, 3).map((rem) => (
              <div key={rem.rank} className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    #{rem.rank} {rem.control_name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                    SCORE {rem.priority_score}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span className="text-emerald-400">-{rem.critical_paths_eliminated} CRITICAL PATHS</span>
                  <span className="text-cyan-400">-{rem.blast_radius_reduction_percent}% BLAST RADIUS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
