import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

await prisma.thamSo.upsert({
  where: { TenThamSo: 'so_lop_toi_da_gv_per_hk' },
  update: { GiaTri: '3' },
  create: {
    TenThamSo: 'so_lop_toi_da_gv_per_hk',
    GiaTri: '3',
    KieuDuLieu: 'number',
    MoTa: 'So lop toi da moi GV duoc phan cong trong 1 hoc ky',
  },
});
console.log('✓ Them tham so so_lop_toi_da_gv_per_hk = 3');
await prisma.$disconnect();
