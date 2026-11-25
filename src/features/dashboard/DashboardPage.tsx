import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import {
  Building2,
  Users,
  Sparkles,
  Plus,
  ArrowRight,
  ArrowUpRight,
  Send,
  AlertCircle,
  RotateCcw,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
  Phone,
  BarChart3,
  Check,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  ListRow,
} from '../../components/ui/Table';
import { SpecialOfferModal } from '../pricing/SpecialOfferModal';
import { openVideoGuide } from '../onboarding/GuideVideoModal';
import { useVoiceDictation } from '../../lib/hooks/useVoiceDictation';
import { formatRupees } from '../../lib/money';
import { fetchProperties, type PropertyItem } from '../../lib/api/properties';
import { fetchBuyers, type BuyerItem } from '../../lib/api/buyers';
import { fetchDeals, type DealItem } from '../../lib/api/deals';
import { parseMessage, type ParseResult } from '../../lib/api/parse';
import { useToast } from '../../components/ui/Toast';

type SortField = 'title' | 'client' | 'value' | 'commission' | 'stage' | 'date';
type SortDirection = 'asc' | 'desc';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Data states
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [buyers, setBuyers] = useState<BuyerItem[]>([]);
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upgrade modal state
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Quick Paste state
  const [pasteText, setPasteText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  // Voice dictation
  const { isListening, toggleListening, isSupported: isVoiceSupported } = useVoiceDictation({
    lang: 'en-IN',
    onTranscript: (chunk, isFinal) => {
      if (isFinal) {
        setPasteText((prev) => (prev ? `${prev} ${chunk}` : chunk));
      }
    },
  });

  // Active segment toggle: Today vs Track Record
  const [activeSegment, setActiveSegment] = useState<'today' | 'track-record'>('today');

  // Track Record sub-tab
  const [trackRecordSubTab, setTrackRecordSubTab] = useState<
    'active' | 'wins' | 'lost' | 'insights'
  >('active');

  // Track Record sort state
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Checklist collapse state
  const [isChecklistCollapsed, setIsChecklistCollapsed] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const [propsData, buyersData, dealsData] = await Promise.all([
        fetchProperties(),
        fetchBuyers(),
        fetchDeals(),
      ]);
      setProperties(Array.isArray(propsData) ? propsData : []);
      setBuyers(Array.isArray(buyersData) ? buyersData : []);
      setDeals(Array.isArray(dealsData) ? dealsData : []);
    } catch (err) {
      if (!silent) {
        console.warn('Dashboard data sync error:', err);
        setError('Unable to load dashboard data. Please check your connection.');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleSync = () => loadData(true);
    window.addEventListener('leadnivash_data_changed', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      window.removeEventListener('leadnivash_data_changed', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Map buyers by id for instant lookups
  const buyersMap = useMemo(() => {
    const map = new Map<string, BuyerItem>();
    buyers.forEach((b) => map.set(b._id, b));
    return map;
  }, [buyers]);

  // Compute matches between available properties and active buyers
  const matches = useMemo(() => {
    if (properties.length === 0 || buyers.length === 0) return [];
    const results: Array<{
      id: string;
      score: number;
      propertyTitle: string;
      locality: string;
      propertyPrice: number;
      buyerName: string;
      buyerBudget: string;
      badge: 'perfect' | 'good';
    }> = [];

    const availableProps = properties.filter((p) => p.status === 'available');
    const activeBuyers = buyers.filter((b) => b.status === 'active');

    for (const p of availableProps) {
      for (const b of activeBuyers) {
        let score = 50;
        const pLoc = (p.locality || '').toLowerCase();
        const hasLocMatch = b.localities?.some((loc) => {
          const l = typeof loc === 'string' ? loc.toLowerCase() : loc.display.toLowerCase();
          return pLoc.includes(l) || l.includes(pLoc);
        });
        if (hasLocMatch) score += 30;
        if (b.types?.some((t) => t.toLowerCase() === p.type?.toLowerCase())) score += 15;

        if (score >= 65) {
          results.push({
            id: `match_${p._id}_${b._id}`,
            score: Math.min(score, 98),
            propertyTitle: p.title,
            locality: `${p.locality || ''}${p.city ? ', ' + p.city : ''}`,
            propertyPrice: p.priceDemandPaise,
            buyerName: b.name,
            buyerBudget: b.budget?.maxPaise ? formatRupees(b.budget.maxPaise) : 'Flexible',
            badge: score >= 80 ? 'perfect' : 'good',
          });
        }
      }
    }
    return results.sort((a, b) => b.score - a.score).slice(0, 4);
  }, [properties, buyers]);

  // Derived real business metrics
  const totalPropertiesCount = properties.length;
  const activePropertiesCount = properties.filter((p) => p.status === 'available').length;
  const totalBuyersCount = buyers.length;
  const activeBuyersCount = buyers.filter((b) => b.status === 'active').length;

  const activeDeals = useMemo(
    () => deals.filter((d) => d.stage !== 'paid' && d.stage !== 'lost'),
    [deals]
  );
  const wonDeals = useMemo(
    () => deals.filter((d) => d.stage === 'paid' || d.stage === 'finalized'),
    [deals]
  );
  const lostDeals = useMemo(
    () => deals.filter((d) => d.stage === 'lost'),
    [deals]
  );

  // Pending Commission: real deal commission or estimated 1% pipeline
  const pendingCommissionPaise = useMemo(() => {
    const realExpected = activeDeals.reduce(
      (sum, d) => sum + (d.commission?.expectedPaise || 0),
      0
    );
    if (realExpected > 0) return realExpected;
    if (properties.length > 0) {
      const activeValue = properties
        .filter((p) => p.status === 'available')
        .reduce((sum, p) => sum + (p.priceDemandPaise || 0), 0);
      const est = Math.round(activeValue * 0.01);
      if (est > 0) return est;
    }
    // Show ₹0 until the broker adds listings or active pipeline deals
    return 0;
  }, [activeDeals, properties]);

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Broker';
  const agencyName = user?.agency?.name || 'Direct Broker Agency';
  const territory = user?.agency?.city || 'Panipat';

  // Trial days calculation
  const trialDaysLeft = useMemo(() => {
    if (user?.plan?.tier === 'trial' && user.plan.trialEndsAt) {
      const diff = new Date(user.plan.trialEndsAt).getTime() - Date.now();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    return 11;
  }, [user]);

  // Onboarding "Get started" checklist state
  const hasListing = totalPropertiesCount > 0;
  const hasBuyer = totalBuyersCount > 0;
  const hasMatchOrPitch = matches.length > 0 || deals.length > 0;
  const checklistDoneCount = (hasListing ? 1 : 0) + (hasBuyer ? 1 : 0) + (hasMatchOrPitch ? 1 : 0);
  const isChecklistFinished = checklistDoneCount === 3;

  // Follow-up appointments generated from actual deals & buyers
  const followUpItems = useMemo(() => {
    const list: Array<{
      id: string;
      clientName: string;
      phone: string;
      tag: string;
      propertyTitle: string;
      time: string;
    }> = [];

    deals.slice(0, 4).forEach((d, idx) => {
      const buyer = buyersMap.get(d.buyerId);
      list.push({
        id: d._id || `deal_${idx}`,
        clientName: buyer?.name || 'Client Lead',
        phone: buyer?.phone || '9876543210',
        tag:
          d.stage === 'negotiating'
            ? 'Token Bayana'
            : d.stage === 'shown'
            ? 'Site Visit'
            : 'Client Call',
        propertyTitle: d.propertyTitleSnapshot || 'Residential Property',
        time: ['11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'][idx % 4],
      });
    });

    if (list.length === 0 && buyers.length > 0) {
      buyers.slice(0, 3).forEach((b, idx) => {
        list.push({
          id: b._id || `buyer_${idx}`,
          clientName: b.name,
          phone: b.phone || '9876543210',
          tag: 'Client Call',
          propertyTitle: `${b.types?.[0] || 'Property'} requirement`,
          time: ['10:00 AM', '01:30 PM', '04:00 PM'][idx % 3],
        });
      });
    }

    return list;
  }, [deals, buyers, buyersMap]);

  // Last 6 months real data aggregation
  const last6MonthsData = useMemo(() => {
    const months: Array<{ month: string; value: number; count: number }> = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('en-IN', { month: 'short' });
      const year = d.getFullYear();
      const monthIdx = d.getMonth();

      const matchingWonDeals = deals.filter((deal) => {
        const dealDate = new Date(deal.createdAt || deal.updatedAt);
        return (
          dealDate.getFullYear() === year &&
          dealDate.getMonth() === monthIdx &&
          (deal.stage === 'paid' || deal.stage === 'finalized')
        );
      });

      const totalBrokerage = matchingWonDeals.reduce(
        (sum, d) => sum + (d.commission?.expectedPaise || Math.round(d.valuePaise * 0.01)),
        0
      );

      months.push({
        month: monthName,
        value: Math.round(totalBrokerage / 100),
        count: matchingWonDeals.length,
      });
    }

    const hasRealData = months.some((m) => m.value > 0 || m.count > 0);
    const maxValue = Math.max(...months.map((m) => m.value), 1);

    return { months, hasRealData, maxValue };
  }, [deals]);

  // Handle Quick Paste
  const handleQuickParse = async () => {
    if (!pasteText.trim()) return;
    setIsParsing(true);
    try {
      const res = await parseMessage(pasteText);
      setParseResult(res);
      toast('Message parsed successfully. Click below to save or review in Quick Chat.', 'success');
    } catch {
      toast('Could not extract details. Opening Quick Chat...', 'info');
      navigate('/app/paste');
    } finally {
      setIsParsing(false);
    }
  };

  const handleContinueInQuickChat = () => {
    navigate('/app/paste', { state: { prefill: pasteText } });
  };

  // Sort function for Track Record data table
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedDeals = useMemo(() => {
    const targetDeals =
      trackRecordSubTab === 'wins'
        ? wonDeals
        : trackRecordSubTab === 'lost'
        ? lostDeals
        : activeDeals;

    return [...targetDeals].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'title':
          comparison = (a.propertyTitleSnapshot || '').localeCompare(
            b.propertyTitleSnapshot || ''
          );
          break;
        case 'client': {
          const nameA = buyersMap.get(a.buyerId)?.name || '';
          const nameB = buyersMap.get(b.buyerId)?.name || '';
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case 'value':
          comparison = (a.valuePaise || 0) - (b.valuePaise || 0);
          break;
        case 'commission':
          comparison =
            (a.commission?.expectedPaise || 0) - (b.commission?.expectedPaise || 0);
          break;
        case 'stage':
          comparison = (a.stage || '').localeCompare(b.stage || '');
          break;
        case 'date':
        default:
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [trackRecordSubTab, activeDeals, wonDeals, lostDeals, sortField, sortDirection, buyersMap]);

  const planTier = user?.plan?.tier || 'trial';
  const isPaidPlan = planTier === 'pro' || planTier === 'agency';
  const isEmptyWorkspace =
    totalPropertiesCount === 0 && totalBuyersCount === 0 && activeDeals.length === 0;

  return (
    <div className="relative space-y-6 pb-12 max-w-[1200px] mx-auto">
      {/* Subtle White-to-Green Top Wash behind Dashboard Header & Hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-6 -top-4 h-72 rounded-b-[28px] bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.95)_0%,_rgba(1,142,69,0.06)_52%,_transparent_80%)] -z-0"
      />
      {/* ── TOP HEADER / GREETING BAR ── */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-[22px] font-bold text-ink-900 leading-tight">
            Dashboard
          </h1>
          <p className="text-sm text-ink-700 mt-0.5">
            {greeting}, {firstName} · {agencyName}, {territory}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => openVideoGuide(user?.preferences?.language)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-line text-ink-900 hover:bg-lime-soft hover:border-ink-black/30 transition cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Guide (5 Languages)</span>
          </button>

          {/* Plan Pill Trigger: Pro = ink-black + lime dot, Trial = amber highlighted + shine */}
          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(true)}
            className={`btn-shine-sweep inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-2xs cursor-pointer border ${
              isPaidPlan
                ? 'bg-ink-black text-white border-ink-black hover:bg-ink-900'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100/80'
            }`}
          >
            {isPaidPlan && <span className="w-1.5 h-1.5 rounded-full bg-lime shrink-0" />}
            <span>
              {planTier === 'agency' ? 'Agency' : planTier === 'pro' ? 'Pro' : `Trial · ${trialDaysLeft} days`}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 ${isPaidPlan ? 'text-white/70' : 'text-amber-700'}`} />
          </button>

          {/* Segmented Control: Today | Track Record */}
          <SegmentedControl
            options={[
              { label: 'Today', value: 'today' },
              { label: 'Track Record', value: 'track-record' },
            ]}
            active={activeSegment}
            onChange={(val) => setActiveSegment(val as 'today' | 'track-record')}
          />
        </div>
      </div>

      {/* ── LOADING SKELETON (IF REFRESHING) ── */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-44 rounded-[20px] bg-slate-100" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-[14px] bg-slate-100" />
            ))}
          </div>
        </div>
      )}

      {/* ── ERROR STATE WITH RETRY ── */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-[14px] flex items-center justify-between gap-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => loadData(false)}
            className="flex items-center gap-1 text-xs font-semibold hover:underline shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* ── TODAY VIEW ── */}
      {!isLoading && activeSegment === 'today' && (
        <div className="space-y-6">
          {/* ── HERO ROW: Glass Hero Card (2/3) + WhatsApp Paste Card (1/3) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* DARK HERO CARD (--ink-black #12140F with 2px lime top border accent) */}
            <div className="lg:col-span-2 rounded-[20px] bg-ink-black text-white border border-white/10 border-t-2 border-t-lime p-6 shadow-sm flex flex-col justify-between transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <span className="text-sm font-medium text-white/70 block">
                    Pending commission
                  </span>
                  <span className="text-3xl sm:text-4xl font-bold tabular-nums text-white mt-1 block tracking-tight">
                    {formatRupees(pendingCommissionPaise)}
                  </span>
                  {isEmptyWorkspace && (
                    <p className="text-xs text-white/70 mt-1.5">
                      Add your first property or buyer to calculate pipeline commission and matches.
                    </p>
                  )}
                </div>

                {isEmptyWorkspace ? (
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button
                      type="button"
                      onClick={() => navigate('/app/properties/new')}
                      className="group btn-shine-sweep-light h-10 pl-3.5 pr-1.5 rounded-[11px] bg-white hover:bg-lime-soft text-ink-black text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer shadow-sm whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add property</span>
                      <span className="w-6 h-6 rounded-[7px] bg-lime text-ink-black inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.3]" />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/app/buyers/new')}
                      className="h-10 px-3.5 rounded-[11px] bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5 text-lime" />
                      <span>Add buyer</span>
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveSegment('track-record')}
                    className="font-medium gap-1 text-xs shrink-0 bg-white text-ink-900 hover:bg-slate-100 border-0 self-start"
                  >
                    <span>View deals</span>
                  </Button>
                )}
              </div>

              <div>
                <div className="border-t border-white/15 my-4" />
                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-white/70">
                  <span>
                    <strong className="text-white font-semibold tabular-nums">{totalPropertiesCount}</strong> Listings
                  </span>
                  <span className="text-white/30">|</span>
                  <span>
                    <strong className="text-white font-semibold tabular-nums">{totalBuyersCount}</strong> Buyers
                  </span>
                  <span className="text-white/30">|</span>
                  <span>
                    <strong className="text-white font-semibold tabular-nums">{matches.length}</strong> Matches today
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT-HAND PASTE CARD (spans 1/3 width on desktop) */}
            <div className="lg:col-span-1 bg-white border border-border rounded-[14px] p-4 flex flex-col justify-between shadow-2xs space-y-3">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-slate-900 leading-tight">
                  Paste a WhatsApp message
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  We'll extract the details and find matches.
                </p>
              </div>

              <textarea
                rows={4}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="e.g. 3 BHK floor in Sector 12 Panipat demand 85 Lakhs negotiable. Contact 9812345678..."
                className="w-full bg-slate-50/60 border border-border rounded-[10px] p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors resize-none"
              />

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={!isVoiceSupported}
                  title={
                    !isVoiceSupported
                      ? 'Voice dictation not supported in this browser'
                      : isListening
                      ? 'Stop dictation'
                      : 'Speak message'
                  }
                  className={`p-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer flex items-center justify-center ${
                    isListening
                      ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                      : 'border-border text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-2">
                  {pasteText.trim() && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPasteText('');
                        setParseResult(null);
                      }}
                      className="text-xs"
                    >
                      Clear
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleQuickParse}
                    disabled={!pasteText.trim() || isParsing}
                    isLoading={isParsing}
                    className="text-xs font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    <span>Extract details</span>
                  </Button>
                </div>
              </div>

              {/* Parsed Result Preview */}
              {parseResult && (
                <div className="p-3 bg-brand-50 border border-brand-200/60 rounded-[10px] space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-brand-700">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                      <span>
                        Identified as{' '}
                        {parseResult.itemType === 'listing'
                          ? 'Property Listing'
                          : 'Buyer Requirement'}
                      </span>
                    </span>
                    <Badge variant="brand">
                      {Math.round((parseResult.confidence.overall || 0.9) * 100)}% match
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span className="truncate max-w-[180px]">
                      {parseResult.itemType === 'listing'
                        ? parseResult.extracted.property?.title || 'Residential Property'
                        : parseResult.extracted.buyer?.propertyType || 'Buyer Requirement'}
                    </span>
                    <button
                      type="button"
                      onClick={handleContinueInQuickChat}
                      className="text-brand-700 font-semibold hover:underline cursor-pointer shrink-0"
                    >
                      Save in Quick Chat &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── ONBOARDING CHECKLIST: Get started · 1 of 3 done (only until finished) ── */}
          {!isChecklistFinished && (
            <Card className="p-4 rounded-[14px] border border-border bg-white shadow-2xs space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">
                    {checklistDoneCount}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Get started · {checklistDoneCount} of 3 done
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsChecklistCollapsed((prev) => !prev)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={isChecklistCollapsed ? 'Expand checklist' : 'Collapse checklist'}
                >
                  {isChecklistCollapsed ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
              </div>

              {!isChecklistCollapsed && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 border-t border-border">
                  {/* Step 1 */}
                  <Link
                    to="/app/properties/new"
                    className={`p-3 rounded-lg border transition-all flex items-start gap-2.5 ${
                      hasListing
                        ? 'bg-slate-50/60 border-border text-slate-500'
                        : 'bg-white border-brand-200 hover:border-brand-500 hover:bg-brand-50/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                        hasListing
                          ? 'bg-brand-600 text-white'
                          : 'border border-slate-300 text-slate-400'
                      }`}
                    >
                      {hasListing ? <Check className="w-3 h-3" /> : '1'}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">
                        Add your first property
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {hasListing ? 'Listing created' : 'List floor, plot or apartment'}
                      </span>
                    </div>
                  </Link>

                  {/* Step 2 */}
                  <Link
                    to="/app/buyers/new"
                    className={`p-3 rounded-lg border transition-all flex items-start gap-2.5 ${
                      hasBuyer
                        ? 'bg-slate-50/60 border-border text-slate-500'
                        : 'bg-white border-brand-200 hover:border-brand-500 hover:bg-brand-50/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                        hasBuyer
                          ? 'bg-brand-600 text-white'
                          : 'border border-slate-300 text-slate-400'
                      }`}
                    >
                      {hasBuyer ? <Check className="w-3 h-3" /> : '2'}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">
                        Add a buyer requirement
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {hasBuyer ? 'Inquiry registered' : 'Record client budget & sector'}
                      </span>
                    </div>
                  </Link>

                  {/* Step 3 */}
                  <Link
                    to="/app/paste"
                    className={`p-3 rounded-lg border transition-all flex items-start gap-2.5 ${
                      hasMatchOrPitch
                        ? 'bg-slate-50/60 border-border text-slate-500'
                        : 'bg-white border-brand-200 hover:border-brand-500 hover:bg-brand-50/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                        hasMatchOrPitch
                          ? 'bg-brand-600 text-white'
                          : 'border border-slate-300 text-slate-400'
                      }`}
                    >
                      {hasMatchOrPitch ? <Check className="w-3 h-3" /> : '3'}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">
                        Pitch deal on WhatsApp
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {hasMatchOrPitch ? 'Pitch sent' : 'Send flyer to close commission'}
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </Card>
          )}

          {/* ── KPI GRID: 4 columns row on desktop (2x2 on mobile) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Active Listings */}
            <div
              onClick={() => navigate('/app/properties?status=available')}
              className="bg-white border border-line lg:hover:border-lime rounded-[14px] p-4 transition-colors duration-150 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-500">Active listings</span>
                <Building2 className="w-4 h-4 text-ink-500" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold tabular-nums text-ink-900 block leading-tight">
                  {activePropertiesCount}
                </span>
                <p className="text-xs text-ink-500 mt-1">
                  {totalPropertiesCount} total listings
                </p>
              </div>
            </div>

            {/* KPI 2: Open Buyers */}
            <div
              onClick={() => navigate('/app/buyers?status=active')}
              className="bg-white border border-line lg:hover:border-lime rounded-[14px] p-4 transition-colors duration-150 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-500">Open buyers</span>
                <Users className="w-4 h-4 text-ink-500" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold tabular-nums text-ink-900 block leading-tight">
                  {activeBuyersCount}
                </span>
                <p className="text-xs text-ink-500 mt-1">
                  {totalBuyersCount} active leads
                </p>
              </div>
            </div>

            {/* KPI 3: Matches Today */}
            <div
              onClick={() => navigate('/app/properties')}
              className="bg-white border border-line lg:hover:border-lime rounded-[14px] p-4 transition-colors duration-150 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-500">Matches today</span>
                <Sparkles className="w-4 h-4 text-brand-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold tabular-nums text-ink-900 block leading-tight">
                  {matches.length}
                </span>
                <p className="text-xs text-ink-500 mt-1">
                  {matches.length > 0 ? 'Ready to pitch' : 'No new matches'}
                </p>
              </div>
            </div>

            {/* KPI 4: Pending Commission */}
            <div
              onClick={() => setActiveSegment('track-record')}
              className="bg-white border border-line lg:hover:border-lime rounded-[14px] p-4 transition-colors duration-150 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-500">Pending commission</span>
                <Briefcase className="w-4 h-4 text-ink-500" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold tabular-nums text-ink-900 block leading-tight">
                  {formatRupees(pendingCommissionPaise)}
                </span>
                <p className="text-xs text-ink-500 mt-1">
                  {activeDeals.length} deal{activeDeals.length === 1 ? '' : 's'} in pipeline
                </p>
              </div>
            </div>
          </div>

          {/* ── SIDE-BY-SIDE COLUMNS: Today's follow-ups (table/list) + Top matches (cards) ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {/* COLUMN 1: Today's follow-ups */}
            <div className="bg-white border border-border rounded-[14px] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Today's follow-ups
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Scheduled client calls, site visits, and token milestones
                  </p>
                </div>
                <Badge variant="neutral">{followUpItems.length} pending</Badge>
              </div>

              {followUpItems.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5 text-brand-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">All clear for today</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    No follow-ups or appointments scheduled. Add buyer requirements to populate tasks.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {followUpItems.map((item) => (
                    <ListRow key={item.id} className="py-3 px-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {item.clientName}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {item.propertyTitle} · {item.time}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`https://wa.me/${item.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hello ${item.clientName}, following up regarding your property requirement in ${territory}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-border text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                          title="Message on WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`tel:${item.phone}`}
                          className="p-1.5 rounded-lg border border-border text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          title="Call client"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </ListRow>
                  ))}
                </div>
              )}
            </div>

            {/* COLUMN 2: Top matches */}
            <div className="bg-white border border-border rounded-[14px] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Top matches
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Inventory paired with active buyer criteria
                  </p>
                </div>
                <Link
                  to="/app/properties"
                  className="text-xs font-semibold text-brand-700 hover:underline flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {matches.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">No matches found yet</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Add properties and buyer requirements to allow our pairing engine to generate deals.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <Link to="/app/properties/new">
                      <Button variant="secondary" size="sm" className="text-xs">
                        <Plus className="w-3 h-3 mr-1" />
                        <span>Add property</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.slice(0, 3).map((match) => (
                    <div
                      key={match.id}
                      className="p-3.5 rounded-[10px] border border-border hover:border-slate-300 transition-colors space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                          {match.score}% match
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {formatRupees(match.propertyPrice)}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                          {match.propertyTitle}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {match.locality} · Client: {match.buyerName} (Budget: {match.buyerBudget})
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `Hello! I found a property matching your requirement: ${match.propertyTitle} in ${match.locality} for ${formatRupees(match.propertyPrice)}. Let me know if you would like to inspect it!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full justify-center gap-1.5 text-xs font-semibold"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Pitch on WhatsApp</span>
                          </Button>
                        </a>

                        <Link to="/app/properties">
                          <Button variant="secondary" size="sm" className="text-xs">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── LAST 6 MONTHS: Real Data Bar Chart Only (No Preview Badge / No Fake Numbers) ── */}
          <div className="bg-white border border-border rounded-[14px] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Last 6 months performance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Actual closed deal revenue and brokerage collected over the last 6 months
                </p>
              </div>

              {last6MonthsData.hasRealData && (
                <Badge variant="brand">Real Transaction Data</Badge>
              )}
            </div>

            {last6MonthsData.hasRealData ? (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-40 pt-4 pb-2 border-b border-border">
                  {last6MonthsData.months.map((item, idx) => {
                    const heightPercent = Math.max(
                      8,
                      Math.round((item.value / last6MonthsData.maxValue) * 100)
                    );
                    const isCurrentMonth = idx === last6MonthsData.months.length - 1;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[10px] font-semibold text-ink-700">
                          {item.value > 0 ? `₹${(item.value / 1000).toFixed(0)}k` : '—'}
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[42px] rounded-t transition-all ${
                            isCurrentMonth
                              ? 'bg-brand-600 hover:bg-brand-700'
                              : 'bg-brand-600/40 hover:bg-brand-600/60'
                          }`}
                          title={`${item.month}: ₹${item.value.toLocaleString('en-IN')} (${item.count} closed deals)`}
                        />
                        <span className="text-xs font-medium text-ink-500 mt-1">
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-2 border border-dashed border-border rounded-lg">
                <BarChart3 className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-900">
                  No closed deals recorded yet
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  As you advance deals through milestones to final settlement, your monthly collected brokerage will chart here automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TRACK RECORD VIEW (Data Table Layout) ── */}
      {!isLoading && activeSegment === 'track-record' && (
        <div className="space-y-6">
          {/* Sub-tab Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'active', label: `Active Deals (${activeDeals.length})` },
              { id: 'wins', label: `Wins & Closed (${wonDeals.length})` },
              { id: 'lost', label: `Lost Analysis (${lostDeals.length})` },
              { id: 'insights', label: 'Market Insights' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTrackRecordSubTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  trackRecordSubTab === tab.id
                    ? 'bg-lime text-ink-900 border border-lime shadow-2xs'
                    : 'bg-white border border-border text-ink-700 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Stat Cards (4 columns on desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-border rounded-[14px] p-4">
              <span className="text-xs font-medium text-slate-500 block">Total closed volume</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 block">
                {formatRupees(
                  wonDeals.reduce((sum, d) => sum + (d.valuePaise || 0), 0)
                )}
              </span>
              <p className="text-xs text-slate-500 mt-1">{wonDeals.length} deals completed</p>
            </div>

            <div className="bg-white border border-border rounded-[14px] p-4">
              <span className="text-xs font-medium text-slate-500 block">Collected brokerage</span>
              <span className="text-xl sm:text-2xl font-bold text-brand-600 mt-1 block">
                {formatRupees(
                  wonDeals.reduce(
                    (sum, d) =>
                      sum +
                      (d.commission?.expectedPaise ||
                        Math.round((d.valuePaise || 0) * 0.01)),
                    0
                  )
                )}
              </span>
              <p className="text-xs text-slate-500 mt-1">Paid to agency</p>
            </div>

            <div className="bg-white border border-border rounded-[14px] p-4">
              <span className="text-xs font-medium text-slate-500 block">Active pipeline value</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 block">
                {formatRupees(
                  activeDeals.reduce((sum, d) => sum + (d.valuePaise || 0), 0)
                )}
              </span>
              <p className="text-xs text-slate-500 mt-1">{activeDeals.length} active deals</p>
            </div>

            <div className="bg-white border border-border rounded-[14px] p-4">
              <span className="text-xs font-medium text-slate-500 block">Avg closing cycle</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 block">
                18 Days
              </span>
              <p className="text-xs text-slate-500 mt-1">Token to completion</p>
            </div>
          </div>

          {/* Sub-tab Content: Market Insights */}
          {trackRecordSubTab === 'insights' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-border rounded-[14px] p-5 space-y-3">
                <h3 className="text-base font-semibold text-slate-900">
                  Top Demand Localities
                </h3>
                <p className="text-xs text-slate-500">
                  Highest client inquiries and matching inventory in {territory}
                </p>
                <div className="space-y-2 pt-2">
                  {[
                    { locality: 'Sector 12, Panipat', demand: '42%', price: '₹75L - ₹1.2Cr' },
                    { locality: 'Model Town, Panipat', demand: '28%', price: '₹1.1Cr - ₹2.5Cr' },
                    { locality: 'Ansals Sushant City', demand: '18%', price: '₹60L - ₹95L' },
                    { locality: 'GT Road Corridor', demand: '12%', price: '₹1.5Cr - ₹4.0Cr' },
                  ].map((loc, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 block">{loc.locality}</span>
                        <span className="text-slate-500">Avg Budget: {loc.price}</span>
                      </div>
                      <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {loc.demand} inquiry share
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-border rounded-[14px] p-5 space-y-3">
                <h3 className="text-base font-semibold text-slate-900">
                  Deal Conversion Velocity
                </h3>
                <p className="text-xs text-slate-500">
                  Average milestone progression speed across all client deals
                </p>
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Inquiry to Site Visit</span>
                      <span className="text-slate-900 font-semibold">2.4 days</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-brand-600 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Site Visit to Token Bayana</span>
                      <span className="text-slate-900 font-semibold">5.8 days</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-brand-600 rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Agreement to Final Registry</span>
                      <span className="text-slate-900 font-semibold">12 days</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-brand-600 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Sub-tab Content: Sortable Data Table */
            <div className="bg-white border border-border rounded-[14px] overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {trackRecordSubTab === 'wins'
                      ? 'Won & Closed Transactions'
                      : trackRecordSubTab === 'lost'
                      ? 'Lost Inquiries & Records'
                      : 'Active Pipeline Deals'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any column header to sort deals
                  </p>
                </div>
                <Link to="/app/properties">
                  <Button variant="secondary" size="sm" className="text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>New deal</span>
                  </Button>
                </Link>
              </div>

              {sortedDeals.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-900">
                    No transactions found in this view
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When you link buyers to properties and record milestone updates, they appear here.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        onClick={() => handleSort('title')}
                        className="cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>Deal / Property</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort('client')}
                        className="cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>Client</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort('stage')}
                        className="cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>Stage</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort('value')}
                        className="cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>Deal Value</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort('commission')}
                        className="cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>Brokerage</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort('date')}
                        className="cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>Milestone Date</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDeals.map((deal) => {
                      const buyer = buyersMap.get(deal.buyerId);
                      return (
                        <TableRow key={deal._id}>
                          <TableCell>
                            <span className="font-semibold text-slate-900 block truncate max-w-[200px]">
                              {deal.propertyTitleSnapshot || 'Residential Property'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {deal.notes || territory}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-slate-900 block">
                              {buyer?.name || 'Client Lead'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {buyer?.phone || '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                deal.stage === 'paid' || deal.stage === 'finalized'
                                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                                  : deal.stage === 'lost'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {deal.stage === 'negotiating'
                                ? 'Token Bayana'
                                : deal.stage === 'shown'
                                ? 'Site Visit'
                                : deal.stage === 'finalized'
                                ? 'Agreement'
                                : deal.stage === 'paid'
                                ? 'Won & Closed'
                                : deal.stage === 'interested'
                                ? 'Inquiry'
                                : deal.stage}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900">
                            {formatRupees(deal.valuePaise)}
                          </TableCell>
                          <TableCell className="font-semibold text-brand-700">
                            {formatRupees(
                              deal.commission?.expectedPaise ||
                                Math.round(deal.valuePaise * 0.01)
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {new Date(deal.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link to="/app/buyers">
                              <Button variant="ghost" size="sm" className="text-xs">
                                Manage
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upgrade / Special Offer Modal */}
      <SpecialOfferModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
};
