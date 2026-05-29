import { delay } from '@/lib/delay';
import { USE_MOCK } from '@/lib/constants';
import { apiClient } from '@/services/api-client';
import type { DashboardStats, RevenueBySemesterRow } from '@/types';
import { mockDashboardStats, mockRevenueBySemester } from '../mocks/dashboard-mocks';
import type { OverdueDebtRow } from '../components/OverdueDebts';

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

export async function fetchOverdueDebts(): Promise<OverdueDebtRow[]> {
  if (USE_MOCK) {
    await delay();
    return [];
  }
  const { data } = await apiClient.get<OverdueDebtRow[]>('/dashboard/overdue-debts');
  return data;
}
