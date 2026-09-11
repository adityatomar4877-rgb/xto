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
      <div className="flex items-center justify-center h-full font-mono text-cyan-400">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        ANALYZING ENTERPRISE MITRE ATT&CK MATRIX...
      </div>
    );
  }

  const score = report.posture_score;
  const scoreColor =
    score >= 75 ? "text-emerald-400 border-emerald-500/50 bg-emerald-950/40" :
    score >= 50 ? "text-cyan-400 border-cyan-500/50 bg-cyan-950/40" :
    "text-amber-400 border-amber-500/50 bg-amber-950/40";

  return (
    <div className="space-y-6 font-mono pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00E5FF]" />
              MITRE ATT&CK FRAMEWORK // ENTERPRISE MATRIX ANALYSIS
            </h1>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-[#00E5FF] border border-[#00E5FF]/40 text-[10px] font-bold">
              FRAMEWORK V15
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic tactical coverage, M-series mitigation verification, and blind-spot detection derived from active Digital Twin controls.
          </p>
        </div>

        <Link
          to="/defense"
          className="px-3.5 py-1.5 rounded bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF] hover:bg-[#00E5FF]/30 text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)]"
        >
          <Sliders className="w-3.5 h-3.5" />
          TEST DEFENSES IN SANDBOX &rarr;
        </Link>
      </div>

      {/* Top Posture Dashboard Banner */}
      <div className="grid grid-cols-5 gap-4">
        {/* Posture Score */}
        <div className={`p-4 rounded-lg border backdrop-blur-xl ${scoreColor} flex flex-col justify-between`}>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
              MITRE COVERAGE INDEX
            </div>
            <div className="text-3xl font-bold mt-1">
              {report.posture_score}%
            </div>
          </div>
          <div className="text-[10px] mt-2 opacity-70">
            {report.posture_score >= 75 ? "ROBUST DEFENSE-IN-DEPTH" : "MODERATE TACTICAL GAPS"}
          </div>
        </div>

        {/* Total Evaluated */}
        <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-bold">EVALUATED TECHNIQUES</div>
          <div className="text-2xl font-bold text-white mt-1">{report.total_techniques_evaluated}</div>
          <div className="text-[10px] text-slate-500 mt-1">Enterprise matrix techniques</div>
        </div>

        {/* Mitigated Techniques */}
        <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-emerald-500/30">
          <div className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" /> MITIGATED / BLOCKED
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{report.total_mitigated}</div>
          <div className="text-[10px] text-slate-400 mt-1">Covered by active controls</div>
        </div>

        {/* Exposed Techniques */}
        <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-rose-500/30">
          <div className="text-[10px] text-rose-400 uppercase font-bold flex items-center gap-1.5">
            <XCircle className="w-3 h-3" /> EXPOSED GAPS
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{report.total_exposed}</div>
          <div className="text-[10px] text-slate-400 mt-1">Unmitigated attack vectors</div>
        </div>

        {/* Active Mitigations */}
        <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-cyan-500/30">
          <div className="text-[10px] text-cyan-400 uppercase font-bold">ACTIVE M-SERIES MITIGATIONS</div>
          <div className="text-2xl font-bold text-[#00E5FF] mt-1">{report.total_active_mitigations}</div>
          <div className="text-[10px] text-slate-400 mt-1">M1030, M1032, M1049, M1026...</div>
        </div>
      </div>

      {/* Tactic Coverage Breakdown (Horizontal Bars) */}
      <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
          <span className="font-bold text-slate-200">TACTIC-BY-TACTIC DEFENSE PROFILE</span>
          <span className="text-slate-400 text-[11px]">{report.tactics_breakdown.length} ENTERPRISE TACTICS EVALUATED</span>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-xs">
          {report.tactics_breakdown.map((t) => (
            <div key={t.tactic} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-semibold">{t.tactic}</span>
                <span className={`font-bold ${t.coverage_percent >= 70 ? "text-emerald-400" : t.coverage_percent >= 40 ? "text-cyan-400" : "text-amber-400"}`}>
                  {t.coverage_percent}% ({t.mitigated_count}/{t.total_techniques})
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    t.coverage_percent >= 70 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                    t.coverage_percent >= 40 ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" :
                    "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  }`}
                  style={{ width: `${t.coverage_percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-[#0B0E14]/90 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950 px-3 py-1.5 rounded border border-slate-800 focus-within:border-cyan-500">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search technique by ID or keyword (e.g. T1003, LSASS, SMB, Phishing)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-white outline-none placeholder-slate-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">FILTER STATUS:</span>
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              statusFilter === "ALL"
                ? "bg-slate-800 text-white border border-slate-600"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setStatusFilter("MITIGATED")}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              statusFilter === "MITIGATED"
                ? "bg-emerald-950 text-emerald-400 border border-emerald-500/50"
                : "text-slate-400 hover:text-emerald-400"
            }`}
          >
            MITIGATED ({report.total_mitigated})
          </button>
          <button
            onClick={() => setStatusFilter("VULNERABLE")}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              statusFilter === "VULNERABLE"
                ? "bg-rose-950 text-rose-400 border border-rose-500/50"
                : "text-slate-400 hover:text-rose-400"
            }`}
          >
            VULNERABLE ({report.total_exposed})
          </button>
        </div>
      </div>

      {/* MITRE ATT&CK Matrix Heatmap (Interactive Columns) */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-[1400px]">
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
              <div
                key={col.tactic}
                className="w-56 flex-shrink-0 bg-[#0B0E14]/90 border border-slate-800 rounded-lg p-3 space-y-2"
              >
                {/* Column Header */}
                <div className="border-b border-slate-800 pb-2">
                  <div className="text-xs font-bold text-slate-200 truncate" title={col.tactic}>
                    {col.tactic}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{col.mitigated_count}/{col.techniques_count} COVERED</span>
                    <span className={`font-bold ${col.mitigated_count === col.techniques_count ? "text-emerald-400" : "text-amber-400"}`}>
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
                        className={`p-2 rounded border text-[11px] cursor-pointer transition-all hover:scale-[1.02] ${
                          isMitigated
                            ? "bg-emerald-950/30 border-emerald-500/40 hover:border-emerald-400 text-slate-200"
                            : "bg-rose-950/20 border-rose-500/30 hover:border-rose-400 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-[10px] ${isMitigated ? "text-emerald-400" : "text-rose-400"}`}>
                            {tech.id}
                          </span>
                          <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                            isMitigated
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                              : "bg-rose-950 text-rose-300 border border-rose-500/40"
                          }`}>
                            {isMitigated ? "BLOCKED" : "EXPOSED"}
                          </span>
                        </div>
                        <div className="font-semibold text-white mt-1 leading-snug truncate" title={tech.name}>
                          {tech.name}
                        </div>
                      </div>
                    );
                  })}

                  {filteredTechniques.length === 0 && (
                    <div className="text-[10px] text-slate-500 py-4 text-center">
                      No matching techniques
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-over Inspector Drawer for Selected Technique */}
      {selectedTechnique && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-lg bg-[#0B0E14] border-l border-cyan-950/60 p-6 overflow-y-auto space-y-5 font-mono shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-[#00E5FF] border border-[#00E5FF]/40 text-xs font-bold">
                  {selectedTechnique.id}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                  selectedTechnique.status === "MITIGATED"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                    : "bg-rose-950 text-rose-300 border border-rose-500/40"
                }`}>
                  {selectedTechnique.status === "MITIGATED" ? "BLOCKED BY DIGITAL TWIN" : "UNMITIGATED EXPOSURE"}
                </span>
              </div>

              <button
                onClick={() => setSelectedTechnique(null)}
                className="w-7 h-7 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">{selectedTechnique.name}</h2>
              <div className="text-xs text-[#00E5FF] mt-0.5">TACTIC: {selectedTechnique.tactic}</div>
            </div>

            {/* Description */}
            <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded border border-slate-800">
              {selectedTechnique.description}
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">REQUIRED PRIVILEGE</div>
                <div className="font-bold text-white mt-0.5">{selectedTechnique.required_privilege || "STANDARD"}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">APPLICABLE PLATFORMS</div>
                <div className="font-bold text-slate-200 mt-0.5">
                  {selectedTechnique.applicable_platforms?.join(", ") || "Windows, Linux"}
                </div>
              </div>
            </div>

            {/* MITRE Mitigations Mapping */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300">
                MITRE M-SERIES MITIGATIONS
              </div>
              <div className="space-y-1.5">
                {selectedTechnique.mitigations.map((mId) => (
                  <div key={mId} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#00E5FF] mr-2">{mId}</span>
                      <span className="text-slate-300">
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

                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      selectedTechnique.status === "MITIGATED"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                        : "bg-slate-900 text-slate-400 border border-slate-800"
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
                <div className="font-bold text-emerald-400">
                  DIGITAL TWIN CONTROLS ENFORCING THIS:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTechnique.mitigating_controls.map((cid) => (
                    <span key={cid} className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[11px]">
                      {cid}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="pt-4 border-t border-slate-800 flex gap-2">
              <Link
                to="/defense"
                className="flex-1 py-2 rounded bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF] hover:bg-[#00E5FF]/30 text-xs font-bold text-center transition-all"
              >
                SIMULATE COUNTERMEASURE IN SANDBOX
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
