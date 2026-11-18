import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, TrendingUp, Plus, User } from 'lucide-react';

export const BottomTabs: React.FC = () => {
  const tabs = [
    { to: '/home',          label: 'Home',    icon: Home },
    { to: '/day-analysis',  label: 'Day',     icon: Calendar },
    { to: '/log-meal',      label: 'Log',     icon: Plus, isPrimary: true },
    { to: '/weekly-report', label: 'Week',    icon: TrendingUp },
    { to: '/profile',       label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#F0F0F0] px-3 py-2 safe-area-pb">
      <div className="flex items-end justify-around max-w-md mx-auto">
        {tabs.map(({ to, label, icon: Icon, isPrimary }) => {
          if (isPrimary) {
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div
                  className="w-12 h-12 rounded-full bg-[#F28C38] text-[#FFFFFF]
                    shadow-[0_6px_20px_rgba(242,140,56,0.35)]
                    flex items-center justify-center
                    transition-transform duration-150 active:scale-[0.96]"
                >
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-semibold mt-1 text-[#F28C38]">
                  {label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-full
                 transition-all duration-150
                 ${isActive
                   ? 'text-[#547A46]'
                   : 'text-[#777777] hover:text-[#202020]'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex items-center justify-center w-10 h-6 rounded-full
                      transition-all duration-150
                      ${isActive ? 'bg-[#EAF2E5]' : ''}`}
                  >
                    <Icon className="w-4.5 h-4.5 stroke-[2]" />
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
