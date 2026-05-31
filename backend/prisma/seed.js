/**
 * Seed dá»¯ liá»‡u demo phong phÃº â€” cháº¡y: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function discount(maDT, price) {
  const rates = { DT_KHONG: 0, DT_TOPDAU: 0.5, DT_VUNGSAUVUNGXA: 0.3 };
  return Math.round(price * (1 - (rates[maDT] ?? 0)));
}
function d(str) { return new Date(str); }

// â”€â”€ raw data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STUDENTS = [
  // CNTT22-1
  { MaSV: '22521001', TenSV: 'Nguyá»…n VÄƒn An',      NgaySinh: d('2004-03-15'), GioiTinh: 'Nam', TenLop: 'CNTT22-1', Email: 'an.22521001@gmail.com',       MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521002', TenSV: 'Tráº§n Thá»‹ BÃ¬nh',       NgaySinh: d('2004-07-22'), GioiTinh: 'Nu',  TenLop: 'CNTT22-1', Email: 'binh.22521002@gmail.com',     MaQueQuan: 'QQ_HN',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521003', TenSV: 'LÃª VÄƒn CÆ°á»ng',        NgaySinh: d('2004-01-08'), GioiTinh: 'Nam', TenLop: 'CNTT22-1', Email: 'cuong.22521003@gmail.com',    MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_TOPDAU',         MaNganh: 'NG_CNTT' },
  { MaSV: '22521004', TenSV: 'Pháº¡m Thá»‹ DuyÃªn',      NgaySinh: d('2004-11-30'), GioiTinh: 'Nu',  TenLop: 'CNTT22-1', Email: 'duyen.22521004@gmail.com',    MaQueQuan: 'QQ_DAN', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521005', TenSV: 'HoÃ ng VÄƒn Em',        NgaySinh: d('2004-05-18'), GioiTinh: 'Nam', TenLop: 'CNTT22-1', Email: 'em.22521005@gmail.com',       MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521006', TenSV: 'NgÃ´ Thá»‹ PhÆ°Æ¡ng',      NgaySinh: d('2004-09-14'), GioiTinh: 'Nu',  TenLop: 'CNTT22-1', Email: 'phuong.22521006@gmail.com',   MaQueQuan: 'QQ_HN',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521007', TenSV: 'VÅ© VÄƒn Giang',        NgaySinh: d('2004-02-25'), GioiTinh: 'Nam', TenLop: 'CNTT22-1', Email: 'giang.22521007@gmail.com',    MaQueQuan: 'QQ_SL',  MaDoiTuong: 'DT_VUNGSAUVUNGXA',  MaNganh: 'NG_CNTT' },
  { MaSV: '22521008', TenSV: 'Äáº·ng Thá»‹ Hoa',        NgaySinh: d('2004-06-03'), GioiTinh: 'Nu',  TenLop: 'CNTT22-1', Email: 'hoa.22521008@gmail.com',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521009', TenSV: 'BÃ¹i VÄƒn Háº£i',         NgaySinh: d('2004-12-20'), GioiTinh: 'Nam', TenLop: 'CNTT22-1', Email: 'hai.22521009@gmail.com',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_TOPDAU',         MaNganh: 'NG_CNTT' },
  { MaSV: '22521010', TenSV: 'Äá»— Thá»‹ Lan',          NgaySinh: d('2004-04-11'), GioiTinh: 'Nu',  TenLop: 'CNTT22-1', Email: 'lan.22521010@gmail.com',      MaQueQuan: 'QQ_HUE', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  // CNTT22-2
  { MaSV: '22521011', TenSV: 'Há»“ VÄƒn Minh',         NgaySinh: d('2004-08-07'), GioiTinh: 'Nam', TenLop: 'CNTT22-2', Email: 'minh.22521011@gmail.com',     MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521012', TenSV: 'Nguyá»…n Thá»‹ Nga',      NgaySinh: d('2004-03-29'), GioiTinh: 'Nu',  TenLop: 'CNTT22-2', Email: 'nga.22521012@gmail.com',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521013', TenSV: 'Tráº§n VÄƒn QuÃ¢n',       NgaySinh: d('2004-10-16'), GioiTinh: 'Nam', TenLop: 'CNTT22-2', Email: 'quan.22521013@gmail.com',     MaQueQuan: 'QQ_HN',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521014', TenSV: 'LÃª Thá»‹ Sen',          NgaySinh: d('2004-01-31'), GioiTinh: 'Nu',  TenLop: 'CNTT22-2', Email: 'sen.22521014@gmail.com',      MaQueQuan: 'QQ_DAN', MaDoiTuong: 'DT_TOPDAU',         MaNganh: 'NG_CNTT' },
  { MaSV: '22521015', TenSV: 'Pháº¡m VÄƒn Tháº¯ng',      NgaySinh: d('2004-07-05'), GioiTinh: 'Nam', TenLop: 'CNTT22-2', Email: 'thang.22521015@gmail.com',    MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521016', TenSV: 'HoÃ ng Thá»‹ Tháº£o',      NgaySinh: d('2004-09-23'), GioiTinh: 'Nu',  TenLop: 'CNTT22-2', Email: 'thao.22521016@gmail.com',     MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521017', TenSV: 'Phan VÄƒn Trung',      NgaySinh: d('2004-02-14'), GioiTinh: 'Nam', TenLop: 'CNTT22-2', Email: 'trung.22521017@gmail.com',    MaQueQuan: 'QQ_CT',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521018', TenSV: 'VÅ© Thá»‹ UyÃªn',         NgaySinh: d('2004-06-19'), GioiTinh: 'Nu',  TenLop: 'CNTT22-2', Email: 'uyen.22521018@gmail.com',     MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521019', TenSV: 'Äáº·ng VÄƒn Viá»‡t',       NgaySinh: d('2004-11-02'), GioiTinh: 'Nam', TenLop: 'CNTT22-2', Email: 'viet.22521019@gmail.com',     MaQueQuan: 'QQ_HN',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  { MaSV: '22521020', TenSV: 'BÃ¹i Thá»‹ XuÃ¢n',        NgaySinh: d('2004-04-28'), GioiTinh: 'Nu',  TenLop: 'CNTT22-2', Email: 'xuan.22521020@gmail.com',     MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_CNTT' },
  // KTMT22-1
  { MaSV: '22522001', TenSV: 'Äinh VÄƒn Anh',        NgaySinh: d('2004-05-10'), GioiTinh: 'Nam', TenLop: 'KTMT22-1', Email: 'anh.22522001@gmail.com',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_KTMT' },
  { MaSV: '22522002', TenSV: 'Há»“ Thá»‹ Báº£o',          NgaySinh: d('2004-08-14'), GioiTinh: 'Nu',  TenLop: 'KTMT22-1', Email: 'bao.22522002@gmail.com',      MaQueQuan: 'QQ_HN',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_KTMT' },
  { MaSV: '22522003', TenSV: 'NgÃ´ VÄƒn Chiáº¿n',       NgaySinh: d('2004-01-27'), GioiTinh: 'Nam', TenLop: 'KTMT22-1', Email: 'chien.22522003@gmail.com',    MaQueQuan: 'QQ_DAN', MaDoiTuong: 'DT_TOPDAU',         MaNganh: 'NG_KTMT' },
  { MaSV: '22522004', TenSV: 'DÆ°Æ¡ng Thá»‹ Diá»‡u',      NgaySinh: d('2004-11-06'), GioiTinh: 'Nu',  TenLop: 'KTMT22-1', Email: 'dieu.22522004@gmail.com',     MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_KTMT' },
  { MaSV: '22522005', TenSV: 'LÃ½ VÄƒn Äá»©c',          NgaySinh: d('2004-03-21'), GioiTinh: 'Nam', TenLop: 'KTMT22-1', Email: 'duc.22522005@gmail.com',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_KTMT' },
  { MaSV: '22522006', TenSV: 'Äinh Thá»‹ Giang',      NgaySinh: d('2004-07-09'), GioiTinh: 'Nu',  TenLop: 'KTMT22-1', Email: 'giang.22522006@gmail.com',    MaQueQuan: 'QQ_CT',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_KTMT' },
  { MaSV: '22522007', TenSV: 'Há»“ VÄƒn Hiáº¿u',         NgaySinh: d('2004-12-15'), GioiTinh: 'Nam', TenLop: 'KTMT22-1', Email: 'hieu.22522007@gmail.com',     MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_KTMT' },
  { MaSV: '22522008', TenSV: 'NgÃ´ Thá»‹ Kim',         NgaySinh: d('2004-04-30'), GioiTinh: 'Nu',  TenLop: 'KTMT22-1', Email: 'kim.22522008@gmail.com',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_KTMT' },
  { MaSV: '22522009', TenSV: 'DÆ°Æ¡ng VÄƒn LÃ¢m',       NgaySinh: d('2004-09-08'), GioiTinh: 'Nam', TenLop: 'KTMT22-1', Email: 'lam.22522009@gmail.com',      MaQueQuan: 'QQ_HN',  MaDoiTuong: 'DT_TOPDAU',         MaNganh: 'NG_KTMT' },
  { MaSV: '22522010', TenSV: 'LÃ½ Thá»‹ Má»¹',           NgaySinh: d('2004-02-17'), GioiTinh: 'Nu',  TenLop: 'KTMT22-1', Email: 'my.22522010@gmail.com',       MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_KTMT' },
  // HTTT22-1
  { MaSV: '22523001', TenSV: 'TrÆ°Æ¡ng VÄƒn Nam',      NgaySinh: d('2004-06-24'), GioiTinh: 'Nam', TenLop: 'HTTT22-1', Email: 'nam.22523001@gmail.com',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_HTTT' },
  { MaSV: '22523002', TenSV: 'VÃµ Thá»‹ Oanh',         NgaySinh: d('2004-10-03'), GioiTinh: 'Nu',  TenLop: 'HTTT22-1', Email: 'oanh.22523002@gmail.com',     MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_HTTT' },
  { MaSV: '22523003', TenSV: 'Mai VÄƒn PhÃ¡t',        NgaySinh: d('2004-01-19'), GioiTinh: 'Nam', TenLop: 'HTTT22-1', Email: 'phat.22523003@gmail.com',     MaQueQuan: 'QQ_DAN', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_HTTT' },
  { MaSV: '22523004', TenSV: 'LÃ¢m Thá»‹ Quá»³nh',      NgaySinh: d('2004-08-26'), GioiTinh: 'Nu',  TenLop: 'HTTT22-1', Email: 'quynh.22523004@gmail.com',    MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_TOPDAU',         MaNganh: 'NG_HTTT' },
  { MaSV: '22523005', TenSV: 'TrÆ°Æ¡ng VÄƒn Ráº¡ng',     NgaySinh: d('2004-04-12'), GioiTinh: 'Nam', TenLop: 'HTTT22-1', Email: 'rang.22523005@gmail.com',     MaQueQuan: 'QQ_CT',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_HTTT' },
  { MaSV: '22523006', TenSV: 'VÃµ Thá»‹ SÆ°Æ¡ng',        NgaySinh: d('2004-11-28'), GioiTinh: 'Nu',  TenLop: 'HTTT22-1', Email: 'suong.22523006@gmail.com',    MaQueQuan: 'QQ_HN',  MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_HTTT' },
  { MaSV: '22523007', TenSV: 'Mai VÄƒn TÃ i',         NgaySinh: d('2004-07-16'), GioiTinh: 'Nam', TenLop: 'HTTT22-1', Email: 'tai.22523007@gmail.com',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_HTTT' },
  { MaSV: '22523008', TenSV: 'LÃ¢m Thá»‹ Tuyáº¿t',      NgaySinh: d('2004-03-05'), GioiTinh: 'Nu',  TenLop: 'HTTT22-1', Email: 'tuyet.22523008@gmail.com',    MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_HTTT' },
  { MaSV: '22523009', TenSV: 'TrÆ°Æ¡ng VÄƒn Uy',       NgaySinh: d('2004-09-21'), GioiTinh: 'Nam', TenLop: 'HTTT22-1', Email: 'uy.22523009@gmail.com',       MaQueQuan: 'QQ_DAN', MaDoiTuong: 'DT_KHONG',          MaNganh: 'NG_HTTT' },
  { MaSV: '22523010', TenSV: 'VÃµ Thá»‹ Vui',          NgaySinh: d('2004-05-07'), GioiTinh: 'Nu',  TenLop: 'HTTT22-1', Email: 'vui.22523010@gmail.com',      MaQueQuan: 'QQ_HCM', MaDoiTuong: 'DT_TOPDAU',         MaNganh: 'NG_HTTT' },
];

const COURSES = [
  // HocPhi = SoTinChi * DonGiaTinChi (QÄ2/QÄ5: LT=27.000Ä‘/TC, TH=37.000Ä‘/TC)
  { MaMH: 'CS101',   TenMH: 'Nháº­p mÃ´n láº­p trÃ¬nh',               MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 81_000,  HocKy: 'HK1',      TenKhoa: 'Khoa CÃ´ng nghá»‡ ThÃ´ng tin', SiSoToiDa: 60 },
  { MaMH: 'CS102',   TenMH: 'Láº­p trÃ¬nh hÆ°á»›ng Ä‘á»‘i tÆ°á»£ng',        MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 81_000,  HocKy: 'HK2',      TenKhoa: 'Khoa CÃ´ng nghá»‡ ThÃ´ng tin', SiSoToiDa: 60 },
  { MaMH: 'CS201',   TenMH: 'Cáº¥u trÃºc dá»¯ liá»‡u vÃ  giáº£i thuáº­t',   MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 81_000,  HocKy: 'HK1',      TenKhoa: 'Khoa CÃ´ng nghá»‡ ThÃ´ng tin', SiSoToiDa: 50 },
  { MaMH: 'CS202',   TenMH: 'CÆ¡ sá»Ÿ dá»¯ liá»‡u',                    MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 81_000,  HocKy: 'HK2',      TenKhoa: 'Khoa CÃ´ng nghá»‡ ThÃ´ng tin', SiSoToiDa: 50 },
  { MaMH: 'CS203',   TenMH: 'Máº¡ng mÃ¡y tÃ­nh',                    MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 81_000,  HocKy: 'HK1',      TenKhoa: 'Khoa CÃ´ng nghá»‡ ThÃ´ng tin', SiSoToiDa: 50 },
  { MaMH: 'CS301',   TenMH: 'Há»‡ Ä‘iá»u hÃ nh',                     MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 81_000,  HocKy: 'HK2',      TenKhoa: 'Khoa CÃ´ng nghá»‡ ThÃ´ng tin', SiSoToiDa: 50 },
  { MaMH: 'CS302',   TenMH: 'Ká»¹ thuáº­t pháº§n má»m',                MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 81_000,  HocKy: 'HK1',      TenKhoa: 'Khoa CÃ´ng nghá»‡ ThÃ´ng tin', SiSoToiDa: 50 },
  { MaMH: 'CS303',   TenMH: 'Láº­p trÃ¬nh web',                    MaLoaiMon: 'TH', SoTiet: 60, SoTinChi: 2, HocPhi: 74_000,  HocKy: 'HK2',      TenKhoa: 'Khoa CÃ´ng nghá»‡ ThÃ´ng tin', SiSoToiDa: 40 },
  { MaMH: 'CS401',   TenMH: 'TrÃ­ tuá»‡ nhÃ¢n táº¡o',                 MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 81_000,  HocKy: 'HK1',      TenKhoa: 'Khoa CÃ´ng nghá»‡ ThÃ´ng tin', SiSoToiDa: 50 },
  { MaMH: 'CS402',   TenMH: 'An toÃ n thÃ´ng tin',                MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 81_000,  HocKy: 'HK3 (HÃ¨)', TenKhoa: 'Khoa CÃ´ng nghá»‡ ThÃ´ng tin', SiSoToiDa: 40 },
  { MaMH: 'CS501',   TenMH: 'Thá»±c táº­p CNTT',                    MaLoaiMon: 'TH', SoTiet: 90, SoTinChi: 3, HocPhi: 111_000, HocKy: 'HK3 (HÃ¨)', TenKhoa: 'Khoa CÃ´ng nghá»‡ ThÃ´ng tin', SiSoToiDa: 30 },
  { MaMH: 'MATH101', TenMH: 'ToÃ¡n cao cáº¥p A1',                  MaLoaiMon: 'LT', SoTiet: 60, SoTinChi: 4, HocPhi: 108_000, HocKy: 'HK1',      TenKhoa: 'Khoa Khoa há»c CÆ¡ báº£n',     SiSoToiDa: 80 },
  { MaMH: 'MATH102', TenMH: 'ToÃ¡n cao cáº¥p A2',                  MaLoaiMon: 'LT', SoTiet: 60, SoTinChi: 4, HocPhi: 108_000, HocKy: 'HK2',      TenKhoa: 'Khoa Khoa há»c CÆ¡ báº£n',     SiSoToiDa: 80 },
  { MaMH: 'PHYS101', TenMH: 'Váº­t lÃ½ Ä‘áº¡i cÆ°Æ¡ng',                 MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 81_000,  HocKy: 'HK1',      TenKhoa: 'Khoa Khoa há»c CÆ¡ báº£n',     SiSoToiDa: 70 },
  { MaMH: 'ENG101',  TenMH: 'Tiáº¿ng Anh chuyÃªn ngÃ nh CNTT',      MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 81_000,  HocKy: 'HK1',      TenKhoa: 'Khoa Ngoáº¡i ngá»¯',           SiSoToiDa: 50 },
];

// Lá»›p há»c pháº§n: HK1 má»Ÿ 8 mÃ´n, HK2 má»Ÿ 5 mÃ´n, HK3 má»Ÿ 3 mÃ´n
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

// ÄÄƒng kÃ½: má»—i pháº§n tá»­ = { maSV, maMH, maHK }
// HK1: ~35 sv Ä‘Äƒng kÃ½ 2-4 mÃ´n
const HK1_REGS = [];
for (const sv of STUDENTS) {
  // Táº¥t cáº£ Ä‘Äƒng kÃ½ MATH101 vÃ  CS101
  HK1_REGS.push({ maSV: sv.MaSV, maMH: 'MATH101', maHK: HK1 });
  HK1_REGS.push({ maSV: sv.MaSV, maMH: 'CS101',   maHK: HK1 });
  // CNTT & KTMT Ä‘Äƒng kÃ½ thÃªm CS201
  if (sv.MaNganh === 'NG_CNTT' || sv.MaNganh === 'NG_KTMT') {
    HK1_REGS.push({ maSV: sv.MaSV, maMH: 'CS201', maHK: HK1 });
  }
  // Má»™t ná»­a Ä‘Äƒng kÃ½ PHYS101
  if (parseInt(sv.MaSV.slice(-3)) % 2 === 1) {
    HK1_REGS.push({ maSV: sv.MaSV, maMH: 'PHYS101', maHK: HK1 });
  }
  // CNTT Ä‘Äƒng kÃ½ ENG101
  if (sv.MaNganh === 'NG_CNTT' && parseInt(sv.MaSV.slice(-3)) <= 15) {
    HK1_REGS.push({ maSV: sv.MaSV, maMH: 'ENG101', maHK: HK1 });
  }
  // 10 sv Ä‘Äƒng kÃ½ CS203
  if (parseInt(sv.MaSV.slice(-3)) % 4 === 1) {
    HK1_REGS.push({ maSV: sv.MaSV, maMH: 'CS203', maHK: HK1 });
  }
}

// HK2: 25 sv Ä‘Äƒng kÃ½
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

// â”€â”€ main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function main() {
  console.log('ðŸŒ± Báº¯t Ä‘áº§u seed dá»¯ liá»‡u phong phÃº...\n');
  const hash = await bcrypt.hash('363636', 10);

  // â”€â”€ 1. MASTER DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('ðŸ“¦ Master data...');
  await prisma.huyen.createMany({ skipDuplicates: true, data: [
    { MaHuyen: 'HCM_Q1',  TenHuyen: 'Quáº­n 1',          LaVungSauVungXa: false },
    { MaHuyen: 'HCM_BD',  TenHuyen: 'BÃ¬nh DÆ°Æ¡ng',       LaVungSauVungXa: false },
    { MaHuyen: 'HN_BA',   TenHuyen: 'Ba ÄÃ¬nh',          LaVungSauVungXa: false },
    { MaHuyen: 'HN_HK',   TenHuyen: 'HoÃ n Kiáº¿m',        LaVungSauVungXa: false },
    { MaHuyen: 'DAN_HC',  TenHuyen: 'Háº£i ChÃ¢u',         LaVungSauVungXa: false },
    { MaHuyen: 'CT_NT',   TenHuyen: 'Ninh Kiá»u',        LaVungSauVungXa: false },
    { MaHuyen: 'HUE_TP',  TenHuyen: 'ThÃ nh phá»‘ Huáº¿',    LaVungSauVungXa: false },
    { MaHuyen: 'SL_DM',   TenHuyen: 'Äáº¯k Mil',          LaVungSauVungXa: true  },
  ]});

  await prisma.queQuan.createMany({ skipDuplicates: true, data: [
    { MaQueQuan: 'QQ_HCM', TenTinh: 'TP. Há»“ ChÃ­ Minh', MaHuyen: 'HCM_Q1'  },
    { MaQueQuan: 'QQ_HN',  TenTinh: 'HÃ  Ná»™i',           MaHuyen: 'HN_BA'   },
    { MaQueQuan: 'QQ_DAN', TenTinh: 'ÄÃ  Náºµng',          MaHuyen: 'DAN_HC'  },
    { MaQueQuan: 'QQ_CT',  TenTinh: 'Cáº§n ThÆ¡',          MaHuyen: 'CT_NT'   },
    { MaQueQuan: 'QQ_HUE', TenTinh: 'Huáº¿',              MaHuyen: 'HUE_TP'  },
    { MaQueQuan: 'QQ_SL',  TenTinh: 'SÆ¡n La',           MaHuyen: 'SL_DM'   },
  ]});

  await prisma.doiTuongUuTien.createMany({ skipDuplicates: true, data: [
    { MaDoiTuong: 'DT_KHONG',           TenDoiTuong: 'KhÃ´ng thuá»™c Ä‘á»‘i tÆ°á»£ng', TiLeGiamHocPhi: 0.0 },
    { MaDoiTuong: 'DT_TOPDAU',          TenDoiTuong: 'Há»c lá»±c xuáº¥t sáº¯c',      TiLeGiamHocPhi: 0.5 },
    { MaDoiTuong: 'DT_VUNGSAUVUNGXA',   TenDoiTuong: 'VÃ¹ng sÃ¢u vÃ¹ng xa',      TiLeGiamHocPhi: 0.3 },
  ]});

  await prisma.khoa.createMany({ skipDuplicates: true, data: [
    { MaKhoa: 'KHOA_CNTT',     TenKhoa: 'Khoa CÃ´ng nghá»‡ ThÃ´ng tin'           },
    { MaKhoa: 'KHOA_KHCB',     TenKhoa: 'Khoa Khoa há»c CÆ¡ báº£n'               },
    { MaKhoa: 'KHOA_NGOAINGU', TenKhoa: 'Khoa Ngoáº¡i ngá»¯'                      },
    { MaKhoa: 'KHOA_KTHT',     TenKhoa: 'Khoa Ká»¹ thuáº­t Há»‡ thá»‘ng'             },
  ]});

  await prisma.nganhHoc.createMany({ skipDuplicates: true, data: [
    { MaNganh: 'NG_CNTT', TenNganh: 'CÃ´ng nghá»‡ ThÃ´ng tin',           MaKhoa: 'KHOA_CNTT' },
    { MaNganh: 'NG_KTMT', TenNganh: 'Khoa há»c MÃ¡y tÃ­nh',             MaKhoa: 'KHOA_CNTT' },
    { MaNganh: 'NG_HTTT', TenNganh: 'Há»‡ thá»‘ng ThÃ´ng tin',            MaKhoa: 'KHOA_CNTT' },
    { MaNganh: 'NG_KTPM', TenNganh: 'Ká»¹ thuáº­t Pháº§n má»m',             MaKhoa: 'KHOA_CNTT' },
    { MaNganh: 'NG_MMTT', TenNganh: 'Máº¡ng mÃ¡y tÃ­nh vÃ  Truyá»n thÃ´ng', MaKhoa: 'KHOA_CNTT' },
    { MaNganh: 'NG_KHDL', TenNganh: 'Khoa há»c Dá»¯ liá»‡u',              MaKhoa: 'KHOA_CNTT' },
    { MaNganh: 'NG_ATTT', TenNganh: 'An toÃ n ThÃ´ng tin',             MaKhoa: 'KHOA_CNTT' },
  ]});

  await prisma.loaiMon.createMany({ skipDuplicates: true, data: [
    { MaLoaiMon: 'LT', TenLoaiMon: 'LÃ½ thuyáº¿t', HeSoTinChi: 1.0 },
    { MaLoaiMon: 'TH', TenLoaiMon: 'Thá»±c hÃ nh', HeSoTinChi: 1.5 },
  ]});
  console.log('  âœ“ Huyá»‡n, quÃª quÃ¡n, ngÃ nh, Ä‘á»‘i tÆ°á»£ng, loáº¡i mÃ´n\n');

  // â”€â”€ 2. Há»ŒC Ká»² â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('ðŸ“… Há»c ká»³...');
  await prisma.hocKy.createMany({ skipDuplicates: true, data: [
    { MaHK: HK1, TenHK: 'HK1',      NamHoc: '2024-2025', LaHienTai: true,  NgayBatDau: d('2024-08-15'), NgayKetThuc: d('2024-12-31') },
    { MaHK: HK2, TenHK: 'HK2',      NamHoc: '2024-2025', LaHienTai: false, NgayBatDau: d('2025-01-15'), NgayKetThuc: d('2025-05-31') },
    { MaHK: HK3, TenHK: 'HK3 (HÃ¨)', NamHoc: '2024-2025', LaHienTai: false, NgayBatDau: d('2025-06-15'), NgayKetThuc: d('2025-08-15') },
  ]});
  console.log('  âœ“ 3 há»c ká»³ 2024-2025\n');

  // â”€â”€ 3. TÃ€I KHOáº¢N â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('ðŸ‘¤ TÃ i khoáº£n...');
  await prisma.taiKhoan.upsert({ where: { Username: 'admin' },   update: { PasswordHash: hash }, create: { Username: 'admin',   PasswordHash: hash, HoTen: 'Quáº£n trá»‹ viÃªn',            Email: 'admin@gmail.com',    VaiTro: 'ADMIN'          }});
  await prisma.taiKhoan.upsert({ where: { Username: 'pdt' },     update: { PasswordHash: hash }, create: { Username: 'pdt',     PasswordHash: hash, HoTen: 'Nguyá»…n VÄƒn BÃ¬nh',         Email: 'pdt@gmail.com',      VaiTro: 'PHONG_DAO_TAO'  }});
  await prisma.taiKhoan.upsert({ where: { Username: 'ketoan' },  update: { PasswordHash: hash }, create: { Username: 'ketoan',  PasswordHash: hash, HoTen: 'LÃª Thá»‹ Há»“ng',             Email: 'ketoan@gmail.com',   VaiTro: 'PHONG_TAI_CHINH'}});

  // Giáº£ng viÃªn
  const gvData = [
    { Username: 'gv_mai',   HoTen: 'Nguyá»…n Thá»‹ Mai',  Email: 'mai.nt@gmail.com',   profile: { NgaySinh: d('1985-03-12'), Khoa: 'Khoa CÃ´ng nghá»‡ ThÃ´ng tin', BoMon: 'Bá»™ mÃ´n Khoa há»c MÃ¡y tÃ­nh',    HocVi: 'Tiáº¿n sÄ©',   HocHam: 'Giáº£ng viÃªn chÃ­nh', NamCongTac: 2012, QuaTrinhCT: '2012-2018: Giáº£ng viÃªn Khoa CNTT, ÄH UIT\n2018-nay: Giáº£ng viÃªn chÃ­nh, TrÆ°á»Ÿng BM Khoa há»c MÃ¡y tÃ­nh' }},
    { Username: 'gv_hung',  HoTen: 'Tráº§n VÄƒn HÃ¹ng',   Email: 'hung.tv@gmail.com',  profile: { NgaySinh: d('1988-07-25'), Khoa: 'Khoa CÃ´ng nghá»‡ ThÃ´ng tin', BoMon: 'Bá»™ mÃ´n CÃ´ng nghá»‡ Pháº§n má»m', HocVi: 'Tháº¡c sÄ©',   HocHam: 'Giáº£ng viÃªn',       NamCongTac: 2015, QuaTrinhCT: '2015-nay: Giáº£ng viÃªn Khoa CNTT, ÄH UIT\nGiáº£ng dáº¡y cÃ¡c mÃ´n CTDL, Máº¡ng mÃ¡y tÃ­nh, KTPM' }},
    { Username: 'gv_thu',   HoTen: 'LÃª Thá»‹ Thu',      Email: 'thu.lt@gmail.com',   profile: { NgaySinh: d('1983-11-08'), Khoa: 'Khoa Khoa há»c CÆ¡ báº£n',     BoMon: 'Bá»™ mÃ´n ToÃ¡n há»c',           HocVi: 'Tiáº¿n sÄ©',   HocHam: 'PhÃ³ GiÃ¡o sÆ°',      NamCongTac: 2010, QuaTrinhCT: '2010-2016: Giáº£ng viÃªn BM ToÃ¡n há»c\n2016-nay: PhÃ³ GiÃ¡o sÆ°, chuyÃªn ngÃ nh ToÃ¡n á»©ng dá»¥ng' }},
    { Username: 'gv_duc',   HoTen: 'Pháº¡m VÄƒn Äá»©c',    Email: 'duc.pv@gmail.com',   profile: { NgaySinh: d('1990-04-18'), Khoa: 'Khoa Ngoáº¡i ngá»¯',           BoMon: 'Bá»™ mÃ´n Tiáº¿ng Anh CN',      HocVi: 'Tháº¡c sÄ©',   HocHam: 'Giáº£ng viÃªn',       NamCongTac: 2018, QuaTrinhCT: '2018-nay: Giáº£ng viÃªn BM Tiáº¿ng Anh ChuyÃªn ngÃ nh, Khoa Ngoáº¡i ngá»¯' }},
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
  console.log(`  âœ“ 3 staff + ${gvData.length} giáº£ng viÃªn\n`);

  // â”€â”€ 4. SINH VIÃŠN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('ðŸŽ“ Sinh viÃªn...');
  await prisma.sinhVien.createMany({
    skipDuplicates: true,
    data: STUDENTS.map((s) => ({ ...s, TrangThai: 'DANG_HOC' })),
  });
  console.log(`  âœ“ ${STUDENTS.length} sinh viÃªn (4 lá»›p, 3 ngÃ nh)\n`);

  // â”€â”€ 5. MÃ”N Há»ŒC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('ðŸ“š MÃ´n há»c...');
  await prisma.monHoc.createMany({
    skipDuplicates: true,
    data: COURSES.map((c) => ({ ...c, SiSoHienTai: 0 })),
  });
  console.log(`  âœ“ ${COURSES.length} mÃ´n há»c\n`);

  // â”€â”€ 6. Lá»šP Há»ŒC PHáº¦N â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('ðŸ« Lá»›p há»c pháº§n...');
  await prisma.monHocMo.createMany({ skipDuplicates: true, data: MON_HOC_MO });
  console.log(`  âœ“ ${MON_HOC_MO.length} lá»›p há»c pháº§n\n`);

  // â”€â”€ 7. PHÃ‚N CÃ”NG GIáº¢NG VIÃŠN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('ðŸ‘¨â€ðŸ« PhÃ¢n cÃ´ng giáº£ng viÃªn...');
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
  console.log(`  âœ“ ${assignments.length} phÃ¢n cÃ´ng\n`);

  // â”€â”€ 8. PHIáº¾U Há»ŒC PHÃ (Ä‘Äƒng kÃ½ mÃ´n) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('ðŸ’° Phiáº¿u há»c phÃ­...');
  const svMap = Object.fromEntries(STUDENTS.map((s) => [s.MaSV, s]));
  const courseMap = Object.fromEntries(COURSES.map((c) => [c.MaMH, c]));

  const phieuHocPhiData = ALL_REGS.map(({ maSV, maMH, maHK }) => {
    const sv = svMap[maSV];
    const course = courseMap[maMH];
    const goc = Number(course.HocPhi);
    const phaiDong = discount(sv.MaDoiTuong, goc);
    // NgÃ y láº­p: Ä‘áº§u há»c ká»³
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
  console.log(`  âœ“ ${phieuHocPhiData.length} phiáº¿u há»c phÃ­\n`);

  // â”€â”€ 9. Cáº¬P NHáº¬T SÄ¨ Sá» HIá»†N Táº I â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('ðŸ“Š Cáº­p nháº­t sÄ© sá»‘...');
  const countByCourse = {};
  for (const r of ALL_REGS) {
    countByCourse[r.maMH] = (countByCourse[r.maMH] ?? 0) + 1;
  }
  for (const [maMH, count] of Object.entries(countByCourse)) {
    await prisma.monHoc.update({ where: { MaMH: maMH }, data: { SiSoHienTai: count } });
  }
  console.log('  âœ“ SiSoHienTai cáº­p nháº­t\n');

  // â”€â”€ 10. PHIáº¾U THU â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('ðŸ§¾ Phiáº¿u thu...');
  // TÃ­nh tá»•ng pháº£i Ä‘Ã³ng má»—i SV má»—i HK
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

    // HK2 & HK3: Ä‘Ã£ káº¿t thÃºc â†’ táº¥t cáº£ Ä‘Ã³ng Ä‘á»§
    if (fullMaHK === HK2 || fullMaHK === HK3) {
      phieuThuData.push({
        MaPhieuThu: `PT${String(ptIdx++).padStart(4, '0')}`,
        MaSV: maSV, MaHK: fullMaHK,
        SoTienThu: tong,
        NgayThu: fullMaHK === HK2 ? d('2025-03-10') : d('2025-06-20'),
        GhiChu: 'ÄÃ³ng Ä‘á»§ há»c phÃ­ há»c ká»³',
      });
      continue;
    }

    // HK1 (hiá»‡n táº¡i): phÃ¢n chia tráº¡ng thÃ¡i
    if (idx % 5 === 0) continue; // ~20% chÆ°a Ä‘Ã³ng

    if (idx % 3 === 0) {
      // ~27% Ä‘Ã³ng 1 pháº§n (2 Ä‘á»£t)
      const dot1 = Math.round(tong * 0.5);
      phieuThuData.push({
        MaPhieuThu: `PT${String(ptIdx++).padStart(4, '0')}`,
        MaSV: maSV, MaHK: fullMaHK,
        SoTienThu: dot1,
        NgayThu: d('2024-09-15'),
        GhiChu: 'ÄÃ³ng Ä‘á»£t 1 (50%)',
      });
    } else {
      // ~53% Ä‘Ã³ng Ä‘á»§
      phieuThuData.push({
        MaPhieuThu: `PT${String(ptIdx++).padStart(4, '0')}`,
        MaSV: maSV, MaHK: fullMaHK,
        SoTienThu: tong,
        NgayThu: d('2024-09-20'),
        GhiChu: 'ÄÃ³ng Ä‘á»§ há»c phÃ­ há»c ká»³ 1',
      });
    }
  }

  await prisma.phieuThu.createMany({ skipDuplicates: true, data: phieuThuData });
  console.log(`  âœ“ ${phieuThuData.length} phiáº¿u thu\n`);

  // â”€â”€ 11. THAM Sá» Há»† THá»NG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('âš™ï¸  Tham sá»‘ há»‡ thá»‘ng...');
  const thamSos = [
    { TenThamSo: 'don_gia_tin_chi_ly_thuyet',   GiaTri: '27000',  KieuDuLieu: 'number', MoTa: 'ÄÆ¡n giÃ¡ / TC mÃ´n LÃ½ thuyáº¿t (Ä‘) â€” QÄ2: 27.000Ä‘/TC' },
    { TenThamSo: 'don_gia_tin_chi_thuc_hanh',  GiaTri: '37000',  KieuDuLieu: 'number', MoTa: 'ÄÆ¡n giÃ¡ / TC mÃ´n Thá»±c hÃ nh (Ä‘) â€” QÄ2: 37.000Ä‘/TC' },
    { TenThamSo: 'ti_le_mien_giam_top_dau',     GiaTri: '0.5',    KieuDuLieu: 'number', MoTa: 'Tá»‰ lá»‡ miá»…n giáº£m há»c lá»±c xuáº¥t sáº¯c' },
    { TenThamSo: 'ti_le_mien_giam_vung_sau_xa', GiaTri: '0.3',    KieuDuLieu: 'number', MoTa: 'Tá»‰ lá»‡ miá»…n giáº£m vÃ¹ng sÃ¢u vÃ¹ng xa' },
    { TenThamSo: 'si_so_toi_da_mac_dinh',       GiaTri: '50',     KieuDuLieu: 'number', MoTa: 'SÄ© sá»‘ tá»‘i Ä‘a máº·c Ä‘á»‹nh' },
    { TenThamSo: 'ngan_hang_ten',               GiaTri: 'Vietcombank', KieuDuLieu: 'string', MoTa: 'TÃªn ngÃ¢n hÃ ng nháº­n há»c phÃ­' },
    { TenThamSo: 'ngan_hang_ma_vietqr',         GiaTri: 'VCB',    KieuDuLieu: 'string', MoTa: 'MÃ£ ngÃ¢n hÃ ng VietQR (VCB, TCB, VTB...)' },
    { TenThamSo: 'ngan_hang_so_tk',             GiaTri: '1234567890', KieuDuLieu: 'string', MoTa: 'Sá»‘ tÃ i khoáº£n nháº­n há»c phÃ­' },
    { TenThamSo: 'ngan_hang_chu_tk',            GiaTri: 'TRUONG DAI HOC CONG NGHE THONG TIN', KieuDuLieu: 'string', MoTa: 'Chá»§ tÃ i khoáº£n' },
    { TenThamSo: 'chuyen_khoan_so_tien_toi_thieu', GiaTri: '1000', KieuDuLieu: 'number', MoTa: 'Sá»‘ tiá»n tá»‘i thiá»ƒu khi chuyá»ƒn khoáº£n (Ä‘)' },
  ];
  for (const ts of thamSos) {
    await prisma.thamSo.upsert({ where: { TenThamSo: ts.TenThamSo }, update: { GiaTri: ts.GiaTri }, create: ts });
  }
  console.log('  âœ“ 6 tham sá»‘\n');

  // â”€â”€ 12. TÃ€I KHOáº¢N SINH VIÃŠN MáºªU â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('ðŸŽ“ TÃ i khoáº£n sinh viÃªn...');
  const svAccountList = [
    { MaSV: '22521001', TenSV: 'Nguyá»…n VÄƒn An',    Email: 'an.22521001@gmail.com'  },
    { MaSV: '22521002', TenSV: 'Tráº§n Thá»‹ BÃ¬nh',     Email: 'binh.22521002@gmail.com' },
    { MaSV: '22522001', TenSV: 'Äinh VÄƒn Anh',      Email: 'anh.22522001@gmail.com'  },
  ];
  for (const sv of svAccountList) {
    const exists = await prisma.taiKhoan.findFirst({ where: { MaSV: sv.MaSV } });
    if (!exists) {
      await prisma.taiKhoan.create({
        data: {
          Username: sv.MaSV, PasswordHash: hash, HoTen: sv.TenSV,
          Email: sv.Email, VaiTro: 'SINH_VIEN', MaSV: sv.MaSV, MustChangePassword: false,
        },
      });
    }
  }
  console.log(`  âœ“ ${svAccountList.length} tÃ i khoáº£n sinh viÃªn máº«u\n`);

  // â”€â”€ ÄIá»‚M MáºªU â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('ðŸ“Š Äiá»ƒm máº«u...');
  const diemData = [
    { MaSV: '22521001', MaMH: 'CS101', MaHK: HK1, DiemGiuaKy: 7.5, DiemCuoiKy: 8.0 },
    { MaSV: '22521001', MaMH: 'MATH101', MaHK: HK1, DiemGiuaKy: 6.0, DiemCuoiKy: 7.5 },
    { MaSV: '22521001', MaMH: 'PHYS101', MaHK: HK1, DiemGiuaKy: 8.0, DiemCuoiKy: 8.5 },
    { MaSV: '22521002', MaMH: 'CS101', MaHK: HK1, DiemGiuaKy: 9.0, DiemCuoiKy: 9.5 },
    { MaSV: '22521002', MaMH: 'MATH101', MaHK: HK1, DiemGiuaKy: 8.5, DiemCuoiKy: 9.0 },
    { MaSV: '22522001', MaMH: 'CS101', MaHK: HK1, DiemGiuaKy: 5.0, DiemCuoiKy: 6.5 },
    { MaSV: '22522001', MaMH: 'MATH101', MaHK: HK1, DiemGiuaKy: 7.0, DiemCuoiKy: 7.0 },
  ];
  for (const d of diemData) {
    const tbhp = Math.round((0.3 * d.DiemGiuaKy + 0.7 * d.DiemCuoiKy) * 100) / 100;
    await prisma.diem.upsert({
      where: { MaSV_MaMH_MaHK: { MaSV: d.MaSV, MaMH: d.MaMH, MaHK: d.MaHK } },
      create: { ...d, DiemTBHP: tbhp, NgayCapNhat: new Date() },
      update: { DiemGiuaKy: d.DiemGiuaKy, DiemCuoiKy: d.DiemCuoiKy, DiemTBHP: tbhp, NgayCapNhat: new Date() },
    });
  }
  console.log(`  âœ“ ${diemData.length} Ä‘iá»ƒm máº«u\n`);

  // â”€â”€ 12. ÄÆ N GIA Háº N Há»ŒC PHÃ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('ðŸ“‹ ÄÆ¡n gia háº¡n há»c phÃ­...');
  const donGiaHanData = [
    {
      MaSV: '22521007', MaHK: HK1,
      LyDo: 'Gia Ä‘Ã¬nh em Ä‘ang gáº·p khÃ³ khÄƒn vá» tÃ i chÃ­nh do bá»‘ em vá»«a bá»‹ tai náº¡n lao Ä‘á»™ng. Em kÃ­nh xin nhÃ  trÆ°á»ng xem xÃ©t cho em gia háº¡n ná»™p há»c phÃ­ thÃªm 30 ngÃ y Ä‘á»ƒ gia Ä‘Ã¬nh thu xáº¿p.',
      TrangThai: 'CHO_DUYET',
    },
    {
      MaSV: '22522008', MaHK: HK1,
      LyDo: 'Em thuá»™c diá»‡n há»™ nghÃ¨o vÃ¹ng sÃ¢u vÃ¹ng xa. Vá»¥ mÃ¹a nÄƒm nay máº¥t mÃ¹a nÃªn gia Ä‘Ã¬nh chÆ°a Ä‘á»§ Ä‘iá»u kiá»‡n Ä‘Ã³ng há»c phÃ­ Ä‘Ãºng háº¡n. Em xin gia háº¡n thÃªm 45 ngÃ y.',
      TrangThai: 'CHO_DUYET',
    },
    {
      MaSV: '22523005', MaHK: HK1,
      LyDo: 'Em vá»«a tráº£i qua pháº«u thuáº­t vÃ  pháº£i náº±m viá»‡n 3 tuáº§n, áº£nh hÆ°á»Ÿng Ä‘áº¿n viá»‡c Ä‘i lÃ m thÃªm. Nay sá»©c khá»e Ä‘Ã£ á»•n Ä‘á»‹nh, em xin nhÃ  trÆ°á»ng cho gia háº¡n thÃªm 1 thÃ¡ng.',
      TrangThai: 'CHO_DUYET',
    },
    {
      MaSV: '22521003', MaHK: HK1,
      LyDo: 'Em Ä‘Ã£ ná»™p Ä‘Æ¡n xin há»c bá»•ng doanh nghiá»‡p, dá»± kiáº¿n káº¿t quáº£ vÃ o cuá»‘i thÃ¡ng tá»›i. Em xin gia háº¡n Ä‘á»ƒ chá» káº¿t quáº£ trÆ°á»›c khi thanh toÃ¡n.',
      TrangThai: 'DA_DUYET',
      NgayXuLy: new Date('2024-09-05'),
      NgayGiaHan: new Date('2024-10-31'),
      GhiChuAdmin: 'ÄÃ£ xem xÃ©t há»“ sÆ¡, cháº¥p thuáº­n gia háº¡n Ä‘áº¿n ngÃ y 31/10/2024.',
    },
  ];
  for (const don of donGiaHanData) {
    await prisma.donGiaHan.create({ data: don });
  }
  console.log(`  âœ“ ${donGiaHanData.length} Ä‘Æ¡n gia háº¡n (3 chá» duyá»‡t, 1 Ä‘Ã£ duyá»‡t)\n`);

  // â”€â”€ Tá»”NG Káº¾T â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('âœ… Seed hoÃ n táº¥t!\n');
  console.log('ðŸ“‹ TÃ i khoáº£n (máº­t kháº©u: 363636)');
  console.log('  admin    â€” Quáº£n trá»‹ viÃªn');
  console.log('  pdt      â€” PhÃ²ng ÄÃ o táº¡o');
  console.log('  ketoan   â€” PhÃ²ng TÃ i chÃ­nh');
  console.log('  gv_mai   â€” Giáº£ng viÃªn TS. Nguyá»…n Thá»‹ Mai');
  console.log('  gv_hung  â€” Giáº£ng viÃªn ThS. Tráº§n VÄƒn HÃ¹ng');
  console.log('  gv_thu   â€” Giáº£ng viÃªn TS. LÃª Thá»‹ Thu (PhÃ³ GS)');
  console.log('  gv_duc   â€” Giáº£ng viÃªn ThS. Pháº¡m VÄƒn Äá»©c\n');
  console.log(`ðŸ“Š Thá»‘ng kÃª:`);
  console.log(`  â€¢ ${STUDENTS.length} sinh viÃªn, 3 ngÃ nh, 4 lá»›p`);
  console.log(`  â€¢ ${COURSES.length} mÃ´n há»c, ${MON_HOC_MO.length} lá»›p há»c pháº§n`);
  console.log(`  â€¢ ${assignments.length} phÃ¢n cÃ´ng giáº£ng dáº¡y`);
  console.log(`  â€¢ ${phieuHocPhiData.length} phiáº¿u há»c phÃ­`);
  console.log(`  â€¢ ${phieuThuData.length} phiáº¿u thu (HK1: ~53% Ä‘á»§ / 27% 1 pháº§n / 20% chÆ°a Ä‘Ã³ng)`);
}

main()
  .catch((e) => { console.error('âŒ Seed tháº¥t báº¡i:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

