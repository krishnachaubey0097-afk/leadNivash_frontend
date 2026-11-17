import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAuth } from '../lib/auth';
import { openWhatsApp, generateSiteVisitWhatsAppText } from '../lib/whatsapp';
import {
  Calendar,
  Sparkles,
  Building2,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
  Share2,
  MapPin,
  IndianRupee,
  PhoneCall,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TodayFeed: React.FC = () => {
  const { user } = useAuth();

  // Load properties count & sample
  const { data: propertiesData, isLoading: loadingProps } = useQuery({
    queryKey: ['properties-summary'],
    queryFn: async () => {
      const res = await apiClient.get('/properties?limit=5&status=available');
      return res.data?.data || [];
    },
  });

  // Load buyers count & sample
  const { data: buyersData, isLoading: loadingBuyers } = useQuery({
    queryKey: ['buyers-summary'],
    queryFn: async () => {
      const res = await apiClient.get('/buyers?limit=5');
      return res.data?.data || [];
    },
  });

  const availableCount = Array.isArray(propertiesData) ? propertiesData.length : 12;
  const buyersCount = Array.isArray(buyersData) ? buyersData.length : 8;

  // Mock actionable follow-up visits for today
  const todayVisits = [
    {
      id: 'v1',
      clientName: 'Vikram Malhotra',
      phone: '9811223344',
      property: '3 BHK Godrej Meridien',
      sector: 'Sector 106, Dwarka Expressway',
      time: '11:30 AM',
      status: 'upcoming',
    },
    {
      id: 'v2',
      clientName: 'Priya Narang',
      phone: '9822334455',
      property: '4 BHK M3M Golfestate',
      sector: 'Golf Course Extension Road',
      time: '03:00 PM',
      status: 'pending_confirmation',
    },
  ];

  return (
    <div className="space-y-5 pb-6">
      {/* Broker Hero Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
              })}
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Namaste, {user?.fullName || 'Broker'} 👋
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              {user?.agencyName || 'LeadNivesh Partner Agency'} • Live Market Cockpit
            </p>
          </div>
          <Link
            to="/app/paste"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-xs font-semibold rounded-xl shadow-md hover:bg-primary-focus transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Quick Parse</span>
          </Link>
        </div>

        {/* 4 Quick Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
          <div className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-xl border border-slate-200/50 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-medium">Available Units</span>
              <Building2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {loadingProps ? '...' : availableCount}
            </p>
          </div>

          <div className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-xl border border-slate-200/50 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-medium">Active Buyers</span>
              <Users className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {loadingBuyers ? '...' : buyersCount}
            </p>
          </div>

          <div className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-xl border border-slate-200/50 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-medium">High Matches</span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">5 Hot</p>
          </div>

          <div className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-xl border border-slate-200/50 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-medium">Today Visits</span>
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">2 Site Visits</p>
          </div>
        </div>
      </div>

      {/* Today's Scheduled Visits & Reminders */}
      <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Today's Field Visits
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            2 Scheduled
          </span>
        </div>

        <div className="space-y-2.5">
          {todayVisits.map((visit) => (
            <div
              key={visit.id}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {visit.clientName}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold">
                    {visit.time}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{visit.property}</span>
                  <span className="text-slate-400">•</span>
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{visit.sector}</span>
                </div>
              </div>

              {/* 1-Tap WhatsApp Confirmation */}
              <button
                onClick={() => {
                  const text = generateSiteVisitWhatsAppText(
                    visit.clientName,
                    visit.property,
                    'Today',
                    visit.time,
                    visit.sector
                  );
                  openWhatsApp(visit.phone, text);
                }}
                className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Confirm WhatsApp</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI Match Alert: Hot Match Spotlight */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              Top Inventory Match
            </span>
          </div>
          <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
            96% Score
          </span>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300">
          Buyer <span className="font-bold text-slate-900 dark:text-white">Amit Bansal</span> (Budget: ₹2.40 Cr, Sector 82) matches freshly listed <span className="font-bold text-slate-900 dark:text-white">DLF The Primus 3 BHK + Servant</span>.
        </p>

        <div className="flex items-center gap-2 mt-3">
          <Link
            to="/app/inventory"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View in Inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-slate-400">•</span>
          <button
            onClick={() => openWhatsApp('9812345678', 'Namaste Amit ji, I found an exact 3 BHK in DLF Primus matching your budget ₹2.40 Cr.')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Connect on WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Quick Launchpad to Tools */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/app/toolkit"
          className="p-4 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <IndianRupee className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            Registry & Duty Calc
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Haryana Male 7% / Female 5%
          </p>
        </Link>

        <Link
          to="/app/toolkit"
          className="p-4 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Building2 className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            Gaj ⟷ Sq.Ft Converter
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Marla, Bigha, Acre units
          </p>
        </Link>
      </div>
    </div>
  );
};
