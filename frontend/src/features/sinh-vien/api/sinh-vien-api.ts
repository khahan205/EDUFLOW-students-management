import { delay } from '@/lib/delay';
import { USE_MOCK } from '@/lib/constants';
import { apiClient } from '@/services/api-client';
import type { SinhVien } from '@/types';
import { sinhVienStore } from '../mocks/sinh-vien-mocks';
import type { SinhVienInput } from '../schemas/sinh-vien.schema';

export interface SinhVienPage {
  data: SinhVien[];
  total: number;
  page: number;
  totalPages: number;
}

export async function fetchSinhVienList(params?: {
  page?: number; limit?: number; search?: string; maNganh?: string; trangThai?: string;
}): Promise<SinhVienPage> {
  if (USE_MOCK) {
    await delay();
    const all = sinhVienStore.list();
    return { data: all, total: all.length, page: 1, totalPages: 1 };
  }
  const { data } = await apiClient.get<SinhVienPage>('/sinh-vien', { params });
  return data;
}

export async function createSinhVien(input: SinhVienInput): Promise<SinhVien> {
  if (USE_MOCK) {
    await delay();
    if (sinhVienStore.get(input.MaSV)) {
      throw { code: 'DUPLICATE', message: `Mã SV "${input.MaSV}" đã tồn tại.` };
    }
    return sinhVienStore.add(input as SinhVien);
  }
  const { data } = await apiClient.post<SinhVien>('/sinh-vien', input);
  return data;
}

export async function updateSinhVien(maSV: string, input: SinhVienInput): Promise<SinhVien> {
  if (USE_MOCK) {
    await delay();
    const updated = sinhVienStore.update(maSV, input);
    if (!updated) throw { code: 'NOT_FOUND', message: 'Không tìm thấy sinh viên.' };
    return updated;
  }
  const { data } = await apiClient.put<SinhVien>(`/sinh-vien/${maSV}`, input);
  return data;
}

export async function deleteSinhVien(maSV: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    sinhVienStore.remove(maSV);
    return;
  }
  await apiClient.delete(`/sinh-vien/${maSV}`);
}
