import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/api-error.js';

export async function listMonHocMo(maHK) {
  const rows = await prisma.monHocMo.findMany({
    where: maHK ? { MaHK: maHK } : undefined,
    include: {
      monHoc: true,
      hocKy: true,
      phanCong: {
        include: { taiKhoan: { select: { MaTK: true, HoTen: true, Email: true } } },
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
    SiSoHienTai: r.monHoc.SiSoHienTai,
    SiSoToiDa: r.SiSoToiDa ?? r.monHoc.SiSoToiDa,
    GiangVien: r.phanCong
      ? { MaTK: r.phanCong.taiKhoan.MaTK, HoTen: r.phanCong.taiKhoan.HoTen, Email: r.phanCong.taiKhoan.Email }
      : null,
  }));
}

export async function openCourse({ maHK, maMH, siSoToiDa }) {
  const [hk, mh] = await Promise.all([
    prisma.hocKy.findUnique({ where: { MaHK: maHK } }),
    prisma.monHoc.findUnique({ where: { MaMH: maMH } }),
  ]);
  if (!hk) throw ApiError.notFound(`Học kỳ "${maHK}" không tồn tại.`);
  if (!mh) throw ApiError.notFound(`Môn học "${maMH}" không tồn tại.`);

  const exists = await prisma.monHocMo.findUnique({
    where: { MaHK_MaMH: { MaHK: maHK, MaMH: maMH } },
  });
  if (exists) throw ApiError.conflict(`Môn "${maMH}" đã được mở trong học kỳ "${maHK}".`);

  await prisma.monHocMo.create({
    data: { MaHK: maHK, MaMH: maMH, SiSoToiDa: siSoToiDa ?? null },
  });
  return { MaHK: maHK, MaMH: maMH };
}

export async function updateCourse(maHK, maMH, { siSoToiDa }) {
  const exists = await prisma.monHocMo.findUnique({
    where: { MaHK_MaMH: { MaHK: maHK, MaMH: maMH } },
  });
  if (!exists) throw ApiError.notFound(`Lớp học phần không tồn tại.`);

  await prisma.monHocMo.update({
    where: { MaHK_MaMH: { MaHK: maHK, MaMH: maMH } },
    data: { SiSoToiDa: siSoToiDa ?? null },
  });
}

export async function closeCourse(maHK, maMH) {
  const dangKyCount = await prisma.phieuHocPhi.count({
    where: { MaHK: maHK, MaMH: maMH },
  });
  if (dangKyCount > 0) {
    throw ApiError.conflict(
      `Không thể xoá lớp "${maMH}" vì đã có ${dangKyCount} sinh viên đăng ký.`,
    );
  }
  await prisma.monHocMo.deleteMany({ where: { MaHK: maHK, MaMH: maMH } });
}
