import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileCode,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Database,
  Users,
  Server,
  Terminal,
  Activity,
  FileCheck2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, SupportedFormatInfo, IngestionResponse } from "@/lib/api";
import { EASE } from "@/lib/animations";

export const DataIngestionPage: React.FC = () => {
  const navigate = useNavigate();
  const [formats, setFormats] = useState<SupportedFormatInfo[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>("NMAP_XML");
  const [ingestMode, setIngestMode] = useState<"MERGE" | "REPLACE">("MERGE");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<IngestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"file" | "samples">("samples");

  useEffect(() => {
    api.getIngestionFormats()
      .then(setFormats)
      .catch((err) => console.error("Failed to load supported formats", err));
  }, []);

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.uploadScanFile(selectedFile, ingestMode);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to parse and ingest scan file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadSample = async (sampleId: string) => {
    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.loadSampleScan(sampleId, ingestMode);
      setResult(res);
    } catch (err: any) {
      setError(err.message || `Failed to load sample ${sampleId}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetTwin = async () => {
    if (!window.confirm("Reset Digital Twin topology to factory default?")) return;
    setIsUploading(true);
    setError(null);
    try {
      await api.resetTwin();
      setResult({
        status: "SUCCESS",
        source_format: "FACTORY_DEFAULT",
        filename: "seed_data.py",
        mode: "REPLACE",
        snapshot_id: "snapshot_001",
        assets_imported: 12,
        relationships_created: 16,
        vulnerabilities_ingested: 18,
        identities_mapped: 6,
        critical_crown_jewels_identified: ["VAULT-BACKUP-01", "DB-PROD-01"],
        viable_attack_paths_count: 8,
        message: "Digital Twin topology reset to factory default demonstration state.",
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.message || "Failed to reset Digital Twin");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ECECEF] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#FFF2EB] dark:bg-[#2A1711] border border-[#FF5722]/30 flex items-center justify-center text-[#FF5722]">
              <UploadCloud className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider text-[#FF5722] uppercase">
              DATA INGESTION ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display">
            Real Scan Telemetry & Topology Importer
          </h1>
          <p className="text-sm text-slate-500 max-w-3xl mt-1">
            Import real operational enterprise scans (Nmap, Nessus, BloodHound Active Directory) into the Cyber Decision Digital Twin. Replace fabricated data with verified attack surface infrastructure.
          </p>
        </div>

        {/* Mode Toggle & Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-[#1A1A1E] p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setIngestMode("MERGE")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                ingestMode === "MERGE"
                  ? "bg-white dark:bg-[#25252A] text-[#FF5722] shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Merge With Twin
            </button>
            <button
              onClick={() => setIngestMode("REPLACE")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                ingestMode === "REPLACE"
                  ? "bg-[#FF5722] text-white shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Replace Seed Data
            </button>
          </div>

          <button
            onClick={handleResetTwin}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1A1A1E] dark:hover:bg-[#25252A] text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Reset to default factory topology"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Twin</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#ECECEF] dark:border-[#25252A] gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("samples")}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "samples"
              ? "border-[#FF5722] text-[#FF5722]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Enterprise Real Samples (1-Click)</span>
        </button>
        <button
          onClick={() => setActiveTab("file")}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "file"
              ? "border-[#FF5722] text-[#FF5722]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Upload Custom Scan File</span>
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "samples" && (
          <motion.div
            key="samples"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Sample 1: Nmap */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A] flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                    NETWORK XML
                  </span>
                  <Server className="w-4 h-4 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                    Enterprise Nmap Port Scan
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Real XML scan featuring 6 corporate hosts, open ports (80, 443, 445, 88, 5432), OS fingerprinting, and subnet reachability.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A1A1E] text-[11px] text-slate-600 dark:text-slate-300 font-mono space-y-1">
                  <div>Hosts: 6 Live Assets</div>
                  <div>Targets: DC-CORP-01, DB-PROD-01, WEB-SRV-01</div>
                  <div>Format: nmaprun XML v1.04</div>
                </div>
              </div>

              <button
                onClick={() => handleLoadSample("nmap")}
                disabled={isUploading}
                className="w-full py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isUploading ? "Ingesting..." : `Ingest Nmap Scan (${ingestMode})`}</span>
              </button>
            </div>

            {/* Sample 2: Nessus */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A] flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
                    CVE VULNERABILITY REPORT
                  </span>
                  <Shield className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                    Nessus / Trivy Vulnerability Report
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Real vulnerability export with critical CVEs (ZeroLogon CVE-2020-1472, Spring4Shell, Log4j, PostgreSQL RCE) mapped to MITRE tactics.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A1A1E] text-[11px] text-slate-600 dark:text-slate-300 font-mono space-y-1">
                  <div>Vulnerabilities: 8 Critical / High CVEs</div>
                  <div>CVSS Range: 8.8 - 10.0</div>
                  <div>Format: Tenable / Nessus JSON Export</div>
                </div>
              </div>

              <button
                onClick={() => handleLoadSample("nessus")}
                disabled={isUploading}
                className="w-full py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isUploading ? "Ingesting..." : `Ingest Nessus Report (${ingestMode})`}</span>
              </button>
            </div>

            {/* Sample 3: BloodHound */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A] flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                    ACTIVE DIRECTORY GRAPH
                  </span>
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                    BloodHound AD Topology Export
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Real BloodHound export mapping Active Directory Domain Controllers, Domain Admins, Kerberos delegation, and Tier-0 privilege hierarchies.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A1A1E] text-[11px] text-slate-600 dark:text-slate-300 font-mono space-y-1">
                  <div>AD Domain: CORP.LOCAL</div>
                  <div>Entities: 4 Computers, 4 AD Users, 6 Trusts</div>
                  <div>Format: SharpHound / BloodHound v5 JSON</div>
                </div>
              </div>

              <button
                onClick={() => handleLoadSample("bloodhound")}
                disabled={isUploading}
                className="w-full py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isUploading ? "Ingesting..." : `Ingest BloodHound AD (${ingestMode})`}</span>
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === "file" && (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="p-8 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A] space-y-6"
          >
            {/* Supported Formats Grid */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block font-mono">
                Select Scan Format:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {formats.map((f) => (
                  <div
                    key={f.format_id}
                    onClick={() => setSelectedFormat(f.format_id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedFormat === f.format_id
                        ? "border-[#FF5722] bg-orange-50/50 dark:bg-orange-950/20 text-slate-900 dark:text-white"
                        : "border-[#ECECEF] dark:border-[#25252A] hover:border-slate-300 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>{f.name}</span>
                      <span className="font-mono text-[10px] text-[#FF5722]">{f.extension}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center space-y-3 bg-slate-50/50 dark:bg-[#1A1A1E]/50">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] dark:bg-[#2A1711] text-[#FF5722] flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {selectedFile ? selectedFile.name : "Drag & drop scan file here, or click to browse"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Supports .xml (Nmap), .json (Nessus, BloodHound, Twin), and .csv (Nessus Tabular)
                </p>
              </div>

              <input
                type="file"
                id="scanFileInput"
                className="hidden"
                accept=".xml,.json,.csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => document.getElementById("scanFileInput")?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-[#25252A] dark:hover:bg-[#2F2F36] text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  Browse Local File
                </button>
                {selectedFile && (
                  <button
                    onClick={handleFileUpload}
                    disabled={isUploading}
                    className="px-5 py-2 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{isUploading ? "Uploading & Parsing..." : `Upload & Ingest (${ingestMode})`}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Ingestion Success Results Banner */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/10 border border-emerald-300 dark:border-emerald-800 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                  Telemetry Ingestion Completed Successfully ({result.mode})
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-0.5">
                  {result.message}
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-200/70 dark:bg-emerald-800/60 px-2 py-0.5 rounded-lg">
              Snapshot: {result.snapshot_id}
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-white/80 dark:bg-[#131316]/80 border border-emerald-200 dark:border-emerald-800/60 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Assets Ingested</div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-display mt-0.5">
                {result.assets_imported}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-[#131316]/80 border border-emerald-200 dark:border-emerald-800/60 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-mono">AD / Identities</div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-display mt-0.5">
                {result.identities_mapped}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-[#131316]/80 border border-emerald-200 dark:border-emerald-800/60 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Routes / Channels</div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-display mt-0.5">
                {result.relationships_created}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-[#131316]/80 border border-emerald-200 dark:border-emerald-800/60 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Attack Paths</div>
              <div className="text-xl font-black text-amber-600 font-display mt-0.5">
                {result.viable_attack_paths_count}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-[#131316]/80 border border-emerald-200 dark:border-emerald-800/60 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-mono">CVEs Imported</div>
              <div className="text-xl font-black text-red-600 font-display mt-0.5">
                {result.vulnerabilities_ingested}
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={() => navigate("/twin")}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white hover:opacity-90 text-white dark:text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Inspect in Digital Twin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate("/simulation")}
              className="px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Run Attack Simulation on Ingested Data</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
