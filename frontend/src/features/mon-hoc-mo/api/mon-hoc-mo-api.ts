import { apiClient } from '@/services/api-client';

export interface MonHocMoRow {
  MaHK: string;
  TenHK: string;
  NamHoc: string;
  MaMH: string;
  TenMH: string;
  SoTinChi: number;
  SiSoHienTai: number;
  SiSoToiDa: number;
  GiangVien: { MaTK: number; HoTen: string; Email: string | null } | null;
}

export async function fetchMonHocMo(maHK?: string): Promise<MonHocMoRow[]> {
  const { data } = await apiClient.get<MonHocMoRow[]>('/mon-hoc-mo', {
    params: maHK ? { maHK } : undefined,
  });
  return data;
}

export async function openCourse(maHK: string, maMH: string, siSoToiDa?: number): Promise<void> {
  await apiClient.post('/mon-hoc-mo', { maHK, maMH, siSoToiDa });
}

export async function updateCourse(maHK: string, maMH: string, siSoToiDa: number | null): Promise<void> {
  await apiClient.put(`/mon-hoc-mo/${maHK}/${maMH}`, { siSoToiDa });
}

export async function closeCourse(maHK: string, maMH: string): Promise<void> {
  await apiClient.delete(`/mon-hoc-mo/${maHK}/${maMH}`);
}
