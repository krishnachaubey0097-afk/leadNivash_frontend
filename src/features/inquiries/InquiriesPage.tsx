import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  MessageSquare,
  Building2,
  Calendar,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import clsx from 'clsx';

interface PublicInquiry {
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

export const InquiriesPage: React.FC = () => {
  const { success } = useToast();

  const [inquiries, setInquiries] = useState<PublicInquiry[]>([
    {
      id: 'inq_1',
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
      id: 'inq_2',
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
      id: 'inq_3',
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
      id: 'inq_4',
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

  const markStatus = (id: string, status: PublicInquiry['status']) => {
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    success(`Inquiry marked as ${status.toUpperCase()}`);
  };

  const newCount = inquiries.filter((i) => i.status === 'new').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-ink font-heading tracking-tight">
              Public Flyer Inquiries
            </h1>
            <Badge variant="brand">
              {newCount} New Inquiries
            </Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Prospective buyers who submitted contact requests via your shared WhatsApp flyers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="p-2 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 font-bold flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            <span>Direct Broker Leads</span>
          </span>
        </div>
      </div>

      {/* Inquiry List */}
      <div className="space-y-4">
        {inquiries.map((inq) => {
          const whatsappUrl = `https://wa.me/${inq.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            `Namaste ${inq.clientName} ji, maine aapki inquiry dekhi for ${inq.propertyTitle} in ${inq.locality}. Main Sharma Real Estate se baat kar raha hoon. Kab baat kar sakte hain?`
          )}`;

          return (
            <Card
              key={inq.id}
              className="p-5 space-y-4 border-emerald-500/30 hover:border-brand-600/60 transition shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-ink text-sm">
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
                  <span className="text-[11px] text-muted flex items-center gap-1">
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
                </div>
              </div>

              {/* Property Details Strip */}
              <div className="p-3.5 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <div>
                    <span className="font-bold text-ink block">{inq.propertyTitle}</span>
                    <span className="text-muted text-[11px]">{inq.locality}</span>
                  </div>
                </div>

                <div className="text-right">
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
                    <span>Call Client</span>
                  </a>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="flex items-center gap-1.5">
                  {inq.status !== 'converted' && (
                    <button
                      onClick={() => markStatus(inq.id, 'converted')}
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline px-2 py-1 cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Convert to Active Buyer</span>
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
