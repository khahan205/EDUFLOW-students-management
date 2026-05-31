import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Kiểm tra cột MaSV đã tồn tại chưa
const cols = await prisma.$queryRawUnsafe(
  "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='TAIKHOAN' AND COLUMN_NAME='MaSV' AND TABLE_SCHEMA=DATABASE()"
);
if (cols.length === 0) {
  await prisma.$executeRawUnsafe(`ALTER TABLE TAIKHOAN ADD COLUMN MaSV VARCHAR(20) NULL`);
  await prisma.$executeRawUnsafe(`ALTER TABLE TAIKHOAN ADD UNIQUE KEY UK_TAIKHOAN_MASV (MaSV)`);
  console.log('✓ Thêm cột MaSV vào TAIKHOAN');
} else {
  console.log('✓ Cột MaSV đã tồn tại');
}

// Thêm SINH_VIEN vào enum VaiTro
await prisma.$executeRawUnsafe(
  `ALTER TABLE TAIKHOAN MODIFY COLUMN VaiTro ENUM('ADMIN','PHONG_DAO_TAO','PHONG_TAI_CHINH','GIANG_VIEN','CO_VAN','SINH_VIEN') NOT NULL`
);
console.log('✓ Thêm SINH_VIEN vào enum VaiTro');

await prisma.$disconnect();
console.log('✓ Migration hoàn tất');
