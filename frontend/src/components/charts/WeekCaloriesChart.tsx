import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface WeekCaloriesChartProps {
  data: Array<{
    day: string;
    calories: number;
    goal: number;
    isToday?: boolean;
  }>;
  dailyGoal?: number;
  darkMode?: boolean;
}

export const WeekCaloriesChart: React.FC<WeekCaloriesChartProps> = ({
  data,
  dailyGoal = 2000,
}) => {
  return (
    <div className="w-full h-60 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
        >
          <defs>
            <linearGradient id="calorieAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F28C38" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#F28C38" stopOpacity={0.02} />
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
            cursor={{ stroke: '#F28C38', strokeWidth: 1, strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#F0F0F0] shadow-[0_8px_30px_rgba(0,0,0,0.08)] text-xs">
                    <p className="font-semibold text-[#202020] mb-1">{item.day}</p>
                    <p className="font-bold text-[14px] text-[#F28C38] tabular-nums">
                      {item.calories} kcal
                    </p>
                    <p className="text-[#777777] tabular-nums mt-0.5">
                      Target: {item.goal || dailyGoal} kcal
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine
            y={dailyGoal}
            stroke="#777777"
            strokeDasharray="5 5"
            strokeOpacity={0.55}
            label={{
              value: `Target (${dailyGoal})`,
              fill: '#777777',
              fontSize: 11,
              position: 'insideTopRight',
              fontFamily: 'Inter, system-ui',
            }}
          />
          <Area
            type="monotone"
            dataKey="calories"
            stroke="#F28C38"
            strokeWidth={2.5}
            fill="url(#calorieAreaFill)"
            dot={{ r: 3.5, fill: '#FFFFFF', stroke: '#F28C38', strokeWidth: 2 }}
            activeDot={{ r: 5.5, fill: '#F28C38', stroke: '#FFFFFF', strokeWidth: 2 }}
            animationDuration={700}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
