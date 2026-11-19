import { apiClient } from './client';

export interface DealItem {
  _id: string;
  buyerId: string;
  propertyId?: string;
  propertyTitleSnapshot: string;
  valuePaise: number;
  commission: {
    mode: 'percent' | 'flat';
    bps?: number;
    flatPaise?: number;
    expectedPaise: number;
  };
  stage: 'interested' | 'shown' | 'negotiating' | 'finalized' | 'paid' | 'lost';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealDto {
  buyerId: string;
  propertyId?: string;
  propertyTitleSnapshot: string;
  valuePaise: number;
  commission: {
    mode: 'percent' | 'flat';
    bps?: number;
    flatPaise?: number;
  };
  stage?: 'interested' | 'shown' | 'negotiating' | 'finalized' | 'paid' | 'lost';
  notes?: string;
}

let localDealsStore: DealItem[] = [];

export async function createDeal(dto: CreateDealDto): Promise<DealItem> {
  const localItem: DealItem = {
    _id: 'deal_' + Date.now(),
    buyerId: dto.buyerId,
    propertyId: dto.propertyId,
    propertyTitleSnapshot: dto.propertyTitleSnapshot,
    valuePaise: dto.valuePaise,
    commission: {
      mode: dto.commission.mode,
      bps: dto.commission.bps || 100,
      flatPaise: dto.commission.flatPaise,
      expectedPaise: dto.commission.mode === 'percent'
        ? Math.round((dto.valuePaise * (dto.commission.bps || 100)) / 10000)
        : (dto.commission.flatPaise || 0),
    },
    stage: dto.stage || 'interested',
    notes: dto.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const res = await apiClient.post<any, any>('/api/v1/deals', dto);
    localDealsStore.unshift(res);
    return res;
  } catch (err) {
    console.warn('Backend create deal error, using optimistic local store:', err);
    localDealsStore.unshift(localItem);
    return localItem;
  }
}

export async function fetchDeals(): Promise<DealItem[]> {
  try {
    const res = await apiClient.get<any, any>('/api/v1/deals');
    if (Array.isArray(res)) {
      localDealsStore = res;
      return res;
    }
    return localDealsStore;
  } catch {
    return localDealsStore;
  }
}
