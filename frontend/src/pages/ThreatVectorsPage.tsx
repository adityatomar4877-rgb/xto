import React, { useState, useEffect } from "react";
import { Crosshair, ShieldAlert, CheckCircle2, ArrowRight, Play, Activity } from "lucide-react";
import { api, ThreatVector, DigitalTwinTopology } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, StaggerGroup, AnimatedCard, EASE } from "@/lib/animations";

export const ThreatVectorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [vectors, setVectors] = useState<ThreatVector[]>([]);
  const [selectedVector, setSelectedVector] = useState<ThreatVector | null>(null);
  const [twin, setTwin] = useState<DigitalTwinTopology | null>(null);
  const [selectedFoothold, setSelectedFoothold] = useState<string>("WS-ENG-04");
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [assessing, setAssessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getThreatVectors(), api.getTwin()])
      .then(([vList, tData]) => {
        setVectors(vList);
        setTwin(tData);
        if (vList.length > 0) {
          setSelectedVector(vList[0]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAssess = async () => {
    if (!selectedVector) return;
    setAssessing(true);
    try {
      const res = await api.assessThreat({
        threat_vector_id: selectedVector.id,
        initial_foothold_id: selectedFoothold,
      });
      setAssessmentResult(res);
    } catch (err) {
      console.error("Threat assessment error:", err);
    } finally {
      setAssessing(false);
    }
  };

  if (loading || !selectedVector || !twin) {
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
        <span className="text-[11px] font-mono text-[#A1A1AA]">Loading threat vectors...</span>
      </div>
    );
  }

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
            Threat Vectors
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5 font-normal">
            Evaluate initial access mechanisms against environment prerequisites, footholds, and reachable assets.
          </p>
        </div>

        <div className="text-xs text-[#71717A] font-mono">
          CATALOG: <span className="text-[#F25C1F] dark:text-[#FF6B3D] font-bold">{vectors.length} VECTORS</span>
        </div>
      </motion.div>

      {/* Main Grid: Vector Catalog (Left) + Detail Assessment (Right) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Vector Selector */}
        <StaggerGroup className="col-span-5 space-y-2.5 max-h-[720px] overflow-y-auto overscroll-contain pr-2">
          {vectors.map((vec) => {
            const isSelected = selectedVector.id === vec.id;
            return (
              <AnimatedCard
                key={vec.id}
                hover
                hoverY={-2}
                onClick={() => {
                  setSelectedVector(vec);
                  setAssessmentResult(null);
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#FFF4ED] dark:bg-orange-950/20 border-[#FFCCBA] dark:border-[#FF5722]/40 text-[#18181B] dark:text-white"
                    : "bg-white dark:bg-[#131316] border-[#ECECEF] dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-[#18181B] dark:text-white">{vec.name}</span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                      vec.severity === "CRITICAL"
                        ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-500/40"
                        : "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-500/40"
                    }`}
                  >
                    {vec.severity}
                  </span>
                </div>
                <div className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] line-clamp-2 leading-relaxed">{vec.description}</div>
                <div className="mt-2 text-[10px] text-[#F25C1F] dark:text-[#FF6B3D] font-mono font-semibold flex items-center gap-2">
                  <span>CATEGORY: {vec.category}</span>
                  <span>|</span>
                  <span>{vec.relevant_techniques.length} TECHNIQUES</span>
                </div>
              </AnimatedCard>
            );
          })}
        </StaggerGroup>

        {/* Right: Detailed Vector Assessment & Launch */}
        <AnimatedCard className="col-span-7 p-5 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A] space-y-8">
          {/* Vector Title */}
          <div className="border-b border-[#F1F3F5] dark:border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#F25C1F] dark:text-[#FF6B3D] font-mono font-bold">{selectedVector.id} // {selectedVector.category}</span>
              <span className="text-xs text-red-600 dark:text-red-400 font-mono font-bold">{selectedVector.severity} SEVERITY</span>
            </div>
            <h2 className="text-lg font-bold text-[#18181B] dark:text-white mt-1 font-display">{selectedVector.name}</h2>
            <p className="text-xs text-[#71717A] dark:text-slate-300 mt-1 leading-relaxed">{selectedVector.entry_mechanism}</p>
          </div>

          {/* Foothold & Assessment Controls */}
          <div className="p-3.5 rounded-lg bg-[#F5F5F5] dark:bg-[#0A0A0B] border border-[#ECECEF] dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold font-mono">SELECT INITIAL FOOTHOLD ASSET:</label>
              <select
                value={selectedFoothold}
                onChange={(e) => setSelectedFoothold(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-[#ECECEF] dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-[#FF5722] outline-none"
              >
                {twin.assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.id} - {a.zone})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAssess}
                disabled={assessing}
                className="flex-1 py-2 px-4 rounded-lg bg-[#FFF4ED] dark:bg-[#211410] border border-[#FF5722]/40 text-[#F25C1F] dark:text-[#FF6B3D] hover:bg-[#FFE5D6] transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Crosshair className="w-4 h-4" />
                {assessing ? "ASSESSING REACHABILITY..." : "ASSESS THREAT REACHABILITY"}
              </button>
              <button
                onClick={() =>
                  navigate(
                    `/simulation?threat=${selectedVector.id}&foothold=${selectedFoothold}`
                  )
                }
                className="py-2 px-4 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] text-white transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                SIMULATE NOW
              </button>
            </div>
          </div>

          {/* Assessment Output Display */}
          <AnimatePresence>
            {assessmentResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="p-4 rounded-lg bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-500/40 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5 font-mono">
                    <ShieldAlert className="w-4 h-4" />
                    THREAT ASSESSMENT RESULT: {assessmentResult.risk_level} RISK
                  </span>
                  <span className="text-[#18181B] dark:text-white font-bold font-mono">{assessmentResult.viable_attack_paths_count} VIABLE PATHS</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{assessmentResult.summary}</p>
                <div className="pt-2 border-t border-red-200/60 dark:border-slate-800 text-[11px] text-[#71717A] dark:text-[#A1A1AA] flex justify-between font-mono">
                  <span>REACHABLE ASSETS: <strong className="text-[#18181B] dark:text-white">{assessmentResult.reachable_assets_count}</strong></span>
                  <span>CROWN JEWELS AT RISK: <strong className="text-red-600 dark:text-red-400">{assessmentResult.critical_assets_reachable.join(", ") || "None"}</strong></span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prerequisites & Techniques */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <div className="text-[#71717A] dark:text-[#A1A1AA] font-bold uppercase text-[14px] font-mono">ENVIRONMENT PREREQUISITES</div>
              {selectedVector.prerequisites.map((p, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-[#F5F5F5] dark:bg-[#0A0A0B] border border-[#ECECEF] dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <div className="text-[#71717A] dark:text-[#A1A1AA] font-bold uppercase text-[14px] font-mono">RELEVANT MITRE TECHNIQUES</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedVector.relevant_techniques.map((t, i) => (
                  <span key={i} className="px-2 py-1 rounded-md bg-[#FFF4ED] dark:bg-orange-950/60 text-[#F25C1F] dark:text-[#FF6B3D] border border-[#FF5722]/30 text-[11px] font-mono font-bold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

