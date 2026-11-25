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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border pb-safe lg:hidden select-none">
      <div className="max-w-md mx-auto px-2 h-16 flex items-stretch justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center flex-1 py-1.5 min-h-[48px] min-w-[48px] text-[11px] font-medium transition-colors duration-150 relative gap-0.5',
                  isActive
                    ? 'text-brand-700 font-semibold'
                    : 'text-ink-700 hover:text-ink-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={clsx(
                      'w-5 h-5',
                      isActive ? 'text-brand-600' : 'text-ink-500'
                    )}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute top-0 w-6 h-0.5 rounded-full bg-brand-600" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
