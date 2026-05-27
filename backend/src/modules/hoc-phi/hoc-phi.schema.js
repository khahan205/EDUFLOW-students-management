import { z } from 'zod';

export const paySchema = z.object({
  maSV: z.string().min(1),
  maHK: z.string().min(1),
  soTien: z.coerce.number().int().positive('Số tiền phải > 0'),
  ghiChu: z.string().max(255).optional(),
});

export const historyQuerySchema = z.object({
  ma_hk: z.string().min(1, 'Thiếu ma_hk'),
});
