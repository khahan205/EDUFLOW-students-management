import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

await prisma.$executeRawUnsafe(`
  CREATE TABLE IF NOT EXISTS DIEM (
    MaDiem       INT          NOT NULL AUTO_INCREMENT,
    MaSV         VARCHAR(20)  NOT NULL,
    MaMH         VARCHAR(20)  NOT NULL,
    MaHK         VARCHAR(30)  NOT NULL,
    DiemGiuaKy  FLOAT        NULL,
    DiemCuoiKy  FLOAT        NULL,
    DiemTBHP     FLOAT        NULL,
    NgayCapNhat  DATETIME(3)  NOT NULL,
    PRIMARY KEY (MaDiem),
    UNIQUE KEY UK_DIEM (MaSV, MaMH, MaHK),
    INDEX IDX_DIEM_SV (MaSV),
    INDEX IDX_DIEM_HK (MaHK),
    FOREIGN KEY (MaSV) REFERENCES SINHVIEN(MaSV) ON DELETE CASCADE,
    FOREIGN KEY (MaMH) REFERENCES MONHOC(MaMH) ON DELETE CASCADE,
    FOREIGN KEY (MaHK) REFERENCES HOCKY(MaHK)  ON DELETE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
`);
console.log('✓ Tạo bảng DIEM');
await prisma.$disconnect();
