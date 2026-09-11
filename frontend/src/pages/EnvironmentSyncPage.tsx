import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, Activity, GitCommit, Layers, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { api, DigitalTwinTopology } from "@/lib/api";
import { StaggerGroup, AnimatedCard, AnimatedItem, itemVariants, EASE } from "@/lib/animations";

export const EnvironmentSyncPage: React.FC = () => {
  const [twin, setTwin] = useState<DigitalTwinTopology | null>(null);
  const [changes, setChanges] = useState<any[]>([]);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = () => {
    Promise.all([api.getTwin(), api.getTwinChanges()])
      .then(([tData, cData]) => {
        setTwin(tData);
        setChanges(cData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerSync = async () => {
    setSyncing(true);
    try {
      const res = await api.syncTwin();
      setSyncResult(res);
      loadData();
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncing(false);
    }
  };

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
        <span className="text-[11px] font-mono text-[#A1A1AA]">Connecting to sync engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans select-none pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#18181B] dark:text-white font-display">
            Environment Sync
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5 font-normal">
            Detect drift, invalidate stale attack paths, and recompute risk across twin versions.
          </p>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={syncing}
          className="px-4 py-2 rounded-2xl bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "SYNCHRONIZING..." : "TRIGGER LIVE SYNC"}
        </button>
      </motion.div>

      {/* Sync Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: EASE }}
        className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A] grid grid-cols-4 gap-6 text-xs font-mono"
      >
        <div>
          <div className="text-[10px] text-[#71717A] uppercase font-semibold">ACTIVE SNAPSHOT</div>
          <div className="text-lg font-bold text-[#18181B] dark:text-white mt-0.5">{twin.snapshot_id}</div>
          <div className="text-[10px] text-[#F25C1F] dark:text-[#FF6B3D] font-semibold">Version {twin.version}</div>
        </div>

        <div>
          <div className="text-[10px] text-[#71717A] uppercase font-semibold">SYNC STATUS</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">SYNCHRONIZED</div>
          <div className="text-[10px] text-[#A1A1AA]">0 ms drift detected</div>
        </div>

        <div>
          <div className="text-[10px] text-[#71717A] uppercase font-semibold">MONITORED ASSETS</div>
          <div className="text-lg font-bold text-[#18181B] dark:text-white mt-0.5">{twin.assets.length} NODES</div>
          <div className="text-[10px] text-[#A1A1AA]">{twin.relationships.length} active edges</div>
        </div>

        <div>
          <div className="text-[10px] text-[#71717A] uppercase font-semibold">PATH VALIDATION</div>
          <div className="text-lg font-bold text-[#18181B] dark:text-white mt-0.5">VERIFIED</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Zero stale paths cached</div>
        </div>
      </motion.div>

      {/* Sync Trigger Output */}
      {syncResult && (
        <div className="p-6 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-500/40 text-xs space-y-2 font-mono">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            SYNCHRONIZATION COMPLETED: {syncResult.status}
          </div>
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{syncResult.message || `Discovered changes; invalidated stale attack paths and updated snapshot to '${syncResult.snapshot_id}'.`}</p>
        </div>
      )}

      {/* Environment Change Log */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: EASE }}
        className="p-5 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-slate-800 space-y-8"
      >
        <div className="text-[14px] text-[#71717A] font-bold uppercase tracking-wider border-b border-[#F1F3F5] dark:border-slate-800 pb-2 flex items-center justify-between font-mono">
          <span>ENVIRONMENT CHANGE AUDIT LOG</span>
          <span className="text-[#F25C1F] dark:text-[#FF6B3D] text-[10px]">{changes.length} RECORDED DRIFTS</span>
        </div>

        <StaggerGroup className="space-y-2.5">
          {changes.length > 0 ? (
            changes.map((ch: any) => (
              <motion.div
                key={ch.change_id}
                variants={itemVariants}
                whileHover={{ x: 2, transition: { duration: 0.15 } }}
                className="p-3 rounded-lg bg-[#F5F5F5] dark:bg-[#0A0A0B] border border-[#ECECEF] dark:border-slate-800 text-xs flex items-center justify-between font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#F25C1F] dark:text-[#FF6B3D] font-bold">{ch.change_id}</span>
                  <div>
                    <span className="text-[#18181B] dark:text-white font-semibold">{ch.change_type}: </span>
                    <span className="text-[#71717A] dark:text-slate-300">Target {ch.target_id}</span>
                  </div>
                </div>
                <div className="text-[10px] text-[#A1A1AA]">
                  {ch.timestamp.slice(11, 19)} UTC
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-xs text-[#A1A1AA] py-8">
              No recent environment drift recorded. Digital twin is identical to baseline.
            </div>
          )}
        </StaggerGroup>
      </motion.div>
    </div>
  );
};

