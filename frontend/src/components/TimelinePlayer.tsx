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
    <div className="p-6 rounded-2xl bg-white dark:bg-[#131316] border border-[#ECECEF] dark:border-[#25252A] font-sans">
      {/* Player Controls Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] text-white flex items-center justify-center transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              onStepChange(Math.max(0, activeStepIndex - 1));
            }}
            disabled={activeStepIndex === 0}
            className="w-8 h-8 rounded-lg bg-[#F5F5F5] border border-[#ECECEF] text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              onStepChange(Math.min(timeline.length - 1, activeStepIndex + 1));
            }}
            disabled={activeStepIndex === timeline.length - 1}
            className="w-8 h-8 rounded-lg bg-[#F5F5F5] border border-[#ECECEF] text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center cursor-pointer transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              onStepChange(0);
            }}
            className="w-8 h-8 rounded-lg bg-[#F5F5F5] border border-[#ECECEF] text-[#71717A] hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
            title="Reset to Foothold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <span className="text-xs text-[#71717A] ml-2 font-mono font-medium">
            STEP <span className="text-[#F25C1F] dark:text-[#FF6B3D] font-bold">{activeStepIndex + 1}</span> / {timeline.length}
          </span>
        </div>

        <div className="text-xs text-[#71717A] font-mono">
          OFFSET: +{currentEvent?.timestamp_offset_seconds || 0}s
        </div>
      </div>

      {/* Progress Track */}
      <div className="flex gap-1.5 mb-3.5">
        {timeline.map((ev, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsPlaying(false);
              onStepChange(idx);
            }}
            className={`flex-1 h-2 rounded transition-all cursor-pointer ${
              idx === activeStepIndex
                ? "bg-[#FF5722] shadow-[0_0_8px_rgba(255,87,34,0.5)]"
                : idx < activeStepIndex
                ? ev.success
                  ? "bg-red-500/80"
                  : "bg-emerald-500/80"
                : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {/* Current Step Event Inspector */}
      {currentEvent && (
        <div className="p-3.5 rounded-lg bg-[#F5F5F5] border border-[#ECECEF] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                currentEvent.phase === "IMPACT" || currentEvent.phase === "OBJECTIVE_COMPLETED"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : currentEvent.phase === "FOOTHOLD"
                  ? "bg-orange-50 text-[#F25C1F] dark:text-[#FF6B3D] border border-orange-200"
                  : "bg-amber-50 text-amber-600 border border-amber-200"
              }`}>
                {currentEvent.phase}
              </span>
              <span className="font-bold text-[#18181B]">{currentEvent.action_name}</span>
            </div>

            <span className={`flex items-center gap-1 text-[11px] font-semibold ${
              currentEvent.success ? "text-red-600" : "text-emerald-600"
            }`}>
              {currentEvent.success ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
              {currentEvent.success ? "TRANSITION SUCCEEDED" : "BLOCKED BY DEFENSE"}
            </span>
          </div>

          <div className="text-xs text-slate-700 leading-relaxed font-normal">
            {currentEvent.explanation}
          </div>

          {currentEvent.reason && currentEvent.reason.length > 0 && (
            <div className="p-2.5 rounded-md bg-white border border-slate-200/90 space-y-1">
              <div className="text-[14px] font-bold text-[#71717A] uppercase tracking-wider font-mono">
                CAUSAL EVIDENCE REASONS:
              </div>
              <ul className="space-y-0.5 text-[11px] text-slate-700 pl-1">
                {currentEvent.reason.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#F25C1F] dark:text-[#FF6B3D] font-bold mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-3 text-[11px] text-[#71717A] font-mono">
            <div>
              FROM: <span className="text-slate-800 font-semibold">{currentEvent.source_asset_name}</span>
            </div>
            <div>&rarr;</div>
            <div>
              TO: <span className="text-slate-800 font-semibold">{currentEvent.target_asset_name}</span>
            </div>
            <div>|</div>
            <div>
              TECHNIQUE: <span className="text-[#F25C1F] dark:text-[#FF6B3D] font-semibold">{currentEvent.technique_id} ({currentEvent.technique_name})</span>
            </div>
            {currentEvent.identity_used && (
              <>
                <div>|</div>
                <div>
                  IDENTITY: <span className="text-amber-600 font-semibold">{currentEvent.identity_used}</span>
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
                      className="px-1.5 py-0.2 rounded bg-orange-50 text-[#F25C1F] dark:text-[#FF6B3D] hover:underline cursor-pointer border border-orange-200 font-semibold"
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
