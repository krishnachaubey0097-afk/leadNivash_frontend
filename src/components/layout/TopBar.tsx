import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AvatarMenu } from './AvatarMenu';
import { Bell, Settings, Plus } from 'lucide-react';

export const TopBar: React.FC = () => {
  const location = useLocation();

  const getPageTitle = (pathname: string): { title: string; subtitle?: string } => {
    if (pathname === '/app') return { title: 'Today', subtitle: 'Overview & Matches' };
    if (pathname.startsWith('/app/track-record')) return { title: 'Track Record', subtitle: 'Pipeline & Deals' };
    if (pathname === '/app/properties/new') return { title: 'New Listing', subtitle: 'Add Property' };
    if (pathname.startsWith('/app/properties')) return { title: 'Inventory', subtitle: 'Property Listings' };
    if (pathname === '/app/paste') return { title: 'Quick Paste', subtitle: 'AI WhatsApp Parser' };
    if (pathname === '/app/buyers/new') return { title: 'New Buyer', subtitle: 'Add Requirement' };
    if (pathname.startsWith('/app/buyers')) return { title: 'Buyers', subtitle: 'Active Inquiries' };
    if (pathname.startsWith('/app/tools')) {
      if (pathname.includes('/emi')) return { title: 'EMI Calculator', subtitle: 'Home Loan & Quotation' };
      if (pathname.includes('/area')) return { title: 'Area Converter', subtitle: 'Gaj, Marla, Kanal' };
      if (pathname.includes('/registry')) return { title: 'Haryana Registry', subtitle: 'Stamp Duty & Fees' };
      if (pathname.includes('/commission')) return { title: 'Commission Split', subtitle: 'Brokerage & Payouts' };
      if (pathname.includes('/templates')) return { title: 'WhatsApp Templates', subtitle: 'Quick Deal Chips' };
      return { title: 'Tools', subtitle: 'Calculators & Toolkit' };
    }
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
          {/* Quick Paste signature pill button (Reference 2 style) */}
          <Link
            to="/app/paste"
            className="group hidden sm:inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-700/25 hover:shadow-lg hover:shadow-emerald-700/35 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-white/95 animate-pulse" />
            <span>Paste Message</span>
            <span className="w-5 h-5 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold text-xs shadow-2xs group-hover:rotate-90 transition-transform">
              <Plus className="w-3 h-3 stroke-[2.5]" />
            </span>
          </Link>

          {/* Notifications button */}
          <button
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-600" />
          </button>

          {/* Mobile Settings button */}
          <Link
            to="/app/settings"
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* User Avatar Menu */}
          <AvatarMenu />
        </div>
      </div>
    </header>
  );
};