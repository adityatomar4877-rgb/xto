import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/lib/animations";
import { ThemeProvider } from "@/context/ThemeContext";
import { Layout } from "@/components/Layout";
import { CommandCenterPage } from "@/pages/CommandCenterPage";
import { DigitalTwinPage } from "@/pages/DigitalTwinPage";
import { ThreatVectorsPage } from "@/pages/ThreatVectorsPage";
import { AttackSimulationPage } from "@/pages/AttackSimulationPage";
import { AttackPathsPage } from "@/pages/AttackPathsPage";
import { BlastRadiusPage } from "@/pages/BlastRadiusPage";
import { DefenseSandboxPage } from "@/pages/DefenseSandboxPage";
import { DecisionProofPage } from "@/pages/DecisionProofPage";
import { RemediationPage } from "@/pages/RemediationPage";
import { EnvironmentSyncPage } from "@/pages/EnvironmentSyncPage";
import { EvidenceExplorerPage } from "@/pages/EvidenceExplorerPage";
import { MitreFrameworkPage } from "@/pages/MitreFrameworkPage";
import { AutonomousAuditPage } from "@/pages/AutonomousAuditPage";
import { DataIngestionPage } from "@/pages/DataIngestionPage";

const pageTransition = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: EASE } },
};

const withPageAnimation = (Component: React.FC) => (
  <motion.div {...pageTransition} initial="initial" animate="animate" exit="exit">
    <Component />
  </motion.div>
);

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/command" replace />} />
        <Route path="/command" element={withPageAnimation(CommandCenterPage)} />
        <Route path="/twin" element={withPageAnimation(DigitalTwinPage)} />
        <Route path="/ingest" element={withPageAnimation(DataIngestionPage)} />
        <Route path="/threat-vectors" element={withPageAnimation(ThreatVectorsPage)} />
        <Route path="/simulation" element={withPageAnimation(AttackSimulationPage)} />
        <Route path="/paths" element={withPageAnimation(AttackPathsPage)} />
        <Route path="/blast-radius" element={withPageAnimation(BlastRadiusPage)} />
        <Route path="/defense" element={withPageAnimation(DefenseSandboxPage)} />
        <Route path="/decision-proof" element={withPageAnimation(DecisionProofPage)} />
        <Route path="/audit" element={withPageAnimation(AutonomousAuditPage)} />
        <Route path="/mitre" element={withPageAnimation(MitreFrameworkPage)} />
        <Route path="/remediation" element={withPageAnimation(RemediationPage)} />
        <Route path="/sync" element={withPageAnimation(EnvironmentSyncPage)} />
        <Route path="/evidence" element={withPageAnimation(EvidenceExplorerPage)} />
        <Route path="*" element={<Navigate to="/command" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  useEffect(() => {
    const mainEl = document.getElementById("main-viewport");
    const lenis = new Lenis({
      wrapper: (mainEl as HTMLElement) || window,
      content: (mainEl?.firstElementChild as HTMLElement) || document.documentElement,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    let animId: number;
    function raf(time: number) {
      lenis.raf(time);
      animId = requestAnimationFrame(raf);
    }
    animId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animId);
      lenis.destroy();
    };
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
