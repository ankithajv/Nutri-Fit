import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-[#6B6755] leading-[20px]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-4 text-[#9A9582] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-[#FBF5EC] border text-[#2A2815] placeholder-[#9A9582]
              rounded-[20px] py-3 text-[15px] leading-[24px]
              transition-all duration-[120ms] ease-[cubic-bezier(0.22,1,0.36,1)]
              focus-ring focus:bg-[#FFFFFF]
              ${leftIcon  ? 'pl-11' : 'pl-4'}
              ${rightIcon ? 'pr-11' : 'pr-4'}
              ${error
                ? 'border-[#C2412E] focus:border-[#C2412E]'
                : 'border-[#E8D9C5] focus:border-[#B8B240]'
              }
              ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 flex items-center text-[#9A9582]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-[13px] text-[#C2412E] font-medium leading-[20px]">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-[13px] text-[#6B6755] leading-[20px]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
