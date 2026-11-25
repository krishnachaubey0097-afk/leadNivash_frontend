import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { SEO } from '../SEO';
import { Banner } from '../ui/Banner';
import { TopLoadingBar } from '../ui/LoadingBar';
import { OnboardingTour, startInteractiveTour } from '../../features/onboarding/OnboardingTour';
import { GuideVideoModal } from '../../features/onboarding/GuideVideoModal';
import { SpecialOfferModal } from '../../features/pricing/SpecialOfferModal';
import { useOnline } from '../../lib/hooks/useOnline';
import { useAuth } from '../../features/auth/AuthProvider';

const TRIAL_POPUP_SESSION_KEY = 'leadnivash_trial_offer_shown';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const isOnline = useOnline();
  const { user, isServerWaking } = useAuth();
  const [isTrialOfferOpen, setIsTrialOfferOpen] = useState(false);

  const appRouteTitle = (() => {
    const p = location.pathname;
    if (p === '/app' || p === '/app/') return 'Broker Dashboard';
    if (p.startsWith('/app/track-record')) return 'Track Record';
    if (p.startsWith('/app/properties')) return 'Property Inventory';
    if (p.startsWith('/app/paste')) return 'Quick Chat AI Parser';
    if (p.startsWith('/app/buyers')) return 'Buyers & Matches';
    if (p.startsWith('/app/tools')) return 'Broker Tools';
    if (p.startsWith('/app/settings')) return 'Workspace Settings';
    if (p.startsWith('/app/admin')) return 'Admin Console';
    return 'Broker Workspace';
  })();

  // Calculate days left in trial if applicable
  const trialDaysRemaining = (() => {
    if (user?.plan?.tier === 'trial' && user.plan.trialEndsAt) {
      const diff = new Date(user.plan.trialEndsAt).getTime() - Date.now();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    return null;
  })();

  // Show "Unlock full LeadNivash Pro" popup once per session whenever a trial user lands in the app
  useEffect(() => {
    if (!user || user.plan?.tier !== 'trial') return;
    try {
      if (sessionStorage.getItem(TRIAL_POPUP_SESSION_KEY)) return;
    } catch {
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(TRIAL_POPUP_SESSION_KEY, '1');
      } catch {}
      setIsTrialOfferOpen(true);
    }, 550);

    return () => window.clearTimeout(timer);
  }, [user]);

  return (
    <div className="h-screen w-full overflow-hidden bg-bg text-text flex">
      <SEO
        noindex
        title={appRouteTitle}
        description="LeadNivash broker workspace for property inventory, client matching, and deal closing."
        canonicalPath={location.pathname}
      />
      {/* Global Top Loading Progress Bar */}
      <TopLoadingBar />

      {/* Desktop Sidebar (lg:flex) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[radial-gradient(ellipse_85%_280px_at_50%_0%,rgba(255,255,255,0.96)_0%,rgba(1,142,69,0.055)_52%,transparent_100%)]">
        {/* Global Alert Banners */}
        {!isOnline && <Banner variant="offline" />}
        {isServerWaking && <Banner variant="server-waking" />}
        {user && !user.phone && (
          <Banner
            variant="warning"
            message="Please complete your profile: a verified mobile number is required to enable masked client sharing and WhatsApp flyers."
          />
        )}
        {trialDaysRemaining !== null && trialDaysRemaining <= 7 && (
          <Banner variant="plan" message={`${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'} remaining in your free trial`} />
        )}

        {/* Top Header */}
        <TopBar />

        {/* Body content — max-width 1200px centered, responsive padding */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 lg:pb-8 max-w-[1200px] mx-auto w-full px-4 sm:px-6 pt-4">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (lg:hidden) */}
        <BottomNav />

        {/* First-Time User Onboarding Guided Tour */}
        <OnboardingTour />

        {/* Multi-Language Guide Video Modal (5 Core Indian Languages) */}
        <GuideVideoModal onStartInteractiveTour={startInteractiveTour} />
      </div>

      {/* Automatic Trial User Upgrade Popup ("Unlock full LeadNivash Pro") */}
      <SpecialOfferModal
        isOpen={isTrialOfferOpen}
        onClose={() => setIsTrialOfferOpen(false)}
      />
    </div>
  );
};
