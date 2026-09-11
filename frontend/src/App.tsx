import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
  return (
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
  );
};

export default App;
