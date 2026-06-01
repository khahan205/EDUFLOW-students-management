import { delay } from '@/lib/delay';
import { USE_MOCK } from '@/lib/constants';
import { apiClient } from '@/services/api-client';
import type { EnrollmentStatRow, PaymentStatusBreakdown } from '@/types';
import {
  mockPaymentStatusBreakdown,
  mockEnrollmentStats,
  mockRevenueTrend,
  type RevenueTrendPoint,
} from '../mocks/bao-cao-mocks';

export async function fetchPaymentStatusBreakdown(): Promise<PaymentStatusBreakdown[]> {
  if (USE_MOCK) {
    await delay();
    return mockPaymentStatusBreakdown;
  }
  const { data } = await apiClient.get<PaymentStatusBreakdown[]>('/bao-cao/trang-thai-hoc-phi');
  return data;
}

export async function fetchEnrollmentStats(): Promise<EnrollmentStatRow[]> {
  if (USE_MOCK) {
    await delay();
    return mockEnrollmentStats;
  }
  const { data } = await apiClient.get<EnrollmentStatRow[]>('/bao-cao/dang-ky-mon');
  return data;
}

export async function fetchRevenueTrend(period = '6thang'): Promise<RevenueTrendPoint[]> {
  if (USE_MOCK) {
    await delay();
    return mockRevenueTrend;
  }
  const { data } = await apiClient.get<RevenueTrendPoint[]>('/bao-cao/doanh-thu-trend', {
    params: { period },
  });
  return data;
}
