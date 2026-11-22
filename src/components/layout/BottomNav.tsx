import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Sparkles, Wrench } from 'lucide-react';
import clsx from 'clsx';

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-white via-white to-emerald-50/25 backdrop-blur-md border-t border-[#E5E9EE] pb-safe shadow-lg lg:hidden transition-all select-none">
      <div className="max-w-md mx-auto px-2 h-14 flex items-center justify-around">
        {/* 1. Dashboard */}
        <NavLink
          to="/app"
          end
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] min-w-[44px] text-[10px] font-semibold transition-colors relative',
              isActive ? 'text-brand-600 font-bold' : 'text-muted hover:text-ink'
            )
          }
        >
          {({ isActive }) => (
            <>
              <LayoutDashboard className={clsx('w-5 h-5 mb-0.5', isActive ? 'text-brand-600 stroke-[2.2]' : 'text-muted')} />
              <span>Dashboard</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600 absolute bottom-0" />
              )}
            </>
          )}
        </NavLink>

        {/* 2. Properties */}
        <NavLink
          to="/app/properties"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] min-w-[44px] text-[10px] font-semibold transition-colors relative',
              isActive ? 'text-brand-600 font-bold' : 'text-muted hover:text-ink'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Building2 className={clsx('w-5 h-5 mb-0.5', isActive ? 'text-brand-600 stroke-[2.2]' : 'text-muted')} />
              <span>Properties</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600 absolute bottom-0" />
              )}
            </>
          )}
        </NavLink>

        {/* 3. Buyers */}
        <NavLink
          to="/app/buyers"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] min-w-[44px] text-[10px] font-semibold transition-colors relative',
              isActive ? 'text-brand-600 font-bold' : 'text-muted hover:text-ink'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Users className={clsx('w-5 h-5 mb-0.5', isActive ? 'text-brand-600 stroke-[2.2]' : 'text-muted')} />
              <span>Buyers</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600 absolute bottom-0" />
              )}
            </>
          )}
        </NavLink>

        {/* 4. Quick Chat (Voice & Text Match) - Highlighted Hero Tab */}
        <NavLink
          to="/app/paste"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] min-w-[44px] text-[10px] font-semibold transition-all relative',
              isActive ? 'text-brand-600 font-bold' : 'text-muted hover:text-ink'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all mb-0.5 shadow-2xs',
                  isActive
                    ? 'bg-gradient-to-tr from-brand-600 to-brand-700 text-white shadow-xs scale-105'
                    : 'bg-[#E8F5EE] text-brand-600'
                )}
              >
                <Sparkles className={clsx('w-4 h-4', isActive && 'stroke-[2.2]')} />
              </div>
              <span>Quick Chat</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600 absolute bottom-0" />
              )}
            </>
          )}
        </NavLink>

        {/* 5. Tools */}
        <NavLink
          to="/app/tools"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] min-w-[44px] text-[10px] font-semibold transition-colors relative',
              isActive ? 'text-brand-600 font-bold' : 'text-muted hover:text-ink'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Wrench className={clsx('w-5 h-5 mb-0.5', isActive ? 'text-brand-600 stroke-[2.2]' : 'text-muted')} />
              <span>Tools</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600 absolute bottom-0" />
              )}
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};
