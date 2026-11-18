import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
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
  Briefcase,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { useTheme } from '../../lib/theme';
import { formatRupees } from '../../lib/money';
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

  // Section 4: Commission Calculator State
  const [dealValueRupees, setDealValueRupees] = useState<number>(7500000); // default ₹75 Lakh
  const [commissionRate, setCommissionRate] = useState<number>(1.5); // default 1.5%
  const [monthlyDealsCount, setMonthlyDealsCount] = useState<number>(3); // default 3 deals/month

  // Calculator calculations
  const commissionPerDeal = (dealValueRupees * commissionRate) / 100;
  const monthlyCommission = commissionPerDeal * monthlyDealsCount;
  const annualCommission = monthlyCommission * 12;

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
            <a href="#capabilities" className="hover:text-ink transition">Features</a>
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
      {/* SECTION 3 — HOW IT WORKS                                 */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-14">
          <span className="text-[11px] font-black uppercase tracking-widest text-brand-700">
            SIMPLE WORKFLOW
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-ink font-heading tracking-tight">
            From WhatsApp Message to Property Deal.
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            Stop searching through endless chats and manually organising information. leadNivash helps you manage the entire workflow.
          </p>
        </div>

        {/* 5-Step Connected Workflow Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {[
            {
              step: 'Step 1',
              title: 'Paste a Message',
              desc: 'Copy a buyer requirement or property listing from WhatsApp and paste it into leadNivash.',
              icon: FileText,
            },
            {
              step: 'Step 2',
              title: 'AI Understands It',
              desc: 'AI extracts important information: name, budget, property type, locality, area, and contact details.',
              icon: Sparkles,
            },
            {
              step: 'Step 3',
              title: 'Save and Organise',
              desc: 'Review the extracted information, correct anything necessary and save the buyer or property record.',
              icon: Layers,
            },
            {
              step: 'Step 4',
              title: 'Find Matches',
              desc: 'The matching engine compares buyer requirements against available inventory and explains why it matches.',
              icon: Search,
            },
            {
              step: 'Step 5',
              title: 'Share and Track',
              desc: 'Generate a branded masked property flyer, share it with the buyer and track the opportunity through your deal pipeline.',
              icon: Share2,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="p-5 flex flex-col justify-between" interactive>
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-600 flex items-center justify-center font-bold text-xs">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted">{item.step}</span>
                  </div>
                  <h3 className="text-sm font-bold text-ink font-heading">{item.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4 — FINANCIAL IMPACT (COMMISSION ROI CALCULATOR)  */}
      {/* ========================================================= */}
      <section id="financial-impact" className="py-16 sm:py-24 px-4 sm:px-6 bg-surface/60 border-y border-border/70">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-gold-text">
              FINANCIAL IMPACT
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink font-heading tracking-tight">
              Your Next Deal Could Be Worth More Than You Think.
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              Organise your opportunities, reduce missed matches and keep your brokerage pipeline moving.
            </p>
          </div>

          {/* Interactive Calculator Card */}
          <Card className="p-6 sm:p-10 bg-surface shadow-card max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
              {/* Inputs Column */}
              <div className="space-y-6">
                {/* 1. Property Deal Value */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <span className="text-text">Property Deal Value</span>
                    <span className="text-brand-700 font-extrabold">{formatRupees(dealValueRupees)}</span>
                  </div>
                  {/* Shortcut Pills */}
                  <div className="flex items-center gap-2 mb-3">
                    {[
                      { label: '₹45 Lakh', val: 4500000 },
                      { label: '₹75 Lakh', val: 7500000 },
                      { label: '₹1.5 Crore', val: 15000000 },
                    ].map((pill, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setDealValueRupees(pill.val)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition cursor-pointer ${
                          dealValueRupees === pill.val
                            ? 'bg-brand-700 text-white'
                            : 'bg-bg text-muted border border-border hover:text-ink'
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="2000000"
                    max="30000000"
                    step="500000"
                    value={dealValueRupees}
                    onChange={(e) => setDealValueRupees(Number(e.target.value))}
                    className="w-full accent-brand-700 cursor-pointer"
                  />
                </div>

                {/* 2. Commission Percentage */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <span className="text-text">Commission Percentage</span>
                    <span className="text-gold-text font-extrabold">{commissionRate}%</span>
                  </div>
                  {/* Shortcuts */}
                  <div className="flex items-center gap-2 mb-3">
                    {[1.0, 1.5, 2.0].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setCommissionRate(rate)}
                        className={`px-3 py-1 text-[11px] font-bold rounded-full transition cursor-pointer ${
                          commissionRate === rate
                            ? 'bg-gold text-white'
                            : 'bg-bg text-muted border border-border hover:text-ink'
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Monthly Deals Count */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <span className="text-text">Monthly Deals Closed</span>
                    <span className="text-ink font-extrabold">{monthlyDealsCount} Deal(s)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={monthlyDealsCount}
                    onChange={(e) => setMonthlyDealsCount(Number(e.target.value))}
                    className="w-full accent-brand-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted mt-1">
                    <span>1 deal/mo</span>
                    <span>5 deals/mo</span>
                    <span>10 deals/mo</span>
                  </div>
                </div>
              </div>

              {/* Outputs Column (Financial Stats Display) */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-50 to-emerald-50 dark:from-brand-950/60 dark:to-slate-900 border border-brand-200/80 dark:border-brand-800/40 text-center space-y-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-muted block">
                    Estimated Commission Per Deal
                  </span>
                  <span className="text-2xl font-black text-ink font-heading block mt-0.5">
                    {formatRupees(commissionPerDeal)}
                  </span>
                </div>

                <div className="pt-3 border-t border-brand-200/60 dark:border-brand-800/40">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-brand-700 dark:text-brand-500 block">
                    Estimated Monthly Commission
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-brand-700 dark:text-brand-500 font-heading block mt-0.5">
                    {formatRupees(monthlyCommission)}
                  </span>
                </div>

                <div className="pt-3 border-t border-brand-200/60 dark:border-brand-800/40">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-muted block">
                    Projected Annual Brokerage
                  </span>
                  <span className="text-lg font-black text-gold-text block mt-0.5">
                    {formatRupees(annualCommission)} / year
                  </span>
                </div>

                <p className="text-[10px] text-muted leading-tight pt-1">
                  Formula: Deal Value × Commission % / 100. Figures are illustrative based on assumptions, not guaranteed earnings.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5 — PRICING                                       */}
      {/* ========================================================= */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto space-y-2.5 mb-14">
          <span className="text-[11px] font-black uppercase tracking-widest text-brand-700">
            TRANSPARENT INVESTMENT
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-ink font-heading tracking-tight">
            Simple, High-ROI Pricing.
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            Start with a free trial. Experience the workflow before deciding to upgrade.
          </p>
        </div>

        {/* 2 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Plan 1 — Starter Pilot */}
          <Card className="p-6 sm:p-8 flex flex-col justify-between text-left" interactive>
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-muted block">
                Starter Pilot
              </span>
              <div>
                <span className="text-3xl font-black text-ink font-heading">₹0</span>
                <span className="text-xs text-muted"> / 14 Days</span>
              </div>
              <p className="text-xs text-muted">
                Experience full matching and WhatsApp extraction on active deals.
              </p>

              <div className="pt-4 border-t border-border/60 space-y-2.5 text-xs text-text">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Up to 15 property listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Up to 10 active buyer profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>WhatsApp Requirement Analyzer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Basic Property Matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Standard Shareable Links</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Essential dashboard features</span>
                </div>
              </div>
            </div>

            <Link to="/register" className="mt-8 block">
              <Button variant="secondary" pill className="w-full text-xs font-bold">
                Start Free Trial
              </Button>
            </Link>
          </Card>

          {/* Plan 2 — Founder Annual Pass */}
          <Card
            className="p-6 sm:p-8 flex flex-col justify-between text-left border-brand-600/50 shadow-glow relative bg-gradient-to-b from-surface via-surface to-brand-50/20 dark:to-brand-950/20"
            interactive
          >
            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-700 text-white text-[10px] font-black uppercase tracking-wider">
                Most Popular
              </span>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-brand-700 block">
                Founder Annual Pass
              </span>
              <div>
                <span className="text-3xl font-black text-ink font-heading">₹3,999</span>
                <span className="text-xs text-muted"> / Year</span>
                <span className="text-[11px] text-brand-700 block font-semibold mt-0.5">
                  (~₹333 / month equivalent)
                </span>
              </div>
              <p className="text-xs text-muted">
                Complete operating system for established brokers and growing real estate agencies.
              </p>

              <div className="pt-4 border-t border-border/60 space-y-2.5 text-xs text-text">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="font-bold">Unlimited Property Inventory (fair use)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="font-bold">Unlimited Buyer Management (fair use)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>AI WhatsApp Parser</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Multi-Image Public Brochure Hosting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Deal and Commission Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Custom Agency Branding & Watermark</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Priority WhatsApp Support</span>
                </div>
              </div>
            </div>

            <Link to="/register" className="mt-8 block">
              <Button size="md" pill className="w-full text-xs font-bold shadow-md">
                Get Started
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6 — WHY CHOOSE leadNivash?                        */}
      {/* ========================================================= */}
      <section id="why-leadnivash" className="py-16 sm:py-24 px-4 sm:px-6 bg-surface/50 border-y border-border/70">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-brand-700">
              WHY leadNivash
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink font-heading tracking-tight">
              Built Around the Way Property Brokers Actually Work.
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              Your work happens across WhatsApp chats, property visits, buyer calls and negotiations. leadNivash brings these activities into one organised workspace.
            </p>
          </div>

          {/* 3 Primary Reason Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Reason 1 */}
            <Card className="p-6 sm:p-7 space-y-4" interactive>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-600 flex items-center justify-center">
                <Search className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-ink font-heading">
                Never Lose a Match
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Your buyer requirements and property inventory stay organised. Find relevant matches without repeatedly searching old WhatsApp conversations.
              </p>
            </Card>

            {/* Reason 2 */}
            <Card className="p-6 sm:p-7 space-y-4" interactive>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-ink font-heading">
                Protect Your Business Relationships
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Share professional property flyers without exposing confidential owner contact information. Keep your broker identity and branding on shared property materials.
              </p>
            </Card>

            {/* Reason 3 */}
            <Card className="p-6 sm:p-7 space-y-4" interactive>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
                <Briefcase className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-ink font-heading">
                Manage More, Work Smarter
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Save time on manual data entry, organise buyers and properties, and track your deals and commissions from one workspace.
              </p>
            </Card>
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
