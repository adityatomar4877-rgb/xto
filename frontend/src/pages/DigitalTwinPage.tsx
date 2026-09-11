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
import { motion, StaggerGroup, AnimatedCard, EASE } from "@/lib/animations";

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
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-[#FF5722]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <span className="text-[11px] font-mono text-[#A1A1AA]">Loading digital twin topology...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full flex flex-col font-sans select-none pb-4 text-[#18181B]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#18181B] font-display">
            Digital Twin
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Queryable environment model with typed directional reachability, identities, and trust boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#71717A]">
          <span className="px-2.5 py-1 rounded-lg bg-white border border-[#ECECEF]">
            SNAPSHOT: <span className="text-[#F25C1F] dark:text-[#FF6B3D] font-bold">{twin.snapshot_id}</span>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-[#ECECEF]">
            TOTAL ASSETS: <span className="text-[#18181B] font-bold">{twin.assets.length}</span>
          </span>
        </div>
      </motion.div>

      {/* Main Workspace: 3D Scene + Asset Inspector Drawer */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
        className="grid grid-cols-12 gap-6 flex-1 min-h-0"
      >
        {/* Left: Spatial 3D Scene */}
        <div className="col-span-8 h-full flex flex-col">
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

        {/* Right: Detailed Entity Inspector */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
          className="col-span-4 h-full overflow-y-auto p-6 rounded-2xl bg-white border border-[#ECECEF] font-sans space-y-8"
        >
          {selectedAsset ? (
            <>
              {/* Asset Header */}
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#71717A] font-mono font-medium">{selectedAsset.type}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono ${
                      selectedAsset.criticality === "CRITICAL"
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : selectedAsset.criticality === "HIGH"
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : "bg-slate-100 text-[#71717A] border border-slate-200"
                    }`}
                  >
                    {selectedAsset.criticality} CRITICALITY
                  </span>
                </div>
                <div className="text-lg font-bold text-[#18181B] mt-1 font-display">{selectedAsset.name}</div>
                <div className="text-xs text-[#F25C1F] dark:text-[#FF6B3D] font-mono font-semibold">{selectedAsset.id} // {selectedAsset.ip_address}</div>
              </div>

              {/* Action Triggers */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate(`/simulation?foothold=${selectedAsset.id}`)}
                  className="py-2 px-3 rounded-lg bg-[#FFF4ED] border border-[#FF5722]/40 text-[#F25C1F] dark:text-[#FF6B3D] hover:bg-[#FFE5D6] transition-all text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
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
                  <span className="text-[#71717A] font-medium">ZONE:</span>
                  <span className="text-[#18181B] font-semibold">{selectedAsset.zone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-[#71717A] font-medium">OPERATING SYSTEM:</span>
                  <span className="text-[#18181B] font-semibold">{selectedAsset.os}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-[#71717A] font-medium">DEPARTMENT:</span>
                  <span className="text-[#18181B] font-semibold">{selectedAsset.department}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-[#71717A] font-medium">IMPACT WEIGHT:</span>
                  <span className="text-amber-600 font-bold">{selectedAsset.criticality_score} / 10.0</span>
                </div>
              </div>

              {/* Running Services */}
              <div>
                <div className="text-[14px] font-bold text-slate-800 mb-1.5">OPEN SERVICES & PORTS</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAsset.services.map((svc, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#F5F5F5] text-slate-700 border border-[#ECECEF] text-[11px] font-mono">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vulnerabilities */}
              <div>
                <div className="text-[14px] font-bold text-slate-800 mb-1.5">
                  VULNERABILITIES ({selectedAsset.vulnerabilities.length})
                </div>
                {selectedAsset.vulnerabilities.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedAsset.vulnerabilities.map((v, i) => (
                      <motion.div key={i} whileHover={{ x: 2, transition: { duration: 0.15 } }} className="p-2.5 rounded-lg bg-red-50/70 border border-red-200 text-xs">
                        <div className="flex items-center justify-between text-red-600 font-bold">
                          <span>{v.cve}</span>
                          <span>CVSS {v.cvss_score}</span>
                        </div>
                        <div className="text-slate-700 mt-0.5">{v.name}</div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-[#A1A1AA]">No known CVEs on this node.</div>
                )}
              </div>

              {/* Associated Identities */}
              <div>
                <div className="text-[14px] font-bold text-slate-800 mb-1.5">
                  ATTACHED IDENTITIES & SESSIONS
                </div>
                <div className="space-y-1.5">
                  {selectedAsset.identities.map((idId) => {
                    const ident = twin.identities.find((i) => i.id === idId);
                    return (
                      <motion.div key={idId} whileHover={{ x: 2, transition: { duration: 0.15 } }} className="p-2.5 rounded-lg bg-[#F5F5F5] border border-[#ECECEF] text-xs">
                        <div className="text-[#18181B] font-bold">{ident?.name || idId}</div>
                        <div className="text-[10px] text-[#F25C1F] dark:text-[#FF6B3D] flex justify-between mt-0.5 font-semibold font-mono">
                          <span>ROLE: {ident?.role}</span>
                          <span>{ident?.privilege_level}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-[#A1A1AA] py-12">
              Select an asset node from the digital twin topology to inspect its security model.
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};
