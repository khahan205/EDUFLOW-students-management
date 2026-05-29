import { apiClient } from '@/services/api-client';

export interface PhanCongRow {
  MaHK: string;
  TenHK: string;
  NamHoc: string;
  MaMH: string;
  TenMH: string;
  SoTinChi: number;
  GiangVien: { MaTK: number; HoTen: string; Email: string | null } | null;
}

export interface GiangVienAccount {
  MaTK: number;
  HoTen: string;
  Email: string | null;
  Username: string;
}

export async function fetchPhanCong(): Promise<PhanCongRow[]> {
  const { data } = await apiClient.get<PhanCongRow[]>('/phan-cong');
  return data;
}

export async function fetchGiangVienAccounts(): Promise<GiangVienAccount[]> {
  const { data } = await apiClient.get<GiangVienAccount[]>('/phan-cong/giang-vien');
  return data;
}

export async function assignGiangVien(payload: { maHK: string; maMH: string; maTK: number }) {
  const { data } = await apiClient.post('/phan-cong', payload);
  return data;
}

export async function removeGiangVien(maHK: string, maMH: string) {
  const { data } = await apiClient.delete(`/phan-cong/${maHK}/${maMH}`);
  return data;
}

export interface MyClassRow {
  MaHK: string;
  TenHK: string;
  NamHoc: string;
  MaMH: string;
  TenMH: string;
  SoTinChi: number;
  SiSoHienTai: number;
  SiSoToiDa: number;
}

export async function fetchMyClasses(): Promise<MyClassRow[]> {
  const { data } = await apiClient.get<MyClassRow[]>('/phan-cong/my-classes');
  return data;
}
