import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FileCheck2, ShieldCheck, Activity, Search, Filter, CheckCircle2 } from "lucide-react";
import { api, EvidenceRecord } from "@/lib/api";

export const EvidenceExplorerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const initialId = searchParams.get("id");

  useEffect(() => {
    api.getEvidence()
      .then((data) => {
        setEvidenceList(data);
        if (data.length > 0) {
          if (initialId) {
            setSelectedEvidence(data.find((e) => e.id === initialId) || data[0]);
          } else {
            setSelectedEvidence(data[0]);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [initialId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full font-mono text-[#FF5722]">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        RETRIEVING EVIDENCE STORE...
      </div>
    );
  }

  const filtered = evidenceList.filter((ev) => {
    const matchesStatus = filterStatus === "ALL" || ev.epistemic_status === filterStatus;
    const matchesSearch =
      ev.finding.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.subject_asset_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans select-none pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <FileCheck2 className="w-5 h-5 text-[#FF5722]" />
            EVIDENCE-FIRST ARCHITECTURE // EVIDENCE EXPLORER
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
            Every attack move and defensive proof is backed by factual telemetry, never fabricated or hallucinated.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          RECORDS: <span className="text-[#FF5722] font-bold">{evidenceList.length} VERIFIED ARTIFACTS</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-[#0C0E14] border border-[#E5E7EB] dark:border-slate-800 flex items-center gap-4 text-xs shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, asset, or finding..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8F9FA] dark:bg-slate-950 border border-[#E5E7EB] dark:border-slate-700 text-slate-900 dark:text-white rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:border-[#FF5722] font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono uppercase font-semibold">EPISTEMIC STATUS:</span>
          {["ALL", "FACT", "ASSUMPTION", "INFERENCE"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono uppercase transition-all cursor-pointer ${
                filterStatus === st
                  ? "bg-[#181B20] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Evidence List (Left) + Detailed Evidence Inspector (Right) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Evidence List */}
        <div className="col-span-5 space-y-2 max-h-[640px] overflow-y-auto pr-1">
          {filtered.map((ev) => {
            const isSelected = selectedEvidence?.id === ev.id;
            return (
              <div
                key={ev.id}
                onClick={() => setSelectedEvidence(ev)}
                className={`p-3 rounded-xl border cursor-pointer transition-all shadow-xs ${
                  isSelected
                    ? "bg-[#FFF5EE] dark:bg-orange-950/20 border-[#FFCCBA] dark:border-[#FF5722]/40 text-slate-900 dark:text-white"
                    : "bg-white dark:bg-[#0C0E14] border-[#E5E7EB] dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="font-bold text-slate-900 dark:text-white">{ev.id}</span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      ev.epistemic_status === "FACT"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/40"
                        : ev.epistemic_status === "INFERENCE"
                        ? "bg-[#FFF2EB] text-[#FF5722] border border-[#FF5722]/30 dark:bg-orange-950/60 dark:text-orange-300"
                        : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-500/40"
                    }`}
                  >
                    {ev.epistemic_status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{ev.finding}</div>
                <div className="mt-2 text-[10px] text-slate-400 flex justify-between font-mono">
                  <span>SRC: {ev.source}</span>
                  <span className="text-[#FF5722] font-semibold">{Math.round(ev.confidence * 100)}% CONFIDENCE</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Evidence Record Inspector */}
        <div className="col-span-7 p-5 rounded-xl bg-white dark:bg-[#0C0E14] border border-[#E5E7EB] dark:border-[#171B26] shadow-xs space-y-4">
          {selectedEvidence ? (
            <>
              <div className="border-b border-[#F1F3F5] dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#FF5722] font-bold font-mono">EVIDENCE RECORD: {selectedEvidence.id}</div>
                  <div className="text-xs text-slate-400 mt-0.5 font-mono">{selectedEvidence.timestamp} UTC</div>
                </div>
                <span
                  className={`text-xs px-3 py-0.5 rounded-full font-bold uppercase font-mono ${
                    selectedEvidence.epistemic_status === "FACT"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/50"
                      : "bg-[#FFF2EB] text-[#FF5722] border border-[#FF5722]/30 dark:bg-orange-950 dark:text-orange-300"
                  }`}
                >
                  {selectedEvidence.epistemic_status}
                </span>
              </div>

              {/* Finding Box */}
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase mb-1.5 font-mono">RECORDED FINDING</div>
                <div className="p-3.5 rounded-xl bg-[#F8F9FA] dark:bg-[#07090D] border border-[#E5E7EB] dark:border-slate-800 text-xs text-slate-800 dark:text-white leading-relaxed">
                  {selectedEvidence.finding}
                </div>
              </div>

              {/* Metadata Attributes */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#F8F9FA] dark:bg-[#07090D] border border-[#E5E7EB] dark:border-slate-800 space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">TELEMETRY SOURCE</div>
                  <div className="text-slate-800 dark:text-slate-200 font-bold">{selectedEvidence.source}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#F8F9FA] dark:bg-[#07090D] border border-[#E5E7EB] dark:border-slate-800 space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">CONFIDENCE SCORE</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold">{Math.round(selectedEvidence.confidence * 100)}% VERIFIED</div>
                </div>
                <div className="p-3 rounded-lg bg-[#F8F9FA] dark:bg-[#07090D] border border-[#E5E7EB] dark:border-slate-800 space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">SUBJECT ASSET</div>
                  <div className="text-[#FF5722] font-bold">{selectedEvidence.subject_asset_id}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#F8F9FA] dark:bg-[#07090D] border border-[#E5E7EB] dark:border-slate-800 space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">TARGET ASSET</div>
                  <div className="text-slate-800 dark:text-white font-bold">{selectedEvidence.target_asset_id || "N/A"}</div>
                </div>
              </div>

              {/* Technical Details JSON Viewer */}
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase mb-1.5 font-mono">TECHNICAL DETAILS & ARTIFACTS</div>
                <pre className="p-3.5 rounded-xl bg-[#F8F9FA] dark:bg-[#07090D] border border-[#E5E7EB] dark:border-slate-800 text-[11px] text-slate-800 dark:text-cyan-300 overflow-x-auto font-mono">
                  {JSON.stringify(selectedEvidence.technical_details, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-slate-400 py-12">
              Select an evidence record on the left to inspect its epistemic breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

