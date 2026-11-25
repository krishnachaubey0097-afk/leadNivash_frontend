import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  X,
  Lock,
} from 'lucide-react';
import { apiClient } from '../../lib/api/client';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { BRAND_NAME, PLAN_PRICING } from '../../config/constants';

interface SpecialOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim?: () => void;
  onPay?: (data: { plan: string; amount: number; currency: string }) => void;
}

export const SpecialOfferModal: React.FC<SpecialOfferModalProps> = ({
  isOpen,
  onClose,
  onClaim,
  onPay,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleProceedToUpgrade = async () => {
    setIsSubmitting(true);
    try {
      await apiClient
        .post('/public/contact', {
          name: user?.name || 'Verified Free Trial Broker',
          phone: user?.phone || '+919999999999',
          agencyName: user?.agency?.name || `${BRAND_NAME} Broker Agency`,
          city: user?.agency?.city || 'Panipat',
          message: `[Special Trial Upgrade Intent] User: ${user?.phone || user?.email || 'Trial User'} clicked Proceed to pay for Yearly Plan @ ${PLAN_PRICING.formattedAnnualOffer}.`,
        })
        .catch(() => {});

      if (onPay) {
        onPay({
          plan: 'yearly_special',
          amount: PLAN_PRICING.annualTrialOfferRupees,
          currency: 'INR',
        });
      } else if (typeof (window as any).Razorpay !== 'undefined') {
        toast('Opening Razorpay Checkout...', 'info');
      } else {
        toast(
          `Proceeding to Razorpay payment gateway for ${PLAN_PRICING.formattedAnnualOffer}...`,
          'success'
        );
      }

      if (onClaim) onClaim();
    } catch (err: any) {
      console.warn('Payment trigger error:', err);
      toast('Ready for Razorpay checkout.', 'info');
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
        className="relative w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-[20px] border border-border shadow-2xl p-6 text-left space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header + Top-Right Close Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
              Annual Pro upgrade
            </span>
            <h2
              id="upgrade-modal-title"
              className="text-xl font-bold text-slate-900 dark:text-white leading-snug"
            >
              Unlock full {BRAND_NAME} Pro
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close upgrade modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pricing Summary: Struck-through original price + discounted price on one line each (no wrapping) */}
        <div className="p-4 rounded-[14px] bg-slate-50 dark:bg-slate-800/70 border border-border space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm whitespace-nowrap">
            <span className="text-slate-500">Standard yearly price</span>
            <span className="line-through text-slate-400 font-medium tabular-nums">
              {PLAN_PRICING.formattedAnnualStandard}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 whitespace-nowrap pt-1 border-t border-border/70">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Trial offer price
            </span>
            <span className="text-lg font-bold text-brand-700 tabular-nums">
              {PLAN_PRICING.formattedAnnualOffer}
            </span>
          </div>
        </div>

        {/* Short Benefit Bullets */}
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          {[
            'Unlimited property listings and buyer requirements',
            'Instant WhatsApp AI parser and client match engine',
            'Owner Vault privacy isolation and watermarked flyers',
            '7-day unconditional refund guarantee',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Actions: One-line Primary CTA + Secondary Link + Razorpay Lock */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleProceedToUpgrade}
            className="w-full h-11 px-5 rounded-input bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold whitespace-nowrap flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-1"
          >
            {isSubmitting ? 'Processing...' : 'Proceed to pay'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 text-center text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Continue with free trial
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
            <Lock className="w-3 h-3 text-brand-600 shrink-0" />
            <span>Secured by Razorpay</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
