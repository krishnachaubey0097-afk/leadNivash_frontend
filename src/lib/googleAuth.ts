import { apiClient } from './api/client';

export interface AuthProvidersConfig {
  googleEnabled: boolean;
  googleClientId: string | null;
  emailOtpEnabled: boolean;
  smtpConfigured: boolean;
  passwordEnabled: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            prompt?: string;
            callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
            error_callback?: (err: { type?: string; message?: string }) => void;
          }) => { requestAccessToken: (overrideConfig?: { prompt?: string }) => void };
        };
      };
    };
  }
}

let gsiLoadPromise: Promise<void> | null = null;

/**
 * Dynamically loads Google Identity Services SDK once.
 */
export function loadGoogleGsiScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Sign-In requires a browser environment.'));
  }
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  if (gsiLoadPromise) return gsiLoadPromise;

  gsiLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-gsi="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In script.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleGsi = 'true';
    script.onload = () => resolve();
    script.onerror = () => {
      gsiLoadPromise = null;
      reject(new Error('Could not load Google Sign-In SDK. Check your internet connection or ad blocker.'));
    };
    document.head.appendChild(script);
  });

  return gsiLoadPromise;
}

/**
 * Fetches live auth provider capabilities from backend, merged with build-time VITE_GOOGLE_CLIENT_ID.
 */
export async function fetchAuthProviders(): Promise<AuthProvidersConfig> {
  const buildClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim() || null;
  try {
    const remote = (await apiClient.get('/auth/providers')) as unknown as Partial<AuthProvidersConfig>;
    const googleClientId = buildClientId || remote?.googleClientId || null;
    return {
      googleEnabled: Boolean(googleClientId),
      googleClientId,
      emailOtpEnabled: remote?.emailOtpEnabled ?? true,
      smtpConfigured: Boolean(remote?.smtpConfigured),
      passwordEnabled: true,
    };
  } catch {
    return {
      googleEnabled: Boolean(buildClientId),
      googleClientId: buildClientId,
      emailOtpEnabled: true,
      smtpConfigured: false,
      passwordEnabled: true,
    };
  }
}

/**
 * Opens Google's official OAuth account picker popup and resolves with an access token.
 */
export async function requestGoogleAccessToken(clientId: string): Promise<string> {
  await loadGoogleGsiScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) {
    throw new Error('Google Sign-In SDK is unavailable in this browser.');
  }

  return new Promise<string>((resolve, reject) => {
    let settled = false;
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      prompt: 'select_account',
      callback: (resp) => {
        if (settled) return;
        settled = true;
        if (resp.error || !resp.access_token) {
          reject(new Error(resp.error_description || resp.error || 'Google authorization did not return a token.'));
          return;
        }
        resolve(resp.access_token);
      },
      error_callback: (err) => {
        if (settled) return;
        settled = true;
        if (err?.type === 'popup_closed') {
          reject(new Error('Google sign-in popup was closed before completing authorization.'));
          return;
        }
        if (err?.type === 'popup_failed_to_open') {
          reject(new Error('Google sign-in popup was blocked by your browser. Please allow popups and try again.'));
          return;
        }
        reject(new Error(err?.message || 'Google authorization could not start.'));
      },
    });

    client.requestAccessToken({ prompt: 'select_account' });
  });
}
