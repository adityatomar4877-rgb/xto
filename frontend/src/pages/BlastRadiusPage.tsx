import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Radio, AlertTriangle, ShieldAlert, ArrowRight, Activity, User, KeyRound } from "lucide-react";
import { api, DigitalTwinTopology, BlastRadiusResponse } from "@/lib/api";
import { motion, StaggerGroup, AnimatedCard, AnimatedNumber, EASE } from "@/lib/animations";

export const BlastRadiusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [twin, setTwin] = useState<DigitalTwinTopology | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    searchParams.get("asset") || "WS-ENG-04"
  );
  const [blastData, setBlastData] = useState<BlastRadiusResponse | null>(null);
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
        <span className="text-[11px] font-mono text-[#A1A1AA]">Propagating blast radius...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-[#18181B] select-none pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#18181B] font-display">
            Blast Radius
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5 font-normal">
            Lateral propagation ripple, direct 1-hop reachability, and critical asset exposure if a node is compromised.
          </p>
        </div>

        <div className="text-xs text-[#71717A] font-mono">
          MODE: <span className="text-[#F25C1F] dark:text-[#FF6B3D] font-bold">COMPROMISE IMPACT MODELING</span>
        </div>
      </motion.div>

      {/* Asset Selector */}
      <div className="p-6 rounded-2xl bg-white border border-[#ECECEF] flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <label className="text-slate-700 font-semibold font-mono uppercase text-[11px]">
            WHAT HAPPENS IF THIS ASSET FALLS?
          </label>
          <select
            value={selectedAssetId}
            onChange={(e) => handleSelectAsset(e.target.value)}
            className="bg-[#F5F5F5] border border-[#ECECEF] text-slate-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#FF5722] font-semibold"
          >
            {twin.assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.id} - {a.zone})
              </option>
            ))}
          </select>
        </div>

        {blastData && (
          <div className="flex items-center gap-6 text-xs font-mono">
            <span className="text-[#71717A]">
              TOTAL REACHABLE: <strong className="text-[#18181B]">{blastData.total_reachable_assets} NODES</strong>
            </span>
            <span className="text-[#71717A]">
              EXPOSURE: <strong className="text-red-600 font-bold">{blastData.total_blast_radius_percent}%</strong>
            </span>
          </div>
        )}
      </div>

      {/* Metric Summary Ribbon */}
      {blastData && (
        <StaggerGroup className="grid grid-cols-4 gap-6">
          <AnimatedCard className="p-6 rounded-2xl bg-white border border-[#ECECEF]" hover hoverY={-2}>
            <div className="text-[10px] text-amber-600 uppercase font-mono font-bold">DIRECT 1-HOP REACHABILITY</div>
            <AnimatedNumber value={blastData.direct_impact_count} suffix=" ASSETS" className="text-2xl font-black text-[#18181B] mt-1 font-display" />
            <div className="text-[11px] text-[#A1A1AA] mt-0.5">Immediate lateral jump targets</div>
          </AnimatedCard>

          <AnimatedCard className="p-6 rounded-2xl bg-white border border-[#ECECEF]" hover hoverY={-2}>
            <div className="text-[10px] text-[#71717A] uppercase font-mono font-bold">TRANSITIVE K-HOP REACHABILITY</div>
            <AnimatedNumber value={blastData.indirect_impact_count} suffix=" ASSETS" className="text-2xl font-black text-[#18181B] mt-1 font-display" />
            <div className="text-[11px] text-[#A1A1AA] mt-0.5">Downstream network reachability</div>
          </AnimatedCard>

          <AnimatedCard className="p-6 rounded-2xl bg-white border border-[#ECECEF]" hover hoverY={-2}>
            <div className="text-[10px] text-red-600 uppercase font-mono font-bold">CRITICAL CROWN JEWELS AT RISK</div>
            <AnimatedNumber value={blastData.critical_crown_jewels_threatened.length} suffix=" JEWELS" className="text-2xl font-black text-red-600 mt-1 font-display" />
            <div className="text-[11px] text-[#A1A1AA] mt-0.5">Tier-0 Domain & Backup systems</div>
          </AnimatedCard>

          <AnimatedCard className="p-6 rounded-2xl bg-white border border-[#ECECEF]" hover hoverY={-2}>
            <div className="text-[10px] text-emerald-600 uppercase font-mono font-bold">TOTAL BLAST RADIUS</div>
            <AnimatedNumber value={blastData.total_blast_radius_percent} suffix="%" className="text-2xl font-black text-emerald-600 mt-1 font-display" />
            <div className="text-[11px] text-[#A1A1AA] mt-0.5">Percentage of entire digital twin</div>
          </AnimatedCard>
        </StaggerGroup>
      )}

      {/* Summary Briefing */}
      {blastData && (
        <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-slate-700 leading-relaxed font-medium">
          <span className="font-bold text-amber-800 uppercase">PROPAGATION VERDICT: </span>
          {blastData.summary}
        </div>
      )}

      {/* Detailed Impact Breakdown */}
      {blastData && (
        <div className="grid grid-cols-2 gap-6">
          {/* Direct 1-Hop Impact List */}
          <AnimatedCard className="p-6 rounded-2xl bg-white border border-[#ECECEF] space-y-3">
            <div className="text-[14px] text-amber-700 font-bold uppercase border-b border-slate-100 pb-2">
              DIRECT 1-HOP IMPACT ASSETS ({blastData.direct_impact_count})
            </div>
            <div className="space-y-2">
              {blastData.direct_impact_assets.map((a) => (
                <motion.div key={a.id} whileHover={{ x: 2, transition: { duration: 0.15 } }} className="p-3 rounded-lg bg-[#F5F5F5] border border-[#ECECEF] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#18181B]">{a.name}</div>
                    <div className="text-[10px] text-[#71717A] font-mono mt-0.5">{a.id} // {a.zone}</div>
                  </div>
                  <span className="text-[10px] text-amber-700 font-bold font-mono px-2 py-0.5 rounded bg-amber-100/60">{a.criticality}</span>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>

          {/* Critical Crown Jewels Threatened */}
          <AnimatedCard className="p-6 rounded-2xl bg-white border border-[#ECECEF] space-y-3">
            <div className="text-[14px] text-red-600 font-bold uppercase border-b border-slate-100 pb-2">
              CRITICAL CROWN JEWELS IN FIRE LINE ({blastData.critical_crown_jewels_threatened.length})
            </div>
            <div className="space-y-2">
              {blastData.critical_crown_jewels_threatened.map((cj) => (
                <motion.div key={cj.id} whileHover={{ x: 2, transition: { duration: 0.15 } }} className="p-3 rounded-lg bg-red-50/70 border border-red-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#18181B]">{cj.name}</div>
                    <div className="text-[10px] text-red-600 font-mono mt-0.5">
                      {cj.id} // {cj.zone} // HOP {cj.hop_distance}
                    </div>
                  </div>
                  <span className="text-[10px] text-red-700 font-bold font-mono">SCORE: {cj.criticality_score}</span>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>
        </div>
      )}

      {/* Affected Identities & Privilege Escalation */}
      {blastData && blastData.affected_identities && blastData.affected_identities.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {/* Affected Identities */}
          <AnimatedCard className="p-6 rounded-2xl bg-white border border-[#ECECEF] space-y-3">
            <div className="text-[14px] text-[#F25C1F] dark:text-[#FF6B3D] font-bold uppercase border-b border-slate-100 pb-2">
              AFFECTED IDENTITIES ({blastData.affected_identities.length})
            </div>
            <div className="space-y-2">
              {blastData.affected_identities.map((id) => (
                <motion.div key={id.id} whileHover={{ x: 2, transition: { duration: 0.15 } }} className="p-3 rounded-lg bg-[#F5F5F5] border border-[#ECECEF] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#18181B]">{id.name}</div>
                    <div className="text-[10px] text-[#71717A] font-mono mt-0.5">{id.role}</div>
                  </div>
                  <span className="text-[10px] text-[#F25C1F] dark:text-[#FF6B3D] font-bold font-mono px-2 py-0.5 rounded bg-[#FFF4ED] border border-[#FF5722]/20">
                    {id.privilege}
                  </span>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>

          {/* Privilege Escalation Opportunities */}
          <AnimatedCard className="p-6 rounded-2xl bg-white border border-[#ECECEF] space-y-3">
            <div className="text-[14px] text-purple-600 font-bold uppercase border-b border-slate-100 pb-2">
              PRIVILEGE ESCALATION OPPORTUNITIES ({blastData.privilege_escalation_opportunities.length})
            </div>
            <div className="space-y-2">
              {blastData.privilege_escalation_opportunities.map((pe: any, i: number) => (
                <motion.div key={i} whileHover={{ x: 2, transition: { duration: 0.15 } }} className="p-3 rounded-lg bg-purple-50/70 border border-purple-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#18181B]">{pe.identity_name}</div>
                    <div className="text-[10px] text-[#71717A] mt-0.5">{pe.mechanism}</div>
                  </div>
                  <span className="text-[10px] text-purple-700 font-bold font-mono px-2 py-0.5 rounded bg-purple-100/60">
                    {pe.privilege}
                  </span>
                </motion.div>
              ))}
              {blastData.privilege_escalation_opportunities.length === 0 && (
                <div className="text-xs text-[#A1A1AA] py-2">No escalation opportunities detected.</div>
              )}
            </div>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
};
