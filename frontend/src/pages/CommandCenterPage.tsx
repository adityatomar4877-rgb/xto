import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Tactical3DScene } from "@/components/Tactical3DScene";
import { api, HealthResponse, DigitalTwinTopology, ThreatVector, RemediationPriority, ResilienceScoreResult } from "@/lib/api";
import { StaggerGroup, AnimatedCard, AnimatedNumber, itemVariants, EASE } from "@/lib/animations";

export const CommandCenterPage: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [twin, setTwin] = useState<DigitalTwinTopology | null>(null);
  const [threats, setThreats] = useState<ThreatVector[]>([]);
  const [remediations, setRemediations] = useState<RemediationPriority[]>([]);
  const [resilience, setResilience] = useState<ResilienceScoreResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.getHealth(),
      api.getTwin(),
      api.getThreatVectors(),
      api.getRemediationPriorities(),
      api.getResilience(),
    ]).then((results) => {
      if (results[0].status === "fulfilled") setHealth(results[0].value);
      if (results[1].status === "fulfilled") setTwin(results[1].value);
      if (results[2].status === "fulfilled") setThreats(results[2].value);
      if (results[3].status === "fulfilled") setRemediations(results[3].value);
      if (results[4].status === "fulfilled") setResilience(results[4].value);
      setLoading(false);
    });
  }, []);

  const assetCount = health?.assets_loaded ?? twin?.assets.length ?? 0;
  const criticalThreats = threats.filter((t) => t.severity === "CRITICAL" || t.severity === "HIGH");
  const topRemediations = remediations.slice(0, 4);

  const resilienceScore = Math.round(resilience?.resilience_score ?? 0);
  const resilienceColor =
    resilienceScore >= 70 ? "#22C55E" : resilienceScore >= 40 ? "#F59E0B" : "#EF4444";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-[#F25C1F] dark:bg-[#FF6B3D]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <span className="text-[12px] text-[#A1A1AA]">Connecting...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex items-center justify-between pt-2"
      >
        <div>
          <h1 className="text-[28px] font-bold tracking-tight font-display">Command Center</h1>
          <p className="text-[14px] text-[#71717A] dark:text-[#9B9BA4] mt-1">
            {health?.status === "ONLINE"
              ? `${assetCount} assets · live digital twin`
              : "Backend offline"}
          </p>
        </div>
        <Link
          to="/simulation"
          className="px-4 py-2.5 rounded-xl bg-[#18181B] dark:bg-white dark:text-[#18181B] text-white text-[13px] font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Target className="w-4 h-4" />
          Run Simulation
        </Link>
      </motion.div>

      {/* Topology — full width, lots of breathing room */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: EASE }}
      >
        <Tactical3DScene
          height="h-[420px]"
          assets={twin?.assets}
          relationships={twin?.relationships}
        />
      </motion.div>

      {/* Two-column: Resilience + Threats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: EASE }}
        className="grid grid-cols-2 gap-8"
      >
        {/* Resilience */}
        <div className="card-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-[#F25C1F] dark:text-[#FF6B3D]" />
            <span className="text-[14px] font-bold">Resilience</span>
            <span
              className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ml-auto"
              style={{ color: resilienceColor, background: `${resilienceColor}15` }}
            >
              {resilience?.posture_rating ?? "—"}
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#F5F5F5" className="dark:stroke-[#1A1A1E]" strokeWidth="6" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={resilienceColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: 2 * Math.PI * 42, strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: (2 * Math.PI * 42) * (1 - resilienceScore / 100) }}
                  transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatedNumber value={resilienceScore} className="text-[28px] font-bold font-display" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {resilience && [
                { label: "Path Redundancy", val: resilience.factor_breakdown.path_redundancy_score },
                { label: "Chokepoint", val: resilience.factor_breakdown.chokepoint_mitigation_score },
                { label: "Control Density", val: resilience.factor_breakdown.control_density_score },
                { label: "Defense Depth", val: resilience.factor_breakdown.depth_defense_score },
                { label: "Privilege", val: resilience.factor_breakdown.privilege_tiering_score },
              ].map((f) => (
                <div key={f.label} className="flex items-center justify-between text-[12px]">
                  <span className="text-[#71717A] dark:text-[#9B9BA4]">{f.label}</span>
                  <span className="font-mono font-semibold text-[#18181B] dark:text-[#FAFAFA]">{f.val.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Threats */}
        <div className="card-border p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[14px] font-bold">Critical Threats</span>
            <Link to="/threat-vectors" className="text-[12px] text-[#F25C1F] dark:text-[#FF6B3D] hover:underline font-medium flex items-center gap-0.5">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <StaggerGroup className="space-y-3">
            {criticalThreats.slice(0, 5).map((t) => {
              const isCrit = t.severity === "CRITICAL";
              return (
                <motion.div key={t.id} variants={itemVariants} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isCrit ? "bg-[#EF4444]" : "bg-[#F59E0B]"}`} />
                    <span className="text-[13px] text-[#71717A] dark:text-[#9B9BA4] truncate">{t.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#A1A1AA] ml-2 flex-shrink-0">
                    {t.severity}
                  </span>
                </motion.div>
              );
            })}
            {criticalThreats.length === 0 && (
              <div className="text-[13px] text-[#A1A1AA] py-2">No critical threats.</div>
            )}
          </StaggerGroup>
        </div>
      </motion.div>

      {/* Remediation — single clean list */}
      {topRemediations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
          className="card-border p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <span className="text-[14px] font-bold">Top Remediations</span>
            <Link to="/remediation" className="text-[12px] text-[#F25C1F] dark:text-[#FF6B3D] hover:underline font-medium">
              View all →
            </Link>
          </div>
          <StaggerGroup className="space-y-1">
            {topRemediations.map((item) => (
              <motion.div
                key={item.rank}
                variants={itemVariants}
                whileHover={{ x: 2 }}
                className="flex items-center gap-4 py-2.5 px-2 rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1E] transition-colors"
              >
                <span className="text-[11px] font-mono text-[#A1A1AA] w-5">{item.rank}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[#18181B] dark:text-[#FAFAFA] truncate">
                    {item.control_name}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 text-[12px] font-mono">
                  <span className="text-[#22C55E] font-semibold">−{item.critical_paths_eliminated} paths</span>
                  <span className="text-[#A1A1AA]">{Math.round(item.blast_radius_reduction_percent)}%</span>
                </div>
              </motion.div>
            ))}
          </StaggerGroup>
        </motion.div>
      )}
    </div>
  );
};
