/**
 * App-wide constants.
 */

export const APP_NAME = 'EduFlow';
export const APP_FULL_NAME = 'Quản lý Sinh viên';
export const APP_TAGLINE = 'Quản lý đăng ký môn học và thu học phí';

export const STORAGE_KEYS = {
  AUTH: import.meta.env.VITE_AUTH_STORAGE_KEY || 'eduflow_auth',
} as const;

export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SINH_VIEN: '/sinh-vien',
  MON_HOC: '/mon-hoc',
  DANG_KY: '/dang-ky',
  HOC_PHI: '/hoc-phi',
  BAO_CAO: '/bao-cao',
  ADMIN: '/admin',
} as const;

/** Simulated network latency for mock APIs (ms) */
export const MOCK_LATENCY_MS = 250;

/** Whether to use mocks (defaults to true while backend is being built) */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
