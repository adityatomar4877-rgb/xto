import React, { useState, useEffect } from "react";
import { ListOrdered, TrendingDown, GitCommit, CheckCircle2, Activity, ArrowRight, ShieldCheck } from "lucide-react";
import { api, RemediationPriority } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export const RemediationPage: React.FC = () => {
  const navigate = useNavigate();
  const [remediations, setRemediations] = useState<RemediationPriority[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getRemediationPriorities()
      .then((data) => setRemediations(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full font-mono text-cyan-400">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        RANKING PATH-ELIMINATING REMEDIATIONS...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-emerald-400" />
            REMEDIATION PRIORITISATION // PATH-ELIMINATION MATRIX
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by critical attack paths eliminated and blast radius reduction rather than raw CVSS counts alone.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          PRIORITIZED ACTIONS: <span className="text-emerald-400 font-bold">{remediations.length} RECOMMENDATIONS</span>
        </div>
      </div>

      {/* Priority Cards List */}
      <div className="space-y-4">
        {remediations.map((rem) => (
          <div
            key={rem.rank}
            className="p-5 rounded-lg bg-[#0B0E14]/90 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  #{rem.rank}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">{rem.control_name}</h3>
                  <div className="text-[11px] text-slate-400">
                    TYPE: <span className="text-[#00E5FF]">{rem.control_type}</span> // TARGET: {rem.target_assets_or_identities.join(", ")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  COMPLEXITY: <strong className="text-white">{rem.implementation_complexity}</strong>
                </span>
                <span className="text-xs px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold shadow-[0_0_12px_rgba(0,230,118,0.2)]">
                  PRIORITY SCORE: {rem.priority_score}
                </span>
              </div>
            </div>

            {/* Causal Reasoning */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded border border-slate-800/80">
              {rem.reasoning}
            </p>

            {/* Impact Metric Chips */}
            <div className="flex flex-wrap items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-4">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <GitCommit className="w-3.5 h-3.5" />
                  -{rem.critical_paths_eliminated} CRITICAL PATHS SEVERED
                </span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  -{rem.blast_radius_reduction_percent}% BLAST RADIUS REDUCTION
                </span>
                <span className="text-amber-400 font-semibold">
                  +{rem.attacker_effort_increase} ATTACKER EFFORT INCREASE
                </span>
              </div>

              <button
                onClick={() => navigate("/defense")}
                className="text-xs text-cyan-400 hover:text-white font-bold flex items-center gap-1"
              >
                TEST IN SANDBOX &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
