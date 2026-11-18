import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Share2,
  Lock,
  Calculator,
  Check,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '../../lib/theme';
import { formatRupees } from '../../lib/money';

export const LandingPage: React.FC = () => {
  const { mode, setMode } = useTheme();

  // Interactive Commission Calculator State
  const [dealsCount, setDealsCount] = useState<number>(3);
  const [avgTicketLakhs, setAvgTicketLakhs] = useState<number>(85); // ₹85 Lakhs avg ticket
  const brokerageRate = 0.01; // 1% typical broker commission

  const totalDealValueRupees = dealsCount * avgTicketLakhs * 100000;
  const estimatedCommissionRupees = totalDealValueRupees * brokerageRate;

  // Sample quick-paste messages simulation (Smudge style)
  const sampleMessages = [
    {
      title: '3 BHK Builder Floor',
      text: 'Urgent sale: 3 BHK luxury builder floor, 2nd floor with lift, Model Town Panipat, 200 gaj, demand 1.25 Cr negotiable. Owner: 9876543210',
      extracted: { bhk: '3 BHK', size: '200 Gaj', loc: 'Model Town, Panipat', price: '₹1.25 Cr', match: '96% Match' },
    },
    {
      title: 'Commercial Retail Shop',
      text: 'Commercial shop for rent in Sector 12 HUDA market, ground floor 450 sqft, prime location facing main road. Rent 45k/month. Owner Sharma ji',
      extracted: { bhk: 'Shop', size: '450 Sq.Ft', loc: 'Sector 12, Panipat', price: '₹45,000/mo', match: '92% Match' },
    },
    {
      title: 'Buyer Query',
      text: 'Looking for 4 BHK duplex or independent villa in Ansals or Sushant City, budget around 2.5 to 3 Crore, ready to move immediate registry',
      extracted: { bhk: '4 BHK Villa', size: 'Duplex', loc: 'Ansals / Sushant City', price: '₹2.5 - 3.0 Cr', match: '3 Inventory Matches' },
    },
  ];
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const activeSample = sampleMessages[selectedSampleIndex];

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col selection:bg-brand-50 selection:text-brand-700">
      {/* Ambient Top Glow (Smudge / Emitra style) */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-brand-500/5 to-transparent blur-3xl dark:from-emerald-500/15" />

      {/* Top Floating Navbar (Emitra style) */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-border/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo with Brand Swoop */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-surface border border-border/70 p-1.5 shadow-sm group-hover:border-brand-600/40 transition">
              <img src="/logo-icon.png" alt="LeadNivesh Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-ink font-heading leading-tight">
                Lead<span className="text-brand-600">Nivesh</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-muted font-bold -mt-0.5">
                Broker OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-muted">
            <a href="#how-it-works" className="hover:text-ink transition">How It Works</a>
            <a href="#features" className="hover:text-ink transition">Features</a>
            <a href="#roi-calculator" className="hover:text-ink transition">Commission ROI</a>
            <a href="#pricing" className="hover:text-ink transition">Pricing</a>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle Theme"
            >
              {mode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/login"
              className="text-xs font-bold text-text hover:text-ink px-3 py-2 transition"
            >
              Sign In
            </Link>

            <Link to="/register">
              <Button size="sm" pill className="font-bold shadow-sm">
                <span>Start Free Trial</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (WizardZ + Smudge inspiration) */}
      <section className="relative pt-16 sm:pt-24 pb-16 px-4 sm:px-6 text-center max-w-5xl mx-auto">
        {/* Micro-Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/60 dark:bg-brand-950/40 dark:border-brand-800/40 text-brand-700 dark:text-brand-600 text-xs font-bold mb-6 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
          <span>Pilot Active in Panipat & Delhi-NCR</span>
          <span className="text-muted/60">·</span>
          <span className="font-normal text-muted dark:text-slate-400">v1.0 Production Ready</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-ink font-heading leading-[1.1] tracking-tight max-w-4xl mx-auto">
          Turn WhatsApp Chaos into{' '}
          <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">
            Closed Property Deals.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-muted mt-5 max-w-2xl mx-auto leading-relaxed">
          The fast, mobile-first operating system built for independent Indian real estate brokers.
          Extract listings from chats in seconds, auto-match buyers, and send branded photo flyers with{' '}
          <span className="font-bold text-ink">100% Owner Contact Protection</span>.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8 max-w-md mx-auto">
          <Link to="/register" className="w-full sm:w-auto flex-1">
            <Button size="lg" pill className="w-full shadow-lg shadow-brand-700/20 text-sm">
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <a href="#how-it-works" className="w-full sm:w-auto flex-1">
            <Button variant="secondary" size="lg" pill className="w-full text-sm">
              See How It Works
            </Button>
          </a>
        </div>

        {/* Micro trust indicators */}
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" /> No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" /> WhatsApp integrated
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" /> Encrypted Owner Vault
          </span>
        </div>

        {/* Interactive Quick-Paste Preview Container (Smudge & Quixotic Card) */}
        <div className="mt-12 max-w-3xl mx-auto">
          <Card className="p-4 sm:p-6 text-left border-border/80 shadow-card relative overflow-hidden bg-surface/90 backdrop-blur-sm">
            {/* Upper label bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-600">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                    Interactive Live Demo: Paste Message & Match
                  </h3>
                  <p className="text-[11px] text-muted">Click a sample to test instant extraction</p>
                </div>
              </div>

              {/* Sample Selector Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {sampleMessages.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSampleIndex(idx)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                      selectedSampleIndex === idx
                        ? 'bg-brand-700 text-white shadow-xs'
                        : 'bg-bg text-muted hover:text-ink border border-border/60'
                    }`}
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Paste Input Simulation Box */}
            <div className="mt-4 p-3.5 rounded-xl bg-bg border border-border/80 text-xs text-text font-mono leading-relaxed relative">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1 font-sans">
                Raw Forwarded WhatsApp Text:
              </span>
              "{activeSample.text}"
            </div>

            {/* AI Extraction & Match Output Pill Row */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-surface border border-border/70">
                <span className="text-[10px] uppercase font-bold text-muted block">Property Type</span>
                <span className="text-xs font-extrabold text-ink block mt-0.5">{activeSample.extracted.bhk}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border/70">
                <span className="text-[10px] uppercase font-bold text-muted block">Locality</span>
                <span className="text-xs font-extrabold text-ink block mt-0.5 truncate">{activeSample.extracted.loc}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border/70">
                <span className="text-[10px] uppercase font-bold text-muted block">Extracted Price</span>
                <span className="text-xs font-extrabold text-brand-700 dark:text-brand-600 block mt-0.5">{activeSample.extracted.price}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border/70 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-muted block">Instant Match</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-brand-700 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-full w-fit">
                  <Sparkles className="w-3 h-3" />
                  {activeSample.extracted.match}
                </span>
              </div>
            </div>

            {/* Owner Vault Safety Note */}
            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-muted">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Owner phone safely locked in <strong className="text-ink">Owner Vault</strong> — zero leak on flyers.</span>
              </div>
              <Link to="/register" className="text-brand-700 font-bold hover:underline flex items-center gap-1">
                Try with your listings <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* High-Contrast Metrics Bar (WizardZ Reference 4) */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 sm:p-10 text-white shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-brand-500 tracking-tight font-heading block">
                +180%
              </span>
              <p className="text-xs text-slate-300 font-semibold">Faster Inquiry Matching</p>
              <span className="text-[10px] text-slate-400 block">Instant BHK & locality scan</span>
            </div>

            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-brand-500 tracking-tight font-heading block">
                &lt; 60s
              </span>
              <p className="text-xs text-slate-300 font-semibold">Chat to Masked Flyer</p>
              <span className="text-[10px] text-slate-400 block">Watermarked with your agency</span>
            </div>

            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-brand-500 tracking-tight font-heading block">
                100%
              </span>
              <p className="text-xs text-slate-300 font-semibold">Owner Contact Privacy</p>
              <span className="text-[10px] text-slate-400 block">Locked in your private vault</span>
            </div>

            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-brand-500 tracking-tight font-heading block">
                ₹0
              </span>
              <p className="text-xs text-slate-300 font-semibold">Commission Leakage</p>
              <span className="text-[10px] text-slate-400 block">Direct deals, no bypass</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Solution Cards (WizardZ + Quixotic) */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="brand" pill dot className="mb-3">
            Simple 4-Step Operating Workflow
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-ink font-heading tracking-tight">
            Designed for How Indian Property Brokers Work
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-2">
            No complex desktop software. Everything works effortlessly from your smartphone over WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Step 1 */}
          <Card className="p-6 flex flex-col justify-between" interactive>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-600 flex items-center justify-center">
                <FileText className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-700">Step 01</span>
              <h3 className="text-base font-bold text-ink font-heading">Paste WhatsApp Chat</h3>
              <p className="text-xs text-muted leading-relaxed">
                Copy raw property listings or buyer queries from your WhatsApp groups and paste directly into LeadNivesh.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-border/50 text-[11px] font-semibold text-brand-700 flex items-center gap-1">
              Instant AI Extraction <ArrowRight className="w-3 h-3" />
            </div>
          </Card>

          {/* Step 2 */}
          <Card className="p-6 flex flex-col justify-between" interactive>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Step 02</span>
              <h3 className="text-base font-bold text-ink font-heading">Auto-Match Inquiries</h3>
              <p className="text-xs text-muted leading-relaxed">
                The matching engine scores your inventory against active buyer leads with clear percentage match grades.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-border/50 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
              BHK & Budget Filter <ArrowRight className="w-3 h-3" />
            </div>
          </Card>

          {/* Step 3 */}
          <Card className="p-6 flex flex-col justify-between" interactive>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center">
                <Lock className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Step 03</span>
              <h3 className="text-base font-bold text-ink font-heading">Owner Vault Safety</h3>
              <p className="text-xs text-muted leading-relaxed">
                Property owner names, phone numbers, and commission notes remain in your encrypted private vault at all times.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-border/50 text-[11px] font-semibold text-amber-600 flex items-center gap-1">
              Zero Direct Contact Bypass <ArrowRight className="w-3 h-3" />
            </div>
          </Card>

          {/* Step 4 */}
          <Card className="p-6 flex flex-col justify-between" interactive>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-700 dark:bg-emerald-950/60 dark:text-brand-600 flex items-center justify-center">
                <Share2 className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-700">Step 04</span>
              <h3 className="text-base font-bold text-ink font-heading">Branded Client Flyer</h3>
              <p className="text-xs text-muted leading-relaxed">
                Generate clean, professional photo flyers watermarked with your agency branding, ready to share with 1 tap.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-border/50 text-[11px] font-semibold text-brand-700 flex items-center gap-1">
              1-Click WhatsApp Share <ArrowRight className="w-3 h-3" />
            </div>
          </Card>
        </div>
      </section>

      {/* Interactive Broker Commission ROI Calculator */}
      <section id="roi-calculator" className="py-12 px-4 sm:px-6 bg-surface/60 border-y border-border/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="p-2 rounded-xl bg-gold-bg text-gold-text inline-flex mb-2">
              <Calculator className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-black text-ink font-heading">
              Broker Commission Calculator
            </h2>
            <p className="text-xs text-muted mt-1">
              See how closing just 1-2 extra deals each month transforms your annual earnings.
            </p>
          </div>

          <Card className="p-6 sm:p-8 bg-surface shadow-card max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Sliders */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-text">Average Property Deal Value</span>
                    <span className="text-brand-700">₹{avgTicketLakhs} Lakhs</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="5"
                    value={avgTicketLakhs}
                    onChange={(e) => setAvgTicketLakhs(Number(e.target.value))}
                    className="w-full accent-brand-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted mt-1">
                    <span>₹30L (Affordable)</span>
                    <span>₹1.5 Cr</span>
                    <span>₹3 Cr (Luxury)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-text">Monthly Deals Closed</span>
                    <span className="text-brand-700">{dealsCount} Deals / mo</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={dealsCount}
                    onChange={(e) => setDealsCount(Number(e.target.value))}
                    className="w-full accent-brand-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted mt-1">
                    <span>1 Deal</span>
                    <span>5 Deals</span>
                    <span>10 Deals</span>
                  </div>
                </div>

                <div className="p-3 bg-bg rounded-xl text-[11px] text-muted border border-border/60">
                  <span className="font-bold text-ink">Assumes standard 1% brokerage fee</span> per transaction from buyer or seller.
                </div>
              </div>

              {/* Calculated Earnings Display (Fintech Quixotic Card style) */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-50 to-emerald-50 dark:from-brand-950/60 dark:to-slate-900 border border-brand-200/80 dark:border-brand-800/40 text-center space-y-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-muted block">
                    Estimated Monthly Commission
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-brand-700 dark:text-brand-500 font-heading block mt-1">
                    {formatRupees(estimatedCommissionRupees)}
                  </span>
                </div>

                <div className="pt-3 border-t border-brand-200/60 dark:border-brand-800/40">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-muted block">
                    Projected Annual Brokerage
                  </span>
                  <span className="text-xl font-extrabold text-ink block mt-0.5">
                    {formatRupees(estimatedCommissionRupees * 12)} / year
                  </span>
                </div>

                <Link to="/register" className="block w-full">
                  <Button size="md" pill className="w-full shadow-sm text-xs">
                    Claim Your 14-Day Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Transparent Pricing Plans (§14) */}
      <section id="pricing" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-12">
          <Badge variant="brand" pill dot className="mb-3">Simple Transparent Pricing</Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-ink font-heading tracking-tight">
            Fair Pricing for Every Growing Broker
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-2">
            No long-term locks. Cancel anytime with 1 click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Starter Plan */}
          <Card className="p-6 sm:p-8 flex flex-col justify-between border-border/80">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-muted">Starter Plan</span>
              <div>
                <span className="text-3xl font-black text-ink font-heading">₹999</span>
                <span className="text-xs text-muted"> / month</span>
              </div>
              <p className="text-xs text-muted">Ideal for independent solo brokers getting started.</p>

              <div className="pt-4 border-t border-border/60 space-y-2.5 text-xs text-text">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Up to 100 active property listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>AI chat parsing (50 messages / day)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Encrypted Owner Vault</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Watermarked flyers with agency logo</span>
                </div>
              </div>
            </div>

            <Link to="/register" className="mt-8 block">
              <Button variant="secondary" pill className="w-full text-xs">
                Start with Starter
              </Button>
            </Link>
          </Card>

          {/* Pro Unlimited Plan */}
          <Card className="p-6 sm:p-8 flex flex-col justify-between border-brand-600/40 shadow-glow relative bg-gradient-to-b from-surface via-surface to-brand-50/20 dark:to-brand-950/20">
            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-700 text-white text-[10px] font-black uppercase tracking-wider">
                Most Popular
              </span>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-brand-700">Pro Unlimited</span>
              <div>
                <span className="text-3xl font-black text-ink font-heading">₹1,999</span>
                <span className="text-xs text-muted"> / month</span>
              </div>
              <p className="text-xs text-muted">For high-volume brokers and growing real estate agencies.</p>

              <div className="pt-4 border-t border-border/60 space-y-2.5 text-xs text-text">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="font-bold">Unlimited property listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="font-bold">Unlimited AI message extractions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Priority WhatsApp support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Custom agency branding & watermark</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Full pipeline Kanban & deal analytics</span>
                </div>
              </div>
            </div>

            <Link to="/register" className="mt-8 block">
              <Button size="md" pill className="w-full text-xs font-bold shadow-md">
                Get 14 Days Free
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Bottom Conversion Banner (WizardZ style) */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-brand-700 via-brand-800 to-emerald-900 p-8 sm:p-12 text-white text-center shadow-xl relative overflow-hidden">
          <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
            Stop Losing Deals in WhatsApp Chats.
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto mt-2 leading-relaxed">
            Join hundreds of smart property brokers closing deals faster with LeadNivesh Broker OS.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" pill variant="dark" className="text-xs font-bold">
                Start 14-Day Free Trial
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/login">
              <button className="text-xs font-bold text-white/90 hover:text-white px-4 py-2 cursor-pointer transition">
                Already registered? Sign In
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="mt-auto py-10 border-t border-border px-4 sm:px-6 bg-surface text-xs text-muted">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo-icon.png" alt="LeadNivesh" className="w-6 h-6 object-contain" />
            <span className="font-bold text-ink">LeadNivesh Broker OS</span>
            <span>· Built with ❤️ for Indian property brokers</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <Link to="/privacy" className="hover:text-ink transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-ink transition">Terms of Service</Link>
            <Link to="/contact" className="hover:text-ink transition">Support</Link>
            <span className="text-faint">© 2026 LeadNivesh. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};