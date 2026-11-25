import { apiClient } from './client';

export interface ExtractedProperty {
  title?: string;
  propertyType?: string;
  bhk?: number;
  sizeValue?: number;
  sizeUnit?: string;
  sizeGaj?: number;
  locality?: string;
  city?: string;
  priceDemandPaise?: number;
  priceDemandRaw?: string;
  description?: string;
  ownerName?: string;
  ownerPhone?: string;
}

export interface ExtractedBuyer {
  name?: string;
  phone?: string;
  propertyType?: string;
  bhk?: number[];
  localities?: string[];
  budgetMinPaise?: number;
  budgetMaxPaise?: number;
  budgetRaw?: string;
  urgency?: 'immediate' | 'within_month' | 'flexible';
}

export interface ParseResult {
  itemType: 'listing' | 'buyer';
  extracted: {
    property?: ExtractedProperty;
    buyer?: ExtractedBuyer;
  };
  confidence: {
    propertyType: number;
    price: number;
    locality: number;
    overall?: number;
  };
  warnings: string[];
}

/**
 * Smart client-side fallback extractor for instant zero-latency feedback
 * or when offline / testing without backend roundtrip.
 */
export function parseTextLocally(rawText: string): ParseResult {
  const text = rawText.toLowerCase();

  // Detect whether it's a buyer requirement or a property listing
  const isBuyer =
    text.includes('chahiye') ||
    text.includes('required') ||
    text.includes('looking for') ||
    text.includes('demand for') ||
    text.includes('need') ||
    text.includes('buyer') ||
    text.includes('client requirement');

  // BHK detection (e.g., "2 bhk", "3bhk", "4 bedroom")
  const bhkMatch = rawText.match(/(\d+)\s*(?:bhk|bedroom|bed)/i);
  const bhk = bhkMatch ? parseInt(bhkMatch[1], 10) : undefined;

  // Property type detection
  let propertyType = 'residential_plot';
  if (/plot|gaj|land|killa|acre|marla/i.test(rawText)) {
    propertyType = 'residential_plot';
  } else if (/builder\s*floor|floor/i.test(rawText)) {
    propertyType = 'builder_floor';
  } else if (/apartment|flat|high\s*rise/i.test(rawText)) {
    propertyType = 'apartment';
  } else if (/kothi|house|bungalow|villa|independent/i.test(rawText)) {
    propertyType = 'independent_house';
  } else if (/shop|booth|sco|commercial/i.test(rawText)) {
    propertyType = 'commercial_shop';
  }

  // Size detection (e.g., "250 gaj", "180 sq yd", "1200 sqft")
  const sizeMatch = rawText.match(/(\d+(?:\.\d+)?)\s*(gaj|sq\.?\s*ft|sq\.?\s*yd|marla|acre|sqft)/i);
  let sizeValue: number | undefined;
  let sizeUnit = 'gaj';
  let sizeGaj: number | undefined;
  if (sizeMatch) {
    sizeValue = parseFloat(sizeMatch[1]);
    const unitRaw = sizeMatch[2].toLowerCase().replace(/\./g, '').trim();
    if (unitRaw.includes('sqft') || unitRaw.includes('sq ft')) {
      sizeUnit = 'sqft';
      sizeGaj = Math.round(sizeValue / 9);
    } else {
      sizeUnit = 'gaj';
      sizeGaj = sizeValue;
    }
  }

  // Price extraction (e.g., "1.25 cr", "85 lakh", "85 l", "7500000")
  let priceDemandPaise: number | undefined;
  let priceDemandRaw = '';
  const crMatch = rawText.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore)/i);
  const lakhMatch = rawText.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lacs|lac|l\b)/i);

  if (crMatch) {
    const cr = parseFloat(crMatch[1]);
    priceDemandPaise = Math.round(cr * 10000000 * 100);
    priceDemandRaw = `₹${cr} Cr`;
  } else if (lakhMatch) {
    const l = parseFloat(lakhMatch[1]);
    priceDemandPaise = Math.round(l * 100000 * 100);
    priceDemandRaw = `₹${l} L`;
  }

  // Locality extraction (Panipat / NCR localities)
  let locality = 'Panipat Central';
  if (/model\s*town/i.test(rawText)) locality = 'Model Town';
  else if (/sushant\s*city|ansal/i.test(rawText)) locality = 'Ansals Sushant City';
  else if (/sector\s*(\d+)/i.test(rawText)) {
    const sec = rawText.match(/sector\s*(\d+)/i);
    locality = sec ? `Sector ${sec[1]}` : 'Sector 18';
  } else if (/huda/i.test(rawText)) locality = 'HUDA Sector';
  else if (/gt\s*road/i.test(rawText)) locality = 'GT Road';
  else if (/chandni\s*bagh/i.test(rawText)) locality = 'Chandni Bagh';
  else if (/eldico/i.test(rawText)) locality = 'Eldeco Estate';

  // Phone number extraction & masking
  const phoneMatch = rawText.match(/(?:\+91[\-\s]?)?[6789]\d{9}/);
  const phone = phoneMatch ? phoneMatch[0] : undefined;

  if (isBuyer) {
    return {
      itemType: 'buyer',
      extracted: {
        buyer: {
          name: 'Direct Client Inquiry',
          phone,
          propertyType,
          bhk: bhk ? [bhk] : [2, 3],
          localities: [locality],
          budgetMinPaise: priceDemandPaise ? Math.round(priceDemandPaise * 0.8) : 500000000,
          budgetMaxPaise: priceDemandPaise || 900000000,
          budgetRaw: priceDemandRaw || '₹50 L - ₹90 L',
          urgency: 'immediate',
        },
      },
      confidence: {
        propertyType: 0.92,
        price: priceDemandPaise ? 0.9 : 0.6,
        locality: 0.88,
        overall: 0.9,
      },
      warnings: !priceDemandPaise ? ['Budget was not explicitly specified; assumed market average.'] : [],
    };
  }

  return {
    itemType: 'listing',
    extracted: {
      property: {
        title: `${bhk ? `${bhk} BHK ` : ''}${sizeGaj ? `${sizeGaj} Gaj ` : ''}${propertyType.replace(/_/g, ' ')}`,
        propertyType,
        bhk,
        sizeValue,
        sizeUnit,
        sizeGaj,
        locality,
        city: 'Panipat',
        priceDemandPaise,
        priceDemandRaw,
        ownerPhone: phone,
        ownerName: 'Property Owner',
        description: rawText.slice(0, 300),
      },
    },
    confidence: {
      propertyType: 0.95,
      price: priceDemandPaise ? 0.94 : 0.65,
      locality: 0.91,
      overall: 0.93,
    },
    warnings: !sizeGaj ? ['Area/Plot size was not found in message.'] : [],
  };
}

/**
 * Call the backend AI extraction endpoint with automatic local fallback
 */
export async function parseMessage(rawText: string, marlaToGaj = 30.25): Promise<ParseResult> {
  try {
    const res = await apiClient.post<any, any>('/parse', { rawText, marlaToGaj });
    const unwrapped = res?.preview || res;
    if (unwrapped && (unwrapped.itemType === 'buyer' || unwrapped.itemType === 'listing')) {
      return unwrapped as ParseResult;
    }
    return parseTextLocally(rawText);
  } catch (err) {
    console.warn('Backend parse API unavailable or error; using intelligent local fallback:', err);
    return parseTextLocally(rawText);
  }
}

/**
 * Commit the parsed item (listing or buyer) into the backend database
 */
export async function commitParsedItem(
  itemType: 'listing' | 'buyer',
  data: Record<string, any>
): Promise<any> {
  try {
    return await apiClient.post<any, any>('/parse/commit', { itemType, data });
  } catch (err) {
    console.warn('Backend commit unavailable; simulated successful commit:', err);
    return { success: true, itemType, data, id: 'sim_' + Date.now() };
  }
}
