import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { apiClient } from '../../lib/api/client';
import {
  CheckCircle2,
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  ShieldCheck,
  Lock,
  Cookie,
  RefreshCw,
  Scale,
  AlertCircle,
} from 'lucide-react';
import { PricingSection } from '../pricing/PricingSection';
import { SEO, SITE_URL, DEFAULT_OG_IMAGE } from '../../components/SEO';
import { BRAND_CONTACT, PLAN_PRICING } from '../../config/constants';
import { SocialLinks } from '../../components/ui/SocialLinks';

/* =========================================================================
   1. PRICING PAGE
   ========================================================================= */
export const PricingPage: React.FC = () => {
  const pricingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'LeadNivash Broker OS Pro',
    description:
      'Real estate broker CRM, WhatsApp AI listing extractor, instant buyer matching engine, and Pan-India stamp duty calculators.',
    image: DEFAULT_OG_IMAGE,
    brand: {
      '@type': 'Brand',
      name: 'LeadNivash',
    },
    offers: [
      {
        '@type': 'Offer',
        name: '14-Day Free Trial',
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/register`,
      },
      {
        '@type': 'Offer',
        name: 'Monthly Plan',
        price: String(PLAN_PRICING.monthlyRupees),
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Yearly Plan (Trial Upgrade Offer)',
        price: String(PLAN_PRICING.annualTrialOfferRupees),
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Yearly Plan (Standard)',
        price: String(PLAN_PRICING.annualStandardRupees),
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/pricing`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-cream text-ink-700 p-4 sm:p-6 max-w-5xl mx-auto space-y-6 text-left">
      <SEO
        title="Pricing Plans & High-ROI Subscriptions"
        description="Start your 14-day free LeadNivash trial. Transparent pricing at ₹399/month or ₹3,299/year for Indian real estate brokers and property agencies."
        canonicalPath="/pricing"
        ogType="product"
        jsonLd={pricingJsonLd}
      />
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <PricingSection showTitle={true} headingAs="h1" />
    </main>
  );
};

/* =========================================================================
   2. PRIVACY POLICY PAGE (DPDPA 2023 & IT ACT COMPLIANT)
   ========================================================================= */
export const PrivacyPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-bg text-text p-4 sm:p-6 max-w-4xl mx-auto space-y-6 text-xs leading-relaxed text-left">
      <SEO
        title="Privacy Policy & Owner Vault Isolation"
        description="Read how LeadNivash protects private owner phone numbers, broker client leads, and encrypted data under India DPDPA 2023 guidelines."
        canonicalPath="/privacy"
      />
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:underline mb-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-500/30">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>DPDPA 2023 Compliant · Owner Vault Isolation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink font-heading tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-muted">Last Updated: November 2026 · Effective Date: November 2026</p>
      </div>

      {/* Owner Vault Isolation Highlight */}
      <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-500/30 space-y-2">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
          <h2 className="text-sm font-bold text-ink">The Owner Vault Isolation Guarantee</h2>
        </div>
        <p className="text-muted text-[11px] leading-relaxed">
          At LeadNivash, we recognize that your property listings, owner contact numbers, commission agreements, and buyer requirements are the lifeblood of your brokerage business. Under our <strong>Owner Vault Data Isolation architecture</strong>, all private owner details and internal notes are encrypted at rest and logically separated by tenant account boundaries. They are <strong>never indexed publicly, never accessible to other brokers, and never shared or sold to third parties</strong>.
        </p>
      </div>

      {/* Structured Policy Body */}
      <div className="space-y-6 bg-surface p-6 sm:p-8 rounded-3xl border border-border">
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">1</span>
            Data We Collect & Data Minimization
          </h2>
          <p className="text-muted">
            We adhere strictly to the principle of data minimization—we only collect data that is necessary to provide real estate brokerage management services:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li><strong>Broker Account Information:</strong> Full name, phone number, agency name, city/hub, and optional RERA registration number.</li>
            <li><strong>Property Inventory (Owner Vault):</strong> Property type, location/colony, bedrooms, demand price, and private owner contact details (for your exclusive use).</li>
            <li><strong>Buyer Requirements:</strong> Client budget, preferred localities, bedroom preferences, and contact phone number.</li>
            <li><strong>Calculations & Usage Logs:</strong> Stamp duty, EMI, and land unit conversions saved locally or synchronized to your account.</li>
            <li><strong>Technical Diagnostics:</strong> IP address, browser user-agent, and session timestamps used solely for session fraud prevention and multi-device synchronization.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">2</span>
            Lawful Basis & How Data Is Used
          </h2>
          <p className="text-muted">
            Your data is processed in accordance with the Digital Personal Data Protection Act (DPDPA 2023) and the Information Technology (SPDI) Rules 2011 on the following lawful bases:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li><strong>Contractual Performance:</strong> Providing Quick Chat requirement matching, deal pipeline tracking, and masked flyer creation.</li>
            <li><strong>Broker-Directed Disclosures:</strong> When you generate a shareable property flyer, LeadNivash generates a masked marketing card that hides the owner’s private phone number and address, displaying only your agency’s contact details.</li>
            <li><strong>Consent:</strong> Sending onboarding walk-throughs and customer support communications over WhatsApp.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">3</span>
            Third-Party Sub-Processors & Infrastructure
          </h2>
          <p className="text-muted">
            We partner only with vetted cloud infrastructure providers who comply with industry-standard encryption protocols:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-ink">MongoDB Atlas</h3>
              <p className="text-[11px] text-muted mt-0.5">Encrypted cloud database storage with TLS 1.3 in-transit and AES-256 at-rest encryption.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-ink">Cloudinary Media</h3>
              <p className="text-[11px] text-muted mt-0.5">Secure, signed property photo uploads with automated watermark protection.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-ink">Vercel Edge Network</h3>
              <p className="text-[11px] text-muted mt-0.5">Global edge hosting and SSL termination with automated DDoS defense.</p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">4</span>
            Your Rights: Data Export, Correction & Deletion
          </h2>
          <p className="text-muted">
            Under applicable data protection laws, you retain full ownership of your data and have the following rights:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li><strong>Right to Access & Export:</strong> You can export all your properties, buyers, and deals in JSON or CSV format directly from the <Link to="/app/settings" className="underline font-bold text-emerald-700">Settings</Link> page at any time.</li>
            <li><strong>Right to Rectification:</strong> You can edit and update property listings, buyer criteria, and profile details directly within the app.</li>
            <li><strong>Right to Erasure (Account Deletion):</strong> You can request permanent account and data deletion by clicking "Request Account Deletion" in Settings or by emailing <a href={`mailto:${BRAND_CONTACT.email}`} className="underline font-bold text-emerald-700">{BRAND_CONTACT.email}</a>. Upon verification, all your data will be permanently purged within 30 days.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">5</span>
            Protection of Minors
          </h2>
          <p className="text-muted">
            LeadNivash is a B2B platform exclusively designed for practicing adult real estate brokers and agency owners aged 18 and older. We do not knowingly solicit or collect personal information from individuals under the age of 18. If we discover that personal data of a minor has been collected, it is immediately deleted.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">6</span>
            Grievance Officer & Inquiries
          </h2>
          <p className="text-muted">
            For any inquiries, privacy concerns, or data erasure requests, please contact our Data Protection Officer:
          </p>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
            <p><strong>Grievance & Privacy Officer:</strong> LeadNivash Legal & Compliance Team</p>
            <p><strong>Email:</strong> <a href={`mailto:${BRAND_CONTACT.email}`} className="underline font-bold text-emerald-700">{BRAND_CONTACT.email}</a></p>
            <p><strong>Support Telephone:</strong> <a href="tel:+919876543210" className="underline font-bold text-emerald-700">+91 98765 43210</a></p>
            <p><strong>Operating Territory:</strong> Panipat & Gurugram, Haryana, India</p>
          </div>
        </section>
      </div>
    </main>
  );
};

