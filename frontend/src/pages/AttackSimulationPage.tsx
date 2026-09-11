import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Terminal,
  ShieldAlert,
  Play,
  Sliders,
  Activity,
  Award,
  AlertTriangle,
  ArrowRight,
  Radio,
} from "lucide-react";
import {
  api,
  SimulationTrace,
  DigitalTwinTopology,
  ThreatVector,
  AttackerProfile,
} from "@/lib/api";
import { Tactical3DScene } from "@/components/Tactical3DScene";
import { TimelinePlayer } from "@/components/TimelinePlayer";

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
      <div className="flex items-center justify-center h-full font-mono text-cyan-400">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        INITIALIZING ATTACK SIMULATION WORKSPACE...
      </div>
    );
  }

  // Active path and compromised nodes from timeline up to activeStepIndex
  const activeEvents = simulationTrace ? simulationTrace.timeline.slice(0, activeStepIndex + 1) : [];
  const compromisedList = activeEvents
    .filter((e) => e.success)
    .map((e) => e.target_asset_id);
  const pathNodes = activeEvents.map((e) => e.target_asset_id);

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-display flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#FF5722]" />
            AGENT-BASED ATTACK SIMULATION
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Autonomous adversary agent evaluates reachable transitions, exploits prerequisites, and models compromise paths.
          </p>
        </div>

        <button
          onClick={() =>
            navigate(
              `/defense?threat=${threatId}&persona=${persona}&foothold=${footholdId}&target=${targetId}`
            )
          }
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600/30 to-amber-600/20 border border-orange-500/40 text-orange-300 hover:bg-orange-500/30 text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(255,87,34,0.15)] transition-all"
        >
          <Sliders className="w-4 h-4" />
          TEST CONTROLS IN SANDBOX &rarr;
        </button>
      </div>

      {/* Scenario Builder Bar */}
      <div className="p-4 rounded-xl bg-[#0D111A] border border-[#1E2638] grid grid-cols-5 gap-3 text-xs shadow-lg">
        {/* Threat Vector */}
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-semibold font-mono block mb-1">THREAT VECTOR</label>
          <select
            value={threatId}
            onChange={(e) => setThreatId(e.target.value)}
            className="w-full bg-[#080A0F] border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-orange-500 font-mono"
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
          <label className="text-[10px] text-slate-400 uppercase font-semibold font-mono block mb-1">ATTACKER PERSONA</label>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="w-full bg-[#080A0F] border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-orange-500 font-mono"
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
          <label className="text-[10px] text-slate-400 uppercase font-semibold font-mono block mb-1">INITIAL FOOTHOLD</label>
          <select
            value={footholdId}
            onChange={(e) => setFootholdId(e.target.value)}
            className="w-full bg-[#080A0F] border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-orange-500 font-mono"
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
          <label className="text-[10px] text-slate-400 uppercase font-semibold font-mono block mb-1">TARGET OBJECTIVE</label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full bg-[#080A0F] border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-orange-500 font-mono"
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
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,59,48,0.3)] cursor-pointer"
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

      {/* Main Simulation Viewport: 3D Topology Canvas + Timeline Player */}
      <div className="grid grid-cols-12 gap-5">
        {/* Topology View */}
        <div className="col-span-8 h-96">
          <Tactical3DScene
            assets={twin.assets}
            relationships={twin.relationships}
            highlightPath={pathNodes}
            compromisedNodes={compromisedList}
          />
        </div>

        {/* Simulation Stats Panel */}
        <div className="col-span-4 p-4 rounded-lg bg-[#0B0E14]/90 border border-cyan-950/40 space-y-3">
          <div className="text-xs text-slate-400 font-bold uppercase border-b border-slate-800 pb-2">
            SIMULATION SUMMARY // TRACE TELEMETRY
          </div>

          {simulationTrace ? (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">OBJECTIVE OUTCOME:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    simulationTrace.objective_achieved
                      ? "bg-red-950 text-red-400 border border-red-500/40 animate-pulse"
                      : "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                  }`}
                >
                  {simulationTrace.objective_achieved ? "BREACH SUCCESSFUL" : "CONTAINED"}
                </span>
              </div>

              <div className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800 leading-relaxed">
                {simulationTrace.summary}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">BLAST RADIUS</div>
                  <div className="text-base font-bold text-red-400">{simulationTrace.blast_radius_percent}%</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">ATTACKER EFFORT</div>
                  <div className="text-base font-bold text-cyan-400">{simulationTrace.total_attacker_effort_score}</div>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">COMPROMISED ASSETS ({simulationTrace.compromised_assets.length}):</div>
                <div className="flex flex-wrap gap-1">
                  {simulationTrace.compromised_assets.map((cid) => (
                    <span key={cid} className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/30 text-[10px]">
                      {cid}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-slate-400 py-8">
              No simulation executed yet.
            </div>
          )}
        </div>
      </div>

      {/* Interactive Timeline Player */}
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
