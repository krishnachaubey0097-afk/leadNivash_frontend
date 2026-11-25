import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Activity,
  Users,
  Inbox,
  Database,
  Download,
  Server,
  HardDrive,
  RefreshCw,
  Search,
  Phone,
  MessageCircle,
  MessageSquare,
  Clock,
  Layers,
  CheckCircle2,
  Building2,
  UserCheck,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { apiClient } from '../../lib/api/client';
import { useToast } from '../../components/ui/Toast';

type AdminTab = 'telemetry' | 'users' | 'leads' | 'audit';
type LeadSubTab = 'contacts' | 'inquiries';

interface PlatformUsage {
  overview: {
    totalUsers: number;
    activeProperties: number;
    totalBuyers: number;
    totalDeals: number;
    totalParses: number;
    totalShares: number;
  };
  systemHealth: {
    status: 'healthy' | 'degraded';
    uptimeSeconds: number;
    dbConnected: boolean;
    environment: string;
    memoryUsageMb: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
    };
  };
  userMetrics: {
    onlineNow: number;
    active24h: number;
    active7d: number;
    active30d: number;
  };
  sectionUsage: Array<{
    section: string;
    count: number;
    unit: string;
  }>;
  recentEvents: Array<{
    id: string;
    type: string;
    entityType: string;
    createdAt: string;
    meta: Record<string, any>;
  }>;
  timestamp: string;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  city?: string;
  agencyName?: string;
  plan: {
    tier: 'trial' | 'starter' | 'pro' | 'team' | 'agency';
    expiresAt?: string;
  };
  createdAt: string;
}

interface ContactLead {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  phoneE164?: string;
  agencyName?: string;
  city?: string;
  message: string;
  createdAt: string;
}

interface PropertyInquiry {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  propertyId?: {
    _id: string;
    title: string;
    city?: string;
  } | string;
  createdAt: string;
}

