import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface MacroTrendChartProps {
  data: Array<{
    day: string;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  darkMode?: boolean;
}

export const MacroTrendChart: React.FC<MacroTrendChartProps> = ({ data }) => {
  return (
    <div className="w-full h-60 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
        >
          <defs>
            <linearGradient id="proteinFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#547A46" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#547A46" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="carbsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F28C38" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#F28C38" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="fatFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82A874" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#82A874" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#F0F0F0"
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: '#777777', fontFamily: 'Inter, system-ui' }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter, system-ui' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#F0F0F0] shadow-[0_8px_30px_rgba(0,0,0,0.08)] text-xs space-y-1.5">
                    <p className="font-semibold text-[#202020] mb-1">{label}</p>
                    {payload.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                          <span className="text-[#777777] capitalize">{p.name}</span>
                        </div>
                        <span className="font-semibold text-[#202020] tabular-nums">
                          {p.value}g
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            height={34}
            iconType="circle"
            formatter={(value) => (
              <span className="text-[12px] font-medium text-[#202020] capitalize ml-1">
                {value}
              </span>
            )}
          />
          <Area
            type="monotone"
            dataKey="protein"
            name="Protein"
            stroke="#547A46"
            strokeWidth={2.2}
            fill="url(#proteinFill)"
            dot={{ r: 3, fill: '#FFFFFF', stroke: '#547A46', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: '#547A46', stroke: '#FFFFFF', strokeWidth: 2 }}
            animationDuration={700}
          />
          <Area
            type="monotone"
            dataKey="carbs"
            name="Carbs"
            stroke="#F28C38"
            strokeWidth={2.2}
            fill="url(#carbsFill)"
            dot={{ r: 3, fill: '#FFFFFF', stroke: '#F28C38', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: '#F28C38', stroke: '#FFFFFF', strokeWidth: 2 }}
            animationDuration={700}
          />
          <Area
            type="monotone"
            dataKey="fat"
            name="Fats"
            stroke="#82A874"
            strokeWidth={2.2}
            fill="url(#fatFill)"
            dot={{ r: 3, fill: '#FFFFFF', stroke: '#82A874', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: '#82A874', stroke: '#FFFFFF', strokeWidth: 2 }}
            animationDuration={700}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