/* =========================================================================
   3. TERMS OF SERVICE PAGE
   ========================================================================= */
export const TermsPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-bg text-text p-4 sm:p-6 max-w-4xl mx-auto space-y-6 text-xs leading-relaxed text-left">
      <SEO
        title="Terms of Service"
        description="Commercial broker agreement, acceptable use terms, and workspace rules for using LeadNivash real estate SaaS in India."
        canonicalPath="/terms"
      />
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:underline mb-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-500/30">
          <Scale className="w-3.5 h-3.5 text-emerald-600" />
          <span>Commercial Broker Agreement · India Jurisdiction</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink font-heading tracking-tight">
          Terms of Service
        </h1>
        <p className="text-muted">Last Updated: November 2026 · Effective Date: November 2026</p>
      </div>

      <div className="space-y-6 bg-surface p-6 sm:p-8 rounded-3xl border border-border">
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink">1. Acceptance of Terms & Eligibility</h2>
          <p className="text-muted">
            By creating an account, accessing, or using the LeadNivash platform, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. This platform is strictly intended for licensed real estate brokers, property dealers, consultants, and real estate agencies aged 18 years or older.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink">2. Calculations, Stamp Duty & Circle Rate Disclaimer</h2>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Important Regulatory Disclaimer</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              The Circle Rate, Tehsil Stamp Duty, Loan EMI, and Land Unit Conversion (Gaj, Marla, Kanal, Bigha) tools provided on LeadNivash are automated calculation engines based on published municipal notifications and general sub-registrar guidelines. Because circle rates and registration charges may vary based on colony classifications, collector rate updates, and sub-registrar discretionary verification, <strong>all calculations must be verified with the competent Tehsil or Sub-Registrar office prior to deed execution</strong>. LeadNivash shall not be held liable for any registry discrepancy or financial loss arising from reliance on automated estimates.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink">3. Data Ownership & Marketing Flyers</h2>
          <p className="text-muted">
            You retain 100% intellectual property ownership of all property listings, photos, client contact lists, and notes entered into your account. By uploading property details, you grant LeadNivash a non-exclusive, limited license solely to host, process, and generate masked flyers and AI matches on your behalf. LeadNivash does not sell, share, or broker your listings to other platform users.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink">4. Subscription Billing, Free Trial & Cancellations</h2>
          <p className="text-muted">
            LeadNivash provides a 14-day free trial on initial registration without requiring payment information. Subscriptions are offered as a Monthly Plan (₹399/month) or a Yearly Plan (₹3,999/year, with an exclusive special offer of ₹3,299/year available during your active 14-day free trial). Subscriptions grant unrestricted access to multi-device sync, cloud storage, and priority support. Subscriptions may be cancelled anytime from your Settings. For refund guidelines, please review our <Link to="/refund" className="underline font-bold text-emerald-700">Refund Policy</Link>.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink">5. Acceptable Use Policy</h2>
          <p className="text-muted">
            You agree not to use LeadNivash to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>Post fraudulent, deceptive, or non-existent property listings.</li>
            <li>Interfere with, reverse-engineer, or breach tenant isolation boundaries.</li>
            <li>Send unsolicited, spam, or harassing communications to buyers or brokers.</li>
            <li>Scrape platform data or extract proprietary calculation engines.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink">6. Limitation of Liability</h2>
          <p className="text-muted">
            To the maximum extent permitted under applicable law, LeadNivash and its operators shall not be liable for any indirect, incidental, punitive, or consequential damages, including loss of profits, deal commissions, or business goodwill, arising from platform downtime, network latency, or third-party service interruptions.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink">7. Governing Law & Dispute Resolution</h2>
          <p className="text-muted">
            These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes or claims arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in Panipat / Gurugram, Haryana.
          </p>
        </section>
      </div>
    </main>
  );
};

