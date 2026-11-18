import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import {
  Sparkles,
  Plus,
  Trophy,
  ArrowRight,
  TrendingUp,
  Clock,
  Trash2,
  ArrowUpRight,
  Send,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import clsx from 'clsx';
import { formatRupees } from '../../lib/money';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Top Segmented control per PRD §5.3: Today | Track Record
  const [activeSegment, setActiveSegment] = useState<'today' | 'track-record'>('today');

  // Track Record sub-tabs per PRD §5.3.2
  const [trackRecordSubTab, setTrackRecordSubTab] = useState<
    'active' | 'wins' | 'lost' | 'insights' | 'deleted'
  >('active');

  // Sample Top Matches Waiting (for high visual SaaS appeal matching the PRD)
  const matchesWaiting = [
    {
      id: 'm1',
      score: 96,
      badge: 'perfect',
      propertyTitle: '3 BHK Luxury Builder Floor',
      locality: 'Model Town, Panipat',
      propertyPrice: 12500000,
      buyerName: 'Rajesh Sharma',
      buyerBudget: '₹1.20 - 1.35 Cr',
      date: 'Today, 11:30 AM',
    },
    {
      id: 'm2',
      score: 88,
      badge: 'good',
      propertyTitle: '250 Gaj Residential Plot',
      locality: 'Ansals Sushant City, Panipat',
      propertyPrice: 8500000,
      buyerName: 'Vikram Verma',
      buyerBudget: '₹80 - 90 Lakhs',
      date: 'Yesterday',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar: Welcome, Date Pill, & Segmented Control (Quixotic style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-ink font-heading tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Broker'} 👋
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-600 border border-brand-200/60 dark:border-brand-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            {user?.agency?.name || 'leadNivash Partner Agency'} · Panipat, NCR
          </p>
        </div>

        {/* Right side controls: Date pill & Segmented Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Date pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border/80 text-xs font-semibold text-muted shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span>
              {new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          {/* Segmented Control Pill (Quixotic Style) */}
          <div className="flex p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-full border border-border/60">
            <button
              onClick={() => setActiveSegment('today')}
              className={clsx(
                'px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer',
                activeSegment === 'today'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              )}
            >
              Today
            </button>
            <button
              onClick={() => setActiveSegment('track-record')}
              className={clsx(
                'px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer',
                activeSegment === 'track-record'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              )}
            >
              Track Record
            </button>
          </div>
        </div>
      </div>

      {/* TODAY SEGMENT (§5.3.1) */}
      {activeSegment === 'today' && (
        <div className="space-y-6">
          {/* Quick Paste Hero Card (Smudge Reference 3 style) */}
          <Card className="p-5 sm:p-6 bg-gradient-to-br from-surface via-surface to-brand-50/30 dark:to-brand-950/20 border-brand-600/30 shadow-card relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-600">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h2 className="text-base font-black text-ink font-heading">
                    Turn WhatsApp Messages into Business
                  </h2>
                </div>
                <p className="text-xs text-muted max-w-lg">
                  Paste forwarded property listings or client requirements. The AI extracts BHK, price, and location in seconds.
                </p>
              </div>

              <Link to="/app/paste" className="shrink-0">
                <Button size="md" pill className="w-full sm:w-auto font-bold shadow-md shadow-brand-700/20 text-xs">
                  <Plus className="w-4 h-4 mr-1 stroke-[2.5]" />
                  <span>Paste New Message</span>
                </Button>
              </Link>
            </div>

            {/* Quick Suggestions / Chips */}
            <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] text-muted font-bold">Quick Shortcuts:</span>
              <Link
                to="/app/properties/new"
                className="px-3 py-1 rounded-full bg-surface border border-border hover:border-brand-600/40 text-text hover:text-ink transition text-[11px] font-semibold"
              >
                + Add Listing Manually
              </Link>
              <Link
                to="/app/buyers/new"
                className="px-3 py-1 rounded-full bg-surface border border-border hover:border-brand-600/40 text-text hover:text-ink transition text-[11px] font-semibold"
              >
                + Add Buyer Requirement
              </Link>
              <Link
                to="/app/tools/calculator"
                className="px-3 py-1 rounded-full bg-surface border border-border hover:border-brand-600/40 text-text hover:text-ink transition text-[11px] font-semibold"
              >
                Area Unit Converter (Gaj ⇄ Sq.Ft)
              </Link>
            </div>
          </Card>

          {/* 4 Financial & Operational Stat Cards (Quixotic Reference 1 Fintech Style) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Properties */}
            <Card className="p-5 flex flex-col justify-between" interactive>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                    Total Properties
                  </span>
                  <Link
                    to="/app/properties"
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-brand-700 transition"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-ink font-heading">
                    24
                  </span>
                  <span className="text-xs text-muted font-medium">listings</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold dark:bg-brand-950/60 dark:text-brand-600">
                  +14% this month
                </span>
                <span className="text-muted">18 Active</span>
              </div>
            </Card>

            {/* 2. Active Buyers */}
            <Card className="p-5 flex flex-col justify-between" interactive>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                    Active Buyers
                  </span>
                  <Link
                    to="/app/buyers"
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-brand-700 transition"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-ink font-heading">
                    18
                  </span>
                  <span className="text-xs text-muted font-medium">leads</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-info font-bold dark:bg-blue-950/60">
                  +4 qualified
                </span>
                <span className="text-muted">High Intent</span>
              </div>
            </Card>

            {/* 3. Matches Waiting */}
            <Card className="p-5 flex flex-col justify-between" interactive>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                    Matches Waiting
                  </span>
                  <Link
                    to="/app/properties"
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-brand-700 transition"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-brand-700 dark:text-brand-600 font-heading">
                    9
                  </span>
                  <span className="text-xs text-brand-700/80 font-bold">ready</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold dark:bg-brand-950/60 dark:text-brand-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 85%+ score
                </span>
                <span className="text-muted">2 new today</span>
              </div>
            </Card>

            {/* 4. Projected Commission */}
            <Card className="p-5 flex flex-col justify-between" interactive>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                    Expected Pipeline
                  </span>
                  <span className="w-7 h-7 rounded-full bg-gold-bg text-gold-text flex items-center justify-center">
                    <Trophy className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-gold-text font-heading">
                    ₹3.4L
                  </span>
                  <span className="text-xs text-muted font-medium">pipeline</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-gold-bg text-gold-text font-bold">
                  1% avg broker fee
                </span>
                <span className="text-muted">4 deals in progress</span>
              </div>
            </Card>
          </div>

          {/* Deal Activity & Engagement Visualizer (Quixotic Bar & Wave Style) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly / Monthly Activity Bar Chart (Quixotic style) */}
            <Card className="p-5 sm:p-6 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-ink font-heading">
                    Deal Engagement & Match Activity
                  </h3>
                  <p className="text-[11px] text-muted">Client inquiries and property matches per month</p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-700 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+17.8% Growth</span>
                </div>
              </div>

              {/* Styled CSS Bar Visualization matching Quixotic reference */}
              <div className="h-44 pt-6 flex items-end justify-between gap-3 px-2">
                {[
                  { month: 'Jan', height: '45%', value: '14' },
                  { month: 'Feb', height: '60%', value: '19' },
                  { month: 'Mar', height: '52%', value: '16' },
                  { month: 'Apr', height: '95%', value: '32', active: true },
                  { month: 'May', height: '70%', value: '23' },
                  { month: 'Jun', height: '80%', value: '26' },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    {/* Tooltip on active bar */}
                    {bar.active && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-700 text-white text-[10px] font-bold shadow-xs animate-bounce">
                        +17.8%
                      </span>
                    )}
                    <div
                      style={{ height: bar.height }}
                      className={clsx(
                        'w-full max-w-[42px] rounded-t-2xl transition-all duration-300 group-hover:opacity-90',
                        bar.active
                          ? 'bg-gradient-to-t from-brand-700 to-emerald-500 shadow-md shadow-brand-700/20'
                          : 'bg-emerald-100/70 dark:bg-emerald-950/40 hover:bg-emerald-200'
                      )}
                    />
                    <span className="text-[11px] font-bold text-muted group-hover:text-ink">
                      {bar.month}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer summary */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-700" />
                  <span>Current High: April (32 matches closed)</span>
                </span>
                <span className="font-semibold text-ink">Total 130 Inquiries Handled</span>
              </div>
            </Card>

            {/* Pipeline Stage Distribution (Emitra gauge style) */}
            <Card className="p-5 sm:p-6 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-ink font-heading">Deal Pipeline Health</h3>
                <p className="text-[11px] text-muted">Current stage distribution of active leads</p>
              </div>

              <div className="space-y-3 py-2">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-text">Site Visit Scheduled</span>
                    <span className="text-brand-700">8 Deals (40%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-brand-600 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-text">In Active Negotiation</span>
                    <span className="text-blue-600">5 Deals (25%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-text">Token Advance / Finalizing</span>
                    <span className="text-gold">3 Deals (15%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gold rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-bg border border-border/60 text-[11px] text-muted flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>85% conversion probability for site-visited builder floors.</span>
              </div>
            </Card>
          </div>

          {/* Top Matches Waiting Action Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-ink font-heading">
                  High-Priority Matches Waiting
                </h2>
                <p className="text-xs text-muted">
                  Auto-matched inventory ready to be forwarded to clients
                </p>
              </div>
              <Link to="/app/properties" className="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1">
                View All Matches <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchesWaiting.map((match) => (
                <Card key={match.id} className="p-5 flex flex-col justify-between" interactive>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={match.badge as any} pill dot>
                        {match.score}% Match
                      </Badge>
                      <span className="text-[11px] text-muted">{match.date}</span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-ink hover:text-brand-700 transition">
                        {match.propertyTitle}
                      </h3>
                      <p className="text-xs text-muted mt-0.5">{match.locality}</p>
                      <span className="text-xs font-black text-brand-700 mt-1 block">
                        {formatRupees(match.propertyPrice)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-bg border border-border/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted block">Client Lead</span>
                        <span className="font-bold text-ink">{match.buyerName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-muted block">Target Budget</span>
                        <span className="font-semibold text-text">{match.buyerBudget}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Hello! Here is a great property matching your requirement: ${match.propertyTitle} in ${match.locality}. Price: ${formatRupees(match.propertyPrice)}. Let me know if you would like to schedule a site visit!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button size="sm" pill className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Send className="w-3.5 h-3.5 mr-1" />
                        <span>Send on WhatsApp</span>
                      </Button>
                    </a>

                    <Link to="/app/properties">
                      <Button variant="secondary" size="sm" pill className="text-xs font-bold">
                        View Flyer
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TRACK RECORD SEGMENT (§5.3.2) */}
      {activeSegment === 'track-record' && (
        <div className="space-y-6">
          {/* Sub-tabs chips per PRD §5.3.2 */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'active', label: 'Active Deals (Pipeline)' },
              { id: 'wins', label: 'Wins & Closed Deals 🏆' },
              { id: 'lost', label: 'Lost Analysis' },
              { id: 'insights', label: 'Market Insights' },
              { id: 'deleted', label: 'Recently Deleted Vault' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTrackRecordSubTab(tab.id as any)}
                className={clsx(
                  'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer',
                  trackRecordSubTab === tab.id
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'bg-surface border border-border/80 text-muted hover:text-ink'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-tab view containers */}
          <Card className="p-8 text-center">
            {trackRecordSubTab === 'active' && (
              <div className="space-y-4 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 flex items-center justify-center mx-auto">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-ink font-heading">
                  Active Deal Pipeline (Kanban)
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Track every deal across 4 stages: <strong className="text-ink">Interested</strong> → <strong className="text-ink">Site Visit</strong> → <strong className="text-ink">Negotiating</strong> → <strong className="text-ink">Token Finalized</strong>.
                </p>
                <Link to="/app/properties">
                  <Button size="sm" pill className="mt-2 text-xs">
                    View Full Pipeline
                  </Button>
                </Link>
              </div>
            )}

            {trackRecordSubTab === 'wins' && (
              <div className="space-y-4 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-gold-bg text-gold-text flex items-center justify-center mx-auto">
                  <Trophy className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-ink font-heading">
                  Wins & Closed Deal Records
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Every closed property celebration is logged here with brokerage earned, closing timeline, and customer review.
                </p>
                <div className="p-4 rounded-xl bg-bg border border-border text-xs text-muted text-left">
                  <div className="flex justify-between font-bold text-ink">
                    <span>Sample Win: 3 BHK Model Town</span>
                    <span className="text-gold-text">₹1,25,000 Earned</span>
                  </div>
                  <p className="text-[11px] mt-1">Closed in 18 days · 1% brokerage collected from buyer</p>
                </div>
              </div>
            )}

            {trackRecordSubTab === 'lost' && (
              <div className="space-y-4 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-muted flex items-center justify-center mx-auto">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-ink font-heading">
                  Lost Deal Reasons & Insights
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Log why deals fall through (price too high, buyer shifted location, loan rejected) to optimize future matches.
                </p>
              </div>
            )}

            {trackRecordSubTab === 'insights' && (
              <div className="space-y-4 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-info dark:bg-blue-950/60 flex items-center justify-center mx-auto">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-ink font-heading">
                  Locality Supply & Demand Insights
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Panipat & NCR market trends: High buyer demand in Model Town & Sector 12 with low 3 BHK inventory supply.
                </p>
              </div>
            )}

            {trackRecordSubTab === 'deleted' && (
              <div className="space-y-4 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-danger dark:bg-rose-950/60 flex items-center justify-center mx-auto">
                  <Trash2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-ink font-heading">
                  Recently Deleted Vault (30 Days)
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Accidentally deleted a property listing or buyer lead? Recover it anytime within 30 days.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};