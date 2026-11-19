import React, { useState } from 'react';
import {
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
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

export const ToolsPage: React.FC = () => {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<'area' | 'registry' | 'emi' | 'commission' | 'templates'>('area');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
  // Tool 3: EMI Calculator State
  // -------------------------------------------------------------
  const [loanLakhs, setLoanLakhs] = useState<number>(60);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const emiCalc = calculateEmi(loanLakhs * 100000, interestRate, tenureYears);

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
      text: `Namaste ji, kal sham 4:00 baje Ansal Sushant City Sector 18 Panipat par plot visit confirm hai.\n📍 Location: https://maps.google.com\nKoi badlaav ho to pehle batayein.\n\n— Sharma Real Estate Agency`,
    },
    {
      id: 'token-receipt',
      title: 'Token Advance Acknowledgment',
      desc: 'Instant receipt for bayana / token received',
      text: `Receipt Note:\nToken advance ₹50,000 received for Deal: 250 Gaj Plot, Sector 18 Panipat.\nAgreement timeline: 15 Days.\nBalance deal value to be executed as per registry schedule.\n\n— Sharma Real Estate Agency`,
    },
    {
      id: 'doc-checklist',
      title: 'Registry Document Checklist',
      desc: 'Checklist for buyer before going to Tehsil',
      text: `Tehsil Registry Document Checklist:\n1. Buyer & Seller Aadhaar Card (Original + 2 copies)\n2. PAN Card of both parties\n3. 4 Passport size color photos\n4. 2 Witnesses with valid Voter ID / Aadhaar\n5. Circle rate demand draft / stamp receipt\n6. Municipal / HUDA No Objection Certificate (NOC)\n\n— Sharma Real Estate Agency`,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-ink font-heading tracking-tight">
              Broker Field Toolkit
            </h1>
            <Badge variant="brand">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              Calculators
            </Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Instant Haryana land unit conversion, registry stamp duty, EMI math & co-broker splits.
          </p>
        </div>
      </div>

      {/* Segmented Top Navigation Tabs */}
      <div className="flex p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-full border border-border/80 overflow-x-auto scrollbar-none">
        {[
          { id: 'area', label: 'Area Converter' },
          { id: 'registry', label: 'Registry & Stamp' },
          { id: 'emi', label: 'Home Loan EMI' },
          { id: 'commission', label: 'Brokerage Split' },
          { id: 'templates', label: 'WhatsApp Chips' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={clsx(
              'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer',
              activeTab === tab.id
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-muted hover:text-ink'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* TOOL 1: AREA UNIT CONVERTER                              */}
      {/* ======================================================== */}
      {activeTab === 'area' && (
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
      {activeTab === 'registry' && (
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
                      'py-2 px-1 rounded-xl text-[11px] font-bold transition cursor-pointer border text-center',
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
                      'py-2 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer border text-center',
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
                  `Haryana Registry Cost Estimate:\nProperty Value: ₹${registryPriceLakhs} Lakhs\nBuyer Ownership: ${buyerGender.toUpperCase()}\nStamp Duty (${registryCalc.stampDutyPercent}%): ₹${registryCalc.stampDutyAmount.toLocaleString('en-IN')}\nGovt Registration Fee: ₹${registryCalc.registrationFee.toLocaleString('en-IN')}\nTotal Govt Expenses: ₹${registryCalc.totalGovtFees.toLocaleString('en-IN')}\n\n— Sharma Real Estate Agency`,
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
      {/* TOOL 3: HOME LOAN & MONTHLY EMI CALCULATOR               */}
      {/* ======================================================== */}
      {activeTab === 'emi' && (
        <Card className="p-5 sm:p-6 space-y-5 border-emerald-500/30 shadow-card animate-in fade-in duration-200">
          <div>
            <h2 className="text-base font-black text-ink font-heading">
              Home Loan & Monthly EMI Calculator
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Calculate exact monthly installments and total interest outflow for buyers.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Loan Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
                  Loan Principal Amount
                </label>
                <span className="font-black text-brand-700 dark:text-brand-600 text-sm">
                  ₹{loanLakhs} Lakhs
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={300}
                step={5}
                value={loanLakhs}
                onChange={(e) => setLoanLakhs(Number(e.target.value))}
                className="w-full accent-emerald-700 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Interest Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
                  Annual Interest Rate (% p.a.)
                </label>
                <span className="font-black text-ink text-sm">{interestRate}%</span>
              </div>
              <input
                type="range"
                min={7.0}
                max={12.0}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-emerald-700 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Tenure Years */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
                  Loan Tenure (Years)
                </label>
                <span className="font-black text-ink text-sm">{tenureYears} Years</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full accent-emerald-700 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Results KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-500/30 space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted">Monthly EMI</span>
              <span className="text-xl font-black text-brand-700 dark:text-brand-600 block">
                ₹{emiCalc.monthlyEmi.toLocaleString('en-IN')} <span className="text-xs font-normal text-muted">/ month</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted">Total Interest</span>
              <span className="text-lg font-bold text-ink block">
                ₹{emiCalc.totalInterest.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted">Total Payment</span>
              <span className="text-lg font-bold text-ink block">
                ₹{emiCalc.totalPayment.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Copy EMI quotation button */}
          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              pill
              variant="secondary"
              onClick={() =>
                handleCopyText(
                  `Home Loan Estimate:\nLoan Amount: ₹${loanLakhs} Lakhs @ ${interestRate}%\nTenure: ${tenureYears} Years\nMonthly EMI: ₹${emiCalc.monthlyEmi.toLocaleString('en-IN')}/mo\nTotal Interest: ₹${emiCalc.totalInterest.toLocaleString('en-IN')}\n\n— Sharma Real Estate Agency`,
                  'copy-emi'
                )
              }
              className="text-xs font-bold flex items-center gap-1.5"
            >
              {copiedId === 'copy-emi' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'copy-emi' ? 'Copied' : 'Copy Loan EMI Quote'}</span>
            </Button>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* TOOL 4: CO-BROKER COMMISSION SPLITTER                    */}
      {/* ======================================================== */}
      {activeTab === 'commission' && (
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
      {activeTab === 'templates' && (
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
  );
};
