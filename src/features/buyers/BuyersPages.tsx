import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Users,
  Plus,
  ArrowLeft,
  Search,
  MapPin,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Building2,
  Trash2,
  Edit3,
  X,
  Clock,
  Layers,
  ArrowUpRight,
  Maximize2,
  MoreHorizontal,
  Eye,
  EyeOff,
  CheckCircle,
  Phone,
  SlidersHorizontal,
  Send,
  Share2,
  Check,
  Download,
  Inbox,
  MessageSquare,
} from 'lucide-react';
import { ShareLeadFormModal } from '../../components/leadForm/ShareLeadFormModal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { StatusChip } from '../../components/ui/Chip';
import { Modal } from '../../components/ui/Modal';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table';
import { Tooltip } from '../../components/ui/Tooltip';
import { useToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ErrorState } from '../../components/ui/ErrorState';
import { BuyerCardSkeleton, BuyerDetailSkeleton } from '../../components/ui/Skeleton';
import { formatRupees } from '../../lib/money';
import { apiClient } from '../../lib/api/client';
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
import { fetchProperties, type PropertyItem } from '../../lib/api/properties';
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

type SortOption = 'newest' | 'urgency' | 'budget_desc' | 'budget_asc';
type InquirySortOption = 'newest' | 'urgency' | 'budget_desc' | 'budget_asc';

interface FlyerInquiryRaw {
  _id: string;
  name: string;
  phoneE164?: string;
  phone?: string;
  message?: string;
  status?: 'new' | 'contacted' | 'archived';
  createdAt?: string;
  propertyId?: {
    _id?: string;
    title?: string;
    locality?: string;
    priceDemandPaise?: number;
  };
}

interface UnifiedInquiryRow {
  id: string;
  source: 'flyer' | 'quick_chat' | 'lead_form';
  clientName: string;
  clientPhone: string;
  requirement: string;
  budgetPaise: number;
  budgetLabel: string;
  locality: string;
  receivedAt: string;
  urgency: 'hot' | 'warm' | 'cold';
  status: 'new' | 'contacted' | 'closed';
  message?: string;
  buyerId?: string;
  propertyId?: string;
}

