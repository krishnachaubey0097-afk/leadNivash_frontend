import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { apiClient } from '../../lib/api/client';
import { CheckCircle2, ArrowLeft, Phone, Mail, MessageCircle, ShieldCheck } from 'lucide-react';

export const PricingPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Pricing Plans & High-ROI Subscriptions | leadNivash';
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink font-heading tracking-tight">
          Simple, Transparent Broker Pricing
        </h1>
        <p className="text-xs text-muted mt-1">
          Invest once, close more deals every month. All plans include full mobile access and encrypted cloud backup.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        <div className="p-6 bg-surface border border-border rounded-3xl space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-muted">Starter Pilot</span>
            <h2 className="text-3xl font-black text-ink font-heading">₹0 <span className="text-xs font-normal text-muted">/ 14 Days</span></h2>
            <p className="text-xs text-muted leading-relaxed">
              Full access trial for single brokers. Test Quick Chat voice parsing, add up to 25 properties, and generate branded WhatsApp flyers.
            </p>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 pt-2">
              <li className="flex items-center gap-2">✓ Quick Chat AI requirement matching</li>
              <li className="flex items-center gap-2">✓ WhatsApp masked flyers & brochures</li>
              <li className="flex items-center gap-2">✓ 4 Dedicated broker land calculators</li>
            </ul>
          </div>
          <Link to="/register"><Button pill className="w-full font-bold text-xs">Start 14-Day Free Trial</Button></Link>
        </div>

        <div className="p-6 bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/30 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 border-2 border-emerald-600 rounded-3xl space-y-4 shadow-md relative flex flex-col justify-between">
          <div className="space-y-3">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider inline-block">Most Popular</span>
            <h2 className="text-3xl font-black text-ink font-heading">₹3,999 <span className="text-xs font-normal text-muted">/ Year</span></h2>
            <p className="text-xs text-muted leading-relaxed">
              Unlimited power for high-volume agencies and active brokers closing multiple deals each month.
            </p>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 pt-2">
              <li className="flex items-center gap-2 font-semibold">✓ Unlimited property listings & buyer leads</li>
              <li className="flex items-center gap-2 font-semibold">✓ Multi-device real-time MongoDB cloud sync</li>
              <li className="flex items-center gap-2 font-semibold">✓ Custom agency branding & RERA verified badge</li>
              <li className="flex items-center gap-2 font-semibold">✓ Priority WhatsApp technical support</li>
            </ul>
          </div>
          <Link to="/register"><Button pill className="w-full font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">Get Annual Pass</Button></Link>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy & Owner Vault Isolation | leadNivash';
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text p-4 sm:p-6 max-w-3xl mx-auto space-y-5 text-xs leading-relaxed text-left">
      <Link to="/" className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 hover:underline mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-ink font-heading tracking-tight">Privacy Policy</h1>
        <p className="text-muted">Last updated: November 2026</p>
      </div>

      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-ink">Owner Vault Isolation Guarantee</h3>
          <p className="text-muted text-[11px] mt-0.5">
            leadNivash isolates all owner phone numbers and private notes strictly within your authenticated account. Owner contacts are never exposed to other brokers, never indexed publicly, and never shared with third parties.
          </p>
        </div>
      </div>

      <div className="space-y-3 bg-surface p-6 rounded-3xl border border-border">
        <h2 className="text-sm font-bold text-ink">1. Data We Collect</h2>
        <p className="text-muted">
          We collect account information (name, phone number, firm name, city) and property listings you choose to input for flyer generation and client requirement matching.
        </p>

        <h2 className="text-sm font-bold text-ink pt-2">2. How Data Is Used</h2>
        <p className="text-muted">
          Your inventory and buyer contacts are used exclusively to provide your brokerage features, including exact match computation, stamp duty calculations, and commission tracking.
        </p>

        <h2 className="text-sm font-bold text-ink pt-2">3. Data Security & Storage</h2>
        <p className="text-muted">
          All data is transmitted using modern TLS encryption and stored in secure cloud databases with strict tenant isolation and role-based access controls.
        </p>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms of Service | leadNivash';
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text p-4 sm:p-6 max-w-3xl mx-auto space-y-5 text-xs leading-relaxed text-left">
      <Link to="/" className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 hover:underline mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-ink font-heading tracking-tight">Terms of Service</h1>
        <p className="text-muted">Last updated: November 2026</p>
      </div>

      <div className="space-y-3 bg-surface p-6 rounded-3xl border border-border">
        <h2 className="text-sm font-bold text-ink">1. Platform Usage</h2>
        <p className="text-muted">
          leadNivash is designed for licensed and practicing real estate professionals. You agree to ensure factual accuracy when inputting property prices, sizes, and ownership status.
        </p>

        <h2 className="text-sm font-bold text-ink pt-2">2. Calculations & Approximations</h2>
        <p className="text-muted">
          Our land unit converters (Gaj, Marla, Kanal) and Tehsil registry stamp duty calculators provide estimates according to prevailing Haryana and NCR guidelines. Final registration figures depend on the sub-registrar office at registry execution.
        </p>

        <h2 className="text-sm font-bold text-ink pt-2">3. Subscription & Cancellation</h2>
        <p className="text-muted">
          Paid annual subscriptions can be managed from your Settings portal. Accounts maintain full ownership and can export all records in CSV format anytime.
        </p>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [agency, setAgency] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Contact Support & Helpdesk | leadNivash';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;

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
    <div className="min-h-screen bg-bg text-text p-4 sm:p-6 max-w-xl mx-auto space-y-6 text-left">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <div>
        <h1 className="text-2xl font-black text-ink font-heading tracking-tight">Contact Founder & Support</h1>
        <p className="text-xs text-muted mt-1">
          Have questions about the platform, onboarding, or custom agency setups? Connect with our team directly.
        </p>
      </div>

      {/* Direct Contact Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          href="tel:+919876543210"
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-border/80 shadow-2xs hover:border-emerald-500/40 flex items-center gap-2.5 text-xs font-bold text-ink transition"
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
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-border/80 shadow-2xs hover:border-emerald-500/40 flex items-center gap-2.5 text-xs font-bold text-ink transition"
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
          href="mailto:contact@leadnivash.com"
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-border/80 shadow-2xs hover:border-emerald-500/40 flex items-center gap-2.5 text-xs font-bold text-ink transition"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-muted block uppercase font-bold">Email Us</span>
            <span>contact@leadnivash.com</span>
          </div>
        </a>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 rounded-2xl text-xs text-rose-700 dark:text-rose-300">
          {errorMsg}
        </div>
      )}

      {submitted ? (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-3xl space-y-2 text-center text-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h3 className="text-base font-black text-ink font-heading">Message Received</h3>
          <p className="text-muted max-w-sm mx-auto">
            Thank you for reaching out! A leadNivash specialist will connect with you on WhatsApp within 1 business hour.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 bg-surface border border-border rounded-3xl space-y-3.5 shadow-sm">
          <Input label="Your Name *" required value={name} onChange={(e) => setName(e.target.value)} />
          <PhoneInput label="WhatsApp Number *" required value={phone} onChange={setPhone} />
          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Agency / Firm Name" value={agency} onChange={(e) => setAgency(e.target.value)} />
          {/* Honeypot field (hidden from real users) */}
          <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text uppercase">Message *</label>
            <textarea required rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we assist your agency?" className="w-full bg-surface border border-border rounded-xl p-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-600" />
          </div>
          <Button type="submit" pill isLoading={loading} className="w-full font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
            Send Message
          </Button>
        </form>
      )}
    </div>
  );
};
