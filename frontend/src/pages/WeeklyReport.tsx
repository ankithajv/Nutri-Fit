import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingUp,
  Award,
  Activity,
  Sparkles,
  CalendarDays,
  ArrowRight,
  AlertCircle,
  Check,
} from 'lucide-react';
import { WeeklyReportData } from '../types';
import { useAnalysis } from '../hooks/useAnalysis';
import { formatDateISO } from '../lib/format';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/analysis/Badge';
import { WeekCaloriesChart } from '../components/charts/WeekCaloriesChart';
import { MacroTrendChart } from '../components/charts/MacroTrendChart';

export const WeeklyReport: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getWeeklyReport, isLoading } = useAnalysis();

  const startDateParam = searchParams.get('start_date') || '2026-11-06';
  const [report, setReport] = useState<WeeklyReportData | null>(null);

  useEffect(() => {
    getWeeklyReport(startDateParam).then(res => setReport(res));
  }, [startDateParam]);

  const handlePrevWeek = () => {
    const d = new Date(startDateParam);
    d.setDate(d.getDate() - 7);
    setSearchParams({ start_date: formatDateISO(d) });
  };

  const handleNextWeek = () => {
    const d = new Date(startDateParam);
    d.setDate(d.getDate() + 7);
    setSearchParams({ start_date: formatDateISO(d) });
  };

  if (isLoading || !report) {
    return (
      <PageShell maxWidth="standard">
        <div className="space-y-8">
          <Skeleton height="64px" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton height="120px" />
            <Skeleton height="120px" />
            <Skeleton height="120px" />
            <Skeleton height="120px" />
          </div>
          <Skeleton height="280px" />
        </div>
      </PageShell>
    );
  }

  // Compute real averages from report data
  const activeCalorieDays = report.daily_calories.filter(d => d.calories > 0);
  const avgDailyCalories =
    activeCalorieDays.length > 0
      ? Math.round(
          activeCalorieDays.reduce((sum, d) => sum + d.calories, 0) / activeCalorieDays.length
        )
      : 0;

  const activeMacroDays = report.macro_trends.filter(
    d => d.protein > 0 || d.carbs > 0 || d.fat > 0
  );
  const avgProtein =
    activeMacroDays.length > 0
      ? Math.round(
          activeMacroDays.reduce((sum, d) => sum + d.protein, 0) / activeMacroDays.length
        )
      : 0;

  const dailyGoal = report.daily_calories[0]?.goal || 2000;
  const earnedBadgesCount = report.badges.filter(b => b.earned).length;

  return (
    <PageShell maxWidth="standard">
      <div className="space-y-8 sm:space-y-10">
        {/* ── A. Page Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#F0F0EE]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest uppercase text-[#547A46]">
                NUTRITIONAL SYNTHESIS
              </span>
              <span className="text-xs text-[#777777]">•</span>
              <span className="font-script text-[17px] text-[#F28C38]">
                nourish &amp; thrive
              </span>
            </div>
            <h1 className="font-display font-bold text-[30px] sm:text-[36px] leading-tight tracking-tight text-gray-900">
              Your Weekly Report
            </h1>
            <p className="text-[14.5px] text-[#777777]">
              Every small daily choice builds consistent long-term health.
            </p>
          </div>

          {/* Week Selector & Navigation */}
          <div className="flex items-center gap-2 bg-[#F8F8F5] p-1.5 rounded-full border border-[#EAEAE7] self-start lg:self-auto shadow-sm">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[13px] font-medium text-[#202020] hover:bg-[#FFFFFF] transition-all hover:shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev Week</span>
            </button>

            <label className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E5E7EB] text-[13px] font-semibold text-[#202020] cursor-pointer shadow-xs hover:border-[#547A46] transition-colors">
              <CalendarDays className="w-4 h-4 text-[#547A46]" />
              <span className="tabular-nums">
                {report.start_date} – {report.end_date}
              </span>
              <input
                type="date"
                value={startDateParam}
                onChange={e => e.target.value && setSearchParams({ start_date: e.target.value })}
                className="sr-only"
                aria-label="Select week start date"
              />
            </label>

            <button
              type="button"
              onClick={handleNextWeek}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[13px] font-medium text-[#202020] hover:bg-[#FFFFFF] transition-all hover:shadow-xs"
            >
              <span className="hidden sm:inline">Next Week</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── B. Weekly Highlights (4 Summary Metric Cards) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white to-[#FFFBF8] border border-[#F3ECE6] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(242,140,56,0.08)] hover:-translate-y-0.5 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">
                AVG CALORIES
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#FFF1E5] text-[#F28C38] flex items-center justify-center shadow-xs">
                <Activity className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <div>
              <p className="text-[28px] sm:text-[34px] font-bold font-display text-[#202020] tabular-nums leading-none">
                {avgDailyCalories}
              </p>
              <p className="text-[12px] text-[#777777] mt-1.5 font-medium">kcal / active day</p>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white to-[#F8FAF7] border border-[#E7EFE4] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(84,122,70,0.08)] hover:-translate-y-0.5 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">
                AVG PROTEIN
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#EAF2E5] text-[#547A46] flex items-center justify-center shadow-xs">
                <TrendingUp className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <div>
              <p className="text-[28px] sm:text-[34px] font-bold font-display text-[#202020] tabular-nums leading-none">
                {avgProtein}g
              </p>
              <p className="text-[12px] text-[#777777] mt-1.5 font-medium">daily protein average</p>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white to-[#FFFBF8] border border-[#F3ECE6] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(242,140,56,0.08)] hover:-translate-y-0.5 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">
                STREAK
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#FFF1E5] text-[#F28C38] flex items-center justify-center shadow-xs">
                <Flame className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <div>
              <p className="text-[28px] sm:text-[34px] font-bold font-display text-[#202020] tabular-nums leading-none">
                {report.stats.streak} Days
              </p>
              <p className="text-[12px] text-[#547A46] font-semibold mt-1.5">
                {report.stats.consistency_pct}% consistency
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white to-[#F8FAF7] border border-[#E7EFE4] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(84,122,70,0.08)] hover:-translate-y-0.5 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">
                MILESTONES
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#EAF2E5] text-[#547A46] flex items-center justify-center shadow-xs">
                <Award className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <div>
              <p className="text-[28px] sm:text-[34px] font-bold font-display text-[#202020] tabular-nums leading-none">
                {earnedBadgesCount} / {report.badges.length}
              </p>
              <p className="text-[12px] text-[#777777] mt-1.5 font-medium">
                {activeCalorieDays.length} of 7 days logged
              </p>
            </div>
          </div>
        </div>

        {/* ── C & D. Charts Grid: Calorie Trends + Macro Trends ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* C. Weekly Calorie Trends */}
          <Card padding="lg" className="lg:col-span-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                  DAILY CALORIE TRENDS
                </span>
                <h2 className="font-bold text-[18px] text-gray-900 mt-1">
                  7-Day Energy Intake
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FFF1E5] text-[#F28C38] text-[12px] font-semibold tabular-nums">
                Target: {dailyGoal} kcal
              </span>
            </div>

            {activeCalorieDays.length === 0 ? (
              <div className="h-60 rounded-xl bg-[#F8F8F5] flex items-center justify-center text-center p-6">
                <p className="text-[14px] text-[#777777]">
                  No calorie data logged for this week yet.
                </p>
              </div>
            ) : (
              <WeekCaloriesChart data={report.daily_calories} dailyGoal={dailyGoal} />
            )}
          </Card>

          {/* D. Weekly Macronutrient Trends */}
          <Card padding="lg" className="lg:col-span-6 space-y-4">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                MACRONUTRIENT TRENDS
              </span>
              <h2 className="font-bold text-[18px] text-gray-900 mt-1">
                Protein, Carbs &amp; Fats (g)
              </h2>
            </div>

            {activeMacroDays.length === 0 ? (
              <div className="h-60 rounded-xl bg-[#F8F8F5] flex items-center justify-center text-center p-6">
                <p className="text-[14px] text-[#777777]">
                  No macronutrient data logged for this week yet.
                </p>
              </div>
            ) : (
              <MacroTrendChart data={report.macro_trends} />
            )}
          </Card>
        </div>

        {/* ── E. Consistency Overview ── */}
        <Card padding="lg" className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                CONSISTENCY OVERVIEW
              </span>
              <h2 className="font-bold text-[18px] text-gray-900 mt-1">
                7-Day Activity &amp; Balance Score
              </h2>
            </div>
            <span className="text-[13px] font-semibold text-[#547A46] bg-[#EAF2E5] px-3 py-1 rounded-full self-start sm:self-auto">
              {report.stats.consistency_pct}% weekly consistency
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-4">
            {report.daily_scores.map(s => {
              const isGood = s.score >= 70;
              const isMid = s.score >= 40 && s.score < 70;
              const hasScore = s.score > 0;

              return (
                <div
                  key={s.day}
                  className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${
                    isGood
                      ? 'bg-[#EAF2E5] text-[#2E4A24]'
                      : isMid
                      ? 'bg-[#FFF1E5] text-[#C2671A]'
                      : 'bg-[#F8F8F5] text-[#777777]'
                  }`}
                >
                  <span className="text-[12px] font-semibold">{s.day}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold ${
                      isGood
                        ? 'bg-[#547A46] text-white'
                        : isMid
                        ? 'bg-[#F28C38] text-white'
                        : 'bg-[#FFFFFF] border border-[#F0F0F0] text-[#9CA3AF]'
                    }`}
                  >
                    {isGood ? <Check className="w-4 h-4 stroke-[2.5]" /> : hasScore ? s.score : '—'}
                  </div>
                  <span className="text-[11px] font-medium tabular-nums">
                    {hasScore ? `${s.score}/100` : 'Rest'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── F. Weekly AI Summary ("Your Week, Decoded.") ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFFFF] via-[#FDFAF6] to-[#F7F9F4] border border-[#F0F0EE] shadow-[0_12px_40px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0F0EE]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#547A46] to-[#3E5C33] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(84,122,70,0.25)]">
                <Sparkles className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-[#547A46]">
                    SYNTHESIS &amp; GUIDANCE
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EAF2E5] text-[#547A46]">
                    Gemini AI
                  </span>
                </div>
                <h2 className="font-display font-bold text-[22px] sm:text-[25px] text-gray-900 leading-tight mt-0.5">
                  Your Week, Decoded.
                </h2>
              </div>
            </div>
            <p className="font-script text-[20px] text-[#547A46] self-start sm:self-auto">
              Smart insights for lasting habits
            </p>
          </div>

          {/* 3 Styled Editorial Insight Tiles */}
          {report.summary_bullets && report.summary_bullets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.summary_bullets.map((bullet, idx) => {
                const categoryConfig = [
                  { title: "Energy Balance", icon: Flame, color: "#F28C38", bg: "#FFF1E5", border: "#FDDBC3" },
                  { title: "Macro Quality", icon: Activity, color: "#547A46", bg: "#EAF2E5", border: "#CFDFC7" },
                  { title: "Habit Momentum", icon: TrendingUp, color: "#2E5B88", bg: "#EBF3FB", border: "#CCE2F5" }
                ][idx % 3];
                const CatIcon = categoryConfig.icon;

                return (
                  <div
                    key={idx}
                    className="group relative p-5 rounded-2xl bg-white/95 backdrop-blur-sm border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5"
                        style={{ backgroundColor: categoryConfig.bg, color: categoryConfig.color }}
                      >
                        <CatIcon className="w-3.5 h-3.5" />
                        {categoryConfig.title}
                      </span>
                      <span className="text-[13px] font-mono font-bold text-gray-300">
                        0{idx + 1}
                      </span>
                    </div>
                    <p className="text-[13.5px] leading-relaxed text-[#202020] font-normal flex-1">
                      {bullet}
                    </p>
                    <div className="w-full h-1 rounded-full bg-gradient-to-r from-transparent via-gray-100 to-transparent group-hover:via-[#547A46]/30 transition-all" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white/80 border border-dashed border-gray-200 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-[#547A46] mx-auto animate-pulse" />
              <p className="text-[14px] font-medium text-gray-700">
                Log meals across the week to unlock your personalized weekly AI summary.
              </p>
            </div>
          )}

          {/* Smart Culinary Swaps Card */}
          {report.warning_card && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF8F2] via-[#FFF3E8] to-[#FFFBF8] border border-[#F28C38]/25 p-5 sm:p-6 shadow-[0_4px_20px_rgba(242,140,56,0.06)] space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#F28C38] to-[#D97320] text-white shrink-0 shadow-sm mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#F28C38] block">
                      CHEF &amp; NUTRITIONIST FOCUS
                    </span>
                    <h4 className="text-[16px] font-bold text-[#202020] mt-0.5">
                      {report.warning_card.title}
                    </h4>
                    {report.warning_card.repeated_foods.length > 0 && (
                      <p className="text-[12.5px] text-[#777777] mt-1">
                        Frequent items to balance:{' '}
                        <strong className="text-[#202020]">
                          {report.warning_card.repeated_foods.join(', ')}
                        </strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {report.warning_card.swaps.length > 0 && (
                <div className="pt-3 border-t border-[#F28C38]/15 space-y-2.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#547A46] block">
                    RECOMMENDED CULINARY SWAPS
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {report.warning_card.swaps.map((swap, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-white/90 border border-[#F28C38]/20 shadow-sm text-[13px] text-[#202020]"
                      >
                        <ArrowRight className="w-4 h-4 shrink-0 text-[#F28C38] mt-0.5" />
                        <span className="font-medium leading-snug">{swap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Frequent Foods Pill Cloud */}
          {report.stats.frequent_foods && report.stats.frequent_foods.length > 0 && (
            <div className="pt-2 space-y-2.5">
              <span className="text-xs font-bold tracking-widest uppercase text-gray-400 block">
                MOST FREQUENT FOODS THIS WEEK
              </span>
              <div className="flex flex-wrap gap-2">
                {report.stats.frequent_foods.map((food, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-white border border-[#EBEBEB] text-[#202020] inline-flex items-center gap-2 shadow-sm"
                  >
                    <span>{food.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#EAF2E5] text-[#547A46] font-bold text-[11px] tabular-nums">
                      {food.count}x
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Weekly Badges ── */}
        <div className="space-y-4">
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400 block">
            WEEKLY NUTRITIONAL BADGES
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.badges.map(b => (
              <Badge
                key={b.id}
                title={b.title}
                description={b.description}
                earned={b.earned}
              />
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
};
