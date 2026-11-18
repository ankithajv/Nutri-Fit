import React from 'react';
import { Navbar } from './Navbar';
import { BottomTabs } from './BottomTabs';

interface PageShellProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'standard' | 'full';
  noPadding?: boolean;
}

export const PageShell: React.FC<PageShellProps> = ({
  children,
  maxWidth = 'standard',
  noPadding = false,
}) => {
  const maxWidthMap = {
    sm:       'max-w-[640px]',
    md:       'max-w-[840px]',
    lg:       'max-w-[1080px]',
    standard: 'max-w-[1440px]',
    full:     'max-w-full',
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#202020]">
      <Navbar />
      <main
        className={`flex-1 w-full mx-auto pb-24 md:pb-14 ${maxWidthMap[maxWidth]} ${
          noPadding ? '' : 'px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8'
        }`}
      >
        <div className="fade-in">{children}</div>
      </main>
      <BottomTabs />
    </div>
  );
};
