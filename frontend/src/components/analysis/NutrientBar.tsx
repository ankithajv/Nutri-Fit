import React from 'react';

interface NutrientBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  low_threshold: number;
  high_threshold: number;
  higherIsBetter?: boolean;
  delayMs?: number;
  /** If true, renders in dark-panel mode (tracks #44432B) */
  darkMode?: boolean;
}

export const NutrientBar: React.FC<NutrientBarProps> = ({
  label,
  value,
  max,
  unit,
  low_threshold,
  high_threshold,
  higherIsBetter = false,
  delayMs = 0,
  darkMode = false,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / (max || 1)) * 100));

  // ── Status resolution ──────────────────────────────────────────────
  type StatusKey = 'good' | 'caution' | 'alert';
  let statusKey: StatusKey = 'good';

  if (value < low_threshold) {
    statusKey = higherIsBetter ? 'caution' : 'good';
  } else if (value > high_threshold) {
    statusKey = higherIsBetter ? 'good' : 'alert';
  }

  // ── Status → colours ───────────────────────────────────────────────
  const statusStyles: Record<StatusKey, { chipBg: string; chipText: string; barColor: string; label: string }> = {
    good: {
      chipBg:   '#EEEBC0',  // olive-100
      chipText: '#7A781F',  // good (olive-700 on olive-100)
      barColor: '#B8B240',  // olive-500
      label:    'Good',
    },
    caution: {
      chipBg:   '#FFEBC2',  // caution-bg
      chipText: '#B86E00',  // caution text
      barColor: '#FF7A1A',  // orange-500 for caution bar
      label:    'Low',
    },
    alert: {
      chipBg:   '#FBE1DB',  // alert-bg
      chipText: '#C2412E',  // alert text
      barColor: '#C2412E',  // alert bar
      label:    'High',
    },
  };

  const { chipBg, chipText, barColor, label: statusLabel } = statusStyles[statusKey];

  // Track colour: dark-800 inside dark panels, line (#E8D9C5) elsewhere
  const trackColor = darkMode ? '#44432B' : '#E8D9C5';
  const textColor  = darkMode ? '#F7EEE3' : '#2A2815';
  const subColor   = darkMode ? '#C9C4A5' : '#6B6755';

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-[13px] leading-[20px]">
        <span className="font-medium" style={{ color: textColor }}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-semibold tabular-nums" style={{ color: subColor }}>
            {Math.round(value)} {unit}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{ backgroundColor: chipBg, color: chipText }}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Track */}
      <div
        className="w-full rounded-full h-1.5 overflow-hidden"
        style={{ backgroundColor: trackColor }}
      >
        <div
          className="h-full rounded-full transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] anim-bar-grow"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
            transitionDelay: `${delayMs}ms`,
          }}
        />
      </div>
    </div>
  );
};
