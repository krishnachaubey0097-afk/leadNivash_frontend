import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  MessageCircle,
  MessageSquare,
  Building2,
  CheckCircle2,
  Eye,
  UserCheck,
  X,
  Users,
  Trash2,
  Sparkles,
  MapPin,
  Plus,
  Download,
  Search,
  Share2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { InquiryCardSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { apiClient } from '../../lib/api/client';
import { useAuth } from '../auth/AuthProvider';
import clsx from 'clsx';

interface PropertyInquiry {
  id: string;
  clientName: string;
  clientPhone: string;
  propertyTitle: string;
  locality: string;
  demand: string;
  date: string;
  message: string;
  status: 'new' | 'contacted' | 'converted';
}

interface BuyerInquiry {
  id: string;
  clientName: string;
  clientPhone: string;
  requirement: string;
  locality: string;
  budgetRange: string;
  urgency: 'Immediate' | 'Within Month' | 'Flexible';
  date: string;
  message: string;
  status: 'active' | 'contacted' | 'closed';
}

export const InquiriesPage: React.FC = () => {
  const { user } = useAuth();
  const { success, toast } = useToast();
  const agencyDisplayName = user?.agency?.name?.trim() || user?.name?.trim() || 'Verified Broker';

  // 2-tab segmented control: Flyer Inquiries | Buyer Requirements (Landing Page Leads live in Admin Console only)
  const [activeTab, setActiveTab] = useState<'property' | 'buyer'>('property');

  // Search & Status Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [selectedPropertyInquiry, setSelectedPropertyInquiry] = useState<PropertyInquiry | null>(null);
  const [selectedBuyerInquiry, setSelectedBuyerInquiry] = useState<BuyerInquiry | null>(null);

  // Property Inquiries (Inbound flyer leads fetched live from API)
  const [propertyInquiries, setPropertyInquiries] = useState<PropertyInquiry[]>([]);
  const [isLoadingPropertyInquiries, setIsLoadingPropertyInquiries] = useState(false);

  useEffect(() => {
    setIsLoadingPropertyInquiries(true);
    apiClient
      .get<any, any>('/inquiries')
      .then((res) => {
        const items = res?.items || (Array.isArray(res) ? res : []);
        if (Array.isArray(items)) {
          const mapped = items.map((inq: any) => ({
            id: inq._id || inq.id,
            clientName: inq.name || 'Inbound Lead',
            clientPhone: inq.phoneE164 || inq.phone || '',
            propertyTitle: inq.propertyId?.title || 'Shared Property Listing',
            locality: inq.propertyId?.locality || 'Panipat',
            demand: inq.propertyId?.priceDemandPaise
              ? '₹' + (inq.propertyId.priceDemandPaise / 10000000).toFixed(2) + ' Cr'
              : 'Available',
            date: inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'Recent',
            message: inq.message || 'Expressed interest via shared property flyer.',
            status: (inq.status || 'new') as 'new' | 'contacted' | 'converted',
          }));
          setPropertyInquiries(mapped);
        }
      })
      .catch((err) => console.warn('Could not load broker property inquiries:', err))
      .finally(() => setIsLoadingPropertyInquiries(false));
  }, []);

  // Buyer Inquiries (Inbound buyer requirements)
  const [buyerInquiries, setBuyerInquiries] = useState<BuyerInquiry[]>([]);

  const [inquiryToDelete, setInquiryToDelete] = useState<{ id: string; clientName: string; type: 'property' | 'buyer' } | null>(null);

  const confirmDeleteInquiry = () => {
    if (!inquiryToDelete) return;
    if (inquiryToDelete.type === 'property') {
      setPropertyInquiries((prev) => prev.filter((i) => i.id !== inquiryToDelete.id));
      success(`Property inquiry from "${inquiryToDelete.clientName}" removed`);
    } else {
      setBuyerInquiries((prev) => prev.filter((i) => i.id !== inquiryToDelete.id));
      success(`Buyer inquiry from "${inquiryToDelete.clientName}" removed`);
    }
    setInquiryToDelete(null);
  };

  const markPropertyStatus = (id: string, status: PropertyInquiry['status']) => {
    setPropertyInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    success(`Inquiry marked as ${status.toUpperCase()}`);
  };

  const markBuyerStatus = (id: string, status: BuyerInquiry['status']) => {
    setBuyerInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    success(`Buyer inquiry marked as ${status.toUpperCase()}`);
  };

  // Filtered lists
  const filteredPropertyInquiries = useMemo(() => {
    return propertyInquiries.filter((inq) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        inq.clientName.toLowerCase().includes(q) ||
        inq.propertyTitle.toLowerCase().includes(q) ||
        inq.locality.toLowerCase().includes(q) ||
        inq.clientPhone.includes(q);
      const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [propertyInquiries, searchQuery, statusFilter]);

  const filteredBuyerInquiries = useMemo(() => {
    return buyerInquiries.filter((inq) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        inq.clientName.toLowerCase().includes(q) ||
        inq.requirement.toLowerCase().includes(q) ||
        inq.locality.toLowerCase().includes(q) ||
        inq.clientPhone.includes(q);
      const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [buyerInquiries, searchQuery, statusFilter]);

  const handleExportCsv = () => {
    let rows: any[] = [];
    let filename = 'inquiries_export.csv';

    if (activeTab === 'property') {
      rows = propertyInquiries.map((p) => ({
        Type: 'Property Inquiry',
        ClientName: p.clientName,
        Phone: p.clientPhone,
        Property: p.propertyTitle,
        Locality: p.locality,
        Demand: p.demand,
        Status: p.status,
        Message: p.message,
        Date: p.date,
      }));
      filename = 'property_inquiries.csv';
    } else {
      rows = buyerInquiries.map((b) => ({
        Type: 'Buyer Inquiry',
        ClientName: b.clientName,
        Phone: b.clientPhone,
        Requirement: b.requirement,
        Locality: b.locality,
        BudgetRange: b.budgetRange,
        Urgency: b.urgency,
        Status: b.status,
        Message: b.message,
        Date: b.date,
      }));
      filename = 'buyer_inquiries.csv';
    }

    if (!rows.length) {
      toast('No records to export in this category', 'info');
      return;
    }

    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row) =>
          keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell = cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
              return cell;
            })
            .join(separator)
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success(`Exported ${rows.length} records to ${filename}`);
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-20 text-left px-3 sm:px-0">
      {/* ── 1. CLEAN TOP HEADER ── */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-black text-ink font-heading tracking-tight">
            Inquiries
          </h1>
          <p className="text-xs text-muted">
            Track and follow up on incoming leads from flyers and buyers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-3 py-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-ink text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer shrink-0 min-h-[40px]"
          title="Export records to CSV"
        >
          <Download className="w-3.5 h-3.5 text-ink-500" />
          <span className="hidden sm:inline">Export</span> CSV
        </button>
      </div>

      {/* ── 2. CLEAN 2-TAB SEGMENTED CONTROL ── */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-border/70 text-xs">
        <button
          type="button"
          onClick={() => {
            setActiveTab('property');
            setStatusFilter('all');
          }}
          className={clsx(
            'py-2 px-1 sm:px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]',
            activeTab === 'property'
              ? 'bg-lime text-ink-900 shadow-xs'
              : 'text-ink-700 hover:text-ink-900'
          )}
        >
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Flyers</span>
          <span
            className={clsx(
              'px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none shrink-0',
              activeTab === 'property'
                ? 'bg-white/80 text-ink-900'
                : 'bg-slate-200 dark:bg-slate-700 text-ink-700'
            )}
          >
            {propertyInquiries.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('buyer');
            setStatusFilter('all');
          }}
          className={clsx(
            'py-2 px-1 sm:px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]',
            activeTab === 'buyer'
              ? 'bg-lime text-ink-900 shadow-xs'
              : 'text-ink-700 hover:text-ink-900'
          )}
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Buyers</span>
          <span
            className={clsx(
              'px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none shrink-0',
              activeTab === 'buyer'
                ? 'bg-white/80 text-ink-900'
                : 'bg-slate-200 dark:bg-slate-700 text-ink-700'
            )}
          >
            {buyerInquiries.length}
          </span>
        </button>
      </div>

      {/* ── 3. FULL-WIDTH SEARCH BAR ── */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            activeTab === 'property'
              ? 'Search by client, property, or locality...'
              : 'Search by buyer name, locality, or requirement...'
          }
          className="w-full bg-surface border border-border rounded-xl pl-9 pr-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 font-sans"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── 4. STATUS FILTER CHIPS (HORIZONTAL SCROLLABLE WITHOUT SCROLLBAR) ── */}
      {activeTab === 'property' && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-xs">
          {[
            { id: 'all', label: 'All Inquiries' },
            { id: 'new', label: 'New / Pending' },
            { id: 'contacted', label: 'Contacted' },
            { id: 'converted', label: 'Converted' },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setStatusFilter(chip.id)}
              className={clsx(
                'px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer border text-xs',
                statusFilter === chip.id
                  ? 'bg-lime text-ink-900 border-lime'
                  : 'bg-surface border-border text-ink-700 hover:text-ink-900'
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* ── 5. TAB CONTENT ── */}

      {/* TAB 1: PROPERTY FLYER INQUIRIES */}
      {activeTab === 'property' && (
        <div className="space-y-3">
          {isLoadingPropertyInquiries ? (
            <div className="space-y-3">
              <InquiryCardSkeleton />
              <InquiryCardSkeleton />
            </div>
          ) : filteredPropertyInquiries.length === 0 ? (
            /* POLISHED EMPTY STATE */
            <Card className="p-8 sm:p-10 text-center space-y-4 rounded-2xl border-border bg-white dark:bg-slate-900 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-2xs">
                <Building2 className="w-6 h-6 stroke-[2]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-ink font-heading">
                  {searchQuery ? 'No matching flyer inquiries' : 'No flyer inquiries yet'}
                </h3>
                <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                  {searchQuery
                    ? 'No inquiries match your search filter. Try clearing your query.'
                    : 'When clients browse your shared property flyers and tap "Express Interest", their direct inquiries appear here in real-time.'}
                </p>
              </div>

              {!searchQuery && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1 max-w-xs mx-auto">
                  <Link
                    to="/app/properties"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs min-h-[42px]"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Property Flyers</span>
                  </Link>
                  <Link
                    to="/app/paste"
                    className="w-full py-2.5 px-4 rounded-xl bg-surface border border-border hover:bg-surface-hover text-ink font-semibold text-xs flex items-center justify-center gap-1.5 transition min-h-[42px]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Open Quick Chat</span>
                  </Link>
                </div>
              )}
            </Card>
          ) : (
            filteredPropertyInquiries.map((inq) => {
              const whatsappUrl = `https://wa.me/${inq.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Namaste ${inq.clientName} ji, maine aapki inquiry dekhi for ${inq.propertyTitle} in ${inq.locality}. Main ${agencyDisplayName} se baat kar raha hoon. Kab baat kar sakte hain?`
              )}`;

              return (
                <Card
                  key={inq.id}
                  className="p-4 sm:p-5 space-y-3.5 border-border bg-white dark:bg-slate-900 shadow-xs rounded-2xl hover:border-emerald-600/30 transition text-left"
                >
                  {/* Client Info Header */}
                  <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-border">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-sm flex items-center justify-center shrink-0 border border-emerald-500/20">
                        {inq.clientName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-ink font-heading truncate">
                          {inq.clientName}
                        </h3>
                        <span className="text-xs text-muted font-sans font-medium block">
                          {inq.clientPhone}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                          inq.status === 'new'
                            ? 'bg-ink-black text-white border border-ink-black'
                            : inq.status === 'contacted'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200'
                        )}
                      >
                        {inq.status === 'new' && <span className="w-1.5 h-1.5 rounded-full bg-lime shrink-0" />}
                        {inq.status}
                      </span>

                      <button
                        type="button"
                        onClick={() => setInquiryToDelete({ id: inq.id, clientName: inq.clientName, type: 'property' })}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Property Inquired Strip */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-border flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-ink text-xs sm:text-sm block truncate">
                        {inq.propertyTitle}
                      </span>
                      <span className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{inq.locality}</span>
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-muted block">Asking</span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400 font-sans">
                        {inq.demand}
                      </span>
                    </div>
                  </div>

                  {/* Client Note / Message */}
                  {inq.message && (
                    <div className="text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-xl bg-surface border border-border leading-relaxed flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="italic">"{inq.message}"</span>
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition min-h-[40px]"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${inq.clientPhone}`}
                        className="px-3 py-2 rounded-xl bg-surface border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-ink text-xs font-bold flex items-center gap-1.5 transition min-h-[40px]"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setSelectedPropertyInquiry(inq)}
                        className="px-3 py-2 rounded-xl bg-surface border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-muted hover:text-ink text-xs font-semibold flex items-center gap-1 transition min-h-[40px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {inq.status !== 'converted' && (
                        <button
                          type="button"
                          onClick={() => markPropertyStatus(inq.id, 'converted')}
                          className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline px-2 py-1 cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Convert to Buyer</span>
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: BUYER INQUIRIES */}
      {activeTab === 'buyer' && (
        <div className="space-y-3">
          {filteredBuyerInquiries.length === 0 ? (
            /* POLISHED EMPTY STATE */
            <Card className="p-8 sm:p-10 text-center space-y-4 rounded-2xl border-border bg-white dark:bg-slate-900 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-2xs">
                <Users className="w-6 h-6 stroke-[2]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-ink font-heading">
                  {searchQuery ? 'No matching buyer requirements' : 'No buyer inquiries yet'}
                </h3>
                <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                  {searchQuery
                    ? 'No buyer leads match your search query.'
                    : 'Add incoming buyer inquiries or paste WhatsApp client messages to discover matching properties.'}
                </p>
              </div>

              {!searchQuery && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1 max-w-xs mx-auto">
                  <Link
                    to="/app/buyers/new"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs min-h-[42px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Buyer Requirement</span>
                  </Link>
                  <Link
                    to="/app/paste"
                    className="w-full py-2.5 px-4 rounded-xl bg-surface border border-border hover:bg-surface-hover text-ink font-semibold text-xs flex items-center justify-center gap-1.5 transition min-h-[42px]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Open Quick Chat</span>
                  </Link>
                </div>
              )}
            </Card>
          ) : (
            filteredBuyerInquiries.map((bInq) => {
              const whatsappUrl = `https://wa.me/${bInq.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Namaste ${bInq.clientName} ji, humne aapka requirement dekha: ${bInq.requirement} in ${bInq.locality}. Verified options available hain. Kab baat kar sakte hain?`
              )}`;

              return (
                <Card
                  key={bInq.id}
                  className="p-4 sm:p-5 space-y-3.5 border-border bg-white dark:bg-slate-900 shadow-xs rounded-2xl hover:border-emerald-600/30 transition text-left"
                >
                  <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-border">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-bold text-sm flex items-center justify-center shrink-0 border border-blue-500/20">
                        {bInq.clientName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-ink font-heading truncate">
                          {bInq.clientName}
                        </h3>
                        <span className="text-xs text-muted font-sans font-medium block">
                          {bInq.clientPhone}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={clsx(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                          bInq.urgency === 'Immediate'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200'
                        )}
                      >
                        {bInq.urgency}
                      </span>

                      <button
                        type="button"
                        onClick={() => setInquiryToDelete({ id: bInq.id, clientName: bInq.clientName, type: 'buyer' })}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-border flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-ink text-xs sm:text-sm block truncate">
                        {bInq.requirement}
                      </span>
                      <span className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{bInq.locality}</span>
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-muted block">Budget</span>
                      <span className="font-black text-blue-700 dark:text-blue-400 font-sans">
                        {bInq.budgetRange}
                      </span>
                    </div>
                  </div>

                  {bInq.message && (
                    <div className="text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-xl bg-surface border border-border leading-relaxed flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="italic">"{bInq.message}"</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition min-h-[40px]"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${bInq.clientPhone}`}
                        className="px-3 py-2 rounded-xl bg-surface border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-ink text-xs font-bold flex items-center gap-1.5 transition min-h-[40px]"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setSelectedBuyerInquiry(bInq)}
                        className="px-3 py-2 rounded-xl bg-surface border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-muted hover:text-ink text-xs font-semibold flex items-center gap-1 transition min-h-[40px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </div>

                    <Link
                      to="/app/buyers"
                      className="text-xs font-bold text-brand-700 dark:text-brand-400 hover:underline px-2 py-1 flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Check Matches</span>
                    </Link>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ── PROPERTY INQUIRY DETAILS MODAL ── */}
      {selectedPropertyInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <Card className="w-full max-w-lg p-5 sm:p-6 space-y-4 bg-white dark:bg-slate-900 border border-border shadow-2xl rounded-2xl text-left relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                  {selectedPropertyInquiry.clientName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink font-heading">
                    {selectedPropertyInquiry.clientName}
                  </h3>
                  <span className="text-xs text-muted font-sans font-medium">{selectedPropertyInquiry.clientPhone}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPropertyInquiry(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-border space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Inquired Property
                </span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400 font-sans">{selectedPropertyInquiry.demand}</span>
              </div>
              <h4 className="font-bold text-ink text-sm">{selectedPropertyInquiry.propertyTitle}</h4>
              <p className="text-[11px] text-muted">{selectedPropertyInquiry.locality}</p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                Prospect Message
              </span>
              <div className="p-3 rounded-xl bg-surface border border-border text-ink leading-relaxed">
                "{selectedPropertyInquiry.message}"
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedPropertyInquiry.clientPhone}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 min-h-[40px]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <a
                  href={`https://wa.me/${selectedPropertyInquiry.clientPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 min-h-[40px]"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <Link
                to="/app/buyers/new"
                onClick={() => setSelectedPropertyInquiry(null)}
                className="px-3.5 py-2 rounded-xl border border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1 min-h-[40px]"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Save as Buyer</span>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* ── BUYER INQUIRY DETAILS MODAL ── */}
      {selectedBuyerInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <Card className="w-full max-w-lg p-5 sm:p-6 space-y-4 bg-white dark:bg-slate-900 border border-border shadow-2xl rounded-2xl text-left relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                  {selectedBuyerInquiry.clientName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink font-heading">
                    {selectedBuyerInquiry.clientName}
                  </h3>
                  <span className="text-xs text-muted font-sans font-medium">{selectedBuyerInquiry.clientPhone}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBuyerInquiry(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-border space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Target Requirement
                </span>
                <span className="font-extrabold text-blue-700 dark:text-blue-400 font-sans">{selectedBuyerInquiry.budgetRange}</span>
              </div>
              <h4 className="font-bold text-ink text-sm">{selectedBuyerInquiry.requirement}</h4>
              <p className="text-[11px] text-muted">{selectedBuyerInquiry.locality}</p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                Client Note
              </span>
              <div className="p-3 rounded-xl bg-surface border border-border text-ink leading-relaxed">
                "{selectedBuyerInquiry.message}"
              </div>
            </div>

            {/* Buyer Status Selector */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                Inquiry Stage
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['active', 'contacted', 'closed'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      markBuyerStatus(selectedBuyerInquiry.id, st);
                      setSelectedBuyerInquiry((prev) => (prev ? { ...prev, status: st } : null));
                    }}
                    className={clsx(
                      'py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer border min-h-[40px]',
                      selectedBuyerInquiry.status === st
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-surface border-border text-muted hover:text-ink'
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedBuyerInquiry.clientPhone}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 min-h-[40px]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <a
                  href={`https://wa.me/${selectedBuyerInquiry.clientPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 min-h-[40px]"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <Link
                to="/app/buyers"
                onClick={() => setSelectedBuyerInquiry(null)}
                className="px-3.5 py-2 rounded-xl border border-blue-600/40 text-blue-700 dark:text-blue-400 hover:bg-blue-50 text-xs font-bold flex items-center gap-1 min-h-[40px]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>View Matches</span>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog before deleting inquiry */}
      <ConfirmDialog
        open={Boolean(inquiryToDelete)}
        onOpenChange={(open) => {
          if (!open) setInquiryToDelete(null);
        }}
        title="Delete Inbound Inquiry"
        description={`Are you sure you want to remove the ${inquiryToDelete?.type === 'property' ? 'property' : 'buyer'} inquiry from "${inquiryToDelete?.clientName}"?`}
        confirmText="Yes, Delete Inquiry"
        onConfirm={confirmDeleteInquiry}
      />
    </div>
  );
};