// =========================================================================
// 1. BUYERS & INQUIRIES WORKFLOW LIST PAGE
// =========================================================================
export const BuyersListPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: 'buyers' | 'inquiries' =
    searchParams.get('tab') === 'inquiries' ? 'inquiries' : 'buyers';

  const handleTabChange = (tab: 'buyers' | 'inquiries') => {
    if (tab === 'inquiries') {
      setSearchParams({ tab: 'inquiries' }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const [buyers, setBuyers] = useState<BuyerItem[]>([]);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [flyerInquiries, setFlyerInquiries] = useState<FlyerInquiryRaw[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Inquiries sub-view state
  const [inquirySearch, setInquirySearch] = useState<string>('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | 'new' | 'contacted' | 'closed'>('all');
  const [inquirySortBy, setInquirySortBy] = useState<InquirySortOption>('newest');
  const [inquiryStatusOverrides, setInquiryStatusOverrides] = useState<
    Record<string, 'new' | 'contacted' | 'closed'>
  >({});
  const [selectedInquiry, setSelectedInquiry] = useState<UnifiedInquiryRow | null>(null);
  const [isShareFormOpen, setIsShareFormOpen] = useState<boolean>(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Revealed phone numbers state (masked by default)
  const [revealedPhones, setRevealedPhones] = useState<Set<string>>(new Set());

  // Filter Modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [minBudget, setMinBudget] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [selectedLocality, setSelectedLocality] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Draft Filter state for Modal
  const [draftType, setDraftType] = useState<string>('all');
  const [draftMinBudget, setDraftMinBudget] = useState<string>('');
  const [draftMaxBudget, setDraftMaxBudget] = useState<string>('');
  const [draftLocality, setDraftLocality] = useState<string>('');
  const [draftStatus, setDraftStatus] = useState<string>('all');

  // Delete dialog state
  const [buyerToDelete, setBuyerToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingBuyer, setIsDeletingBuyer] = useState<boolean>(false);

  const confirmDeleteBuyer = async () => {
    if (!buyerToDelete) return;
    setIsDeletingBuyer(true);
    try {
      await deleteBuyer(buyerToDelete.id);
      setBuyers((prev) => prev.filter((b) => b._id !== buyerToDelete.id));
      toast(`Buyer requirement for "${buyerToDelete.name}" deleted successfully`, 'success');
      setPropertyToDeleteNull();
    } catch {
      toast('Failed to delete buyer inquiry', 'error');
    } finally {
      setIsDeletingBuyer(false);
    }
  };

  const setPropertyToDeleteNull = () => {
    setBuyerToDelete(null);
  };

  const handleUpdateStatus = async (buyer: BuyerItem, newStatus: 'active' | 'paused' | 'closed') => {
    try {
      await updateBuyer(buyer._id, { status: newStatus });
      setBuyers((prev) =>
        prev.map((b) => (b._id === buyer._id ? { ...b, status: newStatus } : b))
      );
      toast(`Inquiry marked as ${newStatus}`, 'success');
    } catch {
      toast('Could not update inquiry status', 'error');
    }
  };

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setFetchError(null);
    try {
      const [buyersData, propertiesData, inquiriesRes] = await Promise.all([
        fetchBuyers(),
        fetchProperties().catch(() => []),
        apiClient.get<any, any>('/inquiries').catch(() => ({ items: [] })),
      ]);
      setBuyers(Array.isArray(buyersData) ? buyersData : []);
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);
      const rawInquiries = inquiriesRes?.items || (Array.isArray(inquiriesRes) ? inquiriesRes : []);
      setFlyerInquiries(Array.isArray(rawInquiries) ? rawInquiries : []);
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
    loadData();

    const handleSync = () => loadData(true);
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

  // Compute matching available properties for a buyer
  const getBuyerMatchCount = (buyer: BuyerItem) => {
    if (properties.length === 0) return 0;
    return properties.filter((p) => {
      if (p.status !== 'available') return false;
      const pLoc = (p.locality || '').toLowerCase();
      const hasLocMatch = buyer.localities?.some((loc) => {
        const l = typeof loc === 'string' ? loc.toLowerCase() : loc.display.toLowerCase();
        return pLoc.includes(l) || l.includes(pLoc);
      });
      const hasTypeMatch = buyer.types?.some((t) => t.toLowerCase() === (p.type || '').toLowerCase());
      return hasLocMatch || hasTypeMatch;
    }).length;
  };

  // Supported urgency filter chips mapping strictly to backend urgency: 'all' | 'hot' | 'warm' | 'cold'
  const urgencyChips: Array<{ label: string; value: 'all' | 'hot' | 'warm' | 'cold' }> = [
    { label: 'All', value: 'all' },
    { label: 'Immediate', value: 'hot' },
    { label: 'This month', value: 'warm' },
    { label: 'Flexible', value: 'cold' },
  ];

  const sortLabels: Record<SortOption, string> = {
    newest: 'Newest ▾',
    urgency: 'Urgency: Highest ▾',
    budget_desc: 'Budget: High to Low ▾',
    budget_asc: 'Budget: Low to High ▾',
  };

  // Active advanced filters counter
  const activeAdvancedFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedType !== 'all') count++;
    if (minBudget || maxBudget) count++;
    if (selectedLocality) count++;
    if (selectedStatus !== 'all') count++;
    return count;
  }, [selectedType, minBudget, maxBudget, selectedLocality, selectedStatus]);

  // Open modal & sync draft state
  const handleOpenFilterModal = () => {
    setDraftType(selectedType);
    setDraftMinBudget(minBudget);
    setDraftMaxBudget(maxBudget);
    setDraftLocality(selectedLocality);
    setDraftStatus(selectedStatus);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setSelectedType(draftType);
    setMinBudget(draftMinBudget);
    setMaxBudget(draftMaxBudget);
    setSelectedLocality(draftLocality);
    setSelectedStatus(draftStatus);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setDraftType('all');
    setDraftMinBudget('');
    setDraftMaxBudget('');
    setDraftLocality('');
    setDraftStatus('all');
    setSelectedType('all');
    setMinBudget('');
    setMaxBudget('');
    setSelectedLocality('');
    setSelectedStatus('all');
    setIsFilterModalOpen(false);
  };

  // Toggle phone masking
  const togglePhoneReveal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedPhones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Format masked phone
  const getMaskedPhone = (phone?: string) => {
    if (!phone) return '—';
    const clean = phone.trim();
    if (clean.length <= 5) return '•••••';
    const prefix = clean.slice(0, 5);
    return `${prefix} •••••`;
  };

  // Client-side filtering and sorting
  const processedBuyers = useMemo(() => {
    const filtered = buyers.filter((b) => {
      // 1. Urgency Chip Filter (All, Immediate, This month, Flexible)
      if (filterUrgency === 'hot' && b.urgency !== 'hot') return false;
      if (filterUrgency === 'warm' && b.urgency !== 'warm') return false;
      if (filterUrgency === 'cold' && b.urgency !== 'cold') return false;

      // 2. Search Query (Name, locality, phone, type, notes)
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

      // 3. Advanced Modal Filters: Property Type
      if (selectedType !== 'all') {
        const matchesType = (b.types || []).some((t) => t.toLowerCase().includes(selectedType.toLowerCase()));
        if (!matchesType) return false;
      }

      // 4. Advanced Modal Filters: Budget Range (in Lakhs)
      if (minBudget) {
        const minPaise = parseFloat(minBudget) * 100000 * 100;
        if ((b.budget?.maxPaise || 0) < minPaise) return false;
      }
      if (maxBudget) {
        const maxPaise = parseFloat(maxBudget) * 100000 * 100;
        if ((b.budget?.minPaise || b.budget?.maxPaise || 0) > maxPaise) return false;
      }

      // 5. Advanced Modal Filters: Locality
      if (selectedLocality.trim()) {
        const locQ = selectedLocality.toLowerCase().trim();
        const matchesLocality = (b.localities || []).some((loc) =>
          typeof loc === 'string' ? loc.toLowerCase().includes(locQ) : loc.display?.toLowerCase().includes(locQ)
        );
        if (!matchesLocality) return false;
      }

      // 6. Advanced Modal Filters: Status
      if (selectedStatus !== 'all' && b.status !== selectedStatus) {
        return false;
      }

      return true;
    });

    // Sort order
    return filtered.sort((a, b) => {
      if (sortBy === 'urgency') {
        const urgencyWeight = { hot: 3, warm: 2, cold: 1 };
        const wA = urgencyWeight[a.urgency || 'warm'] || 2;
        const wB = urgencyWeight[b.urgency || 'warm'] || 2;
        if (wB !== wA) return wB - wA;
      }
      if (sortBy === 'budget_desc') {
        return (b.budget?.maxPaise || 0) - (a.budget?.maxPaise || 0);
      }
      if (sortBy === 'budget_asc') {
        return (a.budget?.maxPaise || 0) - (b.budget?.maxPaise || 0);
      }
      // Default: newest first
      const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return dateB - dateA;
    });
  }, [
    buyers,
    filterUrgency,
    searchQuery,
    selectedType,
    minBudget,
    maxBudget,
    selectedLocality,
    selectedStatus,
    sortBy,
  ]);

  const inquirySortLabels: Record<InquirySortOption, string> = {
    newest: 'Newest ▾',
    urgency: 'Urgency ▾',
    budget_desc: 'Budget: High to Low ▾',
    budget_asc: 'Budget: Low to High ▾',
  };

  // Unified broker-facing inquiries (flyer inquiries + Quick Chat captured buyer inquiries; Landing Page Leads live in Admin only)
  const unifiedInquiries = useMemo<UnifiedInquiryRow[]>(() => {
    const rows: UnifiedInquiryRow[] = [];

    flyerInquiries.forEach((inq) => {
      const id = `flyer_${inq._id}`;
      const baseStatus: 'new' | 'contacted' | 'closed' =
        inq.status === 'archived'
          ? 'closed'
          : inq.status === 'contacted'
          ? 'contacted'
          : 'new';
      const demandPaise = inq.propertyId?.priceDemandPaise || 0;
      rows.push({
        id,
        source: 'flyer',
        clientName: inq.name || 'Inbound Client',
        clientPhone: inq.phoneE164 || inq.phone || '',
        requirement: inq.propertyId?.title || 'Shared Property Listing',
        budgetPaise: demandPaise,
        budgetLabel: demandPaise > 0 ? formatRupees(demandPaise) : 'On request',
        locality: inq.propertyId?.locality || 'Panipat',
        receivedAt: inq.createdAt || new Date().toISOString(),
        urgency: 'hot',
        status: inquiryStatusOverrides[id] || baseStatus,
        message: inq.message,
        propertyId: inq.propertyId?._id,
      });
    });

    buyers
      .filter((b) => b.source === 'paste' || b.source === 'lead_form')
      .forEach((b) => {
        const id = `buyer_${b._id}`;
        const baseStatus: 'new' | 'contacted' | 'closed' =
          b.status === 'closed'
            ? 'closed'
            : b.status === 'paused'
            ? 'contacted'
            : 'new';
        const maxPaise = b.budget?.maxPaise || 0;
        const budgetPrefix = b.budget?.isApproximate ? '~' : '';
        const budgetLabel = b.budget?.minPaise
          ? `${budgetPrefix}${formatRupees(b.budget.minPaise)} — ${formatRupees(maxPaise)}`
          : maxPaise > 0
          ? `Up to ${formatRupees(maxPaise)}`
          : 'Flexible';
        const locText =
          (b.localities || [])
            .map((l) => (typeof l === 'string' ? l : l.display))
            .join(', ') || (b.anyLocality ? 'Any Locality' : 'Panipat');

        rows.push({
          id,
          source: b.source === 'lead_form' ? 'lead_form' : 'quick_chat',
          clientName: b.name,
          clientPhone: b.phone || '',
          requirement: (b.types || []).join(', ') || 'Property Requirement',
          budgetPaise: maxPaise,
          budgetLabel,
          locality: locText,
          receivedAt: b.createdAt || b.updatedAt || new Date().toISOString(),
          urgency: b.urgency || 'warm',
          status: inquiryStatusOverrides[id] || baseStatus,
          message: b.notes,
          buyerId: b._id,
        });
      });

    return rows;
  }, [flyerInquiries, buyers, inquiryStatusOverrides]);

  const processedInquiries = useMemo(() => {
    const filtered = unifiedInquiries.filter((item) => {
      if (inquiryStatusFilter !== 'all' && item.status !== inquiryStatusFilter) {
        return false;
      }
      if (inquirySearch.trim()) {
        const q = inquirySearch.toLowerCase().trim();
        const matches =
          item.clientName.toLowerCase().includes(q) ||
          item.requirement.toLowerCase().includes(q) ||
          item.locality.toLowerCase().includes(q) ||
          item.clientPhone.includes(q);
        if (!matches) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (inquirySortBy === 'urgency') {
        const w = { hot: 3, warm: 2, cold: 1 };
        if (w[b.urgency] !== w[a.urgency]) return w[b.urgency] - w[a.urgency];
      }
      if (inquirySortBy === 'budget_desc') {
        return b.budgetPaise - a.budgetPaise;
      }
      if (inquirySortBy === 'budget_asc') {
        return a.budgetPaise - b.budgetPaise;
      }
      return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
    });
  }, [unifiedInquiries, inquiryStatusFilter, inquirySearch, inquirySortBy]);

  const handleMarkInquiryStatus = async (
    row: UnifiedInquiryRow,
    nextStatus: 'new' | 'contacted' | 'closed'
  ) => {
    setInquiryStatusOverrides((prev) => ({ ...prev, [row.id]: nextStatus }));
    if (row.buyerId) {
      const buyerStatus: 'active' | 'paused' | 'closed' =
        nextStatus === 'closed' ? 'closed' : nextStatus === 'contacted' ? 'paused' : 'active';
      try {
        await updateBuyer(row.buyerId, { status: buyerStatus });
        setBuyers((prev) =>
          prev.map((b) => (b._id === row.buyerId ? { ...b, status: buyerStatus } : b))
        );
      } catch {
        // Keep optimistic state override
      }
    }
    toast(`Inquiry marked as ${nextStatus}`, 'success');
  };

  const handleOpenInquiry = (row: UnifiedInquiryRow) => {
    if (row.buyerId) {
      navigate(`/app/buyers/${row.buyerId}`);
    } else {
      setSelectedInquiry(row);
    }
  };

  const handleExportInquiriesCsv = () => {
    if (processedInquiries.length === 0) {
      toast('No inquiries to export', 'info');
      return;
    }
    const headers = ['Client', 'Phone', 'Source', 'Requirement', 'Budget', 'Locality', 'Received Date', 'Status'];
    const csvRows = processedInquiries.map((r) =>
      [
        r.clientName,
        r.clientPhone,
        r.source === 'flyer' ? 'Flyer' : r.source === 'lead_form' ? 'Share Form' : 'Quick Chat',
        r.requirement,
        r.budgetLabel,
        r.locality,
        new Date(r.receivedAt).toLocaleDateString('en-IN'),
        r.status,
      ]
        .map((val) => `"${String(val || '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leadnivash-inquiries-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast(`Exported ${processedInquiries.length} inquiries to CSV`, 'success');
  };

  return (
    <div className="space-y-5 pb-12 max-w-[1200px] mx-auto text-left">
      {/* ── 1. TOP HEADER SECTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-ink-900 to-brand-700 bg-clip-text text-transparent leading-tight">
              Buyers
            </h1>
            {!isLoading && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-lime bg-ink-black tabular-nums">
                {activeTab === 'inquiries' ? unifiedInquiries.length : buyers.length}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-ink-700 mt-0.5 truncate">
            Active client requirements and purchase inquiries
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0 self-start sm:self-auto">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setIsShareFormOpen(true)}
            className="gap-1.5 font-semibold text-xs sm:text-sm"
          >
            <Share2 className="w-4 h-4 text-brand-600" />
            <span>Share Form</span>
          </Button>

          <Link to="/app/buyers/new" className="shrink-0">
            <Button
              variant="primary"
              size="md"
              className="mobile-shine-primary gap-1.5 shadow-sm font-semibold text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add buyer</span>
            </Button>
          </Link>
        </div>
      </div>

      <ShareLeadFormModal
        isOpen={isShareFormOpen}
        onClose={() => setIsShareFormOpen(false)}
        context="buyers"
      />

      {/* ── 1B. SEGMENTED TABS: All buyers | Inquiries ── */}
      <div className="inline-flex items-center p-1 bg-[#E9EDF1] rounded-xl border border-line">
        <button
          type="button"
          onClick={() => handleTabChange('buyers')}
          className={clsx(
            'px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer inline-flex items-center gap-2',
            activeTab === 'buyers'
              ? 'bg-ink-black text-white shadow-xs'
              : 'text-ink-700 hover:text-ink-900'
          )}
        >
          <span>All buyers</span>
          <span
            className={clsx(
              'text-[11px] px-1.5 py-0.5 rounded-full leading-none font-bold tabular-nums',
              activeTab === 'buyers' ? 'bg-lime text-ink-black' : 'bg-white text-ink-700'
            )}
          >
            {buyers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('inquiries')}
          className={clsx(
            'px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer inline-flex items-center gap-2',
            activeTab === 'inquiries'
              ? 'bg-ink-black text-white shadow-xs'
              : 'text-ink-700 hover:text-ink-900'
          )}
        >
          <span>Inquiries</span>
          <span
            className={clsx(
              'text-[11px] px-1.5 py-0.5 rounded-full leading-none font-bold tabular-nums',
              activeTab === 'inquiries' ? 'bg-lime text-ink-black' : 'bg-white text-ink-700'
            )}
          >
            {unifiedInquiries.length}
          </span>
        </button>
      </div>

      {activeTab === 'buyers' ? (
        <>
          {/* ── 2. CONTROLS ROW: Search Bar (~360px) + Urgency Chips + Filters Button + Sort Dropdown ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left Section: Search + Urgency Chips + Filters Modal Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0 flex-wrap">
          {/* Search bar (~360px) */}
          <div className="relative w-full sm:w-[360px] shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by buyer, locality or requirement"
              className="w-full pl-10 pr-9 h-11 bg-white border border-border rounded-input text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Chips: All, Immediate, This month, Flexible */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {urgencyChips.map((f) => {
              const isSelected = filterUrgency === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilterUrgency(f.value)}
                  className={clsx(
                    'px-3.5 h-11 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 border inline-flex items-center gap-1.5',
                    isSelected
                      ? 'bg-lime text-ink-900 border-lime shadow-2xs font-bold'
                      : 'bg-white text-ink-700 border-line hover:bg-slate-50 hover:text-ink-900'
                  )}
                >
                  <span>{f.label}</span>
                  {f.value !== 'all' && (
                    <span
                      className={clsx(
                        'text-[11px] px-1.5 py-0.5 rounded-full leading-none font-bold',
                        isSelected ? 'bg-white/80 text-ink-900' : 'bg-slate-100 text-ink-500'
                      )}
                    >
                      {buyers.filter((b) => b.urgency === f.value).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filters Modal Button */}
          <Button
            variant="secondary"
            size="md"
            onClick={handleOpenFilterModal}
            className="gap-1.5 h-11 text-xs sm:text-sm font-semibold shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span>Filters</span>
            {activeAdvancedFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center">
                {activeAdvancedFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Right Section: Sort Dropdown ("Newest ▾") */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-between gap-2 px-3.5 h-11 rounded-input border border-border bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs shrink-0 self-start lg:self-auto"
            >
              <span>{sortLabels[sortBy].replace(' ▾', '')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[190px] bg-white border border-border p-1 rounded-[14px] shadow-xl animate-in fade-in zoom-in-95 duration-150"
              sideOffset={6}
              align="end"
            >
              {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                <DropdownMenu.Item
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={clsx(
                    'flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer outline-none transition-colors',
                    sortBy === key
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <span>{sortLabels[key].replace(' ▾', '')}</span>
                  {sortBy === key && <Check className="w-3.5 h-3.5 text-brand-600" />}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* ── 3. LOADING SKELETONS & ERROR STATES ── */}
      {fetchError ? (
        <ErrorState onRetry={() => loadData(false)} message={fetchError} />
      ) : isLoading ? (
        <div className="card-grid-desktop gap-5">
          <BuyerCardSkeleton />
          <BuyerCardSkeleton />
          <BuyerCardSkeleton />
          <BuyerCardSkeleton />
          <BuyerCardSkeleton />
          <BuyerCardSkeleton />
        </div>
      ) : buyers.length === 0 ? (
        /* Empty State with Grey Icon (not blue) */
        <Card className="p-8 sm:p-12 text-center space-y-4 rounded-2xl bg-white border border-border shadow-card">
          <div className="w-12 h-12 rounded-[14px] bg-slate-100 text-slate-500 flex items-center justify-center mx-auto shadow-2xs">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              No inquiries to show
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              New buyer requirements will appear here when you add them or capture them through Quick Chat.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link to="/app/buyers/new" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto font-semibold gap-1.5 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Buyer Inquiry</span>
              </Button>
            </Link>
            <Link to="/app/paste" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="md"
                className="w-full sm:w-auto font-semibold gap-1.5 min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Open Quick Chat</span>
              </Button>
            </Link>
          </div>
        </Card>
      ) : processedBuyers.length === 0 ? (
        /* Filtered Empty State with Grey Icon */
        <Card className="p-8 text-center space-y-3 rounded-2xl bg-white border border-border shadow-card">
          <div className="w-11 h-11 rounded-[14px] bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-slate-900">
              No matching inquiries
            </h3>
            <p className="text-xs text-slate-500">
              {searchQuery
                ? `No inquiries matched "${searchQuery}". Try a different name, locality or clear filters.`
                : 'No buyer requirements found for the selected filter.'}
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterUrgency('all');
                setSortBy('newest');
                handleResetFilters();
              }}
              className="font-semibold text-xs"
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        /* ── 4. RESPONSIVE BUYER CARDS GRID (2 or 3 columns) ── */
        <div className="card-grid-desktop gap-5">
          {processedBuyers.map((buyer) => {
            const localityList = buyer.localities || [];
            const localityText = localityList.length > 0
              ? localityList.map((l) => (typeof l === 'string' ? l : l.display)).join(', ')
              : buyer.anyLocality
              ? 'Any Locality'
              : 'Panipat';

            const hasSize = buyer.sizeGaj && (buyer.sizeGaj.min || buyer.sizeGaj.max);
            const sizeText = hasSize
              ? `${buyer.sizeGaj?.min ? `${buyer.sizeGaj.min}` : 'Min'} - ${buyer.sizeGaj?.max ? `${buyer.sizeGaj.max}` : 'Max'} Gaj`
              : null;

            const budgetText = buyer.budget?.minPaise
              ? `${formatRupees(buyer.budget.minPaise)} — ${formatRupees(buyer.budget.maxPaise)}`
              : `Up to ${formatRupees(buyer.budget?.maxPaise || 0)}`;

            const cleanPhone = (buyer.phone || '').replace(/[^0-9]/g, '');
            const clientFirstName = (buyer.name || 'Client').split(' ')[0];
            const requirementTypes = (buyer.types || []).join(', ') || 'Property';

            const followUpMessage = `Namaste ${clientFirstName} ji, aapki ${requirementTypes} requirement (Budget: ${budgetText}) ke baare mein follow-up karna tha. Mere paas matching properties available hain. Kab baat kar sakte hain?`;
            const followUpUrl = cleanPhone
              ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(followUpMessage)}`
              : undefined;

            const initials = (buyer.name || 'B')
              .split(' ')
              .filter(Boolean)
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            const isPhoneRevealed = revealedPhones.has(buyer._id);
            const matchCount = getBuyerMatchCount(buyer);

            return (
              <div
                key={buyer._id}
                onClick={() => navigate(`/app/buyers/${buyer._id}`)}
                className="rounded-[14px] border border-line bg-white p-5 flex flex-col justify-between transition-all duration-150 hover:-translate-y-[1.5px] lg:hover:border-lime hover:shadow-md group relative cursor-pointer text-left space-y-4"
              >
                {/* Top Row: Avatar + Name + Urgency StatusChip */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand-200 text-brand-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-ink-900 truncate group-hover:text-brand-700 transition-colors leading-tight flex items-center gap-1.5">
                        <span className="truncate">{buyer.name}</span>
                        {buyer.source === 'lead_form' && (
                          <span className="px-1.5 py-0.5 rounded bg-lime-soft text-brand-700 border border-brand-600/20 text-[10px] font-bold shrink-0">
                            Client Form
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span>{isPhoneRevealed ? buyer.phone : getMaskedPhone(buyer.phone)}</span>
                        <button
                          type="button"
                          onClick={(e) => togglePhoneReveal(buyer._id, e)}
                          className="text-[11px] font-semibold text-brand-700 hover:underline inline-flex items-center gap-1 ml-1 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          {isPhoneRevealed ? <EyeOff className="w-3 h-3 shrink-0" /> : <Eye className="w-3 h-3 shrink-0" />}
                          <span>{isPhoneRevealed ? 'Hide' : 'Show number'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Urgency StatusChip */}
                  <div className="shrink-0">
                    <StatusChip
                      variant={
                        buyer.urgency === 'hot'
                          ? 'available'
                          : buyer.urgency === 'warm'
                          ? 'neutral'
                          : 'neutral'
                      }
                      dot
                      className="whitespace-nowrap shadow-2xs"
                    >
                      {buyer.urgency === 'hot'
                        ? 'Immediate'
                        : buyer.urgency === 'warm'
                        ? 'This month'
                        : 'Flexible'}
                    </StatusChip>
                  </div>
                </div>

                {/* Middle: Requirement Summary + Budget (bold, tabular) */}
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(buyer.types || ['Any Type']).map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{localityText}</span>
                    </div>

                    {sizeText && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Maximize2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Plot / Built: <strong className="text-slate-800 font-semibold">{sizeText}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Budget (Bold, Tabular numbers) */}
                  <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-100 flex items-baseline justify-between gap-2 mt-auto">
                    <div>
                      <span className="text-[11px] font-medium text-slate-400 block">
                        {buyer.budget?.isApproximate ? 'Approx. budget' : 'Target budget'}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums leading-tight">
                        {budgetText}
                      </span>
                    </div>
                    {buyer.purpose && (
                      <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        For {buyer.purpose}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Row: Match Count + "Last contact" Left; Call / WhatsApp / ⋯ Right below 1px divider */}
                <div className="border-t border-border pt-3.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="truncate">
                        {matchCount > 0 ? `${matchCount} propert${matchCount === 1 ? 'y' : 'ies'} match` : '0 matches'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                      Last contact: {formatLastUpdated(buyer.updatedAt || buyer.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Call button */}
                    {buyer.phone && (
                      <a
                        href={`tel:${buyer.phone}`}
                        className="p-1.5 rounded-lg border border-border text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        title="Direct Call"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}

                    {/* WhatsApp button */}
                    {followUpUrl && (
                      <a
                        href={followUpUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-border text-slate-600 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                        title="Pitch on WhatsApp"
                      >
                        <Send className="w-4 h-4" />
                      </a>
                    )}

                    {/* ⋯ Menu */}
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg border border-border text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                          title="More actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="z-50 min-w-[170px] bg-white border border-border p-1.5 rounded-[14px] shadow-xl animate-in fade-in zoom-in-95 duration-150"
                          sideOffset={5}
                          align="end"
                        >
                          <DropdownMenu.Item
                            onClick={() => navigate(`/app/buyers/${buyer._id}`)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer outline-none"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>View details</span>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            onClick={() => navigate(`/app/buyers/${buyer._id}/edit`)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer outline-none"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Edit requirement</span>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            onClick={() =>
                              navigate('/app/paste', {
                                state: {
                                  prefill: `Deal for ${buyer.name}: ${buyer.types?.join(', ')} requirement in ${localityText} with budget ${budgetText}`,
                                },
                              })
                            }
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer outline-none"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                            <span>Create deal</span>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            onClick={() => handleUpdateStatus(buyer, 'closed')}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer outline-none"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Mark closed</span>
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="h-px bg-border my-1" />
                          <DropdownMenu.Item
                            onClick={() => setBuyerToDelete({ id: buyer._id, name: buyer.name })}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 rounded-lg hover:bg-red-50 cursor-pointer outline-none"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Delete buyer</span>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      ) : (
        /* ── INQUIRIES SUB-VIEW INSIDE BUYERS ── */
        <div className="space-y-5">
          {/* Toolbar: Search (~360px) + Status Chips + Sort (Newest, Urgency, Budget) + Small CSV Icon Button */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0 flex-wrap">
              <div className="relative w-full sm:w-[360px] shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  placeholder="Search inquiries by client, requirement or locality"
                  className="w-full pl-10 pr-9 h-11 bg-white border border-border rounded-input text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all shadow-2xs"
                />
                {inquirySearch && (
                  <button
                    type="button"
                    onClick={() => setInquirySearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                {(
                  [
                    { label: 'All', value: 'all' },
                    { label: 'New', value: 'new' },
                    { label: 'Contacted', value: 'contacted' },
                    { label: 'Closed', value: 'closed' },
                  ] as const
                ).map((chip) => {
                  const isSelected = inquiryStatusFilter === chip.value;
                  const count =
                    chip.value === 'all'
                      ? unifiedInquiries.length
                      : unifiedInquiries.filter((i) => i.status === chip.value).length;
                  return (
                    <button
                      key={chip.value}
                      type="button"
                      onClick={() => setInquiryStatusFilter(chip.value)}
                      className={clsx(
                        'px-3.5 h-11 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 border inline-flex items-center gap-1.5',
                        isSelected
                          ? 'bg-lime text-ink-900 border-lime shadow-2xs font-bold'
                          : 'bg-white text-ink-700 border-line hover:bg-slate-50 hover:text-ink-900'
                      )}
                    >
                      <span>{chip.label}</span>
                      {chip.value !== 'all' && (
                        <span
                          className={clsx(
                            'text-[11px] px-1.5 py-0.5 rounded-full leading-none font-bold',
                            isSelected ? 'bg-white/80 text-ink-900' : 'bg-slate-100 text-ink-500'
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Toolbar: Sort Dropdown + Small CSV Export Icon Button */}
            <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-between gap-2 px-3.5 h-11 rounded-input border border-border bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
                  >
                    <span>{inquirySortLabels[inquirySortBy].replace(' ▾', '')}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="z-50 min-w-[190px] bg-white border border-border p-1 rounded-[14px] shadow-xl animate-in fade-in zoom-in-95 duration-150"
                    sideOffset={6}
                    align="end"
                  >
                    {(Object.keys(inquirySortLabels) as InquirySortOption[]).map((key) => (
                      <DropdownMenu.Item
                        key={key}
                        onClick={() => setInquirySortBy(key)}
                        className={clsx(
                          'flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer outline-none transition-colors',
                          inquirySortBy === key
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-slate-700 hover:bg-slate-100'
                        )}
                      >
                        <span>{inquirySortLabels[key].replace(' ▾', '')}</span>
                        {inquirySortBy === key && <Check className="w-3.5 h-3.5 text-brand-600" />}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              <Tooltip content="Export CSV">
                <button
                  type="button"
                  onClick={handleExportInquiriesCsv}
                  aria-label="Export inquiries CSV"
                  className="w-11 h-11 rounded-input border border-border bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-2xs cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Inquiries Table / Empty State */}
          {fetchError ? (
            <ErrorState onRetry={() => loadData(false)} message={fetchError} />
          ) : isLoading ? (
            <Card className="p-6 space-y-3">
              <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-12 bg-slate-50 rounded-lg animate-pulse" />
              <div className="h-12 bg-slate-50 rounded-lg animate-pulse" />
            </Card>
          ) : unifiedInquiries.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center space-y-4 rounded-[14px] bg-white border border-border">
              <div className="w-12 h-12 rounded-[14px] bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  No inquiries to show
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  New buyer requirements will appear here when you add them or capture them through Quick Chat.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <Link to="/app/buyers/new" className="w-full sm:w-auto">
                  <Button variant="primary" size="md" className="w-full sm:w-auto gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Add buyer</span>
                  </Button>
                </Link>
                <Link to="/app/paste" className="w-full sm:w-auto">
                  <Button variant="secondary" size="md" className="w-full sm:w-auto gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <span>Open Quick Chat</span>
                  </Button>
                </Link>
              </div>
            </Card>
          ) : processedInquiries.length === 0 ? (
            <Card className="p-8 text-center space-y-3 rounded-[14px] bg-white border border-border">
              <div className="w-11 h-11 rounded-[14px] bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-bold text-slate-900">
                  No matching inquiries
                </h3>
                <p className="text-xs text-slate-500">
                  {inquirySearch
                    ? `No inquiries matched "${inquirySearch}".`
                    : 'No inquiries found for the selected status filter.'}
                </p>
              </div>
              <div className="pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setInquirySearch('');
                    setInquiryStatusFilter('all');
                    setInquirySortBy('newest');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-0 overflow-hidden rounded-[14px] border border-border bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent cursor-default">
                    <TableHead>Buyer / Client</TableHead>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Locality</TableHead>
                    <TableHead>Received date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedInquiries.map((row) => {
                    const rowInitials = (row.clientName || 'I')
                      .split(' ')
                      .filter(Boolean)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();
                    const cleanDigits = (row.clientPhone || '').replace(/[^0-9]/g, '');
                    const whatsappHref = cleanDigits
                      ? `https://wa.me/${cleanDigits}?text=${encodeURIComponent(
                          `Namaste ${row.clientName} ji, following up regarding your requirement (${row.requirement}) in ${row.locality}.`
                        )}`
                      : undefined;

                    return (
                      <TableRow
                        key={row.id}
                        onClick={() => handleOpenInquiry(row)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2.5 min-w-[160px]">
                            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {rowInitials}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 block truncate">
                                {row.clientName}
                              </span>
                              <span className="text-xs text-slate-500 block truncate">
                                {getMaskedPhone(row.clientPhone)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[160px] max-w-[240px]">
                            <span className="font-medium text-slate-900 block truncate">
                              {row.requirement}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {row.source === 'flyer'
                                ? 'Flyer inquiry'
                                : row.source === 'lead_form'
                                ? 'Client Share Form'
                                : 'Quick Chat'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                          {row.budgetLabel}
                        </TableCell>
                        <TableCell className="text-slate-600 max-w-[160px] truncate">
                          {row.locality}
                        </TableCell>
                        <TableCell className="text-slate-500 whitespace-nowrap text-xs">
                          {formatLastUpdated(row.receivedAt)}
                        </TableCell>
                        <TableCell>
                          {row.status === 'new' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-meta font-semibold bg-ink-black text-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-lime shrink-0" />
                              New
                            </span>
                          ) : (
                            <StatusChip
                              variant={row.status === 'contacted' ? 'hold' : 'neutral'}
                              dot
                            >
                              {row.status === 'contacted' ? 'Contacted' : 'Closed'}
                            </StatusChip>
                          )}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button
                                type="button"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                                aria-label="Inquiry row actions"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content
                                className="z-50 min-w-[180px] bg-white border border-border p-1.5 rounded-[14px] shadow-xl animate-in fade-in zoom-in-95 duration-150"
                                sideOffset={5}
                                align="end"
                              >
                                <DropdownMenu.Item
                                  onClick={() => handleOpenInquiry(row)}
                                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer outline-none"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Open</span>
                                </DropdownMenu.Item>

                                {whatsappHref && (
                                  <DropdownMenu.Item asChild>
                                    <a
                                      href={whatsappHref}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand-700 rounded-lg hover:bg-brand-50 cursor-pointer outline-none"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5 text-brand-600" />
                                      <span>Follow up</span>
                                    </a>
                                  </DropdownMenu.Item>
                                )}

                                <DropdownMenu.Separator className="h-px bg-border my-1" />
                                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400">
                                  Mark status
                                </div>
                                {(['new', 'contacted', 'closed'] as const).map((st) => (
                                  <DropdownMenu.Item
                                    key={st}
                                    onClick={() => handleMarkInquiryStatus(row, st)}
                                    className="flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer outline-none capitalize"
                                  >
                                    <span>{st}</span>
                                    {row.status === st && (
                                      <Check className="w-3.5 h-3.5 text-brand-600" />
                                    )}
                                  </DropdownMenu.Item>
                                ))}
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}

      {/* ── FLYER INQUIRY DETAIL MODAL ── */}
      <Modal
        open={Boolean(selectedInquiry)}
        onOpenChange={(open) => {
          if (!open) setSelectedInquiry(null);
        }}
        title={selectedInquiry?.clientName || 'Inquiry Details'}
        description={
          selectedInquiry
            ? `${selectedInquiry.locality} · Received ${formatLastUpdated(selectedInquiry.receivedAt)}`
            : undefined
        }
        footerActions={
          selectedInquiry && (
            <>
              {selectedInquiry.clientPhone && (
                <a
                  href={`tel:${selectedInquiry.clientPhone}`}
                  className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-lg border border-border text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              )}
              {selectedInquiry.clientPhone && (
                <a
                  href={`https://wa.me/${selectedInquiry.clientPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-cashfree-primary btn-shine-sweep inline-flex items-center gap-1.5 px-3.5 h-10 rounded-[11px] text-xs font-semibold text-white"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-lime" />
                  <span>Follow up</span>
                </a>
              )}
            </>
          )
        }
      >
        {selectedInquiry && (
          <div className="space-y-4 text-left">
            <div className="p-3.5 rounded-[12px] bg-slate-50 border border-border space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">Requirement</span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  {selectedInquiry.budgetLabel}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {selectedInquiry.requirement}
              </p>
              <p className="text-xs text-slate-500">
                Phone: {selectedInquiry.clientPhone || 'Not provided'}
              </p>
            </div>

            {selectedInquiry.message && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-600 block">Message</span>
                <div className="p-3 rounded-[12px] bg-white border border-border text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                  <span>"{selectedInquiry.message}"</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── 5. ADVANCED FILTERS MODAL (Type, Budget, Locality, Status) ── */}
      <Modal
        open={isFilterModalOpen}
        onOpenChange={setIsFilterModalOpen}
        title="Filter Buyers"
        description="Filter inquiries by property type, budget, locality, or status"
        footerActions={
          <>
            <Button
              variant="ghost"
              size="md"
              onClick={handleResetFilters}
              className="text-xs font-semibold"
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleApplyFilters}
              className="text-xs font-semibold"
            >
              Apply Filters
            </Button>
          </>
        }
      >
        <div className="space-y-4 pt-1 text-left">
          {/* Property Type */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Property Type Wanted
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'All Types', value: 'all' },
                { label: 'Floor', value: 'floor' },
                { label: 'Plot', value: 'plot' },
                { label: 'Villa', value: 'villa' },
                { label: 'Apartment', value: 'apartment' },
                { label: 'Commercial', value: 'commercial' },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setDraftType(t.value)}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border',
                    draftType === t.value
                      ? 'bg-brand-50 text-brand-700 border-brand-200'
                      : 'bg-white text-slate-600 border-border hover:bg-slate-50'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range (in Lakhs) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Budget Range (in ₹ Lakhs)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={draftMinBudget}
                onChange={(e) => setDraftMinBudget(e.target.value)}
                placeholder="Min Lakhs (e.g. 50)"
                className="h-10 px-3 bg-white border border-border rounded-input text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
              <input
                type="number"
                value={draftMaxBudget}
                onChange={(e) => setDraftMaxBudget(e.target.value)}
                placeholder="Max Lakhs (e.g. 150)"
                className="h-10 px-3 bg-white border border-border rounded-input text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>

          {/* Locality */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Locality / Sector
            </label>
            <input
              type="text"
              value={draftLocality}
              onChange={(e) => setDraftLocality(e.target.value)}
              placeholder="e.g. Sector 12, Model Town, Ansals"
              className="w-full h-10 px-3 bg-white border border-border rounded-input text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Status
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'All Statuses', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'On Hold', value: 'paused' },
                { label: 'Closed', value: 'closed' },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setDraftStatus(s.value)}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border',
                    draftStatus === s.value
                      ? 'bg-brand-50 text-brand-700 border-brand-200'
                      : 'bg-white text-slate-600 border-border hover:bg-slate-50'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

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
// 2. ADD & EDIT BUYER FORM PAGE
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
            <h2 className="text-xs font-semibold text-muted flex items-center gap-1.5">
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
            <h2 className="text-xs font-semibold text-muted flex items-center gap-1.5">
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
              <h2 className="text-xs font-semibold text-muted flex items-center gap-1.5">
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
              <h2 className="text-xs font-semibold text-muted flex items-center gap-1.5">
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
            <h2 className="text-xs font-semibold text-muted flex items-center gap-1.5">
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
            <h2 className="text-xs font-semibold text-muted flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              <span>6. Purchase Urgency & Timeline</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Immediate (7 Days)', value: 'hot' },
                { label: 'Within a Month', value: 'warm' },
                { label: 'Flexible', value: 'cold' },
              ].map((u) => (
                <button
                  key={u.value}
                  type="button"
                  onClick={() => setUrgency(u.value as any)}
                  className={clsx(
                    'flex-1 min-w-[110px] min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border text-center flex items-center justify-center whitespace-nowrap',
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
// 3. BUYER DETAIL & MATCH MATRIX PAGE
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

  const handleUpdateStatus = async (newStatus: 'active' | 'paused' | 'closed') => {
    if (!buyer) return;
    try {
      await updateBuyer(buyer._id, { status: newStatus });
      setBuyer((prev) => (prev ? { ...prev, status: newStatus } : null));
      success(`Inquiry marked as ${newStatus.toUpperCase()}`);
    } catch {
      error('Could not update inquiry status');
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
              className="btn-cashfree-primary btn-shine-sweep min-h-[40px] px-3.5 py-1.5 rounded-[11px] text-white font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <MessageCircle className="w-3.5 h-3.5 text-lime" />
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      </div>

      {/* ── Client Overview Card ── */}
      <Card className="p-4 sm:p-6 space-y-4 rounded-2xl bg-white border border-border shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-ink">
                {buyer.name}
              </h1>

              {/* Status Badge */}
              <span
                className={clsx(
                  'px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border',
                  buyer.status === 'closed'
                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                    : buyer.status === 'paused'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                )}
              >
                {buyer.status === 'closed' ? 'Closed' : buyer.status === 'paused' ? 'On Hold' : 'Active'}
              </span>

              {/* Urgency Badge */}
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
            <span className="text-xs font-medium text-muted block">Target Budget</span>
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
            <span className="text-xs font-medium text-muted block mb-1">Target Sectors</span>
            <span className="font-semibold text-ink">
              {buyer.localities && buyer.localities.length > 0
                ? buyer.localities.map((l) => (typeof l === 'string' ? l : l.display)).join(', ')
                : buyer.anyLocality
                ? 'Any Locality in Panipat'
                : 'Panipat'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-xs font-medium text-muted block mb-1">Property Types</span>
            <span className="font-semibold text-ink">
              {(buyer.types || []).join(', ') || 'Any Type'}
            </span>
          </div>
        </div>

        {/* Status Update Quick Toggles */}
        <div className="pt-2 flex items-center gap-2">
          <span className="text-xs text-muted font-medium">Status:</span>
          <button
            type="button"
            onClick={() => handleUpdateStatus('active')}
            className={clsx(
              'px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer',
              buyer.status === 'active' || !buyer.status
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white border-border text-slate-700 hover:bg-slate-50'
            )}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => handleUpdateStatus('paused')}
            className={clsx(
              'px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer',
              buyer.status === 'paused'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white border-border text-slate-700 hover:bg-slate-50'
            )}
          >
            On Hold
          </button>
          <button
            type="button"
            onClick={() => handleUpdateStatus('closed')}
            className={clsx(
              'px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer',
              buyer.status === 'closed'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white border-border text-slate-700 hover:bg-slate-50'
            )}
          >
            Closed
          </button>
        </div>

        {buyer.notes && (
          <div className="text-xs text-slate-700 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="font-semibold text-ink">Client Notes:</span> {buyer.notes}
          </div>
        )}
      </Card>

      {/* ── LIVE MATCHING INVENTORY SECTION ── */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-5 h-5 text-brand-600 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-ink leading-snug">
              Matching Properties{' '}
              <span className="whitespace-nowrap">({matches.length})</span>
            </h2>
          </div>
          <span className="text-xs text-muted font-medium pl-7 sm:pl-0">
            Ranked by budget & locality match
          </span>
        </div>

        {isLoadingMatches ? (
          <div className="p-8 text-center text-xs text-muted">
            Evaluating inventory matches...
          </div>
        ) : matches.length === 0 ? (
          <Card className="p-6 sm:p-8 flex flex-col items-center text-center gap-3 rounded-2xl bg-white border border-border shadow-card">
            <p className="text-xs sm:text-sm text-secondary text-muted max-w-sm">
              No matching properties currently in inventory within this budget & locality.
            </p>
            <Link to="/app/properties/new" className="inline-flex">
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
                        className="btn-cashfree-primary btn-shine-sweep min-h-[44px] px-4 py-2 rounded-[11px] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-lime" />
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
