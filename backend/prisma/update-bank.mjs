import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
await prisma.thamSo.update({
  where: { TenThamSo: 'ngan_hang_chu_tk' },
  data: { GiaTri: 'TRUONG DAI HOC BONG TUYET' }
});
console.log('✓ Đã cập nhật chủ tài khoản');
await prisma.$disconnect();
