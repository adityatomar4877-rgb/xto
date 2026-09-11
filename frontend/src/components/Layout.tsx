import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Layers,
  Search,
  Bell,
  ChevronDown,
  LayoutGrid,
  ShieldAlert,
  Activity,
  ArrowRight,
  Target,
  Sliders,
  FileCheck2,
  FileText,
  Compass,
  Sparkles,
  X,
  Radio,
  Wifi,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Global search shortcut ⌘K / Ctrl+K
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
        "Blast Radius Analysis for db-01: Asset reachability is 61.0% (18 reachable nodes, 3 critical systems: Database, Vault, Financial Ledger). Primary chokepoint detected at DC-CORP-01."
      );
    } else if (lower.includes("simulate attack") || lower.includes("web server")) {
      setCopilotResponse(
        "Attack Simulation from Web Tier: Adversary leverages T1190 (Exploit Public-Facing App) to compromise web container, pivoting via T1003 (Credential Dumping) towards App Tier and Database."
      );
    } else if (lower.includes("firewall") || lower.includes("rule")) {
      setCopilotResponse(
        "Control Effectiveness Simulation: Strict egress filtering and database network isolation severs 11 critical paths, yielding 75% total risk reduction."
      );
    } else if (lower.includes("overexposed")) {
      setCopilotResponse(
        "Top Overexposed Assets: 1) db-01 (critical database directly accessible via App Tier), 2) Identity (AD) (intersects 88% of lateral paths), 3) Web Tier (publicly exposed ingress)."
      );
    } else {
      setCopilotResponse(
        `Rakshastra AI evaluated query "${q}". 236 assets monitored across AWS Cloud, Office, and Core Datacenter. 1 active simulation in progress.`
      );
    }
  };

  const navItems = [
    { path: "/command", label: "Overview", icon: LayoutGrid },
    { path: "/twin", label: "Digital Twin", icon: Layers },
    { path: "/simulation", label: "Attack Simulation", icon: Target },
    { path: "/blast-radius", label: "Blast Radius", icon: Compass },
    { path: "/defense", label: "Controls & What-If", icon: Sliders },
    { path: "/remediation", label: "Remediation", icon: FileCheck2 },
    { path: "/threat-vectors", label: "Threat Intelligence", icon: ShieldAlert },
    { path: "/decision-proof", label: "Reports", icon: FileText },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07090D] text-slate-200 select-none font-sans">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-60 flex-shrink-0 flex flex-col border-r border-[#171B26] bg-[#0A0D14] z-20">
        {/* Rakshastra Logo */}
        <div className="p-4 border-b border-[#171B26] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1E1410] border border-[#FF5722]/50 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.25)] flex-shrink-0">
            <svg className="w-4.5 h-4.5 text-[#FF5722]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FF5722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <div>
            <div className="font-extrabold tracking-wider text-sm text-white font-display leading-tight">
              RAKSHASTRA
            </div>
            <div className="text-[7.5px] text-slate-400 font-semibold tracking-[0.2em] uppercase leading-tight">
              SECURITY DIGITAL TWIN
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || (item.path === "/command" && location.pathname === "/");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  active
                    ? "bg-[#211410] text-[#FF5722] border border-[#FF5722]/40 font-semibold shadow-[0_0_12px_rgba(249,115,22,0.1)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#0E1118]"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-[#FF5722]" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* AI COPILOT Panel */}
        <div className="p-3 mx-2.5 mb-2.5 rounded-xl bg-[#0C0E14] border border-[#171B26] shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-[#211410] border border-[#FF5722]/40 flex items-center justify-center text-[#FF5722] flex-shrink-0">
              <Activity className="w-3 h-3 text-[#FF5722]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-white tracking-wider flex items-center gap-1.5">
                AI COPILOT
              </div>
              <div className="text-[8.5px] text-slate-400">Ask. Simulate. Secure.</div>
            </div>
          </div>

          {/* Compact Command Suggestions */}
          <div className="space-y-0.5 my-2 font-mono">
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
                className="w-full text-left text-[9.5px] text-slate-400 hover:text-orange-300 hover:bg-orange-950/20 px-1.5 py-1 rounded transition-colors truncate block"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="relative mt-2">
            <input
              type="text"
              placeholder="Ask anything..."
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCopilotSubmit();
              }}
              className="w-full bg-[#07090D] border border-slate-800 rounded-lg pl-2.5 pr-7 py-1 text-[10.5px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#FF5722]/50"
            />
            <button
              onClick={() => handleCopilotSubmit()}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-[#FF5722]/20 hover:bg-[#FF5722]/40 border border-[#FF5722]/40 flex items-center justify-center text-[#FF5722] transition-all"
            >
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[#171B26] text-slate-500 text-[9px] flex flex-col">
          <span className="font-mono tracking-wider text-slate-400 font-medium">RAKSHASTRA v1.0.0</span>
          <span className="text-slate-500 text-[8.5px]">A Safer Digital Tomorrow</span>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP BAR */}
        <header className="h-14 border-b border-[#171B26] bg-[#0A0D14]/90 backdrop-blur-md px-6 flex items-center justify-between z-10 flex-shrink-0">
          {/* Global Search */}
          <div className="flex-1 max-w-xl">
            <div
              onClick={() => setIsSearchOpen(true)}
              className="cursor-pointer bg-[#0C0E14] border border-[#1E2536] hover:border-slate-600 rounded-lg px-3.5 py-1.5 text-xs flex items-center justify-between text-slate-400 transition-all shadow-inner"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 text-[11px]">
                  Search assets, attack paths, or ask Rakshastra...
                </span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-[#161C28] text-[9.5px] font-mono text-slate-400 border border-slate-700">
                ⌘ K
              </kbd>
            </div>
          </div>

          {/* Right Controls: Live Sync, Notification, Profile */}
          <div className="flex items-center gap-4 ml-4">
            {/* Live Sync Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE SYNC: ACTIVE</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-8 h-8 rounded-full bg-[#0C0E14] border border-[#1E2536] hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF5722]"></span>
              </button>

              {/* Notification dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0D1017] border border-[#1E2536] shadow-2xl p-3 z-50 text-xs font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-300 font-bold">
                    <span>SECURITY ALERTS</span>
                    <span className="text-[10px] text-orange-400">3 NEW</span>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    <div className="p-2 rounded bg-red-950/20 border border-red-500/30 text-red-300 text-[10px]">
                      <div className="font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Privilege Escalation Active
                      </div>
                      <div className="text-slate-400 mt-0.5">Attempted Kerberoasting on Identity (AD)</div>
                    </div>
                    <div className="p-2 rounded bg-amber-950/20 border border-amber-500/30 text-amber-300 text-[10px]">
                      <div className="font-bold">Overexposed Node</div>
                      <div className="text-slate-400 mt-0.5">db-01 has 18 reachable downstream paths</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Analyst Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#171B26]">
              <img
                src="/aditya.png"
                alt="Aditya"
                className="w-8 h-8 rounded-full border border-slate-700 object-cover flex-shrink-0"
              />
              <div className="text-left leading-tight">
                <div className="text-xs font-bold text-white leading-none">Aditya</div>
                <div className="text-[9.5px] text-slate-400 mt-0.5 leading-none">Security Analyst</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* VIEWPORT CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 relative">
          {children}
        </main>
      </div>

      {/* COMMAND PALETTE MODAL (⌘ K) */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center pt-24">
          <div className="w-full max-w-lg rounded-xl bg-[#0C0E14] border border-[#FF5722]/30 shadow-2xl p-4 overflow-hidden">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <Search className="w-4 h-4 text-[#FF5722]" />
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
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsSearchOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-orange-500/10 hover:text-[#FF5722] text-slate-300 text-left transition-colors"
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

      {/* COPILOT DRAWER */}
      {isCopilotOpen && (
        <div className="fixed bottom-4 right-6 w-96 rounded-xl bg-[#0C0E14]/95 border border-[#FF5722]/40 shadow-[0_0_30px_rgba(249,115,22,0.15)] backdrop-blur-xl z-50 p-4 font-sans">
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
          <div className="mt-3 text-xs text-slate-300 leading-relaxed bg-[#07090D] p-3 rounded-lg border border-slate-800/80">
            {copilotResponse}
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Autonomous Security Engine</span>
            <button
              onClick={() => navigate("/defense")}
              className="text-[#FF5722] hover:underline flex items-center gap-1"
            >
              Open Sandbox &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
