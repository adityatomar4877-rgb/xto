import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Radio, AlertTriangle, ShieldAlert, ArrowRight, Activity, User } from "lucide-react";
import { api, DigitalTwinTopology } from "@/lib/api";

export const BlastRadiusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [twin, setTwin] = useState<DigitalTwinTopology | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    searchParams.get("asset") || "WS-ENG-04"
  );
  const [blastData, setBlastData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [calculating, setCalculating] = useState<boolean>(false);

  const fetchBlast = async (aid: string) => {
    setCalculating(true);
    try {
      const data = await api.getBlastRadius(aid);
      setBlastData(data);
    } catch (err) {
      console.error("Blast radius error:", err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    api.getTwin()
      .then((t) => {
        setTwin(t);
        return fetchBlast(selectedAssetId);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectAsset = (aid: string) => {
    setSelectedAssetId(aid);
    fetchBlast(aid);
  };

  if (loading || !twin) {
    return (
      <div className="flex items-center justify-center h-full font-mono text-cyan-400">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        PROPAGATING BLAST RADIUS MATRIX...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            BLAST RADIUS PROPAGATION ENGINE
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate lateral propagation ripple, direct 1-hop reachability, and critical asset exposure if a given node is compromised.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          MODE: <span className="text-amber-400 font-bold">COMPROMISE IMPACT MODELING</span>
        </div>
      </div>

      {/* Asset Selector */}
      <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <label className="text-slate-300 font-bold uppercase">WHAT HAPPENS IF THIS ASSET FALLS?</label>
          <select
            value={selectedAssetId}
            onChange={(e) => handleSelectAsset(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white rounded px-3 py-1.5 text-xs outline-none focus:border-amber-400"
          >
            {twin.assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.id} - {a.zone})
              </option>
            ))}
          </select>
        </div>

        {blastData && (
          <div className="flex items-center gap-4 text-xs">
            <span>
              TOTAL REACHABLE: <strong className="text-white">{blastData.total_reachable_assets} NODES</strong>
            </span>
            <span>
              INFRASTRUCTURE EXPOSURE: <strong className="text-red-400 font-bold">{blastData.total_blast_radius_percent}%</strong>
            </span>
          </div>
        )}
      </div>

      {/* Metric Summary Ribbon */}
      {blastData && (
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-amber-500/30">
            <div className="text-[10px] text-amber-400 uppercase font-bold">DIRECT 1-HOP REACHABILITY</div>
            <div className="text-2xl font-bold text-white mt-1">{blastData.direct_impact_count} ASSETS</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Immediate lateral jump targets</div>
          </div>

          <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-cyan-500/30">
            <div className="text-[10px] text-cyan-400 uppercase font-bold">TRANSITIVE K-HOP REACHABILITY</div>
            <div className="text-2xl font-bold text-white mt-1">{blastData.indirect_impact_count} ASSETS</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Downstream network reachability</div>
          </div>

          <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-red-500/30">
            <div className="text-[10px] text-red-400 uppercase font-bold">CRITICAL CROWN JEWELS AT RISK</div>
            <div className="text-2xl font-bold text-red-400 mt-1">{blastData.critical_crown_jewels_threatened.length} JEWELS</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tier-0 Domain & Backup systems</div>
          </div>

          <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">TOTAL BLAST RADIUS</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{blastData.total_blast_radius_percent}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Percentage of entire digital twin</div>
          </div>
        </div>
      )}

      {/* Summary Briefing */}
      {blastData && (
        <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs text-slate-200 leading-relaxed">
          <span className="font-bold text-amber-400 uppercase">PROPAGATION VERDICT: </span>
          {blastData.summary}
        </div>
      )}

      {/* Detailed Impact Breakdown */}
      {blastData && (
        <div className="grid grid-cols-2 gap-6">
          {/* Direct 1-Hop Impact List */}
          <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-slate-800 space-y-3">
            <div className="text-xs text-amber-400 font-bold uppercase border-b border-slate-800 pb-2">
              DIRECT 1-HOP IMPACT ASSETS ({blastData.direct_impact_count})
            </div>
            <div className="space-y-2">
              {blastData.direct_impact_assets.map((a: any) => (
                <div key={a.id} className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{a.name}</div>
                    <div className="text-[10px] text-slate-400">{a.id} // {a.zone}</div>
                  </div>
                  <span className="text-[10px] text-amber-400 font-semibold">{a.criticality}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Crown Jewels Threatened */}
          <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-red-500/30 space-y-3">
            <div className="text-xs text-red-400 font-bold uppercase border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              CRITICAL CROWN JEWELS IN FIRE LINE ({blastData.critical_crown_jewels_threatened.length})
            </div>
            <div className="space-y-2">
              {blastData.critical_crown_jewels_threatened.map((cj: any) => (
                <div key={cj.id} className="p-2.5 rounded bg-red-950/30 border border-red-500/30 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{cj.name}</div>
                    <div className="text-[10px] text-red-300">{cj.id} // {cj.zone}</div>
                  </div>
                  <span className="text-[10px] text-red-400 font-bold">SCORE: {cj.criticality_score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
