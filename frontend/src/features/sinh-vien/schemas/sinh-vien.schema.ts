import { z } from 'zod';

export const sinhVienSchema = z.object({
  MaSV: z
    .string()
    .min(1, 'Vui lòng nhập mã sinh viên')
    .max(20, 'Mã sinh viên tối đa 20 ký tự'),
  TenSV: z.string().min(1, 'Vui lòng nhập họ tên'),
  NgaySinh: z.string().optional(),
  GioiTinh: z.enum(['Nam', 'Nữ']).optional(),
  TenLop: z.string().optional(),
  Email: z.string().email('Email không hợp lệ').or(z.literal('')).optional(),
  MaQueQuan: z.string().optional(),
  MaDoiTuong: z.string().optional(),
  MaNganh: z.string().optional(),
  TrangThai: z.enum(['Đang học', 'Bảo lưu', 'Tốt nghiệp']).default('Đang học'),
});

export type SinhVienInput = z.infer<typeof sinhVienSchema>;
