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
    { to: '/app/tools', label: 'Broker tools', icon: Wrench },
    { to: '/app/inquiries', label: 'Inquiries', icon: Inbox },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen sticky top-0 bg-white border-r border-border shrink-0 p-4 justify-between overflow-y-auto select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <Link to="/app" className="flex items-center gap-2.5 px-2 py-1 group">
          <div className="w-8 h-8 rounded-lg bg-white border border-border p-1 group-hover:border-brand-600/30 transition-colors duration-150">
            <img src="/logo-icon.png" alt="leadNivash Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-base font-bold text-ink leading-none">
              lead<span className="text-brand-600">Nivash</span>
            </span>
            <span className="text-meta text-muted block mt-0.5">
              Broker OS
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="space-y-0.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-input text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-muted hover:bg-surface-hover hover:text-ink',
                    item.highlight && !isActive && 'text-brand-700 font-semibold'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={clsx(
                        'w-[18px] h-[18px] shrink-0',
                        isActive ? 'text-brand-700' : 'text-muted'
                      )}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
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
                  'flex items-center gap-3 px-3 py-2.5 rounded-input text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-warn-bg text-warn'
                    : 'text-warn hover:bg-warn-bg/50'
                )
              }
            >
              <Shield className="w-[18px] h-[18px] shrink-0" />
              <span>Admin console</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* Broker Profile Footer */}
      <div className="p-3.5 bg-bg border border-border rounded-card space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-meta font-semibold text-brand-700">
            {user?.plan?.tier ? `${user.plan.tier.charAt(0).toUpperCase() + user.plan.tier.slice(1)} plan` : 'Trial plan'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
        </div>
        <div>
          <p className="text-secondary font-medium text-ink truncate capitalize">{user?.name || 'Partner broker'}</p>
          <p className="text-meta text-muted truncate">{user?.agency?.name || user?.email || 'Direct broker agency'}</p>
        </div>

        {/* Upgrade Button for Trial Users */}
        {(user?.plan?.tier === 'trial' || !user?.plan?.tier) && (
          <div className="pt-2 border-t border-border space-y-1.5">
            <div className="flex items-center justify-between text-meta text-brand-700 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Special trial deal</span>
              </span>
              <span className="bg-brand-50 px-1.5 py-0.5 rounded text-meta font-semibold text-brand-700 border border-brand-200/50">
                -₹700 off
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsSpecialOfferOpen(true)}
              className="w-full py-2.5 px-3 rounded-input text-white font-semibold text-sm shadow-sm animate-trial-glow flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 min-h-[40px]"
              title="Upgrade to yearly plan for ₹3,299 (save ₹700)"
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
