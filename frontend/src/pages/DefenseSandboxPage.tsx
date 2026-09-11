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
import { motion, StaggerGroup, AnimatedCard, EASE } from "@/lib/animations";

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
        <span className="text-[11px] font-mono text-[#A1A1AA]">Cloning immutable sandbox...</span>
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
          <div>
            <span className="text-xl font-bold tracking-tight text-[#18181B] dark:text-white font-display">
              Defense Sandbox
            </span>
          </div>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Modify virtual controls in an immutable fork, re-simulate the adversary, and prove what stopped it.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => runSandbox(activeDefenses)}
            disabled={isSimulating}
            className="px-4 py-2 rounded-2xl bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {isSimulating ? "RE-SIMULATING..." : "RE-SIMULATE ATTACK"}
          </button>
        </div>
      </motion.div>

      {/* Scenario Parameters Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A] flex items-center justify-between text-xs text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-6 font-mono text-xs">
          <div>
            THREAT: <span className="text-[#F25C1F] dark:text-[#FF6B3D] font-bold">{threatId}</span>
          </div>
          <div>
            ADVERSARY: <span className="text-red-600 dark:text-red-400 font-bold">{persona}</span>
          </div>
          <div>
            FOOTHOLD: <span className="text-[#18181B] dark:text-white font-bold">{footholdId}</span>
          </div>
          <div>
            TARGET: <span className="text-[#18181B] dark:text-white font-bold">{targetId}</span>
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
        <div className="col-span-5 space-y-3">
          <div className="text-[14px] text-[#71717A] uppercase tracking-wider flex items-center justify-between font-bold">
            <span>TOGGLE VIRTUAL DEFENSIVE CONTROLS</span>
            <span className="text-[#F25C1F] dark:text-[#FF6B3D] text-[10px] font-mono font-bold">
              {Object.values(activeDefenses).filter(Boolean).length} ACTIVE
            </span>
          </div>

          <StaggerGroup className="space-y-2.5">
            {AVAILABLE_DEFENSES.map((def) => {
              const isEnabled = activeDefenses[def.id];
              const Icon = def.icon;
              return (
                <AnimatedCard
                  key={def.id}
                  onClick={() => toggleDefense(def.id)}
                  hover
                  hoverY={-3}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isEnabled
                      ? "bg-[#FFF4ED] dark:bg-orange-950/20 border-[#FFCCBA] dark:border-[#FF5722]/40 text-[#18181B] dark:text-white"
                      : "bg-white dark:bg-[#131316] border-[#ECECEF] dark:border-slate-800 text-[#71717A] dark:text-[#A1A1AA] hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isEnabled ? "text-[#F25C1F] dark:text-[#FF6B3D]" : "text-[#A1A1AA]"}`} />
                      <span className={`text-xs font-bold ${isEnabled ? "text-[#18181B] dark:text-white" : "text-[#71717A] dark:text-[#A1A1AA]"}`}>
                        {def.name}
                      </span>
                    </div>

                    <span
                      className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                        isEnabled
                          ? "bg-[#FF5722] text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-[#71717A] dark:text-[#A1A1AA] border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {isEnabled ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">{def.description}</p>
                  <div className="mt-2 text-[10px] text-[#F25C1F] dark:text-[#FF6B3D] font-mono font-semibold">
                    SCOPE: {def.target_scope.join(", ")}
                  </div>
                </AnimatedCard>
              );
            })}
          </StaggerGroup>
        </div>

        {/* Right Column: Live Decision Proof & Before vs After Diff */}
        <div className="col-span-7 space-y-8">
          <div className="text-[14px] text-[#71717A] uppercase tracking-wider flex items-center justify-between font-bold">
            <span>DECISION PROOF OUTPUT (CORE USP)</span>
            {isSimulating && (
              <span className="text-[#F25C1F] dark:text-[#FF6B3D] text-[11px] flex items-center gap-1 font-mono animate-pulse">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                CALCULATING PATH ELIMINATIONS...
              </span>
            )}
          </div>

          {comparison ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <DecisionProofCard proof={comparison.decision_proof} />
            </motion.div>
          ) : (
            <div className="p-12 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800 text-center text-xs text-[#A1A1AA]">
              Toggle virtual controls on the left to generate the Decision Proof.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

