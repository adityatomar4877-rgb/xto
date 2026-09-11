import React, { useState, useEffect } from "react";
import { GitCommit, ShieldAlert, ArrowRight, CheckCircle2, Activity, Filter } from "lucide-react";
import { api, DigitalTwinTopology } from "@/lib/api";

export const AttackPathsPage: React.FC = () => {
  const [twin, setTwin] = useState<DigitalTwinTopology | null>(null);
  const [entryPoint, setEntryPoint] = useState<string>("WS-ENG-04");
  const [target, setTarget] = useState<string>("VAULT-BACKUP-01");
  const [pathData, setPathData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPathIndex, setSelectedPathIndex] = useState<number>(0);

  const fetchPaths = async (src: string, tgt: string) => {
    try {
      const data = await api.getAttackPaths(src, tgt);
      setPathData(data);
      setSelectedPathIndex(0);
    } catch (err) {
      console.error("Path search error:", err);
    }
  };

  useEffect(() => {
    api.getTwin()
      .then((t) => {
        setTwin(t);
        return fetchPaths(entryPoint, target);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    fetchPaths(entryPoint, target);
  };

  if (loading || !twin) {
    return (
      <div className="flex items-center justify-center h-full font-mono text-cyan-400">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        ANALYZING VIABLE ATTACK PATH TOPOLOGY...
      </div>
    );
  }

  const selectedPath = pathData?.paths?.[selectedPathIndex];

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-[#00E5FF]" />
            ATTACK PATH ENGINE & CHOKEPOINT DISCOVERY
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Exhaustive graph path calculation, Dijkstra lowest-effort route, and critical cut-set chokepoint analysis.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          PATHS FOUND: <span className="text-red-400 font-bold">{pathData?.total_paths_found || 0} VIABLE ROUTES</span>
        </div>
      </div>

      {/* Query Bar */}
      <div className="p-3.5 rounded-lg bg-[#0B0E14]/90 border border-slate-800 flex items-center gap-4 text-xs">
        <div className="flex-1">
          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">ENTRY POINT (FOOTHOLD)</label>
          <select
            value={entryPoint}
            onChange={(e) => setEntryPoint(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white rounded px-2.5 py-1 text-xs outline-none focus:border-[#00E5FF]"
          >
            {twin.assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.id})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">TARGET CROWN JEWEL</label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white rounded px-2.5 py-1 text-xs outline-none focus:border-[#00E5FF]"
          >
            {twin.assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.id})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="py-1.5 px-4 rounded bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF] hover:bg-[#00E5FF]/30 font-bold transition-all"
          >
            RECALCULATE PATHS
          </button>
        </div>
      </div>

      {/* Chokepoint Warning Banner */}
      {pathData?.chokepoints && pathData.chokepoints.length > 0 && (
        <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cyan-950 border border-[#00E5FF]/50 text-[#00E5FF] flex items-center justify-center font-bold">
              !
            </div>
            <div>
              <div className="font-bold text-white">TOP GRAPH CHOKEPOINT DETECTED: {pathData.chokepoints[0].asset_name}</div>
              <div className="text-slate-300 text-[11px] mt-0.5">
                Severing or micro-segmenting this single node eliminates {pathData.chokepoints[0].paths_eliminated_if_isolated_percent}% of all viable attack paths to the target.
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 font-bold">
            HIGH IMPACT FIX
          </span>
        </div>
      )}

      {/* Main Content: Path List (Left) + Selected Path Node Progression (Right) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Ranked Paths */}
        <div className="col-span-5 space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {pathData?.paths?.map((p: any, idx: number) => {
            const isSelected = selectedPathIndex === idx;
            return (
              <div
                key={p.path_id}
                onClick={() => setSelectedPathIndex(idx)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#00E5FF]/15 border-[#00E5FF]/50 text-white shadow-[0_0_12px_rgba(0,229,255,0.15)]"
                    : "bg-[#0B0E14]/80 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white">
                    PATH #{idx + 1} ({p.hop_count} HOPS)
                  </span>
                  <span className="text-[10px] text-cyan-400 font-semibold">
                    EFFORT: {p.attacker_effort_score}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">{p.summary}</div>
                <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                  <span className="text-red-400 font-semibold">{p.techniques_used.join(", ")}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Path Progression & Techniques Breakdown */}
        <div className="col-span-7 p-5 rounded-lg bg-[#0B0E14]/90 border border-cyan-950/40 space-y-4">
          {selectedPath ? (
            <>
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-cyan-400 font-bold">PATH SPECIFICATION: {selectedPath.path_id}</div>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedPath.summary}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/30 text-xs font-bold">
                  {selectedPath.is_critical ? "CRITICAL PATH" : "STANDARD"}
                </span>
              </div>

              {/* Node Sequence Chain */}
              <div className="space-y-3">
                <div className="text-xs text-slate-400 font-bold uppercase">TRANSITION HOP PROGRESSION</div>
                <div className="space-y-2">
                  {selectedPath.nodes.map((node: any, i: number) => (
                    <div key={node.id} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{node.name}</div>
                          <div className="text-[10px] text-slate-400">{node.id} // {node.zone} // {node.ip}</div>
                        </div>
                        <span className="text-[10px] text-amber-400 font-semibold">{node.criticality}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Techniques & Evidence Mapping */}
              <div className="pt-3 border-t border-slate-800">
                <div className="text-xs text-slate-400 font-bold uppercase mb-2">TRANSITION TECHNIQUES ENCOUNTERED</div>
                <div className="space-y-1.5">
                  {selectedPath.transitions.map((tr: any, idx: number) => (
                    <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">{tr.from_node} &rarr; {tr.to_node}</span>
                        <span className="text-slate-300">({tr.type})</span>
                      </div>
                      <span className="text-red-400 font-bold text-[11px]">{tr.technique_id} - {tr.technique_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-slate-400 py-12">
              Select a viable attack path on the left to inspect its transitions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
