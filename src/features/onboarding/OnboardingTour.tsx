import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Sparkles,
  Share2,
  Wrench,
  Settings,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import clsx from 'clsx';

export interface TourStep {
  id: string;
  stepNumber: number;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  tip?: string;
  route: string;
  actionLabel: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    stepNumber: 1,
    title: 'Dashboard Overview',
    badge: 'Command Center',
    icon: LayoutDashboard,
    description:
      'Your real-time command center. Track your available property listings, active buyer leads, instant match scores, and projected commission pipeline in one glance.',
    tip: 'Metrics update dynamically from your database with zero mock data.',
    route: '/app',
    actionLabel: 'View Dashboard',
  },
  {
    id: 'properties',
    stepNumber: 2,
    title: 'Property Inventory',
    badge: 'Listings & Flyers',
    icon: Building2,
    description:
      'Add builder floors, residential plots, and commercial units. Generate public WhatsApp flyers with one tap, inspect details, and manage listings with instant cross-device sync.',
    tip: 'Click "+ Add Property" to add your first listing in under 60 seconds.',
    route: '/app/properties',
    actionLabel: 'Open Inventory',
  },
  {
    id: 'buyers',
    stepNumber: 3,
    title: 'Active Buyers Vault',
    badge: 'Leads & Budgets',
    icon: Users,
    description:
      'Store high-intent buyer leads with target sectors, maximum budget in Lakhs/Crores, and property types. Whenever a matching property is added, pairs are calculated automatically.',
    tip: 'Supports quick calls, WhatsApp messaging, and duplicate phone checks.',
    route: '/app/buyers',
    actionLabel: 'Open Buyers',
  },
  {
    id: 'quick-chat',
    stepNumber: 4,
    title: 'Quick Chat AI',
    badge: 'Main Feature',
    icon: Sparkles,
    description:
      'Our primary superpower: speak naturally in Hindi or English using speech-to-text, or paste forwarded WhatsApp client messages. LeadNivash extracts filters and finds matches instantly.',
    tip: 'Try voice dictation directly from the bottom navigation on mobile.',
    route: '/app/paste',
    actionLabel: 'Try Quick Chat',
  },
  {
    id: 'matching',
    stepNumber: 5,
    title: 'Client-Property Matching',
    badge: 'Exact vs Close',
    icon: Share2,
    description:
      'Transparent scoring breaks results into Exact Matches (100% criteria met) and Close Matches (flexible budgets or adjacent sectors), complete with 1-click WhatsApp quote sharing.',
    tip: 'Includes direct pre-formatted WhatsApp text with price and location.',
    route: '/app/paste',
    actionLabel: 'Explore Matching',
  },
  {
    id: 'tools',
    stepNumber: 6,
    title: 'Four Essential Tools',
    badge: 'Calculators',
    icon: Wrench,
    description:
      'Dedicated calculators built for Haryana & NCR brokers: (1) Land Area Converter (Gaj, Marla, Kanal, Acre), (2) Tehsil Stamp Duty & Registry, (3) Home Loan EMI Calculator with amortization, and (4) Brokerage Splitter.',
    tip: 'Each tool works seamlessly on mobile, tablet, and desktop.',
    route: '/app/tools',
    actionLabel: 'Open Tools',
  },
  {
    id: 'settings',
    stepNumber: 7,
    title: 'Settings & Cloud Sync',
    badge: 'Profile & Vault',
    icon: Settings,
    description:
      'Customize your Agency firm name, RERA registration, and phone number. Your changes synchronize securely to MongoDB Atlas across all your logged-in phones and computers.',
    tip: 'You can restart this tour anytime from Settings or your User Menu.',
    route: '/app/settings',
    actionLabel: 'Finish Tour',
  },
];

const ONBOARDING_STORAGE_KEY = 'leadnivash_onboarding_completed_v1';

export const startInteractiveTour = () => {
  window.dispatchEvent(new CustomEvent('leadnivash_start_tour'));
};

export const OnboardingTour: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Auto-launch for first-time users after short mount delay
  useEffect(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!hasCompleted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for manual tour trigger from Settings or TopBar
  useEffect(() => {
    const handleStartTour = () => {
      setCurrentStepIndex(0);
      setIsOpen(true);
    };

    window.addEventListener('leadnivash_start_tour', handleStartTour);
    return () => window.removeEventListener('leadnivash_start_tour', handleStartTour);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const handleDismiss = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const step = TOUR_STEPS[currentStepIndex];
  const StepIcon = step.icon;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="LeadNivash Guided Tour"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left">
        {/* Top Gradient Header Strip */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 p-5 sm:p-6 text-white relative">
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Skip Tour"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
              <StepIcon className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                  {step.badge}
                </span>
                <span className="text-white/80 text-xs font-bold">
                  Step {step.stepNumber} of {TOUR_STEPS.length}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-heading mt-1 text-white">
                {step.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {step.description}
          </p>

          {step.tip && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{step.tip}</span>
            </div>
          )}

          {/* Quick Navigate shortcut if user is not on this page */}
          {location.pathname !== step.route && (
            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-muted">Want to see this page now?</span>
              <button
                type="button"
                onClick={() => {
                  navigate(step.route);
                }}
                className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <span>Go to {step.actionLabel}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Step Progress Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={clsx(
                  'h-1.5 rounded-full transition-all cursor-pointer',
                  idx === currentStepIndex
                    ? 'w-6 bg-emerald-600'
                    : 'w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                )}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Controls: Skip, Back, Next / Finish */}
          <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs font-bold text-muted hover:text-ink px-2 py-2 cursor-pointer transition"
            >
              Skip Tour
            </button>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  pill
                  onClick={handleBack}
                  className="font-bold text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back</span>
                </Button>
              )}

              <Button
                size="sm"
                pill
                onClick={handleNext}
                className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs px-4"
              >
                {isLastStep ? (
                  <span>Finish Tour ✓</span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
