import React, { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;      // 0 to 100
  label?: string;
  size?: number;      // default 140
  strokeWidth?: number; // default 10
  showLabel?: boolean;
  sublabel?: string;
  /** Render in dark-panel mode: ink colour → on-dark */
  darkMode?: boolean;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  label,
  size = 140,
  strokeWidth = 10,
  showLabel = true,
  sublabel,
  darkMode = false,
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  const clampedScore = Math.min(100, Math.max(0, Math.round(score)));

  // ── Status-driven colour ──────────────────────────────────────────
  let ringColor    = '#DC2626'; // alert
  let chipBg       = '#FEE2E2';
  let chipText     = '#DC2626';
  let defaultLabel = 'Needs balance';

  if (clampedScore >= 70) {
    ringColor    = '#547A46'; // fresh green
    chipBg       = '#EAF2E5'; // light green
    chipText     = '#2E4A24'; // dark green
    defaultLabel = clampedScore >= 85 ? 'Great' : 'Good';
  } else if (clampedScore >= 50) {
    ringColor    = '#F28C38'; // accent orange
    chipBg       = '#FFF1E5'; // light orange
    chipText     = '#C2671A';
    defaultLabel = 'Okay';
  }

  const finalLabel = label || defaultLabel;

  const radius       = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset       = circumference - (clampedScore / 100) * circumference;

  // Count-up animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayScore(clampedScore);
      return;
    }

    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = progress === 1 ? 1 : 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(ease * clampedScore));
      if (progress < 1) requestAnimationFrame(animate);
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [clampedScore]);

  const textPrimary = darkMode ? '#FFFFFF' : '#202020';
  const textSub     = darkMode ? '#D1D5DB' : '#777777';
  const trackColor  = darkMode ? '#333333' : '#F0F0F0';

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          aria-hidden="true"
        >
          {/* Empty track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 800ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </svg>

        {/* Centre number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="text-[38px] leading-none font-bold tabular-nums tracking-tight"
            style={{ fontFamily: 'Poppins, system-ui', color: textPrimary }}
          >
            {displayScore}
          </span>
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.1em] mt-1"
            style={{ color: textSub }}
          >
            {sublabel || '/ 100'}
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="mt-2.5">
          <span
            className="inline-block px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ backgroundColor: chipBg, color: chipText }}
          >
            {finalLabel}
          </span>
        </div>
      )}
    </div>
  );
};
