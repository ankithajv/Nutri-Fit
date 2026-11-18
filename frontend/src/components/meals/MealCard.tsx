import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Sun, UtensilsCrossed, Apple, Moon, Plus, ArrowRight, Edit3, Check } from 'lucide-react';
import { Meal, MealType } from '../../types';
import { formatCalories } from '../../lib/format';

interface MealCardProps {
  type: MealType;
  meal?: Meal | null;
}

const mealMeta: Record<
  MealType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    iconColor: string;
  }
> = {
  breakfast: { label: 'Breakfast', icon: Coffee,          iconBg: '#FFF1E5', iconColor: '#F28C38' },
  brunch:    { label: 'Brunch',    icon: Sun,             iconBg: '#EAF2E5', iconColor: '#547A46' },
  lunch:     { label: 'Lunch',     icon: UtensilsCrossed, iconBg: '#EAF2E5', iconColor: '#2E4A24' },
  snacks:    { label: 'Snacks',    icon: Apple,           iconBg: '#FFF1E5', iconColor: '#F28C38' },
  dinner:    { label: 'Dinner',    icon: Moon,            iconBg: '#F8F8F5', iconColor: '#202020' },
};

export const MealCard: React.FC<MealCardProps> = ({ type, meal }) => {
  const navigate = useNavigate();
  const config = mealMeta[type];
  const Icon = config.icon;
  const isLogged = Boolean(meal && meal.total_calories > 0);

  const handleAdd  = () => navigate(`/log-meal?type=${type}`);
  const handleView = () => {
    if (meal?.id) {
      navigate(`/meal-result/${meal.id}`);
    } else {
      handleAdd();
    }
  };

  return (
    <div
      className="bg-[#FFFFFF] rounded-2xl border border-[#F0F0F0] p-5 flex flex-col justify-between
        shadow-[0_8px_30px_rgb(0,0,0,0.04)]
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgb(0,0,0,0.07)] cursor-pointer"
      onClick={isLogged ? handleView : handleAdd}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (isLogged ? handleView() : handleAdd())}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: config.iconBg, color: config.iconColor }}
          >
            <Icon className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h4 className="text-[15px] font-semibold text-[#202020] leading-tight">
              {config.label}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isLogged ? (
                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#547A46]">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Logged</span>
                </span>
              ) : (
                <span className="text-[12px] text-[#777777]">Not logged</span>
              )}
            </div>
          </div>
        </div>

        {isLogged && meal && (
          <div className="text-right shrink-0">
            <span className="text-[18px] font-bold tabular-nums leading-none text-[#202020] font-display">
              {formatCalories(meal.total_calories)}
            </span>
            {meal.total_protein !== undefined && (
              <p className="text-[11px] text-[#777777] tabular-nums mt-1">
                {meal.total_protein}g protein
              </p>
            )}
          </div>
        )}
      </div>

      {/* Items preview */}
      {isLogged && meal?.items && meal.items.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-[#F0F0F0] text-[12px] text-[#777777] truncate">
          {meal.items.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ')}
        </div>
      )}

      {/* Footer actions */}
      <div
        className="mt-4 pt-3 border-t border-[#F0F0F0] flex items-center justify-between"
        onClick={e => e.stopPropagation()}
      >
        {isLogged ? (
          <div className="flex items-center gap-2 w-full justify-between">
            <button
              onClick={handleView}
              className="text-[13px] font-semibold text-[#547A46] hover:text-[#2E4A24] inline-flex items-center gap-1 transition-colors"
            >
              <span>View analysis</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </button>
            <button
              onClick={handleAdd}
              title="Edit or log more"
              className="p-1.5 rounded-full text-[#777777] hover:text-[#202020] hover:bg-[#F8F8F5] transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); handleAdd(); }}
            className="w-full py-2 px-3 rounded-full bg-[#F8F8F5] hover:bg-[#FFF1E5] text-[#202020] hover:text-[#F28C38] font-semibold text-[13px]
              flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Log {config.label.toLowerCase()}</span>
          </button>
        )}
      </div>
    </div>
  );
};
