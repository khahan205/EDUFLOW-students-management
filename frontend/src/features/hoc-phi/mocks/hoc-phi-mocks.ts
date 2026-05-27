import type { PhieuThu, ThuHocPhiRow } from '@/types';

export const mockHocPhiRows: ThuHocPhiRow[] = [
  { MaSV: 'S001', TenSV: 'Test Student',   MaHK: 'HK_2024_2025_2', TenHK: 'HK2', Tong: 20_000_000, DaDong: 0,         ConLai: 20_000_000, TrangThai: 'Chưa ĐT' },
  { MaSV: 'S001', TenSV: 'Test Student',   MaHK: 'HK_2024_2025_1', TenHK: 'HK1', Tong:  5_000_000, DaDong: 5_000_000, ConLai: 0,          TrangThai: 'Đã ĐT' },
  { MaSV: 'S001', TenSV: 'Test Student',   MaHK: 'HK_2024_2025_2', TenHK: 'HK2', Tong: 20_000_000, DaDong: 0,         ConLai: 20_000_000, TrangThai: 'Chưa ĐT' },
  { MaSV: 'S001', TenSV: 'Test Student',   MaHK: 'HK_2024_2025_1', TenHK: 'HK1', Tong:  5_000_000, DaDong: 5_000_000, ConLai: 0,          TrangThai: 'Đã ĐT' },
  { MaSV: 'S001', TenSV: 'Test Student',   MaHK: 'HK_2024_2025_1', TenHK: 'HK1', Tong:  1_500_000, DaDong: 1_500_000, ConLai: 0,          TrangThai: 'Đã ĐT' },
  { MaSV: 'SV002', TenSV: 'Nguyễn Văn A',   MaHK: 'HK_2024_2025_1', TenHK: 'HK1', Tong:  5_000_000, DaDong: 4_000_001, ConLai: 999_999,    TrangThai: 'Đã ĐT 1 phần' },
];

let rowStore = [...mockHocPhiRows];

let phieuThuStore: PhieuThu[] = [
  { MaPhieuThu: 'PT001', MaSV: 'S001',  MaHK: 'HK_2024_2025_1', NgayThu: '2024-09-15', SoTienThu: 3_000_000 },
  { MaPhieuThu: 'PT002', MaSV: 'S001',  MaHK: 'HK_2024_2025_1', NgayThu: '2024-10-05', SoTienThu: 2_000_000 },
  { MaPhieuThu: 'PT003', MaSV: 'S001',  MaHK: 'HK_2024_2025_1', NgayThu: '2024-09-20', SoTienThu: 5_000_000 },
  { MaPhieuThu: 'PT004', MaSV: 'S001',  MaHK: 'HK_2024_2025_1', NgayThu: '2024-09-25', SoTienThu: 1_500_000 },
  { MaPhieuThu: 'PT005', MaSV: 'SV002', MaHK: 'HK_2024_2025_1', NgayThu: '2024-09-30', SoTienThu: 4_000_001 },
];

export const hocPhiStore = {
  list: () => [...rowStore],

  history: (maSV: string, maHK: string) =>
    phieuThuStore
      .filter((p) => p.MaSV === maSV && p.MaHK === maHK)
      .sort((a, b) => a.NgayThu.localeCompare(b.NgayThu)),

  /** Lập phiếu thu mới; cập nhật row tương ứng. Không cho thu vượt số nợ. */
  pay: (maSV: string, maHK: string, soTien: number) => {
    const idx = rowStore.findIndex((r) => r.MaSV === maSV && r.MaHK === maHK && r.ConLai > 0);
    if (idx === -1) throw new Error('Không tìm thấy phiếu học phí cần thu.');
    const row = rowStore[idx];
    if (soTien <= 0) throw new Error('Số tiền thu phải lớn hơn 0.');
    if (soTien > row.ConLai) throw new Error(`Số tiền thu không được vượt số nợ (${row.ConLai.toLocaleString('vi-VN')}đ).`);

    // Create phieu thu
    const phieu: PhieuThu = {
      MaPhieuThu: `PT${(phieuThuStore.length + 1).toString().padStart(3, '0')}`,
      MaSV: maSV,
      MaHK: maHK,
      NgayThu: new Date().toISOString().slice(0, 10),
      SoTienThu: soTien,
    };
    phieuThuStore = [...phieuThuStore, phieu];

    // Update row
    const daDongMoi = row.DaDong + soTien;
    const conLaiMoi = row.Tong - daDongMoi;
    const trangThaiMoi: ThuHocPhiRow['TrangThai'] =
      conLaiMoi === 0 ? 'Đã ĐT' : daDongMoi > 0 ? 'Đã ĐT 1 phần' : 'Chưa ĐT';

    rowStore = rowStore.map((r, i) =>
      i === idx ? { ...r, DaDong: daDongMoi, ConLai: conLaiMoi, TrangThai: trangThaiMoi } : r,
    );

    return { phieu, updatedRow: rowStore[idx] };
  },
};
