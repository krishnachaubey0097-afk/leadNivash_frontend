import { apiClient } from './client';
import { fetchProperties, type PropertyItem } from './properties';

export interface BuyerItem {
  _id: string;
  name: string;
  phone: string;
  phoneE164?: string;
  email?: string;
  localities: Array<{ display: string; key: string } | string>;
  anyLocality?: boolean;
  types: string[];
  purpose: 'Sale' | 'Rent';
  budget: {
    minPaise?: number;
    maxPaise: number;
    isApproximate?: boolean;
  };
  sizeGaj?: {
    min?: number;
    max?: number;
  };
  urgency: 'hot' | 'warm' | 'cold';
  status: 'active' | 'paused' | 'closed';
  source?: 'manual' | 'paste' | 'lead_form';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBuyerDto {
  name: string;
  phone: string;
  localities: string[];
  anyLocality?: boolean;
  types: string[];
  purpose?: 'Sale' | 'Rent';
  budget: {
    minPaise?: number;
    maxPaise: number;
  };
  sizeGaj?: {
    min?: number;
    max?: number;
  };
  urgency?: 'hot' | 'warm' | 'cold';
  status?: 'active' | 'paused' | 'closed';
  notes?: string;
}

export interface BuyerMatchResult {
  property: PropertyItem;
  score: number;
  badge: 'perfect' | 'good' | 'stretch';
  reasons: string[];
}

export const SEED_BUYERS: BuyerItem[] = [
  {
    _id: 'buyer_seed_1',
    name: 'Rajesh Sharma',
    phone: '+919876500001',
    localities: ['Model Town', 'Sector 11'],
    types: ['Floor', 'Flat'],
    purpose: 'Sale',
    budget: {
      minPaise: 1100000000, // ₹1.10 Cr
      maxPaise: 1350000000, // ₹1.35 Cr
    },
    urgency: 'hot',
    status: 'active',
    notes: 'Looking for 3 BHK luxury builder floor with lift and parking for joint family.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'buyer_seed_2',
    name: 'Vikram Verma',
    phone: '+919876500002',
    localities: ['Ansals Sushant City', 'Sector 18'],
    types: ['Plot'],
    purpose: 'Sale',
    budget: {
      minPaise: 750000000, // ₹75 Lakhs
      maxPaise: 900000000, // ₹90 Lakhs
    },
    urgency: 'warm',
    status: 'active',
    notes: 'Wants 200-250 Gaj residential plot with wide road. Decision within 3 weeks.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'buyer_seed_3',
    name: 'Anjali Gupta',
    phone: '+919876500003',
    localities: ['Sector 18', 'Model Town'],
    types: ['Kothi', 'Floor'],
    purpose: 'Sale',
    budget: {
      minPaise: 2000000000, // ₹2.00 Cr
      maxPaise: 2500000000, // ₹2.50 Cr
    },
    urgency: 'hot',
    status: 'active',
    notes: 'High-net-worth client. Needs modern bungalow or independent designer kothi.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    _id: 'buyer_seed_4',
    name: 'Sunil Jaglan',
    phone: '+919876500004',
    localities: ['GT Road', 'Chandni Bagh'],
    types: ['Shop'],
    purpose: 'Sale',
    budget: {
      minPaise: 800000000, // ₹80 Lakhs
      maxPaise: 1100000000, // ₹1.10 Cr
    },
    urgency: 'cold',
    status: 'active',
    notes: 'Investor looking for rental yield commercial shop near main market.',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

// Persistent LocalStorage key for offline read fallback
const STORAGE_KEY_BUYERS = 'leadnivash_buyers_v1';

function loadLocalBuyers(): BuyerItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUYERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((b: BuyerItem) => !b._id?.startsWith('buyer_seed_'));
      }
    }
  } catch (err) {
    console.warn('Could not read cached buyers:', err);
  }
  return [];
}

function persistLocalBuyers(items: BuyerItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_BUYERS, JSON.stringify(items));
  } catch (err) {
    console.warn('Could not persist buyers to localStorage:', err);
  }
}

// In-memory cache synced with backend
let localBuyersStore: BuyerItem[] = loadLocalBuyers();

export function clearLocalBuyersCache(): void {
  localBuyersStore = [];
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_BUYERS);
      localStorage.removeItem('leadnivash_deleted_buyer_ids');
    } catch {
      // Ignore
    }
  }
}

function normalizeBuyerItem(b: BuyerItem): BuyerItem {
  return {
    ...b,
    phone: b.phone || b.phoneE164 || '',
  };
}

