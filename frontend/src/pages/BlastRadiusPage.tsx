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
      <div className="flex items-center justify-center h-full font-mono text-[#FF5722]">
        <Activity className="w-5 h-5 animate-spin mr-2" />
        PROPAGATING BLAST RADIUS MATRIX...
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans text-slate-900 select-none pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#FF5722] animate-pulse" />
            BLAST RADIUS PROPAGATION ENGINE
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Evaluate lateral propagation ripple, direct 1-hop reachability, and critical asset exposure if a given node is compromised.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          MODE: <span className="text-[#FF5722] font-bold">COMPROMISE IMPACT MODELING</span>
        </div>
      </div>

      {/* Asset Selector */}
      <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-between text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <label className="text-slate-700 font-semibold font-mono uppercase text-[11px]">
            WHAT HAPPENS IF THIS ASSET FALLS?
          </label>
          <select
            value={selectedAssetId}
            onChange={(e) => handleSelectAsset(e.target.value)}
            className="bg-[#F8F9FA] border border-[#E5E7EB] text-slate-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#FF5722] font-semibold"
          >
            {twin.assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.id} - {a.zone})
              </option>
            ))}
          </select>
        </div>

        {blastData && (
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-500">
              TOTAL REACHABLE: <strong className="text-slate-900">{blastData.total_reachable_assets} NODES</strong>
            </span>
            <span className="text-slate-500">
              EXPOSURE: <strong className="text-red-600 font-bold">{blastData.total_blast_radius_percent}%</strong>
            </span>
          </div>
        )}
      </div>

      {/* Metric Summary Ribbon */}
      {blastData && (
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="text-[10px] text-amber-600 uppercase font-mono font-bold">DIRECT 1-HOP REACHABILITY</div>
            <div className="text-2xl font-black text-slate-900 mt-1 font-display">{blastData.direct_impact_count} ASSETS</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Immediate lateral jump targets</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">TRANSITIVE K-HOP REACHABILITY</div>
            <div className="text-2xl font-black text-slate-900 mt-1 font-display">{blastData.indirect_impact_count} ASSETS</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Downstream network reachability</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="text-[10px] text-red-600 uppercase font-mono font-bold">CRITICAL CROWN JEWELS AT RISK</div>
            <div className="text-2xl font-black text-red-600 mt-1 font-display">{blastData.critical_crown_jewels_threatened.length} JEWELS</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tier-0 Domain & Backup systems</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="text-[10px] text-emerald-600 uppercase font-mono font-bold">TOTAL BLAST RADIUS</div>
            <div className="text-2xl font-black text-emerald-600 mt-1 font-display">{blastData.total_blast_radius_percent}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Percentage of entire digital twin</div>
          </div>
        </div>
      )}

      {/* Summary Briefing */}
      {blastData && (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-slate-700 leading-relaxed font-medium">
          <span className="font-bold text-amber-800 uppercase">PROPAGATION VERDICT: </span>
          {blastData.summary}
        </div>
      )}

      {/* Detailed Impact Breakdown */}
      {blastData && (
        <div className="grid grid-cols-2 gap-4">
          {/* Direct 1-Hop Impact List */}
          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-3 shadow-xs">
            <div className="text-xs text-amber-700 font-bold uppercase border-b border-slate-100 pb-2">
              DIRECT 1-HOP IMPACT ASSETS ({blastData.direct_impact_count})
            </div>
            <div className="space-y-2">
              {blastData.direct_impact_assets.map((a: any) => (
                <div key={a.id} className="p-3 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{a.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{a.id} // {a.zone}</div>
                  </div>
                  <span className="text-[10px] text-amber-700 font-bold font-mono px-2 py-0.5 rounded bg-amber-100/60">{a.criticality}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Crown Jewels Threatened */}
          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-3 shadow-xs">
            <div className="text-xs text-red-600 font-bold uppercase border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              CRITICAL CROWN JEWELS IN FIRE LINE ({blastData.critical_crown_jewels_threatened.length})
            </div>
            <div className="space-y-2">
              {blastData.critical_crown_jewels_threatened.map((cj: any) => (
                <div key={cj.id} className="p-3 rounded-lg bg-red-50/70 border border-red-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{cj.name}</div>
                    <div className="text-[10px] text-red-600 font-mono mt-0.5">{cj.id} // {cj.zone}</div>
                  </div>
                  <span className="text-[10px] text-red-700 font-bold font-mono">SCORE: {cj.criticality_score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
