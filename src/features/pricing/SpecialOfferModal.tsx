import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Check, X, Lock, ArrowUpRight, Repeat } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { BRAND_NAME, PLAN_PRICING } from '../../config/constants';
import {
  launchCashfreeCheckout,
  type CashfreeBillingMode,
  type CashfreePlanCode,
} from '../../lib/cashfree';
import clsx from 'clsx';

interface SpecialOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim?: () => void;
  planCode?: CashfreePlanCode;
  onPay?: (data: { plan: string; amount: number; currency: string }) => void;
}

const PLAN_DETAILS: Record<
  CashfreePlanCode,
  {
    badge: string;
    title: string;
    originalPrice?: string;
    priceLabel: string;
    intervalLabel: string;
    amount: number;
    bullets: string[];
  }
> = {
  monthly_399: {
    badge: 'Monthly Broker Plan',
    title: `Activate ${BRAND_NAME} Monthly`,
    priceLabel: `₹${PLAN_PRICING.monthlyRupees}/month`,
    intervalLabel: 'Billed monthly · Cancel anytime',
    amount: PLAN_PRICING.monthlyRupees,
    bullets: [
      'Up to 50 property listings & 30 active buyers',
      'Instant WhatsApp & Voice AI parser (150/month)',
      'Owner Vault privacy isolation & branded flyers',
      'Cancel AutoPay anytime from Settings',
    ],
  },
  yearly_trial_3299: {
    badge: 'Annual Pro upgrade',
    title: `Unlock full ${BRAND_NAME} Pro`,
    originalPrice: PLAN_PRICING.formattedAnnualStandard,
    priceLabel: PLAN_PRICING.formattedAnnualOffer,
    intervalLabel: 'Trial special offer · Save ₹700',
    amount: PLAN_PRICING.annualTrialOfferRupees,
    bullets: [
      'Unlimited property listings and buyer requirements',
      'Instant WhatsApp AI parser and client match engine',
      'Owner Vault privacy isolation and watermarked flyers',
      '7-day unconditional refund guarantee',
    ],
  },
  yearly_3999: {
    badge: 'Annual Pro Plan',
    title: `Upgrade to ${BRAND_NAME} Pro`,
    priceLabel: PLAN_PRICING.formattedAnnualStandard,
    intervalLabel: 'Billed annually · Best value',
    amount: PLAN_PRICING.annualStandardRupees,
    bullets: [
      'Unlimited property listings and buyer requirements',
      'Instant WhatsApp AI parser and client match engine',
      'Owner Vault privacy isolation and watermarked flyers',
      '7-day unconditional refund guarantee',
    ],
  },
};