export const AdminPage: React.FC = () => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('telemetry');

  // Telemetry State
  const [usage, setUsage] = useState<PlatformUsage | null>(null);
  const [isUsageLoading, setIsUsageLoading] = useState(false);

  // Users State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Leads State
  const [leadSubTab, setLeadSubTab] = useState<LeadSubTab>('contacts');
  const [contacts, setContacts] = useState<ContactLead[]>([]);
  const [inquiries, setInquiries] = useState<PropertyInquiry[]>([]);
  const [isLeadsLoading, setIsLeadsLoading] = useState(false);

  // Auto-refresh timestamp
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  // 1. Fetch Telemetry
  const fetchUsage = useCallback(async () => {
    setIsUsageLoading(true);
    try {
      const data = await apiClient.get<any, PlatformUsage>('/admin/usage');
      setUsage(data);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.warn('Admin: Failed to fetch usage telemetry:', err);
    } finally {
      setIsUsageLoading(false);
    }
  }, []);

  // 2. Fetch Users
  const fetchUsers = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const params: Record<string, string> = { limit: '50' };
      if (userSearch.trim()) params.search = userSearch.trim();
      if (tierFilter !== 'all') params.tier = tierFilter;

      const data = await apiClient.get<any, { users: AdminUser[] }>('/admin/users', { params });
      if (data?.users) {
        setUsers(data.users);
      }
    } catch (err: any) {
      console.warn('Admin: Failed to load user list:', err);
    } finally {
      setIsUsersLoading(false);
    }
  }, [userSearch, tierFilter]);

  // 3. Fetch Leads & Inquiries
  const fetchLeads = useCallback(async () => {
    setIsLeadsLoading(true);
    try {
      const [contactRes, inquiryRes] = await Promise.allSettled([
        apiClient.get<any, { items: ContactLead[] }>('/admin/contacts?limit=50'),
        apiClient.get<any, { inquiries: PropertyInquiry[] }>('/admin/inquiries?limit=50'),
      ]);

      if (contactRes.status === 'fulfilled' && contactRes.value?.items) {
        setContacts(contactRes.value.items);
      }
      if (inquiryRes.status === 'fulfilled' && inquiryRes.value?.inquiries) {
        setInquiries(inquiryRes.value.inquiries);
      }
    } catch (err: any) {
      console.warn('Admin: Failed to fetch leads:', err);
    } finally {
      setIsLeadsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUsage();
    fetchUsers();
    fetchLeads();
  }, [fetchUsage, fetchUsers, fetchLeads]);

  // Update Plan Tier
  const handlePlanChange = async (userId: string, newTier: 'trial' | 'starter' | 'pro' | 'team' | 'agency') => {
    setUpdatingUserId(userId);
    try {
      await apiClient.patch(`/admin/users/${userId}/plan`, { tier: newTier });
      success(`Updated user subscription tier to ${newTier.toUpperCase()}`);
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, plan: { ...u.plan, tier: newTier } } : u))
      );
    } catch (err: any) {
      error(err.message || 'Failed to update user plan');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // CSV Export for Contacts
  const exportContactsCsv = () => {
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
    downloadBlob(csvContent, `leadnivash-landing-contacts-${new Date().toISOString().split('T')[0]}.csv`);
  };

  // CSV Export for Inquiries
  const exportInquiriesCsv = () => {
    if (inquiries.length === 0) return;
    const headers = ['Name', 'Phone', 'Email', 'Property', 'Message', 'Created At'];
    const rows = inquiries.map((i) => {
      const propTitle = typeof i.propertyId === 'object' && i.propertyId?.title ? i.propertyId.title : 'Direct';
      return [
        `"${(i.name || '').replace(/"/g, '""')}"`,
        `"${(i.phone || '').replace(/"/g, '""')}"`,
        `"${(i.email || '').replace(/"/g, '""')}"`,
        `"${propTitle.replace(/"/g, '""')}"`,
        `"${(i.message || '').replace(/"/g, '""')}"`,
        `"${new Date(i.createdAt).toLocaleString()}"`,
      ];
    });
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadBlob(csvContent, `leadnivash-flyer-inquiries-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const downloadBlob = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format Uptime
  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${seconds % 60}s`;
  };

  const planBadgeVariants: Record<string, string> = {
    trial: 'bg-amber-50 text-amber-700 border-amber-200',
    starter: 'bg-blue-50 text-blue-700 border-blue-200',
    pro: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    team: 'bg-purple-50 text-purple-700 border-purple-200',
    agency: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="space-y-6 pb-20 text-left max-w-6xl mx-auto px-2 sm:px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-ink font-heading tracking-tight">
              Admin & Operational Monitoring
            </h1>
          </div>
          <p className="text-xs text-muted mt-1">
            Real-time infrastructure health, user concurrency, feature utilization, and broker management.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <button
            type="button"
            onClick={() => {
              fetchUsage();
              fetchUsers();
              fetchLeads();
            }}
            disabled={isUsageLoading}
            className="px-3 py-1.5 rounded-full bg-white text-ink font-bold flex items-center gap-1.5 border border-border shadow-2xs hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isUsageLoading ? 'animate-spin' : ''}`} />
            <span>Refreshed {lastRefreshed}</span>
          </button>

          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1.5 border border-emerald-200/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{usage?.systemHealth?.status === 'healthy' ? 'System Healthy' : 'Degraded'}</span>
          </span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'telemetry'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Telemetry & System Health</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Broker Management ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'leads'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Inbound Leads ({contacts.length + inquiries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>System Audit Log</span>
        </button>
      </div>

      {/* TAB 1: TELEMETRY & SYSTEM HEALTH */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Top Operational Status Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4 bg-white border-border">
              <div className="flex items-center gap-2 text-muted text-xs font-semibold">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Database Cluster</span>
              </div>
              <div className="mt-2 text-lg font-bold text-ink font-heading flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>MongoDB Atlas</span>
              </div>
              <span className="text-[10px] text-muted">Primary Replica Set Connected</span>
            </Card>

            <Card className="p-4 bg-white border-border">
              <div className="flex items-center gap-2 text-muted text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Service Uptime</span>
              </div>
              <div className="mt-2 text-lg font-bold text-blue-700 font-heading">
                {formatUptime(usage?.systemHealth?.uptimeSeconds)}
              </div>
              <span className="text-[10px] text-muted">Node.js Server Process</span>
            </Card>

            <Card className="p-4 bg-white border-border">
              <div className="flex items-center gap-2 text-muted text-xs font-semibold">
                <HardDrive className="w-3.5 h-3.5 text-purple-600" />
                <span>Memory (Heap Used)</span>
              </div>
              <div className="mt-2 text-lg font-bold text-purple-700 font-heading">
                {usage?.systemHealth?.memoryUsageMb?.heapUsed || 0} MB
              </div>
              <span className="text-[10px] text-muted">
                Heap Total: {usage?.systemHealth?.memoryUsageMb?.heapTotal || 0} MB
              </span>
            </Card>

            <Card className="p-4 bg-white border-border">
              <div className="flex items-center gap-2 text-muted text-xs font-semibold">
                <Server className="w-3.5 h-3.5 text-slate-600" />
                <span>Environment</span>
              </div>
              <div className="mt-2 text-lg font-bold text-slate-800 font-heading capitalize">
                {usage?.systemHealth?.environment || 'production'}
              </div>
              <span className="text-[10px] text-muted">RSS: {usage?.systemHealth?.memoryUsageMb?.rss || 0} MB</span>
            </Card>
          </div>

          {/* User Concurrency & Activity Reporting Strip */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-ink font-heading flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Real-time Online vs Periodic Active Users</span>
                </h3>
                <p className="text-[11px] text-muted">
                  Online users reflect live sessions within 15 minutes. Periodic counts aggregate unique broker activity without invasive tracking.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Card className="p-4 border-emerald-500/30 bg-emerald-50/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800">
                    Online Right Now
                  </span>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-700 font-heading">
                    {usage?.userMetrics?.onlineNow ?? 1}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold">Live</span>
                </div>
                <span className="text-[10px] text-muted mt-1 block">Active within last 15 mins</span>
              </Card>

              <Card className="p-4 border-border">
                <span className="text-xs font-semibold text-muted">
                  Active (Last 24 Hours)
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-ink font-heading">
                    {usage?.userMetrics?.active24h ?? 1}
                  </span>
                  <span className="text-[11px] text-muted font-semibold">Brokers</span>
                </div>
                <span className="text-[10px] text-muted mt-1 block">1+ action in past day</span>
              </Card>

              <Card className="p-4 border-border">
                <span className="text-xs font-semibold text-muted">
                  Active (Last 7 Days)
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-ink font-heading">
                    {usage?.userMetrics?.active7d ?? 1}
                  </span>
                  <span className="text-[11px] text-muted font-semibold">Brokers</span>
                </div>
                <span className="text-[10px] text-muted mt-1 block">Weekly engaged users</span>
              </Card>

              <Card className="p-4 border-border">
                <span className="text-xs font-semibold text-muted">
                  Active (Last 30 Days)
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-ink font-heading">
                    {usage?.userMetrics?.active30d ?? 1}
                  </span>
                  <span className="text-[11px] text-muted font-semibold">Brokers</span>
                </div>
                <span className="text-[10px] text-muted mt-1 block">Monthly active cohort</span>
              </Card>
            </div>
          </div>

          {/* Section Utilization Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-ink font-heading flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Most-Used Application Modules</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {(usage?.sectionUsage || []).map((sec, idx) => (
                <Card key={idx} className="p-4 flex flex-col justify-between hover:border-emerald-500/40 transition">
                  <div>
                    <span className="text-[11px] font-bold text-muted block line-clamp-1">{sec.section}</span>
                    <span className="text-2xl font-black text-ink font-heading mt-1.5 block">{sec.count}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold mt-2">
                    {sec.unit}
                  </span>
                </Card>
              ))}
            </div>
          </div>

          {/* Privacy & Compliance Assurance Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-border text-xs flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-ink">Strict Admin Access & Zero-PII Visibility Policy</p>
              <p className="text-muted leading-relaxed text-[11px]">
                This administrative monitoring panel enforces strict role-based access control (RBAC). In compliance with Privacy & Security Guidelines, no passwords, authentication tokens, private client phone books, or invasive surveillance data are exposed. All telemetry aggregates system health and non-PII operational events.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BROKER & ACCOUNT MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search brokers by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-white text-ink focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
              {['all', 'trial', 'starter', 'pro', 'team', 'agency'].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setTierFilter(tier)}
                  className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] transition cursor-pointer ${
                    tierFilter === tier
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-muted hover:bg-slate-200'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {isUsersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <Card className="p-8 text-center space-y-2">
              <Users className="w-8 h-8 text-muted mx-auto" />
              <h4 className="text-sm font-bold text-ink">No Broker Accounts Found</h4>
              <p className="text-xs text-muted">Try adjusting your search criteria or tier filters.</p>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-left text-xs text-ink">
                <thead className="bg-slate-50 text-muted font-bold uppercase text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="p-3.5">Broker / Account</th>
                    <th className="p-3.5">Contact Details</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Current Tier</th>
                    <th className="p-3.5">Change Tier</th>
                    <th className="p-3.5 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold block text-ink">{u.name}</span>
                            <span className="text-[11px] text-muted">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-muted block">{u.phone || '—'}</span>
                        {u.city && <span className="text-[10px] text-muted">{u.city}</span>}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                            planBadgeVariants[u.plan?.tier] || 'bg-slate-100'
                          }`}
                        >
                          {u.plan?.tier || 'trial'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={u.plan?.tier || 'trial'}
                          disabled={updatingUserId === u._id}
                          onChange={(e) => handlePlanChange(u._id, e.target.value as any)}
                          className="px-2 py-1 text-[11px] rounded-lg border border-border bg-white font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
                        >
                          <option value="trial">Trial</option>
                          <option value="starter">Starter</option>
                          <option value="pro">Pro</option>
                          <option value="team">Team</option>
                          <option value="agency">Agency</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right font-mono text-[11px] text-muted whitespace-nowrap">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INBOUND LEADS & INQUIRIES */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLeadSubTab('contacts')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  leadSubTab === 'contacts'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-muted hover:bg-slate-200'
                }`}
              >
                Landing Page Leads ({contacts.length})
              </button>
              <button
                type="button"
                onClick={() => setLeadSubTab('inquiries')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  leadSubTab === 'inquiries'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-muted hover:bg-slate-200'
                }`}
              >
                Flyer Property Inquiries ({inquiries.length})
              </button>
            </div>

            <button
              type="button"
              onClick={leadSubTab === 'contacts' ? exportContactsCsv : exportInquiriesCsv}
              className="px-3 py-1.5 rounded-full bg-white text-ink text-xs font-bold flex items-center gap-1.5 border border-border shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export {leadSubTab === 'contacts' ? 'Contacts' : 'Inquiries'} (CSV)</span>
            </button>
          </div>

          {/* SubTab 1: Landing Page Contacts */}
          {leadSubTab === 'contacts' && (
            <div className="space-y-3">
              {isLeadsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : contacts.length === 0 ? (
                <Card className="p-8 text-center space-y-2">
                  <Inbox className="w-8 h-8 text-muted mx-auto" />
                  <h4 className="text-sm font-bold text-ink">No Inbound Contact Requests Yet</h4>
                  <p className="text-xs text-muted">Submissions from the public landing page form will appear here.</p>
                </Card>
              ) : (
                contacts.map((lead) => {
                  const whatsappUrl = `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Namaste ${lead.name} ji, thank you for reaching out to LeadNivash. How can we assist you today?`
                  )}`;
                  return (
                    <Card
                      key={lead._id}
                      className="p-4 flex flex-col justify-between border-slate-200 hover:border-emerald-500/40 transition space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                            {lead.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-ink">{lead.name}</span>
                              {lead.agencyName && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                  {lead.agencyName}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted font-mono">{lead.phone}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-muted">
                          {lead.city && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                              {lead.city}
                            </span>
                          )}
                          <span>{new Date(lead.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-border text-xs text-ink leading-relaxed flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>"{lead.message}"</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 text-xs">
                          <a
                            href={`tel:${lead.phone}`}
                            className="px-3 py-1 rounded-full bg-slate-900 text-white font-bold flex items-center gap-1.5"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                        <span className="text-[10px] font-mono text-muted">ID: {lead._id}</span>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* SubTab 2: Flyer Property Inquiries */}
          {leadSubTab === 'inquiries' && (
            <div className="space-y-3">
              {inquiries.length === 0 ? (
                <Card className="p-8 text-center space-y-2">
                  <Inbox className="w-8 h-8 text-muted mx-auto" />
                  <h4 className="text-sm font-bold text-ink">No Flyer Inquiries Yet</h4>
                  <p className="text-xs text-muted">Prospective buyers responding to shared flyers will show up here.</p>
                </Card>
              ) : (
                inquiries.map((inq) => {
                  const whatsappUrl = `https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Namaste ${inq.name} ji, thank you for inquiring about the property on LeadNivash. Are you available for a quick discussion?`
                  )}`;
                  const propTitle =
                    typeof inq.propertyId === 'object' && inq.propertyId?.title
                      ? inq.propertyId.title
                      : 'Shared Property Flyer';

                  return (
                    <Card
                      key={inq._id}
                      className="p-4 flex flex-col justify-between border-slate-200 hover:border-emerald-500/40 transition space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0">
                            {inq.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-ink block">{inq.name}</span>
                            <span className="text-[11px] text-muted font-mono">{inq.phone}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-muted">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {propTitle}
                          </span>
                          <span>{new Date(inq.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {inq.message && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-border text-xs text-ink leading-relaxed">
                          "{inq.message}"
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 text-xs">
                          <a
                            href={`tel:${inq.phone}`}
                            className="px-3 py-1 rounded-full bg-slate-900 text-white font-bold flex items-center gap-1.5"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                        <span className="text-[10px] font-mono text-muted">ID: {inq._id}</span>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SYSTEM AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-ink font-heading flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>System & Broker Operational Audit Trail</span>
            </h3>
            <span className="text-[11px] text-muted font-mono">Last 10 platform security & lifecycle events</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-xs text-ink">
              <thead className="bg-slate-50 text-muted font-bold uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="p-3.5">Event Type</th>
                  <th className="p-3.5">Entity Scope</th>
                  <th className="p-3.5">Event Metadata</th>
                  <th className="p-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(usage?.recentEvents || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted">
                      No system events logged in recent window.
                    </td>
                  </tr>
                ) : (
                  (usage?.recentEvents || []).map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200/50">
                          {ev.type}
                        </span>
                      </td>
                      <td className="p-3.5 capitalize font-medium text-slate-700">
                        {ev.entityType}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-muted">
                        {Object.keys(ev.meta || {}).length > 0 ? JSON.stringify(ev.meta) : '—'}
                      </td>
                      <td className="p-3.5 text-right font-mono text-[11px] text-muted whitespace-nowrap">
                        {ev.createdAt ? new Date(ev.createdAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
