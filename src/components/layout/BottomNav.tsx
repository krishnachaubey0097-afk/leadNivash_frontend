import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Plus, Users, Wrench } from 'lucide-react';
import clsx from 'clsx';

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border pb-safe shadow-lg lg:hidden">
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-between relative">
        {/* 1. Dashboard */}
        <NavLink
          to="/app"
          end
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-semibold transition-colors',
              isActive ? 'text-brand-700' : 'text-muted hover:text-ink'
            )
          }
        >
          {({ isActive }) => (
            <>
              <LayoutDashboard className={clsx('w-5 h-5 mb-1', isActive && 'stroke-[2.5]')} />
              <span>Dashboard</span>
            </>
          )}
        </NavLink>

        {/* 2. Properties */}
        <NavLink
          to="/app/properties"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-semibold transition-colors',
              isActive ? 'text-brand-700' : 'text-muted hover:text-ink'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Building2 className={clsx('w-5 h-5 mb-1', isActive && 'stroke-[2.5]')} />
              <span>Properties</span>
            </>
          )}
        </NavLink>

        {/* 3. ＋ Paste (Raised Center Button per PRD §4.1) */}
        <div className="flex-1 flex justify-center -mt-6">
          <NavLink
            to="/app/paste"
            className={({ isActive }) =>
              clsx(
                'w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 border-4 border-bg',
                isActive
                  ? 'bg-brand-700 text-white ring-4 ring-brand-600/30'
                  : 'bg-brand-600 hover:bg-brand-700 text-white'
              )
            }
            aria-label="Quick Paste"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </NavLink>
        </div>

        {/* 4. Buyers */}
        <NavLink
          to="/app/buyers"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-semibold transition-colors',
              isActive ? 'text-brand-700' : 'text-muted hover:text-ink'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Users className={clsx('w-5 h-5 mb-1', isActive && 'stroke-[2.5]')} />
              <span>Buyers</span>
            </>
          )}
        </NavLink>

        {/* 5. Tools */}
        <NavLink
          to="/app/tools"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-semibold transition-colors',
              isActive ? 'text-brand-700' : 'text-muted hover:text-ink'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Wrench className={clsx('w-5 h-5 mb-1', isActive && 'stroke-[2.5]')} />
              <span>Tools</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};
