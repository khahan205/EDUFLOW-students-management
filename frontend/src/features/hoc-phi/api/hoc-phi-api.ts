import { delay } from '@/lib/delay';
import { USE_MOCK } from '@/lib/constants';
import { apiClient } from '@/services/api-client';
import type { PhieuThu, ThuHocPhiRow } from '@/types';
import { hocPhiStore } from '../mocks/hoc-phi-mocks';

export async function fetchHocPhiRows(): Promise<ThuHocPhiRow[]> {
  if (USE_MOCK) {
    await delay();
    return hocPhiStore.list();
  }
  const { data } = await apiClient.get<ThuHocPhiRow[]>('/hoc-phi');
  return data;
}

export async function fetchPaymentHistory(maSV: string, maHK: string): Promise<PhieuThu[]> {
  if (USE_MOCK) {
    await delay();
    return hocPhiStore.history(maSV, maHK);
  }
  const { data } = await apiClient.get<PhieuThu[]>(`/hoc-phi/${maSV}/lich-su`, {
    params: { ma_hk: maHK },
  });
  return data;
}

export async function payTuition(payload: {
  maSV: string;
  maHK: string;
  soTien: number;
  ghiChu?: string;
}) {
  if (USE_MOCK) {
    await delay();
    return hocPhiStore.pay(payload.maSV, payload.maHK, payload.soTien);
  }
  const { data } = await apiClient.post('/hoc-phi/thu', payload);
  return data;
}
