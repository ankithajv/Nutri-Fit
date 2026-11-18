import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Calendar, TrendingUp, PlusCircle, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/home',          label: 'Dashboard',     icon: Home },
    { to: '/day-analysis',  label: 'Day Analysis',  icon: Calendar },
    { to: '/weekly-report', label: 'Weekly Report', icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-40 hidden md:block bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#F0F0F0]">
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Two-color Wordmark matching Welcome Page */}
        <NavLink to="/home" className="flex items-center gap-2 group">
          <span className="font-display font-bold text-[22px] tracking-tight text-[#202020]">
            Nutri<span className="text-[#F28C38]">Fit</span>
          </span>
        </NavLink>

        {/* Center Navigation */}
        <nav className="flex items-center gap-1.5">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium
                 transition-all duration-150
                 ${isActive
                   ? 'bg-[#EAF2E5] text-[#547A46] font-semibold'
                   : 'text-[#777777] hover:text-[#202020] hover:bg-[#F8F8F5]'
                 }`
              }
            >
              <Icon className="w-4 h-4 stroke-[2]" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <NavLink
            to="/log-meal"
            className="flex items-center gap-1.5 bg-[#F28C38] hover:bg-[#df7b28]
              text-[#FFFFFF] text-[13px] font-semibold px-4 py-2 rounded-full
              shadow-sm transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 stroke-[2]" />
            <span>Log Meal</span>
          </NavLink>

          <div className="h-5 w-[1px] bg-[#F0F0F0] mx-0.5" />

          <NavLink
            to="/profile"
            title="Profile & Settings"
            className={({ isActive }) =>
              `flex items-center gap-2 px-2.5 py-1.5 rounded-full transition-all duration-150
               ${isActive
                 ? 'bg-[#FFF1E5] text-[#F28C38]'
                 : 'text-[#777777] hover:text-[#202020] hover:bg-[#F8F8F5]'
               }`
            }
          >
            <div className="w-7 h-7 rounded-full bg-[#EAF2E5] text-[#547A46] flex items-center justify-center font-semibold text-xs uppercase">
              {user?.name ? user.name[0] : <User className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[13px] font-medium max-w-[110px] truncate text-[#202020]">
              {user?.name || 'Account'}
            </span>
          </NavLink>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-[#777777] hover:text-[#DC2626] hover:bg-[#FEE2E2]
              rounded-full transition-all duration-150"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>
    </header>
  );
};
