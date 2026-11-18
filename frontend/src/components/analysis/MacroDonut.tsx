import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatMacro } from '../../lib/format';

interface MacroDonutProps {
  protein: number;
  carbs: number;
  fat: number;
  totalCalories?: number;
  size?: number;
  darkMode?: boolean;
}

export const MacroDonut: React.FC<MacroDonutProps> = ({
  protein,
  carbs,
  fat,
  totalCalories,
  size = 196,
  darkMode = false,
}) => {
  const calculatedCalories =
    totalCalories !== undefined
      ? totalCalories
      : Math.round(protein * 4 + carbs * 4 + fat * 9);

  const data = [
    { name: 'Protein', value: Math.max(0, protein), color: '#547A46' }, // Fresh green
    { name: 'Carbs',   value: Math.max(0, carbs),   color: '#F28C38' }, // Accent orange
    { name: 'Fats',    value: Math.max(0, fat),     color: '#82A874' }, // Neutral green
  ];

  const totalGrams = protein + carbs + fat;

  const textPrimary   = darkMode ? '#FFFFFF' : '#202020';
  const textSecondary = darkMode ? '#D1D5DB' : '#777777';
  const dividerColor  = darkMode ? '#333333' : '#F0F0F0';

  const chartData = totalGrams > 0 ? data : [{ name: 'No data', value: 1, color: '#F0F0F0' }];

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={Math.round(size * 0.34)}
              outerRadius={Math.round(size * 0.47)}
              paddingAngle={totalGrams > 0 ? 4 : 0}
              cornerRadius={totalGrams > 0 ? 8 : 0}
              dataKey="value"
              stroke="none"
              animationDuration={650}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {totalGrams > 0 && (
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    const pct = totalGrams > 0 ? Math.round((item.value / totalGrams) * 100) : 0;
                    return (
                      <div className="bg-[#FFFFFF] px-3 py-2 rounded-xl border border-[#F0F0F0] shadow-[0_8px_24px_rgba(0,0,0,0.08)] text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-semibold text-[#202020]">{item.name}</span>
                        </div>
                        <p className="text-[#777777] mt-0.5 tabular-nums">
                          {formatMacro(item.value)} ({pct}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="text-[24px] leading-none font-bold tabular-nums font-display"
            style={{ color: textPrimary }}
          >
            {calculatedCalories}
          </span>
          <span
            className="text-[11px] uppercase font-semibold tracking-wider mt-1"
            style={{ color: textSecondary }}
          >
            kcal
          </span>
        </div>
      </div>

      {/* Legend */}
      <div
        className="grid grid-cols-3 gap-3 w-full max-w-[320px] mt-4 pt-4 text-center"
        style={{ borderTop: `1px solid ${dividerColor}` }}
      >
        {data.map(({ name, value, color }) => {
          const pct = totalGrams > 0 ? Math.round((value / totalGrams) * 100) : 0;
          return (
            <div key={name} className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[12px] font-medium" style={{ color: textSecondary }}>
                  {name}
                </span>
              </div>
              <p className="text-[15px] font-bold tabular-nums leading-tight" style={{ color: textPrimary }}>
                {formatMacro(value)}
              </p>
              <p className="text-[11px] font-medium tabular-nums mt-0.5" style={{ color: textSecondary }}>
                {pct}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