/* =========================================================================
   4. REFUND & CANCELLATION POLICY PAGE
   ========================================================================= */
export const RefundPolicyPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-bg text-text p-4 sm:p-6 max-w-4xl mx-auto space-y-6 text-xs leading-relaxed text-left">
      <SEO
        title="Refund & Cancellation Policy"
        description="Learn about LeadNivash 7-day money-back guarantee, free trial expiration rules, and subscription cancellation process."
        canonicalPath="/refund"
      />
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:underline mb-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-500/30">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          <span>7-Day Money-Back Guarantee · Zero Risk</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink font-heading tracking-tight">
          Refund & Cancellation Policy
        </h1>
        <p className="text-muted">Last Updated: November 2026 · Effective Date: November 2026</p>
      </div>

      <div className="space-y-6 bg-surface p-6 sm:p-8 rounded-3xl border border-border">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink">1. 14-Day Free Pilot (No Payment Needed)</h2>
          <p className="text-muted">
            Every new broker is entitled to a 14-day zero-risk trial of LeadNivash. No credit card or upfront deposit is required to start your pilot. You can explore all premium features, test Quick Chat voice matching, and evaluate the platform before making any financial commitment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink">2. 7-Day Unconditional Refund Window</h2>
          <p className="text-muted">
            If you upgrade to our Yearly Plan (standard ₹3,999/year or trial special offer ₹3,299/year) and find that the platform does not meet your agency’s operational expectations, you may request a <strong>100% full refund within 7 calendar days</strong> of your initial payment date.
          </p>
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-500/30 text-[11px] text-slate-700">
            <strong>Fair Use Condition:</strong> The refund will be granted in full provided the account has not exported bulk proprietary database reports exceeding normal trial usage.
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink">3. How to Request a Refund</h2>
          <p className="text-muted">
            To initiate a refund, simply send an email to <a href={`mailto:${BRAND_CONTACT.email}`} className="underline font-bold text-emerald-700">{BRAND_CONTACT.email}</a> or message our WhatsApp Support at <a href="https://wa.me/919876543210" className="underline font-bold text-emerald-700">+91 98765 43210</a> with:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>Your registered broker mobile number or login email.</li>
            <li>Payment transaction ID / invoice reference.</li>
            <li>A brief description of why the platform was not a fit (for our engineering improvement).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink">4. Processing Timelines</h2>
          <p className="text-muted">
            Once approved, refunds are credited back to the original payment source (UPI, Debit Card, Credit Card, or Net Banking) within <strong>5 to 7 business days</strong>, depending on your bank's clearing cycle.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink">5. Subscription Cancellation</h2>
          <p className="text-muted">
            You may cancel future renewals of your subscription at any time via your <Link to="/app/settings" className="underline font-bold text-emerald-700">Settings</Link> portal. Upon cancellation, your account will remain active until the end of the paid annual term, after which it will safely downgrade to read-only access.
          </p>
        </section>
      </div>
    </main>
  );
};

