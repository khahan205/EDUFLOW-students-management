/**
 * Domain types — mapped 1:1 to the 13 database tables in Chapter 4 design.
 * Naming convention: PascalCase entity names; field names match DB columns.
 */

/* ============ Reference / Master data ============ */

export interface Huyen {
  MaHuyen: string;
  TenHuyen: string;
  LaVungSauVungXa: boolean;
}

export interface QueQuan {
  MaQueQuan: string;
  TenTinh: string;
  MaHuyen: string;
}

export interface DoiTuongUuTien {
  MaDoiTuong: string;
  TenDoiTuong: string;
  TiLeGiamHocPhi: number; // 0..1
}

export interface NganhHoc {
  MaNganh: string;
  TenNganh: string;
  MaKhoa: string;
}

export interface LoaiMon {
  MaLoaiMon: string; // 'LT' | 'TH'
  TenLoaiMon: string;
  HeSoTinChi: number; // e.g. 15 (LT) or 30 (TH)
}

/* ============ Core entities ============ */

export interface SinhVien {
  MaSV: string;
  TenSV: string;
  NgaySinh?: string; // ISO date
  GioiTinh?: 'Nam' | 'Nữ';
  MaQueQuan?: string;
  MaDoiTuong?: string;
  MaNganh?: string;
  /* UI-friendly denormalized fields (joined on the server) */
  TenLop?: string;
  Email?: string;
  TrangThai?: 'Đang học' | 'Bảo lưu' | 'Tốt nghiệp';
}

export interface MonHoc {
  MaMH: string;
  TenMH: string;
  MaLoaiMon: string;
  SoTiet: number;
  SoTinChi: number;
  /* Denormalized for table display */
  HocPhi?: number;
  HocKy?: string;
  TenKhoa?: string;
  SiSoHienTai?: number;
  SiSoToiDa?: number;
}

export interface HocKy {
  MaHK: string;
  TenHK: string;
  NamHoc: string;
}

export interface ChuongTrinhHoc {
  MaCTH: number;
  MaNganh: string;
  MaMH: string;
  HocKy: number; // thứ tự học kỳ trong chương trình
}

export interface MonHocMo {
  MaHK: string;
  MaMH: string;
}

export interface PhieuHocPhi {
  MaPhieu: string;
  MaSV: string;
  MaMH: string;
  MaHK: string;
  NgayLap: string;
  SoTienDangKy: number;
  SoTienPhaiDong: number;
}

export interface PhieuThu {
  MaPhieuThu: string;
  MaSV: string;
  MaHK: string;
  NgayThu: string;
  SoTienThu: number;
}

export interface ThamSo {
  TenThamSo: string;
  GiaTri: number | string;
  MoTa?: string;
}

/* ============ Aggregated / UI view models ============ */

/** Row in the "Thu học phí" page – aggregates PhieuHocPhi + sum(PhieuThu) per SV+HK */
export interface ThuHocPhiRow {
  MaSV: string;
  TenSV: string;
  MaHK: string;
  TenHK: string;
  Tong: number;
  DaDong: number;
  ConLai: number;
  TrangThai: 'Chưa ĐT' | 'Đã ĐT 1 phần' | 'Đã ĐT';
}

/** Dashboard stat cards */
export interface DashboardStats {
  sinhVienDangHoc: number;
  monHocDangMo: number;
  dangKyHienTai: number;
  doanhThuDaThu: number;
  congNoQuaHan: number;
}

/** Doanh thu theo học kỳ row */
export interface RevenueBySemesterRow {
  NamHoc: string;
  HocKy: string;
  Tong: number;
  DaThu: number;
  SoSinhVien: number;
}

/** Báo cáo: trạng thái học phí */
export interface PaymentStatusBreakdown {
  status: 'Đã ĐT' | 'Đã ĐT 1 phần' | 'Chưa ĐT';
  count: number;
  amount: number;
}

/** Báo cáo: thống kê đăng ký môn */
export interface EnrollmentStatRow {
  MaMH: string;
  TenMH: string;
  TenKhoa: string;
  DaDangKy: number;
  ToiDa: number;
}

/* ============ Auth ============ */

export type UserRole = 'admin' | 'phong-dao-tao' | 'phong-tai-chinh' | 'co-van' | 'giang-vien' | 'sinh-vien';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  mustChangePassword?: boolean;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

/* ============ API common shapes ============ */

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
