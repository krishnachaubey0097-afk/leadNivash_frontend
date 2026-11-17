import axios, { type AxiosRequestConfig } from 'axios';

// Default to live Render backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://leadnivash.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
  if (token) {
    sessionStorage.setItem('ln_access_token', token);
  } else {
    sessionStorage.removeItem('ln_access_token');
  }
};

export const getAccessToken = (): string | null => {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  const stored = sessionStorage.getItem('ln_access_token');
  if (stored) {
    inMemoryAccessToken = stored;
    return stored;
  }
  return null;
};

// Request Interceptor: Attach Bearer Token
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Refresh Token on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Don't retry auth endpoints
    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/register')
    ) {
      return Promise.reject(error);
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
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          processQueue(null, newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
