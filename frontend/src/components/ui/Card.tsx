import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** default = white card  |  soft = cream card  |  dark = dark-900 panel
   *  olive = olive-500 filled  |  butter = olive-100 highlight  |  ai = dark AI panel */
  variant?: 'default' | 'soft' | 'dark' | 'olive' | 'butter' | 'ai' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  as?: React.ElementType;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'soft',
  padding = 'md',
  hover = false,
  className = '',
  as: Component = 'div',
  ...props
}) => {
  const paddingMap = {
    none: 'p-0',
    sm:   'p-4 sm:p-5',
    md:   'p-6',
    lg:   'p-6 sm:p-8',
  };

  const variantMap = {
    default:
      'bg-[#FFFFFF] border border-[#F0F0F0] shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-[#202020]',
    soft:
      'bg-[#FFFFFF] border border-[#F0F0F0] shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-[#202020]',
    dark:
      'bg-[#202020] border border-[#202020] shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-[#FFFFFF]',
    olive:
      'bg-[#EAF2E5] border border-[#547A46]/15 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-[#202020]',
    butter:
      'bg-[#FFF1E5] border border-[#F28C38]/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-[#202020]',
    ai:
      'bg-[#F8F8F5] border border-[#F0F0F0] shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-[#202020]',
    outline:
      'bg-transparent border border-[#F0F0F0] text-[#202020]',
  };

  const hoverClasses = hover
    ? 'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgb(0,0,0,0.07)] cursor-pointer'
    : 'transition-all duration-200 ease-out';

  return (
    <Component
      className={`rounded-2xl ${variantMap[variant]} ${paddingMap[padding]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};
