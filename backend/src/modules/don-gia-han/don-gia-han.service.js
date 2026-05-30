import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/api-error.js';

export async function listDonGiaHan({ trangThai, maSV, maHK } = {}) {
  const rows = await prisma.donGiaHan.findMany({
    where: {
      ...(trangThai ? { TrangThai: trangThai } : {}),
      ...(maSV ? { MaSV: maSV } : {}),
      ...(maHK ? { MaHK: maHK } : {}),
    },
    include: {
      sinhVien: { select: { TenSV: true, TenLop: true } },
      hocKy:    { select: { TenHK: true, NamHoc: true } },
    },
    orderBy: { NgayNop: 'desc' },
  });
  return rows.map((r) => ({
    MaDon: r.MaDon, MaSV: r.MaSV, TenSV: r.sinhVien.TenSV, TenLop: r.sinhVien.TenLop,
    MaHK: r.MaHK, TenHK: r.hocKy.TenHK, NamHoc: r.hocKy.NamHoc,
    LyDo: r.LyDo, TrangThai: r.TrangThai,
    NgayNop: r.NgayNop.toISOString(),
    NgayXuLy: r.NgayXuLy?.toISOString() ?? null,
    NgayGiaHan: r.NgayGiaHan?.toISOString().slice(0, 10) ?? null,
    GhiChuAdmin: r.GhiChuAdmin ?? '',
  }));
}

export async function createDon({ maSV, maHK, lyDo }) {
  const [sv, hk] = await Promise.all([
    prisma.sinhVien.findUnique({ where: { MaSV: maSV } }),
    prisma.hocKy.findUnique({ where: { MaHK: maHK } }),
  ]);
  if (!sv) throw ApiError.notFound(`Sinh vien "${maSV}" khong ton tai.`);
  if (!hk) throw ApiError.notFound(`Hoc ky "${maHK}" khong ton tai.`);
  const existing = await prisma.donGiaHan.findFirst({
    where: { MaSV: maSV, MaHK: maHK, TrangThai: 'CHO_DUYET' },
  });
  if (existing) throw ApiError.conflict('Sinh vien da co don gia han dang cho duyet trong hoc ky nay.');
  return prisma.donGiaHan.create({ data: { MaSV: maSV, MaHK: maHK, LyDo: lyDo } });
}

export async function duyetDon(maDon, { ngayGiaHan, ghiChu }) {
  const don = await prisma.donGiaHan.findUnique({ where: { MaDon: maDon } });
  if (!don) throw ApiError.notFound('Khong tim thay don gia han.');
  if (don.TrangThai !== 'CHO_DUYET') throw ApiError.conflict('Don nay da duoc xu ly roi.');
  await prisma.$transaction(async (tx) => {
    await tx.donGiaHan.update({
      where: { MaDon: maDon },
      data: { TrangThai: 'DA_DUYET', NgayXuLy: new Date(), NgayGiaHan: new Date(ngayGiaHan), GhiChuAdmin: ghiChu ?? null },
    });
    if (ngayGiaHan) {
      await tx.phieuHocPhi.updateMany({
        where: { MaSV: don.MaSV, MaHK: don.MaHK, TrangThai: 'ACTIVE' },
        data: { HanDong: new Date(ngayGiaHan) },
      });
    }
  });
}

export async function tuChoiDon(maDon, { ghiChu }) {
  const don = await prisma.donGiaHan.findUnique({ where: { MaDon: maDon } });
  if (!don) throw ApiError.notFound('Khong tim thay don gia han.');
  if (don.TrangThai !== 'CHO_DUYET') throw ApiError.conflict('Don nay da duoc xu ly roi.');
  await prisma.donGiaHan.update({
    where: { MaDon: maDon },
    data: { TrangThai: 'TU_CHOI', NgayXuLy: new Date(), GhiChuAdmin: ghiChu ?? null },
  });
}
