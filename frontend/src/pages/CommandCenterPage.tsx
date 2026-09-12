import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Target,
  TrendingUp,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  Lock,
  Flame,
  ExternalLink,
  ChevronRight,
  Crosshair,
  Server,
  Database,
  Key,
  Compass,
  Play,
  CheckCircle2,
  Sliders,
  FileText,
  Clock,
  Sparkles,
  Info,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Tactical3DScene, PredictedNextHop } from "@/components/Tactical3DScene";
import {
  api,
  HealthResponse,
  DigitalTwinTopology,
  ThreatVector,
  RemediationPriority,
  ResilienceScoreResult,
  Asset,
} from "@/lib/api";
import { EASE } from "@/lib/animations";

// ── GSAP Counter Component ──────────────────────────────────────────
const GSAPCounter: React.FC<{
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}> = ({ value, suffix = "", prefix = "", decimals = 0, duration = 1.2, className = "" }) => {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = spanRef.current;
    if (!node) return;

    const proxy = { val: 0 };
    const tween = gsap.to(proxy, {
      val: value,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        if (node) {
          node.innerText = `${prefix}${proxy.val.toFixed(decimals)}${suffix}`;
        }
      },
    });

    return () => {
      tween.kill();
    };
  }, [value, suffix, prefix, decimals, duration]);

  return <span ref={spanRef} className={className}>{`${prefix}${value.toFixed(decimals)}${suffix}`}</span>;
};

