import { apiClient } from './api/client';

export type CashfreePlanCode = 'monthly_399' | 'yearly_trial_3299' | 'yearly_3999';
export type CashfreeBillingMode = 'autopay' | 'one_time';

export interface CashfreeConfigResponse {
  cashfreeEnabled: boolean;
  mode: 'sandbox' | 'production';
  subscriptionsEnabled: boolean;
  plans: Array<{
    planCode: CashfreePlanCode;
    tier: 'lite' | 'pro';
    name: string;
    amountINR: number;
    intervalType: 'MONTH' | 'YEAR';
  }>;
}

export interface CashfreeCheckoutResponse {
  flow: 'subscription' | 'order';
  mode: CashfreeBillingMode;
  checkoutMode: 'sandbox' | 'production';
  subscriptionId?: string;
  orderId?: string;
  sessionId: string;
  planCode: CashfreePlanCode;
  amountINR: number;
}

export interface PaymentRecordDto {
  _id: string;
  planCode: CashfreePlanCode;
  planTier: 'lite' | 'pro';
  mode: CashfreeBillingMode;
  amountINR: number;
  currency: string;
  cashfreeId: string;
  status: string;
  autopayEnabled: boolean;
  periodStart?: string;
  periodEnd?: string;
  nextBillingAt?: string;
  createdAt: string;
}

declare global {
  interface Window {
    Cashfree?: (config: { mode: 'sandbox' | 'production' }) => {
      checkout: (opts: { paymentSessionId: string; redirectTarget?: '_self' | '_blank' | '_modal' }) => Promise<any>;
      subscriptionsCheckout?: (opts: { subsSessionId: string; redirectTarget?: '_self' | '_blank' }) => Promise<any>;
    };
  }
}

let cfSdkPromise: Promise<void> | null = null;

export function loadCashfreeSdk(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Cashfree checkout requires a browser environment.'));
  }
  if (typeof window.Cashfree === 'function') {
    return Promise.resolve();
  }
  if (cfSdkPromise) return cfSdkPromise;

  cfSdkPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-cashfree-sdk="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Cashfree SDK.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.defer = true;
    script.dataset.cashfreeSdk = 'true';
    script.onload = () => resolve();
    script.onerror = () => {
      cfSdkPromise = null;
      reject(new Error('Could not load Cashfree checkout script. Please disable ad blockers or retry.'));
    };
    document.head.appendChild(script);
  });

  return cfSdkPromise;
}

export async function fetchCashfreeConfig(): Promise<CashfreeConfigResponse> {
  return (await apiClient.get('/payments/config')) as unknown as CashfreeConfigResponse;
}

export async function launchCashfreeCheckout(
  planCode: CashfreePlanCode,
  mode: CashfreeBillingMode = 'autopay'
): Promise<CashfreeCheckoutResponse> {
  const checkout = (await apiClient.post('/payments/cashfree/checkout', {
    planCode,
    mode,
    returnOrigin: window.location.origin,
  })) as unknown as CashfreeCheckoutResponse;

  await loadCashfreeSdk();
  if (typeof window.Cashfree !== 'function') {
    throw new Error('Cashfree SDK unavailable in this browser.');
  }

  const cashfree = window.Cashfree({ mode: checkout.checkoutMode });

  if (checkout.flow === 'subscription' && typeof cashfree.subscriptionsCheckout === 'function') {
    await cashfree.subscriptionsCheckout({
      subsSessionId: checkout.sessionId,
      redirectTarget: '_self',
    });
  } else {
    await cashfree.checkout({
      paymentSessionId: checkout.sessionId,
      redirectTarget: '_self',
    });
  }

  return checkout;
}

export async function verifyCashfreePayment(params: {
  subscriptionId?: string;
  orderId?: string;
}): Promise<{
  activated: boolean;
  status: string;
  planTier: 'lite' | 'pro';
  autopayEnabled: boolean;
  expiresAt?: string;
}> {
  return (await apiClient.post('/payments/cashfree/verify', params)) as unknown as any;
}

export async function cancelCashfreeAutoPay(subscriptionId: string): Promise<{
  cancelled: boolean;
  subscriptionId: string;
  status: string;
}> {
  return (await apiClient.post('/payments/cashfree/cancel', { subscriptionId })) as unknown as any;
}

export async function fetchPaymentHistory(): Promise<PaymentRecordDto[]> {
  return (await apiClient.get('/payments/history')) as unknown as PaymentRecordDto[];
}
