import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  MessageCircle,
  MessageSquare,
  Building2,
  Calendar,
  CheckCircle2,
  Shield,
  Eye,
  UserCheck,
  X,
  Users,
  Trash2,
  Sparkles,
  MapPin,
  Clock,
  Plus,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
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
  const { success } = useToast();

  // Top Centered Segmented Control State per user request:
  // "Add property and buyer inquiries in one tab in mobile screen but in different section give button upper side like dashboard today and track record but this is center upper side"
  const [activeInquiryType, setActiveInquiryType] = useState<'property' | 'buyer'>('property');

  const [selectedPropertyInquiry, setSelectedPropertyInquiry] = useState<PropertyInquiry | null>(null);
  const [selectedBuyerInquiry, setSelectedBuyerInquiry] = useState<BuyerInquiry | null>(null);

  // Property Inquiries (Inbound flyer leads)
  const [propertyInquiries, setPropertyInquiries] = useState<PropertyInquiry[]>([
    {
      id: 'prop_inq_1',
      clientName: 'Amit Kumar',
      clientPhone: '+919812055667',
      propertyTitle: '3 BHK Luxury Builder Floor',
      locality: 'Model Town, Panipat',
      demand: '₹1.25 Cr',
      date: 'Today, 10:15 AM',
      message: 'Interested in 2nd floor with car parking. Can we visit tomorrow evening around 5 PM?',
      status: 'new',
    },
    {
      id: 'prop_inq_2',
      clientName: 'Sanjay Singhal',
      clientPhone: '+919416088990',
      propertyTitle: '250 Gaj Residential Plot',
      locality: 'Ansals Sushant City',
      demand: '₹85 Lakhs',
      date: 'Yesterday, 4:30 PM',
      message: 'Looking for north-facing plot. Is the price negotiable for immediate cheque payment?',
      status: 'new',
    },
    {
      id: 'prop_inq_3',
      clientName: 'Rohit Batra',
      clientPhone: '+919896011223',
      propertyTitle: '4 BHK Independent Designer Kothi',
      locality: 'Sector 18, Panipat',
      demand: '₹2.40 Cr',
      date: '2 days ago',
      message: 'Please send video walkthrough and circle rate details on WhatsApp.',
      status: 'contacted',
    },
    {
      id: 'prop_inq_4',
      clientName: 'Deepak Chopra',
      clientPhone: '+919813099887',
      propertyTitle: 'Prime Main Market Commercial Shop',
      locality: 'GT Road, Panipat',
      demand: '₹95 Lakhs',
      date: '3 days ago',
      message: 'What is the current monthly rental yield and tenant status?',
      status: 'converted',
    },
  ]);

  // Buyer Inquiries (Inbound buyer requirements from WhatsApp/Portal)
  const [buyerInquiries, setBuyerInquiries] = useState<BuyerInquiry[]>([
    {
      id: 'buyer_inq_1',
      clientName: 'Sunil Jaglan',
      clientPhone: '+919876500004',
      requirement: 'Corner Commercial Shop for Retail',
      locality: 'GT Road / Chandni Bagh',
      budgetRange: '₹80 L - ₹1.10 Cr',
      urgency: 'Immediate',
      date: 'Today, 09:30 AM',
      message: 'Urgent requirement. Cash ready. Need 40-60 Gaj commercial ground floor with good footfall.',
      status: 'active',
    },
    {
      id: 'buyer_inq_2',
      clientName: 'Vikram Verma',
      clientPhone: '+919876500002',
      requirement: '200 to 250 Gaj Plot',
      locality: 'Ansals Sushant City, Sector 18',
      budgetRange: '₹75 L - ₹90 L',
      urgency: 'Within Month',
      date: 'Yesterday, 2:15 PM',
      message: 'Wants wide road facing plot. Registry clear title only.',
      status: 'active',
    },
    {
      id: 'buyer_inq_3',
      clientName: 'Anjali Gupta',
      clientPhone: '+919876500003',
      requirement: '4 BHK Modern Kothi / Villa',
      locality: 'Sector 18, Panipat',
      budgetRange: '₹2.00 Cr - ₹2.50 Cr',
      urgency: 'Immediate',
      date: '3 days ago',
      message: 'High net worth client looking for ready-to-move bungalow with modern elevation.',
      status: 'contacted',
    },
  ]);

  const markPropertyStatus = (id: string, status: PropertyInquiry['status']) => {
    setPropertyInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    success(`Inquiry marked as ${status.toUpperCase()}`);
  };

  const deletePropertyInquiry = (id: string) => {
    setPropertyInquiries((prev) => prev.filter((i) => i.id !== id));
    success('Property inquiry removed');
  };

  const markBuyerStatus = (id: string, status: BuyerInquiry['status']) => {
    setBuyerInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    success(`Buyer inquiry marked as ${status.toUpperCase()}`);
  };

  const deleteBuyerInquiry = (id: string) => {
    setBuyerInquiries((prev) => prev.filter((i) => i.id !== id));
    success('Buyer inquiry removed');
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-16 text-left">
      {/* Top Header with Gradient Accent */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white via-emerald-50/25 to-emerald-100/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border border-emerald-500/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-ink font-heading tracking-tight">
              Inquiry Hub
            </h1>
            <Badge variant="brand">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              Verified Inbound Leads
            </Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Manage both property flyer inquiries and incoming buyer requirements in one unified hub.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white font-bold flex items-center gap-1.5 shadow-xs border border-emerald-500/30">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Direct Broker Pipeline</span>
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CENTERED UPPER SEGMENTED CONTROL PILL (Quixotic Style)  */}
      {/* ======================================================== */}
      <div className="flex justify-center pt-1 pb-1">
        <div className="flex p-1 bg-slate-200/75 dark:bg-slate-800/85 rounded-full border border-border/70 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveInquiryType('property')}
            className={clsx(
              'px-4 sm:px-6 py-2 text-xs font-black rounded-full transition-all cursor-pointer flex items-center gap-2',
              activeInquiryType === 'property'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs'
                : 'text-muted hover:text-ink'
            )}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Property Inquiries</span>
            <span
              className={clsx(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none',
                activeInquiryType === 'property'
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-300 dark:bg-slate-700 text-muted'
              )}
            >
              {propertyInquiries.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInquiryType('buyer')}
            className={clsx(
              'px-4 sm:px-6 py-2 text-xs font-black rounded-full transition-all cursor-pointer flex items-center gap-2',
              activeInquiryType === 'buyer'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs'
                : 'text-muted hover:text-ink'
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Buyer Inquiries</span>
            <span
              className={clsx(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none',
                activeInquiryType === 'buyer'
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-300 dark:bg-slate-700 text-muted'
              )}
            >
              {buyerInquiries.length}
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: PROPERTY INQUIRIES                            */}
      {/* ======================================================== */}
      {activeInquiryType === 'property' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              Inbound Leads from Shared WhatsApp Flyers
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {propertyInquiries.filter((p) => p.status === 'new').length} New Pending
            </span>
          </div>

          {propertyInquiries.length === 0 ? (
            <Card className="p-8 text-center space-y-2">
              <Building2 className="w-8 h-8 text-muted mx-auto" />
              <p className="text-xs text-muted">No property inquiries yet.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {propertyInquiries.map((inq) => {
                const whatsappUrl = `https://wa.me/${inq.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Namaste ${inq.clientName} ji, maine aapki inquiry dekhi for ${inq.propertyTitle} in ${inq.locality}. Main Sharma Real Estate se baat kar raha hoon. Kab baat kar sakte hain?`
                )}`;

                return (
                  <Card
                    key={inq.id}
                    className="p-5 space-y-4 border-emerald-500/25 hover:border-brand-600/60 transition shadow-card bg-gradient-to-br from-white via-white to-emerald-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/15"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/70">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-950 dark:to-slate-900 flex items-center justify-center font-black text-emerald-800 dark:text-emerald-300 text-sm shadow-2xs border border-emerald-500/20">
                          {inq.clientName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-ink font-heading leading-tight">
                            {inq.clientName}
                          </h3>
                          <span className="text-xs text-muted font-medium">{inq.clientPhone}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-brand-600" />
                          {inq.date}
                        </span>
                        <span
                          className={clsx(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                            inq.status === 'new'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                              : inq.status === 'contacted'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          )}
                        >
                          {inq.status}
                        </span>

                        {/* Delete Inquiry */}
                        <button
                          type="button"
                          onClick={() => deletePropertyInquiry(inq.id)}
                          className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete inquiry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Property Details Strip */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/30 dark:from-brand-950/40 dark:via-slate-900 dark:to-brand-950/20 border border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-brand-600 shrink-0" />
                        <div>
                          <span className="font-bold text-ink block">{inq.propertyTitle}</span>
                          <span className="text-muted text-[11px]">{inq.locality}</span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-muted block">Asking Price</span>
                        <span className="font-black text-brand-700 dark:text-brand-600">{inq.demand}</span>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="text-xs text-slate-700 dark:text-slate-300 p-3 rounded-xl bg-surface border border-border/70 leading-relaxed flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>"{inq.message}"</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${inq.clientPhone}`}
                          className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>

                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setSelectedPropertyInquiry(inq)}
                          className="px-3.5 py-1.5 rounded-full border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-ink text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Details</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
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
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: BUYER INQUIRIES                               */}
      {/* ======================================================== */}
      {activeInquiryType === 'buyer' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              Inbound Buyer Client Requirements
            </span>
            <Link to="/app/buyers/new" className="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" />
              <span>Add Buyer Request</span>
            </Link>
          </div>

          {buyerInquiries.length === 0 ? (
            <Card className="p-8 text-center space-y-2">
              <Users className="w-8 h-8 text-muted mx-auto" />
              <p className="text-xs text-muted">No buyer inquiries yet.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {buyerInquiries.map((bInq) => {
                const whatsappUrl = `https://wa.me/${bInq.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Namaste ${bInq.clientName} ji, humne aapka property requirement dekha: ${bInq.requirement} in ${bInq.locality}. Mere paas verified options available hain. Kab baat kar sakte hain?`
                )}`;

                return (
                  <Card
                    key={bInq.id}
                    className="p-5 space-y-4 border-blue-500/25 hover:border-brand-600/60 transition shadow-card bg-gradient-to-br from-white via-white to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/15"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/70">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-blue-950 dark:to-slate-900 flex items-center justify-center font-black text-blue-800 dark:text-blue-300 text-sm shadow-2xs border border-blue-500/20">
                          {bInq.clientName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-ink font-heading leading-tight">
                            {bInq.clientName}
                          </h3>
                          <span className="text-xs text-muted font-medium">{bInq.clientPhone}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          {bInq.date}
                        </span>

                        <span
                          className={clsx(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                            bInq.urgency === 'Immediate'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          )}
                        >
                          {bInq.urgency}
                        </span>

                        {/* Delete Buyer Inquiry */}
                        <button
                          type="button"
                          onClick={() => deleteBuyerInquiry(bInq.id)}
                          className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete inquiry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Buyer Requirement Strip */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-white to-blue-50/30 dark:from-blue-950/40 dark:via-slate-900 dark:to-blue-950/20 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <span className="font-bold text-ink block">{bInq.requirement}</span>
                          <span className="text-muted text-[11px]">{bInq.locality}</span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-muted block">Budget Band</span>
                        <span className="font-black text-blue-700 dark:text-blue-400">{bInq.budgetRange}</span>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="text-xs text-slate-700 dark:text-slate-300 p-3 rounded-xl bg-surface border border-border/70 leading-relaxed flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>"{bInq.message}"</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${bInq.clientPhone}`}
                          className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>

                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setSelectedBuyerInquiry(bInq)}
                          className="px-3.5 py-1.5 rounded-full border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-ink text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Details</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/app/buyers`}
                          className="text-xs font-bold text-brand-700 dark:text-brand-400 hover:underline px-2 py-1 flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Check Inventory Matches</span>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Property Inquiry Details Modal */}
      {selectedPropertyInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <Card className="w-full max-w-lg p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-200/90 shadow-2xl rounded-3xl text-left relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                  {selectedPropertyInquiry.clientName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black text-ink font-heading">
                    {selectedPropertyInquiry.clientName}
                  </h3>
                  <span className="text-xs text-muted font-mono">{selectedPropertyInquiry.clientPhone}</span>
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

            <div className="p-3.5 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-500/20 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Inquired Property Listing
                </span>
                <span className="font-extrabold text-emerald-700">{selectedPropertyInquiry.demand}</span>
              </div>
              <h4 className="font-bold text-ink text-sm">{selectedPropertyInquiry.propertyTitle}</h4>
              <p className="text-[11px] text-muted">{selectedPropertyInquiry.locality}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center justify-between">
                <span>Prospect Message</span>
                <span className="font-mono text-slate-400">{selectedPropertyInquiry.date}</span>
              </span>
              <div className="p-3.5 rounded-xl bg-surface border border-border/80 text-ink leading-relaxed">
                "{selectedPropertyInquiry.message}"
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedPropertyInquiry.clientPhone}`}
                  className="px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <a
                  href={`https://wa.me/${selectedPropertyInquiry.clientPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <Link
                to="/app/buyers/new"
                onClick={() => setSelectedPropertyInquiry(null)}
                className="px-3.5 py-2 rounded-full border border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Save as Buyer</span>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Buyer Inquiry Details Modal */}
      {selectedBuyerInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <Card className="w-full max-w-lg p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-200/90 shadow-2xl rounded-3xl text-left relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                  {selectedBuyerInquiry.clientName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black text-ink font-heading">
                    {selectedBuyerInquiry.clientName}
                  </h3>
                  <span className="text-xs text-muted font-mono">{selectedBuyerInquiry.clientPhone}</span>
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

            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-500/20 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Target Requirement
                </span>
                <span className="font-extrabold text-blue-700">{selectedBuyerInquiry.budgetRange}</span>
              </div>
              <h4 className="font-bold text-ink text-sm">{selectedBuyerInquiry.requirement}</h4>
              <p className="text-[11px] text-muted">{selectedBuyerInquiry.locality}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center justify-between">
                <span>Client Note</span>
                <span className="font-mono text-slate-400">{selectedBuyerInquiry.date}</span>
              </span>
              <div className="p-3.5 rounded-xl bg-surface border border-border/80 text-ink leading-relaxed">
                "{selectedBuyerInquiry.message}"
              </div>
            </div>

            {/* Buyer Status Selector */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
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
                      'py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer border',
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

            <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedBuyerInquiry.clientPhone}`}
                  className="px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <a
                  href={`https://wa.me/${selectedBuyerInquiry.clientPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <Link
                to={`/app/buyers`}
                onClick={() => setSelectedBuyerInquiry(null)}
                className="px-3.5 py-2 rounded-full border border-blue-600/40 text-blue-700 dark:text-blue-400 hover:bg-blue-50 text-xs font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>View in Pipeline</span>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
