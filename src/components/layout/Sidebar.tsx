import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Plus,
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
    { to: '/app/paste', label: 'Quick Paste', icon: Plus },
    { to: '/app/buyers', label: 'Buyers', icon: Users },
    { to: '/app/tools', label: 'Broker Tools', icon: Wrench },
    { to: '/app/inquiries', label: 'Inquiries', icon: Inbox },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-surface border-r border-border shrink-0 min-h-screen p-4 justify-between">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-3 py-2">
          <img src="/logo-icon.png" alt="LeadNivesh" className="w-8 h-8 object-contain" />
          <div>
            <span className="text-lg font-black tracking-tight text-ink font-heading leading-none">
              Lead<span className="text-brand-600">Nivesh</span>
            </span>
            <span className="text-[10px] text-muted font-bold block uppercase tracking-widest mt-0.5">
              Broker OS
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-input text-xs font-bold transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-text hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-ink'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {user?.role === 'admin' && (
            <NavLink
              to="/app/admin"
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-input text-xs font-bold transition-colors',
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

      {/* Broker Profile Footer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-border rounded-card">
        <p className="text-xs font-bold text-ink truncate">{user?.name}</p>
        <p className="text-[10px] text-muted truncate">{user?.agency?.name || user?.email}</p>
        <span className="inline-block mt-1 text-[9px] font-black text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded capitalize">
          {user?.plan?.tier || 'Trial'} Plan
        </span>
      </div>
    </aside>
  );
};
