import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
const hash = await bcrypt.hash('363636', 10);

const accounts = [
  { MaSV: '22521001', TenSV: 'Nguyễn Văn An',   Email: 'an.22521001@gm.uit.edu.vn'  },
  { MaSV: '22521002', TenSV: 'Trần Thị Bình',    Email: 'binh.22521002@gm.uit.edu.vn' },
  { MaSV: '22522001', TenSV: 'Đinh Văn Anh',     Email: 'anh.22522001@gm.uit.edu.vn'  },
];

for (const a of accounts) {
  // Check sinh vien exists
  const svRows = await prisma.$queryRawUnsafe(`SELECT MaSV FROM SINHVIEN WHERE MaSV = ?`, a.MaSV);
  if (svRows.length === 0) { console.log(`⚠ Không tìm thấy sinh viên ${a.MaSV}`); continue; }

  // Check account exists
  const existing = await prisma.$queryRawUnsafe(`SELECT MaTK FROM TAIKHOAN WHERE MaSV = ?`, a.MaSV);
  if (existing.length > 0) { console.log(`✓ ${a.MaSV} đã có tài khoản`); continue; }

  await prisma.$executeRawUnsafe(
    `INSERT INTO TAIKHOAN (Username, PasswordHash, HoTen, Email, VaiTro, TrangThai, MustChangePassword, MaSV, NgayTao, NgayCapNhat)
     VALUES (?, ?, ?, ?, 'SINH_VIEN', 'ACTIVE', 0, ?, NOW(), NOW())`,
    a.MaSV, hash, a.TenSV, a.Email, a.MaSV
  );
  console.log(`✓ Tạo tài khoản ${a.MaSV} — ${a.TenSV}`);
}

await prisma.$disconnect();
console.log('✓ Hoàn tất');
