import React from 'react';
import { Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

interface FeedbackBannerProps {
  type: 'praise' | 'warning';
  message: string;
  swap_suggestion?: string;
  className?: string;
}

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({
  type,
  message,
  swap_suggestion,
  className = '',
}) => {
  const isPraise = type === 'praise';

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200
        ${isPraise
          ? 'bg-[#EAF2E5] border-[#547A46]/20 text-[#202020]'
          : 'bg-[#FFF1E5] border-[#F28C38]/25 text-[#202020]'
        } ${className}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon dot */}
        <div
          className={`p-2 rounded-full shrink-0 mt-0.5 ${
            isPraise
              ? 'bg-[#547A46] text-[#FFFFFF]'
              : 'bg-[#F28C38] text-[#FFFFFF]'
          }`}
        >
          {isPraise ? (
            <Sparkles className="w-4 h-4 stroke-2" />
          ) : (
            <AlertTriangle className="w-4 h-4 stroke-2" />
          )}
        </div>

        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-[14px] leading-tight text-[#202020]">
            {isPraise ? 'Nutritional win' : 'Room for balance'}
          </h4>
          <p className="text-[13px] leading-[20px] text-[#202020]/85">
            {message}
          </p>

          {swap_suggestion && (
            <div className="mt-2 pt-2 border-t border-black/10 flex items-center gap-2 text-[12px] font-medium">
              <span className="text-[#777777]">Try instead:</span>
              <span className="flex items-center gap-1 font-semibold text-[#547A46]">
                {swap_suggestion}
                <ArrowRight className="w-3.5 h-3.5 inline stroke-2" />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
