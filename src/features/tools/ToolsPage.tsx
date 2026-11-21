import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Copy,
  Check,
  Sparkles,
  Maximize2,
  Building2,
  Calculator,
  TrendingUp,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Layers,
  Send,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../auth/AuthProvider';
import { formatRupees } from '../../lib/money';
import {
  convertAllUnits,
  calculateHaryanaRegistry,
  calculateEmi,
  calculateCommissionSplit,
  type AreaUnit,
  type BuyerGender,
  type AreaType,
} from '../../lib/calculators';
import clsx from 'clsx';

export type ToolId = 'area' | 'registry' | 'emi' | 'commission' | 'templates';

export const ToolsPage: React.FC = () => {
  const { toolId } = useParams<{ toolId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { success } = useToast();

  const validTools: ToolId[] = ['emi', 'registry', 'area', 'commission', 'templates'];
  const rawToolId = (toolId || searchParams.get('tool') || searchParams.get('tab')) as ToolId | undefined;
  const activeTool: ToolId | null = rawToolId && validTools.includes(rawToolId) ? rawToolId : null;

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSelectTool = (id: ToolId) => {
    navigate(`/app/tools/${id}`);
  };

  const handleBackToHub = () => {
    navigate('/app/tools');
  };

  const toolsList = [
    {
      id: 'emi' as const,
      label: 'Home Loan EMI Calculator',
      icon: Calculator,
      badge: 'Amount · ROI · Tenure',
      desc: 'Detailed monthly installments, interest breakdown, down payment planning & client WhatsApp quotation.',
      features: [
        'Adjust Loan Principal, ROI (8.5% benchmark) & Tenure (5 - 30 yrs)',
        'Property Cost & Down Payment Planning Mode',
        'Year-by-Year Amortization Schedule & Balance Payoff',
        '1-Tap Client WhatsApp Quotation Generator',
      ],
      gradient: 'from-emerald-600/10 via-white to-emerald-100/30 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900',
      borderColor: 'border-emerald-600/30',
      iconBg: 'bg-emerald-600/10 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      tag: 'Most Popular',
    },
    {
      id: 'registry' as const,
      label: 'Haryana Registry & Stamp Duty',
      icon: Building2,
      badge: 'Circle Rate · 5% - 7%',
      desc: 'Official Tehsil stamp fee estimator with female concession (5%), male rate (7%), and municipal cess.',
      features: [
        'Property Circle Rate & Total Consideration Value',
        'Female (5%), Male (7%) & Joint (6%) Ownership Concessions',
        'Urban Municipal Area (+2%) vs Rural Gram Panchayat',
        'Itemized Government Registration Fees & Stamp Breakdown',
      ],
      gradient: 'from-teal-500/10 via-white to-teal-100/30 dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-900',
      borderColor: 'border-teal-500/30',
      iconBg: 'bg-teal-500/10 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
      tag: 'Tehsil Standard',
    },
    {
      id: 'area' as const,
      label: 'Area Unit Converter',
      icon: Maximize2,
      badge: 'Gaj · Sq Ft · Kanal',
      desc: 'Instant Haryana land unit conversion between Gaj, Marla (25 / 30.25 local standard), Kanal, and Sq. Feet.',
      features: [
        'Instant multi-unit conversion grid (Gaj, Sq.Ft, Sq.Mt, Marla, Bigha, Acre)',
        'One-click quick presets: 100, 180, 250, 350, 500 Gaj & 1 Kanal',
        'Panipat 25 Gaj local & 30.25 Haryana standard calculation',
        '1-Tap WhatsApp Plot Size Statement Generator',
      ],
      gradient: 'from-emerald-500/10 via-white to-emerald-100/30 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900',
      borderColor: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      tag: 'Field Essential',
    },
    {
      id: 'commission' as const,
      label: 'Brokerage & Commission Splitter',
      icon: TrendingUp,
      badge: '1% - 2% Deals · Co-Brokers',
      desc: 'Calculate total brokerage earned, partner co-broker splits, and net agency take-home payout.',
      features: [
        '1.0% (Single Side), 2.0% (Both Sides), 0.5% (Large Ticket)',
        '50/50 Equal Co-Broker & 60/40 Lead Broker Splits',
        'Agency House Share Cut (0% Solo, 10%, 20%, 30%)',
        'Transparent Deal Settlement Figures for Partners',
      ],
      gradient: 'from-blue-500/10 via-white to-blue-100/30 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500/10 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      tag: 'Co-Brokering',
    },
    {
      id: 'templates' as const,
      label: 'WhatsApp Deal Templates',
      icon: MessageSquare,
      badge: 'Pre-formatted Chips',
      desc: 'Instant deal pitch chips, bayana advance receipts & Tehsil document checklists ready to forward.',
      features: [
        'Site Visit Confirmation with Google Maps Location Pin',
        'Token Advance / Bayana Formal Receipt Note',
        'Tehsil Registry Document Checklist (Aadhaar, PAN, Witnesses, NOC)',
        '1-Click Copy and Direct Share to WhatsApp',
      ],
      gradient: 'from-slate-900/5 via-white to-emerald-500/10 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20',
      borderColor: 'border-slate-500/30',
      iconBg: 'bg-slate-900/10 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
      tag: '1-Tap Messages',
    },
  ];

  const agencyName = user?.agency?.name?.trim();
  const ownerName = user?.name?.trim();
  const agencyOrOwnerName =
    agencyName && ownerName && agencyName !== ownerName
      ? `${agencyName} · ${ownerName}`
      : agencyName || ownerName || 'LeadNivash Partner';

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    success('Copied to clipboard for WhatsApp!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // -------------------------------------------------------------
  // Tool 1: Area Converter State
  // -------------------------------------------------------------
  const [areaValue, setAreaValue] = useState<number>(250);
  const [fromUnit, setFromUnit] = useState<AreaUnit>('gaj');
  const convertedUnits = convertAllUnits(areaValue, fromUnit);

  const areaPresets = [
    { label: '100 Gaj', val: 100, unit: 'gaj' as AreaUnit },
    { label: '180 Gaj', val: 180, unit: 'gaj' as AreaUnit },
    { label: '250 Gaj', val: 250, unit: 'gaj' as AreaUnit },
    { label: '350 Gaj', val: 350, unit: 'gaj' as AreaUnit },
    { label: '500 Gaj', val: 500, unit: 'gaj' as AreaUnit },
    { label: '1 Kanal (605 Gaj)', val: 605, unit: 'gaj' as AreaUnit },
  ];

  // -------------------------------------------------------------
  // Tool 2: Haryana Registry & Stamp Duty State
  // -------------------------------------------------------------
  const [registryPriceLakhs, setRegistryPriceLakhs] = useState<number>(85);
  const [buyerGender, setBuyerGender] = useState<BuyerGender>('male');
  const [areaType, setAreaType] = useState<AreaType>('urban');
  const registryCalc = calculateHaryanaRegistry(
    registryPriceLakhs * 100000,
    buyerGender,
    areaType
  );

  // -------------------------------------------------------------
  // Tool 3: EMI Calculator State (Enhanced with Amount, ROI, Tenure & Down Payment)
  // -------------------------------------------------------------
  const [loanCalcMode, setLoanCalcMode] = useState<'direct' | 'property'>('direct');
  const [loanLakhs, setLoanLakhs] = useState<number>(60);
  const [propertyPriceLakhs, setPropertyPriceLakhs] = useState<number>(75);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years');
  const [processingFeePercent, setProcessingFeePercent] = useState<number>(0.5);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);

  // Compute effective loan principal based on mode
  const effectiveLoanAmount =
    loanCalcMode === 'property'
      ? Math.max(0, propertyPriceLakhs * 100000 * (1 - downPaymentPercent / 100))
      : loanLakhs * 100000;

  const effectiveTenureYears = tenureUnit === 'months' ? tenureYears / 12 : tenureYears;
  const emiCalc = calculateEmi(effectiveLoanAmount, interestRate, effectiveTenureYears);

  const estimatedProcessingFee = Math.round(effectiveLoanAmount * (processingFeePercent / 100));
  const principalPercent =
    emiCalc.totalPayment > 0 ? Math.round((emiCalc.principal / emiCalc.totalPayment) * 100) : 50;
  const interestPercent = 100 - principalPercent;

  const getAmortizationMilestones = () => {
    if (!effectiveLoanAmount || !interestRate || !effectiveTenureYears) return [];
    const monthlyRate = interestRate / (12 * 100);
    const totalMonths = Math.round(effectiveTenureYears * 12);
    const emi = emiCalc.monthlyEmi;

    let balance = effectiveLoanAmount;
    let totalPrincipalPaid = 0;
    let totalInterestPaid = 0;
    const schedule: Array<{ year: number; balance: number; principalPaid: number; interestPaid: number }> = [];

    for (let m = 1; m <= totalMonths; m++) {
      const interestForMonth = Math.round(balance * monthlyRate);
      const principalForMonth = Math.min(balance, emi - interestForMonth);
      balance = Math.max(0, balance - principalForMonth);
      totalPrincipalPaid += principalForMonth;
      totalInterestPaid += interestForMonth;

      if (m % 12 === 0 || m === totalMonths) {
        const year = Math.ceil(m / 12);
        if (year <= 5 || year % 5 === 0 || m === totalMonths) {
          schedule.push({
            year,
            balance,
            principalPaid: totalPrincipalPaid,
            interestPaid: totalInterestPaid,
          });
        }
      }
    }
    return schedule;
  };

  const emiQuoteText = `*Home Loan EMI Quotation*
━━━━━━━━━━━━━━━━━━━━
• Loan Amount: ₹${(effectiveLoanAmount / 100000).toFixed(2)} Lakhs
• Interest Rate (ROI): ${interestRate}% p.a.
• Loan Tenure: ${tenureUnit === 'months' ? `${tenureYears} Months` : `${tenureYears} Years (${Math.round(tenureYears * 12)} Mos)`}
${loanCalcMode === 'property' ? `• Property Cost: ₹${propertyPriceLakhs} Lakhs (Down Payment: ${downPaymentPercent}% / ₹${((propertyPriceLakhs * downPaymentPercent) / 100).toFixed(2)}L)\n` : ''}━━━━━━━━━━━━━━━━━━━━
*Monthly EMI: ₹${emiCalc.monthlyEmi.toLocaleString('en-IN')} / month*
• Principal Borrowed: ₹${emiCalc.principal.toLocaleString('en-IN')}
• Total Interest: ₹${emiCalc.totalInterest.toLocaleString('en-IN')}
• Total Repayment: ₹${emiCalc.totalPayment.toLocaleString('en-IN')}
• Est. Bank Processing Fee (${processingFeePercent}%): ₹${estimatedProcessingFee.toLocaleString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
*LeadNivash Verified Financing Quote*
${agencyOrOwnerName}`;

  // -------------------------------------------------------------
  // Tool 4: Commission Splitter State
  // -------------------------------------------------------------
  const [dealValueLakhs, setDealValueLakhs] = useState<number>(100);
  const [commissionRate, setCommissionRate] = useState<number>(1.0);
  const [agencyCut, setAgencyCut] = useState<number>(20);
  const [splitRatio, setSplitRatio] = useState<number>(50);
  const commSplit = calculateCommissionSplit(
    dealValueLakhs * 100000,
    commissionRate,
    agencyCut,
    splitRatio
  );

  // -------------------------------------------------------------
  // Tool 5: WhatsApp Action Templates
  // -------------------------------------------------------------
  const templates = [
    {
      id: 'site-visit',
      title: 'Site Visit Confirmation',
      desc: 'Send to client confirming inspection time and landmark',
      text: `Namaste ji, kal sham 4:00 baje Ansal Sushant City Sector 18 Panipat par plot visit confirm hai.\n📍 Location: https://maps.google.com\nKoi badlaav ho to pehle batayein.\n\n— ${agencyOrOwnerName}`,
    },
    {
      id: 'token-receipt',
      title: 'Token Advance Acknowledgment',
      desc: 'Instant receipt for bayana / token received',
      text: `Receipt Note:\nToken advance ₹50,000 received for Deal: 250 Gaj Plot, Sector 18 Panipat.\nAgreement timeline: 15 Days.\nBalance deal value to be executed as per registry schedule.\n\n— ${agencyOrOwnerName}`,
    },
    {
      id: 'doc-checklist',
      title: 'Registry Document Checklist',
      desc: 'Checklist for buyer before going to Tehsil',
      text: `Tehsil Registry Document Checklist:\n1. Buyer & Seller Aadhaar Card (Original + 2 copies)\n2. PAN Card of both parties\n3. 4 Passport size color photos\n4. 2 Witnesses with valid Voter ID / Aadhaar\n5. Circle rate demand draft / stamp receipt\n6. Municipal / HUDA No Objection Certificate (NOC)\n\n— ${agencyOrOwnerName}`,
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-16 text-left">
      {activeTool === null ? (
        <div className="space-y-6 animate-hero-up">
          {/* Top Header with Apple Glass Gradient */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white/95 via-emerald-50/70 to-emerald-100/40 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-emerald-950/20 backdrop-blur-xl border border-emerald-500/25 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-ink font-heading tracking-tight">
                  Broker Toolkit & Calculators
                </h1>
                <Badge variant="brand">
                  <Sparkles className="w-3 h-3 mr-1 inline" />
                  5 Dedicated Tools
                </Badge>
              </div>
              <p className="text-xs text-muted mt-1 max-w-xl">
                Choose any tool below to launch its dedicated calculation workspace on desktop or mobile. Fast Haryana circle rates, EMI quotations, unit conversions & brokerage splits.
              </p>
            </div>
          </div>

          {/* Grid of Dedicated Tool Cards (Responsive: 1-col on mobile, 2-col on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toolsList.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  onClick={() => handleSelectTool(tool.id)}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4 group cursor-pointer text-left"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={clsx(
                          'w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs shrink-0 transition-transform group-hover:scale-105 border border-emerald-500/20',
                          tool.iconBg
                        )}
                      >
                        <Icon className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                        {tool.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-ink font-heading group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {tool.label}
                      </h3>
                      <p className="text-xs text-muted mt-1 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-1.5 pt-1">
                      {tool.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/70 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                      {tool.badge}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTool(tool.id);
                      }}
                      className="px-4 py-2 rounded-full bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Open Tool</span>
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* DEDICATED TOOL WORKSPACE INTERFACE */
        <div className="space-y-5 animate-hero-up">
          {/* Dedicated Header Bar with Back Button & Quick Switcher */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-white/95 via-emerald-50/70 to-emerald-100/40 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-emerald-950/30 backdrop-blur-md border border-emerald-500/25 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBackToHub}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 text-xs font-black text-ink hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer border border-border shadow-2xs self-start"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-700" />
                <span>← All Tools & Calculators</span>
              </button>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[10px] uppercase font-bold text-muted">Dedicated Tool:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs border border-emerald-500/30">
                  {toolsList.find((t) => t.id === activeTool)?.label}
                </span>
              </div>
            </div>

            {/* Quick Switcher Bar across all 5 tools */}
            <div className="pt-2 border-t border-emerald-500/20 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              <span className="text-[10px] font-bold uppercase text-muted whitespace-nowrap shrink-0">
                Quick Switch:
              </span>
              {toolsList.map((t) => {
                const Icon = t.icon;
                const isSelected = activeTool === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTool(t.id)}
                    className={clsx(
                      'px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 border',
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-muted hover:text-ink border-border/80'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DEDICATED TOOL COMPONENT CONTAINER */}
          <div>

      {/* ======================================================== */}
      {/* TOOL 1: AREA UNIT CONVERTER                              */}
      {/* ======================================================== */}
      {activeTool === 'area' && (
        <Card className="p-5 sm:p-6 space-y-5 border-emerald-500/30 shadow-card animate-in fade-in duration-200">
          <div>
            <h2 className="text-base font-black text-ink font-heading">
              Haryana / NCR Land Area Converter
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Standard Haryana conversion: 1 Gaj = 9 Sq.Ft · 1 Marla = 25 Gaj (Panipat local) · 1 Acre = 4,840 Gaj.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Presets:</span>
            {areaPresets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAreaValue(p.val);
                  setFromUnit(p.unit);
                }}
                className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-700 text-[11px] font-semibold border border-border transition cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Input Value
              </label>
              <input
                type="number"
                value={areaValue}
                onChange={(e) => setAreaValue(Number(e.target.value))}
                className="w-full bg-surface border border-border rounded-xl p-3 text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Source Unit
              </label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value as AreaUnit)}
                className="w-full bg-surface border border-border rounded-xl p-3 text-xs font-bold text-ink"
              >
                <option value="gaj">Gaj / Sq.Yards (गज)</option>
                <option value="sqft">Square Feet (Sq.Ft)</option>
                <option value="sqmt">Square Meters (Sq.Mt)</option>
                <option value="marla">Marla (मरला - 25 Gaj)</option>
                <option value="bigha">Bigha (बीघा - 1000 Gaj)</option>
                <option value="acre">Acre (एकड़ - 4840 Gaj)</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-500/30 space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-muted">Gaj / Sq.Yards</span>
              <span className="text-lg font-black text-brand-700 dark:text-brand-600 block">
                {convertedUnits.gaj} Gaj
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-muted">Square Feet</span>
              <span className="text-lg font-bold text-ink block">
                {convertedUnits.sqft.toLocaleString('en-IN')} Sq.Ft
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-muted">Marla</span>
              <span className="text-lg font-bold text-ink block">
                {convertedUnits.marla} Marla
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-muted">Square Meters</span>
              <span className="text-lg font-bold text-ink block">
                {convertedUnits.sqmt} Sq.Mt
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-muted">Bigha</span>
              <span className="text-lg font-bold text-ink block">
                {convertedUnits.bigha} Bigha
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-muted">Acre</span>
              <span className="text-lg font-bold text-ink block">
                {convertedUnits.acre} Acre
              </span>
            </div>
          </div>

          {/* Copy statement button */}
          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              pill
              variant="secondary"
              onClick={() =>
                handleCopyText(
                  `Plot Size Calculation:\n${convertedUnits.gaj} Gaj = ${convertedUnits.sqft} Sq.Ft (${convertedUnits.marla} Marla).\nShared via leadNivash Broker Toolkit`,
                  'copy-area'
                )
              }
              className="text-xs font-bold flex items-center gap-1.5"
            >
              {copiedId === 'copy-area' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'copy-area' ? 'Copied' : 'Copy Area Statement'}</span>
            </Button>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* TOOL 2: HARYANA REGISTRY & STAMP DUTY CALCULATOR         */}
      {/* ======================================================== */}
      {activeTool === 'registry' && (
        <Card className="p-5 sm:p-6 space-y-5 border-emerald-500/30 shadow-card animate-in fade-in duration-200">
          <div>
            <h2 className="text-base font-black text-ink font-heading">
              Haryana Registry & Stamp Duty Estimator
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Current circle rate tax: Female 5% (concession) · Male 7% · Joint 6% + Haryana Municipal Cess.
            </p>
          </div>

          {/* Property Value Input */}
          <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-500/30 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-brand-900 dark:text-brand-300 uppercase tracking-wider text-[10px]">
                Property Consideration / Circle Value
              </label>
              <span className="text-sm font-black text-brand-700 dark:text-brand-600">
                ₹{registryPriceLakhs >= 100 ? `${(registryPriceLakhs / 100).toFixed(2)} Cr` : `${registryPriceLakhs} Lakhs`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-muted text-sm">₹</span>
              <input
                type="number"
                value={registryPriceLakhs}
                onChange={(e) => setRegistryPriceLakhs(Number(e.target.value))}
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
              <span className="text-muted text-xs font-bold whitespace-nowrap">Lakhs</span>
            </div>
          </div>

          {/* Gender & Area Type Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
                Buyer Ownership
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'female', label: 'Female (5%)' },
                  { id: 'male', label: 'Male (7%)' },
                  { id: 'joint', label: 'Joint (6%)' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setBuyerGender(g.id as BuyerGender)}
                    className={clsx(
                      'py-2 px-1 min-h-[44px] flex items-center justify-center rounded-xl text-[11px] font-bold transition cursor-pointer border text-center',
                      buyerGender === g.id
                        ? 'bg-brand-700 text-white border-brand-700 shadow-xs'
                        : 'bg-surface border-border text-muted hover:text-ink'
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
                Municipality / Area Limit
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'urban', label: 'Urban (MC Area +2%)' },
                  { id: 'rural', label: 'Rural (Gram Panchayat)' },
                ].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAreaType(a.id as AreaType)}
                    className={clsx(
                      'py-2 px-2 min-h-[44px] flex items-center justify-center rounded-xl text-[11px] font-bold transition cursor-pointer border text-center',
                      areaType === a.id
                        ? 'bg-brand-700 text-white border-brand-700 shadow-xs'
                        : 'bg-surface border-border text-muted hover:text-ink'
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-500/30 space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-muted">Total Govt Fees</span>
              <span className="text-lg font-black text-brand-700 dark:text-brand-600 block">
                {formatRupees(registryCalc.totalGovtFees * 100)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-muted">Stamp Duty ({registryCalc.stampDutyPercent}%)</span>
              <span className="text-lg font-bold text-ink block">
                {formatRupees(registryCalc.stampDutyAmount * 100)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-muted">Govt Registration Fee</span>
              <span className="text-lg font-bold text-ink block">
                {formatRupees(registryCalc.registrationFee * 100)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-muted">Total Net Outflow</span>
              <span className="text-lg font-bold text-ink block">
                {formatRupees(registryCalc.netEstimatedCost * 100)}
              </span>
            </div>
          </div>

          {/* Copy quotation button */}
          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              pill
              variant="secondary"
              onClick={() =>
                handleCopyText(
                  `Haryana Registry Cost Estimate:\nProperty Value: ₹${registryPriceLakhs} Lakhs\nBuyer Ownership: ${buyerGender.toUpperCase()}\nStamp Duty (${registryCalc.stampDutyPercent}%): ₹${registryCalc.stampDutyAmount.toLocaleString('en-IN')}\nGovt Registration Fee: ₹${registryCalc.registrationFee.toLocaleString('en-IN')}\nTotal Govt Expenses: ₹${registryCalc.totalGovtFees.toLocaleString('en-IN')}\n\n— ${agencyOrOwnerName}`,
                  'copy-registry'
                )
              }
              className="text-xs font-bold flex items-center gap-1.5"
            >
              {copiedId === 'copy-registry' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'copy-registry' ? 'Copied' : 'Copy Client Registry Quote'}</span>
            </Button>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* TOOL 3: HOME LOAN & MONTHLY EMI CALCULATOR (ENHANCED)    */}
      {/* ======================================================== */}
      {activeTool === 'emi' && (
        <Card className="p-5 sm:p-6 space-y-6 border-emerald-500/30 shadow-card animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </span>
                <h2 className="text-base font-black text-ink font-heading">
                  Home Loan & Monthly EMI Calculator
                </h2>
              </div>
              <p className="text-xs text-muted mt-1">
                Customize exact loan amount, interest rate (ROI), tenure, and down payment for buyers.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full text-[11px] font-bold shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setLoanCalcMode('direct')}
                className={clsx(
                  'px-3 py-1.5 min-h-[44px] flex items-center rounded-full transition-all cursor-pointer',
                  loanCalcMode === 'direct'
                    ? 'bg-white dark:bg-slate-700 text-ink shadow-xs'
                    : 'text-muted hover:text-ink'
                )}
              >
                Direct Loan
              </button>
              <button
                type="button"
                onClick={() => setLoanCalcMode('property')}
                className={clsx(
                  'px-3 py-1.5 min-h-[44px] flex items-center rounded-full transition-all cursor-pointer',
                  loanCalcMode === 'property'
                    ? 'bg-white dark:bg-slate-700 text-ink shadow-xs'
                    : 'text-muted hover:text-ink'
                )}
              >
                From Property Cost
              </button>
            </div>
          </div>

          <div className="space-y-5 text-xs">
            {/* Conditional Property Cost & Down Payment Inputs if 'property' mode */}
            {loanCalcMode === 'property' && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <Building2 className="w-4 h-4" />
                  <span>Property Cost & Down Payment Planning</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Property Cost Input */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
                      Total Property Cost (₹ Lakhs)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted font-bold">₹</span>
                      <input
                        type="number"
                        min={5}
                        max={1000}
                        step={1}
                        value={propertyPriceLakhs}
                        onChange={(e) => setPropertyPriceLakhs(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-surface border border-border rounded-xl pl-8 pr-16 py-2 text-xs font-bold text-ink focus:border-brand-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-[11px] text-muted font-bold">Lakhs</span>
                    </div>
                  </div>

                  {/* Down Payment % */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <label className="font-bold text-ink uppercase tracking-wider">
                        Down Payment (% & Cash)
                      </label>
                      <span className="font-black text-brand-700 dark:text-brand-400">
                        ₹{((propertyPriceLakhs * downPaymentPercent) / 100).toFixed(2)} Lakhs ({downPaymentPercent}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={10}
                        max={60}
                        step={5}
                        value={downPaymentPercent}
                        onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                        className="flex-1 accent-emerald-700 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <div className="relative w-20 shrink-0">
                        <input
                          type="number"
                          min={5}
                          max={90}
                          value={downPaymentPercent}
                          onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                          className="w-full bg-surface border border-border rounded-xl px-2 py-1.5 text-xs font-bold text-ink text-center pr-5"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-muted font-bold">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-muted">
                    Buyer Cash Needed: <strong className="text-ink">₹{((propertyPriceLakhs * downPaymentPercent) / 100).toFixed(2)} Lakhs</strong>
                  </span>
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-emerald-900/50 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">
                    Net Bank Loan Required: ₹{(effectiveLoanAmount / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
              </div>
            )}

            {/* Loan Principal Input (if direct mode) */}
            {loanCalcMode === 'direct' && (
              <div className="space-y-2 p-4 rounded-2xl bg-surface border border-border/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
                      Loan Principal Amount
                    </label>
                    <p className="text-[10px] text-muted">Enter exact loan amount or adjust slider</p>
                  </div>
                  <div className="relative w-44">
                    <span className="absolute left-3 top-2.5 text-muted font-bold">₹</span>
                    <input
                      type="number"
                      min={1}
                      max={2000}
                      step={0.5}
                      value={loanLakhs}
                      onChange={(e) => setLoanLakhs(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white dark:bg-slate-900 border border-border rounded-xl pl-7 pr-14 py-2 text-xs font-black text-brand-700 dark:text-brand-400 focus:border-brand-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] text-muted font-bold">Lakhs</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={5}
                  max={300}
                  step={1}
                  value={loanLakhs}
                  onChange={(e) => setLoanLakhs(Number(e.target.value))}
                  className="w-full accent-emerald-700 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-muted font-bold uppercase mr-1">Quick Presets:</span>
                  {[25, 40, 60, 80, 100, 150, 200].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLoanLakhs(preset)}
                      className={clsx(
                        'px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer',
                        loanLakhs === preset
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      )}
                    >
                      {preset >= 100 ? `₹${(preset / 100).toFixed(preset % 100 === 0 ? 0 : 1)} Cr` : `₹${preset}L`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interest Rate (ROI) Input */}
            <div className="space-y-2 p-4 rounded-2xl bg-surface border border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
                    Rate of Interest (ROI % p.a.)
                  </label>
                  <p className="text-[10px] text-muted">Direct input or select popular bank benchmark</p>
                </div>
                <div className="relative w-36">
                  <input
                    type="number"
                    min={4.0}
                    max={20.0}
                    step={0.05}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white dark:bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs font-black text-ink text-right pr-7 focus:border-brand-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-muted font-bold">%</span>
                </div>
              </div>

              <input
                type="range"
                min={6.5}
                max={14.0}
                step={0.05}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-emerald-700 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />

              {/* Bank Benchmarks */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-muted font-bold uppercase mr-1">Bank Rates:</span>
                {[
                  { name: 'SBI', rate: 8.5 },
                  { name: 'HDFC', rate: 8.7 },
                  { name: 'ICICI', rate: 8.75 },
                  { name: 'PNB', rate: 8.4 },
                  { name: 'Axis', rate: 8.9 },
                ].map((bank) => (
                  <button
                    key={bank.name}
                    type="button"
                    onClick={() => setInterestRate(bank.rate)}
                    className={clsx(
                      'px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer',
                      interestRate === bank.rate
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    )}
                  >
                    {bank.name} ({bank.rate}%)
                  </button>
                ))}
              </div>
            </div>

            {/* Tenure Input */}
            <div className="space-y-2 p-4 rounded-2xl bg-surface border border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div>
                    <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
                      Loan Tenure
                    </label>
                    <p className="text-[10px] text-muted">
                      {tenureUnit === 'years'
                        ? `${tenureYears} Years (${Math.round(tenureYears * 12)} Monthly EMIs)`
                        : `${tenureYears} Months (${(tenureYears / 12).toFixed(1)} Years)`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        if (tenureUnit === 'months') {
                          setTenureYears(Math.max(1, Math.round(tenureYears / 12)));
                          setTenureUnit('years');
                        }
                      }}
                      className={clsx(
                        'px-2 py-1 rounded-md transition-all cursor-pointer',
                        tenureUnit === 'years' ? 'bg-white dark:bg-slate-700 text-ink shadow-xs' : 'text-muted'
                      )}
                    >
                      Years
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (tenureUnit === 'years') {
                          setTenureYears(Math.round(tenureYears * 12));
                          setTenureUnit('months');
                        }
                      }}
                      className={clsx(
                        'px-2 py-1 rounded-md transition-all cursor-pointer',
                        tenureUnit === 'months' ? 'bg-white dark:bg-slate-700 text-ink shadow-xs' : 'text-muted'
                      )}
                    >
                      Months
                    </button>
                  </div>

                  <div className="relative w-28">
                    <input
                      type="number"
                      min={1}
                      max={tenureUnit === 'years' ? 35 : 420}
                      value={tenureYears}
                      onChange={(e) => setTenureYears(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white dark:bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs font-black text-ink text-right pr-9 focus:border-brand-500 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-2.5 text-[10px] text-muted font-bold">
                      {tenureUnit === 'years' ? 'Yrs' : 'Mos'}
                    </span>
                  </div>
                </div>
              </div>

              <input
                type="range"
                min={tenureUnit === 'years' ? 3 : 36}
                max={tenureUnit === 'years' ? 30 : 360}
                step={tenureUnit === 'years' ? 1 : 12}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full accent-emerald-700 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />

              {/* Quick Tenure Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-muted font-bold uppercase mr-1">Tenure Presets:</span>
                {(tenureUnit === 'years' ? [5, 10, 15, 20, 25, 30] : [60, 120, 180, 240, 300, 360]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTenureYears(preset)}
                    className={clsx(
                      'px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer',
                      tenureYears === preset
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    )}
                  >
                    {tenureUnit === 'years' ? `${preset} Yrs` : `${preset} Mos`}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Details: Processing Fee & Charges */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                  %
                </div>
                <div>
                  <span className="font-bold text-ink text-[11px] block">Est. Bank Processing Fee</span>
                  <span className="text-[10px] text-muted">Standard 0.25% - 1.00% charged by lending institutions</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-24">
                  <input
                    type="number"
                    min={0}
                    max={3}
                    step={0.1}
                    value={processingFeePercent}
                    onChange={(e) => setProcessingFeePercent(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-white dark:bg-slate-900 border border-border rounded-xl px-2 py-1.5 text-xs font-bold text-ink text-center pr-5"
                  />
                  <span className="absolute right-2 top-1.5 text-[10px] text-muted font-bold">%</span>
                </div>
                <span className="font-bold text-ink text-xs whitespace-nowrap">
                  = ₹{estimatedProcessingFee.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Results KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500/40 space-y-1 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Monthly EMI
              </span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 block font-heading">
                ₹{emiCalc.monthlyEmi.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-slate-500">/ mo</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted">Principal Borrowed</span>
              <span className="text-lg font-bold text-ink block font-heading">
                ₹{emiCalc.principal.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">{principalPercent}% of total</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted">Total Interest</span>
              <span className="text-lg font-bold text-amber-700 dark:text-amber-400 block font-heading">
                ₹{emiCalc.totalInterest.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-amber-600 font-semibold">{interestPercent}% of total</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted">Total Amount Payable</span>
              <span className="text-lg font-black text-ink block font-heading">
                ₹{emiCalc.totalPayment.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-muted">Over {Math.round(effectiveTenureYears * 12)} months</span>
            </div>
          </div>

          {/* Visual Principal vs Interest Ratio Progress Bar */}
          <div className="p-4 rounded-2xl bg-surface border border-border/80 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                Principal: ₹{emiCalc.principal.toLocaleString('en-IN')} ({principalPercent}%)
              </span>
              <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Interest: ₹{emiCalc.totalInterest.toLocaleString('en-IN')} ({interestPercent}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${principalPercent}%` }}
                className="h-full bg-emerald-600 transition-all duration-300"
              />
              <div
                style={{ width: `${interestPercent}%` }}
                className="h-full bg-amber-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Amortization Milestone Schedule Toggle */}
          <div className="border border-border/80 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAmortization(!showAmortization)}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-ink cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>View Loan Repayment Schedule & Balance Payoff</span>
              </span>
              {showAmortization ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>

            {showAmortization && (
              <div className="p-4 bg-surface text-xs space-y-3 animate-in fade-in duration-200 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold uppercase text-muted">
                      <th className="py-2 pr-3">Year</th>
                      <th className="py-2 px-3">Principal Repaid</th>
                      <th className="py-2 px-3">Interest Paid</th>
                      <th className="py-2 pl-3 text-right">Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-[11px]">
                    {getAmortizationMilestones().map((row) => (
                      <tr key={row.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2 pr-3 font-black text-ink">Year {row.year}</td>
                        <td className="py-2 px-3 text-emerald-700 dark:text-emerald-400 font-semibold">
                          ₹{row.principalPaid.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3 text-amber-700 dark:text-amber-400 font-semibold">
                          ₹{row.interestPaid.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 pl-3 text-right font-black text-ink">
                          ₹{row.balance.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Buttons: WhatsApp Share & Copy Quote */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/70">
            <span className="text-[11px] text-muted">
              Auto-calculates standard Indian diminishing balance amortization.
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                pill
                variant="secondary"
                onClick={() => handleCopyText(emiQuoteText, 'copy-emi')}
                className="text-xs font-bold flex items-center gap-1.5"
              >
                {copiedId === 'copy-emi' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'copy-emi' ? 'Copied' : 'Copy Quote'}</span>
              </Button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(emiQuoteText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Share on WhatsApp</span>
              </a>
            </div>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* TOOL 4: CO-BROKER COMMISSION SPLITTER                    */}
      {/* ======================================================== */}
      {activeTool === 'commission' && (
        <Card className="p-5 sm:p-6 space-y-5 border-emerald-500/30 shadow-card animate-in fade-in duration-200">
          <div>
            <h2 className="text-base font-black text-ink font-heading">
              Co-Broker Commission Splitter
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Calculate 50/50 partner splits, agency cut, and individual closing take-home payout.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Deal Value (Lakhs)
              </label>
              <input
                type="number"
                value={dealValueLakhs}
                onChange={(e) => setDealValueLakhs(Number(e.target.value))}
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Commission %
              </label>
              <select
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink font-bold"
              >
                <option value={1.0}>1.0% (Single Side)</option>
                <option value={2.0}>2.0% (Both Sides: 1% + 1%)</option>
                <option value={0.5}>0.5% (Large Ticket Deal)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Agency Cut (%)
              </label>
              <select
                value={agencyCut}
                onChange={(e) => setAgencyCut(Number(e.target.value))}
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink font-bold"
              >
                <option value={0}>0% (Direct Solo Broker)</option>
                <option value={10}>10% Agency Fee</option>
                <option value={20}>20% Standard House Cut</option>
                <option value={30}>30% Prime Desk Fee</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Co-Broker Split
              </label>
              <select
                value={splitRatio}
                onChange={(e) => setSplitRatio(Number(e.target.value))}
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink font-bold"
              >
                <option value={50}>50 / 50 Equal Co-Broker</option>
                <option value={60}>60 / 40 Lead Broker Advantage</option>
                <option value={100}>100% Solo (No Co-Broker)</option>
              </select>
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-500/30 space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-muted">Gross Brokerage</span>
              <span className="text-lg font-black text-brand-700 dark:text-brand-600 block">
                ₹{commSplit.totalCommission.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-muted">Agency House Share ({agencyCut}%)</span>
              <span className="text-lg font-bold text-ink block">
                ₹{commSplit.agencyShare.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-muted">Listing Broker (50%)</span>
              <span className="text-lg font-bold text-ink block">
                ₹{commSplit.listingBrokerShare.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-muted">Closing Broker (50%)</span>
              <span className="text-lg font-bold text-ink block">
                ₹{commSplit.closingBrokerShare.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* TOOL 5: WHATSAPP ACTION CHIPS & TEMPLATES                */}
      {/* ======================================================== */}
      {activeTool === 'templates' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h2 className="text-base font-black text-ink font-heading">
              1-Tap WhatsApp Broker Templates
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Quickly send site visit confirmations, token acknowledgments, and Tehsil document lists.
            </p>
          </div>

          <div className="space-y-3">
            {templates.map((tpl) => (
              <Card key={tpl.id} className="p-5 space-y-3 border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-ink">{tpl.title}</h3>
                    <p className="text-xs text-muted">{tpl.desc}</p>
                  </div>
                  <Button
                    size="sm"
                    pill
                    variant="secondary"
                    onClick={() => handleCopyText(tpl.text, tpl.id)}
                    className="text-xs font-bold flex items-center gap-1.5"
                  >
                    {copiedId === tpl.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === tpl.id ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>

                <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-sans whitespace-pre-wrap border border-border/70 leading-relaxed">
                  {tpl.text}
                </pre>
              </Card>
            ))}
          </div>
        </div>
      )}
          </div>
        </div>
      )}
    </div>
  );
};
