import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { GlassCard } from '../../components/ui/GlassCard';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { apiClient } from '../../lib/api/client';
import { BRAND_CONTACT, BRAND_NAME, PLAN_PRICING } from '../../config/constants';
import { SocialLinks } from '../../components/ui/SocialLinks';
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
  Phone,
  Mail,
  AlertTriangle,
  ExternalLink,
  Edit3,
  ArrowUpRight,
} from 'lucide-react';
import { SpecialOfferModal } from '../pricing/SpecialOfferModal';
import { startInteractiveTour } from '../onboarding/OnboardingTour';
import { openVideoGuide } from '../onboarding/GuideVideoModal';
import { INDIAN_STATES, DEFAULT_STATE_NAME, getStateRule } from '../../lib/indianStates';
import {
  verifyCashfreePayment,
  cancelCashfreeAutoPay,
  fetchPaymentHistory,
  type PaymentRecordDto,
  type CashfreePlanCode,
} from '../../lib/cashfree';
import clsx from 'clsx';

type SettingsSection =
  | 'account'
  | 'subscription'
  | 'regional'
  | 'inboxes'
  | 'help'
  | 'privacy'
  | 'legal';

const VALID_SECTIONS: SettingsSection[] = [
  'account',
  'subscription',
  'regional',
  'inboxes',
  'help',
  'privacy',
  'legal',
];

