import React from 'react';

interface StatusDotProps {
  status: 'green' | 'amber' | 'red' | 'good' | 'caution' | 'alert';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 'md',
  className = '',
  title,
}) => {
  const sizeMap = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const isGood    = status === 'green' || status === 'good';
  const isCaution = status === 'amber' || status === 'caution';

  // good: olive-700 on olive-100 | caution: B86E00 on FFEBC2 | alert: C2412E on FBE1DB
  const dotColor = isGood
    ? 'bg-[#7A781F]'
    : isCaution
    ? 'bg-[#B86E00]'
    : 'bg-[#C2412E]';

  return (
    <span
      title={title || status}
      className={`inline-block rounded-full shrink-0 ${sizeMap[size]} ${dotColor} ${className}`}
    />
  );
};
