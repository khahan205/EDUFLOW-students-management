import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const pastHocKy = [
  { MaHK: 'HK_2023_2024_1', TenHK: 'HK1',      NamHoc: '2023-2024', LaHienTai: false, NgayBatDau: new Date('2023-08-15'), NgayKetThuc: new Date('2023-12-31') },
  { MaHK: 'HK_2023_2024_2', TenHK: 'HK2',      NamHoc: '2023-2024', LaHienTai: false, NgayBatDau: new Date('2024-01-15'), NgayKetThuc: new Date('2024-05-31') },
  { MaHK: 'HK_2023_2024_3', TenHK: 'HK3 (Hè)', NamHoc: '2023-2024', LaHienTai: false, NgayBatDau: new Date('2024-06-15'), NgayKetThuc: new Date('2024-08-15') },
];

let added = 0;
for (const hk of pastHocKy) {
  const exists = await prisma.hocKy.findUnique({ where: { MaHK: hk.MaHK } });
  if (!exists) {
    await prisma.hocKy.create({ data: hk });
    console.log(`✓ Thêm ${hk.TenHK} ${hk.NamHoc}`);
    added++;
  } else {
    console.log(`✓ ${hk.TenHK} ${hk.NamHoc} đã tồn tại`);
  }
}
console.log(`\n✓ Hoàn tất — đã thêm ${added} học kỳ`);
await prisma.$disconnect();
