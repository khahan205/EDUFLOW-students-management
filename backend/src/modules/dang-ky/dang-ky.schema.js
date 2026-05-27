import { z } from 'zod';

export const registerSchema = z.object({
  maSV: z.string().min(1, 'Mã SV bắt buộc'),
  maHK: z.string().min(1, 'Mã HK bắt buộc'),
  maMH: z.string().min(1, 'Mã môn bắt buộc'),
});

export const unregisterSchema = registerSchema; // cùng shape
