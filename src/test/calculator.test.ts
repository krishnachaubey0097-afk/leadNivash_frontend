import { describe, it, expect } from 'vitest';
import { calculateStateRegistry, calculateHaryanaRegistry } from '../lib/calculators';
import { INDIAN_STATES } from '../lib/indianStates';

export const calculateCommission = (
  dealValueRupees: number,
  commissionRate: number,
  monthlyDealsCount: number
) => {
  const commissionPerDeal = (dealValueRupees * commissionRate) / 100;
  const monthlyCommission = commissionPerDeal * monthlyDealsCount;
  const annualCommission = monthlyCommission * 12;

  return {
    commissionPerDeal,
    monthlyCommission,
    annualCommission,
  };
};

export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

describe('Phase 5 Financial Impact Calculator Engine', () => {
  it('validates default specification case accurately', () => {
    // Deal: ₹75,00,000, Rate: 1.5%, Monthly: 3 deals
    const res = calculateCommission(7500000, 1.5, 3);

    expect(res.commissionPerDeal).toBe(112500);
    expect(res.monthlyCommission).toBe(337500);
    expect(res.annualCommission).toBe(4050000);

    expect(formatINR(res.commissionPerDeal)).toBe('₹1,12,500');
    expect(formatINR(res.monthlyCommission)).toBe('₹3,37,500');
    expect(formatINR(res.annualCommission)).toBe('₹40,50,000');
  });

  it('validates shortcut ₹45 Lakh at 1.5% with 2 deals', () => {
    const res = calculateCommission(4500000, 1.5, 2);
    // Per deal: 45,00,000 * 0.015 = 67,500
    // Monthly: 67,500 * 2 = 1,35,000
    // Annual: 1,35,000 * 12 = 16,20,000
    expect(res.commissionPerDeal).toBe(67500);
    expect(res.monthlyCommission).toBe(135000);
    expect(res.annualCommission).toBe(1620000);
    expect(formatINR(res.commissionPerDeal)).toBe('₹67,500');
    expect(formatINR(res.monthlyCommission)).toBe('₹1,35,000');
    expect(formatINR(res.annualCommission)).toBe('₹16,20,000');
  });

  it('validates shortcut ₹1.5 Crore at 2.0% with 1 deal', () => {
    const res = calculateCommission(15000000, 2.0, 1);
    // Per deal: 1,50,00,000 * 0.02 = 3,00,000
    // Monthly: 3,00,000 * 1 = 3,00,000
    // Annual: 3,00,000 * 12 = 36,00,000
    expect(res.commissionPerDeal).toBe(300000);
    expect(res.monthlyCommission).toBe(300000);
    expect(res.annualCommission).toBe(3600000);
    expect(formatINR(res.commissionPerDeal)).toBe('₹3,00,000');
    expect(formatINR(res.monthlyCommission)).toBe('₹3,00,000');
    expect(formatINR(res.annualCommission)).toBe('₹36,00,000');
  });

  it('validates 10 deals per month high velocity pipeline at 1.0%', () => {
    const res = calculateCommission(10000000, 1.0, 10);
    // Per deal: 1,00,000
    // Monthly: 10,00,000
    // Annual: 1,20,00,000
    expect(res.commissionPerDeal).toBe(100000);
    expect(res.monthlyCommission).toBe(1000000);
    expect(res.annualCommission).toBe(12000000);
    expect(formatINR(res.annualCommission)).toBe('₹1,20,00,000');
  });
});

describe('Pan-India State Stamp Duty & Registry Calculator Engine', () => {
  it('covers all 28 Indian States and 8 Union Territories (36 regions)', () => {
    expect(INDIAN_STATES.length).toBe(36);
  });

  it('computes Haryana urban female vs male stamp duty + 50k cap slab accurately', () => {
    const maleUrban = calculateHaryanaRegistry(10000000, 'male', 'urban');
    expect(maleUrban.stampDutyPercent).toBe(7);
    expect(maleUrban.stampDutyAmount).toBe(700000);
    expect(maleUrban.registrationFee).toBe(50000);

    const femaleUrban = calculateStateRegistry(10000000, 'Haryana', 'female', 'urban');
    expect(femaleUrban.stampDutyPercent).toBe(5);
    expect(femaleUrban.stampDutyAmount).toBe(500000);
    expect(femaleUrban.registrationFee).toBe(50000);
  });

  it('computes Maharashtra metro surcharge & ₹30,000 capped registration fee', () => {
    const mh = calculateStateRegistry(10000000, 'Maharashtra', 'male', 'urban');
    expect(mh.stateName).toBe('Maharashtra');
    expect(mh.stampDutyPercent).toBe(7); // 6% + 1% urban surcharge
    expect(mh.registrationFee).toBe(30000); // capped at ₹30,000
  });

  it('computes Gujarat sole female exemption cleanly', () => {
    const gjFemale = calculateStateRegistry(5000000, 'Gujarat', 'female', 'urban');
    expect(gjFemale.stampDutyPercent).toBe(4.9);
    expect(gjFemale.registrationFee).toBe(0);
  });

  it('computes Tamil Nadu stamp duty + 2% registration charge', () => {
    const tn = calculateStateRegistry(5000000, 'Tamil Nadu', 'male', 'urban');
    expect(tn.stampDutyPercent).toBe(7);
    expect(tn.stampDutyAmount).toBe(350000);
    expect(tn.registrationFee).toBe(100000);
  });
});
