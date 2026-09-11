import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import { SimulationEvent } from "@/lib/api";

interface TimelinePlayerProps {
  timeline: SimulationEvent[];
  activeStepIndex: number;
  onStepChange: (index: number) => void;
  onSelectEvidence?: (evidenceId: string) => void;
}

export const TimelinePlayer: React.FC<TimelinePlayerProps> = ({
  timeline,
  activeStepIndex,
  onStepChange,
  onSelectEvidence,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onStepChange(activeStepIndex < timeline.length - 1 ? activeStepIndex + 1 : 0);
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlaying, activeStepIndex, timeline.length, onStepChange]);

  const currentEvent = timeline[activeStepIndex];

  return (
    <div className="p-4 rounded-lg bg-[#0B0E14]/90 border border-cyan-950/40 font-mono">
      {/* Player Controls Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF] hover:bg-[#00E5FF]/30 flex items-center justify-center transition-all shadow-[0_0_10px_rgba(0,229,255,0.2)]"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              onStepChange(Math.max(0, activeStepIndex - 1));
            }}
            disabled={activeStepIndex === 0}
            className="w-8 h-8 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              onStepChange(Math.min(timeline.length - 1, activeStepIndex + 1));
            }}
            disabled={activeStepIndex === timeline.length - 1}
            className="w-8 h-8 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30 flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              onStepChange(0);
            }}
            className="w-8 h-8 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-[#00E5FF] flex items-center justify-center"
            title="Reset to Foothold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <span className="text-xs text-slate-400 ml-2">
            STEP <span className="text-[#00E5FF] font-bold">{activeStepIndex + 1}</span> / {timeline.length}
          </span>
        </div>

        <div className="text-xs text-slate-400">
          OFFSET: +{currentEvent?.timestamp_offset_seconds || 0}s
        </div>
      </div>

      {/* Progress Track */}
      <div className="flex gap-1.5 mb-4">
        {timeline.map((ev, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsPlaying(false);
              onStepChange(idx);
            }}
            className={`flex-1 h-2 rounded transition-all ${
              idx === activeStepIndex
                ? "bg-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.7)]"
                : idx < activeStepIndex
                ? ev.success
                  ? "bg-red-500/70"
                  : "bg-emerald-500/70"
                : "bg-slate-800"
            }`}
          />
        ))}
      </div>

      {/* Current Step Event Inspector */}
      {currentEvent && (
        <div className="p-3.5 rounded bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                currentEvent.phase === "IMPACT" || currentEvent.phase === "OBJECTIVE_COMPLETED"
                  ? "bg-red-950 text-red-400 border border-red-500/40"
                  : currentEvent.phase === "FOOTHOLD"
                  ? "bg-cyan-950 text-cyan-400 border border-cyan-500/40"
                  : "bg-amber-950 text-amber-400 border border-amber-500/40"
              }`}>
                {currentEvent.phase}
              </span>
              <span className="font-bold text-slate-200">{currentEvent.action_name}</span>
            </div>

            <span className={`flex items-center gap-1 text-[11px] font-semibold ${
              currentEvent.success ? "text-red-400" : "text-emerald-400"
            }`}>
              {currentEvent.success ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
              {currentEvent.success ? "TRANSITION SUCCEEDED" : "BLOCKED BY DEFENSE"}
            </span>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed">
            {currentEvent.explanation}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            <div>
              FROM: <span className="text-slate-200 font-semibold">{currentEvent.source_asset_name}</span>
            </div>
            <div>&rarr;</div>
            <div>
              TO: <span className="text-slate-200 font-semibold">{currentEvent.target_asset_name}</span>
            </div>
            <div>|</div>
            <div>
              TECHNIQUE: <span className="text-[#00E5FF]">{currentEvent.technique_id} ({currentEvent.technique_name})</span>
            </div>
            {currentEvent.identity_used && (
              <>
                <div>|</div>
                <div>
                  IDENTITY: <span className="text-amber-400">{currentEvent.identity_used}</span>
                </div>
              </>
            )}
            {currentEvent.evidence_ids.length > 0 && (
              <>
                <div>|</div>
                <div className="flex items-center gap-1">
                  EVIDENCE:
                  {currentEvent.evidence_ids.map((eid) => (
                    <button
                      key={eid}
                      onClick={() => onSelectEvidence && onSelectEvidence(eid)}
                      className="px-1.5 py-0.2 rounded bg-cyan-950 text-[#00E5FF] hover:underline cursor-pointer border border-[#00E5FF]/30"
                    >
                      {eid}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
