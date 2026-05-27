import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Vui lòng nhập tên đăng nhập')
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .min(4, 'Mật khẩu phải có ít nhất 4 ký tự'),
});

export type LoginInput = z.infer<typeof loginSchema>;
