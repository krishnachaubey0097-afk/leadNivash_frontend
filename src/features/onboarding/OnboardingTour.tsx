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
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  MousePointerClick,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../auth/AuthProvider';
import clsx from 'clsx';

export interface TourButtonDetail {
  buttonName: string;
  whereIsIt: string;
  whatItDoes: string;
  whatHappensWhenClicked: string;
}

export interface TourStep {
  id: string;
  stepNumber: number;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  sectionPurpose: string;
  keyButtons: TourButtonDetail[];
  whatHappensSummary: string;
  proTip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    stepNumber: 1,
    title: 'Dashboard Overview & Command Center',
    badge: 'Command Center',
    icon: LayoutDashboard,
    route: '/app',
    sectionPurpose:
      'Your central broker cockpit. Get an instant real-time snapshot of available property inventory, active buyer inquiries, today’s instant matches, and projected commission pipeline.',
    keyButtons: [
      {
        buttonName: '+ Add Property',
        whereIsIt: 'Top welcome banner or empty inventory prompt',
        whatItDoes: 'Opens the listing creator to add residential plots, builder floors, or shops.',
        whatHappensWhenClicked:
          'Takes you to the property creation wizard where you enter locality, price, and specs.',
      },
      {
        buttonName: 'Quick Paste Deal',
        whereIsIt: 'Top right signature green pill or dashboard quick action',
        whatItDoes: 'Launches AI text extractor for forwarded WhatsApp dealer messages.',
        whatHappensWhenClicked:
          'Opens Quick Chat where you can paste raw messages or speak via voice dictation.',
      },
      {
        buttonName: 'Today / Track Record Toggle',
        whereIsIt: 'Top right segmented pill bar',
        whatItDoes: 'Toggles between today’s active pipeline and historical deals.',
        whatHappensWhenClicked:
          'Switches the view to show won deals, stage milestones, and brokerage analytics.',
      },
    ],
    whatHappensSummary:
      'Every listing or buyer lead you add updates this dashboard dynamically from MongoDB with zero mock data. Tapping any match card lets you preview flyer media or forward it directly to buyers.',
    proTip:
      'Check the "Instant Matches Waiting" card every morning to see which newly added properties match your active buyers.',
  },
  {
    id: 'properties',
    stepNumber: 2,
    title: 'Property Inventory & Digital Flyers',
    badge: 'Inventory & Marketing',
    icon: Building2,
    route: '/app/properties',
    sectionPurpose:
      'Your organized property catalog for residential plots, builder floors, kothis, and commercial units across Panipat, Gurgaon, and NCR sectors.',
    keyButtons: [
      {
        buttonName: '+ Add Property',
        whereIsIt: 'Top right button in the Inventory header',
        whatItDoes: 'Opens the comprehensive listing form with photo upload and video links.',
        whatHappensWhenClicked:
          'Saves the property to your encrypted vault and instantly evaluates matching buyers.',
      },
      {
        buttonName: 'Flyer & Media',
        whereIsIt: 'Bottom action strip on each property card',
        whatItDoes: 'Generates an unbranded digital marketing flyer link for client viewing.',
        whatHappensWhenClicked:
          'Creates a public link (/flyer/:id) with photos, map landmarks, and asking price, keeping direct owner contacts 100% private.',
      },
      {
        buttonName: '1-Tap WhatsApp Share',
        whereIsIt: 'Green paper-plane icon next to Flyer & Media',
        whatItDoes: 'Composes an instant WhatsApp message formatted with price, size, and flyer link.',
        whatHappensWhenClicked:
          'Opens WhatsApp on mobile or desktop with a pre-written pitch ready to send to clients.',
      },
      {
        buttonName: 'Status Filter Pills',
        whereIsIt: 'Top horizontal strip (All, Available, On Hold, Sold)',
        whatItDoes: 'Filters your inventory by sales lifecycle status.',
        whatHappensWhenClicked:
          'Instantly filters the list. Marking a property "Sold" removes it from active buyer matching.',
      },
    ],
    whatHappensSummary:
      'Clicking "Details" opens the complete listing sheet with owner phone and private dealer notes. Clicking the Trash icon moves listings to the 30-day trash recovery vault.',
    proTip:
      'Share the public flyer link on WhatsApp groups — any buyer who submits an inquiry on your flyer arrives directly in your Inquiries Inbox!',
  },
  {
    id: 'buyers',
    stepNumber: 3,
    title: 'Active Buyers Vault & Inquiries',
    badge: 'Client CRM',
    icon: Users,
    route: '/app/buyers',
    sectionPurpose:
      'Manage serious buyer requirements, target sectors, budget limits, and purchase urgency to match with new inventory.',
    keyButtons: [
      {
        buttonName: '+ Add Buyer',
        whereIsIt: 'Top right button in the Buyers header',
        whatItDoes: 'Registers a client requirement with budget in Lakhs/Crores.',
        whatHappensWhenClicked:
          'Saves client criteria and automatically scans your listings for matching properties.',
      },
      {
        buttonName: 'Urgency Filter Pills',
        whereIsIt: 'Horizontal strip: All, Immediate Closing, Within Month, Casual Exploring',
        whatItDoes: 'Prioritizes buyers ready with token advance vs long-term investors.',
        whatHappensWhenClicked:
          'Filters buyer cards by deal readiness so you focus on high-probability deals first.',
      },
      {
        buttonName: 'Call & WhatsApp Icons',
        whereIsIt: 'Right side of each buyer card',
        whatItDoes: 'Connects directly with the client using their registered phone number.',
        whatHappensWhenClicked:
          'Opens phone dialer or WhatsApp chat with client details pre-loaded.',
      },
    ],
    whatHappensSummary:
      'Duplicate phone checking prevents creating redundant client entries. When a buyer requirement matches a property in your inventory, a green match badge appears with match percentage.',
    proTip:
      'Always set accurate budget maximums — the AI matcher uses a 10% tolerance window to surface high-fit options.',
  },
  {
    id: 'quick-chat',
    stepNumber: 4,
    title: 'Quick Chat AI — Voice & Text Parser',
    badge: 'Main Feature',
    icon: Sparkles,
    route: '/app/paste',
    sectionPurpose:
      'LeadNivash’s core productivity tool: speak in Hindi/English or paste forwarded WhatsApp dealer messages to extract properties and client needs in seconds without manual typing.',
    keyButtons: [
      {
        buttonName: 'Voice Dictation Mic',
        whereIsIt: 'Microphone button inside the text input area',
        whatItDoes: 'Transcribes spoken speech into text in real time with zero duplicate words.',
        whatHappensWhenClicked:
          'Activates your microphone. Speak client requirements naturally in Hindi or English.',
      },
      {
        buttonName: 'Language Toggle (हिंदी / English)',
        whereIsIt: 'Top right above the message box',
        whatItDoes: 'Switches voice dictation recognition language.',
        whatHappensWhenClicked:
          'Optimizes voice recognition for local Hindi terminology (gaj, marla, kothi) or English.',
      },
      {
        buttonName: 'Analyse & Match Message',
        whereIsIt: 'Primary green action button below the text area',
        whatItDoes: 'Runs NLP parser to extract locality, property type, price, and contact info.',
        whatHappensWhenClicked:
          'Identifies whether the message is a Property Listing or Buyer Lead, and advances to Step 2: Extracted Details.',
      },
    ],
    whatHappensSummary:
      'After extracting the details, you can review and edit any field before clicking "Save to Inventory & Find Matches", which commits the record to the database.',
    proTip:
      'You can paste entire WhatsApp dealer broadcast messages — the parser automatically cleans up emojis and disclaimers.',
  },
  {
    id: 'matching',
    stepNumber: 5,
    title: 'Instant Property-Client Matching',
    badge: 'Smart Matching',
    icon: Share2,
    route: '/app/paste',
    sectionPurpose:
      'Transparent AI scoring engine that compares property location, unit type, and asking price against active buyer budgets to generate actionable deals.',
    keyButtons: [
      {
        buttonName: 'Exact Matches (80%+)',
        whereIsIt: 'Top matching section with green badge',
        whatItDoes: 'Shows listings that satisfy 100% of the client’s core criteria.',
        whatHappensWhenClicked:
          'Reveals transparent score breakdown (e.g. Location match +25%, Type match +15%, Budget match +10%).',
      },
      {
        buttonName: 'Share on WhatsApp',
        whereIsIt: 'Green button on each matched lead or property card',
        whatItDoes: 'Generates a polite, personalized Hindi/English pitch for WhatsApp.',
        whatHappensWhenClicked:
          'Copies the formatted message with verified flyer link and opens WhatsApp directly.',
      },
      {
        buttonName: '+ Paste Another Message',
        whereIsIt: 'Header button on Step 3 match results',
        whatItDoes: 'Resets the workflow so you can quickly parse another message.',
        whatHappensWhenClicked:
          'Returns to Step 1 with a clean text box ready for your next client or listing.',
      },
    ],
    whatHappensSummary:
      'If you have not added any properties or buyers yet, LeadNivash guides you with clean "+ Add Property" and "+ Add Buyer" buttons rather than displaying misleading mock data.',
    proTip:
      'Always tap "Copy Share Message" to verify the pitch before sending it to clients.',
  },
  {
    id: 'tools',
    stepNumber: 6,
    title: 'Four Essential Haryana Real Estate Tools',
    badge: 'Calculators & Math',
    icon: Wrench,
    route: '/app/tools',
    sectionPurpose:
      'On-the-go calculators built specifically for Haryana & NCR brokers to answer client pricing questions during site visits and negotiations.',
    keyButtons: [
      {
        buttonName: 'Haryana Area Converter',
        whereIsIt: 'First tool card / tab in Tools',
        whatItDoes: 'Instant conversion between Gaj, Marla (25 vs 30.25), Sq Ft, Kanal, and Acre.',
        whatHappensWhenClicked:
          'Displays simultaneous conversions with a 1-tap WhatsApp quote generator.',
      },
      {
        buttonName: 'Tehsil Registry & Stamp Duty',
        whereIsIt: 'Second tool card / tab in Tools',
        whatItDoes: 'Calculates official Haryana stamp fees, municipal tax, and female concessions (5% vs 7%).',
        whatHappensWhenClicked:
          'Calculates exact Tehsil expense breakdown and creates a client invoice note.',
      },
      {
        buttonName: 'Home Loan EMI Calculator',
        whereIsIt: 'Third tool card / tab in Tools',
        whatItDoes: 'Calculates monthly EMI, total interest, and bank processing fees.',
        whatHappensWhenClicked:
          'Generates a clear loan quotation that can be copied directly into WhatsApp.',
      },
      {
        buttonName: 'Commission Splitter',
        whereIsIt: 'Fourth tool card / tab in Tools',
        whatItDoes: 'Calculates 1%–2% broker commission and co-broker partner splits.',
        whatHappensWhenClicked:
          'Provides clear transparent figures for closing deals with partner agencies.',
      },
    ],
    whatHappensSummary:
      'Includes ready-to-use WhatsApp action templates for Site Visit Confirmations, Token Advance Acknowledgments, and Tehsil Registry Document Checklists.',
    proTip:
      'Switch between 25 Gaj and 30.25 Gaj standard in Settings or in the Area Converter to match local Panipat vs wider Haryana standards.',
  },
  {
    id: 'settings',
    stepNumber: 7,
    title: 'Agency Profile, RERA & Cloud Sync',
    badge: 'Profile & Settings',
    icon: Settings,
    route: '/app/settings',
    sectionPurpose:
      'Personalize your firm identity, verify RERA credentials, configure regional unit standards, and backup your account data.',
    keyButtons: [
      {
        buttonName: 'Agency / Firm Name & RERA No.',
        whereIsIt: 'Agency Identity form fields in Settings',
        whatItDoes: 'Customizes your brokerage branding across all public flyers and messages.',
        whatHappensWhenClicked:
          'Updates your agency name and RERA registration badge on public marketing pages.',
      },
      {
        buttonName: 'Save Settings',
        whereIsIt: 'Green pill button at the bottom of the profile form',
        whatItDoes: 'Synchronizes your agency details to the backend database.',
        whatHappensWhenClicked:
          'Executes PATCH /api/v1/users/me and refreshes user credentials across all logged-in devices.',
      },
      {
        buttonName: 'Export Broker Data (JSON)',
        whereIsIt: 'Data Ownership & Privacy Rights card',
        whatItDoes: 'Downloads 100% of your listings, buyers, and deals.',
        whatHappensWhenClicked:
          'Generates a secure timestamped JSON file containing your complete business database.',
      },
      {
        buttonName: 'Take Interactive Product Tour',
        whereIsIt: 'Help & Product Tour card',
        whatItDoes: 'Relaunches this complete 8-step guided walkthrough anytime.',
        whatHappensWhenClicked:
          'Restarts the tour from Step 1 with live route navigation.',
      },
    ],
    whatHappensSummary:
      'Your login phone number and email are securely bound to your session tokens. 30-day session cookies keep you logged in seamlessly across all your phones and computers.',
    proTip:
      'Fill in your RERA Registration number to show a verified trust badge to prospective clients on all shared flyer links.',
  },
  {
    id: 'navigation',
    stepNumber: 8,
    title: 'Navigation, Search & Inquiries Inbox',
    badge: 'Quick Navigation',
    icon: Compass,
    route: '/app',
    sectionPurpose:
      'Master the interface to switch between inventory, client leads, calculators, and public flyer inquiries effortlessly.',
    keyButtons: [
      {
        buttonName: 'Mobile Bottom Navigation Bar',
        whereIsIt: 'Persistent bar at the bottom of mobile screens',
        whatItDoes: '1-tap switching between Dashboard, Properties, Buyers, Quick Chat, and Tools.',
        whatHappensWhenClicked:
          'Instantly navigates without full page reloads, keeping your work state intact.',
      },
      {
        buttonName: 'Public Flyer Inquiries Inbox',
        whereIsIt: 'Accessible from User Avatar Menu or Settings',
        whatItDoes: 'Captures inquiries submitted by buyers who view your shared flyers.',
        whatHappensWhenClicked:
          'Opens your incoming lead inbox with client name, phone number, and requested property.',
      },
      {
        buttonName: 'Top Avatar Account Menu',
        whereIsIt: 'Top right circular badge showing your initials',
        whatItDoes: 'Quick dropdown for Profile, Inquiries, Guided Tour, and Sign Out.',
        whatHappensWhenClicked:
          'Opens account menu where you can restart this tour anytime or manage settings.',
      },
    ],
    whatHappensSummary:
      'Congratulations! You are now fully equipped to use LeadNivash to manage listings, match buyers, generate flyers, and close real estate deals faster.',
    proTip:
      'Bookmark leadnivash.com on your phone home screen to use it like a native mobile app!',
  },
];

