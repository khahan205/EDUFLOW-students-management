import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const count = await prisma.phanCongGiangDay.count();
await prisma.phanCongGiangDay.deleteMany();
console.log(`✓ Đã xóa ${count} phân công giảng viên — tất cả lớp học phần chuyển về chưa phân công`);
await prisma.$disconnect();
