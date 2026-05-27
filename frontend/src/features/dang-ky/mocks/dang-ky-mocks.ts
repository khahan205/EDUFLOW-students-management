import type { MonHocMo } from '@/types';
import { monHocStore } from '@/features/mon-hoc/mocks/mon-hoc-mocks';
import { sinhVienStore } from '@/features/sinh-vien/mocks/sinh-vien-mocks';

/** Danh sách (MaHK, MaMH) đã được phòng đào tạo mở trong học kỳ */
let monMoStore: MonHocMo[] = [
  { MaHK: 'HK_2024_2025_1', MaMH: 'MATH102' },
  { MaHK: 'HK_2024_2025_1', MaMH: 'TOAN101' },
  { MaHK: 'HK_2024_2025_1', MaMH: 'TEST01'  },
  { MaHK: 'HK_2024_2025_1', MaMH: 'T01'     },
  { MaHK: 'HK_2024_2025_2', MaMH: 'SHI350'  },
  { MaHK: 'HK_2024_2025_3', MaMH: 'TOAN102' },
  { MaHK: 'HK_2024_2025_3', MaMH: 'T02'     },
];

/** Đăng ký môn của sinh viên: 1 SV có thể đăng ký nhiều môn trong 1 HK */
interface DangKyRecord {
  MaSV: string;
  MaHK: string;
  MaMH: string;
  NgayDangKy: string;
}

let dangKyStore: DangKyRecord[] = [
  { MaSV: 'S001',  MaHK: 'HK_2024_2025_1', MaMH: 'T01',     NgayDangKy: '2024-08-15' },
  { MaSV: 'SV002', MaHK: 'HK_2024_2025_1', MaMH: 'MATH102', NgayDangKy: '2024-08-16' },
];

export const dangKyStore_ = {
  /** Lấy danh sách môn được mở trong 1 HK + đã đăng ký bởi SV chưa */
  getMonMoChoSV: (maSV: string, maHK: string) => {
    const allMon = monHocStore.list();
    const moTrongHK = monMoStore.filter((m) => m.MaHK === maHK).map((m) => m.MaMH);
    const daDangKy = new Set(
      dangKyStore.filter((r) => r.MaSV === maSV && r.MaHK === maHK).map((r) => r.MaMH),
    );
    return allMon
      .filter((mh) => moTrongHK.includes(mh.MaMH))
      .map((mh) => ({
        ...mh,
        daDangKy: daDangKy.has(mh.MaMH),
      }));
  },

  /** Đăng ký 1 môn cho 1 SV trong 1 HK */
  register: (maSV: string, maHK: string, maMH: string) => {
    const sv = sinhVienStore.get(maSV);
    if (!sv) throw new Error(`Không tìm thấy sinh viên có mã "${maSV}".`);

    const mh = monHocStore.get(maMH);
    if (!mh) throw new Error(`Không tìm thấy môn học "${maMH}".`);

    const isMo = monMoStore.some((m) => m.MaHK === maHK && m.MaMH === maMH);
    if (!isMo) throw new Error(`Môn "${maMH}" không được mở trong học kỳ này.`);

    const exists = dangKyStore.some(
      (r) => r.MaSV === maSV && r.MaHK === maHK && r.MaMH === maMH,
    );
    if (exists) throw new Error(`Sinh viên đã đăng ký môn này rồi.`);

    if ((mh.SiSoHienTai ?? 0) >= (mh.SiSoToiDa ?? 0)) {
      throw new Error(`Môn "${maMH}" đã đầy (${mh.SiSoHienTai}/${mh.SiSoToiDa}).`);
    }

    // Tăng sĩ số môn
    monHocStore.update(maMH, { SiSoHienTai: (mh.SiSoHienTai ?? 0) + 1 });

    // Lưu record đăng ký
    const record: DangKyRecord = {
      MaSV: maSV,
      MaHK: maHK,
      MaMH: maMH,
      NgayDangKy: new Date().toISOString().slice(0, 10),
    };
    dangKyStore = [...dangKyStore, record];

    return record;
  },

  /** Huỷ đăng ký 1 môn cho SV */
  unregister: (maSV: string, maHK: string, maMH: string) => {
    const idx = dangKyStore.findIndex(
      (r) => r.MaSV === maSV && r.MaHK === maHK && r.MaMH === maMH,
    );
    if (idx === -1) throw new Error('Không tìm thấy đăng ký này.');
    dangKyStore = dangKyStore.filter((_, i) => i !== idx);
    const mh = monHocStore.get(maMH);
    if (mh) monHocStore.update(maMH, { SiSoHienTai: Math.max(0, (mh.SiSoHienTai ?? 0) - 1) });
  },

  /** Danh sách môn SV đã đăng ký trong 1 HK */
  listDaDangKy: (maSV: string, maHK: string) => {
    return dangKyStore.filter((r) => r.MaSV === maSV && r.MaHK === maHK);
  },
};

/** Mock học kỳ hiện tại */
export const MOCK_CURRENT_HK = {
  MaHK: 'HK_2024_2025_1',
  TenHK: 'HK1',
  NamHoc: '2024-2025',
};
