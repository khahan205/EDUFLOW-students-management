import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const result = await prisma.nganhHoc.createMany({
  skipDuplicates: true,
  data: [
    { MaNganh: 'NG_KTPM', TenNganh: 'Kỹ thuật Phần mềm',             MaKhoa: 'KHOA_CNTT' },
    { MaNganh: 'NG_MMTT', TenNganh: 'Mạng máy tính và Truyền thông', MaKhoa: 'KHOA_CNTT' },
    { MaNganh: 'NG_KHDL', TenNganh: 'Khoa học Dữ liệu',              MaKhoa: 'KHOA_CNTT' },
    { MaNganh: 'NG_ATTT', TenNganh: 'An toàn Thông tin',             MaKhoa: 'KHOA_CNTT' },
  ],
});

console.log(`✓ Đã thêm ${result.count} ngành học mới`);
await prisma.$disconnect();