const DELETE_CONFIRM_PHRASE = 'DELETE MY ACCOUNT';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { success, error } = useToast();
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
  const [defaultState, setDefaultState] = useState(
    user?.preferences?.defaultState || DEFAULT_STATE_NAME
  );
  const [guideLanguage, setGuideLanguage] = useState<'en' | 'hi' | 'pa' | 'ta' | 'mr'>(
    user?.preferences?.language || 'en'
  );
  const [marlaStandard, setMarlaStandard] = useState<'30.25' | '25'>(
    String((user as any)?.preferences?.marlaToGaj || '30.25') === '25' ? '25' : '30.25'
  );

  const [baseline, setBaseline] = useState({
    name: user?.name || '',
    agencyName: user?.agency?.name || '',
    reraNo: user?.agency?.reraNo || '',
    agencyCity: user?.agency?.city || 'Panipat',
    defaultState: user?.preferences?.defaultState || DEFAULT_STATE_NAME,
    guideLanguage: (user?.preferences?.language || 'en') as 'en' | 'hi' | 'pa' | 'ta' | 'mr',
    marlaStandard: (String((user as any)?.preferences?.marlaToGaj || '30.25') === '25' ? '25' : '30.25') as '30.25' | '25',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [inquiriesCount, setInquiriesCount] = useState<number>(0);
  const [isSpecialOfferOpen, setIsSpecialOfferOpen] = useState(false);
  const [specialOfferPlanCode, setSpecialOfferPlanCode] = useState<CashfreePlanCode>('yearly_trial_3299');
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecordDto[]>([]);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isCancellingAutoPay, setIsCancellingAutoPay] = useState(false);
  const [isErasureModalOpen, setIsErasureModalOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');

  // Handle Cashfree return verification & ?pay= deep-link inside Subscription section
  useEffect(() => {
    const cfSubId = searchParams.get('cf_sub_id');
    const cfOrderId = searchParams.get('cf_order_id');
    const payPlan = searchParams.get('pay') as CashfreePlanCode | null;

    if (cfSubId || cfOrderId) {
      setIsVerifyingPayment(true);
      verifyCashfreePayment({
        subscriptionId: cfSubId || undefined,
        orderId: cfOrderId || undefined,
      })
        .then(async (res) => {
          await refreshUser();
          const hist = await fetchPaymentHistory().catch(() => []);
          setPaymentHistory(hist);
          if (res.activated) {
            success(`Payment verified! Your ${res.planTier === 'pro' ? 'LeadNivash Pro' : 'Monthly'} plan is active.`);
          } else {
            error(`Payment status: ${res.status}. If you completed payment, your plan will activate shortly.`);
          }
        })
        .catch((err: any) => {
          error(err?.message || 'Could not verify Cashfree payment status yet.');
        })
        .finally(() => {
          setIsVerifyingPayment(false);
          setSearchParams({ section: 'subscription' }, { replace: true });
        });
    } else if (payPlan && ['monthly_399', 'yearly_trial_3299', 'yearly_3999'].includes(payPlan)) {
      setSpecialOfferPlanCode(payPlan);
      setIsSpecialOfferOpen(true);
      setSearchParams({ section: 'subscription' }, { replace: true });
    }
  }, [searchParams, refreshUser, success, error, setSearchParams]);

  useEffect(() => {
    if (activeSection === 'subscription') {
      fetchPaymentHistory()
        .then(setPaymentHistory)
        .catch(() => { });
    }
  }, [activeSection]);

  const handleCancelAutoPay = async (subscriptionId: string) => {
    setIsCancellingAutoPay(true);
    try {
      await cancelCashfreeAutoPay(subscriptionId);
      const hist = await fetchPaymentHistory().catch(() => []);
      setPaymentHistory(hist);
      success('AutoPay renewal cancelled. Your current active period remains available until expiry.');
    } catch (err: any) {
      error(err?.message || 'Failed to cancel AutoPay subscription.');
    } finally {
      setIsCancellingAutoPay(false);
    }
  };

  // Sync state whenever AuthContext user updates
  useEffect(() => {
    if (user) {
      const nextName = user.name || '';
      const nextAgency = user.agency?.name || '';
      const nextRera = user.agency?.reraNo || '';
      const nextCity = user.agency?.city || 'Panipat';
      const nextState = user.preferences?.defaultState || DEFAULT_STATE_NAME;
      const nextLang = (user.preferences?.language || 'en') as 'en' | 'hi' | 'pa' | 'ta' | 'mr';
      const nextMarla: '30.25' | '25' =
        String((user as any)?.preferences?.marlaToGaj || '30.25') === '25' ? '25' : '30.25';

      setName(nextName);
      setAgencyName(nextAgency);
      setReraNo(nextRera);
      setAgencyCity(nextCity);
      setDefaultState(nextState);
      setGuideLanguage(nextLang);
      setMarlaStandard(nextMarla);
      setBaseline({
        name: nextName,
        agencyName: nextAgency,
        reraNo: nextRera,
        agencyCity: nextCity,
        defaultState: nextState,
        guideLanguage: nextLang,
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
          const nextState = u.preferences?.defaultState || DEFAULT_STATE_NAME;
          const nextLang = (u.preferences?.language || 'en') as 'en' | 'hi' | 'pa' | 'ta' | 'mr';
          const nextMarla: '30.25' | '25' =
            String(u.preferences?.marlaToGaj || '30.25') === '25' ? '25' : '30.25';

          setName(nextName);
          setAgencyName(nextAgency);
          setReraNo(nextRera);
          setAgencyCity(nextCity);
          setDefaultState(nextState);
          setGuideLanguage(nextLang);
          setMarlaStandard(nextMarla);
          setBaseline({
            name: nextName,
            agencyName: nextAgency,
            reraNo: nextRera,
            agencyCity: nextCity,
            defaultState: nextState,
            guideLanguage: nextLang,
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
    defaultState !== baseline.defaultState ||
    guideLanguage !== baseline.guideLanguage ||
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
          defaultState,
          language: guideLanguage,
        },
      });

      setBaseline({
        name: name.trim(),
        agencyName: agencyName.trim(),
        reraNo: reraNo.trim(),
        agencyCity: agencyCity.trim(),
        defaultState,
        guideLanguage,
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
    ];

  const handleEditProfileClick = () => {
    setActiveSection('account');
    setTimeout(() => nameInputRef.current?.focus(), 60);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-16 text-left">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
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
                  ? 'bg-ink-black text-white border-ink-black shadow-2xs'
                  : 'bg-white text-ink-700 border-line hover:bg-lime-soft/50'
              )}
            >
              <Icon className={clsx('w-3.5 h-3.5', isActive ? 'text-lime' : 'text-brand-600')} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Two-Column Desktop Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Section Links + Bottom Plain Legal & Destructive Log out */}
        <aside className="hidden lg:flex flex-col justify-between bg-white border border-line rounded-[14px] p-2.5 sticky top-20 space-y-4 shadow-2xs">
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
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-sm font-medium transition-colors cursor-pointer text-left',
                    isActive
                      ? 'bg-ink-black text-white font-semibold shadow-2xs'
                      : 'text-ink-700 hover:bg-lime-soft/50 hover:text-ink-900'
                  )}
                >
                  <Icon
                    className={clsx(
                      'w-4 h-4 shrink-0',
                      isActive ? 'text-lime' : 'text-brand-600'
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
          <Card className="p-5 flex items-center justify-between gap-4 rounded-[14px] border border-border bg-white">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-16 h-16 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-bold text-xl flex items-center justify-center shrink-0">
                {displayInitials}
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[18px] font-bold text-ink-900 leading-snug truncate capitalize">
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
            <Card className="p-5 sm:p-6 space-y-5 rounded-[14px] border border-border bg-white">
              <div className="pb-3 border-b border-border">
                <h3 className="text-base font-bold text-slate-900">
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
                      className="w-full h-11 bg-white border border-border rounded-input px-3.5 text-sm text-ink font-sans focus:outline-none focus:ring-2 focus:ring-brand-600"
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
                      className="w-full h-11 bg-white border border-border rounded-input px-3.5 text-sm text-ink font-sans focus:outline-none focus:ring-2 focus:ring-brand-600"
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
                      className="w-full h-11 bg-white border border-border rounded-input px-3.5 text-sm text-ink font-sans focus:outline-none focus:ring-2 focus:ring-brand-600"
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
                      className="w-full h-11 bg-white border border-border rounded-input px-3.5 text-sm text-ink font-sans focus:outline-none focus:ring-2 focus:ring-brand-600"
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
                        className="w-full h-11 bg-slate-50 border border-border rounded-input pl-3.5 pr-9 text-sm font-medium text-slate-700 font-sans cursor-not-allowed"
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
                        className="w-full h-11 bg-slate-50 border border-border rounded-input pl-3.5 pr-9 text-sm font-medium text-slate-700 font-sans cursor-not-allowed"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-xs text-slate-500">Used to log in</span>
                      {user?.emailVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          <Check className="w-3 h-3" /> Verified
                        </span>
                      )}
                      {user?.hasGoogleLinked && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          Google Linked
                        </span>
                      )}
                    </div>
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
            <div className="space-y-4">
              <GlassCard className="p-6 space-y-5 !bg-ink-black text-white border border-white/10 border-t-2 border-t-lime">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-lime shrink-0" />
                      <Crown className="w-3.5 h-3.5 text-lime" />
                      <span>{planTitle}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white pt-1">
                      {isVerifyingPayment
                        ? 'Verifying Cashfree payment...'
                        : planTier === 'trial'
                          ? trialDaysLeft !== null
                            ? `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} remaining in your free trial`
                            : `${PLAN_PRICING.trialDays}-day free trial active`
                          : 'Active subscription'}
                    </h3>
                    {planLimits && (
                      <p className="text-xs text-white/70">
                        Plan limits: Up to {planLimits.maxProperties ?? (planLimits as any).maxListings ?? 15} properties ·{' '}
                        {planLimits.maxBuyers ?? 10} buyers ·{' '}
                        {planLimits.maxParsePerMonth ?? (planLimits as any).maxParsesMonthly ?? 100} AI parses/month
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSpecialOfferPlanCode('monthly_399');
                        setIsSpecialOfferOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[12px] bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 whitespace-nowrap transition-all cursor-pointer"
                    >
                      <span>{`Monthly · ₹${PLAN_PRICING.monthlyRupees}`}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSpecialOfferPlanCode(planTier === 'pro' ? 'yearly_3999' : 'yearly_trial_3299');
                        setIsSpecialOfferOpen(true);
                      }}
                      className="group btn-shine-sweep-light mobile-shine-primary inline-flex items-center gap-2.5 h-10 pl-4 pr-1.5 rounded-[12px] bg-white hover:bg-lime-soft text-ink-black text-sm font-semibold whitespace-nowrap transition-all cursor-pointer shadow-sm"
                    >
                      <span className="relative z-10">{`Upgrade · ${PLAN_PRICING.formattedAnnualOffer}`}</span>
                      <span className="relative z-10 w-7 h-7 rounded-[8px] bg-lime text-ink-black inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        <ArrowUpRight className="w-4 h-4 stroke-[2.25]" />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Single price line sourced from shared plan config */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                  <span className="text-white/80 font-medium tabular-nums">
                    {PLAN_PRICING.priceLine}
                  </span>
                  <span className="text-xs text-white/70">
                    Cashfree AutoPay &amp; UPI · 7-day refund guarantee
                  </span>
                </div>
              </GlassCard>

              {paymentHistory.length > 0 && (
                <Card className="p-5 rounded-[14px] border border-border bg-white space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    Billing &amp; AutoPay Subscriptions
                  </h4>
                  <div className="divide-y divide-slate-100">
                    {paymentHistory.map((item) => (
                      <div
                        key={item._id}
                        className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">
                            {item.planCode === 'monthly_399'
                              ? 'Monthly Plan'
                              : item.planCode === 'yearly_trial_3299'
                                ? 'Yearly Trial Offer'
                                : 'Yearly Plan'}{' '}
                            · ₹{item.amountINR.toLocaleString('en-IN')}
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            Ref: {item.cashfreeId} · {new Date(item.createdAt).toLocaleDateString('en-IN')}
                            {item.autopayEnabled ? ' · AutoPay Active' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={clsx(
                              'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase',
                              item.status === 'ACTIVE' || item.status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.status === 'CANCELLED' || item.status === 'FAILED'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-700'
                            )}
                          >
                            {item.status}
                          </span>
                          {item.mode === 'autopay' && item.autopayEnabled && item.status === 'ACTIVE' && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              isLoading={isCancellingAutoPay}
                              onClick={() => handleCancelAutoPay(item.cashfreeId)}
                            >
                              Cancel AutoPay
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* SECTION: REGIONAL PREFERENCES */}
          {activeSection === 'regional' && (
            <Card className="p-5 sm:p-6 space-y-5 rounded-[14px] border border-border bg-white">
              <div className="pb-3 border-b border-border">
                <h3 className="text-base font-bold text-slate-900">
                  Regional preferences
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your Indian state / UT to auto-update Broker Tools stamp duty, registry fees, and units.
                </p>
              </div>

              {/* Pan-India Operating State / Union Territory Selector */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="regional-state-select" className="text-xs font-semibold text-slate-700 block">
                    Operating State / Union Territory (All India)
                  </label>
                  <span className="text-[11px] font-semibold text-brand-700 bg-lime-soft px-2.5 py-0.5 rounded-full border border-lime whitespace-nowrap shrink-0">
                    Syncs to Stamp Duty Tool
                  </span>
                </div>
                <CustomSelect
                  id="regional-state-select"
                  title="Operating State / Union Territory"
                  ariaLabel="Operating State / Union Territory (All India)"
                  searchPlaceholder="Search Indian state or UT..."
                  value={defaultState}
                  onChange={(nextState) => {
                    setDefaultState(nextState);
                    const rule = getStateRule(nextState);
                    setMarlaStandard(rule.defaultMarlaToGaj === 25 ? '25' : '30.25');
                  }}
                  options={INDIAN_STATES.map((s) => ({
                    value: s.name,
                    label: `${s.name} — Stamp Duty ${s.stampFemalePct}%–${s.stampMalePct + s.urbanExtraPct}%`,
                    group: s.regionType === 'State' ? 'Indian States (28)' : 'Union Territories (8)',
                    hint: `${s.authorityLabel} · ${s.popularUnitLabel}`,
                  }))}
                  className="h-11 text-sm"
                />

                {/* Live State Fee Summary Box */}
                {(() => {
                  const selectedRule = getStateRule(defaultState);
                  return (
                    <div className="p-3.5 rounded-[12px] bg-lime-soft/60 border border-lime space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-bold text-ink-900">
                          {selectedRule.name} · {selectedRule.authorityLabel}
                        </span>
                        <span className="text-[11px] font-semibold text-brand-700">
                          {selectedRule.popularUnitLabel}
                        </span>
                      </div>
                      <p className="text-ink-700">
                        Male: <strong>{selectedRule.stampMalePct}%</strong> · Female: <strong>{selectedRule.stampFemalePct}%</strong> · Joint: <strong>{selectedRule.stampJointPct}%</strong>
                        {selectedRule.regFeeMode === 'haryana-slab'
                          ? ' · Reg fee slab (max ₹50,000)'
                          : ` · Reg fee ${selectedRule.regFeePct}%${selectedRule.regFeeCap ? ` (cap ₹${selectedRule.regFeeCap.toLocaleString('en-IN')})` : ''}`}
                      </p>
                      <p className="text-[11px] text-ink-500">{selectedRule.note}</p>
                    </div>
                  );
                })()}
              </div>

              {/* Guide & Workspace Language */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700 block">
                  Preferred guide & regional language (5 core Indian languages)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(
                    [
                      { id: 'en', label: 'English', native: 'English' },
                      { id: 'hi', label: 'Hindi', native: 'हिंदी' },
                      { id: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
                      { id: 'ta', label: 'Tamil', native: 'தமிழ்' },
                      { id: 'mr', label: 'Marathi', native: 'मराठी' },
                    ] as const
                  ).map((lang) => {
                    const active = guideLanguage === lang.id;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setGuideLanguage(lang.id)}
                        className={clsx(
                          'px-3 py-2 rounded-[10px] border text-left transition cursor-pointer',
                          active
                            ? 'bg-ink-black text-white border-ink-black'
                            : 'bg-white border-border text-ink-700 hover:bg-slate-50'
                        )}
                      >
                        <span className="text-xs font-bold block">{lang.native}</span>
                        <span className={clsx('text-[10px] block', active ? 'text-lime' : 'text-ink-500')}>
                          {lang.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100">
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
                    {agencyCity.trim() || 'Panipat'}, {defaultState}
                  </span>
                  <button
                    type="button"
                    onClick={handleEditProfileClick}
                    className="text-xs font-semibold text-brand-700 cursor-pointer"
                  >
                    Change city in Account
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
            <Card className="p-5 sm:p-6 space-y-4 rounded-[14px] border border-border bg-white">
              <div className="pb-3 border-b border-border">
                <h3 className="text-base font-bold text-slate-900">
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
            <Card className="p-5 sm:p-6 space-y-4 rounded-[14px] border border-border bg-white">
              <div className="pb-3 border-b border-border">
                <h3 className="text-base font-bold text-slate-900">
                  Help & onboarding
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Walk through core workflows across your broker workspace.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => openVideoGuide(guideLanguage)}
                  className="w-full p-4 rounded-[12px] bg-lime-soft/70 hover:bg-lime-soft border border-lime flex items-center justify-between gap-4 transition group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-[12px] bg-ink-black text-lime flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 text-sm block group-hover:text-brand-700 transition">
                        Video Guide (5 Indian Languages)
                      </span>
                      <span className="text-slate-600 text-xs block truncate">
                        Watch walkthrough in English, हिंदी, ਪੰਜਾਬੀ, தமிழ் & मराठी
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-900 shrink-0" />
                </button>

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
              </div>

              <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-900 block">
                    Official Support & Social Channels
                  </span>
                  <a
                    href={`mailto:${BRAND_CONTACT.email}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{BRAND_CONTACT.email}</span>
                  </a>
                </div>
                <SocialLinks variant="light" showLabels />
              </div>
            </Card>
          )}

          {/* SECTION: PRIVACY & DATA (Two clearly separate actions, NOT one pink mega-card) */}
          {activeSection === 'privacy' && (
            <div className="space-y-4">
              <Card className="p-5 sm:p-6 space-y-3 rounded-[14px] border border-border bg-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">
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

              <Card className="p-5 sm:p-6 space-y-3 rounded-[14px] border border-border bg-white">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
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
            <Card className="p-5 sm:p-6 space-y-4 rounded-[14px] border border-border bg-white">
              <div className="pb-3 border-b border-border">
                <h3 className="text-base font-bold text-slate-900">
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
                href={`mailto:${BRAND_CONTACT.email}?subject=${encodeURIComponent(
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
        planCode={specialOfferPlanCode}
      />
    </div>
  );
};
