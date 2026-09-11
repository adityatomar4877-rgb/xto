import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Layers,
  Crosshair,
  Radio,
  Sliders,
  ListOrdered,
  Award,
  Search,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Shield,
  Activity,
  ArrowRight,
  Terminal,
  Send,
  X,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { path: "/command", label: "Overview", icon: LayoutDashboard },
  { path: "/twin", label: "Digital Twin", icon: Layers },
  { path: "/simulation", label: "Attack Simulation", icon: Crosshair },
  { path: "/blast-radius", label: "Blast Radius", icon: Radio },
  { path: "/defense", label: "Controls & What-If", icon: Sliders },
  { path: "/remediation", label: "Remediation", icon: ListOrdered },
  { path: "/threat-vectors", label: "Threat Intelligence", icon: Shield },
  { path: "/decision-proof", label: "Reports", icon: Award },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Global keyboard shortcut for Search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsCopilotOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCopilotSubmit = (promptText?: string) => {
    const q = promptText || copilotInput;
    if (!q.trim()) return;

    setIsCopilotOpen(true);
    const lower = q.toLowerCase();

    if (lower.includes("blast radius") || lower.includes("db-01")) {
      setCopilotResponse(
        "Blast Radius Analysis for DB-01: Asset reachability is 61.0% (8 internal assets at risk, including 3 critical Crown Jewels: DB-CROWN-JEWEL, VAULT-BACKUP-01, FIN-LEDGER-01). Chokepoint detected at DC-CORP-01."
      );
    } else if (lower.includes("simulate attack") || lower.includes("web server")) {
      setCopilotResponse(
        "Attack Simulation initiated from Web Server: Adversary uses T1190 (Exploit Public-Facing Application) to gain initial access, followed by T1003 (Credential Dumping) on Corporate DC. Estimated time to critical asset compromise: 3m 45s."
      );
    } else if (lower.includes("firewall") || lower.includes("rule")) {
      setCopilotResponse(
        "Control What-If Simulation: Enforcing Strict Egress Filtering on App Tier blocks T1041 (C2 Exfiltration) and reduces overall lateral traversal paths by 75% without disrupting legitimate database replication."
      );
    } else if (lower.includes("overexposed")) {
      setCopilotResponse(
        "Top Overexposed Assets: 1) WS-ENG-04 (reachable via unauthenticated workstation segment), 2) DC-CORP-01 (intersects 88% of lateral paths), 3) APP-PROD-01 (has overprivileged database credentials in config)."
      );
    } else {
      setCopilotResponse(
        `Analysis for "${q}": Rakshastra AI evaluated the current 236 monitored assets. 1 active simulation is running. Recommendation: Apply Network Segmentation to isolate Database Tier and sever 11 critical attack paths.`
      );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080A0F] text-slate-200 select-none font-sans">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-[#1E2638] bg-[#0A0D14] z-20">
        {/* Brand Logo & Header */}
        <div className="p-4 border-b border-[#1E2638]/70 flex items-center gap-3">
          {/* Layered Orange Diamonds Logo */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(255,87,34,0.25)]">
            <svg className="w-5 h-5 text-[#FF5722]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FF5722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <div>
            <div className="font-extrabold tracking-widest text-base text-white flex items-center gap-1.5 font-display">
              RAKSHASTRA
            </div>
            <div className="text-[8px] text-slate-400 font-semibold tracking-[0.25em] uppercase">
              SECURITY DIGITAL TWIN
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || (item.path === "/command" && location.pathname === "/");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-orange-600/25 via-orange-500/15 to-transparent text-orange-400 border-l-2 border-[#FF5722] font-semibold shadow-[0_0_15px_rgba(255,87,34,0.1)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-[#FF5722]" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* AI COPILOT Widget */}
        <div className="p-3 mx-2 mb-2 rounded-xl bg-gradient-to-b from-[#121622] to-[#0A0D14] border border-orange-500/25 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-[#FF5722]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white tracking-wider flex items-center gap-1.5">
                AI COPILOT
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] animate-pulse"></span>
              </div>
              <div className="text-[9px] text-slate-400">Ask. Simulate. Secure.</div>
            </div>
          </div>

          {/* Prompt Suggestions */}
          <div className="space-y-1 my-2.5">
            {[
              "/ simulate attack from web server",
              "/ show blast radius of db-01",
              "/ test firewall rule",
              "/ which assets are overexposed?",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setCopilotInput(prompt);
                  handleCopilotSubmit(prompt);
                }}
                className="w-full text-left text-[10px] text-slate-400 hover:text-orange-300 hover:bg-orange-950/20 px-2 py-1 rounded transition-colors truncate font-mono"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Copilot Input Field */}
          <div className="relative mt-2">
            <input
              type="text"
              placeholder="Ask anything..."
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCopilotSubmit();
              }}
              className="w-full bg-[#080A0F] border border-slate-800 rounded-lg pl-2.5 pr-8 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
            />
            <button
              onClick={() => handleCopilotSubmit()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-orange-500/20 hover:bg-orange-500/40 border border-orange-500/40 flex items-center justify-center text-[#FF5722] transition-all"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="px-4 py-3 border-t border-[#1E2638]/70 text-slate-500 text-[10px] flex flex-col">
          <span className="font-mono tracking-wider text-slate-400 font-medium">RAKSHASTRA v1.0.0</span>
          <span className="text-slate-500 text-[9px]">A Safer Digital Tomorrow</span>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-14 border-b border-[#1E2638] bg-[#0A0D14]/90 backdrop-blur-md px-6 flex items-center justify-between z-10">
          {/* Centered Global Search Bar */}
          <div className="flex-1 max-w-xl">
            <div
              onClick={() => setIsSearchOpen(true)}
              className="cursor-pointer bg-[#0F141F] border border-[#222B3D] hover:border-slate-700 rounded-lg px-3.5 py-1.5 text-xs flex items-center justify-between text-slate-400 transition-all shadow-inner"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 text-[11px]">
                  Search assets, attack paths, or ask Rakshastra...
                </span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-[#182030] text-[10px] font-mono text-slate-400 border border-slate-700">
                ⌘ K
              </kbd>
            </div>
          </div>

          {/* Right Profile & Notifications */}
          <div className="flex items-center gap-5 ml-4">
            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-8 h-8 rounded-lg bg-[#0F141F] border border-[#222B3D] hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF5722] shadow-[0_0_8px_#FF5722]"></span>
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#0D111A] border border-[#222B3D] shadow-2xl p-3 z-50 text-xs font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-300 font-bold">
                    <span>SECURITY ALERTS</span>
                    <span className="text-[10px] text-orange-400">3 NEW</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="p-2 rounded bg-red-950/20 border border-red-500/30 text-red-300 text-[11px]">
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Privilege Escalation in Progress
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Adversary attempting DC-CORP-01 Kerberoasting</div>
                    </div>
                    <div className="p-2 rounded bg-amber-950/20 border border-amber-500/30 text-amber-300 text-[11px]">
                      <div className="font-bold">Overexposed Workstation</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">WS-ENG-04 has direct egress to Cloud VPC</div>
                    </div>
                    <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-[11px]">
                      <div className="font-bold">Defense Sandbox Evaluated</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">DB Network Segmentation eliminates 11 attack paths</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#1E2638]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 p-[1.5px]">
                <div className="w-full h-full rounded-full bg-[#080A0F] flex items-center justify-center text-xs font-bold text-orange-400">
                  A
                </div>
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <div className="text-xs font-semibold text-white">Aditya</div>
                <div className="text-[10px] text-slate-400">Security Analyst</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* MAIN VIEWPORT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative">
          {children}
        </main>
      </div>

      {/* COMMAND PALETTE MODAL (⌘ K) */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-24">
          <div className="w-full max-w-lg rounded-xl bg-[#0D111A] border border-orange-500/30 shadow-2xl p-4 overflow-hidden">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <Search className="w-4 h-4 text-orange-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search assets, attack paths, or switch views..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
              >
                ESC
              </button>
            </div>
            <div className="py-2 text-xs space-y-1">
              <div className="text-[10px] text-slate-500 font-mono px-2 py-1 uppercase tracking-wider">
                Quick Navigation
              </div>
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsSearchOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-orange-500/10 hover:text-orange-400 text-slate-300 text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{item.path}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COPILOT REASONING DRAWER / MODAL */}
      {isCopilotOpen && (
        <div className="fixed bottom-4 right-6 w-96 rounded-xl bg-[#0D111A]/95 border border-orange-500/40 shadow-[0_0_30px_rgba(255,87,34,0.15)] backdrop-blur-xl z-50 p-4 font-sans animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF5722]" />
              <span className="text-xs font-bold text-white tracking-wider">RAKSHASTRA AI COPILOT</span>
            </div>
            <button
              onClick={() => setIsCopilotOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 text-xs text-slate-300 leading-relaxed bg-[#080A0F] p-3 rounded-lg border border-slate-800/80">
            {copilotResponse}
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Autonomous Security Engine</span>
            <button
              onClick={() => navigate("/defense")}
              className="text-orange-400 hover:underline flex items-center gap-1"
            >
              Open Sandbox &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
