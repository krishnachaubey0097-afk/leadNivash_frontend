import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Sparkles,
  Users,
  Wrench,
  Inbox,
  Settings,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthProvider';
import clsx from 'clsx';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navLinks = [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/properties', label: 'Properties', icon: Building2 },
    { to: '/app/paste', label: 'Quick Chat', icon: Sparkles, highlight: true },
    { to: '/app/buyers', label: 'Buyers', icon: Users },
    { to: '/app/tools', label: 'Broker Tools', icon: Wrench },
    { to: '/app/inquiries', label: 'Inquiries', icon: Inbox },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-surface/95 backdrop-blur-md border-r border-border shrink-0 p-5 justify-between overflow-y-auto select-none">
      <div className="space-y-6">
        {/* Brand Header with Logo */}
        <Link to="/app" className="flex items-center gap-3 px-2 py-1 group">
          <div className="w-9 h-9 rounded-xl bg-surface border border-border/70 p-1.5 shadow-xs group-hover:border-brand-600/40 transition">
            <img src="/logo-icon.png" alt="leadNivash Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-ink font-heading leading-none">
              lead<span className="text-brand-600">Nivash</span>
            </span>
            <span className="text-[10px] text-muted font-bold block uppercase tracking-widest mt-0.5">
              Broker OS
            </span>
          </div>
        </Link>

        {/* Navigation Items (Quixotic rounded pill list) */}
        <nav className="space-y-1.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all',
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-600 shadow-xs'
                      : 'text-text hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-ink',
                    item.highlight && !isActive && 'text-brand-700 font-extrabold'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={clsx(
                        'w-4 h-4 shrink-0 transition-transform',
                        isActive ? 'text-brand-700 dark:text-brand-600 stroke-[2.5]' : 'text-muted'
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.highlight && (
                      <span className="w-2 h-2 rounded-full bg-brand-600" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          {user?.role === 'admin' && (
            <NavLink
              to="/app/admin"
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all',
                  isActive
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50'
                    : 'text-amber-600 hover:bg-amber-50/50'
                )
              }
            >
              <Shield className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Admin Console</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* Broker Profile Footer Card */}
      <div className="p-4 bg-gradient-to-br from-bg to-brand-50/20 dark:to-brand-950/20 border border-border/80 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 dark:text-brand-600">
            {user?.plan?.tier || 'Trial'} Plan
          </span>
          <span className="flex h-2 w-2 rounded-full bg-brand-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-ink truncate">{user?.name || 'Partner Broker'}</p>
          <p className="text-[11px] text-muted truncate">{user?.agency?.name || user?.email}</p>
        </div>
      </div>
    </aside>
  );
};