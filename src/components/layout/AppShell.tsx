import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { Banner } from '../ui/Banner';
import { useOnline } from '../../lib/hooks/useOnline';
import { useAuth } from '../../features/auth/AuthProvider';

export const AppShell: React.FC = () => {
  const isOnline = useOnline();
  const { user, isServerWaking } = useAuth();

  // Calculate days left in trial if applicable
  const trialDaysRemaining = (() => {
    if (user?.plan?.tier === 'trial' && user.plan.trialEndsAt) {
      const diff = new Date(user.plan.trialEndsAt).getTime() - Date.now();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-bg text-text flex">
      {/* Desktop Sidebar (lg:flex) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Alert Banners */}
        {!isOnline && <Banner variant="offline" />}
        {isServerWaking && <Banner variant="server-waking" />}
        {user && !user.phone && (
          <Banner
            variant="warning"
            message="Please complete your profile: A verified mobile number is required to enable masked client sharing and WhatsApp flyers."
          />
        )}
        {trialDaysRemaining !== null && trialDaysRemaining <= 7 && (
          <Banner variant="plan" message={`${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'} remaining in your free trial`} />
        )}

        {/* Top Header */}
        <TopBar />

        {/* Body content */}
        <main className="flex-1 pb-24 lg:pb-8 max-w-5xl mx-auto w-full px-4 pt-4">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (lg:hidden) */}
        <BottomNav />
      </div>
    </div>
  );
};
