import React, { useState } from 'react';
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
  Crown,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthProvider';
import { SpecialOfferModal } from '../../features/pricing/SpecialOfferModal';
import clsx from 'clsx';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isSpecialOfferOpen, setIsSpecialOfferOpen] = useState(false);

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

      {/* Broker Profile Footer Card with Special Trial Upgrade Button */}
      <div className="p-4 bg-gradient-to-br from-bg via-white to-emerald-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border border-border/80 dark:border-slate-800 rounded-2xl space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 dark:text-brand-600">
            {user?.plan?.tier ? `${user.plan.tier.toUpperCase()} PLAN` : 'TRIAL PLAN'}
          </span>
          <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
        </div>
        <div>
          <p className="text-xs font-bold text-ink truncate capitalize">{user?.name || 'Partner Broker'}</p>
          <p className="text-[11px] text-muted truncate">{user?.agency?.name || user?.email || 'Direct Broker Agency'}</p>
        </div>

        {/* Upgrade Button with Subtle Glow for Free Trial Users */}
        {(user?.plan?.tier === 'trial' || !user?.plan?.tier) && (
          <div className="pt-2 border-t border-border/60 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-emerald-800 dark:text-emerald-300 font-bold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Special Trial Deal</span>
              </span>
              <span className="bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded text-[9px] border border-emerald-300/80 dark:border-emerald-700 font-extrabold text-emerald-800 dark:text-emerald-300">
                -₹700 OFF
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsSpecialOfferOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl text-white font-extrabold text-[11px] uppercase tracking-wider shadow-md animate-trial-glow flex items-center justify-center gap-1.5 cursor-pointer transition min-h-[38px]"
              title="Upgrade to Yearly Plan for ₹3,299 (Save ₹700)"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Upgrade — ₹3,299/yr</span>
            </button>
          </div>
        )}
      </div>

      <SpecialOfferModal
        isOpen={isSpecialOfferOpen}
        onClose={() => setIsSpecialOfferOpen(false)}
      />
    </aside>
  );
};