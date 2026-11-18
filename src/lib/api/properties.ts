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
    owner: {
      name: 'Ashok Bansal',
      phone: '+919896077889',
      notes: 'Deal closed last month.',
    },
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
];

// In-memory cache for optimistic updates in the session
let localPropertiesStore: PropertyItem[] = [...SEED_PROPERTIES];

export async function fetchProperties(params?: {
  status?: string;
  locality?: string;
  search?: string;
}): Promise<PropertyItem[]> {
  try {
    const res = await apiClient.get<any, any>('/api/v1/properties', { params });
    if (Array.isArray(res) && res.length > 0) {
      localPropertiesStore = res;
      return res;
    }
    return localPropertiesStore;
  } catch (err) {
    console.warn('Backend properties API error, using local properties store:', err);
    let items = [...localPropertiesStore];
    if (params?.status && params.status !== 'all') {
      items = items.filter((p) => p.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.locality.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
      );
    }
    return items;
  }
}

export async function fetchPropertyById(id: string): Promise<PropertyItem> {
  try {
    const res = await apiClient.get<any, any>(`/api/v1/properties/${id}`);
    return res;
  } catch {
    const found = localPropertiesStore.find((p) => p._id === id);
    if (found) return found;
    return localPropertiesStore[0];
  }
}

export async function createProperty(data: CreatePropertyDto): Promise<PropertyItem> {
  const newItem: PropertyItem = {
    _id: 'prop_' + Date.now(),
    title: data.title || `${data.size.value} ${data.size.unit} ${data.type} in ${data.locality}`,
    type: data.type,
    category: data.category || 'Residential',
    purpose: data.purpose || 'Sale',
    locality: data.locality,
    city: data.city || 'Panipat',
    landmark: data.landmark,
    size: data.size,
    priceDemandPaise: data.priceDemandPaise,
    facing: data.facing,
    tags: data.tags || [],
    description: data.description,
    status: data.status || 'available',
    owner: data.owner,
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await apiClient.post<any, any>('/api/v1/properties', data);
    localPropertiesStore = [res, ...localPropertiesStore];
    return res;
  } catch (err) {
    console.warn('Backend create property error, saved optimistically to session store:', err);
    localPropertiesStore = [newItem, ...localPropertiesStore];
    return newItem;
  }
}

export async function updatePropertyStatus(
  id: string,
  status: 'available' | 'hold' | 'sold' | 'rented'
): Promise<PropertyItem> {
  try {
    const res = await apiClient.patch<any, any>(`/api/v1/properties/${id}/status`, { status });
    localPropertiesStore = localPropertiesStore.map((p) => (p._id === id ? { ...p, status } : p));
    return res;
  } catch {
    localPropertiesStore = localPropertiesStore.map((p) => (p._id === id ? { ...p, status } : p));
    const updated = localPropertiesStore.find((p) => p._id === id)!;
    return updated;
  }
}

export async function deleteProperty(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/api/v1/properties/${id}`);
    localPropertiesStore = localPropertiesStore.filter((p) => p._id !== id);
    return true;
  } catch {
    localPropertiesStore = localPropertiesStore.filter((p) => p._id !== id);
    return true;
  }
}
