import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../lib/api/client';
import { refreshClient } from '../../lib/api/refreshClient';
import { tokenStore } from '../../lib/api/tokenStore';
import { useServerWaking } from '../../lib/hooks/useServerWaking';
import { clearLocalPropertiesCache } from '../../lib/api/properties';
import { clearLocalBuyersCache } from '../../lib/api/buyers';

export interface UserPlan {
  tier: 'trial' | 'free' | 'pro' | 'agency';
  trialEndsAt?: string;
  expiresAt?: string;
  isExpired: boolean;
  limits: {
    maxProperties: number;
    maxBuyers: number;
    maxDeals: number;
    maxParsePerMonth: number;
  };
}

export interface UserAgency {
  name?: string;
  city?: string;
  logoUrl?: string;
  reraNo?: string;
}

export interface UserPreferences {
  language?: 'en' | 'hi' | 'pa' | 'ta' | 'mr';
  budgetTolerancePct?: number;
  marlaToGaj?: number;
  defaultCity?: string;
  defaultState?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'broker' | 'agency_admin' | 'admin';
  agency?: UserAgency;
  preferences?: UserPreferences;
  plan: UserPlan;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isServerWaking: boolean;
  login: (email: string, pass: string) => Promise<void>;
  googleLogin: (payload: {
    email: string;
    name: string;
    googleId?: string;
    phone?: string;
    agencyName?: string;
    city?: string;
  }) => Promise<{ requiresPhone?: boolean; user?: any }>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
    agencyName?: string;
    city?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USER_KEY = 'leadnivesh_user';
const STORAGE_SESSION_KEY = 'leadnivesh_has_session';

const getInitialUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const hasSession =
      localStorage.getItem(STORAGE_SESSION_KEY) === 'true' ||
      document.cookie.includes('leadnivesh_logged_in=true');
    if (hasSession) {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved) return JSON.parse(saved);
    }
  } catch {
    // Ignore JSON parse errors
  }
  return null;
};

const hasSavedSessionMarker = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    localStorage.getItem(STORAGE_SESSION_KEY) === 'true' ||
    document.cookie.includes('leadnivesh_logged_in=true')
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState<boolean>(hasSavedSessionMarker);

  // Cold start banner hook: triggers if loading exceeds 4s
  const isServerWaking = useServerWaking(isLoading, 4000);

  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const data = await apiClient.get('/users/me');
      return data as unknown as User;
    } catch {
      return null;
    }
  }, []);

  // Silent refresh bootstrap on initial app mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async (retryCount = 0) => {
      // If there's no cookie and no stored session marker, mark loading complete immediately
      if (!hasSavedSessionMarker() && !user) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        // Silent warm-up probe & refresh attempt with cookie
        const res = await refreshClient.post('/auth/refresh');
        if (!isMounted) return;

        const { accessToken, user: refreshedUser } = res.data?.data || {};
        if (accessToken) {
          tokenStore.set(accessToken);
          const finalUser = refreshedUser || (await fetchCurrentUser());
          if (finalUser) {
            setUser(finalUser);
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(finalUser));
            localStorage.setItem(STORAGE_SESSION_KEY, 'true');
          } else {
            tokenStore.clear();
          }
        } else {
          tokenStore.clear();
          localStorage.removeItem(STORAGE_USER_KEY);
          localStorage.removeItem(STORAGE_SESSION_KEY);
          setUser(null);
        }
      } catch (err: any) {
        if (!isMounted) return;
        const status = err?.response?.status;
        
        // If server explicitly returned 401 or 403, the session is definitely expired/revoked
        if (status === 401 || status === 403) {
          tokenStore.clear();
          localStorage.removeItem(STORAGE_USER_KEY);
          localStorage.removeItem(STORAGE_SESSION_KEY);
          setUser(null);
        } else if (retryCount < 2 && (!status || status >= 500 || err.code === 'ECONNABORTED')) {
          // Server cold-starting or temporary glitch: retry after 2s without dropping user
          setTimeout(() => {
            if (isMounted) initAuth(retryCount + 1);
          }, 2000);
          return;
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [fetchCurrentUser]);

  const login = async (email: string, pass: string) => {
    clearLocalPropertiesCache();
    clearLocalBuyersCache();
    const res = await apiClient.post('/auth/login', { email, password: pass });
    const { accessToken, user: authUser } = res as any;
    tokenStore.set(accessToken);
    setUser(authUser);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authUser));
    localStorage.setItem(STORAGE_SESSION_KEY, 'true');
  };

  const googleLogin = async (payload: {
    email: string;
    name: string;
    googleId?: string;
    phone?: string;
    agencyName?: string;
    city?: string;
  }) => {
    clearLocalPropertiesCache();
    clearLocalBuyersCache();
    const res = (await apiClient.post('/auth/google', payload)) as any;
    if (res?.requiresPhone) {
      return { requiresPhone: true, user: res.user };
    }
    const { accessToken, user: authUser } = res;
    if (accessToken) {
      tokenStore.set(accessToken);
      setUser(authUser);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authUser));
      localStorage.setItem(STORAGE_SESSION_KEY, 'true');
    }
    return { requiresPhone: false, user: authUser };
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
    agencyName?: string;
    city?: string;
  }) => {
    clearLocalPropertiesCache();
    clearLocalBuyersCache();
    const requestBody = {
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      phone: payload.phone.trim(),
      agency: {
        name: payload.agencyName?.trim() || undefined,
        city: payload.city?.trim() || undefined,
      },
      consent: {
        termsAccepted: true,
        privacyVersion: '1.0',
      },
    };

    const res = await apiClient.post('/auth/register', requestBody);
    const { accessToken, user: registeredUser } = res as any;
    tokenStore.set(accessToken);
    setUser(registeredUser);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(registeredUser));
    localStorage.setItem(STORAGE_SESSION_KEY, 'true');
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      clearLocalPropertiesCache();
      clearLocalBuyersCache();
      tokenStore.clear();
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_SESSION_KEY);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const data = await fetchCurrentUser();
    if (data) {
      setUser(data);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data));
      localStorage.setItem(STORAGE_SESSION_KEY, 'true');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isServerWaking,
        login,
        googleLogin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
