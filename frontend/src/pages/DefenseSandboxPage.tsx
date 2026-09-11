import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Sliders,
  ShieldCheck,
  Award,
  Play,
  Activity,
  CheckCircle2,
  Lock,
  Network,
  UserX,
  FileKey,
  Shield,
  RotateCcw,
} from "lucide-react";
import {
  api,
  WhatIfComparison,
  DigitalTwinTopology,
  ThreatVector,
  AttackerProfile,
} from "@/lib/api";
import { DecisionProofCard } from "@/components/DecisionProofCard";
import { useStaggerEntrance } from "@/lib/animations";

interface DefenseOption {
  id: string;
  control_type: string;
  name: string;
  description: string;
  target_scope: string[];
  icon: any;
  defaultEnabled: boolean;
}

const AVAILABLE_DEFENSES: DefenseOption[] = [
  {
    id: "DEF-SEGMENT-VAULT",
    control_type: "SEGMENT_NETWORK",
    name: "Air-Gap & Micro-Segment Backup Vault",
    description: "Sever all inbound SMB :445 & WinRM access to VAULT-BACKUP-01; restrict strictly to scheduled backup agent port.",
    target_scope: ["VAULT-BACKUP-01"],
    icon: Network,
    defaultEnabled: true,
  },
  {
    id: "DEF-MFA-ADMINS",
    control_type: "ENABLE_MFA",
    name: "Enforce Cryptographic FIDO2 MFA on Admin Sessions",
    description: "Require out-of-band hardware authentication on ID-DOMAIN-ADMIN, neutralizing pass-the-hash lateral pivots.",
    target_scope: ["ID-DOMAIN-ADMIN", "ID-ENG-DEV"],
    icon: Lock,
    defaultEnabled: true,
  },
  {
    id: "DEF-REVOKE-DELEGATION",
    control_type: "REVOKE_PRIVILEGE",
    name: "Purge Cached Admin Tokens from Engineering Endpoints",
    description: "Enforce Least Privilege on WS-ENG-04 and clear LSASS memory caches containing Domain Admin credentials.",
    target_scope: ["WS-ENG-04"],
    icon: UserX,
    defaultEnabled: false,
  },
  {
    id: "DEF-ISOLATE-WORKSTATION",
    control_type: "ISOLATE_HOST",
    name: "Automated Quarantine on Workstation Ingress",
    description: "Instantly sever all outbound network adapters on WS-ENG-04 once suspicious spearphishing payload executes.",
    target_scope: ["WS-ENG-04"],
    icon: Shield,
    defaultEnabled: false,
  },
];

