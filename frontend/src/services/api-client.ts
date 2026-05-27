import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS } from '@/lib/constants';
import type { AuthSession, ApiError } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Axios instance with:
 *  - JWT auth header attached automatically
 *  - 401 handling (clear session + redirect to /login)
 *  - typed ApiError normalization
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
  if (raw) {
    try {
      // Zustand persist wraps state as { state: {...}, version: N }
      const persisted = JSON.parse(raw);
      const session: AuthSession = persisted?.state ?? persisted;
      if (session?.accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    } catch {
      /* corrupted storage — ignore */
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string; code?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      // Only redirect if we're not already on /login (avoid loop)
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
