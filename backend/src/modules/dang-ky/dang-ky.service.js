import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/api-error.js';
import { generateReceiptId } from '../../utils/id-generator.js';
import { getPricingConfig } from '../mon-hoc/mon-hoc.service.js';

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

  // Danh sách phiếu HP đã có của SV trong HK này
  const phieuHocPhi = await prisma.phieuHocPhi.findMany({
    where: { MaSV: maSV, MaHK: maHK },
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

    // 2. Verify môn + check mở trong HK
    const mh = await tx.monHoc.findUnique({ where: { MaMH: maMH } });
    if (!mh) throw ApiError.notFound(`Không tìm thấy môn "${maMH}".`);

    const isMo = await tx.monHocMo.findUnique({
      where: { MaHK_MaMH: { MaHK: maHK, MaMH: maMH } },
    });
    if (!isMo) {
      throw ApiError.badRequest(`Môn "${maMH}" không được mở trong học kỳ này.`);
    }

    // 3. Check trùng đăng ký
    const exists = await tx.phieuHocPhi.findUnique({
      where: { MaSV_MaMH_MaHK: { MaSV: maSV, MaMH: maMH, MaHK: maHK } },
    });
    if (exists) {
      throw ApiError.conflict(`Sinh viên đã đăng ký môn này rồi.`);
    }

    // 4. Check sĩ số
    if (mh.SiSoHienTai >= mh.SiSoToiDa) {
      throw ApiError.conflict(
        `Môn "${maMH}" đã đầy (${mh.SiSoHienTai}/${mh.SiSoToiDa}).`,
      );
    }

    // 5. Tính học phí
    const { soTienDangKy, soTienPhaiDong } = await calculateTuition(sv, mh);

    // 6. Sinh mã phiếu duy nhất
    const todayCount = await tx.phieuHocPhi.count({
      where: { NgayLap: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    });
    const maPhieu = generateReceiptId('HP', todayCount + 1);

    // 7. Tạo phiếu + tăng sĩ số (atomic)
    const phieu = await tx.phieuHocPhi.create({
      data: {
        MaPhieu: maPhieu,
        MaSV: maSV,
        MaMH: maMH,
        MaHK: maHK,
        SoTienDangKy: soTienDangKy,
        SoTienPhaiDong: soTienPhaiDong,
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
    if (!phieu) throw ApiError.notFound('Không tìm thấy đăng ký này.');

    // Check đã có phiếu thu chưa
    const hasPayment = await tx.phieuThu.count({
      where: { MaSV: maSV, MaHK: maHK },
    });
    if (hasPayment > 0) {
      throw ApiError.conflict(
        `Không thể huỷ vì sinh viên đã đóng tiền trong học kỳ này. ` +
        `Liên hệ phòng tài chính để xử lý.`,
      );
    }

    // Xoá phiếu + giảm sĩ số
    await tx.phieuHocPhi.delete({
      where: { MaSV_MaMH_MaHK: { MaSV: maSV, MaMH: maMH, MaHK: maHK } },
    });

    await tx.monHoc.update({
      where: { MaMH: maMH },
      data: { SiSoHienTai: { decrement: 1 } },
    });
  });
}
