import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/api-error.js';

export async function listPhanCong() {
  const rows = await prisma.monHocMo.findMany({
    include: {
      monHoc: { select: { TenMH: true, SoTinChi: true } },
      hocKy: { select: { TenHK: true, NamHoc: true } },
      phanCong: {
        include: {
          taiKhoan: { select: { MaTK: true, HoTen: true, Email: true } },
        },
      },
    },
    orderBy: [{ MaHK: 'desc' }, { MaMH: 'asc' }],
  });

  return rows.map((r) => ({
    MaHK: r.MaHK,
    TenHK: r.hocKy.TenHK,
    NamHoc: r.hocKy.NamHoc,
    MaMH: r.MaMH,
    TenMH: r.monHoc.TenMH,
    SoTinChi: r.monHoc.SoTinChi,
    GiangVien: r.phanCong
      ? {
          MaTK: r.phanCong.taiKhoan.MaTK,
          HoTen: r.phanCong.taiKhoan.HoTen,
          Email: r.phanCong.taiKhoan.Email,
        }
      : null,
  }));
}

export async function assignGiangVien({ maHK, maMH, maTK }) {
  // Verify the class section exists
  const monHocMo = await prisma.monHocMo.findUnique({
    where: { MaHK_MaMH: { MaHK: maHK, MaMH: maMH } },
  });
  if (!monHocMo) throw ApiError.notFound(`Lớp học phần "${maMH}" trong "${maHK}" không tồn tại.`);

  // Verify the account is a GIANG_VIEN
  const taiKhoan = await prisma.taiKhoan.findUnique({ where: { MaTK: maTK } });
  if (!taiKhoan) throw ApiError.notFound('Tài khoản không tồn tại.');
  if (taiKhoan.VaiTro !== 'GIANG_VIEN') throw ApiError.badRequest('Tài khoản này không phải giảng viên.');

  await prisma.phanCongGiangDay.upsert({
    where: { MaHK_MaMH: { MaHK: maHK, MaMH: maMH } },
    create: { MaHK: maHK, MaMH: maMH, MaTK: maTK },
    update: { MaTK: maTK },
  });

  return { MaHK: maHK, MaMH: maMH, MaTK: maTK, HoTen: taiKhoan.HoTen };
}

export async function removeGiangVien(maHK, maMH) {
  await prisma.phanCongGiangDay.deleteMany({
    where: { MaHK: maHK, MaMH: maMH },
  });
}

export async function listMyClasses(maTK) {
  const rows = await prisma.phanCongGiangDay.findMany({
    where: { MaTK: maTK },
    include: {
      monHocMo: {
        include: {
          monHoc: { select: { TenMH: true, SoTinChi: true, SiSoHienTai: true, SiSoToiDa: true } },
          hocKy: { select: { TenHK: true, NamHoc: true } },
        },
      },
    },
    orderBy: [{ MaHK: 'desc' }, { MaMH: 'asc' }],
  });
  return rows.map((r) => ({
    MaHK: r.MaHK,
    TenHK: r.monHocMo.hocKy.TenHK,
    NamHoc: r.monHocMo.hocKy.NamHoc,
    MaMH: r.MaMH,
    TenMH: r.monHocMo.monHoc.TenMH,
    SoTinChi: r.monHocMo.monHoc.SoTinChi,
    SiSoHienTai: r.monHocMo.monHoc.SiSoHienTai,
    SiSoToiDa: r.monHocMo.monHoc.SiSoToiDa,
  }));
}

export async function listGiangVienAccounts() {
  const rows = await prisma.taiKhoan.findMany({
    where: { VaiTro: 'GIANG_VIEN', TrangThai: 'ACTIVE' },
    select: { MaTK: true, HoTen: true, Email: true, Username: true },
    orderBy: { HoTen: 'asc' },
  });
  return rows;
}
