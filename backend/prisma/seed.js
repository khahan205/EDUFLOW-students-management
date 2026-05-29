/**
 * Seed dữ liệu demo phong phú — chạy: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ── helpers ──────────────────────────────────────────────────────────────────
function discount(maDT, price) {
  const rates = { DT_KHONG: 0, DT_TOPDAU: 0.5, DT_VUNGSAUVUNGXA: 0.3 };
  return Math.round(price * (1 - (rates[maDT] ?? 0)));
}
function d(str) { return new Date(str); }

// ── raw data ──────────────────────────────────────────────────────────────────
const STUDENTS = [
  // CNTT22-1
  { MaSV: '22521001', TenSV: 'Nguyễn Văn An',      NgaySinh: d('2004-03-15'), GioiTinh: 'Nam', TenLop: 'CNTT22-1', Email: 'an.22521001@gm.uit.edu.vn',       MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521002', TenSV: 'Trần Thị Bình',       NgaySinh: d('2004-07-22'), GioiTinh: 'Nu',  TenLop: 'CNTT22-1', Email: 'binh.22521002@gm.uit.edu.vn',     MaQueQuan: 'QQ_HN',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521003', TenSV: 'Lê Văn Cường',        NgaySinh: d('2004-01-08'), GioiTinh: 'Nam', TenLop: 'CNTT22-1', Email: 'cuong.22521003@gm.uit.edu.vn',    MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_TOPDAU',         MaNganh: 'NG_CNTT' },
  { MaSV: '22521004', TenSV: 'Phạm Thị Duyên',      NgaySinh: d('2004-11-30'), GioiTinh: 'Nu',  TenLop: 'CNTT22-1', Email: 'duyen.22521004@gm.uit.edu.vn',    MaQueQuan: 'QQ_DAN', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521005', TenSV: 'Hoàng Văn Em',        NgaySinh: d('2004-05-18'), GioiTinh: 'Nam', TenLop: 'CNTT22-1', Email: 'em.22521005@gm.uit.edu.vn',       MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521006', TenSV: 'Ngô Thị Phương',      NgaySinh: d('2004-09-14'), GioiTinh: 'Nu',  TenLop: 'CNTT22-1', Email: 'phuong.22521006@gm.uit.edu.vn',   MaQueQuan: 'QQ_HN',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521007', TenSV: 'Vũ Văn Giang',        NgaySinh: d('2004-02-25'), GioiTinh: 'Nam', TenLop: 'CNTT22-1', Email: 'giang.22521007@gm.uit.edu.vn',    MaQueQuan: 'QQ_CT',  MaDoiTuong: 'DT_VUNGSAUVUNGXA',  MaNganh: 'NG_CNTT' },
  { MaSV: '22521008', TenSV: 'Đặng Thị Hoa',        NgaySinh: d('2004-06-03'), GioiTinh: 'Nu',  TenLop: 'CNTT22-1', Email: 'hoa.22521008@gm.uit.edu.vn',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521009', TenSV: 'Bùi Văn Hải',         NgaySinh: d('2004-12-20'), GioiTinh: 'Nam', TenLop: 'CNTT22-1', Email: 'hai.22521009@gm.uit.edu.vn',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_TOPDAU',         MaNganh: 'NG_CNTT' },
  { MaSV: '22521010', TenSV: 'Đỗ Thị Lan',          NgaySinh: d('2004-04-11'), GioiTinh: 'Nu',  TenLop: 'CNTT22-1', Email: 'lan.22521010@gm.uit.edu.vn',      MaQueQuan: 'QQ_HUE', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  // CNTT22-2
  { MaSV: '22521011', TenSV: 'Hồ Văn Minh',         NgaySinh: d('2004-08-07'), GioiTinh: 'Nam', TenLop: 'CNTT22-2', Email: 'minh.22521011@gm.uit.edu.vn',     MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521012', TenSV: 'Nguyễn Thị Nga',      NgaySinh: d('2004-03-29'), GioiTinh: 'Nu',  TenLop: 'CNTT22-2', Email: 'nga.22521012@gm.uit.edu.vn',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521013', TenSV: 'Trần Văn Quân',       NgaySinh: d('2004-10-16'), GioiTinh: 'Nam', TenLop: 'CNTT22-2', Email: 'quan.22521013@gm.uit.edu.vn',     MaQueQuan: 'QQ_HN',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521014', TenSV: 'Lê Thị Sen',          NgaySinh: d('2004-01-31'), GioiTinh: 'Nu',  TenLop: 'CNTT22-2', Email: 'sen.22521014@gm.uit.edu.vn',      MaQueQuan: 'QQ_DAN', MaDoiTuong: 'DT_TOPDAU',         MaNganh: 'NG_CNTT' },
  { MaSV: '22521015', TenSV: 'Phạm Văn Thắng',      NgaySinh: d('2004-07-05'), GioiTinh: 'Nam', TenLop: 'CNTT22-2', Email: 'thang.22521015@gm.uit.edu.vn',    MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521016', TenSV: 'Hoàng Thị Thảo',      NgaySinh: d('2004-09-23'), GioiTinh: 'Nu',  TenLop: 'CNTT22-2', Email: 'thao.22521016@gm.uit.edu.vn',     MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521017', TenSV: 'Phan Văn Trung',      NgaySinh: d('2004-02-14'), GioiTinh: 'Nam', TenLop: 'CNTT22-2', Email: 'trung.22521017@gm.uit.edu.vn',    MaQueQuan: 'QQ_CT',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521018', TenSV: 'Vũ Thị Uyên',         NgaySinh: d('2004-06-19'), GioiTinh: 'Nu',  TenLop: 'CNTT22-2', Email: 'uyen.22521018@gm.uit.edu.vn',     MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521019', TenSV: 'Đặng Văn Việt',       NgaySinh: d('2004-11-02'), GioiTinh: 'Nam', TenLop: 'CNTT22-2', Email: 'viet.22521019@gm.uit.edu.vn',     MaQueQuan: 'QQ_HN',  MaDoiTuong: 'DT_VUNGSAUVUNGXA',  MaNganh: 'NG_CNTT' },
  { MaSV: '22521020', TenSV: 'Bùi Thị Xuân',        NgaySinh: d('2004-04-28'), GioiTinh: 'Nu',  TenLop: 'CNTT22-2', Email: 'xuan.22521020@gm.uit.edu.vn',     MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  // KTMT22-1
  { MaSV: '22522001', TenSV: 'Đinh Văn Anh',        NgaySinh: d('2004-05-10'), GioiTinh: 'Nam', TenLop: 'KTMT22-1', Email: 'anh.22522001@gm.uit.edu.vn',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_KTMT' },
  { MaSV: '22522002', TenSV: 'Hồ Thị Bảo',          NgaySinh: d('2004-08-14'), GioiTinh: 'Nu',  TenLop: 'KTMT22-1', Email: 'bao.22522002@gm.uit.edu.vn',      MaQueQuan: 'QQ_HN',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_KTMT' },
  { MaSV: '22522003', TenSV: 'Ngô Văn Chiến',       NgaySinh: d('2004-01-27'), GioiTinh: 'Nam', TenLop: 'KTMT22-1', Email: 'chien.22522003@gm.uit.edu.vn',    MaQueQuan: 'QQ_DAN', MaDoiTuong: 'DT_TOPDAU',         MaNganh: 'NG_KTMT' },
  { MaSV: '22522004', TenSV: 'Dương Thị Diệu',      NgaySinh: d('2004-11-06'), GioiTinh: 'Nu',  TenLop: 'KTMT22-1', Email: 'dieu.22522004@gm.uit.edu.vn',     MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_KTMT' },
  { MaSV: '22522005', TenSV: 'Lý Văn Đức',          NgaySinh: d('2004-03-21'), GioiTinh: 'Nam', TenLop: 'KTMT22-1', Email: 'duc.22522005@gm.uit.edu.vn',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_KTMT' },
  { MaSV: '22522006', TenSV: 'Đinh Thị Giang',      NgaySinh: d('2004-07-09'), GioiTinh: 'Nu',  TenLop: 'KTMT22-1', Email: 'giang.22522006@gm.uit.edu.vn',    MaQueQuan: 'QQ_CT',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_KTMT' },
  { MaSV: '22522007', TenSV: 'Hồ Văn Hiếu',         NgaySinh: d('2004-12-15'), GioiTinh: 'Nam', TenLop: 'KTMT22-1', Email: 'hieu.22522007@gm.uit.edu.vn',     MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_KTMT' },
  { MaSV: '22522008', TenSV: 'Ngô Thị Kim',         NgaySinh: d('2004-04-30'), GioiTinh: 'Nu',  TenLop: 'KTMT22-1', Email: 'kim.22522008@gm.uit.edu.vn',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_VUNGSAUVUNGXA',  MaNganh: 'NG_KTMT' },
  { MaSV: '22522009', TenSV: 'Dương Văn Lâm',       NgaySinh: d('2004-09-08'), GioiTinh: 'Nam', TenLop: 'KTMT22-1', Email: 'lam.22522009@gm.uit.edu.vn',      MaQueQuan: 'QQ_HN',  MaDoiTuong: 'DT_TOPDAU',         MaNganh: 'NG_KTMT' },
  { MaSV: '22522010', TenSV: 'Lý Thị Mỹ',           NgaySinh: d('2004-02-17'), GioiTinh: 'Nu',  TenLop: 'KTMT22-1', Email: 'my.22522010@gm.uit.edu.vn',       MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_KTMT' },
  // HTTT22-1
  { MaSV: '22523001', TenSV: 'Trương Văn Nam',      NgaySinh: d('2004-06-24'), GioiTinh: 'Nam', TenLop: 'HTTT22-1', Email: 'nam.22523001@gm.uit.edu.vn',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_HTTT' },
  { MaSV: '22523002', TenSV: 'Võ Thị Oanh',         NgaySinh: d('2004-10-03'), GioiTinh: 'Nu',  TenLop: 'HTTT22-1', Email: 'oanh.22523002@gm.uit.edu.vn',     MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_HTTT' },
  { MaSV: '22523003', TenSV: 'Mai Văn Phát',        NgaySinh: d('2004-01-19'), GioiTinh: 'Nam', TenLop: 'HTTT22-1', Email: 'phat.22523003@gm.uit.edu.vn',     MaQueQuan: 'QQ_DAN', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_HTTT' },
  { MaSV: '22523004', TenSV: 'Lâm Thị Quỳnh',      NgaySinh: d('2004-08-26'), GioiTinh: 'Nu',  TenLop: 'HTTT22-1', Email: 'quynh.22523004@gm.uit.edu.vn',    MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_TOPDAU',         MaNganh: 'NG_HTTT' },
  { MaSV: '22523005', TenSV: 'Trương Văn Rạng',     NgaySinh: d('2004-04-12'), GioiTinh: 'Nam', TenLop: 'HTTT22-1', Email: 'rang.22523005@gm.uit.edu.vn',     MaQueQuan: 'QQ_CT',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_HTTT' },
  { MaSV: '22523006', TenSV: 'Võ Thị Sương',        NgaySinh: d('2004-11-28'), GioiTinh: 'Nu',  TenLop: 'HTTT22-1', Email: 'suong.22523006@gm.uit.edu.vn',    MaQueQuan: 'QQ_HN',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_HTTT' },
  { MaSV: '22523007', TenSV: 'Mai Văn Tài',         NgaySinh: d('2004-07-16'), GioiTinh: 'Nam', TenLop: 'HTTT22-1', Email: 'tai.22523007@gm.uit.edu.vn',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_HTTT' },
  { MaSV: '22523008', TenSV: 'Lâm Thị Tuyết',      NgaySinh: d('2004-03-05'), GioiTinh: 'Nu',  TenLop: 'HTTT22-1', Email: 'tuyet.22523008@gm.uit.edu.vn',    MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_HTTT' },
  { MaSV: '22523009', TenSV: 'Trương Văn Uy',       NgaySinh: d('2004-09-21'), GioiTinh: 'Nam', TenLop: 'HTTT22-1', Email: 'uy.22523009@gm.uit.edu.vn',       MaQueQuan: 'QQ_DAN', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_HTTT' },
  { MaSV: '22523010', TenSV: 'Võ Thị Vui',          NgaySinh: d('2004-05-07'), GioiTinh: 'Nu',  TenLop: 'HTTT22-1', Email: 'vui.22523010@gm.uit.edu.vn',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_TOPDAU',         MaNganh: 'NG_HTTT' },
];

const COURSES = [
  { MaMH: 'CS101',   TenMH: 'Nhập môn lập trình',               MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK1',      TenKhoa: 'Khoa Công nghệ Thông tin', SiSoToiDa: 60 },
  { MaMH: 'CS102',   TenMH: 'Lập trình hướng đối tượng',        MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK2',      TenKhoa: 'Khoa Công nghệ Thông tin', SiSoToiDa: 60 },
  { MaMH: 'CS201',   TenMH: 'Cấu trúc dữ liệu và giải thuật',   MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK1',      TenKhoa: 'Khoa Công nghệ Thông tin', SiSoToiDa: 50 },
  { MaMH: 'CS202',   TenMH: 'Cơ sở dữ liệu',                    MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK2',      TenKhoa: 'Khoa Công nghệ Thông tin', SiSoToiDa: 50 },
  { MaMH: 'CS203',   TenMH: 'Mạng máy tính',                    MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK1',      TenKhoa: 'Khoa Công nghệ Thông tin', SiSoToiDa: 50 },
  { MaMH: 'CS301',   TenMH: 'Hệ điều hành',                     MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK2',      TenKhoa: 'Khoa Công nghệ Thông tin', SiSoToiDa: 50 },
  { MaMH: 'CS302',   TenMH: 'Kỹ thuật phần mềm',                MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK1',      TenKhoa: 'Khoa Công nghệ Thông tin', SiSoToiDa: 50 },
  { MaMH: 'CS303',   TenMH: 'Lập trình web',                    MaLoaiMon: 'TH', SoTiet: 60, SoTinChi: 3, HocPhi: 2_250_000, HocKy: 'HK2',      TenKhoa: 'Khoa Công nghệ Thông tin', SiSoToiDa: 40 },
  { MaMH: 'CS401',   TenMH: 'Trí tuệ nhân tạo',                 MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK1',      TenKhoa: 'Khoa Công nghệ Thông tin', SiSoToiDa: 50 },
  { MaMH: 'CS402',   TenMH: 'An toàn thông tin',                MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK3 (Hè)', TenKhoa: 'Khoa Công nghệ Thông tin', SiSoToiDa: 40 },
  { MaMH: 'CS501',   TenMH: 'Thực tập CNTT',                    MaLoaiMon: 'TH', SoTiet: 90, SoTinChi: 3, HocPhi: 2_250_000, HocKy: 'HK3 (Hè)', TenKhoa: 'Khoa Công nghệ Thông tin', SiSoToiDa: 30 },
  { MaMH: 'MATH101', TenMH: 'Toán cao cấp A1',                  MaLoaiMon: 'LT', SoTiet: 60, SoTinChi: 4, HocPhi: 2_000_000, HocKy: 'HK1',      TenKhoa: 'Khoa Khoa học Cơ bản',     SiSoToiDa: 80 },
  { MaMH: 'MATH102', TenMH: 'Toán cao cấp A2',                  MaLoaiMon: 'LT', SoTiet: 60, SoTinChi: 4, HocPhi: 2_000_000, HocKy: 'HK2',      TenKhoa: 'Khoa Khoa học Cơ bản',     SiSoToiDa: 80 },
  { MaMH: 'PHYS101', TenMH: 'Vật lý đại cương',                 MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK1',      TenKhoa: 'Khoa Khoa học Cơ bản',     SiSoToiDa: 70 },
  { MaMH: 'ENG101',  TenMH: 'Tiếng Anh chuyên ngành CNTT',      MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK1',      TenKhoa: 'Khoa Ngoại ngữ',           SiSoToiDa: 50 },
];

// Lớp học phần: HK1 mở 8 môn, HK2 mở 5 môn, HK3 mở 3 môn
const HK1 = 'HK_2024_2025_1';
const HK2 = 'HK_2024_2025_2';
const HK3 = 'HK_2024_2025_3';

const MON_HOC_MO = [
  { MaHK: HK1, MaMH: 'CS101' },
  { MaHK: HK1, MaMH: 'CS201' },
  { MaHK: HK1, MaMH: 'CS203' },
  { MaHK: HK1, MaMH: 'CS302' },
  { MaHK: HK1, MaMH: 'CS401' },
  { MaHK: HK1, MaMH: 'MATH101' },
  { MaHK: HK1, MaMH: 'PHYS101' },
  { MaHK: HK1, MaMH: 'ENG101' },
  { MaHK: HK2, MaMH: 'CS102' },
  { MaHK: HK2, MaMH: 'CS202' },
  { MaHK: HK2, MaMH: 'CS301' },
  { MaHK: HK2, MaMH: 'CS303' },
  { MaHK: HK2, MaMH: 'MATH102' },
  { MaHK: HK3, MaMH: 'CS402' },
  { MaHK: HK3, MaMH: 'CS501' },
  { MaHK: HK3, MaMH: 'CS302' },
];

// Đăng ký: mỗi phần tử = { maSV, maMH, maHK }
// HK1: ~35 sv đăng ký 2-4 môn
const HK1_REGS = [];
for (const sv of STUDENTS) {
  // Tất cả đăng ký MATH101 và CS101
  HK1_REGS.push({ maSV: sv.MaSV, maMH: 'MATH101', maHK: HK1 });
  HK1_REGS.push({ maSV: sv.MaSV, maMH: 'CS101',   maHK: HK1 });
  // CNTT & KTMT đăng ký thêm CS201
  if (sv.MaNganh === 'NG_CNTT' || sv.MaNganh === 'NG_KTMT') {
    HK1_REGS.push({ maSV: sv.MaSV, maMH: 'CS201', maHK: HK1 });
  }
  // Một nửa đăng ký PHYS101
  if (parseInt(sv.MaSV.slice(-3)) % 2 === 1) {
    HK1_REGS.push({ maSV: sv.MaSV, maMH: 'PHYS101', maHK: HK1 });
  }
  // CNTT đăng ký ENG101
  if (sv.MaNganh === 'NG_CNTT' && parseInt(sv.MaSV.slice(-3)) <= 15) {
    HK1_REGS.push({ maSV: sv.MaSV, maMH: 'ENG101', maHK: HK1 });
  }
  // 10 sv đăng ký CS203
  if (parseInt(sv.MaSV.slice(-3)) % 4 === 1) {
    HK1_REGS.push({ maSV: sv.MaSV, maMH: 'CS203', maHK: HK1 });
  }
}

// HK2: 25 sv đăng ký
const HK2_REGS = [];
const hk2Students = STUDENTS.slice(0, 25);
for (const sv of hk2Students) {
  HK2_REGS.push({ maSV: sv.MaSV, maMH: 'CS102',   maHK: HK2 });
  HK2_REGS.push({ maSV: sv.MaSV, maMH: 'MATH102',  maHK: HK2 });
  if (sv.MaNganh === 'NG_CNTT') {
    HK2_REGS.push({ maSV: sv.MaSV, maMH: 'CS202', maHK: HK2 });
  }
  if (parseInt(sv.MaSV.slice(-3)) % 3 === 0) {
    HK2_REGS.push({ maSV: sv.MaSV, maMH: 'CS301', maHK: HK2 });
    HK2_REGS.push({ maSV: sv.MaSV, maMH: 'CS303', maHK: HK2 });
  }
}

// HK3: 12 sv
const HK3_REGS = [];
const hk3Students = STUDENTS.slice(0, 12);
for (const sv of hk3Students) {
  HK3_REGS.push({ maSV: sv.MaSV, maMH: 'CS402', maHK: HK3 });
  if (parseInt(sv.MaSV.slice(-3)) % 2 === 0) {
    HK3_REGS.push({ maSV: sv.MaSV, maMH: 'CS501', maHK: HK3 });
  }
}

const ALL_REGS = [...HK1_REGS, ...HK2_REGS, ...HK3_REGS];

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu phong phú...\n');
  const hash = await bcrypt.hash('363636', 10);

  // ── 1. MASTER DATA ──────────────────────────────────────────────────────────
  console.log('📦 Master data...');
  await prisma.huyen.createMany({ skipDuplicates: true, data: [
    { MaHuyen: 'HCM_Q1',  TenHuyen: 'Quận 1',          LaVungSauVungXa: false },
    { MaHuyen: 'HCM_BD',  TenHuyen: 'Bình Dương',       LaVungSauVungXa: false },
    { MaHuyen: 'HN_BA',   TenHuyen: 'Ba Đình',          LaVungSauVungXa: false },
    { MaHuyen: 'HN_HK',   TenHuyen: 'Hoàn Kiếm',        LaVungSauVungXa: false },
    { MaHuyen: 'DAN_HC',  TenHuyen: 'Hải Châu',         LaVungSauVungXa: false },
    { MaHuyen: 'CT_NT',   TenHuyen: 'Ninh Kiều',        LaVungSauVungXa: false },
    { MaHuyen: 'HUE_TP',  TenHuyen: 'Thành phố Huế',    LaVungSauVungXa: false },
    { MaHuyen: 'SL_DM',   TenHuyen: 'Đắk Mil',          LaVungSauVungXa: true  },
  ]});

  await prisma.queQuan.createMany({ skipDuplicates: true, data: [
    { MaQueQuan: 'QQ_HCM', TenTinh: 'TP. Hồ Chí Minh', MaHuyen: 'HCM_Q1'  },
    { MaQueQuan: 'QQ_HN',  TenTinh: 'Hà Nội',           MaHuyen: 'HN_BA'   },
    { MaQueQuan: 'QQ_DAN', TenTinh: 'Đà Nẵng',          MaHuyen: 'DAN_HC'  },
    { MaQueQuan: 'QQ_CT',  TenTinh: 'Cần Thơ',          MaHuyen: 'CT_NT'   },
    { MaQueQuan: 'QQ_HUE', TenTinh: 'Huế',              MaHuyen: 'HUE_TP'  },
    { MaQueQuan: 'QQ_SL',  TenTinh: 'Sơn La',           MaHuyen: 'SL_DM'   },
  ]});

  await prisma.doiTuongUuTien.createMany({ skipDuplicates: true, data: [
    { MaDoiTuong: 'DT_KHONG',           TenDoiTuong: 'Không thuộc đối tượng', TiLeGiamHocPhi: 0.0 },
    { MaDoiTuong: 'DT_TOPDAU',          TenDoiTuong: 'Học lực xuất sắc',      TiLeGiamHocPhi: 0.5 },
    { MaDoiTuong: 'DT_VUNGSAUVUNGXA',   TenDoiTuong: 'Vùng sâu vùng xa',      TiLeGiamHocPhi: 0.3 },
  ]});

  await prisma.nganhHoc.createMany({ skipDuplicates: true, data: [
    { MaNganh: 'NG_CNTT', TenNganh: 'Công nghệ Thông tin',  MaKhoa: 'KHOA_CNTT' },
    { MaNganh: 'NG_KTMT', TenNganh: 'Khoa học Máy tính',    MaKhoa: 'KHOA_CNTT' },
    { MaNganh: 'NG_HTTT', TenNganh: 'Hệ thống Thông tin',   MaKhoa: 'KHOA_CNTT' },
  ]});

  await prisma.loaiMon.createMany({ skipDuplicates: true, data: [
    { MaLoaiMon: 'LT', TenLoaiMon: 'Lý thuyết', HeSoTinChi: 1.0 },
    { MaLoaiMon: 'TH', TenLoaiMon: 'Thực hành', HeSoTinChi: 1.5 },
  ]});
  console.log('  ✓ Huyện, quê quán, ngành, đối tượng, loại môn\n');

  // ── 2. HỌC KỲ ───────────────────────────────────────────────────────────────
  console.log('📅 Học kỳ...');
  await prisma.hocKy.createMany({ skipDuplicates: true, data: [
    { MaHK: HK1, TenHK: 'HK1',      NamHoc: '2024-2025', LaHienTai: true,  NgayBatDau: d('2024-08-15'), NgayKetThuc: d('2024-12-31') },
    { MaHK: HK2, TenHK: 'HK2',      NamHoc: '2024-2025', LaHienTai: false, NgayBatDau: d('2025-01-15'), NgayKetThuc: d('2025-05-31') },
    { MaHK: HK3, TenHK: 'HK3 (Hè)', NamHoc: '2024-2025', LaHienTai: false, NgayBatDau: d('2025-06-15'), NgayKetThuc: d('2025-08-15') },
  ]});
  console.log('  ✓ 3 học kỳ 2024-2025\n');

  // ── 3. TÀI KHOẢN ────────────────────────────────────────────────────────────
  console.log('👤 Tài khoản...');
  await prisma.taiKhoan.upsert({ where: { Username: 'admin' },   update: { PasswordHash: hash }, create: { Username: 'admin',   PasswordHash: hash, HoTen: 'Quản trị viên',            Email: 'admin@gmail.com',    VaiTro: 'ADMIN'          }});
  await prisma.taiKhoan.upsert({ where: { Username: 'pdt' },     update: { PasswordHash: hash }, create: { Username: 'pdt',     PasswordHash: hash, HoTen: 'Nguyễn Văn Bình',         Email: 'pdt@gmail.com',      VaiTro: 'PHONG_DAO_TAO'  }});
  await prisma.taiKhoan.upsert({ where: { Username: 'ketoan' },  update: { PasswordHash: hash }, create: { Username: 'ketoan',  PasswordHash: hash, HoTen: 'Lê Thị Hồng',             Email: 'ketoan@gmail.com',   VaiTro: 'PHONG_TAI_CHINH'}});

  // Giảng viên
  const gvData = [
    { Username: 'gv_mai',   HoTen: 'Nguyễn Thị Mai',  Email: 'mai.nt@gmail.com',   profile: { NgaySinh: d('1985-03-12'), Khoa: 'Khoa Công nghệ Thông tin', BoMon: 'Bộ môn Khoa học Máy tính',    HocVi: 'Tiến sĩ',   HocHam: 'Giảng viên chính', NamCongTac: 2012, QuaTrinhCT: '2012-2018: Giảng viên Khoa CNTT, ĐH UIT\n2018-nay: Giảng viên chính, Trưởng BM Khoa học Máy tính' }},
    { Username: 'gv_hung',  HoTen: 'Trần Văn Hùng',   Email: 'hung.tv@gmail.com',  profile: { NgaySinh: d('1988-07-25'), Khoa: 'Khoa Công nghệ Thông tin', BoMon: 'Bộ môn Công nghệ Phần mềm', HocVi: 'Thạc sĩ',   HocHam: 'Giảng viên',       NamCongTac: 2015, QuaTrinhCT: '2015-nay: Giảng viên Khoa CNTT, ĐH UIT\nGiảng dạy các môn CTDL, Mạng máy tính, KTPM' }},
    { Username: 'gv_thu',   HoTen: 'Lê Thị Thu',      Email: 'thu.lt@gmail.com',   profile: { NgaySinh: d('1983-11-08'), Khoa: 'Khoa Khoa học Cơ bản',     BoMon: 'Bộ môn Toán học',           HocVi: 'Tiến sĩ',   HocHam: 'Phó Giáo sư',      NamCongTac: 2010, QuaTrinhCT: '2010-2016: Giảng viên BM Toán học\n2016-nay: Phó Giáo sư, chuyên ngành Toán ứng dụng' }},
    { Username: 'gv_duc',   HoTen: 'Phạm Văn Đức',    Email: 'duc.pv@gmail.com',   profile: { NgaySinh: d('1990-04-18'), Khoa: 'Khoa Ngoại ngữ',           BoMon: 'Bộ môn Tiếng Anh CN',      HocVi: 'Thạc sĩ',   HocHam: 'Giảng viên',       NamCongTac: 2018, QuaTrinhCT: '2018-nay: Giảng viên BM Tiếng Anh Chuyên ngành, Khoa Ngoại ngữ' }},
  ];

  const gvMaTKs = {};
  for (const gv of gvData) {
    const tk = await prisma.taiKhoan.upsert({
      where: { Username: gv.Username },
      update: { PasswordHash: hash },
      create: { Username: gv.Username, PasswordHash: hash, HoTen: gv.HoTen, Email: gv.Email, VaiTro: 'GIANG_VIEN' },
    });
    gvMaTKs[gv.Username] = tk.MaTK;
    await prisma.giangVienProfile.upsert({
      where: { MaTK: tk.MaTK },
      update: gv.profile,
      create: { MaTK: tk.MaTK, ...gv.profile },
    });
  }
  console.log(`  ✓ 3 staff + ${gvData.length} giảng viên\n`);

  // ── 4. SINH VIÊN ─────────────────────────────────────────────────────────────
  console.log('🎓 Sinh viên...');
  await prisma.sinhVien.createMany({
    skipDuplicates: true,
    data: STUDENTS.map((s) => ({ ...s, TrangThai: 'DANG_HOC' })),
  });
  console.log(`  ✓ ${STUDENTS.length} sinh viên (4 lớp, 3 ngành)\n`);

  // ── 5. MÔN HỌC ───────────────────────────────────────────────────────────────
  console.log('📚 Môn học...');
  await prisma.monHoc.createMany({
    skipDuplicates: true,
    data: COURSES.map((c) => ({ ...c, SiSoHienTai: 0 })),
  });
  console.log(`  ✓ ${COURSES.length} môn học\n`);

  // ── 6. LỚP HỌC PHẦN ──────────────────────────────────────────────────────────
  console.log('🏫 Lớp học phần...');
  await prisma.monHocMo.createMany({ skipDuplicates: true, data: MON_HOC_MO });
  console.log(`  ✓ ${MON_HOC_MO.length} lớp học phần\n`);

  // ── 7. PHÂN CÔNG GIẢNG VIÊN ──────────────────────────────────────────────────
  console.log('👨‍🏫 Phân công giảng viên...');
  const assignments = [
    { MaHK: HK1, MaMH: 'CS101',   Username: 'gv_mai'  },
    { MaHK: HK1, MaMH: 'CS201',   Username: 'gv_mai'  },
    { MaHK: HK1, MaMH: 'CS401',   Username: 'gv_mai'  },
    { MaHK: HK1, MaMH: 'CS203',   Username: 'gv_hung' },
    { MaHK: HK1, MaMH: 'CS302',   Username: 'gv_hung' },
    { MaHK: HK2, MaMH: 'CS102',   Username: 'gv_hung' },
    { MaHK: HK2, MaMH: 'CS202',   Username: 'gv_hung' },
    { MaHK: HK1, MaMH: 'MATH101', Username: 'gv_thu'  },
    { MaHK: HK1, MaMH: 'PHYS101', Username: 'gv_thu'  },
    { MaHK: HK2, MaMH: 'MATH102', Username: 'gv_thu'  },
    { MaHK: HK1, MaMH: 'ENG101',  Username: 'gv_duc'  },
    { MaHK: HK2, MaMH: 'CS303',   Username: 'gv_duc'  },
  ];
  for (const a of assignments) {
    const maTK = gvMaTKs[a.Username];
    if (!maTK) continue;
    await prisma.phanCongGiangDay.upsert({
      where: { MaHK_MaMH: { MaHK: a.MaHK, MaMH: a.MaMH } },
      update: { MaTK: maTK },
      create: { MaHK: a.MaHK, MaMH: a.MaMH, MaTK: maTK },
    });
  }
  console.log(`  ✓ ${assignments.length} phân công\n`);

  // ── 8. PHIẾU HỌC PHÍ (đăng ký môn) ─────────────────────────────────────────
  console.log('💰 Phiếu học phí...');
  const svMap = Object.fromEntries(STUDENTS.map((s) => [s.MaSV, s]));
  const courseMap = Object.fromEntries(COURSES.map((c) => [c.MaMH, c]));

  const phieuHocPhiData = ALL_REGS.map(({ maSV, maMH, maHK }) => {
    const sv = svMap[maSV];
    const course = courseMap[maMH];
    const goc = Number(course.HocPhi);
    const phaiDong = discount(sv.MaDoiTuong, goc);
    // Ngày lập: đầu học kỳ
    const ngay = maHK === HK1 ? d('2024-08-16') : maHK === HK2 ? d('2025-01-16') : d('2025-06-16');
    return {
      MaPhieu: `HP_${maHK.slice(-1)}_${maSV}_${maMH}`,
      MaSV: maSV,
      MaMH: maMH,
      MaHK: maHK,
      SoTienDangKy: goc,
      SoTienPhaiDong: phaiDong,
      HanDong: maHK === HK1 ? d('2024-11-30') : maHK === HK2 ? d('2025-04-30') : d('2025-07-30'),
      NgayLap: ngay,
    };
  });

  await prisma.phieuHocPhi.createMany({ skipDuplicates: true, data: phieuHocPhiData });
  console.log(`  ✓ ${phieuHocPhiData.length} phiếu học phí\n`);

  // ── 9. CẬP NHẬT SĨ SỐ HIỆN TẠI ──────────────────────────────────────────────
  console.log('📊 Cập nhật sĩ số...');
  const countByCourse = {};
  for (const r of ALL_REGS) {
    countByCourse[r.maMH] = (countByCourse[r.maMH] ?? 0) + 1;
  }
  for (const [maMH, count] of Object.entries(countByCourse)) {
    await prisma.monHoc.update({ where: { MaMH: maMH }, data: { SiSoHienTai: count } });
  }
  console.log('  ✓ SiSoHienTai cập nhật\n');

  // ── 10. PHIẾU THU ─────────────────────────────────────────────────────────────
  console.log('🧾 Phiếu thu...');
  // Tính tổng phải đóng mỗi SV mỗi HK
  const tongPhaiDong = {};
  for (const p of phieuHocPhiData) {
    const key = `${p.MaSV}_${p.MaHK}`;
    tongPhaiDong[key] = (tongPhaiDong[key] ?? 0) + p.SoTienPhaiDong;
  }

  const phieuThuData = [];
  let ptIdx = 1;
  for (const [key, tong] of Object.entries(tongPhaiDong)) {
    const [maSV, maHK] = key.split('_HK_2024_2025_');
    const fullMaHK = `HK_2024_2025_${maHK}`;
    const idx = parseInt(maSV.slice(-3));

    // HK2 & HK3: đã kết thúc → tất cả đóng đủ
    if (fullMaHK === HK2 || fullMaHK === HK3) {
      phieuThuData.push({
        MaPhieuThu: `PT${String(ptIdx++).padStart(4, '0')}`,
        MaSV: maSV, MaHK: fullMaHK,
        SoTienThu: tong,
        NgayThu: fullMaHK === HK2 ? d('2025-03-10') : d('2025-06-20'),
        GhiChu: 'Đóng đủ học phí học kỳ',
      });
      continue;
    }

    // HK1 (hiện tại): phân chia trạng thái
    if (idx % 5 === 0) continue; // ~20% chưa đóng

    if (idx % 3 === 0) {
      // ~27% đóng 1 phần (2 đợt)
      const dot1 = Math.round(tong * 0.5);
      phieuThuData.push({
        MaPhieuThu: `PT${String(ptIdx++).padStart(4, '0')}`,
        MaSV: maSV, MaHK: fullMaHK,
        SoTienThu: dot1,
        NgayThu: d('2024-09-15'),
        GhiChu: 'Đóng đợt 1 (50%)',
      });
    } else {
      // ~53% đóng đủ
      phieuThuData.push({
        MaPhieuThu: `PT${String(ptIdx++).padStart(4, '0')}`,
        MaSV: maSV, MaHK: fullMaHK,
        SoTienThu: tong,
        NgayThu: d('2024-09-20'),
        GhiChu: 'Đóng đủ học phí học kỳ 1',
      });
    }
  }

  await prisma.phieuThu.createMany({ skipDuplicates: true, data: phieuThuData });
  console.log(`  ✓ ${phieuThuData.length} phiếu thu\n`);

  // ── 11. THAM SỐ HỆ THỐNG ─────────────────────────────────────────────────────
  console.log('⚙️  Tham số hệ thống...');
  const thamSos = [
    { TenThamSo: 'don_gia_tin_chi',             GiaTri: '500000', KieuDuLieu: 'number', MoTa: 'Đơn giá / 1 tín chỉ (VND)' },
    { TenThamSo: 'he_so_lt',                    GiaTri: '1.0',    KieuDuLieu: 'number', MoTa: 'Hệ số môn lý thuyết' },
    { TenThamSo: 'he_so_th',                    GiaTri: '1.5',    KieuDuLieu: 'number', MoTa: 'Hệ số môn thực hành' },
    { TenThamSo: 'ti_le_mien_giam_top_dau',     GiaTri: '0.5',    KieuDuLieu: 'number', MoTa: 'Tỉ lệ miễn giảm học lực xuất sắc' },
    { TenThamSo: 'ti_le_mien_giam_vung_sau_xa', GiaTri: '0.3',    KieuDuLieu: 'number', MoTa: 'Tỉ lệ miễn giảm vùng sâu vùng xa' },
    { TenThamSo: 'si_so_toi_da_mac_dinh',       GiaTri: '50',     KieuDuLieu: 'number', MoTa: 'Sĩ số tối đa mặc định' },
  ];
  for (const ts of thamSos) {
    await prisma.thamSo.upsert({ where: { TenThamSo: ts.TenThamSo }, update: { GiaTri: ts.GiaTri }, create: ts });
  }
  console.log('  ✓ 6 tham số\n');

  // ── TỔNG KẾT ─────────────────────────────────────────────────────────────────
  console.log('✅ Seed hoàn tất!\n');
  console.log('📋 Tài khoản (mật khẩu: 363636)');
  console.log('  admin    — Quản trị viên');
  console.log('  pdt      — Phòng Đào tạo');
  console.log('  ketoan   — Phòng Tài chính');
  console.log('  gv_mai   — Giảng viên TS. Nguyễn Thị Mai');
  console.log('  gv_hung  — Giảng viên ThS. Trần Văn Hùng');
  console.log('  gv_thu   — Giảng viên TS. Lê Thị Thu (Phó GS)');
  console.log('  gv_duc   — Giảng viên ThS. Phạm Văn Đức\n');
  console.log(`📊 Thống kê:`);
  console.log(`  • ${STUDENTS.length} sinh viên, 3 ngành, 4 lớp`);
  console.log(`  • ${COURSES.length} môn học, ${MON_HOC_MO.length} lớp học phần`);
  console.log(`  • ${assignments.length} phân công giảng dạy`);
  console.log(`  • ${phieuHocPhiData.length} phiếu học phí`);
  console.log(`  • ${phieuThuData.length} phiếu thu (HK1: ~53% đủ / 27% 1 phần / 20% chưa đóng)`);
}

main()
  .catch((e) => { console.error('❌ Seed thất bại:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
