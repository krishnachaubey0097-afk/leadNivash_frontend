import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AvatarMenu } from './AvatarMenu';
import { Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../../lib/theme';

export const TopBar: React.FC = () => {
  const location = useLocation();
  const { mode, setMode } = useTheme();

  const getPageTitle = (pathname: string): { title: string; subtitle?: string } => {
    if (pathname === '/app') return { title: 'Today', subtitle: 'Overview & Matches' };
    if (pathname.startsWith('/app/track-record')) return { title: 'Track Record', subtitle: 'Pipeline & Deals' };
    if (pathname === '/app/properties/new') return { title: 'New Listing', subtitle: 'Add Property' };
    if (pathname.startsWith('/app/properties')) return { title: 'Inventory', subtitle: 'Property Listings' };
    if (pathname === '/app/paste') return { title: 'Quick Paste', subtitle: 'AI WhatsApp Parser' };
    if (pathname === '/app/buyers/new') return { title: 'New Buyer', subtitle: 'Add Requirement' };
    if (pathname.startsWith('/app/buyers')) return { title: 'Buyers', subtitle: 'Active Inquiries' };
    if (pathname.startsWith('/app/tools')) return { title: 'Tools', subtitle: 'Calculators & Watermark' };
    if (pathname.startsWith('/app/inquiries')) return { title: 'Inquiries', subtitle: 'Lead Inbox' };
    if (pathname.startsWith('/app/settings')) return { title: 'Settings', subtitle: 'Agency & Profile' };
    if (pathname.startsWith('/app/admin')) return { title: 'Admin Console', subtitle: 'System Control' };
    return { title: 'leadNivash', subtitle: 'Broker OS' };
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 w-full bg-surface/85 backdrop-blur-xl border-b border-border/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left side: Mobile Logo & Page Heading */}
        <div className="flex items-center gap-3">
          <Link to="/app" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-surface border border-border/70 p-1 shadow-xs">
              <img src="/logo-icon.png" alt="leadNivash" className="w-full h-full object-contain" />
            </div>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-base font-black text-ink font-heading leading-tight">{title}</h1>
            {subtitle && (
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider hidden sm:block">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Right side: Quick Actions, Theme Switcher, Notifications, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Paste shortcut pill on desktop */}
          <Link to="/app/paste" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/40 text-brand-700 dark:text-brand-600 text-xs font-bold transition">
            <span>＋ Paste Message</span>
          </Link>

          {/* Theme switcher toggle */}
          <button
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Toggle Theme"
          >
            {mode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications button */}
          <button
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-600" />
          </button>

          {/* User Avatar Menu */}
          <AvatarMenu />
        </div>
      </div>
    </header>
  );
};