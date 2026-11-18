import React from 'react';
import { Award, Zap, CheckCircle2, Heart, Flame } from 'lucide-react';

interface BadgeProps {
  title: string;
  description: string;
  earned?: boolean;
  iconName?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  title,
  description,
  earned = true,
  iconName,
}) => {
  const renderIcon = () => {
    switch (iconName || title) {
      case 'Fibre Champion':
        return <Heart className="w-4.5 h-4.5 stroke-2" />;
      case 'Consistent Logger':
        return <CheckCircle2 className="w-4.5 h-4.5 stroke-2" />;
      case 'Balanced Week':
        return <Zap className="w-4.5 h-4.5 stroke-2" />;
      case 'Streak Master':
        return <Flame className="w-4.5 h-4.5 stroke-2" />;
      default:
        return <Award className="w-4.5 h-4.5 stroke-2" />;
    }
  };

  return (
    <div
      className={`p-4 sm:p-4.5 rounded-2xl border flex items-center gap-3.5
        transition-all duration-200
        ${earned
          ? 'bg-gradient-to-br from-white via-white to-[#F8FAF7] border-[#DFEBDC] shadow-[0_4px_20px_rgba(84,122,70,0.06)] hover:shadow-[0_8px_25px_rgba(84,122,70,0.12)]'
          : 'bg-[#F9F9F8] border-gray-100 opacity-60'
        }`}
    >
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
          earned
            ? 'bg-gradient-to-br from-[#EAF2E5] to-[#D8E9D2] text-[#547A46]'
            : 'bg-[#EFEFEF] text-[#9CA3AF]'
        }`}
      >
        {renderIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <h5 className="text-[14px] font-bold text-[#202020] leading-tight truncate">
            {title}
          </h5>
          {earned && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EAF2E5] text-[#547A46]">
              Earned
            </span>
          )}
        </div>
        <p className="text-[12px] text-[#777777] mt-0.5 leading-snug line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
};
