import React, { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = orange-500 pill (main action)
   *  secondary = transparent + 2px ink border
   *  tertiary = text link in olive-700
   *  danger = alert-coloured outline */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  // All buttons: pill shape (radius 999px), 48px tall for md/lg, press scale
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-[999px] ' +
    'transition-all duration-[120ms] ease-[cubic-bezier(0.22,1,0.36,1)] ' +
    'focus-ring disabled:opacity-50 disabled:cursor-not-allowed select-none ' +
    'active:scale-[0.97]';

  const sizeClasses = {
    sm: 'text-[13px] px-4 py-2 gap-1.5 h-9',
    md: 'text-[15px] px-5 py-3 gap-2 h-12',   // 48px tall
    lg: 'text-[16px] px-6 py-3.5 gap-2.5 h-12',
  };

  const variantClasses = {
    // orange-500 background, ink text
    primary:
      'bg-[#FF7A1A] text-[#2A2815] hover:bg-[#e86a0d] shadow-[0_4px_16px_rgba(51,50,30,0.08)]',
    // transparent with 2px ink border
    secondary:
      'bg-transparent border-2 border-[#2A2815] text-[#2A2815] hover:bg-[#FBF5EC]',
    // text link in olive-700
    tertiary:
      'bg-transparent text-[#7A781F] hover:text-[#5a5915] hover:bg-[#EEEBC0] px-3',
    // alert-coloured outline
    danger:
      'border-2 border-[#C2412E] text-[#C2412E] bg-transparent hover:bg-[#FBE1DB]',
    // subtle ghost (ink-2 text)
    ghost:
      'text-[#6B6755] hover:text-[#2A2815] hover:bg-[#FBF5EC]',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Spinner size={size === 'lg' ? 'md' : 'sm'} color="currentColor" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};
