import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  ShieldCheck,
  ArrowRight,
  X,
  Clock,
  Crown,
  Lock,
} from 'lucide-react';
import { apiClient } from '../../lib/api/client';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../../components/ui/Toast';

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

  // Lock body scroll when modal is active to prevent background bleed-through
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProceedToUpgrade = async () => {
    setIsSubmitting(true);
    try {
      // 1. Record upgrade intent so team and backend log the trial conversion
      await apiClient.post('/public/contact', {
        name: user?.name || 'Verified Free Trial Broker',
        phone: user?.phone || '+919999999999',
        agencyName: user?.agency?.name || 'LeadNivesh Broker Agency',
        city: user?.agency?.city || 'Panipat',
        message: `[Special Trial Upgrade Intent] User: ${user?.phone || user?.email || 'Trial User'} clicked Proceed to Pay for Yearly Plan @ ₹3,299 (₹700 discount applied).`,
      }).catch(() => {});

      // 2. Trigger Razorpay checkout handler callback if provided
      if (onPay) {
        onPay({ plan: 'yearly_special', amount: 3299, currency: 'INR' });
      } else if (typeof (window as any).Razorpay !== 'undefined') {
        toast('Opening Razorpay Checkout...', 'info');
      } else {
        toast('Proceeding to Razorpay payment gateway for ₹3,299...', 'success');
      }

      if (onClaim) onClaim();
    } catch (err: any) {
      console.warn('Payment trigger error:', err);
      toast('Ready for Razorpay checkout.', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-emerald-500/30 shadow-2xl overflow-hidden text-left my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Emerald Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#018E45] via-teal-500 to-[#017A3C] shrink-0" />

        {/* Close Button with generous click target & elegant circle */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer z-20 shadow-2xs"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Pinned Header with Brand Identity */}
        <div className="px-5 pt-4 pb-2 sm:px-6 sm:pt-5 shrink-0 pr-12 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Free Trial Exclusive Privilege</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-ink font-heading tracking-tight leading-snug">
            Upgrade to the Yearly Plan for{' '}
            <span className="text-emerald-700 dark:text-emerald-400">₹3,299</span>{' '}
            <span className="line-through text-muted text-base font-normal">₹3,999</span>
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            As an active Free Trial broker, you are eligible for an exclusive{' '}
            <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">₹700 instant discount</strong> on our
            full Lifetime Yearly Plan.
          </p>
        </div>

        {/* Smooth, Clean Content Body (scrollbar hidden for sleek aesthetic) */}
        <div className="flex-1 overflow-y-auto px-5 py-2.5 sm:px-6 space-y-3.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Pricing Details Box */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 dark:from-slate-800/80 dark:via-slate-800 dark:to-slate-800/60 border border-emerald-500/25 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#E5E9EE] dark:border-slate-700/80 pb-2">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Plan Details</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                Save ₹700 Instantly
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-muted">
                <span>Standard Yearly Plan Rate:</span>
                <span className="line-through font-mono font-medium">₹3,999 / year</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                <span>Free Trial Special Discount:</span>
                <span>- ₹700 (Exclusive)</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-dashed border-emerald-500/30 text-ink">
                <span className="font-bold text-xs sm:text-sm">Your Special Upgrade Price:</span>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-heading">
                    ₹3,299
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-muted font-normal block">/ Year (₹275/mo)</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-[#E5E9EE] dark:border-slate-700/60 text-[11px] text-muted flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Important:</strong> This ₹700 discount applies exclusively to the <strong>Yearly Plan</strong>. The
                Monthly Plan remains at its standard price of <strong>₹399/month</strong>.
              </span>
            </div>
          </div>

          {/* Key Value Checklist */}
          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted block">
              Everything Unlocked In Your Annual Pass:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Unlimited Property Listings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Unlimited Buyer Inquiries</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Multi-Image & Video Flyers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Custom Agency Logo & Watermark</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>RERA Verified Broker Badge</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Priority VIP Support</span>
              </div>
            </div>
          </div>

          {/* Money Back Guarantee Banner */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-2 text-[11px] text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Includes 7-Day 100% Unconditional Money-Back Guarantee. Zero risk.</span>
          </div>
        </div>

        {/* Pinned Bottom Actions & Razorpay CTA - Always visible without scroll clipping */}
        <div className="shrink-0 p-4 sm:px-6 sm:pb-5 pt-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleProceedToUpgrade}
            className="w-full py-3.5 px-4 rounded-2xl text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md animate-trial-glow flex items-center justify-center gap-2 cursor-pointer transition min-h-[46px]"
          >
            <Crown className="w-4 h-4 shrink-0" />
            <span>Proceed to Pay ₹3,299</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted">
            <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>100% Secure Checkout via Razorpay · Instant Activation</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-center text-xs text-muted hover:text-ink font-medium py-0.5 transition cursor-pointer"
          >
            Continue with my 14-Day Free Trial
          </button>
        </div>
      </div>
    </div>
  );
};