export const startInteractiveTour = () => {
  window.dispatchEvent(new CustomEvent('leadnivash_start_tour'));
};

export const OnboardingTour: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Per-user first-time detection key
  const storageKey = user?._id
    ? `leadnivash_tour_seen_${user._id}`
    : 'leadnivash_tour_seen_v1';

  // Auto-launch for first-time logged in users
  useEffect(() => {
    if (!user) return;
    const hasSeenTour = localStorage.getItem(storageKey);
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [user, storageKey]);

  // Listen for manual tour trigger from Settings, AvatarMenu, or Dashboard
  useEffect(() => {
    const handleStartTour = () => {
      setCurrentStepIndex(0);
      setIsOpen(true);
      navigate(TOUR_STEPS[0].route);
    };

    window.addEventListener('leadnivash_start_tour', handleStartTour);
    return () => window.removeEventListener('leadnivash_start_tour', handleStartTour);
  }, [navigate]);

  // Automatically navigate in the background as the tour step changes
  useEffect(() => {
    if (!isOpen) return;
    const targetRoute = TOUR_STEPS[currentStepIndex]?.route;
    if (targetRoute && location.pathname !== targetRoute) {
      navigate(targetRoute);
    }
  }, [isOpen, currentStepIndex, location.pathname, navigate]);

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
    localStorage.setItem(storageKey, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      navigate(TOUR_STEPS[nextIndex].route);
    } else {
      handleDismiss();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      navigate(TOUR_STEPS[prevIndex].route);
    }
  };

  const step = TOUR_STEPS[currentStepIndex];
  const StepIcon = step.icon;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const progressPercent = Math.round(((currentStepIndex + 1) / TOUR_STEPS.length) * 100);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="LeadNivash Guided Product Tour"
    >
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/35 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left">
        {/* Top Gradient Header Strip */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 p-4 sm:p-5 text-white relative shrink-0">
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Skip Tour"
            title="Skip Tour"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 pr-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
              <StepIcon className="w-6 h-6 stroke-[2.3]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                  {step.badge}
                </span>
                <span className="text-white/85 text-xs font-bold">
                  Step {step.stepNumber} of {TOUR_STEPS.length} ({progressPercent}%)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-heading mt-0.5 text-white truncate">
                {step.title}
              </h2>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full bg-white/20 h-1 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Scrollable Card Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* 1. Section Purpose */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Section Purpose</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {step.sectionPurpose}
            </p>
          </div>

          {/* 2. Key Buttons: Where to Click & What They Do */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-ink font-bold text-xs uppercase tracking-wider">
              <MousePointerClick className="w-3.5 h-3.5 text-emerald-600" />
              <span>Where to Click & What Buttons Do:</span>
            </div>

            <div className="space-y-2">
              {step.keyButtons.map((btn, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-border/80 space-y-1.5 transition hover:border-emerald-500/30"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-black text-ink text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      <span className="bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold">
                        {btn.buttonName}
                      </span>
                    </span>
                    <span className="text-[10px] text-muted font-medium italic">
                      📍 {btn.whereIsIt}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    <strong className="text-ink">Purpose:</strong> {btn.whatItDoes}
                  </p>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/20 text-[11px] text-emerald-900 dark:text-emerald-300 flex items-start gap-1.5 leading-snug">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>When clicked:</strong> {btn.whatHappensWhenClicked}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. What Happens Summary */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-emerald-900 dark:text-emerald-300 mb-0.5">
                How this accelerates your deals:
              </strong>
              <span>{step.whatHappensSummary}</span>
            </div>
          </div>

          {/* 4. Pro Tip */}
          {step.proTip && (
            <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-500/20 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2 leading-relaxed">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-900 dark:text-amber-300">Broker Pro Tip: </strong>
                <span>{step.proTip}</span>
              </div>
            </div>
          )}

          {/* Live background indication */}
          <div className="pt-1 flex items-center justify-between text-[11px] text-muted border-t border-border/60">
            <span>Viewing active screen:</span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
              {step.route}
            </span>
          </div>
        </div>

        {/* Fixed Footer Controls */}
        <div className="p-4 sm:p-5 bg-surface border-t border-border shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Step Progress Dots */}
          <div className="flex items-center gap-1.5 order-2 sm:order-1">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setCurrentStepIndex(idx);
                  navigate(s.route);
                }}
                className={clsx(
                  'h-2 rounded-full transition-all cursor-pointer',
                  idx === currentStepIndex
                    ? 'w-6 bg-emerald-600'
                    : 'w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                )}
                aria-label={`Go to step ${idx + 1}`}
                title={`Step ${idx + 1}: ${s.title}`}
              />
            ))}
          </div>

          {/* Action Buttons: Skip, Back, Next / Finish */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2 order-1 sm:order-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs font-bold text-muted hover:text-ink px-3 py-2 cursor-pointer transition"
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
                  className="font-bold text-xs min-h-[38px] px-3.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back</span>
                </Button>
              )}

              <Button
                size="sm"
                pill
                onClick={handleNext}
                className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs min-h-[38px] px-5"
              >
                {isLastStep ? (
                  <span>Finish Tour ✓</span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span>Next Step</span>
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
