import { apiClient } from './client';

export interface PropertyItem {
  _id: string;
  title: string;
  type: 'Plot' | 'Kothi' | 'Floor' | 'Flat' | 'Shop' | 'Other';
  category: 'Residential' | 'Commercial';
  purpose: 'Sale' | 'Rent';
  locality: string;
  city: string;
  landmark?: string;
  size: {
    value: number;
    unit: 'gaj' | 'sqft' | 'marla' | 'kanal' | 'acre' | 'bigha';
  };
  priceDemandPaise: number;
  facing?: string;
  tags?: string[];
  description?: string;
  status: 'available' | 'hold' | 'sold' | 'rented';
  photos?: Array<{
    url: string;
    publicId: string;
    width?: number;
    height?: number;
  }>;
  videoUrl?: string;
  video?: {
    url: string;
    publicId?: string;
    duration?: number;
    thumbnailUrl?: string;
  };
  owner?: {
    name?: string;
    phone?: string;
    notes?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePropertyDto {
  title?: string;
  type: 'Plot' | 'Kothi' | 'Floor' | 'Flat' | 'Shop' | 'Other';
  category?: 'Residential' | 'Commercial';
  purpose?: 'Sale' | 'Rent';
  locality: string;
  city?: string;
  landmark?: string;
  size: {
    value: number;
    unit: 'gaj' | 'sqft' | 'marla' | 'kanal' | 'acre' | 'bigha';
  };
  priceDemandPaise: number;
  facing?: string;
  tags?: string[];
  description?: string;
  status?: 'available' | 'hold' | 'sold' | 'rented';
  photos?: Array<{
    url: string;
    publicId: string;
    width?: number;
    height?: number;
  }>;
  videoUrl?: string;
  video?: {
    url: string;
    publicId?: string;
    duration?: number;
    thumbnailUrl?: string;
  };
  owner?: {
    name?: string;
    phone?: string;
    notes?: string;
  };
}

// Initial seed listings for instant offline demo or fallback
export const SEED_PROPERTIES: PropertyItem[] = [
  {
    _id: 'prop_seed_1',
    title: '3 BHK Luxury Builder Floor',
    type: 'Floor',
    category: 'Residential',
    purpose: 'Sale',
    locality: 'Model Town',
    city: 'Panipat',
    landmark: 'Near Shivaji Stadium',
    size: { value: 250, unit: 'gaj' },
    priceDemandPaise: 1250000000, // ₹1.25 Cr
    facing: 'North-East',
    tags: ['Corner', 'Lift', 'Stilt Parking'],
    description: 'Ultra-luxury 2nd floor with private stilt car parking, modular Italian kitchen, and branded fittings. Ready to move.',
    status: 'available',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
        publicId: 'seed_photo_1_1',
      },
      {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        publicId: 'seed_photo_1_2',
      },
      {
        url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
        publicId: 'seed_photo_1_3',
      },
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-interior-of-a-luxury-apartment-42750-large.mp4',
    owner: {
      name: 'Rajinder Gupta',
      phone: '+919812044321',
      notes: 'Direct owner, clear registry title.',
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'prop_seed_2',
    title: '250 Gaj Residential Corner Plot',
    type: 'Plot',
    category: 'Residential',
    purpose: 'Sale',
    locality: 'Ansals Sushant City',
    city: 'Panipat',
    landmark: 'Sector 18 Block C',
    size: { value: 250, unit: 'gaj' },
    priceDemandPaise: 850000000, // ₹85 Lakhs
    facing: 'North',
    tags: ['40ft Road', 'Park Facing', 'Gated Society'],
    description: 'Prime residential plot in peaceful sector. 40ft wide road, north facing with 24x7 security.',
    status: 'available',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
        publicId: 'seed_photo_2_1',
      },
      {
        url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
        publicId: 'seed_photo_2_2',
      },
    ],
    owner: {
      name: 'Suresh Mittal',
      phone: '+919876543210',
      notes: 'Demand slightly negotiable for urgent token.',
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'prop_seed_3',
    title: '4 BHK Independent Designer Kothi',
    type: 'Kothi',
    category: 'Residential',
    purpose: 'Sale',
    locality: 'Sector 18',
    city: 'Panipat',
    landmark: 'HUDA Main Sector',
    size: { value: 350, unit: 'gaj' },
    priceDemandPaise: 2400000000, // ₹2.40 Cr
    facing: 'East',
    tags: ['Furnished', 'Garden', 'Double Height'],
    description: 'Architect-built modern bungalow with landscaped lawn, home theatre room, and servant quarters.',
    status: 'hold',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
        publicId: 'seed_photo_3_1',
      },
      {
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        publicId: 'seed_photo_3_2',
      },
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tour-of-a-contemporary-living-room-41712-large.mp4',
    owner: {
      name: 'Col. Jasbir Singh',
      phone: '+919416012345',
      notes: 'Under verbal token hold till Friday.',
    },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    _id: 'prop_seed_4',
    title: 'Prime Main Market Commercial Shop',
    type: 'Shop',
    category: 'Commercial',
    purpose: 'Sale',
    locality: 'GT Road',
    city: 'Panipat',
    landmark: 'Opposite Skylark Complex',
    size: { value: 45, unit: 'gaj' },
    priceDemandPaise: 950000000, // ₹95 Lakhs
    facing: 'Main Road',
    tags: ['High Footfall', 'Rental Income'],
    description: 'Ground floor retail shop with high rental yield. Excellent visibility from GT Road highway.',
    status: 'sold',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        publicId: 'seed_photo_4_1',
      },
    ],
    owner: {
      name: 'Ashok Bansal',
      phone: '+919896077889',
      notes: 'Deal closed last month.',
    },
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
];

