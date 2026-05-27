import { z } from 'zod';

export const dangKySearchSchema = z.object({
  maSV: z.string().min(1, 'Vui lòng nhập mã sinh viên'),
});

export type DangKySearchInput = z.infer<typeof dangKySearchSchema>;
