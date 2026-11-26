import React from 'react';
import { BRAND_NAME } from '../config/constants';
import { Link } from 'react-router-dom';
import { BrandLogoIcon } from './ui/BrandLogo';
import { useAuth } from '../lib/auth';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-line transition-colors">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/app/today" className="flex items-center gap-2.5 group">
          <BrandLogoIcon className="w-8 h-8 transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">
                {BRAND_NAME}
            </span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">
              Broker OS
            </span>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Settings Link */}
          <Link
            to="/app/settings"
            title="Agency & Profile Settings"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <SettingsIcon className="w-5 h-5" />
          </Link>

          {/* User Badge & Logout */}
          {user && (
            <div className="flex items-center pl-2 border-l border-slate-200 gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900">
                  {user.fullName || 'Broker'}
                </span>
                <span className="text-[10px] text-primary font-medium capitalize">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={() => logout()}
                title="Logout"
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
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
