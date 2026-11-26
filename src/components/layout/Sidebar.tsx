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
  ArrowUpRight,
  Inbox,
  Settings,
  PlayCircle,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthProvider';
import { SpecialOfferModal } from '../../features/pricing/SpecialOfferModal';
import { openVideoGuide } from '../../features/onboarding/GuideVideoModal';
import { BRAND_NAME } from '../../config/constants';
import { BrandLogoBox } from '../ui/BrandLogo';
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

  // Secondary quick links to keep sidebar balanced and structured
  const utilityLinks = [
    { to: '/app/inquiries', label: 'Inquiries', icon: Inbox },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ];

  const userInitials =
    (
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

  const trialDaysLeft = (() => {
    if (user?.plan?.tier === 'trial' && user.plan.trialEndsAt) {
      const diff = new Date(user.plan.trialEndsAt).getTime() - Date.now();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    return null;
  })();

  const planStatus =
    user?.plan?.tier === 'agency' || user?.plan?.tier === 'pro'
      ? 'All Pro features active'
      : trialDaysLeft !== null
      ? `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} free access`
      : '14 days free access';

  return (
    <aside
      className={clsx(
        'hidden lg:flex flex-col h-screen sticky top-0 shrink-0 text-white border-r border-emerald-950/60 select-none z-20 transition-all duration-200 relative overflow-hidden',
        'bg-[linear-gradient(168deg,#12140F_0%,#15291B_38%,#0F311E_72%,#12140F_100%)]',
        isCollapsed ? 'w-[76px] p-2.5' : 'w-[248px] p-4'
      )}
    >
      {/* Subtle Top & Bottom Forest-Green + Lime Radial Sheens (10% Dark Brand Anchor) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(ellipse_at_top_left,rgba(215,247,154,0.16)_0%,rgba(1,142,69,0.14)_45%,transparent_78%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(ellipse_at_bottom_right,rgba(1,142,69,0.22)_0%,rgba(215,247,154,0.06)_45%,transparent_80%)]"
      />

      {/* ── Brand Header ── */}
      <div className={clsx('relative z-10 pb-4 border-b border-white/10', isCollapsed && 'flex justify-center')}>
        <Link
          to="/app"
          className={clsx(
            'flex items-center gap-2.5 rounded-xl group transition-opacity duration-150',
            isCollapsed ? 'justify-center' : 'px-1'
          )}
          title={BRAND_NAME}
        >
          <BrandLogoBox className="w-8 h-8 rounded-[10px] border border-white/20 p-1 shadow-xs group-hover:border-lime transition-colors duration-150" />
          {!isCollapsed && (
            <div className="truncate">
              <span className="text-base font-bold text-white leading-none tracking-tight block font-jakarta">
                {BRAND_NAME}
              </span>
              <span className="text-[11px] text-lime/80 block mt-0.5 font-medium tracking-wide">
                Broker OS
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ── Navigation Sections ── */}
      <nav className="relative z-10 mt-4 flex-1 overflow-y-auto no-scrollbar space-y-5">
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
              Workspace
            </p>
          )}
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
                    'relative flex items-center transition-all duration-150',
                    isCollapsed
                      ? 'justify-center w-11 h-11 mx-auto rounded-[12px]'
                      : 'gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium',
                    isActive
                      ? 'bg-white/[0.11] text-white border border-lime/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] font-semibold'
                      : 'text-white/70 hover:bg-white/[0.06] hover:text-white border border-transparent'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && !isCollapsed && (
                      <span className="w-1 h-4 rounded-full bg-lime shrink-0 -ml-1" />
                    )}
                    <Icon
                      className={clsx(
                        'w-[18px] h-[18px] shrink-0 transition-colors',
                        isActive ? 'text-lime' : 'text-white/65'
                      )}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!isCollapsed && item.highlight && (
                      <span
                        className={clsx(
                          'w-2 h-2 rounded-full shrink-0',
                          isActive ? 'bg-lime' : 'bg-lime/80'
                        )}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Utility / Inbox Shortcuts */}
        <div className="space-y-1 pt-3 border-t border-white/10">
          {!isCollapsed && (
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
              Manage
            </p>
          )}
          {utilityLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  clsx(
                    'relative flex items-center transition-all duration-150',
                    isCollapsed
                      ? 'justify-center w-11 h-11 mx-auto rounded-[12px]'
                      : 'gap-3 px-3 py-2 rounded-[12px] text-sm font-medium',
                    isActive
                      ? 'bg-white/[0.11] text-white border border-lime/35 font-semibold'
                      : 'text-white/70 hover:bg-white/[0.06] hover:text-white border border-transparent'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && !isCollapsed && (
                      <span className="w-1 h-4 rounded-full bg-lime shrink-0 -ml-1" />
                    )}
                    <Icon
                      className={clsx(
                        'w-[18px] h-[18px] shrink-0',
                        isActive ? 'text-lime' : 'text-white/65'
                      )}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* 5-Language Video Guide Trigger */}
          <button
            type="button"
            onClick={() => openVideoGuide(user?.preferences?.language)}
            title={isCollapsed ? 'Video Guide (5 Languages)' : undefined}
            className={clsx(
              'w-full flex items-center transition-all duration-150 text-white/80 hover:bg-white/[0.08] hover:text-lime border border-transparent cursor-pointer',
              isCollapsed
                ? 'justify-center w-11 h-11 mx-auto rounded-[12px]'
                : 'gap-3 px-3 py-2 rounded-[12px] text-sm font-medium'
            )}
          >
            <PlayCircle className="w-[18px] h-[18px] shrink-0 text-lime/90" strokeWidth={1.9} />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left truncate">Guide</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-lime/15 text-lime border border-lime/30">
                  5 Lang
                </span>
              </>
            )}
          </button>

          {/* Admin Console (if user is admin) */}
          {user?.role === 'admin' && (
            <NavLink
              to="/app/admin"
              title={isCollapsed ? 'Admin console' : undefined}
              className={({ isActive }) =>
                clsx(
                  'flex items-center transition-all duration-150',
                  isCollapsed
                    ? 'justify-center w-11 h-11 mx-auto rounded-[12px]'
                    : 'gap-3 px-3 py-2 rounded-[12px] text-sm font-medium',
                  isActive
                    ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40 font-semibold'
                    : 'text-amber-300/85 hover:bg-amber-400/10 hover:text-amber-200 border border-transparent'
                )
              }
            >
              <Shield className="w-[18px] h-[18px] shrink-0" />
              {!isCollapsed && <span className="flex-1 truncate">Admin console</span>}
            </NavLink>
          )}
        </div>
      </nav>

      {/* ── Highlighted Plan Card with Animated Shine CTA ── */}
      <div className="relative z-10 mt-auto pt-3">
        {isCollapsed ? (
          <button
            type="button"
            onClick={() => setIsSpecialOfferOpen(true)}
            title="Upgrade plan"
            className="btn-shine-sweep w-11 h-11 mx-auto rounded-[12px] bg-lime text-ink-black flex items-center justify-center hover:brightness-105 transition-all duration-150 cursor-pointer shadow-sm"
          >
            <Crown className="w-4 h-4 stroke-[2.2]" />
          </button>
        ) : (
          <div className="p-3.5 rounded-[16px] bg-gradient-to-b from-white/[0.09] to-white/[0.03] border border-lime/30 border-t-2 border-t-lime space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-lime">
                <span className="w-1.5 h-1.5 rounded-full bg-lime shrink-0" />
                {planTier}
              </span>
              <Crown className="w-4 h-4 text-lime shrink-0" />
            </div>
            <p className="text-[11px] text-white/75 leading-tight truncate">
              {planStatus}
            </p>
            <button
              type="button"
              onClick={() => setIsSpecialOfferOpen(true)}
              className="group btn-shine-sweep-light w-full mt-1 h-9 pl-3.5 pr-1.5 rounded-[11px] bg-white hover:bg-lime-soft text-ink-black text-xs font-bold whitespace-nowrap flex items-center justify-between gap-2 transition-all duration-150 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-lime"
            >
              <span className="relative z-10">Upgrade to Pro</span>
              <span className="relative z-10 w-6 h-6 rounded-[7px] bg-lime text-ink-black inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.4]" />
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ── User Row Pinned at the Very Bottom ── */}
      <div className="relative z-10 pt-3 mt-3 border-t border-white/10">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Link
              to="/app/settings"
              title={user?.name || 'Settings'}
              className="w-8 h-8 rounded-full bg-lime/15 border border-lime/40 text-lime font-semibold text-xs flex items-center justify-center shrink-0 hover:bg-lime/25 transition-colors"
            >
              {userInitials}
            </Link>
            <button
              type="button"
              onClick={toggleCollapse}
              title="Expand sidebar"
              className="w-8 h-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-lime/15 border border-lime/40 text-lime font-semibold text-xs flex items-center justify-center shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate capitalize">
                  {user?.name || 'Partner broker'}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-white/65">
                  <Link
                    to="/app/settings"
                    className="hover:text-lime hover:underline"
                  >
                    Settings
                  </Link>
                  <span className="text-white/30">·</span>
                  <button
                    type="button"
                    onClick={logout}
                    className="hover:text-rose-300 hover:underline cursor-pointer"
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
              className="w-7 h-7 rounded-lg text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
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
