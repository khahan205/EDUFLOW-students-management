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
//  TIÊN QUYẾT — quản lý môn học yêu cầu (MonHocYeuCau)
// =============================================================================

export async function listYeuCau(maMH) {
  const rows = await prisma.monHocYeuCau.findMany({ where: { MaMH: maMH } });
  if (rows.length === 0) return [];
  const monHocs = await prisma.monHoc.findMany({
    where: { MaMH: { in: rows.map((r) => r.MaMHYeuCau) } },
    select: { MaMH: true, TenMH: true, MaLoaiMon: true, SoTinChi: true },
  });
  const monMap = Object.fromEntries(monHocs.map((m) => [m.MaMH, m]));
  return rows.map((r) => ({
    MaMH: r.MaMH, MaMHYeuCau: r.MaMHYeuCau,
    TenMHYeuCau: monMap[r.MaMHYeuCau]?.TenMH ?? r.MaMHYeuCau,
    MaLoaiMon: monMap[r.MaMHYeuCau]?.MaLoaiMon,
    SoTinChi: monMap[r.MaMHYeuCau]?.SoTinChi,
  }));
}

export async function addYeuCau(maMH, maMHYeuCau) {
  if (maMH === maMHYeuCau) throw ApiError.badRequest('Môn học không thể là tiên quyết của chính nó.');
  const [monHoc, monYC] = await Promise.all([
    prisma.monHoc.findUnique({ where: { MaMH: maMH } }),
    prisma.monHoc.findUnique({ where: { MaMH: maMHYeuCau } }),
  ]);
  if (!monHoc) throw ApiError.notFound(`Môn học "${maMH}" không tồn tại.`);
  if (!monYC) throw ApiError.notFound(`Môn học tiên quyết "${maMHYeuCau}" không tồn tại.`);
  await prisma.monHocYeuCau.upsert({
    where: { MaMH_MaMHYeuCau: { MaMH: maMH, MaMHYeuCau: maMHYeuCau } },
    create: { MaMH: maMH, MaMHYeuCau: maMHYeuCau },
    update: {},
  });
  return { MaMH: maMH, MaMHYeuCau: maMHYeuCau };
}

export async function removeYeuCau(maMH, maMHYeuCau) {
  await prisma.monHocYeuCau.deleteMany({ where: { MaMH: maMH, MaMHYeuCau: maMHYeuCau } });
}

// =============================================================================
//  PRICING CONFIG — đọc/ghi vào bảng ThamSo
// =============================================================================

// Theo QĐ5: LT = 27.000đ/TC, TH = 37.000đ/TC (configurable qua BM15)
const PRICING_KEYS = {
  donGiaLT: 'don_gia_lt',                              // Đơn giá Lý Thuyết / tín chỉ
  donGiaTH: 'don_gia_th',                              // Đơn giá Thực Hành / tín chỉ
  tiLeMienGiamTopDau: 'ti_le_mien_giam_top_dau',
  tiLeMienGiamVungSauVungXa: 'ti_le_mien_giam_vung_sau_xa',
};

export async function getPricingConfig() {
  const rows = await prisma.thamSo.findMany({
    where: { TenThamSo: { in: Object.values(PRICING_KEYS) } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.TenThamSo, parseFloat(r.GiaTri)]));
  return {
    donGiaLT: map[PRICING_KEYS.donGiaLT] ?? 27000,
    donGiaTH: map[PRICING_KEYS.donGiaTH] ?? 37000,
    tiLeMienGiamTopDau: map[PRICING_KEYS.tiLeMienGiamTopDau] ?? 0.5,
    tiLeMienGiamVungSauVungXa: map[PRICING_KEYS.tiLeMienGiamVungSauVungXa] ?? 0.3,
  };
}

export async function updatePricingConfig(input) {
  // 1. Lưu ThamSo
  const thamSoUpdates = Object.entries(PRICING_KEYS).map(([fe, db]) =>
    prisma.thamSo.upsert({
      where: { TenThamSo: db },
      update: { GiaTri: String(input[fe]) },
      create: { TenThamSo: db, GiaTri: String(input[fe]), KieuDuLieu: 'number', MoTa: fe === 'donGiaLT' ? 'Đơn giá Lý Thuyết / tín chỉ (VND)' : fe === 'donGiaTH' ? 'Đơn giá Thực Hành / tín chỉ (VND)' : null },
    }),
  );
  await prisma.$transaction(thamSoUpdates);

  // 2. Đồng bộ lại HocPhi của tất cả môn học theo giá mới
  if (input.donGiaLT !== undefined || input.donGiaTH !== undefined) {
    const config = await getPricingConfig();
    const monHocs = await prisma.monHoc.findMany({ select: { MaMH: true, MaLoaiMon: true, SoTinChi: true } });
    const monUpdates = monHocs.map((m) =>
      prisma.monHoc.update({
        where: { MaMH: m.MaMH },
        data: { HocPhi: m.SoTinChi * (m.MaLoaiMon === 'TH' ? config.donGiaTH : config.donGiaLT) },
      }),
    );
    await prisma.$transaction(monUpdates);
  }

  return getPricingConfig();
}
