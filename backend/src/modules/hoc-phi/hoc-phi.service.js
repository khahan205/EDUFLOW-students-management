import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/api-error.js';
import { generateReceiptId } from '../../utils/id-generator.js';

/**
 * Lấy danh sách "tình trạng học phí" — mỗi row = 1 (SV, HK).
 * Tổng = sum(SoTienPhaiDong của tất cả PhieuHocPhi).
 * Đã đóng = sum(SoTienThu của tất cả PhieuThu).
 * Còn lại = Tổng - Đã đóng.
 * Trạng thái = "Chưa ĐT" | "Đã ĐT 1 phần" | "Đã ĐT" tuỳ tỉ lệ.
 */
export async function listHocPhiRows() {
  // Aggregate PhieuHocPhi theo (MaSV, MaHK)
  const phieuHocPhiAgg = await prisma.phieuHocPhi.groupBy({
    by: ['MaSV', 'MaHK'],
    where: { TrangThai: 'ACTIVE' },
    _sum: { SoTienPhaiDong: true },
  });

  // Aggregate PhieuThu theo (MaSV, MaHK)
  const phieuThuAgg = await prisma.phieuThu.groupBy({
    by: ['MaSV', 'MaHK'],
    _sum: { SoTienThu: true },
  });

  // Map SV + HK info
  const allMaSV = [...new Set(phieuHocPhiAgg.map((r) => r.MaSV))];
  const allMaHK = [...new Set(phieuHocPhiAgg.map((r) => r.MaHK))];

  const [svList, hkList] = await Promise.all([
    prisma.sinhVien.findMany({
      where: { MaSV: { in: allMaSV } },
      select: { MaSV: true, TenSV: true },
    }),
    prisma.hocKy.findMany({
      where: { MaHK: { in: allMaHK } },
      select: { MaHK: true, TenHK: true },
    }),
  ]);

  const svMap = Object.fromEntries(svList.map((s) => [s.MaSV, s.TenSV]));
  const hkMap = Object.fromEntries(hkList.map((h) => [h.MaHK, h.TenHK]));
  const thuMap = Object.fromEntries(
    phieuThuAgg.map((r) => [`${r.MaSV}|${r.MaHK}`, Number(r._sum.SoTienThu) || 0]),
  );

  return phieuHocPhiAgg.map((r) => {
    const tong = Number(r._sum.SoTienPhaiDong) || 0;
    const daDong = thuMap[`${r.MaSV}|${r.MaHK}`] || 0;
    const conLai = Math.max(0, tong - daDong);
    let trangThai = 'Chưa ĐT';
    if (conLai === 0 && daDong > 0) trangThai = 'Đã ĐT';
    else if (daDong > 0) trangThai = 'Đã ĐT 1 phần';

    return {
      MaSV: r.MaSV,
      TenSV: svMap[r.MaSV] ?? r.MaSV,
      MaHK: r.MaHK,
      TenHK: hkMap[r.MaHK] ?? r.MaHK,
      Tong: tong,
      DaDong: daDong,
      ConLai: conLai,
      TrangThai: trangThai,
    };
  });
}

/**
 * Lịch sử thu của 1 SV trong 1 HK.
 */
export async function getHistory(maSV, maHK) {
  const rows = await prisma.phieuThu.findMany({
    where: { MaSV: maSV, MaHK: maHK },
    orderBy: { NgayThu: 'asc' },
  });
  return rows.map((p) => ({
    MaPhieuThu: p.MaPhieuThu,
    MaSV: p.MaSV,
    MaHK: p.MaHK,
    NgayThu: p.NgayThu.toISOString(),
    SoTienThu: Number(p.SoTienThu),
    HinhThucTT: p.HinhThucTT,
    GhiChu: p.GhiChu,
  }));
}

/**
 * Lập phiếu thu mới.
 *
 * Business rules:
 *   - SV phải có ít nhất 1 PhieuHocPhi trong HK này (đã đăng ký môn)
 *   - SoTienThu > 0
 *   - SoTienThu cộng dồn không vượt tổng SoTienPhaiDong
 *   - Sinh MaPhieuThu duy nhất
 *   - Toàn bộ chạy trong transaction để đảm bảo no race condition
 */