/* =========================================================================
   5. COOKIE & TRACKING POLICY PAGE
   ========================================================================= */
export const CookiePolicyPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-bg text-text p-4 sm:p-6 max-w-4xl mx-auto space-y-6 text-xs leading-relaxed text-left">
      <SEO
        title="Cookie Policy & Web Storage"
        description="Details on strictly necessary session cookies and local preferences used by LeadNivash with zero third-party ad tracking."
        canonicalPath="/cookies"
      />
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:underline mb-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-500/30">
          <Cookie className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero Third-Party Ad Trackers</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink font-heading tracking-tight">
          Cookie & Web Storage Policy
        </h1>
        <p className="text-muted">Last Updated: November 2026 · Effective Date: November 2026</p>
      </div>

      <div className="space-y-6 bg-surface p-6 sm:p-8 rounded-3xl border border-border">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink">1. What Are Cookies and Local Storage?</h2>
          <p className="text-muted">
            Cookies and web storage tokens are small text records stored on your browser or device when you navigate a website. LeadNivash utilizes essential session storage to authenticate brokers, maintain state across page transitions, and store user preferences.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-ink">2. Categories of Cookies We Use</h2>
          
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-ink flex items-center justify-between">
                <span>Strictly Essential Tokens</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Mandatory</span>
              </h3>
              <p className="text-[11px] text-muted mt-1">
                Required for core authentication and security. Includes JWT authentication headers, cross-site request forgery defenses, and multi-device session continuity. These tokens cannot be deactivated without logging you out.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-ink flex items-center justify-between">
                <span>Functional & Preference Tokens</span>
                <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">Functional</span>
              </h3>
              <p className="text-[11px] text-muted mt-1">
                Remembers your regional calculation preferences (e.g., 25 Gaj vs 30.25 Gaj per Marla for Panipat/Haryana), UI theme (Dark/Light mode), and cookie consent state.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-ink flex items-center justify-between">
                <span>Performance & Speed Telemetry</span>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">Anonymized</span>
              </h3>
              <p className="text-[11px] text-muted mt-1">
                Powered by Vercel Speed Insights to monitor Core Web Vitals and page render latency. All metrics are aggregated and anonymous.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink">3. Zero Advertising or Cross-Site Tracking</h2>
          <p className="text-muted">
            LeadNivash <strong>never uses third-party advertising tracking cookies, retargeting pixels, or behavioral marketing beacons</strong>. Your activity on our platform is never sold or made available to commercial data brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink">4. How to Control and Clear Cookies</h2>
          <p className="text-muted">
            You can configure your browser (Google Chrome, Apple Safari, Mozilla Firefox, Microsoft Edge) to reject or delete cookies at any time. Note that clearing essential authentication cookies will terminate your active session and require you to log in again.
          </p>
        </section>
      </div>
    </main>
  );
};

