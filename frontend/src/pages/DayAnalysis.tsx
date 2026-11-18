import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Calendar,
  Sparkles,
  Coffee,
  Sun,
  UtensilsCrossed,
  Apple,
  Moon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Legend,
} from 'recharts';
import { DayAnalysisData, MealType } from '../types';
import { useAnalysis } from '../hooks/useAnalysis';
import { formatDateFull, formatDateISO, formatCalories } from '../lib/format';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { ScoreRing } from '../components/analysis/ScoreRing';
import { MacroDonut } from '../components/analysis/MacroDonut';
import { FeedbackBanner } from '../components/analysis/FeedbackBanner';

const MEAL_ICONS: Record<MealType, React.ComponentType<{ className?: string }>> = {
  breakfast: Coffee,
  brunch: Sun,
  lunch: UtensilsCrossed,
  snacks: Apple,
  dinner: Moon,
};

export const DayAnalysis: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getDayAnalysis, isLoading } = useAnalysis();

  const currentDateParam = searchParams.get('date') || formatDateISO();
  const isToday = currentDateParam === formatDateISO();
  const [data, setData] = useState<DayAnalysisData | null>(null);

  useEffect(() => {
    getDayAnalysis(currentDateParam).then(res => setData(res));
  }, [currentDateParam]);

  const handlePrevDay = () => {
    const d = new Date(currentDateParam);
    d.setDate(d.getDate() - 1);
    setSearchParams({ date: formatDateISO(d) });
  };

  const handleNextDay = () => {
    const d = new Date(currentDateParam);
    d.setDate(d.getDate() + 1);
    setSearchParams({ date: formatDateISO(d) });
  };

  if (isLoading || !data) {
    return (
      <PageShell maxWidth="standard">
        <div className="space-y-8">
          <Skeleton height="64px" />
          <Skeleton height="180px" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton height="280px" />
            <Skeleton height="280px" />
          </div>
        </div>
      </PageShell>
    );
  }

  const remainingCalories = Math.max(0, data.calorie_goal - data.total_calories);

  const mealChartData = data.meals.map(m => ({
    name: m.meal_type.charAt(0).toUpperCase() + m.meal_type.slice(1),
    calories: m.calories,
    logged: m.logged,
  }));

  const macroGoalsChartData = [
    {
      name: 'Protein',
      Consumed: data.macros.protein.current,
      Goal: data.macros.protein.goal,
    },
    {
      name: 'Carbs',
      Consumed: data.macros.carbs.current,
      Goal: data.macros.carbs.goal,
    },
    {
      name: 'Fats',
      Consumed: data.macros.fat.current,
      Goal: data.macros.fat.goal,
    },
  ];

  const hasLoggedData = data.total_calories > 0 || data.meals.some(m => m.logged);

  return (
    <PageShell maxWidth="standard">
      <div className="space-y-8 sm:space-y-10">
        {/* ── A. Page Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#F0F0F0]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="font-display font-bold text-[28px] sm:text-[34px] leading-tight tracking-tight text-gray-900">
                Your Daily Analysis
              </h1>
              {isToday && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#EAF2E5] text-[#547A46] text-[11px] font-bold uppercase tracking-wider">
                  Today
                </span>
              )}
            </div>
            <p
              className="text-[15px] text-[#777777]"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              A closer look at your nutrition, meal choices, and daily progress.
            </p>
          </div>

          {/* Date Navigation & Picker */}
          <div className="flex items-center gap-2 bg-[#F8F8F5] p-1.5 rounded-full border border-[#F0F0F0] self-start lg:self-auto">
            <button
              type="button"
              onClick={handlePrevDay}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-medium text-[#202020] hover:bg-[#FFFFFF] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#F0F0F0] text-[13px] font-semibold text-[#202020] cursor-pointer">
              <Calendar className="w-4 h-4 text-[#547A46]" />
              <span className="hidden md:inline">{formatDateFull(currentDateParam)}</span>
              <input
                type="date"
                value={currentDateParam}
                onChange={e => e.target.value && setSearchParams({ date: e.target.value })}
                className="bg-transparent focus:outline-none cursor-pointer text-[13px] sm:w-[115px]"
                aria-label="Select analysis date"
              />
            </label>

            <button
              type="button"
              onClick={handleNextDay}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-medium text-[#202020] hover:bg-[#FFFFFF] transition-colors"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── B. Daily Summary Card ── */}
        <Card padding="lg">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="shrink-0">
              <ScoreRing
                score={data.score}
                label={data.score_label}
                size={136}
                strokeWidth={10}
              />
            </div>

            <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              <div className="p-4 rounded-2xl bg-[#FFF1E5]/60">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#777777] block">
                  Consumed
                </span>
                <p className="text-[26px] sm:text-[30px] font-bold font-display text-[#202020] tabular-nums mt-1 leading-none">
                  {data.total_calories}
                </p>
                <span className="text-[12px] text-[#F28C38] font-medium mt-1 block">
                  kcal total
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F8F5]">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#777777] block">
                  Remaining
                </span>
                <p className="text-[26px] sm:text-[30px] font-bold font-display text-[#202020] tabular-nums mt-1 leading-none">
                  {remainingCalories}
                </p>
                <span className="text-[12px] text-[#777777] mt-1 block">
                  of {data.calorie_goal} kcal
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#EAF2E5]/70">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#777777] block">
                  Protein
                </span>
                <p className="text-[26px] sm:text-[30px] font-bold font-display text-[#202020] tabular-nums mt-1 leading-none">
                  {data.macros.protein.current}g
                </p>
                <span className="text-[12px] text-[#547A46] font-medium mt-1 block">
                  Goal: {data.macros.protein.goal}g
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF1E5]/40">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#777777] block">
                  Carbs
                </span>
                <p className="text-[26px] sm:text-[30px] font-bold font-display text-[#202020] tabular-nums mt-1 leading-none">
                  {data.macros.carbs.current}g
                </p>
                <span className="text-[12px] text-[#777777] mt-1 block">
                  Goal: {data.macros.carbs.goal}g
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#EAF2E5]/40 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#777777] block">
                  Fats
                </span>
                <p className="text-[26px] sm:text-[30px] font-bold font-display text-[#202020] tabular-nums mt-1 leading-none">
                  {data.macros.fat.current}g
                </p>
                <span className="text-[12px] text-[#777777] mt-1 block">
                  Goal: {data.macros.fat.goal}g
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* ── D. Nutrition Analysis Charts (3 Separate Modern Cards) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chart 1: Calorie Intake vs Daily Target */}
          <Card padding="lg" className="lg:col-span-7 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                  CALORIE INTAKE VS TARGET
                </span>
                <h2 className="font-bold text-[18px] text-gray-900 mt-1">
                  Energy by Meal
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FFF1E5] text-[#F28C38] text-[12px] font-semibold tabular-nums">
                {data.total_calories} / {data.calorie_goal} kcal
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mealChartData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis
                    dataKey="name"
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
                    cursor={{ fill: '#F8F8F5' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#F0F0F0] shadow-[0_8px_30px_rgba(0,0,0,0.08)] text-xs">
                            <p className="font-semibold text-[#202020]">{item.name}</p>
                            <p className="text-[#F28C38] font-bold tabular-nums mt-0.5">
                              {item.logged ? `${item.calories} kcal` : 'Not logged'}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={Math.round(data.calorie_goal / 4)}
                    stroke="#777777"
                    strokeDasharray="4 4"
                    strokeOpacity={0.45}
                    label={{
                      value: 'Meal Target Guide',
                      fill: '#777777',
                      fontSize: 10,
                      position: 'insideTopRight',
                    }}
                  />
                  <Bar dataKey="calories" radius={[8, 8, 0, 0]} maxBarSize={42} animationDuration={650}>
                    {mealChartData.map((entry, index) => (
                      <Cell
                        key={`meal-bar-${index}`}
                        fill={entry.logged ? '#F28C38' : '#F0F0F0'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 2: Protein, Carbohydrates & Fats Distribution */}
          <Card padding="lg" className="lg:col-span-5 flex flex-col justify-between">
            <div className="mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                MACRONUTRIENT SPLIT
              </span>
              <h2 className="font-bold text-[18px] text-gray-900 mt-1">
                Daily Distribution
              </h2>
            </div>

            <MacroDonut
              protein={data.macros.protein.current}
              carbs={data.macros.carbs.current}
              fat={data.macros.fat.current}
              totalCalories={data.total_calories}
              size={196}
            />
          </Card>
        </div>

        {/* Chart 3: Macro Consumption vs Individual Goals (Grouped Horizontal Bar Chart) */}
        <Card padding="lg" className="space-y-4">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
              MACRO CONSUMPTION VS GOALS
            </span>
            <h2 className="font-bold text-[18px] text-gray-900 mt-1">
              Target Comparison (grams)
            </h2>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={macroGoalsChartData}
                layout="vertical"
                margin={{ top: 8, right: 20, left: 10, bottom: 0 }}
                barGap={6}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F0F0" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter, system-ui' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#202020', fontWeight: 600, fontFamily: 'Inter, system-ui' }}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                />
                <Tooltip
                  cursor={{ fill: '#F8F8F5' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#F0F0F0] shadow-[0_8px_30px_rgba(0,0,0,0.08)] text-xs space-y-1">
                          <p className="font-semibold text-[#202020]">{label}</p>
                          {payload.map((entry, idx) => (
                            <p key={idx} className="tabular-nums" style={{ color: entry.color }}>
                              {entry.name}: <strong>{entry.value}g</strong>
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={30}
                  iconType="circle"
                  formatter={value => (
                    <span className="text-[12px] font-medium text-[#202020] ml-1">{value}</span>
                  )}
                />
                <Bar dataKey="Consumed" fill="#547A46" radius={[0, 6, 6, 0]} barSize={14} animationDuration={650} />
                <Bar dataKey="Goal" fill="#E5E7EB" radius={[0, 6, 6, 0]} barSize={14} animationDuration={650} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ── C. Meal Breakdown Timeline ── */}
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                MEAL BREAKDOWN
              </span>
              <h2 className="font-bold text-[18px] text-gray-900 mt-1">
                Daily Meal Timeline
              </h2>
            </div>
            <span className="text-[13px] font-semibold text-[#547A46] bg-[#EAF2E5] px-3 py-1 rounded-full tabular-nums">
              {data.meals.filter(m => m.logged).length} / 5 logged
            </span>
          </div>

          <div className="divide-y divide-[#F0F0F0]">
            {data.meals.map(meal => {
              const Icon = MEAL_ICONS[meal.meal_type] || UtensilsCrossed;
              return (
                <div
                  key={meal.meal_type}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        meal.logged
                          ? 'bg-[#EAF2E5] text-[#547A46]'
                          : 'bg-[#F8F8F5] text-[#9CA3AF]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-semibold text-[15px] capitalize text-[#202020] block">
                        {meal.meal_type}
                      </span>
                      <span className="text-[12px] text-[#777777]">
                        {meal.logged
                          ? meal.protein !== undefined
                            ? `${meal.protein}g protein`
                            : 'Logged'
                          : 'Not logged yet'}
                      </span>
                    </div>
                  </div>

                  {meal.logged ? (
                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <span className="font-bold text-[15px] text-[#202020] tabular-nums">
                        {formatCalories(meal.calories)}
                      </span>
                      {meal.meal_id && (
                        <button
                          onClick={() => navigate(`/meal-result/${meal.meal_id}`)}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#F8F8F5] hover:bg-[#EAF2E5] text-[#547A46] text-[13px] font-semibold transition-colors"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`/log-meal?type=${meal.meal_type}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFF1E5] hover:bg-[#F28C38] text-[#F28C38] hover:text-white text-[13px] font-semibold transition-colors self-end sm:self-auto"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Log {meal.meal_type}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── E. AI Nutrition Insights ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFFFF] via-[#FDFAF6] to-[#F7F9F4] border border-[#F0F0EE] shadow-[0_12px_40px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0F0EE]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#547A46] to-[#3E5C33] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(84,122,70,0.25)]">
                <Sparkles className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#547A46] block">
                  PERSONALIZED GUIDANCE
                </span>
                <h2 className="font-display font-bold text-[20px] sm:text-[22px] text-gray-900">
                  AI Nutrition Insights
                </h2>
              </div>
            </div>
            <p className="font-script text-[18px] text-[#547A46] self-start sm:self-auto">
              Daily habit calibration
            </p>
          </div>

          {!hasLoggedData ? (
            <div className="p-8 rounded-2xl bg-white/80 border border-dashed border-gray-200 text-center space-y-2">
              <p className="font-semibold text-[15px] text-[#202020]">
                Insufficient data for insights
              </p>
              <p className="text-[14px] text-[#777777]">
                Log at least one meal for this day to generate personalized nutrition insights.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.banner && (
                <FeedbackBanner
                  type={data.banner.type}
                  message={data.banner.message}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {Object.entries(data.checklist).map(([key, item]) => (
                  <div
                    key={key}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all ${
                      item.pass
                        ? 'bg-gradient-to-br from-white to-[#F8FAF7] border-[#DFEBDC] shadow-[0_2px_12px_rgba(84,122,70,0.04)]'
                        : 'bg-gradient-to-br from-white to-[#FFFBF8] border-[#FCE3D2] shadow-[0_2px_12px_rgba(242,140,56,0.04)]'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.pass ? (
                        <div className="w-6 h-6 rounded-full bg-[#EAF2E5] flex items-center justify-center text-[#547A46]">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#FFF1E5] flex items-center justify-center text-[#F28C38]">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold capitalize text-[#202020] text-[13.5px]">
                          {key}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.pass
                              ? 'bg-[#EAF2E5] text-[#547A46]'
                              : 'bg-[#FFF1E5] text-[#F28C38]'
                          }`}
                        >
                          {item.pass ? 'Optimized' : 'Needs Focus'}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-[#777777] leading-relaxed">
                        {item.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};
