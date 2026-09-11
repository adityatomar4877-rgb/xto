import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Play,
  Sliders,
  Activity,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import {
  api,
  SimulationTrace,
  DigitalTwinTopology,
  ThreatVector,
  AttackerProfile,
} from "@/lib/api";
import { Tactical3DScene, PredictedNextHop } from "@/components/Tactical3DScene";
import { TimelinePlayer } from "@/components/TimelinePlayer";
import { motion } from "@/lib/animations";

export const AttackSimulationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [twin, setTwin] = useState<DigitalTwinTopology | null>(null);
  const [vectors, setVectors] = useState<ThreatVector[]>([]);
  const [attackers, setAttackers] = useState<AttackerProfile[]>([]);

  // Simulation Configuration State
  const [threatId, setThreatId] = useState<string>(
    searchParams.get("threat") || "THREAT-PHISH"
  );
  const [persona, setPersona] = useState<string>("RANSOMWARE");
  const [footholdId, setFootholdId] = useState<string>(
    searchParams.get("foothold") || "WS-ENG-04"
  );
  const [targetId, setTargetId] = useState<string>("VAULT-BACKUP-01");

  // Execution State
  const [simulationTrace, setSimulationTrace] = useState<SimulationTrace | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([api.getTwin(), api.getThreatVectors(), api.getAttackers()])
      .then(([twinData, vData, aData]) => {
        setTwin(twinData);
        setVectors(vData);
        setAttackers(aData);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const trace = await api.runSimulation({
        threat_vector_id: threatId,
        attacker_persona: persona,
        initial_foothold_id: footholdId,
        target_objective_id: targetId,
      });
      setSimulationTrace(trace);
      setActiveStepIndex(trace.timeline.length - 1);
    } catch (err) {
      console.error("Simulation failure:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Run automatically on first mount if not yet executed
  useEffect(() => {
    if (!loading && !simulationTrace && !isSimulating) {
      handleRunSimulation();
    }
  }, [loading]);

  if (loading || !twin) {
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
        <span className="text-[11px] font-mono text-[#A1A1AA]">Loading attack simulation...</span>
      </div>
    );
  }

  // Active path and compromised nodes from timeline up to activeStepIndex
  const activeEvents = simulationTrace ? simulationTrace.timeline.slice(0, activeStepIndex + 1) : [];
  const compromisedList = Array.from(
    new Set(
      activeEvents
        .filter((e) => e.success && e.target_asset_id && e.target_asset_id !== "EXT-INTERNET")
        .map((e) => e.target_asset_id)
    )
  );

  // Reconstruct detected route path nodes in order without duplicates
  const detectedPath: string[] = simulationTrace && simulationTrace.timeline.length > 0
    ? Array.from(
        new Set([
          simulationTrace.timeline[0].source_asset_id,
          ...activeEvents.map((e) => e.target_asset_id),
        ])
      )
    : [footholdId];

  // Active step details
  const currentStep = simulationTrace?.timeline[activeStepIndex];
  const activeStepNode = currentStep?.target_asset_id || footholdId;

  // Calculate MITRE ATT&CK predicted next move — from real simulation data only
  let predictedNextHop: PredictedNextHop | null = null;

  if (simulationTrace && activeStepIndex < simulationTrace.timeline.length - 1) {
    // The upcoming event from the real simulation trace is the predicted move
    const nextEvent = simulationTrace.timeline[activeStepIndex + 1];
    predictedNextHop = {
      sourceId: nextEvent.source_asset_id,
      targetId: nextEvent.target_asset_id,
      techniqueId: nextEvent.technique_id,
      techniqueName: nextEvent.technique_name,
      confidence: 94,
      phase: nextEvent.phase,
      explanation: nextEvent.explanation,
    };
  } else if (simulationTrace && activeStepIndex === simulationTrace.timeline.length - 1) {
    // Final step reached
    predictedNextHop = null;
  }
  // No fallback — if there's no simulation trace yet, no prediction is shown

  return (
    <div className="space-y-8 font-sans text-[#18181B] select-none pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#18181B] font-display">
            Attack Simulation
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5 font-normal">
            Autonomous adversary agent models reachable transitions across the digital twin.
            <span className="text-red-600 font-semibold font-mono"> Red</span> = detected path,{" "}
            <span className="text-amber-600 font-semibold font-mono">Yellow</span> = predicted next move.
          </p>
        </div>

        <button
          onClick={() =>
            navigate(
              `/defense?threat=${threatId}&persona=${persona}&foothold=${footholdId}&target=${targetId}`
            )
          }
          className="px-4 py-2 rounded-2xl bg-[#FFF4ED] border border-[#FF5722]/40 text-[#F25C1F] dark:text-[#FF6B3D] hover:bg-[#FFE5D6] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <Sliders className="w-4 h-4" />
          TEST CONTROLS IN SANDBOX &rarr;
        </button>
      </div>

      {/* Scenario Builder Bar */}
      <div className="p-6 rounded-2xl bg-white border border-[#ECECEF] grid grid-cols-5 gap-3.5 text-xs">
        {/* Threat Vector */}
        <div>
          <label className="text-[10px] text-[#71717A] uppercase font-semibold font-mono block mb-1">
            THREAT VECTOR
          </label>
          <select
            value={threatId}
            onChange={(e) => setThreatId(e.target.value)}
            className="w-full bg-[#F5F5F5] border border-[#ECECEF] text-slate-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#FF5722] font-semibold"
          >
            {vectors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* Attacker Persona */}
        <div>
          <label className="text-[10px] text-[#71717A] uppercase font-semibold font-mono block mb-1">
            ATTACKER PERSONA
          </label>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="w-full bg-[#F5F5F5] border border-[#ECECEF] text-slate-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#FF5722] font-semibold"
          >
            {attackers.map((a) => (
              <option key={a.persona} value={a.persona}>
                {a.name} ({a.persona})
              </option>
            ))}
          </select>
        </div>

        {/* Initial Foothold */}
        <div>
          <label className="text-[10px] text-[#71717A] uppercase font-semibold font-mono block mb-1">
            INITIAL FOOTHOLD
          </label>
          <select
            value={footholdId}
            onChange={(e) => setFootholdId(e.target.value)}
            className="w-full bg-[#F5F5F5] border border-[#ECECEF] text-slate-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#FF5722] font-semibold"
          >
            {twin.assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.id})
              </option>
            ))}
          </select>
        </div>

        {/* Objective Crown Jewel */}
        <div>
          <label className="text-[10px] text-[#71717A] uppercase font-semibold font-mono block mb-1">
            TARGET OBJECTIVE
          </label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full bg-[#F5F5F5] border border-[#ECECEF] text-slate-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#FF5722] font-semibold"
          >
            {twin.assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.id})
              </option>
            ))}
          </select>
        </div>

        {/* Execute Button */}
        <div className="flex items-end">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-2 px-3 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isSimulating ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                SIMULATING...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                RUN SIMULATION
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport: Exact 2D Vector Topology Canvas + Live Stats */}
      <div className="grid grid-cols-12 gap-6">
        {/* Topology View (2D Vector Canvas matching screenshot) */}
        <div className="col-span-8 h-[450px] flex flex-col">
          <Tactical3DScene
            height="h-full"
            assets={twin.assets}
            relationships={twin.relationships}
            highlightPath={detectedPath}
            compromisedNodes={compromisedList}
            predictedNextHop={predictedNextHop}
            activeStepNode={activeStepNode}
            selectedAssetId={targetId}
            onSelectAsset={(asset) => {
              if (asset?.id) {
                setTargetId(asset.id);
              }
            }}
          />
        </div>

        {/* Simulation Stats & MITRE Prediction Panel */}
        <div className="col-span-4 p-6 rounded-2xl bg-white border border-[#ECECEF] space-y-3.5 flex flex-col justify-between h-[450px] overflow-y-auto">
          <div className="space-y-3">
            <div className="text-[14px] text-slate-800 font-bold uppercase border-b border-slate-100 pb-2 flex items-center justify-between">
              <span className="font-display">
                TELEMETRY & MITRE PREDICTOR
              </span>
              <span className="text-[10px] text-[#F25C1F] dark:text-[#FF6B3D] font-mono bg-[#FFF4ED] px-1.5 py-0.5 rounded font-bold">
                STEP {activeStepIndex + 1}/{simulationTrace?.timeline.length || 1}
              </span>
            </div>

            {/* MITRE ATT&CK Next Move Prediction Callout */}
            {predictedNextHop ? (
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-300 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-[10px] font-mono font-bold text-amber-900 tracking-wider">
                      PREDICTED NEXT MOVE
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-200/80 px-1.5 py-0.5 rounded">
                    {predictedNextHop.confidence}% CONFIDENCE
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-black text-xs">
                    {predictedNextHop.techniqueId}
                  </span>
                  <div className="text-xs font-bold text-[#18181B] truncate">
                    {predictedNextHop.techniqueName}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-[#71717A]">Target Asset:</span>
                  <span className="font-bold text-[#18181B] bg-white px-2 py-0.5 rounded border border-amber-200">
                    {predictedNextHop.targetId}
                  </span>
                </div>

                <div className="text-[10.5px] text-amber-900/80 leading-snug pt-0.5">
                  {predictedNextHop.explanation || "Anticipated adversary transition based on trust boundary topology and identity caching."}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Final objective reached or adversary path fully contained.</span>
              </div>
            )}

            {/* Current Step Telemetry Details */}
            {currentStep && (
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#71717A] font-medium">CURRENT ACTION:</span>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                    {currentStep.technique_id} - {currentStep.phase}
                  </span>
                </div>

                <div className="text-xs text-slate-700 bg-[#F5F5F5] p-2.5 rounded-lg border border-[#ECECEF] leading-relaxed">
                  {currentStep.explanation}
                </div>
              </div>
            )}

            {/* Blast Radius & Effort Metrics */}
            {simulationTrace && (
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-[#F5F5F5] border border-[#ECECEF]">
                  <div className="text-[9.5px] text-[#71717A] font-medium">BLAST RADIUS</div>
                  <div className="text-lg font-black text-red-600 font-display">
                    {simulationTrace.blast_radius_percent}%
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F5F5F5] border border-[#ECECEF]">
                  <div className="text-[9.5px] text-[#71717A] font-medium">ATTACKER EFFORT</div>
                  <div className="text-lg font-black text-slate-800 font-display">
                    {simulationTrace.total_attacker_effort_score}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Compromised Assets Pill List */}
          {simulationTrace && (
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[9.5px] text-[#71717A] uppercase font-bold mb-1.5">
                COMPROMISED ASSETS ({compromisedList.length}):
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                {compromisedList.map((cid) => (
                  <span
                    key={cid}
                    className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[9.5px] font-mono font-semibold"
                  >
                    {cid}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Timeline Player with Step Controls */}
      {simulationTrace && (
        <TimelinePlayer
          timeline={simulationTrace.timeline}
          activeStepIndex={activeStepIndex}
          onStepChange={(idx) => setActiveStepIndex(idx)}
          onSelectEvidence={(eid) => navigate(`/evidence?id=${eid}`)}
        />
      )}
    </div>
  );
};
