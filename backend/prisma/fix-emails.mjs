import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Cập nhật email sinh viên trong bảng SINHVIEN
const result1 = await prisma.$executeRawUnsafe(
  `UPDATE SINHVIEN SET Email = REPLACE(Email, '@gm.uit.edu.vn', '@gmail.com') WHERE Email LIKE '%@gm.uit.edu.vn'`
);
console.log(`✓ Cập nhật ${result1} email sinh viên (bảng SINHVIEN)`);

// Cập nhật email trong bảng TAIKHOAN (tài khoản sinh viên)
const result2 = await prisma.$executeRawUnsafe(
  `UPDATE TAIKHOAN SET Email = REPLACE(Email, '@gm.uit.edu.vn', '@gmail.com') WHERE Email LIKE '%@gm.uit.edu.vn'`
);
console.log(`✓ Cập nhật ${result2} email tài khoản (bảng TAIKHOAN)`);

await prisma.$disconnect();
console.log('✓ Hoàn tất — đuôi email đã đổi thành @gmail.com');
