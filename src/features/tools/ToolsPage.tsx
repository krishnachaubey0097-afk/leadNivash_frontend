import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Copy,
  Check,
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
  RotateCcw,
  Share2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
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

export type ToolId = 'emi' | 'registry' | 'area' | 'commission' | 'templates';

interface ToolItemDef {
  id: ToolId;
  label: string;
  category: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

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

  // Tools in Prompt 6 specified order
  const toolsList: ToolItemDef[] = [
    {
      id: 'emi',
      label: 'Home Loan EMI Calculator',
      category: 'Financing',
      desc: 'Estimate monthly EMIs, total interest, and down payments for buyer clients.',
      icon: Calculator,
    },
    {
      id: 'registry',
      label: 'Haryana Registry & Stamp Duty',
      category: 'Tehsil Rates',
      desc: 'Calculate official Tehsil stamp duty, female concessions, and registration fees.',
      icon: Building2,
    },
    {
      id: 'area',
      label: 'Area Unit Converter',
      category: 'Land Units',
      desc: 'Convert land measurements between Gaj, Marla, Kanal, and Square Feet.',
      icon: Maximize2,
    },
    {
      id: 'commission',
      label: 'Brokerage & Commission Splitter',
      category: 'Deal Payout',
      desc: 'Split transaction commissions fairly between agency house and co-brokers.',
      icon: TrendingUp,
    },
    {
      id: 'templates',
      label: 'WhatsApp Deal Templates',
      category: 'Quick Pitch',
      desc: 'Ready-to-send messages for site visits, token bayana, and Tehsil checklists.',
      icon: MessageSquare,
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
  // Tool 1: Home Loan & EMI Calculator State
  // -------------------------------------------------------------
  const [loanCalcMode, setLoanCalcMode] = useState<'direct' | 'property'>('direct');
  const [loanLakhs, setLoanLakhs] = useState<number>(60);
  const [propertyPriceLakhs, setPropertyPriceLakhs] = useState<number>(75);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years');
  const processingFeePercent = 0.5;
  const [showAmortization, setShowAmortization] = useState<boolean>(false);

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

  const registryQuoteText = `*Haryana Registry & Stamp Duty Estimate*
━━━━━━━━━━━━━━━━━━━━
• Property Consideration: ₹${registryPriceLakhs >= 100 ? `${(registryPriceLakhs / 100).toFixed(2)} Cr` : `${registryPriceLakhs} Lakhs`}
• Ownership Category: ${buyerGender.toUpperCase()} (${registryCalc.stampDutyPercent}% Stamp Duty)
• Jurisdiction: ${areaType === 'urban' ? 'Urban (MC Area +2% Cess)' : 'Rural (Gram Panchayat)'}
━━━━━━━━━━━━━━━━━━━━
*Total Govt Expenses: ₹${registryCalc.totalGovtFees.toLocaleString('en-IN')}*
• Stamp Duty Amount: ₹${registryCalc.stampDutyAmount.toLocaleString('en-IN')}
• Registration Fee: ₹${registryCalc.registrationFee.toLocaleString('en-IN')}
• Net Estimated Cost: ₹${registryCalc.netEstimatedCost.toLocaleString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
*Tehsil Standard Haryana Estimate*
${agencyOrOwnerName}`;

  // -------------------------------------------------------------
  // Tool 3: Area Unit Converter State
  // -------------------------------------------------------------
  const [areaValue, setAreaValue] = useState<number>(250);
  const [fromUnit, setFromUnit] = useState<AreaUnit>('gaj');
  const convertedUnits = convertAllUnits(areaValue, fromUnit);

  // Marla Standards: 25 Gaj (Panipat / Karnal local) and 30.25 Gaj (Revenue standard)
  const gajEquivalent = convertedUnits.gaj;
  const marla25Gaj = (gajEquivalent / 25).toFixed(2);
  const marla3025Gaj = (gajEquivalent / 30.25).toFixed(2);

  const areaPresets = [
    { label: '100 Gaj', val: 100, unit: 'gaj' as AreaUnit },
    { label: '180 Gaj', val: 180, unit: 'gaj' as AreaUnit },
    { label: '250 Gaj', val: 250, unit: 'gaj' as AreaUnit },
    { label: '350 Gaj', val: 350, unit: 'gaj' as AreaUnit },
    { label: '500 Gaj', val: 500, unit: 'gaj' as AreaUnit },
    { label: '1 Kanal (605 Gaj)', val: 605, unit: 'gaj' as AreaUnit },
  ];

  const areaQuoteText = `*Haryana Plot Area Conversion*
━━━━━━━━━━━━━━━━━━━━
• Input: ${areaValue} ${fromUnit.toUpperCase()}
• Gaj (Sq.Yards): ${convertedUnits.gaj} Gaj
• Square Feet: ${convertedUnits.sqft.toLocaleString('en-IN')} Sq.Ft
• Square Meters: ${convertedUnits.sqmt} Sq.Mt
• Marla (Panipat 25 Gaj): ${marla25Gaj} Marla
• Marla (Haryana 30.25 Gaj): ${marla3025Gaj} Marla
• Kanal (605 Gaj): ${(gajEquivalent / 605).toFixed(2)} Kanal
• Acre: ${convertedUnits.acre} Acre
━━━━━━━━━━━━━━━━━━━━
*Shared via LeadNivash Broker Toolkit*
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

  const commissionQuoteText = `*Deal Commission Settlement*
━━━━━━━━━━━━━━━━━━━━
• Total Deal Value: ₹${dealValueLakhs} Lakhs
• Brokerage Rate: ${commissionRate}%
• Gross Commission: ₹${commSplit.totalCommission.toLocaleString('en-IN')}
• Agency Share (${agencyCut}%): ₹${commSplit.agencyShare.toLocaleString('en-IN')}
• Listing Broker: ₹${commSplit.listingBrokerShare.toLocaleString('en-IN')}
• Closing Broker: ₹${commSplit.closingBrokerShare.toLocaleString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
*Settlement Statement*
${agencyOrOwnerName}`;

  // -------------------------------------------------------------
  // Tool 5: WhatsApp Action Templates
  // -------------------------------------------------------------
  const templates = [
    {
      id: 'site-visit',
      category: 'Inspection',
      title: 'Site Visit Confirmation',
      desc: 'Send to client confirming inspection time and landmark',
      text: `Namaste ji, kal sham 4:00 baje Ansal Sushant City Sector 18 Panipat par plot visit confirm hai.\n📍 Location: https://maps.google.com\nKoi badlaav ho to pehle batayein.\n\n— ${agencyOrOwnerName}`,
    },
    {
      id: 'token-receipt',
      category: 'Deal Advance',
      title: 'Token Advance Acknowledgment',
      desc: 'Instant receipt for bayana / token received',
      text: `Receipt Note:\nToken advance ₹50,000 received for Deal: 250 Gaj Plot, Sector 18 Panipat.\nAgreement timeline: 15 Days.\nBalance deal value to be executed as per registry schedule.\n\n— ${agencyOrOwnerName}`,
    },
    {
      id: 'doc-checklist',
      category: 'Legal / Tehsil',
      title: 'Registry Document Checklist',
      desc: 'Checklist for buyer before going to Tehsil',
      text: `Tehsil Registry Document Checklist:\n1. Buyer & Seller Aadhaar Card (Original + 2 copies)\n2. PAN Card of both parties\n3. 4 Passport size color photos\n4. 2 Witnesses with valid Voter ID / Aadhaar\n5. Circle rate demand draft / stamp receipt\n6. Municipal / HUDA No Objection Certificate (NOC)\n\n— ${agencyOrOwnerName}`,
    },
    {
      id: 'deal-pitch',
      category: 'Buyer Pitch',
      title: 'Property Listing Pitch Note',
      desc: 'Ready WhatsApp pitch for prime listings',
      text: `Namaste ji,\nAapki requirement ke anusaar ek prime property available hai:\n\n*3 BHK Luxury Floor in Model Town Panipat*\n• Plot: 200 Gaj (Clear Title)\n• Demand: ₹1.25 Cr Negotiable\n• Lift, Stilt Parking & Wide Road\n\nSite visit ke liye kab time convenient rahega?\n— ${agencyOrOwnerName}`,
    },
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-16 text-left">
      {/* ======================================================== */}
      {/* 1. TOOLS HUB VIEW (PROMPT 6 SPEC)                        */}
      {/* ======================================================== */}
      {activeTool === null ? (
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink leading-tight">
              Broker Tools
            </h1>
            <p className="text-xs sm:text-sm text-secondary text-muted mt-0.5">
              Calculators and ready-to-use tools for everyday property deals.
            </p>
          </div>

          {/* Compact Tools Grid (1-col on mobile, 2-col on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {toolsList.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.id}
                  onClick={() => handleSelectTool(tool.id)}
                  className="p-4 rounded-2xl bg-white border border-border hover:border-brand-600/40 shadow-xs hover:shadow-card transition flex flex-col justify-between gap-3 group cursor-pointer text-left"
                >
                  <div className="flex items-start gap-3">
                    {/* Consistent Restrained Icon Tile */}
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h2 className="text-sm font-bold text-ink group-hover:text-emerald-700 transition-colors truncate">
                          {tool.label}
                        </h2>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  {/* Clean Action Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTool(tool.id);
                      }}
                      className="px-3.5 py-1.5 min-h-[38px] rounded-lg bg-brand-600 group-hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <span>Open Tool</span>
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 2. DEDICATED TOOL WORKSPACE (PROMPT 6 SPEC)              */
        /* ======================================================== */
        <div className="space-y-4">
          {/* Workspace Header Bar */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-border shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleBackToHub}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-ink transition cursor-pointer self-start"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-brand-600" />
                <span>Broker Tools</span>
              </button>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">
                  Active Tool:
                </span>
                <span className="text-xs font-bold text-ink">
                  {toolsList.find((t) => t.id === activeTool)?.label}
                </span>
              </div>
            </div>

            {/* Quick Switcher Bar across all 5 tools */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {toolsList.map((t) => {
                const Icon = t.icon;
                const isSelected = activeTool === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTool(t.id)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 border min-h-[36px]',
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                        : 'bg-white text-muted hover:text-ink border-border'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* TOOL 1: HOME LOAN EMI CALCULATOR                         */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTool === 'emi' && (
            <Card className="p-4 sm:p-6 space-y-5 rounded-2xl bg-white border border-border shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-brand-600" />
                    <span>Home Loan EMI Calculator</span>
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Customize exact loan principal, interest rate, tenure, and down payment.
                  </p>
                </div>

                {/* Calculation Mode Switcher */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto border border-border">
                  <button
                    type="button"
                    onClick={() => setLoanCalcMode('direct')}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg transition cursor-pointer',
                      loanCalcMode === 'direct'
                        ? 'bg-brand-600 text-white shadow-xs font-bold'
                        : 'text-muted hover:text-ink'
                    )}
                  >
                    Direct Loan
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoanCalcMode('property')}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg transition cursor-pointer',
                      loanCalcMode === 'property'
                        ? 'bg-brand-600 text-white shadow-xs font-bold'
                        : 'text-muted hover:text-ink'
                    )}
                  >
                    From Property Cost
                  </button>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Property Cost Mode */}
                {loanCalcMode === 'property' && (
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-ink block">
                          Total Property Cost (₹ Lakhs)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted font-bold text-sm">₹</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            min={5}
                            max={2000}
                            step={1}
                            value={propertyPriceLakhs}
                            onChange={(e) => setPropertyPriceLakhs(Math.max(1, Number(e.target.value)))}
                            className="w-full min-h-[44px] bg-white border border-border rounded-input pl-8 pr-16 py-2 text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-muted font-semibold">Lakhs</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-semibold text-ink">
                            Down Payment ({downPaymentPercent}%)
                          </label>
                          <span className="font-bold text-brand-700">
                            = ₹{((propertyPriceLakhs * downPaymentPercent) / 100).toFixed(2)} Lakhs
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
                            className="flex-1 accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                          />
                          <span className="text-xs font-bold text-ink w-12 text-right">
                            {downPaymentPercent}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-slate-600">
                        Buyer Cash Down: <strong className="text-ink">₹{((propertyPriceLakhs * downPaymentPercent) / 100).toFixed(2)} Lakhs</strong>
                      </span>
                      <span className="font-bold text-brand-700 bg-white px-2.5 py-1 rounded-full border border-emerald-300">
                        Net Bank Loan Needed: ₹{(effectiveLoanAmount / 100000).toFixed(2)} Lakhs
                      </span>
                    </div>
                  </div>
                )}

                {/* Direct Principal Input */}
                {loanCalcMode === 'direct' && (
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="text-xs font-semibold text-ink block">
                          Loan Principal Amount
                        </label>
                        <p className="text-[11px] text-muted">Enter exact loan amount in Lakhs</p>
                      </div>
                      <div className="relative w-full sm:w-44">
                        <span className="absolute left-3 top-2.5 text-muted font-bold">₹</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min={1}
                          max={2000}
                          step={1}
                          value={loanLakhs}
                          onChange={(e) => setLoanLakhs(Math.max(1, Number(e.target.value)))}
                          className="w-full min-h-[44px] bg-white border border-border rounded-input pl-7 pr-14 py-2 text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-muted font-semibold">Lakhs</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={5}
                      max={300}
                      step={1}
                      value={loanLakhs}
                      onChange={(e) => setLoanLakhs(Number(e.target.value))}
                      className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />

                    {/* Quick Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-muted font-semibold mr-1">Presets:</span>
                      {[25, 40, 60, 80, 100, 150].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setLoanLakhs(preset)}
                          className={clsx(
                            'px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer',
                            loanLakhs === preset
                              ? 'bg-brand-600 text-white'
                              : 'bg-white border border-border text-slate-700 hover:bg-slate-100'
                          )}
                        >
                          {preset >= 100 ? `₹${(preset / 100).toFixed(preset % 100 === 0 ? 0 : 1)} Cr` : `₹${preset}L`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interest Rate & Tenure Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* ROI */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-border">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-ink">
                        Interest Rate (% p.a.)
                      </label>
                      <div className="relative w-28">
                        <input
                          type="number"
                          inputMode="decimal"
                          min={5.0}
                          max={18.0}
                          step={0.1}
                          value={interestRate}
                          onChange={(e) => setInterestRate(Math.max(1, Number(e.target.value)))}
                          className="w-full min-h-[40px] bg-white border border-border rounded-input px-3 py-1.5 text-xs font-bold text-ink text-right pr-6 focus:outline-none focus:ring-2 focus:ring-brand-600"
                        />
                        <span className="absolute right-2.5 top-2.5 text-xs text-muted font-bold">%</span>
                      </div>
                    </div>

                    {/* Bank Rates Chips */}
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {[
                        { name: 'SBI', rate: 8.5 },
                        { name: 'HDFC', rate: 8.7 },
                        { name: 'ICICI', rate: 8.75 },
                        { name: 'PNB', rate: 8.4 },
                      ].map((bank) => (
                        <button
                          key={bank.name}
                          type="button"
                          onClick={() => setInterestRate(bank.rate)}
                          className={clsx(
                            'px-2 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer',
                            interestRate === bank.rate
                              ? 'bg-brand-600 text-white border-brand-600'
                              : 'bg-white text-slate-700 border-border'
                          )}
                        >
                          {bank.name} {bank.rate}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tenure */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-semibold text-ink">
                          Tenure
                        </label>
                        <p className="text-[11px] text-muted">
                          {tenureUnit === 'years'
                            ? `${tenureYears} Years (${Math.round(tenureYears * 12)} Mos)`
                            : `${tenureYears} Months`}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center bg-white p-0.5 rounded-lg border border-border text-[10px] font-semibold">
                          <button
                            type="button"
                            onClick={() => {
                              if (tenureUnit === 'months') {
                                setTenureYears(Math.max(1, Math.round(tenureYears / 12)));
                                setTenureUnit('years');
                              }
                            }}
                            className={clsx(
                              'px-2 py-1 rounded transition cursor-pointer',
                              tenureUnit === 'years' ? 'bg-brand-600 text-white font-bold' : 'text-muted'
                            )}
                          >
                            Yrs
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
                              'px-2 py-1 rounded transition cursor-pointer',
                              tenureUnit === 'months' ? 'bg-brand-600 text-white font-bold' : 'text-muted'
                            )}
                          >
                            Mos
                          </button>
                        </div>

                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={tenureUnit === 'years' ? 35 : 420}
                          value={tenureYears}
                          onChange={(e) => setTenureYears(Math.max(1, Number(e.target.value)))}
                          className="w-16 min-h-[40px] bg-white border border-border rounded-input px-2 py-1.5 text-xs font-bold text-ink text-center focus:outline-none focus:ring-2 focus:ring-brand-600"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {(tenureUnit === 'years' ? [10, 15, 20, 25, 30] : [120, 180, 240, 300]).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTenureYears(preset)}
                          className={clsx(
                            'px-2 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer',
                            tenureYears === preset
                              ? 'bg-brand-600 text-white border-brand-600'
                              : 'bg-white text-slate-700 border-border'
                          )}
                        >
                          {preset} {tenureUnit === 'years' ? 'Yrs' : 'Mos'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Results */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                    Monthly EMI
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-brand-700 block">
                    ₹{emiCalc.monthlyEmi.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-muted">per month</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted block">
                    Principal
                  </span>
                  <span className="text-base sm:text-lg font-bold text-ink block">
                    ₹{emiCalc.principal.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">{principalPercent}% share</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted block">
                    Total Interest
                  </span>
                  <span className="text-base sm:text-lg font-bold text-amber-700 block">
                    ₹{emiCalc.totalInterest.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-amber-600 font-semibold">{interestPercent}% share</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted block">
                    Total Outflow
                  </span>
                  <span className="text-base sm:text-lg font-bold text-ink block">
                    ₹{emiCalc.totalPayment.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-muted">Principal + Interest</span>
                </div>
              </div>

              {/* Repayment Schedule Toggle */}
              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setShowAmortization(!showAmortization)}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-semibold text-ink cursor-pointer transition"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-brand-600" />
                    <span>View Year-by-Year Repayment Schedule</span>
                  </span>
                  {showAmortization ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                </button>

                {showAmortization && (
                  <div className="p-3 bg-white overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border text-[10px] font-bold uppercase text-muted">
                          <th className="py-1.5 pr-2">Year</th>
                          <th className="py-1.5 px-2">Principal Paid</th>
                          <th className="py-1.5 px-2">Interest Paid</th>
                          <th className="py-1.5 pl-2 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {getAmortizationMilestones().map((row) => (
                          <tr key={row.year} className="hover:bg-slate-50">
                            <td className="py-1.5 pr-2 font-bold text-ink">Year {row.year}</td>
                            <td className="py-1.5 px-2 text-emerald-700 font-semibold">
                              ₹{row.principalPaid.toLocaleString('en-IN')}
                            </td>
                            <td className="py-1.5 px-2 text-amber-700 font-semibold">
                              ₹{row.interestPaid.toLocaleString('en-IN')}
                            </td>
                            <td className="py-1.5 pl-2 text-right font-bold text-ink">
                              ₹{row.balance.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Actions Bar */}
              <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setLoanLakhs(60);
                    setInterestRate(8.5);
                    setTenureYears(20);
                    setTenureUnit('years');
                    success('Reset EMI calculator to defaults.');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-slate-600 hover:text-ink flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleCopyText(emiQuoteText, 'copy-emi')}
                    className="text-xs font-semibold min-h-[38px] flex items-center gap-1"
                  >
                    {copiedId === 'copy-emi' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'copy-emi' ? 'Copied' : 'Copy Quote'}</span>
                  </Button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(emiQuoteText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 min-h-[38px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp</span>
                  </a>
                </div>
              </div>
            </Card>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* TOOL 2: HARYANA REGISTRY & STAMP DUTY CALCULATOR         */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTool === 'registry' && (
            <Card className="p-4 sm:p-6 space-y-5 rounded-2xl bg-white border border-border shadow-card">
              <div className="pb-3 border-b border-border">
                <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-600" />
                  <span>Haryana Registry & Stamp Duty</span>
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Official Tehsil stamp fee rates: Female (5% concession) · Male (7%) · Joint (6%) + Municipal Cess.
                </p>
              </div>

              {/* Consideration Value Input */}
              <div className="p-4 rounded-xl bg-slate-50 border border-border space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-ink">
                    Property Consideration / Circle Value
                  </label>
                  <span className="text-sm font-bold text-brand-700">
                    ₹{registryPriceLakhs >= 100 ? `${(registryPriceLakhs / 100).toFixed(2)} Cr` : `${registryPriceLakhs} Lakhs`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-muted text-sm">₹</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    max={5000}
                    value={registryPriceLakhs}
                    onChange={(e) => setRegistryPriceLakhs(Number(e.target.value))}
                    className="w-full min-h-[44px] bg-white border border-border rounded-input px-3 py-2 text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                  <span className="text-muted text-xs font-semibold whitespace-nowrap">Lakhs</span>
                </div>
              </div>

              {/* Ownership & Jurisdiction Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-ink block">
                    Buyer Ownership Type
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
                          'py-2.5 px-1 min-h-[44px] rounded-lg text-xs font-semibold transition cursor-pointer border text-center flex items-center justify-center',
                          buyerGender === g.id
                            ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                            : 'bg-white border-border text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-ink block">
                    Municipal / Local Jurisdiction
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
                          'py-2.5 px-2 min-h-[44px] rounded-lg text-xs font-semibold transition cursor-pointer border text-center flex items-center justify-center',
                          areaType === a.id
                            ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                            : 'bg-white border-border text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">Total Govt Fees</span>
                  <span className="text-lg sm:text-xl font-bold text-brand-700 block">
                    {formatRupees(registryCalc.totalGovtFees * 100)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted block">
                    Stamp Duty ({registryCalc.stampDutyPercent}%)
                  </span>
                  <span className="text-base sm:text-lg font-bold text-ink block">
                    {formatRupees(registryCalc.stampDutyAmount * 100)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted block">Registration Fee</span>
                  <span className="text-base sm:text-lg font-bold text-ink block">
                    {formatRupees(registryCalc.registrationFee * 100)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted block">Net Total Outflow</span>
                  <span className="text-base sm:text-lg font-bold text-ink block">
                    {formatRupees(registryCalc.netEstimatedCost * 100)}
                  </span>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setRegistryPriceLakhs(85);
                    setBuyerGender('male');
                    setAreaType('urban');
                    success('Reset registry estimator to defaults.');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-slate-600 hover:text-ink flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleCopyText(registryQuoteText, 'copy-registry')}
                    className="text-xs font-semibold min-h-[38px] flex items-center gap-1"
                  >
                    {copiedId === 'copy-registry' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'copy-registry' ? 'Copied' : 'Copy Quote'}</span>
                  </Button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(registryQuoteText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 min-h-[38px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp</span>
                  </a>
                </div>
              </div>
            </Card>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* TOOL 3: AREA UNIT CONVERTER                              */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTool === 'area' && (
            <Card className="p-4 sm:p-6 space-y-5 rounded-2xl bg-white border border-border shadow-card">
              <div className="pb-3 border-b border-border">
                <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
                  <Maximize2 className="w-5 h-5 text-brand-600" />
                  <span>Area Unit Converter</span>
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Convert instantly across Gaj, Square Feet, and Haryana Marla standards (25 Gaj local & 30.25 Gaj revenue).
                </p>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-muted mr-1">Quick Presets:</span>
                {areaPresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAreaValue(p.val);
                      setFromUnit(p.unit);
                    }}
                    className={clsx(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border',
                      areaValue === p.val && fromUnit === p.unit
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 border-border text-slate-700'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Input Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">
                    Input Area Value
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={areaValue}
                    onChange={(e) => setAreaValue(Number(e.target.value))}
                    className="w-full min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">
                    Source Unit
                  </label>
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value as AreaUnit)}
                    className="w-full min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer"
                  >
                    <option value="gaj">Gaj / Sq.Yards (गज)</option>
                    <option value="sqft">Square Feet (Sq.Ft)</option>
                    <option value="sqmt">Square Meters (Sq.Mt)</option>
                    <option value="marla">Marla (25 Gaj Panipat Local Standard)</option>
                    <option value="bigha">Bigha (1,000 Gaj)</option>
                    <option value="acre">Acre (4,840 Gaj)</option>
                  </select>
                </div>
              </div>

              {/* Converted Results Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">Gaj (Sq. Yards)</span>
                  <span className="text-lg sm:text-xl font-bold text-brand-700 block">
                    {convertedUnits.gaj} Gaj
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted block">Square Feet</span>
                  <span className="text-lg font-bold text-ink block">
                    {convertedUnits.sqft.toLocaleString('en-IN')} Sq.Ft
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted block">Marla (25 Gaj Local)</span>
                  <span className="text-lg font-bold text-ink block">
                    {marla25Gaj} Marla
                  </span>
                  <span className="text-[10px] text-muted block">Panipat / Karnal</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted block">Marla (30.25 Gaj Revenue)</span>
                  <span className="text-lg font-bold text-ink block">
                    {marla3025Gaj} Marla
                  </span>
                  <span className="text-[10px] text-muted block">Haryana Standard</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted block">Square Meters</span>
                  <span className="text-lg font-bold text-ink block">
                    {convertedUnits.sqmt} Sq.Mt
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted block">Kanal / Acre</span>
                  <span className="text-lg font-bold text-ink block">
                    {(gajEquivalent / 605).toFixed(2)} Kanal
                  </span>
                  <span className="text-[10px] text-muted block">{convertedUnits.acre} Acre</span>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setAreaValue(250);
                    setFromUnit('gaj');
                    success('Reset area converter to defaults.');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-slate-600 hover:text-ink flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleCopyText(areaQuoteText, 'copy-area')}
                    className="text-xs font-semibold min-h-[38px] flex items-center gap-1"
                  >
                    {copiedId === 'copy-area' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'copy-area' ? 'Copied' : 'Copy Statement'}</span>
                  </Button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(areaQuoteText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 min-h-[38px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp</span>
                  </a>
                </div>
              </div>
            </Card>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* TOOL 4: BROKERAGE & COMMISSION SPLITTER                  */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTool === 'commission' && (
            <Card className="p-4 sm:p-6 space-y-5 rounded-2xl bg-white border border-border shadow-card">
              <div className="pb-3 border-b border-border">
                <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-600" />
                  <span>Brokerage & Commission Splitter</span>
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Calculate gross brokerage earned, partner co-broker splits, and net agency payout.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">
                    Deal Value (₹ Lakhs)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    value={dealValueLakhs}
                    onChange={(e) => setDealValueLakhs(Number(e.target.value))}
                    className="w-full min-h-[44px] bg-white border border-border rounded-input px-3 py-2 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">
                    Commission %
                  </label>
                  <select
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full min-h-[44px] bg-white border border-border rounded-input px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer"
                  >
                    <option value={1.0}>1.0% (Single Side)</option>
                    <option value={2.0}>2.0% (Both Sides: 1% + 1%)</option>
                    <option value={0.5}>0.5% (Large Ticket Deal)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">
                    Agency House Cut (%)
                  </label>
                  <select
                    value={agencyCut}
                    onChange={(e) => setAgencyCut(Number(e.target.value))}
                    className="w-full min-h-[44px] bg-white border border-border rounded-input px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer"
                  >
                    <option value={0}>0% (Solo Independent Broker)</option>
                    <option value={10}>10% Agency Desk Fee</option>
                    <option value={20}>20% Standard House Split</option>
                    <option value={30}>30% Prime Desk Fee</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">
                    Co-Broker Split
                  </label>
                  <select
                    value={splitRatio}
                    onChange={(e) => setSplitRatio(Number(e.target.value))}
                    className="w-full min-h-[44px] bg-white border border-border rounded-input px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer"
                  >
                    <option value={50}>50 / 50 Equal Co-Broker</option>
                    <option value={60}>60 / 40 Lead Broker Advantage</option>
                    <option value={100}>100% Solo (No Partner Split)</option>
                  </select>
                </div>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">Gross Brokerage</span>
                  <span className="text-lg sm:text-xl font-bold text-brand-700 block">
                    ₹{commSplit.totalCommission.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted block">Agency House ({agencyCut}%)</span>
                  <span className="text-base sm:text-lg font-bold text-ink block">
                    ₹{commSplit.agencyShare.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted block">Listing Broker Share</span>
                  <span className="text-base sm:text-lg font-bold text-ink block">
                    ₹{commSplit.listingBrokerShare.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-muted block">Closing Broker Share</span>
                  <span className="text-base sm:text-lg font-bold text-ink block">
                    ₹{commSplit.closingBrokerShare.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setDealValueLakhs(100);
                    setCommissionRate(1.0);
                    setAgencyCut(20);
                    setSplitRatio(50);
                    success('Reset commission splitter to defaults.');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-slate-600 hover:text-ink flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleCopyText(commissionQuoteText, 'copy-commission')}
                    className="text-xs font-semibold min-h-[38px] flex items-center gap-1"
                  >
                    {copiedId === 'copy-commission' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'copy-commission' ? 'Copied' : 'Copy Split'}</span>
                  </Button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(commissionQuoteText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 min-h-[38px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp</span>
                  </a>
                </div>
              </div>
            </Card>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* TOOL 5: WHATSAPP DEAL TEMPLATES                          */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTool === 'templates' && (
            <div className="space-y-3">
              <Card className="p-4 sm:p-5 rounded-2xl bg-white border border-border shadow-card">
                <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-600" />
                  <span>WhatsApp Deal Templates</span>
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Pre-formatted property deal messages ready to copy or forward to clients and co-brokers.
                </p>
              </Card>

              <div className="space-y-3">
                {templates.map((tpl) => {
                  const waUrl = `https://wa.me/?text=${encodeURIComponent(tpl.text)}`;

                  return (
                    <Card key={tpl.id} className="p-4 sm:p-5 rounded-2xl bg-white border border-border shadow-card space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-ink">{tpl.title}</h3>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {tpl.category}
                            </span>
                          </div>
                          <p className="text-xs text-muted mt-0.5">{tpl.desc}</p>
                        </div>

                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleCopyText(tpl.text, tpl.id)}
                            className="px-3 py-1.5 min-h-[36px] rounded-lg border border-border hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1 transition cursor-pointer"
                          >
                            {copiedId === tpl.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === tpl.id ? 'Copied' : 'Copy'}</span>
                          </button>

                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 min-h-[36px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 transition shadow-xs"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Share</span>
                          </a>
                        </div>
                      </div>

                      <pre className="p-3 rounded-xl bg-slate-50 text-slate-800 text-xs font-sans whitespace-pre-wrap border border-slate-200/80 leading-relaxed overflow-x-auto">
                        {tpl.text}
                      </pre>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
