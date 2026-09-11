import React from "react";
import { Award, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { DecisionProof } from "@/lib/api";

interface DecisionProofCardProps {
  proof: DecisionProof;
}

export const DecisionProofCard: React.FC<DecisionProofCardProps> = ({ proof }) => {
  const isSuccess = proof.verdict === "PROVEN_DEFENSE_SUCCESS";

  return (
    <div className={`p-5 rounded-lg border backdrop-blur-xl ${
      isSuccess
        ? "bg-gradient-to-b from-emerald-950/40 to-[#0B0E14]/90 border-emerald-500/40 shadow-[0_0_30px_rgba(0,230,118,0.12)]"
        : "bg-[#0B0E14]/90 border-amber-500/40 shadow-[0_0_30px_rgba(255,179,0,0.12)]"
    }`}>
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded flex items-center justify-center ${
            isSuccess ? "bg-emerald-950 border border-emerald-500/60 text-emerald-400" : "bg-amber-950 border border-amber-500/60 text-amber-400"
          }`}>
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono text-xs text-slate-400">XTO DECISION PROOF RECORD</div>
            <div className="font-mono font-bold text-sm text-white tracking-wide">{proof.proof_id}</div>
          </div>
        </div>

        <div className={`px-3 py-1 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
          isSuccess
            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(0,230,118,0.2)]"
            : "bg-amber-950/80 text-amber-300 border border-amber-500/50"
        }`}>
          {isSuccess ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {proof.verdict.replace(/_/g, " ")}
        </div>
      </div>

      {/* Executive Statement */}
      <div className="p-3 rounded bg-slate-950/70 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed mb-5">
        <span className="text-[#00E5FF] font-bold">VERIFICATION PROOF: </span>
        {proof.executive_statement}
      </div>

      {/* Before vs After Metric Grid */}
      <div className="grid grid-cols-4 gap-3 mb-5 font-mono">
        {/* Critical Paths */}
        <div className="p-3 rounded bg-slate-950/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">CRITICAL ATTACK PATHS</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-red-400">{proof.paths_before_count}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xl font-bold text-emerald-400">{proof.paths_after_count}</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
            -{proof.paths_eliminated_count} PATHS ELIMINATED
          </div>
        </div>

        {/* Reachable Crown Jewels */}
        <div className="p-3 rounded bg-slate-950/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">CROWN JEWELS AT RISK</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-red-400">{proof.critical_assets_reachable_before}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xl font-bold text-emerald-400">{proof.critical_assets_reachable_after}</span>
          </div>
          <div className="text-[10px] text-cyan-400 mt-1 font-semibold">
            {proof.critical_assets_reachable_before - proof.critical_assets_reachable_after} PROTECTED
          </div>
        </div>

        {/* Blast Radius */}
        <div className="p-3 rounded bg-slate-950/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">BLAST RADIUS</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-red-400">{proof.blast_radius_before_percent}%</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xl font-bold text-emerald-400">{proof.blast_radius_after_percent}%</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
            -{proof.blast_radius_reduction_percent}% REDUCTION
          </div>
        </div>

        {/* Attacker Effort Score */}
        <div className="p-3 rounded bg-slate-950/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">ATTACKER EFFORT</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-slate-400">{proof.attacker_effort_before}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xl font-bold text-cyan-400">{proof.attacker_effort_after || "BLOCKED"}</span>
          </div>
          <div className="text-[10px] text-cyan-400 mt-1 font-semibold">
            DIFFICULTY BARRIER
          </div>
        </div>
      </div>

      {/* Causal Reasoning Breakdown: Why were paths eliminated? */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#00E5FF]" />
          CAUSAL PROOF OF ATTACK PATH ELIMINATION
        </div>
        <div className="space-y-2">
          {proof.eliminated_path_explanations.map((item, idx) => (
            <div key={idx} className="p-2.5 rounded bg-slate-900/60 border border-cyan-950/60 flex items-start gap-2.5 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#00E5FF]">{item.control}: </span>
                <span className="text-slate-300">{item.reason}</span>
                <span className="text-[10px] text-emerald-400 ml-2 font-semibold">
                  (Severed {item.paths_eliminated_estimate} paths)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
