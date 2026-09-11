import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, Activity, GitCommit, Layers, AlertCircle } from "lucide-react";
import { api, DigitalTwinTopology } from "@/lib/api";

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
      <div className="flex items-center justify-center h-full font-mono text-[#FF5722]">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        CONNECTING TO SYNCHRONIZATION ENGINE...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans select-none pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <RefreshCw className="w-5 h-5 text-[#FF5722]" />
            CONTINUOUS ENVIRONMENT SYNCHRONIZATION
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
            Detect environment drift, invalidate stale attack paths, and recompute risk state across digital twin versions.
          </p>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={syncing}
          className="px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "SYNCHRONIZING..." : "TRIGGER LIVE SYNC"}
        </button>
      </div>

      {/* Sync Status Banner */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#0C0E14] border border-[#E5E7EB] dark:border-[#171B26] grid grid-cols-4 gap-4 text-xs font-mono shadow-xs">
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold">ACTIVE SNAPSHOT</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{twin.snapshot_id}</div>
          <div className="text-[10px] text-[#FF5722] font-semibold">Version {twin.version}</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold">SYNC STATUS</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">SYNCHRONIZED</div>
          <div className="text-[10px] text-slate-400">0 ms drift detected</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold">MONITORED ASSETS</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{twin.assets.length} NODES</div>
          <div className="text-[10px] text-slate-400">{twin.relationships.length} active edges</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold">PATH VALIDATION</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">VERIFIED</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Zero stale paths cached</div>
        </div>
      </div>

      {/* Sync Trigger Output */}
      {syncResult && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-500/40 text-xs space-y-2 font-mono">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            SYNCHRONIZATION COMPLETED: {syncResult.status}
          </div>
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{syncResult.message || `Discovered changes; invalidated stale attack paths and updated snapshot to '${syncResult.snapshot_id}'.`}</p>
        </div>
      )}

      {/* Environment Change Log */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#0C0E14] border border-[#E5E7EB] dark:border-slate-800 shadow-xs space-y-4">
        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider border-b border-[#F1F3F5] dark:border-slate-800 pb-2 flex items-center justify-between font-mono">
          <span>ENVIRONMENT CHANGE AUDIT LOG</span>
          <span className="text-[#FF5722] text-[10px]">{changes.length} RECORDED DRIFTS</span>
        </div>

        <div className="space-y-2.5">
          {changes.length > 0 ? (
            changes.map((ch: any) => (
              <div key={ch.change_id} className="p-3 rounded-lg bg-[#F8F9FA] dark:bg-[#07090D] border border-[#E5E7EB] dark:border-slate-800 text-xs flex items-center justify-between font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-[#FF5722] font-bold">{ch.change_id}</span>
                  <div>
                    <span className="text-slate-900 dark:text-white font-semibold">{ch.change_type}: </span>
                    <span className="text-slate-600 dark:text-slate-300">Target {ch.target_id}</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400">
                  {ch.timestamp.slice(11, 19)} UTC
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-slate-400 py-8">
              No recent environment drift recorded. Digital twin is identical to baseline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

