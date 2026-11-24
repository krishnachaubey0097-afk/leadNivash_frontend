import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AvatarMenu } from './AvatarMenu';
import { NotificationMenu } from './NotificationMenu';
import { Settings, Plus } from 'lucide-react';

export const TopBar: React.FC = () => {
  const location = useLocation();

  const getPageTitle = (pathname: string): { title: string; subtitle?: string } => {
    const cleanPath = pathname.replace(/\/+$/, '') || '/';
    if (cleanPath === '/app' || cleanPath === '') return { title: 'Dashboard', subtitle: 'Broker overview' };
    if (cleanPath.startsWith('/app/track-record')) return { title: 'Track Record', subtitle: 'Pipeline & deals' };
    if (cleanPath === '/app/properties/new') return { title: 'New Listing', subtitle: 'Add property' };
    if (cleanPath.startsWith('/app/properties')) return { title: 'Properties', subtitle: 'Property listings' };
    if (cleanPath === '/app/paste') return { title: 'Quick Chat', subtitle: 'AI WhatsApp parser' };
    if (cleanPath === '/app/buyers/new') return { title: 'New Buyer', subtitle: 'Add requirement' };
    if (cleanPath.startsWith('/app/buyers')) return { title: 'Buyers', subtitle: 'Active inquiries' };
    if (cleanPath.startsWith('/app/tools')) {
      if (cleanPath.includes('/emi')) return { title: 'EMI Calculator', subtitle: 'Home loan & quotation' };
      if (cleanPath.includes('/area')) return { title: 'Area Converter', subtitle: 'Gaj, Marla, Kanal' };
      if (cleanPath.includes('/registry')) return { title: 'Haryana Registry', subtitle: 'Stamp duty & fees' };
      if (cleanPath.includes('/commission')) return { title: 'Commission Split', subtitle: 'Brokerage & payouts' };
      if (cleanPath.includes('/templates')) return { title: 'WhatsApp Templates', subtitle: 'Quick deal chips' };
      return { title: 'Tools', subtitle: 'Calculators & toolkit' };
    }
    if (cleanPath.startsWith('/app/inquiries')) return { title: 'Inquiries', subtitle: 'Lead inbox' };
    if (cleanPath.startsWith('/app/settings')) return { title: 'Settings', subtitle: 'Agency & profile' };
    if (cleanPath.startsWith('/app/admin')) return { title: 'Admin Console', subtitle: 'System control' };
    return { title: 'Dashboard', subtitle: 'Broker overview' };
  };

  const { title } = getPageTitle(location.pathname);
  const isDashboard = location.pathname.replace(/\/+$/, '') === '/app' || location.pathname === '/app/';

  return (
    <header className="sticky top-0 z-30 w-full bg-surface border-b border-border transition-colors duration-150">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left side: Brand Logo & leadNivash Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Link to="/app" className="flex items-center gap-2 shrink-0 group" aria-label="leadNivash Home">
            <div className="w-8 h-8 rounded-lg bg-surface border border-border p-1 flex items-center justify-center">
              <img src="/logo-icon.png" alt="leadNivash" className="w-full h-full object-contain" />
            </div>
            <span className="text-base font-bold text-ink leading-none">
              lead<span className="text-brand-600">Nivash</span>
            </span>
          </Link>

          {!isDashboard && (
            <div className="hidden sm:flex items-center gap-2 pl-2.5 border-l border-border text-sm font-medium text-muted">
              <span>{title}</span>
            </div>
          )}
        </div>

        {/* Right side: Quick Action, Notifications, Settings, Avatar */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Quick Paste button on desktop */}
          <Link
            to="/app/paste"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-colors duration-150"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Paste Message</span>
          </Link>

          {/* Notifications */}
          <NotificationMenu />

          {/* Mobile Settings button */}
          <Link
            to="/app/settings"
            className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-hover transition-colors duration-150"
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
