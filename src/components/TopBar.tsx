import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import { Moon, Sun, Settings as SettingsIcon, LogOut } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, setMode } = useTheme();

  const toggleDarkMode = () => {
    setMode(isDark ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/app/today" className="flex items-center gap-2.5 group">
          <img
            src="/logo-icon.png"
            alt="leadNivash Logo"
            className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              lead<span className="text-primary font-black">Nivash</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
              Broker OS
            </span>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Settings Link */}
          <Link
            to="/app/settings"
            title="Appearance & Settings"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <SettingsIcon className="w-5 h-5" />
          </Link>

          {/* User Badge & Logout */}
          {user && (
            <div className="flex items-center pl-2 border-l border-slate-200 dark:border-slate-800 gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {user.fullName || 'Broker'}
                </span>
                <span className="text-[10px] text-primary font-medium capitalize">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={() => logout()}
                title="Logout"
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
