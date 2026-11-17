export const sanitizeIndianPhone = (phone?: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
};

export const openWhatsApp = (phone?: string, text?: string) => {
  const cleanPhone = sanitizeIndianPhone(phone);
  const encodedText = encodeURIComponent(text || '');
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const generateFlyerWhatsAppText = (property: {
  title?: string;
  propertyType?: string;
  bhk?: number;
  location?: { society?: string; sector?: string; city?: string };
  pricing?: { expectedPrice?: number; pricePerSqFt?: number };
  specifications?: { superBuiltUpArea?: number; carpetArea?: number; furnishing?: string };
  flyerUrl?: string;
  agencyName?: string;
  brokerPhone?: string;
}): string => {
  const priceLakhs = property.pricing?.expectedPrice
    ? property.pricing.expectedPrice >= 10000000
      ? `₹${(property.pricing.expectedPrice / 10000000).toFixed(2)} Cr`
      : `₹${(property.pricing.expectedPrice / 100000).toFixed(2)} Lacs`
    : 'Price on Request';

  const areaStr = property.specifications?.superBuiltUpArea
    ? `${property.specifications.superBuiltUpArea} Sq.Ft`
    : '';

  const loc = [
    property.location?.society,
    property.location?.sector,
    property.location?.city || 'Gurgaon',
  ]
    .filter(Boolean)
    .join(', ');

  return `🏡 *EXCLUSIVE PROPERTY LISTING*
*${property.title || `${property.bhk ? property.bhk + ' BHK ' : ''}${property.propertyType || 'Apartment'}`}*

📍 *Location:* ${loc}
💰 *Demand:* ${priceLakhs}
📐 *Size:* ${areaStr || 'Spacious layout'}
🛋 *Furnishing:* ${property.specifications?.furnishing || 'Semi-Furnished'}

✨ *Highlights:*
• Prime Connectivity & Gated Community
• Verified Title & Immediate Registry
• Loan Assistance Available

🔗 *View Complete Photo Flyer:*
${property.flyerUrl || 'https://leadnivash.onrender.com'}

📞 *Contact for Exclusive Visit:*
${property.agencyName || 'LeadNivesh Partner'}
${property.brokerPhone ? `WhatsApp: wa.me/${sanitizeIndianPhone(property.brokerPhone)}` : ''}`;
};

export const generateSiteVisitWhatsAppText = (
  clientName: string,
  propertyName: string,
  date: string,
  time: string,
  location: string
): string => {
  return `Namaste ${clientName || 'Ji'},

Confirming our scheduled site visit for *${propertyName}*:
📅 *Date:* ${date}
⏰ *Time:* ${time}
📍 *Meeting Point:* ${location}

Looking forward to showing you the property. Feel free to call me if you need directions!`;
};

export const generateTokenReceiptWhatsAppText = (
  clientName: string,
  propertyName: string,
  tokenAmount: number,
  dealAmount: number,
  paymentMode: string = 'UPI / Cheque'
): string => {
  return `*BOOKING / TOKEN ACKNOWLEDGEMENT*

Received with thanks from *${clientName}*
💰 *Token Amount:* ₹${tokenAmount.toLocaleString('en-IN')}
🏠 *For Property:* ${propertyName}
🏷 *Total Agreed Price:* ₹${dealAmount.toLocaleString('en-IN')}
💳 *Payment Mode:* ${paymentMode}

_Subject to realization & legal paperwork verification._
Thank you for your trust!`;
};