/* =========================================================================
   6. CONTACT FOUNDER & SUPPORT PAGE
   ========================================================================= */
export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [agency, setAgency] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;

    if (!consentAccepted) {
      setErrorMsg('Please agree to the privacy consent to submit your message.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      await apiClient.post('/public/contact', {
        name,
        phone,
        email: email || undefined,
        agencyName: agency || undefined,
        message,
        website: honeypot,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.warn('Contact inquiry submission failed:', err);
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Could not submit contact request. Please check your network and phone number.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg text-text p-4 sm:p-6 max-w-xl mx-auto space-y-6 text-left">
      <SEO
        title="Contact Support & Helpdesk"
        description="Connect with the LeadNivash onboarding and support team via WhatsApp, phone, or email for real estate broker workspace setup."
        canonicalPath="/contact"
      />
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div>
        <h1 className="text-2xl font-black text-ink font-heading tracking-tight">
          Contact Founder & Support
        </h1>
        <p className="text-xs text-muted mt-1">
          Have questions about the platform, onboarding, or custom agency setups? Connect with our team directly.
        </p>
      </div>

      {/* Direct Contact Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          href="tel:+919876543210"
          className="p-3.5 rounded-2xl bg-white border border-border/80 shadow-2xs hover:border-emerald-500/40 flex items-center gap-2.5 text-xs font-bold text-ink transition"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-muted block uppercase font-bold">Call Us</span>
            <span>+91 98765 43210</span>
          </div>
        </a>

        <a
          href="https://wa.me/919876543210?text=Hello%20leadNivash%20team,%20I%20have%20a%20query%20about%20the%20broker%20platform."
          target="_blank"
          rel="noreferrer"
          className="p-3.5 rounded-2xl bg-white border border-border/80 shadow-2xs hover:border-emerald-500/40 flex items-center gap-2.5 text-xs font-bold text-ink transition"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-muted block uppercase font-bold">WhatsApp</span>
            <span>Chat Live</span>
          </div>
        </a>

        <a
          href={`mailto:${BRAND_CONTACT.email}`}
          className="p-3.5 rounded-2xl bg-white border border-border/80 shadow-2xs hover:border-emerald-500/40 flex items-center gap-2.5 text-xs font-bold text-ink transition"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-muted block uppercase font-bold">Email Us</span>
            <span className="truncate block">{BRAND_CONTACT.email}</span>
          </div>
        </a>
      </div>

      {/* Social Media Channels */}
      <div className="p-4 rounded-2xl bg-white border border-border/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
            Connect With Us
          </span>
          <span className="text-xs text-slate-600">
            Follow product updates, broker tips & releases on official channels
          </span>
        </div>
        <SocialLinks variant="light" showLabels />
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">
          {errorMsg}
        </div>
      )}

      {submitted ? (
        <div className="p-6 bg-emerald-50 border border-emerald-500/30 rounded-3xl space-y-2 text-center text-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h2 className="text-base font-black text-ink font-heading">Message Received</h2>
          <p className="text-muted max-w-sm mx-auto">
            Thank you for reaching out! A LeadNivash specialist will connect with you on WhatsApp within 1 business hour.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 bg-surface border border-border rounded-3xl space-y-3.5 shadow-sm"
        >
          <Input
            label="Your Name *"
            id="contact-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <PhoneInput
            label="WhatsApp Number *"
            required
            value={phone}
            onChange={setPhone}
          />
          <Input
            label="Email Address"
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Agency / Firm Name"
            id="contact-agency"
            value={agency}
            onChange={(e) => setAgency(e.target.value)}
          />

          {/* Honeypot field (hidden from real users) */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="space-y-1">
            <label htmlFor="contact-msg" className="block text-xs font-semibold text-text uppercase">
              Message *
            </label>
            <textarea
              id="contact-msg"
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we assist your agency?"
              className="w-full bg-surface border border-border rounded-xl p-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-600">
            <input
              type="checkbox"
              id="contact-consent"
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="contact-consent">
              I agree to the{' '}
              <Link to="/privacy" className="text-emerald-700 underline font-semibold">
                Privacy Policy
              </Link>{' '}
              and consent to being contacted regarding this inquiry.
            </label>
          </div>

          <Button
            type="submit"
            pill
            isLoading={loading}
            className="w-full font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            Send Message
          </Button>
        </form>
      )}
    </main>
  );
};
