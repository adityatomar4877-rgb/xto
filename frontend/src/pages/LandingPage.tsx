import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
  api,
  DigitalTwinTopology,
  ThreatVector,
  RemediationPriority,
  ResilienceScoreResult,
  SimulationTrace,
  SimulationRequest,
  BlastRadiusResponse,
  WhatIfComparison,
} from "@/lib/api";
import { EASE, Reveal, TextReveal, AnimatedNumber } from "@/lib/animations";
import { TopologyCanvas } from "@/components/landing/TopologyCanvas";
import { useTheme } from "@/context/ThemeContext";

// ── Section wrapper ─────────────────────────────────────────────────
const Section: React.FC<{ id?: string; children: React.ReactNode; className?: string }> = ({
  id,
  children,
  className = "",
}) => (
  <section id={id} className={`relative w-full ${className}`}>
    {children}
  </section>
);

// ── Massive headline ────────────────────────────────────────────────
const Headline: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <h2 className={`font-display font-bold tracking-tight leading-[0.95] ${className}`}>
    {children}
  </h2>
);

// ── Section label ───────────────────────────────────────────────────
const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span className={`font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500 ${className}`}>
    {children}
  </span>
);

// ── Minimal nav ─────────────────────────────────────────────────────
const LandingNav: React.FC = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-5 flex items-center justify-between">
    <Link to="/" className="flex items-center gap-2">
      <svg className="w-5 h-5 text-[#F25C1F]" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[13px] font-bold font-display tracking-tight text-zinc-100">Rakshastra</span>
    </Link>
    <Link
      to="/command"
      className="text-[12px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1.5"
    >
      Enter Dashboard
      <span className="text-[#F25C1F]">→</span>
    </Link>
  </nav>
);

