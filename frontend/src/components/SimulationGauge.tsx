import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useTheme } from "@/context/ThemeContext";

interface SimulationGaugeProps {
  progress?: number;
  phase?: string;
  size?: number;
}

export const SimulationGauge: React.FC<SimulationGaugeProps> = ({
  progress = 72,
  phase = "Privilege Escalation",
  size = 110,
}) => {
  const { theme } = useTheme();
  const circleRef = useRef<SVGCircleElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  const isDark = theme === "dark";
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (circleRef.current) {
      gsap.fromTo(
        circleRef.current,
        { strokeDashoffset: circumference },
        {
          strokeDashoffset: strokeDashoffset,
          duration: 1.8,
          ease: "power2.out",
        }
      );
    }

    if (numberRef.current) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: progress,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => {
          if (numberRef.current) {
            numberRef.current.textContent = `${Math.round(obj.val)}%`;
          }
        },
      });
    }
  }, [progress, circumference, strokeDashoffset]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="transform -rotate-90 drop-shadow-md"
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9800" />
            <stop offset="70%" stopColor="#FF5722" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={isDark ? "#171B26" : "#E2E8F0"}
          strokeWidth="7"
        />

        {/* Ticks ring */}
        <circle
          cx="50"
          cy="50"
          r={radius + 4.5}
          fill="none"
          stroke={isDark ? "#232A3B" : "#CBD5E1"}
          strokeWidth="1"
          strokeDasharray="2,6"
        />

        {/* Active Progress Arc */}
        <circle
          ref={circleRef}
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter="url(#gaugeGlow)"
        />
      </svg>

      {/* Center Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span
          ref={numberRef}
          className="text-2xl font-black font-display tracking-tight text-white dark:text-white leading-none"
          style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}
        >
          {progress}%
        </span>
        <span className="text-[7.5px] font-mono uppercase font-bold text-[#FF5722] mt-0.5 tracking-wider">
          RISK SCORE
        </span>
      </div>

      <div className="mt-1 flex items-center gap-1 text-[9px] font-mono text-[var(--text-muted)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] animate-pulse" />
        <span>Step 4/6</span>
      </div>
    </div>
  );
};