// Persistent LocalStorage key for offline read fallback
const STORAGE_KEY_PROPERTIES = 'leadnivash_properties_v1';

function loadLocalProperties(): PropertyItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROPERTIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((p: PropertyItem) => !p._id?.startsWith('prop_seed_'));
      }
    }
  } catch (err) {
    console.warn('Could not read cached properties:', err);
  }
  return [];
}

function persistLocalProperties(items: PropertyItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PROPERTIES, JSON.stringify(items));
  } catch (err) {
    console.warn('Could not persist properties to localStorage:', err);
  }
}

// In-memory cache synced with backend
let localPropertiesStore: PropertyItem[] = loadLocalProperties();

export function clearLocalPropertiesCache(): void {
  localPropertiesStore = [];
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_PROPERTIES);
      localStorage.removeItem('leadnivash_deleted_property_ids');
    } catch {
      // Ignore
    }
  }
}

export async function fetchProperties(params?: {
  status?: string;
  locality?: string;
  search?: string;
}): Promise<PropertyItem[]> {
  try {
    const res = await apiClient.get<any, any>('/properties', {
      params: {
        ...params,
        limit: 100, // Fetch full active inventory so list is always complete
      },
    });

    if (Array.isArray(res)) {
      // Backend MongoDB is the single source of truth:
      // Filter out legacy test seeds and immediately synchronize local memory and cache
      const cleanList = res.filter((p: PropertyItem) => !p._id?.startsWith('prop_seed_'));
      localPropertiesStore = cleanList;
      persistLocalProperties(cleanList);
      return cleanList;
    }
    return localPropertiesStore;
  } catch (err) {
    console.warn('Backend properties API error, using offline store:', err);
    let items = [...localPropertiesStore];
    if (params?.status && params.status !== 'all') {
      items = items.filter((p) => p.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.locality?.toLowerCase().includes(q) ||
          p.type?.toLowerCase().includes(q)
      );
    }
    return items;
  }
}

export async function fetchPropertyById(id: string): Promise<PropertyItem> {
  try {
    const res = await apiClient.get<any, any>(`/properties/${id}`);
    if (res && res._id) {
      localPropertiesStore = [res, ...localPropertiesStore.filter((p) => p._id !== res._id)];
      persistLocalProperties(localPropertiesStore);
      return res;
    }
  } catch (err) {
    // If backend 404s (e.g. deleted), purge it from local cache immediately
    localPropertiesStore = localPropertiesStore.filter((p) => p._id !== id);
    persistLocalProperties(localPropertiesStore);
    throw err;
  }
  localPropertiesStore = localPropertiesStore.filter((p) => p._id !== id);
  persistLocalProperties(localPropertiesStore);
  throw new Error('Property not found or has been deleted');
}

export async function createProperty(data: CreatePropertyDto): Promise<PropertyItem> {
  const res = await apiClient.post<any, any>('/properties', data);
  localPropertiesStore = [res, ...localPropertiesStore.filter((p) => p._id !== res._id)];
  persistLocalProperties(localPropertiesStore);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('leadnivash_data_changed'));
  }
  return res;
}

export async function updateProperty(
  id: string,
  data: Partial<CreatePropertyDto>
): Promise<PropertyItem> {
  const res = await apiClient.patch<any, any>(`/properties/${id}`, data);
  localPropertiesStore = localPropertiesStore.map((p) => (p._id === id ? { ...p, ...res } : p));
  persistLocalProperties(localPropertiesStore);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('leadnivash_data_changed'));
  }
  return res;
}

export async function updatePropertyStatus(
  id: string,
  status: 'available' | 'hold' | 'sold' | 'rented'
): Promise<PropertyItem> {
  const res = await apiClient.patch<any, any>(`/properties/${id}/status`, { status });
  localPropertiesStore = localPropertiesStore.map((p) => (p._id === id ? { ...p, status } : p));
  persistLocalProperties(localPropertiesStore);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('leadnivash_data_changed'));
  }
  return res;
}

export async function deleteProperty(id: string): Promise<boolean> {
  // 1. Immediately inform the backend (single source of truth)
  await apiClient.delete(`/properties/${id}`);

  // 2. Remove from active store & localStorage
  localPropertiesStore = localPropertiesStore.filter((p) => p._id !== id);
  persistLocalProperties(localPropertiesStore);

  // 3. Notify all listeners in the window
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('leadnivash_data_changed'));
  }

  return true;
}
