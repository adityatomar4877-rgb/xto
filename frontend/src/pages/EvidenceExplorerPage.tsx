import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FileCheck2, ShieldCheck, Activity, Search, Filter, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { api, EvidenceRecord } from "@/lib/api";
import { StaggerGroup, AnimatedCard, AnimatedItem, itemVariants, EASE } from "@/lib/animations";

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
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-[#FF5722]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <span className="text-[11px] font-mono text-[#A1A1AA]">Retrieving evidence store...</span>
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
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#18181B] dark:text-white font-display">
            Evidence Explorer
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5 font-normal">
            Every attack move and defensive proof is backed by factual telemetry — never fabricated.
          </p>
        </div>

        <div className="text-xs text-[#71717A] font-mono">
          RECORDS: <span className="text-[#F25C1F] dark:text-[#FF6B3D] font-bold">{evidenceList.length} VERIFIED ARTIFACTS</span>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800 flex items-center gap-6 text-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, asset, or finding..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F5F5] dark:bg-slate-950 border border-[#ECECEF] dark:border-slate-700 text-[#18181B] dark:text-white rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:border-[#FF5722] font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#71717A] font-mono uppercase font-semibold">EPISTEMIC STATUS:</span>
          {["ALL", "FACT", "ASSUMPTION", "INFERENCE"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono uppercase transition-all cursor-pointer ${
                filterStatus === st
                  ? "bg-[#181B20] text-white"
                  : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Evidence List (Left) + Detailed Evidence Inspector (Right) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: EASE }}
        className="grid grid-cols-12 gap-6"
      >
        {/* Left: Evidence List */}
        <StaggerGroup className="col-span-5 space-y-2 max-h-[640px] overflow-y-auto overscroll-contain pr-2">
          {filtered.map((ev) => {
            const isSelected = selectedEvidence?.id === ev.id;
            return (
              <motion.div
                key={ev.id}
                variants={itemVariants}
                whileHover={{ x: 2, transition: { duration: 0.15 } }}
                onClick={() => setSelectedEvidence(ev)}
                className={`p-3 rounded-2xl border cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#FFF4ED] dark:bg-orange-950/20 border-[#FFCCBA] dark:border-[#FF5722]/40 text-[#18181B] dark:text-white"
                    : "bg-white dark:bg-[#131316] border-[#ECECEF] dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="font-bold text-[#18181B] dark:text-white">{ev.id}</span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      ev.epistemic_status === "FACT"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/40"
                        : ev.epistemic_status === "INFERENCE"
                        ? "bg-[#FFF4ED] text-[#F25C1F] dark:text-[#FF6B3D] border border-[#FF5722]/30 dark:bg-orange-950/60"
                        : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-500/40"
                    }`}
                  >
                    {ev.epistemic_status}
                  </span>
                </div>
                <div className="text-[11px] text-[#71717A] dark:text-slate-300 line-clamp-2 leading-relaxed">{ev.finding}</div>
                <div className="mt-2 text-[10px] text-[#A1A1AA] flex justify-between font-mono">
                  <span>SRC: {ev.source}</span>
                  <span className="text-[#F25C1F] dark:text-[#FF6B3D] font-semibold">{Math.round(ev.confidence * 100)}% CONFIDENCE</span>
                </div>
              </motion.div>
            );
          })}
        </StaggerGroup>

        {/* Right: Detailed Evidence Record Inspector */}
        <div className="col-span-7 p-5 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A] space-y-8">
          {selectedEvidence ? (
            <>
              <div className="border-b border-[#F1F3F5] dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#F25C1F] dark:text-[#FF6B3D] font-bold font-mono">EVIDENCE RECORD: {selectedEvidence.id}</div>
                  <div className="text-xs text-[#A1A1AA] mt-0.5 font-mono">{selectedEvidence.timestamp} UTC</div>
                </div>
                <span
                  className={`text-xs px-3 py-0.5 rounded-full font-bold uppercase font-mono ${
                    selectedEvidence.epistemic_status === "FACT"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/50"
                      : "bg-[#FFF4ED] text-[#F25C1F] dark:text-[#FF6B3D] border border-[#FF5722]/30 dark:bg-orange-950"
                  }`}
                >
                  {selectedEvidence.epistemic_status}
                </span>
              </div>

              {/* Finding Box */}
              <div>
                <div className="text-[14px] text-[#71717A] font-bold uppercase mb-1.5 font-mono">RECORDED FINDING</div>
                <div className="p-3.5 rounded-2xl bg-[#F5F5F5] dark:bg-[#0A0A0B] border border-[#ECECEF] dark:border-slate-800 text-xs text-slate-800 dark:text-white leading-relaxed">
                  {selectedEvidence.finding}
                </div>
              </div>

              {/* Metadata Attributes */}
              <div className="grid grid-cols-2 gap-6 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#F5F5F5] dark:bg-[#0A0A0B] border border-[#ECECEF] dark:border-slate-800 space-y-1">
                  <div className="text-[#71717A] text-[10px] uppercase font-semibold">TELEMETRY SOURCE</div>
                  <div className="text-slate-800 dark:text-slate-200 font-bold">{selectedEvidence.source}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#F5F5F5] dark:bg-[#0A0A0B] border border-[#ECECEF] dark:border-slate-800 space-y-1">
                  <div className="text-[#71717A] text-[10px] uppercase font-semibold">CONFIDENCE SCORE</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold">{Math.round(selectedEvidence.confidence * 100)}% VERIFIED</div>
                </div>
                <div className="p-3 rounded-lg bg-[#F5F5F5] dark:bg-[#0A0A0B] border border-[#ECECEF] dark:border-slate-800 space-y-1">
                  <div className="text-[#71717A] text-[10px] uppercase font-semibold">SUBJECT ASSET</div>
                  <div className="text-[#F25C1F] dark:text-[#FF6B3D] font-bold">{selectedEvidence.subject_asset_id}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#F5F5F5] dark:bg-[#0A0A0B] border border-[#ECECEF] dark:border-slate-800 space-y-1">
                  <div className="text-[#71717A] text-[10px] uppercase font-semibold">TARGET ASSET</div>
                  <div className="text-slate-800 dark:text-white font-bold">{selectedEvidence.target_asset_id || "N/A"}</div>
                </div>
              </div>

              {/* Technical Details JSON Viewer */}
              <div>
                <div className="text-[14px] text-[#71717A] font-bold uppercase mb-1.5 font-mono">TECHNICAL DETAILS & ARTIFACTS</div>
                <pre className="p-3.5 rounded-2xl bg-[#F5F5F5] dark:bg-[#0A0A0B] border border-[#ECECEF] dark:border-slate-800 text-[11px] text-slate-800 dark:text-cyan-300 overflow-x-auto font-mono">
                  {JSON.stringify(selectedEvidence.technical_details, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-[#A1A1AA] py-12">
              Select an evidence record on the left to inspect its epistemic breakdown.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