export async function pay({ maSV, maHK, soTien, ghiChu, hinhThucTT }) {
  return prisma.$transaction(async (tx) => {
    // QĐ6: Kiểm tra thời hạn — vẫn cho thu nhưng ghi chú trễ hạn để tracking
    const hk = await tx.hocKy.findUnique({ where: { MaHK: maHK } });
    const treHan = hk?.NgayKetThuc && new Date() > new Date(hk.NgayKetThuc);
    if (treHan) {
      const hanStr = new Date(hk.NgayKetThuc).toLocaleDateString('vi-VN');
      ghiChu = ghiChu
        ? `[Đóng trễ hạn ${hanStr}] ${ghiChu}`
        : `Đóng trễ hạn quy định (hạn chót: ${hanStr})`;
    }

    // Tổng số tiền phải đóng của SV trong HK
    const phpAgg = await tx.phieuHocPhi.aggregate({
      where: { MaSV: maSV, MaHK: maHK },
      _sum: { SoTienPhaiDong: true },
    });
    const tong = Number(phpAgg._sum.SoTienPhaiDong) || 0;

    if (tong === 0) {
      throw ApiError.badRequest(
        `Sinh viên "${maSV}" chưa đăng ký môn nào trong học kỳ này.`,
      );
    }

    // Kiểm tra số lần đã đóng (tối đa 2 lần/HK)
    const soLanDaDong = await tx.phieuThu.count({ where: { MaSV: maSV, MaHK: maHK } });
    if (soLanDaDong >= 2) {
      throw ApiError.badRequest(
        `Sinh viên đã đóng học phí ${soLanDaDong} lần trong học kỳ này. ` +
        `Hệ thống chỉ cho phép tối đa 2 lần đóng/học kỳ. ` +
        `Nếu cần điều chỉnh, vui lòng liên hệ phòng tài chính.`,
      );
    }

    // Tổng đã đóng
    const ptAgg = await tx.phieuThu.aggregate({
      where: { MaSV: maSV, MaHK: maHK },
      _sum: { SoTienThu: true },
    });
    const daDong = Number(ptAgg._sum.SoTienThu) || 0;
    const conLai = tong - daDong;

    if (conLai <= 0) {
      throw ApiError.badRequest('Sinh viên đã đóng đủ học phí cho học kỳ này.');
    }

    if (soTien > conLai) {
      throw ApiError.badRequest(
        `Số tiền thu (${soTien.toLocaleString('vi-VN')}đ) vượt số nợ còn lại (${conLai.toLocaleString('vi-VN')}đ).`,
      );
    }

    // Sinh mã phiếu thu (số thứ tự trong ngày)
    const todayCount = await tx.phieuThu.count({
      where: { NgayThu: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    });
    const maPhieuThu = generateReceiptId('PT', todayCount + 1);

    const phieuThu = await tx.phieuThu.create({
      data: {
        MaPhieuThu: maPhieuThu,
        MaSV: maSV,
        MaHK: maHK,
        SoTienThu: soTien,
        HinhThucTT: hinhThucTT === 'CHUYEN_KHOAN' ? 'CHUYEN_KHOAN' : 'TIEN_MAT',
        GhiChu: ghiChu ?? null,
      },
    });

    return {
      phieu: {
        MaPhieuThu: phieuThu.MaPhieuThu,
        MaSV: phieuThu.MaSV,
        MaHK: phieuThu.MaHK,
        NgayThu: phieuThu.NgayThu.toISOString(),
        SoTienThu: Number(phieuThu.SoTienThu),
        HinhThucTT: phieuThu.HinhThucTT,
        GhiChu: phieuThu.GhiChu,
      },
      summary: {
        Tong: tong,
        DaDong: daDong + soTien,
        ConLai: conLai - soTien,
        SoLanConLai: 2 - (soLanDaDong + 1),
      },
    };
  });
}

/**
 * BM11 — Tra cứu phiếu đăng ký học phần.
 */
export async function searchPhieuDangKy({ maPhieu, maSV, maHK }) {
  const rows = await prisma.phieuHocPhi.findMany({
    where: {
      ...(maPhieu ? { MaPhieu: { contains: maPhieu } } : {}),
      ...(maSV    ? { MaSV: { contains: maSV }       } : {}),
      ...(maHK    ? { MaHK: maHK }                     : {}),
    },
    include: {
      sinhVien: { select: { TenSV: true } },
      monHoc:   { select: { TenMH: true, SoTinChi: true, MaLoaiMon: true } },
      hocKy:    { select: { TenHK: true, NamHoc: true } },
    },
    orderBy: { NgayLap: 'desc' },
    take: 200,
  });
  return rows.map((r) => ({
    MaPhieu: r.MaPhieu, MaSV: r.MaSV, TenSV: r.sinhVien.TenSV,
    MaMH: r.MaMH, TenMH: r.monHoc.TenMH, SoTinChi: r.monHoc.SoTinChi,
    MaLoaiMon: r.monHoc.MaLoaiMon, MaHK: r.MaHK,
    TenHK: r.hocKy.TenHK, NamHoc: r.hocKy.NamHoc,
    NgayLap: r.NgayLap.toISOString(),
    SoTienDangKy: Number(r.SoTienDangKy), SoTienPhaiDong: Number(r.SoTienPhaiDong),
  }));
}

/**
 * BM12 — Tra cứu phiếu thu học phí.
 * QĐ12: tìm theo Mã phiếu thu, MSSV, Ngày lập; hiển thị tình trạng công nợ sau thu.
 */
export async function searchPhieuThu({ maPhieuThu, maSV, maHK, ngayThu }) {
  const where = {
    ...(maPhieuThu ? { MaPhieuThu: { contains: maPhieuThu } } : {}),
    ...(maSV       ? { MaSV: { contains: maSV }              } : {}),
    ...(maHK       ? { MaHK: maHK }                            : {}),
    ...(ngayThu    ? {
      NgayThu: {
        gte: new Date(`${ngayThu}T00:00:00`),
        lt: new Date(`${ngayThu}T23:59:59.999`),
      },
    } : {}),
  };

  const rows = await prisma.phieuThu.findMany({
    where,
    include: {
      sinhVien: { select: { TenSV: true } },
      hocKy:    { select: { TenHK: true, NamHoc: true } },
    },
    orderBy: { NgayThu: 'desc' },
    take: 200,
  });

  if (rows.length === 0) return [];

  // Tính tình trạng công nợ hiện tại (ConLai) cho từng SV+HK
  const pairs = [...new Set(rows.map((r) => `${r.MaSV}||${r.MaHK}`))].map((k) => {
    const [sv, hk] = k.split('||');
    return { MaSV: sv, MaHK: hk };
  });

  const [phpAgg, ptAgg] = await Promise.all([
    prisma.phieuHocPhi.groupBy({
      by: ['MaSV', 'MaHK'],
      where: { OR: pairs },
      _sum: { SoTienPhaiDong: true },
    }),
    prisma.phieuThu.groupBy({
      by: ['MaSV', 'MaHK'],
      where: { OR: pairs },
      _sum: { SoTienThu: true },
    }),
  ]);

  const phaiDongMap = Object.fromEntries(phpAgg.map((r) => [`${r.MaSV}||${r.MaHK}`, Number(r._sum.SoTienPhaiDong) || 0]));
  const daThuMap    = Object.fromEntries(ptAgg.map((r) => [`${r.MaSV}||${r.MaHK}`, Number(r._sum.SoTienThu) || 0]));

  return rows.map((r) => {
    const key = `${r.MaSV}||${r.MaHK}`;
    const phaiDong = phaiDongMap[key] || 0;
    const daThu    = daThuMap[key] || 0;
    const conLai   = Math.max(0, phaiDong - daThu);
    return {
      MaPhieuThu: r.MaPhieuThu, MaSV: r.MaSV, TenSV: r.sinhVien.TenSV,
      MaHK: r.MaHK, TenHK: r.hocKy.TenHK, NamHoc: r.hocKy.NamHoc,
      NgayThu: r.NgayThu.toISOString(), SoTienThu: Number(r.SoTienThu),
      HinhThucTT: r.HinhThucTT, GhiChu: r.GhiChu ?? '',
      TongPhaiDong: phaiDong, ConLai: conLai,
    };
  });
}
