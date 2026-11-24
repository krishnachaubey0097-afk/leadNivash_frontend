import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { apiClient } from '../../lib/api/client';
import { useTheme } from '../../lib/theme';
import {
  ShieldCheck,
  Inbox,
  LogOut,
  ChevronRight,
  Check,
  HelpCircle,
  Download,
  Trash2,
  Lock,
  Building2,
  User as UserIcon,
  Crown,
  MapPin,
  FileText,
  Sun,
  Moon,
  Monitor,
  Phone,
  Mail,
  AlertTriangle,
  X,
  ExternalLink,
} from 'lucide-react';
import { SpecialOfferModal } from '../pricing/SpecialOfferModal';
import { startInteractiveTour } from '../onboarding/OnboardingTour';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { success, error } = useToast();
  const { mode, setMode } = useTheme();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [agencyName, setAgencyName] = useState(user?.agency?.name || '');
  const [reraNo, setReraNo] = useState(user?.agency?.reraNo || '');
  const [agencyCity, setAgencyCity] = useState(user?.agency?.city || 'Panipat');
  const [marlaStandard, setMarlaStandard] = useState<'30.25' | '25'>(
    String((user as any)?.preferences?.marlaToGaj || '25') === '30.25' ? '30.25' : '25'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [inquiriesCount, setInquiriesCount] = useState<number>(0);
  const [isSpecialOfferOpen, setIsSpecialOfferOpen] = useState(false);
  const [isErasureModalOpen, setIsErasureModalOpen] = useState(false);

  // Sync state whenever AuthContext user updates
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.agency?.name) setAgencyName(user.agency.name);
      if (user.agency?.reraNo) setReraNo(user.agency.reraNo);
      if (user.agency?.city) setAgencyCity(user.agency.city);
      if ((user as any).preferences?.marlaToGaj) {
        setMarlaStandard(String((user as any).preferences.marlaToGaj) === '30.25' ? '30.25' : '25');
      }
    }
  }, [user]);

  // Fetch freshest profile & inquiries count on component mount
  useEffect(() => {
    apiClient
      .get<any, any>('/users/me')
      .then((res) => {
        const u = res?.data || res;
        if (u) {
          if (u.name) setName(u.name);
          if (u.agency?.name) setAgencyName(u.agency.name);
          if (u.agency?.reraNo) setReraNo(u.agency.reraNo);
          if (u.agency?.city) setAgencyCity(u.agency.city);
          if (u.preferences?.marlaToGaj) {
            setMarlaStandard(String(u.preferences.marlaToGaj) === '30.25' ? '30.25' : '25');
          }
        }
      })
      .catch((err) => console.warn('Settings: Could not refresh profile from API:', err));

    apiClient
      .get<any, any>('/inquiries')
      .then((res) => {
        const inqs = res?.inquiries || res?.data || (Array.isArray(res) ? res : []);
        setInquiriesCount(Array.isArray(inqs) ? inqs.length : 0);
      })
      .catch(() => setInquiriesCount(0));
  }, []);

  // Save Settings to Backend API (PATCH /api/v1/users/me)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.patch('/users/me', {
        name: name.trim() || undefined,
        agency: {
          name: agencyName.trim() || undefined,
          reraNo: reraNo.trim() || undefined,
          city: agencyCity.trim() || undefined,
        },
        preferences: {
          marlaToGaj: Number(marlaStandard),
          defaultCity: agencyCity.trim() || undefined,
        },
      });

      await refreshUser();
      setIsSaved(true);
      success('Agency profile and settings updated successfully!');
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      error(err.message || 'Failed to update settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await apiClient.get('/users/me/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leadnivash-broker-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      success('Your broker account data was exported successfully!');
    } catch {
      error('Failed to export data. Please try again or contact support.');
    } finally {
      setIsExporting(false);
    }
  };

  // Derive dynamic initials matching application header
  const displayTitle = name.trim() || user?.name || agencyName.trim() || user?.agency?.name || 'Broker Profile';
  const displayInitials = (name.trim() || user?.name || user?.agency?.name || user?.email?.split('@')[0] || 'S')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'S';

  // Genuine verification status check
  const isVerified = Boolean(
    (user as any)?.isVerified ||
    (user as any)?.verified ||
    (user?.agency?.reraNo && user.agency.reraNo.trim().length > 0)
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20 text-left px-3 sm:px-0">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-ink font-heading tracking-tight">
          Settings & Agency Profile
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Manage your broker account, subscription, and regional preferences.
        </p>
      </div>

      {/* Top Profile Area: Single Clean Profile Card */}
      <Card className="p-4 sm:p-5 border-border bg-white dark:bg-slate-900 shadow-xs rounded-2xl">
        <div className="flex items-center gap-3.5">
          {/* Circular avatar matching application header */}
          <div className="w-14 h-14 rounded-full bg-brand-50 border-2 border-brand-600/20 text-brand-700 font-bold text-lg flex items-center justify-center shrink-0 shadow-2xs">
            {displayInitials}
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-ink font-heading truncate capitalize">
                {displayTitle}
              </h2>
              {isVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/25 px-2 py-0.5 rounded-full shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            <p className="text-xs text-muted truncate">
              {agencyName.trim() ? `${agencyName.trim()} · ` : 'Direct Broker · '}
              <span className="text-ink font-medium">{agencyCity.trim() || 'Haryana Market'}</span>
            </p>

            <p className="text-[11px] text-muted truncate">
              Operating Territory: <span className="font-semibold text-ink">{agencyCity.trim() || 'Panipat & NCR'}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Section 1: Account & Agency Profile */}
      <Card className="p-4 sm:p-5 space-y-4 border-border bg-white dark:bg-slate-900 shadow-xs rounded-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-ink font-heading">
              1. Account & Agency Profile
            </h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Secure Profile
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <UserIcon className="w-3 h-3 text-emerald-600" />
                <span>Broker Name</span>
              </label>
              <input
                type="text"
                value={name}
                placeholder="Broker or representative name"
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 min-h-[44px] text-sm text-ink font-medium font-sans focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <Building2 className="w-3 h-3 text-emerald-600" />
                <span>Agency / Firm Name</span>
              </label>
              <input
                type="text"
                value={agencyName}
                placeholder="Agency or brokerage firm name"
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 min-h-[44px] text-sm text-ink font-medium font-sans focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
                RERA / Registration No.
              </label>
              <input
                type="text"
                value={reraNo}
                placeholder="RERA number (e.g. HRERA-PKL-01-2024)"
                onChange={(e) => setReraNo(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 min-h-[44px] text-sm text-ink font-medium font-sans focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Operating Territory / City
              </label>
              <input
                type="text"
                value={agencyCity}
                placeholder="Primary city (e.g. Panipat, Karnal, Gurgaon)"
                onChange={(e) => setAgencyCity(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 min-h-[44px] text-sm text-ink font-medium font-sans focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>

          {/* Authentication-Bound Read-Only Fields (Standard Font, Not Monospace) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-500" />
                <span>Login Phone Number (Read only)</span>
              </label>
              <input
                type="text"
                disabled
                value={user?.phone || (user as any)?.phoneE164 || 'Not registered'}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 min-h-[44px] text-sm font-medium text-slate-700 dark:text-slate-300 font-sans cursor-not-allowed select-none"
              />
              <span className="text-[10px] text-muted block leading-tight">
                Authentication-bound login ID. Cannot be modified here.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-500" />
                <span>Account Email (Read only)</span>
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'Not provided'}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 min-h-[44px] text-sm font-medium text-slate-700 dark:text-slate-300 font-sans cursor-not-allowed select-none"
              />
              <span className="text-[10px] text-muted block leading-tight">
                Used for account security alerts and verification.
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              pill
              type="submit"
              isLoading={isSaving}
              className="w-full sm:w-auto font-bold text-xs min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSaved ? (
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Profile Saved</span>
                </span>
              ) : (
                'Save Profile Changes'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Section 2: Subscription & Plan */}
      <Card className="p-4 sm:p-5 space-y-4 border-emerald-500/25 bg-gradient-to-br from-white via-emerald-50/20 to-white dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 shadow-xs rounded-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-ink font-heading">
              2. Subscription & Plan
            </h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            {user?.plan?.tier === 'trial' || !user?.plan?.tier ? '14-Day Free Trial' : `${user.plan.tier.toUpperCase()} Pro`}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-border">
            <div>
              <span className="text-xs text-muted block">Current Plan Status</span>
              <span className="text-sm font-bold text-ink font-sans">
                {user?.plan?.tier === 'trial' || !user?.plan?.tier
                  ? 'Active Trial — Full Pro Broker Access'
                  : 'Active Pro Subscription'}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-muted block">Annual Pricing</span>
              <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-sans">
                ₹3,299 <span className="text-xs font-normal text-muted">/ year</span>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
              Included Pro Platform Benefits
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Unlimited Property Listings</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Automated WhatsApp Deal Matching</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Private Owner Vault Protection</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>1-Click WhatsApp Pitch & Flyers</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            Annual plan is ₹3,299 billed annually (equivalent to ₹275/month), or ₹399 billed monthly. Transparent pricing with zero hidden charges.
          </p>

          <button
            type="button"
            onClick={() => setIsSpecialOfferOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 transition cursor-pointer min-h-[44px]"
          >
            <Crown className="w-4 h-4" />
            <span>Upgrade to Annual Pro — ₹3,299/yr</span>
          </button>
        </div>
      </Card>

      {/* Section 3: Regional Preferences */}
      <Card className="p-4 sm:p-5 space-y-4 border-border bg-white dark:bg-slate-900 shadow-xs rounded-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-ink font-heading">
              3. Regional Preferences
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            Haryana Standard
          </span>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted block">
              Regional Marla Standard
            </label>
            <select
              value={marlaStandard}
              onChange={(e) => setMarlaStandard(e.target.value as any)}
              className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 min-h-[44px] text-sm text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer"
            >
              <option value="25">25 Gaj / Marla (Panipat & Local Standard)</option>
              <option value="30.25">30.25 Gaj / Marla (Haryana Official Standard)</option>
            </select>
            <p className="text-[11px] text-muted leading-relaxed">
              Standardizes plot size calculations and square yard conversions across Quick Chat, Property Inventory, and Haryana Registry Tools. 25 Gaj is standard in Panipat/Karnal; 30.25 Gaj is the statutory Haryana revenue standard.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
              Default Operating Territory
            </span>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-border flex items-center justify-between">
              <span className="text-sm font-medium text-ink font-sans">
                {agencyCity.trim() || 'Panipat, Haryana'}
              </span>
              <span className="text-[10px] text-muted">Configured in Profile</span>
            </div>
            <p className="text-[11px] text-muted">
              Pre-selected as the primary region for automated buyer matches and WhatsApp extraction.
            </p>
          </div>
        </div>
      </Card>

      {/* Section 4: Quick Inboxes & Dashboards */}
      <Card className="p-4 sm:p-5 space-y-3 border-border bg-white dark:bg-slate-900 shadow-xs rounded-2xl">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Inbox className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-bold text-ink font-heading">
            4. Quick Inboxes & Dashboards
          </h3>
        </div>

        {/* Public Flyer Inquiries Inbox Row: Strict separation between text & badge */}
        <Link
          to="/app/inquiries"
          className="p-3.5 rounded-xl bg-surface hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-border flex items-center justify-between gap-3 text-xs transition group"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 flex items-center justify-center shrink-0">
              <Inbox className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-ink text-sm block group-hover:text-brand-700 transition truncate">
                Public Flyer Inquiries Inbox
              </span>
              <span className="text-muted text-[11px] block truncate">
                View leads captured from shared property flyer links
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="bg-brand-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap">
              {inquiriesCount} {inquiriesCount === 1 ? 'Inquiry' : 'Inquiries'}
            </span>
            <ChevronRight className="w-4 h-4 text-muted shrink-0" />
          </div>
        </Link>
      </Card>

      {/* Section 5: Help & Product Tour */}
      <Card className="p-4 sm:p-5 space-y-3 border-border bg-white dark:bg-slate-900 shadow-xs rounded-2xl">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-ink font-heading">
            5. Help & Product Tour
          </h3>
        </div>

        <button
          type="button"
          onClick={() => startInteractiveTour()}
          className="w-full p-3.5 rounded-xl bg-surface hover:bg-emerald-50/50 dark:hover:bg-slate-800/80 border border-emerald-500/25 flex items-center justify-between gap-3 text-xs transition group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <span className="font-bold text-ink text-sm block group-hover:text-emerald-700 transition truncate">
                Interactive Product Tour
              </span>
              <span className="text-muted text-[11px] block truncate">
                Replay 7-step guided tour of Dashboard, Inventory, Buyers, Quick Chat, and Tools
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="bg-emerald-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap shadow-2xs">
              7 Steps
            </span>
            <ChevronRight className="w-4 h-4 text-muted shrink-0" />
          </div>
        </button>
      </Card>

      {/* Section 6: Data Ownership & Privacy */}
      <Card className="p-4 sm:p-5 space-y-4 border-border bg-white dark:bg-slate-900 shadow-xs rounded-2xl">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Lock className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-ink font-heading">
            6. Data Ownership & Privacy
          </h3>
        </div>

        <p className="text-xs text-muted leading-relaxed">
          You retain 100% ownership of your listings, owner contacts, and buyer requirements under our Owner Vault Isolation architecture. Your data is never sold, shared, or exposed to competing brokers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Data Export */}
          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2.5 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-bold text-ink text-xs block">Export Account Data</span>
              <p className="text-[11px] text-muted">
                Download a complete, machine-readable JSON archive of all your properties, buyers, and deals.
              </p>
            </div>
            <Button
              size="sm"
              pill
              variant="secondary"
              onClick={handleExportData}
              isLoading={isExporting}
              className="w-full text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Archive</span>
            </Button>
          </div>

          {/* Account Deletion / Erasure */}
          <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-bold text-rose-800 dark:text-rose-300 text-xs block">Request Account Erasure</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Permanently purge your account, Owner Vault records, and buyer leads under India DPDPA 2023 regulations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsErasureModalOpen(true)}
              className="w-full py-2 px-3 rounded-full border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-center text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Request Account Erasure</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Section 7: Legal & Compliance */}
      <Card className="p-4 sm:p-5 space-y-3 border-border bg-white dark:bg-slate-900 shadow-xs rounded-2xl">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h3 className="text-sm font-bold text-ink font-heading">
            7. Legal & Compliance
          </h3>
        </div>

        <div className="space-y-1.5 text-xs">
          <Link
            to="/privacy"
            className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-border flex items-center justify-between text-slate-700 dark:text-slate-300 transition"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold">Privacy Policy (DPDPA 2023 Compliant)</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted" />
          </Link>

          <Link
            to="/terms"
            className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-border flex items-center justify-between text-slate-700 dark:text-slate-300 transition"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold">Terms of Service</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted" />
          </Link>

          <Link
            to="/cookies"
            className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-border flex items-center justify-between text-slate-700 dark:text-slate-300 transition"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold">Cookie & Storage Policy</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted" />
          </Link>

          <Link
            to="/refund"
            className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-border flex items-center justify-between text-slate-700 dark:text-slate-300 transition"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold">Refund & Subscription Policy</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted" />
          </Link>
        </div>
      </Card>

      {/* Section 8: Appearance (Theme Controls) */}
      <Card className="p-4 sm:p-5 space-y-3 border-border bg-white dark:bg-slate-900 shadow-xs rounded-2xl">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Sun className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-ink font-heading">
            8. Appearance
          </h3>
        </div>

        <p className="text-xs text-muted">
          Choose your interface theme. Settings apply instantly across your broker workspace.
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setMode('light')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer min-h-[52px] ${
              mode === 'light'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold shadow-2xs'
                : 'bg-surface border-border text-muted hover:text-ink hover:border-slate-300 font-medium'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="text-xs">Light</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('dark')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer min-h-[52px] ${
              mode === 'dark'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold shadow-2xs'
                : 'bg-surface border-border text-muted hover:text-ink hover:border-slate-300 font-medium'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-500" />
            <span className="text-xs">Dark</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('system')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer min-h-[52px] ${
              mode === 'system'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold shadow-2xs'
                : 'bg-surface border-border text-muted hover:text-ink hover:border-slate-300 font-medium'
            }`}
          >
            <Monitor className="w-4 h-4 text-slate-500" />
            <span className="text-xs">System</span>
          </button>
        </div>
      </Card>

      {/* Bottom Area: Sign Out Action */}
      <Card className="p-3.5 border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/10 rounded-2xl">
        <button
          type="button"
          onClick={() => logout()}
          className="w-full py-3 px-4 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-950/40 border border-rose-300/60 dark:border-rose-800/60 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer min-h-[48px]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of leadNivash</span>
        </button>
      </Card>

      {/* Account Erasure In-Context Confirmation Modal */}
      {isErasureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 border border-rose-200 dark:border-rose-900 shadow-2xl text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setIsErasureModalOpen(false)}
                className="text-muted hover:text-ink p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-ink font-heading">
                Confirm Account Erasure Request
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                This action initiates permanent data destruction under India DPDPA 2023 regulations. All your listings, owner records in Owner Vault, buyer requirements, and match records will be unrecoverably erased.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-800 dark:text-rose-300 space-y-1">
              <span className="font-bold block">Irreversible Action:</span>
              <p>Active subscriptions will be terminated. We recommend exporting your account data JSON archive first.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsErasureModalOpen(false)}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-border text-ink text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-[44px]"
              >
                Cancel
              </button>
              <a
                href={`mailto:privacy@leadnivash.com?subject=Account%20Erasure%20Request%20-%20leadNivash&body=Hello%20leadNivash%20Privacy%20Team,%0A%0AI%20hereby%20request%20the%20permanent%20erasure%20of%20my%20account%20and%20all%20associated%20data%20under%20DPDPA%202023.%0A%0ABroker%20Name:%20${encodeURIComponent(name || user?.name || '')}%0ARegistered%20Phone:%20${encodeURIComponent(user?.phone || '')}%0AAgency:%20${encodeURIComponent(agencyName || user?.agency?.name || '')}`}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 min-h-[44px] text-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Request</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Special Annual Offer / Pricing Modal */}
      <SpecialOfferModal
        isOpen={isSpecialOfferOpen}
        onClose={() => setIsSpecialOfferOpen(false)}
      />
    </div>
  );
};
