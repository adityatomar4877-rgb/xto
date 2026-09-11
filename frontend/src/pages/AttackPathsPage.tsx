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
      <div className="flex items-center justify-center h-full font-mono text-[#FF5722]">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        ANALYZING VIABLE ATTACK PATH TOPOLOGY...
      </div>
    );
  }

  const selectedPath = pathData?.paths?.[selectedPathIndex];

  return (
    <div className="space-y-4 font-sans text-slate-900 select-none pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-[#FF5722]" />
            ATTACK PATH ENGINE & CHOKEPOINT DISCOVERY
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Exhaustive graph path calculation, Dijkstra lowest-effort route, and critical cut-set chokepoint analysis.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          PATHS FOUND: <span className="text-red-600 font-bold">{pathData?.total_paths_found || 0} VIABLE ROUTES</span>
        </div>
      </div>

      {/* Query Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] flex items-center gap-4 text-xs shadow-xs">
        <div className="flex-1">
          <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
            ENTRY POINT (FOOTHOLD)
          </label>
          <select
            value={entryPoint}
            onChange={(e) => setEntryPoint(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-[#E5E7EB] text-slate-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#FF5722] font-semibold"
          >
            {twin.assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.id})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
            TARGET CROWN JEWEL
          </label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-[#E5E7EB] text-slate-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#FF5722] font-semibold"
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
            className="py-2 px-4 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] text-white font-semibold transition-all shadow-xs cursor-pointer text-xs"
          >
            RECALCULATE PATHS
          </button>
        </div>
      </div>

      {/* Chokepoint Warning Banner */}
      {pathData?.chokepoints && pathData.chokepoints.length > 0 && (
        <div className="p-4 rounded-xl bg-[#FFF2EB] border border-[#FF5722]/30 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF5722] text-white flex items-center justify-center font-bold">
              !
            </div>
            <div>
              <div className="font-bold text-slate-900">
                TOP GRAPH CHOKEPOINT DETECTED: {pathData.chokepoints[0].asset_name}
              </div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                Severing or micro-segmenting this single node eliminates {pathData.chokepoints[0].paths_eliminated_if_isolated_percent}% of all viable attack paths to the target.
              </div>
            </div>
          </div>
          <span className="text-[10.5px] px-3 py-1 rounded-full bg-white text-[#FF5722] border border-[#FF5722]/30 font-bold shadow-2xs">
            HIGH IMPACT FIX
          </span>
        </div>
      )}

      {/* Main Content: Path List (Left) + Selected Path Node Progression (Right) */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: Ranked Paths */}
        <div className="col-span-5 space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {pathData?.paths?.map((p: any, idx: number) => {
            const isSelected = selectedPathIndex === idx;
            return (
              <div
                key={p.path_id}
                onClick={() => setSelectedPathIndex(idx)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#FFF5EE] border-[#FF5722] text-slate-900 shadow-xs"
                    : "bg-white border-[#E5E7EB] text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900">
                    PATH #{idx + 1} ({p.hop_count} HOPS)
                  </span>
                  <span className="text-[10.5px] text-[#FF5722] font-semibold font-mono">
                    EFFORT: {p.attacker_effort_score}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">{p.summary}</div>
                <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                  <span className="text-red-600 font-semibold font-mono">{p.techniques_used.join(", ")}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Path Progression & Techniques Breakdown */}
        <div className="col-span-7 p-5 rounded-xl bg-white border border-[#E5E7EB] space-y-4 shadow-xs">
          {selectedPath ? (
            <>
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#FF5722] font-bold font-mono">
                    PATH SPECIFICATION: {selectedPath.path_id}
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedPath.summary}</div>
                </div>
                <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                  selectedPath.is_critical
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-slate-100 text-slate-700"
                }`}>
                  {selectedPath.is_critical ? "CRITICAL PATH" : "STANDARD"}
                </span>
              </div>

              {/* Node Sequence Chain */}
              <div className="space-y-2.5">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  TRANSITION HOP PROGRESSION
                </div>
                <div className="space-y-2">
                  {selectedPath.nodes.map((node: any, i: number) => (
                    <div key={node.id} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#FFF2EB] border border-[#FF5722]/30 text-[#FF5722] text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{node.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{node.id} // {node.zone} // {node.ip}</div>
                        </div>
                        <span className="text-[10px] text-amber-600 font-bold font-mono px-2 py-0.5 rounded bg-amber-50">{node.criticality}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Techniques & Evidence Mapping */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                  TRANSITION TECHNIQUES ENCOUNTERED
                </div>
                <div className="space-y-1.5">
                  {selectedPath.transitions.map((tr: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[#FF5722] font-bold">{tr.from_node} &rarr; {tr.to_node}</span>
                        <span className="text-slate-500">({tr.type})</span>
                      </div>
                      <span className="text-red-600 font-bold text-[11px] font-mono">{tr.technique_id} - {tr.technique_name}</span>
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
