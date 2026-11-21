import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { env } from '../env';
import { tokenStore } from './tokenStore';
import { refreshClient } from './refreshClient';
import { ApiError } from './errors';

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let activeRequestsCount = 0;
const notifyLoading = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('leadnivesh_api_loading', { detail: { active: activeRequestsCount > 0 } })
    );
  }
};

// Request Interceptor: Normalize redundant /api/v1/ prefix and attach in-memory Bearer Token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  activeRequestsCount++;
  notifyLoading();
  if (config.url && config.url.startsWith('/api/v1/')) {
    config.url = config.url.substring(7); // Normalize '/api/v1/xyz' -> '/xyz'
  }
  const token = tokenStore.get();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Single-flight refresh state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Single-flight 401 refresh & envelope unwrapping
apiClient.interceptors.response.use(
  (response) => {
    activeRequestsCount = Math.max(0, activeRequestsCount - 1);
    notifyLoading();
    // Backend standard envelope: { success: true, data: ... }
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success) {
        return response.data.data;
      }
      const err = response.data.error || {};
      throw new ApiError(response.status, err.code || 'UNKNOWN_ERROR', err.message || 'Operation failed', err.fields);
    }
    return response.data;
  },
  async (error) => {
    activeRequestsCount = Math.max(0, activeRequestsCount - 1);
    notifyLoading();
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Pass through auth endpoints directly without refresh recursion
    const url = originalRequest?.url || '';
    if (
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/register') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password')
    ) {
      const errData = error.response?.data?.error || {};
      const status = error.response?.status || 500;
      return Promise.reject(
        new ApiError(status, errData.code || 'AUTH_ERROR', errData.message || error.message, errData.fields)
      );
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await refreshClient.post('/auth/refresh');
        const newToken = res.data?.data?.accessToken;
        if (newToken) {
          tokenStore.set(newToken);
          processQueue(null, newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        }
        throw new Error('No access token returned from refresh');
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        tokenStore.clear();
        return Promise.reject(
          new ApiError(401, 'TOKEN_EXPIRED', 'Aapka login session expire ho gaya hai. Dobara login karein.')
        );
      } finally {
        isRefreshing = false;
      }
    }

    const errData = error.response?.data?.error || {};
    const status = error.response?.status || 500;
    return Promise.reject(
      new ApiError(status, errData.code || 'UNKNOWN_ERROR', errData.message || error.message, errData.fields)
    );
  }
);
