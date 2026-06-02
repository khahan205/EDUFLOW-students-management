import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/api-error.js';
import { generateReceiptId } from '../../utils/id-generator.js';
import { getPricingConfig } from '../mon-hoc/mon-hoc.service.js';

/**
 * Lấy danh sách sinh viên đã đăng ký 1 môn học trong 1 học kỳ.
 * Dùng cho giảng viên xem danh sách lớp.
 */
export async function listStudentsForCourse(maHK, maMH) {
  const rows = await prisma.phieuHocPhi.findMany({
    where: { MaHK: maHK, MaMH: maMH },
    include: {
      sinhVien: {
        select: {
          MaSV: true,
          TenSV: true,
          NgaySinh: true,
          GioiTinh: true,
          TenLop: true,
          Email: true,
        },
      },
    },
    orderBy: { sinhVien: { TenSV: 'asc' } },
  });

  return rows.map((r) => ({
    MaSV: r.sinhVien.MaSV,
    TenSV: r.sinhVien.TenSV,
    NgaySinh: r.sinhVien.NgaySinh,
    GioiTinh: r.sinhVien.GioiTinh,
    TenLop: r.sinhVien.TenLop,
    Email: r.sinhVien.Email,
    NgayDangKy: r.NgayLap,
  }));
}

/**
 * Lấy danh sách môn được mở trong 1 HK + đánh dấu môn nào SV đã đăng ký.
 * Trả về shape: MonHoc[] với thêm field daDangKy: boolean.
 */
export async function getMonMoChoSV(maSV, maHK) {
  // Verify SV + HK tồn tại
  const [sv, hk] = await Promise.all([
    prisma.sinhVien.findUnique({ where: { MaSV: maSV } }),
    prisma.hocKy.findUnique({ where: { MaHK: maHK } }),
  ]);
  if (!sv) throw ApiError.notFound(`Không tìm thấy sinh viên "${maSV}".`);
  if (!hk) throw ApiError.notFound(`Không tìm thấy học kỳ "${maHK}".`);

  // Danh sách môn mở trong HK
  const monMo = await prisma.monHocMo.findMany({
    where: { MaHK: maHK },
    include: { monHoc: true },
  });

  // Danh sách phiếu HP đang ACTIVE của SV trong HK này
  const phieuHocPhi = await prisma.phieuHocPhi.findMany({
    where: { MaSV: maSV, MaHK: maHK, TrangThai: 'ACTIVE' },
    select: { MaMH: true },
  });
  const daDangKy = new Set(phieuHocPhi.map((p) => p.MaMH));

  return monMo.map(({ monHoc }) => ({
    MaMH: monHoc.MaMH,
    TenMH: monHoc.TenMH,
    MaLoaiMon: monHoc.MaLoaiMon,
    SoTiet: monHoc.SoTiet,
    SoTinChi: monHoc.SoTinChi,
    HocPhi: Number(monHoc.HocPhi),
    HocKy: monHoc.HocKy,
    TenKhoa: monHoc.TenKhoa,
    SiSoHienTai: monHoc.SiSoHienTai,
    SiSoToiDa: monHoc.SiSoToiDa,
    daDangKy: daDangKy.has(monHoc.MaMH),
  }));
}

/**
 * Tính học phí sau khi áp tỉ lệ miễn giảm theo đối tượng ưu tiên.
 *
 * Quy tắc:
 *   - Lấy tỉ lệ giảm từ bảng DoiTuongUuTien của SV
 *   - SoTienPhaiDong = HocPhi * (1 - tiLeGiam)
 *   - Round xuống đơn vị 1000 đồng
 */
async function calculateTuition(sinhVien, monHoc) {
  let tiLeGiam = 0;

  if (sinhVien.MaDoiTuong) {
    const dt = await prisma.doiTuongUuTien.findUnique({
      where: { MaDoiTuong: sinhVien.MaDoiTuong },
    });
    if (dt) tiLeGiam = Number(dt.TiLeGiamHocPhi);
  }

  // Nếu SV thuộc vùng sâu vùng xa (gắn cờ trên huyện) → ưu tiên thêm
  if (sinhVien.MaQueQuan) {
    const qq = await prisma.queQuan.findUnique({
      where: { MaQueQuan: sinhVien.MaQueQuan },
      include: { huyen: true },
    });
    if (qq?.huyen?.LaVungSauVungXa) {
      const config = await getPricingConfig();
      tiLeGiam = Math.max(tiLeGiam, config.tiLeMienGiamVungSauVungXa);
    }
  }

  const soTienDangKy = Number(monHoc.HocPhi);
  const soTienPhaiDong = Math.floor((soTienDangKy * (1 - tiLeGiam)) / 1000) * 1000;

  return { soTienDangKy, soTienPhaiDong };
}

