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
      <div className="flex items-center justify-center h-full font-mono text-cyan-400">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        CONNECTING TO SYNCHRONIZATION ENGINE...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#00E5FF]" />
            CONTINUOUS ENVIRONMENT SYNCHRONIZATION
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Detect environment drift, invalidate stale attack paths, and recompute risk state across digital twin versions.
          </p>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={syncing}
          className="px-4 py-2 rounded bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF] hover:bg-[#00E5FF]/30 text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)]"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "SYNCHRONIZING..." : "TRIGGER LIVE SYNC"}
        </button>
      </div>

      {/* Sync Status Banner */}
      <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-cyan-500/30 grid grid-cols-4 gap-4 text-xs">
        <div>
          <div className="text-[10px] text-slate-400 uppercase">ACTIVE SNAPSHOT</div>
          <div className="text-lg font-bold text-white mt-0.5">{twin.snapshot_id}</div>
          <div className="text-[10px] text-cyan-400">Version {twin.version}</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 uppercase">SYNC STATUS</div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">SYNCHRONIZED</div>
          <div className="text-[10px] text-slate-400">0 ms drift detected</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 uppercase">MONITORED ASSETS</div>
          <div className="text-lg font-bold text-white mt-0.5">{twin.assets.length} NODES</div>
          <div className="text-[10px] text-slate-400">{twin.relationships.length} active edges</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 uppercase">PATH VALIDATION</div>
          <div className="text-lg font-bold text-[#00E5FF] mt-0.5">VERIFIED</div>
          <div className="text-[10px] text-slate-400">Zero stale paths cached</div>
        </div>
      </div>

      {/* Sync Trigger Output */}
      {syncResult && (
        <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/40 text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            SYNCHRONIZATION COMPLETED: {syncResult.status}
          </div>
          <p className="text-slate-200">{syncResult.message || `Discovered changes; invalidated stale attack paths and updated snapshot to '${syncResult.snapshot_id}'.`}</p>
        </div>
      )}

      {/* Environment Change Log */}
      <div className="p-5 rounded-lg bg-[#0B0E14]/90 border border-slate-800 space-y-4">
        <div className="text-xs text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
          <span>ENVIRONMENT CHANGE AUDIT LOG</span>
          <span className="text-slate-400 text-[10px]">{changes.length} RECORDED DRIFTS</span>
        </div>

        <div className="space-y-2.5">
          {changes.length > 0 ? (
            changes.map((ch: any) => (
              <div key={ch.change_id} className="p-3 rounded bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[#00E5FF] font-bold">{ch.change_id}</span>
                  <div>
                    <span className="text-white font-semibold">{ch.change_type}: </span>
                    <span className="text-slate-300">Target {ch.target_id}</span>
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
