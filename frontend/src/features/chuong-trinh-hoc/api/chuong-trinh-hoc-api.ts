import { apiClient } from '@/services/api-client';

export interface CTHRow {
  MaCTH: number;
  MaNganh: string;
  TenNganh: string;
  MaMH: string;
  TenMH: string;
  SoTinChi: number;
  HocKy: number;
}

export async function fetchCTH(maNganh?: string): Promise<CTHRow[]> {
  const { data } = await apiClient.get<CTHRow[]>('/chuong-trinh-hoc', {
    params: maNganh ? { maNganh } : undefined,
  });
  return data;
}

export async function addToCTH(maNganh: string, maMH: string, hocKy: number): Promise<void> {
  await apiClient.post('/chuong-trinh-hoc', { maNganh, maMH, hocKy });
}

export async function updateCTH(maCTH: number, hocKy: number): Promise<void> {
  await apiClient.put(`/chuong-trinh-hoc/${maCTH}`, { hocKy });
}

export async function removeFromCTH(maCTH: number): Promise<void> {
  await apiClient.delete(`/chuong-trinh-hoc/${maCTH}`);
}
