// LeadNivesh Integer Paise Money Engine (PRD §3.6, §7.6)
// Rule: NEVER use floating point numbers for currency math. 1 Rupee = 100 Paise.

/**
 * Parses freeform user text (e.g. "15 lakh", "1.2cr", "90L", "1500000") into integer paise.
 * Returns null if the string cannot be parsed into a valid positive monetary value.
 */
export const parseToPaise = (input: string | number): number | null => {
  if (typeof input === 'number') {
    if (isNaN(input) || input < 0) return null;
    return Math.round(input * 100);
  }

  if (!input || typeof input !== 'string') return null;
  const cleaned = input.trim().toLowerCase().replace(/,/g, '').replace(/₹/g, '').trim();
  if (!cleaned) return null;

  // Crore pattern: e.g. "1.2 cr", "1.25crore", "2cr"
  const crMatch = cleaned.match(/^([\d.]+)\s*(?:cr|crore|crores)$/);
  if (crMatch) {
    const val = parseFloat(crMatch[1]);
    if (isNaN(val) || val < 0) return null;
    return Math.round(val * 10000000 * 100);
  }

  // Lakh pattern: e.g. "15 lac", "90lakh", "90l", "85.5 lacs"
  const lakhMatch = cleaned.match(/^([\d.]+)\s*(?:l|lac|lacs|lakh|lakhs)$/);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]);
    if (isNaN(val) || val < 0) return null;
    return Math.round(val * 100000 * 100);
  }

  // Thousand pattern: e.g. "50k", "50 thousand"
  const kMatch = cleaned.match(/^([\d.]+)\s*(?:k|thousand)$/);
  if (kMatch) {
    const val = parseFloat(kMatch[1]);
    if (isNaN(val) || val < 0) return null;
    return Math.round(val * 1000 * 100);
  }

  // Plain digits / float string
  const plainVal = parseFloat(cleaned);
  if (isNaN(plainVal) || plainVal < 0) return null;
  return Math.round(plainVal * 100);
};

/**
 * Formats integer paise to full Indian number format: e.g. ₹15,00,000
 */
export const formatRupees = (paise?: number | null): string => {
  if (paise == null || isNaN(paise)) return '₹0';
  const rupees = Math.floor(paise / 100);
  return '₹' + rupees.toLocaleString('en-IN');
};

/**
 * Formats integer paise to short readable notation for broker mobile UI:
 * e.g. ₹1.25 Cr, ₹85 L, ₹50 K
 */
export const formatShortPrice = (paise?: number | null): string => {
  if (paise == null || isNaN(paise)) return '₹0';
  const rupees = Math.floor(paise / 100);

  if (rupees >= 10000000) {
    const cr = Number((rupees / 10000000).toFixed(2));
    return `₹${cr} Cr`;
  }
  if (rupees >= 100000) {
    const lakh = Number((rupees / 100000).toFixed(2));
    return `₹${lakh} L`;
  }
  if (rupees >= 1000) {
    const k = Number((rupees / 1000).toFixed(1));
    return `₹${k} K`;
  }
  return `₹${rupees.toLocaleString('en-IN')}`;
};
