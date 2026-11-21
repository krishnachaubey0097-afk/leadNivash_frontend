import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Inbox,
  LogOut,
  ChevronRight,
  Check,
  HelpCircle,
} from 'lucide-react';
import { startInteractiveTour } from '../onboarding/OnboardingTour';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { success } = useToast();

  const [agencyName, setAgencyName] = useState('Sharma Real Estate Agency');
  const [reraNo, setReraNo] = useState('HR/PNP/RERA-2024/889');
  const [marlaStandard, setMarlaStandard] = useState<'30.25' | '25'>('25');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    success('Agency profile and regional unit settings saved!');
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-brand-600" />
          <h1 className="text-xl sm:text-2xl font-black text-ink font-heading tracking-tight">
            Settings & Agency Profile
          </h1>
        </div>
        <Badge variant="brand">
          Verified Account
        </Badge>
      </div>

      {/* Agency Identity & Verified Badge Card */}
      <Card className="p-5 sm:p-6 space-y-4 border-emerald-500/30 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-brand-700/20">
              LN
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-ink font-heading">{agencyName}</h2>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-muted">
                Primary Territory: <span className="font-semibold text-ink">Panipat Central & NCR</span>
              </p>
            </div>
          </div>

          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30 self-start sm:self-auto">
            RERA Verified Broker
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Agency / Firm Name
              </label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink font-bold focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                RERA / Registration No.
              </label>
              <input
                type="text"
                value={reraNo}
                onChange={(e) => setReraNo(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink font-bold focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Broker Contact Phone
              </label>
              <input
                type="text"
                disabled
                value={user?.phone || '+91 98120 44321'}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-border rounded-xl p-2.5 text-xs text-muted"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Regional Marla Standard
              </label>
              <select
                value={marlaStandard}
                onChange={(e) => setMarlaStandard(e.target.value as any)}
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink font-bold"
              >
                <option value="25">25 Gaj / Marla (Panipat Local Standard)</option>
                <option value="30.25">30.25 Gaj / Marla (Haryana Official Standard)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button size="sm" pill type="submit" className="font-bold text-xs">
              {isSaved ? (
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Profile Saved</span>
                </span>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Shortcuts & Inbox Card */}
      <Card className="p-4 sm:p-5 space-y-2 border-border shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted pb-1">
          Quick Inboxes & Dashboards
        </h3>

        <Link
          to="/app/inquiries"
          className="p-3 rounded-2xl bg-surface hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-border flex items-center justify-between text-xs transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-ink block group-hover:text-brand-700 transition">
                Public Flyer Inquiries Inbox
              </span>
              <span className="text-muted text-[11px]">View leads captured from shared flyer links</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-brand-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
              4 New
            </span>
            <ChevronRight className="w-4 h-4 text-muted" />
          </div>
        </Link>
      </Card>

      {/* Help & Interactive Guided Tour (Stage 5) */}
      <Card className="p-4 sm:p-5 space-y-2 border-emerald-500/25 bg-gradient-to-br from-white via-emerald-50/20 to-white dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted pb-1">
          Help & Product Tour
        </h3>

        <button
          type="button"
          onClick={() => startInteractiveTour()}
          className="w-full p-3 rounded-2xl bg-surface hover:bg-emerald-50/60 dark:hover:bg-slate-800/80 border border-emerald-500/30 flex items-center justify-between text-xs transition group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-bold text-ink block group-hover:text-emerald-700 transition">
                Take Interactive Product Tour
              </span>
              <span className="text-muted text-[11px]">
                Replay the 7-step guided tour of Dashboard, Inventory, Buyers, Quick Chat, and Tools
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs">
              7 Steps
            </span>
            <ChevronRight className="w-4 h-4 text-muted" />
          </div>
        </button>
      </Card>

      {/* Sign Out Card */}
      <Card className="p-4 border-border">
        <button
          onClick={() => logout()}
          className="w-full py-2.5 px-4 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of leadNivash</span>
        </button>
      </Card>
    </div>
  );
};
