import { delay } from '@/lib/delay';
import { USE_MOCK } from '@/lib/constants';
import { apiClient } from '@/services/api-client';
import type { DashboardStats, RevenueBySemesterRow } from '@/types';
import {
  mockDashboardStats,
  mockRevenueBySemester,
  mockOverdueDebts,
  type OverdueDebt,
} from '../mocks/dashboard-mocks';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK) {
    await delay();
    return mockDashboardStats;
  }
  const { data } = await apiClient.get<DashboardStats>('/dashboard/stats');
  return data;
}

export async function fetchRevenueBySemester(): Promise<RevenueBySemesterRow[]> {
  if (USE_MOCK) {
    await delay();
    return mockRevenueBySemester;
  }
  const { data } = await apiClient.get<RevenueBySemesterRow[]>('/dashboard/revenue-by-semester');
  return data;
}

export async function fetchOverdueDebts(): Promise<OverdueDebt[]> {
  if (USE_MOCK) {
    await delay();
    return mockOverdueDebts;
  }
  const { data } = await apiClient.get<OverdueDebt[]>('/dashboard/overdue-debts');
  return data;
}
