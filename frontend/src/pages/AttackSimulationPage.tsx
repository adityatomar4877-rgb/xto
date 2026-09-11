import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Terminal,
  Play,
  Sliders,
  Activity,
  AlertTriangle,
  ArrowRight,
  Zap,
  CheckCircle2,
  Shield,
  Layers,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
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
import { useStaggerEntrance } from "@/lib/animations";

// MITRE ATT&CK Knowledge Base for transition predictions
const MITRE_KNOWLEDGE_MAP: Record<
  string,
  { targetId: string; techniqueId: string; techniqueName: string; confidence: number; phase: string; explanation: string }
> = {
  "EXT-INTERNET": {
    targetId: "FW-EDGE-01",
    techniqueId: "T1190",
    techniqueName: "Exploit Public-Facing Application",
    confidence: 96,
    phase: "Initial Access",
    explanation: "External perimeter scan identifies exposed SSL-VPN and HTTPS interfaces.",
  },
  "FW-EDGE-01": {
    targetId: "VPN-GW-01",
    techniqueId: "T1133",
    techniqueName: "External Remote Services",
    confidence: 91,
    phase: "Initial Access",
    explanation: "Bypasses perimeter packet filter targeting legacy SSL-VPN firmware vulnerability.",
  },
  "VPN-GW-01": {
    targetId: "WS-ENG-04",
    techniqueId: "T1078",
    techniqueName: "Valid Accounts: Stolen Dev Credentials",
    confidence: 89,
    phase: "Initial Access",
    explanation: "Adversary leverages single-factor session fallback to authenticate into DevOps workstation.",
  },
  "WEB-SRV-01": {
    targetId: "APP-SRV-01",
    techniqueId: "T1210",
    techniqueName: "Exploitation of Remote Services (Log4j)",
    confidence: 86,
    phase: "Lateral Movement",
    explanation: "RCE vulnerability on DMZ portal pivots through internal API gateway route.",
  },
  "WS-ENG-04": {
    targetId: "DC-CORP-01",
    techniqueId: "T1003",
    techniqueName: "OS Credential Dumping (LSASS)",
    confidence: 95,
    phase: "Credential Access",
    explanation: "Dumps cached memory on DevOps machine to extract Domain Admin Kerberos ticket.",
  },
  "WS-FIN-02": {
    targetId: "APP-SRV-01",
    techniqueId: "T1021.001",
    techniqueName: "Remote Desktop Protocol Hijacking",
    confidence: 82,
    phase: "Lateral Movement",
    explanation: "Harvested internal portal session permits pivot into banking application server.",
  },
  "APP-SRV-01": {
    targetId: "DB-PROD-01",
    techniqueId: "T1005",
    techniqueName: "Data from Local System / PostgreSQL Access",
    confidence: 92,
    phase: "Collection",
    explanation: "Uses application database connection pool credentials to query production records.",
  },
  "DC-CORP-01": {
    targetId: "DB-PROD-01",
    techniqueId: "T1021.002",
    techniqueName: "SMB / Windows Admin Shares Delegation",
    confidence: 94,
    phase: "Lateral Movement",
    explanation: "Domain Admin privilege permits remote service creation on Tier-0 database server.",
  },
  "CLOUD-K8S-01": {
    targetId: "DB-PROD-01",
    techniqueId: "T1530",
    techniqueName: "Data from Cloud Storage & DB Peering",
    confidence: 88,
    phase: "Collection",
    explanation: "Compromised AWS service account accesses federated RDS storage volume.",
  },
  "DB-PROD-01": {
    targetId: "VAULT-BACKUP-01",
    techniqueId: "T1486",
    techniqueName: "Data Encrypted for Impact (Veeam Invalidation)",
    confidence: 98,
    phase: "Impact",
    explanation: "Adversary compromises immutable backup repository before deploying final ransomware payload.",
  },
  "SIEM-SOC-01": {
    targetId: "DC-CORP-01",
    techniqueId: "T1562.001",
    techniqueName: "Impair Defenses: Log Evasion",
    confidence: 78,
    phase: "Defense Evasion",
    explanation: "Suspends syslog forwarding agents on Domain Controller to delay SOC containment.",
  },
  "VAULT-BACKUP-01": {
    targetId: "EXT-INTERNET",
    techniqueId: "T1041",
    techniqueName: "Exfiltration Over C2 Channel",
    confidence: 90,
    phase: "Exfiltration",
    explanation: "Encrypted snapshot chunks staged and exfiltrated to adversary external VPS drop.",
  },
};

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
  const [showProof, setShowProof] = useState<boolean>(false);
  const containerRef = useStaggerEntrance(".gsap-box", [simulationTrace?.simulation_id]);

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
      <div className="flex items-center justify-center h-full font-mono text-[#FF5722]">
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

  // Reconstruct detected route path nodes in order
  const detectedPath: string[] = simulationTrace && simulationTrace.timeline.length > 0
    ? [
        simulationTrace.timeline[0].source_asset_id,
        ...activeEvents.map((e) => e.target_asset_id),
      ]
    : [footholdId];

  // Active step details
  const currentStep = simulationTrace?.timeline[activeStepIndex];
  const activeStepNode = currentStep?.target_asset_id || footholdId;

  // Calculate MITRE ATT&CK predicted next move
  let predictedNextHop: PredictedNextHop | null = null;

  if (simulationTrace && activeStepIndex < simulationTrace.timeline.length - 1) {
    // If we are currently stepping through the timeline, the upcoming event is the predicted move!
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
  } else {
    // Fallback: predict next move from current foothold using MITRE knowledge base
    const currentAssetId = detectedPath[detectedPath.length - 1] || footholdId;
    const rule = MITRE_KNOWLEDGE_MAP[currentAssetId];
    if (rule) {
      predictedNextHop = {
        sourceId: currentAssetId,
        targetId: rule.targetId,
        techniqueId: rule.techniqueId,
        techniqueName: rule.techniqueName,
        confidence: rule.confidence,
        phase: rule.phase,
        explanation: rule.explanation,
      };
    }
  }

  return (
    <div ref={containerRef} className="space-y-4 font-sans text-slate-900 select-none pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#FF5722]" />
            AGENT-BASED ATTACK SIMULATION
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Autonomous adversary agent models reachable transitions:{" "}
            <span className="text-red-600 font-semibold font-mono">RED = Detected Traversed Path</span>,{" "}
            <span className="text-amber-600 font-semibold font-mono">YELLOW = MITRE ATT&CK Predicted Next Move</span>.
          </p>
        </div>

        <button
          onClick={() =>
            navigate(
              `/defense?threat=${threatId}&persona=${persona}&foothold=${footholdId}&target=${targetId}`
            )
          }
          className="px-4 py-2 rounded-xl bg-[#FFF2EB] border border-[#FF5722]/40 text-[#FF5722] hover:bg-[#FFE5D6] text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer hover:scale-[1.02]"
        >
          <Sliders className="w-4 h-4" />
          TEST CONTROLS IN SANDBOX &rarr;
        </button>
      </div>

      {/* Scenario Builder Bar */}
      <div className="gsap-box p-4 rounded-xl bg-white border border-[#E5E7EB] grid grid-cols-5 gap-3.5 text-xs shadow-xs transition-all duration-200 hover:shadow-md">
        {/* Threat Vector */}
        <div>
          <label className="text-[10px] text-slate-500 uppercase font-semibold font-mono block mb-1">
            THREAT VECTOR
          </label>
          <select
            value={threatId}
            onChange={(e) => setThreatId(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-[#E5E7EB] text-slate-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#FF5722] font-semibold transition-colors"
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
          <label className="text-[10px] text-slate-500 uppercase font-semibold font-mono block mb-1">
            ATTACKER PERSONA
          </label>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-[#E5E7EB] text-slate-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#FF5722] font-semibold transition-colors"
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
          <label className="text-[10px] text-slate-500 uppercase font-semibold font-mono block mb-1">
            INITIAL FOOTHOLD
          </label>
          <select
            value={footholdId}
            onChange={(e) => setFootholdId(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-[#E5E7EB] text-slate-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#FF5722] font-semibold transition-colors"
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
          <label className="text-[10px] text-slate-500 uppercase font-semibold font-mono block mb-1">
            TARGET OBJECTIVE
          </label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-[#E5E7EB] text-slate-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#FF5722] font-semibold transition-colors"
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
            className="w-full py-2 px-3 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
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
      <div className="grid grid-cols-12 gap-4">
        {/* Topology View (2D Vector Canvas matching screenshot) */}
        <div className="gsap-box col-span-8 h-[450px] flex flex-col">
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
        <div className="gsap-box col-span-4 p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-3.5 shadow-xs flex flex-col justify-between h-[450px] overflow-y-auto transition-all duration-200 hover:shadow-md">
          <div className="space-y-3">
            <div className="text-xs text-slate-800 font-bold uppercase border-b border-slate-100 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-display">
                <Terminal className="w-3.5 h-3.5 text-[#FF5722]" />
                TELEMETRY & MITRE PREDICTOR
              </span>
              <span className="text-[10px] text-[#FF5722] font-mono bg-[#FFF2EB] px-1.5 py-0.5 rounded font-bold">
                STEP {activeStepIndex + 1}/{simulationTrace?.timeline.length || 1}
              </span>
            </div>

            {/* MITRE ATT&CK Next Move Prediction Callout */}
            {predictedNextHop ? (
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-300 space-y-2 shadow-xs transition-all hover:border-amber-400">
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
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-black text-xs shadow-xs">
                    {predictedNextHop.techniqueId}
                  </span>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {predictedNextHop.techniqueName}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-slate-500">Target Asset:</span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                    {predictedNextHop.targetId}
                  </span>
                </div>

                <div className="text-[10.5px] text-amber-900/80 leading-snug pt-0.5">
                  {predictedNextHop.explanation || "Anticipated adversary transition based on trust boundary topology and identity caching."}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Final objective reached or adversary path fully contained.</span>
              </div>
            )}

            {/* Current Step Telemetry Details */}
            {currentStep && (
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">CURRENT ACTION:</span>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                    {currentStep.technique_id} - {currentStep.phase}
                  </span>
                </div>

                <div className="text-xs text-slate-700 bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E5E7EB] leading-relaxed">
                  {currentStep.explanation}
                </div>

                {/* Progressive disclosure toggle for causal proof */}
                {currentStep.reason && currentStep.reason.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowProof(!showProof)}
                      className="text-[10.5px] text-[#FF5722] hover:text-[#E64A19] font-semibold flex items-center gap-1 cursor-pointer py-1"
                    >
                      <span>{showProof ? "Hide Causal Evidence" : "View Causal Evidence Proof"}</span>
                      {showProof ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {showProof && (
                      <div className="p-2 rounded bg-white border border-slate-200 text-[10px] space-y-1 mt-1 font-mono">
                        {currentStep.reason.map((r, i) => (
                          <div key={i} className="text-slate-600 flex items-start gap-1.5">
                            <span className="text-[#FF5722]">•</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Blast Radius & Effort Metrics */}
            {simulationTrace && (
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="text-[9.5px] text-slate-500 font-medium">BLAST RADIUS</div>
                  <div className="text-lg font-black text-red-600 font-display">
                    {simulationTrace.blast_radius_percent}%
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="text-[9.5px] text-slate-500 font-medium">ATTACKER EFFORT</div>
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
              <div className="text-[9.5px] text-slate-500 uppercase font-bold mb-1.5">
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
        <div className="gsap-box transition-all duration-200 hover:shadow-md">
          <TimelinePlayer
            timeline={simulationTrace.timeline}
            activeStepIndex={activeStepIndex}
            onStepChange={(idx) => setActiveStepIndex(idx)}
            onSelectEvidence={(eid) => navigate(`/evidence?id=${eid}`)}
          />
        </div>
      )}
    </div>
  );
};
