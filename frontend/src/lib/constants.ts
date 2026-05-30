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
  CHANGE_PASSWORD: '/change-password',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  MON_HOC_MO: '/mon-hoc-mo',
  GIANG_VIEN: '/giang-vien',
  GIANG_VIEN_PROFILE: '/giang-vien/profile',
  GIANG_VIEN_LIST: '/danh-sach-giang-vien',
  CHUONG_TRINH_HOC: '/chuong-trinh-hoc',
  NGANH_HOC: '/nganh-hoc',
  KHOA: '/khoa',
  PHAN_CONG: '/phan-cong',
} as const;

/** Simulated network latency for mock APIs (ms) */
export const MOCK_LATENCY_MS = 250;

/** Whether to use mocks (defaults to true while backend is being built) */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

/** Whether to use mock auth specifically (can be true even when USE_MOCK=false) */
export const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';
