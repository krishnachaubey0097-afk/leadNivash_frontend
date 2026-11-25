import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Building2, Users, Wrench, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-line pb-safe shadow-lg">
      <div className="max-w-md mx-auto px-3 h-16 flex items-center justify-between relative">
        {/* Today */}
        <NavLink
          to="/app/today"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors',
              isActive
                ? 'text-primary font-bold'
                : 'text-slate-500 hover:text-slate-900'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Calendar className={clsx('w-5 h-5 mb-1', isActive && 'stroke-[2.5]')} />
              <span>Today</span>
            </>
          )}
        </NavLink>

        {/* Inventory */}
        <NavLink
          to="/app/inventory"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors',
              isActive
                ? 'text-primary font-bold'
                : 'text-slate-500 hover:text-slate-900'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Building2 className={clsx('w-5 h-5 mb-1', isActive && 'stroke-[2.5]')} />
              <span>Inventory</span>
            </>
          )}
        </NavLink>

        {/* Center Floating Action Button (Quick Paste) */}
        <div className="flex-1 flex justify-center -mt-6">
          <NavLink
            to="/app/paste"
            className={({ isActive }) =>
              clsx(
                'w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 border-4 border-bg',
                isActive
                  ? 'bg-brand-600 text-white shadow-lg'
                  : 'bg-brand-600 hover:bg-brand-700 text-white'
              )
            }
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
          </NavLink>
        </div>

        {/* Buyers */}
        <NavLink
          to="/app/buyers"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors',
              isActive
                ? 'text-primary font-bold'
                : 'text-slate-500 hover:text-slate-900'
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

        {/* Broker Toolkit */}
        <NavLink
          to="/app/toolkit"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors',
              isActive
                ? 'text-primary font-bold'
                : 'text-slate-500 hover:text-slate-900'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Wrench className={clsx('w-5 h-5 mb-1', isActive && 'stroke-[2.5]')} />
              <span>Toolkit</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};
