import { z } from 'zod';

export const VAI_TRO_OPTIONS = [
  { value: 'ADMIN', label: 'Quản trị viên' },
  { value: 'PHONG_DAO_TAO', label: 'Phòng Đào tạo' },
  { value: 'PHONG_TAI_CHINH', label: 'Phòng Tài chính' },
  { value: 'GIANG_VIEN', label: 'Giảng viên' },
  { value: 'CO_VAN', label: 'Cố vấn học tập' },
] as const;

export const createAccountSchema = z.object({
  Username: z.string().min(3, 'Tối thiểu 3 ký tự').max(50),
  Password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  HoTen: z.string().min(1, 'Nhập họ tên').max(100),
  Email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  VaiTro: z.string().min(1, 'Chọn vai trò'),
});

export const updateAccountSchema = z.object({
  HoTen: z.string().min(1, 'Nhập họ tên').max(100),
  Email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  VaiTro: z.string().min(1, 'Chọn vai trò'),
  TrangThai: z.enum(['ACTIVE', 'DISABLED']),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
