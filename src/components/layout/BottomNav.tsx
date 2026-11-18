import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Plus, Users, Wrench } from 'lucide-react';
import clsx from 'clsx';

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-border/80 pb-safe shadow-xl lg:hidden transition-all">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* 1. Dashboard */}
        <NavLink
          to="/app"
          end
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-colors relative',
              isActive ? 'text-brand-700 dark:text-brand-600' : 'text-muted hover:text-ink'
            )
          }
        >
          {({ isActive }) => (
            <>
              <LayoutDashboard className={clsx('w-5 h-5 mb-0.5', isActive && 'stroke-[2.5]')} />
              <span>Dashboard</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-brand-600 absolute bottom-0" />
              )}
            </>
          )}
        </NavLink>

        {/* 2. Properties */}
        <NavLink
          to="/app/properties"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-colors relative',
              isActive ? 'text-brand-700 dark:text-brand-600' : 'text-muted hover:text-ink'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Building2 className={clsx('w-5 h-5 mb-0.5', isActive && 'stroke-[2.5]')} />
              <span>Properties</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-brand-600 absolute bottom-0" />
              )}
            </>
          )}
        </NavLink>

        {/* 3. ＋ Paste (Raised Center Button with Emerald Gradient & Glow) */}
        <div className="flex-1 flex justify-center -mt-6">
          <NavLink
            to="/app/paste"
            className={({ isActive }) =>
              clsx(
                'w-13 h-13 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 border-4 border-bg cursor-pointer',
                isActive
                  ? 'bg-brand-800 text-white ring-4 ring-brand-600/30 shadow-brand-700/40'
                  : 'bg-gradient-to-tr from-brand-700 to-emerald-500 hover:from-brand-800 hover:to-emerald-600 text-white shadow-brand-700/30'
              )
            }
            aria-label="Quick Paste"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </NavLink>
        </div>

        {/* 4. Buyers */}
        <NavLink
          to="/app/buyers"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-colors relative',
              isActive ? 'text-brand-700 dark:text-brand-600' : 'text-muted hover:text-ink'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Users className={clsx('w-5 h-5 mb-0.5', isActive && 'stroke-[2.5]')} />
              <span>Buyers</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-brand-600 absolute bottom-0" />
              )}
            </>
          )}
        </NavLink>

        {/* 5. Tools */}
        <NavLink
          to="/app/tools"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-colors relative',
              isActive ? 'text-brand-700 dark:text-brand-600' : 'text-muted hover:text-ink'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Wrench className={clsx('w-5 h-5 mb-0.5', isActive && 'stroke-[2.5]')} />
              <span>Tools</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-brand-600 absolute bottom-0" />
              )}
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};