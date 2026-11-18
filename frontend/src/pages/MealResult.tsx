import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { MealAnalysis } from '../types';
import { useAnalysis } from '../hooks/useAnalysis';
import { formatCalories } from '../lib/format';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ScoreRing } from '../components/analysis/ScoreRing';
import { MacroDonut } from '../components/analysis/MacroDonut';
import { NutrientBar } from '../components/analysis/NutrientBar';
import { StatusDot } from '../components/analysis/StatusDot';
import { FeedbackBanner } from '../components/analysis/FeedbackBanner';

export const MealResult: React.FC = () => {
  const { mealId } = useParams<{ mealId: string }>();
  const navigate = useNavigate();
  const { getMealAnalysis, isLoading } = useAnalysis();
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);

  // AI analysis progress stepper simulation during initial load / reveal
  const [stepperPhase, setStepperPhase] = useState<number>(0);
  const [showAiInsight, setShowAiInsight] = useState<boolean>(false);

  const steps = [
    'Parsing meal components',
    'Matching reference food tables (IFCT / USDA)',
    'Calculating exact nutrient grams',
    'Synthesizing diet-quality heuristic',
  ];

  useEffect(() => {
    if (mealId) {
      // Run stepper ticks
      setStepperPhase(1);
      const t1 = setTimeout(() => setStepperPhase(2), 250);
      const t2 = setTimeout(() => setStepperPhase(3), 500);
      const t3 = setTimeout(() => setStepperPhase(4), 750);

      getMealAnalysis(mealId).then(data => {
        setAnalysis(data);
      });

      // Numbers settle first, AI explanation reveals 100ms second
      const t4 = setTimeout(() => {
        setShowAiInsight(true);
      }, 950);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [mealId]);

  if (isLoading || !analysis || stepperPhase < 4) {
    return (
      <PageShell maxWidth="md">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="type-overline">ANALYZING MEAL</span>
          </div>

          {/* Analysis Progress Stepper: 4 steps with self-drawing ticks */}
          <Card className="p-6 space-y-4">
            <h2 className="text-[16px] leading-[24px] font-semibold text-[#202020]">
              Analyzing nutritional composition...
            </h2>
            <div className="space-y-3">
              {steps.map((stepText, idx) => {
                const stepNum = idx + 1;
                const isComplete = stepperPhase > stepNum;
                const isCurrent = stepperPhase === stepNum;

                return (
                  <div key={idx} className="flex items-center gap-3 text-[13px] leading-[20px]">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-[120ms] ${
                        isComplete
                          ? 'bg-[#EAF2E5] text-[#547A46]'
                          : isCurrent
                          ? 'border border-[#547A46] text-[#547A46]'
                          : 'bg-[#F8F8F5] text-[#777777]'
                      }`}
                    >
                      {isComplete ? (
                        <svg
                          className="w-3.5 h-3.5 text-[#547A46]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline className="animate-draw-check" points="20 6 9 17 4 12" />
                        </svg>
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-[#547A46] animate-pulse" />
                      ) : (
                        <span className="text-[11px] font-semibold">{stepNum}</span>
                      )}
                    </div>
                    <span
                      className={`${
                        isComplete
                          ? 'text-[#202020] font-medium'
                          : isCurrent
                          ? 'text-[#547A46] font-semibold'
                          : 'text-[#777777]'
                      }`}
                    >
                      {stepText}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </PageShell>
    );
  }

  const calorieGoal = analysis.daily_calorie_goal || 2000;
  const calPercent = Math.round((analysis.calories / calorieGoal) * 100);

  return (
    <PageShell maxWidth="md">
      <div className="space-y-6">
        {/* Navigation Action */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/home')}
            leftIcon={<ArrowLeft className="w-4 h-4 stroke-2 text-[#547A46]" />}
            className="hover:bg-[#EAF2E5] text-[#202020] rounded-full px-4"
          >
            Dashboard
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-widest uppercase text-[#547A46]">
              ANALYSIS COMPLETE
            </span>
            <span className="font-script text-[17px] text-[#F28C38]">
              decoded by AI
            </span>
          </div>
        </div>

        {/* 1. ScoreRing + Score Label */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-[#FDFAF6] to-[#F7F9F4] border border-[#F0F0EE] shadow-[0_12px_40px_rgba(0,0,0,0.04)] text-center space-y-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400 block">
              DIET QUALITY RATING
            </span>
            <h2 className="font-display font-bold text-[22px] text-gray-900 mt-0.5">
              Meal Balance Score
            </h2>
          </div>

          <div className="flex justify-center py-1">
            <ScoreRing
              score={analysis.score}
              label={analysis.score_label}
              size={130}
              strokeWidth={10}
            />
          </div>

          {/* 6. Chips (up to 3) */}
          {analysis.chips && analysis.chips.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {analysis.chips.slice(0, 3).map((chip, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1 rounded-full text-[12px] font-semibold bg-white border border-[#E8ECE5] text-[#202020] shadow-xs"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 2. Calories Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-[#FFFBF8] border border-[#F3ECE6] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400 block">
              ENERGY CONTENT
            </span>
            <h3 className="text-[28px] leading-tight font-bold font-display text-[#202020] tabular-nums mt-0.5">
              {formatCalories(analysis.calories)}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[13px] font-bold text-[#547A46] tabular-nums px-3 py-1 rounded-full bg-[#EAF2E5]">
              {calPercent}% of daily budget
            </span>
            <p className="text-[12px] text-[#777777] tabular-nums mt-1.5 font-medium">
              Target: {calorieGoal} kcal
            </p>
          </div>
        </div>

        {/* 3. MacroDonut & 4. NutrientBar in 2-col Grid on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Macronutrients */}
          <Card className="p-4 sm:p-5 flex flex-col items-center justify-between">
            <h3 className="type-overline mb-1 self-start">MACRONUTRIENTS</h3>
            <MacroDonut
              protein={analysis.macros.protein}
              carbs={analysis.macros.carbs}
              fat={analysis.macros.fat}
              totalCalories={analysis.calories}
              size={170}
            />
          </Card>

          {/* Micronutrient / Nutrient Bars */}
          <Card className="p-4 sm:p-5 flex flex-col justify-between space-y-3">
            <h3 className="type-overline">BALANCE BARS</h3>
            <div className="space-y-3.5 flex-1 flex flex-col justify-center">
              <NutrientBar
                label="Dietary Fibre"
                value={analysis.nutrients.fibre}
                max={25}
                unit="g"
                low_threshold={3}
                high_threshold={10}
                higherIsBetter={true}
                delayMs={0}
              />
              <NutrientBar
                label="Added Sugar"
                value={analysis.nutrients.sugar}
                max={40}
                unit="g"
                low_threshold={10}
                high_threshold={25}
                higherIsBetter={false}
                delayMs={60}
              />
              <NutrientBar
                label="Sodium"
                value={analysis.nutrients.sodium}
                max={1500}
                unit="mg"
                low_threshold={300}
                high_threshold={600}
                higherIsBetter={false}
                delayMs={120}
              />
            </div>
          </Card>
        </div>

        {/* 5. Food List with StatusDot and Calories */}
        <Card className="p-4 sm:p-5 space-y-2.5">
          <h3 className="type-overline">DETECTED FOOD ITEMS</h3>
          <div className="divide-y divide-[#F0F0F0]">
            {analysis.foods.map((food, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-[13px] leading-[20px]">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <StatusDot status={food.status} title={food.reason} />
                  <div>
                    <span className="font-semibold text-[#202020] block truncate">
                      {food.name}
                    </span>
                    {food.reason && (
                      <span className="text-[11px] text-[#777777] block truncate">
                        {food.reason}
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-semibold text-[#202020] tabular-nums shrink-0">
                  {formatCalories(food.calories)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* 7. FeedbackBanner */}
        {analysis.feedback && (
          <FeedbackBanner
            type={analysis.feedback.type}
            message={analysis.feedback.message}
            swap_suggestion={analysis.feedback.swap_suggestion}
          />
        )}

        {/* 8. AI INSIGHT PANEL */}
        {showAiInsight && (analysis.coach_tip || analysis.feedback) && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#EAF2E5]/90 via-[#F4F9F2] to-white border border-[#C5DEC0] shadow-[0_8px_30px_rgba(84,122,70,0.12)] space-y-3.5 ai-panel-enter">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#547A46] text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold text-[#547A46] uppercase tracking-[0.1em]">
                  NUTRITIONIST COACH INSIGHT
                </span>
              </div>
              <span className="font-script text-[17px] text-[#547A46]">
                healthy habits
              </span>
            </div>

            <p className="text-[14.5px] leading-[23px] text-[#202020] font-normal">
              {analysis.coach_tip ? (
                <span className="word-reveal">{analysis.coach_tip}</span>
              ) : (
                <span className="word-reveal">{analysis.feedback.message}</span>
              )}
            </p>

            {analysis.feedback.swap_suggestion && (
              <div className="pt-3 border-t border-[#C5DEC0]/80 flex items-start gap-2 text-[13px] text-[#2E4A24] bg-white/70 p-3 rounded-xl border border-[#D5E8D1]">
                <span className="font-bold text-[#547A46] shrink-0">Chef's Swap:</span>
                <span className="font-medium text-[#202020]">
                  {analysis.feedback.swap_suggestion}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 9. Factual note */}
        <div className="text-center pt-1 pb-2">
          <p className="text-[12px] text-[#8A948D]">
            Estimates, not medical advice.
          </p>
        </div>
      </div>
    </PageShell>
  );
};
