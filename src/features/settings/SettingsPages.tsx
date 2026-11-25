import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { GlassCard } from '../../components/ui/GlassCard';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { apiClient } from '../../lib/api/client';
import { useTheme } from '../../lib/theme';
import { BRAND_NAME, PLAN_PRICING } from '../../config/constants';
import {
  ShieldCheck,
  Inbox,
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
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { SpecialOfferModal } from '../pricing/SpecialOfferModal';
import { startInteractiveTour } from '../onboarding/OnboardingTour';
import clsx from 'clsx';

type SettingsSection =
  | 'account'
  | 'subscription'
  | 'regional'
  | 'inboxes'
  | 'help'
  | 'privacy'
  | 'legal'
  | 'appearance';

const VALID_SECTIONS: SettingsSection[] = [
  'account',
  'subscription',
  'regional',
  'inboxes',
  'help',
  'privacy',
  'legal',
  'appearance',
];

const DELETE_CONFIRM_PHRASE = 'DELETE MY ACCOUNT';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { success, error } = useToast();
  const { mode, setMode } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const rawSection = searchParams.get('section') as SettingsSection | null;
  const activeSection: SettingsSection =
    rawSection && VALID_SECTIONS.includes(rawSection) ? rawSection : 'account';

  const setActiveSection = (section: SettingsSection) => {
    if (section === 'account') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ section }, { replace: true });
    }
  };

  // Profile Form State + Baseline for Dirty Detection
  const [name, setName] = useState(user?.name || '');
  const [agencyName, setAgencyName] = useState(user?.agency?.name || '');
  const [reraNo, setReraNo] = useState(user?.agency?.reraNo || '');
  const [agencyCity, setAgencyCity] = useState(user?.agency?.city || 'Panipat');
  const [marlaStandard, setMarlaStandard] = useState<'30.25' | '25'>(
    String((user as any)?.preferences?.marlaToGaj || '25') === '30.25' ? '30.25' : '25'
  );

  const [baseline, setBaseline] = useState({
    name: user?.name || '',
    agencyName: user?.agency?.name || '',
    reraNo: user?.agency?.reraNo || '',
    agencyCity: user?.agency?.city || 'Panipat',
    marlaStandard: (String((user as any)?.preferences?.marlaToGaj || '25') === '30.25' ? '30.25' : '25') as '30.25' | '25',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [inquiriesCount, setInquiriesCount] = useState<number>(0);
  const [isSpecialOfferOpen, setIsSpecialOfferOpen] = useState(false);
  const [isErasureModalOpen, setIsErasureModalOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');

  // Sync state whenever AuthContext user updates
  useEffect(() => {
    if (user) {
      const nextName = user.name || '';
      const nextAgency = user.agency?.name || '';
      const nextRera = user.agency?.reraNo || '';
      const nextCity = user.agency?.city || 'Panipat';
      const nextMarla: '30.25' | '25' =
        String((user as any)?.preferences?.marlaToGaj || '25') === '30.25' ? '30.25' : '25';

      setName(nextName);
      setAgencyName(nextAgency);
      setReraNo(nextRera);
      setAgencyCity(nextCity);
      setMarlaStandard(nextMarla);
      setBaseline({
        name: nextName,
        agencyName: nextAgency,
        reraNo: nextRera,
        agencyCity: nextCity,
        marlaStandard: nextMarla,
      });
    }
  }, [user]);

  // Fetch freshest profile & inquiries count on mount
  useEffect(() => {
    apiClient
      .get<any, any>('/users/me')
      .then((res) => {
        const u = res?.data || res;
        if (u) {
          const nextName = u.name || '';
          const nextAgency = u.agency?.name || '';
          const nextRera = u.agency?.reraNo || '';
          const nextCity = u.agency?.city || 'Panipat';
          const nextMarla: '30.25' | '25' =
            String(u.preferences?.marlaToGaj || '25') === '30.25' ? '30.25' : '25';

          setName(nextName);
          setAgencyName(nextAgency);
          setReraNo(nextRera);
          setAgencyCity(nextCity);
          setMarlaStandard(nextMarla);
          setBaseline({
            name: nextName,
            agencyName: nextAgency,
            reraNo: nextRera,
            agencyCity: nextCity,
            marlaStandard: nextMarla,
          });
        }
      })
      .catch((err) => console.warn('Settings: Could not refresh profile from API:', err));

    apiClient
      .get<any, any>('/inquiries')
      .then((res) => {
        const inqs = res?.items || res?.inquiries || res?.data?.items || (Array.isArray(res) ? res : []);
        setInquiriesCount(Array.isArray(inqs) ? inqs.length : 0);
      })
      .catch(() => setInquiriesCount(0));
  }, []);

  const isDirty =
    name.trim() !== baseline.name.trim() ||
    agencyName.trim() !== baseline.agencyName.trim() ||
    reraNo.trim() !== baseline.reraNo.trim() ||
    agencyCity.trim() !== baseline.agencyCity.trim() ||
    marlaStandard !== baseline.marlaStandard;

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

      setBaseline({
        name: name.trim(),
        agencyName: agencyName.trim(),
        reraNo: reraNo.trim(),
        agencyCity: agencyCity.trim(),
        marlaStandard,
      });

      await refreshUser();
      success('Settings updated successfully.');
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
      success('Your broker account data was exported successfully.');
    } catch {
      error('Failed to export data. Please try again or contact support.');
    } finally {
      setIsExporting(false);
    }
  };

  const displayTitle =
    name.trim() || user?.name || agencyName.trim() || user?.agency?.name || 'Broker Profile';
  const displayInitials =
    (name.trim() || user?.name || user?.agency?.name || user?.email?.split('@')[0] || 'S')
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'S';

  // Only show verified badge if backend explicitly confirms verification
  const isBackendVerified = Boolean((user as any)?.isVerified === true || (user as any)?.verified === true);

  // Plan & trial days
  const planTier = user?.plan?.tier || 'trial';
  const planTitle =
    planTier === 'trial'
      ? 'Free Trial Plan'
      : `${planTier.charAt(0).toUpperCase() + planTier.slice(1)} Plan`;
  const trialDaysLeft = (() => {
    if (planTier === 'trial' && user?.plan?.trialEndsAt) {
      const diff = new Date(user.plan.trialEndsAt).getTime() - Date.now();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    return null;
  })();
  const planLimits = user?.plan?.limits;

  const navItems: Array<{
    id: SettingsSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
      { id: 'account', label: 'Account', icon: UserIcon },
      { id: 'subscription', label: 'Subscription', icon: Crown },
      { id: 'regional', label: 'Regional preferences', icon: MapPin },
      { id: 'inboxes', label: 'Inboxes', icon: Inbox },
      { id: 'help', label: 'Help', icon: HelpCircle },
      { id: 'privacy', label: 'Privacy & data', icon: Lock },
      { id: 'legal', label: 'Legal', icon: FileText },
      { id: 'appearance', label: 'Appearance', icon: Sun },
    ];

  const handleEditProfileClick = () => {
    setActiveSection('account');
    setTimeout(() => nameInputRef.current?.focus(), 60);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-16 text-left">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your account, subscription, regional standards, and privacy preferences.
        </p>
      </div>

      {/* Mobile Horizontal Section Switcher (<lg) */}
      <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={clsx(
                'px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5 border shrink-0 transition cursor-pointer',
                isActive
                  ? 'bg-brand-50 text-brand-700 border-brand-200'
                  : 'bg-white text-slate-600 border-border hover:bg-slate-50'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Two-Column Desktop Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Section Links + Bottom Plain Legal & Destructive Log out */}
        <aside className="hidden lg:flex flex-col justify-between bg-white dark:bg-slate-900 border border-border rounded-[14px] p-2.5 sticky top-20 space-y-4">
          <nav className="space-y-1" aria-label="Settings sections">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left',
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon
                    className={clsx(
                      'w-4 h-4 shrink-0',
                      isActive ? 'text-brand-600' : 'text-slate-400'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom area of Left Nav: Plain Legal links + plain destructive Log out text button */}
          <div className="pt-3 border-t border-border px-2 space-y-2.5">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
              <Link to="/privacy" className="hover:text-slate-900 hover:underline">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-slate-900 hover:underline">
                Terms
              </Link>
              <Link to="/cookies" className="hover:text-slate-900 hover:underline">
                Cookies
              </Link>
              <Link to="/refund" className="hover:text-slate-900 hover:underline">
                Refund
              </Link>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="text-xs font-medium text-danger hover:underline cursor-pointer text-left"
            >
              Log out
            </button>
          </div>
        </aside>

        {/* RIGHT COLUMN: Profile Header + Active Section Panel */}
        <div className="space-y-5 min-w-0">
          {/* Top Profile Header (Flat Card, NOT Glass, 64px Circle Avatar, Edit top-right) */}
          <Card className="p-5 flex items-center justify-between gap-4 rounded-[14px] border border-border bg-white dark:bg-slate-900">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-16 h-16 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-bold text-xl flex items-center justify-center shrink-0">
                {displayInitials}
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[18px] font-bold text-ink-900 dark:text-white leading-snug truncate capitalize">
                    {displayTitle}
                  </h2>
                  {isBackendVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <p className="text-[13px] text-slate-500 truncate">
                  {agencyName.trim() ? `${agencyName.trim()} · ` : 'Direct Broker · '}
                  {agencyCity.trim() || 'Panipat'}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleEditProfileClick}
              className="gap-1.5 shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>
          </Card>

          {/* SECTION: ACCOUNT */}
          {activeSection === 'account' && (
            <Card className="p-5 sm:p-6 space-y-5 rounded-[14px] border border-border bg-white dark:bg-slate-900">
              <div className="pb-3 border-b border-border">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Account
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your broker identity, agency details, and login contact information.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-brand-600" />
                      <span>Broker name</span>
                    </label>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={name}
                      placeholder="Broker or representative name"
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 bg-white dark:bg-slate-900 border border-border rounded-input px-3.5 text-sm text-ink font-sans focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-brand-600" />
                      <span>Agency / firm</span>
                    </label>
                    <input
                      type="text"
                      value={agencyName}
                      placeholder="Agency or brokerage firm name"
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full h-11 bg-white dark:bg-slate-900 border border-border rounded-input px-3.5 text-sm text-ink font-sans focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      RERA / registration number
                    </label>
                    <input
                      type="text"
                      value={reraNo}
                      placeholder="e.g. HRERA-PKL-01-2024"
                      onChange={(e) => setReraNo(e.target.value)}
                      className="w-full h-11 bg-white dark:bg-slate-900 border border-border rounded-input px-3.5 text-sm text-ink font-sans focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Territory / city
                    </label>
                    <input
                      type="text"
                      value={agencyCity}
                      placeholder="e.g. Panipat, Karnal, Gurgaon"
                      onChange={(e) => setAgencyCity(e.target.value)}
                      className="w-full h-11 bg-white dark:bg-slate-900 border border-border rounded-input px-3.5 text-sm text-ink font-sans focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>
                </div>

                {/* Read-only Login IDs in Inter font (never monospace) + Lock Icon + Helper Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone number</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={user?.phone || (user as any)?.phoneE164 || 'Not registered'}
                        className="w-full h-11 bg-slate-50 dark:bg-slate-800/60 border border-border rounded-input pl-3.5 pr-9 text-sm font-medium text-slate-700 dark:text-slate-300 font-sans cursor-not-allowed"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <span className="text-xs text-slate-500 block">Used to log in</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email address</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={user?.email || 'Not provided'}
                        className="w-full h-11 bg-slate-50 dark:bg-slate-800/60 border border-border rounded-input pl-3.5 pr-9 text-sm font-medium text-slate-700 dark:text-slate-300 font-sans cursor-not-allowed"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <span className="text-xs text-slate-500 block">Used to log in</span>
                  </div>
                </div>

                {/* Save changes button appears ONLY when dirty */}
                {isDirty && (
                  <div className="flex justify-end pt-2 border-t border-border">
                    <Button
                      variant="primary"
                      size="md"
                      type="submit"
                      isLoading={isSaving}
                      className="whitespace-nowrap"
                    >
                      Save changes
                    </Button>
                  </div>
                )}
              </form>
            </Card>
          )}

          {/* SECTION: SUBSCRIPTION */}
          {activeSection === 'subscription' && (
            <GlassCard className="p-6 space-y-5 bg-surface dark:bg-ink-black border border-line">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
                    <Crown className="w-3.5 h-3.5 text-brand-600" />
                    <span>{planTitle}</span>
                  </div>
                  <h3 className="text-lg font-bold text-ink-900 dark:text-white pt-1">
                    {planTier === 'trial'
                      ? trialDaysLeft !== null
                        ? `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} remaining in your free trial`
                        : `${PLAN_PRICING.trialDays}-day free trial active`
                      : 'Active subscription'}
                  </h3>
                  {planLimits && (
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Plan limits: Up to {planLimits.maxProperties} properties · {planLimits.maxBuyers} buyers ·{' '}
                      {planLimits.maxParsePerMonth} AI parses/month
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => setIsSpecialOfferOpen(true)}
                  className="shrink-0 whitespace-nowrap"
                >
                  {`Upgrade · ${PLAN_PRICING.formattedAnnualOffer}`}
                </Button>
              </div>

              {/* Single price line sourced from shared plan config */}
              <div className="pt-4 border-t border-slate-200/70 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {PLAN_PRICING.priceLine}
                </span>
                <span className="text-xs text-slate-500">
                  7-day unconditional refund guarantee
                </span>
              </div>
            </GlassCard>
          )}

          {/* SECTION: REGIONAL PREFERENCES */}
          {activeSection === 'regional' && (
            <Card className="p-5 sm:p-6 space-y-5 rounded-[14px] border border-border bg-white dark:bg-slate-900">
              <div className="pb-3 border-b border-border">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Regional preferences
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure land measurement units and your default operating city.
                </p>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Regional Marla standard
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      val: '25' as const,
                      title: '25 Gaj / Marla (Panipat & Local Standard)',
                      sub: 'Standard across Panipat & Karnal',
                    },
                    {
                      val: '30.25' as const,
                      title: '30.25 Gaj / Marla (Haryana Official Standard)',
                      sub: 'Statutory Haryana revenue measure',
                    },
                  ].map((opt) => {
                    const selected = marlaStandard === opt.val;
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setMarlaStandard(opt.val)}
                        className={clsx(
                          'w-full text-left p-3.5 rounded-[12px] border transition cursor-pointer flex items-start gap-2.5',
                          selected
                            ? 'bg-brand-50/70 border-brand-600 text-slate-900'
                            : 'bg-white border-border text-slate-900 hover:bg-slate-50'
                        )}
                      >
                        <span
                          className={clsx(
                            'mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0',
                            selected
                              ? 'border-brand-600 bg-brand-600 text-white'
                              : 'border-slate-300 bg-white'
                          )}
                        >
                          {selected && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 leading-snug break-words">
                            {opt.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                            {opt.sub}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block">
                  Default operating territory
                </span>
                <div className="p-3.5 rounded-input bg-slate-50 border border-border flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-900 font-sans">
                    {agencyCity.trim() || 'Panipat, Haryana'}
                  </span>
                  <button
                    type="button"
                    onClick={handleEditProfileClick}
                    className="text-xs font-semibold text-brand-700 hover:underline cursor-pointer"
                  >
                    Change in Account
                  </button>
                </div>
              </div>

              {isDirty && (
                <div className="flex justify-end pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    isLoading={isSaving}
                    onClick={() => handleSaveProfile()}
                  >
                    Save changes
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* SECTION: INBOXES */}
          {activeSection === 'inboxes' && (
            <Card className="p-5 sm:p-6 space-y-4 rounded-[14px] border border-border bg-white dark:bg-slate-900">
              <div className="pb-3 border-b border-border">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Quick inboxes
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct shortcuts to client leads captured via shared flyers.
                </p>
              </div>

              {/* Single row with strict column separation so badge never overlaps description */}
              <Link
                to="/app/buyers?tab=inquiries"
                className="p-4 rounded-[12px] bg-white hover:bg-slate-50 border border-border grid grid-cols-[1fr_auto] items-center gap-4 transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-[12px] bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 text-sm block group-hover:text-brand-700 transition truncate">
                      Public flyer inquiries
                    </span>
                    <span className="text-slate-500 text-xs block truncate">
                      View leads captured from shared property flyer links
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="bg-brand-50 text-brand-700 font-semibold text-xs px-2.5 py-1 rounded-full whitespace-nowrap tabular-nums">
                    {inquiriesCount}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              </Link>
            </Card>
          )}

          {/* SECTION: HELP */}
          {activeSection === 'help' && (
            <Card className="p-5 sm:p-6 space-y-4 rounded-[14px] border border-border bg-white dark:bg-slate-900">
              <div className="pb-3 border-b border-border">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Help & onboarding
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Walk through core workflows across your broker workspace.
                </p>
              </div>

              <button
                type="button"
                onClick={() => startInteractiveTour()}
                className="w-full p-4 rounded-[12px] bg-white hover:bg-slate-50 border border-border flex items-center justify-between gap-4 transition group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-[12px] bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 text-sm block group-hover:text-brand-700 transition">
                      Interactive product tour
                    </span>
                    <span className="text-slate-500 text-xs block truncate">
                      Replay the guided walkthrough of Dashboard, Properties, Buyers, Quick Chat, and Tools
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </Card>
          )}

          {/* SECTION: PRIVACY & DATA (Two clearly separate actions, NOT one pink mega-card) */}
          {activeSection === 'privacy' && (
            <div className="space-y-4">
              <Card className="p-5 sm:p-6 space-y-3 rounded-[14px] border border-border bg-white dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Download my data
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                      Export a complete JSON archive of your properties, buyer requirements, and deal records under India DPDPA 2023 guidelines.
                    </p>
                  </div>
                </div>
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={handleExportData}
                    isLoading={isExporting}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download my data</span>
                  </Button>
                </div>
              </Card>

              <Card className="p-5 sm:p-6 space-y-3 rounded-[14px] border border-border bg-white dark:bg-slate-900">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Delete my account
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                    Permanently erase your broker account, Owner Vault contacts, listings, and buyer inquiries. This cannot be undone.
                  </p>
                </div>
                <div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="md"
                    onClick={() => {
                      setDeletePhrase('');
                      setIsErasureModalOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete my account</span>
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* SECTION: LEGAL */}
          {activeSection === 'legal' && (
            <Card className="p-5 sm:p-6 space-y-4 rounded-[14px] border border-border bg-white dark:bg-slate-900">
              <div className="pb-3 border-b border-border">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Legal & compliance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review {BRAND_NAME} policies and subscription terms.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {[
                  { label: 'Privacy policy', to: '/privacy' },
                  { label: 'Terms of service', to: '/terms' },
                  { label: 'Cookie policy', to: '/cookies' },
                  { label: 'Refund policy', to: '/refund' },
                ].map((doc) => (
                  <Link
                    key={doc.to}
                    to={doc.to}
                    className="py-3 px-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-sm font-medium text-slate-700 hover:text-slate-900 transition"
                  >
                    <span>{doc.label}</span>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* SECTION: APPEARANCE */}
          {activeSection === 'appearance' && (
            <Card className="p-5 sm:p-6 space-y-4 rounded-[14px] border border-border bg-white dark:bg-slate-900">
              <div className="pb-3 border-b border-border">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Appearance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose your workspace theme. Applies immediately across {BRAND_NAME}.
                </p>
              </div>

              <div className="inline-grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-border gap-1 w-full sm:w-auto">
                {(
                  [
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Monitor },
                  ] as const
                ).map((opt) => {
                  const Icon = opt.icon;
                  const active = mode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMode(opt.id)}
                      className={clsx(
                        'px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap',
                        active
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Account Modal requiring typed confirmation phrase */}
      <Modal
        open={isErasureModalOpen}
        onOpenChange={(open) => {
          setIsErasureModalOpen(open);
          if (!open) setDeletePhrase('');
        }}
        title="Delete my account"
        description="Permanent data deletion under India DPDPA 2023 regulations."
        footerActions={
          <>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsErasureModalOpen(false)}
            >
              Cancel
            </Button>
            {deletePhrase.trim() === DELETE_CONFIRM_PHRASE ? (
              <a
                href={`mailto:privacy@leadnivash.com?subject=${encodeURIComponent(
                  `Account Erasure Request - ${BRAND_NAME}`
                )}&body=${encodeURIComponent(
                  `Hello ${BRAND_NAME} Privacy Team,\n\nI request permanent erasure of my account.\nBroker Name: ${name || user?.name || ''}\nPhone: ${user?.phone || ''}\nAgency: ${agencyName || user?.agency?.name || ''}`
                )}`}
                onClick={() => setIsErasureModalOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 px-5 h-11 rounded-input bg-danger hover:bg-red-700 text-white text-sm font-semibold whitespace-nowrap transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm deletion</span>
              </a>
            ) : (
              <Button type="button" variant="destructive" size="md" disabled>
                Confirm deletion
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-4 text-left">
          <div className="p-3.5 rounded-[12px] bg-slate-50 border border-border flex items-start gap-2.5 text-xs text-slate-600">
            <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <span>
              All property listings, Owner Vault contacts, buyer requirements, and deal records will be permanently removed. We recommend exporting your data first.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Type <span className="font-bold text-slate-900">{DELETE_CONFIRM_PHRASE}</span> to confirm
            </label>
            <input
              type="text"
              value={deletePhrase}
              onChange={(e) => setDeletePhrase(e.target.value)}
              placeholder={DELETE_CONFIRM_PHRASE}
              className="w-full h-11 bg-white border border-border rounded-input px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-danger"
            />
          </div>
        </div>
      </Modal>

      {/* Centered Upgrade Modal (480px, radius 20) */}
      <SpecialOfferModal
        isOpen={isSpecialOfferOpen}
        onClose={() => setIsSpecialOfferOpen(false)}
      />
    </div>
  );
};
