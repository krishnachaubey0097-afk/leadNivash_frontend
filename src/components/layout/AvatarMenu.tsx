import React from 'react';
import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '../../features/auth/AuthProvider';
import {
  Inbox,
  Settings as SettingsIcon,
  Shield,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import { startInteractiveTour } from '../../features/onboarding/OnboardingTour';

export interface AvatarMenuProps {
  inquiryCount?: number;
}

export const AvatarMenu: React.FC<AvatarMenuProps> = ({ inquiryCount = 0 }) => {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'BR';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="relative w-9 h-9 rounded-full bg-brand-50 border border-brand-600/30 text-brand-700 font-bold text-xs flex items-center justify-center hover:ring-2 hover:ring-brand-600 transition cursor-pointer focus:outline-none"
          aria-label="User Account Menu"
        >
          {initials}
          {inquiryCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-black flex items-center justify-center animate-pulse">
              {inquiryCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[200px] bg-surface border border-border p-1.5 rounded-card shadow-xl animate-in fade-in zoom-in-95"
          sideOffset={8}
          align="end"
        >
          {/* User info strip */}
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-xs font-bold text-ink truncate">{user?.name || 'Broker'}</p>
            <p className="text-[10px] text-muted truncate">{user?.email}</p>
            <span className="inline-block mt-1 text-[9px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded capitalize">
              {user?.plan?.tier || 'Trial'} Plan
            </span>
          </div>

          {/* Inquiries Inbox */}
          <DropdownMenu.Item asChild>
            <Link
              to="/app/inquiries"
              className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-text hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer outline-none transition"
            >
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-brand-600" />
                <span>Inquiries</span>
              </div>
              {inquiryCount > 0 && (
                <span className="text-[10px] font-black text-danger bg-red-100 dark:bg-red-950/60 px-1.5 py-0.5 rounded-full">
                  {inquiryCount}
                </span>
              )}
            </Link>
          </DropdownMenu.Item>

          {/* Settings */}
          <DropdownMenu.Item asChild>
            <Link
              to="/app/settings"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer outline-none transition"
            >
              <SettingsIcon className="w-4 h-4 text-muted" />
              <span>Settings</span>
            </Link>
          </DropdownMenu.Item>

          {/* Guided Tour (Stage 5) */}
          <DropdownMenu.Item
            onClick={() => startInteractiveTour()}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg cursor-pointer outline-none transition"
          >
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Take Guided Tour</span>
          </DropdownMenu.Item>

          {/* Admin panel link (Visible only if user.role === 'admin') */}
          {user?.role === 'admin' && (
            <DropdownMenu.Item asChild>
              <Link
                to="/app/admin"
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg cursor-pointer outline-none transition"
              >
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Admin Console</span>
              </Link>
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Separator className="h-px bg-border my-1" />

          {/* Logout */}
          <DropdownMenu.Item
            onClick={() => logout()}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-danger hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer outline-none transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