export const DefenseSandboxPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [twin, setTwin] = useState<DigitalTwinTopology | null>(null);
  const [activeDefenses, setActiveDefenses] = useState<Record<string, boolean>>({
    "DEF-SEGMENT-VAULT": true,
    "DEF-MFA-ADMINS": true,
    "DEF-REVOKE-DELEGATION": false,
    "DEF-ISOLATE-WORKSTATION": false,
  });

  const threatId = searchParams.get("threat") || "THREAT-PHISH";
  const persona = searchParams.get("persona") || "RANSOMWARE";
  const footholdId = searchParams.get("foothold") || "WS-ENG-04";
  const targetId = searchParams.get("target") || "VAULT-BACKUP-01";

  const [comparison, setComparison] = useState<WhatIfComparison | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const containerRef = useStaggerEntrance(".gsap-box", [comparison?.decision_proof?.proof_id]);

  useEffect(() => {
    api.getTwin()
      .then((t) => {
        setTwin(t);
        runSandbox(activeDefenses);
      })
      .finally(() => setLoading(false));
  }, []);

  const runSandbox = async (currentDefenses: Record<string, boolean>) => {
    setIsSimulating(true);
    try {
      const selected = AVAILABLE_DEFENSES.filter((d) => currentDefenses[d.id]).map((d) => ({
        id: d.id,
        control_type: d.control_type,
        name: d.name,
        target_scope: d.target_scope,
        is_enabled: true,
      }));

      const res = await api.runWhatIf({
        threat_vector_id: threatId,
        attacker_persona: persona,
        initial_foothold_id: footholdId,
        target_objective_id: targetId,
        defenses: selected,
      });
      setComparison(res);
    } catch (err) {
      console.error("Defense Sandbox error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const toggleDefense = (defId: string) => {
    const updated = { ...activeDefenses, [defId]: !activeDefenses[defId] };
    setActiveDefenses(updated);
    runSandbox(updated);
  };

  if (loading || !twin) {
    return (
      <div className="flex items-center justify-center h-full font-mono text-[#FF5722]">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        CLONING IMMUTABLE DIGITAL TWIN SANDBOX...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6 font-sans select-none pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#FF5722]" />
              DEFENSE SANDBOX // VIRTUAL CONTROL VALIDATOR
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#FFF2EB] dark:bg-orange-950/60 text-[#FF5722] border border-[#FF5722]/30 text-[10px] font-bold font-mono">
              CORE USP
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Modify virtual controls in an immutable fork of the digital twin, re-simulate the adversary, and prove what stopped it.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => runSandbox(activeDefenses)}
            disabled={isSimulating}
            className="px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-4 h-4" />
            {isSimulating ? "RE-SIMULATING..." : "RE-SIMULATE ATTACK"}
          </button>
        </div>
      </div>

      {/* Scenario Parameters Bar */}
      <div className="gsap-box p-4 rounded-xl bg-white dark:bg-[#0C0E14] border border-[#E5E7EB] dark:border-[#171B26] flex items-center justify-between text-xs text-slate-800 dark:text-slate-200 shadow-xs transition-all duration-200 hover:shadow-md">
        <div className="flex items-center gap-6 font-mono text-xs">
          <div>
            THREAT: <span className="text-[#FF5722] font-bold">{threatId}</span>
          </div>
          <div>
            ADVERSARY: <span className="text-red-600 dark:text-red-400 font-bold">{persona}</span>
          </div>
          <div>
            FOOTHOLD: <span className="text-slate-900 dark:text-white font-bold">{footholdId}</span>
          </div>
          <div>
            TARGET: <span className="text-slate-900 dark:text-white font-bold">{targetId}</span>
          </div>
        </div>

        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          BASELINE ENVIRONMENT IMMUTABLE & UNTOUCHED
        </span>
      </div>

      {/* Main Grid: Defense Controls Selection (Left) + Live Decision Proof (Right) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Virtual Control Toggles */}
        <div className="gsap-box col-span-5 space-y-3">
          <div className="text-xs text-slate-500 uppercase tracking-wider flex items-center justify-between font-semibold">
            <span>TOGGLE VIRTUAL DEFENSIVE CONTROLS</span>
            <span className="text-[#FF5722] text-[10px] font-mono font-bold">
              {Object.values(activeDefenses).filter(Boolean).length} ACTIVE
            </span>
          </div>

          <div className="space-y-2.5">
            {AVAILABLE_DEFENSES.map((def) => {
              const isEnabled = activeDefenses[def.id];
              const Icon = def.icon;
              return (
                <div
                  key={def.id}
                  onClick={() => toggleDefense(def.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all shadow-xs hover:scale-[1.01] active:scale-[0.99] ${
                    isEnabled
                      ? "bg-[#FFF5EE] dark:bg-orange-950/20 border-[#FFCCBA] dark:border-[#FF5722]/40 text-slate-900 dark:text-white"
                      : "bg-white dark:bg-[#0C0E14] border-[#E5E7EB] dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isEnabled ? "text-[#FF5722]" : "text-slate-400"}`} />
                      <span className={`text-xs font-bold ${isEnabled ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                        {def.name}
                      </span>
                    </div>

                    <span
                      className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                        isEnabled
                          ? "bg-[#FF5722] text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {isEnabled ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{def.description}</p>
                  <div className="mt-2 text-[10px] text-[#FF5722] font-mono font-semibold">
                    SCOPE: {def.target_scope.join(", ")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Decision Proof & Before vs After Diff */}
        <div className="gsap-box col-span-7 space-y-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider flex items-center justify-between font-semibold">
            <span>DECISION PROOF OUTPUT (CORE USP)</span>
            {isSimulating && (
              <span className="text-[#FF5722] text-[11px] flex items-center gap-1 font-mono animate-pulse">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                CALCULATING PATH ELIMINATIONS...
              </span>
            )}
          </div>

          {comparison ? (
            <DecisionProofCard proof={comparison.decision_proof} />
          ) : (
            <div className="p-12 rounded-xl bg-white dark:bg-[#0C0E14] border border-[#E5E7EB] dark:border-slate-800 text-center text-xs text-slate-400 shadow-xs">
              Toggle virtual controls on the left to generate the Decision Proof.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

