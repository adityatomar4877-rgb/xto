import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Layers,
  Search,
  ChevronDown,
  LayoutGrid,
  ShieldAlert,
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
  Zap,
  UploadCloud,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { api, HealthResponse } from "@/lib/api";
import { EASE } from "@/lib/animations";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/command", label: "Overview", icon: LayoutGrid },
  { path: "/twin", label: "Digital Twin", icon: Layers },
  { path: "/threat-vectors", label: "Threats", icon: ShieldAlert },
  { path: "/simulation", label: "Simulation", icon: Target },
  { path: "/blast-radius", label: "Blast Radius", icon: Compass },
  { path: "/defense", label: "What-If", icon: Sliders },
  { path: "/mitre", label: "MITRE", icon: ShieldCheck },
  { path: "/audit", label: "Audit", icon: Zap },
  { path: "/ingest", label: "Ingest", icon: UploadCloud },
  { path: "/remediation", label: "Remediation", icon: FileCheck2 },
  { path: "/decision-proof", label: "Reports", icon: FileText },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(() => {});
    const interval = setInterval(() => {
      api.getHealth().then(setHealth).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsCopilotOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCopilotSubmit = async (promptText?: string) => {
    const q = promptText || copilotInput;
    if (!q.trim()) return;
    setIsCopilotOpen(true);
    setCopilotLoading(true);
    setCopilotResponse(null);
    try {
      const result = await api.processNaturalLanguageQuery(q);
      const metrics = result.supporting_metrics || {};
      const pathCount = metrics.total_paths_found ?? 0;
      let response = result.deterministic_answer || "Query processed.";
      if (pathCount > 0) response += `\n\nPaths found: ${pathCount}`;
      if (result.recommended_action) response += `\n\nRecommended: ${result.recommended_action}`;
      setCopilotResponse(response);
    } catch (err: any) {
      setCopilotResponse(
        `${err.message || "Backend unreachable."}`
      );
    } finally {
      setCopilotLoading(false);
    }
  };

  const isActive = (path: string) =>
    location.pathname === path || (path === "/command" && location.pathname === "/");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAFA] dark:bg-[#0A0A0B] text-[#18181B] dark:text-[#FAFAFA] font-sans">
      {/* SIDEBAR */}
      <motion.aside
        initial={{ x: -16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="w-[220px] flex-shrink-0 flex flex-col bg-[#FFFFFF] dark:bg-[#131316] z-20"
      >
        {/* Logo */}
        <div className="px-6 pt-7 pb-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <svg className="w-6 h-6 text-[#F25C1F] dark:text-[#FF6B3D] transition-transform group-hover:scale-105" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-bold text-[17px] tracking-tight leading-none text-[#18181B] dark:text-[#FAFAFA]">
              RAKSHASTRA
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 overflow-y-auto">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.03, duration: 0.25, ease: EASE }}
              >
                <Link
                  to={item.path}
                  className={`group relative flex items-center gap-2.5 px-3 py-[7px] my-0.5 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
                    active
                      ? "text-[#F25C1F] dark:text-[#FF6B3D] bg-[#FFF4ED] dark:bg-[#1C1310]"
                      : "text-[#71717A] dark:text-[#9B9BA4] hover:text-[#18181B] dark:hover:text-[#FAFAFA] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1E]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-[#F25C1F] dark:bg-[#FF6B3D]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-[15px] h-[15px] ${active ? "text-[#F25C1F] dark:text-[#FF6B3D]" : "text-[#A1A1AA] group-hover:text-[#71717A]"}`} />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Copilot input */}
        <div className="px-3 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.25 }}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Ask the twin..."
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCopilotSubmit(); }}
                className="w-full bg-[#F5F5F5] dark:bg-[#1A1A1E] border-0 rounded-lg pl-3 pr-8 py-2 text-[12px] text-[#18181B] dark:text-[#FAFAFA] placeholder-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#F25C1F] dark:focus:ring-[#FF6B3D]"
              />
              <button
                onClick={() => handleCopilotSubmit()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-[#F25C1F] dark:bg-[#FF6B3D] hover:opacity-80 flex items-center justify-center text-white transition-opacity"
              >
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </motion.aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOPBAR — minimal */}
        <header className="h-14 px-8 flex items-center justify-between flex-shrink-0 border-b border-[#ECECEF]/60 dark:border-[#25252A]/60">
          <div className="flex items-center gap-6">
            {/* Search trigger */}
            <div
              onClick={() => setIsSearchOpen(true)}
              className="cursor-pointer flex items-center gap-2.5 text-[#A1A1AA] hover:text-[#71717A] transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="text-[13px]">Search...</span>
              <kbd className="ml-2 text-[10px] font-mono text-[#A1A1AA] border border-[#ECECEF] dark:border-[#25252A] rounded px-1.5 py-0.5">⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Status */}
            <div className="flex items-center gap-1.5 px-2 mr-2">
              <span className={`status-dot ${health?.status === "ONLINE" ? "status-dot-online" : "status-dot-offline"}`} />
              <span className="text-[11px] text-[#A1A1AA] font-medium">
                {health ? "Online" : "Offline"}
              </span>
            </div>

            {/* Theme */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1E] flex items-center justify-center text-[#71717A] dark:text-[#9B9BA4] transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Analyst Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#ECECEF] dark:border-[#25252A]">
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F25C1F] to-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                title="Active Operator: Aditya"
              >
                A
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-white hidden md:inline">
                Aditya
              </span>
            </div>
          </div>
        </header>

        {/* Content — generous padding and native smooth scroll */}
        <main id="main-viewport" className="flex-1 overflow-y-auto overflow-x-hidden px-8 py-6 relative">
          {children}
        </main>
      </div>

      {/* Command palette */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.97, y: 6, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.97, y: 6, opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#ECECEF] dark:border-[#25252A]">
                <Search className="w-4 h-4 text-[#F25C1F] dark:text-[#FF6B3D]" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search or jump to..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-[14px] text-[#18181B] dark:text-[#FAFAFA] placeholder-[#A1A1AA] focus:outline-none"
                  onKeyDown={(e) => { if (e.key === "Escape") setIsSearchOpen(false); }}
                />
                <kbd className="text-[10px] font-mono text-[#A1A1AA] border border-[#ECECEF] dark:border-[#25252A] rounded px-1.5 py-0.5">ESC</kbd>
              </div>
              <div className="py-2">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.path}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 + i * 0.02 }}
                    onClick={() => { navigate(item.path); setIsSearchOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1E] text-[#71717A] dark:text-[#9B9BA4] text-left transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-[#A1A1AA]" />
                    <span className="text-[13px] font-medium">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copilot drawer */}
      <AnimatePresence>
        {isCopilotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-6 right-6 w-[400px] rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A] shadow-2xl z-50 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F25C1F] dark:text-[#FF6B3D]" />
                <span className="text-[13px] font-bold">Copilot</span>
              </div>
              <button onClick={() => setIsCopilotOpen(false)} className="text-[#A1A1AA] hover:text-[#71717A]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[13px] text-[#71717A] dark:text-[#9B9BA4] leading-relaxed whitespace-pre-wrap">
              {copilotLoading ? (
                <span className="flex items-center gap-2 text-[#A1A1AA]">
                  <span className="w-3 h-3 border-2 border-[#F25C1F] dark:border-[#FF6B3D] border-t-transparent rounded-full animate-spin" />
                  Querying...
                </span>
              ) : copilotResponse}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
