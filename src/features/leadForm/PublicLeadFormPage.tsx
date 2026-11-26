import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import clsx from 'clsx';
import {
  Building2,
  CheckCircle2,
  Compass,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  AlertCircle,
  ArrowRight,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TopLoadingBar } from '../../components/ui/LoadingBar';
import { SEO } from '../../components/SEO';
import { BrandLogoBox } from '../../components/ui/BrandLogo';
import { formatRupees } from '../../lib/money';
import {
  fetchPublicLeadFormProfile,
  submitPublicLeadForm,
  type PublicLeadFormProfile,
} from '../../lib/api/leadForm';

const PROPERTY_TYPE_OPTIONS: Array<'Floor' | 'Plot' | 'Kothi' | 'Flat' | 'Shop' | 'Other'> = [
  'Floor',
  'Plot',
  'Kothi',
  'Flat',
  'Shop',
  'Other',
];

const UNIT_OPTIONS: Array<{ value: 'gaj' | 'sqft' | 'marla' | 'kanal' | 'acre' | 'bigha'; label: string }> = [
  { value: 'gaj', label: 'Gaj' },
  { value: 'sqft', label: 'Sq.Ft' },
  { value: 'marla', label: 'Marla' },
  { value: 'kanal', label: 'Kanal' },
  { value: 'acre', label: 'Acre' },
  { value: 'bigha', label: 'Bigha' },
];

const FACING_OPTIONS = ['East', 'North', 'North-East', 'West', 'South', 'Corner'];

const SELLER_HIGHLIGHT_OPTIONS = [
  'Park Facing',
  'Corner',
  'With Lift',
  'Stilt Parking',
  'Newly Built',
  'Main Road',
  'Clear Registry',
  'Loan Available',
];

const SALE_BUDGET_PRESETS_LAKHS = [
  { label: '₹40 L', value: 40 },
  { label: '₹65 L', value: 65 },
  { label: '₹1 Cr', value: 100 },
  { label: '₹1.5 Cr', value: 150 },
  { label: '₹2.5 Cr', value: 250 },
];

const RENT_BUDGET_PRESETS_THOUSANDS = [
  { label: '₹15 K/mo', lakhs: 0.15 },
  { label: '₹25 K/mo', lakhs: 0.25 },
  { label: '₹40 K/mo', lakhs: 0.4 },
  { label: '₹75 K/mo', lakhs: 0.75 },
  { label: '₹1.2 L/mo', lakhs: 1.2 },
];

