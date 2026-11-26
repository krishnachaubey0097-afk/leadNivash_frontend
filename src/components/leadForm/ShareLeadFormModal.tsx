import React, { useState } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Share2,
  Send,
  Sparkles,
  Users,
  Building2,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { useAuth } from '../../features/auth/AuthProvider';
import { buildBrokerLeadFormUrl } from '../../lib/api/leadForm';

interface ShareLeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: 'buyers' | 'properties';
}

export const ShareLeadFormModal: React.FC<ShareLeadFormModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  const brokerId = user?._id || (user as { id?: string } | null)?.id || '';
  const formUrl = brokerId ? buildBrokerLeadFormUrl(brokerId) : '';
  const agencyLabel = user?.agency?.name?.trim() || user?.name || 'LeadNivash Partner';

  const whatsappInviteText = `Namaste! Please share your property requirement (Buy / Rent) or property listing details (Sell / Rent out) in 30 seconds on our quick form so we can prepare verified options for you:\n\n${formUrl}\n\n— ${agencyLabel}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappInviteText)}`;

  const handleCopy = async () => {
    if (!formUrl) return;
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopied(true);
      success('Client Lead Form link copied to clipboard!');
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      success('Form link ready to copy');
    }
  };

  const handleNativeShare = async () => {
    if (!formUrl) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${agencyLabel} — Client Requirement Form`,
          text: `Share your property requirement or listing details with ${agencyLabel}:`,
          url: formUrl,
        });
        return;
      } catch {
        // User dismissed or unsupported; ignore silently
      }
    }
    await handleCopy();
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Share Client Lead Form"
      description="One branded link for both Buyers & Sellers — submissions appear directly in your account."
    >
      <div className="space-y-4 text-left">
        {/* Dual-Purpose Explainer Strip */}
        <div className="rounded-2xl bg-ink-black text-white p-4 border-t-2 border-lime space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-bold text-lime uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Universal Intake Link
            </span>
            <span className="text-[11px] text-white/75 font-medium">
              Branded for {agencyLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
              <Users className="w-4 h-4 text-lime shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">For Buyers</p>
                <p className="text-[11px] text-white/70 leading-snug">
                  Captures budget (with approx. toggle), preferred localities & specs into <strong>Buyers</strong>.
                </p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-lime shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">For Sellers</p>
                <p className="text-[11px] text-white/70 leading-snug">
                  Captures owner contact, size, locality & demand price into <strong>Properties</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyable Link Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink-900 block">
            Your permanent client form URL
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={formUrl || 'Sign in to generate your personal link'}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 min-w-0 h-11 px-3.5 rounded-input bg-slate-50 border border-border text-xs sm:text-sm font-mono text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleCopy}
              disabled={!formUrl}
              className="shrink-0 gap-1.5 min-h-[44px]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-brand-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy link</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Share CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-cashfree-primary min-h-[44px] px-4 rounded-xl text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition"
          >
            <Send className="w-4 h-4 text-lime" />
            <span>Share on WhatsApp</span>
          </a>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleNativeShare}
              disabled={!formUrl}
              className="flex-1 min-h-[44px] gap-1.5 text-xs sm:text-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>

            {formUrl && (
              <a
                href={formUrl}
                target="_blank"
                rel="noreferrer"
                className="min-h-[44px] px-3.5 rounded-xl border border-border bg-white hover:bg-slate-50 text-ink-900 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition shrink-0"
                title="Open client form in new tab"
              >
                <ExternalLink className="w-4 h-4 text-brand-600" />
                <span>Preview</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
