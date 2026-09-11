import React, { useState, useEffect } from "react";
import {
  Zap,
  ShieldAlert,
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Printer,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Sliders,
  ExternalLink,
  Lock,
  Layers,
  FileText,
  Activity,
  Terminal,
  Target,
  Radar,
  Eye,
  TrendingUp,
} from "lucide-react";
import {
  api,
  AutomatedAuditReport,
  VulnerabilityFinding,
  AuditedAttackPath,
  ChokepointAnalysis,
  RemediationTask,
  BehaviouralAnomalyFinding,
  DigitalTwinTopology,
} from "@/lib/api";
import { motion, StaggerGroup, AnimatedCard, AnimatedNumber, EASE } from "@/lib/animations";
import { TopologyCanvas } from "@/components/landing/TopologyCanvas";

export const AutonomousAuditPage: React.FC = () => {
  const [report, setReport] = useState<AutomatedAuditReport | null>(null);
  const [twin, setTwin] = useState<DigitalTwinTopology | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"graph" | "behavioural" | "vulns" | "paths" | "chokepoints" | "remediations" | "report">("graph");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [selectedJiraTask, setSelectedJiraTask] = useState<RemediationTask | null>(null);
  const [jiraSuccess, setJiraSuccess] = useState<boolean>(false);
  const [selectedPath, setSelectedPath] = useState<number>(0);
  const [scanningNode, setScanningNode] = useState<string | null>(null);
  const [scannedNodes, setScannedNodes] = useState<string[]>([]);

  const pipelineSteps = [
    { title: "Vulnerability Discovery", desc: "Scanning all assets for known CVEs & credential exposures" },
    { title: "Behavioural Anomaly Detection", desc: "Analysing login, traffic & process telemetry against baselines" },
    { title: "Attack Path Tracing", desc: "Computing all lateral traversal routes to Crown Jewels" },
    { title: "Chokepoint & Damage Analysis", desc: "Extracting critical graph bottlenecks & damage severity" },
    { title: "Remediation Optimization", desc: "Evaluating candidate controls and path elimination" },
    { title: "Report Compilation", desc: "Assembling audit certificate and remediation dossier" },
  ];

  const runAudit = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    setActiveTab("graph");
    setScannedNodes([]);
    setScanningNode(null);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 500);

    try {
      const data = await api.runAutomatedAudit();
      clearInterval(stepInterval);
      setCurrentStep(5);
      setTimeout(() => {
        setReport(data);
        setIsRunning(false);
        setScanningNode(null);
        if (twin) setScannedNodes(twin.assets.map((a) => a.id));
      }, 500);
    } catch (err) {
      clearInterval(stepInterval);
      console.error("Audit error:", err);
      setIsRunning(false);
      setScanningNode(null);
    }
  };

  // Node-by-node scanning animation while the audit pipeline runs
  useEffect(() => {
    if (!isRunning || !twin || twin.assets.length === 0) return;

    let idx = 0;
    const scanned: string[] = [];
    setScanningNode(twin.assets[0].id);
    setScannedNodes([]);

    const scanInterval = setInterval(() => {
      // Mark previous node as scanned
      scanned.push(twin.assets[idx].id);
      setScannedNodes([...scanned]);
      idx++;

      if (idx >= twin.assets.length) {
        // All nodes scanned, loop back to keep the animation alive until the report arrives
        clearInterval(scanInterval);
        setScanningNode(null);
        setScannedNodes(twin.assets.map((a) => a.id));
        return;
      }

      setScanningNode(twin.assets[idx].id);
    }, 380);

    return () => clearInterval(scanInterval);
  }, [isRunning, twin]);

  useEffect(() => {
    api.getTwin().then(setTwin).catch(() => {});
    runAudit();
  }, []);

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(cmd);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Derive highlight path from selected attack path
  const activeAttackPath = report?.attack_paths[selectedPath];
  const highlightPath = activeAttackPath?.nodes_sequence ?? [];
  const compromisedNodes = activeAttackPath?.nodes_sequence ?? [];

  return (
    <div className="space-y-8 font-sans text-[#18181B] dark:text-slate-100 select-none pb-12">
      {/* 1. Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-4"
      >
        <div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#18181B] dark:text-white font-display">
              Autonomous Audit
            </h1>
          </div>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-1 font-normal">
            Scans for CVEs, traces lateral paths to crown jewels, computes chokepoints, and compiles an executive report.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={runAudit}
            disabled={isRunning}
            className="px-4 py-2 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>RUNNING PIPELINE...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RE-RUN FULL AUDIT</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-lg bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT / EXPORT REPORT</span>
          </button>
        </div>
      </motion.div>

      {/* 2. Automated Pipeline Stepper Animation */}
      {isRunning && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-orange-200 dark:border-orange-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              EXECUTING AUTONOMOUS ANALYSIS PIPELINE (STAGE {currentStep + 1} OF 6)...
            </span>
            <span className="text-[11px] text-[#F25C1F] dark:text-[#FF6B3D] font-mono font-bold">
              {pipelineSteps[currentStep].title}
            </span>
          </div>

          <StaggerGroup className="grid grid-cols-6 gap-2">
            {pipelineSteps.map((step, idx) => (
              <AnimatedCard
                key={idx}
                className={`p-2.5 rounded-lg border text-xs transition-all ${
                  idx === currentStep
                    ? "bg-orange-50 dark:bg-orange-950/40 border-[#FF5722] text-[#F25C1F] dark:text-[#FF6B3D]"
                    : idx < currentStep
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                    : "bg-slate-50 dark:bg-[#161C28] border-slate-200 dark:border-slate-800 text-[#A1A1AA]"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold font-mono text-[10.5px]">
                  {idx < currentStep ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span>#{idx + 1}</span>
                  )}
                  <span>{step.title}</span>
                </div>
                <div className="text-[9.5px] mt-1 opacity-80 leading-tight">{step.desc}</div>
              </AnimatedCard>
            ))}
          </StaggerGroup>
        </div>
      )}

      {/* 3. Executive Summary KPI Badges */}
      {report && (
        <div className="grid grid-cols-5 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800">
            <div className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] font-bold uppercase font-mono">
              VULNERABILITIES DETECTED
            </div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400 font-display mt-0.5">
              <AnimatedNumber value={report.vulnerabilities_detected_count} />
            </div>
            <div className="text-[10.5px] text-[#71717A] mt-1">
              CVE-based findings across <AnimatedNumber value={report.assets_scanned_count} /> assets
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800">
            <div className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] font-bold uppercase font-mono">
              BEHAVIOURAL ANOMALIES
            </div>
            <div className="text-2xl font-black text-orange-500 dark:text-orange-400 font-display mt-0.5 flex items-center gap-1.5">
              <Radar className="w-5 h-5" />
              <AnimatedNumber value={report.behavioural_anomalies_count ?? 0} />
            </div>
            <div className="text-[10.5px] text-[#71717A] mt-1">
              {report.behavioural_anomalies?.filter((a) => a.severity === "CRITICAL").length ?? 0} Critical · login, traffic & process
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800">
            <div className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] font-bold uppercase font-mono">
              VIABLE ATTACK PATHS
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-display mt-0.5">
              <AnimatedNumber value={report.viable_attack_paths_count} />
            </div>
            <div className="text-[10.5px] text-[#71717A] mt-1">
              Lateral routes reaching Crown Jewels
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800">
            <div className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] font-bold uppercase font-mono">
              PRIMARY CHOKEPOINT
            </div>
            <div className="text-lg font-black text-[#F25C1F] dark:text-[#FF6B3D] font-mono mt-1">
              {report.chokepoints[0]?.asset_name || "DC-CORP-01"}
            </div>
            <div className="text-[10.5px] text-[#71717A] mt-0.5">
              Severing eliminates {report.chokepoints[0]?.paths_eliminated_percent || 100}% of routes
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131316] border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10">
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase font-mono">
              RESILIENCE POSTURE DELTA
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display mt-0.5 flex items-baseline gap-1.5">
              <span>{report.baseline_resilience_score.toFixed(1)}</span>
              <span className="text-xs font-normal text-[#A1A1AA]">&rarr;</span>
              <span className="text-emerald-500 font-black">{report.projected_resilience_score.toFixed(1)}</span>
            </div>
            <div className="text-[10.5px] text-emerald-700 dark:text-emerald-300 font-semibold mt-1">
              +{report.resilience_improvement_percent}% post-remediation gain
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab Switcher Navigation */}
      {report && (
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 text-xs font-semibold overflow-x-auto">
          {[
            { id: "graph", label: "Topology Graph", count: null },
            { id: "report", label: "Executive Report", count: null },
            { id: "behavioural", label: "Behavioural Anomalies", count: report.behavioural_anomalies_count ?? 0 },
            { id: "vulns", label: "Vulnerabilities", count: report.vulnerabilities_detected_count },
            { id: "paths", label: "Attack Paths", count: report.viable_attack_paths_count },
            { id: "chokepoints", label: "Chokepoints", count: report.chokepoints.length },
            { id: "remediations", label: "Remediation Plan", count: report.remediation_tasks.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "border-[#FF5722] text-[#F25C1F] dark:text-[#FF6B3D] font-bold"
                  : "border-transparent text-[#71717A] hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 5. TAB: TOPOLOGY GRAPH — node-by-node scanning + attack paths */}
      {(report || isRunning) && activeTab === "graph" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="grid grid-cols-12 gap-6"
        >
          {/* Graph */}
          <div className="col-span-12 lg:col-span-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[14px] font-bold">
                    {isRunning ? "Scanning Topology" : "Scanned Topology"}
                  </h3>
                  <p className="text-[11px] text-[#71717A] mt-0.5">
                    {isRunning && twin
                      ? `Scanning ${scannedNodes.length + 1}/${twin.assets.length} assets — ${scanningNode ?? ""}`
                      : report
                      ? `${report.assets_scanned_count} assets · ${report.viable_attack_paths_count} attack paths · ${report.chokepoints.length} chokepoints`
                      : "Loading topology..."}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1AA]">
                  {isRunning ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#FF6B3D] animate-pulse" /> Scanning
                    </span>
                  ) : (
                    <>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]" /> Scanned</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F97316]" /> Anomaly</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> Crown Jewel</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Attack Path</span>
                    </>
                  )}
                </div>
              </div>
              <TopologyCanvas
                assets={twin?.assets}
                relationships={twin?.relationships}
                highlightPath={isRunning ? [] : highlightPath}
                compromisedNodes={isRunning ? [] : compromisedNodes}
                anomalyNodes={!isRunning && report ? report.behavioural_anomalies?.map((a) => a.asset_id) ?? [] : []}
                scanningNode={scanningNode}
                scannedNodes={scannedNodes}
                showLabels
                className="w-full h-[420px]"
              />
            </div>
          </div>

          {/* Side panel: during running → live scan progress; after report → path selector */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {isRunning ? (
              /* Live scanning progress */
              <div className="p-5 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[14px] font-bold">Scan Progress</div>
                  <span className="text-[11px] font-mono font-bold text-[#FF6B3D]">
                    {scannedNodes.length + (scanningNode ? 1 : 0)}/{twin?.assets.length ?? 12}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-4">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FF6B3D] to-[#F25C1F] rounded-full"
                    animate={{ width: `${((scannedNodes.length + (scanningNode ? 1 : 0)) / (twin?.assets.length ?? 12)) * 100}%` }}
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                </div>
                {/* Node-by-node scan list */}
                <div className="space-y-1 max-h-[340px] overflow-y-auto overscroll-contain pr-1.5" data-lenis-prevent="true">
                  {twin?.assets.map((a) => {
                    const isScanning = scanningNode === a.id;
                    const isScanned = scannedNodes.includes(a.id);
                    return (
                      <div
                        key={a.id}
                        className={`flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg text-[11px] transition-all ${
                          isScanning
                            ? "bg-[#FFF4ED] dark:bg-[#1C1310]"
                            : isScanned
                            ? ""
                            : "opacity-40"
                        }`}
                      >
                        {isScanning ? (
                          <RefreshCw className="w-3 h-3 text-[#FF6B3D] animate-spin flex-shrink-0" />
                        ) : isScanned ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700 flex-shrink-0" />
                        )}
                        <span className={`font-mono ${
                          isScanning
                            ? "text-[#FF6B3D] font-bold"
                            : isScanned
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-[#A1A1AA]"
                        }`}>
                          {a.id}
                        </span>
                        {isScanning && (
                          <span className="ml-auto text-[9px] text-[#FF6B3D] font-mono animate-pulse">SCANNING</span>
                        )}
                        {isScanned && a.vulnerabilities.length > 0 && (
                          <span className="ml-auto text-[9px] text-red-500 font-mono">{a.vulnerabilities.length} CVE</span>
                        )}
                        {isScanned && (a.anomaly_score ?? 0) > 0 && (
                          <span className={`ml-auto text-[9px] font-mono ${
                            (a.anomaly_score ?? 0) >= 40 ? "text-orange-500" : "text-amber-500"
                          }`}>ANOM {(a.anomaly_score ?? 0).toFixed(0)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {/* Attack path selector */}
                {report && (
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[14px] font-bold">Attack Paths</div>
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#71717A] dark:text-slate-400">
                        {report.attack_paths.length} mapped
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-[360px] overflow-y-auto overscroll-contain pr-1.5" data-lenis-prevent="true">
                      {report.attack_paths.map((path, i) => (
                        <button
                          key={path.path_id}
                          onClick={() => setSelectedPath(i)}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
                            selectedPath === i
                              ? "border-[#F25C1F] dark:border-[#FF6B3D] bg-[#FFF4ED] dark:bg-[#1C1310]"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-[#F25C1F] dark:text-[#FF6B3D]">{path.path_id}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                              path.damage_tier === "CATASTROPHIC"
                                ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                                : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                            }`}>
                              {path.damage_score}
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] text-[#71717A] dark:text-slate-400">
                            {path.source_asset_name} → {path.target_crown_jewel_name}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[9px] font-mono text-[#A1A1AA]">
                            <span>{path.hop_count} hops</span>
                            <span>·</span>
                            <span>effort {path.attacker_effort_score}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scanned assets summary */}
                {report && (
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800">
                    <div className="text-[14px] font-bold mb-3">Scanned Assets</div>
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto overscroll-contain pr-1.5" data-lenis-prevent="true">
                      {twin?.assets.map((a) => {
                        const hasVuln = a.vulnerabilities.length > 0;
                        const isChoke = report.chokepoints.some((c) => c.asset_id === a.id);
                        const isOnPath = highlightPath.includes(a.id);
                        const anomCount = report.behavioural_anomalies?.filter((f) => f.asset_id === a.id).length ?? 0;
                        const dotColor = hasVuln ? "bg-red-500" : anomCount > 0 ? "bg-orange-500" : isChoke ? "bg-amber-500" : "bg-emerald-500";
                        return (
                          <div
                            key={a.id}
                            className={`flex items-center justify-between py-1.5 px-2 rounded text-[11px] ${
                              isOnPath ? "bg-red-50 dark:bg-red-950/20" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
                              <span className="font-mono text-[#71717A] dark:text-slate-400 truncate">{a.id}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {hasVuln && <span className="text-[8px] text-red-500 font-mono">{a.vulnerabilities.length} CVE</span>}
                              {anomCount > 0 && <span className="text-[8px] text-orange-500 font-mono">{anomCount} ANOM</span>}
                              {isChoke && <span className="text-[8px] text-amber-500 font-mono">CHOKE</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* 6. TAB: EXECUTIVE AUDIT REPORT DOSSIER */}
      {report && activeTab === "report" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800 space-y-6"
        >
          {/* Report Top Metadata */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="text-[10px] text-[#A1A1AA] font-mono">AUDIT REFERENCE: {report.audit_id}</div>
              <h2 className="text-lg font-bold text-[#18181B] dark:text-white font-display mt-0.5">
                CYBER RISK, ATTACK PATH & REMEDIATION CERTIFICATION DOSSIER
              </h2>
              <div className="text-xs text-[#71717A] mt-0.5">
                Generated: {new Date(report.generated_at).toLocaleString()} // Evaluator: XTO Autonomous Digital Twin Engine
              </div>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 text-xs font-bold font-mono uppercase">
                {report.executive_verdict}
              </span>
            </div>
          </div>

          {/* Executive Narrative */}
          <div className="p-4 rounded-lg bg-[#F5F5F5] dark:bg-[#161C28] border border-slate-200 dark:border-slate-700/60 leading-relaxed text-xs text-slate-700 dark:text-slate-300">
            <div className="font-bold text-[#18181B] dark:text-white mb-1 uppercase font-mono text-[11px]">
              EXECUTIVE FINDINGS SUMMARY:
            </div>
            {report.executive_summary}
          </div>

          {/* Before vs After Posture Comparison */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50/20 dark:bg-red-950/10 space-y-2">
              <div className="text-xs font-bold text-red-600 uppercase font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                BASELINE SECURITY POSTURE (UNMITIGATED)
              </div>
              <ul className="text-xs text-[#71717A] dark:text-slate-300 space-y-1 pl-1">
                <li>• <strong>{report.vulnerabilities_detected_count} CVEs</strong> active on perimeter & corporate compute assets.</li>
                <li>• <strong>{report.viable_attack_paths_count} viable attack paths</strong> allow adversaries to reach Ransomware Backup Vault.</li>
                <li>• <strong>100% of backup paths</strong> converge through single chokepoint <code>DC-CORP-01</code>.</li>
                <li>• Enterprise Resilience Score: <span className="font-bold text-red-600">{report.baseline_resilience_score.toFixed(1)} / 100 (FRAGILE)</span>.</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-2">
              <div className="text-xs font-bold text-emerald-600 uppercase font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                PROJECTED POSTURE (POST-REMEDIATION ROADMAP)
              </div>
              <ul className="text-xs text-[#71717A] dark:text-slate-300 space-y-1 pl-1">
                <li>• <strong>100% of critical lateral paths</strong> to Crown Jewels eliminated via micro-segmentation.</li>
                <li>• <strong>47% blast radius drop</strong> by enforcing administrative MFA and credential isolation.</li>
                <li>• <strong>ZeroLogon & Ivanti VPN RCE</strong> patched removing external ingress vectors.</li>
                <li>• Enterprise Resilience Score: <span className="font-bold text-emerald-600">{report.projected_resilience_score.toFixed(1)} / 100 (HARDENED)</span>.</li>
              </ul>
            </div>
          </div>

          {/* Quick Action Plan Overview */}
          <div className="space-y-2.5 pt-2">
            <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200 uppercase font-mono">
              TOP REMEDIATION PRIORITIES (AUTOMATED RECOMMENDATION):
            </div>
            <div className="space-y-2">
              {report.remediation_tasks.slice(0, 3).map((task) => (
                <div key={task.rank} className="p-3 rounded-lg bg-[#F5F5F5] dark:bg-[#161C28] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#FFF4ED] dark:bg-orange-950 text-[#F25C1F] dark:text-[#FF6B3D] font-bold flex items-center justify-center font-mono">
                      #{task.rank}
                    </span>
                    <div>
                      <div className="font-bold text-[#18181B] dark:text-white">{task.title}</div>
                      <div className="text-[11px] text-[#71717A] mt-0.5">{task.reasoning}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      -{task.blast_radius_reduction_percent}% BLAST RADIUS
                    </span>
                    <span className="px-2 py-0.5 rounded bg-orange-50 text-[#F25C1F] dark:text-[#FF6B3D] border border-orange-200 font-bold">
                      {task.critical_paths_severed} PATHS SEVERED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 5b. TAB: BEHAVIOURAL ANOMALY FINDINGS */}
      {report && activeTab === "behavioural" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Radar className="w-4 h-4 text-orange-500" />
                <h2 className="text-[14px] font-bold text-slate-800 dark:text-slate-200 uppercase font-mono">
                  BEHAVIOURAL ANOMALY ANALYSIS
                </h2>
              </div>
              <div className="text-xs text-[#71717A] mt-1">
                Baseline-comparison detection across login, traffic-flow & process telemetry
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-black text-orange-500 dark:text-orange-400 font-display">
                  {report.behavioural_anomalies_count ?? 0}
                </div>
                <div className="text-[9px] text-[#A1A1AA] font-mono uppercase">total anomalies</div>
              </div>
            </div>
          </div>

          {/* Anomaly type distribution bar */}
          {(() => {
            const types = ["OFF_HOURS_LOGIN", "FAILED_AUTH_SPIKE", "DATA_EXFILTRATION", "ANOMALOUS_PROCESS", "PRIVILEGE_ESCALATION", "UNUSUAL_LATERAL_MOVEMENT"];
            const counts = types.map((t) => report.behavioural_anomalies?.filter((a) => a.anomaly_type === t).length ?? 0);
            const total = counts.reduce((s, c) => s + c, 0) || 1;
            const colors = ["#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#EC4899", "#10B981"];
            return (
              <div>
                <div className="flex h-2 rounded-full overflow-hidden">
                  {counts.map((c, i) => c > 0 && (
                    <div key={i} style={{ width: `${(c / total) * 100}%`, background: colors[i] }} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] font-mono text-[#71717A]">
                  {types.map((t, i) => counts[i] > 0 && (
                    <span key={t} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: colors[i] }} />
                      {t.replace(/_/g, " ")} ({counts[i]})
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Anomaly cards */}
          <div className="space-y-2.5">
            {report.behavioural_anomalies?.map((anom, i) => {
              const sevColor =
                anom.severity === "CRITICAL" ? "border-l-red-500" :
                anom.severity === "HIGH" ? "border-l-orange-500" :
                anom.severity === "MEDIUM" ? "border-l-amber-400" : "border-l-slate-400";
              const sevBadge =
                anom.severity === "CRITICAL" ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" :
                anom.severity === "HIGH" ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400" :
                anom.severity === "MEDIUM" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" :
                "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
              const typeIcon = {
                OFF_HOURS_LOGIN: <Eye className="w-3.5 h-3.5" />,
                FAILED_AUTH_SPIKE: <ShieldAlert className="w-3.5 h-3.5" />,
                DATA_EXFILTRATION: <TrendingUp className="w-3.5 h-3.5" />,
                ANOMALOUS_PROCESS: <Terminal className="w-3.5 h-3.5" />,
                PRIVILEGE_ESCALATION: <Lock className="w-3.5 h-3.5" />,
                UNUSUAL_LATERAL_MOVEMENT: <ArrowRight className="w-3.5 h-3.5" />,
              }[anom.anomaly_type as string] || <Activity className="w-3.5 h-3.5" />;

              return (
                <motion.div
                  key={anom.anomaly_id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04, ease: EASE }}
                  className={`p-4 rounded-xl border border-l-4 ${sevColor} border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="text-orange-500 mt-0.5 flex-shrink-0">{typeIcon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-[11px] text-slate-800 dark:text-slate-200">
                            {anom.anomaly_id}
                          </span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${sevBadge}`}>
                            {anom.severity}
                          </span>
                          <span className="text-[9px] font-mono text-[#A1A1AA] uppercase">
                            {anom.anomaly_type.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="text-[12px] text-slate-700 dark:text-slate-300 mt-1 leading-snug">
                          {anom.description}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-[#A1A1AA] flex-wrap">
                          <span>ASSET: <span className="text-slate-600 dark:text-slate-400">{anom.asset_id}</span></span>
                          <span>TIME: <span className="text-slate-600 dark:text-slate-400">{new Date(anom.detected_at).toLocaleString()}</span></span>
                          {anom.mitre_technique && (
                            <span>MITRE: <span className="text-[#F25C1F] dark:text-[#FF6B3D]">{anom.mitre_technique}</span></span>
                          )}
                        </div>
                        {/* Evidence */}
                        {Object.keys(anom.evidence ?? {}).length > 0 && (
                          <div className="mt-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[10px] font-mono">
                            {Object.entries(anom.evidence).map(([k, v]) => (
                              <span key={k} className="mr-3 text-[#71717A] dark:text-slate-400">
                                {k}: <span className="text-slate-600 dark:text-slate-300">{String(v)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Recommended action */}
                        <div className="mt-2 flex items-start gap-1.5 text-[10.5px] text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{anom.recommended_action}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* 6. TAB 2: VULNERABILITIES TABLE */}
      {report && activeTab === "vulns" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800 space-y-8"
        >
          <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200 uppercase font-mono">
            DISCOVERED VULNERABILITY CATALOG ({report.vulnerabilities.length} DETECTED)
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-[#161C28] text-[#71717A] font-mono text-[10.5px] uppercase border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">CVE IDENTIFIER</th>
                  <th className="py-2.5 px-3">NAME & DESCRIPTION</th>
                  <th className="py-2.5 px-3">AFFECTED ASSET</th>
                  <th className="py-2.5 px-3">SEVERITY / CVSS</th>
                  <th className="py-2.5 px-3">EXPLOIT TECHNIQUE</th>
                  <th className="py-2.5 px-3">PATCH STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report.vulnerabilities.map((v) => (
                  <tr key={v.cve} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-3 px-3 font-mono font-bold text-[#F25C1F] dark:text-[#FF6B3D] whitespace-nowrap">
                      {v.cve}
                    </td>
                    <td className="py-3 px-3 max-w-md">
                      <div className="font-bold text-[#18181B] dark:text-white">{v.name}</div>
                      <div className="text-[11px] text-[#71717A] mt-0.5">{v.description}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{v.affected_asset_name}</div>
                      <div className="text-[10px] text-[#A1A1AA] font-mono">{v.affected_asset_id}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold font-mono ${
                        v.severity === "CRITICAL"
                          ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950 dark:text-red-300"
                          : "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                      }`}>
                        {v.severity} ({v.cvss_score})
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {v.exploitable_technique}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        v.patch_available
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-slate-100 text-[#71717A] border border-slate-200"
                      }`}>
                        {v.patch_available ? "HOTFIX READY" : "MITIGATION ONLY"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* 7. TAB 3: VIABLE ATTACK PATHS */}
      {report && activeTab === "paths" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800 space-y-8"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200 uppercase font-mono">
              VIABLE ATTACK PATH TRACES TO CROWN JEWELS ({report.attack_paths.length} ROUTES MAPPED)
            </span>
            <span className="text-[#71717A] font-mono text-[11px]">SORTED BY DAMAGE SEVERITY & HOP EFFORT</span>
          </div>

          <div className="space-y-3">
            {report.attack_paths.map((path) => (
              <div
                key={path.path_id}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-[#F5F5F5] dark:bg-[#161C28] space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-[#F25C1F] dark:text-[#FF6B3D]">{path.path_id}</span>
                    <span className="text-[#A1A1AA]">|</span>
                    <span className="font-bold text-[#18181B] dark:text-white">
                      {path.source_asset_name} &rarr; {path.target_crown_jewel_name}
                    </span>
                    {path.entry_cve && (
                      <span className="px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-mono">
                        VIA {path.entry_cve}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      path.damage_tier === "CATASTROPHIC"
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : "bg-amber-50 text-amber-600 border border-amber-200"
                    }`}>
                      DAMAGE: {path.damage_score} ({path.damage_tier})
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#71717A] dark:text-slate-300 text-[10px] font-mono font-semibold">
                      {path.hop_count} HOPS // EFFORT: {path.attacker_effort_score}
                    </span>
                  </div>
                </div>

                {/* Visual Sequence Chain */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono pt-1">
                  {path.nodes_sequence.map((nodeId, idx) => {
                    const isLast = idx === path.nodes_sequence.length - 1;
                    const isChoke = path.critical_chokepoint_node === nodeId;
                    return (
                      <React.Fragment key={idx}>
                        <span
                          className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 ${
                            isLast
                              ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300"
                              : isChoke
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 font-bold"
                              : "bg-white dark:bg-[#131316] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          {nodeId}
                          {isChoke && <span className="text-[8.5px] text-[#F25C1F] dark:text-[#FF6B3D] font-bold ml-1">[CHOKEPOINT]</span>}
                        </span>
                        {!isLast && <span className="text-[#A1A1AA]">&rarr;</span>}
                      </React.Fragment>
                    );
                  })}
                </div>

                {path.techniques_used.length > 0 && (
                  <div className="text-[10.5px] text-[#71717A] font-mono">
                    TECHNIQUES: {path.techniques_used.join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 8. TAB 4: CHOKEPOINTS & BOTTLENECK CUTS */}
      {report && activeTab === "chokepoints" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800 space-y-8"
        >
          <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200 uppercase font-mono">
            GRAPH CHOKEPOINTS & CUT-SET BOTTLENECK ANALYSIS
          </div>

          <div className="grid grid-cols-3 gap-6">
            {report.chokepoints.map((cp) => (
              <div key={cp.asset_id} className="p-6 rounded-2xl bg-[#F5F5F5] dark:bg-[#161C28] border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#F25C1F] dark:text-[#FF6B3D] font-bold">{cp.asset_id}</span>
                  <span className="px-2 py-0.5 rounded bg-orange-50 text-[#F25C1F] dark:text-[#FF6B3D] border border-orange-200 text-[10px] font-bold font-mono">
                    {cp.paths_eliminated_percent}% CUT POWER
                  </span>
                </div>

                <div>
                  <div className="text-sm font-bold text-[#18181B] dark:text-white font-display">{cp.asset_name}</div>
                  <div className="text-xs text-[#71717A] mt-1">
                    Intersects <strong>{cp.paths_intersected} viable lateral paths</strong> across the environment.
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-[#131316] border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="text-[9.5px] text-[#A1A1AA] font-bold uppercase font-mono">RECOMMENDED INTERVENTION:</div>
                  <div className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">{cp.recommended_control}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 9. TAB 5: REMEDIATION ACTION PLAN & JIRA TICKETS */}
      {report && activeTab === "remediations" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800 space-y-8"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200 uppercase font-mono">
              PRIORITIZED REMEDIATION TASKS ({report.remediation_tasks.length} PREPARED)
            </span>
            <span className="text-[#71717A] font-mono text-[11px]">MATHEMATICALLY RANKED BY RISK REDUCTION POWER</span>
          </div>

          <div className="space-y-3.5">
            {report.remediation_tasks.map((task) => (
              <div
                key={task.rank}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F5F5F5] dark:bg-[#161C28] space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#FFF4ED] dark:bg-orange-950 text-[#F25C1F] dark:text-[#FF6B3D] font-bold flex items-center justify-center font-mono text-sm">
                      #{task.rank}
                    </span>
                    <div>
                      <div className="font-bold text-[#18181B] dark:text-white text-sm">{task.title}</div>
                      <div className="text-[11px] text-[#71717A] mt-0.5">{task.reasoning}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedJiraTask(task)}
                      className="px-2.5 py-1.5 rounded bg-white dark:bg-[#131316] border border-slate-200 dark:border-slate-700 hover:border-[#FF5722] text-[#F25C1F] dark:text-[#FF6B3D] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Jira Story</span>
                    </button>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-4 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-white dark:bg-[#131316] border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[9.5px] text-[#A1A1AA] font-mono block">CRITICAL PATHS SEVERED</span>
                    <span className="text-sm font-bold text-red-600 font-display">{task.critical_paths_severed}</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-[#131316] border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[9.5px] text-[#A1A1AA] font-mono block">BLAST RADIUS REDUCTION</span>
                    <span className="text-sm font-bold text-emerald-600 font-display">-{task.blast_radius_reduction_percent}%</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-[#131316] border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[9.5px] text-[#A1A1AA] font-mono block">COMPLEXITY</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{task.implementation_complexity}</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-[#131316] border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[9.5px] text-[#A1A1AA] font-mono block">EFFORT MULTIPLIER</span>
                    <span className="text-xs font-bold text-[#F25C1F] dark:text-[#FF6B3D] font-mono">+{task.attacker_effort_increase} pts</span>
                  </div>
                </div>

                {/* Hardening Command Snippet */}
                <div className="p-2.5 rounded-lg bg-[#181B20] text-emerald-400 font-mono text-[11px] flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <Terminal className="w-3.5 h-3.5 text-[#A1A1AA] flex-shrink-0" />
                    <code>{task.remediation_command}</code>
                  </div>
                  <button
                    onClick={() => handleCopyCommand(task.remediation_command)}
                    className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors ml-2 cursor-pointer flex-shrink-0"
                    title="Copy command"
                  >
                    {copiedCommand === task.remediation_command ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 10. JIRA STORY MODAL PREVIEW */}
      {selectedJiraTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800 shadow-2xl p-5 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F25C1F] dark:text-[#FF6B3D]" />
                <span className="font-bold text-sm text-[#18181B] dark:text-white">
                  PRE-GENERATED JIRA REMEDIATION STORY
                </span>
              </div>
              <button
                onClick={() => setSelectedJiraTask(null)}
                className="text-[#A1A1AA] hover:text-[#71717A] text-xs px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-[#A1A1AA] font-bold uppercase font-mono block mb-1">
                  ISSUE SUMMARY
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedJiraTask.jira_ticket_template.summary}
                  className="w-full bg-[#F5F5F5] dark:bg-[#161C28] border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A1A1AA] font-bold uppercase font-mono block mb-1">
                  DESCRIPTION & AUDIT EVIDENCE
                </label>
                <textarea
                  rows={5}
                  readOnly
                  value={selectedJiraTask.jira_ticket_template.description}
                  className="w-full bg-[#F5F5F5] dark:bg-[#161C28] border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono text-[11px] text-slate-700 dark:text-slate-300"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A1A1AA] font-bold uppercase font-mono block mb-1">
                  ACCEPTANCE CRITERIA
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedJiraTask.jira_ticket_template.acceptance_criteria}
                  className="w-full bg-[#F5F5F5] dark:bg-[#161C28] border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-700 dark:text-slate-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedJiraTask(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[#71717A] dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setJiraSuccess(true);
                  setTimeout(() => {
                    setJiraSuccess(false);
                    setSelectedJiraTask(null);
                  }, 1200);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {jiraSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>JIRA TICKET DISPATCHED!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Dispatch to Jira</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
