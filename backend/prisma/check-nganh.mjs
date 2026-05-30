import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const rows = await prisma.nganhHoc.findMany();
console.log('Số ngành trong DB:', rows.length);
rows.forEach(r => console.log(' -', r.MaNganh, '|', r.TenNganh));
await prisma.$disconnect();
