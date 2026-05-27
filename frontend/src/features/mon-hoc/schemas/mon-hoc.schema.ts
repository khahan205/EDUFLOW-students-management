import { z } from 'zod';

export const monHocSchema = z.object({
  MaMH: z.string().min(1, 'Vui lòng nhập mã môn').max(20, 'Tối đa 20 ký tự'),
  TenMH: z.string().min(1, 'Vui lòng nhập tên môn'),
  MaLoaiMon: z.enum(['LT', 'TH']),
  SoTiet: z.coerce.number().min(1, 'Số tiết phải lớn hơn 0'),
  SoTinChi: z.coerce.number().min(1, 'Số tín chỉ phải lớn hơn 0'),
  HocPhi: z.coerce.number().min(0, 'Học phí không âm'),
  HocKy: z.string().min(1, 'Vui lòng chọn học kỳ'),
  TenKhoa: z.string().min(1, 'Vui lòng nhập tên khoa'),
  SiSoToiDa: z.coerce.number().min(1, 'Sĩ số tối đa phải lớn hơn 0'),
});

export type MonHocInput = z.infer<typeof monHocSchema>;

export const pricingConfigSchema = z.object({
  donGiaTinChi: z.coerce.number().min(0),
  heSoLT: z.coerce.number().min(0),
  heSoTH: z.coerce.number().min(0),
  tiLeMienGiamTopDau: z.coerce.number().min(0).max(1),
  tiLeMienGiamVungSauVungXa: z.coerce.number().min(0).max(1),
});

export type PricingConfigInput = z.infer<typeof pricingConfigSchema>;
