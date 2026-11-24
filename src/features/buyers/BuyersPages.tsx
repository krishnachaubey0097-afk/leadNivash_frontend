import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  ArrowLeft,
  Search,
  MapPin,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Building2,
  Trash2,
  Edit3,
  X,
  Clock,
  Layers,
  ArrowUpRight,
  Maximize2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ErrorState } from '../../components/ui/ErrorState';
import { BuyerCardSkeleton, BuyerDetailSkeleton } from '../../components/ui/Skeleton';
import { formatRupees } from '../../lib/money';
import {
  fetchBuyers,
  fetchBuyerById,
  createBuyer,
  updateBuyer,
  fetchBuyerMatches,
  deleteBuyer,
  type BuyerItem,
  type CreateBuyerDto,
  type BuyerMatchResult,
} from '../../lib/api/buyers';
import clsx from 'clsx';

// =========================================================================
// HELPER: Format date to relative or human-readable format
// =========================================================================
const formatLastUpdated = (dateString?: string): string => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

// =========================================================================
// 1. BUYERS LIST PAGE (PROMPT 3 REDESIGN)
// =========================================================================
export const BuyersListPage: React.FC = () => {
  const { success, error } = useToast();
  const [buyers, setBuyers] = useState<BuyerItem[]>([]);
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [buyerToDelete, setBuyerToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingBuyer, setIsDeletingBuyer] = useState<boolean>(false);

  const confirmDeleteBuyer = async () => {
    if (!buyerToDelete) return;
    setIsDeletingBuyer(true);
    try {
      await deleteBuyer(buyerToDelete.id);
      setBuyers((prev) => prev.filter((b) => b._id !== buyerToDelete.id));
      success(`Buyer requirement for "${buyerToDelete.name}" deleted successfully`);
      setBuyerToDelete(null);
    } catch {
      error('Failed to delete buyer inquiry');
    } finally {
      setIsDeletingBuyer(false);
    }
  };

  const loadBuyers = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchBuyers();
      setBuyers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (!silent) {
        console.warn('Could not load buyers:', err);
        setFetchError(err?.message || 'Unable to load buyer inquiries. Please check your connection.');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBuyers();

    const handleSync = () => loadBuyers(true);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') handleSync();
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleSync);
    window.addEventListener('online', handleSync);
    window.addEventListener('leadnivash_data_changed', handleSync);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') handleSync();
    }, 10000);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('online', handleSync);
      window.removeEventListener('leadnivash_data_changed', handleSync);
      clearInterval(interval);
    };
  }, []);

  // Filter chips definitions per Prompt 3
  const filterChips = [
    { label: 'All', value: 'all' },
    { label: 'Immediate', value: 'hot' },
    { label: 'Within a Month', value: 'warm' },
    { label: 'Flexible', value: 'cold' },
  ];

  // Active inquiries count (real ground truth count)
  const activeInquiriesCount = useMemo(() => {
    return buyers.filter((b) => b.status === 'active' || !b.status).length;
  }, [buyers]);

  // Client-side instant filter and search
  const filteredBuyers = useMemo(() => {
    return buyers.filter((b) => {
      // 1. Urgency filter
      if (urgencyFilter !== 'all') {
        if (b.urgency !== urgencyFilter) return false;
      }

      // 2. Search query (buyer name, phone, locality, requirement type, notes)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (b.name || '').toLowerCase().includes(q);
        const matchesPhone = (b.phone || '').includes(q);
        const matchesType = (b.types || []).some((t) => t.toLowerCase().includes(q));
        const matchesLocality = (b.localities || []).some((loc) =>
          typeof loc === 'string' ? loc.toLowerCase().includes(q) : loc.display?.toLowerCase().includes(q)
        );
        const matchesNotes = (b.notes || '').toLowerCase().includes(q);

        if (!matchesName && !matchesPhone && !matchesType && !matchesLocality && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [buyers, urgencyFilter, searchQuery]);

  return (
    <div className="space-y-4 pb-12 max-w-5xl mx-auto text-left">
      {/* ── 1. TOP SECTION ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-ink leading-tight">
              Buyers
            </h1>
            {!isLoading && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200/60">
                {activeInquiriesCount} Active
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-secondary text-muted mt-0.5 truncate">
            Manage buyer requirements and find matching properties.
          </p>
        </div>

        <Link to="/app/buyers/new" className="shrink-0">
          <Button
            variant="primary"
            size="md"
            className="gap-1.5 shadow-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Buyer</span>
          </Button>
        </Link>
      </div>

      {/* ── 2. FULL-WIDTH SEARCH FIELD ── */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by buyer, locality or requirement"
          className="w-full pl-10 pr-9 min-h-[48px] bg-white border border-border rounded-input text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all shadow-card"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink transition cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── 3. HORIZONTALLY SCROLLABLE FILTER CHIPS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
        {filterChips.map((f) => {
          const isSelected = urgencyFilter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setUrgencyFilter(f.value)}
              className={clsx(
                'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 border',
                isSelected
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                  : 'bg-white text-muted border-border hover:text-ink hover:border-slate-300'
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ── 4. BUYER CARDS GRID / EMPTY STATES / LOADING SKELETON ── */}
      {fetchError ? (
        <ErrorState onRetry={() => loadBuyers(false)} message={fetchError} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <BuyerCardSkeleton />
          <BuyerCardSkeleton />
          <BuyerCardSkeleton />
          <BuyerCardSkeleton />
          <BuyerCardSkeleton />
          <BuyerCardSkeleton />
        </div>
      ) : buyers.length === 0 ? (
        /* Empty State: No buyer inquiries yet (Prompt 3 Spec) */
        <Card className="p-8 sm:p-12 text-center space-y-4 rounded-2xl bg-white border border-border shadow-card">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-brand-600 flex items-center justify-center mx-auto shadow-xs">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-ink">
              No buyer inquiries yet
            </h3>
            <p className="text-xs sm:text-sm text-secondary text-muted leading-relaxed">
              Add a buyer requirement or paste a WhatsApp message to discover matching properties.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link to="/app/buyers/new" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto font-semibold gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Buyer</span>
              </Button>
            </Link>
            <Link to="/app/paste" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="md"
                className="w-full sm:w-auto font-semibold gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Open Quick Chat</span>
              </Button>
            </Link>
          </div>
        </Card>
      ) : filteredBuyers.length === 0 ? (
        /* Contextual Search / Filter Empty State */
        <Card className="p-8 text-center space-y-3 rounded-2xl bg-white border border-border shadow-card">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Search className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-ink">
              No matching buyer inquiries
            </h3>
            <p className="text-xs text-secondary text-muted">
              {searchQuery
                ? `No buyers matched "${searchQuery}". Try a different name, locality or clear your search.`
                : 'No buyer requirements found for the selected timeline filter.'}
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setUrgencyFilter('all');
              }}
              className="font-semibold text-xs"
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        /* Buyer Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredBuyers.map((buyer) => {
            // Localities text preview
            const localityList = buyer.localities || [];
            const localityText = localityList.length > 0
              ? localityList
                  .map((l) => (typeof l === 'string' ? l : l.display))
                  .join(', ')
              : buyer.anyLocality
              ? 'Any Locality'
              : 'Panipat';

            // Size range in Gaj (if available)
            const hasSize = buyer.sizeGaj && (buyer.sizeGaj.min || buyer.sizeGaj.max);
            const sizeText = hasSize
              ? `${buyer.sizeGaj?.min ? `${buyer.sizeGaj.min}` : 'Min'} - ${buyer.sizeGaj?.max ? `${buyer.sizeGaj.max}` : 'Max'} Gaj`
              : null;

            // Clean phone for WhatsApp action
            const cleanPhone = (buyer.phone || '').replace(/[^0-9]/g, '');

            return (
              <Card
                key={buyer._id}
                className="p-4 sm:p-5 flex flex-col justify-between rounded-card bg-white border border-border hover:border-brand-600/40 hover:shadow-card transition-all"
              >
                <div className="space-y-3">
                  {/* Top Header: Property Type / Requirement & Urgency Chip */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {/* Property Types Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        {(buyer.types || ['Any Type']).map((type) => (
                          <span
                            key={type}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200/60"
                          >
                            {type}
                          </span>
                        ))}
                      </div>

                      {/* Locality */}
                      <div className="flex items-center gap-1.5 text-xs text-muted truncate">
                        <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span className="truncate font-medium text-slate-700">
                          {localityText}
                        </span>
                      </div>
                    </div>

                    {/* Timeline / Urgency Badge */}
                    <span
                      className={clsx(
                        'shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border',
                        buyer.urgency === 'hot'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : buyer.urgency === 'warm'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      )}
                    >
                      <span
                        className={clsx(
                          'w-1.5 h-1.5 rounded-full',
                          buyer.urgency === 'hot'
                            ? 'bg-rose-500 animate-pulse'
                            : buyer.urgency === 'warm'
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        )}
                      />
                      <span>
                        {buyer.urgency === 'hot'
                          ? 'Immediate'
                          : buyer.urgency === 'warm'
                          ? 'Within a Month'
                          : 'Flexible'}
                      </span>
                    </span>
                  </div>

                  {/* Budget Band (Strongest Visual Hierarchy per Prompt 3) */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-0.5">
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                      Target Budget
                    </span>
                    <div className="text-base sm:text-lg font-bold text-ink">
                      {buyer.budget?.minPaise
                        ? `${formatRupees(buyer.budget.minPaise)} — ${formatRupees(buyer.budget.maxPaise)}`
                        : `Up to ${formatRupees(buyer.budget?.maxPaise || 0)}`}
                    </div>
                  </div>

                  {/* Additional Metadata: Size in Gaj & Client Identity */}
                  <div className="space-y-1.5 pt-0.5 text-xs text-secondary text-muted">
                    {sizeText && (
                      <div className="flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Plot / Built Size: <strong className="text-ink font-semibold">{sizeText}</strong></span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 truncate">
                        <Users className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span className="font-semibold text-ink truncate">{buyer.name}</span>
                        {buyer.phone && (
                          <span className="text-[11px] text-muted truncate">({buyer.phone})</span>
                        )}
                      </div>

                      {/* Last updated indicator */}
                      <span className="text-[11px] text-muted shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatLastUpdated(buyer.updatedAt || buyer.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── 5. CARD ACTION STRIP ── */}
                <div className="mt-3.5 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Direct WhatsApp Contact */}
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="min-h-[40px] px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-brand-700 text-xs font-semibold flex items-center gap-1 transition"
                        title="Chat with Buyer on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">WhatsApp</span>
                      </a>
                    )}

                    {/* Edit Requirement */}
                    <Link
                      to={`/app/buyers/${buyer._id}/edit`}
                      className="min-h-[40px] min-w-[40px] px-2.5 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-slate-600 hover:text-ink text-xs font-semibold flex items-center justify-center gap-1 transition"
                      title="Edit Requirement"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>

                    {/* Delete Requirement */}
                    <button
                      type="button"
                      onClick={() => setBuyerToDelete({ id: buyer._id, name: buyer.name })}
                      className="min-h-[40px] min-w-[40px] p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer flex items-center justify-center"
                      title="Delete Buyer Inquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Primary Card Action: View Details & Live Matches */}
                  <Link
                    to={`/app/buyers/${buyer._id}`}
                    className="min-h-[40px] px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs shrink-0"
                  >
                    <span>View Matches</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(buyerToDelete)}
        onOpenChange={(open) => {
          if (!open) setBuyerToDelete(null);
        }}
        title="Delete Buyer Requirement"
        description={`Are you sure you want to delete the buyer inquiry for "${buyerToDelete?.name}"? This requirement will be removed from your active client leads.`}
        confirmText="Yes, Delete Buyer"
        isLoading={isDeletingBuyer}
        onConfirm={confirmDeleteBuyer}
      />
    </div>
  );
};

// =========================================================================
// 2. ADD & EDIT BUYER FORM PAGE (PROMPT 3 SPEC)
// =========================================================================
export const BuyerNewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [isLoadingExisting, setIsLoadingExisting] = useState(isEditMode);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [urgency, setUrgency] = useState<'hot' | 'warm' | 'cold'>('hot');
  const [status, setStatus] = useState<'active' | 'paused' | 'closed'>('active');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Floor', 'Plot']);
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>(['Model Town', 'Sector 18']);
  const [customLocalityInput, setCustomLocalityInput] = useState('');
  const [anyLocality, setAnyLocality] = useState(false);
  const [minBudgetLakhs, setMinBudgetLakhs] = useState<number | ''>(80);
  const [maxBudgetLakhs, setMaxBudgetLakhs] = useState<number | ''>(120);
  const [minSizeGaj, setMinSizeGaj] = useState<number | ''>('');
  const [maxSizeGaj, setMaxSizeGaj] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableLocalities = [
    'Model Town',
    'Ansals Sushant City',
    'Sector 18',
    'Sector 12',
    'Sector 11',
    'GT Road',
    'HUDA Sector 25',
    'Chandni Bagh',
    'Eldeco Estate',
    'Ugra Kheri',
    'Barsat Road',
  ];

  const availableTypes = ['Floor', 'Plot', 'Kothi', 'Flat', 'Shop', 'Commercial Space'];

  // Load existing buyer data in edit mode
  useEffect(() => {
    if (id) {
      setIsLoadingExisting(true);
      fetchBuyerById(id)
        .then((existing) => {
          if (!existing) {
            error('Buyer requirement not found');
            navigate('/app/buyers');
            return;
          }
          setName(existing.name || '');
          setPhone(existing.phone || '+91 ');
          setUrgency(existing.urgency || 'warm');
          setStatus(existing.status || 'active');
          if (Array.isArray(existing.types) && existing.types.length > 0) {
            setSelectedTypes(existing.types);
          }
          if (Array.isArray(existing.localities)) {
            setSelectedLocalities(
              existing.localities.map((l) => (typeof l === 'string' ? l : l.display))
            );
          }
          setAnyLocality(Boolean(existing.anyLocality));
          if (existing.budget?.minPaise) {
            setMinBudgetLakhs(Math.round(existing.budget.minPaise / 100000 / 100));
          } else {
            setMinBudgetLakhs('');
          }
          if (existing.budget?.maxPaise) {
            setMaxBudgetLakhs(Math.round(existing.budget.maxPaise / 100000 / 100));
          } else {
            setMaxBudgetLakhs('');
          }
          if (existing.sizeGaj?.min) setMinSizeGaj(existing.sizeGaj.min);
          if (existing.sizeGaj?.max) setMaxSizeGaj(existing.sizeGaj.max);
          setNotes(existing.notes || '');
        })
        .catch((err) => {
          console.warn('Failed to load buyer for editing:', err);
          error('Could not load buyer requirement for editing');
          navigate('/app/buyers');
        })
        .finally(() => {
          setIsLoadingExisting(false);
        });
    }
  }, [id, navigate]);

  const toggleType = (t: string) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const toggleLocality = (loc: string) => {
    setSelectedLocalities((prev) =>
      prev.includes(loc) ? prev.filter((item) => item !== loc) : [...prev, loc]
    );
  };

  const handleAddCustomLocality = () => {
    const trimmed = customLocalityInput.trim();
    if (trimmed && !selectedLocalities.includes(trimmed)) {
      setSelectedLocalities((prev) => [...prev, trimmed]);
      setCustomLocalityInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      error('Please enter buyer or client name.');
      return;
    }
    if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
      error('Please enter a valid 10-digit WhatsApp phone number.');
      return;
    }
    if (selectedTypes.length === 0) {
      error('Please select at least one property type.');
      return;
    }
    if (!anyLocality && selectedLocalities.length === 0) {
      error('Please select at least one preferred locality or check "Any Locality".');
      return;
    }
    if (!maxBudgetLakhs || Number(maxBudgetLakhs) <= 0) {
      error('Please enter a valid maximum budget.');
      return;
    }
    if (minBudgetLakhs && Number(minBudgetLakhs) > Number(maxBudgetLakhs)) {
      error('Minimum budget cannot exceed maximum budget.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateBuyerDto = {
        name: name.trim(),
        phone: phone.trim(),
        urgency,
        status,
        types: selectedTypes,
        localities: anyLocality ? [] : selectedLocalities,
        anyLocality,
        budget: {
          minPaise: minBudgetLakhs ? Math.round(Number(minBudgetLakhs) * 100000 * 100) : undefined,
          maxPaise: Math.round(Number(maxBudgetLakhs) * 100000 * 100),
        },
        sizeGaj: {
          min: minSizeGaj ? Number(minSizeGaj) : undefined,
          max: maxSizeGaj ? Number(maxSizeGaj) : undefined,
        },
        notes: notes.trim(),
      };

      if (isEditMode && id) {
        await updateBuyer(id, payload);
        success('Buyer requirement updated successfully!');
      } else {
        await createBuyer(payload);
        success('Buyer requirement logged and active for matching!');
      }

      setTimeout(() => navigate('/app/buyers'), 500);
    } catch (err: any) {
      error(err.message || 'Could not save buyer requirement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingExisting) {
    return <BuyerDetailSkeleton />;
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-16 text-left">
      {/* ── Top Navigation & Mode Label ── */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/buyers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inquiries</span>
        </Link>
        <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200/60">
          {isEditMode ? 'Edit Requirement' : 'New Buyer'}
        </span>
      </div>

      <Card className="p-4 sm:p-6 space-y-5 rounded-2xl bg-white border border-border shadow-card">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-ink">
            {isEditMode ? 'Edit Buyer Requirement' : 'Add Buyer Requirement'}
          </h1>
          <p className="text-xs sm:text-sm text-secondary text-muted mt-0.5">
            Log client budget, preferred types and localities to automatically trigger match alerts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* ── GROUP 1: CLIENT IDENTITY ── */}
          <div className="space-y-3 pb-3 border-b border-border">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-600" />
              <span>1. Client Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-ink text-xs block">
                  Buyer / Client Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink text-xs block">
                  WhatsApp Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* ── GROUP 2: PROPERTY REQUIREMENT & TYPES ── */}
          <div className="space-y-3 pb-3 border-b border-border">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-brand-600" />
              <span>2. Desired Property Types <span className="text-rose-500">*</span></span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {availableTypes.map((t) => {
                const isSelected = selectedTypes.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleType(t)}
                    className={clsx(
                      'min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border',
                      isSelected
                        ? 'bg-brand-50 border-brand-600 text-brand-700 shadow-xs font-bold'
                        : 'bg-white border-border text-muted hover:text-ink hover:border-slate-300'
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── GROUP 3: TARGET LOCALITIES ── */}
          <div className="space-y-3 pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>3. Preferred Localities / Sectors</span>
              </h2>

              <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={anyLocality}
                  onChange={(e) => setAnyLocality(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-border"
                />
                <span>Any Locality</span>
              </label>
            </div>

            {!anyLocality && (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {availableLocalities.map((loc) => {
                    const isSelected = selectedLocalities.includes(loc);
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => toggleLocality(loc)}
                        className={clsx(
                          'min-h-[38px] px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer border',
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                            : 'bg-white border-border text-muted hover:text-ink'
                        )}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>

                {/* Custom locality input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customLocalityInput}
                    onChange={(e) => setCustomLocalityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomLocality();
                      }
                    }}
                    placeholder="Add custom sector or locality..."
                    className="flex-1 min-h-[44px] bg-white border border-border rounded-input px-3 py-2 text-xs text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddCustomLocality}
                    className="shrink-0 min-h-[44px] font-semibold text-xs"
                  >
                    + Add
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* ── GROUP 4: BUDGET BAND (IN LAKHS) ── */}
          <div className="space-y-3 pb-3 border-b border-border">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-600" />
                <span>4. Client Budget Band <span className="text-rose-500">*</span></span>
              </h2>
              <span className="text-xs font-bold text-brand-700">
                {minBudgetLakhs ? `₹${minBudgetLakhs} L` : 'Flexible'} — {maxBudgetLakhs ? `₹${maxBudgetLakhs} L` : '...'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted block">
                  Minimum Budget (in Lakhs)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={minBudgetLakhs}
                  onChange={(e) => setMinBudgetLakhs(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 80"
                  className="w-full min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted block">
                  Maximum Budget (in Lakhs) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={maxBudgetLakhs}
                  onChange={(e) => setMaxBudgetLakhs(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 120"
                  className="w-full min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* ── GROUP 5: SIZE REQUIREMENT (OPTIONAL) ── */}
          <div className="space-y-3 pb-3 border-b border-border">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-brand-600" />
              <span>5. Required Area / Size (Optional)</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted block">
                  Min Size (Gaj)
                </label>
                <input
                  type="number"
                  min="0"
                  value={minSizeGaj}
                  onChange={(e) => setMinSizeGaj(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 150"
                  className="w-full min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted block">
                  Max Size (Gaj)
                </label>
                <input
                  type="number"
                  min="0"
                  value={maxSizeGaj}
                  onChange={(e) => setMaxSizeGaj(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 250"
                  className="w-full min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* ── GROUP 6: CLOSING TIMELINE / URGENCY ── */}
          <div className="space-y-3 pb-3 border-b border-border">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              <span>6. Purchase Urgency & Timeline</span>
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Immediate (7 Days)', value: 'hot' },
                { label: 'Within a Month', value: 'warm' },
                { label: 'Flexible / Casual', value: 'cold' },
              ].map((u) => (
                <button
                  key={u.value}
                  type="button"
                  onClick={() => setUrgency(u.value as any)}
                  className={clsx(
                    'min-h-[48px] p-2 rounded-xl text-xs font-semibold transition cursor-pointer border text-center flex items-center justify-center',
                    urgency === u.value
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs font-bold'
                      : 'bg-white border-border text-muted hover:text-ink'
                  )}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── GROUP 7: NOTES & SPECIFIC PREFERENCES ── */}
          <div className="space-y-1.5 pb-2">
            <label className="text-xs font-semibold text-ink block">
              Specific Client Requirements / Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Needs wide road for large car, preference for 2nd floor with lift, ready token advance..."
              className="w-full min-h-[80px] bg-white border border-border rounded-input p-3 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-xs"
            />
          </div>

          {/* ── FORM ACTIONS (SAVE & CANCEL) ── */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-2.5">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full sm:flex-1 font-semibold text-sm shadow-sm min-h-[48px]"
            >
              {isSubmitting
                ? 'Saving Requirement...'
                : isEditMode
                ? 'Update Buyer Requirement'
                : 'Save Buyer & Find Matches'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate('/app/buyers')}
              className="w-full sm:w-auto font-semibold text-sm min-h-[48px]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// =========================================================================
// 3. BUYER DETAIL & MATCH MATRIX PAGE (PROMPT 3 SPEC)
// =========================================================================
export const BuyerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [buyer, setBuyer] = useState<BuyerItem | null>(null);
  const [matches, setMatches] = useState<BuyerMatchResult[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!buyer) return;
    setIsDeleting(true);
    try {
      await deleteBuyer(buyer._id);
      success('Buyer requirement deleted successfully');
      navigate('/app/buyers');
    } catch {
      error('Failed to delete buyer requirement');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBuyerById(id)
        .then(setBuyer)
        .catch(() => {
          error('Buyer requirement not found');
          navigate('/app/buyers');
        });

      fetchBuyerMatches(id)
        .then((m) => setMatches(Array.isArray(m) ? m : []))
        .catch(() => setMatches([]))
        .finally(() => setIsLoadingMatches(false));
    }
  }, [id, navigate, error]);

  if (!buyer) {
    return <BuyerDetailSkeleton />;
  }

  const cleanPhone = (buyer.phone || '').replace(/[^0-9]/g, '');

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-16 text-left">
      {/* ── Top Navigation & Actions ── */}
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/app/buyers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inquiries</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/app/buyers/${buyer._id}/edit`}
            className="min-h-[40px] px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="min-h-[40px] px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/70 text-rose-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-100 transition cursor-pointer"
            title="Delete Buyer Inquiry"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          {cleanPhone && (
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noreferrer"
              className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      </div>

      {/* ── Client Overview Card ── */}
      <Card className="p-4 sm:p-6 space-y-4 rounded-2xl bg-white border border-border shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-ink">
                {buyer.name}
              </h1>
              <span
                className={clsx(
                  'px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border',
                  buyer.urgency === 'hot'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : buyer.urgency === 'warm'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                )}
              >
                <span
                  className={clsx(
                    'w-1.5 h-1.5 rounded-full',
                    buyer.urgency === 'hot' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                  )}
                />
                <span>
                  {buyer.urgency === 'hot'
                    ? 'Immediate Closing'
                    : buyer.urgency === 'warm'
                    ? 'Within a Month'
                    : 'Flexible'}
                </span>
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Contact: <strong className="text-ink font-semibold">{buyer.phone}</strong>
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] uppercase font-semibold text-muted block">Target Budget</span>
            <span className="text-lg font-bold text-ink">
              {buyer.budget?.minPaise
                ? `${formatRupees(buyer.budget.minPaise)} — ${formatRupees(buyer.budget.maxPaise)}`
                : `Up to ${formatRupees(buyer.budget?.maxPaise || 0)}`}
            </span>
          </div>
        </div>

        {/* Criteria Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] uppercase font-semibold text-muted block mb-1">Target Sectors</span>
            <span className="font-semibold text-ink">
              {buyer.localities && buyer.localities.length > 0
                ? buyer.localities.map((l) => (typeof l === 'string' ? l : l.display)).join(', ')
                : buyer.anyLocality
                ? 'Any Locality in Panipat'
                : 'Panipat'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] uppercase font-semibold text-muted block mb-1">Property Types</span>
            <span className="font-semibold text-ink">
              {(buyer.types || []).join(', ') || 'Any Type'}
            </span>
          </div>
        </div>

        {buyer.notes && (
          <div className="text-xs text-slate-700 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="font-semibold text-ink">Client Notes:</span> {buyer.notes}
          </div>
        )}
      </Card>

      {/* ── LIVE MATCHING INVENTORY SECTION ── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h2 className="text-base sm:text-lg font-bold text-ink">
              Matching Properties ({matches.length})
            </h2>
          </div>
          <span className="text-xs text-muted font-medium">
            Ranked by budget & locality match
          </span>
        </div>

        {isLoadingMatches ? (
          <div className="p-8 text-center text-xs text-muted">
            Evaluating inventory matches...
          </div>
        ) : matches.length === 0 ? (
          <Card className="p-8 text-center space-y-2.5 rounded-2xl bg-white border border-border shadow-card">
            <p className="text-xs sm:text-sm text-secondary text-muted">
              No matching properties currently in inventory within this budget & locality.
            </p>
            <Link to="/app/properties/new">
              <Button size="sm" variant="primary" className="text-xs font-semibold">
                + Add Property to Match
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => {
              const clientFirstName = buyer.name.split(' ')[0] || 'Sir';
              const whatsappPitch = `Namaste ${clientFirstName} ji, aapki requirement ke anusaar ${m.property.locality} mein ${m.property.title} available hai. Demand ${formatRupees(m.property.priceDemandPaise)}. Details yahan check karein. Kal site inspection visit plan karein?`;
              const pitchUrl = cleanPhone
                ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappPitch)}`
                : undefined;

              return (
                <Card
                  key={m.property._id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-card bg-white border border-border hover:border-brand-600/50 transition-all shadow-card"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={m.badge === 'perfect' ? 'perfect' : m.badge === 'good' ? 'good' : 'stretch'}
                      >
                        {m.score}% Match
                      </Badge>
                      <span className="text-[11px] font-semibold text-muted">
                        {m.property.type} · {m.property.locality}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-ink">
                        {m.property.title}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-base font-bold text-ink">
                          {formatRupees(m.property.priceDemandPaise)}
                        </span>
                        {m.property.size?.value && (
                          <span className="text-xs text-muted">
                            · {m.property.size.value} {m.property.size.unit.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Breakdown Reasons */}
                    {m.reasons && m.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {m.reasons.map((r, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{r}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                    {pitchUrl && (
                      <a
                        href={pitchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="min-h-[44px] px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Pitch on WhatsApp</span>
                      </a>
                    )}

                    <Link
                      to={`/app/properties/${m.property._id}`}
                      className="min-h-[44px] px-4 py-2 rounded-lg border border-border hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-ink text-center flex items-center justify-center gap-1 transition"
                    >
                      <span>View Property</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Buyer Requirement"
        description={`Are you sure you want to permanently delete buyer requirement for "${buyer.name}"?`}
        confirmText="Yes, Delete Buyer"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

// Edit Page alias
export const BuyerEditPage: React.FC = () => {
  return <BuyerNewPage />;
};
