import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Lenis from "lenis";
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

export const App: React.FC = () => {
  // Initialize Lenis Smooth Scrolling
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
          <Routes>
            <Route path="/" element={<Navigate to="/command" replace />} />
            <Route path="/command" element={<CommandCenterPage />} />
            <Route path="/twin" element={<DigitalTwinPage />} />
            <Route path="/threat-vectors" element={<ThreatVectorsPage />} />
            <Route path="/simulation" element={<AttackSimulationPage />} />
            <Route path="/paths" element={<AttackPathsPage />} />
            <Route path="/blast-radius" element={<BlastRadiusPage />} />
            <Route path="/defense" element={<DefenseSandboxPage />} />
            <Route path="/decision-proof" element={<DecisionProofPage />} />
            <Route path="/remediation" element={<RemediationPage />} />
            <Route path="/sync" element={<EnvironmentSyncPage />} />
            <Route path="/evidence" element={<EvidenceExplorerPage />} />
            <Route path="*" element={<Navigate to="/command" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
