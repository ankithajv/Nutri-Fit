import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { MealType, FoodItem } from '../types';
import { MEAL_TYPES, QUICK_ADD_CHIPS } from '../lib/constants';
import { formatDateISO } from '../lib/format';
import { useMeals } from '../hooks/useMeals';
import { useToast } from '../components/ui/Toast';
import { PageShell } from '../components/layout/PageShell';
import { ConfirmTable } from '../components/meals/ConfirmTable';

export const LogMeal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { parseMealText, confirmMeal } = useMeals();
  const { toast } = useToast();

  const queryType = (searchParams.get('type') as MealType) || 'breakfast';
  const [mealType, setMealType] = useState<MealType>(
    MEAL_TYPES.some(m => m.key === queryType) ? queryType : 'breakfast'
  );

  const [step, setStep] = useState<1 | 2>(1);
  const [mealText, setMealText] = useState('');
  const [detectedItems, setDetectedItems] = useState<FoodItem[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (queryType && queryType !== mealType && MEAL_TYPES.some(m => m.key === queryType)) {
      setMealType(queryType);
    }
  }, [queryType]);

  const handleSelectType = (type: MealType) => {
    setMealType(type);
    setSearchParams({ type });
  };

  const handleAddChip = (chip: string) => {
    setMealText(prev => (prev ? `${prev}, ${chip}` : chip));
  };

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealText.trim()) {
      toast('Please enter what you ate', 'info');
      return;
    }

    setIsParsing(true);
    try {
      const items = await parseMealText(mealText, mealType);
      if (items.length === 0) {
        toast('Could not detect any food items. Please try describing more specifically.', 'error');
        return;
      }
      setDetectedItems(items);
      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse meal';
      toast(msg, 'error');
    } finally {
      setIsParsing(false);
    }
  };

  const handleUpdateItem = (index: number, updated: Partial<FoodItem>) => {
    setDetectedItems(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, ...updated } : item))
    );
  };

  const handleRemoveItem = (index: number) => {
    setDetectedItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddManualItem = () => {
    const newItem: FoodItem = {
      id: `manual_${Date.now()}`,
      name: 'New item',
      quantity: 1,
      unit: 'portion',
      confidence: 'high',
      calories: 120,
      protein: 5,
      carbs: 15,
      fat: 3,
    };
    setDetectedItems(prev => [...prev, newItem]);
  };

  const handleConfirm = async () => {
    if (detectedItems.length === 0) {
      toast('Please keep at least one food item.', 'error');
      return;
    }

    setIsConfirming(true);
    try {
      const saved = await confirmMeal(mealType, formatDateISO(), detectedItems, mealText);
      toast('Meal logged and analyzed!', 'success');
      navigate(`/meal-result/${saved.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save meal';
      toast(msg, 'error');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <PageShell maxWidth="md">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-2">
          <button
            onClick={() => (step === 2 ? setStep(1) : navigate('/home'))}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#777777] hover:text-[#202020] hover:bg-[#F8F8F5] transition-all"
          >
            <ArrowLeft className="w-4 h-4 stroke-2 text-[#547A46]" />
            <span>{step === 2 ? 'Back to description' : 'Dashboard'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#547A46]">
              Step {step} of 2
            </span>
            <span className="font-script text-[17px] text-[#F28C38]">
              {step === 1 ? 'describe meal' : 'verify portions'}
            </span>
          </div>
        </div>

        {/* Meal Type Selector */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block">
            SELECT MEAL PERIOD
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {MEAL_TYPES.map(m => (
              <button
                key={m.key}
                type="button"
                onClick={() => handleSelectType(m.key)}
                className={`py-2 px-3 rounded-full text-[12px] font-semibold transition-all ${
                  mealType === m.key
                    ? 'bg-[#547A46] text-white shadow-[0_4px_16px_rgba(84,122,70,0.25)]'
                    : 'bg-white border border-[#EBEBEB] text-[#777777] hover:text-[#202020] hover:border-[#D5D5D5]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 1: Text Input */}
        {step === 1 && (
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-[#FDFAF6] to-[#F7F9F4] border border-[#F0F0EE] shadow-[0_12px_40px_rgba(0,0,0,0.04)] space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F28C38] block">
                NATURAL MEAL PARSER
              </span>
              <h2 className="font-display font-bold text-[22px] sm:text-[24px] text-gray-900 leading-tight">
                What did you eat?
              </h2>
              <p className="text-[13.5px] text-[#777777]">
                Enter foods naturally in everyday terms. Our AI calculates grams, calories, and complete micronutrients.
              </p>
            </div>

            <form onSubmit={handleParse} className="space-y-5">
              <div className="relative">
                <textarea
                  rows={4}
                  value={mealText}
                  onChange={e => setMealText(e.target.value)}
                  placeholder="e.g. 2 chapatis, 1 bowl moong dal, a small bowl of cucumber salad"
                  className="w-full p-4.5 rounded-2xl border border-[#E5E7EB] bg-white text-[#202020] text-[14px] placeholder-gray-400 focus:outline-none focus:border-[#547A46] focus:ring-2 focus:ring-[#547A46]/10 resize-none leading-relaxed shadow-xs transition-all"
                />
              </div>

              {/* Quick Add Chips */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Quick-add common staples:
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_ADD_CHIPS.map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleAddChip(chip)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#EAF2E5] hover:text-[#547A46] border border-[#EAEAE7] text-[12px] font-medium text-[#202020] transition-colors shadow-xs"
                    >
                      <Plus className="w-3 h-3 stroke-2 text-[#547A46]" />
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!mealText.trim() || isParsing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#F28C38] hover:bg-[#E07C28] text-white font-bold text-[14px] shadow-[0_4px_16px_rgba(242,140,56,0.25)] hover:shadow-[0_6px_20px_rgba(242,140,56,0.35)] disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  {isParsing ? (
                    <span>Analyzing Meal...</span>
                  ) : (
                    <>
                      <span>Parse &amp; Analyze</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Confirm Table */}
        {step === 2 && (
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#F0F0EE] shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            <ConfirmTable
              items={detectedItems}
              onUpdateItem={handleUpdateItem}
              onRemoveItem={handleRemoveItem}
              onAddItem={handleAddManualItem}
              onConfirm={handleConfirm}
              isConfirming={isConfirming}
            />
          </div>
        )}

        {/* Informative helper */}
        <div className="text-center pt-2">
          <p className="text-[12px] text-[#777777] flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#547A46] stroke-2" />
            <span>AI nutritional estimates. Not medical advice.</span>
          </p>
        </div>
      </div>
    </PageShell>
  );
};
