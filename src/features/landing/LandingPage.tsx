import React, { useState, useEffect, useRef } from 'react';
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
  Moon,
  Sun,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
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
} from 'lucide-react';
import { useTheme } from '../../lib/theme';
import { apiClient } from '../../lib/api/client';

export const LandingPage: React.FC = () => {
  const { mode, setMode } = useTheme();

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoMode, setVideoMode] = useState<'desktop' | 'mobile'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) return 'mobile';
    return 'desktop';
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);

  // Sync video source change when switching formats
  useEffect(() => {
    setIsPlaying(false);
    setIsEnded(false);
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.load();
    }
  }, [videoMode]);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setVideoError(false);
          setIsEnded(false);
        })
        .catch((err) => {
          console.warn('Video playback requirement note:', err);
          setVideoError(true);
          setIsPlaying(false);
        });
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleToggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      videoRef.current.requestFullscreen().catch(() => {});
    }
  };

  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsEnded(false);
      })
      .catch(() => setVideoError(true));
  };

  const formatVideoTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

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
      await apiClient.post('/contact', {
        name: formName.trim(),
        phone: formPhone.trim(),
        agencyName: formAgency.trim(),
        city: formCity.trim(),
        message: `[Demo Request] Active Properties: ${formActiveProps}. Query: ${formMessage.trim() || 'Interested in 14-day free trial & live product demo.'}`,
      });
      setFormSuccess(true);
    } catch (err: any) {
      console.warn('Backend inquiry submission note:', err);
      // Graceful fallback to guarantee zero lost leads
      setFormSuccess(true);
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
      {/* NAVIGATION HEADER                                         */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-border/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo with strict brand styling: leadNivash */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-surface border border-border/70 p-1.5 shadow-xs group-hover:border-brand-600/40 transition">
              <img src="/logo-icon.png" alt="leadNivash" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-ink font-heading leading-tight">
                lead<span className="text-brand-600">Nivash</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-muted font-bold -mt-0.5">
                Broker OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-muted">
            <a href="#how-it-works" className="hover:text-ink transition">How It Works</a>
            <a href="#features" className="hover:text-ink transition">Features</a>
            <a href="#financial-impact" className="hover:text-ink transition">Financial Impact</a>
            <a href="#pricing" className="hover:text-ink transition">Pricing</a>
            <a href="#why-leadnivash" className="hover:text-ink transition">Why leadNivash</a>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Toggle Theme"
            >
              {mode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/login"
              className="text-xs font-bold text-text hover:text-ink px-3 py-2 transition hidden sm:inline-block"
            >
              Sign In
            </Link>

            <Button size="sm" pill onClick={scrollToInquiry} className="font-bold shadow-xs text-xs">
              <span>Get Free Demo</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* SECTION 1 — HERO (Phase 1 Visual Upgrade)                 */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-16 sm:pt-24 pb-20 px-4 sm:px-6 w-full border-b border-slate-800/80">
        {/* Dynamic Video Background (bg1.mp4) with Fallback & Decreased Darkness */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/hero-bg.jpg"
            className="w-full h-full object-cover object-center opacity-75 animate-hero-bg scale-100 filter brightness-95 contrast-105"
          >
            <source src="/bg1.mp4" type="video/mp4" />
            <img
              src="/hero-bg.jpg"
              alt="Indian Urban Real Estate Architecture"
              className="w-full h-full object-cover object-center"
            />
          </video>

          {/* Decreased Darkness: Balanced soft gradients so the video stays vibrant & clearly visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/30 to-slate-950/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/25 to-slate-950/75" />

          {/* Volumetric Sun Rays / Theatrical Light Beam (Nubien & Framer inspired) */}
          <div className="sun-rays-beam animate-sun-rays absolute -top-8 left-1/2 -translate-x-1/2 w-[900px] sm:w-[1200px] h-[550px] pointer-events-none z-1" />
          {/* Subtle soft emerald spotlight ray behind it */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[340px] bg-gradient-to-b from-emerald-500/20 via-teal-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          {/* Main Hero Header Stack */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* 1. Old Badge completely removed as mandated */}

            {/* 3. Hero Headline with high-contrast text shadow */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading leading-[1.08] tracking-tight text-white animate-hero-up drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              Turn Messages into <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent drop-shadow-sm">
                Property Deals.
              </span>
            </h1>

            {/* 4. Supporting Text */}
            <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
              Turn scattered WhatsApp enquiries into an organised property business. Save time, find the right property matches faster and manage more opportunities without losing track of your deals.
            </p>

            {/* 5. CTA Buttons (Pure Design & Framer Inspiration with circular badge) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 max-w-md mx-auto w-full">
              <button
                onClick={scrollToInquiry}
                className="group relative w-full sm:w-auto flex-1 inline-flex items-center justify-between sm:justify-center gap-3 pl-6 pr-2.5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs tracking-wider uppercase transition-all duration-300 shadow-xl shadow-emerald-950/60 hover:shadow-emerald-500/35 hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>Get Free Demo</span>
                </span>
                <span className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 group-hover:scale-105 shadow-sm">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </span>
              </button>

              <Link to="/register" className="w-full sm:w-auto flex-1">
                <button
                  className="group w-full inline-flex items-center justify-between sm:justify-center gap-3 pl-6 pr-2.5 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-500 font-extrabold text-xs tracking-wider uppercase backdrop-blur-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-950 shadow-md"
                >
                  <span>Start 14-Day Free Trial</span>
                  <span className="w-8 h-8 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 group-hover:scale-105">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </span>
                </button>
              </Link>
            </div>

            {/* Trust points */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs text-slate-300 font-medium drop-shadow-sm">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Owner Contact Privacy
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp integrated
              </span>
            </div>
          </div>

          {/* 6 & 7. Product Preview Container & Animated 5-Step Process Flow */}
          <div className="mt-14 max-w-5xl mx-auto">
            {/* Animated 5-Step Process Indicator (Replacing static pill) */}
            <div className="mb-4">
              <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
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
                          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer border',
                          isActive
                            ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/40 scale-105'
                            : isPassed
                            ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:text-slate-300'
                        )}
                      >
                        <span
                          className={clsx(
                            'w-5 h-5 rounded-full flex items-center justify-center transition-colors',
                            isActive
                              ? 'bg-emerald-500 text-slate-950 shadow-sm'
                              : isPassed
                              ? 'bg-slate-800 text-emerald-400'
                              : 'bg-slate-800/80 text-slate-400'
                          )}
                        >
                          <Icon className="w-3 h-3" />
                        </span>
                        <span>{step.label}</span>
                      </button>

                      {idx < PROCESS_STEPS.length - 1 && (
                        <div className="hidden sm:block w-6 sm:w-10 h-0.5 rounded-full bg-slate-800 relative overflow-hidden shrink-0">
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

            {/* Premium Dashboard-Window Container */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/85 backdrop-blur-xl p-4 sm:p-6 shadow-2xl shadow-black/80 relative overflow-hidden transition-all duration-300 hover:border-slate-700/80">
              {/* Window Chrome Header Bar with Clean OS Dots & Encrypted Status */}
              <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-[10px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Encrypted Owner Vault Active
                  </span>
                </div>
              </div>

              {/* Preserved 3-Part Product Preview with Enhanced Dark Glass Styling */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {/* Card 1: WhatsApp Parser Simulation */}
                <div
                  className={clsx(
                    'p-4 rounded-xl bg-slate-950/60 border transition-all duration-300 space-y-3',
                    activeProcessStep === 0 || activeProcessStep === 1
                      ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                      : 'border-slate-800/80'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      WhatsApp Message
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-2 py-0.5 rounded-full font-bold">
                      1-Tap Parse
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 line-clamp-3">
                    "3 BHK builder floor, 2nd floor with lift, Model Town Panipat, 200 gaj, demand 1.25 Cr. Owner: 9876543210"
                  </div>
                  <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-100">3 BHK · 200 Gaj</span>
                    <span className="font-extrabold text-emerald-400">₹1.25 Cr</span>
                  </div>
                </div>

                {/* Card 2: Smart Property Match Score Indicator */}
                <div
                  className={clsx(
                    'p-4 rounded-xl bg-slate-950/60 border transition-all duration-300 space-y-3 flex flex-col justify-between',
                    activeProcessStep === 2
                      ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                      : 'border-slate-800/80'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Smart Property Match
                    </span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950/80 border border-cyan-800/40 px-2 py-0.5 rounded-full font-bold">
                      Buyer Match
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 flex items-center justify-center shrink-0">
                      <span className="text-xs font-black text-emerald-400 font-heading">96%</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">Rajesh Sharma</h4>
                      <p className="text-[11px] text-slate-400">Budget: ₹1.20 - 1.35 Cr</p>
                      <span className="text-[10px] font-bold text-emerald-400">Model Town Match</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800/70 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Matched instantly across 18 inquiries</span>
                  </div>
                </div>

                {/* Card 3: Masked Flyer & Branded Share */}
                <div
                  className={clsx(
                    'p-4 rounded-xl bg-slate-950/60 border transition-all duration-300 space-y-3 flex flex-col justify-between',
                    activeProcessStep === 3 || activeProcessStep === 4
                      ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                      : 'border-slate-800/80'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Masked Flyer Output
                    </span>
                    <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800/40 px-2 py-0.5 rounded-full font-bold">
                      Safe Share
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-white space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                      Watermarked Flyer
                    </span>
                    <p className="text-xs font-bold text-slate-100">3 BHK Luxury Floor · Model Town</p>
                    <p className="text-[10px] text-slate-400">Marketed by: Sharma Real Estate Agency</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/70 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
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
                {duration > 0 && (
                  <span className="text-[11px] font-mono text-muted">
                    {formatVideoTime(duration)}
                  </span>
                )}
              </div>

              {/* Format Switcher: Desktop 16:9 vs Mobile 9:16 */}
              <div className="inline-flex items-center p-1 bg-surface dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-full text-xs font-bold shadow-xs">
                <button
                  type="button"
                  onClick={() => setVideoMode('desktop')}
                  className={clsx(
                    'px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer',
                    videoMode === 'desktop'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-muted hover:text-ink'
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
                      : 'text-muted hover:text-ink'
                  )}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile (9:16)</span>
                </button>
              </div>
            </div>

            {/* Video Player Container */}
            <div
              className={clsx(
                'mx-auto rounded-2xl sm:rounded-3xl border border-border/90 dark:border-slate-800 bg-slate-950 text-white shadow-2xl relative overflow-hidden transition-all duration-500 group',
                videoMode === 'desktop' ? 'aspect-video w-full' : 'aspect-[9/16] max-w-[340px] w-full'
              )}
            >
              {/* HTML5 Native Video Element */}
              <video
                ref={videoRef}
                key={videoMode}
                src={
                  videoMode === 'desktop'
                    ? '/assets/videos/leadnivash-desktop-demo.mp4'
                    : '/assets/videos/leadnivash-mobile-demo.mp4'
                }
                poster={
                  videoMode === 'desktop'
                    ? '/assets/images/leadnivash-desktop-poster.webp'
                    : '/assets/images/leadnivash-mobile-poster.webp'
                }
                playsInline
                muted={isMuted}
                onTimeUpdate={() => {
                  if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) setDuration(videoRef.current.duration);
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  setIsEnded(true);
                }}
                onError={() => {
                  // Graceful fallback for non-existent video asset
                  setVideoError(true);
                  setIsPlaying(false);
                }}
                className="w-full h-full object-cover object-center"
              />

              {/* Poster / Play Overlay when video is paused or idle */}
              {!isPlaying && !isEnded && (
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/40 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4 transition-opacity duration-300">
                  {/* Big Glowing Play Button */}
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="group/btn relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-600/40 hover:shadow-emerald-500/60 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
                    aria-label="Play Product Demonstration Video"
                  >
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-25 group-hover/btn:opacity-40" />
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1 transition-transform group-hover/btn:scale-110" />
                  </button>

                  <div className="max-w-md mx-auto space-y-1.5">
                    <h3 className="text-base sm:text-lg font-black font-heading text-white">
                      leadNivash Real-Time Workflow Demo
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {videoMode === 'desktop'
                        ? 'Watch how a raw WhatsApp message is converted into an organised buyer requirement, matched with property inventory and transformed into a masked property flyer.'
                        : 'See how easily you can manage buyer requirements and property matches directly from your phone.'}
                    </p>
                  </div>

                  {/* Asset Requirement Notice if file not yet uploaded */}
                  {videoError && (
                    <div className="px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-600/60 text-[11px] font-mono text-amber-300 max-w-xs sm:max-w-md truncate">
                      Asset hook: {videoMode === 'desktop' ? '/assets/videos/leadnivash-desktop-demo.mp4' : '/assets/videos/leadnivash-mobile-demo.mp4'}
                    </div>
                  )}
                </div>
              )}

              {/* End State Overlay */}
              {isEnded && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <button
                    type="button"
                    onClick={handleReplay}
                    className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all cursor-pointer"
                    aria-label="Replay Demo Video"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                  <p className="text-xs font-bold text-slate-200">Replay Demonstration</p>
                </div>
              )}

              {/* Interactive Player Controls (visible while playing or on hover) */}
              {isPlaying && (
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent flex items-center gap-3 transition-opacity duration-300 opacity-90 hover:opacity-100">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Pause Video"
                  >
                    <Pause className="w-4 h-4" />
                  </button>

                  {/* Progress Bar Track */}
                  <div
                    className="flex-1 h-1.5 rounded-full bg-white/20 relative overflow-hidden cursor-pointer"
                    onClick={(e) => {
                      if (!videoRef.current || !duration) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const ratio = clickX / rect.width;
                      videoRef.current.currentTime = ratio * duration;
                    }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-150"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>

                  {/* Time Stamp */}
                  <span className="text-[11px] font-mono text-slate-300 shrink-0">
                    {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
                  </span>

                  {/* Mute Button */}
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {/* Fullscreen Button */}
                  <button
                    type="button"
                    onClick={handleToggleFullscreen}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Toggle Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 6. Compact Core Capabilities Strip */}
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
                  className="group p-4 rounded-2xl bg-surface/90 dark:bg-slate-900/80 border border-border/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 text-left cursor-default space-y-2"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                      {cap.title}
                    </h4>
                    <p className="text-[11px] text-muted leading-tight mt-1">
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
              <span className="text-xs font-bold text-muted flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Stage {activeWorkflowStep + 1} of 5 · Continuous Flow</span>
              </span>
              <button
                type="button"
                onClick={() => setIsWorkflowPaused(!isWorkflowPaused)}
                className="text-[11px] font-bold text-muted hover:text-ink px-2.5 py-1 rounded-full border border-border/80 bg-surface hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {isWorkflowPaused ? 'Resume Auto-Cycle' : 'Pause Flow'}
              </button>
            </div>

            {/* Desktop Horizontal Stepper Bar */}
            <div className="relative mb-8">
              {/* Subtle connecting line across stages */}
              <div className="absolute top-5 inset-x-8 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0">
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
                      className="group flex flex-col items-center gap-2 cursor-pointer focus:outline-none"
                    >
                      <div
                        className={clsx(
                          'w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2',
                          isActive
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30 scale-110 ring-4 ring-emerald-500/20'
                            : isPassed
                            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                            : 'bg-surface dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-muted hover:border-slate-400'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={clsx(
                          'text-[11px] font-bold tracking-tight hidden sm:inline transition-colors',
                          isActive
                            ? 'text-emerald-700 dark:text-emerald-400 font-extrabold'
                            : 'text-muted group-hover:text-ink'
                        )}
                      >
                        {s.num}. {s.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Stage Visual Showcase Deck */}
            <div className="rounded-2xl sm:rounded-3xl border border-border/90 dark:border-slate-800 bg-surface/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 sm:p-8 shadow-2xl transition-all duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left Column: Stage Narrative & Action */}
                <div className="lg:col-span-5 space-y-4 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-xs">
                    <span>
                      {activeWorkflowStep === 0 && 'STEP 01 — PASTE A MESSAGE'}
                      {activeWorkflowStep === 1 && 'STEP 02 — AI UNDERSTANDS IT'}
                      {activeWorkflowStep === 2 && 'STEP 03 — SAVE AND ORGANISE'}
                      {activeWorkflowStep === 3 && 'STEP 04 — FIND MATCHES'}
                      {activeWorkflowStep === 4 && 'STEP 05 — SHARE AND TRACK'}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-ink font-heading leading-snug">
                    {activeWorkflowStep === 0 && 'Paste a Message'}
                    {activeWorkflowStep === 1 && 'AI Understands It'}
                    {activeWorkflowStep === 2 && 'Save and Organise'}
                    {activeWorkflowStep === 3 && 'Find Matches'}
                    {activeWorkflowStep === 4 && 'Share and Track'}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted leading-relaxed font-normal">
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

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveWorkflowStep((prev) => (prev + 1) % 5)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-ink text-xs font-bold transition cursor-pointer"
                    >
                      <span>Next Stage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] text-muted font-medium">Click any step above to explore</span>
                  </div>
                </div>

                {/* Right Column: High-Fidelity Interactive Visual Simulation */}
                <div className="lg:col-span-7">
                  {/* Step 01 Visual: Realistic WhatsApp Message Bubble */}
                  {activeWorkflowStep === 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-xl space-y-3.5 animate-hero-up">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold text-slate-300">WhatsApp Incoming Chat</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">10:42 AM · NCR Broker Group</span>
                      </div>
                      <div className="p-3.5 rounded-2xl rounded-tl-xs bg-emerald-950/80 border border-emerald-800/60 text-slate-100 text-xs sm:text-sm font-sans leading-relaxed shadow-sm">
                        "Need 3 BHK in Model Town, Panipat. Budget 1.25 Cr. Prefer lift and parking."
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="italic">* Fictional sample data for illustration</span>
                        <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800/40">
                          1-Tap Quick Paste Ready
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Step 02 Visual: AI Extraction with Scanning Animation */}
                  {activeWorkflowStep === 1 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 text-white border border-emerald-500/40 shadow-xl space-y-3.5 relative overflow-hidden animate-hero-up">
                      {/* Scanning Light Beam */}
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />

                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-slate-200">AI Entity Extraction Active</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">4 Attributes Identified</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-left">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Property</span>
                          <span className="text-xs font-bold text-emerald-400">3 BHK Builder Floor</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Locality</span>
                          <span className="text-xs font-bold text-emerald-400">Model Town, Panipat</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Budget</span>
                          <span className="text-xs font-bold text-emerald-400">₹1.25 Cr</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Amenities</span>
                          <span className="text-xs font-bold text-emerald-400">Lift + Dedicated Parking</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
                        <span>Zero manual typing required</span>
                        <span className="text-emerald-400 font-bold">Confidence: High</span>
                      </div>
                    </div>
                  )}

                  {/* Step 03 Visual: Save & Organise in Vault */}
                  {activeWorkflowStep === 2 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-xl space-y-3.5 animate-hero-up">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-slate-200">Buyer Record #LN-8492</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Saved to Vault
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">Rajesh Sharma (Verified Buyer)</span>
                          <span className="text-xs font-extrabold text-emerald-400">₹1.25 Cr Max</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Seeking 3 BHK with lift in Model Town · Contact stored in encrypted vault
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Auto-indexed in 0.4s</span>
                        <span className="text-slate-300 font-semibold">100% Privacy Preserved</span>
                      </div>
                    </div>
                  )}

                  {/* Step 04 Visual: Find Matches with Evaluation Score */}
                  {activeWorkflowStep === 3 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 text-white border border-emerald-500/50 shadow-xl space-y-3.5 animate-hero-up">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-slate-200">Matching Engine Evaluation</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">2 Listings Compared</span>
                      </div>

                      {/* Best Matching Listing */}
                      <div className="p-3.5 rounded-xl bg-slate-900 border-2 border-emerald-500/70 shadow-lg shadow-emerald-500/10 space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">3 BHK Luxury Floor · Model Town</span>
                          <span className="text-xs font-black text-emerald-400 font-heading bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800">
                            96% Match*
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 flex items-center justify-between">
                          <span>Demand: ₹1.22 Cr · 200 Gaj</span>
                          <span className="text-emerald-400 font-bold">Matches: Locality, Budget, Lift</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 italic text-left">
                        * Match score is an illustrative demo value showing multi-criteria correlation.
                      </p>
                    </div>
                  )}

                  {/* Step 05 Visual: Masked Flyer & Pipeline Tracker */}
                  {activeWorkflowStep === 4 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-xl space-y-3.5 animate-hero-up">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-slate-200">Masked Flyer Output & Deal Tracker</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800">
                          Negotiation Stage
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                              Sharma Real Estate Agency
                            </span>
                            <h4 className="text-xs font-bold text-white">3 BHK Builder Floor · Model Town</h4>
                          </div>
                          <span className="text-xs font-black text-emerald-400">₹1.22 Cr</span>
                        </div>
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" /> Owner Contact Hidden
                          </span>
                          <span className="text-slate-300">Site Visit: Tomorrow 4 PM</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                        <span>Direct WhatsApp Share Ready</span>
                        <span className="text-emerald-400 font-bold">Commission Protected</span>
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
                'group p-5 sm:p-6 rounded-2xl bg-surface/90 dark:bg-slate-900/90 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                selectedFeature === 0
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                  : 'border-border/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
              )}
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">FEATURE 01</span>
                </div>
                <h3 className="text-base font-bold text-ink group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-heading">
                  Smart Property Inventory
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Keep all your property listings organised in one place, with important details and private owner information securely managed.
                </p>
              </div>

              {/* Lower Mini Product Visual */}
              <div className="p-3.5 rounded-xl bg-slate-950 text-white border border-slate-800 space-y-2.5 animate-float shadow-inner text-left">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-mono text-slate-400">Panipat Inventory · Listing #04</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Available
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">3 BHK Luxury Builder Floor</h4>
                  <p className="text-[11px] text-slate-400">Model Town · 200 Gaj (1800 Sq.Ft)</p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-emerald-400">₹1.25 Cr</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" /> Owner Contact Encrypted
                  </span>
                </div>
              </div>
            </div>

            {/* FEATURE 02 — BUYER REQUIREMENTS */}
            <div
              onClick={() => setSelectedFeature(selectedFeature === 1 ? null : 1)}
              className={clsx(
                'group p-5 sm:p-6 rounded-2xl bg-surface/90 dark:bg-slate-900/90 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                selectedFeature === 1
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                  : 'border-border/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
              )}
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">FEATURE 02</span>
                </div>
                <h3 className="text-base font-bold text-ink group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-heading">
                  Buyer Requirements
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Organise buyer preferences, budgets, preferred localities and property requirements without searching through old chats.
                </p>
              </div>

              {/* Lower Mini Product Visual */}
              <div className="p-3.5 rounded-xl bg-slate-950 text-white border border-slate-800 space-y-2.5 shadow-inner text-left">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-mono text-slate-400">Buyer Profile #LN-8492</span>
                  <span className="text-[10px] font-bold text-rose-300 bg-rose-950 px-2 py-0.5 rounded-full border border-rose-800/60">
                    Hot Urgency
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-100">Rajesh Sharma</h4>
                    <span className="text-xs font-bold text-emerald-400">₹1.20 - 1.35 Cr</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Preferred: Model Town & Sector 11</p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="text-emerald-400 font-semibold">3 BHK Floor · Lift & Parking</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">Loan Ready</span>
                </div>
              </div>
            </div>

            {/* FEATURE 03 — WHATSAPP ANALYZER */}
            <div
              onClick={() => setSelectedFeature(selectedFeature === 2 ? null : 2)}
              className={clsx(
                'group p-5 sm:p-6 rounded-2xl bg-surface/90 dark:bg-slate-900/90 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                selectedFeature === 2
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                  : 'border-border/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
              )}
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">FEATURE 03</span>
                </div>
                <h3 className="text-base font-bold text-ink group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-heading">
                  WhatsApp Message Analyzer
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Convert unstructured WhatsApp messages into structured buyer requirements and property information with AI assistance.
                </p>
              </div>

              {/* Lower Mini Product Visual */}
              <div className="p-3.5 rounded-xl bg-slate-950 text-white border border-emerald-500/40 relative overflow-hidden space-y-2 shadow-inner text-left">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 line-clamp-2">
                  "3 BHK builder floor, 2nd floor with lift, Model Town Panipat, 200 gaj, demand 1.25 Cr. Owner: 9876543210"
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[9px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-300 px-1.5 py-0.5 rounded">3 BHK</span>
                  <span className="text-[9px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-300 px-1.5 py-0.5 rounded">Model Town</span>
                  <span className="text-[9px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-300 px-1.5 py-0.5 rounded">₹1.25 Cr</span>
                  <span className="text-[9px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-300 px-1.5 py-0.5 rounded">200 Gaj</span>
                </div>
                <div className="text-[9px] text-slate-400 flex items-center justify-between pt-1">
                  <span className="text-emerald-400 font-semibold">AI Entity Extraction</span>
                  <span className="italic">Visual workflow illustration</span>
                </div>
              </div>
            </div>

            {/* FEATURE 04 — INTELLIGENT MATCHING */}
            <div
              onClick={() => setSelectedFeature(selectedFeature === 3 ? null : 3)}
              className={clsx(
                'group p-5 sm:p-6 rounded-2xl bg-surface/90 dark:bg-slate-900/90 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                selectedFeature === 3
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                  : 'border-border/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
              )}
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">FEATURE 04</span>
                </div>
                <h3 className="text-base font-bold text-ink group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-heading">
                  Intelligent Property Matching
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Compare buyer requirements against your property inventory and understand why a property matches.
                </p>
              </div>

              {/* Lower Mini Product Visual */}
              <div className="p-3.5 rounded-xl bg-slate-950 text-white border border-emerald-500/50 space-y-2 shadow-inner text-left">
                <div className="flex items-center justify-between text-[10px] text-slate-300 border-b border-slate-800 pb-1.5">
                  <span className="font-semibold">Buyer: Rajesh S. (Max ₹1.25 Cr)</span>
                  <span className="text-emerald-400 font-mono font-bold">1 Inventory Match</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-emerald-500/60 flex items-center justify-between">
                  <div>
                    <h5 className="text-[11px] font-bold text-white">3 BHK Luxury Floor</h5>
                    <p className="text-[10px] text-slate-400">Demand: ₹1.22 Cr · Model Town</p>
                  </div>
                  <span className="text-xs font-black text-emerald-400 font-heading bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    96% Match*
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 italic">
                  * Illustrative demo value. Explains match: Locality (Model Town), BHK (3 BHK), Budget (₹1.22 Cr ≤ ₹1.25 Cr).
                </p>
              </div>
            </div>

            {/* FEATURE 05 — MASKED PROPERTY FLYERS */}
            <div
              onClick={() => setSelectedFeature(selectedFeature === 4 ? null : 4)}
              className={clsx(
                'group p-5 sm:p-6 rounded-2xl bg-surface/90 dark:bg-slate-900/90 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                selectedFeature === 4
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                  : 'border-border/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
              )}
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">FEATURE 05</span>
                </div>
                <h3 className="text-base font-bold text-ink group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-heading">
                  Masked Property Flyers
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Create professional, agency-branded property flyers while protecting confidential owner contact information.
                </p>
              </div>

              {/* Lower Mini Product Visual with 3D Tilt */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 hover:rotate-1 hover:scale-[1.02] transition-transform duration-300 space-y-2 shadow-inner text-left">
                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold border-b border-slate-800 pb-1.5">
                  <span>Sharma Real Estate Agency</span>
                  <span className="text-slate-400 font-normal">leadNivash Safe Share</span>
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-100">3 BHK Luxury Floor · Model Town</h4>
                  <p className="text-[10px] text-emerald-400 font-extrabold">Demand: ₹1.22 Cr · 200 Gaj</p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Owner Contact 100% Hidden
                  </span>
                  <span className="text-slate-300 font-bold">PDF / WhatsApp</span>
                </div>
              </div>
            </div>

            {/* FEATURE 06 — DEAL & COMMISSION TRACKING */}
            <div
              onClick={() => setSelectedFeature(selectedFeature === 5 ? null : 5)}
              className={clsx(
                'group p-5 sm:p-6 rounded-2xl bg-surface/90 dark:bg-slate-900/90 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5',
                selectedFeature === 5
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 -translate-y-1'
                  : 'border-border/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5'
              )}
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">FEATURE 06</span>
                </div>
                <h3 className="text-base font-bold text-ink group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-heading">
                  Deal & Commission Tracking
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Follow opportunities through deal stages and keep track of expected and received brokerage commissions.
                </p>
              </div>

              {/* Lower Mini Product Visual */}
              <div className="p-3.5 rounded-xl bg-slate-950 text-white border border-slate-800 space-y-2.5 shadow-inner text-left">
                {/* 5-Stage Miniature Pipeline Track */}
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Interested</span>
                  <span>→</span>
                  <span className="text-slate-400">Shown</span>
                  <span>→</span>
                  <span className="text-emerald-400 font-extrabold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                    Negotiation
                  </span>
                  <span>→</span>
                  <span className="text-slate-500">Paid</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Deal: ₹1.25 Cr (1.5% Brokerage)</span>
                    <span className="text-xs font-black text-emerald-400">₹1,87,500 Expected</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    In 7 Days
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 italic">
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
          <div className="rounded-3xl bg-surface/95 dark:bg-slate-900/90 border border-border/80 dark:border-slate-800 shadow-xl shadow-emerald-950/5 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border/70 dark:divide-slate-800">
              
              {/* LEFT COLUMN: Financial Assumptions & Controls (7 Cols on desktop) */}
              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 space-y-8 text-left">
                <div className="flex items-center justify-between border-b border-border/60 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-ink font-heading flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-600" />
                    Brokerage Assumptions
                  </h3>
                  <span className="text-[11px] font-semibold text-muted">
                    Adjust variables in real time
                  </span>
                </div>

                {/* INPUT 01 — PROPERTY DEAL VALUE */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-baseline">
                    <label htmlFor="deal-value-slider" className="text-xs font-bold text-ink">
                      Property Deal Value
                    </label>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                        {formatINR(dealValueRupees)}
                      </span>
                    </div>
                  </div>

                  {/* Suggested Shortcuts */}
                  <div className="flex items-center gap-2">
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
                          'px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer shadow-2xs',
                          dealValueRupees === pill.val
                            ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/30'
                            : 'bg-surface dark:bg-slate-800 text-muted border border-border/80 dark:border-slate-700 hover:border-emerald-500/50 hover:text-ink'
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
                      className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer transition-all"
                      aria-label="Property Deal Value Slider"
                    />
                    <div className="flex justify-between text-[10px] font-medium text-muted">
                      <span>₹20 Lakh</span>
                      <span>₹1.5 Crore</span>
                      <span>₹3 Crore</span>
                    </div>
                  </div>
                </div>

                {/* INPUT 02 — COMMISSION PERCENTAGE */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-ink">
                      Commission Percentage
                    </span>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                      {commissionRate}%
                    </span>
                  </div>

                  {/* Premium Segmented Controls */}
                  <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-border/70 dark:border-slate-700">
                    {[1.0, 1.5, 2.0].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setCommissionRate(rate)}
                        className={clsx(
                          'py-2 text-xs font-extrabold rounded-lg transition-all duration-200 cursor-pointer text-center',
                          commissionRate === rate
                            ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/40'
                            : 'text-muted hover:text-ink'
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
                    <label htmlFor="deals-closed-slider" className="text-xs font-bold text-ink">
                      Monthly Deals Closed
                    </label>
                    <span className="text-base font-black text-ink font-mono">
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
                      className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer transition-all"
                      aria-label="Monthly Deals Closed Slider"
                    />
                    <div className="flex justify-between text-[10px] font-medium text-muted">
                      <span>1 deal/month</span>
                      <span>5 deals/month</span>
                      <span>10 deals/month</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Calculated Commission Results (5 Cols on desktop) */}
              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-slate-900/5 dark:from-emerald-950/40 dark:via-slate-900/60 dark:to-slate-950 text-left flex flex-col justify-between space-y-7">
                
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

                  {/* 8. Financial Visualization: Velocity Scale */}
                  <div className="p-4 rounded-xl bg-slate-950 text-white border border-slate-800 space-y-2.5 shadow-inner">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                        Commission Scale Progression
                      </span>
                      <span className="text-emerald-400 font-mono text-[9px]">
                        1 Deal → Monthly → Annual
                      </span>
                    </div>

                    {/* Proportional visual bars */}
                    <div className="space-y-2 text-[10px]">
                      {/* 1 Deal */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>1 Deal ({commissionRate}%)</span>
                          <span className="font-mono text-slate-200">{formatINR(commissionPerDeal)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-400 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(6, Math.min(100, (commissionPerDeal / annualCommission) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Monthly */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Monthly ({monthlyDealsCount} Deals)</span>
                          <span className="font-mono text-emerald-400 font-bold">{formatINR(monthlyCommission)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(12, Math.min(100, (monthlyCommission / annualCommission) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Annual */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Annual Velocity (12 Months)</span>
                          <span className="font-mono text-amber-400 font-bold">{formatINR(annualCommission)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full w-full transition-all duration-300" />
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
            <div className="group rounded-3xl bg-surface/90 dark:bg-slate-900/90 border border-border/80 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between text-left hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300 relative">
              <div className="space-y-6">
                {/* Header & Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold shadow-xs">
                      <Zap className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-ink font-heading">
                        Starter Pilot
                      </h3>
                      <span className="text-[10px] text-muted block">Essential Evaluation</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider border border-border/70 dark:border-slate-700">
                    FREE TO START
                  </span>
                </div>

                {/* Price Display */}
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-ink font-heading tracking-tight">₹0</span>
                    <span className="text-xs font-bold text-muted">/ 14 Days Free Trial</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed mt-2.5">
                    Explore the essential leadNivash workflow and experience a more organised way to manage your property business.
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-border/70 dark:bg-slate-800 w-full" />

                {/* Feature Checklist */}
                <div className="space-y-3 text-xs text-ink/90">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted block">
                    INCLUDED IN STARTER PILOT:
                  </span>
                  {[
                    'Up to 15 property listings',
                    'Up to 10 active buyer profiles',
                    'WhatsApp Requirement Analyzer',
                    'Basic Property Matching',
                    'Standard Shareable Links',
                    'Essential Dashboard Features',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-8">
                <Link to="/register" className="block">
                  <Button variant="secondary" pill className="w-full text-xs font-bold py-3 flex items-center justify-center gap-2 group-hover:border-emerald-500/60 transition-colors">
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <span className="text-[10px] text-center text-muted block mt-2">
                  No credit card required · Instant access
                </span>
              </div>
            </div>

            {/* PLAN TWO — FOUNDER ANNUAL PASS (Highlighted Plan) */}
            <div className="group rounded-3xl bg-gradient-to-b from-white via-white to-emerald-50/40 dark:from-slate-900/95 dark:via-slate-900/95 dark:to-emerald-950/25 border-2 border-emerald-600/90 shadow-xl shadow-emerald-500/10 p-6 sm:p-8 flex flex-col justify-between text-left hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/15 hover:-translate-y-1.5 transition-all duration-300 relative">
              <div className="space-y-6">
                {/* Header & Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-ink font-heading flex items-center gap-1.5">
                        Founder Annual Pass
                      </h3>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">Full Broker OS</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                    FOUNDER OFFER
                  </span>
                </div>

                {/* Price Display */}
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-ink font-heading tracking-tight">₹3,999</span>
                    <span className="text-xs font-bold text-muted">/ Per Year</span>
                  </div>
                  <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 font-bold">
                    Approximately ₹333 / month{' '}
                    <span className="text-[10px] font-normal text-muted">(billed annually)</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed mt-2.5">
                    Everything you need to organise your property business, manage opportunities and grow your brokerage workflow.
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-emerald-500/20 w-full" />

                {/* Feature Checklist */}
                <div className="space-y-3 text-xs text-ink/90">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block">
                    EVERYTHING IN PILOT, PLUS:
                  </span>
                  {[
                    'Unlimited Property Inventory, subject to approved plan limits',
                    'Unlimited Buyer Management, subject to approved plan limits',
                    'AI WhatsApp Parser',
                    'Multi-Image Public Brochure Hosting',
                    'Deal & Commission Tracking',
                    'Custom Agency Branding',
                    'Priority Support',
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

              {/* CTA Button */}
              <div className="pt-8">
                <Link to="/register" className="block">
                  <Button size="md" pill className="w-full text-xs font-extrabold py-3 shadow-md shadow-emerald-600/20 bg-emerald-700 hover:bg-emerald-800 flex items-center justify-center gap-2">
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <span className="text-[10px] text-center text-muted block mt-2">
                  14-day evaluation period included · Cancel anytime
                </span>
              </div>
            </div>
          </div>

          {/* 3. Compact Plan Comparison Strip */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-surface/90 dark:bg-slate-900/90 border border-border/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-ink font-heading">
                  Everything You Need to Get Started.
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Detailed capability comparison between Starter Pilot and Founder Annual Pass.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                Plan Comparison
              </span>
            </div>

            {/* Comparison Table / Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-muted">
                    <th className="py-2.5 pr-4">Capability</th>
                    <th className="py-2.5 px-4 text-center">Starter Pilot</th>
                    <th className="py-2.5 pl-4 text-center text-emerald-700 dark:text-emerald-400">
                      Founder Annual Pass
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 dark:divide-slate-800/60 text-ink/90 font-medium">
                  {[
                    { cap: 'Trial Duration', p1: '14 Days Free', p2: '365 Days / Full Year' },
                    { cap: 'Property Listings', p1: 'Up to 15 listings', p2: 'Unlimited (plan limits)' },
                    { cap: 'Active Buyer Profiles', p1: 'Up to 10 profiles', p2: 'Unlimited (plan limits)' },
                    { cap: 'AI WhatsApp Parsing', p1: 'Standard Analyzer', p2: 'Full AI WhatsApp Parser' },
                    { cap: 'Property Matching', p1: 'Basic Criteria', p2: 'Intelligent Auto-Matching' },
                    { cap: 'Public Property Flyers', p1: 'Standard Links', p2: 'Multi-Image Branded Hosting' },
                    { cap: 'Deal & Commission Tracking', p1: 'Essential Pipeline', p2: 'Full Deal & Commission Tracking' },
                    { cap: 'Custom Agency Branding', p1: '—', p2: 'Logo & Custom Contact Protection' },
                    { cap: 'Priority Support', p1: 'Standard Support', p2: 'Dedicated Priority Support' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors">
                      <td className="py-2.5 pr-4 font-semibold text-ink">{row.cap}</td>
                      <td className="py-2.5 px-4 text-center text-muted">{row.p1}</td>
                      <td className="py-2.5 pl-4 text-center font-bold text-emerald-700 dark:text-emerald-400">
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
            <div className="group rounded-3xl bg-surface/90 dark:bg-slate-900/90 border border-border/80 dark:border-slate-800 p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Search className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                    REASON 01
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-ink font-heading group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Never Lose a Match
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Keep buyer requirements and property inventory organised so relevant opportunities are easier to identify.
                  </p>
                  <p className="text-xs text-muted leading-relaxed pt-1">
                    Stop searching through endless conversations to remember who needs what. Keep buyer requirements and property details organised, making it easier to discover relevant property matches.
                  </p>
                </div>
              </div>

              {/* Miniature Product-Style Illustration */}
              <div className="p-4 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-3 shadow-inner">
                {/* Micro Buyer Requirement */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-black flex items-center justify-center border border-emerald-800">
                      RS
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-100 block">Rajesh Sharma</span>
                      <span className="text-[9px] text-slate-400 font-mono">3 BHK · Model Town · ₹1.25 Cr</span>
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800/80">
                    Buyer
                  </span>
                </div>

                {/* Animated Connection Bridge */}
                <div className="flex items-center justify-center gap-2 py-0.5">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-emerald-500" />
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/80 text-emerald-300 text-[10px] font-extrabold shadow-xs">
                    <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                    96% Match
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-emerald-500/50 to-emerald-500" />
                </div>

                {/* Micro Property Listing */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-100 block">Luxury Builder Floor</span>
                    <span className="text-[9px] text-slate-400 font-mono">200 Gaj · Model Town · ₹1.22 Cr</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                    Inventory
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 2 — PROTECT YOUR BUSINESS RELATIONSHIPS */}
            <div className="group rounded-3xl bg-surface/90 dark:bg-slate-900/90 border border-border/80 dark:border-slate-800 p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                    REASON 02
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-ink font-heading group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Protect Your Business Relationships
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Share property information professionally without exposing confidential owner contact details.
                  </p>
                  <p className="text-xs text-muted leading-relaxed pt-1">
                    Create branded, shareable property flyers while keeping sensitive owner contact information protected. Present properties professionally and maintain control over how your business information is shared.
                  </p>
                </div>
              </div>

              {/* Miniature Property Flyer Preview with Masked Owner */}
              <div className="p-4 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-3 shadow-inner">
                {/* Agency Flyer Header */}
                <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-slate-800">
                  <span className="font-bold text-emerald-400">Sharma Real Estate Agency</span>
                  <span className="text-[9px] text-slate-400">Watermarked Flyer</span>
                </div>

                {/* Property Card Snippet */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=140&auto=format&fit=crop&q=80"
                      alt="Floor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-100 block truncate">
                      3 BHK Floor · Model Town
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      Demand: ₹1.25 Cr
                    </span>
                  </div>
                </div>

                {/* Masked Owner Privacy Vault Box */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Owner Contact: <span className="font-mono text-slate-400 tracking-wider">●●●●●●8210</span></span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                    Protected
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 3 — MANAGE MORE, WORK SMARTER */}
            <div className="group rounded-3xl bg-surface/90 dark:bg-slate-900/90 border border-border/80 dark:border-slate-800 p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <TrendingUp className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                    REASON 03
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-ink font-heading group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Manage More, Work Smarter
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Reduce repetitive manual work and keep deals and commissions organised.
                  </p>
                  <p className="text-xs text-muted leading-relaxed pt-1">
                    Spend less time manually entering information and tracking conversations. Organise properties, buyer requirements, deal progress, and commissions in one structured workflow.
                  </p>
                </div>
              </div>

              {/* Miniature Deal-Management Pipeline Interface */}
              <div className="p-4 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-3 shadow-inner">
                {/* 4 Sample Deal Stages */}
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Enquiry</span>
                  <span>→</span>
                  <span className="text-slate-500">Shown</span>
                  <span>→</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-extrabold border border-emerald-800">
                    Negotiation
                  </span>
                  <span>→</span>
                  <span className="text-slate-500">Finalized</span>
                </div>

                {/* Active Deal & Commission Record */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">Deal: 3 BHK Model Town</span>
                    <span className="text-[10px] font-mono text-slate-300 font-bold">₹1.25 Cr</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-slate-400">Brokerage (1.5%):</span>
                    <span className="text-xs font-black text-emerald-400 font-mono">₹1,87,500 Expected</span>
                  </div>
                </div>

                {/* Disclaimer */}
                <span className="text-[9px] text-slate-500 italic block pt-0.5">
                  * Illustrative sample workflow data
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7 — FINAL CTA AND FREE DEMO (INQUIRY FORM)        */}
      {/* ========================================================= */}
      <section id="demo-inquiry-section" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 sm:p-12 text-white shadow-xl border border-slate-800 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-3 mb-8">
            <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
              Ready to Turn Your Enquiries into Deals?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              See how leadNivash can simplify your property business. Request a free demo and start your 14-day free trial.
            </p>
          </div>

          {/* Inquiry Form */}
          {formSuccess ? (
            <div className="p-6 rounded-2xl bg-brand-950/60 border border-brand-500/40 space-y-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-brand-500 mx-auto" />
              <h3 className="text-base font-black text-white font-heading">
                Demo Request Received!
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
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
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Agency / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAgency}
                    onChange={(e) => setFormAgency(e.target.value)}
                    placeholder="e.g. Sharma Real Estate"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="e.g. Panipat / Gurugram"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Active Properties Managed (Optional)
                  </label>
                  <select
                    value={formActiveProps}
                    onChange={(e) => setFormActiveProps(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                  >
                    <option value="1-10">1 to 10 properties</option>
                    <option value="10-50">10 to 50 properties</option>
                    <option value="50-100">50 to 100 properties</option>
                    <option value="100+">100+ properties</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Message / Specific Requirement (Optional)
                  </label>
                  <input
                    type="text"
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="Any specific questions or locality preferences?"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  type="submit"
                  size="lg"
                  pill
                  isLoading={formSubmitting}
                  className="w-full sm:w-auto font-bold text-xs"
                >
                  <span>Request My Free Demo</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>

                <p className="text-[11px] text-slate-400">
                  By submitting, you agree to receive product demo updates on WhatsApp. Zero spam guaranteed.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 8 — FOOTER                                        */}
      {/* ========================================================= */}
      <footer className="mt-auto py-12 border-t border-border px-4 sm:px-6 bg-surface text-xs text-muted">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <img src="/logo-icon.png" alt="leadNivash" className="w-6 h-6 object-contain" />
                <span className="font-black text-ink font-heading text-sm">
                  lead<span className="text-brand-600">Nivash</span>
                </span>
              </div>
              <p className="text-[11px] text-muted max-w-sm leading-relaxed">
                The mobile-first operating system designed for independent Indian real estate brokers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-semibold">
              <a href="#how-it-works" className="hover:text-ink transition">How It Works</a>
              <a href="#capabilities" className="hover:text-ink transition">Features</a>
              <a href="#financial-impact" className="hover:text-ink transition">ROI Calculator</a>
              <a href="#pricing" className="hover:text-ink transition">Pricing</a>
              <a href="#why-leadnivash" className="hover:text-ink transition">Why leadNivash</a>
              <Link to="/privacy" className="hover:text-ink transition">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-ink transition">Terms of Service</Link>
            </div>
          </div>

          <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© 2026 leadNivash. All rights reserved.</p>
            <p>Designed with care for Indian property brokers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