export const SpecialOfferModal: React.FC<SpecialOfferModalProps> = ({
  isOpen,
  onClose,
  onClaim,
  planCode = 'yearly_trial_3299',
  onPay,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState<CashfreePlanCode>(planCode);
  const [billingMode, setBillingMode] = useState<CashfreeBillingMode>('autopay');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedPlan(planCode);
  }, [planCode, isOpen]);

  // Lock body scroll cleanly while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeMeta = PLAN_DETAILS[selectedPlan] || PLAN_DETAILS.yearly_trial_3299;

  const handleProceedToUpgrade = async () => {
    if (!isAuthenticated || !user) {
      onClose();
      toast('Please sign in or create your free account first to pay for a plan.', 'info');
      navigate(`/login?redirect=${encodeURIComponent(`/app/settings?section=subscription&pay=${selectedPlan}&mode=${billingMode}`)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (onPay) {
        onPay({
          plan: selectedPlan,
          amount: activeMeta.amount,
          currency: 'INR',
        });
      }

      toast('Connecting to Cashfree secure checkout...', 'info');
      await launchCashfreeCheckout(selectedPlan, billingMode);
      if (onClaim) onClaim();
    } catch (err: any) {
      const msg =
        err?.message ||
        'Could not open Cashfree checkout right now. Please check payment gateway configuration.';
      toast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <div
        className="relative w-full max-w-[480px] bg-white rounded-[20px] border border-border shadow-2xl p-6 text-left space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header + Top-Right Close Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
              {activeMeta.badge}
            </span>
            <h2
              id="upgrade-modal-title"
              className="text-xl font-bold text-slate-900 leading-snug"
            >
              {activeMeta.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close upgrade modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Plan Switcher (Monthly vs Yearly Offer) */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-border gap-1">
          <button
            type="button"
            onClick={() => setSelectedPlan('monthly_399')}
            className={clsx(
              'py-1.5 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer',
              selectedPlan === 'monthly_399'
                ? 'bg-white text-brand-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Monthly · ₹399/mo
          </button>
          <button
            type="button"
            onClick={() =>
              setSelectedPlan(
                user?.plan?.tier === 'pro' ? 'yearly_3999' : 'yearly_trial_3299'
              )
            }
            className={clsx(
              'py-1.5 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer',
              selectedPlan !== 'monthly_399'
                ? 'bg-white text-brand-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Yearly · {user?.plan?.tier === 'pro' ? '₹3,999/yr' : '₹3,299/yr'}
          </button>
        </div>

        {/* Pricing Summary */}
        <div className="p-4 rounded-[14px] bg-slate-50 border border-border space-y-2">
          {activeMeta.originalPrice && (
            <div className="flex items-center justify-between gap-3 text-sm whitespace-nowrap">
              <span className="text-ink-700">Standard yearly price</span>
              <span className="line-through text-ink-700/80 font-medium tabular-nums">
                {activeMeta.originalPrice}
              </span>
            </div>
          )}
          <div
            className={clsx(
              'flex flex-wrap items-baseline justify-between gap-2',
              activeMeta.originalPrice && 'pt-1.5 border-t border-border/70'
            )}
          >
            <span className="text-xs sm:text-sm font-semibold text-ink-900">
              {activeMeta.intervalLabel}
            </span>
            <span className="text-base sm:text-lg font-bold text-brand-700 tabular-nums shrink-0">
              {activeMeta.priceLabel}
            </span>
          </div>
        </div>

        {/* AutoPay vs One-Time Mode Toggle */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
          <div className="flex items-center gap-2 min-w-0">
            <Repeat className="w-4 h-4 text-brand-700 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block">
                {billingMode === 'autopay' ? 'AutoPay Subscription (UPI / Card)' : 'One-Time Payment'}
              </span>
              <span className="text-[11px] text-slate-600 block truncate">
                {billingMode === 'autopay'
                  ? 'Automatic renewal via Cashfree Subscriptions'
                  : 'Single payment via UPI, Card, or NetBanking'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBillingMode(billingMode === 'autopay' ? 'one_time' : 'autopay')}
            className="text-[11px] font-bold text-brand-700 hover:underline shrink-0 cursor-pointer px-2 py-1"
          >
            Switch
          </button>
        </div>

        {/* Short Benefit Bullets */}
        <ul className="space-y-1.5 text-sm text-slate-700">
          {activeMeta.bullets.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs sm:text-sm">{item}</span>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleProceedToUpgrade}
            className="group btn-cashfree-primary btn-shine-sweep w-full h-12 pl-5 pr-2 rounded-[14px] text-white text-sm font-semibold whitespace-nowrap flex items-center justify-between transition-all cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-1"
          >
            <span className="mx-auto pl-6">
              {isSubmitting ? 'Opening Cashfree...' : `Pay ${activeMeta.priceLabel}`}
            </span>
            <span className="w-8 h-8 rounded-[9px] bg-lime text-ink-black inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="w-4 h-4 stroke-[2.3]" />
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 text-center text-xs font-medium text-ink-700 hover:text-ink-900 transition-colors cursor-pointer"
          >
            Continue with free trial
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-ink-700 pt-0.5">
            <Lock className="w-3 h-3 text-brand-600 shrink-0" />
            <span>Secured by Cashfree Payments · UPI AutoPay &amp; Cards</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
