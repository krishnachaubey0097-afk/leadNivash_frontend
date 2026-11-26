// Brand constants – used throughout the UI
export const BRAND_NAME = "LeadNivash";

// Official brand contact & support channels
export const BRAND_CONTACT = {
  email: 'leadnivash@gmail.com',
  phone: '+919876543210',
  phoneDisplay: '+91 98765 43210',
  whatsappUrl: 'https://wa.me/919876543210',
} as const;

// Official social media channels
export const SOCIAL_LINKS = {
  x: 'https://x.com/leadnivassh',
  xHandle: '@leadnivassh',
  instagram: 'https://www.instagram.com/leadnivash?gwpx=eW9vejJrcWdxbHg=',
  linkedin: 'https://www.linkedin.com/in/leadnivash',
} as const;

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
