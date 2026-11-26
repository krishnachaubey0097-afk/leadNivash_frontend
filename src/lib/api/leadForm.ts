import { apiClient } from './client';

export interface PublicLeadFormProfile {
  brokerId: string;
  brokerName: string;
  agencyName: string;
  city: string;
  state: string;
  phone?: string;
}

export interface SubmitLeadFormPayload {
  category: 'buyer' | 'seller';
  name: string;
  phone: string;
  email?: string;
  purpose: 'Sale' | 'Rent';
  budgetPaise: number;
  isApproxBudget: boolean;

  // Buyer fields
  types?: string[];
  localities?: string[];
  anyLocality?: boolean;
  sizeMin?: number;
  sizeMax?: number;
  sizeUnit?: 'gaj' | 'sqft' | 'marla' | 'kanal' | 'acre' | 'bigha';
  urgency?: 'hot' | 'warm' | 'cold';
  notes?: string;

  // Seller fields
  propertyCategory?: 'Residential' | 'Commercial';
  propertyType?: 'Plot' | 'Kothi' | 'Floor' | 'Flat' | 'Shop' | 'Other';
  locality?: string;
  city?: string;
  landmark?: string;
  sizeValue?: number;
  facing?: string;
  highlights?: string[];

  // Honeypot
  website?: string;
}

export interface SubmitLeadFormResponse {
  success: boolean;
  submissionId?: string;
  category: 'buyer' | 'seller';
  recordId?: string;
  summary?: string;
}

export function buildBrokerLeadFormUrl(brokerId: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/form/${brokerId}`;
  }
  return `https://lead-nivash-frontend.vercel.app/form/${brokerId}`;
}

export async function fetchPublicLeadFormProfile(brokerId: string): Promise<PublicLeadFormProfile> {
  return apiClient.get<any, PublicLeadFormProfile>(`/public/lead-form/${brokerId}`);
}

export async function submitPublicLeadForm(
  brokerId: string,
  payload: SubmitLeadFormPayload
): Promise<SubmitLeadFormResponse> {
  return apiClient.post<any, SubmitLeadFormResponse>(`/public/lead-form/${brokerId}`, payload);
}
