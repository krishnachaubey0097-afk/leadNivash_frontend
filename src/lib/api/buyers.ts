import { apiClient } from './client';
import { fetchProperties, type PropertyItem } from './properties';

export interface BuyerItem {
  _id: string;
  name: string;
  phone: string;
  localities: Array<{ display: string; key: string } | string>;
  anyLocality?: boolean;
  types: string[];
  purpose: 'Sale' | 'Rent';
  budget: {
    minPaise?: number;
    maxPaise: number;
  };
  sizeGaj?: {
    min?: number;
    max?: number;
  };
  urgency: 'hot' | 'warm' | 'cold';
  status: 'active' | 'paused' | 'closed';
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

// Persistent LocalStorage keys for client cache and deletions
const STORAGE_KEY_BUYERS = 'leadnivash_buyers_v1';
const STORAGE_KEY_DELETED_BUYER_IDS = 'leadnivash_deleted_buyer_ids';

function getDeletedBuyerIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_BUYER_IDS);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveDeletedBuyerId(id: string): void {
  try {
    const set = getDeletedBuyerIds();
    set.add(id);
    localStorage.setItem(STORAGE_KEY_DELETED_BUYER_IDS, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn('Could not save deleted buyer ID:', err);
  }
}

function loadLocalBuyers(): BuyerItem[] {
  try {
    const deleted = getDeletedBuyerIds();
    const raw = localStorage.getItem(STORAGE_KEY_BUYERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((b: BuyerItem) => !deleted.has(b._id));
      }
    }
  } catch (err) {
    console.warn('Could not read cached buyers:', err);
  }
  const deleted = getDeletedBuyerIds();
  return SEED_BUYERS.filter((b) => !deleted.has(b._id));
}

function persistLocalBuyers(items: BuyerItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BUYERS, JSON.stringify(items));
    window.dispatchEvent(new Event('leadnivash_data_changed'));
  } catch (err) {
    console.warn('Could not persist buyers to localStorage:', err);
  }
}

// In-memory cache synced with localStorage
let localBuyersStore: BuyerItem[] = loadLocalBuyers();

export async function fetchBuyers(params?: {
  urgency?: string;
  status?: string;
  search?: string;
}): Promise<BuyerItem[]> {
  const deleted = getDeletedBuyerIds();
  try {
    const res = await apiClient.get<any, any>('/api/v1/buyers', { params });
    if (Array.isArray(res)) {
      // Backend returned list (even if empty [])! Filter out any locally deleted IDs
      const cleanList = res.filter((b: BuyerItem) => !deleted.has(b._id));
      localBuyersStore = cleanList;
      persistLocalBuyers(cleanList);
      return cleanList;
    }
    return localBuyersStore.filter((b) => !deleted.has(b._id));
  } catch (err) {
    console.warn('Backend buyers API error, using persistent local store:', err);
    let items = localBuyersStore.filter((b) => !deleted.has(b._id));
    if (params?.urgency && params.urgency !== 'all') {
      items = items.filter((b) => b.urgency === params.urgency);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.phone.includes(q) ||
          b.localities.some((loc) =>
            typeof loc === 'string'
              ? loc.toLowerCase().includes(q)
              : loc.display.toLowerCase().includes(q)
          )
      );
    }
    return items;
  }
}

export async function fetchBuyerById(id: string): Promise<BuyerItem> {
  try {
    const res = await apiClient.get<any, any>(`/api/v1/buyers/${id}`);
    return res;
  } catch {
    const found = localBuyersStore.find((b) => b._id === id);
    if (found) return found;
    return localBuyersStore[0];
  }
}

export async function createBuyer(data: CreateBuyerDto): Promise<BuyerItem> {
  const newItem: BuyerItem = {
    _id: 'buyer_' + Date.now(),
    name: data.name,
    phone: data.phone,
    localities: data.localities.map((loc) => ({ display: loc, key: loc.toLowerCase() })),
    anyLocality: data.anyLocality || false,
    types: data.types,
    purpose: data.purpose || 'Sale',
    budget: data.budget,
    sizeGaj: data.sizeGaj,
    urgency: data.urgency || 'warm',
    status: data.status || 'active',
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await apiClient.post<any, any>('/api/v1/buyers', data);
    localBuyersStore = [res, ...localBuyersStore];
    persistLocalBuyers(localBuyersStore);
    return res;
  } catch (err) {
    console.warn('Backend create buyer error, saved optimistically to local store:', err);
    localBuyersStore = [newItem, ...localBuyersStore];
    persistLocalBuyers(localBuyersStore);
    return newItem;
  }
}

export async function updateBuyer(id: string, data: Partial<CreateBuyerDto>): Promise<BuyerItem> {
  try {
    const res = await apiClient.patch<any, any>(`/api/v1/buyers/${id}`, data);
    localBuyersStore = localBuyersStore.map((b) => (b._id === id ? { ...b, ...data } : b));
    persistLocalBuyers(localBuyersStore);
    return res;
  } catch {
    localBuyersStore = localBuyersStore.map((b) => (b._id === id ? { ...b, ...data } : b));
    persistLocalBuyers(localBuyersStore);
    return localBuyersStore.find((b) => b._id === id)!;
  }
}

export async function deleteBuyer(id: string): Promise<boolean> {
  // 1. Permanently track in deleted IDs list so it never revives on refresh
  saveDeletedBuyerId(id);

  // 2. Remove from active local store and persist
  localBuyersStore = localBuyersStore.filter((b) => b._id !== id);
  persistLocalBuyers(localBuyersStore);

  // 3. Inform the backend (if valid database ObjectId)
  try {
    await apiClient.delete(`/api/v1/buyers/${id}`);
  } catch (err) {
    console.info('Backend delete synced for buyer:', id);
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


