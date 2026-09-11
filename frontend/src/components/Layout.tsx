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
  Sun,
  Moon,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

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
    { path: "/mitre", label: "MITRE ATT&CK", icon: ShieldCheck },
    { path: "/remediation", label: "Remediation", icon: FileCheck2 },
    { path: "/threat-vectors", label: "Threat Intelligence", icon: ShieldAlert },
    { path: "/decision-proof", label: "Reports", icon: FileText },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FA] dark:bg-[#07090D] text-slate-900 dark:text-slate-100 select-none font-sans">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-[#E5E7EB] dark:border-[#171B26] bg-[#FFFFFF] dark:bg-[#0C0E14] z-20">
        {/* Rakshastra Logo */}
        <div className="p-4 border-b border-[#E5E7EB] dark:border-[#171B26] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FFF2EB] dark:bg-[#1E1410] border border-[#FF5722]/30 flex items-center justify-center shadow-sm flex-shrink-0">
            <svg className="w-5 h-5 text-[#FF5722]" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#FF5722"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="font-extrabold tracking-wider text-sm text-slate-900 dark:text-white font-display leading-tight">
              RAKSHASTRA
            </div>
            <div className="text-[7.5px] text-slate-400 font-bold tracking-[0.2em] uppercase leading-tight">
              SECURITY DIGITAL TWIN
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              location.pathname === item.path ||
              (item.path === "/command" && location.pathname === "/");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "bg-[#FFF5EE] dark:bg-[#211410] text-[#FF5722] border border-[#FFCCBA] dark:border-[#FF5722]/40 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-[#FF5722]" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* AI COPILOT Panel */}
        <div className="p-3.5 mx-3 mb-3 rounded-xl bg-[#F8F9FA] dark:bg-[#080A0F] border border-[#E5E7EB] dark:border-[#171B26] shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-[#FFF2EB] dark:bg-[#211410] border border-[#FF5722]/40 flex items-center justify-center text-[#FF5722] flex-shrink-0">
              <Activity className="w-3.5 h-3.5 text-[#FF5722]" />
            </div>
            <div>
              <div className="text-[10.5px] font-extrabold text-slate-900 dark:text-white tracking-wider">
                AI COPILOT
              </div>
              <div className="text-[8.5px] text-slate-500">Ask. Simulate. Secure.</div>
            </div>
          </div>

          {/* Prompts list */}
          <div className="space-y-1 my-2.5 font-sans">
            {[
              "> Simulate attack from web server",
              "> Show blast radius of db-01",
              "> Test firewall rule",
              "> Which assets are overexposed?",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setCopilotInput(prompt.replace("> ", ""));
                  handleCopilotSubmit(prompt.replace("> ", ""));
                }}
                className="w-full text-left text-[9.5px] text-slate-500 dark:text-slate-400 hover:text-[#FF5722] hover:bg-orange-50 dark:hover:bg-orange-950/20 px-1.5 py-0.5 rounded transition-colors truncate block font-medium"
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
              className="w-full bg-[#FFFFFF] dark:bg-[#0C0E14] border border-[#D1D5DB] dark:border-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-[11px] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#FF5722]"
            />
            <button
              onClick={() => handleCopilotSubmit()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#FF5722] hover:bg-[#F4511E] flex items-center justify-center text-white transition-all shadow-xs"
            >
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[#E5E7EB] dark:border-[#171B26] text-slate-400 text-[9px] flex flex-col">
          <span className="font-mono tracking-wider text-slate-500 font-semibold">
            RAKSHASTRA v1.0.0
          </span>
          <span className="text-slate-400 text-[8.5px]">A Safer Digital Tomorrow</span>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP BAR */}
        <header className="h-14 border-b border-[#E5E7EB] dark:border-[#171B26] bg-[#FFFFFF] dark:bg-[#0C0E14] px-6 flex items-center justify-between z-10 flex-shrink-0">
          {/* Global Search */}
          <div className="flex-1 max-w-xl">
            <div
              onClick={() => setIsSearchOpen(true)}
              className="cursor-pointer bg-[#FFFFFF] dark:bg-[#080A0F] border border-[#E5E7EB] dark:border-[#1E2536] hover:border-slate-400 rounded-lg px-3.5 py-1.5 text-xs flex items-center justify-between text-slate-400 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 text-[11px]">
                  Search assets, attack paths, or ask Rakshastra...
                </span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#161C28] text-[9.5px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                ⌘ K
              </kbd>
            </div>
          </div>

          {/* Right Controls: Live Sync, Notification, Profile */}
          <div className="flex items-center gap-3.5 ml-4">
            {/* Live Sync Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-left leading-tight">
                <div className="text-[10px] font-bold text-slate-800 dark:text-emerald-400">Live Sync</div>
                <div className="text-[8px] text-slate-400">Last synced 2 min ago</div>
              </div>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-8 h-8 rounded-full bg-slate-50 dark:bg-[#0C0E14] border border-[#E5E7EB] dark:border-[#1E2536] hover:border-slate-400 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444]"></span>
              </button>

              {/* Notification dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-[#1E2536] shadow-xl p-3 z-50 text-xs font-sans">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold">
                    <span>SECURITY ALERTS</span>
                    <span className="text-[10px] text-orange-500 font-mono">3 NEW</span>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    <div className="p-2 rounded bg-rose-50 dark:bg-red-950/20 border border-rose-200 dark:border-red-500/30 text-rose-800 dark:text-red-300 text-[10px]">
                      <div className="font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Privilege Escalation Active
                      </div>
                      <div className="text-slate-500 mt-0.5">Attempted Kerberoasting on Identity (AD)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Day / Night Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full bg-slate-50 dark:bg-[#0C0E14] border border-[#E5E7EB] dark:border-[#1E2536] hover:border-slate-400 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Analyst Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#E5E7EB] dark:border-[#171B26]">
              <div className="w-8 h-8 rounded-full bg-[#E5E7EB] dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs flex-shrink-0">
                A
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                  Aditya
                </div>
                <div className="text-[9.5px] text-slate-400 mt-0.5 leading-none">
                  Security Analyst
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* VIEWPORT CONTENT */}
        <main id="main-viewport" className="flex-1 overflow-y-auto overflow-x-hidden p-5 relative">
          {children}
        </main>
      </div>

      {/* COMMAND PALETTE MODAL (⌘ K) */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-start justify-center pt-24">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-[#0C0E14] border border-[#E5E7EB] dark:border-[#FF5722]/30 shadow-2xl p-4 overflow-hidden">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-4 h-4 text-[#FF5722]" />
              <input
                autoFocus
                type="text"
                placeholder="Search assets, attack paths, or switch views..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded bg-slate-100"
              >
                ESC
              </button>
            </div>
            <div className="py-2 text-xs space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsSearchOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-orange-50 text-slate-700 text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{item.path}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COPILOT DRAWER */}
      {isCopilotOpen && (
        <div className="fixed bottom-4 right-6 w-96 rounded-xl bg-white dark:bg-[#0C0E14] border border-[#FF5722]/30 shadow-2xl backdrop-blur-xl z-50 p-4 font-sans">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF5722]" />
              <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wider">
                RAKSHASTRA AI COPILOT
              </span>
            </div>
            <button onClick={() => setIsCopilotOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#07090D] p-3 rounded-lg border border-slate-200 dark:border-slate-800/80">
            {copilotResponse}
          </div>
        </div>
      )}
    </div>
  );
};
