import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Crown,
  Check,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SpecialOfferModal } from './SpecialOfferModal';
import { useAuth } from '../auth/AuthProvider';
import clsx from 'clsx';

interface PricingSectionProps {
  showTitle?: boolean;
  className?: string;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  showTitle = true,
  className = '',
}) => {
  const { user } = useAuth();
  const [isSpecialOfferModalOpen, setIsSpecialOfferModalOpen] = useState(false);
  const [isTrialOfferActive, setIsTrialOfferActive] = useState(true);
  const [mobileTab, setMobileTab] = useState<'all' | 'trial' | 'monthly' | 'yearly'>('all');

  const handleOpenSpecialOffer = () => {
    setIsTrialOfferActive(true);
    setIsSpecialOfferModalOpen(true);
  };

  const whatsappMonthlyUrl = `https://wa.me/918570089497?text=${encodeURIComponent(
    `Hello LeadNivash, I want to subscribe to the Monthly Plan (₹399/month). My registered account is: ${user?.phone || user?.email || 'New Broker'
    }.`
  )}`;

  return (
    <div className={clsx('space-y-8 sm:space-y-10 text-left', className)}>
      {/* 1. Header with clear SaaS positioning */}
      {showTitle && (
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block text-[11px] font-black uppercase tracking-widest text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-emerald-500/20">
            TRANSPARENT BROKER INVESTMENT
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink font-heading tracking-tight leading-tight">
            Simple,{' '}
            <span className="bg-gradient-to-r from-brand-600 via-brand-700 to-teal-600 bg-clip-text text-transparent">
              High-ROI Pricing.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed">
            Start with our 14-Day Free Trial. Upgrade anytime to scale your listings, buyer matching, and deal closings.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STRATEGIC SPECIAL UPGRADE OFFER BANNER FOR FREE TRIAL USERS           */}
      {/* ========================================================================= */}
      <div className="rounded-[20px] p-5 sm:p-6 bg-surface dark:bg-slate-900 border border-line dark:border-slate-800 shadow-md relative overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-ink-black" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime text-ink-black text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-ink-black shrink-0" />
              <span>Special Free Trial Upgrade Offer</span>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-ink-900 font-heading tracking-tight">
              Upgrade to the Yearly Plan for{' '}
              <span className="text-brand-700 font-black">₹3,299</span>{' '}
              <span className="line-through text-ink-500 text-base font-normal">₹3,999</span>{' '}
              <span className="text-xs font-bold text-ink-black bg-lime px-2 py-0.5 rounded-md ml-1">
                Save ₹700
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-ink-700 leading-relaxed">
              Available exclusively to brokers during their <strong>14-Day Free Trial</strong>. Lock in unlimited property listings,
              instant WhatsApp AI parsing, and priority verified badges for an entire year.
            </p>
          </div>

          {/* Primary Landing Offer Button (--ink-black fill + white text + small --lime arrow chip) */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleOpenSpecialOffer}
              className="group pl-5 pr-2.5 py-2.5 rounded-[18px] bg-ink-black hover:bg-ink-900 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-3 cursor-pointer transition min-h-[48px] whitespace-nowrap"
              title="Claim Free Trial Special Offer"
            >
              <span>Claim Offer: ₹3,299/yr</span>
              <span className="w-7 h-7 rounded-[10px] bg-lime text-ink-black flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE SEGMENTED CONTROL TABS (Responsive View Switcher)                */}
      {/* ========================================================================= */}
      <div className="flex lg:hidden items-center justify-center p-1 bg-surface dark:bg-slate-800 rounded-[16px] border border-line dark:border-slate-700 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setMobileTab('all')}
          className={clsx(
            'flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer min-h-[38px]',
            mobileTab === 'all'
              ? 'bg-white dark:bg-slate-900 text-ink shadow-2xs'
              : 'text-muted hover:text-ink'
          )}
        >
          All Plans
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('trial')}
          className={clsx(
            'flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer min-h-[38px]',
            mobileTab === 'trial'
              ? 'bg-white dark:bg-slate-900 text-ink shadow-2xs'
              : 'text-muted hover:text-ink'
          )}
        >
          Free Trial
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('monthly')}
          className={clsx(
            'flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer min-h-[38px]',
            mobileTab === 'monthly'
              ? 'bg-white dark:bg-slate-900 text-ink shadow-2xs'
              : 'text-muted hover:text-ink'
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('yearly')}
          className={clsx(
            'flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer min-h-[38px]',
            mobileTab === 'yearly'
              ? 'bg-white dark:bg-slate-900 text-ink shadow-2xs'
              : 'text-muted hover:text-ink'
          )}
        >
          Yearly
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. THREE DISTINCT SUBSCRIPTION CARDS                                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* ======================================================== */}
        {/* PLAN 1: FREE TRIAL PLAN (₹0 / 14 DAYS)                   */}
        {/* ======================================================== */}
        {(mobileTab === 'all' || mobileTab === 'trial') && (
          <div className="rounded-[20px] bg-surface dark:bg-slate-900 border border-line dark:border-slate-800 p-6 sm:p-7 flex flex-col justify-between text-left shadow-xs hover:border-ink-black/30 hover:shadow-md transition-all duration-300">
            <div className="space-y-5">
              {/* Header & Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold shadow-2xs">
                    <Zap className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-ink font-heading">Free Trial</h3>
                    <span className="text-[11px] text-muted block">14-Day Full Access</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                  ₹0 PILOT
                </span>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-ink font-heading tracking-tight">₹0</span>
                  <span className="text-xs font-bold text-muted">/ 14 Days</span>
                </div>
                <p className="text-xs text-muted leading-relaxed mt-2">
                  Full evaluation access for single brokers. Test AI matching, voice parsing, and branded WhatsApp flyers with zero risk.
                </p>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

              {/* Features List */}
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted block">
                  INCLUDED IN 14-DAY TRIAL:
                </span>
                {[
                  '14 Days Unrestricted Evaluation',
                  'Up to 15 Property Listings',
                  'Up to 10 Active Buyer Profiles',
                  'Voice Dictation & AI WhatsApp Parser',
                  'Smart Match Engine & Criteria Filter',
                  'WhatsApp Masked Flyers & Brochures',
                  '4 Dedicated Haryana Land Calculators',
                  'Owner Vault Encrypted Data Isolation',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6 space-y-2">
              {user ? (
                <div className="space-y-2">
                  <Link to="/app" className="block">
                    <Button variant="secondary" pill className="w-full text-xs font-bold py-3 min-h-[44px]">
                      <span>Open Broker Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                  <div className="text-center text-[11px] text-muted">
                    Active Account: <span className="font-semibold text-ink">{user.phone || user.name || 'Broker'}</span>{' '}
                    ·{' '}
                    <Link to="/login" className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                      Log in here
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/register" className="block">
                    <Button variant="secondary" pill className="w-full text-xs font-bold py-3 min-h-[44px]">
                      <span>Start 14-Day Free Trial</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                  <div className="text-center text-[11px] text-muted">
                    Already registered?{' '}
                    <Link to="/login" className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                      Log in here &rarr;
                    </Link>
                  </div>
                </div>
              )}
              <span className="text-[10px] text-center text-muted block">
                No credit card required · Instant access
              </span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PLAN 2: MONTHLY PLAN (₹399 / MONTH)                      */}
        {/* ======================================================== */}
        {(mobileTab === 'all' || mobileTab === 'monthly') && (
          <div className="rounded-[20px] bg-surface dark:bg-slate-900 border border-line dark:border-slate-800 p-6 sm:p-7 flex flex-col justify-between text-left shadow-xs hover:border-ink-black/30 hover:shadow-md transition-all duration-300">
            <div className="space-y-5">
              {/* Header & Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shadow-2xs">
                    <Calendar className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-ink font-heading">Monthly Plan</h3>
                    <span className="text-[11px] text-muted block">Flexible Month-to-Month</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                  STANDARD
                </span>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-ink font-heading tracking-tight">₹399</span>
                  <span className="text-xs font-bold text-muted">/ Month</span>
                </div>
                <div className="mt-1 inline-block text-[11px] text-muted font-medium">
                  Billed monthly · Cancel anytime
                </div>
                <p className="text-xs text-muted leading-relaxed mt-2">
                  Essential ongoing subscription for active brokers who prefer low upfront commitment and monthly budgeting.
                </p>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

              {/* Features List */}
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted block">
                  INCLUDED IN MONTHLY PLAN:
                </span>
                {[
                  'Full Unrestricted Broker Platform',
                  'Unlimited Property Listings (fair use)',
                  'Unlimited Active Buyer Management',
                  'Unlimited WhatsApp & Voice AI Parsing',
                  'Deal & Commission Pipeline Tracking',
                  'Masked Client Shareable Links',
                  'Standard WhatsApp Helpdesk Support',
                  'No Long-term Contract (Cancel Anytime)',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <a
                href={whatsappMonthlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full text-xs font-bold py-3 rounded-[16px] bg-ink-black hover:bg-ink-900 text-white min-h-[44px]">
                  <span>Get Monthly Plan — ₹399/mo</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </a>
              <span className="text-[10px] text-center text-muted block mt-2">
                Standard monthly rate · No discount applied
              </span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PLAN 3: YEARLY PLAN (₹3,999 OR SPECIAL ₹3,299 TRIAL DEAL) */}
        {/* ======================================================== */}
        {(mobileTab === 'all' || mobileTab === 'yearly') && (
          <div className="rounded-[20px] bg-surface dark:bg-slate-900 border-2 border-ink-black shadow-xl p-6 sm:p-7 flex flex-col justify-between text-left relative transition-all duration-300">
            {/* Top Ribbon Badge */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold shadow-2xs">
                    <Crown className="w-5 h-5 text-brand-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-ink-900 font-heading flex items-center gap-1.5">
                      <span>Yearly Plan</span>
                    </h3>
                    <span className="text-[11px] text-brand-700 font-semibold block">
                      Annual Pass · Best Value
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-lime text-ink-black text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  MOST POPULAR
                </span>
              </div>

              {/* Price with Dynamic Special Trial Offer */}
              <div>
                {isTrialOfferActive ? (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-ink-900 font-heading tracking-tight">
                        ₹3,299
                      </span>
                      <span className="line-through text-ink-500 text-base font-semibold">₹3,999</span>
                      <span className="text-xs font-bold text-ink-500">/ Year</span>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-soft border border-line text-ink-900 text-[11px] font-bold shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                      <span>Special Trial Offer · Save ₹700 Instantly</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-ink font-heading tracking-tight">₹3,999</span>
                      <span className="text-xs font-bold text-muted">/ Year</span>
                    </div>
                    <div className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                      Approximately ₹333 / month (billed annually)
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted leading-relaxed mt-2.5">
                  Complete Broker Operating System. Unlimited listings, multi-image flyers, custom agency branding, and priority support.
                </p>
              </div>

              <div className="h-px bg-emerald-500/20 w-full" />

              {/* Features List */}
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  EVERYTHING IN MONTHLY, PLUS:
                </span>
                {[
                  '1 Full Year of Uninterrupted Access',
                  'Custom Agency Logo & Watermark on Flyers',
                  'RERA Verified Broker Profile Badge',
                  'Multi-Image & Video Walkthrough Hosting',
                  'Multi-Device Real-time Cloud Sync',
                  'Advanced Deal Pipeline & Payment Milestones',
                  'Priority 1-on-1 WhatsApp Support',
                  '7-Day 100% Unconditional Money-Back Guarantee',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button (--ink-black fill + white text + small --lime arrow chip) */}
            <div className="pt-6 space-y-2">
              <button
                type="button"
                onClick={handleOpenSpecialOffer}
                className="group w-full py-2.5 pl-4 pr-2.5 rounded-[16px] bg-ink-black hover:bg-ink-900 text-white font-bold text-xs tracking-wide shadow-sm flex items-center justify-between gap-2 cursor-pointer transition min-h-[48px] whitespace-nowrap"
              >
                <span className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-lime shrink-0" />
                  <span>
                    {isTrialOfferActive
                      ? 'Claim Trial Offer — ₹3,299/yr'
                      : 'Upgrade to Yearly Pass — ₹3,999'}
                  </span>
                </span>
                <span className="w-7 h-7 rounded-[10px] bg-lime text-ink-black flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </span>
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-ink-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                <span>7-Day 100% Money-Back Guarantee · Cancel anytime</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. TRUST FOOTER & FAQ CALLOUT                                             */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-[20px] bg-surface dark:bg-slate-900 border border-line dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            7-Day 100% Refund Guarantee. Review our transparent{' '}
            <Link to="/refund" className="underline font-bold text-emerald-700 dark:text-emerald-400">
              Refund Policy
            </Link>
            .
          </span>
        </div>
        <a
          href="https://wa.me/918570089497?text=Hi%20LeadNivash%2C%20I%20have%20questions%20about%20subscription%20plans"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
        >
          <span>Need custom enterprise team licenses? Chat with us &rarr;</span>
        </a>
      </div>

      {/* Interactive Special Offer Modal */}
      <SpecialOfferModal
        isOpen={isSpecialOfferModalOpen}
        onClose={() => setIsSpecialOfferModalOpen(false)}
        onClaim={() => setIsTrialOfferActive(true)}
      />
    </div>
  );
};
