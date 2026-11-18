import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { FoodItem } from '../../types';
import { COMMON_UNITS } from '../../lib/constants';

interface FoodRowProps {
  item: FoodItem;
  index: number;
  onUpdate: (index: number, updated: Partial<FoodItem>) => void;
  onRemove: (index: number) => void;
}

export const FoodRow: React.FC<FoodRowProps> = ({
  item,
  index,
  onUpdate,
  onRemove,
}) => {
  const isBeverage =
    item.is_beverage ||
    /tea|coffee|juice|milk|shake|soda|latte|chai/i.test(item.name || '');

  const isFried =
    item.is_fried ||
    /fried|samosa|pakora|vada|chips|fry|bhatura|puri|bhajji/i.test(item.name || '');

  const isLowConfidence = item.confidence === 'low' || item.confidence === 'medium';

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-150
        ${isLowConfidence
          ? 'bg-gradient-to-br from-white to-[#FFFBF8] border-[#FCE3D2] shadow-xs'
          : 'bg-white border-[#F0F0EE] shadow-xs hover:border-[#E0E0DE]'
        }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        {/* Left: Food name & matched food */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={item.name}
              onChange={e => onUpdate(index, { name: e.target.value })}
              className="font-bold text-[14.5px] text-[#202020] bg-transparent
                border-b border-transparent hover:border-[#547A46]/30 focus:border-[#547A46]
                focus:outline-none px-1 -ml-1 transition-colors w-full max-w-[200px]"
            />
            {item.confidence && (
              <span
                className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full tracking-wider
                  ${item.confidence === 'high'
                    ? 'bg-[#EAF2E5] text-[#547A46]'
                    : item.confidence === 'medium'
                    ? 'bg-[#FFF1E5] text-[#F28C38]'
                    : 'bg-[#FEE2E2] text-[#DC2626]'
                  }`}
              >
                {item.confidence}
              </span>
            )}
          </div>

          {item.matched_food && item.matched_food !== item.name && (
            <p className="text-[12px] text-[#777777] mt-0.5">
              Matched: <span className="font-semibold text-[#547A46]">{item.matched_food}</span>
            </p>
          )}

          {isLowConfidence && (
            <p className="text-[11.5px] text-[#F28C38] flex items-center gap-1 mt-0.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 stroke-2 inline" />
              <span>Verify portion or match</span>
            </p>
          )}
        </div>

        {/* Centre: Quantity and Unit */}
        <div className="flex items-center gap-2">
          <div className="w-20">
            <input
              type="number"
              step="0.25"
              min="0.1"
              value={item.quantity}
              onChange={e => onUpdate(index, { quantity: parseFloat(e.target.value) || 0 })}
              aria-label="Quantity"
              className="w-full text-center py-2 px-2 text-[13px] font-bold
                rounded-xl border border-[#E5E7EB] bg-[#F8F8F5]
                focus:outline-none focus:border-[#547A46] text-[#202020] tabular-nums"
            />
          </div>

          <div className="w-28">
            <select
              value={item.unit}
              onChange={e => onUpdate(index, { unit: e.target.value })}
              aria-label="Unit"
              className="w-full py-2 px-2.5 text-[13px] rounded-xl font-medium
                border border-[#E5E7EB] bg-[#F8F8F5]
                focus:outline-none focus:border-[#547A46] text-[#202020] capitalize"
            >
              {COMMON_UNITS.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
              {!COMMON_UNITS.includes(item.unit) && (
                <option value={item.unit}>{item.unit}</option>
              )}
            </select>
          </div>
        </div>

        {/* Sugar / Oil toggles & delete */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
          <div className="flex items-center gap-1.5">
            {isBeverage && (
              <button
                type="button"
                onClick={() => onUpdate(index, { has_sugar: !item.has_sugar })}
                className={`text-[11px] px-3 py-1 rounded-full font-bold border transition-colors
                  ${item.has_sugar
                    ? 'bg-[#FFF1E5] text-[#F28C38] border-[#F28C38]/30'
                    : 'bg-[#EAF2E5] text-[#547A46] border-[#547A46]/30'
                  }`}
              >
                {item.has_sugar ? 'Sugar added' : 'Sugar-free'}
              </button>
            )}

            {isFried && (
              <button
                type="button"
                onClick={() => onUpdate(index, { has_oil: !item.has_oil })}
                className={`text-[11px] px-3 py-1 rounded-full font-bold border transition-colors
                  ${item.has_oil !== false
                    ? 'bg-[#FFF1E5] text-[#F28C38] border-[#F28C38]/30'
                    : 'bg-[#EAF2E5] text-[#547A46] border-[#547A46]/30'
                  }`}
              >
                {item.has_oil !== false ? 'Regular oil' : 'Oil-free'}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label="Remove item"
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50
              rounded-full transition-colors"
          >
            <X className="w-4 h-4 stroke-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
