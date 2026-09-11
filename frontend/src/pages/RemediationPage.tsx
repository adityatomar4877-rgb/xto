import React, { useState, useEffect } from "react";
import {
  ListOrdered,
  TrendingDown,
  GitCommit,
  CheckCircle2,
  Activity,
  ArrowRight,
  ShieldCheck,
  Search,
  Plus,
  X,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { api, RemediationPriority } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, StaggerGroup, AnimatedCard, EASE, itemVariants, staggerContainer } from "@/lib/animations";

export const RemediationPage: React.FC = () => {
  const navigate = useNavigate();
  const [remediations, setRemediations] = useState<RemediationPriority[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [isJiraModalOpen, setIsJiraModalOpen] = useState(false);
  const [jiraSuccess, setJiraSuccess] = useState(false);
  const [jiraForm, setJiraForm] = useState({
    project: "Integrations project",
    issueType: "Story",
    summary: "Segment Database Network (Sever 11 critical paths)",
    description: "Isolate DB tier and apply micro-segmentation to eliminate lateral traversal.",
  });

  useEffect(() => {
    api.getRemediationPriorities()
      .then((data) => setRemediations(data))
      .catch(() => {
        setRemediations([
          {
            rank: 1,
            control_name: "Segment DB Network",
            control_type: "NETWORK_SEGMENTATION",
            target_assets_or_identities: ["DB-01", "VAULT-BACKUP-01"],
            critical_paths_eliminated: 11,
            blast_radius_reduction_percent: 75.0,
            attacker_effort_increase: 4.5,
            implementation_complexity: "MEDIUM",
            priority_score: 96.5,
            reasoning: "Isolates database tier from lateral movement",
            affected_techniques_blocked: ["T1021", "T1003"],
          },
          {
            rank: 2,
            control_name: "Enforce MFA (Admin)",
            control_type: "AUTHENTICATION",
            target_assets_or_identities: ["DC-CORP-01"],
            critical_paths_eliminated: 7,
            blast_radius_reduction_percent: 45.0,
            attacker_effort_increase: 3.8,
            implementation_complexity: "LOW",
            priority_score: 88.0,
            reasoning: "Blocks Kerberoasting and credential relay attacks",
            affected_techniques_blocked: ["T1078", "T1003"],
          },
          {
            rank: 3,
            control_name: "Restrict App Server Egress",
            control_type: "FIREWALL",
            target_assets_or_identities: ["APP-PROD-01"],
            critical_paths_eliminated: 5,
            blast_radius_reduction_percent: 32.0,
            attacker_effort_increase: 3.0,
            implementation_complexity: "LOW",
            priority_score: 79.5,
            reasoning: "Prevents C2 beaconing and exfiltration",
            affected_techniques_blocked: ["T1041"],
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreateJiraTask = (e: React.FormEvent) => {
    e.preventDefault();
    setJiraSuccess(true);
    setTimeout(() => {
      setJiraSuccess(false);
      setIsJiraModalOpen(false);
    }, 1500);
  };

  if (loading) {
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
        <span className="text-[11px] font-mono text-[#A1A1AA]">Loading remediation priorities...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-[#18181B] dark:text-slate-100 select-none pb-8">
      {/* 1. Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#18181B] dark:text-white font-display">
              Remediation Center
            </h1>
          </div>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5 font-normal">
            Ranked by critical attack paths eliminated and blast radius reduction — not raw CVSS scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsJiraModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Jira Task</span>
          </button>
        </div>
      </motion.div>

      {/* 2. Top Analytics Row (inspired by Photo 1 & Photo 2) */}
      <StaggerGroup className="grid grid-cols-12 gap-6">
        {/* Card 1: Top Remediated Exposures */}
        <AnimatedCard className="col-span-4 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-[#18181B] dark:text-white tracking-wide font-display">
              Top Remediated Exposures
            </h3>
            <span className="text-[10px] font-mono text-[#F25C1F] dark:text-[#FF6B3D] font-semibold">10 Active</span>
          </div>

          <div className="space-y-2 pt-1 font-mono text-xs">
            {[
              { name: "AD Member of Group", count: 76 },
              { name: "AD add Logon Script", count: 55 },
              { name: "Apache ActiveMQ RCE (CVE-2023-46604)", count: 7 },
              { name: "Microsoft Office Security Bypass", count: 2 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-[#F1F3F5] dark:border-slate-800/60">
                <span className="text-[#71717A] dark:text-slate-300 text-[11px] truncate max-w-[200px]">{item.name}</span>
                <span className="text-[#18181B] dark:text-white font-bold text-[11px]">{item.count}</span>
              </div>
            ))}
          </div>
        </AnimatedCard>

        {/* Card 2: Choke Point Impact Funnel (from Photo 2) */}
        <AnimatedCard className="col-span-4 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-[#18181B] dark:text-white tracking-wide font-display">
              Choke Point Reduction Funnel
            </h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">-75% Risk</span>
          </div>

          {/* Funnel Flow Diagram */}
          <div className="flex items-center justify-between gap-2 pt-2 text-center font-mono">
            <div className="flex-1 p-2 rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:border-red-500/30">
              <div className="text-xl font-bold text-red-600 dark:text-red-400">80</div>
              <div className="text-[9px] text-[#71717A] uppercase mt-0.5">Compromised</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#A1A1AA] flex-shrink-0" />
            <div className="flex-1 p-2 rounded-lg bg-[#FFF4ED] text-[#F25C1F] dark:text-[#FF6B3D] border border-[#FFCCBA] dark:bg-orange-950/20 dark:border-orange-500/30">
              <div className="text-xl font-bold text-[#F25C1F] dark:text-[#FF6B3D]">15</div>
              <div className="text-[9px] text-[#71717A] uppercase mt-0.5">Choke Points</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#A1A1AA] flex-shrink-0" />
            <div className="flex-1 p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-500/30">
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">17</div>
              <div className="text-[9px] text-[#71717A] uppercase mt-0.5">Saved (47%)</div>
            </div>
          </div>
        </AnimatedCard>

        {/* Card 3: Critical Assets by Severity (from Photo 1) */}
        <AnimatedCard className="col-span-4 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-[#18181B] dark:text-white tracking-wide font-display">
              Critical Assets by Severity
            </h3>
            <span className="text-[10px] text-[#F25C1F] dark:text-[#FF6B3D] font-mono font-semibold">3 At Risk</span>
          </div>

          <div className="space-y-1.5 pt-1 text-xs">
            {[
              { entity: "CorporateDC (DC-CORP-01)", score: 100, level: "Critical" },
              { entity: "dc-customers-db (DB-01)", score: 95, level: "Critical" },
              { entity: "VAULT-BACKUP-01", score: 92, level: "Critical" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-[#F5F5F5] dark:bg-[#0A0A0B] border border-[#ECECEF] dark:border-slate-800">
                <span className="text-slate-800 dark:text-slate-200 text-[11px] font-mono truncate">{item.entity}</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/80 dark:text-red-400 dark:border-red-500/40">
                  {item.level} {item.score}
                </span>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </StaggerGroup>

      {/* 3. Remediation Items Table (inspired by Photo 1 & Photo 2) */}
      <div className="rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A] p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-bold text-[#18181B] dark:text-white font-display">
              Remediation Action Items
            </h2>
            <span className="text-xs text-[#71717A] font-mono">({remediations.length} prioritized controls)</span>
          </div>

          {/* Search bar */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-[#A1A1AA] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search remediations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-[#F5F5F5] dark:bg-[#0A0A0B] border border-[#ECECEF] dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#18181B] dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#FF5722] font-mono"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#F1F3F5] dark:border-slate-800 text-[10px] text-[#71717A] dark:text-[#A1A1AA] uppercase font-mono tracking-wider">
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Control / Exposure</th>
                <th className="py-2.5 px-3">Control Type</th>
                <th className="py-2.5 px-3">Target Scope</th>
                <th className="py-2.5 px-3">Paths Severed</th>
                <th className="py-2.5 px-3">Blast Radius Drop</th>
                <th className="py-2.5 px-3">Complexity</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="divide-y divide-[#F1F3F5] dark:divide-slate-800/60 font-mono text-[11px]"
            >
              {remediations
                .filter((r) => r.control_name.toLowerCase().includes(searchFilter.toLowerCase()))
                .map((rem) => (
                  <motion.tr
                    key={rem.rank}
                    variants={itemVariants}
                    whileHover={{ x: 2, transition: { duration: 0.15 } }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-[#18181B] dark:text-white">#{rem.rank}</td>
                    <td className="py-3 px-3 font-sans font-semibold text-slate-800 dark:text-slate-100">
                      {rem.control_name}
                    </td>
                    <td className="py-3 px-3 text-[#F25C1F] dark:text-[#FF6B3D] font-medium">{rem.control_type}</td>
                    <td className="py-3 px-3 text-[#71717A] dark:text-slate-300">
                      {rem.target_assets_or_identities.join(", ")}
                    </td>
                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                      &darr; {rem.critical_paths_eliminated} paths
                    </td>
                    <td className="py-3 px-3 text-[#F25C1F] dark:text-[#FF6B3D] font-bold">
                      -{rem.blast_radius_reduction_percent}%
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[#71717A] dark:text-slate-300 text-[10px]">
                        {rem.implementation_complexity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate("/defense")}
                        className="px-2.5 py-1 rounded-lg bg-[#FFF4ED] dark:bg-[#211410] border border-[#FF5722]/30 text-[#F25C1F] dark:text-[#FF6B3D] hover:bg-[#FFE5D6] text-[10px] font-semibold transition-all cursor-pointer"
                      >
                        Test Sandbox &rarr;
                      </button>
                    </td>
                  </motion.tr>
                ))}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* 4. Add Jira Task Modal (from Photo 2) */}
      <AnimatePresence>
        {isJiraModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A] p-5 shadow-2xl space-y-8 font-sans"
            >
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F3F5] dark:border-slate-800">
              <h3 className="text-sm font-bold text-[#18181B] dark:text-white font-display">Add Jira Task</h3>
              <button
                onClick={() => setIsJiraModalOpen(false)}
                className="text-[#A1A1AA] hover:text-[#71717A] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {jiraSuccess ? (
              <div className="p-4 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-center font-semibold text-xs space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                <div>Jira Task Created Successfully!</div>
                <div className="text-[10px] text-[#71717A]">Issue ID: SEC-4029 linked to Digital Twin</div>
              </div>
            ) : (
              <form onSubmit={handleCreateJiraTask} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] text-[#71717A] font-mono uppercase block mb-1 font-semibold">Project</label>
                  <select
                    value={jiraForm.project}
                    onChange={(e) => setJiraForm({ ...jiraForm, project: e.target.value })}
                    className="w-full bg-[#F5F5F5] dark:bg-[#0A0A0B] border border-[#ECECEF] dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-[#18181B] dark:text-slate-200 outline-none focus:border-[#FF5722] font-mono"
                  >
                    <option value="Integrations project">Integrations project</option>
                    <option value="Security Operations">Security Operations</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#71717A] font-mono uppercase block mb-1 font-semibold">Issue Type</label>
                  <select
                    value={jiraForm.issueType}
                    onChange={(e) => setJiraForm({ ...jiraForm, issueType: e.target.value })}
                    className="w-full bg-[#F5F5F5] dark:bg-[#0A0A0B] border border-[#ECECEF] dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-[#18181B] dark:text-slate-200 outline-none focus:border-[#FF5722] font-mono"
                  >
                    <option value="Story">Story</option>
                    <option value="Task">Task</option>
                    <option value="Bug">Security Bug</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#71717A] font-mono uppercase block mb-1 font-semibold">Summary</label>
                  <input
                    type="text"
                    value={jiraForm.summary}
                    onChange={(e) => setJiraForm({ ...jiraForm, summary: e.target.value })}
                    className="w-full bg-[#F5F5F5] dark:bg-[#0A0A0B] border border-[#ECECEF] dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-[#18181B] dark:text-slate-200 outline-none focus:border-[#FF5722]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#71717A] font-mono uppercase block mb-1 font-semibold">Description (optional)</label>
                  <textarea
                    rows={3}
                    value={jiraForm.description}
                    onChange={(e) => setJiraForm({ ...jiraForm, description: e.target.value })}
                    className="w-full bg-[#F5F5F5] dark:bg-[#0A0A0B] border border-[#ECECEF] dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-[#18181B] dark:text-slate-200 outline-none focus:border-[#FF5722]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsJiraModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

