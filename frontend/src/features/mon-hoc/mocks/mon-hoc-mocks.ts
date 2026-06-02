import type { MonHoc } from '@/types';

export const mockMonHocList: MonHoc[] = [
  { MaMH: 'MATH102', TenMH: 'Toán cao cấp 1', MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK1', TenKhoa: 'Công nghệ thông tin', SiSoHienTai: 0,  SiSoToiDa: 50  },
  { MaMH: 'SHI350',  TenMH: 'meomeo',          MaLoaiMon: 'LT', SoTiet: 60, SoTinChi: 4, HocPhi: 2_000_000, HocKy: 'HK2', TenKhoa: 'Khoa Khoa học và KTTT', SiSoHienTai: 0, SiSoToiDa: 100 },
  { MaMH: 'TOAN101', TenMH: 'Toán A1',         MaLoaiMon: 'LT', SoTiet: 60, SoTinChi: 4, HocPhi: 2_000_000, HocKy: 'HK1', TenKhoa: 'CNTT', SiSoHienTai: 0, SiSoToiDa: 50 },
  { MaMH: 'TOAN102', TenMH: 'Toán A2',         MaLoaiMon: 'LT', SoTiet: 60, SoTinChi: 4, HocPhi: 3_000_000, HocKy: 'HK3 (Hè)', TenKhoa: 'CNTT', SiSoHienTai: 0, SiSoToiDa: 50 },
  { MaMH: 'TEST01',  TenMH: 'Test',            MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK1', TenKhoa: 'CNTT', SiSoHienTai: 0, SiSoToiDa: 50 },
  { MaMH: 'T01',     TenMH: 'Test 1',          MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK1', TenKhoa: 'CNTT', SiSoHienTai: 1, SiSoToiDa: 50 },
  { MaMH: 'T02',     TenMH: 'Test 2',          MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 2_250_000, HocKy: 'HK3 (Hè)', TenKhoa: 'CNTT', SiSoHienTai: 0, SiSoToiDa: 50 },
];

let store: MonHoc[] = [...mockMonHocList];

export const monHocStore = {
  list: () => [...store],
  get: (maMH: string) => store.find((m) => m.MaMH === maMH),
  add: (mh: MonHoc) => { store = [...store, mh]; return mh; },
  update: (maMH: string, patch: Partial<MonHoc>) => {
    store = store.map((m) => (m.MaMH === maMH ? { ...m, ...patch } : m));
    return store.find((m) => m.MaMH === maMH);
  },
  remove: (maMH: string) => { store = store.filter((m) => m.MaMH !== maMH); },
};

/** Tham số đơn giá tín chỉ (mock). Backend sẽ trả về từ bảng ThamSo. */
export const mockPricingConfig = {
  donGiaLT: 27_000,
  donGiaTH: 37_000,
  tiLeMienGiamTopDau: 0.5,
  tiLeMienGiamVungSauVungXa: 0.3,
};
