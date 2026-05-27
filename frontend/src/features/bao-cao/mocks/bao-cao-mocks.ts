import type { EnrollmentStatRow, PaymentStatusBreakdown } from '@/types';

export const mockPaymentStatusBreakdown: PaymentStatusBreakdown[] = [
  { status: 'Đã ĐT',         count: 3, amount: 11_500_000 },
  { status: 'Đã ĐT 1 phần',  count: 1, amount: 5_000_000  },
  { status: 'Chưa ĐT',       count: 2, amount: 40_000_000 },
];

export const mockEnrollmentStats: EnrollmentStatRow[] = [
  { MaMH: 'TOAN101', TenMH: 'Toán A1',         TenKhoa: 'CNTT',                 DaDangKy: 0, ToiDa: 50  },
  { MaMH: 'TOAN102', TenMH: 'Toán A2',         TenKhoa: 'CNTT',                 DaDangKy: 0, ToiDa: 50  },
  { MaMH: 'TEST01',  TenMH: 'Test',            TenKhoa: 'CNTT',                 DaDangKy: 0, ToiDa: 50  },
  { MaMH: 'T01',     TenMH: 'Test 1',          TenKhoa: 'CNTT',                 DaDangKy: 1, ToiDa: 50  },
  { MaMH: 'T02',     TenMH: 'Test 2',          TenKhoa: 'CNTT',                 DaDangKy: 0, ToiDa: 50  },
  { MaMH: 'MATH102', TenMH: 'Toán cao cấp 1',  TenKhoa: 'Công nghệ thông tin',  DaDangKy: 1, ToiDa: 50  },
  { MaMH: 'SHI350',  TenMH: 'meomeo',          TenKhoa: 'Khoa Khoa học và KTTT', DaDangKy: 0, ToiDa: 100 },
];

/** Doanh thu trend cho recharts — 6 tháng gần nhất */
export interface RevenueTrendPoint {
  thang: string;
  doanhThu: number;
}

export const mockRevenueTrend: RevenueTrendPoint[] = [
  { thang: 'T7',  doanhThu: 2_100_000  },
  { thang: 'T8',  doanhThu: 4_500_000  },
  { thang: 'T9',  doanhThu: 8_200_000  },
  { thang: 'T10', doanhThu: 12_500_000 },
  { thang: 'T11', doanhThu: 14_100_000 },
  { thang: 'T12', doanhThu: 15_500_000 },
];
