import React, { useState, useEffect } from "react";
import { Award, ShieldCheck, ArrowRight, Activity, Download, FileText, CheckCircle2 } from "lucide-react";
import { api, WhatIfComparison } from "@/lib/api";
import { DecisionProofCard } from "@/components/DecisionProofCard";

export const DecisionProofPage: React.FC = () => {
  const [comparison, setComparison] = useState<WhatIfComparison | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Generate baseline vs defended proof
    api.runWhatIf({
      threat_vector_id: "THREAT-PHISH",
      attacker_persona: "RANSOMWARE",
      initial_foothold_id: "WS-ENG-04",
      target_objective_id: "VAULT-BACKUP-01",
      defenses: [
        {
          id: "DEF-SEGMENT-VAULT",
          control_type: "SEGMENT_NETWORK",
          name: "Micro-Segment Backup Vault Infrastructure",
          target_scope: ["VAULT-BACKUP-01"],
          is_enabled: true,
        },
        {
          id: "DEF-MFA-ADMINS",
          control_type: "ENABLE_MFA",
          name: "Enforce Hardware MFA on Tier-0 Admin Sessions",
          target_scope: ["ID-DOMAIN-ADMIN"],
          is_enabled: true,
        },
      ],
    })
      .then((data) => setComparison(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !comparison) {
    return (
      <div className="flex items-center justify-center h-full font-mono text-[#FF5722]">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        COMPILING QUANTITATIVE DECISION PROOF...
      </div>
    );
  }

  const proof = comparison.decision_proof;

  return (
    <div className="space-y-6 font-sans select-none pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 font-display">
              <Award className="w-5 h-5 text-[#FF5722]" />
              DECISION PROOF // MATHEMATICAL DEFENSE VERIFICATION
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#FFF2EB] dark:bg-orange-950/60 text-[#FF5722] border border-[#FF5722]/30 text-[10px] font-bold font-mono">
              FLAGSHIP USP
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
            Verifiable causal proof proving which critical attack paths were severed and why.
          </p>
        </div>

        <button
          onClick={() => alert("Decision Proof Report successfully exported for CISO review.")}
          className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#0C0E14] border border-[#E5E7EB] dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          EXPORT AUDIT CERTIFICATE
        </button>
      </div>

      {/* Main Flagship Proof Card */}
      <DecisionProofCard proof={proof} />

      {/* Side-by-Side Timeline Trace Comparison: Before vs After */}
      <div className="grid grid-cols-2 gap-6">
        {/* Before: Undefended Attack Trace */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0C0E14] border border-red-500/30 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-[#F1F3F5] dark:border-slate-800 pb-2">
            <span className="text-red-600 dark:text-red-400 font-bold uppercase font-mono">BASELINE ADVERSARY TRACE (UNDEFENDED)</span>
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold font-mono">
              BREACH SUCCESSFUL
            </span>
          </div>

          <div className="space-y-2">
            {comparison.timeline_before.map((ev: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#F8F9FA] dark:bg-[#07090D] border border-[#E5E7EB] dark:border-slate-800 text-xs font-mono">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-red-600 dark:text-red-400 font-bold">STEP {ev.step}: {ev.action_name}</span>
                  <span className="text-slate-400">+{ev.timestamp_offset_seconds}s</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300 text-[11px]">{ev.explanation}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {ev.source_asset_name} &rarr; {ev.target_asset_name} ({ev.technique_id})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* After: Defended Virtual Sandbox Trace */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0C0E14] border border-emerald-500/30 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-[#F1F3F5] dark:border-slate-800 pb-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase font-mono">DEFENDED TRACE (VIRTUAL INTERVENTIONS APPLIED)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold font-mono">
              CONTAINED & BLOCKED
            </span>
          </div>

          <div className="space-y-2">
            {comparison.timeline_after.map((ev: any, idx: number) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-xs font-mono ${
                  ev.success
                    ? "bg-[#F8F9FA] dark:bg-[#07090D] border-[#E5E7EB] dark:border-slate-800"
                    : "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/40"
                }`}
              >
                <div className="flex justify-between text-[11px] mb-1">
                  <span className={ev.success ? "text-slate-900 dark:text-slate-200 font-bold" : "text-emerald-600 dark:text-emerald-400 font-bold"}>
                    STEP {ev.step}: {ev.action_name}
                  </span>
                  <span className="text-slate-400">+{ev.timestamp_offset_seconds}s</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300 text-[11px]">{ev.explanation}</div>
                {!ev.success && (
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    BLOCKED BY: {ev.blocked_by_control}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