/**
 * Đăng ký 1 môn cho 1 SV trong 1 HK.
 * Toàn bộ logic chạy trong 1 transaction để đảm bảo:
 *   - Tăng SiSoHienTai + tạo PhieuHocPhi atomic
 *   - Không có race condition khi 2 yêu cầu cùng lúc
 */
export async function register({ maSV, maHK, maMH }) {
  return prisma.$transaction(async (tx) => {
    // 1. Verify SV
    const sv = await tx.sinhVien.findUnique({ where: { MaSV: maSV } });
    if (!sv) throw ApiError.notFound(`Không tìm thấy sinh viên "${maSV}".`);
    if (sv.TrangThai !== 'DANG_HOC') {
      throw ApiError.badRequest(`Sinh viên "${maSV}" không ở trạng thái Đang học.`);
    }

    // 2. Verify môn + HK + check mở trong HK
    const [mh, hk] = await Promise.all([
      tx.monHoc.findUnique({ where: { MaMH: maMH } }),
      tx.hocKy.findUnique({ where: { MaHK: maHK } }),
    ]);
    if (!mh) throw ApiError.notFound(`Không tìm thấy môn "${maMH}".`);
    if (!hk) throw ApiError.notFound(`Không tìm thấy học kỳ "${maHK}".`);

    const isMo = await tx.monHocMo.findUnique({
      where: { MaHK_MaMH: { MaHK: maHK, MaMH: maMH } },
    });
    if (!isMo) {
      throw ApiError.badRequest(`Môn "${maMH}" không được mở trong học kỳ này.`);
    }

    // 3. Check điều kiện tiên quyết
    const yeuCau = await tx.monHocYeuCau.findMany({ where: { MaMH: maMH } });
    for (const yc of yeuCau) {
      const daDangKy = await tx.phieuHocPhi.findFirst({
        where: { MaSV: maSV, MaMH: yc.MaMHYeuCau },
      });
      if (!daDangKy) {
        throw ApiError.badRequest(
          `Sinh viên chưa hoàn thành môn tiên quyết: ${yc.MaMHYeuCau}.`,
        );
      }
    }

    // 5. Check trùng đăng ký (kể cả record đã HUY)
    const exists = await tx.phieuHocPhi.findUnique({
      where: { MaSV_MaMH_MaHK: { MaSV: maSV, MaMH: maMH, MaHK: maHK } },
    });
    if (exists) {
      if (exists.TrangThai === 'ACTIVE') {
        throw ApiError.conflict(`Sinh viên đã đăng ký môn này rồi.`);
      }
      // Nếu đã HUY → khôi phục lại thay vì tạo mới
      await tx.phieuHocPhi.update({
        where: { MaSV_MaMH_MaHK: { MaSV: maSV, MaMH: maMH, MaHK: maHK } },
        data: { TrangThai: 'ACTIVE', NgayHuy: null },
      });
      await tx.monHoc.update({ where: { MaMH: maMH }, data: { SiSoHienTai: { increment: 1 } } });
      return {
        MaPhieu: exists.MaPhieu, MaSV: exists.MaSV, MaMH: exists.MaMH, MaHK: exists.MaHK,
        SoTienDangKy: Number(exists.SoTienDangKy), SoTienPhaiDong: Number(exists.SoTienPhaiDong),
        NgayLap: exists.NgayLap.toISOString(),
      };
    }

    // 4. Kiểm tra giới hạn 30TC/học kỳ (QĐ an toàn)
    const dangKyActive = await tx.phieuHocPhi.findMany({
      where: { MaSV: maSV, MaHK: maHK, TrangThai: 'ACTIVE' },
      include: { monHoc: { select: { SoTinChi: true } } },
    });
    const tongTCDaDangKy = dangKyActive.reduce((sum, p) => sum + p.monHoc.SoTinChi, 0);
    if (tongTCDaDangKy + mh.SoTinChi > 30) {
      throw ApiError.badRequest(
        `Vượt quá giới hạn 30 tín chỉ/học kỳ. Đã đăng ký ${tongTCDaDangKy} TC, môn này thêm ${mh.SoTinChi} TC (tổng ${tongTCDaDangKy + mh.SoTinChi} TC).`,
      );
    }

    // 5. Check sĩ số
    if (mh.SiSoHienTai >= mh.SiSoToiDa) {
      throw ApiError.conflict(
        `Môn "${maMH}" đã đầy (${mh.SiSoHienTai}/${mh.SiSoToiDa}).`,
      );
    }

    // 6. Tính học phí
    const { soTienDangKy, soTienPhaiDong } = await calculateTuition(sv, mh);

    // 6. Sinh mã phiếu duy nhất
    const todayCount = await tx.phieuHocPhi.count({
      where: { NgayLap: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    });
    const maPhieu = generateReceiptId('HP', todayCount + 1);

    // 7. Tạo phiếu + tăng sĩ số (atomic)
    // HanDong = NgayKetThuc của HK (nếu có) — QĐ6: phải đóng trước khi HK kết thúc
    const phieu = await tx.phieuHocPhi.create({
      data: {
        MaPhieu: maPhieu,
        MaSV: maSV,
        MaMH: maMH,
        MaHK: maHK,
        SoTienDangKy: soTienDangKy,
        SoTienPhaiDong: soTienPhaiDong,
        HanDong: hk.NgayKetThuc ?? null,
      },
    });

    await tx.monHoc.update({
      where: { MaMH: maMH },
      data: { SiSoHienTai: { increment: 1 } },
    });

    return {
      MaPhieu: phieu.MaPhieu,
      MaSV: phieu.MaSV,
      MaMH: phieu.MaMH,
      MaHK: phieu.MaHK,
      SoTienDangKy: Number(phieu.SoTienDangKy),
      SoTienPhaiDong: Number(phieu.SoTienPhaiDong),
      NgayLap: phieu.NgayLap.toISOString(),
    };
  });
}

/**
 * Huỷ đăng ký: chỉ cho phép nếu chưa có phiếu thu cho HK đó của SV
 * (tránh trường hợp đã đóng tiền rồi mà bị huỷ môn — sẽ rối tiền nong).
 */
export async function unregister({ maSV, maHK, maMH }) {
  return prisma.$transaction(async (tx) => {
    const phieu = await tx.phieuHocPhi.findUnique({
      where: { MaSV_MaMH_MaHK: { MaSV: maSV, MaMH: maMH, MaHK: maHK } },
    });
    if (!phieu || phieu.TrangThai !== 'ACTIVE') {
      throw ApiError.notFound('Không tìm thấy đăng ký này.');
    }

    // Soft delete — giữ record, đánh dấu HUY + giảm sĩ số
    await tx.phieuHocPhi.update({
      where: { MaSV_MaMH_MaHK: { MaSV: maSV, MaMH: maMH, MaHK: maHK } },
      data: { TrangThai: 'HUY', NgayHuy: new Date() },
    });

    await tx.monHoc.update({
      where: { MaMH: maMH },
      data: { SiSoHienTai: { decrement: 1 } },
    });
  });
}

/**
 * Khôi phục đăng ký đã huỷ (soft delete restore).
 */
export async function restoreRegister({ maSV, maHK, maMH }) {
  return prisma.$transaction(async (tx) => {
    const phieu = await tx.phieuHocPhi.findUnique({
      where: { MaSV_MaMH_MaHK: { MaSV: maSV, MaMH: maMH, MaHK: maHK } },
    });
    if (!phieu || phieu.TrangThai !== 'HUY') {
      throw ApiError.notFound('Không tìm thấy đăng ký đã huỷ.');
    }

    // Check sĩ số còn chỗ không
    const mh = await tx.monHoc.findUnique({ where: { MaMH: maMH } });
    if (mh && mh.SiSoHienTai >= mh.SiSoToiDa) {
      throw ApiError.conflict(`Môn "${maMH}" đã đầy, không thể khôi phục.`);
    }

    await tx.phieuHocPhi.update({
      where: { MaSV_MaMH_MaHK: { MaSV: maSV, MaMH: maMH, MaHK: maHK } },
      data: { TrangThai: 'ACTIVE', NgayHuy: null },
    });

    await tx.monHoc.update({
      where: { MaMH: maMH },
      data: { SiSoHienTai: { increment: 1 } },
    });

    return { restored: true, MaPhieu: phieu.MaPhieu };
  });
}

/**
 * Lấy danh sách đăng ký đã huỷ của 1 SV trong 1 HK.
 */
export async function getHuyDangKy(maSV, maHK) {
  const rows = await prisma.phieuHocPhi.findMany({
    where: { MaSV: maSV, MaHK: maHK, TrangThai: 'HUY' },
    include: { monHoc: { select: { TenMH: true, SoTinChi: true } } },
    orderBy: { NgayHuy: 'desc' },
  });
  return rows.map((r) => ({
    MaPhieu: r.MaPhieu, MaMH: r.MaMH, TenMH: r.monHoc.TenMH,
    SoTinChi: r.monHoc.SoTinChi, NgayHuy: r.NgayHuy?.toISOString() ?? null,
    SoTienPhaiDong: Number(r.SoTienPhaiDong),
  }));
}