export async function fetchBuyers(params?: {
  urgency?: string;
  status?: string;
  search?: string;
}): Promise<BuyerItem[]> {
  try {
    const res = await apiClient.get<any, any>('/buyers', {
      params: {
        ...params,
        limit: 100, // Fetch full active buyers list
      },
    });

    if (Array.isArray(res)) {
      // Backend MongoDB is the single source of truth:
      // Filter out legacy test seeds and immediately synchronize local memory and cache
      const cleanList = res
        .filter((b: BuyerItem) => !b._id?.startsWith('buyer_seed_'))
        .map(normalizeBuyerItem);
      localBuyersStore = cleanList;
      persistLocalBuyers(cleanList);
      return cleanList;
    }
    return localBuyersStore;
  } catch (err) {
    console.warn('Backend buyers API error, using offline store:', err);
    let items = [...localBuyersStore];
    if (params?.urgency && params.urgency !== 'all') {
      items = items.filter((b) => b.urgency === params.urgency);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (b) =>
          b.name?.toLowerCase().includes(q) ||
          b.phone?.includes(q) ||
          b.localities?.some((loc) =>
            typeof loc === 'string'
              ? loc.toLowerCase().includes(q)
              : loc.display?.toLowerCase().includes(q)
          )
      );
    }
    return items;
  }
}

export async function fetchBuyerById(id: string): Promise<BuyerItem> {
  try {
    const res = await apiClient.get<any, any>(`/buyers/${id}`);
    if (res && res._id) {
      const normalized = normalizeBuyerItem(res);
      localBuyersStore = [normalized, ...localBuyersStore.filter((b) => b._id !== normalized._id)];
      persistLocalBuyers(localBuyersStore);
      return normalized;
    }
  } catch (err) {
    localBuyersStore = localBuyersStore.filter((b) => b._id !== id);
    persistLocalBuyers(localBuyersStore);
    throw err;
  }
  localBuyersStore = localBuyersStore.filter((b) => b._id !== id);
  persistLocalBuyers(localBuyersStore);
  throw new Error('Buyer requirement not found or has been deleted');
}

export async function createBuyer(data: CreateBuyerDto): Promise<BuyerItem> {
  const res = normalizeBuyerItem(await apiClient.post<any, any>('/buyers', data));
  localBuyersStore = [res, ...localBuyersStore.filter((b) => b._id !== res._id)];
  persistLocalBuyers(localBuyersStore);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('leadnivash_data_changed'));
  }
  return res;
}

export async function updateBuyer(id: string, data: Partial<CreateBuyerDto>): Promise<BuyerItem> {
  const res = normalizeBuyerItem(await apiClient.patch<any, any>(`/buyers/${id}`, data));
  localBuyersStore = localBuyersStore.map((b) => (b._id === id ? { ...b, ...res, ...data } : b));
  persistLocalBuyers(localBuyersStore);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('leadnivash_data_changed'));
  }
  return res;
}

export async function deleteBuyer(id: string): Promise<boolean> {
  // 1. Inform the backend (single source of truth)
  await apiClient.delete(`/buyers/${id}`);

  // 2. Remove from active store & localStorage
  localBuyersStore = localBuyersStore.filter((b) => b._id !== id);
  persistLocalBuyers(localBuyersStore);

  // 3. Notify all listeners in the window
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('leadnivash_data_changed'));
  }

  return true;
}

/**
 * Bi-directional Match Matrix Engine
 * Matches buyer parameters against active inventory
 */
export async function fetchBuyerMatches(buyerId: string): Promise<BuyerMatchResult[]> {
  const buyer = await fetchBuyerById(buyerId);
  const properties = await fetchProperties();

  const matches: BuyerMatchResult[] = [];

  for (const prop of properties) {
    if (prop.status !== 'available') continue;

    let score = 50; // base potential
    const reasons: string[] = [];

    // 1. Locality Match (+25)
    const buyerLocs = buyer.localities.map((l) =>
      typeof l === 'string' ? l.toLowerCase() : l.display.toLowerCase()
    );
    const propLoc = prop.locality.toLowerCase();
    const isLocMatch = buyerLocs.some((bl) => propLoc.includes(bl) || bl.includes(propLoc));

    if (isLocMatch || buyer.anyLocality) {
      score += 25;
      reasons.push(`Target Locality Match: ${prop.locality}`);
    }

    // 2. Property Type Match (+15)
    const isTypeMatch = buyer.types.some(
      (t) => t.toLowerCase() === prop.type.toLowerCase()
    );
    if (isTypeMatch) {
      score += 15;
      reasons.push(`Exact Property Type: ${prop.type}`);
    }

    // 3. Budget Fit (+10 to +15)
    const price = prop.priceDemandPaise;
    const maxBudget = buyer.budget.maxPaise;
    const minBudget = buyer.budget.minPaise || 0;

    if (price <= maxBudget && price >= minBudget) {
      score += 15;
      reasons.push('Comfortably Within Stated Client Budget');
    } else if (price <= maxBudget * 1.1) {
      score += 8;
      reasons.push('Slight 10% Stretch Beyond Budget (Negotiable)');
    } else {
      score -= 15;
    }

    if (score >= 60) {
      const badge: BuyerMatchResult['badge'] =
        score >= 90 ? 'perfect' : score >= 75 ? 'good' : 'stretch';

      matches.push({
        property: prop,
        score: Math.min(score, 98),
        badge,
        reasons,
      });
    }
  }

  // Return sorted by highest match score
  return matches.sort((a, b) => b.score - a.score);
}


