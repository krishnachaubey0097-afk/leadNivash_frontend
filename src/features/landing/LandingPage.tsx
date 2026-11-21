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
  Check,
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
  Crown,
  Zap,
  Menu,
  X,
  LogIn,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  ArrowUp,
  HelpCircle,
} from 'lucide-react';
import { apiClient } from '../../lib/api/client';
import { useAuth } from '../auth/AuthProvider';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
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

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Back to Top Scroll State
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="min-h-screen bg-bg text-text flex flex-col selection:bg-brand-50 selection:text-brand-700">
      {/* Ambient Top Radial Glow (Smudge / Ecosight inspired) */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/12 via-brand-500/5 to-transparent blur-3xl dark:from-emerald-500/20" />

      {/* ========================================================= */}
      {/* FLOATING CAPSULE NAVIGATION (Upper Header Bar)            */}
      {/* ========================================================= */}
      <header className="sticky top-3 sm:top-5 z-50 w-full px-3 sm:px-6 flex justify-center pointer-events-none transition-all">
        <div className="pointer-events-auto max-w-5xl w-full h-14 sm:h-15 px-2.5 sm:px-3.5 rounded-full apple-glass-pill shadow-xl shadow-slate-900/5 flex items-center justify-between gap-2 sm:gap-4 transition-all">
          {/* Logo with strict brand styling: leadNivash */}
          <Link to="/" className="flex items-center gap-2.5 pl-1.5 sm:pl-2 group focus:outline-none rounded-full shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 p-1 shadow-2xs group-hover:border-emerald-600/40 transition flex items-center justify-center">
              <img src="/logo-icon.png" alt="leadNivash" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 font-heading leading-none">
                lead<span className="text-emerald-700">Nivash</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links: Single-Line Professional Whitespace-Nowrap */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-[11px] xl:text-xs font-bold uppercase tracking-wider text-slate-600">
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-full whitespace-nowrap leading-none hover:text-slate-950 hover:bg-slate-100/70 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#capabilities"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-full whitespace-nowrap leading-none hover:text-slate-950 hover:bg-slate-100/70 transition-colors"
            >
              Features
            </a>
            <a
              href="#financial-impact"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-full whitespace-nowrap leading-none hover:text-slate-950 hover:bg-slate-100/70 transition-colors"
            >
              ROI Calculator
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-full whitespace-nowrap leading-none hover:text-slate-950 hover:bg-slate-100/70 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#why-leadnivash"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-full whitespace-nowrap leading-none hover:text-slate-950 hover:bg-slate-100/70 transition-colors"
            >
              Why Us
            </a>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 shrink-0 pr-1">
            {isAuthenticated ? (
              <Link
                to="/app"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors whitespace-nowrap leading-none"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 px-3 py-1.5 rounded-full hover:bg-slate-100/70 transition-colors whitespace-nowrap leading-none"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Sign In</span>
              </Link>
            )}

            <button
              onClick={scrollToInquiry}
              className="group relative inline-flex items-center gap-2 pl-3.5 sm:pl-4 pr-1.5 sm:pr-2 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-emerald-700/25 hover:shadow-lg transition-all cursor-pointer whitespace-nowrap leading-none min-h-[36px]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/95 animate-pulse hidden sm:inline-block shrink-0" />
              <span>Get Free Demo</span>
              <span className="w-5 h-5 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold text-xs shadow-2xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-slate-100 active:scale-95 transition cursor-pointer border border-slate-200/80 shadow-2xs shrink-0"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Overlay */}
        {mobileMenuOpen && (
          <div className="pointer-events-auto fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-in Drawer Panel */}
            <div
              className="fixed top-0 right-0 bottom-0 w-full max-w-xs sm:max-w-sm bg-white shadow-2xl z-50 p-6 flex flex-col justify-between border-l border-slate-200 animate-hero-up"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <img src="/logo-icon.png" alt="leadNivash" className="w-7 h-7 object-contain" />
                    <span className="font-black text-slate-900 font-heading text-base">
                      lead<span className="text-emerald-700">Nivash</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col space-y-1 text-sm font-bold text-slate-700">
                  <a
                    href="#how-it-works"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center justify-between"
                  >
                    <span>How It Works</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </a>
                  <a
                    href="#capabilities"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center justify-between"
                  >
                    <span>Features & Capabilities</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </a>
                  <a
                    href="#financial-impact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center justify-between"
                  >
                    <span>ROI Calculator</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </a>
                  <a
                    href="#pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center justify-between"
                  >
                    <span>Pricing Plans</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </a>
                  <a
                    href="#why-leadnivash"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center justify-between"
                  >
                    <span>Why leadNivash</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </a>
                </nav>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    scrollToInquiry();
                  }}
                  className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>Get Free Demo</span>
                </button>

                {isAuthenticated ? (
                  <Link
                    to="/app"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-sm min-h-[46px]"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200 min-h-[46px]"
                    >
                      <span>Start 14-Day Free Trial</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>

                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs text-center text-slate-500 hover:text-slate-900 block font-bold py-2 transition"
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

      {/* ========================================================= */}
      {/* SECTION 1 — HERO (Phase 1 Apple-Class Light Upgrade)      */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/90 via-white to-emerald-50/20 text-slate-900 pt-16 sm:pt-24 pb-20 px-4 sm:px-6 w-full border-b border-slate-200/80">
        {/* Dynamic Video Background (bg1.mp4) with Pure Light Overlay */}
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

          {/* Light Ambient Gradients: Crisp Apple-Class White Wash */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white/95" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />

          {/* Volumetric Emerald Ambient Spotlight (Subtle Apple-class Glow) */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[900px] sm:w-[1200px] h-[500px] bg-gradient-to-b from-emerald-500/15 via-teal-400/8 to-transparent rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          {/* Main Hero Header Stack */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Apple Glass Pill Badge (Reference 2 'True Growth' Style) */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full apple-glass-pill shadow-xs mx-auto animate-hero-up cursor-default">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                ✓
              </span>
              <span className="text-xs font-bold text-slate-800 tracking-tight">
                India's #1 Real Estate Broker Operating System
              </span>
            </div>

            {/* Hero Headline with high-contrast emerald typography */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-heading leading-[1.12] sm:leading-[1.08] tracking-tight text-slate-900 animate-hero-up">
              Turn Messages into <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                Property Deals.
              </span>
            </h1>

            {/* 4. Supporting Text */}
            <p className="text-xs sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal px-2 sm:px-0">
              Turn scattered WhatsApp enquiries into an organised property business. Save time, find the right property matches faster and manage more opportunities without losing track of your deals.
            </p>

            {/* 5. CTA Buttons (Apple-Class High Contrast Styling with traveling border shine) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 max-w-lg mx-auto w-full px-2 sm:px-0">
              <div className="btn-shine-wrapper w-full sm:w-auto flex-1">
                <div className="btn-shine-border" />
                <button
                  onClick={scrollToInquiry}
                  className="relative z-10 w-full group inline-flex items-center justify-between sm:justify-center gap-3 pl-6 pr-3 h-[52px] rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs tracking-wider uppercase transition-all duration-300 shadow-lg shadow-emerald-600/30 cursor-pointer focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>Get Free Demo</span>
                  </span>
                  <span className="w-7 h-7 rounded-full bg-white text-emerald-800 flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 group-hover:scale-105 shadow-xs shrink-0">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </span>
                </button>
              </div>

              <Link to="/register" className="w-full sm:w-auto flex-1 block">
                <button
                  className="group w-full inline-flex items-center justify-between sm:justify-center gap-3 pl-6 pr-3 h-[52px] rounded-full bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 hover:text-slate-900 border-2 border-slate-200/90 hover:border-slate-300 font-extrabold text-xs tracking-wider uppercase shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer focus:outline-none"
                >
                  <span>Start 14-Day Free Trial</span>
                  <span className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:scale-105 shrink-0">
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </span>
                </button>
              </Link>
            </div>

            {/* Trust points */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-6 pt-2 text-xs text-slate-600 font-semibold px-2">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 100% Owner Contact Privacy
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> WhatsApp integrated
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
                          'relative z-10 flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer border snap-center shrink-0 min-h-[42px]',
                          isActive
                            ? 'bg-emerald-50/90 border-2 border-emerald-600 text-emerald-950 font-bold shadow-md shadow-emerald-600/15'
                            : isPassed
                            ? 'bg-white border-emerald-300 text-emerald-700 shadow-2xs'
                            : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                        )}
                      >
                        <span
                          className={clsx(
                            'w-5 h-5 rounded-full flex items-center justify-center transition-colors',
                            isActive
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : isPassed
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          <Icon className="w-3 h-3" />
                        </span>
                        <span>{step.label}</span>
                      </button>

                      {idx < PROCESS_STEPS.length - 1 && (
                        <div className="hidden sm:block w-6 sm:w-10 h-0.5 rounded-full bg-slate-200 relative overflow-hidden shrink-0">
                          <div
                            className={clsx(
                              'absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500',
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

            {/* Apple-Class Crisp White Dashboard-Window Container with Glossy Blur (Reference 3) */}
            <div className="rounded-2xl sm:rounded-3xl border border-white/80 bg-white/90 backdrop-blur-3xl p-3.5 sm:p-6 shadow-2xl shadow-emerald-950/15 relative overflow-hidden transition-all duration-300 glossy-specular">
              {/* Glossy Liquid Refractive Blur Orbs (Reference 3) */}
              <div className="absolute -top-28 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-400/25 via-teal-300/15 to-transparent blur-3xl pointer-events-none animate-liquid-orb" />
              <div className="absolute -bottom-28 -left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-teal-400/20 via-emerald-500/15 to-transparent blur-3xl pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none" />

              {/* Window Chrome Header Bar with Clean OS Dots & Encrypted Status */}
              <div className="relative z-10 flex items-center justify-between pb-3 px-1 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold text-emerald-800 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Encrypted Owner Vault Active
                  </span>
                </div>
              </div>

              {/* 3-Part Product Preview with Apple-Class Clean Surfaces */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {/* Card 1: WhatsApp Parser Simulation */}
                <div
                  className={clsx(
                    'p-4 rounded-2xl bg-slate-50/90 border transition-all duration-300 space-y-3',
                    activeProcessStep === 0 || activeProcessStep === 1
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                      : 'border-slate-200/80'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      WhatsApp Message
                    </span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                      1-Tap Parse
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-[11px] font-mono text-slate-800 line-clamp-3 shadow-2xs leading-relaxed">
                    "3 BHK builder floor, 2nd floor with lift, Model Town Panipat, 200 gaj, demand 1.25 Cr. Owner: 9876543210"
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">3 BHK · 200 Gaj</span>
                    <span className="font-extrabold text-emerald-700">₹1.25 Cr</span>
                  </div>
                </div>

                {/* Card 2: Smart Property Match Score Indicator */}
                <div
                  className={clsx(
                    'p-4 rounded-2xl bg-slate-50/90 border transition-all duration-300 space-y-3 flex flex-col justify-between',
                    activeProcessStep === 2
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                      : 'border-slate-200/80'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Smart Property Match
                    </span>
                    <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full font-bold">
                      Buyer Match
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full border-4 border-emerald-100 border-t-emerald-600 flex items-center justify-center shrink-0 bg-white shadow-2xs">
                      <span className="text-xs font-black text-emerald-700 font-heading">96%</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Rajesh Sharma</h4>
                      <p className="text-[11px] text-slate-600">Budget: ₹1.20 - 1.35 Cr</p>
                      <span className="text-[10px] font-bold text-emerald-700">Model Town Match</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Matched instantly across 18 inquiries</span>
                  </div>
                </div>

                {/* Card 3: Masked Flyer & Branded Share */}
                <div
                  className={clsx(
                    'p-4 rounded-2xl bg-slate-50/90 border transition-all duration-300 space-y-3 flex flex-col justify-between',
                    activeProcessStep === 3 || activeProcessStep === 4
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                      : 'border-slate-200/80'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Masked Flyer Output
                    </span>
                    <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                      Safe Share
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-slate-900 space-y-1 shadow-2xs">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold block">
                      Watermarked Flyer
                    </span>
                    <p className="text-xs font-bold text-slate-900">3 BHK Luxury Floor · Model Town</p>
                    <p className="text-[10px] text-slate-500">Marketed by: Sharma Real Estate Agency</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
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
      <section id="capabilities" className="py-16 sm:py-24 px-4 sm:px-6 bg-surface/50 border-y border-border/70 relative overflow-hidden">
        {/* Subtle top ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[200px] bg-gradient-to-b from-emerald-500/8 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-12 relative z-10">
          {/* 1. Section Header & Introduction */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-block text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-500">
              PURPOSE-BUILT FOR AGENTS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink font-heading tracking-tight leading-tight">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Turn Enquiries into Deals.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed font-normal">
              One organised workspace for your properties, buyers, WhatsApp requirements and brokerage pipeline.
            </p>
          </div>

          {/* 2 & 3. Product Demonstration Video Player & Format Switcher */}
          <div className="max-w-4xl mx-auto">
            {/* Format Selector Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  REAL PRODUCT WALKTHROUGH
                </span>
              </div>

              {/* Format Switcher: Desktop 16:9 vs Mobile 9:16 */}
              <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-full text-xs font-bold shadow-xs">
                <button
                  type="button"
                  onClick={() => setVideoMode('desktop')}
                  className={clsx(
                    'px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer',
                    videoMode === 'desktop'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop (16:9)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoMode('mobile')}
                  className={clsx(
                    'px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer',
                    videoMode === 'mobile'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile (9:16)</span>
                </button>
              </div>
            </div>

            {/* Apple-Class Framed Video Player Showcase */}
            <div className="p-2 sm:p-3 bg-white border border-slate-200/90 rounded-3xl sm:rounded-4xl shadow-2xl shadow-slate-200/60 max-w-5xl mx-auto">
              <div
                className={clsx(
                  'mx-auto rounded-2xl sm:rounded-3xl border border-slate-200 bg-slate-900 text-white relative overflow-hidden transition-all duration-500 group shadow-inner',
                  videoMode === 'desktop' ? 'aspect-video w-full' : 'aspect-[9/16] max-w-[340px] w-full'
                )}
              >
                {/* Embedded YouTube Player when active */}
                {isPlaying ? (
                  <iframe
                    className="w-full h-full border-0"
                    src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&mute=${isMuted ? 1 : 0}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`}
                    title="leadNivash Real-Time Workflow Demonstration"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative w-full h-full">
                    {/* Poster Preview */}
                    <img
                      src={
                        videoMode === 'desktop'
                          ? '/assets/images/leadnivash-desktop-poster.webp'
                          : '/assets/images/leadnivash-mobile-poster.webp'
                      }
                      alt="leadNivash Workflow Demo"
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        // Fallback to high-res property preview if webp not available
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />

                    {/* Dark Glass Overlay with Big Glowing Play Button */}
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center transition-opacity duration-300">
                      <button
                        type="button"
                        onClick={() => setIsPlaying(true)}
                        className="group/btn relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-600/40 hover:shadow-emerald-500/60 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
                        aria-label="Play YouTube Demonstration Video"
                      >
                        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-25 group-hover/btn:opacity-40" />
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1 transition-transform group-hover/btn:scale-110" />
                      </button>
                      <span className="mt-3 text-xs font-bold text-white/90 bg-black/40 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10">
                        Plays directly in browser • Autostarts in 5s
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 6. Compact Core Capabilities Strip (Apple-Class Light Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-4">
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
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                      {cap.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-tight mt-1">
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
      {/* SECTION 3 — HOW IT WORKS (Phase 3 Connected Workflow)     */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full relative overflow-hidden">
        {/* Subtle top ambient light-ray / sunburst */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[220px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-12">
          {/* 1. Section Header & Introduction */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-block text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-500">
              SIMPLE WORKFLOW
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink font-heading tracking-tight leading-tight">
              From WhatsApp Message to{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Property Deal.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed font-normal">
              Stop searching through endless chats and manually organising information. leadNivash helps you manage the entire workflow.
            </p>
          </div>

          {/* 3 & 4. Interactive Connected Progress Line & Stage Navigation */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-3 px-1">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Stage {activeWorkflowStep + 1} of 5 · Continuous Flow</span>
              </span>
              <button
                type="button"
                onClick={() => setIsWorkflowPaused(!isWorkflowPaused)}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer min-h-[36px]"
              >
                {isWorkflowPaused ? 'Resume Auto-Cycle' : 'Pause Flow'}
              </button>
            </div>

            {/* Responsive Stepper Bar */}
            <div className="relative mb-6 sm:mb-8">
              {/* Subtle connecting line across stages */}
              <div className="absolute top-5 inset-x-6 sm:inset-x-8 h-0.5 bg-slate-200 -z-0">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${(activeWorkflowStep / 4) * 100}%` }}
                />
              </div>

              {/* 5 Numbered Stage Indicators */}
              <div className="flex items-center justify-between relative z-10">
                {[
                  { num: '01', title: 'Paste', icon: MessageSquare },
                  { num: '02', title: 'AI Extraction', icon: Sparkles },
                  { num: '03', title: 'Save & Organise', icon: Layers },
                  { num: '04', title: 'Find Matches', icon: Search },
                  { num: '05', title: 'Share & Track', icon: Share2 },
                ].map((s, idx) => {
                  const Icon = s.icon;
                  const isActive = activeWorkflowStep === idx;
                  const isPassed = activeWorkflowStep > idx;

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
                          'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2',
                          isActive
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30 scale-110 ring-4 ring-emerald-500/20'
                            : isPassed
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-700'
                            : 'bg-white border-slate-300 text-slate-500 hover:border-slate-400'
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
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-4 sm:p-8 shadow-xl transition-all duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left Column: Stage Narrative & Action */}
                <div className="lg:col-span-5 space-y-4 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                    <span>
                      {activeWorkflowStep === 0 && 'STEP 01 — PASTE A MESSAGE'}
                      {activeWorkflowStep === 1 && 'STEP 02 — AI UNDERSTANDS IT'}
                      {activeWorkflowStep === 2 && 'STEP 03 — SAVE AND ORGANISE'}
                      {activeWorkflowStep === 3 && 'STEP 04 — FIND MATCHES'}
                      {activeWorkflowStep === 4 && 'STEP 05 — SHARE AND TRACK'}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading leading-snug">
                    {activeWorkflowStep === 0 && 'Paste a Message'}
                    {activeWorkflowStep === 1 && 'AI Understands It'}
                    {activeWorkflowStep === 2 && 'Save and Organise'}
                    {activeWorkflowStep === 3 && 'Find Matches'}
                    {activeWorkflowStep === 4 && 'Share and Track'}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {activeWorkflowStep === 0 &&
                      'Copy a buyer requirement or property listing from WhatsApp and paste it into leadNivash.'}
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
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-bold transition cursor-pointer min-h-[40px]"
                    >
                      <span>Next Stage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] text-slate-500 font-medium">Tap any step above to explore</span>
                  </div>
                </div>

                {/* Right Column: High-Fidelity Interactive Visual Simulation */}
                <div className="lg:col-span-7">
                  {/* Step 01 Visual: Realistic WhatsApp Message Bubble (Apple-Class Light Card) */}
                  {activeWorkflowStep === 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xl space-y-3.5 animate-hero-up text-slate-900">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold text-slate-700">WhatsApp Incoming Chat</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">10:42 AM · NCR Broker Group</span>
                      </div>
                      <div className="p-3.5 rounded-2xl rounded-tl-xs bg-emerald-50/90 border border-emerald-200 text-slate-900 text-xs sm:text-sm font-sans leading-relaxed shadow-xs">
                        "Need 3 BHK in Model Town, Panipat. Budget 1.25 Cr. Prefer lift and parking."
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="italic">* Fictional sample data for illustration</span>
                        <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                          1-Tap Quick Paste Ready
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Step 02 Visual: AI Extraction with Scanning Animation (Apple-Class Light Card) */}
                  {activeWorkflowStep === 1 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-500/30 shadow-xl space-y-3.5 relative overflow-hidden animate-hero-up text-slate-900">
                      {/* Scanning Light Beam */}
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse" />

                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-800">AI Entity Extraction Active</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-mono font-bold">4 Attributes Identified</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-left">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Property</span>
                          <span className="text-xs font-bold text-emerald-700">3 BHK Builder Floor</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Locality</span>
                          <span className="text-xs font-bold text-emerald-700">Model Town, Panipat</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Budget</span>
                          <span className="text-xs font-bold text-emerald-700">₹1.25 Cr</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Amenities</span>
                          <span className="text-xs font-bold text-emerald-700">Lift + Dedicated Parking</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                        <span>Zero manual typing required</span>
                        <span className="text-emerald-700 font-bold">Confidence: High</span>
                      </div>
                    </div>
                  )}

                  {/* Step 03 Visual: Save & Organise in Vault (Apple-Class Light Card) */}
                  {activeWorkflowStep === 2 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xl space-y-3.5 animate-hero-up text-slate-900">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-800">Buyer Record #LN-8492</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Saved to Vault
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-left shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Rajesh Sharma (Verified Buyer)</span>
                          <span className="text-xs font-extrabold text-emerald-700">₹1.25 Cr Max</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Seeking 3 BHK with lift in Model Town · Contact stored in encrypted vault
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Auto-indexed in 0.4s</span>
                        <span className="text-emerald-700 font-semibold">100% Privacy Preserved</span>
                      </div>
                    </div>
                  )}

                  {/* Step 04 Visual: Find Matches with Evaluation Score (Apple-Class Light Card) */}
                  {activeWorkflowStep === 3 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-500/30 shadow-xl space-y-3.5 animate-hero-up text-slate-900">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-800">Matching Engine Evaluation</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">2 Listings Compared</span>
                      </div>

                      {/* Best Matching Listing */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-emerald-500/60 shadow-md shadow-emerald-500/5 space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">3 BHK Luxury Floor · Model Town</span>
                          <span className="text-xs font-black text-emerald-800 font-heading bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                            96% Match*
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center justify-between">
                          <span>Demand: ₹1.22 Cr · 200 Gaj</span>
                          <span className="text-emerald-700 font-bold">Matches: Locality, Budget, Lift</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 italic text-left">
                        * Match score is an illustrative demo value showing multi-criteria correlation.
                      </p>
                    </div>
                  )}

                  {/* Step 05 Visual: Masked Flyer & Pipeline Tracker (Apple-Class Light Card) */}
                  {activeWorkflowStep === 4 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xl space-y-3.5 animate-hero-up text-slate-900">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-800">Masked Flyer Output & Deal Tracker</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Negotiation Stage
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-left shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                              Sharma Real Estate Agency
                            </span>
                            <h4 className="text-xs font-bold text-slate-900">3 BHK Builder Floor · Model Town</h4>
                          </div>
                          <span className="text-xs font-black text-emerald-700">₹1.22 Cr</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" /> Owner Contact Hidden
                          </span>
                          <span className="text-slate-600">Site Visit: Tomorrow 4 PM</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                        <span>Direct WhatsApp Share Ready</span>
                        <span className="text-emerald-700 font-bold">Commission Protected</span>
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
                desc: 'Copy a buyer requirement or property listing from WhatsApp and paste it into leadNivash.',
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
                    'group p-4 rounded-2xl text-left transition-all duration-300 cursor-pointer space-y-2 border',
                    isActive
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20 -translate-y-1'
                      : 'bg-surface/90 dark:bg-slate-900/80 border-border/80 dark:border-slate-800 hover:border-slate-400 hover:-translate-y-0.5'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={clsx(
                        'w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors',
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:text-emerald-600'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span
                      className={clsx(
                        'text-[10px] font-black uppercase tracking-widest',
                        isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted'
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
      {/* SECTION 4 — FEATURES (CORE CAPABILITIES SHOWCASE)          */}
      {/* ========================================================= */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-surface/50 border-y border-border/70 relative overflow-hidden">
        {/* Subtle top ambient light-ray effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[220px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-12 relative z-10">
          {/* 1. Section Header & Introduction */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-block text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-500">
              CORE CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink font-heading tracking-tight leading-tight">
              Everything Your Property Business Needs.{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                In One Place.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed font-normal">
              From organising properties and understanding WhatsApp enquiries to matching buyers and tracking commissions, leadNivash brings your brokerage workflow together.
            </p>
          </div>

          {/* Compact Section Sub-label */}
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold tracking-wide shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ONE WORKSPACE. SIX POWERFUL CAPABILITIES.
            </span>
          </div>

          {/* 2 & 3. 6 Main Feature Cards (3-column, 2-row layout on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* FEATURE 01 — SMART PROPERTY INVENTORY */}
            <div
              onClick={() => setSelectedFeature(selectedFeature === 0 ? null : 0)}
              className={clsx(
                'group p-5 sm:p-6 rounded-2xl bg-white border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 shadow-2xs',
                selectedFeature === 0
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                  : 'border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
              )}
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">FEATURE 01</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-heading">
                  Smart Property Inventory
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Keep all your property listings organised in one place, with important details and private owner information securely managed.
                </p>
              </div>

              {/* Lower Mini Product Visual (Apple-Class Light Card) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 space-y-2.5 animate-float shadow-2xs text-left">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-[10px] font-mono text-slate-500">Panipat Inventory · Listing #04</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Available
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">3 BHK Luxury Builder Floor</h4>
                  <p className="text-[11px] text-slate-500">Model Town · 200 Gaj (1800 Sq.Ft)</p>
                </div>
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-emerald-700">₹1.25 Cr</span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" /> Owner Contact Encrypted
                  </span>
                </div>
              </div>
            </div>

            {/* FEATURE 02 — BUYER REQUIREMENTS */}
            <div
              onClick={() => setSelectedFeature(selectedFeature === 1 ? null : 1)}
              className={clsx(
                'group p-5 sm:p-6 rounded-2xl bg-white border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 shadow-2xs',
                selectedFeature === 1
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                  : 'border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
              )}
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">FEATURE 02</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-heading">
                  Buyer Requirements
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Organise buyer preferences, budgets, preferred localities and property requirements without searching through old chats.
                </p>
              </div>

              {/* Lower Mini Product Visual (Apple-Class Light Card) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 space-y-2.5 shadow-2xs text-left">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-[10px] font-mono text-slate-500">Buyer Profile #LN-8492</span>
                  <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Hot Urgency
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">Rajesh Sharma</h4>
                    <span className="text-xs font-bold text-emerald-700">₹1.20 - 1.35 Cr</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Preferred: Model Town & Sector 11</p>
                </div>
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="text-emerald-700 font-semibold">3 BHK Floor · Lift & Parking</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 shadow-2xs">Loan Ready</span>
                </div>
              </div>
            </div>

            {/* FEATURE 03 — WHATSAPP ANALYZER */}
            <div
              onClick={() => setSelectedFeature(selectedFeature === 2 ? null : 2)}
              className={clsx(
                'group p-5 sm:p-6 rounded-2xl bg-white border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 shadow-2xs',
                selectedFeature === 2
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                  : 'border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
              )}
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">FEATURE 03</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-heading">
                  WhatsApp Message Analyzer
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Convert unstructured WhatsApp messages into structured buyer requirements and property information with AI assistance.
                </p>
              </div>

              {/* Lower Mini Product Visual (Apple-Class Light Card) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-emerald-200 relative overflow-hidden space-y-2 shadow-2xs text-left">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse" />
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[10px] font-mono text-slate-800 line-clamp-2 shadow-2xs">
                  "3 BHK builder floor, 2nd floor with lift, Model Town Panipat, 200 gaj, demand 1.25 Cr. Owner: 9876543210"
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[9px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">3 BHK</span>
                  <span className="text-[9px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">Model Town</span>
                  <span className="text-[9px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">₹1.25 Cr</span>
                  <span className="text-[9px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">200 Gaj</span>
                </div>
                <div className="text-[9px] text-slate-500 flex items-center justify-between pt-1">
                  <span className="text-emerald-700 font-semibold">AI Entity Extraction</span>
                  <span className="italic">Visual workflow illustration</span>
                </div>
              </div>
            </div>

            {/* FEATURE 04 — INTELLIGENT MATCHING */}
            <div
              onClick={() => setSelectedFeature(selectedFeature === 3 ? null : 3)}
              className={clsx(
                'group p-5 sm:p-6 rounded-2xl bg-white border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 shadow-2xs',
                selectedFeature === 3
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                  : 'border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
              )}
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">FEATURE 04</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-heading">
                  Intelligent Property Matching
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Compare buyer requirements against your property inventory and understand why a property matches.
                </p>
              </div>

              {/* Lower Mini Product Visual (Apple-Class Light Card) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-emerald-200 space-y-2 shadow-2xs text-left">
                <div className="flex items-center justify-between text-[10px] text-slate-700 border-b border-slate-200/80 pb-1.5">
                  <span className="font-semibold">Buyer: Rajesh S. (Max ₹1.25 Cr)</span>
                  <span className="text-emerald-700 font-mono font-bold">1 Inventory Match</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-200 flex items-center justify-between shadow-2xs">
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-900">3 BHK Luxury Floor</h5>
                    <p className="text-[10px] text-slate-500">Demand: ₹1.22 Cr · Model Town</p>
                  </div>
                  <span className="text-xs font-black text-emerald-700 font-heading bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    96% Match*
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 italic">
                  * Illustrative demo value. Explains match: Locality (Model Town), BHK (3 BHK), Budget (₹1.22 Cr ≤ ₹1.25 Cr).
                </p>
              </div>
            </div>

            {/* FEATURE 05 — MASKED PROPERTY FLYERS */}
            <div
              onClick={() => setSelectedFeature(selectedFeature === 4 ? null : 4)}
              className={clsx(
                'group p-5 sm:p-6 rounded-2xl bg-white border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 shadow-2xs',
                selectedFeature === 4
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                  : 'border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
              )}
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">FEATURE 05</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-heading">
                  Masked Property Flyers
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Create professional, agency-branded property flyers while protecting confidential owner contact information.
                </p>
              </div>

              {/* Lower Mini Product Visual (Apple-Class Light Card) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:rotate-1 hover:scale-[1.02] transition-transform duration-300 space-y-2 shadow-2xs text-left">
                <div className="flex items-center justify-between text-[10px] text-emerald-700 font-bold border-b border-slate-200/80 pb-1.5">
                  <span>Sharma Real Estate Agency</span>
                  <span className="text-slate-500 font-normal">leadNivash Safe Share</span>
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">3 BHK Luxury Floor · Model Town</h4>
                  <p className="text-[10px] text-emerald-700 font-extrabold">Demand: ₹1.22 Cr · 200 Gaj</p>
                </div>
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Owner Contact 100% Hidden
                  </span>
                  <span className="text-slate-700 font-bold">PDF / WhatsApp</span>
                </div>
              </div>
            </div>

            {/* FEATURE 06 — DEAL & COMMISSION TRACKING */}
            <div
              onClick={() => setSelectedFeature(selectedFeature === 5 ? null : 5)}
              className={clsx(
                'group p-5 sm:p-6 rounded-2xl bg-white border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 shadow-2xs',
                selectedFeature === 5
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                  : 'border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
              )}
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">FEATURE 06</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-heading">
                  Deal & Commission Tracking
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Follow opportunities through deal stages and keep track of expected and received brokerage commissions.
                </p>
              </div>

              {/* Lower Mini Product Visual (Apple-Class Light Card) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 shadow-2xs text-left">
                {/* 5-Stage Miniature Pipeline Track */}
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Interested</span>
                  <span>→</span>
                  <span className="text-slate-500">Shown</span>
                  <span>→</span>
                  <span className="text-emerald-800 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Negotiation
                  </span>
                  <span>→</span>
                  <span className="text-slate-500">Paid</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block">Deal: ₹1.25 Cr (1.5% Brokerage)</span>
                    <span className="text-xs font-black text-emerald-700">₹1,87,500 Expected</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    In 7 Days
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 italic">
                  * Clearly identified illustrative sample brokerage calculation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5 — FINANCIAL IMPACT (COMMISSION ROI CALCULATOR)  */}
      {/* ========================================================= */}
      <section id="financial-impact" className="py-16 sm:py-24 px-4 sm:px-6 bg-surface/50 border-y border-border/70 relative overflow-hidden">
        {/* Subtle top ambient light-ray effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[220px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-12 relative z-10">
          {/* 1. Section Header & Introduction */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-block text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-500">
              FINANCIAL IMPACT
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink font-heading tracking-tight leading-tight">
              Your Next Deal Could Be{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Worth More Than You Think.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed font-normal">
              Organise your opportunities, reduce missed matches and keep your brokerage pipeline moving.
            </p>
          </div>

          {/* 2. Interactive Financial Dashboard (Two-Column Layout) */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-emerald-950/5 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              
              {/* LEFT COLUMN: Financial Assumptions & Controls (7 Cols on desktop) */}
              <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 space-y-7 text-left">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-600" />
                    Brokerage Assumptions
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Adjust variables in real time
                  </span>
                </div>

                {/* INPUT 01 — PROPERTY DEAL VALUE */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-baseline">
                    <label htmlFor="deal-value-slider" className="text-xs font-bold text-slate-900">
                      Property Deal Value
                    </label>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-black text-emerald-700 font-mono">
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
                          dealValueRupees === pill.val
                            ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/30 font-extrabold'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-emerald-500/50 hover:text-slate-900'
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
                      aria-label="Property Deal Value Slider"
                    />
                    <div className="flex justify-between text-[10px] font-medium text-slate-500">
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
                    <span className="text-base font-black text-amber-600 font-mono">
                      {commissionRate}%
                    </span>
                  </div>

                  {/* Premium Segmented Controls (Touch-Friendly min 44px) */}
                  <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
                    {[1.0, 1.5, 2.0].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setCommissionRate(rate)}
                        className={clsx(
                          'py-2.5 text-xs font-extrabold rounded-lg transition-all duration-200 cursor-pointer text-center min-h-[44px] flex items-center justify-center active:scale-95',
                          commissionRate === rate
                            ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-emerald-500/40 font-black'
                            : 'text-slate-600 hover:text-slate-900'
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
                      Monthly Deals Closed
                    </label>
                    <span className="text-base font-black text-slate-900 font-mono">
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
                      aria-label="Monthly Deals Closed Slider"
                    />
                    <div className="flex justify-between text-[10px] font-medium text-slate-500">
                      <span>1 deal/month</span>
                      <span>5 deals/month</span>
                      <span>10 deals/month</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Calculated Commission Results (5 Cols on desktop) */}
              <div className="lg:col-span-5 p-5 sm:p-8 lg:p-10 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-slate-900/5 text-left flex flex-col justify-between space-y-7">
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-300">
                      PROJECTION SUMMARY
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                      Live Calculation
                    </span>
                  </div>

                  {/* RESULT 01: Estimated Commission Per Deal */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted block">
                      ESTIMATED COMMISSION PER DEAL
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-ink font-heading tracking-tight">
                      {formatINR(commissionPerDeal)}
                    </div>
                  </div>

                  {/* RESULT 02: Estimated Monthly Commission (Most Prominent) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-emerald-500/40 shadow-lg shadow-emerald-500/5 space-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      ESTIMATED MONTHLY COMMISSION
                    </div>
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 dark:text-emerald-400 font-heading tracking-tight drop-shadow-2xs">
                      {formatINR(monthlyCommission)}
                    </div>
                    <p className="text-[11px] text-muted font-medium pt-0.5">
                      Calculated across {monthlyDealsCount} deal{monthlyDealsCount > 1 ? 's' : ''} / month at {commissionRate}% brokerage
                    </p>
                  </div>

                  {/* RESULT 03: Projected Annual Brokerage */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted block">
                      PROJECTED ANNUAL BROKERAGE
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-heading">
                      {formatINR(annualCommission)}{' '}
                      <span className="text-xs font-semibold text-muted font-sans">/ year</span>
                    </div>
                  </div>

                  {/* 8. Financial Visualization: Velocity Scale (Apple-Class Light Card) */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                        Commission Scale Progression
                      </span>
                      <span className="text-emerald-700 font-mono text-[9px] font-bold">
                        1 Deal → Monthly → Annual
                      </span>
                    </div>

                    {/* Proportional visual bars */}
                    <div className="space-y-2 text-[10px]">
                      {/* 1 Deal */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                          <span>1 Deal ({commissionRate}%)</span>
                          <span className="font-mono text-slate-800 font-bold">{formatINR(commissionPerDeal)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-400 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(6, Math.min(100, (commissionPerDeal / annualCommission) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Monthly */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                          <span>Monthly ({monthlyDealsCount} Deals)</span>
                          <span className="font-mono text-emerald-700 font-bold">{formatINR(monthlyCommission)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(12, Math.min(100, (monthlyCommission / annualCommission) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Annual */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                          <span>Annual Velocity (12 Months)</span>
                          <span className="font-mono text-amber-700 font-bold">{formatINR(annualCommission)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full w-full transition-all duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 10. Financial Disclaimer */}
                <p className="text-[10px] text-muted leading-relaxed border-t border-border/60 dark:border-slate-800/80 pt-3">
                  Illustrative estimates based on your selected property value, commission percentage and number of monthly deals. Actual brokerage earnings depend on completed transactions and agreed commission terms. leadNivash does not guarantee income.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* BROKER CALCULATOR TOOLKIT SPOTLIGHT SECTION               */}
      {/* ========================================================= */}
      <section id="broker-toolkit" className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto w-full text-center relative overflow-hidden">
        <div className="space-y-10">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="inline-block text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-500">
              ESSENTIAL UTILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink font-heading tracking-tight leading-tight">
              Broker Calculator{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Toolkit
              </span>
            </h2>
            <p className="text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed font-normal">
              Access essential property calculators, including Area Conversion, Registry Charges, Home Loan EMI, and more — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <Link
              to="/app/tools/area"
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-500/50 hover:shadow-lg transition-all space-y-3 group cursor-pointer block"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Maximize2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading group-hover:text-emerald-700 transition">
                Area Unit Converter
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Convert Gaj, Marla (25 / 30.25 local standard), Biswa, Bigha, Kanal, and Sq. Feet instantly for north Indian registries.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:underline pt-1">
                Open Converter →
              </span>
            </Link>

            <Link
              to="/app/tools/registry"
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-500/50 hover:shadow-lg transition-all space-y-3 group cursor-pointer block"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading group-hover:text-emerald-700 transition">
                Registry & Stamp Duty
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Estimate official Haryana & Punjab circle rates, male (7%), female (5%), and joint registration charges with zero manual math.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:underline pt-1">
                Estimate Registry Fees →
              </span>
            </Link>

            <Link
              to="/app/tools/emi"
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-500/50 hover:shadow-lg transition-all space-y-3 group cursor-pointer block"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Calculator className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading group-hover:text-emerald-700 transition">
                Home Loan EMI
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Calculate accurate monthly EMI, principal-interest breakdown, and client eligibility for instant WhatsApp deal quotes.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:underline pt-1">
                Calculate Loan EMI →
              </span>
            </Link>

            <Link
              to="/app/tools/commission"
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-500/50 hover:shadow-lg transition-all space-y-3 group cursor-pointer block"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading group-hover:text-emerald-700 transition">
                Commission Split
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Compute 1% - 2% brokerage, agent agency share, and 50/50 co-broker splits with clean, shareable settlement sheets.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:underline pt-1">
                Split Commission →
              </span>
            </Link>
          </div>

          <div className="pt-2">
            <Link to="/app/tools">
              <Button size="md" pill className="font-bold text-xs shadow-md shadow-emerald-700/20 px-8 py-3">
                <span>Open Broker Calculator Toolkit</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6 — PRICING (TRANSPARENT INVESTMENT)              */}
      {/* ========================================================= */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto w-full relative overflow-hidden">
        {/* Subtle top ambient light-ray effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[220px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-14 relative z-10">
          {/* 1. Section Header & Introduction */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-block text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-500">
              TRANSPARENT INVESTMENT
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink font-heading tracking-tight leading-tight">
              Simple,{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                High-ROI Pricing.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed font-normal">
              Start with a free trial. Experience the workflow before deciding to upgrade.
            </p>
            <p className="text-xs text-muted/80 font-medium">
              No complicated pricing. Start simple and grow with your business.
            </p>
          </div>

          {/* 2. Exactly TWO Pricing Cards (Side-by-Side on Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            
            {/* PLAN ONE — STARTER PILOT */}
            <div className="group rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between text-left hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300 relative shadow-2xs">
              <div className="space-y-6">
                {/* Header & Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold shadow-xs">
                      <Zap className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-heading">
                        Starter Pilot
                      </h3>
                      <span className="text-[10px] text-slate-500 block">14-Day Free Evaluation</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider border border-slate-200">
                    FREE TO START
                  </span>
                </div>

                {/* Price Display */}
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-slate-900 font-heading tracking-tight">₹0</span>
                    <span className="text-xs font-bold text-slate-500">/ 14 Days Free Trial</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                    Explore the essential leadNivash workflow and experience an organised way to manage property enquiries.
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100 w-full" />

                {/* Feature Checklist with Explicit Limits */}
                <div className="space-y-3 text-xs text-slate-700">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                    INCLUDED IN STARTER PILOT:
                  </span>
                  {[
                    { text: 'Up to 15 property listings', limit: true },
                    { text: 'Up to 10 active buyer profiles', limit: true },
                    { text: 'WhatsApp Message Analyzer (10 parses)', limit: true },
                    { text: 'Basic Property Matching engine', limit: false },
                    { text: 'Standard single-photo shareable links', limit: false },
                    { text: 'Essential 5-stage deal pipeline', limit: false },
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="leading-snug">
                        {feat.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-8">
                <Link to="/register" className="block">
                  <Button variant="secondary" pill className="w-full text-xs font-bold py-3 flex items-center justify-center gap-2 group-hover:border-emerald-500/60 transition-colors">
                    <span>Start 14-Day Free Trial</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <span className="text-[10px] text-center text-slate-500 block mt-2">
                  No credit card required · Instant access
                </span>
              </div>
            </div>

            {/* PLAN TWO — FOUNDER ANNUAL PASS (Highlighted Plan) */}
            <div className="group rounded-3xl bg-gradient-to-b from-white via-white to-emerald-50/40 border-2 border-emerald-600/90 shadow-xl shadow-emerald-500/10 p-6 sm:p-8 flex flex-col justify-between text-left hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/15 hover:-translate-y-1.5 transition-all duration-300 relative">
              <div className="space-y-6">
                {/* Header & Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-1.5">
                        Founder Annual Pass
                      </h3>
                      <span className="text-[10px] text-emerald-700 font-semibold block">Full Broker OS</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                    FOUNDER OFFER
                  </span>
                </div>

                {/* Price Display */}
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-slate-900 font-heading tracking-tight">₹3,999</span>
                    <span className="text-xs font-bold text-slate-500">/ Per Year</span>
                  </div>
                  <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-emerald-100 border border-emerald-200 text-[11px] text-emerald-800 font-bold">
                    Approximately ₹333 / month{' '}
                    <span className="text-[10px] font-normal text-slate-500">(billed annually)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                    Everything you need to organise your property business, manage opportunities, and scale deal closings.
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-emerald-500/20 w-full" />

                {/* Feature Checklist */}
                <div className="space-y-3 text-xs text-slate-700">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 block">
                    EVERYTHING IN PILOT, PLUS:
                  </span>
                  {[
                    'Unlimited Property Listings (subject to fair-use limits)',
                    'Unlimited Buyer Management & Profiles',
                    'Full AI WhatsApp & Voice Parser (Unlimited)',
                    'Multi-Image & Video Walkthrough Public Hosting',
                    'Intelligent Auto-Matching with Reason Breakdown',
                    'Complete Deal & Commission Tracking Pipeline',
                    'Custom Agency Branding & Watermark Protection',
                    'Dedicated Priority WhatsApp & Phone Support',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="font-medium leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button with Button Shine */}
              <div className="pt-8">
                <Link to="/register" className="block">
                  <div className="btn-shine-wrapper w-full flex">
                    <div className="btn-shine-border" />
                    <button
                      type="button"
                      className="relative z-10 w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                    >
                      <span>Upgrade to Founder Pass</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Link>
                <span className="text-[10px] text-center text-slate-500 block mt-2">
                  14-day evaluation period included · Cancel anytime
                </span>
              </div>
            </div>
          </div>

          {/* 3. Compact Plan Comparison Strip */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Everything You Need to Get Started.
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed capability comparison between Starter Pilot and Founder Annual Pass.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                Plan Comparison
              </span>
            </div>

            {/* Comparison Table / Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 pr-4">Capability</th>
                    <th className="py-2.5 px-4 text-center">Starter Pilot</th>
                    <th className="py-2.5 pl-4 text-center text-emerald-700">
                      Founder Annual Pass
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {[
                    { cap: 'Trial Duration', p1: '14 Days Free', p2: '365 Days / Full Year' },
                    { cap: 'Property Listings', p1: 'Up to 15 listings', p2: 'Unlimited (plan limits)' },
                    { cap: 'Active Buyer Profiles', p1: 'Up to 10 profiles', p2: 'Unlimited (plan limits)' },
                    { cap: 'AI WhatsApp Parsing', p1: '10 messages / month', p2: 'Full AI & Voice (Unlimited)' },
                    { cap: 'Property Matching', p1: 'Basic Criteria', p2: 'Intelligent Auto-Matching' },
                    { cap: 'Public Property Flyers', p1: 'Single Photo Links', p2: 'Multi-Image & Video Hosting' },
                    { cap: 'Deal & Commission Tracking', p1: 'Essential Pipeline', p2: 'Full Deal & Commission Tracking' },
                    { cap: 'Custom Agency Branding', p1: '—', p2: 'Logo & Custom Watermark' },
                    { cap: 'Priority Support', p1: 'Community Support', p2: 'Dedicated WhatsApp & Phone' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="py-2.5 pr-4 font-semibold text-slate-900">{row.cap}</td>
                      <td className="py-2.5 px-4 text-center text-slate-500">{row.p1}</td>
                      <td className="py-2.5 pl-4 text-center font-bold text-emerald-700">
                        {row.p2}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Trust Note & FAQ Link */}
          <div className="text-center max-w-xl mx-auto space-y-2 pt-2">
            <p className="text-xs text-muted leading-relaxed">
              Your trial gives you time to experience leadNivash before choosing a paid plan.
            </p>
            <p className="text-xs text-muted">
              Have questions about pricing?{' '}
              <a
                href="#inquiry-form"
                className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Talk to our team</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7 — WHY CHOOSE leadNivash?                        */}
      {/* ========================================================= */}
      <section id="why-leadnivash" className="py-16 sm:py-24 px-4 sm:px-6 bg-surface/50 border-y border-border/70 relative overflow-hidden">
        {/* Subtle top ambient emerald sunrise / radial light effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[220px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-12 relative z-10">
          {/* Section Introduction */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-block text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-500">
              WHY LEADNIVASH
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink font-heading tracking-tight leading-tight">
              Built Around the Way Property Brokers{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Actually Work.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed font-normal">
              LeadNivash helps you organise property enquiries, find relevant matches, protect business relationships, and keep deals moving — all without depending on scattered WhatsApp messages and manual tracking.
            </p>
          </div>

          {/* 3 Primary Reason Feature Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch text-left">
            
            {/* CARD 1 — NEVER LOSE A MATCH */}
            <div className="group rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300 shadow-2xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Search className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    REASON 01
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 font-heading group-hover:text-emerald-700 transition-colors">
                    Never Lose a Match
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700">
                    Keep buyer requirements and property inventory organised so relevant opportunities are easier to identify.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    Stop searching through endless conversations to remember who needs what. Keep buyer requirements and property details organised, making it easier to discover relevant property matches.
                  </p>
                </div>
              </div>

              {/* Miniature Product-Style Illustration (Apple-Class Light Card) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-900 space-y-3 shadow-2xs">
                {/* Micro Buyer Requirement */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center border border-emerald-300">
                      RS
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-900 block">Rajesh Sharma</span>
                      <span className="text-[9px] text-slate-500 font-mono">3 BHK · Model Town · ₹1.25 Cr</span>
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    Buyer
                  </span>
                </div>

                {/* Animated Connection Bridge */}
                <div className="flex items-center justify-center gap-2 py-0.5">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-emerald-500" />
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-emerald-400 text-emerald-800 text-[10px] font-extrabold shadow-2xs">
                    <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                    96% Match
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-emerald-400/50 to-emerald-500" />
                </div>

                {/* Micro Property Listing */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-900 block">Luxury Builder Floor</span>
                    <span className="text-[9px] text-slate-500 font-mono">200 Gaj · Model Town · ₹1.22 Cr</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    Inventory
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 2 — PROTECT YOUR BUSINESS RELATIONSHIPS */}
            <div className="group rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300 shadow-2xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    REASON 02
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 font-heading group-hover:text-emerald-700 transition-colors">
                    Protect Your Business Relationships
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700">
                    Share property information professionally without exposing confidential owner contact details.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    Create branded, shareable property flyers while keeping sensitive owner contact information protected. Present properties professionally and maintain control over how your business information is shared.
                  </p>
                </div>
              </div>

              {/* Miniature Property Flyer Preview with Masked Owner (Apple-Class Light Card) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-900 space-y-3 shadow-2xs">
                {/* Agency Flyer Header */}
                <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-slate-200/80">
                  <span className="font-bold text-emerald-700">Sharma Real Estate Agency</span>
                  <span className="text-[9px] text-slate-500">Watermarked Flyer</span>
                </div>

                {/* Property Card Snippet */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
                    <img
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=140&auto=format&fit=crop&q=80"
                      alt="Floor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      3 BHK Floor · Model Town
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">
                      Demand: ₹1.25 Cr
                    </span>
                  </div>
                </div>

                {/* Masked Owner Privacy Vault Box */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-[10px] shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Owner Contact: <span className="font-mono text-slate-500 tracking-wider">●●●●●●8210</span></span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    Protected
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 3 — MANAGE MORE, WORK SMARTER */}
            <div className="group rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300 shadow-2xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <TrendingUp className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    REASON 03
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 font-heading group-hover:text-emerald-700 transition-colors">
                    Manage More, Work Smarter
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700">
                    Reduce repetitive manual work and keep deals and commissions organised.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    Spend less time manually entering information and tracking conversations. Organise properties, buyer requirements, deal progress, and commissions in one structured workflow.
                  </p>
                </div>
              </div>

              {/* Miniature Deal-Management Pipeline Interface (Apple-Class Light Card) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-900 space-y-3 shadow-2xs">
                {/* 4 Sample Deal Stages */}
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 border-b border-slate-200/80 pb-2">
                  <span className="text-slate-400">Enquiry</span>
                  <span>→</span>
                  <span className="text-slate-400">Shown</span>
                  <span>→</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200">
                    Negotiation
                  </span>
                  <span>→</span>
                  <span className="text-slate-400">Finalized</span>
                </div>

                {/* Active Deal & Commission Record */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Deal: 3 BHK Model Town</span>
                    <span className="text-[10px] font-mono text-slate-700 font-bold">₹1.25 Cr</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-slate-500">Brokerage (1.5%):</span>
                    <span className="text-xs font-black text-emerald-700 font-mono">₹1,87,500 Expected</span>
                  </div>
                </div>

                {/* Disclaimer */}
                <span className="text-[9px] text-slate-400 italic block pt-0.5">
                  * Illustrative sample workflow data
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7.5 — FREQUENTLY ASKED QUESTIONS (ACCORDION)      */}
      {/* ========================================================= */}
      <section id="faq-section" className="py-16 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold tracking-wider uppercase">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Got Questions? We Have Answers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Everything property brokers, realtors, and agency owners need to know about leadNivash.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does leadNivash protect my client and owner data from competitors?',
                a: 'Owner Vault Data Isolation guarantees that your listings, client inquiries, phone numbers, and commission agreements are strictly encrypted and visible ONLY to your authenticated account. No other broker or agency on the platform can ever view or access your private inventory.',
              },
              {
                q: 'What is Quick Chat and how does AI requirement matching work?',
                a: 'Quick Chat lets you speak or paste raw WhatsApp client messages (e.g., "3 BHK flat in Gurgaon under 1.5 Cr near Metro"). Our built-in intelligence instantly extracts budget, bedroom counts, property type, and location filters, automatically scoring and displaying genuine matching properties from your portfolio.',
              },
              {
                q: 'Can I use leadNivash on my phone without downloading from the App Store or Play Store?',
                a: 'Yes! leadNivash is engineered as an installable Progressive Web App (PWA). Simply open leadnivash.com on Chrome (Android) or Safari (iOS) and tap "Add to Home Screen" for an instant, native full-screen app experience with offline resilience.',
              },
              {
                q: 'Does data synchronize across my laptop and mobile phone in real time?',
                a: 'Yes. Any property or buyer added or updated in the field from your mobile immediately reflects on your office desktop or tablet, powered by cloud database synchronization and strict session management.',
              },
              {
                q: 'Can I share property flyers on WhatsApp without revealing the owner’s direct contact?',
                a: 'Absolutely. With one click, generate Masked Marketing Flyers and shareable cards containing your agency logo, property photos, pricing, and specs while completely concealing owner phone numbers and private addresses.',
              },
              {
                q: 'What tools are included in the 14-day free trial?',
                a: 'You get unrestricted access to all 4 broker utility engines: Stamp Duty & Circle Rate Calculator across major Indian states, EMI & Loan Eligibility Estimator, Commission Invoice Generator, and Land Unit Converter (Gaj, Bigha, Sq. Yd, Marla, Biswa).',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-2xs overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors focus:outline-none"
                  aria-expanded={openFaq === idx}
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 font-heading">
                    {faq.q}
                  </span>
                  <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>
                {openFaq === idx && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 8 — FINAL CTA AND FREE DEMO (INQUIRY FORM)        */}
      {/* ========================================================= */}
      <section id="demo-inquiry-section" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 p-6 sm:p-12 text-slate-900 shadow-2xl border border-emerald-500/25 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-3 mb-8">
            <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-slate-900">
              Ready to Turn Your Enquiries into Deals?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              See how leadNivash can simplify your property business. Request a free demo and start your 14-day free trial.
            </p>
          </div>

          {/* Inquiry Form */}
          {formSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-black text-slate-900 font-heading">
                Demo Request Received!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
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
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Active Properties Managed (Optional)
                  </label>
                  <select
                    value={formActiveProps}
                    onChange={(e) => setFormActiveProps(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs cursor-pointer min-h-[44px]"
                  >
                    <option value="1-10">1 to 10 properties</option>
                    <option value="10-50">10 to 50 properties</option>
                    <option value="50-100">50 to 100 properties</option>
                    <option value="100+">100+ properties</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Message / Specific Requirement (Optional)
                  </label>
                  <input
                    type="text"
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="Any specific questions or locality preferences?"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs min-h-[44px]"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <Button
                  type="submit"
                  size="lg"
                  pill
                  isLoading={formSubmitting}
                  className="w-full sm:w-auto font-bold text-xs min-h-[48px] py-3.5 px-8 flex items-center justify-center cursor-pointer active:scale-[0.98]"
                >
                  <span>Request My Free Demo</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>

                <p className="text-[11px] text-slate-500 text-center sm:text-left">
                  By submitting, you agree to our{' '}
                  <Link to="/terms" className="underline font-semibold text-emerald-700">Terms of Service</Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="underline font-semibold text-emerald-700">Privacy Policy</Link>.
                  Zero spam guaranteed.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 9 — MONUMENTAL BRAND FOOTER                       */}
      {/* ========================================================= */}
      <footer className="mt-auto relative bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 text-white overflow-hidden pt-16 sm:pt-24 pb-8 sm:pb-12 border-t border-emerald-900/40">
        {/* Ambient Radiant Emerald Glow Pool */}
        <div className="absolute inset-x-0 bottom-0 h-[450px] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-500/20 via-teal-900/10 to-transparent pointer-events-none blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Footer Grid: Brand + Quick Links + Support Channels */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/10 text-left">
            <div className="md:col-span-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center shadow">
                  <img src="/logo-icon.png" alt="leadNivash" className="w-full h-full object-contain" />
                </div>
                <span className="text-lg font-black tracking-tight text-white font-heading">
                  lead<span className="text-emerald-400">Nivash</span>
                </span>
              </div>
              <p className="text-xs text-emerald-200/70 leading-relaxed">
                India's #1 Real Estate Broker Operating System. AI-powered property matching, buyer CRM, and owner inventory protection.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-heading">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-emerald-200/70">
                <li><a href="#capabilities" className="hover:text-white transition">Core Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><Link to="/pricing" className="hover:text-white transition">Subscription Plans</Link></li>
                <li><a href="#demo-inquiry-section" className="hover:text-white transition">Book Live Demo</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-heading">
                Broker Utilities
              </h4>
              <ul className="space-y-2 text-xs text-emerald-200/70">
                <li><Link to="/tools" className="hover:text-white transition">Circle Rate & Stamp Duty</Link></li>
                <li><Link to="/tools" className="hover:text-white transition">EMI & Loan Eligibility</Link></li>
                <li><Link to="/tools" className="hover:text-white transition">Invoice Generator</Link></li>
                <li><Link to="/tools" className="hover:text-white transition">Land Area Unit Converter</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-heading">
                Direct Contact & Support
              </h4>
              <ul className="space-y-2.5 text-xs text-emerald-200/70">
                <li>
                  <a
                    href="tel:+919876543210"
                    className="inline-flex items-center gap-2 hover:text-white transition text-white/90"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+91 98765 43210</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contact@leadnivash.com"
                    className="inline-flex items-center gap-2 hover:text-white transition text-white/90"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>contact@leadnivash.com</span>
                  </a>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition">
                    Contact & Inquiry Desk &rarr;
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Massive Monumental Brand Typography (Reference 4 'Pumpkin' Style) */}
          <div className="relative w-full overflow-hidden select-none pointer-events-none text-center px-2 py-8 sm:py-16">
            <h2 className="text-[14vw] sm:text-[16vw] font-black tracking-tighter leading-none font-heading text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-emerald-400/10 drop-shadow-[0_20px_60px_rgba(4,120,87,0.35)]">
              leadNivash
            </h2>
          </div>

          {/* Footer Metadata & Legal Links */}
          <div className="mt-4 sm:mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/60 font-medium">
            <p>© {new Date().getFullYear()} leadNivash Inc. · India's #1 Real Estate Broker Operating System</p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
              <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              <span>·</span>
              <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
              <span>·</span>
              <Link to="/refund" className="hover:text-white transition">Refund Policy</Link>
              <span>·</span>
              <Link to="/cookies" className="hover:text-white transition">Cookie Policy</Link>
              <span>·</span>
              <Link to="/contact" className="hover:text-white transition">Support</Link>
              <span>·</span>
              <Link to="/login" className="hover:text-white transition">Broker Portal</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-950/30 transition-all duration-200 focus:outline-none cursor-pointer hover:scale-105 active:scale-95"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Floating WhatsApp Quick Consultation Pill (Visible on sm screens and above) */}
      <a
        href="https://wa.me/919876543210?text=Hi%20LeadNivash,%20I%20am%20interested%20in%20a%20demo%20of%20the%20Broker%20Platform."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-40 hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xl shadow-emerald-950/25 transition hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Chat on WhatsApp"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
        <span>Chat on WhatsApp</span>
      </a>
    </div>
  );
};
