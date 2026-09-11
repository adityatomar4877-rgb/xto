import React from "react";
import { Award, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { DecisionProof } from "@/lib/api";

interface DecisionProofCardProps {
  proof: DecisionProof;
}

export const DecisionProofCard: React.FC<DecisionProofCardProps> = ({ proof }) => {
  const isSuccess = proof.verdict === "PROVEN_DEFENSE_SUCCESS";

  return (
    <div
      className={`p-5 rounded-xl border bg-white dark:bg-[#0C0E14] shadow-xs ${
        isSuccess
          ? "border-emerald-500/30"
          : "border-amber-500/30"
      }`}
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-[#F1F3F5] dark:border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isSuccess
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
            }`}
          >
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono text-[10px] text-slate-400 uppercase font-semibold">
              DECISION PROOF RECORD
            </div>
            <div className="font-mono font-bold text-sm text-slate-900 dark:text-white tracking-wide">
              {proof.proof_id}
            </div>
          </div>
        </div>

        <div
          className={`px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isSuccess
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-500/50"
              : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/50"
          }`}
        >
          {isSuccess ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {proof.verdict.replace(/_/g, " ")}
        </div>
      </div>

      {/* Executive Statement */}
      <div className="p-3.5 rounded-lg bg-[#F8F9FA] dark:bg-[#07090D] border border-[#E5E7EB] dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed mb-4">
        <span className="text-[#FF5722] font-bold">VERIFICATION PROOF: </span>
        {proof.executive_statement}
      </div>

      {/* Before vs After Metric Grid */}
      <div className="grid grid-cols-4 gap-3 mb-4 font-mono">
        {/* Critical Paths */}
        <div className="p-3 rounded-lg bg-[#F8F9FA] dark:bg-[#07090D] border border-[#E5E7EB] dark:border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">CRITICAL ATTACK PATHS</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-red-600 dark:text-red-400">{proof.paths_before_count}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{proof.paths_after_count}</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            -{proof.paths_eliminated_count} PATHS ELIMINATED
          </div>
        </div>

        {/* Reachable Crown Jewels */}
        <div className="p-3 rounded-lg bg-[#F8F9FA] dark:bg-[#07090D] border border-[#E5E7EB] dark:border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">CROWN JEWELS AT RISK</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-red-600 dark:text-red-400">{proof.critical_assets_reachable_before}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{proof.critical_assets_reachable_after}</span>
          </div>
          <div className="text-[10px] text-slate-700 dark:text-slate-300 mt-1 font-semibold">
            {proof.critical_assets_reachable_before - proof.critical_assets_reachable_after} PROTECTED
          </div>
        </div>

        {/* Blast Radius */}
        <div className="p-3 rounded-lg bg-[#F8F9FA] dark:bg-[#07090D] border border-[#E5E7EB] dark:border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">BLAST RADIUS</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-red-600 dark:text-red-400">{proof.blast_radius_before_percent}%</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{proof.blast_radius_after_percent}%</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            -{proof.blast_radius_reduction_percent}% REDUCTION
          </div>
        </div>

        {/* Attacker Effort Score */}
        <div className="p-3 rounded-lg bg-[#F8F9FA] dark:bg-[#07090D] border border-[#E5E7EB] dark:border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">ATTACKER EFFORT</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-slate-500">{proof.attacker_effort_before}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xl font-bold text-[#FF5722]">{proof.attacker_effort_after || "BLOCKED"}</span>
          </div>
          <div className="text-[10px] text-[#FF5722] mt-1 font-semibold">
            DIFFICULTY BARRIER
          </div>
        </div>
      </div>

      {/* Causal Reasoning Breakdown: Why were paths eliminated? */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center gap-2 font-semibold">
          <Lock className="w-3.5 h-3.5 text-[#FF5722]" />
          CAUSAL PROOF OF ATTACK PATH ELIMINATION
        </div>
        <div className="space-y-2">
          {proof.eliminated_path_explanations.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-[#F8F9FA] dark:bg-[#07090D] border border-[#E5E7EB] dark:border-slate-800 flex items-start gap-2.5 text-xs font-mono"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#FF5722]">{item.control}: </span>
                <span className="text-slate-700 dark:text-slate-300">{item.reason}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 ml-2 font-semibold">
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

