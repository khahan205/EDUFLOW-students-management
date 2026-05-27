import { z } from 'zod';

export const createAccountSchema = z.object({
  Username: z
    .string()
    .min(3, 'Username phải có ít nhất 3 ký tự')
    .max(50, 'Username tối đa 50 ký tự')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username chỉ chấp nhận chữ, số, _, ., -'),
  Password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').max(100),
  HoTen: z.string().min(1, 'Họ tên bắt buộc').max(100),
  Email: z.string().email('Email không hợp lệ').max(100).optional().nullable(),
  VaiTro: z.enum(['ADMIN', 'PHONG_DAO_TAO', 'PHONG_TAI_CHINH', 'GIANG_VIEN', 'CO_VAN']),
});

export const updateAccountSchema = z.object({
  HoTen: z.string().min(1).max(100).optional(),
  Email: z.string().email().max(100).or(z.literal('')).optional().nullable(),
  VaiTro: z.enum(['ADMIN', 'PHONG_DAO_TAO', 'PHONG_TAI_CHINH', 'GIANG_VIEN', 'CO_VAN']).optional(),
  TrangThai: z.enum(['ACTIVE', 'DISABLED']).optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6).max(100),
});
