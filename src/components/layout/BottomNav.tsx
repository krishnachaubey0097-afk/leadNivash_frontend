import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Sparkles, Wrench } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/properties', label: 'Properties', icon: Building2 },
  { to: '/app/buyers', label: 'Buyers', icon: Users },
  { to: '/app/paste', label: 'Quick Chat', icon: Sparkles },
  { to: '/app/tools', label: 'Tools', icon: Wrench },
];

export const BottomNav: React.FC = () => {
  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden select-none pb-safe bg-[linear-gradient(168deg,#12140F_0%,#15291B_52%,#0F311E_100%)] text-white border-t border-white/15 rounded-t-[20px] shadow-[0_-6px_24px_rgba(18,20,15,0.2)]"
    >
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] min-w-[48px] rounded-[12px] text-[11px] transition-all duration-150 gap-1 border',
                  isActive
                    ? 'bg-white/[0.12] text-white border-lime/35 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'text-white/65 hover:text-white border-transparent font-medium'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -top-0.5 w-5 h-[3px] rounded-full bg-lime" />
                  )}
                  <Icon
                    className={clsx(
                      'w-[18px] h-[18px] transition-colors',
                      isActive ? 'text-lime' : 'text-white/70'
                    )}
                    strokeWidth={isActive ? 2.25 : 1.8}
                  />
                  <span className="truncate leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
