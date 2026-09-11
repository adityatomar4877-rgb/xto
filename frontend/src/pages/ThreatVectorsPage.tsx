import React, { useState, useEffect } from "react";
import { Crosshair, ShieldAlert, CheckCircle2, ArrowRight, Play, Activity } from "lucide-react";
import { api, ThreatVector, DigitalTwinTopology } from "@/lib/api";
import { useNavigate } from "react-router-dom";

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
      <div className="flex items-center justify-center h-full font-mono text-cyan-400">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        LOADING THREAT VECTOR ENGINE...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-[#00E5FF]" />
            THREAT VECTOR ENGINE // ATTACK ENTRY LAB
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate initial access mechanisms against environment prerequisites, footholds, and reachable assets.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          CATALOG: <span className="text-[#00E5FF] font-bold">{vectors.length} VECTORS</span>
        </div>
      </div>

      {/* Main Grid: Vector Catalog (Left) + Detail Assessment (Right) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Vector Selector */}
        <div className="col-span-5 space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
          {vectors.map((vec) => {
            const isSelected = selectedVector.id === vec.id;
            return (
              <div
                key={vec.id}
                onClick={() => {
                  setSelectedVector(vec);
                  setAssessmentResult(null);
                }}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#00E5FF]/15 border-[#00E5FF]/60 shadow-[0_0_15px_rgba(0,229,255,0.15)] text-white"
                    : "bg-[#0B0E14]/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white">{vec.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      vec.severity === "CRITICAL"
                        ? "bg-red-950 text-red-400 border border-red-500/40"
                        : "bg-amber-950 text-amber-400 border border-amber-500/40"
                    }`}
                  >
                    {vec.severity}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2">{vec.description}</div>
                <div className="mt-2 text-[10px] text-cyan-400 flex items-center gap-2">
                  <span>CATEGORY: {vec.category}</span>
                  <span>|</span>
                  <span>{vec.relevant_techniques.length} TECHNIQUES</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Vector Assessment & Launch */}
        <div className="col-span-7 p-5 rounded-lg bg-[#0B0E14]/90 border border-cyan-950/40 space-y-5">
          {/* Vector Title */}
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-cyan-400 font-bold">{selectedVector.id} // {selectedVector.category}</span>
              <span className="text-xs text-red-400 font-bold">{selectedVector.severity} SEVERITY</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">{selectedVector.name}</h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedVector.entry_mechanism}</p>
          </div>

          {/* Foothold & Assessment Controls */}
          <div className="p-3.5 rounded bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-300 font-bold">SELECT INITIAL FOOTHOLD ASSET:</label>
              <select
                value={selectedFoothold}
                onChange={(e) => setSelectedFoothold(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white rounded px-2.5 py-1 text-xs font-mono focus:border-[#00E5FF] outline-none"
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
                className="flex-1 py-2 px-4 rounded bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF] hover:bg-[#00E5FF]/30 transition-all text-xs font-bold flex items-center justify-center gap-2"
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
                className="py-2 px-4 rounded bg-red-950/70 border border-red-500/50 text-red-300 hover:bg-red-900/60 transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(255,59,48,0.2)]"
              >
                <Play className="w-4 h-4" />
                SIMULATE NOW
              </button>
            </div>
          </div>

          {/* Assessment Output Display */}
          {assessmentResult && (
            <div className="p-4 rounded bg-gradient-to-br from-red-950/30 to-slate-950 border border-red-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-red-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  THREAT ASSESSMENT RESULT: {assessmentResult.risk_level} RISK
                </span>
                <span className="text-white font-bold">{assessmentResult.viable_attack_paths_count} VIABLE PATHS</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{assessmentResult.summary}</p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                <span>REACHABLE ASSETS: <strong className="text-white">{assessmentResult.reachable_assets_count}</strong></span>
                <span>CROWN JEWELS AT RISK: <strong className="text-red-400">{assessmentResult.critical_assets_reachable.join(", ") || "None"}</strong></span>
              </div>
            </div>
          )}

          {/* Prerequisites & Techniques */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="text-slate-400 font-bold uppercase text-[10px]">ENVIRONMENT PREREQUISITES</div>
              {selectedVector.prerequisites.map((p, i) => (
                <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800/80 text-slate-300 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <div className="text-slate-400 font-bold uppercase text-[10px]">RELEVANT MITRE TECHNIQUES</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedVector.relevant_techniques.map((t, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
