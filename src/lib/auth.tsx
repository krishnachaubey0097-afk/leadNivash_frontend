import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, getAccessToken, setAccessToken } from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'superadmin' | 'agency_admin' | 'broker' | 'staff';
  agencyId?: string;
  phone?: string;
  agencyName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    agencyName: string;
    phone: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ln_user_meta');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setTokenState] = useState<string | null>(getAccessToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const existingToken = getAccessToken();
      if (existingToken) {
        setTokenState(existingToken);
        setIsLoading(false);
        return;
      }

      // Attempt silent refresh
      try {
        const res = await apiClient.post('/auth/refresh');
        if (res.data?.success && res.data?.data?.accessToken) {
          const newToken = res.data.data.accessToken;
          setAccessToken(newToken);
          setTokenState(newToken);
          if (res.data.data.user) {
            setUser(res.data.data.user);
            localStorage.setItem('ln_user_meta', JSON.stringify(res.data.data.user));
          }
        }
      } catch {
        // Not logged in or refresh expired
        setAccessToken(null);
        setTokenState(null);
        setUser(null);
        localStorage.removeItem('ln_user_meta');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { accessToken, user: userData } = res.data.data;
        setAccessToken(accessToken);
        setTokenState(accessToken);
        setUser(userData);
        localStorage.setItem('ln_user_meta', JSON.stringify(userData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    fullName: string;
    agencyName: string;
    phone: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/register', payload);
      if (res.data?.success) {
        const { accessToken, user: userData } = res.data.data;
        setAccessToken(accessToken);
        setTokenState(accessToken);
        setUser(userData);
        localStorage.setItem('ln_user_meta', JSON.stringify(userData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      setAccessToken(null);
      setTokenState(null);
      setUser(null);
      localStorage.removeItem('ln_user_meta');
      sessionStorage.removeItem('ln_access_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
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
