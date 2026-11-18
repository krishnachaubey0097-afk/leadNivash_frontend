import { describe, it, expect } from 'vitest';

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
