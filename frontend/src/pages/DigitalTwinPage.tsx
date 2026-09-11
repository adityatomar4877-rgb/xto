import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  Server,
  ShieldAlert,
  Radio,
  Lock,
  User,
  AlertTriangle,
  Play,
  Activity,
  ArrowRight,
  Shield,
  Cpu,
  Fingerprint,
  CheckCircle2,
} from "lucide-react";
import { api, Asset, DigitalTwinTopology } from "@/lib/api";
import { Tactical3DScene } from "@/components/Tactical3DScene";
import { useStaggerEntrance } from "@/lib/animations";

export const DigitalTwinPage: React.FC = () => {
  const navigate = useNavigate();
  const [twin, setTwin] = useState<DigitalTwinTopology | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<"overview" | "vulns" | "services" | "identities">("overview");
  const containerRef = useStaggerEntrance(".gsap-box", [selectedAsset?.id]);

  useEffect(() => {
    api.getTwin()
      .then((data) => {
        setTwin(data);
        if (data.assets.length > 0) {
          setSelectedAsset(data.assets.find((a) => a.id === "WS-ENG-04") || data.assets[0]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !twin) {
    return (
      <div className="flex items-center justify-center h-full font-mono text-[#FF5722]">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        LOADING DIGITAL TWIN TOPOLOGY...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4 h-full flex flex-col font-sans select-none pb-4 text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FF5722]" />
            INTERACTIVE SECURITY DIGITAL TWIN
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Queryable environment model with 12 enterprise assets, 14 active routes, typed directional reachability, and trust boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-600">
          <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E7EB] shadow-xs">
            SNAPSHOT: <span className="text-[#FF5722] font-bold">{twin.snapshot_id}</span>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E7EB] shadow-xs">
            TOTAL ASSETS: <span className="text-slate-900 font-bold">{twin.assets.length}</span>
          </span>
        </div>
      </div>

      {/* Main Workspace: 2D Scene + Decluttered Tabbed Asset Inspector */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left: Spatial 2D Vector Scene */}
        <div className="gsap-box col-span-8 h-full flex flex-col">
          <Tactical3DScene
            assets={twin.assets}
            relationships={twin.relationships}
            selectedAssetId={selectedAsset?.id}
            onSelectAsset={(node) => {
              const matched = twin.assets.find((a) => a.id === node.id);
              if (matched) setSelectedAsset(matched);
            }}
            height="h-full min-h-[500px]"
          />
        </div>

        {/* Right: User-Friendly Tabbed Entity Inspector */}
        <div className="gsap-box col-span-4 h-full overflow-hidden p-4 rounded-xl bg-white border border-[#E5E7EB] font-sans flex flex-col shadow-xs transition-all duration-200 hover:shadow-md">
          {selectedAsset ? (
            <>
              {/* Asset Header */}
              <div className="border-b border-slate-100 pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono font-medium">{selectedAsset.type}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono ${
                      selectedAsset.criticality === "CRITICAL"
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : selectedAsset.criticality === "HIGH"
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {selectedAsset.criticality} CRITICALITY
                  </span>
                </div>
                <div className="text-base font-bold text-slate-900 mt-1 font-display truncate">
                  {selectedAsset.name}
                </div>
                <div className="text-xs text-[#FF5722] font-mono font-semibold">
                  {selectedAsset.id} // {selectedAsset.ip_address}
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-2.5">
                  <button
                    onClick={() => navigate(`/simulation?foothold=${selectedAsset.id}`)}
                    className="py-1.5 px-2.5 rounded-lg bg-[#FFF2EB] border border-[#FF5722]/40 text-[#FF5722] hover:bg-[#FFE5D6] transition-all text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Play className="w-3.5 h-3.5" />
                    SIMULATE FOOTHOLD
                  </button>
                  <button
                    onClick={() => navigate(`/blast-radius?asset=${selectedAsset.id}`)}
                    className="py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    BLAST RADIUS
                  </button>
                </div>
              </div>

              {/* Inspector Segmented Tabs (Eliminating Clutter) */}
              <div className="flex border-b border-slate-100 my-2.5 gap-1 text-[11px] font-semibold flex-shrink-0">
                <button
                  onClick={() => setInspectorTab("overview")}
                  className={`pb-1.5 px-2.5 border-b-2 transition-all cursor-pointer ${
                    inspectorTab === "overview"
                      ? "border-[#FF5722] text-[#FF5722] font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setInspectorTab("vulns")}
                  className={`pb-1.5 px-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1 ${
                    inspectorTab === "vulns"
                      ? "border-[#FF5722] text-[#FF5722] font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span>CVEs</span>
                  {selectedAsset.vulnerabilities.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 text-[9px] font-mono">
                      {selectedAsset.vulnerabilities.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setInspectorTab("services")}
                  className={`pb-1.5 px-2.5 border-b-2 transition-all cursor-pointer ${
                    inspectorTab === "services"
                      ? "border-[#FF5722] text-[#FF5722] font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Services ({selectedAsset.services.length})
                </button>
                <button
                  onClick={() => setInspectorTab("identities")}
                  className={`pb-1.5 px-2.5 border-b-2 transition-all cursor-pointer ${
                    inspectorTab === "identities"
                      ? "border-[#FF5722] text-[#FF5722] font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Identities ({selectedAsset.identities.length})
                </button>
              </div>

              {/* Tabbed Content Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs animate-in fade-in duration-150">
                {/* 1. OVERVIEW TAB */}
                {inspectorTab === "overview" && (
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] space-y-2">
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500 font-medium">NETWORK ZONE:</span>
                        <span className="text-slate-900 font-semibold font-mono">{selectedAsset.zone}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500 font-medium">OPERATING SYSTEM:</span>
                        <span className="text-slate-900 font-semibold">{selectedAsset.os}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500 font-medium">DEPARTMENT:</span>
                        <span className="text-slate-900 font-semibold">{selectedAsset.department}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500 font-medium">IMPACT WEIGHT:</span>
                        <span className="text-amber-600 font-bold font-mono">
                          {selectedAsset.criticality_score} / 10.0
                        </span>
                      </div>
                    </div>

                    {/* Controls applied */}
                    <div>
                      <div className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        ACTIVE SECURITY CONTROLS ({selectedAsset.controls.length})
                      </div>
                      {selectedAsset.controls.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedAsset.controls.map((ctrl, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-semibold"
                            >
                              {ctrl}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-400 text-xs italic">No specific controls mapped.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. VULNERABILITIES TAB */}
                {inspectorTab === "vulns" && (
                  <div className="space-y-2">
                    {selectedAsset.vulnerabilities.length > 0 ? (
                      selectedAsset.vulnerabilities.map((v, i) => (
                        <div key={i} className="p-3 rounded-lg bg-red-50/70 border border-red-200 text-xs space-y-1">
                          <div className="flex items-center justify-between text-red-600 font-bold font-mono">
                            <span>{v.cve}</span>
                            <span className="bg-red-100 px-1.5 py-0.5 rounded text-[10px]">
                              CVSS {v.cvss_score}
                            </span>
                          </div>
                          <div className="text-slate-900 font-semibold">{v.name}</div>
                          {v.description && (
                            <div className="text-slate-600 text-[11px] leading-relaxed pt-0.5">
                              {v.description}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
                        No known unpatched CVE vulnerabilities on this asset.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. OPEN SERVICES TAB */}
                {inspectorTab === "services" && (
                  <div className="space-y-2">
                    <div className="text-[11px] text-slate-500 font-medium">
                      Exposed listening services and protocol endpoints:
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {selectedAsset.services.map((svc, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 rounded-lg bg-[#F8F9FA] text-slate-800 border border-[#E5E7EB] text-xs font-mono font-semibold flex items-center justify-between"
                        >
                          <span>{svc}</span>
                          <span className="text-[10px] text-emerald-600 font-sans font-bold">ACTIVE</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. IDENTITIES TAB */}
                {inspectorTab === "identities" && (
                  <div className="space-y-2">
                    {selectedAsset.identities.length > 0 ? (
                      selectedAsset.identities.map((idId) => {
                        const ident = twin.identities.find((i) => i.id === idId);
                        return (
                          <div key={idId} className="p-3 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-900 font-bold">{ident?.name || idId}</span>
                              <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-orange-50 text-[#FF5722] border border-orange-200 font-bold">
                                {ident?.privilege_level || "USER"}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 font-mono">
                              ROLE: <span className="font-semibold text-slate-800">{ident?.role}</span>
                            </div>
                            {ident?.accessible_assets && (
                              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                                Reach: {ident.accessible_assets.length} assets accessible
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        No cached human or service account credentials on this node.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-slate-400 py-12 flex flex-col items-center justify-center h-full">
              <Layers className="w-8 h-8 text-slate-300 mb-2" />
              <span>Select an asset node from the digital twin topology to inspect its security model.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
