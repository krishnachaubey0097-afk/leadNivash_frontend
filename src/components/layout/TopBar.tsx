import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AvatarMenu } from './AvatarMenu';

export const TopBar: React.FC = () => {
  const location = useLocation();

  const getPageTitle = (pathname: string): string => {
    if (pathname === '/app') return 'Today';
    if (pathname.startsWith('/app/track-record')) return 'Track Record';
    if (pathname === '/app/properties/new') return 'Add Property';
    if (pathname.startsWith('/app/properties')) return 'Properties';
    if (pathname === '/app/paste') return 'Quick Paste';
    if (pathname === '/app/buyers/new') return 'Add Buyer';
    if (pathname.startsWith('/app/buyers')) return 'Buyers';
    if (pathname.startsWith('/app/tools')) return 'Tools';
    if (pathname.startsWith('/app/inquiries')) return 'Inquiries';
    if (pathname.startsWith('/app/settings')) return 'Settings';
    if (pathname.startsWith('/app/admin')) return 'Admin Console';
    return 'LeadNivesh';
  };

  const title = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 w-full bg-surface/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Mobile Logo & Page Title */}
        <div className="flex items-center gap-3">
          <Link to="/app" className="flex items-center gap-2 lg:hidden">
            <img src="/logo-icon.png" alt="LeadNivesh" className="w-7 h-7 object-contain" />
          </Link>
          <h1 className="text-sm font-bold text-ink font-heading">{title}</h1>
        </div>

        {/* Right side: Avatar Menu */}
        <div className="flex items-center gap-3">
          <AvatarMenu />
        </div>
      </div>
    </header>
  );
};
