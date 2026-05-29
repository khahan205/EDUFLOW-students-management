import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS } from '@/lib/constants';
import type { AuthSession, ApiError } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

function getPersistedSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!raw) return null;
    // Zustand persist wraps state as { state: {...}, version: N }
    const persisted = JSON.parse(raw);
    return persisted?.state ?? persisted;
  } catch {
    return null;
  }
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const session = getPersistedSession();
  if (session?.accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ message?: string; code?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const session = getPersistedSession();

      // Attempt refresh if we have a refresh token
      if (session?.refreshToken && !originalRequest.url?.includes('/auth/refresh')) {
        if (isRefreshing) {
          // Queue this request until token is refreshed
          return new Promise((resolve) => {
            refreshQueue.push((newToken) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              resolve(apiClient(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data } = await axios.post<{ accessToken: string }>(
            `${BASE_URL}/auth/refresh`,
            { refreshToken: session.refreshToken },
          );

          const newToken = data.accessToken;

          // Update the stored token via Zustand store (dynamic import to avoid circular deps)
          const { useAuthStore } = await import('@/stores/auth-store');
          useAuthStore.getState().setAccessToken(newToken);

          // Flush queued requests
          refreshQueue.forEach((cb) => cb(newToken));
          refreshQueue = [];

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        } catch {
          // Refresh failed — logout
          refreshQueue = [];
          localStorage.removeItem(STORAGE_KEYS.AUTH);
          if (!window.location.pathname.startsWith('/login')) {
            window.location.assign('/login');
          }
        } finally {
          isRefreshing = false;
        }
      }

      // No refresh token or refresh endpoint itself 401 → logout
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    const normalized: ApiError = {
      code: error.response?.data?.code ?? error.code ?? 'UNKNOWN',
      message: error.response?.data?.message ?? error.message ?? 'Đã có lỗi xảy ra',
    };
    return Promise.reject(normalized);
  },
);
