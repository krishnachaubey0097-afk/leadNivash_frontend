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
  ArrowLeft,
  ArrowUpRight,
  RotateCcw,
  Share2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../auth/AuthProvider';
import { formatRupees, formatAmountInWords } from '../../lib/money';
import {
  convertAllUnits,
  calculateStateRegistry,
  calculateEmi,
  calculateCommissionSplit,
  type AreaUnit,
  type BuyerGender,
  type AreaType,
} from '../../lib/calculators';
import { INDIAN_STATES, DEFAULT_STATE_NAME, getStateRule } from '../../lib/indianStates';
import clsx from 'clsx';

export type ToolId = 'emi' | 'registry' | 'area' | 'commission' | 'templates';

interface ToolItemDef {
  id: ToolId;
  label: string;
  desc: string;
  isMostUsed?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Compact SVG Donut Chart for sticky desktop results panels
 */
const SplitDonut: React.FC<{
  primaryPct: number;
  primaryLabel: string;
  secondaryLabel: string;
}> = ({ primaryPct, primaryLabel, secondaryLabel }) => {
  const clamped = Math.max(0, Math.min(100, primaryPct));
  const r = 28;
  const c = 2 * Math.PI * r;
  const dash = (clamped / 100) * c;

  return (
    <div className="flex items-center gap-4 p-3.5 rounded-[12px] bg-slate-50 border border-border/80">
      <svg className="w-16 h-16 -rotate-90 shrink-0" viewBox="0 0 68 68" aria-hidden="true">
        <circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke="var(--ink-black)"
          strokeWidth="8"
        />
        <circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke="var(--brand-600)"
          strokeWidth="8"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="space-y-1.5 text-xs min-w-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0" />
          <span className="text-ink-700 truncate">
            {primaryLabel} ({clamped}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-ink-black shrink-0" />
          <span className="text-ink-700 truncate">
            {secondaryLabel} ({100 - clamped}%)
          </span>
        </div>
      </div>
    </div>
  );
};

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

  // Pan-India Operating State: defaults from Regional Preferences, switchable inside Tools
  const [selectedState, setSelectedState] = useState<string>(
    user?.preferences?.defaultState || DEFAULT_STATE_NAME
  );

  React.useEffect(() => {
    if (user?.preferences?.defaultState) {
      setSelectedState(user.preferences.defaultState);
    }
  }, [user?.preferences?.defaultState]);

  const activeStateRule = getStateRule(selectedState);

  // 5 Core Broker Tools (icon tiles ALWAYS brand-50 + green, at most ONE subtle badge)
  const toolsList: ToolItemDef[] = [
    {
      id: 'emi',
      label: 'Home loan EMI',
      desc: 'Monthly EMIs & repayment schedule',
      isMostUsed: true,
      icon: Calculator,
    },
    {
      id: 'registry',
      label: 'Stamp duty',
      desc: `${activeStateRule.name} stamp duty & registry fees`,
      icon: Building2,
    },
    {
      id: 'area',
      label: 'Area converter',
      desc: `${activeStateRule.popularUnitLabel} & regional standards`,
      icon: Maximize2,
    },
    {
      id: 'commission',
      label: 'Commission split',
      desc: 'Agency fees & co-broker payout split',
      icon: TrendingUp,
    },
    {
      id: 'templates',
      label: 'Deal messages',
      desc: 'WhatsApp pitches, receipts & checklists',
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
  // Tool 2: Pan-India Registry & Stamp Duty State Calculator
  // -------------------------------------------------------------
  const [registryPriceLakhs, setRegistryPriceLakhs] = useState<number>(85);
  const [buyerGender, setBuyerGender] = useState<BuyerGender>('male');
  const [areaType, setAreaType] = useState<AreaType>('urban');
  const registryCalc = calculateStateRegistry(
    registryPriceLakhs * 100000,
    selectedState,
    buyerGender,
    areaType
  );
  const stampSharePercent =
    registryCalc.totalGovtFees > 0
      ? Math.round((registryCalc.stampDutyAmount / registryCalc.totalGovtFees) * 100)
      : 90;

  const registryQuoteText = `*${registryCalc.stateName} Registry & Stamp Duty Estimate*
━━━━━━━━━━━━━━━━━━━━
• State / UT: ${registryCalc.stateName} (${registryCalc.stateRule.authorityLabel})
• Property Consideration: ₹${registryPriceLakhs >= 100 ? `${(registryPriceLakhs / 100).toFixed(2)} Cr` : `${registryPriceLakhs} Lakhs`}
• Ownership Category: ${buyerGender.charAt(0).toUpperCase() + buyerGender.slice(1)} (${registryCalc.stampDutyPercent}% Stamp Duty)
• Jurisdiction: ${areaType === 'urban' ? 'Urban Municipal Area' : 'Rural / Gram Panchayat'}
━━━━━━━━━━━━━━━━━━━━
*Total Govt Expenses: ₹${registryCalc.totalGovtFees.toLocaleString('en-IN')}*
• Stamp Duty Amount: ₹${registryCalc.stampDutyAmount.toLocaleString('en-IN')}
• Registration Fee: ₹${registryCalc.registrationFee.toLocaleString('en-IN')}
• Net Estimated Cost: ₹${registryCalc.netEstimatedCost.toLocaleString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
*${registryCalc.stateName} Stamp Duty Estimate*
${agencyOrOwnerName}`;

  // -------------------------------------------------------------
  // Tool 3: Area Unit Converter State
  // -------------------------------------------------------------
  const [areaValue, setAreaValue] = useState<number>(250);
  const [fromUnit, setFromUnit] = useState<AreaUnit | 'marla_official'>('gaj');

  // Preserve exact convertAllUnits formula; support 30.25 Gaj Haryana Official Standard cleanly
  const effectiveAreaValue = fromUnit === 'marla_official' ? areaValue * 30.25 : areaValue;
  const effectiveFromUnit: AreaUnit = fromUnit === 'marla_official' ? 'gaj' : fromUnit;
  const convertedUnits = convertAllUnits(effectiveAreaValue, effectiveFromUnit);

  const gajEquivalent = convertedUnits.gaj;
  const marla25Gaj = (gajEquivalent / 25).toFixed(2);
  const marla3025Gaj = (gajEquivalent / 30.25).toFixed(2);

  const areaUnitOptions: Array<{ id: AreaUnit | 'marla_official'; label: string }> = [
    { id: 'gaj', label: 'Gaj / Sq. Yards' },
    { id: 'sqft', label: 'Square Feet (Sq.Ft)' },
    { id: 'sqmt', label: 'Square Meters (Sq.Mt)' },
    { id: 'marla', label: '25 Gaj / Marla (Panipat & Local Standard)' },
    { id: 'marla_official', label: '30.25 Gaj / Marla (Haryana Official Standard)' },
    { id: 'bigha', label: 'Bigha (1,000 Gaj)' },
    { id: 'acre', label: 'Acre (4,840 Gaj)' },
  ];

  const areaPresets = [
    { label: '100 Gaj', val: 100, unit: 'gaj' as const },
    { label: '180 Gaj', val: 180, unit: 'gaj' as const },
    { label: '250 Gaj', val: 250, unit: 'gaj' as const },
    { label: '500 Gaj', val: 500, unit: 'gaj' as const },
    { label: '1 Kanal (605 Gaj)', val: 605, unit: 'gaj' as const },
  ];

  const areaQuoteText = `*Haryana Plot Area Conversion*
━━━━━━━━━━━━━━━━━━━━
• Input: ${areaValue} ${areaUnitOptions.find((u) => u.id === fromUnit)?.label || fromUnit}
• Gaj (Sq.Yards): ${convertedUnits.gaj} Gaj
• Square Feet: ${convertedUnits.sqft.toLocaleString('en-IN')} Sq.Ft
• Square Meters: ${convertedUnits.sqmt} Sq.Mt
• 25 Gaj / Marla (Panipat Local): ${marla25Gaj} Marla
• 30.25 Gaj / Marla (Haryana Official Standard): ${marla3025Gaj} Marla
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
  const brokerNetPercent =
    commSplit.totalCommission > 0
      ? Math.round((commSplit.listingBrokerShare / commSplit.totalCommission) * 100)
      : 50;

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
  // Tool 5: Deal Messages (WhatsApp Templates)
  // -------------------------------------------------------------
  const templates = [
    {
      id: 'site-visit',
      category: 'Inspection',
      title: 'Site visit confirmation',
      desc: 'Confirm inspection time and property landmark with buyer',
      text: `Namaste ji, kal sham 4:00 baje Ansal Sushant City Sector 18 Panipat par plot visit confirm hai.\n📍 Location: https://maps.google.com\nKoi badlaav ho to pehle batayein.\n\n— ${agencyOrOwnerName}`,
    },
    {
      id: 'token-receipt',
      category: 'Deal advance',
      title: 'Token advance receipt',
      desc: 'Instant confirmation note for bayana or token received',
      text: `Receipt Note:\nToken advance ₹50,000 received for Deal: 250 Gaj Plot, Sector 18 Panipat.\nAgreement timeline: 15 Days.\nBalance deal value to be executed as per registry schedule.\n\n— ${agencyOrOwnerName}`,
    },
    {
      id: 'doc-checklist',
      category: 'Tehsil legal',
      title: 'Registry document checklist',
      desc: 'Documents needed by buyer & seller before Tehsil visit',
      text: `Tehsil Registry Document Checklist:\n1. Buyer & Seller Aadhaar Card (Original + 2 copies)\n2. PAN Card of both parties\n3. 4 Passport size color photos\n4. 2 Witnesses with valid Voter ID / Aadhaar\n5. Circle rate demand draft / stamp receipt\n6. Municipal / HUDA No Objection Certificate (NOC)\n\n— ${agencyOrOwnerName}`,
    },
    {
      id: 'deal-pitch',
      category: 'Buyer pitch',
      title: 'Property listing pitch note',
      desc: 'Ready WhatsApp message for high-interest residential listings',
      text: `Namaste ji,\nAapki requirement ke anusaar ek prime property available hai:\n\n*3 BHK Luxury Floor in Model Town Panipat*\n• Plot: 200 Gaj (Clear Title)\n• Demand: ₹1.25 Cr Negotiable\n• Lift, Stilt Parking & Wide Road\n\nSite visit ke liye kab time convenient rahega?\n— ${agencyOrOwnerName}`,
    },
  ];
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('site-visit');
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  return (
    <div className="space-y-5 max-w-[1200px] mx-auto pb-16 text-left">
      {/* ======================================================== */}
      {/* 1. TOOLS HUB VIEW (2 cols 1024-1279px, 3 cols >=1280px)   */}
      {/* ======================================================== */}
      {activeTool === null ? (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-ink-900 to-brand-700 bg-clip-text text-transparent leading-tight">
                Broker Tools
              </h1>
              <p className="text-xs sm:text-sm text-ink-700 mt-0.5">
                Calculators and ready-to-use tools for everyday property deals.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ink-black text-white text-xs font-semibold border border-white/10 self-start sm:self-auto shrink-0 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-lime shrink-0" />
              <span>5 Haryana &amp; Panipat Tools</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {toolsList.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => handleSelectTool(tool.id)}
                  className={clsx(
                    'rounded-[14px] border bg-white p-4 text-left transition-all duration-150 hover:-translate-y-[1.5px] lg:hover:border-ink-black/30 hover:shadow-md group cursor-pointer flex items-center justify-between gap-3.5',
                    tool.isMostUsed ? 'border-ink-black/25 border-t-2 border-t-lime shadow-2xs' : 'border-line'
                  )}
                >
                  {/* 40px icon tile: lime-soft / brand-50 + green icon */}
                  <div className="w-10 h-10 rounded-[12px] bg-lime-soft border border-lime/60 text-brand-700 group-hover:bg-ink-black group-hover:text-lime group-hover:border-ink-black flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h2 className="text-base font-semibold text-ink-900 group-hover:text-brand-700 transition-colors truncate">
                          {tool.label}
                        </h2>
                        {tool.isMostUsed && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-ink-black text-white shrink-0 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-lime shrink-0" />
                            Most used
                          </span>
                        )}
                      </div>
                      {/* Always crisp Open arrow pill (never faded opacity-0 ghost text) */}
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-700 group-hover:text-ink-900 shrink-0 whitespace-nowrap">
                        <span className="hidden 2xl:inline">Open</span>
                        <span className="w-6 h-6 rounded-[8px] bg-lime-soft border border-line text-brand-700 group-hover:bg-ink-black group-hover:text-lime group-hover:border-ink-black inline-flex items-center justify-center transition-colors">
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2]" />
                        </span>
                      </span>
                    </div>
                    <p className="text-[13px] text-ink-500 mt-0.5 leading-snug">
                      {tool.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 2. DEDICATED TOOL WORKSPACE (2-Col: Inputs Left <=480px, Sticky Results Right) */
        /* ======================================================== */
        <div className="space-y-5">
          {/* Top Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={handleBackToHub}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer shrink-0 whitespace-nowrap"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-brand-600" />
                <span>Broker Tools</span>
              </button>

              <h1 className="text-lg sm:text-xl font-bold text-ink-900 truncate">
                {toolsList.find((t) => t.id === activeTool)?.label}
              </h1>
            </div>

            {/* Quick 5-Tool Pill Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {toolsList.map((t) => {
                const Icon = t.icon;
                const isSelected = activeTool === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTool(t.id)}
                    className={clsx(
                      'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer inline-flex items-center gap-1.5 shrink-0 border',
                      isSelected
                        ? 'bg-ink-black text-white border-ink-black font-bold shadow-2xs'
                        : 'bg-white text-ink-700 hover:text-ink-900 border-line hover:bg-lime-soft/50'
                    )}
                  >
                    <Icon className={clsx('w-3.5 h-3.5', isSelected ? 'text-lime' : 'text-brand-600')} />
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
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,480px)_1fr] gap-6 items-start">
              {/* LEFT COLUMN (<=480px): 2-column form inputs */}
              <div className="space-y-4">
                <Card className="p-5 space-y-4 rounded-[14px] border-border bg-white">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-border">
                    <span className="text-sm font-semibold text-slate-900">Loan inputs</span>
                    <div className="flex items-center bg-slate-100 p-1 rounded-full text-xs font-semibold border border-border">
                      <button
                        type="button"
                        onClick={() => setLoanCalcMode('direct')}
                        className={clsx(
                          'px-3 py-1 rounded-full transition cursor-pointer whitespace-nowrap',
                          loanCalcMode === 'direct'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        )}
                      >
                        Direct loan
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoanCalcMode('property')}
                        className={clsx(
                          'px-3 py-1 rounded-full transition cursor-pointer whitespace-nowrap',
                          loanCalcMode === 'property'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        )}
                      >
                        From property cost
                      </button>
                    </div>
                  </div>

                  {loanCalcMode === 'property' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Property cost (₹ Lakhs)
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          min={5}
                          max={2000}
                          step={1}
                          value={propertyPriceLakhs}
                          onChange={(e) => setPropertyPriceLakhs(Math.max(1, Number(e.target.value)))}
                          className="w-full h-11 bg-white border border-border rounded-input px-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                        />
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {formatRupees(propertyPriceLakhs * 10000000)} · {formatAmountInWords(propertyPriceLakhs * 100000)}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Down payment ({downPaymentPercent}%)
                        </label>
                        <div className="h-11 flex items-center gap-2 px-3 rounded-input border border-border bg-slate-50">
                          <input
                            type="range"
                            min={10}
                            max={60}
                            step={5}
                            value={downPaymentPercent}
                            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                            className="flex-1 accent-brand-600 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-slate-900 tabular-nums">{downPaymentPercent}%</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          Loan needed: {formatRupees(effectiveLoanAmount * 100)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Loan principal (₹ Lakhs)
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          min={1}
                          max={2000}
                          step={1}
                          value={loanLakhs}
                          onChange={(e) => setLoanLakhs(Math.max(1, Number(e.target.value)))}
                          className="w-full h-11 bg-white border border-border rounded-input px-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                        />
                        <p className="text-[11px] text-slate-500 leading-snug tabular-nums">
                          {formatRupees(loanLakhs * 10000000)} · {formatAmountInWords(loanLakhs * 100000)}
                        </p>
                      </div>

                      <input
                        type="range"
                        min={5}
                        max={300}
                        step={1}
                        value={loanLakhs}
                        onChange={(e) => setLoanLakhs(Number(e.target.value))}
                        className="w-full accent-brand-600 cursor-pointer"
                      />

                      <div className="flex flex-wrap items-center gap-1.5">
                        {[25, 40, 60, 80, 100, 150].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setLoanLakhs(preset)}
                            className={clsx(
                              'px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer border',
                              loanLakhs === preset
                                ? 'bg-brand-600 text-white border-brand-600'
                                : 'bg-white border-border text-slate-600 hover:bg-slate-50'
                            )}
                          >
                            {preset >= 100 ? `₹${(preset / 100).toFixed(preset % 100 === 0 ? 0 : 1)} Cr` : `₹${preset}L`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2-Column ROI & Tenure */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Interest rate (% p.a.)
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={5}
                        max={18}
                        step={0.1}
                        value={interestRate}
                        onChange={(e) => setInterestRate(Math.max(1, Number(e.target.value)))}
                        className="w-full h-11 bg-white border border-border rounded-input px-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                      <div className="flex flex-wrap gap-1">
                        {[
                          { name: 'SBI', rate: 8.5 },
                          { name: 'HDFC', rate: 8.7 },
                          { name: 'PNB', rate: 8.4 },
                        ].map((b) => (
                          <button
                            key={b.name}
                            type="button"
                            onClick={() => setInterestRate(b.rate)}
                            className={clsx(
                              'px-2 py-0.5 rounded text-[11px] font-medium border cursor-pointer',
                              interestRate === b.rate
                                ? 'bg-brand-50 text-brand-700 border-brand-200'
                                : 'bg-white text-slate-600 border-border'
                            )}
                          >
                            {b.name} {b.rate}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700">Tenure</label>
                        <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-border text-[11px] font-semibold">
                          <button
                            type="button"
                            onClick={() => {
                              if (tenureUnit === 'months') {
                                setTenureYears(Math.max(1, Math.round(tenureYears / 12)));
                                setTenureUnit('years');
                              }
                            }}
                            className={clsx(
                              'px-2 py-0.5 rounded cursor-pointer',
                              tenureUnit === 'years' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
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
                              'px-2 py-0.5 rounded cursor-pointer',
                              tenureUnit === 'months' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                            )}
                          >
                            Mos
                          </button>
                        </div>
                      </div>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={tenureUnit === 'years' ? 35 : 420}
                        value={tenureYears}
                        onChange={(e) => setTenureYears(Math.max(1, Number(e.target.value)))}
                        className="w-full h-11 bg-white border border-border rounded-input px-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                      <div className="flex flex-wrap gap-1">
                        {(tenureUnit === 'years' ? [10, 15, 20, 25] : [120, 180, 240]).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setTenureYears(p)}
                            className={clsx(
                              'px-2 py-0.5 rounded text-[11px] font-medium border cursor-pointer',
                              tenureYears === p
                                ? 'bg-brand-50 text-brand-700 border-brand-200'
                                : 'bg-white text-slate-600 border-border'
                            )}
                          >
                            {p} {tenureUnit === 'years' ? 'Yrs' : 'Mos'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Amortization Toggle */}
                <div className="border border-border rounded-[14px] overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setShowAmortization(!showAmortization)}
                    className="w-full p-3.5 hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-800 cursor-pointer transition"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-brand-600" />
                      <span>Year-by-year repayment schedule</span>
                    </span>
                    {showAmortization ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {showAmortization && (
                    <div className="p-3 border-t border-border overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border text-[11px] font-semibold text-slate-500">
                            <th className="py-1.5 pr-2">Year</th>
                            <th className="py-1.5 px-2">Principal</th>
                            <th className="py-1.5 px-2">Interest</th>
                            <th className="py-1.5 pl-2 text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs tabular-nums">
                          {getAmortizationMilestones().map((row) => (
                            <tr key={row.year}>
                              <td className="py-1.5 pr-2 font-semibold text-slate-900">Year {row.year}</td>
                              <td className="py-1.5 px-2 text-brand-700">₹{row.principalPaid.toLocaleString('en-IN')}</td>
                              <td className="py-1.5 px-2 text-amber-700">₹{row.interestPaid.toLocaleString('en-IN')}</td>
                              <td className="py-1.5 pl-2 text-right font-semibold text-slate-900">₹{row.balance.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Sticky Results Panel */}
              <Card className="p-5 sm:p-6 space-y-5 rounded-[14px] border-border bg-white lg:sticky lg:top-20">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">
                    Estimated monthly EMI
                  </span>
                  <div className="text-3xl font-bold text-ink-900 tabular-nums mt-1">
                    ₹{emiCalc.monthlyEmi.toLocaleString('en-IN')}
                    <span className="text-sm font-medium text-ink-500 ml-1.5">/ month</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatAmountInWords(emiCalc.monthlyEmi)} per month
                  </p>
                </div>

                <SplitDonut
                  primaryPct={principalPercent}
                  primaryLabel="Principal"
                  secondaryLabel="Interest"
                />

                <div className="divide-y divide-slate-100 text-sm">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Loan principal</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      ₹{emiCalc.principal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Total interest payable</span>
                    <span className="font-semibold text-amber-700 tabular-nums">
                      ₹{emiCalc.totalInterest.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Total repayment</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      ₹{emiCalc.totalPayment.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Est. processing fee ({processingFeePercent}%)</span>
                    <span className="font-medium text-slate-700 tabular-nums">
                      ₹{estimatedProcessingFee.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

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
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopyText(emiQuoteText, 'copy-emi')}
                      className="gap-1.5"
                    >
                      {copiedId === 'copy-emi' ? <Check className="w-3.5 h-3.5 text-brand-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === 'copy-emi' ? 'Copied' : 'Copy'}</span>
                    </Button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(emiQuoteText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group btn-cashfree-primary btn-shine-sweep pl-3.5 pr-1.5 h-9 rounded-[11px] text-white font-semibold text-sm inline-flex items-center gap-2 transition whitespace-nowrap"
                    >
                      <Share2 className="w-3.5 h-3.5 text-lime" />
                      <span>Share on WhatsApp</span>
                      <span className="w-6 h-6 rounded-[7px] bg-lime text-ink-black inline-flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.3]" />
                      </span>
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* TOOL 2: PAN-INDIA REGISTRY & STAMP DUTY CALCULATOR       */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTool === 'registry' && (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,480px)_1fr] gap-6 items-start">
              {/* LEFT COLUMN: 2-Column Inputs */}
              <Card className="p-5 space-y-4 rounded-[14px] border-border bg-white">
                {/* State / Union Territory Selector */}
                <div className="space-y-1.5 pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="tool-registry-state" className="text-xs font-semibold text-slate-700 block">
                      State / Union Territory (India)
                    </label>
                    <span className="text-[11px] font-semibold text-brand-700 bg-lime-soft px-2 py-0.5 rounded-full border border-lime">
                      {activeStateRule.authorityLabel}
                    </span>
                  </div>
                  <select
                    id="tool-registry-state"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full h-11 bg-white border border-border rounded-input px-3 text-sm font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer"
                  >
                    <optgroup label="Indian States (28)">
                      {INDIAN_STATES.filter((s) => s.regionType === 'State').map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name} ({s.stampFemalePct}%–{s.stampMalePct + s.urbanExtraPct}%)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Union Territories (8)">
                      {INDIAN_STATES.filter((s) => s.regionType === 'Union Territory').map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name} ({s.stampFemalePct}%–{s.stampMalePct + s.urbanExtraPct}%)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {activeStateRule.note}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Property consideration / circle value (₹ Lakhs)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    max={5000}
                    value={registryPriceLakhs}
                    onChange={(e) => setRegistryPriceLakhs(Math.max(0, Number(e.target.value)))}
                    className="w-full h-11 bg-white border border-border rounded-input px-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                  <p className="text-[11px] text-slate-500 leading-snug tabular-nums">
                    {formatRupees(registryPriceLakhs * 10000000)} · {formatAmountInWords(registryPriceLakhs * 100000)}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Buyer ownership type
                    </label>
                    <div className="space-y-1.5">
                      {[
                        {
                          id: 'female',
                          label: `Female (${calculateStateRegistry(registryPriceLakhs * 100000, selectedState, 'female', areaType).stampDutyPercent}%)`,
                        },
                        {
                          id: 'male',
                          label: `Male (${calculateStateRegistry(registryPriceLakhs * 100000, selectedState, 'male', areaType).stampDutyPercent}%)`,
                        },
                        {
                          id: 'joint',
                          label: `Joint (${calculateStateRegistry(registryPriceLakhs * 100000, selectedState, 'joint', areaType).stampDutyPercent}%)`,
                        },
                      ].map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setBuyerGender(g.id as BuyerGender)}
                          className={clsx(
                            'w-full px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer border text-left',
                            buyerGender === g.id
                              ? 'bg-brand-50 text-brand-700 border-brand-600'
                              : 'bg-white border-border text-slate-700 hover:bg-slate-50'
                          )}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Municipal jurisdiction
                    </label>
                    <div className="space-y-1.5">
                      {[
                        {
                          id: 'urban',
                          label:
                            activeStateRule.urbanExtraPct > 0
                              ? `Urban (MC +${activeStateRule.urbanExtraPct}%)`
                              : 'Urban Municipal Area',
                        },
                        { id: 'rural', label: 'Rural (Gram Panchayat)' },
                      ].map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setAreaType(a.id as AreaType)}
                          className={clsx(
                            'w-full px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer border text-left',
                            areaType === a.id
                              ? 'bg-brand-50 text-brand-700 border-brand-600'
                              : 'bg-white border-border text-slate-700 hover:bg-slate-50'
                          )}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* RIGHT COLUMN: Sticky Results Panel */}
              <Card className="p-5 sm:p-6 space-y-5 rounded-[14px] border-border bg-white lg:sticky lg:top-20">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">
                    Total government registry expenses
                  </span>
                  <div className="text-3xl font-bold text-slate-900 tabular-nums mt-1">
                    {formatRupees(registryCalc.totalGovtFees * 100)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatAmountInWords(registryCalc.totalGovtFees)}
                  </p>
                </div>

                <SplitDonut
                  primaryPct={stampSharePercent}
                  primaryLabel={`Stamp duty (${registryCalc.stampDutyPercent}%)`}
                  secondaryLabel="Registration fee"
                />

                <div className="divide-y divide-slate-100 text-sm">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Stamp duty ({registryCalc.stampDutyPercent}%)</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatRupees(registryCalc.stampDutyAmount * 100)}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Registration fee slab</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatRupees(registryCalc.registrationFee * 100)}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Property consideration</span>
                    <span className="font-medium text-slate-700 tabular-nums">
                      {formatRupees(registryCalc.propertyValue * 100)}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Net total outlay</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatRupees(registryCalc.netEstimatedCost * 100)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setRegistryPriceLakhs(85);
                      setBuyerGender('male');
                      setAreaType('urban');
                      success('Reset stamp duty calculator to defaults.');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopyText(registryQuoteText, 'copy-registry')}
                      className="gap-1.5"
                    >
                      {copiedId === 'copy-registry' ? <Check className="w-3.5 h-3.5 text-brand-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === 'copy-registry' ? 'Copied' : 'Copy'}</span>
                    </Button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(registryQuoteText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group btn-cashfree-primary btn-shine-sweep pl-3.5 pr-1.5 h-9 rounded-[11px] text-white font-semibold text-sm inline-flex items-center gap-2 transition whitespace-nowrap"
                    >
                      <Share2 className="w-3.5 h-3.5 text-lime" />
                      <span>Share on WhatsApp</span>
                      <span className="w-6 h-6 rounded-[7px] bg-lime text-ink-black inline-flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.3]" />
                      </span>
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* TOOL 3: AREA UNIT CONVERTER                              */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTool === 'area' && (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,480px)_1fr] gap-6 items-start">
              {/* LEFT COLUMN: Inputs with full-text non-clipped Haryana Marla options */}
              <Card className="p-5 space-y-4 rounded-[14px] border-border bg-white">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Area value
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={areaValue}
                    onChange={(e) => setAreaValue(Math.max(0, Number(e.target.value)))}
                    className="w-full h-11 bg-white border border-border rounded-input px-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {areaPresets.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAreaValue(p.val);
                          setFromUnit(p.unit);
                        }}
                        className={clsx(
                          'px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer border',
                          areaValue === p.val && fromUnit === p.unit
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white border-border text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full-width wrapping source unit list — NEVER truncates Haryana Marla label with "…" */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Source measurement unit
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {areaUnitOptions.map((opt) => {
                      const active = fromUnit === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFromUnit(opt.id)}
                          className={clsx(
                            'w-full px-3 py-2.5 rounded-lg border text-left text-xs sm:text-sm font-medium transition cursor-pointer flex items-center justify-between gap-2 leading-snug break-words',
                            active
                              ? 'bg-brand-50 text-brand-700 border-brand-600 font-semibold'
                              : 'bg-white border-border text-slate-700 hover:bg-slate-50'
                          )}
                        >
                          <span className="break-words">{opt.label}</span>
                          {active && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* RIGHT COLUMN: Sticky Results Panel */}
              <Card className="p-5 sm:p-6 space-y-5 rounded-[14px] border-border bg-white lg:sticky lg:top-20">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">
                    Primary Gaj (Square Yards) equivalent
                  </span>
                  <div className="text-3xl font-bold text-slate-900 tabular-nums mt-1">
                    {convertedUnits.gaj.toLocaleString('en-IN')} Gaj
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {convertedUnits.sqft.toLocaleString('en-IN')} Square Feet · {(gajEquivalent / 605).toFixed(2)} Kanal
                  </p>
                </div>

                <div className="divide-y divide-slate-100 text-sm">
                  <div className="py-2.5 flex items-start justify-between gap-4">
                    <span className="text-slate-600 leading-snug">
                      25 Gaj / Marla (Panipat & Local Standard)
                    </span>
                    <span className="font-semibold text-slate-900 tabular-nums shrink-0">
                      {marla25Gaj} Marla
                    </span>
                  </div>
                  <div className="py-2.5 flex items-start justify-between gap-4">
                    <span className="text-slate-600 leading-snug">
                      30.25 Gaj / Marla (Haryana Official Standard)
                    </span>
                    <span className="font-semibold text-slate-900 tabular-nums shrink-0">
                      {marla3025Gaj} Marla
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between gap-4">
                    <span className="text-slate-500">Square Feet (Sq.Ft)</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {convertedUnits.sqft.toLocaleString('en-IN')} Sq.Ft
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between gap-4">
                    <span className="text-slate-500">Square Meters (Sq.Mt)</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {convertedUnits.sqmt} Sq.Mt
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between gap-4">
                    <span className="text-slate-500">Kanal (605 Gaj)</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {(gajEquivalent / 605).toFixed(2)} Kanal
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between gap-4">
                    <span className="text-slate-500">Acre (4,840 Gaj)</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {convertedUnits.acre} Acre
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAreaValue(250);
                      setFromUnit('gaj');
                      success('Reset area converter to defaults.');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopyText(areaQuoteText, 'copy-area')}
                      className="gap-1.5"
                    >
                      {copiedId === 'copy-area' ? <Check className="w-3.5 h-3.5 text-brand-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === 'copy-area' ? 'Copied' : 'Copy'}</span>
                    </Button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(areaQuoteText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group btn-cashfree-primary btn-shine-sweep pl-3.5 pr-1.5 h-9 rounded-[11px] text-white font-semibold text-sm inline-flex items-center gap-2 transition whitespace-nowrap"
                    >
                      <Share2 className="w-3.5 h-3.5 text-lime" />
                      <span>Share on WhatsApp</span>
                      <span className="w-6 h-6 rounded-[7px] bg-lime text-ink-black inline-flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.3]" />
                      </span>
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* TOOL 4: BROKERAGE & COMMISSION SPLITTER                  */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTool === 'commission' && (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,480px)_1fr] gap-6 items-start">
              {/* LEFT COLUMN: 2-Column Form */}
              <Card className="p-5 space-y-4 rounded-[14px] border-border bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Deal value (₹ Lakhs)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={1}
                      value={dealValueLakhs}
                      onChange={(e) => setDealValueLakhs(Math.max(0, Number(e.target.value)))}
                      className="w-full h-11 bg-white border border-border rounded-input px-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                    <p className="text-[11px] text-slate-500 leading-snug tabular-nums">
                      {formatRupees(dealValueLakhs * 10000000)} · {formatAmountInWords(dealValueLakhs * 100000)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Commission rate (%)
                    </label>
                    <select
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className="w-full h-11 bg-white border border-border rounded-input px-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer"
                    >
                      <option value={1.0}>1.0% (Single side)</option>
                      <option value={2.0}>2.0% (Both sides: 1% + 1%)</option>
                      <option value={0.5}>0.5% (Large ticket)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Agency house cut (%)
                    </label>
                    <select
                      value={agencyCut}
                      onChange={(e) => setAgencyCut(Number(e.target.value))}
                      className="w-full h-11 bg-white border border-border rounded-input px-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer"
                    >
                      <option value={0}>0% (Solo independent)</option>
                      <option value={10}>10% Agency desk fee</option>
                      <option value={20}>20% Standard split</option>
                      <option value={30}>30% Prime desk fee</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Co-broker split ratio
                    </label>
                    <select
                      value={splitRatio}
                      onChange={(e) => setSplitRatio(Number(e.target.value))}
                      className="w-full h-11 bg-white border border-border rounded-input px-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer"
                    >
                      <option value={50}>50 / 50 Equal co-broker split</option>
                      <option value={60}>60 / 40 Lead broker advantage</option>
                      <option value={100}>100% Solo (No co-broker split)</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* RIGHT COLUMN: Sticky Results Panel */}
              <Card className="p-5 sm:p-6 space-y-5 rounded-[14px] border-border bg-white lg:sticky lg:top-20">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">
                    Gross brokerage earned
                  </span>
                  <div className="text-3xl font-bold text-slate-900 tabular-nums mt-1">
                    ₹{commSplit.totalCommission.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatAmountInWords(commSplit.totalCommission)}
                  </p>
                </div>

                <SplitDonut
                  primaryPct={brokerNetPercent}
                  primaryLabel="Listing broker share"
                  secondaryLabel="Agency & co-broker"
                />

                <div className="divide-y divide-slate-100 text-sm">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Agency house ({agencyCut}%)</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      ₹{commSplit.agencyShare.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Listing broker share</span>
                    <span className="font-bold text-brand-700 tabular-nums">
                      ₹{commSplit.listingBrokerShare.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Closing broker share</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      ₹{commSplit.closingBrokerShare.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

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
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopyText(commissionQuoteText, 'copy-commission')}
                      className="gap-1.5"
                    >
                      {copiedId === 'copy-commission' ? <Check className="w-3.5 h-3.5 text-brand-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === 'copy-commission' ? 'Copied' : 'Copy'}</span>
                    </Button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(commissionQuoteText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group btn-cashfree-primary btn-shine-sweep pl-3.5 pr-1.5 h-9 rounded-[11px] text-white font-semibold text-sm inline-flex items-center gap-2 transition whitespace-nowrap"
                    >
                      <Share2 className="w-3.5 h-3.5 text-lime" />
                      <span>Share on WhatsApp</span>
                      <span className="w-6 h-6 rounded-[7px] bg-lime text-ink-black inline-flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.3]" />
                      </span>
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* TOOL 5: DEAL MESSAGES (WHATSAPP TEMPLATES)               */}
          {/* ──────────────────────────────────────────────────────── */}
          {activeTool === 'templates' && (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,480px)_1fr] gap-6 items-start">
              {/* LEFT COLUMN: Template Picker */}
              <div className="space-y-2.5">
                {templates.map((tpl) => {
                  const isSelected = activeTemplate.id === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={clsx(
                        'w-full text-left p-4 rounded-[14px] border transition-all cursor-pointer flex items-center justify-between gap-3',
                        isSelected
                          ? 'bg-brand-50/60 border-brand-600'
                          : 'bg-white border-border hover:bg-slate-50'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {tpl.title}
                          </span>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                            {tpl.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {tpl.desc}
                        </p>
                      </div>
                      <ChevronRight
                        className={clsx(
                          'w-4 h-4 shrink-0',
                          isSelected ? 'text-brand-600' : 'text-slate-400'
                        )}
                      />
                    </button>
                  );
                })}
              </div>

              {/* RIGHT COLUMN: Sticky Message Preview & Actions */}
              <Card className="p-5 sm:p-6 space-y-4 rounded-[14px] border-border bg-white lg:sticky lg:top-20">
                <div>
                  <span className="text-xs font-medium text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full inline-block">
                    {activeTemplate.category}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-2">
                    {activeTemplate.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeTemplate.desc}
                  </p>
                </div>

                <pre className="p-4 rounded-[12px] bg-slate-50 text-slate-800 text-sm font-sans whitespace-pre-wrap border border-border leading-relaxed">
                  {activeTemplate.text}
                </pre>

                <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleCopyText(activeTemplate.text, activeTemplate.id)}
                    className="gap-1.5"
                  >
                    {copiedId === activeTemplate.id ? <Check className="w-3.5 h-3.5 text-brand-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === activeTemplate.id ? 'Copied' : 'Copy'}</span>
                  </Button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(activeTemplate.text)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group btn-cashfree-primary btn-shine-sweep pl-3.5 pr-1.5 h-9 rounded-[11px] text-white font-semibold text-sm inline-flex items-center gap-2 transition whitespace-nowrap"
                  >
                    <Share2 className="w-3.5 h-3.5 text-lime" />
                    <span>Share on WhatsApp</span>
                    <span className="w-6 h-6 rounded-[7px] bg-lime text-ink-black inline-flex items-center justify-center shrink-0">
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.3]" />
                    </span>
                  </a>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
