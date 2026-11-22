import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AvatarMenu } from './AvatarMenu';
import { NotificationMenu } from './NotificationMenu';
import { Settings, Plus } from 'lucide-react';

export const TopBar: React.FC = () => {
  const location = useLocation();

  const getPageTitle = (pathname: string): { title: string; subtitle?: string } => {
    const cleanPath = pathname.replace(/\/+$/, '') || '/';
    if (cleanPath === '/app' || cleanPath === '') return { title: 'Lead Nivesh', subtitle: 'Broker Operating System' };
    if (cleanPath.startsWith('/app/track-record')) return { title: 'Lead Nivesh', subtitle: 'Pipeline & Deals' };
    if (cleanPath === '/app/properties/new') return { title: 'New Listing', subtitle: 'Add Property' };
    if (cleanPath.startsWith('/app/properties')) return { title: 'Inventory', subtitle: 'Property Listings' };
    if (cleanPath === '/app/paste') return { title: 'Quick Paste', subtitle: 'AI WhatsApp Parser' };
    if (cleanPath === '/app/buyers/new') return { title: 'New Buyer', subtitle: 'Add Requirement' };
    if (cleanPath.startsWith('/app/buyers')) return { title: 'Buyers', subtitle: 'Active Inquiries' };
    if (cleanPath.startsWith('/app/tools')) {
      if (cleanPath.includes('/emi')) return { title: 'EMI Calculator', subtitle: 'Home Loan & Quotation' };
      if (cleanPath.includes('/area')) return { title: 'Area Converter', subtitle: 'Gaj, Marla, Kanal' };
      if (cleanPath.includes('/registry')) return { title: 'Haryana Registry', subtitle: 'Stamp Duty & Fees' };
      if (cleanPath.includes('/commission')) return { title: 'Commission Split', subtitle: 'Brokerage & Payouts' };
      if (cleanPath.includes('/templates')) return { title: 'WhatsApp Templates', subtitle: 'Quick Deal Chips' };
      return { title: 'Tools', subtitle: 'Calculators & Toolkit' };
    }
    if (cleanPath.startsWith('/app/inquiries')) return { title: 'Inquiries', subtitle: 'Lead Inbox' };
    if (cleanPath.startsWith('/app/settings')) return { title: 'Settings', subtitle: 'Agency & Profile' };
    if (cleanPath.startsWith('/app/admin')) return { title: 'Admin Console', subtitle: 'System Control' };
    return { title: 'Lead Nivesh', subtitle: 'Broker OS' };
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 w-full bg-gradient-to-r from-white via-white to-emerald-50/40 backdrop-blur-md border-b border-[#E5E9EE] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Left side: Mobile Logo & Page Heading */}
        <div className="flex items-center gap-3">
          <Link to="/app" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E9EE] p-1 shadow-2xs">
              <img src="/logo-icon.png" alt="LeadNivesh" className="w-full h-full object-contain" />
            </div>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-bold text-ink font-heading leading-tight">{title}</h1>
            {subtitle && (
              <span className="text-[11px] text-muted font-medium hidden sm:block">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Right side: Quick Actions, Theme Switcher, Notifications, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Paste signature button */}
          <Link
            to="/app/paste"
            className="group hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 active:scale-[0.98] text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>Paste Message</span>
            <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs transition-transform group-hover:rotate-90">
              <Plus className="w-3 h-3 stroke-[2.5]" />
            </span>
          </Link>

          {/* Notifications Popover Menu */}
          <NotificationMenu />

          {/* Mobile Settings button */}
          <Link
            to="/app/settings"
            className="md:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>

          {/* User Avatar Menu */}
          <AvatarMenu />
        </div>
      </div>
    </header>
  );
};