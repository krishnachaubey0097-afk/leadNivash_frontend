import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Play,
  Maximize2,
  Smartphone,
  Monitor,
  Building2,
  Users,
  Search,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Layers,
  Lock,
  Calculator,
  BarChart3,
  Menu,
  X,
  LogIn,
  Phone,
  Mail,
  ArrowUp,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { apiClient } from '../../lib/api/client';
import { useAuth } from '../auth/AuthProvider';
import { PricingSection } from '../pricing/PricingSection';
import { SpecialOfferModal } from '../pricing/SpecialOfferModal';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [isTrialOfferOpen, setIsTrialOfferOpen] = useState(false);
  // Mobile Navigation Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Lock background scroll and listen to Escape key when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  // Hero Section: Animated 5-Step Visual Process Indicator State
  const [activeProcessStep, setActiveProcessStep] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveProcessStep((prev) => (prev + 1) % 5);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const PROCESS_STEPS = [
    { id: 1, label: 'WhatsApp Message', icon: MessageSquare },
    { id: 2, label: 'AI Extraction', icon: Sparkles },
    { id: 3, label: 'Smart Matching', icon: Search },
    { id: 4, label: 'Masked Flyer', icon: Share2 },
    { id: 5, label: 'Deal Tracking', icon: TrendingUp },
  ];

  // Section 2: Demo Video State & Responsive Selection
  const [videoMode, setVideoMode] = useState<'desktop' | 'mobile'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) return 'mobile';
    return 'desktop';
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const isMuted = true;
  const youtubeVideoId = 'dQw4w9WgXcQ';

  // Automatic 5-second start timer for embedded demo video (muted for browser autoplay policies)
  useEffect(() => {
    const autoplayTimer = setTimeout(() => {
      setIsPlaying(true);
    }, 5000);

    return () => clearTimeout(autoplayTimer);
  }, []);

  // Section 3: How It Works Connected Workflow State
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(0);
  const [isWorkflowPaused, setIsWorkflowPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isWorkflowPaused) return;
    const interval = setInterval(() => {
      setActiveWorkflowStep((prev) => (prev + 1) % 5);
    }, 3400);
    return () => clearInterval(interval);
  }, [isWorkflowPaused]);

  // Section 4: Features Interactive Selection State
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);

  // Section 5: Commission Calculator State
  const [dealValueRupees, setDealValueRupees] = useState<number>(7500000); // default ₹75,00,000 (₹75 Lakh)
  const [commissionRate, setCommissionRate] = useState<number>(1.5); // default 1.5%
  const [monthlyDealsCount, setMonthlyDealsCount] = useState<number>(3); // default 3 deals/month

  // Calculator calculations (Strict Accuracy formulas)
  // Commission per deal: Property Deal Value * Commission Percentage / 100
  const commissionPerDeal = Math.round((dealValueRupees * commissionRate) / 100);
  // Estimated Monthly Commission: Commission per Deal * Monthly Deals Closed
  const monthlyCommission = Math.round(commissionPerDeal * monthlyDealsCount);
  // Projected Annual Brokerage: Monthly Commission * 12
  const annualCommission = Math.round(monthlyCommission * 12);

  // Standard Indian Currency Formatter (Intl.NumberFormat with en-IN and INR)
  const formatINR = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Section 7: Free Demo Inquiry Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAgency, setFormAgency] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formActiveProps, setFormActiveProps] = useState('10-50');
  const [formMessage, setFormMessage] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // FAQ Accordion & Category State
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [faqCategory, setFaqCategory] = useState<'all' | 'security' | 'workflow' | 'trial'>('all');

  // Back to Top & Downward Progressive Blur Scroll State
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [nearBottom, setNearBottom] = useState(false);

  // Hero Headline Typewriter Animation ("Turn Messages into / Property Deals" — no period)
  const HERO_LINE_1 = 'Turn Messages into';
  const HERO_LINE_2 = 'Property Deals';
  const HERO_TOTAL_CHARS = HERO_LINE_1.length + HERO_LINE_2.length;
  const [typedChars, setTypedChars] = useState<number>(0);
  const [isDeletingHeadline, setIsDeletingHeadline] = useState(false);

  useEffect(() => {
    let delay = isDeletingHeadline ? 28 : 62;
    if (!isDeletingHeadline && typedChars === 0) {
      delay = 350;
    } else if (!isDeletingHeadline && typedChars >= HERO_TOTAL_CHARS) {
      delay = 2800;
    } else if (isDeletingHeadline && typedChars === 0) {
      delay = 350;
    }

    const timer = window.setTimeout(() => {
      if (!isDeletingHeadline) {
        if (typedChars >= HERO_TOTAL_CHARS) {
          setIsDeletingHeadline(true);
        } else {
          setTypedChars((prev) => Math.min(HERO_TOTAL_CHARS, prev + 1));
        }
      } else {
        if (typedChars <= 0) {
          setIsDeletingHeadline(false);
        } else {
          setTypedChars((prev) => Math.max(0, prev - 1));
        }
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [typedChars, isDeletingHeadline, HERO_TOTAL_CHARS]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
      const docHeight = document.documentElement.scrollHeight;
      setNearBottom(window.innerHeight + window.scrollY >= docHeight - 140);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll-reveal observer (triggers once per section, respects reduced motion)
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.reveal-section'));
    if (!targets.length) return;
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      targets.forEach((el) => el.setAttribute('data-visible', 'true'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', 'true');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Show "Unlock full LeadNivash Pro" popup once per session when a trial user visits the site
  useEffect(() => {
    if (!isAuthenticated || user?.plan?.tier !== 'trial') return;
    try {
      if (sessionStorage.getItem('leadnivash_trial_offer_shown')) return;
    } catch {
      return;
    }
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem('leadnivash_trial_offer_shown', '1');
      } catch { }
      setIsTrialOfferOpen(true);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated, user]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (!formName.trim() || !formPhone.trim() || !formAgency.trim() || !formCity.trim()) {
      setFormError('Please fill in all required fields (Name, WhatsApp, Agency, and City).');
      return;
    }

    setFormSubmitting(true);
    try {
      await apiClient.post('/public/contact', {
        name: formName.trim(),
        phone: formPhone.trim(),
        agencyName: formAgency.trim(),
        city: formCity.trim(),
        message: `[Demo Request] Active Properties: ${formActiveProps}. Query: ${formMessage.trim() || 'Interested in 14-day free trial & live product demo.'}`,
      });
      setFormSuccess(true);
    } catch (err: any) {
      console.warn('Backend inquiry submission error:', err);
      const errMsg =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Could not submit demo request. Please verify your phone number and try again.';
      setFormError(errMsg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const scrollToInquiry = () => {
    const el = document.getElementById('demo-inquiry-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-cream text-ink-700 flex flex-col selection:bg-lime-soft selection:text-ink-900">
      {/* ========================================================= */}
      {/* FLOATING CAPSULE NAVIGATION (Upper Header Bar)            */}
      {/* ========================================================= */}
      <header className="sticky top-3 sm:top-5 z-50 w-full px-3 sm:px-6 flex justify-center pointer-events-none transition-all">
        <div className="pointer-events-auto max-w-5xl w-full h-14 sm:h-15 px-2.5 sm:px-3.5 rounded-[20px] bg-white border border-line shadow-xl shadow-ink-black/5 flex items-center justify-between gap-2 sm:gap-4 transition-all">
          {/* Logo with strict brand styling: LeadNivash */}
          <Link to="/" className="flex items-center gap-2.5 pl-1.5 sm:pl-2 group focus:outline-none rounded-[16px] shrink-0">
            <div className="w-8 h-8 rounded-[12px] bg-white border border-line p-1 shadow-2xs group-hover:border-brand-600/40 transition flex items-center justify-center">
              <img src="/logo-icon.png" alt="LeadNivash" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-black tracking-tight text-ink-900 font-heading leading-none">
                Lead<span className="text-brand-700">Nivash</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links: Single-Line Professional Whitespace-Nowrap */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-[11px] xl:text-xs font-bold uppercase tracking-wider text-ink-700">
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-[10px] whitespace-nowrap leading-none hover:text-ink-900 hover:bg-lime-soft transition-colors"
            >
              How It Works
            </a>
            <a
              href="#capabilities"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-[10px] whitespace-nowrap leading-none hover:text-ink-900 hover:bg-lime-soft transition-colors"
            >
              Features
            </a>
            <a
              href="#financial-impact"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-[10px] whitespace-nowrap leading-none hover:text-ink-900 hover:bg-lime-soft transition-colors"
            >
              ROI Calculator
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-[10px] whitespace-nowrap leading-none hover:text-ink-900 hover:bg-lime-soft transition-colors"
            >
              Pricing
            </a>
            <a
              href="#why-leadnivash"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-[10px] whitespace-nowrap leading-none hover:text-ink-900 hover:bg-lime-soft transition-colors"
            >
              Why Us
            </a>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 shrink-0 pr-1">
            {isAuthenticated ? (
              <Link
                to="/app"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-ink-900 bg-white border border-line px-3.5 h-10 rounded-[10px] hover:bg-lime-soft transition-colors whitespace-nowrap leading-none"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-700 shrink-0" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-ink-900 bg-white border border-line px-3.5 h-10 rounded-[10px] hover:bg-lime-soft transition-colors whitespace-nowrap leading-none"
              >
                <LogIn className="w-3.5 h-3.5 text-ink-700 shrink-0" />
                <span>Sign In</span>
              </Link>
            )}

            <button
              onClick={scrollToInquiry}
              className="group btn-cashfree-primary btn-shine-sweep relative inline-flex items-center gap-1.5 sm:gap-2.5 pl-2.5 sm:pl-4 pr-1 sm:pr-1.5 h-9 sm:h-10 rounded-[10px] active:scale-[0.98] text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap leading-none min-h-[36px] sm:min-h-[40px]"
            >
              <span className="relative z-10">Get Free Demo</span>
              <span className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-[7px] bg-lime text-ink-black flex items-center justify-center font-bold text-xs shadow-2xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 min-w-[40px] min-h-[40px] rounded-[10px] flex items-center justify-center text-ink-900 hover:bg-lime-soft active:scale-95 transition cursor-pointer border border-line bg-white shrink-0"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Overlay */}
        {mobileMenuOpen && (
          <div className="pointer-events-auto fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 transition-opacity"
              className="fixed inset-0 bg-ink-black/40 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-in Drawer Panel */}
            <div
              className="fixed top-0 right-0 bottom-0 w-full max-w-xs sm:max-w-sm bg-white shadow-2xl z-50 p-6 flex flex-col justify-between border-l border-slate-200 animate-hero-up"
              className="fixed top-0 right-0 bottom-0 w-full max-w-xs sm:max-w-sm bg-cream shadow-2xl z-50 p-6 flex flex-col justify-between border-l border-line animate-hero-up"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between pb-4 border-b border-line">
                    <div className="flex items-center gap-2.5">
                      <img src="/logo-icon.png" alt="LeadNivash" className="w-7 h-7 object-contain" />
                      <span className="font-black text-slate-900 font-heading text-base">
                        lead<span className="text-emerald-700">Nivash</span>
                        <span className="font-black text-ink-900 font-heading text-base">
                          Lead<span className="text-brand-600">Nivash</span>
                        </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-[16px] flex items-center justify-center text-ink-500 hover:text-ink-900 hover:bg-lime-soft transition cursor-pointer"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex flex-col space-y-1 text-sm font-bold text-slate-700">
                    <nav className="flex flex-col space-y-1 text-sm font-bold text-ink-700">
                      <a
                        href="#how-it-works"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center justify-between"
                        className="p-3 rounded-[16px] hover:bg-lime-soft hover:text-ink-900 transition flex items-center justify-between"
                      >
                        <span>How It Works</span>
                        <ArrowRight className="w-4 h-4 text-slate-600" />
                      </a>
                      <a
                        href="#capabilities"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center justify-between"
                        className="p-3 rounded-[16px] hover:bg-lime-soft hover:text-ink-900 transition flex items-center justify-between"
                      >
                        <span>Features & Capabilities</span>
                        <ArrowRight className="w-4 h-4 text-slate-600" />
                        <ArrowRight className="w-4 h-4 text-ink-500" />
                      </a>
                      <a
                        href="#financial-impact"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center justify-between"
                        className="p-3 rounded-[16px] hover:bg-lime-soft hover:text-ink-900 transition flex items-center justify-between"
                      >
                        <span>ROI Calculator</span>
                        <ArrowRight className="w-4 h-4 text-slate-600" />
                        <ArrowRight className="w-4 h-4 text-ink-500" />
                      </a>
                      <a
                        href="#pricing"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center justify-between"
                        className="p-3 rounded-[16px] hover:bg-lime-soft hover:text-ink-900 transition flex items-center justify-between"
                      >
                        <span>Pricing Plans</span>
                        <ArrowRight className="w-4 h-4 text-slate-600" />
                        <ArrowRight className="w-4 h-4 text-ink-500" />
                      </a>
                      <a
                        href="#why-leadnivash"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center justify-between"
                        className="p-3 rounded-[16px] hover:bg-lime-soft hover:text-ink-900 transition flex items-center justify-between"
                      >
                        <span>Why LeadNivash</span>
                        <ArrowRight className="w-4 h-4 text-slate-600" />
                        <ArrowRight className="w-4 h-4 text-ink-500" />
                      </a>
                    </nav>
                </div>

                {/* Drawer Bottom Actions */}
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <div className="pt-6 border-t border-line space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        scrollToInquiry();
                      }}
                      className="w-full py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                      className="w-full py-3 px-4 rounded-[16px] bg-ink-black hover:bg-ink-900 active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-between cursor-pointer min-h-[46px]"
                    >
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span>Get Free Demo</span>
                      <span className="w-6 h-6 rounded-[10px] bg-lime text-ink-black flex items-center justify-center">
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    </button>

                    {/* Drawer Bottom Actions */}
                    <div className="pt-6 border-t border-line space-y-3">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          scrollToInquiry();
                        }}
                        className="group btn-cashfree-primary btn-shine-sweep w-full py-2.5 pl-4 pr-2 rounded-[14px] active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-between cursor-pointer min-h-[46px]"
                      >
                        <span>Get Free Demo</span>
                        <span className="w-7 h-7 rounded-[9px] bg-lime text-ink-black flex items-center justify-center">
                          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                        </span>
                      </button>

                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-xs text-center text-slate-500 hover:text-slate-900 block font-bold py-3 min-h-[44px] flex items-center justify-center transition"
                        className="text-xs text-center text-ink-500 hover:text-ink-900 block font-bold py-3 min-h-[44px] flex items-center justify-center transition"
                      >
                        Already have an account? Sign In
                      </Link>
                    </>
                    )}
                  </div>
                </div>
              </div>
        )}
            </header>

            <main>
              {/* ========================================================= */}
              {/* SECTION 1 — HERO (Phase 1 Light Showcase)                 */}
              {/* SECTION 1 — HERO (Cashfree-Inspired Cream + Lime Soft)    */}
              {/* ========================================================= */}
              <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/75 via-white to-slate-50/85 text-slate-900 pt-16 sm:pt-24 pb-20 px-4 sm:px-6 w-full border-b border-slate-200/80">
                <section className="relative overflow-hidden bg-gradient-to-b from-cream via-cream to-lime-soft/70 text-ink-900 pt-16 sm:pt-24 pb-20 px-4 sm:px-6 w-full border-b border-line">
                  {/* Dynamic Video Background (bg1.mp4) with Crisp Gradient Wash */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      poster="/hero-bg.jpg"
                      className="w-full h-full object-cover object-center opacity-15 animate-hero-bg scale-100 filter brightness-105 contrast-95"
                    >
                      <source src="/bg1.mp4" type="video/mp4" />
                      <img
                        src="/hero-bg.jpg"
                        alt="Indian Urban Real Estate Architecture"
                        className="w-full h-full object-cover object-center"
                      />
                    </video>

                    {/* Subtle Cream Wash + Soft Lime Ambient Radial Shape */}
                    <div className="absolute inset-0 bg-gradient-to-b from-cream/85 via-cream/75 to-lime-soft/85" />
                    <div
                      aria-hidden="true"
                      className="absolute left-1/2 top-10 -translate-x-1/2 w-[560px] sm:w-[760px] h-[340px] sm:h-[420px] rounded-full bg-lime/40 blur-[120px] pointer-events-none"
                    />
                  </div>

                  <div className="relative z-10 max-w-6xl mx-auto w-full">
                    {/* Main Hero Header Stack */}
                    <div className="text-center max-w-3xl mx-auto space-y-6">
                      {/* Pill Badge */}
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-white via-emerald-50/50 to-white border border-emerald-200/80 shadow-xs mx-auto animate-hero-up cursor-default">
                        <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[16px] bg-surface border border-line shadow-xs mx-auto animate-hero-up cursor-default">
                            <span className="w-5 h-5 rounded-full bg-lime text-ink-black flex items-center justify-center text-[10px] font-black shadow-2xs">
                              ✓
                            </span>
                            <span className="text-xs font-bold text-slate-800 tracking-tight">
                              <span className="text-xs font-bold text-ink-900 tracking-tight">
                                India's #1 Real Estate Broker Operating System
                              </span>
                          </div>

            {/* Hero Headline with Text Writing Animation & Zero CLS */}
            <h1
              aria-label="Turn Messages into Property Deals"
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-heading leading-[1.12] sm:leading-[1.08] tracking-tight text-ink-900 grid place-items-center"
            >
              <span aria-hidden="true" className="col-start-1 row-start-1 invisible select-none pointer-events-none">
                {HERO_LINE_1} <br className="hidden sm:inline" />
                {HERO_LINE_2}
              </span>
              <span aria-hidden="true" className="col-start-1 row-start-1 w-full">
                <span>{HERO_LINE_1.slice(0, Math.min(typedChars, HERO_LINE_1.length))}</span>
                {typedChars > HERO_LINE_1.length ? (
                  <>
                    <br className="hidden sm:inline" />{' '}
                    <span className="bg-gradient-to-r from-ink-900 via-brand-700 to-brand-600 bg-clip-text text-transparent">
                      {HERO_LINE_2.slice(0, typedChars - HERO_LINE_1.length)}
                    </span>
                  </>
                ) : null}
                <span
                  className="inline-block w-[3px] sm:w-[4px] h-[0.82em] align-middle ml-1.5 rounded-full bg-brand-600 animate-pulse"
                />
              </span>
            </h1>

                          {/* 4. Supporting Text */}
                          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal px-2 sm:px-0">
                            <p className="text-base md:text-lg text-ink-700 max-w-2xl mx-auto leading-relaxed font-normal px-2 sm:px-0">
                              Turn scattered WhatsApp enquiries into an organised property business. Save time, find the right property matches faster and manage more opportunities without losing track of your deals.
                            </p>

                            {/* 5. CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 max-w-xl mx-auto w-full px-2 sm:px-0">
                              <div className="btn-shine-wrapper w-full sm:w-auto flex-1">
                                <div className="btn-shine-border" />
                                <button
                                  onClick={scrollToInquiry}
                                  className="relative z-10 w-full group btn-cashfree-primary btn-shine-sweep inline-flex items-center justify-between sm:justify-center gap-3 pl-6 pr-2.5 h-[54px] rounded-[18px] active:scale-[0.98] text-white font-extrabold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer focus:outline-none whitespace-nowrap"
                                >
                                  <span className="flex items-center gap-2 whitespace-nowrap">
                                    <span>Get Free Demo</span>
                                  </span>
                                  <span className="w-8 h-8 rounded-[10px] bg-lime text-ink-black flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shadow-xs shrink-0">
                                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                                  </span>
                                </button>
                              </div>

                              <Link to="/register" className="w-full sm:w-auto flex-1 block">
                                <button
                                  className="group w-full inline-flex items-center justify-between sm:justify-center gap-3 pl-5 pr-2.5 h-[54px] rounded-[18px] bg-white hover:bg-lime-soft active:scale-[0.98] text-ink-900 border border-ink-black/15 hover:border-ink-black/30 font-extrabold text-xs tracking-wider uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_6px_rgba(18,20,15,0.06)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer focus:outline-none whitespace-nowrap"
                                >
                                  <span className="whitespace-nowrap">Start 14-Day Free Trial</span>
                                  <span className="w-8 h-8 rounded-[10px] bg-lime-soft text-brand-700 border border-lime flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:scale-105 shrink-0">
                                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                                  </span>
                                </button>
                              </Link>
                            </div>

                            {/* Trust points */}
                            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-6 pt-2 text-xs text-slate-600 font-semibold px-2">
                              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-6 pt-2 text-xs text-ink-700 font-semibold px-2">
                                <span className="flex items-center gap-1.5 whitespace-nowrap">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 100% Owner Contact Privacy
                                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" /> 100% Owner Contact Privacy
                                </span>
                                <span className="flex items-center gap-1.5 whitespace-nowrap">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> No credit card required
                                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" /> No credit card required
                                </span>
                                <span className="flex items-center gap-1.5 whitespace-nowrap">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> WhatsApp integrated
                                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" /> WhatsApp integrated
                                </span>
                              </div>
                            </div>

                            {/* 6 & 7. Product Preview Container & Animated 5-Step Process Flow */}
                            <div className="mt-10 sm:mt-14 max-w-5xl mx-auto">
                              {/* Animated 5-Step Process Indicator (Smooth scrollable with snapping on mobile) */}
                              <div className="mb-4">
                                <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3.5 overflow-x-auto sm:overflow-visible py-4 sm:py-5 px-4 sm:px-2 no-scrollbar scroll-smooth snap-x snap-mandatory">
                                  {PROCESS_STEPS.map((step, idx) => {
                                    const Icon = step.icon;
                                    const isActive = activeProcessStep === idx;
                                    const isPassed = activeProcessStep > idx;

                                    return (
                                      <React.Fragment key={step.id}>
                                        <button
                                          type="button"
                                          onClick={() => setActiveProcessStep(idx)}
                                          className={clsx(
                                            'relative z-10 flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer border snap-center shrink-0 min-h-[44px]',
                                            'relative z-10 flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-[16px] text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer border snap-center shrink-0 min-h-[44px]',
                                            isActive
                                              ? 'bg-emerald-50/90 border-2 border-emerald-600 text-emerald-950 font-bold shadow-md shadow-emerald-600/15'
                                                ? 'bg-lime border-2 border-ink-black text-ink-black font-bold shadow-md'
                                                : isPassed
                                                  ? 'bg-white border-emerald-300 text-emerald-700 shadow-2xs'
                                                  : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                                                    ? 'bg-surface border-brand-600/40 text-brand-700 shadow-2xs'
                                                    : 'bg-surface border-line text-ink-700 hover:bg-lime-soft hover:text-ink-900 shadow-2xs'
                          )}
                                        >
                                          <span
                                            className={clsx(
                                              'w-5 h-5 rounded-full flex items-center justify-center transition-colors',
                                              isActive
                                                ? 'bg-emerald-700 text-white shadow-2xs'
                                                  ? 'bg-ink-black text-lime shadow-2xs'
                                                  : isPassed
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-600'
                                                      ? 'bg-lime-soft text-brand-700'
                                                      : 'bg-bg text-ink-500'
                            )}
                                          >
                                            <Icon className="w-3 h-3" />
                                          </span>
                                          <span>{step.label}</span>
                                        </button>

                                        {idx < PROCESS_STEPS.length - 1 && (
                                          <div className="hidden sm:block w-6 sm:w-10 h-0.5 rounded-full bg-slate-200 relative overflow-hidden shrink-0">
                                            <div className="hidden sm:block w-6 sm:w-10 h-0.5 rounded-full bg-line relative overflow-hidden shrink-0">
                                              <div
                                                className={clsx(
                                                  'absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500',
                                                  'absolute inset-0 bg-brand-600 transition-all duration-500',
                                                  isPassed || isActive ? 'w-full animate-flow-line' : 'w-0'
                                                )}
                                              />
                                            </div>
                        )}
                                          </React.Fragment>
                                        );
                  })}
                                      </div>
              </div>

                                {/* Dashboard-Window Showcase Container */}
                                <div className="rounded-[20px] border border-line bg-surface p-3.5 sm:p-6 shadow-2xl shadow-ink-black/10 relative overflow-hidden transition-all duration-300">
                                  {/* Window Chrome Header Bar with Clean OS Dots & Encrypted Status */}
                                  <div className="relative z-10 flex items-center justify-between pb-3 px-1 border-b border-line">
                                    <div className="flex items-center gap-2">
                                      <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                                      <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                                      <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-[16px] bg-lime-soft border border-line text-[10px] font-bold text-ink-900 shadow-2xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
                                        Encrypted Owner Vault Active
                                      </span>
                                    </div>
                                  </div>

                {/* 3-Part Product Preview with Staggered Entrance */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  {/* Card 1: WhatsApp Parser Simulation */}
                  <div
                    style={{ animationDelay: '100ms' }}
                    className={clsx(
                      'animate-hero-stagger p-4 rounded-[16px] bg-cream border transition-all duration-300 space-y-3',
                      activeProcessStep === 0 || activeProcessStep === 1
                        ? 'border-ink-black shadow-lg'
                        : 'border-line'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                        WhatsApp Message
                      </span>
                      <span className="text-[10px] text-ink-black bg-lime px-2.5 py-0.5 rounded-[12px] font-bold">
                        1-Tap Parse
                      </span>
                    </div>
                    <div className="p-3 rounded-[12px] bg-surface border border-line text-[11px] font-mono text-ink-900 line-clamp-3 shadow-2xs leading-relaxed">
                      "3 BHK builder floor, 2nd floor with lift, Model Town Panipat, 200 gaj, demand 1.25 Cr. Owner: 9876543210"
                    </div>
                    <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                      <span className="font-bold text-ink-900">3 BHK · 200 Gaj</span>
                      <span className="font-extrabold text-brand-700">₹1.25 Cr</span>
                    </div>
                  </div>

                  {/* Card 2: Smart Property Match Score Indicator */}
                  <div
                    style={{ animationDelay: '200ms' }}
                    className={clsx(
                      'animate-hero-stagger p-4 rounded-[16px] bg-cream border transition-all duration-300 space-y-3 flex flex-col justify-between',
                      activeProcessStep === 2
                        ? 'border-ink-black shadow-lg'
                        : 'border-line'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                        Smart Property Match
                      </span>
                      <span className="text-[10px] text-brand-700 bg-lime-soft border border-line px-2.5 py-0.5 rounded-[12px] font-bold">
                        Buyer Match
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full border-4 border-lime-soft border-t-brand-600 flex items-center justify-center shrink-0 bg-surface shadow-2xs">
                        <span className="text-xs font-black text-brand-700 font-heading">96%</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink-900">Rajesh Sharma</p>
                        <p className="text-[11px] text-ink-700">Budget: ₹1.20 - 1.35 Cr</p>
                        <span className="text-[10px] font-bold text-brand-700">Model Town Match</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-line text-[11px] text-ink-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      <span>Matched instantly across 18 inquiries</span>
                    </div>
                  </div>

                  {/* Card 3: Masked Flyer & Branded Share */}
                  <div
                    style={{ animationDelay: '300ms' }}
                    className={clsx(
                      'animate-hero-stagger p-4 rounded-[16px] bg-cream border transition-all duration-300 space-y-3 flex flex-col justify-between',
                      activeProcessStep === 3 || activeProcessStep === 4
                        ? 'border-ink-black shadow-lg'
                        : 'border-line'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                        Masked Flyer Output
                      </span>
                      <span className="text-[10px] text-ink-black bg-lime px-2.5 py-0.5 rounded-[12px] font-bold">
                        Safe Share
                      </span>
                    </div>
                    <div className="p-3 rounded-[12px] bg-surface border border-line text-ink-900 space-y-1 shadow-2xs">
                      <span className="text-[10px] uppercase tracking-wider text-brand-700 font-bold block">
                        Watermarked Flyer
                      </span>
                      <p className="text-xs font-bold text-ink-900">3 BHK Luxury Floor · Model Town</p>
                      <p className="text-[10px] text-ink-500">Marketed by: Sharma Real Estate Agency</p>
                    </div>
                    <div className="pt-2 border-t border-line text-[11px] text-brand-700 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                      <span>Owner contact 100% hidden</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2 — PURPOSE-BUILT FOR AGENTS: PRODUCT DEMO UPGRADE*/}
        {/* ========================================================= */}
        <section id="capabilities" className="py-16 sm:py-24 px-4 sm:px-6 bg-lime-soft border-y border-line relative overflow-hidden">
          <div className="max-w-6xl mx-auto space-y-12 relative z-10 reveal-section">
            {/* 1. Section Header & Introduction */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center px-3 py-1 rounded-[16px] bg-lime text-ink-black text-[11px] font-black uppercase tracking-widest">
                PURPOSE-BUILT FOR AGENTS
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink-900 font-heading tracking-tight leading-tight">
                Everything You Need to{' '}
                <span className="bg-gradient-to-r from-ink-900 via-brand-700 to-brand-600 bg-clip-text text-transparent">
                  Turn Enquiries into Deals.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-ink-700 max-w-xl mx-auto leading-relaxed font-normal">
                One organised workspace for your properties, buyers, WhatsApp requirements and brokerage pipeline.
              </p>
            </div>

                              {/* ========================================================= */}
                              {/* SECTION 2 — PURPOSE-BUILT FOR AGENTS: PRODUCT DEMO UPGRADE*/}
                              {/* ========================================================= */}
                              <section id="capabilities" className="py-16 sm:py-24 px-4 sm:px-6 bg-surface/50 border-y border-border/70 relative overflow-hidden">
                                {/* Subtle top ambient glow */}

                                {/* Format Switcher: Desktop 16:9 vs Mobile 9:16 */}
                                <div className="inline-flex items-center p-1 bg-surface border border-line rounded-[18px] text-xs font-bold shadow-xs">
                                  <button
                                    type="button"
                                    onClick={() => setVideoMode('desktop')}
                                    className={clsx(
                                      'px-3.5 py-1.5 rounded-[16px] flex items-center gap-1.5 transition-all duration-200 cursor-pointer min-h-[44px] sm:min-h-0',
                                      videoMode === 'desktop'
                                        ? 'bg-lime text-ink-900 shadow-sm'
                                        : 'text-ink-700 hover:text-ink-900'
                                    )}
                                  >
                                    <Monitor className="w-3.5 h-3.5" />
                                    <span>Desktop (16:9)</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setVideoMode('mobile')}
                                    className={clsx(
                                      'px-3.5 py-1.5 rounded-[16px] flex items-center gap-1.5 transition-all duration-200 cursor-pointer min-h-[44px] sm:min-h-0',
                                      videoMode === 'mobile'
                                        ? 'bg-lime text-ink-900 shadow-sm'
                                        : 'text-ink-700 hover:text-ink-900'
                                    )}
                                  >
                                    <Smartphone className="w-3.5 h-3.5" />
                                    <span>Mobile (9:16)</span>
                                  </button>
                                </div>
                            </div>

                            {/* Format Switcher: Desktop 16:9 vs Mobile 9:16 */}
                            <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-full text-xs font-bold shadow-xs">
                              <div className="inline-flex items-center p-1 bg-surface border border-line rounded-[18px] text-xs font-bold shadow-xs">
                                <button
                                  type="button"
                                  onClick={() => setVideoMode('desktop')}
                                  className={clsx(
                                    'px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer min-h-[44px] sm:min-h-0',
                                    'px-3.5 py-1.5 rounded-[16px] flex items-center gap-1.5 transition-all duration-200 cursor-pointer min-h-[44px] sm:min-h-0',
                                    videoMode === 'desktop'
                                      ? 'bg-emerald-700 text-white shadow-sm'
                                      : 'text-slate-600 hover:text-slate-900'
                                        ? 'bg-ink-black text-white shadow-sm'
                                        : 'text-ink-700 hover:text-ink-900'
                                  )}
                                >
                                  <Monitor className="w-3.5 h-3.5" />
                                  <span>Desktop (16:9)</span>
                                </button>

                      {/* Dark Overlay with Play Button */}
                      <div className="absolute inset-0 bg-ink-black/45 flex flex-col items-center justify-center p-6 text-center transition-opacity duration-300">
                        <button
                          type="button"
                          onClick={() => setIsPlaying(true)}
                          className="group/btn relative w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] bg-ink-black border-2 border-lime text-lime flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none"
                          aria-label="Play YouTube Demonstration Video"
                        >
                          <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1 transition-transform group-hover/btn:scale-110" />
                        </button>
                        <span className="mt-3 text-xs font-bold text-white bg-ink-black/70 px-3 py-1 rounded-[16px] border border-white/15">
                          Plays directly in browser • Autostarts in 5s
                        </span>
                      </div>
                    </div>
                  )}
                                    </div>
              </div>
                              </div>

                              {/* 6. Compact Core Capabilities Strip (Apple-Class Light Cards) */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-4">
                                {[
                                  {
                                    title: 'Smart Property Inventory',
                                    desc: 'Centralised listings with private vault',
                                    icon: Building2,
                                  },
                                  {
                                    title: 'Buyer Requirements',
                                    desc: 'Active budgets, localities & criteria',
                                    icon: Users,
                                  },
                                  {
                                    title: 'WhatsApp Analyzer',
                                    desc: 'Instant extraction of BHK, size & price',
                                    icon: MessageSquare,
                                  },
                                  {
                                    title: 'Intelligent Matching',
                                    desc: 'Percentage scores & matching reasons',
                                    icon: Sparkles,
                                  },
                                  {
                                    title: 'Masked Flyers',
                                    desc: 'Agency watermarked brochures',
                                    icon: Share2,
                                  },
                                  {
                                    title: 'Deal & Commission',
                                    desc: 'Track stages, pipeline & earnings',
                                    icon: TrendingUp,
                                  },
                                ].map((cap, i) => {
                                  const Icon = cap.icon;
                                  return (
                                    <div
                                      key={i}
                                      className="group p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 text-left cursor-default space-y-2 shadow-2xs"
                                      className="group p-4 rounded-[18px] bg-surface border border-line hover:border-brand-600/50 hover:shadow-xl hover:shadow-ink-black/5 hover:-translate-y-1 transition-all duration-300 text-left cursor-default space-y-2 shadow-2xs"
                                    >
                                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                                        <div className="w-9 h-9 rounded-[14px] bg-lime-soft text-brand-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-ink-black group-hover:text-lime transition-all duration-300 shadow-2xs">
                                          <Icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                                            <h3 className="text-xs font-bold text-ink-900 group-hover:text-brand-700 transition-colors leading-tight">
                                              {cap.title}
                                            </h3>
                                            <p className="text-[11px] text-slate-500 leading-tight mt-1">
                                              <p className="text-[11px] text-ink-500 leading-tight mt-1">
                                                {cap.desc}
                                              </p>
                                            </div>
                                        </div>
                                        );
              })}
                                      </div>
                                    </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3 — HOW IT WORKS (Cream Surface)                  */}
        {/* ========================================================= */}
        <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-cream w-full relative overflow-hidden">
          <div className="relative z-10 max-w-6xl mx-auto space-y-12 reveal-section">
            {/* 1. Section Header & Introduction */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center px-3 py-1 rounded-[16px] bg-lime text-ink-black text-[11px] font-black uppercase tracking-widest">
                SIMPLE WORKFLOW
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink-900 font-heading tracking-tight leading-tight">
                From WhatsApp Message to{' '}
                <span className="bg-gradient-to-r from-ink-900 via-brand-700 to-brand-600 bg-clip-text text-transparent">
                  Property Deal.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-ink-700 max-w-xl mx-auto leading-relaxed font-normal">
                Stop searching through endless chats and manually organising information. LeadNivash helps you manage the entire workflow.
              </p>
            </div>

                                  <div className="relative z-10 space-y-12">
                                    <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-cream w-full relative overflow-hidden">
                                      <div className="relative z-10 max-w-6xl mx-auto space-y-12">
                                        {/* 1. Section Header & Introduction */}
                                        <div className="text-center max-w-2xl mx-auto space-y-3">
                                          <span className="inline-block text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-500">
                                            <span className="inline-flex items-center px-3 py-1 rounded-[16px] bg-lime text-ink-black text-[11px] font-black uppercase tracking-widest">
                                              SIMPLE WORKFLOW
                                            </span>
                                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink font-heading tracking-tight leading-tight">
                                              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink-900 font-heading tracking-tight leading-tight">
                                                From WhatsApp Message to{' '}
                                                <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                                                  <span className="text-brand-600 underline decoration-lime decoration-4 underline-offset-4">
                                                    Property Deal.
                                                  </span>
                                              </h2>
                                              <p className="text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed font-normal">
                                                <p className="text-sm sm:text-base text-ink-700 max-w-xl mx-auto leading-relaxed font-normal">
                                                  Stop searching through endless chats and manually organising information. LeadNivash helps you manage the entire workflow.
                                                </p>
                                              </div>

                                              {/* 3 & 4. Interactive Connected Progress Line & Stage Navigation */}
                                              <div className="max-w-4xl mx-auto">
                                                <div className="flex items-center justify-between pb-3 px-1">
                                                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-xs font-bold text-ink-700 flex items-center gap-1.5">
                                                      <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                                                      <span>Stage {activeWorkflowStep + 1} of 5 · Continuous Flow</span>
                                                    </span>
                                                    <button
                                                      type="button"
                                                      onClick={() => setIsWorkflowPaused(!isWorkflowPaused)}
                                                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer min-h-[44px]"
                                                      className="text-[11px] font-bold text-ink-700 hover:text-ink-900 px-3 py-1.5 rounded-[16px] border border-line bg-surface hover:bg-lime-soft transition cursor-pointer min-h-[44px]"
                                                    >
                                                      {isWorkflowPaused ? 'Resume Auto-Cycle' : 'Pause Flow'}
                                                    </button>
                                                </div>

                                                {/* Responsive Stepper Bar */}
                                                <div className="relative mb-6 sm:mb-8">
                                                  {/* Subtle connecting line across stages */}
                                                  <div className="absolute top-5 inset-x-6 sm:inset-x-8 h-0.5 bg-slate-200 -z-0">
                                                    <div className="absolute top-5 inset-x-6 sm:inset-x-8 h-0.5 bg-line -z-0">
                                                      <div
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                                                        className="h-full bg-brand-600 transition-all duration-500"
                                                        style={{ width: `${(activeWorkflowStep / 4) * 100}%` }}
                                                      />
                                                    </div>

                    return (
                      <button
                        key={s.num}
                        type="button"
                        onClick={() => setActiveWorkflowStep(idx)}
                        className="group flex flex-col items-center gap-1.5 cursor-pointer focus:outline-none min-h-[44px] min-w-[44px]"
                        aria-label={`Step ${s.num}: ${s.title}`}
                      >
                        <div
                          className={clsx(
                            'w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] flex items-center justify-center font-bold text-xs transition-all duration-300 border-2',
                            isActive
                              ? 'bg-ink-black border-ink-black text-lime shadow-lg scale-110'
                              : isPassed
                                ? 'bg-lime-soft border-brand-600 text-brand-700'
                                : 'bg-surface border-line text-ink-500 hover:border-ink-900/30'
                          )}
                                                            >
                                                              <Icon className="w-4 h-4" />
                                                            </div>
                                                            <span
                                                              className={clsx(
                                                                'text-[10px] sm:text-[11px] font-bold tracking-tight transition-colors',
                                                                isActive
                                                                  ? 'text-emerald-700 font-extrabold'
                                                                  : 'text-slate-500 group-hover:text-slate-900'
                                                                    ? 'text-ink-900 font-extrabold'
                                                                    : 'text-ink-500 group-hover:text-ink-900'
                                                              )}
                                                            >
                                                              <span className="sm:hidden">{s.num}</span>
                                                              <span className="hidden sm:inline">{s.num}. {s.title}</span>
                                                            </span>
                                                          </button>
                                                        );
                                                      })}
                                                    </div>
                                                  </div>

                                                  {/* Active Stage Visual Showcase Deck */}
                                                  <div className="rounded-[20px] border border-line bg-surface p-4 sm:p-8 shadow-xl transition-all duration-300">
                                                    <div key={activeWorkflowStep} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-tab-fade">
                                                      {/* Left Column: Stage Narrative & Action */}
                                                      <div className="lg:col-span-5 space-y-4 text-left">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[16px] bg-lime text-ink-900 text-xs font-bold shadow-xs">
                                                          <span>
                                                            {activeWorkflowStep === 0 && 'STEP 01 — PASTE A MESSAGE'}
                                                            {activeWorkflowStep === 1 && 'STEP 02 — AI UNDERSTANDS IT'}
                                                            {activeWorkflowStep === 2 && 'STEP 03 — SAVE AND ORGANISE'}
                                                            {activeWorkflowStep === 3 && 'STEP 04 — FIND MATCHES'}
                                                            {activeWorkflowStep === 4 && 'STEP 05 — SHARE AND TRACK'}
                                                          </span>
                                                        </div>

                                                        <h3 className="text-xl sm:text-2xl font-black text-ink-900 font-heading leading-snug">
                                                          {activeWorkflowStep === 0 && 'Paste a Message'}
                                                          {activeWorkflowStep === 1 && 'AI Understands It'}
                                                          {activeWorkflowStep === 2 && 'Save and Organise'}
                                                          {activeWorkflowStep === 3 && 'Find Matches'}
                                                          {activeWorkflowStep === 4 && 'Share and Track'}
                                                        </h3>

                                                        <p className="text-xs sm:text-sm text-ink-700 leading-relaxed font-normal">
                                                          {activeWorkflowStep === 0 &&
                                                            'Copy a buyer requirement or property listing from WhatsApp and paste it into LeadNivash.'}
                                                          {activeWorkflowStep === 1 &&
                                                            'AI extracts important information such as name, budget, property type, locality, area and contact details.'}
                                                          {activeWorkflowStep === 2 &&
                                                            'Review the extracted information, correct anything necessary and save the buyer or property record.'}
                                                          {activeWorkflowStep === 3 &&
                                                            'The matching engine compares buyer requirements against available inventory and explains why a property matches.'}
                                                          {activeWorkflowStep === 4 &&
                                                            'Generate a branded masked property flyer, share it with the buyer and track the opportunity through your deal pipeline.'}
                                                        </p>

                                                        <div className="pt-2 flex flex-wrap items-center gap-3">
                                                          <button
                                                            type="button"
                                                            onClick={() => setActiveWorkflowStep((prev) => (prev + 1) % 5)}
                                                            className="group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[16px] bg-lime-soft hover:bg-lime active:scale-95 text-brand-700 hover:text-ink-900 text-xs font-bold border border-line transition cursor-pointer min-h-[44px]"
                                                          >
                                                            <span>Next Stage</span>
                                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                                          </button>
                                                          <span className="text-[11px] text-ink-500 font-medium">Tap any step above to explore</span>
                                                        </div>
                                                      </div>

                                                      {/* Right Column: Interactive Visual Simulation */}
                                                      <div className="lg:col-span-7">
                                                        {/* Step 01 Visual: WhatsApp Message Bubble */}
                                                        {activeWorkflowStep === 0 && (
                                                          <div className="p-4 sm:p-5 rounded-[18px] bg-cream border border-line shadow-lg space-y-3.5 text-ink-900">
                                                            <div className="flex items-center justify-between border-b border-line pb-2.5">
                                                              <div className="flex items-center gap-2">
                                                                <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
                                                                <span className="text-xs font-bold text-ink-900">WhatsApp Incoming Chat</span>
                                                              </div>
                                                              <span className="text-[10px] text-ink-500 font-mono">10:42 AM · NCR Broker Group</span>
                                                            </div>
                                                            <div className="p-3.5 rounded-[16px] rounded-tl-xs bg-lime-soft border border-line text-ink-900 text-xs sm:text-sm font-sans leading-relaxed shadow-xs">
                                                              "Need 3 BHK in Model Town, Panipat. Budget 1.25 Cr. Prefer lift and parking."
                                                            </div>
                                                            <div className="flex items-center justify-between text-[11px] text-ink-500 pt-1">
                                                              <span className="italic">* Fictional sample data for illustration</span>
                                                              <span className="text-ink-900 font-bold bg-lime px-2.5 py-0.5 rounded-[10px]">
                                                                1-Tap Quick Paste Ready
                                                              </span>
                                                            </div>
                                                          </div>
                                                        )}

                                                        {/* Step 02 Visual: AI Extraction */}
                                                        {activeWorkflowStep === 1 && (
                                                          <div className="p-4 sm:p-5 rounded-[18px] bg-cream border border-line shadow-lg space-y-3.5 relative overflow-hidden text-ink-900">
                                                            <div className="flex items-center justify-between border-b border-line pb-2.5">
                                                              <div className="flex items-center gap-2">
                                                                <Sparkles className="w-4 h-4 text-brand-600" />
                                                                <span className="text-xs font-bold text-ink-900">AI Entity Extraction Active</span>
                                                              </div>
                                                              <span className="text-[10px] text-brand-700 font-mono font-bold">4 Attributes Identified</span>
                                                            </div>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                                                              <div className="p-2.5 rounded-[12px] bg-surface border border-line shadow-2xs">
                                                                <span className="text-[10px] uppercase font-bold text-ink-500 block">Property</span>
                                                                <span className="text-xs font-bold text-brand-700">3 BHK Builder Floor</span>
                                                              </div>
                                                              <div className="p-2.5 rounded-[12px] bg-surface border border-line shadow-2xs">
                                                                <span className="text-[10px] uppercase font-bold text-ink-500 block">Locality</span>
                                                                <span className="text-xs font-bold text-brand-700">Model Town, Panipat</span>
                                                              </div>
                                                              <div className="p-2.5 rounded-[12px] bg-surface border border-line shadow-2xs">
                                                                <span className="text-[10px] uppercase font-bold text-ink-500 block">Budget</span>
                                                                <span className="text-xs font-bold text-brand-700">₹1.25 Cr</span>
                                                              </div>
                                                              <div className="p-2.5 rounded-[12px] bg-surface border border-line shadow-2xs">
                                                                <span className="text-[10px] uppercase font-bold text-ink-500 block">Amenities</span>
                                                                <span className="text-xs font-bold text-brand-700">Lift + Dedicated Parking</span>
                                                              </div>
                                                            </div>

                                                            <div className="text-[11px] text-ink-500 pt-1 flex items-center justify-between">
                                                              <span>Zero manual typing required</span>
                                                              <span className="text-brand-700 font-bold">Confidence: High</span>
                                                            </div>
                                                          </div>
                                                        )}

                                                        {/* Step 03 Visual: Save & Organise in Vault */}
                                                        {activeWorkflowStep === 2 && (
                                                          <div className="p-4 sm:p-5 rounded-[18px] bg-cream border border-line shadow-lg space-y-3.5 text-ink-900">
                                                            <div className="flex items-center justify-between border-b border-line pb-2.5">
                                                              <div className="flex items-center gap-2">
                                                                <Layers className="w-4 h-4 text-brand-600" />
                                                                <span className="text-xs font-bold text-ink-900">Buyer Record #LN-8492</span>
                                                              </div>
                                                              <span className="inline-flex items-center gap-1 text-[10px] text-ink-900 font-bold bg-lime px-2.5 py-0.5 rounded-[12px]">
                                                                <CheckCircle2 className="w-3 h-3 text-ink-900" />
                                                                Saved to Vault
                                                              </span>
                                                            </div>

                                                            <div className="p-3.5 rounded-[14px] bg-surface border border-line space-y-2 text-left shadow-2xs">
                                                              <div className="flex items-center justify-between">
                                                                <span className="text-xs font-bold text-ink-900">Rajesh Sharma (Verified Buyer)</span>
                                                                <span className="text-xs font-extrabold text-brand-700">₹1.25 Cr Max</span>
                                                              </div>
                                                              <p className="text-[11px] text-ink-700">
                                                                Seeking 3 BHK with lift in Model Town · Contact stored in encrypted vault
                                                              </p>
                                                            </div>

                                                            <div className="flex items-center justify-between text-[11px] text-ink-500 pt-1">
                                                              <span>Auto-indexed in 0.4s</span>
                                                              <span className="text-brand-700 font-semibold">100% Privacy Preserved</span>
                                                            </div>
                                                          </div>
                                                        )}

                                                        {/* Step 04 Visual: Find Matches with Evaluation Score */}
                                                        {activeWorkflowStep === 3 && (
                                                          <div className="p-4 sm:p-5 rounded-[18px] bg-cream border border-line shadow-lg space-y-3.5 text-ink-900">
                                                            <div className="flex items-center justify-between border-b border-line pb-2.5">
                                                              <div className="flex items-center gap-2">
                                                                <Search className="w-4 h-4 text-brand-600" />
                                                                <span className="text-xs font-bold text-ink-900">Matching Engine Evaluation</span>
                                                              </div>
                                                              <span className="text-[10px] font-mono text-brand-700 font-bold">2 Listings Compared</span>
                                                            </div>

                                                            {/* Best Matching Listing */}
                                                            <div className="p-3.5 rounded-[14px] bg-surface border-2 border-ink-black shadow-sm space-y-2 text-left">
                                                              <div className="flex items-center justify-between">
                                                                <span className="text-xs font-bold text-ink-900">3 BHK Luxury Floor · Model Town</span>
                                                                <span className="text-xs font-black text-ink-900 font-heading bg-lime px-2 py-0.5 rounded-[10px]">
                                                                  96% Match*
                                                                </span>
                                                              </div>
                                                              <div className="text-[11px] text-ink-700 flex items-center justify-between">
                                                                <span>Demand: ₹1.22 Cr · 200 Gaj</span>
                                                                <span className="text-brand-700 font-bold">Matches: Locality, Budget, Lift</span>
                                                              </div>
                                                            </div>

                                                            <p className="text-[10px] text-ink-500 italic text-left">
                                                              * Match score is an illustrative demo value showing multi-criteria correlation.
                                                            </p>
                                                          </div>
                                                        )}

                                                        {/* Step 05 Visual: Masked Flyer & Pipeline Tracker */}
                                                        {activeWorkflowStep === 4 && (
                                                          <div className="p-4 sm:p-5 rounded-[18px] bg-cream border border-line shadow-lg space-y-3.5 text-ink-900">
                                                            <div className="flex items-center justify-between border-b border-line pb-2.5">
                                                              <div className="flex items-center gap-2">
                                                                <Share2 className="w-4 h-4 text-brand-600" />
                                                                <span className="text-xs font-bold text-ink-900">Masked Flyer Output & Deal Tracker</span>
                                                              </div>
                                                              <span className="text-[10px] font-bold text-ink-900 bg-lime px-2.5 py-0.5 rounded-[12px]">
                                                                Negotiation Stage
                                                              </span>
                                                            </div>

                                                            <div className="p-3.5 rounded-[14px] bg-surface border border-line space-y-2 text-left shadow-2xs">
                                                              <div className="flex items-center justify-between">
                                                                <div>
                                                                  <span className="text-[10px] text-brand-700 font-bold uppercase tracking-wider block">
                                                                    Sharma Real Estate Agency
                                                                  </span>
                                                                  <p className="text-xs font-bold text-ink-900">3 BHK Builder Floor · Model Town</p>
                                                                </div>
                                                                <span className="text-xs font-black text-brand-700">₹1.22 Cr</span>
                                                              </div>
                                                              <div className="pt-2 border-t border-line flex items-center justify-between text-[11px] text-ink-500">
                                                                <span className="text-brand-700 flex items-center gap-1 font-semibold">
                                                                  <ShieldCheck className="w-3.5 h-3.5" /> Owner Contact Hidden
                                                                </span>
                                                                <span className="text-ink-700">Site Visit: Tomorrow 4 PM</span>
                                                              </div>
                                                            </div>

                                                            <div className="text-[11px] text-ink-500 flex items-center justify-between pt-1">
                                                              <span>Direct WhatsApp Share Ready</span>
                                                              <span className="text-brand-700 font-bold">Commission Protected</span>
                                                            </div>
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* 5 Connected Step Cards Grid (At a glance overview) */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-4">
                                                  {[
                                                    {
                                                      step: '01',
                                                      title: 'Paste a Message',
                                                      desc: 'Copy a buyer requirement or property listing from WhatsApp and paste it into LeadNivash.',
                                                      icon: MessageSquare,
                                                    },
                                                    {
                                                      step: '02',
                                                      title: 'AI Understands It',
                                                      desc: 'AI extracts important information such as name, budget, property type, locality, area and contact details.',
                                                      icon: Sparkles,
                                                    },
                                                    {
                                                      step: '03',
                                                      title: 'Save and Organise',
                                                      desc: 'Review the extracted information, correct anything necessary and save the buyer or property record.',
                                                      icon: Layers,
                                                    },
                                                    {
                                                      step: '04',
                                                      title: 'Find Matches',
                                                      desc: 'The matching engine compares buyer requirements against available inventory and explains why a property matches.',
                                                      icon: Search,
                                                    },
                                                    {
                                                      step: '05',
                                                      title: 'Share and Track',
                                                      desc: 'Generate a branded masked property flyer, share it with the buyer and track the opportunity through your deal pipeline.',
                                                      icon: Share2,
                                                    },
                                                  ].map((item, idx) => {
                                                    const Icon = item.icon;
                                                    const isActive = activeWorkflowStep === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveWorkflowStep(idx)}
                    className={clsx(
                      'group p-4 rounded-[18px] text-left transition-all duration-300 cursor-pointer space-y-2 border',
                      isActive
                        ? 'bg-lime-soft border-ink-black shadow-lg -translate-y-1'
                        : 'bg-surface border-line hover:border-ink-900/30 hover:-translate-y-0.5'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={clsx(
                          'w-8 h-8 rounded-[12px] flex items-center justify-center font-bold text-xs transition-colors',
                          isActive
                            ? 'bg-ink-black text-lime shadow-xs'
                            : 'bg-cream text-ink-700 group-hover:text-brand-600'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <span
                        className={clsx(
                          'text-[10px] font-black uppercase tracking-widest',
                          isActive ? 'text-brand-700' : 'text-ink-500'
                                                            )}
                                                          >
                                                            STEP {item.step}
                                                          </span>
                                                        </div>
                                                        <div>
                                                          <h4
                                                            className={clsx(
                                                              'text-xs font-bold leading-tight transition-colors',
                                                              isActive ? 'text-emerald-900 dark:text-emerald-300 font-extrabold' : 'text-ink'
                          isActive ? 'text-ink-900 font-extrabold' : 'text-ink-900'
                                                            )}
                                                          >
                                                            {item.title}
                                                          </h4>
                                                          <p className="text-[11px] text-muted leading-relaxed mt-1 line-clamp-3">
                                                            {item.desc}
                                                          </p>
                                                        </div>
                                                      </button>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            </section>

                                            {/* ========================================================= */}
                                            {/* ========================================================= */}
                                            {/* SECTION 4 — FEATURES (DARK --ink-black SHOWCASE)          */}
                                            {/* ========================================================= */}
                                            <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-ink-black text-white border-y border-white/10 relative overflow-hidden">
                                              {/* Decorative Corner Soundwave Clusters (purely decorative) */}
                                              <div aria-hidden="true" className="pointer-events-none select-none hidden sm:flex items-end gap-1.5 absolute top-8 right-8 h-16 animate-soundwave">
                                                {[28, 48, 36, 60, 44, 52, 30, 42, 22, 34].map((h, i) => (
                                                  <span key={i} className="w-1 rounded-full bg-lime/60" style={{ height: `${h}%` }} />
                                                ))}
                                              </div>
                                              <div aria-hidden="true" className="pointer-events-none select-none hidden sm:flex items-end gap-1.5 absolute bottom-8 left-8 h-16 animate-soundwave">
                                                {[22, 38, 54, 34, 48, 60, 40, 28, 46, 30].map((h, i) => (
                                                  <span key={i} className="w-1 rounded-full bg-lime/60" style={{ height: `${h}%` }} />
                                                ))}
                                              </div>

                                              <div className="max-w-6xl mx-auto space-y-12 relative z-10 reveal-section">
                                                {/* 1. Section Header & Introduction */}
                                                <div className="text-center max-w-2xl mx-auto space-y-3">
                                                  <span className="inline-flex items-center px-3 py-1 rounded-[16px] border border-lime/50 bg-lime/10 text-lime text-[11px] font-black uppercase tracking-widest">
                                                    CORE CAPABILITIES
                                                  </span>
                                                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading tracking-tight leading-tight">
                                                    Everything Your Property Business Needs.{' '}
                                                    <span className="text-lime">
                                                      In One Place.
                                                    </span>
                                                  </h2>
                                                  <p className="text-sm sm:text-base text-[#C9CCC6] max-w-xl mx-auto leading-relaxed font-normal">
                                                    From organising properties and understanding WhatsApp enquiries to matching buyers and tracking commissions, LeadNivash brings your brokerage workflow together.
                                                  </p>
                                                  <div className="pt-1">
                                                    <a href="#demo-inquiry-section" className="inline-flex items-center gap-1.5 text-xs font-bold text-lime hover:underline">
                                                      <span>Explore LeadNivash AI</span>
                                                      <ArrowRight className="w-3.5 h-3.5" />
                                                    </a>
                                                  </div>
                                                </div>

                                                {/* SECTION 4 — FEATURES (DARK --ink-black SHOWCASE)          */}
                                                {/* ========================================================= */}
                                                <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-ink-black text-white border-y border-white/10 relative overflow-hidden">
                                                  <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                                                    {/* 1. Section Header & Introduction */}
                                                    <div className="text-center max-w-2xl mx-auto space-y-3">
                                                      <span className="inline-block text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-500">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-[16px] bg-lime text-ink-black text-[11px] font-black uppercase tracking-widest">
                                                          CORE CAPABILITIES
                                                        </span>
                                                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink font-heading tracking-tight leading-tight">
                                                          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading tracking-tight leading-tight">
                                                            Everything Your Property Business Needs.{' '}
                                                            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                                                              <span className="text-lime">
                                                                In One Place.
                                                              </span>
                                                          </h2>
                                                          <p className="text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed font-normal">
                                                            <p className="text-sm sm:text-base text-white/75 max-w-xl mx-auto leading-relaxed font-normal">
                                                              From organising properties and understanding WhatsApp enquiries to matching buyers and tracking commissions, LeadNivash brings your brokerage workflow together.
                                                            </p>
                                                          </div>

            {/* 2 & 3. 6 Main Feature Cards (3-column, 2-row layout on desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* FEATURE 01 — SMART PROPERTY INVENTORY */}
              <div
                onClick={() => setSelectedFeature(selectedFeature === 0 ? null : 0)}
                className={clsx(
                  'group p-5 sm:p-6 rounded-[20px] bg-white/[0.06] border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                  selectedFeature === 0
                    ? 'border-lime shadow-xl -translate-y-1'
                    : 'border-white/15 hover:border-lime/60 hover:bg-white/[0.09] hover:-translate-y-1.5'
                )}
              >
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-[14px] bg-lime text-ink-black flex items-center justify-center group-hover:scale-110 transition-all">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-lime/90">FEATURE 01</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-lime transition-colors font-heading">
                    Smart Property Inventory
                  </h3>
                  <p className="text-xs text-white/75 leading-relaxed">
                    Keep all your property listings organised in one place, with important details and private owner information securely managed.
                  </p>
                </div>

                                                          {/* 2 & 3. 6 Main Feature Cards (3-column, 2-row layout on desktop) */}
                                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                            {/* FEATURE 01 — SMART PROPERTY INVENTORY */}
                                                            <div
                                                              onClick={() => setSelectedFeature(selectedFeature === 0 ? null : 0)}
                                                              className={clsx(
                                                                'group p-5 sm:p-6 rounded-2xl bg-white border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 shadow-2xs',
                                                                'group p-5 sm:p-6 rounded-[20px] bg-white/[0.06] border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                                                                selectedFeature === 0
                                                                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                                                                  : 'border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
                                                                    ? 'border-lime shadow-xl ring-2 ring-lime/30 -translate-y-1'
                                                                    : 'border-white/15 hover:border-lime/60 hover:bg-white/[0.09] hover:-translate-y-1.5'
                                                              )}
                                                            >
                                                              <div className="space-y-3 text-left">
                                                                <div className="flex items-center justify-between">
                                                                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                                                                    <div className="w-10 h-10 rounded-[14px] bg-lime text-ink-black flex items-center justify-center group-hover:scale-110 transition-all">
                                                                      <Building2 className="w-5 h-5" />
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">FEATURE 01</span>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-lime/90">FEATURE 01</span>
                                                                  </div>
                                                                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-heading">
                                                                    <h3 className="text-base font-bold text-white group-hover:text-lime transition-colors font-heading">
                                                                      Smart Property Inventory
                                                                    </h3>
                                                                    <p className="text-xs text-slate-600 leading-relaxed">
                                                                      <p className="text-xs text-white/75 leading-relaxed">
                                                                        Keep all your property listings organised in one place, with important details and private owner information securely managed.
                                                                      </p>
                                                                    </div>

              {/* FEATURE 02 — BUYER REQUIREMENTS */}
              <div
                onClick={() => setSelectedFeature(selectedFeature === 1 ? null : 1)}
                className={clsx(
                  'group p-5 sm:p-6 rounded-[20px] bg-white/[0.06] border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                  selectedFeature === 1
                    ? 'border-lime shadow-xl -translate-y-1'
                    : 'border-white/15 hover:border-lime/60 hover:bg-white/[0.09] hover:-translate-y-1.5'
                )}
              >
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-[14px] bg-lime text-ink-black flex items-center justify-center group-hover:scale-110 transition-all">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-lime/90">FEATURE 02</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-lime transition-colors font-heading">
                    Buyer Requirements
                  </h3>
                  <p className="text-xs text-white/75 leading-relaxed">
                    Organise buyer preferences, budgets, preferred localities and property requirements without searching through old chats.
                  </p>
                </div>

                                                                          {/* FEATURE 02 — BUYER REQUIREMENTS */}
                                                                          <div
                                                                            onClick={() => setSelectedFeature(selectedFeature === 1 ? null : 1)}
                                                                            className={clsx(
                                                                              'group p-5 sm:p-6 rounded-2xl bg-white border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 shadow-2xs',
                                                                              'group p-5 sm:p-6 rounded-[20px] bg-white/[0.06] border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                                                                              selectedFeature === 1
                                                                                ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                                                                                : 'border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
                                                                                  ? 'border-lime shadow-xl ring-2 ring-lime/30 -translate-y-1'
                                                                                  : 'border-white/15 hover:border-lime/60 hover:bg-white/[0.09] hover:-translate-y-1.5'
                                                                            )}
                                                                          >
                                                                            <div className="space-y-3 text-left">
                                                                              <div className="flex items-center justify-between">
                                                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                                                                                  <div className="w-10 h-10 rounded-[14px] bg-lime text-ink-black flex items-center justify-center group-hover:scale-110 transition-all">
                                                                                    <Users className="w-5 h-5" />
                                                                                  </div>
                                                                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">FEATURE 02</span>
                                                                                  <span className="text-[10px] font-black uppercase tracking-widest text-lime/90">FEATURE 02</span>
                                                                                </div>
                                                                                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-heading">
                                                                                  <h3 className="text-base font-bold text-white group-hover:text-lime transition-colors font-heading">
                                                                                    Buyer Requirements
                                                                                  </h3>
                                                                                  <p className="text-xs text-slate-600 leading-relaxed">
                                                                                    <p className="text-xs text-white/75 leading-relaxed">
                                                                                      Organise buyer preferences, budgets, preferred localities and property requirements without searching through old chats.
                                                                                    </p>
                                                                                  </div>

              {/* FEATURE 03 — WHATSAPP ANALYZER */}
              <div
                onClick={() => setSelectedFeature(selectedFeature === 2 ? null : 2)}
                className={clsx(
                  'group p-5 sm:p-6 rounded-[20px] bg-white/[0.06] border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                  selectedFeature === 2
                    ? 'border-lime shadow-xl -translate-y-1'
                    : 'border-white/15 hover:border-lime/60 hover:bg-white/[0.09] hover:-translate-y-1.5'
                )}
              >
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-[14px] bg-lime text-ink-black flex items-center justify-center group-hover:scale-110 transition-all">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-lime/90">FEATURE 03</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-lime transition-colors font-heading">
                    WhatsApp Message Analyzer
                  </h3>
                  <p className="text-xs text-white/75 leading-relaxed">
                    Convert unstructured WhatsApp messages into structured buyer requirements and property information with AI assistance.
                  </p>
                </div>

                                                                                        {/* FEATURE 03 — WHATSAPP ANALYZER */}
                                                                                        <div
                                                                                          onClick={() => setSelectedFeature(selectedFeature === 2 ? null : 2)}
                                                                                          className={clsx(
                                                                                            'group p-5 sm:p-6 rounded-2xl bg-white border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 shadow-2xs',
                                                                                            'group p-5 sm:p-6 rounded-[20px] bg-white/[0.06] border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                                                                                            selectedFeature === 2
                                                                                              ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                                                                                              : 'border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
                                                                                                ? 'border-lime shadow-xl ring-2 ring-lime/30 -translate-y-1'
                                                                                                : 'border-white/15 hover:border-lime/60 hover:bg-white/[0.09] hover:-translate-y-1.5'
                                                                                          )}
                                                                                        >
                                                                                          <div className="space-y-3 text-left">
                                                                                            <div className="flex items-center justify-between">
                                                                                              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                                                                                                <div className="w-10 h-10 rounded-[14px] bg-lime text-ink-black flex items-center justify-center group-hover:scale-110 transition-all">
                                                                                                  <MessageSquare className="w-5 h-5" />
                                                                                                </div>
                                                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">FEATURE 03</span>
                                                                                                <span className="text-[10px] font-black uppercase tracking-widest text-lime/90">FEATURE 03</span>
                                                                                              </div>
                                                                                              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-heading">
                                                                                                <h3 className="text-base font-bold text-white group-hover:text-lime transition-colors font-heading">
                                                                                                  WhatsApp Message Analyzer
                                                                                                </h3>
                                                                                                <p className="text-xs text-slate-600 leading-relaxed">
                                                                                                  <p className="text-xs text-white/75 leading-relaxed">
                                                                                                    Convert unstructured WhatsApp messages into structured buyer requirements and property information with AI assistance.
                                                                                                  </p>
                                                                                                </div>

              {/* FEATURE 04 — INTELLIGENT MATCHING */}
              <div
                onClick={() => setSelectedFeature(selectedFeature === 3 ? null : 3)}
                className={clsx(
                  'group p-5 sm:p-6 rounded-[20px] bg-white/[0.06] border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                  selectedFeature === 3
                    ? 'border-lime shadow-xl -translate-y-1'
                    : 'border-white/15 hover:border-lime/60 hover:bg-white/[0.09] hover:-translate-y-1.5'
                )}
              >
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-[14px] bg-lime text-ink-black flex items-center justify-center group-hover:scale-110 transition-all">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-lime/90">FEATURE 04</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-lime transition-colors font-heading">
                    Intelligent Property Matching
                  </h3>
                  <p className="text-xs text-white/75 leading-relaxed">
                    Compare buyer requirements against your property inventory and understand why a property matches.
                  </p>
                </div>

                                                                                                    {/* FEATURE 04 — INTELLIGENT MATCHING */}
                                                                                                    <div
                                                                                                      onClick={() => setSelectedFeature(selectedFeature === 3 ? null : 3)}
                                                                                                      className={clsx(
                                                                                                        'group p-5 sm:p-6 rounded-2xl bg-white border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 shadow-2xs',
                                                                                                        'group p-5 sm:p-6 rounded-[20px] bg-white/[0.06] border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                                                                                                        selectedFeature === 3
                                                                                                          ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                                                                                                          : 'border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
                                                                                                            ? 'border-lime shadow-xl ring-2 ring-lime/30 -translate-y-1'
                                                                                                            : 'border-white/15 hover:border-lime/60 hover:bg-white/[0.09] hover:-translate-y-1.5'
                                                                                                      )}
                                                                                                    >
                                                                                                      <div className="space-y-3 text-left">
                                                                                                        <div className="flex items-center justify-between">
                                                                                                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                                                                                                            <div className="w-10 h-10 rounded-[14px] bg-lime text-ink-black flex items-center justify-center group-hover:scale-110 transition-all">
                                                                                                              <Sparkles className="w-5 h-5" />
                                                                                                            </div>
                                                                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">FEATURE 04</span>
                                                                                                            <span className="text-[10px] font-black uppercase tracking-widest text-lime/90">FEATURE 04</span>
                                                                                                          </div>
                                                                                                          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-heading">
                                                                                                            <h3 className="text-base font-bold text-white group-hover:text-lime transition-colors font-heading">
                                                                                                              Intelligent Property Matching
                                                                                                            </h3>
                                                                                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                                                                              <p className="text-xs text-white/75 leading-relaxed">
                                                                                                                Compare buyer requirements against your property inventory and understand why a property matches.
                                                                                                              </p>
                                                                                                            </div>

              {/* FEATURE 05 — MASKED PROPERTY FLYERS */}
              <div
                onClick={() => setSelectedFeature(selectedFeature === 4 ? null : 4)}
                className={clsx(
                  'group p-5 sm:p-6 rounded-[20px] bg-white/[0.06] border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                  selectedFeature === 4
                    ? 'border-lime shadow-xl -translate-y-1'
                    : 'border-white/15 hover:border-lime/60 hover:bg-white/[0.09] hover:-translate-y-1.5'
                )}
              >
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-[14px] bg-lime text-ink-black flex items-center justify-center group-hover:scale-110 transition-all">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-lime/90">FEATURE 05</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-lime transition-colors font-heading">
                    Masked Property Flyers
                  </h3>
                  <p className="text-xs text-white/75 leading-relaxed">
                    Create professional, agency-branded property flyers while protecting confidential owner contact information.
                  </p>
                </div>

                                                                                                                {/* FEATURE 05 — MASKED PROPERTY FLYERS */}
                                                                                                                <div
                                                                                                                  onClick={() => setSelectedFeature(selectedFeature === 4 ? null : 4)}
                                                                                                                  className={clsx(
                                                                                                                    'group p-5 sm:p-6 rounded-2xl bg-white border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 shadow-2xs',
                                                                                                                    'group p-5 sm:p-6 rounded-[20px] bg-white/[0.06] border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                                                                                                                    selectedFeature === 4
                                                                                                                      ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                                                                                                                      : 'border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
                                                                                                                        ? 'border-lime shadow-xl ring-2 ring-lime/30 -translate-y-1'
                                                                                                                        : 'border-white/15 hover:border-lime/60 hover:bg-white/[0.09] hover:-translate-y-1.5'
                                                                                                                  )}
                                                                                                                >
                                                                                                                  <div className="space-y-3 text-left">
                                                                                                                    <div className="flex items-center justify-between">
                                                                                                                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                                                                                                                        <div className="w-10 h-10 rounded-[14px] bg-lime text-ink-black flex items-center justify-center group-hover:scale-110 transition-all">
                                                                                                                          <Share2 className="w-5 h-5" />
                                                                                                                        </div>
                                                                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">FEATURE 05</span>
                                                                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-lime/90">FEATURE 05</span>
                                                                                                                      </div>
                                                                                                                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-heading">
                                                                                                                        <h3 className="text-base font-bold text-white group-hover:text-lime transition-colors font-heading">
                                                                                                                          Masked Property Flyers
                                                                                                                        </h3>
                                                                                                                        <p className="text-xs text-slate-600 leading-relaxed">
                                                                                                                          <p className="text-xs text-white/75 leading-relaxed">
                                                                                                                            Create professional, agency-branded property flyers while protecting confidential owner contact information.
                                                                                                                          </p>
                                                                                                                        </div>

              {/* FEATURE 06 — DEAL & COMMISSION TRACKING */}
              <div
                onClick={() => setSelectedFeature(selectedFeature === 5 ? null : 5)}
                className={clsx(
                  'group p-5 sm:p-6 rounded-[20px] bg-white/[0.06] border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                  selectedFeature === 5
                    ? 'border-lime shadow-xl -translate-y-1'
                    : 'border-white/15 hover:border-lime/60 hover:bg-white/[0.09] hover:-translate-y-1.5'
                )}
              >
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-[14px] bg-lime text-ink-black flex items-center justify-center group-hover:scale-110 transition-all">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-lime/90">FEATURE 06</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-lime transition-colors font-heading">
                    Deal & Commission Tracking
                  </h3>
                  <p className="text-xs text-white/75 leading-relaxed">
                    Follow opportunities through deal stages and keep track of expected and received brokerage commissions.
                  </p>
                </div>

                                                                                                                            {/* FEATURE 06 — DEAL & COMMISSION TRACKING */}
                                                                                                                            <div
                                                                                                                              onClick={() => setSelectedFeature(selectedFeature === 5 ? null : 5)}
                                                                                                                              className={clsx(
                                                                                                                                'group p-5 sm:p-6 rounded-2xl bg-white border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 shadow-2xs',
                                                                                                                                'group p-5 sm:p-6 rounded-[20px] bg-white/[0.06] border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                                                                                                                                selectedFeature === 5
                                                                                                                                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                                                                                                                                  : 'border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
                                                                                                                                    ? 'border-lime shadow-xl ring-2 ring-lime/30 -translate-y-1'
                                                                                                                                    : 'border-white/15 hover:border-lime/60 hover:bg-white/[0.09] hover:-translate-y-1.5'
                                                                                                                              )}
                                                                                                                            >
                                                                                                                              <div className="space-y-3 text-left">
                                                                                                                                <div className="flex items-center justify-between">
                                                                                                                                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                                                                                                                                    <div className="w-10 h-10 rounded-[14px] bg-lime text-ink-black flex items-center justify-center group-hover:scale-110 transition-all">
                                                                                                                                      <TrendingUp className="w-5 h-5" />
                                                                                                                                    </div>
                                                                                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">FEATURE 06</span>
                                                                                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-lime/90">FEATURE 06</span>
                                                                                                                                  </div>
                                                                                                                                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-heading">
                                                                                                                                    <h3 className="text-base font-bold text-white group-hover:text-lime transition-colors font-heading">
                                                                                                                                      Deal & Commission Tracking
                                                                                                                                    </h3>
                                                                                                                                    <p className="text-xs text-slate-600 leading-relaxed">
                                                                                                                                      <p className="text-xs text-white/75 leading-relaxed">
                                                                                                                                        Follow opportunities through deal stages and keep track of expected and received brokerage commissions.
                                                                                                                                      </p>
                                                                                                                                    </div>

                                                                                                                                    {/* Lower Mini Product Visual (Apple-Class Light Card) */}
                                                                                                                                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 shadow-2xs text-left">
                                                                                                                                      {/* Lower Mini Product Visual */}
                                                                                                                                      <div className="p-3.5 rounded-[16px] bg-surface border border-line space-y-2.5 shadow-sm text-left">
                                                                                                                                        {/* 5-Stage Miniature Pipeline Track */}
                                                                                                                                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 border-b border-slate-200/80 pb-2">
                                                                                                                                          <span className="text-slate-500">Interested</span>
                                                                                                                                          <div className="flex items-center justify-between text-[9px] font-bold text-ink-500 border-b border-line pb-2">
                                                                                                                                            <span>Interested</span>
                                                                                                                                            <span>→</span>
                                                                                                                                            <span className="text-slate-500">Shown</span>
                                                                                                                                            <span>Shown</span>
                                                                                                                                            <span>→</span>
                                                                                                                                            <span className="text-emerald-800 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                                                                                                                              <span className="text-ink-black font-extrabold bg-lime px-1.5 py-0.5 rounded-[8px]">
                                                                                                                                                Negotiation
                                                                                                                                              </span>
                                                                                                                                              <span>→</span>
                                                                                                                                              <span className="text-slate-500">Paid</span>
                                                                                                                                              <span>Paid</span>
                                                                                                                                          </div>

        {/* ========================================================= */}
        {/* SECTION 5 — FINANCIAL IMPACT (Lime-Soft Alternating)      */}
        {/* ========================================================= */}
        <section id="financial-impact" className="py-16 sm:py-24 px-4 sm:px-6 bg-lime-soft border-y border-line relative overflow-hidden">
          <div className="max-w-5xl mx-auto space-y-12 relative z-10 reveal-section">
            {/* 1. Section Header & Introduction */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center px-3 py-1 rounded-[16px] bg-lime text-ink-black text-[11px] font-black uppercase tracking-widest">
                FINANCIAL IMPACT
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink-900 font-heading tracking-tight leading-tight">
                Your Next Deal Could Be{' '}
                <span className="bg-gradient-to-r from-ink-900 via-brand-700 to-brand-600 bg-clip-text text-transparent">
                  Worth More Than You Think.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-ink-700 max-w-xl mx-auto leading-relaxed font-normal">
                Organise your opportunities, reduce missed matches and keep your brokerage pipeline moving.
              </p>
            </div>

                                                                                                                                              {/* ========================================================= */}
                                                                                                                                              {/* SECTION 5 — FINANCIAL IMPACT (COMMISSION ROI CALCULATOR)  */}
                                                                                                                                              {/* SECTION 5 — FINANCIAL IMPACT (Lime-Soft Alternating)      */}
                                                                                                                                              {/* ========================================================= */}
                                                                                                                                              <section id="financial-impact" className="py-16 sm:py-24 px-4 sm:px-6 bg-surface/50 border-y border-border/70 relative overflow-hidden">
                                                                                                                                                {/* Subtle top ambient light-ray effect */}

                                                                                                                                                <section id="financial-impact" className="py-16 sm:py-24 px-4 sm:px-6 bg-lime-soft border-y border-line relative overflow-hidden">
                                                                                                                                                  <div className="max-w-5xl mx-auto space-y-12 relative z-10">
                                                                                                                                                    {/* 1. Section Header & Introduction */}
                                                                                                                                                    <div className="text-center max-w-2xl mx-auto space-y-3">
                                                                                                                                                      <span className="inline-block text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-500">
                                                                                                                                                        <span className="inline-flex items-center px-3 py-1 rounded-[16px] bg-lime text-ink-black text-[11px] font-black uppercase tracking-widest">
                                                                                                                                                          FINANCIAL IMPACT
                                                                                                                                                        </span>
                                                                                                                                                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink font-heading tracking-tight leading-tight">
                                                                                                                                                          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink-900 font-heading tracking-tight leading-tight">
                                                                                                                                                            Your Next Deal Could Be{' '}
                                                                                                                                                            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                                                                                                                                                              <span className="text-brand-600 underline decoration-lime decoration-4 underline-offset-4">
                                                                                                                                                                Worth More Than You Think.
                                                                                                                                                              </span>
                                                                                                                                                          </h2>
                                                                                                                                                          <p className="text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed font-normal">
                                                                                                                                                            <p className="text-sm sm:text-base text-ink-700 max-w-xl mx-auto leading-relaxed font-normal">
                                                                                                                                                              Organise your opportunities, reduce missed matches and keep your brokerage pipeline moving.
                                                                                                                                                            </p>
                                                                                                                                                          </div>

                                                                                                                                                          {/* 2. Interactive Financial Dashboard (Two-Column Layout) */}
                                                                                                                                                          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-emerald-950/5 overflow-hidden">
                                                                                                                                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                                                                                                                                                              <div className="rounded-[20px] bg-surface border border-line shadow-xl shadow-ink-black/5 overflow-hidden">
                                                                                                                                                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-line">

                                                                                                                                                                  {/* LEFT COLUMN: Financial Assumptions & Controls (7 Cols on desktop) */}
                                                                                                                                                                  <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 space-y-7 text-left">
                                                                                                                                                                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                                                                                                                                                                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading flex items-center gap-2">
                                                                                                                                                                        <Calculator className="w-4 h-4 text-emerald-600" />
                                                                                                                                                                        <div className="flex items-center justify-between border-b border-line pb-3">
                                                                                                                                                                          <h3 className="text-sm font-black uppercase tracking-wider text-ink-900 font-heading flex items-center gap-2">
                                                                                                                                                                            <Calculator className="w-4 h-4 text-brand-600" />
                                                                                                                                                                            Brokerage Assumptions
                                                                                                                                                                          </h3>
                                                                                                                                                                          <span className="text-[11px] font-semibold text-slate-500">
                                                                                                                                                                            <span className="text-[11px] font-semibold text-ink-500">
                                                                                                                                                                              Adjust variables in real time
                                                                                                                                                                            </span>
                                                                                                                                                                        </div>

                                                                                                                                                                        {/* INPUT 01 — PROPERTY DEAL VALUE */}
                                                                                                                                                                        <div className="space-y-3.5">
                                                                                                                                                                          <div className="flex justify-between items-baseline">
                                                                                                                                                                            <label htmlFor="deal-value-slider" className="text-xs font-bold text-slate-900">
                                                                                                                                                                              <label htmlFor="deal-value-slider" className="text-xs font-bold text-ink-900">
                                                                                                                                                                                Property Deal Value
                                                                                                                                                                              </label>
                                                                                                                                                                              <div className="flex items-baseline gap-1">
                                                                                                                                                                                <span className="text-lg sm:text-xl font-black text-emerald-700 font-mono">
                                                                                                                                                                                  <span className="text-lg sm:text-xl font-black text-brand-700 font-mono">
                                                                                                                                                                                    {formatINR(dealValueRupees)}
                                                                                                                                                                                  </span>
                                                                                                                                                                              </div>
                                                                                                                                                                          </div>

                                                                                                                                                                          {/* Suggested Shortcuts (Touch-Friendly min 44px) */}
                                                                                                                                                                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                                                                                                                                                            {[
                                                                                                                                                                              { label: '₹45 Lakh', val: 4500000 },
                                                                                                                                                                              { label: '₹75 Lakh', val: 7500000 },
                                                                                                                                                                              { label: '₹1.5 Crore', val: 15000000 },
                                                                                                                                                                            ].map((pill) => (
                                                                                                                                                                              <button
                                                                                                                                                                                key={pill.val}
                                                                                                                                                                                type="button"
                                                                                                                                                                                onClick={() => setDealValueRupees(pill.val)}
                                                                                                                                                                                className={clsx(
                                                                                                                                                                                  'flex-1 min-w-[90px] py-2 px-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-2xs min-h-[44px] flex items-center justify-center active:scale-95',
                                                                                                                                                                                  'flex-1 min-w-[90px] py-2 px-3 text-xs font-bold rounded-[16px] transition-all duration-200 cursor-pointer shadow-2xs min-h-[44px] flex items-center justify-center active:scale-95',
                                                                                                                                                                                  dealValueRupees === pill.val
                                                                                                                                                                                    ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-500/30 font-extrabold'
                                                                                                                                                                                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-emerald-500/50 hover:text-slate-900'
                                                                                                                                                                                      ? 'bg-ink-black text-lime shadow-xs font-extrabold'
                                                                                                                                                                                      : 'bg-cream text-ink-700 border border-line hover:border-brand-600/50 hover:text-ink-900'
                                                                                                                                                                                )}
                                                                                                                                                                              >
                                                                                                                                                                                {pill.label}
                                                                                                                                                                              </button>
                                                                                                                                                                            ))}
                                                                                                                                                                          </div>

                                                                                                                                                                          {/* Range Slider */}
                                                                                                                                                                          <div className="space-y-1.5 pt-1">
                                                                                                                                                                            <input
                                                                                                                                                                              id="deal-value-slider"
                                                                                                                                                                              type="range"
                                                                                                                                                                              min="2000000"
                                                                                                                                                                              max="30000000"
                                                                                                                                                                              step="500000"
                                                                                                                                                                              value={dealValueRupees}
                                                                                                                                                                              onChange={(e) => setDealValueRupees(Number(e.target.value))}
                                                                                                                                                                              className="w-full accent-emerald-600 h-2.5 bg-slate-200 rounded-lg cursor-pointer transition-all touch-none"
                                                                                                                                                                              className="w-full accent-brand-600 h-2.5 bg-line rounded-lg cursor-pointer transition-all touch-none"
                                                                                                                                                                              aria-label="Property Deal Value Slider"
                                                                                                                                                                            />
                                                                                                                                                                            <div className="flex justify-between text-[10px] font-medium text-slate-500">
                                                                                                                                                                              <div className="flex justify-between text-[10px] font-medium text-ink-500">
                                                                                                                                                                                <span>₹20 Lakh</span>
                                                                                                                                                                                <span>₹1.5 Crore</span>
                                                                                                                                                                                <span>₹3 Crore</span>
                                                                                                                                                                              </div>
                                                                                                                                                                            </div>
                                                                                                                                                                          </div>

                                                                                                                                                                          {/* INPUT 02 — COMMISSION PERCENTAGE */}
                                                                                                                                                                          <div className="space-y-3.5">
                                                                                                                                                                            <div className="flex justify-between items-baseline">
                                                                                                                                                                              <span className="text-xs font-bold text-slate-900">
                                                                                                                                                                                Commission Percentage
                                                                                                                                                                              </span>
                                                                                                                                                                              <span className="text-base font-black text-amber-700 font-mono">
                                                                                                                                                                                {commissionRate}%
                                                                                                                                                                              </span>
                                                                                                                                                                            </div>

                                                                                                                                                                            {/* Premium Segmented Controls (Touch-Friendly min 44px) */}
                                                                                                                                                                            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
                                                                                                                                                                              {/* Segmented Controls (Touch-Friendly min 44px) */}
                                                                                                                                                                              <div className="grid grid-cols-3 gap-2 p-1 rounded-[16px] bg-cream border border-line">
                                                                                                                                                                                {[1.0, 1.5, 2.0].map((rate) => (
                                                                                                                                                                                  <button
                                                                                                                                                                                    key={rate}
                                                                                                                                                                                    type="button"
                                                                                                                                                                                    onClick={() => setCommissionRate(rate)}
                                                                                                                                                                                    className={clsx(
                                                                                                                                                                                      'py-2.5 text-xs font-extrabold rounded-lg transition-all duration-200 cursor-pointer text-center min-h-[44px] flex items-center justify-center active:scale-95',
                                                                                                                                                                                      'py-2.5 text-xs font-extrabold rounded-[12px] transition-all duration-200 cursor-pointer text-center min-h-[44px] flex items-center justify-center active:scale-95',
                                                                                                                                                                                      commissionRate === rate
                                                                                                                                                                                        ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-emerald-500/40 font-black'
                                                                                                                                                                                        : 'text-slate-600 hover:text-slate-900'
                                                                                                                                                                                          ? 'bg-ink-black text-lime shadow-xs font-black'
                                                                                                                                                                                          : 'text-ink-700 hover:text-ink-900'
                                                                                                                                                                                    )}
                                                                                                                                                                                  >
                                                                                                                                                                                    {rate}%
                                                                                                                                                                                  </button>
                                                                                                                                                                                ))}
                                                                                                                                                                              </div>
                                                                                                                                                                            </div>

                                                                                                                                                                            {/* INPUT 03 — MONTHLY DEALS CLOSED */}
                                                                                                                                                                            <div className="space-y-3.5">
                                                                                                                                                                              <div className="flex justify-between items-baseline">
                                                                                                                                                                                <label htmlFor="deals-closed-slider" className="text-xs font-bold text-slate-900">
                                                                                                                                                                                  <label htmlFor="deals-closed-slider" className="text-xs font-bold text-ink-900">
                                                                                                                                                                                    Monthly Deals Closed
                                                                                                                                                                                  </label>
                                                                                                                                                                                  <span className="text-base font-black text-slate-900 font-mono">
                                                                                                                                                                                    <span className="text-base font-black text-ink-900 font-mono">
                                                                                                                                                                                      {monthlyDealsCount} {monthlyDealsCount === 1 ? 'deal' : 'deals'} / month
                                                                                                                                                                                    </span>
                                                                                                                                                                                  </div>

                                                                                                                                                                                  <div className="space-y-1.5">
                                                                                                                                                                                    <input
                                                                                                                                                                                      id="deals-closed-slider"
                                                                                                                                                                                      type="range"
                                                                                                                                                                                      min="1"
                                                                                                                                                                                      max="10"
                                                                                                                                                                                      step="1"
                                                                                                                                                                                      value={monthlyDealsCount}
                                                                                                                                                                                      onChange={(e) => setMonthlyDealsCount(Number(e.target.value))}
                                                                                                                                                                                      className="w-full accent-emerald-600 h-2.5 bg-slate-200 rounded-lg cursor-pointer transition-all touch-none"
                                                                                                                                                                                      className="w-full accent-brand-600 h-2.5 bg-line rounded-lg cursor-pointer transition-all touch-none"
                                                                                                                                                                                      aria-label="Monthly Deals Closed Slider"
                                                                                                                                                                                    />
                                                                                                                                                                                    <div className="flex justify-between text-[10px] font-medium text-slate-500">
                                                                                                                                                                                      <div className="flex justify-between text-[10px] font-medium text-ink-500">
                                                                                                                                                                                        <span>1 deal/month</span>
                                                                                                                                                                                        <span>5 deals/month</span>
                                                                                                                                                                                        <span>10 deals/month</span>
                                                                                                                                                                                      </div>
                                                                                                                                                                                    </div>
                                                                                                                                                                                  </div>
                                                                                                                                                                              </div>

                                                                                                                                                                              {/* RIGHT COLUMN: Calculated Commission Results (5 Cols on desktop) */}
                                                                                                                                                                              <div className="lg:col-span-5 p-5 sm:p-8 lg:p-10 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-slate-900/5 text-left flex flex-col justify-between space-y-7">
                                                                                                                                                                                <div className="lg:col-span-5 p-5 sm:p-8 lg:p-10 bg-cream/70 text-left flex flex-col justify-between space-y-7">

                                                                                                                                                                                  <div className="space-y-6">
                                                                                                                                                                                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                                                                                                                                                                                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-300">
                                                                                                                                                                                        <div className="flex items-center justify-between border-b border-line pb-3">
                                                                                                                                                                                          <span className="text-[10px] font-black uppercase tracking-widest text-ink-900">
                                                                                                                                                                                            PROJECTION SUMMARY
                                                                                                                                                                                          </span>
                                                                                                                                                                                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                                                                                                                                                                                            <span className="text-[10px] px-2.5 py-0.5 rounded-[16px] bg-lime text-ink-black font-bold">
                                                                                                                                                                                              Live Calculation
                                                                                                                                                                                            </span>
                                                                                                                                                                                        </div>

                                                                                                                                                                                        {/* RESULT 01: Estimated Commission Per Deal */}
                                                                                                                                                                                        <div className="space-y-1">
                                                                                                                                                                                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted block">
                                                                                                                                                                                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-ink-500 block">
                                                                                                                                                                                              ESTIMATED COMMISSION PER DEAL
                                                                                                                                                                                            </span>
                                                                                                                                                                                            <div className="text-2xl sm:text-3xl font-black text-ink font-heading tracking-tight">
                                                                                                                                                                                              <div className="text-2xl sm:text-3xl font-black text-ink-900 font-heading tracking-tight">
                                                                                                                                                                                                {formatINR(commissionPerDeal)}
                                                                                                                                                                                              </div>
                                                                                                                                                                                            </div>

                                                                                                                                                                                            {/* RESULT 02: Estimated Monthly Commission (Most Prominent) */}
                                                                                                                                                                                            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-emerald-500/40 shadow-lg shadow-emerald-500/5 space-y-1 relative overflow-hidden">
                                                                                                                                                                                              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                                                                                                                                                                                              <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                                                                                                                                                                                <div className="p-4 sm:p-5 rounded-[18px] bg-lime-soft border border-line space-y-1 relative overflow-hidden">
                                                                                                                                                                                                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-brand-700">
                                                                                                                                                                                                    <TrendingUp className="w-3.5 h-3.5" />
                                                                                                                                                                                                    ESTIMATED MONTHLY COMMISSION
                                                                                                                                                                                                  </div>
                                                                                                                                                                                                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 dark:text-emerald-400 font-heading tracking-tight drop-shadow-2xs">
                                                                                                                                                                                                    <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink-900 font-heading tracking-tight">
                                                                                                                                                                                                      {formatINR(monthlyCommission)}
                                                                                                                                                                                                    </div>
                                                                                                                                                                                                    <p className="text-[11px] text-muted font-medium pt-0.5">
                                                                                                                                                                                                      <p className="text-[11px] text-ink-700 font-medium pt-0.5">
                                                                                                                                                                                                        Calculated across {monthlyDealsCount} deal{monthlyDealsCount > 1 ? 's' : ''} / month at {commissionRate}% brokerage
                                                                                                                                                                                                      </p>
                                                                                                                                                                                                  </div>

                                                                                                                                                                                                  {/* RESULT 03: Projected Annual Brokerage */}
                                                                                                                                                                                                  <div className="space-y-1">
                                                                                                                                                                                                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted block">
                                                                                                                                                                                                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-ink-500 block">
                                                                                                                                                                                                        PROJECTED ANNUAL BROKERAGE
                                                                                                                                                                                                      </span>
                                                                                                                                                                                                      <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 font-heading">
                                                                                                                                                                                                        <div className="text-xl sm:text-2xl font-black text-brand-700 font-heading">
                                                                                                                                                                                                          {formatINR(annualCommission)}{' '}
                                                                                                                                                                                                          <span className="text-xs font-semibold text-muted font-sans">/ year</span>
                                                                                                                                                                                                          <span className="text-xs font-semibold text-ink-500 font-sans">/ year</span>
                                                                                                                                                                                                        </div>
                                                                                                                                                                                                      </div>

                                                                                                                                                                                                      {/* 8. Financial Visualization: Velocity Scale (Apple-Class Light Card) */}
                                                                                                                                                                                                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 space-y-2.5 shadow-2xs">
                                                                                                                                                                                                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                                                                                                                                                                                                          {/* 8. Financial Visualization: Velocity Scale */}
                                                                                                                                                                                                          <div className="p-4 rounded-[16px] bg-surface border border-line text-ink-900 space-y-2.5 shadow-2xs">
                                                                                                                                                                                                            <div className="flex items-center justify-between text-[10px] font-bold text-ink-700">
                                                                                                                                                                                                              <span className="flex items-center gap-1">
                                                                                                                                                                                                                <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                                                                                                                                                                                                                <BarChart3 className="w-3.5 h-3.5 text-brand-700" />
                                                                                                                                                                                                                Commission Scale Progression
                                                                                                                                                                                                              </span>
                                                                                                                                                                                                              <span className="text-emerald-700 font-mono text-[9px] font-bold">
                                                                                                                                                                                                                <span className="text-brand-700 font-mono text-[9px] font-bold">
                                                                                                                                                                                                                  1 Deal → Monthly → Annual
                                                                                                                                                                                                                </span>
                                                                                                                                                                                                            </div>

                                                                                                                                                                                                            {/* Proportional visual bars */}
                                                                                                                                                                                                            <div className="space-y-2 text-[10px]">
                                                                                                                                                                                                              {/* 1 Deal */}
                                                                                                                                                                                                              <div className="space-y-0.5">
                                                                                                                                                                                                                <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                                                                                                                                                                                                                  <div className="flex justify-between text-[9px] text-ink-500 font-medium">
                                                                                                                                                                                                                    <span>1 Deal ({commissionRate}%)</span>
                                                                                                                                                                                                                    <span className="font-mono text-slate-800 font-bold">{formatINR(commissionPerDeal)}</span>
                                                                                                                                                                                                                    <span className="font-mono text-ink-900 font-bold">{formatINR(commissionPerDeal)}</span>
                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                                                                                                                                                                                    <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                                                                                                                                                                                                                      <div
                                                                                                                                                                                                                        className="h-full bg-slate-400 rounded-full transition-all duration-300"
                                                                                                                                                                                                                        className="h-full bg-ink-500 rounded-full transition-all duration-300"
                                                                                                                                                                                                                        style={{ width: `${Math.max(6, Math.min(100, (commissionPerDeal / annualCommission) * 100))}%` }}
                                                                                                                                                                                                                      />
                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                  </div>

                                                                                                                                                                                                                  {/* Monthly */}
                                                                                                                                                                                                                  <div className="space-y-0.5">
                                                                                                                                                                                                                    <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                                                                                                                                                                                                                      <div className="flex justify-between text-[9px] text-ink-500 font-medium">
                                                                                                                                                                                                                        <span>Monthly ({monthlyDealsCount} Deals)</span>
                                                                                                                                                                                                                        <span className="font-mono text-emerald-700 font-bold">{formatINR(monthlyCommission)}</span>
                                                                                                                                                                                                                        <span className="font-mono text-brand-700 font-bold">{formatINR(monthlyCommission)}</span>
                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                                                                                                                                                                                        <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                                                                                                                                                                                                                          <div
                                                                                                                                                                                                                            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                                                                                                                                                                                                                            className="h-full bg-brand-600 rounded-full transition-all duration-300"
                                                                                                                                                                                                                            style={{ width: `${Math.max(12, Math.min(100, (monthlyCommission / annualCommission) * 100))}%` }}
                                                                                                                                                                                                                          />
                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                      </div>

        {/* ========================================================= */}
        {/* BROKER CALCULATOR TOOLKIT SPOTLIGHT SECTION (Cream)       */}
        {/* ========================================================= */}
        <section id="broker-toolkit" className="py-16 sm:py-20 px-4 sm:px-6 bg-cream w-full text-center relative overflow-hidden">
          <div className="max-w-5xl mx-auto space-y-10 reveal-section">
            <div className="max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center px-3 py-1 rounded-[16px] bg-lime text-ink-black text-[11px] font-black uppercase tracking-widest">
                ESSENTIAL UTILITIES
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink-900 font-heading tracking-tight leading-tight">
                Broker Calculator{' '}
                <span className="bg-gradient-to-r from-ink-900 via-brand-700 to-brand-600 bg-clip-text text-transparent">
                  Toolkit
                </span>
              </h2>
              <p className="text-sm sm:text-base text-ink-700 max-w-xl mx-auto leading-relaxed font-normal">
                Access essential property calculators, including Area Conversion, Registry Charges, Home Loan EMI, and more — all in one place.
              </p>
            </div>

                                                                                                                                                                                                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                                                                                                                                                                                                                            <Link
                                                                                                                                                                                                                              to="/app/tools/area"
                                                                                                                                                                                                                              className="p-5 rounded-[20px] bg-surface border border-line shadow-2xs hover:border-brand-600/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 space-y-3 group cursor-pointer block"
                                                                                                                                                                                                                            >
                                                                                                                                                                                                                              <div className="w-10 h-10 rounded-[14px] bg-lime-soft text-brand-700 flex items-center justify-center font-bold group-hover:scale-105 group-hover:bg-ink-black group-hover:text-lime transition-all">
                                                                                                                                                                                                                                <Maximize2 className="w-5 h-5 stroke-[2.2]" />
                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                              <h3 className="text-base font-bold text-ink-900 font-heading group-hover:text-brand-700 transition">
                                                                                                                                                                                                                                Area Unit Converter
                                                                                                                                                                                                                              </h3>
                                                                                                                                                                                                                              <p className="text-xs text-ink-700 leading-relaxed">
                                                                                                                                                                                                                                Convert Gaj, Marla (25 / 30.25 local standard), Biswa, Bigha, Kanal, and Sq. Feet instantly for north Indian registries.
                                                                                                                                                                                                                              </p>
                                                                                                                                                                                                                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 group-hover:underline pt-1">
                                                                                                                                                                                                                                Open Converter →
                                                                                                                                                                                                                              </span>
                                                                                                                                                                                                                            </Link>

                                                                                                                                                                                                                            <Link
                                                                                                                                                                                                                              to="/app/tools/registry"
                                                                                                                                                                                                                              className="p-5 rounded-[20px] bg-surface border border-line shadow-2xs hover:border-brand-600/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 space-y-3 group cursor-pointer block"
                                                                                                                                                                                                                            >
                                                                                                                                                                                                                              <div className="w-10 h-10 rounded-[14px] bg-lime-soft text-brand-700 flex items-center justify-center font-bold group-hover:scale-105 group-hover:bg-ink-black group-hover:text-lime transition-all">
                                                                                                                                                                                                                                <Building2 className="w-5 h-5 stroke-[2.2]" />
                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                              <h3 className="text-base font-bold text-ink-900 font-heading group-hover:text-brand-700 transition">
                                                                                                                                                                                                                                Registry & Stamp Duty
                                                                                                                                                                                                                              </h3>
                                                                                                                                                                                                                              <p className="text-xs text-ink-700 leading-relaxed">
                                                                                                                                                                                                                                Estimate official Haryana & Punjab circle rates, male (7%), female (5%), and joint registration charges with zero manual math.
                                                                                                                                                                                                                              </p>
                                                                                                                                                                                                                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 group-hover:underline pt-1">
                                                                                                                                                                                                                                Estimate Registry Fees →
                                                                                                                                                                                                                              </span>
                                                                                                                                                                                                                            </Link>

                                                                                                                                                                                                                            <Link
                                                                                                                                                                                                                              to="/app/tools/emi"
                                                                                                                                                                                                                              className="p-5 rounded-[20px] bg-surface border border-line shadow-2xs hover:border-brand-600/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 space-y-3 group cursor-pointer block"
                                                                                                                                                                                                                            >
                                                                                                                                                                                                                              <div className="w-10 h-10 rounded-[14px] bg-lime-soft text-brand-700 flex items-center justify-center font-bold group-hover:scale-105 group-hover:bg-ink-black group-hover:text-lime transition-all">
                                                                                                                                                                                                                                <Calculator className="w-5 h-5 stroke-[2.2]" />
                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                              <h3 className="text-base font-bold text-ink-900 font-heading group-hover:text-brand-700 transition">
                                                                                                                                                                                                                                Home Loan EMI
                                                                                                                                                                                                                              </h3>
                                                                                                                                                                                                                              <p className="text-xs text-ink-700 leading-relaxed">
                                                                                                                                                                                                                                Calculate accurate monthly EMI, principal-interest breakdown, and client eligibility for instant WhatsApp deal quotes.
                                                                                                                                                                                                                              </p>
                                                                                                                                                                                                                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 group-hover:underline pt-1">
                                                                                                                                                                                                                                Calculate Loan EMI →
                                                                                                                                                                                                                              </span>
                                                                                                                                                                                                                            </Link>

                                                                                                                                                                                                                            <Link
                                                                                                                                                                                                                              to="/app/tools/commission"
                                                                                                                                                                                                                              className="p-5 rounded-[20px] bg-surface border border-line shadow-2xs hover:border-brand-600/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 space-y-3 group cursor-pointer block"
                                                                                                                                                                                                                            >
                                                                                                                                                                                                                              <div className="w-10 h-10 rounded-[14px] bg-lime-soft text-brand-700 flex items-center justify-center font-bold group-hover:scale-105 group-hover:bg-ink-black group-hover:text-lime transition-all">
                                                                                                                                                                                                                                <TrendingUp className="w-5 h-5 stroke-[2.2]" />
                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                              <h3 className="text-base font-bold text-ink-900 font-heading group-hover:text-brand-700 transition">
                                                                                                                                                                                                                                Commission Split
                                                                                                                                                                                                                              </h3>
                                                                                                                                                                                                                              <p className="text-xs text-ink-700 leading-relaxed">
                                                                                                                                                                                                                                Compute 1% - 2% brokerage, agent agency share, and 50/50 co-broker splits with clean, shareable settlement sheets.
                                                                                                                                                                                                                              </p>
                                                                                                                                                                                                                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 group-hover:underline pt-1">
                                                                                                                                                                                                                                Split Commission →
                                                                                                                                                                                                                              </span>
                                                                                                                                                                                                                            </Link>
                                                                                                                                                                                                                          </div>

                                                                                                                                                                                                                          <Link
                                                                                                                                                                                                                            to="/app/tools/emi"
                                                                                                                                                                                                                            className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-500/50 hover:shadow-lg transition-all space-y-3 group cursor-pointer block"
                                                                                                                                                                                                                            className="p-5 rounded-[20px] bg-surface border border-line shadow-2xs hover:border-brand-600/50 hover:shadow-lg transition-all space-y-3 group cursor-pointer block"
                                                                                                                                                                                                                          >
                                                                                                                                                                                                                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                                                                                                                                                                                                                              <div className="w-10 h-10 rounded-[14px] bg-lime-soft text-brand-700 flex items-center justify-center font-bold group-hover:scale-105 group-hover:bg-ink-black group-hover:text-lime transition-all">
                                                                                                                                                                                                                                <Calculator className="w-5 h-5 stroke-[2.2]" />
                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                              <h3 className="text-base font-bold text-slate-900 font-heading group-hover:text-emerald-700 transition">
                                                                                                                                                                                                                                <h3 className="text-base font-bold text-ink-900 font-heading group-hover:text-brand-700 transition">
                                                                                                                                                                                                                                  Home Loan EMI
                                                                                                                                                                                                                                </h3>
                                                                                                                                                                                                                                <p className="text-xs text-muted leading-relaxed">
                                                                                                                                                                                                                                  <p className="text-xs text-ink-700 leading-relaxed">
                                                                                                                                                                                                                                    Calculate accurate monthly EMI, principal-interest breakdown, and client eligibility for instant WhatsApp deal quotes.
                                                                                                                                                                                                                                  </p>
                                                                                                                                                                                                                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:underline pt-1">
                                                                                                                                                                                                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 group-hover:underline pt-1">
                                                                                                                                                                                                                                      Calculate Loan EMI →
                                                                                                                                                                                                                                    </span>
                                                                                                                                                                                                                                  </Link>

                                                                                                                                                                                                                                  {/* ========================================================= */}
                                                                                                                                                                                                                                  {/* SECTION 6 — PRICING (Lime-Soft Alternating)               */}
                                                                                                                                                                                                                                  {/* ========================================================= */}
                                                                                                                                                                                                                                  <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 bg-lime-soft border-y border-line w-full relative overflow-hidden">
                                                                                                                                                                                                                                    <div className="relative z-10 max-w-5xl mx-auto reveal-section">
                                                                                                                                                                                                                                      <PricingSection showTitle={true} />
                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                  </section>

        {/* ========================================================= */}
        {/* SECTION 7 — WHY CHOOSE LeadNivash? (Cream Surface)        */}
        {/* ========================================================= */}
        <section id="why-leadnivash" className="py-16 sm:py-24 px-4 sm:px-6 bg-cream relative overflow-hidden">
          <div className="max-w-6xl mx-auto space-y-12 relative z-10 reveal-section">
            {/* Section Introduction */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center px-3 py-1 rounded-[16px] bg-lime text-ink-black text-[11px] font-black uppercase tracking-widest">
                Why LeadNivash
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink-900 font-heading tracking-tight leading-tight">
                Built Around the Way Property Brokers{' '}
                <span className="bg-gradient-to-r from-ink-900 via-brand-700 to-brand-600 bg-clip-text text-transparent">
                  Actually Work.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-ink-700 max-w-xl mx-auto leading-relaxed font-normal">
                LeadNivash helps you organise property enquiries, find relevant matches, protect business relationships, and keep deals moving — all without depending on scattered WhatsApp messages and manual tracking.
              </p>
            </div>

                                                                                                                                                                                                                                      {/* ========================================================= */}
                                                                                                                                                                                                                                      {/* SECTION 6 — PRICING (TRANSPARENT INVESTMENT)              */}
                                                                                                                                                                                                                                      {/* SECTION 6 — PRICING (Lime-Soft Alternating)               */}
                                                                                                                                                                                                                                      {/* ========================================================= */}
                                                                                                                                                                                                                                      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto w-full relative overflow-hidden">
                                                                                                                                                                                                                                        {/* Subtle top ambient light-ray effect */}

                                                                                                                                                                                                                                        <div className="relative z-10">
                                                                                                                                                                                                                                          <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 bg-lime-soft border-y border-line w-full relative overflow-hidden">
                                                                                                                                                                                                                                            <div className="relative z-10 max-w-5xl mx-auto">
                                                                                                                                                                                                                                              <PricingSection showTitle={true} />
                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                          </section>

                                                                                                                                                                                                                                          {/* ========================================================= */}
                                                                                                                                                                                                                                          {/* SECTION 7 — WHY CHOOSE LeadNivash?                        */}
                                                                                                                                                                                                                                          {/* SECTION 7 — WHY CHOOSE LeadNivash? (Cream Surface)        */}
                                                                                                                                                                                                                                          {/* ========================================================= */}
                                                                                                                                                                                                                                          <section id="why-leadnivash" className="py-16 sm:py-24 px-4 sm:px-6 bg-surface/50 border-y border-border/70 relative overflow-hidden">
                                                                                                                                                                                                                                            {/* Subtle top ambient emerald sunrise / radial light effect */}

                                                                                                                                                                                                                                            <section id="why-leadnivash" className="py-16 sm:py-24 px-4 sm:px-6 bg-cream relative overflow-hidden">
                                                                                                                                                                                                                                              <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                                                                                                                                                                                                                                                {/* Section Introduction */}
                                                                                                                                                                                                                                                <div className="text-center max-w-2xl mx-auto space-y-3">
                                                                                                                                                                                                                                                  <span className="inline-block text-[11px] font-black tracking-widest text-emerald-700 dark:text-emerald-500">
                                                                                                                                                                                                                                                    <span className="inline-flex items-center px-3 py-1 rounded-[16px] bg-lime text-ink-black text-[11px] font-black uppercase tracking-widest">
                                                                                                                                                                                                                                                      Why LeadNivash
                                                                                                                                                                                                                                                    </span>
                                                                                                                                                                                                                                                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink font-heading tracking-tight leading-tight">
                                                                                                                                                                                                                                                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink-900 font-heading tracking-tight leading-tight">
                                                                                                                                                                                                                                                        Built Around the Way Property Brokers{' '}
                                                                                                                                                                                                                                                        <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                                                                                                                                                                                                                                                          <span className="text-brand-600 underline decoration-lime decoration-4 underline-offset-4">
                                                                                                                                                                                                                                                            Actually Work.
                                                                                                                                                                                                                                                          </span>
                                                                                                                                                                                                                                                      </h2>
                                                                                                                                                                                                                                                      <p className="text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed font-normal">
                                                                                                                                                                                                                                                        <p className="text-sm sm:text-base text-ink-700 max-w-xl mx-auto leading-relaxed font-normal">
                                                                                                                                                                                                                                                          LeadNivash helps you organise property enquiries, find relevant matches, protect business relationships, and keep deals moving — all without depending on scattered WhatsApp messages and manual tracking.
                                                                                                                                                                                                                                                        </p>
                                                                                                                                                                                                                                                      </div>

                                                                                                                                                                                                                                                      {/* 3 Primary Reason Feature Panels */}
                                                                                                                                                                                                                                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch text-left">

                                                                                                                                                                                                                                                        {/* CARD 1 — NEVER LOSE A MATCH */}
                                                                                                                                                                                                                                                        <div className="group rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300 shadow-2xs">
                                                                                                                                                                                                                                                          <div className="group rounded-[20px] bg-surface border border-line p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-brand-600/40 hover:shadow-xl hover:shadow-ink-black/5 hover:-translate-y-1.5 transition-all duration-300 shadow-2xs">
                                                                                                                                                                                                                                                            <div className="space-y-4">
                                                                                                                                                                                                                                                              <div className="flex items-center justify-between">
                                                                                                                                                                                                                                                                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                                                                                                                                                                                                                                  <div className="w-11 h-11 rounded-[16px] bg-lime-soft text-brand-700 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 group-hover:bg-ink-black group-hover:text-lime transition-all">
                                                                                                                                                                                                                                                                    <Search className="w-5 h-5 stroke-[2.2]" />
                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                                                                                                                                                                                                                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-ink-500">
                                                                                                                                                                                                                                                                      REASON 01
                                                                                                                                                                                                                                                                    </span>
                                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                                <div className="space-y-1.5">
                                                                                                                                                                                                                                                                  <h3 className="text-lg font-bold text-slate-900 font-heading group-hover:text-emerald-700 transition-colors">
                                                                                                                                                                                                                                                                    <h3 className="text-lg font-bold text-ink-900 font-heading group-hover:text-brand-700 transition-colors">
                                                                                                                                                                                                                                                                      Never Lose a Match
                                                                                                                                                                                                                                                                    </h3>
                                                                                                                                                                                                                                                                    <p className="text-xs font-semibold text-emerald-700">
                                                                                                                                                                                                                                                                      <p className="text-xs font-semibold text-brand-700">
                                                                                                                                                                                                                                                                        Keep buyer requirements and property inventory organised so relevant opportunities are easier to identify.
                                                                                                                                                                                                                                                                      </p>
                                                                                                                                                                                                                                                                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                                                                                                                                                                                                                                                        <p className="text-xs text-ink-700 leading-relaxed pt-1">
                                                                                                                                                                                                                                                                          Stop searching through endless conversations to remember who needs what. Keep buyer requirements and property details organised, making it easier to discover relevant property matches.
                                                                                                                                                                                                                                                                        </p>
                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                    </div>

                                                                                                                                                                                                                                                                    {/* Miniature Product-Style Illustration (Apple-Class Light Card) */}
                                                                                                                                                                                                                                                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-900 space-y-3 shadow-2xs">
                                                                                                                                                                                                                                                                      {/* Miniature Product-Style Illustration */}
                                                                                                                                                                                                                                                                      <div className="p-4 rounded-[16px] bg-cream border border-line text-ink-900 space-y-3 shadow-2xs">
                                                                                                                                                                                                                                                                        {/* Micro Buyer Requirement */}
                                                                                                                                                                                                                                                                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between shadow-2xs">
                                                                                                                                                                                                                                                                          <div className="p-2.5 rounded-[12px] bg-surface border border-line flex items-center justify-between shadow-2xs">
                                                                                                                                                                                                                                                                            <div className="flex items-center gap-2">
                                                                                                                                                                                                                                                                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center border border-emerald-300">
                                                                                                                                                                                                                                                                                <div className="w-6 h-6 rounded-full bg-lime text-ink-black text-[10px] font-black flex items-center justify-center">
                                                                                                                                                                                                                                                                                  RS
                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                <div>
                                                                                                                                                                                                                                                                                  <span className="text-[11px] font-bold text-slate-900 block">Rajesh Sharma</span>
                                                                                                                                                                                                                                                                                  <span className="text-[9px] text-slate-500 font-mono">3 BHK · Model Town · ₹1.25 Cr</span>
                                                                                                                                                                                                                                                                                  <span className="text-[11px] font-bold text-ink-900 block">Rajesh Sharma</span>
                                                                                                                                                                                                                                                                                  <span className="text-[9px] text-ink-500 font-mono">3 BHK · Model Town · ₹1.25 Cr</span>
                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                                                                                                                                                                                                                                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-[8px] bg-lime-soft text-brand-700 font-bold border border-line">
                                                                                                                                                                                                                                                                                  Buyer
                                                                                                                                                                                                                                                                                </span>
                                                                                                                                                                                                                                                                            </div>

                                                                                                                                                                                                                                                                            {/* Animated Connection Bridge */}
                                                                                                                                                                                                                                                                            <div className="flex items-center justify-center gap-2 py-0.5">
                                                                                                                                                                                                                                                                              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-emerald-500" />
                                                                                                                                                                                                                                                                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-emerald-400 text-emerald-800 text-[10px] font-extrabold shadow-2xs">
                                                                                                                                                                                                                                                                                <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                                                                                                                                                                                                                                                                                <div className="h-px flex-1 bg-line" />
                                                                                                                                                                                                                                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[16px] bg-lime text-ink-black text-[10px] font-extrabold shadow-2xs">
                                                                                                                                                                                                                                                                                  <Sparkles className="w-3 h-3 text-ink-black animate-pulse" />
                                                                                                                                                                                                                                                                                  96% Match
                                                                                                                                                                                                                                                                                </span>
                                                                                                                                                                                                                                                                                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-emerald-400/50 to-emerald-500" />
                                                                                                                                                                                                                                                                                <div className="h-px flex-1 bg-line" />
                                                                                                                                                                                                                                                                            </div>

                                                                                                                                                                                                                                                                            {/* Micro Property Listing */}
                                                                                                                                                                                                                                                                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between shadow-2xs">
                                                                                                                                                                                                                                                                              <div className="p-2.5 rounded-[12px] bg-surface border border-line flex items-center justify-between shadow-2xs">
                                                                                                                                                                                                                                                                                <div>
                                                                                                                                                                                                                                                                                  <span className="text-[11px] font-bold text-slate-900 block">Luxury Builder Floor</span>
                                                                                                                                                                                                                                                                                  <span className="text-[9px] text-slate-500 font-mono">200 Gaj · Model Town · ₹1.22 Cr</span>
                                                                                                                                                                                                                                                                                  <span className="text-[11px] font-bold text-ink-900 block">Luxury Builder Floor</span>
                                                                                                                                                                                                                                                                                  <span className="text-[9px] text-ink-500 font-mono">200 Gaj · Model Town · ₹1.22 Cr</span>
                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                                                                                                                                                                                                                                                                                  <span className="text-[9px] px-1.5 py-0.5 rounded-[8px] bg-lime-soft text-ink-700 font-bold border border-line">
                                                                                                                                                                                                                                                                                    Inventory
                                                                                                                                                                                                                                                                                  </span>
                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                          </div>

                                                                                                                                                                                                                                                                          {/* CARD 2 — PROTECT YOUR BUSINESS RELATIONSHIPS */}
                                                                                                                                                                                                                                                                          <div className="group rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300 shadow-2xs">
                                                                                                                                                                                                                                                                            <div className="group rounded-[20px] bg-surface border border-line p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-brand-600/40 hover:shadow-xl hover:shadow-ink-black/5 hover:-translate-y-1.5 transition-all duration-300 shadow-2xs">
                                                                                                                                                                                                                                                                              <div className="space-y-4">
                                                                                                                                                                                                                                                                                <div className="flex items-center justify-between">
                                                                                                                                                                                                                                                                                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                                                                                                                                                                                                                                                    <div className="w-11 h-11 rounded-[16px] bg-lime-soft text-brand-700 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 group-hover:bg-ink-black group-hover:text-lime transition-all">
                                                                                                                                                                                                                                                                                      <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                                                                                                                                                                                                                                                                                      <span className="text-[10px] font-black uppercase tracking-widest text-ink-500">
                                                                                                                                                                                                                                                                                        REASON 02
                                                                                                                                                                                                                                                                                      </span>
                                                                                                                                                                                                                                                                                  </div>

                                                                                                                                                                                                                                                                                  <div className="space-y-1.5">
                                                                                                                                                                                                                                                                                    <h3 className="text-lg font-bold text-slate-900 font-heading group-hover:text-emerald-700 transition-colors">
                                                                                                                                                                                                                                                                                      <h3 className="text-lg font-bold text-ink-900 font-heading group-hover:text-brand-700 transition-colors">
                                                                                                                                                                                                                                                                                        Protect Your Business Relationships
                                                                                                                                                                                                                                                                                      </h3>
                                                                                                                                                                                                                                                                                      <p className="text-xs font-semibold text-emerald-700">
                                                                                                                                                                                                                                                                                        <p className="text-xs font-semibold text-brand-700">
                                                                                                                                                                                                                                                                                          Share property information professionally without exposing confidential owner contact details.
                                                                                                                                                                                                                                                                                        </p>
                                                                                                                                                                                                                                                                                        <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                                                                                                                                                                                                                                                                          <p className="text-xs text-ink-700 leading-relaxed pt-1">
                                                                                                                                                                                                                                                                                            Create branded, shareable property flyers while keeping sensitive owner contact information protected. Present properties professionally and maintain control over how your business information is shared.
                                                                                                                                                                                                                                                                                          </p>
                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                      </div>

                                                                                                                                                                                                                                                                                      {/* Miniature Property Flyer Preview with Masked Owner (Apple-Class Light Card) */}
                                                                                                                                                                                                                                                                                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-900 space-y-3 shadow-2xs">
                                                                                                                                                                                                                                                                                        {/* Miniature Property Flyer Preview with Masked Owner */}
                                                                                                                                                                                                                                                                                        <div className="p-4 rounded-[16px] bg-cream border border-line text-ink-900 space-y-3 shadow-2xs">
                                                                                                                                                                                                                                                                                          {/* Agency Flyer Header */}
                                                                                                                                                                                                                                                                                          <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-slate-200/80">
                                                                                                                                                                                                                                                                                            <span className="font-bold text-emerald-700">Sharma Real Estate Agency</span>
                                                                                                                                                                                                                                                                                            <span className="text-[9px] text-slate-500">Watermarked Flyer</span>
                                                                                                                                                                                                                                                                                            <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-line">
                                                                                                                                                                                                                                                                                              <span className="font-bold text-brand-700">Sharma Real Estate Agency</span>
                                                                                                                                                                                                                                                                                              <span className="text-[9px] text-ink-500">Watermarked Flyer</span>
                                                                                                                                                                                                                                                                                            </div>

                                                                                                                                                                                                                                                                                            {/* Property Card Snippet */}
                                                                                                                                                                                                                                                                                            <div className="flex items-center gap-3">
                                                                                                                                                                                                                                                                                              <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
                                                                                                                                                                                                                                                                                                <div className="w-12 h-12 rounded-[10px] bg-surface border border-line overflow-hidden shrink-0 shadow-2xs">
                                                                                                                                                                                                                                                                                                  <img
                                                                                                                                                                                                                                                                                                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=140&auto=format&fit=crop&q=80"
                                                                                                                                                                                                                                                                                                    alt="Floor"
                                                                                                                                                                                                                                                                                                    className="w-full h-full object-cover"
                                                                                                                                                                                                                                                                                                  />
                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                <div className="flex-1 min-w-0">
                                                                                                                                                                                                                                                                                                  <span className="text-xs font-bold text-slate-900 block truncate">
                                                                                                                                                                                                                                                                                                    <span className="text-xs font-bold text-ink-900 block truncate">
                                                                                                                                                                                                                                                                                                      3 BHK Floor · Model Town
                                                                                                                                                                                                                                                                                                    </span>
                                                                                                                                                                                                                                                                                                    <span className="text-[10px] font-mono text-emerald-700 font-bold">
                                                                                                                                                                                                                                                                                                      <span className="text-[10px] font-mono text-brand-700 font-bold">
                                                                                                                                                                                                                                                                                                        Demand: ₹1.25 Cr
                                                                                                                                                                                                                                                                                                      </span>
                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                                                                {/* Masked Owner Privacy Vault Box */}
                                                                                                                                                                                                                                                                                                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-[10px] shadow-2xs">
                                                                                                                                                                                                                                                                                                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                                                                                                                                                                                                                                                                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                                                                                                                                                                                                                                                                                                    <span>Owner Contact: <span className="font-mono text-slate-500 tracking-wider">●●●●●●8210</span></span>
                                                                                                                                                                                                                                                                                                    <div className="p-2.5 rounded-[12px] bg-surface border border-line flex items-center justify-between text-[10px] shadow-2xs">
                                                                                                                                                                                                                                                                                                      <div className="flex items-center gap-1.5 text-ink-700 font-medium">
                                                                                                                                                                                                                                                                                                        <Lock className="w-3.5 h-3.5 text-warning" />
                                                                                                                                                                                                                                                                                                        <span>Owner Contact: <span className="font-mono text-ink-500 tracking-wider">●●●●●●8210</span></span>
                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                                                                                                                                                                                                                                                                                                        <span className="text-[9px] px-2 py-0.5 rounded-[16px] bg-lime text-ink-black font-bold">
                                                                                                                                                                                                                                                                                                          Protected
                                                                                                                                                                                                                                                                                                        </span>
                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                                                                {/* CARD 3 — MANAGE MORE, WORK SMARTER */}
                                                                                                                                                                                                                                                                                                <div className="group rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300 shadow-2xs">
                                                                                                                                                                                                                                                                                                  <div className="group rounded-[20px] bg-surface border border-line p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-brand-600/40 hover:shadow-xl hover:shadow-ink-black/5 hover:-translate-y-1.5 transition-all duration-300 shadow-2xs">
                                                                                                                                                                                                                                                                                                    <div className="space-y-4">
                                                                                                                                                                                                                                                                                                      <div className="flex items-center justify-between">
                                                                                                                                                                                                                                                                                                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                                                                                                                                                                                                                                                                          <div className="w-11 h-11 rounded-[16px] bg-lime-soft text-brand-700 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 group-hover:bg-ink-black group-hover:text-lime transition-all">
                                                                                                                                                                                                                                                                                                            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                                                                                                                                                                                                                                                                                                            <span className="text-[10px] font-black uppercase tracking-widest text-ink-500">
                                                                                                                                                                                                                                                                                                              REASON 03
                                                                                                                                                                                                                                                                                                            </span>
                                                                                                                                                                                                                                                                                                        </div>

                                                                                                                                                                                                                                                                                                        <div className="space-y-1.5">
                                                                                                                                                                                                                                                                                                          <h3 className="text-lg font-bold text-slate-900 font-heading group-hover:text-emerald-700 transition-colors">
                                                                                                                                                                                                                                                                                                            <h3 className="text-lg font-bold text-ink-900 font-heading group-hover:text-brand-700 transition-colors">
                                                                                                                                                                                                                                                                                                              Manage More, Work Smarter
                                                                                                                                                                                                                                                                                                            </h3>
                                                                                                                                                                                                                                                                                                            <p className="text-xs font-semibold text-emerald-700">
                                                                                                                                                                                                                                                                                                              <p className="text-xs font-semibold text-brand-700">
                                                                                                                                                                                                                                                                                                                Reduce repetitive manual work and keep deals and commissions organised.
                                                                                                                                                                                                                                                                                                              </p>
                                                                                                                                                                                                                                                                                                              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                                                                                                                                                                                                                                                                                                <p className="text-xs text-ink-700 leading-relaxed pt-1">
                                                                                                                                                                                                                                                                                                                  Spend less time manually entering information and tracking conversations. Organise properties, buyer requirements, deal progress, and commissions in one structured workflow.
                                                                                                                                                                                                                                                                                                                </p>
                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                            </div>

                                                                                                                                                                                                                                                                                                            {/* ========================================================= */}
                                                                                                                                                                                                                                                                                                            {/* SECTION 7.5 — FAQ (Lime-Soft Alternating)                 */}
                                                                                                                                                                                                                                                                                                            {/* ========================================================= */}
                                                                                                                                                                                                                                                                                                            <section id="faq-section" className="py-16 sm:py-24 px-4 sm:px-6 bg-lime-soft border-y border-line relative">
                                                                                                                                                                                                                                                                                                              <div className="max-w-5xl mx-auto reveal-section">
                                                                                                                                                                                                                                                                                                                <div className="text-center space-y-3 mb-8">
                                                                                                                                                                                                                                                                                                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[16px] bg-lime text-ink-black text-[11px] font-bold tracking-wider uppercase">
                                                                                                                                                                                                                                                                                                                    <HelpCircle className="w-3.5 h-3.5 text-ink-black" />
                                                                                                                                                                                                                                                                                                                    <span>Got Questions? We Have Answers</span>
                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                  <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-ink-900">
                                                                                                                                                                                                                                                                                                                    Frequently Asked Questions
                                                                                                                                                                                                                                                                                                                  </h2>
                                                                                                                                                                                                                                                                                                                  <p className="text-xs sm:text-sm text-ink-700 max-w-xl mx-auto">
                                                                                                                                                                                                                                                                                                                    Everything property brokers, realtors, and agency owners need to know about LeadNivash.
                                                                                                                                                                                                                                                                                                                  </p>
                                                                                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                                                                                {/* Category Filter Pills */}
                                                                                                                                                                                                                                                                                                                <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                                                                                                                                                                                                                                                                                                                  {(
                                                                                                                                                                                                                                                                                                                    [
                                                                                                                                                                                                                                                                                                                      { id: 'all', label: 'All Questions' },
                                                                                                                                                                                                                                                                                                                      { id: 'security', label: 'Privacy & Vault' },
                                                                                                                                                                                                                                                                                                                      { id: 'workflow', label: 'AI & Workflow' },
                                                                                                                                                                                                                                                                                                                      { id: 'trial', label: 'Trial & Tools' },
                                                                                                                                                                                                                                                                                                                    ] as const
                                                                                                                                                                                                                                                                                                                  ).map((cat) => (
                                                                                                                                                                                                                                                                                                                    <button
                                                                                                                                                                                                                                                                                                                      key={cat.id}
                                                                                                                                                                                                                                                                                                                      type="button"
                                                                                                                                                                                                                                                                                                                      onClick={() => {
                                                                                                                                                                                                                                                                                                                        setFaqCategory(cat.id);
                                                                                                                                                                                                                                                                                                                        setOpenFaq(0);
                                                                                                                                                                                                                                                                                                                      }}
                                                                                                                                                                                                                                                                                                                      className={clsx(
                                                                                                                                                                                                                                                                                                                        'px-4 py-2 rounded-full text-xs font-bold border transition-all duration-150 cursor-pointer min-h-[38px]',
                                                                                                                                                                                                                                                                                                                        faqCategory === cat.id
                                                                                                                                                                                                                                                                                                                          ? 'bg-lime border-ink-black text-ink-900 shadow-2xs'
                                                                                                                                                                                                                                                                                                                          : 'bg-surface border-line text-ink-700 hover:text-ink-900 hover:bg-cream'
                                                                                                                                                                                                                                                                                                                      )}
                                                                                                                                                                                                                                                                                                                    >
                                                                                                                                                                                                                                                                                                                      {cat.label}
                                                                                                                                                                                                                                                                                                                    </button>
                                                                                                                                                                                                                                                                                                                  ))}
                                                                                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                                                                                <div key={faqCategory} className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start animate-tab-fade">
                                                                                                                                                                                                                                                                                                                  {[
                                                                                                                                                                                                                                                                                                                    {
                                                                                                                                                                                                                                                                                                                      cat: 'security',
                                                                                                                                                                                                                                                                                                                      q: 'How does LeadNivash protect my client and owner data from competitors?',
                                                                                                                                                                                                                                                                                                                      a: 'Owner Vault Data Isolation guarantees that your listings, client inquiries, phone numbers, and commission agreements are strictly encrypted and visible ONLY to your authenticated account. No other broker or agency on the platform can ever view or access your private inventory.',
                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                    {
                                                                                                                                                                                                                                                                                                                      cat: 'workflow',
                                                                                                                                                                                                                                                                                                                      q: 'What is Quick Chat and how does AI requirement matching work?',
                                                                                                                                                                                                                                                                                                                      a: 'Quick Chat lets you speak or paste raw WhatsApp client messages (e.g., "3 BHK flat in Gurgaon under 1.5 Cr near Metro"). Our built-in intelligence instantly extracts budget, bedroom counts, property type, and location filters, automatically scoring and displaying genuine matching properties from your portfolio.',
                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                    {
                                                                                                                                                                                                                                                                                                                      cat: 'trial',
                                                                                                                                                                                                                                                                                                                      q: 'Can I use LeadNivash on my phone without downloading from the App Store or Play Store?',
                                                                                                                                                                                                                                                                                                                      a: 'Yes! LeadNivash is engineered as an installable Progressive Web App (PWA). Simply open leadnivash.com on Chrome (Android) or Safari (iOS) and tap "Add to Home Screen" for an instant, native full-screen app experience with offline resilience.',
                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                    {
                                                                                                                                                                                                                                                                                                                      cat: 'workflow',
                                                                                                                                                                                                                                                                                                                      q: 'Does data synchronize across my laptop and mobile phone in real time?',
                                                                                                                                                                                                                                                                                                                      a: 'Yes. Any property or buyer added or updated in the field from your mobile immediately reflects on your office desktop or tablet, powered by cloud database synchronization and strict session management.',
                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                    {
                                                                                                                                                                                                                                                                                                                      cat: 'security',
                                                                                                                                                                                                                                                                                                                      q: 'Can I share property flyers on WhatsApp without revealing the owner’s direct contact?',
                                                                                                                                                                                                                                                                                                                      a: 'Absolutely. With one click, generate Masked Marketing Flyers and shareable cards containing your agency logo, property photos, pricing, and specs while completely concealing owner phone numbers and private addresses.',
                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                    {
                                                                                                                                                                                                                                                                                                                      cat: 'trial',
                                                                                                                                                                                                                                                                                                                      q: 'What tools are included in the 14-day free trial?',
                                                                                                                                                                                                                                                                                                                      a: 'You get unrestricted access to all 4 broker utility engines: Stamp Duty & Circle Rate Calculator across major Indian states, EMI & Loan Eligibility Estimator, Commission Invoice Generator, and Land Unit Converter (Gaj, Bigha, Sq. Yd, Marla, Biswa).',
                                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                                  ]
                                                                                                                                                                                                                                                                                                                    .filter((item) => faqCategory === 'all' || item.cat === faqCategory)
                                                                                                                                                                                                                                                                                                                    .map((faq, idx) => {
                                                                                                                                                                                                                                                                                                                      const isOpen = openFaq === idx;
                                                                                                                                                                                                                                                                                                                      return (
                                                                                                                                                                                                                                                                                                                        <div
                                                                                                                                                                                                                                                                                                                          key={faq.q}
                                                                                                                                                                                                                                                                                                                          className="rounded-[16px] border border-line bg-surface shadow-2xs overflow-hidden transition-all duration-200"
                                                                                                                                                                                                                                                                                                                        >
                                                                                                                                                                                                                                                                                                                          <button
                                                                                                                                                                                                                                                                                                                            type="button"
                                                                                                                                                                                                                                                                                                                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                                                                                                                                                                                                                                                                                                                            className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-lime-soft/40 transition-colors focus:outline-none"
                                                                                                                                                                                                                                                                                                                            aria-expanded={isOpen}
                                                                                                                                                                                                                                                                                                                          >
                                                                                                                                                                                                                                                                                                                            <p className="text-sm font-bold text-ink-900 font-heading">{faq.q}</p>
                                                                                                                                                                                                                                                                                                                            <div className="shrink-0 w-8 h-8 rounded-full bg-cream border border-line flex items-center justify-center text-ink-900">
                                                                                                                                                                                                                                                                                                                              <Plus
                                                                                                                                                                                                                                                                                                                                className={clsx(
                                                                                                                                                                                                                                                                                                                                  'w-4 h-4 transition-transform duration-250',
                                                                                                                                                                                                                                                                                                                                  isOpen && 'rotate-45'
                                                                                                                                                                                                                                                                                                                                )}
                                                                                                                                                                                                                                                                                                                              />
                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                          </button>
                                                                                                                                                                                                                                                                                                                          <div
                                                                                                                                                                                                                                                                                                                            className={clsx(
                                                                                                                                                                                                                                                                                                                              'grid transition-all duration-250 ease-out',
                                                                                                                                                                                                                                                                                                                              isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                                                                                                                                                                                                                                                                                                            )}
                                                                                                                                                                                                                                                                                                                          >
                                                                                                                                                                                                                                                                                                                            <div className="overflow-hidden">
                                                                                                                                                                                                                                                                                                                              <div className="px-5 pb-4 pt-2 text-xs sm:text-sm text-ink-700 leading-relaxed border-t border-line">
                                                                                                                                                                                                                                                                                                                                {faq.a}
                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                                                                                                    })}
                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                            </section>

                                                                                                                                                                                                                                                                                                            {/* ========================================================= */}
                                                                                                                                                                                                                                                                                                            {/* SECTION 8 — FINAL CTA AND FREE DEMO (Cream Surface)       */}
                                                                                                                                                                                                                                                                                                            {/* ========================================================= */}
                                                                                                                                                                                                                                                                                                            <section id="demo-inquiry-section" className="py-16 sm:py-24 px-4 sm:px-6 bg-cream">
                                                                                                                                                                                                                                                                                                              <div className="max-w-4xl mx-auto rounded-[20px] bg-surface p-6 sm:p-12 text-ink-900 shadow-2xl border border-line text-left relative overflow-hidden reveal-section">

                                                                                                                                                                                                                                                                                                                <div className="max-w-2xl space-y-3 mb-8">
                                                                                                                                                                                                                                                                                                                  <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-slate-900">
                                                                                                                                                                                                                                                                                                                    <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-ink-900">
                                                                                                                                                                                                                                                                                                                      Ready to Turn Your Enquiries into Deals?
                                                                                                                                                                                                                                                                                                                    </h2>
                                                                                                                                                                                                                                                                                                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                                                                                                                                                                                                                                                                                                      <p className="text-xs sm:text-sm text-ink-700 leading-relaxed">
                                                                                                                                                                                                                                                                                                                        See how LeadNivash can simplify your property business. Request a free demo and start your 14-day free trial.
                                                                                                                                                                                                                                                                                                                      </p>
                                                                                                                                                                                                                                                                                                                    </div>

                                                                                                                                                                                                                                                                                                                    {/* Inquiry Form */}
                                                                                                                                                                                                                                                                                                                    {formSuccess ? (
                                                                                                                                                                                                                                                                                                                      <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3 text-center">
                                                                                                                                                                                                                                                                                                                        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                                                                                                                                                                                                                                                                                                                        <h3 className="text-base font-black text-slate-900 font-heading">
                                                                                                                                                                                                                                                                                                                          <div className="p-6 rounded-[18px] bg-lime-soft border border-line space-y-3 text-center">
                                                                                                                                                                                                                                                                                                                            <CheckCircle2 className="w-10 h-10 text-brand-600 mx-auto" />
                                                                                                                                                                                                                                                                                                                            <h3 className="text-base font-black text-ink-900 font-heading">
                                                                                                                                                                                                                                                                                                                              Demo Request Received!
                                                                                                                                                                                                                                                                                                                            </h3>
                                                                                                                                                                                                                                                                                                                            <p className="text-xs text-slate-600 max-w-md mx-auto">
                                                                                                                                                                                                                                                                                                                              <p className="text-xs text-ink-700 max-w-md mx-auto">
                                                                                                                                                                                                                                                                                                                                Thank you! Our onboarding specialist will connect with you on WhatsApp within 1 business hour to schedule your live walkthrough.
                                                                                                                                                                                                                                                                                                                              </p>
                                                                                                                                                                                                                                                                                                                              <div className="pt-2">
                                                                                                                                                                                                                                                                                                                                <Link to="/register">
                                                                                                                                                                                                                                                                                                                                  <Button size="sm" pill className="text-xs font-bold">
                                                                                                                                                                                                                                                                                                                                    Start 14-Day Free Trial Directly
                                                                                                                                                                                                                                                                                                                                  </Button>
                                                                                                                                                                                                                                                                                                                                </Link>
                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                                          ) : (
                                                                                                                                                                                                                                                                                                                          <form onSubmit={handleInquirySubmit} className="space-y-4">
                                                                                                                                                                                                                                                                                                                            {formError && (
                                                                                                                                                                                                                                                                                                                              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
                                                                                                                                                                                                                                                                                                                                <div className="p-3 rounded-[16px] bg-red-50 border border-red-200 text-danger text-xs flex items-center gap-2">
                                                                                                                                                                                                                                                                                                                                  <AlertCircle className="w-4 h-4 shrink-0" />
                                                                                                                                                                                                                                                                                                                                  <span>{formError}</span>
                                                                                                                                                                                                                                                                                                                                </div>
                )}

                                                                                                                                                                                                                                                                                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                                                                                                                                                                                                                                                                                  <div>
                                                                                                                                                                                                                                                                                                                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                                                                                                                                                                                                                                                                                                      <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-1.5">
                                                                                                                                                                                                                                                                                                                                        Full Name *
                                                                                                                                                                                                                                                                                                                                      </label>
                                                                                                                                                                                                                                                                                                                                      <input
                                                                                                                                                                                                                                                                                                                                        type="text"
                                                                                                                                                                                                                                                                                                                                        required
                                                                                                                                                                                                                                                                                                                                        autoComplete="name"
                                                                                                                                                                                                                                                                                                                                        value={formName}
                                                                                                                                                                                                                                                                                                                                        onChange={(e) => setFormName(e.target.value)}
                                                                                                                                                                                                                                                                                                                                        placeholder="e.g. Rajesh Sharma"
                                                                                                                                                                                                                                                                                                                                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs min-h-[44px]"
                                                                                                                                                                                                                                                                                                                                        className="w-full bg-cream border border-line rounded-[16px] px-4 py-3 text-sm text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 shadow-2xs min-h-[44px]"
                                                                                                                                                                                                                                                                                                                                      />
                                                                                                                                                                                                                                                                                                                                  </div>

                                                                                                                                                                                                                                                                                                                                  <div>
                                                                                                                                                                                                                                                                                                                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                                                                                                                                                                                                                                                                                                      <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-1.5">
                                                                                                                                                                                                                                                                                                                                        WhatsApp Number *
                                                                                                                                                                                                                                                                                                                                      </label>
                                                                                                                                                                                                                                                                                                                                      <input
                                                                                                                                                                                                                                                                                                                                        type="tel"
                                                                                                                                                                                                                                                                                                                                        required
                                                                                                                                                                                                                                                                                                                                        inputMode="tel"
                                                                                                                                                                                                                                                                                                                                        autoComplete="tel"
                                                                                                                                                                                                                                                                                                                                        value={formPhone}
                                                                                                                                                                                                                                                                                                                                        onChange={(e) => setFormPhone(e.target.value)}
                                                                                                                                                                                                                                                                                                                                        placeholder="e.g. 9876543210"
                                                                                                                                                                                                                                                                                                                                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs min-h-[44px]"
                                                                                                                                                                                                                                                                                                                                        className="w-full bg-cream border border-line rounded-[16px] px-4 py-3 text-sm text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 shadow-2xs min-h-[44px]"
                                                                                                                                                                                                                                                                                                                                      />
                                                                                                                                                                                                                                                                                                                                  </div>

                                                                                                                                                                                                                                                                                                                                  <div>
                                                                                                                                                                                                                                                                                                                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                                                                                                                                                                                                                                                                                                      <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-1.5">
                                                                                                                                                                                                                                                                                                                                        Agency / Business Name *
                                                                                                                                                                                                                                                                                                                                      </label>
                                                                                                                                                                                                                                                                                                                                      <input
                                                                                                                                                                                                                                                                                                                                        type="text"
                                                                                                                                                                                                                                                                                                                                        required
                                                                                                                                                                                                                                                                                                                                        autoComplete="organization"
                                                                                                                                                                                                                                                                                                                                        value={formAgency}
                                                                                                                                                                                                                                                                                                                                        onChange={(e) => setFormAgency(e.target.value)}
                                                                                                                                                                                                                                                                                                                                        placeholder="e.g. Sharma Real Estate"
                                                                                                                                                                                                                                                                                                                                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs min-h-[44px]"
                                                                                                                                                                                                                                                                                                                                        className="w-full bg-cream border border-line rounded-[16px] px-4 py-3 text-sm text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 shadow-2xs min-h-[44px]"
                                                                                                                                                                                                                                                                                                                                      />
                                                                                                                                                                                                                                                                                                                                  </div>

                                                                                                                                                                                                                                                                                                                                  <div>
                                                                                                                                                                                                                                                                                                                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                                                                                                                                                                                                                                                                                                      <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-1.5">
                                                                                                                                                                                                                                                                                                                                        City *
                                                                                                                                                                                                                                                                                                                                      </label>
                                                                                                                                                                                                                                                                                                                                      <input
                                                                                                                                                                                                                                                                                                                                        type="text"
                                                                                                                                                                                                                                                                                                                                        required
                                                                                                                                                                                                                                                                                                                                        autoComplete="address-level2"
                                                                                                                                                                                                                                                                                                                                        value={formCity}
                                                                                                                                                                                                                                                                                                                                        onChange={(e) => setFormCity(e.target.value)}
                                                                                                                                                                                                                                                                                                                                        placeholder="e.g. Panipat / Gurugram"
                                                                                                                                                                                                                                                                                                                                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs min-h-[44px]"
                                                                                                                                                                                                                                                                                                                                        className="w-full bg-cream border border-line rounded-[16px] px-4 py-3 text-sm text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 shadow-2xs min-h-[44px]"
                                                                                                                                                                                                                                                                                                                                      />
                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                                                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                                                                                                                                                                                                                                                                                  <div>
                                                                                                                                                                                                                                                                                                                                    <label htmlFor="active-props-select" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                                                                                                                                                                                                                                                                                                      <label htmlFor="active-props-select" className="block text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-1.5">
                                                                                                                                                                                                                                                                                                                                        Active Properties Managed (Optional)
                                                                                                                                                                                                                                                                                                                                      </label>
                                                                                                                                                                                                                                                                                                                                      <select
                                                                                                                                                                                                                                                                                                                                        id="active-props-select"
                                                                                                                                                                                                                                                                                                                                        aria-label="Active Properties Managed"
                                                                                                                                                                                                                                                                                                                                        value={formActiveProps}
                                                                                                                                                                                                                                                                                                                                        onChange={(e) => setFormActiveProps(e.target.value)}
                                                                                                                                                                                                                                                                                                                                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs cursor-pointer min-h-[44px]"
                                                                                                                                                                                                                                                                                                                                        className="w-full bg-cream border border-line rounded-[16px] px-4 py-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 shadow-2xs cursor-pointer min-h-[44px]"
                                                                                                                                                                                                                                                                                                                                      >
                                                                                                                                                                                                                                                                                                                                        <option value="1-10">1 to 10 properties</option>
                                                                                                                                                                                                                                                                                                                                        <option value="10-50">10 to 50 properties</option>
                                                                                                                                                                                                                                                                                                                                        <option value="50-100">50 to 100 properties</option>
                                                                                                                                                                                                                                                                                                                                        <option value="100+">100+ properties</option>
                                                                                                                                                                                                                                                                                                                                      </select>
                                                                                                                                                                                                                                                                                                                                  </div>

                                                                                                                                                                                                                                                                                                                                  <div>
                                                                                                                                                                                                                                                                                                                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                                                                                                                                                                                                                                                                                                      <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-1.5">
                                                                                                                                                                                                                                                                                                                                        Message / Specific Requirement (Optional)
                                                                                                                                                                                                                                                                                                                                      </label>
                                                                                                                                                                                                                                                                                                                                      <input
                                                                                                                                                                                                                                                                                                                                        type="text"
                                                                                                                                                                                                                                                                                                                                        value={formMessage}
                                                                                                                                                                                                                                                                                                                                        onChange={(e) => setFormMessage(e.target.value)}
                                                                                                                                                                                                                                                                                                                                        placeholder="Any specific questions or locality preferences?"
                                                                                                                                                                                                                                                                                                                                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs min-h-[44px]"
                                                                                                                                                                                                                                                                                                                                        className="w-full bg-cream border border-line rounded-[16px] px-4 py-3 text-sm text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 shadow-2xs min-h-[44px]"
                                                                                                                                                                                                                                                                                                                                      />
                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                                                                                                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                                                                                                                                                                                                                                                                                                                                  <Button
                                                                                                                                                                                                                                                                                                                                    <button
                    type="submit"
                                                                                                                                                                                                                                                                                                                                    disabled={formSubmitting}
                                                                                                                                                                                                                                                                                                                                    className="group btn-cashfree-primary btn-shine-sweep w-full sm:w-auto inline-flex items-center justify-center gap-3 pl-6 pr-2.5 py-2.5 min-h-[50px] rounded-[16px] disabled:opacity-60 text-white font-bold text-xs transition-all cursor-pointer active:scale-[0.98]"
                                                                                                                                                                                                                                                                                                                                  >
                                                                                                                                                                                                                                                                                                                                    <span>{formSubmitting ? 'Submitting...' : 'Request My Free Demo'}</span>
                                                                                                                                                                                                                                                                                                                                    <span className="w-7 h-7 rounded-[9px] bg-lime text-ink-black flex items-center justify-center shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                                                                                                                                                                                                                                                                                                                                      <ArrowUpRight className="w-4 h-4 stroke-[2.4]" />
                                                                                                                                                                                                                                                                                                                                    </span>
                                                                                                                                                                                                                                                                                                                                  </button>

                                                                                                                                                                                                                                                                                                                                  <p className="text-[11px] text-slate-500 text-center sm:text-left">
                                                                                                                                                                                                                                                                                                                                    <p className="text-[11px] text-ink-500 text-center sm:text-left">
                                                                                                                                                                                                                                                                                                                                      By submitting, you agree to our{' '}
                                                                                                                                                                                                                                                                                                                                      <Link to="/terms" className="underline font-semibold text-emerald-700">Terms of Service</Link>{' '}
                                                                                                                                                                                                                                                                                                                                      <Link to="/terms" className="underline font-semibold text-brand-700">Terms of Service</Link>{' '}
                                                                                                                                                                                                                                                                                                                                      and{' '}
                                                                                                                                                                                                                                                                                                                                      <Link to="/privacy" className="underline font-semibold text-emerald-700">Privacy Policy</Link>.
                                                                                                                                                                                                                                                                                                                                      <Link to="/privacy" className="underline font-semibold text-brand-700">Privacy Policy</Link>.
                                                                                                                                                                                                                                                                                                                                      Zero spam guaranteed.
                                                                                                                                                                                                                                                                                                                                    </p>
                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                              </form>
                                                                                                                                                                                                                                                                                                                            )}
                                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                                        </section>
                                                                                                                                                                                                                                                                                                                      </main>

                                                                                                                                                                                                                                                                                                                {/* ========================================================= */}
                                                                                                                                                                                                                                                                                                                    {/* SECTION 9 — MONUMENTAL BRAND FOOTER                       */}
                                                                                                                                                                                                                                                                                                                    {/* SECTION 9 — MONUMENTAL BRAND FOOTER (--ink-black)         */}
                                                                                                                                                                                                                                                                                                                    {/* ========================================================= */}
                                                                                                                                                                                                                                                                                                                    <footer className="mt-auto relative bg-gradient-to-b from-[#0B1E30] via-[#07261C] to-[#041510] text-white overflow-hidden pt-16 sm:pt-24 pb-10 sm:pb-14 border-t border-emerald-900/40">
                                                                                                                                                                                                                                                                                                                      <footer className="mt-auto relative bg-ink-black text-white overflow-hidden pt-16 sm:pt-24 pb-10 sm:pb-14 border-t border-white/10">

                                                                                                                                                                                                                                                                                                                        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
                                                                                                                                                                                                                                                                                                                          {/* Top Footer Grid: Brand + Quick Links + Support Channels */}
                                                                                                                                                                                                                                                                                                                          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/10 text-left">
                                                                                                                                                                                                                                                                                                                            <div className="md:col-span-1 space-y-3">
                                                                                                                                                                                                                                                                                                                              <div className="flex items-center gap-2.5">
                                                                                                                                                                                                                                                                                                                                <div className="w-8 h-8 rounded-[12px] bg-white p-1 flex items-center justify-center shadow">
                                                                                                                                                                                                                                                                                                                                  <img src="/logo-icon.png" alt="LeadNivash" className="w-full h-full object-contain" />
                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                <span className="text-lg font-black tracking-tight text-white font-heading">
                                                                                                                                                                                                                                                                                                                                  Lead<span className="text-lime">Nivash</span>
                                                                                                                                                                                                                                                                                                                                </span>
                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                              <p className="text-xs text-[#C9CCC6] leading-relaxed">
                                                                                                                                                                                                                                                                                                                                India's #1 Real Estate Broker Operating System. AI-powered property matching, buyer CRM, and owner inventory protection.
                                                                                                                                                                                                                                                                                                                              </p>
                                                                                                                                                                                                                                                                                                                            </div>

                                                                                                                                                                                                                                                                                                                            <div>
                                                                                                                                                                                                                                                                                                                              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-heading">
                                                                                                                                                                                                                                                                                                                                Platform
                                                                                                                                                                                                                                                                                                                              </h3>
                                                                                                                                                                                                                                                                                                                              <ul className="space-y-2 text-xs text-[#C9CCC6]">
                                                                                                                                                                                                                                                                                                                                <li><a href="#capabilities" className="hover:text-lime transition">Core Features</a></li>
                                                                                                                                                                                                                                                                                                                                <li><a href="#how-it-works" className="hover:text-lime transition">How It Works</a></li>
                                                                                                                                                                                                                                                                                                                                <li><Link to="/pricing" className="hover:text-lime transition">Subscription Plans</Link></li>
                                                                                                                                                                                                                                                                                                                                <li><a href="#demo-inquiry-section" className="hover:text-lime transition">Book Live Demo</a></li>
                                                                                                                                                                                                                                                                                                                              </ul>
                                                                                                                                                                                                                                                                                                                            </div>

                                                                                                                                                                                                                                                                                                                            <div>
                                                                                                                                                                                                                                                                                                                              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-heading">
                                                                                                                                                                                                                                                                                                                                Broker Utilities
                                                                                                                                                                                                                                                                                                                              </h3>
                                                                                                                                                                                                                                                                                                                              <ul className="space-y-2 text-xs text-[#C9CCC6]">
                                                                                                                                                                                                                                                                                                                                <li><Link to="/tools" className="hover:text-lime transition">Circle Rate & Stamp Duty</Link></li>
                                                                                                                                                                                                                                                                                                                                <li><Link to="/tools" className="hover:text-lime transition">EMI & Loan Eligibility</Link></li>
                                                                                                                                                                                                                                                                                                                                <li><Link to="/tools" className="hover:text-lime transition">Invoice Generator</Link></li>
                                                                                                                                                                                                                                                                                                                                <li><Link to="/tools" className="hover:text-lime transition">Land Area Unit Converter</Link></li>
                                                                                                                                                                                                                                                                                                                              </ul>
                                                                                                                                                                                                                                                                                                                            </div>

                                                                                                                                                                                                                                                                                                                            <div>
                                                                                                                                                                                                                                                                                                                              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-heading">
                                                                                                                                                                                                                                                                                                                                Direct Contact & Support
                                                                                                                                                                                                                                                                                                                              </h3>
                                                                                                                                                                                                                                                                                                                              <ul className="space-y-2.5 text-xs text-[#C9CCC6]">
                                                                                                                                                                                                                                                                                                                                <li>
                                                                                                                                                                                                                                                                                                                                  <a
                                                                                                                                                                                                                                                                                                                                    href="tel:+919876543210"
                                                                                                                                                                                                                                                                                                                                    className="inline-flex items-center gap-2 hover:text-lime transition text-white/90"
                                                                                                                                                                                                                                                                                                                                  >
                                                                                                                                                                                                                                                                                                                                    <Phone className="w-3.5 h-3.5 text-lime" />
                                                                                                                                                                                                                                                                                                                                    <span>+91 98765 43210</span>
                                                                                                                                                                                                                                                                                                                                  </a>
                                                                                                                                                                                                                                                                                                                                </li>
                                                                                                                                                                                                                                                                                                                                <li>
                                                                                                                                                                                                                                                                                                                                  <a
                                                                                                                                                                                                                                                                                                                                    href="mailto:contact@leadnivash.com"
                                                                                                                                                                                                                                                                                                                                    className="inline-flex items-center gap-2 hover:text-lime transition text-white/90"
                                                                                                                                                                                                                                                                                                                                  >
                                                                                                                                                                                                                                                                                                                                    <Mail className="w-3.5 h-3.5 text-lime" />
                                                                                                                                                                                                                                                                                                                                    <span>contact@leadnivash.com</span>
                                                                                                                                                                                                                                                                                                                                  </a>
                                                                                                                                                                                                                                                                                                                                </li>
                                                                                                                                                                                                                                                                                                                                <li>
                                                                                                                                                                                                                                                                                                                                  <Link to="/contact" className="hover:text-lime transition">
                                                                                                                                                                                                                                                                                                                                    Contact & Inquiry Desk &rarr;
                                                                                                                                                                                                                                                                                                                                  </Link>
                                                                                                                                                                                                                                                                                                                                </li>
                                                                                                                                                                                                                                                                                                                              </ul>
                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                          </div>

                                                                                                                                                                                                                                                                                                                          {/* Massive Monumental Brand Typography — sized to fit all 10 letters without clipping */}
                                                                                                                                                                                                                                                                                                                          <div className="relative w-full select-none pointer-events-none text-center px-2 py-6 sm:py-12">
                                                                                                                                                                                                                                                                                                                            <p className="text-[clamp(2.6rem,11vw,9.25rem)] font-black tracking-tight leading-none font-heading whitespace-nowrap mx-auto text-transparent bg-clip-text bg-gradient-to-b from-white via-emerald-50/85 to-emerald-400/15">
                                                                                                                                                                                                                                                                                                                              <p className="text-[clamp(2.6rem,11vw,9.25rem)] font-black tracking-tight leading-none font-heading whitespace-nowrap mx-auto text-transparent bg-clip-text bg-gradient-to-b from-white via-white/85 to-lime/25">
                                                                                                                                                                                                                                                                                                                                LeadNivash
                                                                                                                                                                                                                                                                                                                              </p>
                                                                                                                                                                                                                                                                                                                          </div>

                                                                                                                                                                                                                                                                                                                          {/* Footer Metadata & Legal Links */}
                                                                                                                                                                                                                                                                                                                          <div className="mt-4 sm:mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#C9CCC6] font-medium">
                                                                                                                                                                                                                                                                                                                            <p>© {new Date().getFullYear()} LeadNivash Inc. · India's #1 Real Estate Broker Operating System</p>
                                                                                                                                                                                                                                                                                                                            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
                                                                                                                                                                                                                                                                                                                              <Link to="/privacy" className="hover:text-lime transition">Privacy Policy</Link>
                                                                                                                                                                                                                                                                                                                              <span>·</span>
                                                                                                                                                                                                                                                                                                                              <Link to="/terms" className="hover:text-lime transition">Terms of Service</Link>
                                                                                                                                                                                                                                                                                                                              <span>·</span>
                                                                                                                                                                                                                                                                                                                              <Link to="/refund" className="hover:text-lime transition">Refund Policy</Link>
                                                                                                                                                                                                                                                                                                                              <span>·</span>
                                                                                                                                                                                                                                                                                                                              <Link to="/cookies" className="hover:text-lime transition">Cookie Policy</Link>
                                                                                                                                                                                                                                                                                                                              <span>·</span>
                                                                                                                                                                                                                                                                                                                              <Link to="/contact" className="hover:text-lime transition">Support</Link>
                                                                                                                                                                                                                                                                                                                              <span>·</span>
                                                                                                                                                                                                                                                                                                                              <Link to="/login" className="hover:text-lime transition">Broker Portal</Link>
                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                      </footer>

                                                                                                                                                                                                                                                                                                                      {/* Downward Progressive Viewport Blur (Premium Edge Softener, fades cleanly at footer) */}
                                                                                                                                                                                                                                                                                                                      <div
                                                                                                                                                                                                                                                                                                                        data-bottom-blur="true"
                                                                                                                                                                                                                                                                                                                        aria-hidden="true"
                                                                                                                                                                                                                                                                                                                        className={clsx(
                                                                                                                                                                                                                                                                                                                          'pointer-events-none fixed inset-x-0 bottom-0 h-16 sm:h-20 z-30 transition-opacity duration-300 bg-gradient-to-t from-white/80 via-white/35 to-transparent',
                                                                                                                                                                                                                                                                                                                          'pointer-events-none fixed inset-x-0 bottom-0 h-16 sm:h-20 z-30 transition-opacity duration-300 bg-gradient-to-t from-cream/85 via-cream/40 to-transparent',
                                                                                                                                                                                                                                                                                                                          nearBottom ? 'opacity-0' : 'opacity-100'
                                                                                                                                                                                                                                                                                                                        )}
                                                                                                                                                                                                                                                                                                                        style={{
                                                                                                                                                                                                                                                                                                                          backdropFilter: 'blur(10px)',
                                                                                                                                                                                                                                                                                                                          WebkitBackdropFilter: 'blur(10px)',
                                                                                                                                                                                                                                                                                                                          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 45%, black 100%)',
                                                                                                                                                                                                                                                                                                                          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 45%, black 100%)',
                                                                                                                                                                                                                                                                                                                        }}
                                                                                                                                                                                                                                                                                                                      />

                                                                                                                                                                                                                                                                                                                      {/* Floating Back to Top Button */}
                                                                                                                                                                                                                                                                                                                      {showBackToTop && (
                                                                                                                                                                                                                                                                                                                        <button
                                                                                                                                                                                                                                                                                                                          type="button"
                                                                                                                                                                                                                                                                                                                          onClick={scrollToTop}
                                                                                                                                                                                                                                                                                                                          aria-label="Back to top"
                                                                                                                                                                                                                                                                                                                          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-950/30 transition-all duration-200 focus:outline-none cursor-pointer hover:scale-105 active:scale-95"
                                                                                                                                                                                                                                                                                                                          className="fixed bottom-6 right-6 z-40 p-3 rounded-[16px] bg-ink-black hover:bg-ink-900 text-lime shadow-xl transition-all duration-200 focus:outline-none cursor-pointer hover:scale-105 active:scale-95 border border-white/15"
                                                                                                                                                                                                                                                                                                                        >
                                                                                                                                                                                                                                                                                                                          <ArrowUp className="w-5 h-5" />
                                                                                                                                                                                                                                                                                                                        </button>
                                                                                                                                                                                                                                                                                                                      )}

                                                                                                                                                                                                                                                                                                                      {/* Floating WhatsApp Quick Consultation Pill (Visible on sm screens and above) */}
                                                                                                                                                                                                                                                                                                                      <a
                                                                                                                                                                                                                                                                                                                        href="https://wa.me/919876543210?text=Hi%20LeadNivash,%20I%20am%20interested%20in%20a%20demo%20of%20the%20Broker%20Platform."
                                                                                                                                                                                                                                                                                                                        target="_blank"
                                                                                                                                                                                                                                                                                                                        rel="noopener noreferrer"
                                                                                                                                                                                                                                                                                                                        className="fixed bottom-6 left-6 z-40 hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-[16px] bg-ink-black hover:bg-ink-900 text-white text-xs font-bold shadow-xl transition hover:scale-105 active:scale-95 cursor-pointer border border-white/15"
                                                                                                                                                                                                                                                                                                                        aria-label="Chat on WhatsApp"
                                                                                                                                                                                                                                                                                                                      >
                                                                                                                                                                                                                                                                                                                        <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                                                                                                                                                                                                                                                                                                                        <span>Chat on WhatsApp</span>
                                                                                                                                                                                                                                                                                                                      </a>

                                                                                                                                                                                                                                                                                                                      {/* Automatic Trial User Upgrade Popup ("Unlock full LeadNivash Pro") */}
                                                                                                                                                                                                                                                                                                                      <SpecialOfferModal
                                                                                                                                                                                                                                                                                                                        isOpen={isTrialOfferOpen}
                                                                                                                                                                                                                                                                                                                        onClose={() => setIsTrialOfferOpen(false)}
                                                                                                                                                                                                                                                                                                                      />
                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                    );
};
