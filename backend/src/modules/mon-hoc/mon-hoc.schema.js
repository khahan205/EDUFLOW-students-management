import { z } from 'zod';

export const monHocCreateSchema = z.object({
  MaMH: z.string().min(1, 'Mã môn bắt buộc').max(20),
  TenMH: z.string().min(1, 'Tên môn bắt buộc').max(150),
  MaLoaiMon: z.enum(['LT', 'TH']),
  SoTiet: z.coerce.number().int().min(1, 'Số tiết phải > 0'),
  SoTinChi: z.coerce.number().int().min(1, 'Số tín chỉ phải > 0'),
  HocPhi: z.coerce.number().min(0, 'Học phí không âm'),
  HocKy: z.string().min(1).max(20),
  TenKhoa: z.string().min(1).max(100),
  SiSoToiDa: z.coerce.number().int().min(1, 'Sĩ số tối đa phải > 0'),
});

export const monHocUpdateSchema = monHocCreateSchema.omit({ MaMH: true }).partial();

export const pricingConfigSchema = z.object({
  donGiaTinChi: z.coerce.number().min(0),
  heSoLT: z.coerce.number().min(0),
  heSoTH: z.coerce.number().min(0),
  tiLeMienGiamTopDau: z.coerce.number().min(0).max(1),
  tiLeMienGiamVungSauVungXa: z.coerce.number().min(0).max(1),
});
