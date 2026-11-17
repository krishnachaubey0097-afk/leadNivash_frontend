import React from 'react';
import { useAuth } from '../lib/auth';
import { useTheme, ACCENT_OPTIONS, type ThemeMode } from '../lib/theme';
import {
  Palette,
  Moon,
  Sun,
  Monitor,
  Check,
  Building,
  User,
  Mail,
  Shield,
  LogOut,
} from 'lucide-react';
import clsx from 'clsx';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { mode, setMode, accent, setAccent } = useTheme();

  return (
    <div className="space-y-5 pb-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            App Settings & Appearance
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Customize themes, accent colors, and manage your broker identity
        </p>
      </div>

      {/* SECTION 1: THEME MODE */}
      <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Display Theme Mode
        </h2>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: 'light' as ThemeMode, label: 'Light', icon: Sun },
            { id: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
            { id: 'system' as ThemeMode, label: 'System', icon: Monitor },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = mode === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setMode(t.id)}
                className={clsx(
                  'p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition cursor-pointer',
                  isSelected
                    ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary/40'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ACCENT COLOR CUSTOMIZATION */}
      <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Accent Brand Palette
          </h2>
          <span className="text-[11px] font-bold text-primary capitalize">
            {accent} Active
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select an accent palette tailored for high-ticket real estate closing:
        </p>

        <div className="space-y-2 pt-1">
          {ACCENT_OPTIONS.map((opt) => {
            const isSelected = accent === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setAccent(opt.id)}
                className={clsx(
                  'w-full p-3 rounded-xl border flex items-center justify-between transition cursor-pointer text-left',
                  isSelected
                    ? 'bg-primary/10 border-primary ring-1 ring-primary/30 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center shrink-0 border-2 border-white/80"
                    style={{ backgroundColor: opt.hex }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {opt.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {opt.description}
                    </p>
                  </div>
                </div>

                <div
                  className="w-12 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: opt.hex }}
                >
                  Apply
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: BROKER IDENTITY PROFILE */}
      <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Broker Profile & Agency
        </h2>

        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <User className="w-4 h-4 text-primary" />
              <span>Broker Name</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              {user?.fullName || 'Broker Agent'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <Building className="w-4 h-4 text-primary" />
              <span>Agency Name</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              {user?.agencyName || 'LeadNivesh Partner Agency'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <Mail className="w-4 h-4 text-primary" />
              <span>Email</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              {user?.email}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <Shield className="w-4 h-4 text-primary" />
              <span>Access Role</span>
            </div>
            <span className="font-bold text-primary uppercase text-[10px]">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4: CLOUD BACKEND CONNECTIVITY */}
      <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Render Cloud Backend Live
            </span>
            <span className="text-[10px] text-slate-400">
              https://leadnivash.onrender.com/api/v1
            </span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
          Online
        </span>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={() => logout()}
        className="w-full py-3 px-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-950/40 transition cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out of LeadNivesh</span>
      </button>
    </div>
  );
};
