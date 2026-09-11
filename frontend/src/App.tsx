import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/lib/animations";
import { ThemeProvider } from "@/context/ThemeContext";
import { Layout } from "@/components/Layout";
import { LandingPage } from "@/pages/LandingPage";
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
        <Route path="/command" element={withPageAnimation(CommandCenterPage)} />
        <Route path="/twin" element={withPageAnimation(DigitalTwinPage)} />
        <Route path="/threat-vectors" element={withPageAnimation(ThreatVectorsPage)} />
        <Route path="/simulation" element={withPageAnimation(AttackSimulationPage)} />
        <Route path="/paths" element={withPageAnimation(AttackPathsPage)} />
        <Route path="/blast-radius" element={withPageAnimation(BlastRadiusPage)} />
        <Route path="/defense" element={withPageAnimation(DefenseSandboxPage)} />
        <Route path="/decision-proof" element={withPageAnimation(DecisionProofPage)} />
        <Route path="/audit" element={withPageAnimation(AutonomousAuditPage)} />
        <Route path="/ingest" element={withPageAnimation(DataIngestionPage)} />
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
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page — full-screen cinematic experience, no Layout */}
          <Route path="/" element={<LandingPage />} />

          {/* Dashboard pages — inside Layout with sidebar/topbar */}
          <Route
            path="*"
            element={
              <Layout>
                <AnimatedRoutes />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
