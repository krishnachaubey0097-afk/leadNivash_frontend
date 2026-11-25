// Brand constants – used throughout the UI
export const BRAND_NAME = "LeadNivash";

// Shared subscription plan & pricing config (source of truth across Landing, Settings, and Upgrade Modal)
export const PLAN_PRICING = {
  trialDays: 14,
  monthlyRupees: 399,
  annualStandardRupees: 3999,
  annualTrialOfferRupees: 3299,
  annualDiscountRupees: 700,
  annualEffectiveMonthlyRupees: 275,
  formattedMonthly: '₹399/month',
  formattedAnnualStandard: '₹3,999/year',
  formattedAnnualOffer: '₹3,299/year',
  priceLine: '₹3,299/year during trial (₹3,999/year standard) · ₹399/month',
} as const;
