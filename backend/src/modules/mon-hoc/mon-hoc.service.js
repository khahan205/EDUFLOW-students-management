import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/api-error.js';

function toResponse(mh) {
  if (!mh) return null;
  return {
    MaMH: mh.MaMH,
    TenMH: mh.TenMH,
    MaLoaiMon: mh.MaLoaiMon,
    SoTiet: mh.SoTiet,
    SoTinChi: mh.SoTinChi,
    HocPhi: Number(mh.HocPhi),
    HocKy: mh.HocKy,
    TenKhoa: mh.TenKhoa,
    SiSoHienTai: mh.SiSoHienTai,
    SiSoToiDa: mh.SiSoToiDa,
  };
}

export async function list() {
  const rows = await prisma.monHoc.findMany({ orderBy: { MaMH: 'asc' } });
  return rows.map(toResponse);
}

export async function getByMa(maMH) {
  const mh = await prisma.monHoc.findUnique({ where: { MaMH: maMH } });
  if (!mh) throw ApiError.notFound(`Không tìm thấy môn học "${maMH}".`);
  return toResponse(mh);
}

export async function create(input) {
  const exists = await prisma.monHoc.findUnique({ where: { MaMH: input.MaMH } });
  if (exists) throw ApiError.conflict(`Mã môn "${input.MaMH}" đã tồn tại.`);

  // Verify foreign key
  const loaiMon = await prisma.loaiMon.findUnique({ where: { MaLoaiMon: input.MaLoaiMon } });
  if (!loaiMon) throw ApiError.badRequest(`Loại môn "${input.MaLoaiMon}" không hợp lệ.`);

  const mh = await prisma.monHoc.create({
    data: { ...input, SiSoHienTai: 0 },
  });
  return toResponse(mh);
}

export async function update(maMH, input) {
  const exists = await prisma.monHoc.findUnique({ where: { MaMH: maMH } });
  if (!exists) throw ApiError.notFound(`Không tìm thấy môn học "${maMH}".`);

  // Không cho giảm SiSoToiDa xuống dưới SiSoHienTai
  if (input.SiSoToiDa !== undefined && input.SiSoToiDa < exists.SiSoHienTai) {
    throw ApiError.badRequest(
      `Không thể đặt sĩ số tối đa (${input.SiSoToiDa}) nhỏ hơn sĩ số hiện tại (${exists.SiSoHienTai}).`,
    );
  }

  const mh = await prisma.monHoc.update({ where: { MaMH: maMH }, data: input });
  return toResponse(mh);
}

export async function remove(maMH) {
  const exists = await prisma.monHoc.findUnique({ where: { MaMH: maMH } });
  if (!exists) throw ApiError.notFound(`Không tìm thấy môn học "${maMH}".`);

  // Không cho xoá môn đã có đăng ký
  const hasEnroll = await prisma.phieuHocPhi.count({ where: { MaMH: maMH } });
  if (hasEnroll > 0) {
    throw ApiError.conflict(
      `Không thể xoá môn "${maMH}" vì đã có ${hasEnroll} sinh viên đăng ký.`,
    );
  }

  // Xoá môn mở liên quan trước (cascade thủ công cho an toàn)
  await prisma.$transaction([
    prisma.monHocMo.deleteMany({ where: { MaMH: maMH } }),
    prisma.monHoc.delete({ where: { MaMH: maMH } }),
  ]);
}

// =============================================================================
//  PRICING CONFIG — đọc/ghi vào bảng ThamSo
// =============================================================================

const PRICING_KEYS = {
  donGiaTinChi: 'don_gia_tin_chi',
  heSoLT: 'he_so_lt',
  heSoTH: 'he_so_th',
  tiLeMienGiamTopDau: 'ti_le_mien_giam_top_dau',
  tiLeMienGiamVungSauVungXa: 'ti_le_mien_giam_vung_sau_xa',
};

export async function getPricingConfig() {
  const rows = await prisma.thamSo.findMany({
    where: { TenThamSo: { in: Object.values(PRICING_KEYS) } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.TenThamSo, parseFloat(r.GiaTri)]));
  return {
    donGiaTinChi: map[PRICING_KEYS.donGiaTinChi] ?? 500000,
    heSoLT: map[PRICING_KEYS.heSoLT] ?? 1.0,
    heSoTH: map[PRICING_KEYS.heSoTH] ?? 1.5,
    tiLeMienGiamTopDau: map[PRICING_KEYS.tiLeMienGiamTopDau] ?? 0.5,
    tiLeMienGiamVungSauVungXa: map[PRICING_KEYS.tiLeMienGiamVungSauVungXa] ?? 0.3,
  };
}

export async function updatePricingConfig(input) {
  const updates = Object.entries(PRICING_KEYS).map(([fe, db]) =>
    prisma.thamSo.upsert({
      where: { TenThamSo: db },
      update: { GiaTri: String(input[fe]) },
      create: { TenThamSo: db, GiaTri: String(input[fe]), KieuDuLieu: 'number' },
    }),
  );
  await prisma.$transaction(updates);
  return getPricingConfig();
}
