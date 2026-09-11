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
      <div className="flex items-center justify-center h-full font-mono text-[#FF5722]">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        LOADING DIGITAL TWIN TOPOLOGY...
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col font-sans select-none pb-4 text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FF5722]" />
            INTERACTIVE SECURITY DIGITAL TWIN
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Queryable environment model with typed directional reachability, identities, and trust boundaries.
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

      {/* Main Workspace: 3D Scene + Asset Inspector Drawer */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left: Spatial 3D Scene */}
        <div className="col-span-8 h-full flex flex-col">
          <Tactical3DScene
            assets={twin.assets}
            relationships={twin.relationships}
            selectedAssetId={selectedAsset?.id}
            onSelectAsset={(a) => setSelectedAsset(a)}
            height="h-full min-h-[500px]"
          />
        </div>

        {/* Right: Detailed Entity Inspector */}
        <div className="col-span-4 h-full overflow-y-auto p-4 rounded-xl bg-white border border-[#E5E7EB] font-sans space-y-4 shadow-xs">
          {selectedAsset ? (
            <>
              {/* Asset Header */}
              <div className="border-b border-slate-100 pb-3">
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
                <div className="text-lg font-bold text-slate-900 mt-1 font-display">{selectedAsset.name}</div>
                <div className="text-xs text-[#FF5722] font-mono font-semibold">{selectedAsset.id} // {selectedAsset.ip_address}</div>
              </div>

              {/* Action Triggers */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate(`/simulation?foothold=${selectedAsset.id}`)}
                  className="py-2 px-3 rounded-lg bg-[#FFF2EB] border border-[#FF5722]/40 text-[#FF5722] hover:bg-[#FFE5D6] transition-all text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  SET AS FOOTHOLD
                </button>
                <button
                  onClick={() => navigate(`/blast-radius?asset=${selectedAsset.id}`)}
                  className="py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  BLAST RADIUS
                </button>
              </div>

              {/* General Metadata */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">ZONE:</span>
                  <span className="text-slate-900 font-semibold">{selectedAsset.zone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">OPERATING SYSTEM:</span>
                  <span className="text-slate-900 font-semibold">{selectedAsset.os}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">DEPARTMENT:</span>
                  <span className="text-slate-900 font-semibold">{selectedAsset.department}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">IMPACT WEIGHT:</span>
                  <span className="text-amber-600 font-bold">{selectedAsset.criticality_score} / 10.0</span>
                </div>
              </div>

              {/* Running Services */}
              <div>
                <div className="text-xs font-bold text-slate-800 mb-1.5">OPEN SERVICES & PORTS</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAsset.services.map((svc, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#F8F9FA] text-slate-700 border border-[#E5E7EB] text-[11px] font-mono">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vulnerabilities */}
              <div>
                <div className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  VULNERABILITIES ({selectedAsset.vulnerabilities.length})
                </div>
                {selectedAsset.vulnerabilities.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedAsset.vulnerabilities.map((v, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-red-50/70 border border-red-200 text-xs">
                        <div className="flex items-center justify-between text-red-600 font-bold">
                          <span>{v.cve}</span>
                          <span>CVSS {v.cvss_score}</span>
                        </div>
                        <div className="text-slate-700 mt-0.5">{v.name}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">No known CVEs on this node.</div>
                )}
              </div>

              {/* Associated Identities */}
              <div>
                <div className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#FF5722]" />
                  ATTACHED IDENTITIES & SESSIONS
                </div>
                <div className="space-y-1.5">
                  {selectedAsset.identities.map((idId) => {
                    const ident = twin.identities.find((i) => i.id === idId);
                    return (
                      <div key={idId} className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-xs">
                        <div className="text-slate-900 font-bold">{ident?.name || idId}</div>
                        <div className="text-[10px] text-[#FF5722] flex justify-between mt-0.5 font-semibold font-mono">
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
