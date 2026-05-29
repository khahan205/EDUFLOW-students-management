import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/api-error.js';

export async function listCTH({ maNganh }) {
  const rows = await prisma.chuongTrinhHoc.findMany({
    where: maNganh ? { MaNganh: maNganh } : undefined,
    include: {
      nganh:  { select: { TenNganh: true, MaKhoa: true } },
      monHoc: { select: { TenMH: true, SoTinChi: true, MaLoaiMon: true } },
    },
    orderBy: [{ MaNganh: 'asc' }, { HocKy: 'asc' }],
  });
  return rows.map((r) => ({
    MaCTH: r.MaCTH, MaNganh: r.MaNganh, TenNganh: r.nganh.TenNganh,
    MaKhoa: r.nganh.MaKhoa, MaMH: r.MaMH, TenMH: r.monHoc.TenMH,
    SoTinChi: r.monHoc.SoTinChi, MaLoaiMon: r.monHoc.MaLoaiMon, HocKy: r.HocKy,
  }));
}

export async function addCTH({ maNganh, maMH, hocKy }) {
  const [nganh, monHoc] = await Promise.all([
    prisma.nganhHoc.findUnique({ where: { MaNganh: maNganh } }),
    prisma.monHoc.findUnique({ where: { MaMH: maMH } }),
  ]);
  if (!nganh)  throw ApiError.notFound(`Nganh "${maNganh}" khong ton tai.`);
  if (!monHoc) throw ApiError.notFound(`Mon hoc "${maMH}" khong ton tai.`);
  const exists = await prisma.chuongTrinhHoc.findFirst({ where: { MaNganh: maNganh, MaMH: maMH } });
  if (exists) throw ApiError.conflict(`Mon "${maMH}" da co trong chuong trinh nganh "${maNganh}".`);
  return prisma.chuongTrinhHoc.create({ data: { MaNganh: maNganh, MaMH: maMH, HocKy: Number(hocKy) } });
}

export async function updateCTH(maCTH, { hocKy }) {
  const exists = await prisma.chuongTrinhHoc.findUnique({ where: { MaCTH: Number(maCTH) } });
  if (!exists) throw ApiError.notFound('Khong tim thay muc chuong trinh hoc.');
  return prisma.chuongTrinhHoc.update({ where: { MaCTH: Number(maCTH) }, data: { HocKy: Number(hocKy) } });
}

export async function deleteCTH(maCTH) {
  const exists = await prisma.chuongTrinhHoc.findUnique({ where: { MaCTH: Number(maCTH) } });
  if (!exists) throw ApiError.notFound('Khong tim thay muc chuong trinh hoc.');
  await prisma.chuongTrinhHoc.delete({ where: { MaCTH: Number(maCTH) } });
}
