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
      <div className="flex items-center justify-center h-full font-mono text-cyan-400">
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
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[#00E5FF]" />
            EVIDENCE-FIRST ARCHITECTURE // EVIDENCE EXPLORER
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Every attack move and defensive proof is backed by factual telemetry, never fabricated or hallucinated.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          RECORDS: <span className="text-[#00E5FF] font-bold">{evidenceList.length} VERIFIED ARTIFACTS</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 rounded-lg bg-[#0B0E14]/90 border border-slate-800 flex items-center gap-4 text-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, asset, or finding..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white rounded pl-9 pr-3 py-1.5 text-xs outline-none focus:border-[#00E5FF]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold">EPISTEMIC STATUS:</span>
          {["ALL", "FACT", "ASSUMPTION", "INFERENCE"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                filterStatus === st
                  ? "bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF]"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
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
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#00E5FF]/15 border-[#00E5FF]/50 text-white shadow-[0_0_12px_rgba(0,229,255,0.15)]"
                    : "bg-[#0B0E14]/80 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white">{ev.id}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      ev.epistemic_status === "FACT"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                        : ev.epistemic_status === "INFERENCE"
                        ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                        : "bg-amber-950 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {ev.epistemic_status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 line-clamp-2">{ev.finding}</div>
                <div className="mt-1.5 text-[10px] text-slate-400 flex justify-between">
                  <span>SRC: {ev.source}</span>
                  <span className="text-cyan-400">{Math.round(ev.confidence * 100)}% CONFIDENCE</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Evidence Record Inspector */}
        <div className="col-span-7 p-5 rounded-lg bg-[#0B0E14]/90 border border-cyan-950/40 space-y-4">
          {selectedEvidence ? (
            <>
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-cyan-400 font-bold">EVIDENCE RECORD: {selectedEvidence.id}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{selectedEvidence.timestamp} UTC</div>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded font-bold uppercase ${
                    selectedEvidence.epistemic_status === "FACT"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-500/50"
                      : "bg-cyan-950 text-cyan-300 border border-cyan-500/50"
                  }`}
                >
                  {selectedEvidence.epistemic_status}
                </span>
              </div>

              {/* Finding Box */}
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase mb-1.5">RECORDED FINDING</div>
                <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs text-white leading-relaxed">
                  {selectedEvidence.finding}
                </div>
              </div>

              {/* Metadata Attributes */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase">TELEMETRY SOURCE</div>
                  <div className="text-slate-200 font-bold">{selectedEvidence.source}</div>
                </div>
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase">CONFIDENCE SCORE</div>
                  <div className="text-emerald-400 font-bold">{Math.round(selectedEvidence.confidence * 100)}% VERIFIED</div>
                </div>
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase">SUBJECT ASSET</div>
                  <div className="text-cyan-400 font-bold">{selectedEvidence.subject_asset_id}</div>
                </div>
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase">TARGET ASSET</div>
                  <div className="text-white font-bold">{selectedEvidence.target_asset_id || "N/A"}</div>
                </div>
              </div>

              {/* Technical Details JSON Viewer */}
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase mb-1.5">TECHNICAL DETAILS & ARTIFACTS</div>
                <pre className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 overflow-x-auto">
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
