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
      className={`rounded-2xl border bg-white dark:bg-[#131316] overflow-hidden ${
        isSuccess ? "border-emerald-500/30" : "border-amber-500/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              isSuccess
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            }`}
          >
            {isSuccess ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[10px] text-[#A1A1AA] font-mono">Decision Proof</div>
            <div className="font-mono font-bold text-sm text-[#18181B] dark:text-white">
              {proof.proof_id}
            </div>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
            isSuccess
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          }`}
        >
          {proof.verdict.replace(/_/g, " ")}
        </span>
      </div>

      {/* Executive Statement */}
      <div className="px-5 py-3.5 mx-5 mt-4 rounded-lg bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-slate-800 text-[12px] text-slate-700 dark:text-slate-300 leading-relaxed">
        <span className="font-semibold text-[#F25C1F] dark:text-[#FF6B3D]">Proof: </span>
        {proof.executive_statement}
      </div>

      {/* Before → After Metrics */}
      <div className="grid grid-cols-4 gap-3 px-5 py-4">
        {[
          {
            label: "Attack paths",
            before: proof.paths_before_count,
            after: proof.paths_after_count,
            delta: `−${proof.paths_eliminated_count}`,
            suffix: "",
          },
          {
            label: "Crown jewels at risk",
            before: proof.critical_assets_reachable_before,
            after: proof.critical_assets_reachable_after,
            delta: `−${proof.critical_assets_reachable_before - proof.critical_assets_reachable_after}`,
            suffix: "",
          },
          {
            label: "Blast radius",
            before: `${proof.blast_radius_before_percent}%`,
            after: `${proof.blast_radius_after_percent}%`,
            delta: `−${proof.blast_radius_reduction_percent}%`,
            suffix: "",
          },
          {
            label: "Attacker effort",
            before: proof.attacker_effort_before,
            after: proof.attacker_effort_after || "Blocked",
            delta: "↑",
            suffix: "",
          },
        ].map((m, i) => (
          <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-slate-800">
            <div className="text-[9px] text-[#A1A1AA] font-medium uppercase tracking-wide">{m.label}</div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-[15px] font-bold text-red-500">{m.before}</span>
              <ArrowRight className="w-3 h-3 text-[#A1A1AA]" />
              <span className={`text-[18px] font-bold ${i === 3 ? "text-[#F25C1F] dark:text-[#FF6B3D]" : "text-emerald-500"}`}>
                {m.after}
              </span>
            </div>
            <div className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
              {m.delta} {i === 3 ? "harder" : i === 2 ? "reduction" : i === 0 ? "eliminated" : "protected"}
            </div>
          </div>
        ))}
      </div>

      {/* Causal Breakdown */}
      <div className="px-5 pb-5">
        <div className="text-[14px] text-[#71717A] font-bold uppercase tracking-wide mb-2.5">
          Why paths were eliminated
        </div>
        <div className="space-y-2">
          {proof.eliminated_path_explanations.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-slate-800 text-[11px]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#F25C1F] dark:text-[#FF6B3D]">{item.control}: </span>
                <span className="text-[#71717A] dark:text-slate-300">{item.reason}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 ml-1.5 font-semibold">
                  ({item.paths_eliminated_estimate} paths severed)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
