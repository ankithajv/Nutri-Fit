import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Clock,
  Coffee,
  Sun,
  UtensilsCrossed,
  Apple,
  Moon,
  User,
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
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useMeals } from '../hooks/useMeals';
import { MEAL_TYPES } from '../lib/constants';
import { getTimeGreeting, formatDateFull, formatDateISO, formatCalories } from '../lib/format';
import { MealType } from '../types';
import { PageShell } from '../components/layout/PageShell';
import { MealCard } from '../components/meals/MealCard';
import { ScoreRing } from '../components/analysis/ScoreRing';
import { MacroDonut } from '../components/analysis/MacroDonut';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

const MEAL_ICONS: Record<MealType, React.ComponentType<{ className?: string }>> = {
  breakfast: Coffee,
  brunch: Sun,
  lunch: UtensilsCrossed,
  snacks: Apple,
  dinner: Moon,
};

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { meals, isLoading, fetchMealsForDate } = useMeals();
  const [selectedDate, setSelectedDate] = useState<string>(formatDateISO());

  useEffect(() => {
    fetchMealsForDate(selectedDate);
  }, [fetchMealsForDate, selectedDate]);

  const calorieGoal = user?.calorie_goal || 2000;
  const proteinGoal = user?.protein_goal || 75;
  // Derive sensible carb & fat goals from calorieGoal when not explicitly set on User
  const carbsGoal = Math.round((calorieGoal * 0.5) / 4);
  const fatGoal = Math.round((calorieGoal * 0.3) / 9);

  const totalCalories = meals.reduce((sum, m) => sum + (m.total_calories || 0), 0);
  const totalProtein = Math.round(meals.reduce((sum, m) => sum + (m.total_protein || 0), 0));
  const totalCarbs = Math.round(meals.reduce((sum, m) => sum + (m.total_carbs || 0), 0));
  const totalFat = Math.round(meals.reduce((sum, m) => sum + (m.total_fat || 0), 0));

  const caloriePercentage = Math.min(100, Math.round((totalCalories / calorieGoal) * 100));
  const loggedMeals = meals.filter(m => m.total_calories > 0);

  const macroBars = [
    {
      label: 'Calories',
      current: totalCalories,
      goal: calorieGoal,
      unit: ' kcal',
      color: '#F28C38',
      track: '#FFF1E5',
    },
    {
      label: 'Protein',
      current: totalProtein,
      goal: proteinGoal,
      unit: 'g',
      color: '#547A46',
      track: '#EAF2E5',
    },
    {
      label: 'Carbohydrates',
      current: totalCarbs,
      goal: carbsGoal,
      unit: 'g',
      color: '#F7A96B',
      track: '#FFF1E5',
    },
    {
      label: 'Fats',
      current: totalFat,
      goal: fatGoal,
      unit: 'g',
      color: '#82A874',
      track: '#EAF2E5',
    },
  ];

  // Chart data: calories per meal slot vs per-meal average target
  const mealIntakeData = MEAL_TYPES.map(cfg => {
    const found = meals.find(m => m.meal_type === cfg.key);
    return {
      name: cfg.label,
      calories: found?.total_calories || 0,
      logged: Boolean(found && found.total_calories > 0),
    };
  });

  const formatTime = (iso?: string) => {
    if (!iso) return 'Logged today';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Logged today';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <PageShell maxWidth="standard">
      <div className="space-y-8 sm:space-y-10">
        {/* ── A. Welcome Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#F0F0F0]">
          <div className="space-y-1">
            <h1 className="font-display font-bold text-[28px] sm:text-[34px] leading-tight tracking-tight text-gray-900">
              {getTimeGreeting(user?.name)}
            </h1>
            <p
              className="text-[15px] text-[#777777]"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              Here&apos;s your nutrition overview for today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Clean Date Selector */}
            <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#F8F8F5] border border-[#F0F0F0] text-[13px] font-medium text-[#202020] cursor-pointer hover:border-[#F28C38]/40 transition-colors">
              <Calendar className="w-4 h-4 text-[#547A46]" />
              <span className="hidden sm:inline text-[#777777]">
                {formatDateFull(selectedDate)}
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={e => e.target.value && setSelectedDate(e.target.value)}
                className="bg-transparent text-[#202020] font-semibold focus:outline-none cursor-pointer text-[13px] sm:w-[115px]"
                aria-label="Select dashboard date"
              />
            </label>

            <Link
              to="/weekly-report"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#F0F0F0] bg-[#FFFFFF] hover:bg-[#F8F8F5] text-[13px] font-semibold text-[#202020] transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-[#547A46]" />
              <span>Weekly Report</span>
            </Link>

            <Link
              to="/profile"
              title="Profile"
              className="w-9 h-9 rounded-full bg-[#EAF2E5] text-[#547A46] flex items-center justify-center font-bold text-xs uppercase hover:bg-[#547A46] hover:text-white transition-colors"
            >
              {user?.name ? user.name[0] : <User className="w-4 h-4" />}
            </Link>
          </div>
        </div>

        {/* ── B. Daily Nutrition Overview ── */}
        <Card padding="lg">
          {isLoading ? (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <Skeleton variant="circle" width="144px" height="144px" />
              <div className="flex-1 space-y-4 w-full">
                <Skeleton width="40%" height="22px" />
                <Skeleton width="100%" height="14px" />
                <Skeleton width="100%" height="14px" />
                <Skeleton width="100%" height="14px" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left: Progress Ring + Calorie Summary */}
              <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6">
                <div className="shrink-0">
                  <ScoreRing
                    score={caloriePercentage}
                    size={136}
                    strokeWidth={10}
                    label={totalCalories >= calorieGoal ? 'Goal Met' : 'On Track'}
                    sublabel="of daily goal"
                  />
                </div>
                <div className="text-center sm:text-left space-y-1.5">
                  <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                    DAILY NUTRITION OVERVIEW
                  </span>
                  <div className="flex items-baseline justify-center sm:justify-start gap-2">
                    <span className="text-[36px] sm:text-[42px] font-bold font-display leading-none text-[#202020] tabular-nums tracking-tight">
                      {totalCalories}
                    </span>
                    <span className="text-[14px] text-[#777777] tabular-nums">
                      / {calorieGoal} kcal
                    </span>
                  </div>
                  <p
                    className="text-[14px] text-[#777777]"
                    style={{ fontFamily: "'Times New Roman', Times, serif" }}
                  >
                    {calorieGoal - totalCalories > 0
                      ? `${calorieGoal - totalCalories} kcal remaining for today.`
                      : 'Daily energy target reached.'}
                  </p>
                </div>
              </div>

              {/* Right: Thick Horizontal Progress Bars */}
              <div className="lg:col-span-7 space-y-4">
                {macroBars.map(item => {
                  const pct = Math.min(100, Math.round((item.current / (item.goal || 1)) * 100));
                  return (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-semibold text-[#202020]">{item.label}</span>
                        <span className="text-[#777777] tabular-nums">
                          <strong className="text-[#202020] font-semibold">
                            {item.current}
                            {item.unit}
                          </strong>{' '}
                          / {item.goal}
                          {item.unit}
                        </span>
                      </div>
                      <div
                        className="w-full h-3 rounded-full overflow-hidden"
                        style={{ backgroundColor: item.track }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* ── C & D. Charts Grid: Macronutrient Distribution + Calorie Intake ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* C. Macronutrient Distribution */}
          <Card padding="lg" className="lg:col-span-5 flex flex-col justify-between">
            <div className="mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                MACRONUTRIENT DISTRIBUTION
              </span>
              <h2 className="font-bold text-[18px] text-gray-900 mt-1">
                Protein, Carbs &amp; Fats
              </h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Skeleton variant="circle" width="180px" height="180px" />
              </div>
            ) : (
              <MacroDonut
                protein={totalProtein}
                carbs={totalCarbs}
                fat={totalFat}
                totalCalories={totalCalories}
                size={196}
              />
            )}
          </Card>

          {/* D. Daily Calorie Progress */}
          <Card padding="lg" className="lg:col-span-7 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                  CALORIE INTAKE
                </span>
                <h2 className="font-bold text-[18px] text-gray-900 mt-1">
                  Energy Across Meals
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FFF1E5] text-[#F28C38] text-[12px] font-semibold tabular-nums">
                Target: {calorieGoal} kcal
              </span>
            </div>

            {isLoading ? (
              <Skeleton height="240px" />
            ) : (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mealIntakeData}
                    margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
                  >
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
                                {item.logged ? `${item.calories} kcal` : 'Not logged yet'}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine
                      y={Math.round(calorieGoal / 4)}
                      stroke="#777777"
                      strokeDasharray="4 4"
                      strokeOpacity={0.45}
                      label={{
                        value: 'Avg Meal Guide',
                        fill: '#777777',
                        fontSize: 10,
                        position: 'insideTopRight',
                      }}
                    />
                    <Bar
                      dataKey="calories"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={44}
                      animationDuration={650}
                    >
                      {mealIntakeData.map((entry, idx) => (
                        <Cell
                          key={`intake-${idx}`}
                          fill={entry.logged ? '#F28C38' : '#F0F0F0'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        {/* ── E. Recent Meals (Clean Horizontal Rows) ── */}
        <Card padding="lg" className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                RECENT MEALS
              </span>
              <h2 className="font-bold text-[18px] text-gray-900 mt-1">
                Logged Activity
              </h2>
            </div>
            <Link
              to={`/day-analysis?date=${selectedDate}`}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#547A46] hover:text-[#2E4A24] transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton height="56px" />
              <Skeleton height="56px" />
            </div>
          ) : loggedMeals.length === 0 ? (
            <div className="py-8 text-center space-y-3 bg-[#F8F8F5] rounded-xl px-4">
              <p className="font-semibold text-[15px] text-[#202020]">
                No meals logged for this date yet
              </p>
              <p
                className="text-[14px] text-[#777777] max-w-[46ch] mx-auto"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                Type what you ate in plain language to view instant nutritional breakdown and insights.
              </p>
              <Link
                to="/log-meal?type=breakfast"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#F28C38] hover:bg-[#df7b28] text-white text-[13px] font-semibold transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Breakfast</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#F0F0F0]">
              {loggedMeals.map(meal => {
                const Icon = MEAL_ICONS[meal.meal_type] || UtensilsCrossed;
                const mealTitle =
                  meal.items && meal.items.length > 0
                    ? meal.items.map(i => i.name).join(', ')
                    : `${meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)} meal`;
                return (
                  <div
                    key={meal.id}
                    onClick={() => navigate(`/meal-result/${meal.id}`)}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-[#F8F8F5]/70 px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#EAF2E5] text-[#547A46] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[14px] text-[#202020] truncate">
                          {mealTitle}
                        </p>
                        <div className="flex items-center gap-2.5 mt-0.5 text-[12px] text-[#777777]">
                          <span className="px-2 py-0.5 rounded-full bg-[#FFF1E5] text-[#F28C38] font-medium capitalize">
                            {meal.meal_type}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(meal.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-[15px] text-[#202020] tabular-nums">
                        {formatCalories(meal.total_calories)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#777777]" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* ── Quick-Log Meal Slots ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                DAILY MEAL SLOTS
              </span>
              <h2 className="font-bold text-[18px] text-gray-900 mt-1">
                Today&apos;s Meals
              </h2>
            </div>
            <Link
              to="/log-meal"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F28C38] hover:bg-[#df7b28] text-white text-[13px] font-semibold transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Meal</span>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} height="136px" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {MEAL_TYPES.map(mealConfig => {
                const loggedMeal = meals.find(m => m.meal_type === mealConfig.key);
                return (
                  <MealCard
                    key={mealConfig.key}
                    type={mealConfig.key}
                    meal={loggedMeal || null}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};