// ── Scroll indicator ────────────────────────────────────────────────
const ScrollCue: React.FC = () => (
  <motion.div
    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    animate={{ y: [0, 8, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-600">Scroll</span>
    <div className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent" />
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════════════
//  LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════

export const LandingPage: React.FC = () => {
  const { setTheme } = useTheme();

  // ── Data state ────────────────────────────────────────────────────
  const [twin, setTwin] = useState<DigitalTwinTopology | null>(null);
  const [threats, setThreats] = useState<ThreatVector[]>([]);
  const [remediations, setRemediations] = useState<RemediationPriority[]>([]);
  const [resilience, setResilience] = useState<ResilienceScoreResult | null>(null);
  const [simTrace, setSimTrace] = useState<SimulationTrace | null>(null);
  const [blastData, setBlastData] = useState<BlastRadiusResponse | null>(null);
  const [whatIf, setWhatIf] = useState<WhatIfComparison | null>(null);

  // ── Interactive state ─────────────────────────────────────────────
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [blastAsset, setBlastAsset] = useState<string>("WS-ENG-04");

  // ── Force dark mode ───────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.remove("light");
    setTheme("dark");
  }, []);

  // ── Fetch all data ────────────────────────────────────────────────
  useEffect(() => {
    Promise.allSettled([
      api.getTwin(),
      api.getThreatVectors(),
      api.getRemediationPriorities(),
      api.getResilience(),
    ]).then(async (results) => {
      if (results[0].status === "fulfilled") setTwin(results[0].value);
      if (results[1].status === "fulfilled") setThreats(results[1].value);
      if (results[2].status === "fulfilled") setRemediations(results[2].value);
      if (results[3].status === "fulfilled") setResilience(results[3].value);

      // Run simulation for adversary section
      if (results[0].status === "fulfilled") {
        try {
          const trace = await api.runSimulation({
            threat_vector_id: "THREAT-PHISH",
            attacker_persona: "RANSOMWARE",
            initial_foothold_id: "WS-ENG-04",
            target_objective_id: "VAULT-BACKUP-01",
          });
          setSimTrace(trace);
        } catch (e) { /* ignore */ }
      }

      // Fetch blast radius
      try {
        const blast = await api.getBlastRadius("WS-ENG-04");
        setBlastData(blast);
      } catch (e) { /* ignore */ }

      // Fetch what-if comparison
      try {
        const comparison = await api.runWhatIf({
          threat_vector_id: "THREAT-PHISH",
          attacker_persona: "RANSOMWARE",
          initial_foothold_id: "WS-ENG-04",
          target_objective_id: "VAULT-BACKUP-01",
          defenses: [
            { id: "DEF-SEGMENT", control_type: "SEGMENT_NETWORK", name: "Segment Vault Network", target_scope: ["VAULT-BACKUP-01"], is_enabled: true },
            { id: "DEF-MFA", control_type: "ENABLE_MFA", name: "Enforce MFA on Admins", target_scope: ["ID-DOMAIN-ADMIN"], is_enabled: true },
          ],
        });
        setWhatIf(comparison);
      } catch (e) { /* ignore */ }
    });
  }, []);

  // ── Refetch blast radius when asset changes ───────────────────────
  useEffect(() => {
    if (!blastAsset) return;
    api.getBlastRadius(blastAsset).then(setBlastData).catch(() => {});
  }, [blastAsset]);

  // ── Derived simulation data ───────────────────────────────────────
  const simCompromised = simTrace?.compromised_assets ?? [];
  const simPath = simTrace
    ? [simTrace.initial_foothold_id, ...simTrace.timeline.map((e) => e.target_asset_id)]
    : [];

  // ── Blast radius reachable nodes ─────────────────────────────────
  const blastReachable = blastData
    ? [...blastData.direct_impact_assets.map((a) => a.id), ...blastData.indirect_impact_assets.map((a) => a.id)]
    : [];

  // ── What-if metrics ───────────────────────────────────────────────
  const proof = whatIf?.decision_proof;
  const pathsBefore = proof?.paths_before_count ?? 0;
  const pathsAfter = proof?.paths_after_count ?? 0;
  const reductionPercent = proof?.blast_radius_reduction_percent ?? 0;

  return (
    <div className="bg-[#08080A] text-zinc-100 min-h-screen overflow-x-hidden">
      <LandingNav />

      {/* ═══ SECTION 01 — HERO ═══════════════════════════════════════ */}
      <Section className="h-screen flex items-center justify-center relative overflow-hidden">
        {/* Subtle topology background */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <TopologyCanvas
            assets={twin?.assets}
            relationships={twin?.relationships}
            className="w-full h-full"
          />
        </div>

        {/* Atmospheric gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#08080A] via-transparent to-[#08080A] pointer-events-none" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(242,92,31,0.06) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <Reveal delay={0.2}>
            <Label>Security Digital Twin · Live Environment</Label>
          </Reveal>

          <motion.div
            className="mt-8 mb-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15, delayChildren: 0.4 } },
            }}
          >
            <Headline className="text-[2.75rem] sm:text-[4rem] md:text-[5.5rem] lg:text-[6.5rem]">
              <motion.span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  SEE TOMORROW'S
                </motion.span>
              </motion.span>
              <motion.span className="block overflow-hidden">
                <motion.span
                  className="block text-[#F25C1F]"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
                >
                  ATTACKS TODAY.
                </motion.span>
              </motion.span>
            </Headline>
          </motion.div>

          <Reveal delay={1.2} y={20}>
            <p className="text-[15px] text-zinc-400 font-medium tracking-wide mb-10">
              Model. Simulate. Analyze. Prevent.
            </p>
          </Reveal>

          <Reveal delay={1.5} y={20}>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/simulation"
                className="px-6 py-3 rounded-lg bg-[#F25C1F] hover:bg-[#E04E1A] text-white text-[13px] font-semibold transition-colors"
              >
                Run Simulation
              </Link>
              <Link
                to="/twin"
                className="px-6 py-3 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-[13px] font-semibold transition-colors"
              >
                Explore Digital Twin
              </Link>
            </div>
          </Reveal>
        </div>

        <ScrollCue />
      </Section>

      {/* ═══ SECTION 02 — THE PROBLEM ═════════════════════════════════ */}
      <ProblemSection twin={twin} />

      {/* ═══ SECTION 03 — DIGITAL TWIN ════════════════════════════════ */}
      <DigitalTwinSection twin={twin} />

      {/* ═══ SECTION 04 — ADVERSARY SIMULATION ═══════════════════════ */}
      <SimulationSection twin={twin} simTrace={simTrace} simPath={simPath} simCompromised={simCompromised} />

      {/* ═══ SECTION 05 — BLAST RADIUS ═══════════════════════════════ */}
      <BlastRadiusSection twin={twin} blastData={blastData} blastAsset={blastAsset} setBlastAsset={setBlastAsset} blastReachable={blastReachable} />

      {/* ═══ SECTION 06 — CONTROL WHAT-IF ════════════════════════════ */}
      <WhatIfSection twin={twin} proof={proof} pathsBefore={pathsBefore} pathsAfter={pathsAfter} reductionPercent={reductionPercent} />

      {/* ═══ SECTION 07 — PRIORITIZATION ════════════════════════════ */}
      <PrioritizationSection remediations={remediations} />

      {/* ═══ SECTION 08 — CONTINUOUS SYNC ════════════════════════════ */}
      <SyncSection />

      {/* ═══ SECTION 09 — FINAL CTA ═════════════════════════════════ */}
      <FinalCTASection resilience={resilience} />

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 px-8 flex items-center justify-between">
        <span className="text-[11px] text-zinc-600 font-mono">Rakshastra · Security Digital Twin · v1.0.0</span>
        <Link to="/command" className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
          Enter Dashboard →
        </Link>
      </footer>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  SECTION 02 — THE PROBLEM
// ═══════════════════════════════════════════════════════════════════════

const ProblemSection: React.FC<{ twin: DigitalTwinTopology | null }> = ({ twin }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const revealProgress = useTransform(scrollYProgress, [0.2, 0.7], [0, 1]);

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const unsub = revealProgress.on("change", (v) => setProgress(v));
    return () => unsub();
  }, [revealProgress]);

  const attackPath = ["WS-ENG-04", "DC-CORP-01", "VAULT-BACKUP-01"];

  return (
    <Section className="min-h-[140vh] flex flex-col items-center justify-center py-32">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Reveal>
          <Label>The Problem</Label>
        </Reveal>

        <div className="mt-12 mb-20">
          <Headline className="text-[2rem] sm:text-[3rem] md:text-[4rem] lg:text-[4.5rem] text-zinc-100">
            <TextReveal text="YOU DON'T NEED" delay={0.1} />
            <br />
            <TextReveal text="MORE ALERTS." delay={0.4} className="text-zinc-500" />
            <br />
            <TextReveal text="YOU NEED TO KNOW" delay={0.7} />
            <br />
            <TextReveal text="WHAT AN ATTACKER" delay={1.0} />
            <br />
            <TextReveal text="CAN REACH." delay={1.3} className="text-[#F25C1F]" />
          </Headline>
        </div>
      </div>

      {/* Progressive topology reveal */}
      <div ref={ref} className="w-full max-w-4xl mx-auto px-6">
        <TopologyCanvas
          assets={twin?.assets}
          relationships={twin?.relationships}
          highlightPath={progress > 0.7 ? attackPath : []}
          compromisedNodes={progress > 0.7 ? ["WS-ENG-04", "DC-CORP-01"] : []}
          progressiveReveal
          revealProgress={Math.min(progress * 1.5, 1)}
          showLabels
          className="w-full h-[400px]"
        />

        <div className="mt-8 flex items-center justify-center gap-8">
          <Reveal delay={0.3}>
            <div className="text-center">
              <div className="text-[32px] font-bold font-display text-zinc-100">{twin?.assets.length ?? 12}</div>
              <Label>Assets Modeled</Label>
            </div>
          </Reveal>
          <Reveal delay={0.5}>
            <div className="text-center">
              <div className="text-[32px] font-bold font-display text-zinc-100">{twin?.relationships.length ?? 17}</div>
              <Label>Trust Relationships</Label>
            </div>
          </Reveal>
          <Reveal delay={0.7}>
            <div className="text-center">
              <div className="text-[32px] font-bold font-display text-[#F25C1F]">3</div>
              <Label>Crown Jewels</Label>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  SECTION 03 — DIGITAL TWIN
// ═══════════════════════════════════════════════════════════════════════

const DigitalTwinSection: React.FC<{ twin: DigitalTwinTopology | null }> = ({ twin }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });

  const activeNode = hovered || selected;
  const activeAsset = twin?.assets.find((a) => a.id === activeNode);

  // Find connected assets
  const connected = new Set<string>();
  if (activeNode) {
    connected.add(activeNode);
    twin?.relationships.forEach((r) => {
      if (r.source_id === activeNode) connected.add(r.target_id);
      if (r.target_id === activeNode) connected.add(r.source_id);
    });
  }

  return (
    <Section className="min-h-screen flex flex-col justify-center py-24 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="text-center mb-16">
          <Reveal><Label>03 · Digital Twin</Label></Reveal>
          <div className="mt-6">
            <Headline className="text-[2rem] sm:text-[3rem] md:text-[4rem]">
              <TextReveal text="MODEL THE ENVIRONMENT." />
              <br />
              <TextReveal text="SEE THE ATTACK PATH." delay={0.3} className="text-[#F25C1F]" />
            </Headline>
          </div>
        </div>

        <div ref={ref} className="grid grid-cols-12 gap-8 items-center">
          {/* Topology */}
          <div className="col-span-12 lg:col-span-8">
            <div className="rounded-2xl border border-zinc-800 bg-[#0C0C0E] p-6">
              <TopologyCanvas
                assets={twin?.assets}
                relationships={twin?.relationships}
                hoveredNode={activeNode}
                onNodeHover={setHovered}
                onNodeClick={setSelected}
                showLabels
                className="w-full h-[420px]"
              />
            </div>
          </div>

          {/* Asset inspector */}
          <div className="col-span-12 lg:col-span-4 min-h-[420px]">
            <AnimatePresence mode="wait">
              {activeAsset ? (
                <motion.div
                  key={activeAsset.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <Label>{activeAsset.type}</Label>
                  <h3 className="text-[20px] font-bold mt-2 mb-1 font-display">{activeAsset.name}</h3>
                  <p className="text-[12px] font-mono text-[#F25C1F] mb-6">{activeAsset.id} · {activeAsset.ip_address}</p>

                  <div className="space-y-3 text-[13px]">
                    <Row label="Zone" value={activeAsset.zone} />
                    <Row label="OS" value={activeAsset.os} />
                    <Row label="Criticality" value={activeAsset.criticality} highlight={activeAsset.criticality === "CRITICAL"} />
                    <Row label="Score" value={`${activeAsset.criticality_score}/10`} />

                    {activeAsset.services.length > 0 && (
                      <div className="pt-2 border-t border-zinc-800">
                        <Label className="block mb-2">Open Services</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {activeAsset.services.map((s, i) => (
                            <span key={i} className="text-[10px] font-mono px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeAsset.vulnerabilities.length > 0 && (
                      <div className="pt-2 border-t border-zinc-800">
                        <Label className="block mb-2">Vulnerabilities</Label>
                        {activeAsset.vulnerabilities.map((v, i) => (
                          <div key={i} className="text-[11px] py-1.5 px-2.5 rounded bg-red-950/20 border border-red-900/40 mb-1">
                            <span className="font-mono text-red-400 font-bold">{v.cve}</span>
                            <span className="text-zinc-500 ml-2">CVSS {v.cvss_score}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-zinc-800">
                      <Label className="block mb-2">Reachable Assets</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {[...connected].filter((id) => id !== activeAsset.id).map((id) => {
                          const a = twin?.assets.find((x) => x.id === id);
                          return (
                            <button
                              key={id}
                              onClick={() => setSelected(id)}
                              className="text-[10px] font-mono px-2 py-1 rounded bg-[#F25C1F]/10 border border-[#F25C1F]/30 text-[#F25C1F] hover:bg-[#F25C1F]/20 transition-colors"
                            >
                              {id}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-zinc-600 text-[13px] flex items-center justify-center h-[420px]"
                >
                  Hover or click a node to inspect
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Section>
  );
};

const Row: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-zinc-500">{label}</span>
    <span className={`font-medium ${highlight ? "text-red-400" : "text-zinc-200"}`}>{value}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
//  SECTION 04 — ADVERSARY SIMULATION
// ═══════════════════════════════════════════════════════════════════════

const SimulationSection: React.FC<{
  twin: DigitalTwinTopology | null;
  simTrace: SimulationTrace | null;
  simPath: string[];
  simCompromised: string[];
}> = ({ twin, simTrace, simPath, simCompromised }) => {
  const [activeStep, setActiveStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  // Auto-advance through steps when in view
  useEffect(() => {
    if (!inView || !simTrace) return;
    const totalSteps = simTrace.timeline.length;
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= totalSteps - 1) return prev;
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [inView, simTrace]);

  const currentEvent = simTrace?.timeline[activeStep];
  const visiblePath = simPath.slice(0, activeStep + 2);
  const visibleCompromised = simCompromised.slice(0, activeStep + 1);

  return (
    <Section className="min-h-screen flex flex-col justify-center py-24 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="text-center mb-16">
          <Reveal><Label>04 · Adversary Simulation</Label></Reveal>
          <div className="mt-6">
            <Headline className="text-[2rem] sm:text-[3rem] md:text-[4rem]">
              <TextReveal text="NOW LET THE" />
              <br />
              <TextReveal text="ATTACKER MOVE." delay={0.3} className="text-[#F25C1F]" />
            </Headline>
          </div>
        </div>

        <div ref={ref} className="grid grid-cols-12 gap-8 items-center">
          {/* Topology with attack path */}
          <div className="col-span-12 lg:col-span-7">
            <div className="rounded-2xl border border-zinc-800 bg-[#0C0C0E] p-6">
              <TopologyCanvas
                assets={twin?.assets}
                relationships={twin?.relationships}
                highlightPath={visiblePath}
                compromisedNodes={visibleCompromised}
                showLabels
                className="w-full h-[400px]"
              />
            </div>
          </div>

          {/* Evidence panel */}
          <div className="col-span-12 lg:col-span-5 min-h-[400px]">
            {simTrace ? (
              <div>
                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex gap-1.5">
                    {simTrace.timeline.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          i <= activeStep ? "w-8 bg-[#F25C1F]" : "w-4 bg-zinc-800"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {activeStep + 1}/{simTrace.timeline.length}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {currentEvent && (
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      {/* Phase */}
                      <Label>{currentEvent.phase.replace(/_/g, " ")}</Label>

                      {/* Technique */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-red-950/30 border border-red-900/50 text-red-400 text-[11px] font-mono font-bold">
                          {currentEvent.technique_id}
                        </span>
                        <span className="text-[14px] font-semibold text-zinc-200">{currentEvent.technique_name}</span>
                      </div>

                      {/* Action */}
                      <p className="mt-4 text-[14px] text-zinc-300 leading-relaxed">{currentEvent.explanation}</p>

                      {/* Transition */}
                      <div className="mt-4 flex items-center gap-2 text-[12px] font-mono">
                        <span className="text-zinc-500">{currentEvent.source_asset_name}</span>
                        <span className="text-[#F25C1F]">→</span>
                        <span className="text-zinc-200 font-semibold">{currentEvent.target_asset_name}</span>
                      </div>

                      {/* Reasons */}
                      {currentEvent.reason && currentEvent.reason.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-zinc-800">
                          <Label className="block mb-3">Evidence</Label>
                          <div className="space-y-2">
                            {currentEvent.reason.map((r, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
                                className="flex items-start gap-2 text-[12px] text-zinc-400"
                              >
                                <span className="text-[#F25C1F] mt-0.5 flex-shrink-0">·</span>
                                <span>{r}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Blocked indicator */}
                      {!currentEvent.success && currentEvent.blocked_by_control && (
                        <div className="mt-4 p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                          <span className="text-[12px] text-emerald-400 font-semibold flex items-center gap-1.5">
                            ✓ Blocked by: {currentEvent.blocked_by_control}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Outcome */}
                {activeStep === (simTrace.timeline.length - 1) && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 pt-4 border-t border-zinc-800"
                  >
                    <div className="flex items-center gap-4 text-[12px]">
                      <span className={simTrace.objective_achieved ? "text-red-400" : "text-emerald-400"}>
                        {simTrace.objective_achieved ? "● BREACH SUCCESSFUL" : "● CONTAINED"}
                      </span>
                      <span className="text-zinc-500">Blast: {simTrace.blast_radius_percent}%</span>
                      <span className="text-zinc-500">Effort: {simTrace.total_attacker_effort_score}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-zinc-600 text-[13px] flex items-center justify-center h-[400px]">
                Running simulation...
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  SECTION 05 — BLAST RADIUS
// ═══════════════════════════════════════════════════════════════════════

const BlastRadiusSection: React.FC<{
  twin: DigitalTwinTopology | null;
  blastData: BlastRadiusResponse | null;
  blastAsset: string;
  setBlastAsset: (id: string) => void;
  blastReachable: string[];
}> = ({ twin, blastData, blastAsset, setBlastAsset, blastReachable }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <Section className="min-h-screen flex flex-col justify-center py-24 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="text-center mb-16">
          <Reveal><Label>05 · Blast Radius</Label></Reveal>
          <div className="mt-6">
            <Headline className="text-[2rem] sm:text-[3rem] md:text-[4rem]">
              <TextReveal text="IF THIS ASSET FALLS," />
              <br />
              <TextReveal text="WHAT HAPPENS NEXT?" delay={0.3} className="text-[#F25C1F]" />
            </Headline>
          </div>
        </div>

        <div ref={ref} className="grid grid-cols-12 gap-8 items-center">
          {/* Topology with blast */}
          <div className="col-span-12 lg:col-span-8">
            <div className="rounded-2xl border border-zinc-800 bg-[#0C0C0E] p-6">
              {/* Asset selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {twin?.assets.slice(0, 6).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setBlastAsset(a.id)}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded transition-colors ${
                      blastAsset === a.id
                        ? "bg-[#F25C1F] text-white"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {a.id}
                  </button>
                ))}
              </div>

              <TopologyCanvas
                assets={twin?.assets}
                relationships={twin?.relationships}
                blastOrigin={blastAsset}
                blastReachable={blastReachable}
                showLabels
                className="w-full h-[380px]"
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="col-span-12 lg:col-span-4">
            {blastData ? (
              <div className="space-y-6">
                <div>
                  <Label>Compromised Asset</Label>
                  <h3 className="text-[18px] font-bold mt-1.5 font-display">{blastData.asset_name}</h3>
                  <p className="text-[11px] font-mono text-[#F25C1F] mt-0.5">{blastData.compromised_asset_id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <AnimatedNumber value={blastData.total_reachable_assets} className="text-[32px] font-bold font-display text-zinc-100" />
                    <Label>Assets Reachable</Label>
                  </div>
                  <div>
                    <AnimatedNumber
                      value={blastData.total_blast_radius_percent}
                      suffix="%"
                      className="text-[32px] font-bold font-display text-[#F25C1F]"
                    />
                    <Label>Blast Radius</Label>
                  </div>
                  <div>
                    <AnimatedNumber value={blastData.direct_impact_count} className="text-[32px] font-bold font-display text-amber-500" />
                    <Label>Direct (1-hop)</Label>
                  </div>
                  <div>
                    <AnimatedNumber value={blastData.critical_crown_jewels_threatened.length} className="text-[32px] font-bold font-display text-red-500" />
                    <Label>Crown Jewels</Label>
                  </div>
                </div>

                {/* Crown jewels threatened */}
                {blastData.critical_crown_jewels_threatened.length > 0 && (
                  <div className="pt-4 border-t border-zinc-800">
                    <Label className="block mb-3 text-red-400">Critical Systems at Risk</Label>
                    {blastData.critical_crown_jewels_threatened.map((cj) => (
                      <div key={cj.id} className="py-1.5 flex items-center justify-between text-[12px]">
                        <span className="text-zinc-300">{cj.name}</span>
                        <span className="text-[10px] font-mono text-zinc-600">hop {cj.hop_distance}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-zinc-600 text-[13px] flex items-center justify-center h-[380px]">
                Calculating blast radius...
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  SECTION 06 — CONTROL WHAT-IF
// ═══════════════════════════════════════════════════════════════════════

const WhatIfSection: React.FC<{
  twin: DigitalTwinTopology | null;
  proof: any;
  pathsBefore: number;
  pathsAfter: number;
  reductionPercent: number;
}> = ({ twin, proof, pathsBefore, pathsAfter, reductionPercent }) => {
  const [showAfter, setShowAfter] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setShowAfter(true), 3000);
    return () => clearTimeout(timer);
  }, [inView]);

  return (
    <Section className="min-h-screen flex flex-col justify-center py-24 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="text-center mb-16">
          <Reveal><Label>06 · Control What-If</Label></Reveal>
          <div className="mt-6">
            <Headline className="text-[2rem] sm:text-[3rem] md:text-[4rem]">
              <TextReveal text="WHAT IF WE" />
              <br />
              <TextReveal text="CHANGE ONE CONTROL?" delay={0.3} className="text-[#F25C1F]" />
            </Headline>
          </div>
        </div>

        <div ref={ref} className="grid grid-cols-12 gap-8 items-center">
          {/* Before/After topology */}
          <div className="col-span-12 lg:col-span-7">
            <div className="rounded-2xl border border-zinc-800 bg-[#0C0C0E] p-6 relative overflow-hidden">
              {/* State label */}
              <div className="absolute top-4 right-4 z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={showAfter ? "after" : "before"}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded ${
                      showAfter
                        ? "bg-emerald-950/40 border border-emerald-900/50 text-emerald-400"
                        : "bg-red-950/40 border border-red-900/50 text-red-400"
                    }`}
                  >
                    {showAfter ? "● AFTER: DEFENDED" : "● BEFORE: UNDEFENDED"}
                  </motion.div>
                </AnimatePresence>
              </div>

              <TopologyCanvas
                assets={twin?.assets}
                relationships={twin?.relationships}
                highlightPath={showAfter ? [] : ["WS-ENG-04", "DC-CORP-01", "VAULT-BACKUP-01"]}
                compromisedNodes={showAfter ? [] : ["WS-ENG-04", "DC-CORP-01", "VAULT-BACKUP-01"]}
                showLabels
                className="w-full h-[400px]"
              />

              {/* Control applied indicator */}
              <AnimatePresence>
                {showAfter && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-emerald-950/40 border border-emerald-900/50 backdrop-blur-sm"
                  >
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                      ✓ Network Segmentation + MFA Applied
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Transition metrics */}
          <div className="col-span-12 lg:col-span-5">
            <div className="space-y-8">
              {/* Path count transition */}
              <div>
                <Label>Critical Attack Paths</Label>
                <div className="mt-3 flex items-baseline gap-4">
                  <motion.span
                    className="text-[48px] font-bold font-display text-red-500"
                    animate={{ opacity: showAfter ? 0.3 : 1 }}
                  >
                    {pathsBefore}
                  </motion.span>
                  <span className="text-[24px] text-zinc-600">→</span>
                  <motion.span
                    className="text-[48px] font-bold font-display text-emerald-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showAfter ? 1 : 0 }}
                  >
                    {pathsAfter}
                  </motion.span>
                </div>
              </div>

              {/* Reduction */}
              <div>
                <Label>Path Reduction</Label>
                <div className="mt-3">
                  <AnimatedNumber
                    value={Math.round(reductionPercent)}
                    suffix="%"
                    className="text-[56px] font-bold font-display text-emerald-500"
                  />
                </div>
              </div>

              {/* Defenses applied */}
              {proof && (
                <div className="pt-4 border-t border-zinc-800">
                  <Label className="block mb-3">Defenses Applied</Label>
                  {proof.defenses_applied?.map((d: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 py-1 text-[13px]">
                      <span className="text-emerald-500">✓</span>
                      <span className="text-zinc-300">{d}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Verdict */}
              {proof && (
                <div className="pt-4 border-t border-zinc-800">
                  <Label className="block mb-2">Verdict</Label>
                  <p className="text-[13px] text-zinc-400 leading-relaxed">{proof.executive_statement}</p>
                </div>
              )}

              <Link to="/defense" className="inline-flex items-center gap-1.5 text-[12px] text-[#F25C1F] hover:underline font-medium">
                Try the sandbox →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  SECTION 07 — PRIORITIZATION
// ═══════════════════════════════════════════════════════════════════════

const PrioritizationSection: React.FC<{ remediations: RemediationPriority[] }> = ({ remediations }) => {
  const items = remediations.slice(0, 5);

  return (
    <Section className="min-h-screen flex flex-col justify-center py-24 border-t border-zinc-900">
      <div className="max-w-4xl mx-auto px-6 w-full">
        <div className="text-center mb-16">
          <Reveal><Label>07 · Prioritization</Label></Reveal>
          <div className="mt-6">
            <Headline className="text-[2rem] sm:text-[3rem] md:text-[4rem]">
              <TextReveal text="FIX WHAT" />
              <br />
              <TextReveal text="BREAKS THE MOST" delay={0.2} />
              <br />
              <TextReveal text="ATTACK PATHS." delay={0.4} className="text-[#F25C1F]" />
            </Headline>
          </div>
          <Reveal delay={0.6}>
            <p className="mt-8 text-[14px] text-zinc-500 max-w-md mx-auto">
              Prioritized by attack paths eliminated, not vulnerability count.
            </p>
          </Reveal>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <Reveal key={item.rank} delay={i * 0.1} y={20}>
              <div className="flex items-center gap-6 p-5 rounded-xl border border-zinc-800 bg-[#0C0C0E] hover:border-zinc-700 transition-colors group">
                <span className="text-[11px] font-mono text-zinc-600 w-6">{String(item.rank).padStart(2, "0")}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[15px] font-medium text-zinc-100">{item.control_name}</span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-[13px] font-mono text-emerald-500 font-semibold">
                    ↓ {item.critical_paths_eliminated} paths
                  </span>
                  <span className="text-[13px] font-mono text-zinc-500">
                    −{Math.round(item.blast_radius_reduction_percent)}%
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.8}>
          <div className="mt-10 text-center">
            <Link to="/remediation" className="text-[12px] text-[#F25C1F] hover:underline font-medium">
              View all remediations →
            </Link>
          </div>
        </Reveal>
      </div>
    </Section>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  SECTION 08 — CONTINUOUS SYNC
// ═══════════════════════════════════════════════════════════════════════

const SyncSection: React.FC = () => {
  const steps = [
    { label: "REAL ENVIRONMENT", desc: "Production assets, identities, trust relationships" },
    { label: "DIGITAL TWIN", desc: "In-memory graph model of the enterprise" },
    { label: "CHANGE DETECTED", desc: "Drift in assets, credentials, or controls" },
    { label: "PATHS RECOMPUTED", desc: "All viable attack routes recalculated" },
    { label: "LIVE RISK", desc: "Updated resilience score and blast radius" },
  ];

  return (
    <Section className="min-h-screen flex flex-col justify-center py-24 border-t border-zinc-900">
      <div className="max-w-4xl mx-auto px-6 w-full text-center">
        <Reveal><Label>08 · Continuous Sync</Label></Reveal>
        <div className="mt-6 mb-16">
          <Headline className="text-[2rem] sm:text-[3rem] md:text-[4rem]">
            <TextReveal text="THE MODEL" />
            <br />
            <TextReveal text="NEVER GOES STALE." delay={0.3} className="text-[#F25C1F]" />
          </Headline>
        </div>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <Reveal delay={i * 0.15} y={24}>
                <div className="flex items-center gap-6 py-6">
                  <div className="flex-1 text-right">
                    <div className="text-[14px] font-mono font-bold text-zinc-100">{step.label}</div>
                    <div className="text-[12px] text-zinc-500 mt-1">{step.desc}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-zinc-700 bg-[#0C0C0E] flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-mono text-[#F25C1F]">{i + 1}</span>
                  </div>
                  <div className="flex-1" />
                </div>
              </Reveal>
              {i < steps.length - 1 && (
                <div className="flex justify-center">
                  <motion.div
                    className="w-px h-12 bg-gradient-to-b from-zinc-700 to-transparent"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.1, duration: 0.4 }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <Reveal delay={0.8}>
          <p className="mt-12 text-[13px] text-zinc-500 max-w-sm mx-auto">
            Rakshastra continuously synchronizes with your environment and recomputes risk in real time.
          </p>
        </Reveal>
      </div>
    </Section>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  SECTION 09 — FINAL CTA
// ═══════════════════════════════════════════════════════════════════════

const FinalCTASection: React.FC<{ resilience: ResilienceScoreResult | null }> = ({ resilience }) => {
  return (
    <Section className="min-h-screen flex flex-col items-center justify-center py-24 border-t border-zinc-900 relative overflow-hidden">
      {/* Atmospheric glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(242,92,31,0.04) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
        <Reveal><Label>09 · Start Now</Label></Reveal>

        <div className="mt-10">
          <Headline className="text-[2.5rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem]">
            <TextReveal text="KNOW THE" delay={0.1} />
            <br />
            <TextReveal text="BLAST RADIUS" delay={0.4} className="text-[#F25C1F]" />
            <br />
            <TextReveal text="BEFORE THE" delay={0.7} />
            <br />
            <TextReveal text="BREACH." delay={1.0} />
          </Headline>
        </div>

        <Reveal delay={1.5}>
          <div className="mt-12">
            <Link
              to="/simulation"
              className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#F25C1F] hover:text-[#E04E1A] transition-colors group"
            >
              Run a simulation
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </Reveal>

        {resilience && (
          <Reveal delay={2}>
            <div className="mt-20 flex items-center justify-center gap-12 text-center">
              <div>
                <div className="text-[28px] font-bold font-display text-zinc-100">{resilience.total_attack_paths_count}</div>
                <Label>Attack Paths</Label>
              </div>
              <div>
                <div className="text-[28px] font-bold font-display text-[#F25C1F]">{Math.round(resilience.resilience_score)}</div>
                <Label>Resilience Score</Label>
              </div>
              <div>
                <div className="text-[28px] font-bold font-display text-zinc-100">{resilience.single_points_of_failure.length}</div>
                <Label>Single Points of Failure</Label>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </Section>
  );
};
