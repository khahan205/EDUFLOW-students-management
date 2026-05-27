import type {
  DashboardStats,
  RevenueBySemesterRow,
} from '@/types';

export const mockDashboardStats: DashboardStats = {
  sinhVienDangHoc: 2,
  monHocDangMo: 7,
  dangKyHienTai: 2,
  doanhThuDaThu: 15_500_001,
  congNoQuaHan: 0,
};

export const mockRevenueBySemester: RevenueBySemesterRow[] = [
  { NamHoc: '2024-2025', HocKy: 'HK1', Tong: 25_500_000, DaThu: 15_500_001, SoSinhVien: 2 },
  { NamHoc: '2024-2025', HocKy: 'HK2', Tong: 40_000_000, DaThu: 0,          SoSinhVien: 2 },
  { NamHoc: '2024-2025', HocKy: 'HK3 (Hè)', Tong: 6_750_000, DaThu: 0,      SoSinhVien: 1 },
];

export interface OverdueDebt {
  MaSV: string;
  TenSV: string;
  TenHK: string;
  ConNo: number;
  HanDong: string;
}

export const mockOverdueDebts: OverdueDebt[] = [];
