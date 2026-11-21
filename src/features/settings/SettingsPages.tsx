import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { apiClient } from '../../lib/api/client';
import {
  Settings as SettingsIcon,
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
} from 'lucide-react';
import { startInteractiveTour } from '../onboarding/OnboardingTour';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { success, error } = useToast();

  // Profile Form State (connected directly to backend User & Agency profile)
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

  // Fetch freshest profile & inquiries on component mount
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

  // Derive dynamic initials from Broker Name, User Email, or Agency Name (matching TopBar & Avatar)
  const displayTitle = agencyName.trim() || name.trim() || user?.agency?.name || user?.name || user?.email?.split('@')[0] || 'My Agency Profile';
  const displayInitials = (user?.name || name || user?.email?.split('@')[0] || agencyName || 'BR')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'BR';

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16 text-left px-2 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-brand-600" />
          <h1 className="text-xl sm:text-2xl font-black text-ink font-heading tracking-tight">
            Settings & Agency Profile
          </h1>
        </div>
        <Badge variant="brand">
          Verified Account
        </Badge>
      </div>

      {/* Agency Identity & Verified Badge Card */}
      <Card className="p-5 sm:p-6 space-y-4 border-emerald-500/30 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-brand-700/20 shrink-0">
              {displayInitials}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base font-black text-ink font-heading">{displayTitle}</h2>
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <p className="text-xs text-muted">
                Primary Territory: <span className="font-semibold text-ink">{agencyCity || 'Panipat Central'}</span>
              </p>
            </div>
          </div>

          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30 self-start sm:self-auto">
            {reraNo.trim() ? 'RERA Verified Broker' : 'Verified Broker'}
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <Building2 className="w-3 h-3 text-emerald-600" />
                <span>Agency / Firm Name</span>
              </label>
              <input
                type="text"
                value={agencyName}
                placeholder="Enter agency or firm name (e.g. Prime Realty)"
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 min-h-[44px] text-base sm:text-xs text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                RERA / Registration No.
              </label>
              <input
                type="text"
                value={reraNo}
                placeholder="Enter RERA registration number (optional)"
                onChange={(e) => setReraNo(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 min-h-[44px] text-base sm:text-xs text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <UserIcon className="w-3 h-3 text-emerald-600" />
                <span>Broker Contact Person</span>
              </label>
              <input
                type="text"
                value={name}
                placeholder="Enter broker contact person name"
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 min-h-[44px] text-base sm:text-xs text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Primary Territory / City
              </label>
              <input
                type="text"
                value={agencyCity}
                placeholder="Enter primary operating city (e.g. Panipat)"
                onChange={(e) => setAgencyCity(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 min-h-[44px] text-base sm:text-xs text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Registered Contact Phone (Login ID)
              </label>
              <input
                type="text"
                disabled
                value={user?.phone || '+91' + (user as any)?.phoneE164 || 'Registered Phone'}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-border rounded-xl px-3.5 py-3 min-h-[44px] text-base sm:text-xs text-muted cursor-not-allowed font-mono"
              />
              <span className="text-[10px] text-muted">Phone is bound to your authentication security credential.</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Registered Account Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'Registered Email'}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-border rounded-xl px-3.5 py-3 min-h-[44px] text-base sm:text-xs text-muted cursor-not-allowed font-mono"
              />
              <span className="text-[10px] text-muted">Email address for login & security alerts.</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Regional Marla Standard
            </label>
            <select
              value={marlaStandard}
              onChange={(e) => setMarlaStandard(e.target.value as any)}
              className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 min-h-[44px] text-base sm:text-xs text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer"
            >
              <option value="25">25 Gaj / Marla (Panipat Local Standard)</option>
              <option value="30.25">30.25 Gaj / Marla (Haryana Official Standard)</option>
            </select>
            <span className="text-[10px] text-muted">Sets default conversion unit across Quick Chat and tools.</span>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" pill type="submit" isLoading={isSaving} className="w-full sm:w-auto font-bold text-xs min-h-[44px]">
              {isSaved ? (
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Profile Saved</span>
                </span>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Shortcuts & Inbox Card */}
      <Card className="p-4 sm:p-5 space-y-2 border-border shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted pb-1">
          Quick Inboxes & Dashboards
        </h3>

        <Link
          to="/app/inquiries"
          className="p-3 rounded-2xl bg-surface hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-border flex items-center justify-between text-xs transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-ink block group-hover:text-brand-700 transition">
                Public Flyer Inquiries Inbox
              </span>
              <span className="text-muted text-[11px]">View leads captured from shared flyer links</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-brand-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
              {inquiriesCount} {inquiriesCount === 1 ? 'Inquiry' : 'Inquiries'}
            </span>
            <ChevronRight className="w-4 h-4 text-muted" />
          </div>
        </Link>
      </Card>

      {/* Help & Interactive Guided Tour (Stage 5) */}
      <Card className="p-4 sm:p-5 space-y-2 border-emerald-500/25 bg-gradient-to-br from-white via-emerald-50/20 to-white dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted pb-1">
          Help & Product Tour
        </h3>

        <button
          type="button"
          onClick={() => startInteractiveTour()}
          className="w-full p-3 rounded-2xl bg-surface hover:bg-emerald-50/60 dark:hover:bg-slate-800/80 border border-emerald-500/30 flex items-center justify-between text-xs transition group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-bold text-ink block group-hover:text-emerald-700 transition">
                Take Interactive Product Tour
              </span>
              <span className="text-muted text-[11px]">
                Replay the 7-step guided tour of Dashboard, Inventory, Buyers, Quick Chat, and Tools
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs">
              7 Steps
            </span>
            <ChevronRight className="w-4 h-4 text-muted" />
          </div>
        </button>
      </Card>

      {/* Privacy, Data Export & Account Deletion */}
      <Card className="p-4 sm:p-5 space-y-4 border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 pb-1 border-b border-border/80">
          <Lock className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
            Data Ownership & Privacy Rights
          </h3>
        </div>

        <p className="text-xs text-muted leading-relaxed">
          You retain 100% ownership of your listings, owner contacts, and buyer requirements under our Owner Vault Isolation architecture.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Data Export */}
          <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-2 flex flex-col justify-between">
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
              className="w-full text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Archive</span>
            </Button>
          </div>

          {/* Account Deletion */}
          <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-bold text-rose-800 dark:text-rose-300 text-xs block">Request Account Erasure</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Permanently purge your account, Owner Vault records, and buyer leads under DPDPA 2023 regulations.
              </p>
            </div>
            <a
              href="mailto:privacy@leadnivash.com?subject=Account%20and%20Data%20Deletion%20Request%20-%20leadNivash&body=Hello%20leadNivash%20Privacy%20Team,%0A%0APlease%20permanently%20delete%20my%20account%20and%20all%20associated%20data.%0A%0ARegistered%20Phone:%20%0AAgency%20Name:%20"
              className="w-full py-1.5 px-3 rounded-full border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-center text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Request Data Erasure</span>
            </a>
          </div>
        </div>

        {/* Legal Policies Links */}
        <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
          <span>Legal & Compliance:</span>
          <div className="flex items-center gap-3">
            <Link to="/privacy" className="text-emerald-700 dark:text-emerald-400 hover:underline">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms" className="text-emerald-700 dark:text-emerald-400 hover:underline">Terms</Link>
            <span>·</span>
            <Link to="/cookies" className="text-emerald-700 dark:text-emerald-400 hover:underline">Cookies</Link>
            <span>·</span>
            <Link to="/refund" className="text-emerald-700 dark:text-emerald-400 hover:underline">Refund Policy</Link>
          </div>
        </div>
      </Card>

      {/* Sign Out Card */}
      <Card className="p-4 border-border">
        <button
          onClick={() => logout()}
          className="w-full py-2.5 px-4 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of leadNivash</span>
        </button>
      </Card>
    </div>
  );
};
