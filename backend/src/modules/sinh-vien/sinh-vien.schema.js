import { z } from 'zod';

export const sinhVienCreateSchema = z.object({
  MaSV: z.string().min(1, 'Mã SV bắt buộc').max(20),
  TenSV: z.string().min(1, 'Họ tên bắt buộc').max(100),
  NgaySinh: z.string().optional().nullable().refine((val) => {
    if (!val) return true; // Không bắt buộc nhập ngày sinh
    const namSinh = new Date(val).getFullYear();
    const namHienTai = new Date().getFullYear();
    return namHienTai - namSinh >= 18; // Phải đủ 18 tuổi
  }, { message: `Sinh viên phải đủ 18 tuổi (sinh từ năm ${new Date().getFullYear() - 18} trở về trước)` }),
  GioiTinh: z.enum(['Nam', 'Nữ']).optional().nullable(),
  TenLop: z.string().max(50).optional().nullable(),
  Email: z.string().email('Email không hợp lệ').or(z.literal('')).optional().nullable(),
  MaQueQuan: z.string().max(20).optional().nullable(),
  MaDoiTuong: z.string().max(20).optional().nullable(),
  MaNganh: z.string().max(20).optional().nullable(),
  TrangThai: z
    .enum(['Đang học', 'Bảo lưu', 'Tốt nghiệp', 'DANG_HOC', 'BAO_LUU', 'TOT_NGHIEP'])
    .default('Đang học'),
});

export const sinhVienUpdateSchema = sinhVienCreateSchema.omit({ MaSV: true }).partial();
