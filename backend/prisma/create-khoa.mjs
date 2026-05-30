import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Tạo bảng KHOA trực tiếp bằng raw SQL
await prisma.$executeRawUnsafe(`
  CREATE TABLE IF NOT EXISTS \`KHOA\` (
    \`MaKhoa\`  VARCHAR(20)  NOT NULL,
    \`TenKhoa\` VARCHAR(150) NOT NULL,
    PRIMARY KEY (\`MaKhoa\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
`);
console.log('✓ Tạo bảng KHOA');

// Nhập dữ liệu
const khoas = [
  { MaKhoa: 'KHOA_CNTT',     TenKhoa: 'Khoa Công nghệ Thông tin'   },
  { MaKhoa: 'KHOA_KHCB',     TenKhoa: 'Khoa Khoa học Cơ bản'       },
  { MaKhoa: 'KHOA_NGOAINGU', TenKhoa: 'Khoa Ngoại ngữ'              },
  { MaKhoa: 'KHOA_KTHT',     TenKhoa: 'Khoa Kỹ thuật Hệ thống'     },
];

for (const k of khoas) {
  await prisma.$executeRawUnsafe(
    `INSERT IGNORE INTO \`KHOA\` (\`MaKhoa\`, \`TenKhoa\`) VALUES (?, ?)`,
    k.MaKhoa, k.TenKhoa
  );
}
console.log(`✓ Nhập ${khoas.length} khoa`);
await prisma.$disconnect();