export const CommandCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [twin, setTwin] = useState<DigitalTwinTopology | null>(null);
  const [threats, setThreats] = useState<ThreatVector[]>([]);
  const [remediations, setRemediations] = useState<RemediationPriority[]>([]);
  const [resilience, setResilience] = useState<ResilienceScoreResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Interactive Scenario Presets for 3D Digital Twin
  const [scenarioMode, setScenarioMode] = useState<"DEFAULT" | "RANSOMWARE" | "CROWN_JEWELS" | "BLAST_PERIMETER">("DEFAULT");
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>(undefined);

  // GSAP Container Refs
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const factorBarsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.allSettled([
      api.getHealth(),
      api.getTwin(),
      api.getThreatVectors(),
      api.getRemediationPriorities(),
      api.getResilience(),
    ]).then((results) => {
      if (results[0].status === "fulfilled") setHealth(results[0].value);
      if (results[1].status === "fulfilled") setTwin(results[1].value);
      if (results[2].status === "fulfilled") setThreats(results[2].value);
      if (results[3].status === "fulfilled") setRemediations(results[3].value);
      if (results[4].status === "fulfilled") setResilience(results[4].value);
      setLoading(false);
    });
  }, []);

  // GSAP Entrance Animations
  useEffect(() => {
    if (loading || !pageContainerRef.current) return;

    const ctx = gsap.context(() => {
      // Stagger entrance of all cards
      gsap.fromTo(
        ".gsap-card",
        { opacity: 0, y: 22, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.07,
          ease: "power2.out",
          clearProps: "transform",
        }
      );

      // Pulse animation for LIVE badge
      gsap.to(".gsap-live-pulse", {
        scale: 1.4,
        opacity: 0,
        repeat: -1,
        duration: 1.6,
        ease: "power1.out",
      });

      // Factor bars animation
      if (factorBarsRef.current) {
        const bars = factorBarsRef.current.querySelectorAll(".gsap-factor-bar");
        bars.forEach((bar) => {
          const targetW = bar.getAttribute("data-width") || "0%";
          gsap.fromTo(
            bar,
            { width: "0%" },
            {
              width: targetW,
              duration: 1.2,
              delay: 0.3,
              ease: "power3.out",
            }
          );
        });
      }
    }, pageContainerRef);

    return () => ctx.revert();
  }, [loading]);


  // Calculated Metrics
  const assetCount = health?.assets_loaded ?? twin?.assets.length ?? 12;
  const criticalThreats = threats.filter((t) => t.severity === "CRITICAL" || t.severity === "HIGH");
  const topRemediations = remediations.slice(0, 4);

  const resilienceScore = Math.round(resilience?.resilience_score ?? 36);
  // Strictly Orange styling palette
  const resilienceColor = "#F25C1F";

  // Crown Jewels in Topology
  const crownJewels = useMemo(() => {
    if (!twin?.assets) {
      return [
        { id: "VAULT-BACKUP-01", name: "Immutable Ransomware Backup Vault", zone: "SECURE_TIER", hops: 3, risk: "CRITICAL", cvss: 9.8, isolated: false },
        { id: "DB-PROD-01", name: "Primary Customer Financial Database", zone: "SECURE_TIER", hops: 3, risk: "CRITICAL", cvss: 8.8, isolated: false },
        { id: "DC-CORP-01", name: "Corporate Active Directory Domain Controller", zone: "CORPORATE_LAN", hops: 2, risk: "HIGH", cvss: 8.8, isolated: false },
      ];
    }
    const cj = twin.assets.filter((a) => a.criticality === "CRITICAL" || a.id.includes("VAULT") || a.id.includes("DB-PROD") || a.id.includes("DC-CORP"));
    return cj.map((asset) => ({
      id: asset.id,
      name: asset.name,
      zone: asset.zone,
      hops: asset.id === "DC-CORP-01" ? 2 : 3,
      risk: asset.criticality,
      cvss: asset.vulnerabilities?.[0]?.cvss_score ?? 8.5,
      isolated: false,
    }));
  }, [twin]);

  // Total CVE Count
  const totalCVEs = useMemo(() => {
    if (!twin?.assets) return 14;
    return twin.assets.reduce((acc, a) => acc + (a.vulnerabilities?.length || 0), 0) || 14;
  }, [twin]);

  // Active Attack Scenarios Setup
  const scenarioConfig = useMemo(() => {
    switch (scenarioMode) {
      case "RANSOMWARE":
        return {
          highlightPath: ["EXT-INTERNET", "FW-EDGE-01", "WS-ENG-04", "DC-CORP-01", "VAULT-BACKUP-01"],
          compromisedNodes: ["EXT-INTERNET", "FW-EDGE-01", "WS-ENG-04"],
          activeStepNode: "DC-CORP-01",
          predictedNextHop: {
            sourceId: "DC-CORP-01",
            targetId: "VAULT-BACKUP-01",
            techniqueName: "T1486 Data Encrypted for Impact",
            phase: "IMPACT",
            confidence: 94,
            explanation: "Active Directory administrative trust leveraged to access offline replica volume",
          } as PredictedNextHop,
          selectedAssetId: selectedAssetId || "VAULT-BACKUP-01",
        };
      case "CROWN_JEWELS":
        return {
          highlightPath: ["DB-PROD-01", "VAULT-BACKUP-01", "DC-CORP-01"],
          compromisedNodes: [],
          activeStepNode: undefined,
          predictedNextHop: null,
          selectedAssetId: selectedAssetId || "VAULT-BACKUP-01",
        };
      case "BLAST_PERIMETER":
        return {
          highlightPath: ["WS-ENG-04", "APP-SRV-01", "DC-CORP-01", "CLOUD-K8S-01"],
          compromisedNodes: ["WS-ENG-04", "APP-SRV-01"],
          activeStepNode: "WS-ENG-04",
          predictedNextHop: null,
          selectedAssetId: selectedAssetId || "WS-ENG-04",
        };
      default:
        return {
          highlightPath: undefined,
          compromisedNodes: undefined,
          activeStepNode: undefined,
          predictedNextHop: null,
          selectedAssetId: selectedAssetId,
        };
    }
  }, [scenarioMode, selectedAssetId]);

  // Selected Node Details
  const selectedNodeData = useMemo(() => {
    if (!selectedAssetId || !twin?.assets) return null;
    return twin.assets.find((a) => a.id === selectedAssetId) || null;
  }, [selectedAssetId, twin]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[650px] gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#F25C1F]/20 border-t-[#F25C1F] dark:border-t-[#FF6B3D] animate-spin" />
          <Shield className="w-5 h-5 text-[#F25C1F] dark:text-[#FF6B3D] absolute" />
        </div>
        <div className="text-center space-y-1">
          <div className="text-[14px] font-semibold tracking-tight font-brand">RAKSHASTRA</div>
          <div className="text-[12px] font-mono text-[#A1A1AA]">Synthesizing graph topology & resilience telemetry...</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageContainerRef} className="max-w-7xl mx-auto space-y-7 pb-16 pt-1">
      {/* ── TOP HEADER: RAKSHASTRA IN BRAND FONT & ACTIONS ───────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#ECECEF] dark:border-[#25252A]">
        <div>
          <div className="flex items-center gap-3.5 flex-wrap">
            <span className="font-brand text-[30px] sm:text-[34px] tracking-tight text-[#18181B] dark:text-white leading-none">
              RAKSHASTRA
            </span>
            <span className="text-[15px] font-bold font-display text-[#71717A] dark:text-[#9B9BA4]">
              &middot; Command Center
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#F25C1F]/10 text-[#F25C1F] dark:text-[#FF6B3D] border border-[#F25C1F]/25">
              <span className="relative flex h-2 w-2">
                <span className="gsap-live-pulse absolute inline-flex h-full w-full rounded-full bg-[#F25C1F] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F25C1F]" />
              </span>
              DIGITAL TWIN LIVE
            </div>
            <span className="text-[12px] font-mono text-[#A1A1AA] hidden sm:inline">
              SNAP: {twin?.snapshot_id || "snapshot_001"}
            </span>
          </div>
          <p className="text-[13px] text-[#71717A] dark:text-[#9B9BA4] mt-1">
            Real-time deterministic graph model &middot; {assetCount} interconnected assets &middot; 16 attack trajectories
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/simulation"
            className="px-3.5 py-2 rounded-xl bg-[#F25C1F] hover:bg-[#E04B0E] dark:bg-[#FF6B3D] dark:hover:bg-[#FF5520] text-white text-[12px] font-semibold flex items-center gap-2 shadow-sm transition-all shadow-[#F25C1F]/20 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run Attack Simulation
          </Link>
          <Link
            to="/defense"
            className="px-3.5 py-2 rounded-xl bg-[#18181B] dark:bg-white dark:text-[#18181B] text-white text-[12px] font-semibold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5" />
            What-If Sandbox
          </Link>
        </div>
      </div>


      {/* ── DIGITAL TWIN INTERACTIVE 3D TOPOLOGY CANVAS & SCENARIO CONTROL ─ */}
      <div className="gsap-card card-border overflow-hidden">
        {/* Canvas Toolbar & Scenario Switcher */}
        <div className="p-4 border-b border-[#ECECEF] dark:border-[#25252A] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FAFAFA]/70 dark:bg-[#131316]/70 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-[#F25C1F]/10 text-[#F25C1F] dark:text-[#FF6B3D]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[14px] font-bold font-display text-[#18181B] dark:text-[#FAFAFA] flex items-center gap-2">
                Digital Twin Topology
                <span className="text-[11px] font-mono font-normal text-[#A1A1AA]">
                  ({assetCount} Nodes &middot; 16 Direct Trust Routes)
                </span>
              </div>
              <p className="text-[12px] text-[#71717A] dark:text-[#9B9BA4]">
                Spatial cyber environment model with directional reachability and real-time lateral propagation physics
              </p>
            </div>
          </div>

          {/* Scenario Mode Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#ECECEF]/60 dark:bg-[#1A1A1E] p-1 rounded-xl flex-wrap">
            <button
              onClick={() => {
                setScenarioMode("DEFAULT");
                setSelectedAssetId(undefined);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                scenarioMode === "DEFAULT"
                  ? "bg-white dark:bg-[#25252A] text-[#18181B] dark:text-white shadow-xs font-bold"
                  : "text-[#71717A] dark:text-[#9B9BA4] hover:text-[#18181B] dark:hover:text-white"
              }`}
            >
              Full Graph
            </button>
            <button
              onClick={() => {
                setScenarioMode("RANSOMWARE");
                setSelectedAssetId("VAULT-BACKUP-01");
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                scenarioMode === "RANSOMWARE"
                  ? "bg-[#F25C1F] text-white shadow-xs font-bold"
                  : "text-[#F25C1F] hover:bg-[#F25C1F]/10"
              }`}
            >
              <Flame className="w-3 h-3" />
              Ransomware Breach Path
            </button>
            <button
              onClick={() => {
                setScenarioMode("CROWN_JEWELS");
                setSelectedAssetId("DB-PROD-01");
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                scenarioMode === "CROWN_JEWELS"
                  ? "bg-[#FF6B3D] text-white shadow-xs font-bold"
                  : "text-[#FF6B3D] hover:bg-[#FF6B3D]/10"
              }`}
            >
              <Lock className="w-3 h-3" />
              Crown Jewels
            </button>
            <button
              onClick={() => {
                setScenarioMode("BLAST_PERIMETER");
                setSelectedAssetId("WS-ENG-04");
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                scenarioMode === "BLAST_PERIMETER"
                  ? "bg-[#E04B0E] text-white shadow-xs font-bold"
                  : "text-[#E04B0E] hover:bg-[#E04B0E]/10"
              }`}
            >
              <Compass className="w-3 h-3" />
              Blast Perimeter
            </button>
          </div>
        </div>

        {/* 3D Scene Rendering */}
        <div className="relative">
          <Tactical3DScene
            height="h-[440px]"
            assets={twin?.assets}
            relationships={twin?.relationships}
            highlightPath={scenarioConfig.highlightPath}
            compromisedNodes={scenarioConfig.compromisedNodes}
            activeStepNode={scenarioConfig.activeStepNode}
            predictedNextHop={scenarioConfig.predictedNextHop}
            selectedAssetId={scenarioConfig.selectedAssetId}
            onSelectAsset={(node) => {
              setSelectedAssetId(node.id);
            }}
          />

          {/* Node Quick Inspector Drawer overlay if a node is clicked */}
          {selectedNodeData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 p-3.5 rounded-xl bg-white/95 dark:bg-[#131316]/95 backdrop-blur-md border border-[#ECECEF] dark:border-[#25252A] shadow-xl z-20 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F25C1F]" />
                  <span className="text-[13px] font-bold font-mono text-[#18181B] dark:text-[#FAFAFA]">
                    {selectedNodeData.id}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F25C1F]/15 text-[#F25C1F]">
                  {selectedNodeData.criticality}
                </span>
              </div>

              <div className="text-[12px] text-[#71717A] dark:text-[#9B9BA4] font-medium leading-snug">
                {selectedNodeData.name}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 border-t border-[#ECECEF] dark:border-[#25252A]">
                <div>
                  <span className="text-[#A1A1AA] block text-[10px]">ZONE</span>
                  <span className="text-[#18181B] dark:text-white font-semibold">{selectedNodeData.zone}</span>
                </div>
                <div>
                  <span className="text-[#A1A1AA] block text-[10px]">IP ADDRESS</span>
                  <span className="text-[#18181B] dark:text-white">{selectedNodeData.ip_address}</span>
                </div>
                <div>
                  <span className="text-[#A1A1AA] block text-[10px]">SERVICES</span>
                  <span className="text-[#18181B] dark:text-white truncate block">
                    {selectedNodeData.services.slice(0, 2).join(", ") || "None"}
                  </span>
                </div>
                <div>
                  <span className="text-[#A1A1AA] block text-[10px]">VULNERABILITIES</span>
                  <span className="text-[#F25C1F] font-semibold">{selectedNodeData.vulnerabilities?.length || 0} CVEs</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  to={`/twin?selected=${selectedNodeData.id}`}
                  className="flex-1 text-center py-1.5 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] text-[11px] font-semibold hover:opacity-90 transition-opacity"
                >
                  Inspect in Twin
                </Link>
                <Link
                  to={`/blast-radius?asset=${selectedNodeData.id}`}
                  className="px-2.5 py-1.5 rounded-lg border border-[#ECECEF] dark:border-[#25252A] text-[11px] font-semibold hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1E] transition-colors"
                >
                  Blast Radius
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── HIGH-DENSITY EXECUTIVE TELEMETRY KPI STRIP (ONLY ORANGE PALETTE) ─── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Posture Score */}
        <div className="gsap-card card-border p-4 relative overflow-hidden group hover:border-[#F25C1F]/60 dark:hover:border-[#FF6B3D]/60 transition-all duration-300">
          <div className="flex items-center justify-between text-[#71717A] dark:text-[#9B9BA4] mb-1.5">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Resilience Index</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#F25C1F] dark:text-[#FF6B3D]" />
          </div>
          <div className="flex items-baseline gap-2">
            <GSAPCounter
              value={resilienceScore}
              suffix="/100"
              className="text-[26px] font-extrabold font-display text-[#18181B] dark:text-[#FAFAFA]"
            />
            <span
              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F25C1F]/15 text-[#F25C1F] dark:text-[#FF6B3D]"
            >
              {resilience?.posture_rating || "FRAGILE"}
            </span>
          </div>
          <div className="text-[11px] text-[#A1A1AA] mt-1.5 flex items-center gap-1">
            <span className="text-[#F25C1F] font-semibold">&minus;14%</span> vs healthy baseline
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F25C1F]" />
        </div>

        {/* Viable Attack Trajectories */}
        <div className="gsap-card card-border p-4 relative overflow-hidden group hover:border-[#F25C1F]/60 dark:hover:border-[#FF6B3D]/60 transition-all duration-300">
          <div className="flex items-center justify-between text-[#71717A] dark:text-[#9B9BA4] mb-1.5">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Active Trajectories</span>
            <Crosshair className="w-3.5 h-3.5 text-[#FF6B3D]" />
          </div>
          <div className="flex items-baseline gap-2">
            <GSAPCounter
              value={16}
              className="text-[26px] font-extrabold font-display text-[#18181B] dark:text-[#FAFAFA]"
            />
            <span className="text-[11px] font-medium text-[#71717A] dark:text-[#9B9BA4]">Reachable Paths</span>
          </div>
          <div className="text-[11px] text-[#A1A1AA] mt-1.5 flex items-center gap-1">
            <span className="text-[#F25C1F] font-semibold">5 Critical</span> &middot; Avg 2.8 hops
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF6B3D]" />
        </div>

        {/* Crown Jewels At Risk */}
        <div className="gsap-card card-border p-4 relative overflow-hidden group hover:border-[#F25C1F]/60 dark:hover:border-[#FF6B3D]/60 transition-all duration-300">
          <div className="flex items-center justify-between text-[#71717A] dark:text-[#9B9BA4] mb-1.5">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Crown Jewels</span>
            <Database className="w-3.5 h-3.5 text-[#F25C1F]" />
          </div>
          <div className="flex items-baseline gap-2">
            <GSAPCounter
              value={crownJewels.length}
              className="text-[26px] font-extrabold font-display text-[#18181B] dark:text-[#FAFAFA]"
            />
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F25C1F]/20 text-[#F25C1F] dark:text-[#FF6B3D]">
              EXPOSED
            </span>
          </div>
          <div className="text-[11px] text-[#A1A1AA] mt-1.5 flex items-center gap-1">
            Vault, DB-Prod, Domain Ctr
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E04B0E]" />
        </div>

        {/* Chokepoint Leverage */}
        <div className="gsap-card card-border p-4 relative overflow-hidden group hover:border-[#F25C1F]/60 dark:hover:border-[#FF6B3D]/60 transition-all duration-300">
          <div className="flex items-center justify-between text-[#71717A] dark:text-[#9B9BA4] mb-1.5">
            <span className="text-[11px] font-semibold tracking-wide uppercase">Chokepoints</span>
            <Zap className="w-3.5 h-3.5 text-[#F25C1F]" />
          </div>
          <div className="flex items-baseline gap-2">
            <GSAPCounter
              value={82}
              suffix="%"
              className="text-[26px] font-extrabold font-display text-[#18181B] dark:text-[#FAFAFA]"
            />
            <span className="text-[11px] font-medium text-[#71717A] dark:text-[#9B9BA4]">Severance</span>
          </div>
          <div className="text-[11px] text-[#A1A1AA] mt-1.5 flex items-center gap-1">
            <span className="text-[#F25C1F] font-semibold">2 Controls</span> cut 82% paths
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF8A50]" />
        </div>

        {/* CVE Vulnerability Density */}
        <div className="gsap-card card-border p-4 relative overflow-hidden group hover:border-[#F25C1F]/60 dark:hover:border-[#FF6B3D]/60 transition-all duration-300 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-[#71717A] dark:text-[#9B9BA4] mb-1.5">
            <span className="text-[11px] font-semibold tracking-wide uppercase">CVE Density</span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#F25C1F]" />
          </div>
          <div className="flex items-baseline gap-2">
            <GSAPCounter
              value={totalCVEs}
              className="text-[26px] font-extrabold font-display text-[#18181B] dark:text-[#FAFAFA]"
            />
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F25C1F] text-white">
              MAX 9.8
            </span>
          </div>
          <div className="text-[11px] text-[#A1A1AA] mt-1.5 flex items-center gap-1">
            <span className="text-[#F25C1F] font-semibold">4 RCE</span> &middot; 3 unpatched
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F25C1F]" />
        </div>
      </div>

      {/* ── MIDDLE GRID: RESILIENCE FACTOR RADAR & CROWN JEWEL MATRIX ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left 6 cols: Deep Resilience Multi-Factor Diagnostic (Orange Palette) */}
        <div className="lg:col-span-6 gsap-card card-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#F25C1F]/10 text-[#F25C1F] dark:text-[#FF6B3D]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-[#18181B] dark:text-[#FAFAFA]">
                    Resilience Multi-Factor Diagnostics
                  </h2>
                  <p className="text-[12px] text-[#71717A] dark:text-[#9B9BA4]">
                    Deterministic evaluation of defense redundancy & privilege choke points
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full flex-shrink-0 bg-[#F25C1F]/15 text-[#F25C1F] dark:text-[#FF6B3D]">
                {resilience?.posture_rating || "FRAGILE"}
              </span>
            </div>

            {/* Overall Score Dial + Factor Progress Bars */}
            <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
              {/* Radial SVG Dial */}
              <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#F5F5F5"
                    className="dark:stroke-[#1A1A1E]"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={resilienceColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: 2 * Math.PI * 40, strokeDashoffset: 2 * Math.PI * 40 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - resilienceScore / 100) }}
                    transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <GSAPCounter
                    value={resilienceScore}
                    className="text-[28px] font-extrabold font-display leading-none text-[#18181B] dark:text-[#FAFAFA]"
                  />
                  <span className="text-[9px] font-mono text-[#A1A1AA] uppercase tracking-wider mt-0.5">Score</span>
                </div>
              </div>

              {/* Factor Breakdown Bars with GSAP animation (All Orange Shades) */}
              <div ref={factorBarsRef} className="flex-1 w-full space-y-2.5">
                {[
                  {
                    name: "Path Redundancy",
                    score: resilience?.factor_breakdown.path_redundancy_score ?? 15,
                    color: "#F25C1F",
                    status: "Severe Gap",
                  },
                  {
                    name: "Chokepoint Mitigation",
                    score: resilience?.factor_breakdown.chokepoint_mitigation_score ?? 75,
                    color: "#FF6B3D",
                    status: "Strong",
                  },
                  {
                    name: "Control Density",
                    score: resilience?.factor_breakdown.control_density_score ?? 38,
                    color: "#E04B0E",
                    status: "Suboptimal",
                  },
                  {
                    name: "Depth of Defense",
                    score: resilience?.factor_breakdown.depth_defense_score ?? 42,
                    color: "#FF8A50",
                    status: "Moderate",
                  },
                  {
                    name: "Privilege Tiering",
                    score: resilience?.factor_breakdown.privilege_tiering_score ?? 0,
                    color: "#C23800",
                    status: "Critical Hazard",
                  },
                ].map((f) => (
                  <div key={f.name} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#71717A] dark:text-[#9B9BA4] font-medium">{f.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#A1A1AA] font-mono">{f.status}</span>
                        <span className="font-mono font-bold text-[#18181B] dark:text-[#FAFAFA]">
                          {f.score.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-[#F5F5F5] dark:bg-[#1A1A1E] rounded-full overflow-hidden">
                      <div
                        className="gsap-factor-bar h-full rounded-full"
                        data-width={`${f.score}%`}
                        style={{ backgroundColor: f.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#ECECEF] dark:border-[#25252A] flex items-center justify-between text-[12px]">
            <span className="text-[#71717A] dark:text-[#9B9BA4] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#F25C1F]" />
              Primary Vulnerability: Unrestricted Active Directory RPC lateral movement
            </span>
            <Link
              to="/blast-radius"
              className="text-[#F25C1F] dark:text-[#FF6B3D] font-semibold hover:underline flex items-center gap-1 flex-shrink-0 ml-2"
            >
              Analyze Blast Radius <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right 6 cols: Crown Jewels Defense & Isolation Status (Orange Accents) */}
        <div className="lg:col-span-6 gsap-card card-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#F25C1F]/10 text-[#F25C1F] dark:text-[#FF6B3D]">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-[#18181B] dark:text-[#FAFAFA]">
                    Crown Jewels Exposure Matrix
                  </h2>
                  <p className="text-[12px] text-[#71717A] dark:text-[#9B9BA4]">
                    Tier-0 assets with shortest attacker distance from internet boundary
                  </p>
                </div>
              </div>
              <Link
                to="/paths"
                className="text-[12px] text-[#F25C1F] dark:text-[#FF6B3D] hover:underline font-semibold flex items-center gap-1"
              >
                Attack Paths <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List of Crown Jewels */}
            <div className="space-y-2.5">
              {crownJewels.map((cj) => (
                <div
                  key={cj.id}
                  onClick={() => {
                    setSelectedAssetId(cj.id);
                    setScenarioMode("CROWN_JEWELS");
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedAssetId === cj.id
                      ? "border-[#F25C1F] bg-[#F25C1F]/5 dark:bg-[#F25C1F]/10"
                      : "border-[#ECECEF] dark:border-[#25252A] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1E]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#F25C1F]/15 text-[#F25C1F] dark:text-[#FF6B3D] flex items-center justify-center flex-shrink-0">
                      {cj.id.includes("VAULT") ? (
                        <Server className="w-4 h-4" />
                      ) : cj.id.includes("DB") ? (
                        <Database className="w-4 h-4" />
                      ) : (
                        <Key className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold font-mono text-[#18181B] dark:text-[#FAFAFA]">
                          {cj.id}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#ECECEF] dark:bg-[#25252A] text-[#71717A] dark:text-[#9B9BA4]">
                          {cj.zone}
                        </span>
                      </div>
                      <div className="text-[12px] text-[#71717A] dark:text-[#9B9BA4] truncate">{cj.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 text-right font-mono">
                    <div>
                      <div className="text-[11px] text-[#F25C1F] font-bold">{cj.hops} hops to breach</div>
                      <div className="text-[10px] text-[#A1A1AA]">CVSS {cj.cvss} exposed</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#A1A1AA]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#ECECEF] dark:border-[#25252A] flex items-center justify-between text-[12px]">
            <span className="text-[#A1A1AA]">
              Zero-Trust Status: <strong className="text-[#F25C1F]">Unsegmented</strong>
            </span>
            <Link
              to="/defense"
              className="text-[#F25C1F] dark:text-[#FF6B3D] font-semibold hover:underline flex items-center gap-1"
            >
              Simulate Isolation Control <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── LOWER GRID: THREAT INTELLIGENCE & REMEDIATION ROI (ORANGE PALETTE) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left 6 cols: Critical Threat Vectors & Kill Chain */}
        <div className="lg:col-span-6 gsap-card card-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#F25C1F]/10 text-[#F25C1F] dark:text-[#FF6B3D]">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-[#18181B] dark:text-[#FAFAFA]">
                    Prioritized Threat Vectors
                  </h2>
                  <p className="text-[12px] text-[#71717A] dark:text-[#9B9BA4]">
                    Weaponized exploit paths mapped against MITRE ATT&CK killchain
                  </p>
                </div>
              </div>
              <Link
                to="/threat-vectors"
                className="text-[12px] text-[#F25C1F] dark:text-[#FF6B3D] hover:underline font-semibold flex items-center gap-1"
              >
                View all ({threats.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Threat List */}
            <div className="space-y-2.5">
              {criticalThreats.slice(0, 4).map((t) => {
                const isCrit = t.severity === "CRITICAL";
                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-[#ECECEF] dark:border-[#25252A] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1E] transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          isCrit ? "bg-[#F25C1F] shadow-xs shadow-[#F25C1F]" : "bg-[#FF8A50]"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-[#18181B] dark:text-[#FAFAFA] truncate">
                          {t.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-[#A1A1AA]">
                          <span>{t.id}</span>
                          <span>&middot;</span>
                          <span className="text-[#F25C1F] dark:text-[#FF6B3D]">
                            {t.category || t.entry_mechanism}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isCrit
                            ? "bg-[#F25C1F] text-white"
                            : "bg-[#F25C1F]/20 text-[#F25C1F] dark:text-[#FF6B3D]"
                        }`}
                      >
                        {t.severity}
                      </span>
                      <Link
                        to={`/simulation?vector=${t.id}`}
                        className="p-1.5 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] opacity-80 group-hover:opacity-100 transition-opacity"
                        title="Simulate this threat vector"
                      >
                        <Play className="w-3 h-3 fill-current" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kill Chain Pipeline Overview (Orange Shades) */}
          <div className="pt-4 mt-3 border-t border-[#ECECEF] dark:border-[#25252A]">
            <div className="text-[11px] font-semibold text-[#71717A] dark:text-[#9B9BA4] uppercase tracking-wider mb-2">
              MITRE ATT&CK Kill Chain Containment
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
              <div className="p-1.5 rounded bg-[#F25C1F]/25 text-[#F25C1F] dark:text-[#FF6B3D] font-bold">
                INITIAL ACCESS
                <div className="text-[9px] font-normal opacity-80">65% Blocked</div>
              </div>
              <div className="p-1.5 rounded bg-[#F25C1F]/15 text-[#F25C1F] dark:text-[#FF6B3D] font-bold">
                LATERAL MOVE
                <div className="text-[9px] font-normal opacity-80">42% Contained</div>
              </div>
              <div className="p-1.5 rounded bg-[#E04B0E]/20 text-[#E04B0E] dark:text-[#FF6B3D] font-bold">
                CREDENTIAL ACCESS
                <div className="text-[9px] font-normal opacity-80">18% Protected</div>
              </div>
              <div className="p-1.5 rounded bg-[#C23800]/25 text-[#C23800] dark:text-[#FF6B3D] font-bold">
                IMPACT / VAULT
                <div className="text-[9px] font-normal opacity-80">0% Isolated</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 cols: Strategic Remediation Priorities & ROI (Orange Accents) */}
        <div className="lg:col-span-6 gsap-card card-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#F25C1F]/10 text-[#F25C1F] dark:text-[#FF6B3D]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-[#18181B] dark:text-[#FAFAFA]">
                    Top Remediation Priorities (ROI)
                  </h2>
                  <p className="text-[12px] text-[#71717A] dark:text-[#9B9BA4]">
                    Mathematically verified controls maximizing path elimination
                  </p>
                </div>
              </div>
              <Link
                to="/remediation"
                className="text-[12px] text-[#F25C1F] dark:text-[#FF6B3D] hover:underline font-semibold flex items-center gap-1"
              >
                View all ({remediations.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Remediation Cards */}
            <div className="space-y-2.5">
              {topRemediations.map((item) => (
                <div
                  key={item.rank}
                  className="p-3 rounded-xl border border-[#ECECEF] dark:border-[#25252A] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1E] transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#ECECEF] dark:bg-[#25252A] text-[#18181B] dark:text-[#FAFAFA] font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                      {item.rank}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-[#18181B] dark:text-[#FAFAFA] truncate">
                        {item.control_name}
                      </div>
                      <div className="text-[11px] text-[#71717A] dark:text-[#9B9BA4] truncate mt-0.5">
                        Target: {item.target_assets_or_identities.join(", ") || "Domain Tier"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 text-right font-mono text-[11px]">
                    <div>
                      <span className="text-[#F25C1F] dark:text-[#FF6B3D] font-bold block">
                        &minus;{item.critical_paths_eliminated} paths
                      </span>
                      <span className="text-[#A1A1AA] text-[10px]">
                        {Math.round(item.blast_radius_reduction_percent)}% blast drop
                      </span>
                    </div>
                    <Link
                      to="/defense"
                      className="px-2 py-1 rounded bg-[#F25C1F]/10 dark:bg-[#FF6B3D]/10 text-[#F25C1F] dark:text-[#FF6B3D] text-[10px] font-bold hover:bg-[#F25C1F] hover:text-white dark:hover:bg-[#FF6B3D] transition-colors"
                    >
                      Simulate
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-[#ECECEF] dark:border-[#25252A] flex items-center justify-between text-[12px]">
            <span className="text-[#71717A] dark:text-[#9B9BA4]">
              Combined Impact: <strong className="text-[#F25C1F] dark:text-[#FF6B3D]">82% Attack Path Elimination</strong>
            </span>
            <Link
              to="/decision-proof"
              className="text-[#18181B] dark:text-white font-semibold hover:underline flex items-center gap-1"
            >
              Export Decision Proof <FileText className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenterPage;
