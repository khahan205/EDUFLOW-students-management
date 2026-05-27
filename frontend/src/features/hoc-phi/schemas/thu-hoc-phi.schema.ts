import { z } from 'zod';

export const thuHocPhiSchema = z.object({
  soTien: z.coerce
    .number({ invalid_type_error: 'Vui lòng nhập số' })
    .positive('Số tiền phải lớn hơn 0'),
  ghiChu: z.string().optional(),
});

export type ThuHocPhiInput = z.infer<typeof thuHocPhiSchema>;
