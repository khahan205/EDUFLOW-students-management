import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/api-error.js';

export async function listCTH(maNganh) {
  const rows = await prisma.chuongTrinhHoc.findMany({
    where: maNganh ? { MaNganh: maNganh } : undefined,
    include: { monHoc: true, nganh: true },
    orderBy: [{ MaNganh: 'asc' }, { HocKy: 'asc' }],
  });
  return rows.map((r) => ({
    MaCTH: r.MaCTH,
    MaNganh: r.MaNganh,
    TenNganh: r.nganh.TenNganh,
    MaMH: r.MaMH,
    TenMH: r.monHoc.TenMH,
    SoTinChi: r.monHoc.SoTinChi,
    HocKy: r.HocKy,
  }));
}

export async function addToCTH({ maNganh, maMH, hocKy }) {
  const [nganh, mh] = await Promise.all([
    prisma.nganhHoc.findUnique({ where: { MaNganh: maNganh } }),
    prisma.monHoc.findUnique({ where: { MaMH: maMH } }),
  ]);
  if (!nganh) throw ApiError.notFound(`Ngành "${maNganh}" không tồn tại.`);
  if (!mh) throw ApiError.notFound(`Môn học "${maMH}" không tồn tại.`);

  const existing = await prisma.chuongTrinhHoc.findUnique({
    where: { MaNganh_MaMH: { MaNganh: maNganh, MaMH: maMH } },
  });
  if (existing) throw ApiError.conflict(`Môn "${maMH}" đã có trong chương trình ngành "${maNganh}".`);

  const row = await prisma.chuongTrinhHoc.create({
    data: { MaNganh: maNganh, MaMH: maMH, HocKy: Number(hocKy) },
  });
  return { MaCTH: row.MaCTH, MaNganh: row.MaNganh, MaMH: row.MaMH, HocKy: row.HocKy };
}

export async function updateCTH(maCTH, { hocKy }) {
  const id = parseInt(maCTH, 10);
  const exists = await prisma.chuongTrinhHoc.findUnique({ where: { MaCTH: id } });
  if (!exists) throw ApiError.notFound('Không tìm thấy bản ghi.');
  const row = await prisma.chuongTrinhHoc.update({
    where: { MaCTH: id },
    data: { HocKy: Number(hocKy) },
  });
  return row;
}

export async function removeFromCTH(maCTH) {
  const id = parseInt(maCTH, 10);
  const exists = await prisma.chuongTrinhHoc.findUnique({ where: { MaCTH: id } });
  if (!exists) throw ApiError.notFound('Không tìm thấy bản ghi.');
  await prisma.chuongTrinhHoc.delete({ where: { MaCTH: id } });
}
