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
} from "lucide-react";
import { api, Asset, DigitalTwinTopology } from "@/lib/api";
import { Tactical3DScene } from "@/components/Tactical3DScene";

export const DigitalTwinPage: React.FC = () => {
  const navigate = useNavigate();
  const [twin, setTwin] = useState<DigitalTwinTopology | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-center h-full font-mono text-cyan-400">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        LOADING DIGITAL TWIN TOPOLOGY...
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00E5FF]" />
            INTERACTIVE SECURITY DIGITAL TWIN
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Queryable environment model with typed directional reachability, identities, and trust boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            SNAPSHOT: <span className="text-[#00E5FF] font-bold">{twin.snapshot_id}</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            TOTAL ASSETS: <span className="text-white font-bold">{twin.assets.length}</span>
          </span>
        </div>
      </div>

      {/* Main Workspace: 3D Scene + Asset Inspector Drawer */}
      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Left: Spatial 3D Scene */}
        <div className="col-span-8 h-full flex flex-col">
          <Tactical3DScene
            assets={twin.assets}
            relationships={twin.relationships}
            selectedAssetId={selectedAsset?.id}
            onSelectAsset={(a) => setSelectedAsset(a)}
          />
        </div>

        {/* Right: Detailed Entity Inspector */}
        <div className="col-span-4 h-full overflow-y-auto p-4 rounded-lg bg-[#0B0E14]/90 border border-cyan-950/40 font-mono space-y-4">
          {selectedAsset ? (
            <>
              {/* Asset Header */}
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{selectedAsset.type}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      selectedAsset.criticality === "CRITICAL"
                        ? "bg-red-950 text-red-400 border border-red-500/40"
                        : selectedAsset.criticality === "HIGH"
                        ? "bg-amber-950 text-amber-400 border border-amber-500/40"
                        : "bg-slate-900 text-slate-300"
                    }`}
                  >
                    {selectedAsset.criticality} CRITICALITY
                  </span>
                </div>
                <div className="text-lg font-bold text-white mt-1">{selectedAsset.name}</div>
                <div className="text-xs text-[#00E5FF]">{selectedAsset.id} // {selectedAsset.ip_address}</div>
              </div>

              {/* Action Triggers */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate(`/simulation?foothold=${selectedAsset.id}`)}
                  className="py-2 px-3 rounded bg-red-950/70 border border-red-500/40 text-red-300 hover:bg-red-900/60 transition-all text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(255,59,48,0.15)]"
                >
                  <Play className="w-3.5 h-3.5" />
                  SET AS FOOTHOLD
                </button>
                <button
                  onClick={() => navigate(`/blast-radius?asset=${selectedAsset.id}`)}
                  className="py-2 px-3 rounded bg-cyan-950/70 border border-[#00E5FF]/40 text-[#00E5FF] hover:bg-cyan-900/60 transition-all text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  BLAST RADIUS
                </button>
              </div>

              {/* General Metadata */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">ZONE:</span>
                  <span className="text-slate-200">{selectedAsset.zone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">OPERATING SYSTEM:</span>
                  <span className="text-slate-200">{selectedAsset.os}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">DEPARTMENT:</span>
                  <span className="text-slate-200">{selectedAsset.department}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">IMPACT WEIGHT:</span>
                  <span className="text-amber-400 font-bold">{selectedAsset.criticality_score} / 10.0</span>
                </div>
              </div>

              {/* Running Services */}
              <div>
                <div className="text-xs font-bold text-slate-300 mb-1.5">OPEN SERVICES & PORTS</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAsset.services.map((svc, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[11px]">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vulnerabilities */}
              <div>
                <div className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  VULNERABILITIES ({selectedAsset.vulnerabilities.length})
                </div>
                {selectedAsset.vulnerabilities.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedAsset.vulnerabilities.map((v, i) => (
                      <div key={i} className="p-2 rounded bg-red-950/30 border border-red-500/30 text-xs">
                        <div className="flex items-center justify-between text-red-400 font-bold">
                          <span>{v.cve}</span>
                          <span>CVSS {v.cvss_score}</span>
                        </div>
                        <div className="text-slate-300 mt-0.5">{v.name}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">No known CVEs on this node.</div>
                )}
              </div>

              {/* Associated Identities */}
              <div>
                <div className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#00E5FF]" />
                  ATTACHED IDENTITIES & SESSIONS
                </div>
                <div className="space-y-1.5">
                  {selectedAsset.identities.map((idId) => {
                    const ident = twin.identities.find((i) => i.id === idId);
                    return (
                      <div key={idId} className="p-2 rounded bg-slate-950 border border-slate-800 text-xs">
                        <div className="text-slate-200 font-bold">{ident?.name || idId}</div>
                        <div className="text-[10px] text-cyan-400 flex justify-between mt-0.5">
                          <span>ROLE: {ident?.role}</span>
                          <span>{ident?.privilege_level}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-slate-400 py-12">
              Select an asset node from the digital twin topology to inspect its security model.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
