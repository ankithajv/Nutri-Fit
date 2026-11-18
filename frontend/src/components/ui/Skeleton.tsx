import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
  variant?: 'text' | 'card' | 'circle' | 'rect';
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  lines = 1,
  variant = 'text',
  width,
  height,
}) => {
  const base =
    'skeleton-shimmer rounded-[20px] animate-pulse bg-[#E8D9C5]';

  if (variant === 'circle') {
    const size = width || height || '40px';
    return (
      <div
        className={`rounded-full ${base} ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`rounded-[28px] ${base} ${className}`}
        style={{ width: width || '100%', height: height || '120px' }}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'rect') {
    return (
      <div
        className={`${base} ${className}`}
        style={{ width: width || '100%', height: height || '12px' }}
        aria-hidden="true"
      />
    );
  }

  // text — renders stacked lines
  return (
    <div className={`flex flex-col gap-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${base} h-3`}
          style={{ width: i === lines - 1 && lines > 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
};
