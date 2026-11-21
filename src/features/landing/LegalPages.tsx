import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { apiClient } from '../../lib/api/client';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export const PricingPage: React.FC = () => (
  <div className="min-h-screen bg-bg text-text p-6 max-w-4xl mx-auto space-y-6">
    <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
      <ArrowLeft className="w-4 h-4" /> Back to Home
    </Link>
    <h1 className="text-2xl font-bold text-ink font-heading">Simple, High-ROI Pricing</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
      <div className="p-6 bg-surface border border-border rounded-card space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-muted">Starter Pilot</span>
        <h2 className="text-2xl font-black text-ink">₹0 <span className="text-xs font-normal text-muted">/ 14 Days</span></h2>
        <p className="text-xs text-muted">Up to 15 properties, 10 active buyers, WhatsApp requirement analyzer, and basic property matching.</p>
        <Link to="/register"><Button className="w-full">Start Free Trial</Button></Link>
      </div>
      <div className="p-6 bg-surface border-2 border-brand-600 rounded-card space-y-4 shadow-sm relative">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Founder Annual Pass</span>
        <h2 className="text-2xl font-black text-ink">₹3,999 <span className="text-xs font-normal text-muted">/ Year</span></h2>
        <p className="text-xs text-muted">Unlimited inventory, WhatsApp AI parser, multi-image brochure hosting, deal tracking & custom branding.</p>
        <Link to="/register"><Button className="w-full">Get Started</Button></Link>
      </div>
    </div>
  </div>
);

export const PrivacyPage: React.FC = () => (
  <div className="min-h-screen bg-bg text-text p-6 max-w-3xl mx-auto space-y-4 text-xs leading-relaxed">
    <Link to="/" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 mb-2">
      <ArrowLeft className="w-4 h-4" /> Back to Home
    </Link>
    <h1 className="text-2xl font-bold text-ink font-heading">Privacy Policy</h1>
    <p>Last updated: November 2026</p>
    <h2 className="text-sm font-bold text-ink pt-2">Owner Vault Isolation</h2>
    <p>
      leadNivash isolates all owner contact details strictly to the authenticated broker account. Owner telephone numbers and private notes are never sent to AI providers, never baked into public flyers, and never accessible across broker tenants.
    </p>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="min-h-screen bg-bg text-text p-6 max-w-3xl mx-auto space-y-4 text-xs leading-relaxed">
    <Link to="/" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 mb-2">
      <ArrowLeft className="w-4 h-4" /> Back to Home
    </Link>
    <h1 className="text-2xl font-bold text-ink font-heading">Terms of Service</h1>
    <p>Last updated: November 2026</p>
    <p>By using the leadNivash platform, you agree to comply with Indian real estate standards and ensure accuracy in listed properties.</p>
  </div>
);

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [agency, setAgency] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Hidden website field per PRD §5.1
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Silent discard for bot spam

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
    } catch {
      // Show fallback confirmation
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text p-6 max-w-md mx-auto space-y-4">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <h1 className="text-xl font-bold text-ink font-heading">Contact Founder & Support</h1>

      {submitted ? (
        <div className="p-4 bg-brand-50 border border-brand-600/30 rounded-card space-y-2 text-xs">
          <div className="flex items-center gap-2 text-brand-700 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Message Received</span>
          </div>
          <p>Thank you for reaching out. We will connect with you on WhatsApp shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 bg-surface border border-border rounded-card space-y-3">
          <Input label="Your Name *" required value={name} onChange={(e) => setName(e.target.value)} />
          <PhoneInput label="WhatsApp Number *" required value={phone} onChange={setPhone} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Agency Name" value={agency} onChange={(e) => setAgency(e.target.value)} />
          {/* Honeypot field (hidden from real users) */}
          <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text uppercase">Message *</label>
            <textarea required rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-surface border border-border rounded-input p-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-600" />
          </div>
          <Button type="submit" isLoading={loading} className="w-full">Send Message</Button>
        </form>
      )}
    </div>
  );
};
