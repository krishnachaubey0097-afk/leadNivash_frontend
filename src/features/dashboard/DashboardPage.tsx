import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import {
  Building2,
  Users,
  Sparkles,
  Plus,
  Search,
  ArrowRight,
  Send,
  MessageSquare,
  AlertCircle,
  RotateCcw,
  Clock,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatRupees } from '../../lib/money';
import { fetchProperties, type PropertyItem } from '../../lib/api/properties';
import { fetchBuyers, type BuyerItem } from '../../lib/api/buyers';
import { fetchDeals, type DealItem } from '../../lib/api/deals';
import { parseMessage, type ParseResult } from '../../lib/api/parse';
import { useToast } from '../../components/ui/Toast';

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

  // Quick Paste state
  const [pasteText, setPasteText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  // Active segment toggle
  const [activeSegment, setActiveSegment] = useState<'today' | 'pipeline'>('today');

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
  const matchesWaitingCount = matches.length;
  const activeDeals = deals.filter((d) => d.stage !== 'paid' && d.stage !== 'lost');
  const pendingActionsCount = activeDeals.length + matchesWaitingCount;

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

  // Welcome broker display info
  const firstName = user?.name ? user.name.split(' ')[0] : 'Broker';
  const agencyName = user?.agency?.name;
  const territory = user?.agency?.city || 'Haryana';
  const planTier = user?.plan?.tier || 'Trial';

  return (
    <div className="space-y-4 pb-12 max-w-5xl mx-auto">
      {/* ── 1. WELCOME SECTION ── */}
      <div className="bg-white border border-border rounded-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-page-title font-semibold text-ink leading-tight">
              Welcome back, {firstName}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-meta font-medium text-brand-700 bg-brand-50 border border-brand-200/50">
              {planTier.toUpperCase()}
            </span>
          </div>
          <p className="text-secondary text-muted mt-0.5 truncate">
            {agencyName ? `${agencyName} · ` : ''}{territory}
          </p>
        </div>

        {/* View toggle for Today vs Pipeline */}
        <div className="flex items-center self-start sm:self-auto bg-surface-hover p-0.5 rounded-input border border-border shrink-0">
          <button
            type="button"
            onClick={() => setActiveSegment('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-colors cursor-pointer ${
              activeSegment === 'today'
                ? 'bg-white text-ink shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment('pipeline')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-colors cursor-pointer ${
              activeSegment === 'pipeline'
                ? 'bg-white text-ink shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            Pipeline {activeDeals.length > 0 && `(${activeDeals.length})`}
          </button>
        </div>
      </div>

      {/* ── 2. MAIN ACTION AREA ── */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Link to="/app/properties/new" className="block">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center gap-2 shadow-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </Button>
          </Link>
          <Link to="/app/buyers/new" className="block">
            <Button
              variant="secondary"
              size="md"
              className="w-full justify-center gap-2 font-semibold"
            >
              <Search className="w-4 h-4 text-brand-600" />
              <span>Find a Buyer Match</span>
            </Button>
          </Link>
        </div>

        {/* Quick Chat Entry Point */}
        <Link
          to="/app/paste"
          className="flex items-center justify-between p-3 bg-brand-50 border border-brand-200/60 rounded-card text-brand-700 hover:bg-brand-100 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
            <span className="text-sm font-semibold truncate">
              Open Quick Chat
            </span>
          </div>
          <span className="text-secondary text-brand-700 font-medium shrink-0 flex items-center gap-1">
            <span>Voice & WhatsApp match</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* ── ERROR STATE WITH RETRY ── */}
      {error && (
        <div className="p-3.5 bg-danger-bg border border-danger/20 rounded-card flex items-center justify-between gap-3 text-secondary text-danger">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => loadData(false)}
            className="flex items-center gap-1 text-xs font-semibold hover:underline shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* ── TODAY VIEW ── */}
      {activeSegment === 'today' && (
        <div className="space-y-4">
          {/* ── 3. DASHBOARD DATA SUMMARY CARDS ── */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-card bg-white border border-border shadow-card space-y-3">
                  <div className="h-3 w-20 bg-border rounded animate-pulse" />
                  <div className="h-7 w-12 bg-border rounded animate-pulse" />
                  <div className="h-3 w-16 bg-border rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : totalPropertiesCount > 0 || totalBuyersCount > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Active Properties */}
              <Link to="/app/properties" className="block">
                <Card className="p-4 hover:border-brand-600/30 transition-colors" interactive>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary font-medium text-muted">Active Properties</span>
                    <Building2 className="w-4 h-4 text-muted" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-ink leading-none">
                      {activePropertiesCount}
                    </span>
                    <span className="text-meta text-muted">available</span>
                  </div>
                  <p className="text-meta text-muted mt-2 pt-2 border-t border-border truncate">
                    {totalPropertiesCount} total listing{totalPropertiesCount === 1 ? '' : 's'}
                  </p>
                </Card>
              </Link>

              {/* Card 2: Active Buyer Inquiries */}
              <Link to="/app/buyers" className="block">
                <Card className="p-4 hover:border-brand-600/30 transition-colors" interactive>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary font-medium text-muted">Buyer Inquiries</span>
                    <Users className="w-4 h-4 text-muted" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-ink leading-none">
                      {activeBuyersCount}
                    </span>
                    <span className="text-meta text-muted">active</span>
                  </div>
                  <p className="text-meta text-muted mt-2 pt-2 border-t border-border truncate">
                    {totalBuyersCount} total lead{totalBuyersCount === 1 ? '' : 's'}
                  </p>
                </Card>
              </Link>

              {/* Card 3: New Matches */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-secondary font-medium text-muted">New Matches</span>
                  <Sparkles className="w-4 h-4 text-brand-600" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-brand-600 leading-none">
                    {matchesWaitingCount}
                  </span>
                  <span className="text-meta text-muted">ready</span>
                </div>
                <p className="text-meta text-muted mt-2 pt-2 border-t border-border truncate">
                  {matchesWaitingCount > 0 ? 'Ready to pitch' : 'No pending matches'}
                </p>
              </Card>

              {/* Card 4: Pending Follow-ups */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-secondary font-medium text-muted">Pending Actions</span>
                  <Clock className="w-4 h-4 text-warn" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-ink leading-none">
                    {pendingActionsCount}
                  </span>
                  <span className="text-meta text-muted">items</span>
                </div>
                <p className="text-meta text-muted mt-2 pt-2 border-t border-border truncate">
                  {activeDeals.length} deal{activeDeals.length === 1 ? '' : 's'} in pipeline
                </p>
              </Card>
            </div>
          ) : null}

          {/* ── 4. CONTEXT-SPECIFIC EMPTY STATES ── */}
          {!isLoading && totalPropertiesCount === 0 && totalBuyersCount === 0 && (
            <Card className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-card bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-card-title font-semibold text-ink">
                  Let's get your first deal started
                </h3>
                <p className="text-secondary text-muted leading-relaxed">
                  Add a property or paste a buyer requirement to find a match.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                <Link to="/app/properties/new" className="w-full sm:w-auto">
                  <Button variant="primary" size="md" className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-1.5" />
                    <span>Add Property</span>
                  </Button>
                </Link>
                <Link to="/app/paste" className="w-full sm:w-auto">
                  <Button variant="secondary" size="md" className="w-full sm:w-auto">
                    <Sparkles className="w-4 h-4 mr-1.5 text-brand-600" />
                    <span>Open Quick Chat</span>
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {!isLoading && totalPropertiesCount > 0 && totalBuyersCount === 0 && (
            <Card className="p-5 text-center space-y-3">
              <div className="w-11 h-11 rounded-card bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-card-title font-semibold text-ink">
                  Find a buyer for your inventory
                </h3>
                <p className="text-secondary text-muted leading-relaxed">
                  You have {activePropertiesCount} active propert{activePropertiesCount === 1 ? 'y' : 'ies'} listed. Add a buyer requirement or paste client messages to find an instant match.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                <Link to="/app/buyers/new" className="w-full sm:w-auto">
                  <Button variant="primary" size="sm" className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-1.5" />
                    <span>Add Buyer Requirement</span>
                  </Button>
                </Link>
                <Link to="/app/paste" className="w-full sm:w-auto">
                  <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                    <Sparkles className="w-4 h-4 mr-1.5 text-brand-600" />
                    <span>Open Quick Chat</span>
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {!isLoading && totalPropertiesCount === 0 && totalBuyersCount > 0 && (
            <Card className="p-5 text-center space-y-3">
              <div className="w-11 h-11 rounded-card bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-card-title font-semibold text-ink">
                  Add properties to match your buyers
                </h3>
                <p className="text-secondary text-muted leading-relaxed">
                  You have {activeBuyersCount} active buyer inquir{activeBuyersCount === 1 ? 'y' : 'ies'} waiting. Add property listings to discover matches and close deals.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                <Link to="/app/properties/new" className="w-full sm:w-auto">
                  <Button variant="primary" size="sm" className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-1.5" />
                    <span>Add Property</span>
                  </Button>
                </Link>
                <Link to="/app/paste" className="w-full sm:w-auto">
                  <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                    <Sparkles className="w-4 h-4 mr-1.5 text-brand-600" />
                    <span>Open Quick Chat</span>
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* ── 5. QUICK PASTE SECTION ── */}
          <Card className="p-4 space-y-3">
            <div>
              <h2 className="text-card-title font-semibold text-ink">
                Paste a WhatsApp message
              </h2>
              <p className="text-secondary text-muted mt-0.5">
                Extract property or buyer details automatically.
              </p>
            </div>

            <textarea
              rows={3}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="e.g. 3 BHK floor in Sector 12 Panipat demand 85 Lakhs negotiable. Contact 9812345678..."
              className="w-full bg-white border border-border rounded-input p-3 text-body text-ink placeholder-faint focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors resize-none"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-1.5 text-meta text-muted">
                <MessageSquare className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>Supports forwarded listing & buyer texts</span>
              </div>

              <div className="flex items-center gap-2 justify-end">
                {pasteText.trim() && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPasteText('');
                      setParseResult(null);
                    }}
                  >
                    Clear
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleQuickParse}
                  disabled={!pasteText.trim() || isParsing}
                  isLoading={isParsing}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-600" />
                  <span>Parse message</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleContinueInQuickChat}
                >
                  <span>Continue in Quick Chat</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>

            {/* Parse Result Preview */}
            {parseResult && (
              <div className="p-3 bg-brand-50 border border-brand-200/60 rounded-input space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-brand-700">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                    <span>
                      Identified as {parseResult.itemType === 'listing' ? 'Property Listing' : 'Buyer Requirement'}
                    </span>
                  </span>
                  <Badge variant="brand">
                    {Math.round((parseResult.confidence.overall || 0.9) * 100)}% match
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-meta text-muted pt-1">
                  <span>
                    {parseResult.itemType === 'listing'
                      ? parseResult.extracted.property?.title || 'Residential Property'
                      : parseResult.extracted.buyer?.propertyType || 'Buyer Requirement'}
                  </span>
                  <Link
                    to="/app/paste"
                    state={{ prefill: pasteText }}
                    className="text-brand-700 font-semibold hover:underline"
                  >
                    Save in Quick Chat &rarr;
                  </Link>
                </div>
              </div>
            )}
          </Card>

          {/* ── 6. MATCHES LIST (WHEN REAL MATCHES EXIST) ── */}
          {matches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-section-title font-semibold text-ink">
                    New Matches
                  </h2>
                  <p className="text-secondary text-muted">
                    Inventory paired with active buyer criteria
                  </p>
                </div>
                <Link
                  to="/app/properties"
                  className="text-secondary font-semibold text-brand-700 hover:underline flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matches.map((match) => (
                  <Card key={match.id} className="p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={match.badge} dot>
                          {match.score}% match
                        </Badge>
                        <span className="text-card-title font-semibold text-brand-700">
                          {formatRupees(match.propertyPrice)}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-body font-semibold text-ink leading-snug">
                          {match.propertyTitle}
                        </h3>
                        <p className="text-meta text-muted mt-0.5">{match.locality}</p>
                      </div>

                      <div className="p-2.5 rounded-input bg-bg border border-border flex items-center justify-between text-meta">
                        <div>
                          <span className="text-faint block">Client</span>
                          <span className="font-semibold text-ink">{match.buyerName}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-faint block">Budget</span>
                          <span className="font-medium text-muted">{match.buyerBudget}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center gap-2">
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
                          className="w-full justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Pitch on WhatsApp</span>
                        </Button>
                      </a>
                      <Link to="/app/properties">
                        <Button variant="secondary" size="sm">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PIPELINE VIEW ── */}
      {activeSegment === 'pipeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-section-title font-semibold text-ink">
                Deal Pipeline
              </h2>
              <p className="text-secondary text-muted">
                Active deal stages from inquiry to commission settlement
              </p>
            </div>
            <Link to="/app/buyers">
              <Button variant="secondary" size="sm">
                <span>Manage deals</span>
              </Button>
            </Link>
          </div>

          {deals.length === 0 ? (
            <Card className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-card bg-surface-hover text-muted flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-card-title font-semibold text-ink">
                No active deals in pipeline
              </h3>
              <p className="text-secondary text-muted max-w-sm mx-auto leading-relaxed">
                When you share properties and advance client discussions, your active deals and projected commissions will appear here.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {deals.map((deal) => (
                <Card key={deal._id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-meta font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-hover text-ink">
                      {deal.stage}
                    </span>
                    <span className="text-meta text-muted">
                      {new Date(deal.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-body font-semibold text-ink truncate">
                      {deal.propertyTitleSnapshot || 'Property Deal'}
                    </h4>
                    <p className="text-meta text-muted mt-0.5">
                      Value: {formatRupees(deal.valuePaise)}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-input bg-bg border border-border flex items-center justify-between text-meta">
                    <span className="text-muted">Expected Commission</span>
                    <span className="font-semibold text-brand-700">
                      {formatRupees(deal.commission.expectedPaise)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
