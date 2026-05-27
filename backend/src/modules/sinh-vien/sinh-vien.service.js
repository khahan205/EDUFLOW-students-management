import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/api-error.js';

/**
 * Convert DB shape → FE shape.
 * FE expect: TrangThai = "Đang học" | "Bảo lưu" | "Tốt nghiệp" (vietnamese label)
 * DB stores enum: DANG_HOC | BAO_LUU | TOT_NGHIEP
 */
const STATUS_DB_TO_VI = {
  DANG_HOC: 'Đang học',
  BAO_LUU: 'Bảo lưu',
  TOT_NGHIEP: 'Tốt nghiệp',
};
const STATUS_VI_TO_DB = Object.fromEntries(
  Object.entries(STATUS_DB_TO_VI).map(([k, v]) => [v, k]),
);

function toResponse(sv) {
  if (!sv) return null;
  return {
    MaSV: sv.MaSV,
    TenSV: sv.TenSV,
    NgaySinh: sv.NgaySinh ? sv.NgaySinh.toISOString().slice(0, 10) : null,
    GioiTinh: sv.GioiTinh,
    TenLop: sv.TenLop,
    Email: sv.Email,
    MaQueQuan: sv.MaQueQuan,
    MaDoiTuong: sv.MaDoiTuong,
    MaNganh: sv.MaNganh,
    TrangThai: STATUS_DB_TO_VI[sv.TrangThai] ?? sv.TrangThai,
  };
}

/**
 * Normalize input cho cả create và update:
 *   - Chuyển TrangThai "Đang học" → "DANG_HOC" nếu FE gửi label vietnam
 *   - Chuyển NgaySinh string → Date
 *   - Trim empty strings → null cho optional fields
 */
function normalizeInput(input) {
  const out = { ...input };
  if (out.TrangThai && STATUS_VI_TO_DB[out.TrangThai]) {
    out.TrangThai = STATUS_VI_TO_DB[out.TrangThai];
  }
  if (out.NgaySinh) {
    out.NgaySinh = new Date(out.NgaySinh);
  } else if (out.NgaySinh === '') {
    out.NgaySinh = null;
  }
  // Empty string → null cho FK fields để tránh foreign key constraint
  for (const k of ['MaQueQuan', 'MaDoiTuong', 'MaNganh', 'Email', 'TenLop', 'GioiTinh']) {
    if (out[k] === '') out[k] = null;
  }
  return out;
}

export async function list() {
  const rows = await prisma.sinhVien.findMany({
    orderBy: { MaSV: 'asc' },
  });
  return rows.map(toResponse);
}

export async function getByMa(maSV) {
  const sv = await prisma.sinhVien.findUnique({ where: { MaSV: maSV } });
  if (!sv) throw ApiError.notFound(`Không tìm thấy sinh viên có mã "${maSV}".`);
  return toResponse(sv);
}

export async function create(input) {
  const data = normalizeInput(input);

  const exists = await prisma.sinhVien.findUnique({ where: { MaSV: data.MaSV } });
  if (exists) throw ApiError.conflict(`Mã SV "${data.MaSV}" đã tồn tại.`);

  const sv = await prisma.sinhVien.create({ data });
  return toResponse(sv);
}

export async function update(maSV, input) {
  const data = normalizeInput(input);

  const exists = await prisma.sinhVien.findUnique({ where: { MaSV: maSV } });
  if (!exists) throw ApiError.notFound(`Không tìm thấy sinh viên "${maSV}".`);

  const sv = await prisma.sinhVien.update({ where: { MaSV: maSV }, data });
  return toResponse(sv);
}

export async function remove(maSV) {
  const exists = await prisma.sinhVien.findUnique({ where: { MaSV: maSV } });
  if (!exists) throw ApiError.notFound(`Không tìm thấy sinh viên "${maSV}".`);

  // Check ràng buộc: SV có phiếu học phí hoặc phiếu thu thì không cho xoá
  const hasPhieuHocPhi = await prisma.phieuHocPhi.count({ where: { MaSV: maSV } });
  if (hasPhieuHocPhi > 0) {
    throw ApiError.conflict(
      `Không thể xoá SV "${maSV}" vì đã có ${hasPhieuHocPhi} phiếu học phí. ` +
      `Hãy cập nhật trạng thái thành "Tốt nghiệp" hoặc "Bảo lưu" thay vì xoá.`,
    );
  }

  await prisma.sinhVien.delete({ where: { MaSV: maSV } });
}
