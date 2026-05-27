import type { SinhVien } from '@/types';

export const mockSinhVienList: SinhVien[] = [
  {
    MaSV: 'S001',
    TenSV: 'Test Student',
    NgaySinh: '2003-05-10',
    GioiTinh: 'Nam',
    TenLop: 'A',
    Email: 't@t.com',
    TrangThai: 'Đang học',
    MaQueQuan: 'QQ_HCM',
    MaDoiTuong: 'DT_KHONG',
    MaNganh: 'NG_CNTT',
  },
  {
    MaSV: 'SV002',
    TenSV: 'Nguyễn Văn A',
    NgaySinh: '2003-08-22',
    GioiTinh: 'Nam',
    TenLop: 'CNTT01',
    Email: 'a@example.com',
    TrangThai: 'Đang học',
    MaQueQuan: 'QQ_HN',
    MaDoiTuong: 'DT_KHONG',
    MaNganh: 'NG_CNTT',
  },
];

// In-memory store mô phỏng database — sẽ thay bằng axios call khi backend live.
let store: SinhVien[] = [...mockSinhVienList];

export const sinhVienStore = {
  list: (): SinhVien[] => [...store],
  get: (maSV: string): SinhVien | undefined => store.find((s) => s.MaSV === maSV),
  add: (sv: SinhVien) => {
    store = [...store, sv];
    return sv;
  },
  update: (maSV: string, patch: Partial<SinhVien>) => {
    store = store.map((s) => (s.MaSV === maSV ? { ...s, ...patch } : s));
    return store.find((s) => s.MaSV === maSV);
  },
  remove: (maSV: string) => {
    store = store.filter((s) => s.MaSV !== maSV);
  },
};
