import React from 'react';
import { Plus, Check } from 'lucide-react';
import { FoodItem } from '../../types';
import { FoodRow } from './FoodRow';

interface ConfirmTableProps {
  items: FoodItem[];
  onUpdateItem: (index: number, updated: Partial<FoodItem>) => void;
  onRemoveItem: (index: number) => void;
  onAddItem: () => void;
  onConfirm: () => void;
  isConfirming: boolean;
}

export const ConfirmTable: React.FC<ConfirmTableProps> = ({
  items,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
  onConfirm,
  isConfirming,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h3 className="text-base font-bold text-[#202020]">
            Review Detected Items
          </h3>
          <p className="text-xs text-[#777777]">
            Adjust quantities or food matches if needed before finalizing.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EAF2E5] text-[#547A46]">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="space-y-2.5">
        {items.map((item, index) => (
          <FoodRow
            key={item.id || index}
            item={item}
            index={index}
            onUpdate={onUpdateItem}
            onRemove={onRemoveItem}
          />
        ))}

        {items.length === 0 && (
          <div className="text-center py-8 border border-dashed border-[#F0F0EE] rounded-2xl">
            <p className="text-sm text-[#777777]">
              No items in this meal yet.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#F0F0EE]">
        <button
          type="button"
          onClick={onAddItem}
          className="text-xs font-semibold text-[#547A46] hover:text-[#3E5C33] inline-flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-[#EAF2E5] transition-colors"
        >
          <Plus className="w-4 h-4 stroke-2" />
          <span>Add item manually</span>
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={items.length === 0 || isConfirming}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F28C38] hover:bg-[#E07C28] text-white font-bold text-[13.5px] shadow-[0_4px_16px_rgba(242,140,56,0.25)] hover:shadow-[0_6px_20px_rgba(242,140,56,0.35)] disabled:opacity-50 disabled:pointer-events-none transition-all"
        >
          <span>{isConfirming ? 'Analyzing...' : 'Analyze Meal'}</span>
          <Check className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
