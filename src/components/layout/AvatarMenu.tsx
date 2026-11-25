import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '../../features/auth/AuthProvider';
import {
  Settings as SettingsIcon,
  Crown,
  HelpCircle,
  LogOut,
  Inbox,
  Shield,
} from 'lucide-react';
import { startInteractiveTour } from '../../features/onboarding/OnboardingTour';
import { openVideoGuide } from '../../features/onboarding/GuideVideoModal';
import { SpecialOfferModal } from '../../features/pricing/SpecialOfferModal';

export interface AvatarMenuProps {
  inquiryCount?: number;
}

export const AvatarMenu: React.FC<AvatarMenuProps> = ({ inquiryCount = 0 }) => {
  const { user, logout } = useAuth();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

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
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="relative w-8 h-8 rounded-full bg-brand-50 border border-brand-600/20 text-brand-700 font-semibold text-xs flex items-center justify-center hover:border-brand-600/40 transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-1"
            aria-label="User account menu"
          >
            {initials}
            {inquiryCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-danger text-white text-[8px] font-bold flex items-center justify-center">
                {inquiryCount}
              </span>
            )}
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-[210px] bg-white border border-border p-1.5 rounded-[16px] shadow-xl animate-in fade-in zoom-in-95 duration-150"
            sideOffset={8}
            align="end"
          >
            {/* User info strip */}
            <div className="px-3 py-2 border-b border-border mb-1">
              <p className="text-secondary font-medium text-ink truncate capitalize">
                {user?.name || user?.agency?.name || 'Broker'}
              </p>
              <p className="text-meta text-muted truncate">
                {user?.email || user?.phone || 'Verified broker'}
              </p>
              <span className="inline-block mt-1 text-meta font-medium text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded capitalize">
                {user?.plan?.tier || 'Trial'} plan
              </span>
            </div>

            {/* Inquiries link if inquiries exist */}
            {inquiryCount > 0 && (
              <DropdownMenu.Item asChild>
                <Link
                  to="/app/buyers?tab=inquiries"
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium text-ink hover:bg-surface-hover rounded-lg cursor-pointer outline-none transition-colors duration-150"
                >
                  <div className="flex items-center gap-2.5">
                    <Inbox className="w-4 h-4 text-brand-600" />
                    <span>Inquiries</span>
                  </div>
                  <span className="text-meta font-bold text-danger bg-danger-bg px-1.5 py-0.5 rounded-full">
                    {inquiryCount}
                  </span>
                </Link>
              </DropdownMenu.Item>
            )}

            {/* 1. Settings */}
            <DropdownMenu.Item asChild>
              <Link
                to="/app/settings"
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-ink hover:bg-surface-hover rounded-lg cursor-pointer outline-none transition-colors duration-150"
              >
                <SettingsIcon className="w-4 h-4 text-muted" />
                <span>Settings</span>
              </Link>
            </DropdownMenu.Item>

            {/* 2. Plan */}
            <DropdownMenu.Item
              onClick={() => setIsUpgradeOpen(true)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-ink hover:bg-surface-hover rounded-lg cursor-pointer outline-none transition-colors duration-150"
            >
              <Crown className="w-4 h-4 text-brand-600" />
              <span>Plan</span>
            </DropdownMenu.Item>

            {/* 3. Video Guide & Interactive Help */}
            <DropdownMenu.Item
              onClick={() => openVideoGuide()}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-ink hover:bg-surface-hover rounded-lg cursor-pointer outline-none transition-colors duration-150"
            >
              <HelpCircle className="w-4 h-4 text-brand-600" />
              <span>Video Guide</span>
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onClick={() => startInteractiveTour()}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-ink hover:bg-surface-hover rounded-lg cursor-pointer outline-none transition-colors duration-150"
            >
              <HelpCircle className="w-4 h-4 text-muted" />
              <span>Interactive Tour</span>
            </DropdownMenu.Item>

            {/* Admin console link (if admin) */}
            {user?.role === 'admin' && (
              <DropdownMenu.Item asChild>
                <Link
                  to="/app/admin"
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer outline-none transition-colors duration-150"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin console</span>
                </Link>
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Separator className="h-px bg-border my-1" />

            {/* 4. Log out */}
            <DropdownMenu.Item
              onClick={() => logout()}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-danger hover:bg-danger-bg rounded-lg cursor-pointer outline-none transition-colors duration-150"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <SpecialOfferModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />
    </>
  );
};
