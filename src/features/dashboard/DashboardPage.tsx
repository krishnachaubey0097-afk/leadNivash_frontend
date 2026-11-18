import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import {
  Sparkles,
  Plus,
  Building2,
  Trophy,
  ArrowRight,
  TrendingUp,
  Clock,
  Trash2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import clsx from 'clsx';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Top Segmented control per PRD §5.3: Today | Track Record
  const [activeSegment, setActiveSegment] = useState<'today' | 'track-record'>('today');

  // Track Record sub-tabs per PRD §5.3.2: Active Deals · Wins · Lost · Insights · Recently Deleted
  const [trackRecordSubTab, setTrackRecordSubTab] = useState<
    'active' | 'wins' | 'lost' | 'insights' | 'deleted'
  >('active');

  return (
    <div className="space-y-4 pb-6">
      {/* Top Segmented Control (PRD §5.3) */}
      <div className="flex p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-input max-w-sm mx-auto w-full">
        <button
          onClick={() => setActiveSegment('today')}
          className={clsx(
            'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer',
            activeSegment === 'today'
              ? 'bg-surface text-brand-700 shadow-sm'
              : 'text-muted hover:text-ink'
          )}
        >
          Today
        </button>
        <button
          onClick={() => setActiveSegment('track-record')}
          className={clsx(
            'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer',
            activeSegment === 'track-record'
              ? 'bg-surface text-brand-700 shadow-sm'
              : 'text-muted hover:text-ink'
          )}
        >
          Track Record
        </button>
      </div>

      {/* TODAY SEGMENT (§5.3.1) */}
      {activeSegment === 'today' && (
        <div className="space-y-4">
          {/* Greeting & Action Header */}
          <div className="p-5 rounded-card bg-surface border border-border space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
                <h2 className="text-lg font-black text-ink font-heading mt-0.5">
                  Namaste, {user?.name || 'Broker'} 👋
                </h2>
                <p className="text-xs text-muted">
                  {user?.agency?.name || 'LeadNivesh Partner Agency'}
                </p>
              </div>

              <Link to="/app/paste">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Paste Message</span>
                </Button>
              </Link>
            </div>

            {/* Big "Message paste karo" button per PRD §5.3.1 */}
            <Link
              to="/app/paste"
              className="block p-4 rounded-input bg-brand-50 border border-brand-600/30 hover:border-brand-600 transition group text-center"
            >
              <div className="flex items-center justify-center gap-2 text-brand-700 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Message paste karo — match mil jayega</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Pipeline Strip (§5.3.1): Expected / Pending / Received */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3.5 bg-surface border border-border rounded-card text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                Expected
              </span>
              <span className="text-base font-extrabold text-ink mt-0.5 block">₹0</span>
            </div>
            <div className="p-3.5 bg-surface border border-border rounded-card text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-warn block">
                Pending
              </span>
              <span className="text-base font-extrabold text-warn mt-0.5 block">₹0</span>
            </div>
            <div className="p-3.5 bg-surface border border-border rounded-card text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block">
                Received
              </span>
              <span className="text-base font-extrabold text-brand-700 mt-0.5 block">₹0</span>
            </div>
          </div>

          {/* First-Week Onboarding Checklist (§5.3.1) */}
          <div className="p-4 bg-surface border border-border rounded-card space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-heading">
              Quick Setup Checklist
            </h3>
            <div className="space-y-2">
              <Link
                to="/app/properties/new"
                className="flex items-center justify-between p-2.5 rounded-input bg-bg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold text-text"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-brand-600" />
                  <span>1. Pehli property listing add karein</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted" />
              </Link>

              <Link
                to="/app/paste"
                className="flex items-center justify-between p-2.5 rounded-input bg-bg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold text-text"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>2. Client requirement paste karein</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TRACK RECORD SEGMENT (§5.3.2) */}
      {activeSegment === 'track-record' && (
        <div className="space-y-4">
          {/* Sub-tabs chips per PRD §5.3.2 */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'active', label: 'Active Deals' },
              { id: 'wins', label: 'Wins 🏆' },
              { id: 'lost', label: 'Lost' },
              { id: 'insights', label: 'Insights' },
              { id: 'deleted', label: 'Recently Deleted' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTrackRecordSubTab(tab.id as any)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer',
                  trackRecordSubTab === tab.id
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'bg-surface border border-border text-muted hover:text-ink'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-tab view containers */}
          <div className="p-6 bg-surface border border-border rounded-card text-center space-y-2">
            {trackRecordSubTab === 'active' && (
              <>
                <TrendingUp className="w-8 h-8 text-brand-600 mx-auto opacity-70 mb-2" />
                <h3 className="text-sm font-bold text-ink">Active Pipeline</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Deals in interested, shown, negotiating, and finalized stages will appear here.
                </p>
              </>
            )}

            {trackRecordSubTab === 'wins' && (
              <>
                <Trophy className="w-8 h-8 text-gold mx-auto opacity-70 mb-2" />
                <h3 className="text-sm font-bold text-ink">Wins & Achievements</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Aapki pehli jeet yahan dikhegi 🏆
                </p>
              </>
            )}

            {trackRecordSubTab === 'lost' && (
              <>
                <Clock className="w-8 h-8 text-muted mx-auto opacity-70 mb-2" />
                <h3 className="text-sm font-bold text-ink">Lost Deals</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Koi lost deal nahi — badhiya!
                </p>
              </>
            )}

            {trackRecordSubTab === 'insights' && (
              <>
                <Sparkles className="w-8 h-8 text-brand-600 mx-auto opacity-70 mb-2" />
                <h3 className="text-sm font-bold text-ink">Performance Insights</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Conversion metrics, average days to close, and locality supply-demand gaps.
                </p>
              </>
            )}

            {trackRecordSubTab === 'deleted' && (
              <>
                <Trash2 className="w-8 h-8 text-danger mx-auto opacity-70 mb-2" />
                <h3 className="text-sm font-bold text-ink">Recently Deleted Vault</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Delete kiya hua 30 din tak wapas la sakte hain.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
