import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Vũ Văn Giang: đổi quê quán từ Cần Thơ → Sơn La (vùng sâu thật)
await prisma.sinhVien.update({ where: { MaSV: '22521007' }, data: { MaQueQuan: 'QQ_SL' } });
console.log('✓ 22521007 (Vũ Văn Giang): Quê quán → Sơn La');

// Đặng Văn Việt (Hà Nội): bỏ đối tượng vùng sâu
await prisma.sinhVien.update({ where: { MaSV: '22521019' }, data: { MaDoiTuong: 'DT_KHONG' } });
console.log('✓ 22521019 (Đặng Văn Việt, Hà Nội): Đối tượng → Không');

// Ngô Thị Kim (HCM): bỏ đối tượng vùng sâu
await prisma.sinhVien.update({ where: { MaSV: '22522008' }, data: { MaDoiTuong: 'DT_KHONG' } });
console.log('✓ 22522008 (Ngô Thị Kim, HCM): Đối tượng → Không');

await prisma.$disconnect();
console.log('✓ Đã sửa dữ liệu vùng sâu vùng xa');
