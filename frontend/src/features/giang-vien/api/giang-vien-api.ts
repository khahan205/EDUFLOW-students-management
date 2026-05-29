import { apiClient } from '@/services/api-client';

export interface SinhVienLopRow {
  MaSV: string;
  TenSV: string;
  NgaySinh: string | null;
  GioiTinh: 'Nam' | 'Nữ' | null;
  TenLop: string | null;
  Email: string | null;
  NgayDangKy: string;
}

export async function fetchSinhVienLop(
  maHK: string,
  maMH: string,
): Promise<SinhVienLopRow[]> {
  const { data } = await apiClient.get<SinhVienLopRow[]>('/dang-ky/sinh-vien-lop', {
    params: { maHK, maMH },
  });
  return data;
}
