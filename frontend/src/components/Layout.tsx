import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShieldAlert,
  Cpu,
  Layers,
  Crosshair,
  GitCommit,
  Radio,
  Sliders,
  Award,
  ListOrdered,
  RefreshCw,
  FileCheck2,
  Activity,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/api";

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { path: "/command", label: "Command Center", icon: Activity, badge: "LIVE" },
  { path: "/twin", label: "Digital Twin", icon: Layers },
  { path: "/threat-vectors", label: "Threat Vector Lab", icon: Crosshair },
  { path: "/simulation", label: "Attack Simulation", icon: Terminal, badge: "TRACE" },
  { path: "/paths", label: "Attack Paths", icon: GitCommit },
  { path: "/blast-radius", label: "Blast Radius", icon: Radio },
  { path: "/defense", label: "Defense Sandbox", icon: Sliders, badge: "CORE USP", highlight: true },
  { path: "/decision-proof", label: "Decision Proof", icon: Award, badge: "USP", highlight: true },
  { path: "/mitre", label: "MITRE ATT&CK", icon: ShieldCheck, badge: "MATRIX", highlight: true },
  { path: "/remediation", label: "Remediation", icon: ListOrdered },
  { path: "/sync", label: "Environment Sync", icon: RefreshCw },
  { path: "/evidence", label: "Evidence Explorer", icon: FileCheck2 },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [time, setTime] = useState("");
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTime(d.toISOString().slice(11, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api.getHealth()
      .then((data) => setHealth(data))
      .catch(() => setHealth(null));
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07090E] text-slate-100 select-none">
      {/* Tactical Left Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-cyan-950/40 bg-[#0B0E14]/90 backdrop-blur-xl z-20">
        {/* Brand Header */}
        <div className="p-4 border-b border-cyan-950/40 flex items-center justify-between">
          <Link to="/command" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-cyan-950/80 border border-[#00E5FF]/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.3)]">
              <ShieldAlert className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div>
              <div className="font-bold tracking-widest text-lg text-white font-mono flex items-center gap-1.5">
                XTO <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-[#00E5FF] border border-[#00E5FF]/30">PS #13</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider">CYBER DECISION TWIN</div>
            </div>
          </Link>
        </div>

        {/* USP Statement Micro-Banner */}
        <div className="mx-3 my-2.5 p-2 rounded bg-cyan-950/20 border border-cyan-500/20 text-[11px] font-mono leading-tight text-cyan-200/90">
          <span className="text-[#00E5FF] font-bold">CORE USP:</span> Simulate attack. Change defense. Prove what stopped it.
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2 rounded text-xs font-mono transition-all duration-150 ${
                  active
                    ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.15)] font-semibold"
                    : item.highlight
                    ? "text-slate-200 hover:text-[#00E5FF] hover:bg-cyan-950/30 border border-amber-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? "text-[#00E5FF]" : item.highlight ? "text-[#FFB300]" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                      item.highlight
                        ? "bg-[#FFB300]/20 text-[#FFB300] border border-[#FFB300]/40"
                        : "bg-cyan-950 text-[#00E5FF] border border-[#00E5FF]/30"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* System Telemetry Footer */}
        <div className="p-3 border-t border-cyan-950/40 bg-slate-950/60 font-mono text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${health ? "bg-[#00E676] animate-pulse" : "bg-red-500"}`}></span>
              ENGINE: {health ? "SYNCHRONIZED" : "CONNECTING..."}
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold">{health ? health.snapshot_id : "OFFLINE"}</span>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between">
            <span>ASSETS: {health?.assets_loaded ?? 12}</span>
            <span>CONTROLS: {health?.active_controls ?? 3}</span>
          </div>
        </div>
      </aside>

      {/* Main Command Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Tactical Top HUD Header */}
        <header className="h-13 border-b border-cyan-950/40 bg-[#0B0E14]/80 backdrop-blur-md px-6 flex items-center justify-between font-mono text-xs z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Cpu className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-slate-300 font-semibold uppercase tracking-wider">
                MUJ HACKX 4.0 // PS #13 CYBER WAR ROOM
              </span>
            </div>
            <span className="text-cyan-950">|</span>
            <div className="px-2 py-0.5 rounded bg-red-950/40 border border-red-500/30 text-red-400 text-[11px] flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              ACTIVE THREAT: RANSOMWARE CASCADE
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-slate-400">
              TIME: <span className="text-[#00E5FF] font-semibold">{time}</span>
            </div>
            <div className="text-slate-400">
              DEFENSE MODE: <span className="text-[#00E676] font-semibold">ACTIVE SANDBOX</span>
            </div>
            <Link
              to="/defense"
              className="px-3 py-1 rounded bg-[#FFB300]/15 border border-[#FFB300]/40 text-[#FFB300] hover:bg-[#FFB300]/25 transition-all text-xs font-semibold tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,179,0,0.15)]"
            >
              <Sliders className="w-3.5 h-3.5" />
              LAUNCH DEFENSE SANDBOX
            </Link>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
