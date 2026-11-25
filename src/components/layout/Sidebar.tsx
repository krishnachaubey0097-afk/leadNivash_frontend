import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Sparkles,
  Users,
  Wrench,
  Shield,
  Crown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthProvider';
import { SpecialOfferModal } from '../../features/pricing/SpecialOfferModal';
import { BRAND_NAME } from '../../config/constants';
import clsx from 'clsx';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isSpecialOfferOpen, setIsSpecialOfferOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('leadnivash_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('leadnivash_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // 5 Core navigation items
  const navLinks = [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/properties', label: 'Properties', icon: Building2 },
    { to: '/app/paste', label: 'Quick Chat', icon: Sparkles, highlight: true },
    { to: '/app/buyers', label: 'Buyers', icon: Users },
    { to: '/app/tools', label: 'Broker tools', icon: Wrench },
  ];

  const userInitials = (
    user?.name ||
    user?.agency?.name ||
    user?.email?.split('@')[0] ||
    'B'
  )
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'B';

  const planTier = user?.plan?.tier
    ? `${user.plan.tier.charAt(0).toUpperCase() + user.plan.tier.slice(1)} plan`
    : 'Trial plan';

  const planStatus =
    user?.plan?.tier === 'agency'
      ? 'All features active'
      : '14 days free access';

  return (
    <aside
      className={clsx(
        'hidden lg:flex flex-col h-screen sticky top-0 shrink-0 border-r border-border select-none z-20 transition-all duration-200',
        'bg-[rgba(18,20,15,0.04)] backdrop-blur-md',
        isCollapsed ? 'w-[72px] p-2.5' : 'w-[240px] p-4'
      )}
    >
      {/* ── Brand Header ── */}
      <div className={clsx('pb-4 border-b border-border/60', isCollapsed && 'flex justify-center')}>
        <Link
          to="/app"
          className={clsx(
            'flex items-center gap-2.5 rounded-xl group transition-opacity duration-150',
            isCollapsed ? 'justify-center' : 'px-1'
          )}
          title={BRAND_NAME}
        >
          <div className="w-7 h-7 rounded-lg bg-surface border border-border p-1 flex items-center justify-center shrink-0 group-hover:border-brand-600/30 transition-colors duration-150">
            <img
              src="/logo-icon.png"
              alt={`${BRAND_NAME} logo`}
              className="w-full h-full object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="text-base font-bold text-ink-900 leading-none tracking-tight block">
                {BRAND_NAME}
              </span>
              <span className="text-meta text-ink-700 block mt-0.5 font-normal">
                Broker OS
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ── 5 Core Navigation Items ── */}
      <nav className="space-y-1 mt-3 flex-1 overflow-y-auto no-scrollbar">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                clsx(
                  'flex items-center transition-all duration-150',
                  isCollapsed
                    ? 'justify-center w-11 h-11 mx-auto rounded-full'
                    : 'gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium',
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-2xs font-semibold'
                    : 'text-ink-700 hover:bg-slate-100/80 hover:text-ink-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={clsx(
                      'w-5 h-5 shrink-0',
                      isActive ? 'text-brand-700' : 'text-ink-700'
                    )}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!isCollapsed && item.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Admin Console (if user is admin) */}
        {user?.role === 'admin' && (
          <NavLink
            to="/app/admin"
            title={isCollapsed ? 'Admin console' : undefined}
            className={({ isActive }) =>
              clsx(
                'flex items-center transition-all duration-150',
                isCollapsed
                  ? 'justify-center w-11 h-11 mx-auto rounded-full'
                  : 'gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium',
                isActive
                  ? 'bg-amber-50 text-amber-800 font-semibold'
                  : 'text-amber-700 hover:bg-amber-50/70 hover:text-amber-900'
              )
            }
          >
            <Shield className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="flex-1 truncate">Admin console</span>}
          </NavLink>
        )}
      </nav>

      {/* ── ONE Compact Plan Card (Glass, Radius 16) ── */}
      <div className="mt-auto pt-3">
        {isCollapsed ? (
          <button
            type="button"
            onClick={() => setIsSpecialOfferOpen(true)}
            title="Upgrade plan"
            className="w-10 h-10 mx-auto rounded-[14px] bg-white/95 border border-border text-brand-700 flex items-center justify-center hover:bg-brand-50 hover:border-brand-600/30 transition-colors duration-150 cursor-pointer"
          >
            <Crown className="w-4 h-4 text-brand-600" />
          </button>
        ) : (
          <div className="p-3.5 rounded-[16px] bg-white/95 border border-border/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-700">
                {planTier}
              </span>
              <Crown className="w-3.5 h-3.5 text-brand-600" />
            </div>
            <p className="text-[11px] text-muted leading-tight truncate">
              {planStatus}
            </p>
            <button
              type="button"
              onClick={() => setIsSpecialOfferOpen(true)}
              className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold whitespace-nowrap truncate transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-1"
            >
              Upgrade
            </button>
          </div>
        )}
      </div>

      {/* ── User Row Pinned at the Very Bottom ── */}
      <div className="pt-3 mt-3 border-t border-border/60">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Link
              to="/app/settings"
              title={user?.name || 'Settings'}
              className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-semibold text-xs flex items-center justify-center shrink-0 hover:border-brand-600/40 transition-colors"
            >
              {userInitials}
            </Link>
            <button
              type="button"
              onClick={toggleCollapse}
              title="Expand sidebar"
              className="w-8 h-8 rounded-lg text-muted hover:text-ink hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-semibold text-xs flex items-center justify-center shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-secondary font-medium text-ink truncate capitalize">
                  {user?.name || 'Partner broker'}
                </p>
                <div className="flex items-center gap-1.5 text-meta text-ink-700">
                  <Link
                    to="/app/settings"
                    className="hover:text-ink-900 hover:underline text-[11px]"
                  >
                    Settings
                  </Link>
                  <span className="text-ink-500">·</span>
                  <button
                    type="button"
                    onClick={logout}
                    className="hover:text-danger hover:underline text-[11px] cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>

            {/* Collapse toggle button at bottom */}
            <button
              type="button"
              onClick={toggleCollapse}
              title="Collapse sidebar"
              className="w-7 h-7 rounded-lg text-muted hover:text-ink hover:bg-slate-100 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <SpecialOfferModal
        isOpen={isSpecialOfferOpen}
        onClose={() => setIsSpecialOfferOpen(false)}
      />
    </aside>
  );
};
