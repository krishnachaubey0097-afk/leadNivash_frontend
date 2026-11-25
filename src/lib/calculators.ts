// Area Converter
import { getStateRule, type IndianStateRule } from './indianStates';

export type AreaUnit = 'sqft' | 'gaj' | 'sqmt' | 'marla' | 'bigha' | 'acre';

export const UNIT_LABELS: Record<AreaUnit, string> = {
  sqft: 'Square Feet (Sq.Ft)',
  gaj: 'Gaj / Sq.Yards (गज)',
  sqmt: 'Square Meters (Sq.Mt)',
  marla: 'Marla (मरला - 25 Gaj)',
  bigha: 'Bigha (बीघा - 1000 Gaj)',
  acre: 'Acre (एकड़ - 4840 Gaj)',
};

// Conversions in terms of Sq.Ft
const SQFT_FACTORS: Record<AreaUnit, number> = {
  sqft: 1,
  gaj: 9,
  sqmt: 10.7639,
  marla: 225, // Haryana 1 Marla = 25 Gaj = 225 Sq.Ft
  bigha: 9000, // 1000 Gaj
  acre: 43560, // 4840 Gaj = 43560 Sq.Ft
};

export const convertArea = (value: number, from: AreaUnit, to: AreaUnit): number => {
  if (!value || isNaN(value)) return 0;
  const sqft = value * SQFT_FACTORS[from];
  return Number((sqft / SQFT_FACTORS[to]).toFixed(3));
};

export const convertAllUnits = (value: number, from: AreaUnit): Record<AreaUnit, number> => {
  const result: Partial<Record<AreaUnit, number>> = {};
  (Object.keys(SQFT_FACTORS) as AreaUnit[]).forEach((unit) => {
    result[unit] = convertArea(value, from, unit);
  });
  return result as Record<AreaUnit, number>;
};

// Haryana Registry & Stamp Duty Calculator
export type BuyerGender = 'male' | 'female' | 'joint';
export type AreaType = 'urban' | 'rural';

export interface RegistryCalculation {
  propertyValue: number;
  stampDutyPercent: number;
  stampDutyAmount: number;
  registrationFee: number;
  totalGovtFees: number;
  netEstimatedCost: number;
}

export interface StateRegistryCalculation extends RegistryCalculation {
  stateName: string;
  stateRule: IndianStateRule;
}

export const calculateStateRegistry = (
  propertyValue: number,
  stateName: string = 'Haryana',
  gender: BuyerGender = 'male',
  area: AreaType = 'urban'
): StateRegistryCalculation => {
  const rule = getStateRule(stateName);

  if (!propertyValue || propertyValue <= 0) {
    return {
      stateName: rule.name,
      stateRule: rule,
      propertyValue: 0,
      stampDutyPercent: 0,
      stampDutyAmount: 0,
      registrationFee: 0,
      totalGovtFees: 0,
      netEstimatedCost: 0,
    };
  }

  const basePct =
    gender === 'female'
      ? rule.stampFemalePct
      : gender === 'joint'
      ? rule.stampJointPct
      : rule.stampMalePct;

  let stampDutyPercent = basePct;
  if (rule.name === 'Haryana') {
    stampDutyPercent = area === 'urban' ? basePct : Math.max(3, basePct - 2);
  } else if (area === 'urban' && rule.urbanExtraPct > 0) {
    stampDutyPercent = Number((basePct + rule.urbanExtraPct).toFixed(2));
  }

  const stampDutyAmount = Math.round((propertyValue * stampDutyPercent) / 100);

  let registrationFee = 0;
  if (rule.regFeeMode === 'haryana-slab') {
    if (propertyValue <= 100000) registrationFee = 1000;
    else if (propertyValue <= 500000) registrationFee = 5000;
    else if (propertyValue <= 1000000) registrationFee = 10000;
    else if (propertyValue <= 2500000) registrationFee = 25000;
    else registrationFee = 50000;
  } else {
    const effectiveRegPct = gender === 'female' && rule.femaleRegExempt ? 0 : rule.regFeePct;
    const rawRegFee = Math.round((propertyValue * effectiveRegPct) / 100);
    registrationFee = rule.regFeeCap !== null ? Math.min(rawRegFee, rule.regFeeCap) : rawRegFee;
  }

  const totalGovtFees = stampDutyAmount + registrationFee;
  const netEstimatedCost = propertyValue + totalGovtFees;

  return {
    stateName: rule.name,
    stateRule: rule,
    propertyValue,
    stampDutyPercent,
    stampDutyAmount,
    registrationFee,
    totalGovtFees,
    netEstimatedCost,
  };
};

export const calculateHaryanaRegistry = (
  propertyValue: number,
  gender: BuyerGender = 'male',
  area: AreaType = 'urban'
): RegistryCalculation => {
  return calculateStateRegistry(propertyValue, 'Haryana', gender, area);
};

// Home Loan / EMI Calculator
export interface EmiCalculation {
  principal: number;
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
}

export const calculateEmi = (
  loanAmount: number,
  annualRate: number,
  tenureYears: number
): EmiCalculation => {
  if (!loanAmount || !annualRate || !tenureYears) {
    return { principal: 0, monthlyEmi: 0, totalInterest: 0, totalPayment: 0 };
  }
  const monthlyRate = annualRate / (12 * 100);
  const totalMonths = tenureYears * 12;

  const emi =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const roundedEmi = Math.round(emi);
  const totalPayment = roundedEmi * totalMonths;
  const totalInterest = totalPayment - loanAmount;

  return {
    principal: loanAmount,
    monthlyEmi: roundedEmi,
    totalInterest,
    totalPayment,
  };
};

// Brokerage Commission Splitter
export interface CommissionSplit {
  dealValue: number;
  commissionRate: number;
  totalCommission: number;
  agencyShare: number;
  closingBrokerShare: number;
  listingBrokerShare: number;
}

export const calculateCommissionSplit = (
  dealValue: number,
  commissionPercent: number = 1.0,
  agencyCutPercent: number = 20, // Agency house cut
  splitRatio: number = 50 // 50% Listing broker, 50% Closing broker of remainder
): CommissionSplit => {
  const totalCommission = Math.round((dealValue * commissionPercent) / 100);
  const agencyShare = Math.round((totalCommission * agencyCutPercent) / 100);
  const pool = totalCommission - agencyShare;
  const listingBrokerShare = Math.round((pool * splitRatio) / 100);
  const closingBrokerShare = pool - listingBrokerShare;

  return {
    dealValue,
    commissionRate: commissionPercent,
    totalCommission,
    agencyShare,
    closingBrokerShare,
    listingBrokerShare,
  };
};