export const PublicLeadFormPage: React.FC = () => {
  const { brokerId } = useParams<{ brokerId: string }>();

  const [profile, setProfile] = useState<PublicLeadFormProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  // Category selection: buyer or seller
  const [category, setCategory] = useState<'buyer' | 'seller'>('buyer');

  // Shared fields (preserved seamlessly if user toggles category)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState<'Sale' | 'Rent'>('Sale');
  const [budgetLakhs, setBudgetLakhs] = useState<string>('100');
  const [isApproxBudget, setIsApproxBudget] = useState(true);
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');

  // Buyer-specific state
  const [buyerTypes, setBuyerTypes] = useState<string[]>(['Floor']);
  const [buyerLocalities, setBuyerLocalities] = useState<string[]>([]);
  const [customLocalityInput, setCustomLocalityInput] = useState('');
  const [anyLocality, setAnyLocality] = useState(false);
  const [buyerSizeMin, setBuyerSizeMin] = useState('');
  const [buyerSizeMax, setBuyerSizeMax] = useState('');
  const [buyerSizeUnit, setBuyerSizeUnit] = useState<'gaj' | 'sqft' | 'marla' | 'kanal' | 'acre' | 'bigha'>('gaj');
  const [urgency, setUrgency] = useState<'hot' | 'warm' | 'cold'>('warm');

  // Seller-specific state
  const [propertyCategory, setPropertyCategory] = useState<'Residential' | 'Commercial'>('Residential');
  const [sellerPropertyType, setSellerPropertyType] = useState<'Plot' | 'Kothi' | 'Floor' | 'Flat' | 'Shop' | 'Other'>('Floor');
  const [sellerLocality, setSellerLocality] = useState('');
  const [sellerLandmark, setSellerLandmark] = useState('');
  const [sellerSizeValue, setSellerSizeValue] = useState('200');
  const [sellerSizeUnit, setSellerSizeUnit] = useState<'gaj' | 'sqft' | 'marla' | 'kanal' | 'acre' | 'bigha'>('gaj');
  const [facing, setFacing] = useState('East');
  const [highlights, setHighlights] = useState<string[]>([]);

  // Submit & confirmation state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedSummary, setSubmittedSummary] = useState<{
    category: 'buyer' | 'seller';
    summary: string;
    budgetPaise: number;
    isApproxBudget: boolean;
  } | null>(null);

  useEffect(() => {
    if (!brokerId) {
      setNotFoundError(true);
      setLoadingProfile(false);
      return;
    }
    setLoadingProfile(true);
    setNotFoundError(false);
    fetchPublicLeadFormProfile(brokerId)
      .then((res) => {
        setProfile(res);
        setCity(res.city || 'Panipat');
      })
      .catch(() => {
        setNotFoundError(true);
      })
      .finally(() => {
        setLoadingProfile(false);
      });
  }, [brokerId]);

  const parsedBudgetNum = Number(budgetLakhs);
  const budgetPaise = !Number.isNaN(parsedBudgetNum) && parsedBudgetNum > 0
    ? Math.round(parsedBudgetNum * 100000 * 100)
    : 0;

  const suggestedLocalities = profile?.city
    ? ['Model Town', 'Sector 18', 'Sector 12', 'HUDA Sector 25', 'Main Market']
    : ['Model Town', 'Sector 18', 'Sector 12', 'GT Road'];

  const toggleBuyerType = (t: string) => {
    setBuyerTypes((prev) =>
      prev.includes(t) ? (prev.length > 1 ? prev.filter((x) => x !== t) : prev) : [...prev, t]
    );
  };

  const toggleBuyerLocality = (loc: string) => {
    setAnyLocality(false);
    setBuyerLocalities((prev) =>
      prev.includes(loc) ? prev.filter((x) => x !== loc) : [...prev, loc]
    );
  };

  const addCustomLocality = () => {
    const clean = customLocalityInput.trim();
    if (!clean) return;
    setAnyLocality(false);
    if (!buyerLocalities.some((l) => l.toLowerCase() === clean.toLowerCase())) {
      setBuyerLocalities((prev) => [...prev, clean]);
    }
    setCustomLocalityInput('');
  };

  const toggleHighlight = (tag: string) => {
    setHighlights((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!brokerId) return;
    if (name.trim().length < 2) {
      setSubmitError('Please enter your full name.');
      return;
    }

    const digits = phone.replace(/\D/g, '');
    const tenDigits = digits.length >= 10 ? digits.slice(-10) : '';
    if (!/^[6-9]\d{9}$/.test(tenDigits)) {
      setSubmitError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setSubmitError('Please enter a valid email address or leave it blank.');
      return;
    }

    if (!budgetPaise || budgetPaise < 10000) {
      setSubmitError(
        category === 'buyer'
          ? 'Please enter your approximate budget.'
          : 'Please enter your expected asking price.'
      );
      return;
    }

    if (category === 'seller') {
      if (sellerLocality.trim().length < 2) {
        setSubmitError('Please enter the property locality / sector.');
        return;
      }
      const sizeNum = Number(sellerSizeValue);
      if (Number.isNaN(sizeNum) || sizeNum <= 0) {
        setSubmitError('Please enter a valid property size.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await submitPublicLeadForm(brokerId, {
        category,
        name: name.trim(),
        phone: tenDigits,
        email: email.trim() || '',
        purpose,
        budgetPaise,
        isApproxBudget,
        city: city.trim() || profile?.city || 'Panipat',
        notes: notes.trim() || undefined,
        website: websiteHoneypot || undefined,
        ...(category === 'buyer'
          ? {
              types: buyerTypes,
              localities: anyLocality ? [] : buyerLocalities,
              anyLocality: anyLocality || buyerLocalities.length === 0,
              sizeMin: buyerSizeMin ? Number(buyerSizeMin) : undefined,
              sizeMax: buyerSizeMax ? Number(buyerSizeMax) : undefined,
              sizeUnit: buyerSizeUnit,
              urgency,
            }
          : {
              propertyCategory,
              propertyType: sellerPropertyType,
              locality: sellerLocality.trim(),
              landmark: sellerLandmark.trim() || undefined,
              sizeValue: Number(sellerSizeValue),
              sizeUnit: sellerSizeUnit,
              facing,
              highlights,
            }),
      });

      setSubmittedSummary({
        category,
        summary:
          res.summary ||
          (category === 'buyer'
            ? `${buyerTypes.join(', ')} in ${buyerLocalities.join(', ') || city || 'Preferred area'}`
            : `${sellerSizeValue} ${sellerSizeUnit.toUpperCase()} ${sellerPropertyType} in ${sellerLocality}`),
        budgetPaise,
        isApproxBudget,
      });
    } catch (err: any) {
      setSubmitError(
        err?.message || 'Could not submit your details right now. Please verify the highlighted fields and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <main className="min-h-screen bg-cream py-8 px-4 flex flex-col items-center justify-center">
        <SEO
          noindex
          title="Property Requirement & Listing Form"
          description="Share your property buying requirement or listing details directly with your verified LeadNivash advisor."
          canonicalPath={`/form/${brokerId || ''}`}
        />
        <TopLoadingBar />
        <div className="w-full max-w-2xl space-y-4">
          <div className="h-20 rounded-2xl bg-white border border-line animate-pulse" />
          <div className="h-96 rounded-3xl bg-white border border-line animate-pulse" />
        </div>
      </main>
    );
  }

  if (notFoundError || !profile) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center p-4">
        <SEO
          noindex
          title="Lead Form Unavailable"
          description="This LeadNivash client intake form link is inactive or unavailable."
          canonicalPath={`/form/${brokerId || ''}`}
        />
        <Card className="max-w-md w-full p-6 sm:p-8 text-center space-y-4 bg-white border border-line rounded-3xl shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-ink-900 font-heading">
            Lead Form Not Available
          </h1>
          <p className="text-xs sm:text-sm text-ink-700 leading-relaxed">
            This client requirement link may be invalid or no longer active. Please ask your property advisor for a fresh link.
          </p>
          <Link to="/" className="inline-block">
            <Button variant="primary" size="md" className="font-semibold text-xs sm:text-sm">
              Visit LeadNivash Home
            </Button>
          </Link>
        </Card>
      </main>
    );
  }

  const brokerDigits = (profile.phone || '').replace(/[^0-9]/g, '');
  const brokerWhatsappHref = brokerDigits
    ? `https://wa.me/${brokerDigits}?text=${encodeURIComponent(
        `Namaste ${profile.brokerName} ji, I am filling out your LeadNivash property form and wanted to discuss my requirement.`
      )}`
    : null;

  return (
    <div className="min-h-screen bg-cream text-ink-700 antialiased pt-5 sm:pt-8 pb-24 sm:pb-12 px-3.5 sm:px-6">
      <SEO
        noindex
        title={`${profile.agencyName} — Share Property Requirement`}
        description={`Share your property buying requirement or listing details directly with ${profile.agencyName} (${profile.city}) powered by LeadNivash.`}
        canonicalPath={`/form/${profile.brokerId}`}
      />

      {/* Top Brand Header */}
      <header className="max-w-3xl mx-auto mb-5 flex items-center justify-between gap-3 bg-white px-4 py-3 rounded-2xl border border-line shadow-2xs">
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <BrandLogoBox className="w-9 h-9 rounded-xl border border-line p-1.5 shadow-2xs" />
          <div className="min-w-0">
            <span className="text-base font-black tracking-tight text-ink-900 font-heading block truncate">
              Lead<span className="text-brand-600">Nivash</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 block truncate">
              Verified Client Intake
            </span>
          </div>
        </Link>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink-black text-white text-[11px] font-bold shrink-0">
          <span className="w-2 h-2 rounded-full bg-lime" />
          <span>100% Private</span>
        </span>
      </header>

      <main className="max-w-3xl mx-auto space-y-5">
        {/* Broker Agency Hero + Talk-First CTA */}
        <section className="rounded-3xl bg-gradient-to-br from-[#12140F] via-[#13261A] to-[#0E3A22] text-white p-5 sm:p-7 border-t-[3px] border-lime shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-lime uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Real Estate Advisor</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white leading-tight">
                {profile.agencyName}
              </h1>
              <p className="text-xs sm:text-sm text-white/75 flex items-center gap-1.5 flex-wrap">
                <MapPin className="w-3.5 h-3.5 text-lime shrink-0" />
                <span>
                  {profile.brokerName} · {profile.city}, {profile.state}
                </span>
              </p>
            </div>

            {profile.phone && (
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <a
                  href={`tel:${profile.phone}`}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-lime" />
                  <span>Call Advisor</span>
                </a>
                {brokerWhatsappHref && (
                  <a
                    href={brokerWhatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white text-ink-900 hover:bg-lime text-xs font-bold inline-flex items-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-brand-700" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/8 border border-white/10 flex items-start gap-2.5 text-xs text-white/85 leading-relaxed">
            <Sparkles className="w-4 h-4 text-lime shrink-0 mt-0.5" />
            <p>
              <strong>Save time on calls:</strong> Fill in your requirement or property details in 30 seconds below so{' '}
              <strong className="text-white">{profile.brokerName}</strong> can shortlist the closest matches and share verified options directly on WhatsApp before calling you back.
            </p>
          </div>
        </section>

        {/* Submitted Confirmation State */}
        {submittedSummary ? (
          <Card className="p-6 sm:p-8 bg-white border border-line rounded-3xl shadow-card space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-600/20 text-brand-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-ink-black text-lime text-[11px] font-bold uppercase tracking-wider">
                Submitted Successfully
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-ink-900 font-heading">
                Thank you, {name.trim()}!
              </h2>
              <p className="text-xs sm:text-sm text-ink-700 leading-relaxed">
                Your {submittedSummary.category === 'buyer' ? 'property requirement' : 'property listing'} has been sent straight to{' '}
                <strong className="text-ink-900">{profile.agencyName}</strong>. Our advisor will review matches and reach out to you on{' '}
                <strong className="text-ink-900">{phone}</strong> shortly.
              </p>
            </div>

            <div className="max-w-lg mx-auto rounded-2xl bg-slate-50 border border-line p-4 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-line">
                <span className="font-bold uppercase tracking-wider text-[10px] text-ink-500">
                  Summary Recorded
                </span>
                <span className="px-2 py-0.5 rounded-full bg-lime-soft text-ink-900 font-bold text-[11px] capitalize">
                  {submittedSummary.category}
                </span>
              </div>
              <p className="text-sm font-bold text-ink-900">{submittedSummary.summary}</p>
              <p className="text-ink-700">
                <strong>{submittedSummary.category === 'buyer' ? 'Budget:' : 'Asking Price:'}</strong>{' '}
                {submittedSummary.isApproxBudget ? '~' : ''}
                {formatRupees(submittedSummary.budgetPaise)}
                {submittedSummary.isApproxBudget && ' (Approximate / Flexible)'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="w-full sm:w-auto min-h-[44px] px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {profile.brokerName} Now</span>
                </a>
              )}
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setSubmittedSummary(null);
                  setSubmitError(null);
                }}
                className="w-full sm:w-auto min-h-[44px]"
              >
                Submit Another Requirement
              </Button>
            </div>
          </Card>
        ) : (
          /* Active Buyer / Seller Lead Capture Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Hidden Honeypot Anti-Spam Input */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={websiteHoneypot}
                onChange={(e) => setWebsiteHoneypot(e.target.value)}
              />
            </div>

            {/* ── Step 1: Buyer / Seller Selector ── */}
            <Card className="p-4 sm:p-6 bg-white border border-line rounded-3xl shadow-card space-y-3.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-ink-900 font-heading">
                  1. How can we help you today? *
                </h2>
                <span className="text-[11px] font-medium text-ink-500">
                  Fields adapt automatically below
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCategory('buyer');
                    setSubmitError(null);
                  }}
                  className={clsx(
                    'p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3',
                    category === 'buyer'
                      ? 'bg-ink-black text-white border-ink-black shadow-md'
                      : 'bg-slate-50/70 text-ink-900 border-line hover:border-brand-600/50'
                  )}
                >
                  <div
                    className={clsx(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      category === 'buyer' ? 'bg-lime text-ink-black' : 'bg-white border border-line text-brand-600'
                    )}
                  >
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base">I am a Buyer</span>
                      {category === 'buyer' && (
                        <span className="px-2 py-0.5 rounded-full bg-lime text-ink-black text-[10px] font-black uppercase">
                          Selected
                        </span>
                      )}
                    </div>
                    <p
                      className={clsx(
                        'text-xs mt-0.5 leading-snug',
                        category === 'buyer' ? 'text-white/75' : 'text-ink-500'
                      )}
                    >
                      Looking to purchase or rent a property
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCategory('seller');
                    setSubmitError(null);
                  }}
                  className={clsx(
                    'p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3',
                    category === 'seller'
                      ? 'bg-ink-black text-white border-ink-black shadow-md'
                      : 'bg-slate-50/70 text-ink-900 border-line hover:border-brand-600/50'
                  )}
                >
                  <div
                    className={clsx(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      category === 'seller' ? 'bg-lime text-ink-black' : 'bg-white border border-line text-brand-600'
                    )}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base">I am a Seller</span>
                      {category === 'seller' && (
                        <span className="px-2 py-0.5 rounded-full bg-lime text-ink-black text-[10px] font-black uppercase">
                          Selected
                        </span>
                      )}
                    </div>
                    <p
                      className={clsx(
                        'text-xs mt-0.5 leading-snug',
                        category === 'seller' ? 'text-white/75' : 'text-ink-500'
                      )}
                    >
                      Want to sell or rent out my property
                    </p>
                  </div>
                </button>
              </div>
            </Card>

            {/* ── Step 2: Contact Information ── */}
            <Card className="p-4 sm:p-6 bg-white border border-line rounded-3xl shadow-card space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-ink-900 font-heading">
                2. Your Contact Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="lead-name" className="text-xs font-semibold text-ink-900 block">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="lead-name"
                      type="text"
                      required
                      placeholder="e.g. Rajesh Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 bg-white border border-border rounded-input text-sm text-ink-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="lead-phone" className="text-xs font-semibold text-ink-900 block">
                    Mobile / WhatsApp Number <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="lead-phone"
                      type="tel"
                      inputMode="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 bg-white border border-border rounded-input text-sm text-ink-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="lead-email" className="text-xs font-semibold text-ink-900 block">
                    Email Address <span className="text-ink-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="lead-email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 bg-white border border-border rounded-input text-sm text-ink-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* ── Step 3: Budget & Dynamic Requirement / Property Fields ── */}
            <Card className="p-4 sm:p-6 bg-white border border-line rounded-3xl shadow-card space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-line">
                <h2 className="text-sm sm:text-base font-bold text-ink-900 font-heading">
                  {category === 'buyer'
                    ? '3. Your Budget & Property Requirements'
                    : '3. Property Details & Expected Price'}
                </h2>

                {/* Purpose Toggle (Sale / Rent) */}
                <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-line self-start sm:self-auto">
                  {(['Sale', 'Rent'] as const).map((pOption) => (
                    <button
                      key={pOption}
                      type="button"
                      onClick={() => {
                        setPurpose(pOption);
                        if (pOption === 'Rent' && Number(budgetLakhs) >= 5) {
                          setBudgetLakhs('0.35');
                        } else if (pOption === 'Sale' && Number(budgetLakhs) < 5) {
                          setBudgetLakhs('100');
                        }
                      }}
                      className={clsx(
                        'px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
                        purpose === pOption
                          ? 'bg-ink-black text-white shadow-2xs'
                          : 'text-ink-700 hover:text-ink-900'
                      )}
                    >
                      {category === 'buyer'
                        ? pOption === 'Sale'
                          ? 'To Buy'
                          : 'To Rent'
                        : pOption === 'Sale'
                        ? 'For Sale'
                        : 'For Rent'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mandatory Budget / Expected Price + Approximate Budget Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50/90 border border-line space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label htmlFor="lead-budget" className="text-xs font-bold text-ink-900">
                    {category === 'buyer' ? 'Target Budget (in ₹ Lakhs)' : 'Expected Asking Price (in ₹ Lakhs)'}{' '}
                    <span className="text-danger">*</span>
                  </label>
                  {budgetPaise > 0 && (
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-600/20 self-start sm:self-auto">
                      {isApproxBudget ? 'Approx. ' : ''}
                      {formatRupees(budgetPaise)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    id="lead-budget"
                    type="number"
                    step="any"
                    min="0.05"
                    required
                    value={budgetLakhs}
                    onChange={(e) => setBudgetLakhs(e.target.value)}
                    placeholder={purpose === 'Rent' ? 'e.g. 0.25 for ₹25,000/mo' : 'e.g. 85 for ₹85 Lakhs, 125 for ₹1.25 Cr'}
                    className="sm:w-56 h-11 px-3.5 bg-white border border-border rounded-input text-sm font-bold text-ink-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />

                  {/* Quick Amount Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(purpose === 'Sale' ? SALE_BUDGET_PRESETS_LAKHS : RENT_BUDGET_PRESETS_THOUSANDS).map((preset) => {
                      const val = 'value' in preset ? preset.value : preset.lakhs;
                      const isActive = Number(budgetLakhs) === val;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setBudgetLakhs(String(val))}
                          className={clsx(
                            'px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer',
                            isActive
                              ? 'bg-lime text-ink-900 border-lime font-bold'
                              : 'bg-white text-ink-700 border-line hover:bg-slate-100'
                          )}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Approximate Budget Option Checkbox */}
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isApproxBudget}
                    onChange={(e) => setIsApproxBudget(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-brand-600 rounded cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-ink-700 leading-snug">
                    <strong className="text-ink-900">
                      {category === 'buyer'
                        ? 'My budget is approximate (flexible ±10–15%)'
                        : 'Expected price is approximate / slightly negotiable'}
                    </strong>{' '}
                    — helps the advisor include nearby matching options.
                  </span>
                </label>
              </div>

              {/* Dynamic Fields for BUYER */}
              {category === 'buyer' ? (
                <div className="space-y-4">
                  {/* Property Types */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-ink-900 block">
                      Property Type(s) Interested In
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PROPERTY_TYPE_OPTIONS.map((t) => {
                        const selected = buyerTypes.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleBuyerType(t)}
                            className={clsx(
                              'px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer',
                              selected
                                ? 'bg-ink-black text-white border-ink-black'
                                : 'bg-slate-50 text-ink-700 border-line hover:border-brand-600/50'
                            )}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* City & Preferred Localities */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="buyer-city" className="text-xs font-semibold text-ink-900 block">
                        City / Hub
                      </label>
                      <input
                        id="buyer-city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Panipat, Gurugram"
                        className="w-full h-11 px-3.5 bg-white border border-border rounded-input text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label htmlFor="custom-loc" className="text-xs font-semibold text-ink-900 block">
                        Preferred Locality / Sector(s)
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="custom-loc"
                          type="text"
                          value={customLocalityInput}
                          onChange={(e) => setCustomLocalityInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomLocality();
                            }
                          }}
                          placeholder="Type locality (e.g. Sector 18, Model Town) & press Add"
                          className="flex-1 min-w-0 h-11 px-3.5 bg-white border border-border rounded-input text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="md"
                          onClick={addCustomLocality}
                          className="shrink-0 min-h-[44px] gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Locality Quick Chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAnyLocality((prev) => !prev);
                        setBuyerLocalities([]);
                      }}
                      className={clsx(
                        'px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer',
                        anyLocality
                          ? 'bg-lime text-ink-900 border-lime font-bold'
                          : 'bg-white text-ink-700 border-line hover:bg-slate-50'
                      )}
                    >
                      Any Good Locality
                    </button>
                    {Array.from(new Set([...suggestedLocalities, ...buyerLocalities])).map((loc) => {
                      const active = !anyLocality && buyerLocalities.includes(loc);
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => toggleBuyerLocality(loc)}
                          className={clsx(
                            'px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer inline-flex items-center gap-1',
                            active
                              ? 'bg-ink-black text-white border-ink-black'
                              : 'bg-slate-50 text-ink-700 border-line hover:bg-slate-100'
                          )}
                        >
                          <span>{loc}</span>
                          {active && <X className="w-3 h-3 text-lime" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Size Range & Urgency */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ink-900 block">
                        Preferred Size Range <span className="text-ink-500 font-normal">(Optional)</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Min"
                          value={buyerSizeMin}
                          onChange={(e) => setBuyerSizeMin(e.target.value)}
                          className="h-11 px-3 bg-white border border-border rounded-input text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                        />
                        <input
                          type="number"
                          min="1"
                          placeholder="Max"
                          value={buyerSizeMax}
                          onChange={(e) => setBuyerSizeMax(e.target.value)}
                          className="h-11 px-3 bg-white border border-border rounded-input text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                        />
                        <select
                          value={buyerSizeUnit}
                          onChange={(e) => setBuyerSizeUnit(e.target.value as any)}
                          className="h-11 px-2.5 bg-white border border-border rounded-input text-xs font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                        >
                          {UNIT_OPTIONS.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ink-900 block">
                        Buying Timeline
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'hot', label: 'Immediate' },
                          { value: 'warm', label: '1–2 Months' },
                          { value: 'cold', label: 'Exploring' },
                        ].map((u) => (
                          <button
                            key={u.value}
                            type="button"
                            onClick={() => setUrgency(u.value as any)}
                            className={clsx(
                              'h-11 px-2 rounded-input text-xs font-semibold border transition cursor-pointer',
                              urgency === u.value
                                ? 'bg-ink-black text-white border-ink-black'
                                : 'bg-white text-ink-700 border-line hover:bg-slate-50'
                            )}
                          >
                            {u.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Dynamic Fields for SELLER */
                <div className="space-y-4">
                  {/* Residential/Commercial + Property Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ink-900 block">
                        Category
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['Residential', 'Commercial'] as const).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setPropertyCategory(cat)}
                            className={clsx(
                              'h-11 rounded-input text-xs font-semibold border transition cursor-pointer',
                              propertyCategory === cat
                                ? 'bg-ink-black text-white border-ink-black'
                                : 'bg-white text-ink-700 border-line hover:bg-slate-50'
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-ink-900 block">
                        Property Type <span className="text-danger">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {PROPERTY_TYPE_OPTIONS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSellerPropertyType(t)}
                            className={clsx(
                              'px-3.5 h-11 rounded-input text-xs font-semibold border transition cursor-pointer',
                              sellerPropertyType === t
                                ? 'bg-ink-black text-white border-ink-black'
                                : 'bg-slate-50 text-ink-700 border-line hover:border-brand-600/50'
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* City, Locality, Landmark */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="seller-city" className="text-xs font-semibold text-ink-900 block">
                        City
                      </label>
                      <input
                        id="seller-city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Panipat"
                        className="w-full h-11 px-3.5 bg-white border border-border rounded-input text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="seller-locality" className="text-xs font-semibold text-ink-900 block">
                        Locality / Sector <span className="text-danger">*</span>
                      </label>
                      <input
                        id="seller-locality"
                        type="text"
                        required
                        value={sellerLocality}
                        onChange={(e) => setSellerLocality(e.target.value)}
                        placeholder="e.g. Model Town, Sector 18"
                        className="w-full h-11 px-3.5 bg-white border border-border rounded-input text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="seller-landmark" className="text-xs font-semibold text-ink-900 block">
                        Landmark / Street <span className="text-ink-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        id="seller-landmark"
                        type="text"
                        value={sellerLandmark}
                        onChange={(e) => setSellerLandmark(e.target.value)}
                        placeholder="e.g. Near HUDA Park"
                        className="w-full h-11 px-3.5 bg-white border border-border rounded-input text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>
                  </div>

                  {/* Area Size, Unit, Facing */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="seller-size" className="text-xs font-semibold text-ink-900 block">
                        Plot / Area Size <span className="text-danger">*</span>
                      </label>
                      <input
                        id="seller-size"
                        type="number"
                        step="any"
                        min="1"
                        required
                        value={sellerSizeValue}
                        onChange={(e) => setSellerSizeValue(e.target.value)}
                        placeholder="e.g. 200"
                        className="w-full h-11 px-3.5 bg-white border border-border rounded-input text-sm font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="seller-unit" className="text-xs font-semibold text-ink-900 block">
                        Area Unit
                      </label>
                      <select
                        id="seller-unit"
                        value={sellerSizeUnit}
                        onChange={(e) => setSellerSizeUnit(e.target.value as any)}
                        className="w-full h-11 px-3 bg-white border border-border rounded-input text-sm font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      >
                        {UNIT_OPTIONS.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="seller-facing" className="text-xs font-semibold text-ink-900 block">
                        <span className="inline-flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-brand-600" />
                          <span>Facing</span>
                        </span>
                      </label>
                      <select
                        id="seller-facing"
                        value={facing}
                        onChange={(e) => setFacing(e.target.value)}
                        className="w-full h-11 px-3 bg-white border border-border rounded-input text-sm font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      >
                        {FACING_OPTIONS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Property Highlights */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink-900 block">
                      Property Highlights
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SELLER_HIGHLIGHT_OPTIONS.map((tag) => {
                        const active = highlights.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleHighlight(tag)}
                            className={clsx(
                              'px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer',
                              active
                                ? 'bg-lime text-ink-900 border-lime font-bold'
                                : 'bg-slate-50 text-ink-700 border-line hover:bg-slate-100'
                            )}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Requirements / Details */}
              <div className="space-y-1.5 pt-1">
                <label htmlFor="lead-notes" className="text-xs font-semibold text-ink-900 block">
                  {category === 'buyer'
                    ? 'Specific Requirements / Preferences (Optional)'
                    : 'Property Description / Additional Notes (Optional)'}
                </label>
                <textarea
                  id="lead-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    category === 'buyer'
                      ? 'e.g. Need 3 BHK ground/second floor with lift, car parking, Vastu-compliant, near main road...'
                      : 'e.g. Double-story newly constructed builder floor with modular kitchen, 40ft front road, ready for registry...'
                  }
                  className="w-full p-3.5 bg-white border border-border rounded-2xl text-sm text-ink-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              {submitError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-[11px] text-ink-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>
                    Shared privately only with <strong>{profile.agencyName}</strong> — never posted publicly.
                  </span>
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-cashfree-primary min-h-[48px] px-6 rounded-xl text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer shrink-0"
                >
                  <span>
                    {submitting
                      ? 'Submitting Details...'
                      : category === 'buyer'
                      ? 'Submit Buyer Requirement'
                      : 'Submit Property Details'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-lime" />
                </button>
              </div>
            </Card>
          </form>
        )}

        <footer className="text-center text-xs text-ink-500 py-4">
          Powered by{' '}
          <Link to="/" className="font-bold text-brand-700 hover:underline">
            LeadNivash Broker OS
          </Link>
        </footer>
      </main>
    </div>
  );
};
