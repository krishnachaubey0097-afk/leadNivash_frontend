import React, { useState, useEffect } from 'react';
import {
  Shield,
  Inbox,
  Phone,
  MessageCircle,
  MessageSquare,
  Clock,
  Database,
  Download,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../lib/api/client';

interface ContactLead {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  phoneE164: string;
  agencyName?: string;
  city?: string;
  message: string;
  createdAt: string;
}

export const AdminPage: React.FC = () => {
  const [contacts, setContacts] = useState<ContactLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get<any, any>('/public/contact')
      .then((res) => {
        if (res?.items && Array.isArray(res.items)) {
          setContacts(res.items);
          setTotalCount(res.pagination?.total || res.items.length);
        }
      })
      .catch((err) => console.warn('Admin: Could not load contact leads:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleExportCsv = () => {
    if (contacts.length === 0) return;
    const headers = ['Name', 'Phone', 'Email', 'Agency Name', 'City', 'Message', 'Created At'];
    const rows = contacts.map((c) => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.phone || c.phoneE164 || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.agencyName || '').replace(/"/g, '""')}"`,
      `"${(c.city || '').replace(/"/g, '""')}"`,
      `"${(c.message || '').replace(/"/g, '""')}"`,
      `"${new Date(c.createdAt).toLocaleString()}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `leadnivash-leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16 text-left max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-black text-ink font-heading tracking-tight">
              Founder & Admin Console
            </h1>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Real-time telemetry and inbound leads stored in MongoDB Atlas (<code className="font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">leadnivash.contactleads</code>).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={contacts.length === 0}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-ink font-bold flex items-center gap-1.5 border border-border shadow-2xs hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Leads (CSV)</span>
          </button>
          <Badge variant="brand" dot>
            {totalCount} Total Leads
          </Badge>
          <span className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-ink font-bold flex items-center gap-1.5 border border-border">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>MongoDB Atlas Connected</span>
          </span>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col justify-between bg-gradient-to-br from-white via-white to-emerald-50/30 border-emerald-500/25">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Inbound Demo Requests</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-ink font-heading">{totalCount}</span>
            <span className="text-xs text-emerald-700 font-bold">Captured</span>
          </div>
          <span className="text-[11px] text-muted mt-2">Saved directly via landing page form</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between bg-gradient-to-br from-white via-white to-blue-50/30 border-blue-500/25">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Database Engine</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-blue-700 font-heading">MongoDB Atlas</span>
          </div>
          <span className="text-[11px] text-muted mt-2">Collection: contactleads</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between bg-gradient-to-br from-white via-white to-teal-50/30 border-teal-500/25">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">API Endpoint</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xs font-mono font-bold text-teal-800">POST /api/v1/public/contact</span>
          </div>
          <span className="text-[11px] text-muted mt-2">Automated bot honeypot protection</span>
        </Card>
      </div>

      {/* Contact Leads Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-ink font-heading flex items-center gap-2">
            <Inbox className="w-4 h-4 text-emerald-600" />
            <span>Recent Inbound Leads ({contacts.length})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <Inbox className="w-8 h-8 text-muted mx-auto" />
            <h4 className="text-sm font-bold text-ink">No Inbound Contact Leads Yet</h4>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Any form submission on the landing page will immediately show up here.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {contacts.map((lead) => {
              const whatsappUrl = `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Namaste ${lead.name} ji, thank you for requesting a demo of leadNivash for ${lead.agencyName || ''} in ${lead.city || ''}. When can we schedule your walkthrough?`
              )}`;

              const formattedDate = lead.createdAt
                ? new Date(lead.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent';

              return (
                <Card
                  key={lead._id}
                  className="p-5 flex flex-col justify-between border-slate-200 hover:border-emerald-500/50 transition shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border/70">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-sm flex items-center justify-center shrink-0">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-black text-ink font-heading">{lead.name}</h3>
                          {lead.agencyName && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 text-[10px] font-bold">
                              {lead.agencyName}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted font-mono">{lead.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        {formattedDate}
                      </span>
                      {lead.city && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {lead.city}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-border text-xs text-ink leading-relaxed flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>"{lead.message}"</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${lead.phone}`}
                        className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Lead</span>
                      </a>
                    </div>

                    <span className="text-[10px] text-muted font-mono">ID: {lead._id}</span>
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
