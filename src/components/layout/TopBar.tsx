import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AvatarMenu } from './AvatarMenu';
import { NotificationMenu } from './NotificationMenu';
import { Tooltip } from '../ui/Tooltip';
import { Plus } from 'lucide-react';
import { BRAND_NAME } from '../../config/constants';

export const TopBar: React.FC = () => {
  const location = useLocation();

  const getPageTitle = (pathname: string): { title: string; subtitle?: string } => {
    const cleanPath = pathname.replace(/\/+$/, '') || '/';
    if (cleanPath === '/app' || cleanPath === '') return { title: BRAND_NAME, subtitle: 'Broker overview' };
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
    return { title: BRAND_NAME, subtitle: 'Broker overview' };
  };

  const { title, subtitle } = getPageTitle(location.pathname);
  const isDashboard = location.pathname.replace(/\/+$/, '') === '/app' || location.pathname === '/app/';

  return (
    <header className="sticky top-0 z-30 w-full h-14 sm:h-16 bg-white/85 backdrop-blur-md border-b border-border transition-colors duration-150">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* LEFT = Desktop: page title only (Jakarta 22/700 navy) + optional one-line subtitle (13 ink-500)
                 Mobile: brand logo + title */}
        <div className="min-w-0 flex items-center">
          {/* Desktop Left: Page Title & Subtitle */}
          <div className="hidden lg:flex flex-col justify-center">
            <h1 className="font-jakarta font-bold text-[22px] text-ink-900 leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[13px] text-ink-700 font-normal truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {/* Mobile Left: Brand Logo & Title */}
          <div className="flex lg:hidden items-center gap-2.5 min-w-0">
            <Link to="/app" className="flex items-center gap-2 shrink-0 group" aria-label={`${BRAND_NAME} Home`}>
              <div className="w-8 h-8 rounded-lg bg-surface border border-border p-1 flex items-center justify-center">
                <img src="/logo-icon.png" alt={BRAND_NAME} className="w-full h-full object-contain" />
              </div>
              <span className="text-base font-bold text-ink-900 leading-none">
                {BRAND_NAME}
              </span>
            </Link>

            {!isDashboard && (
              <div className="flex items-center gap-2 pl-2.5 border-l border-border text-sm font-medium text-muted truncate">
                <span className="truncate">{title}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT = Global Shortcut icon button (40px) + Bell + Avatar (32 circle) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Desktop Single 40px icon button shortcut with tooltip (replaces floating pill) */}
          <Tooltip content="Paste a message">
            <Link
              to="/app/paste"
              className="w-10 h-10 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-hover active:scale-95 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-600"
              aria-label="Paste a message"
            >
              <Plus className="w-4 h-4 text-brand-600" />
            </Link>
          </Tooltip>

          {/* Notifications Bell with Badge Count */}
          <NotificationMenu />

          {/* User Avatar Menu (32 circle) */}
          <AvatarMenu />
        </div>
      </div>
    </header>
  );
};
