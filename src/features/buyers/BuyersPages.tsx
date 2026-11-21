import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  ArrowLeft,
  Search,
  MapPin,
  Phone,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Building2,
  Trash2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ErrorState } from '../../components/ui/ErrorState';
import { BuyerCardSkeleton } from '../../components/ui/Skeleton';
import { formatRupees } from '../../lib/money';
import {
  fetchBuyers,
  fetchBuyerById,
  createBuyer,
  fetchBuyerMatches,
  deleteBuyer,
  type BuyerItem,
  type CreateBuyerDto,
  type BuyerMatchResult,
} from '../../lib/api/buyers';
import clsx from 'clsx';

// =========================================================================
// 1. BUYERS LIST PAGE
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

  const loadBuyers = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchBuyers({
        urgency: urgencyFilter === 'all' ? undefined : urgencyFilter,
        search: searchQuery || undefined,
      });
      setBuyers(data);
    } catch (err: any) {
      console.warn('Could not load buyers:', err);
      setFetchError(err?.message || 'Unable to load buyer inquiries. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBuyers();
  }, [urgencyFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadBuyers();
  };

  const urgencyFilters = [
    { label: 'All Inquiries', value: 'all' },
    { label: 'Immediate Closing', value: 'hot' },
    { label: 'Within Month', value: 'warm' },
    { label: 'Casual Exploring', value: 'cold' },
  ];

  return (
    <div className="space-y-6 pb-16 text-left max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-ink font-heading tracking-tight">
              Buyers & Active Inquiries
            </h1>
            <Badge variant="brand">
              {buyers.length} Inquiries
            </Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Track buyer budgets, urgent requirements, and instantly match them against active inventory.
          </p>
        </div>

        <Link to="/app/buyers/new">
          <Button size="md" pill className="font-bold text-xs shadow-md shadow-brand-700/20">
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            <span>Add Buyer Requirement</span>
          </Button>
        </Link>
      </div>

      {/* Search Bar & Filter Strip */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, locality (Model Town, Sector 18), or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface border border-border/80 text-xs text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-xs transition"
          />
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {urgencyFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setUrgencyFilter(f.value)}
              className={clsx(
                'px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer',
                urgencyFilter === f.value
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-surface border border-border text-muted hover:text-ink'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Buyer Cards */}
      {fetchError ? (
        <ErrorState onRetry={loadBuyers} message={fetchError} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <BuyerCardSkeleton />
          <BuyerCardSkeleton />
          <BuyerCardSkeleton />
        </div>
      ) : buyers.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center space-y-4 rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border-blue-500/20">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-ink font-heading">
              {searchQuery ? 'No Buyer Inquiries Found' : 'Please add your buyers first'}
            </h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              {searchQuery
                ? `No buyers matched "${searchQuery}". Try a different name or clear filter.`
                : 'No data is available to display yet. Add a client lead or paste client requirements in Quick Chat to discover matching inventory.'}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2">
            <Link to="/app/buyers/new">
              <Button size="sm" pill className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                + Add Buyer
              </Button>
            </Link>
            <Link to="/app/paste">
              <Button variant="secondary" size="sm" pill className="font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span>Quick Chat</span>
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buyers.map((buyer) => (
            <Card
              key={buyer._id}
              className="p-5 flex flex-col justify-between hover:border-brand-600/40 hover:shadow-card transition-all group"
            >
              <div className="space-y-3">
                {/* Header Strip: Name & Urgency Tag */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-ink font-heading group-hover:text-brand-700 dark:group-hover:text-brand-600 transition">
                      {buyer.name}
                    </h3>
                    <span className="text-[11px] text-muted font-medium flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-brand-600" />
                      {buyer.phone}
                    </span>
                  </div>

                  <span
                    className={clsx(
                      'px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1.5',
                      buyer.urgency === 'hot'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : buyer.urgency === 'warm'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    )}
                  >
                    {buyer.urgency === 'hot' ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        <span>High Priority</span>
                      </>
                    ) : buyer.urgency === 'warm' ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Active Pipeline</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>Flexible</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Budget Band */}
                <div className="p-3 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-500/20 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Budget Range
                  </span>
                  <div className="text-sm font-black text-brand-700 dark:text-brand-600">
                    {buyer.budget.minPaise ? formatRupees(buyer.budget.minPaise) : 'Flexible'} — {formatRupees(buyer.budget.maxPaise)}
                  </div>
                </div>

                {/* Localities & Types */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-muted">
                    <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span className="truncate">
                      {buyer.localities.map((l) => (typeof l === 'string' ? l : l.display)).join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted">
                    <Building2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>Types: {buyer.types.join(', ')}</span>
                  </div>
                </div>

                {/* Live Match Notification Chip */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Exact Match Waiting</span>
                  </div>
                  <Badge variant="perfect">
                    96% Match
                  </Badge>
                </div>
              </div>

              {/* Action Strip */}
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://wa.me/${buyer.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Delete Buyer Button */}
                  <button
                    type="button"
                    onClick={() => setBuyerToDelete({ id: buyer._id, name: buyer.name })}
                    className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Delete Buyer Inquiry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Link
                  to={`/app/buyers/${buyer._id}`}
                  className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition flex items-center gap-1"
                >
                  <span>Matches & Pitch</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog before deleting buyer inquiry */}
      <ConfirmDialog
        open={Boolean(buyerToDelete)}
        onOpenChange={(open) => {
          if (!open) setBuyerToDelete(null);
        }}
        title="Delete Buyer Requirement"
        description={`Are you sure you want to delete the buyer inquiry for "${buyerToDelete?.name}"? This client requirement will be removed from your active leads.`}
        confirmText="Yes, Delete Buyer"
        isLoading={isDeletingBuyer}
        onConfirm={confirmDeleteBuyer}
      />
    </div>
  );
};

// =========================================================================
// 2. QUICK ADD BUYER FORM PAGE
// =========================================================================
export const BuyerNewPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [urgency, setUrgency] = useState<CreateBuyerDto['urgency']>('hot');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Floor', 'Plot']);
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>(['Model Town', 'Sector 18']);
  const [minBudgetLakhs, setMinBudgetLakhs] = useState<number>(80);
  const [maxBudgetLakhs, setMaxBudgetLakhs] = useState<number>(120);
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
  ];

  const availableTypes = ['Floor', 'Plot', 'Kothi', 'Flat', 'Shop'];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Please enter buyer name.');
      return;
    }
    if (!phone || phone.length < 10) {
      error('Please enter a valid client phone number.');
      return;
    }
    if (selectedLocalities.length === 0) {
      error('Please select at least one target locality.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createBuyer({
        name,
        phone,
        urgency,
        types: selectedTypes,
        localities: selectedLocalities,
        budget: {
          minPaise: Math.round(minBudgetLakhs * 100000 * 100),
          maxPaise: Math.round(maxBudgetLakhs * 100000 * 100),
        },
        notes,
      });

      success('Buyer requirement logged and active for matching!');
      setTimeout(() => navigate('/app/buyers'), 600);
    } catch (err: any) {
      error(err.message || 'Could not log buyer requirement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16 text-left">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/buyers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inquiries</span>
        </Link>
        <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
          New Requirement
        </span>
      </div>

      <Card className="p-5 sm:p-6 space-y-5 border-emerald-500/30 shadow-card">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-ink font-heading">
            Add Buyer Requirement
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Log client budget & preferences to automatically trigger match alerts against inventory.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Client Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
                Buyer / Client Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
                Phone Number (WhatsApp)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>

          {/* Urgency Level */}
          <div className="space-y-1.5">
            <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
              Closing Urgency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Immediate (7 Days)', value: 'hot' },
                { label: 'Within Month', value: 'warm' },
                { label: 'Flexible / Casual', value: 'cold' },
              ].map((u) => (
                <button
                  key={u.value}
                  type="button"
                  onClick={() => setUrgency(u.value as any)}
                  className={clsx(
                    'py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer border text-center',
                    urgency === u.value
                      ? 'bg-brand-700 text-white border-brand-700 shadow-xs'
                      : 'bg-surface border-border text-muted hover:text-ink'
                  )}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Property Types Wanted */}
          <div className="space-y-1.5">
            <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
              Desired Property Types (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  className={clsx(
                    'px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer border',
                    selectedTypes.includes(t)
                      ? 'bg-brand-50 border-brand-600 text-brand-700 dark:bg-brand-950/60 dark:text-brand-600'
                      : 'bg-surface border-border text-muted hover:text-ink'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range (in Lakhs) */}
          <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-500/30 space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-bold text-brand-900 dark:text-brand-300 uppercase tracking-wider text-[10px]">
                Client Budget Band
              </label>
              <span className="text-sm font-black text-brand-700 dark:text-brand-600">
                ₹{minBudgetLakhs} L — ₹{maxBudgetLakhs} L
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-muted font-bold block mb-1">Minimum Budget (Lakhs)</span>
                <input
                  type="number"
                  value={minBudgetLakhs}
                  onChange={(e) => setMinBudgetLakhs(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink"
                />
              </div>
              <div>
                <span className="text-[10px] text-muted font-bold block mb-1">Maximum Budget (Lakhs)</span>
                <input
                  type="number"
                  value={maxBudgetLakhs}
                  onChange={(e) => setMaxBudgetLakhs(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink"
                />
              </div>
            </div>
          </div>

          {/* Preferred Localities */}
          <div className="space-y-1.5">
            <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
              Preferred Sectors / Localities
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableLocalities.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => toggleLocality(loc)}
                  className={clsx(
                    'px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer border',
                    selectedLocalities.includes(loc)
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900'
                      : 'bg-surface border-border text-muted hover:text-ink'
                  )}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
              Specific Client Requirements / Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Needs wide road for large car, preference for 2nd floor with lift..."
              className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              pill
              className="w-full font-bold text-xs shadow-md shadow-brand-700/20"
            >
              {isSubmitting ? 'Logging Requirement...' : 'Save Buyer & Find Matches'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// =========================================================================
// 3. BUYER DETAIL & AUTOMATED MATCH MATRIX PAGE
// =========================================================================
export const BuyerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [buyer, setBuyer] = useState<BuyerItem | null>(null);
  const [matches, setMatches] = useState<BuyerMatchResult[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  const handleDelete = async () => {
    if (!buyer) return;
    if (window.confirm(`Are you sure you want to permanently delete buyer requirement for "${buyer.name}"?`)) {
      try {
        await deleteBuyer(buyer._id);
        success('Buyer inquiry deleted successfully');
        navigate('/app/buyers');
      } catch {
        error('Failed to delete buyer inquiry');
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchBuyerById(id).then(setBuyer);
      fetchBuyerMatches(id)
        .then((m) => setMatches(m))
        .finally(() => setIsLoadingMatches(false));
    }
  }, [id]);

  if (!buyer) {
    return (
      <div className="p-8 text-center text-xs text-muted">
        Loading buyer profile...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 text-left">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/buyers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inquiries</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer"
            title="Delete Buyer Inquiry"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <a
            href={`https://wa.me/${buyer.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Buyer Overview Card */}
      <Card className="p-5 sm:p-6 space-y-4 border-emerald-500/30 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-ink font-heading">
                {buyer.name}
              </h1>
              <span
                className={clsx(
                  'px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1.5',
                  buyer.urgency === 'hot'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                )}
              >
                <span className={clsx('w-1.5 h-1.5 rounded-full', buyer.urgency === 'hot' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500')} />
                <span>{buyer.urgency === 'hot' ? 'High Priority Client' : 'Active Pipeline Buyer'}</span>
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Direct Client · Contact: <span className="font-bold text-ink">{buyer.phone}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-muted block">Budget Band</span>
            <span className="text-base font-black text-brand-700 dark:text-brand-600">
              {buyer.budget.minPaise ? formatRupees(buyer.budget.minPaise) : 'Flexible'} — {formatRupees(buyer.budget.maxPaise)}
            </span>
          </div>
        </div>

        {/* Criteria Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-border">
            <span className="text-[10px] uppercase font-bold text-muted block mb-1">Target Sectors</span>
            <span className="font-bold text-ink">
              {buyer.localities.map((l) => (typeof l === 'string' ? l : l.display)).join(', ')}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-border">
            <span className="text-[10px] uppercase font-bold text-muted block mb-1">Property Types</span>
            <span className="font-bold text-ink">{buyer.types.join(', ')}</span>
          </div>
        </div>

        {buyer.notes && (
          <p className="text-xs text-slate-600 dark:text-slate-300 p-3 rounded-xl bg-surface border border-border">
            <span className="font-bold">Client Notes:</span> {buyer.notes}
          </p>
        )}
      </Card>

      {/* ======================================================== */}
      {/* AUTOMATED BI-DIRECTIONAL MATCH MATRIX                    */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h2 className="text-base sm:text-lg font-black text-ink font-heading">
              Live Matching Inventory ({matches.length})
            </h2>
          </div>
          <span className="text-xs text-muted font-medium">
            Ranked by score & locality fit
          </span>
        </div>

        {isLoadingMatches ? (
          <div className="p-8 text-center text-xs text-muted">
            Evaluating active inventory matches...
          </div>
        ) : matches.length === 0 ? (
          <Card className="p-8 text-center space-y-2">
            <p className="text-xs text-muted">
              No matching properties currently in inventory within this budget & locality.
            </p>
            <Link to="/app/properties/new">
              <Button size="sm" pill className="text-xs font-bold">
                + Add Listing to Match
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => {
              const whatsappPitch = `Namaste ${buyer.name.split(' ')[0]} ji, aapki requirement ke anusaar ${m.property.locality} mein ${m.property.title} available hai. Demand ${formatRupees(m.property.priceDemandPaise)}. Details yahan check karein. Kal site inspection visit plan karein?`;
              const pitchUrl = `https://wa.me/${buyer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappPitch)}`;

              return (
                <Card
                  key={m.property._id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-emerald-500/30 hover:border-brand-600/60 transition shadow-sm"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={m.badge === 'perfect' ? 'perfect' : m.badge === 'good' ? 'good' : 'stretch'}
                      >
                        {m.score}% Match
                      </Badge>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        {m.property.type} · {m.property.locality}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-ink font-heading">
                        {m.property.title}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-base font-black text-brand-700 dark:text-brand-600">
                          {formatRupees(m.property.priceDemandPaise)}
                        </span>
                        <span className="text-xs text-muted">
                          · {m.property.size.value} {m.property.size.unit.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown Reasons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.reasons.map((r, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pitch Action Buttons */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                    <a
                      href={pitchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 transition cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Pitch on WhatsApp</span>
                    </a>

                    <Link
                      to={`/app/properties/${m.property._id}`}
                      className="px-4 py-2 rounded-full border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-muted hover:text-ink text-center transition"
                    >
                      View Property
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Edit Page alias
export const BuyerEditPage: React.FC = () => {
  return <BuyerNewPage />;
};
