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

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'broker' | 'agency_admin' | 'admin';
  agency?: UserAgency;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    const initAuth = async () => {
      try {
        // Silent warm-up probe & refresh attempt
        const res = await refreshClient.post('/auth/refresh');
        const token = res.data?.data?.accessToken;
        if (token) {
          tokenStore.set(token);
          const userData = await fetchCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            tokenStore.clear();
          }
        }
      } catch {
        tokenStore.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [fetchCurrentUser]);

  const login = async (email: string, pass: string) => {
    clearLocalPropertiesCache();
    clearLocalBuyersCache();
    const res = await apiClient.post('/auth/login', { email, password: pass });
    const { accessToken, user: authUser } = res as any;
    tokenStore.set(accessToken);
    setUser(authUser);
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
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const data = await fetchCurrentUser();
    if (data) setUser(data);
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
