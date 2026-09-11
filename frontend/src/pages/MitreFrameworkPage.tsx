import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Sliders,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  ArrowRight,
  Info,
  ChevronRight,
  X,
} from "lucide-react";
import {
  api,
  MitrePostureReport,
  MitreMatrixTactic,
  MitreTechnique,
} from "@/lib/api";
import { motion, AnimatePresence, StaggerGroup, AnimatedCard, EASE } from "@/lib/animations";

export const MitreFrameworkPage: React.FC = () => {
  const [report, setReport] = useState<MitrePostureReport | null>(null);
  const [matrix, setMatrix] = useState<MitreMatrixTactic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "MITIGATED" | "VULNERABLE">("ALL");
  const [selectedTechnique, setSelectedTechnique] = useState<MitreTechnique | null>(null);

  useEffect(() => {
    Promise.all([api.getMitreCoverage(), api.getMitreMatrix()])
      .then(([covData, matData]) => {
        setReport(covData);
        setMatrix(matData);
      })
      .catch((err) => console.error("Failed to load MITRE framework data:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !report) {
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
        <span className="text-[11px] font-mono text-[#A1A1AA]">Analyzing MITRE ATT&CK matrix...</span>
      </div>
    );
  }

  const score = report.posture_score;
  const scoreColor =
    score >= 75 ? "text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/50 bg-emerald-50/60 dark:bg-emerald-950/40" :
    score >= 50 ? "text-[#F25C1F] dark:text-[#FF6B3D] border-[#FFCCBA] dark:border-orange-500/50 bg-[#FFF4ED] dark:bg-orange-950/40" :
    "text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/50 bg-amber-50/60 dark:bg-amber-950/40";

  return (
    <div className="space-y-6 font-sans select-none pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex items-center justify-between"
      >
        <div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#18181B] dark:text-white font-display">
              MITRE ATT&CK Matrix
            </h1>
          </div>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5 font-normal">
            Tactical coverage, M-series mitigation verification, and blind-spot detection from active twin controls.
          </p>
        </div>

        <Link
          to="/defense"
          className="px-3.5 py-1.5 rounded-2xl bg-[#FFF4ED] dark:bg-[#211410] border border-[#FF5722]/30 text-[#F25C1F] dark:text-[#FF6B3D] hover:bg-[#FFE5D6] text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <Sliders className="w-3.5 h-3.5" />
          TEST DEFENSES IN SANDBOX &rarr;
        </Link>
      </motion.div>

      {/* Top Posture Dashboard Banner */}
      <StaggerGroup className="grid grid-cols-5 gap-6">
        {/* Posture Score */}
        <AnimatedCard className={`p-6 rounded-2xl border ${scoreColor} flex flex-col justify-between`}>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-80 font-mono">
              MITRE COVERAGE INDEX
            </div>
            <div className="text-3xl font-bold mt-1 font-mono">
              {report.posture_score}%
            </div>
          </div>
          <div className="text-[10px] mt-2 font-semibold">
            {report.posture_score >= 75 ? "ROBUST DEFENSE-IN-DEPTH" : "MODERATE TACTICAL GAPS"}
          </div>
        </AnimatedCard>

        {/* Total Evaluated */}
        <AnimatedCard className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A]">
          <div className="text-[10px] text-[#71717A] uppercase font-bold font-mono">EVALUATED TECHNIQUES</div>
          <div className="text-2xl font-bold text-[#18181B] dark:text-white mt-1 font-mono">{report.total_techniques_evaluated}</div>
          <div className="text-[10px] text-[#A1A1AA] mt-1">Enterprise matrix techniques</div>
        </AnimatedCard>

        {/* Mitigated Techniques */}
        <AnimatedCard className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-emerald-500/30">
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="w-3 h-3" /> MITIGATED / BLOCKED
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{report.total_mitigated}</div>
          <div className="text-[10px] text-[#A1A1AA] mt-1">Covered by active controls</div>
        </AnimatedCard>

        {/* Exposed Techniques */}
        <AnimatedCard className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-rose-500/30">
          <div className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-bold flex items-center gap-1.5 font-mono">
            <XCircle className="w-3 h-3" /> EXPOSED GAPS
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">{report.total_exposed}</div>
          <div className="text-[10px] text-[#A1A1AA] mt-1">Unmitigated attack vectors</div>
        </AnimatedCard>

        {/* Active Mitigations */}
        <AnimatedCard className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-cyan-500/30">
          <div className="text-[10px] text-[#F25C1F] dark:text-[#FF6B3D] uppercase font-bold font-mono">ACTIVE M-SERIES MITIGATIONS</div>
          <div className="text-2xl font-bold text-[#18181B] dark:text-white mt-1 font-mono">{report.total_active_mitigations}</div>
          <div className="text-[10px] text-[#A1A1AA] mt-1">M1030, M1032, M1049, M1026...</div>
        </AnimatedCard>
      </StaggerGroup>

      {/* Tactic Coverage Breakdown (Horizontal Bars) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-[#F1F3F5] dark:border-slate-800 pb-2">
          <span className="text-[14px] font-bold text-[#18181B] dark:text-slate-200 font-display">TACTIC-BY-TACTIC DEFENSE PROFILE</span>
          <span className="text-[#71717A] font-mono text-[11px]">{report.tactics_breakdown.length} ENTERPRISE TACTICS EVALUATED</span>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-xs">
          {report.tactics_breakdown.map((t) => (
            <div key={t.tactic} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{t.tactic}</span>
                <span className={`font-bold font-mono ${t.coverage_percent >= 70 ? "text-emerald-600 dark:text-emerald-400" : t.coverage_percent >= 40 ? "text-[#F25C1F] dark:text-[#FF6B3D]" : "text-amber-600 dark:text-amber-400"}`}>
                  {t.coverage_percent}% ({t.mitigated_count}/{t.total_techniques})
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-[#ECECEF] dark:border-slate-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    t.coverage_percent >= 70 ? "bg-emerald-500" :
                    t.coverage_percent >= 40 ? "bg-[#FF5722]" :
                    "bg-amber-500"
                  }`}
                  style={{ width: `${t.coverage_percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-6 p-3 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-[#F5F5F5] dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-[#ECECEF] dark:border-slate-800 focus-within:border-[#FF5722]">
          <Search className="w-3.5 h-3.5 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search technique by ID or keyword (e.g. T1003, LSASS, SMB, Phishing)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-[#18181B] dark:text-white outline-none placeholder-slate-400 text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#71717A] text-[11px] font-mono font-semibold">FILTER STATUS:</span>
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-[#181B20] text-white"
                : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white"
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setStatusFilter("MITIGATED")}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer ${
              statusFilter === "MITIGATED"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-500/50"
                : "text-[#71717A] dark:text-[#A1A1AA] hover:text-emerald-600"
            }`}
          >
            MITIGATED ({report.total_mitigated})
          </button>
          <button
            onClick={() => setStatusFilter("VULNERABLE")}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer ${
              statusFilter === "VULNERABLE"
                ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-500/50"
                : "text-[#71717A] dark:text-[#A1A1AA] hover:text-rose-600"
            }`}
          >
            VULNERABLE ({report.total_exposed})
          </button>
        </div>
      </div>

      {/* MITRE ATT&CK Matrix Heatmap (Interactive Columns) */}
      <div className="overflow-x-auto pb-4">
        <StaggerGroup className="flex gap-3 min-w-[1400px]">
          {matrix.map((col) => {
            const filteredTechniques = col.techniques.filter((t) => {
              const matchesSearch =
                !searchQuery ||
                t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase());

              const matchesStatus =
                statusFilter === "ALL" || t.status === statusFilter;

              return matchesSearch && matchesStatus;
            });

            return (
              <AnimatedCard
                key={col.tactic}
                className="w-56 flex-shrink-0 bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800 rounded-2xl p-3 space-y-2"
              >
                {/* Column Header */}
                <div className="border-b border-[#F1F3F5] dark:border-slate-800 pb-2">
                  <div className="text-xs font-bold text-[#18181B] dark:text-slate-200 truncate font-display" title={col.tactic}>
                    {col.tactic}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#71717A] font-mono mt-1">
                    <span>{col.mitigated_count}/{col.techniques_count} COVERED</span>
                    <span className={`font-bold ${col.mitigated_count === col.techniques_count ? "text-emerald-600 dark:text-emerald-400" : "text-[#F25C1F] dark:text-[#FF6B3D]"}`}>
                      {Math.round((col.mitigated_count / (col.techniques_count || 1)) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Technique Cards */}
                <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
                  {filteredTechniques.map((tech) => {
                    const isMitigated = tech.status === "MITIGATED";
                    return (
                      <div
                        key={tech.id}
                        onClick={() => setSelectedTechnique(tech)}
                        className={`p-2.5 rounded-lg border text-[11px] cursor-pointer transition-all hover:scale-[1.01] ${
                          isMitigated
                            ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/40 hover:border-emerald-400 text-slate-800 dark:text-slate-200"
                            : "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30 hover:border-rose-400 text-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-bold font-mono text-[10px] ${isMitigated ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                            {tech.id}
                          </span>
                          <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-bold font-mono ${
                            isMitigated
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/40"
                              : "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-500/40"
                          }`}>
                            {isMitigated ? "BLOCKED" : "EXPOSED"}
                          </span>
                        </div>
                        <div className="font-semibold text-[#18181B] dark:text-white mt-1 leading-snug truncate text-[11px]" title={tech.name}>
                          {tech.name}
                        </div>
                      </div>
                    );
                  })}

                  {filteredTechniques.length === 0 && (
                    <div className="text-[10px] text-[#A1A1AA] py-4 text-center">
                      No matching techniques
                    </div>
                  )}
                </div>
              </AnimatedCard>
            );
          })}
        </StaggerGroup>
      </div>

      {/* Slide-over Inspector Drawer for Selected Technique */}
      <AnimatePresence>
        {selectedTechnique && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: EASE }}
              className="w-full max-w-lg bg-white dark:bg-[#131316] border-l border-[#ECECEF] dark:border-slate-800 p-6 overflow-y-auto space-y-8 font-sans shadow-2xl"
            >
            <div className="flex items-center justify-between border-b border-[#F1F3F5] dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#FFF4ED] dark:bg-orange-950/60 text-[#F25C1F] dark:text-[#FF6B3D] border border-[#FF5722]/30 text-xs font-bold font-mono">
                  {selectedTechnique.id}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono ${
                  selectedTechnique.status === "MITIGATED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/40"
                    : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-500/40"
                }`}>
                  {selectedTechnique.status === "MITIGATED" ? "BLOCKED BY DIGITAL TWIN" : "UNMITIGATED EXPOSURE"}
                </span>
              </div>

              <button
                onClick={() => setSelectedTechnique(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-[#A1A1AA] hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#18181B] dark:text-white font-display">{selectedTechnique.name}</h2>
              <div className="text-xs text-[#F25C1F] dark:text-[#FF6B3D] font-mono mt-0.5 font-semibold">TACTIC: {selectedTechnique.tactic}</div>
            </div>

            {/* Description */}
            <div className="text-xs text-[#71717A] dark:text-slate-300 leading-relaxed bg-[#F5F5F5] dark:bg-slate-950 p-3.5 rounded-2xl border border-[#ECECEF] dark:border-slate-800">
              {selectedTechnique.description}
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#F5F5F5] dark:bg-slate-950 border border-[#ECECEF] dark:border-slate-800">
                <div className="text-[10px] text-[#71717A] uppercase font-bold font-mono">REQUIRED PRIVILEGE</div>
                <div className="font-bold text-[#18181B] dark:text-white mt-0.5 font-mono">{selectedTechnique.required_privilege || "STANDARD"}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#F5F5F5] dark:bg-slate-950 border border-[#ECECEF] dark:border-slate-800">
                <div className="text-[10px] text-[#71717A] uppercase font-bold font-mono">APPLICABLE PLATFORMS</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedTechnique.applicable_platforms?.join(", ") || "Windows, Linux"}
                </div>
              </div>
            </div>

            {/* MITRE Mitigations Mapping */}
            <div className="space-y-2">
              <div className="text-[14px] font-bold text-[#18181B] dark:text-slate-300 font-display">
                MITRE M-SERIES MITIGATIONS
              </div>
              <div className="space-y-1.5">
                {selectedTechnique.mitigations.map((mId) => (
                  <div key={mId} className="p-2.5 rounded-lg bg-[#F5F5F5] dark:bg-slate-950 border border-[#ECECEF] dark:border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#F25C1F] dark:text-[#FF6B3D] font-mono mr-2">{mId}</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {mId === "M1030" ? "Network Segmentation" :
                         mId === "M1032" ? "Multi-factor Authentication" :
                         mId === "M1049" ? "Antivirus/EDR" :
                         mId === "M1026" ? "Privileged Account Management" :
                         mId === "M1027" ? "Password Policies" :
                         mId === "M1051" ? "Update Software" :
                         mId === "M1053" ? "Data Backup" :
                         mId === "M1038" ? "Execution Prevention" :
                         mId === "M1035" ? "Limit Access Over Network" : mId}
                      </span>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      selectedTechnique.status === "MITIGATED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/40"
                        : "bg-slate-100 text-[#71717A] border border-slate-200 dark:bg-slate-900 dark:text-[#A1A1AA] dark:border-slate-800"
                    }`}>
                      {selectedTechnique.status === "MITIGATED" ? "ACTIVE IN TWIN" : "ABSENT"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Covering Controls in Twin */}
            {selectedTechnique.mitigating_controls.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  DIGITAL TWIN CONTROLS ENFORCING THIS:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTechnique.mitigating_controls.map((cid) => (
                    <span key={cid} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/40 text-[11px] font-mono">
                      {cid}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="pt-4 border-t border-[#F1F3F5] dark:border-slate-800 flex gap-2">
              <Link
                to="/defense"
                className="flex-1 py-2 rounded-2xl bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-semibold text-center transition-all"
              >
                SIMULATE COUNTERMEASURE IN SANDBOX
              </Link>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

