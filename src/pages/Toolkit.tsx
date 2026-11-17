import React, { useState } from 'react';
import {
  type AreaUnit,
  UNIT_LABELS,
  convertAllUnits,
  calculateHaryanaRegistry,
  calculateEmi,
  calculateCommissionSplit,
  type BuyerGender,
  type AreaType,
} from '../lib/calculators';
import {
  Wrench,
  Calculator,
  Building2,
  IndianRupee,
  PieChart,
  Check,
  Copy,
  Info,
} from 'lucide-react';
import clsx from 'clsx';

export const Toolkit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'area' | 'registry' | 'emi' | 'commission'>('area');

  // Area Converter State
  const [areaValue, setAreaValue] = useState<number>(100);
  const [fromUnit, setFromUnit] = useState<AreaUnit>('gaj');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Registry State
  const [propValue, setPropValue] = useState<number>(15000000); // 1.5 Cr
  const [gender, setGender] = useState<BuyerGender>('male');
  const [areaType, setAreaType] = useState<AreaType>('urban');

  // EMI State
  const [loanAmount, setLoanAmount] = useState<number>(10000000); // 1 Cr
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);

  // Commission State
  const [dealValue, setDealValue] = useState<number>(20000000); // 2 Cr
  const [commRate, setCommRate] = useState<number>(1.0); // 1%
  const [agencyCut, setAgencyCut] = useState<number>(20); // 20%
  const [brokerSplit, setBrokerSplit] = useState<number>(50); // 50-50

  const allConverted = convertAllUnits(areaValue, fromUnit);
  const registryResult = calculateHaryanaRegistry(propValue, gender, areaType);
  const emiResult = calculateEmi(loanAmount, interestRate, tenureYears);
  const commissionResult = calculateCommissionSplit(dealValue, commRate, agencyCut, brokerSplit);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Broker Toolkit
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Haryana land units, official stamp duties, EMI & deal commission splitters
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-x-auto no-scrollbar">
        {[
          { id: 'area', label: 'Area Units', icon: Building2 },
          { id: 'registry', label: 'Haryana Registry', icon: IndianRupee },
          { id: 'emi', label: 'Home Loan EMI', icon: Calculator },
          { id: 'commission', label: 'Commission', icon: PieChart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex-1 justify-center',
                isActive
                  ? 'bg-white dark:bg-[#131B2A] text-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: AREA UNIT CONVERTER */}
      {activeTab === 'area' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Input Measurement
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Enter Value
                </label>
                <input
                  type="number"
                  value={areaValue}
                  onChange={(e) => setAreaValue(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Unit Type
                </label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value as AreaUnit)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {(Object.keys(UNIT_LABELS) as AreaUnit[]).map((u) => (
                    <option key={u} value={u}>
                      {UNIT_LABELS[u]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Real-Time Conversion Output Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(allConverted) as AreaUnit[]).map((unit) => {
              const val = allConverted[unit];
              const isSelected = unit === fromUnit;
              return (
                <div
                  key={unit}
                  className={clsx(
                    'p-3.5 rounded-xl border transition flex items-center justify-between',
                    isSelected
                      ? 'bg-primary/10 border-primary/40'
                      : 'bg-white dark:bg-[#131B2A] border-slate-200 dark:border-slate-800'
                  )}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {UNIT_LABELS[unit]}
                    </span>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {val.toLocaleString('en-IN', { maximumFractionDigits: 3 })}
                    </p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(val.toString(), unit)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition"
                    title="Copy value"
                  >
                    {copiedKey === unit ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Haryana Land Reference Note */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              Standard Haryana revenue conversion: 1 Gaj = 9 Sq.Ft | 1 Marla = 25 Gaj (225 Sq.Ft) |
              1 Kanal = 20 Marlas | 1 Acre = 4840 Gaj (8 Kanals).
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: HARYANA REGISTRY ESTIMATOR */}
      {activeTab === 'registry' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Property Circle / Agreement Value (₹)
              </label>
              <input
                type="number"
                value={propValue}
                onChange={(e) => setPropValue(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                ₹{(propValue / 10000000).toFixed(2)} Crore (₹{(propValue / 100000).toFixed(2)} Lacs)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Buyer Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as BuyerGender)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="male">Male Buyer (7% Urban / 5% Rural)</option>
                  <option value="female">Female Buyer (5% Urban / 3% Rural)</option>
                  <option value="joint">Joint (Male + Female - 6% Urban)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Area Location
                </label>
                <select
                  value={areaType}
                  onChange={(e) => setAreaType(e.target.value as AreaType)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="urban">Urban (MCG Gurugram / Faridabad)</option>
                  <option value="rural">Rural / Gram Panchayat</option>
                </select>
              </div>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Total Govt Duties Payable
              </span>
              <span className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                ₹{registryResult.totalGovtFees.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Stamp Duty Rate</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {registryResult.stampDutyPercent}%
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Stamp Duty Amount</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{registryResult.stampDutyAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Registration Fee (Official Cap)</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{registryResult.registrationFee.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Net Total Property Outflow</span>
                <span>₹{registryResult.netEstimatedCost.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HOME LOAN EMI CALCULATOR */}
      {activeTab === 'emi' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Loan Amount (₹)
              </label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Tenure (Years)
                </label>
                <input
                  type="number"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* EMI Output Card */}
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="text-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Monthly EMI
              </span>
              <p className="text-2xl font-black text-primary mt-0.5">
                ₹{emiResult.monthlyEmi.toLocaleString('en-IN')} / mo
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                <span className="text-slate-400 text-[10px] block">Principal Loan</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹{emiResult.principal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                <span className="text-slate-400 text-[10px] block">Total Interest</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  ₹{emiResult.totalInterest.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMMISSION SPLITTER */}
      {activeTab === 'commission' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Total Deal / Sale Value (₹)
              </label>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Commission %
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={commRate}
                  onChange={(e) => setCommRate(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Agency House %
                </label>
                <input
                  type="number"
                  value={agencyCut}
                  onChange={(e) => setAgencyCut(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Listing Split %
                </label>
                <input
                  type="number"
                  value={brokerSplit}
                  onChange={(e) => setBrokerSplit(parseFloat(e.target.value) || 50)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Commission Breakdown Card */}
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Gross Deal Commission
              </span>
              <span className="text-lg font-black text-primary">
                ₹{commissionResult.totalCommission.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Agency House Share ({agencyCut}%)</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{commissionResult.agencyShare.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Listing Broker Payout ({brokerSplit}%)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{commissionResult.listingBrokerShare.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Closing Broker Payout ({100 - brokerSplit}%)</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  ₹{commissionResult.closingBrokerShare.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
