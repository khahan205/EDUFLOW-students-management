import { delay } from '@/lib/delay';
import { USE_MOCK } from '@/lib/constants';
import { apiClient } from '@/services/api-client';
import { dangKyStore_, MOCK_CURRENT_HK } from '../mocks/dang-ky-mocks';
import { sinhVienStore } from '@/features/sinh-vien/mocks/sinh-vien-mocks';
import type { MonHoc, SinhVien } from '@/types';

export interface MonHocVoiTrangThai extends MonHoc {
  daDangKy: boolean;
}

export interface CurrentHK {
  MaHK: string;
  TenHK: string;
  NamHoc: string;
}

export async function fetchSinhVienByMa(maSV: string): Promise<SinhVien> {
  if (USE_MOCK) {
    await delay();
    const sv = sinhVienStore.get(maSV);
    if (!sv) throw { code: 'NOT_FOUND', message: `Không tìm thấy sinh viên có mã "${maSV}".` };
    return sv;
  }
  const { data } = await apiClient.get<SinhVien>(`/sinh-vien/${maSV}`);
  return data;
}

export async function fetchCurrentHocKy(): Promise<CurrentHK> {
  if (USE_MOCK) {
    await delay(50);
    return MOCK_CURRENT_HK;
  }
  const { data } = await apiClient.get<CurrentHK>('/hoc-ky/current');
  return data;
}

export async function fetchMonMoChoSV(maSV: string, maHK: string): Promise<MonHocVoiTrangThai[]> {
  if (USE_MOCK) {
    await delay();
    return dangKyStore_.getMonMoChoSV(maSV, maHK);
  }
  const { data } = await apiClient.get<MonHocVoiTrangThai[]>(
    `/dang-ky/${maSV}/mon-mo`,
    { params: { ma_hk: maHK } },
  );
  return data;
}

export async function registerMon(payload: { maSV: string; maHK: string; maMH: string }) {
  if (USE_MOCK) {
    await delay();
    return dangKyStore_.register(payload.maSV, payload.maHK, payload.maMH);
  }
  const { data } = await apiClient.post('/dang-ky', payload);
  return data;
}

export async function unregisterMon(payload: { maSV: string; maHK: string; maMH: string }) {
  if (USE_MOCK) {
    await delay();
    return dangKyStore_.unregister(payload.maSV, payload.maHK, payload.maMH);
  }
  const { data } = await apiClient.delete('/dang-ky', { data: payload });
  return data;
}
