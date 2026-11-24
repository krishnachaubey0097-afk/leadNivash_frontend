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

  const initials = (
    user?.name ||
    user?.agency?.name ||
    user?.email?.split('@')[0] ||
    'S'
  )
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'S';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="relative w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-brand-50 border border-brand-600/20 text-brand-700 font-semibold text-sm flex items-center justify-center hover:border-brand-600/40 transition-colors duration-150 cursor-pointer focus:outline-none"
          aria-label="User account menu"
        >
          {initials}
          {inquiryCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center">
              {inquiryCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[200px] bg-white dark:bg-[var(--surface)] border border-border p-1.5 rounded-card shadow-xl animate-in fade-in zoom-in-95 duration-150"
          sideOffset={8}
          align="end"
        >
          {/* User info strip */}
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-secondary font-medium text-ink truncate capitalize">{user?.name || user?.agency?.name || 'Broker'}</p>
            <p className="text-meta text-muted truncate">{user?.email || user?.phone || 'Verified broker'}</p>
            <span className="inline-block mt-1 text-meta font-medium text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded capitalize">
              {user?.plan?.tier || 'Trial'} plan
            </span>
          </div>

          {/* Inquiries Inbox */}
          <DropdownMenu.Item asChild>
            <Link
              to="/app/inquiries"
              className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-hover rounded-lg cursor-pointer outline-none transition-colors duration-150"
            >
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-brand-600" />
                <span>Inquiries</span>
              </div>
              {inquiryCount > 0 && (
                <span className="text-meta font-bold text-danger bg-danger-bg px-1.5 py-0.5 rounded-full">
                  {inquiryCount}
                </span>
              )}
            </Link>
          </DropdownMenu.Item>

          {/* Settings */}
          <DropdownMenu.Item asChild>
            <Link
              to="/app/settings"
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-hover rounded-lg cursor-pointer outline-none transition-colors duration-150"
            >
              <SettingsIcon className="w-4 h-4 text-muted" />
              <span>Settings</span>
            </Link>
          </DropdownMenu.Item>

          {/* Guided Tour */}
          <DropdownMenu.Item
            onClick={() => startInteractiveTour()}
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50 rounded-lg cursor-pointer outline-none transition-colors duration-150"
          >
            <HelpCircle className="w-4 h-4 text-brand-600" />
            <span>Take guided tour</span>
          </DropdownMenu.Item>

          {/* Admin panel link */}
          {user?.role === 'admin' && (
            <DropdownMenu.Item asChild>
              <Link
                to="/app/admin"
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-warn hover:bg-warn-bg rounded-lg cursor-pointer outline-none transition-colors duration-150"
              >
                <Shield className="w-4 h-4" />
                <span>Admin console</span>
              </Link>
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Separator className="h-px bg-border my-1" />

          {/* Logout */}
          <DropdownMenu.Item
            onClick={() => logout()}
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger-bg rounded-lg cursor-pointer outline-none transition-colors duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
