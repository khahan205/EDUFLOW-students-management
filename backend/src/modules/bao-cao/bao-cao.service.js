import { prisma } from '../../config/prisma.js';

/**
 * Dashboard stats — 5 con số tổng quan.
 */
export async function getDashboardStats() {
  const [svDangHoc, monDangMo, dangKy, daThuAgg, congNoQuaHan] = await Promise.all([
    prisma.sinhVien.count({ where: { TrangThai: 'DANG_HOC' } }),
    prisma.monHocMo.count({ where: { hocKy: { LaHienTai: true } } }),
    prisma.phieuHocPhi.count({ where: { hocKy: { LaHienTai: true } } }),
    prisma.phieuThu.aggregate({ _sum: { SoTienThu: true } }),
    // Công nợ quá hạn: thực tế cần thêm trường HanDong vào PhieuHocPhi
    // Hiện tại return 0 — sẽ implement khi có nghiệp vụ rõ
    Promise.resolve(0),
  ]);

  return {
    sinhVienDangHoc: svDangHoc,
    monHocDangMo: monDangMo,
    dangKyHienTai: dangKy,
    doanhThuDaThu: Number(daThuAgg._sum.SoTienThu) || 0,
    congNoQuaHan: congNoQuaHan,
  };
}

/**
 * Doanh thu theo học kỳ.
 */
export async function getRevenueBySemester() {
  const [hocKys, phpByHK, ptByHK, svByHK] = await Promise.all([
    prisma.hocKy.findMany({ orderBy: { MaHK: 'asc' } }),
    prisma.phieuHocPhi.groupBy({ by: ['MaHK'], _sum: { SoTienPhaiDong: true } }),
    prisma.phieuThu.groupBy({ by: ['MaHK'], _sum: { SoTienThu: true } }),
    // Lấy (MaHK, MaSV) distinct để đếm SV duy nhất mỗi HK
    prisma.phieuHocPhi.groupBy({ by: ['MaHK', 'MaSV'] }),
  ]);

  const phpMap = Object.fromEntries(
    phpByHK.map((r) => [r.MaHK, Number(r._sum.SoTienPhaiDong) || 0]),
  );
  const ptMap = Object.fromEntries(
    ptByHK.map((r) => [r.MaHK, Number(r._sum.SoTienThu) || 0]),
  );
  const svCountMap = {};
  for (const r of svByHK) {
    svCountMap[r.MaHK] = (svCountMap[r.MaHK] || 0) + 1;
  }

  return hocKys.map((hk) => ({
    NamHoc: hk.NamHoc,
    HocKy: hk.TenHK,
    Tong: phpMap[hk.MaHK] || 0,
    DaThu: ptMap[hk.MaHK] || 0,
    SoSinhVien: svCountMap[hk.MaHK] || 0,
  }));
}

/**
 * Công nợ quá hạn — placeholder cho đến khi có HanDong field.
 */
export async function getOverdueDebts() {
  return [];
}

/**
 * Báo cáo: trạng thái học phí (count + amount theo trạng thái).
 */
export async function getPaymentStatusBreakdown() {
  // Tính lại từ aggregate (giống logic của hoc-phi service)
  const phpAgg = await prisma.phieuHocPhi.groupBy({
    by: ['MaSV', 'MaHK'],
    _sum: { SoTienPhaiDong: true },
  });
  const ptAgg = await prisma.phieuThu.groupBy({
    by: ['MaSV', 'MaHK'],
    _sum: { SoTienThu: true },
  });
  const thuMap = Object.fromEntries(
    ptAgg.map((r) => [`${r.MaSV}|${r.MaHK}`, Number(r._sum.SoTienThu) || 0]),
  );

  const buckets = {
    'Đã ĐT': { count: 0, amount: 0 },
    'Đã ĐT 1 phần': { count: 0, amount: 0 },
    'Chưa ĐT': { count: 0, amount: 0 },
  };

  for (const r of phpAgg) {
    const tong = Number(r._sum.SoTienPhaiDong) || 0;
    const daDong = thuMap[`${r.MaSV}|${r.MaHK}`] || 0;
    let key;
    if (daDong === 0) key = 'Chưa ĐT';
    else if (daDong >= tong) key = 'Đã ĐT';
    else key = 'Đã ĐT 1 phần';
    buckets[key].count += 1;
    buckets[key].amount += tong;
  }

  return Object.entries(buckets).map(([status, v]) => ({
    status,
    count: v.count,
    amount: v.amount,
  }));
}

/**
 * Báo cáo: thống kê đăng ký từng môn.
 */
export async function getEnrollmentStats() {
  const monHocs = await prisma.monHoc.findMany({ orderBy: { MaMH: 'asc' } });

  // Đếm số đăng ký thực (PhieuHocPhi) cho mỗi môn — chính xác hơn dùng SiSoHienTai
  const enrollCount = await prisma.phieuHocPhi.groupBy({
    by: ['MaMH'],
    _count: { _all: true },
  });
  const countMap = Object.fromEntries(
    enrollCount.map((r) => [r.MaMH, r._count._all]),
  );

  return monHocs.map((mh) => ({
    MaMH: mh.MaMH,
    TenMH: mh.TenMH,
    TenKhoa: mh.TenKhoa,
    DaDangKy: countMap[mh.MaMH] ?? 0,
    ToiDa: mh.SiSoToiDa,
  }));
}

/**
 * Trend doanh thu 6 tháng gần nhất — group phiếu thu theo tháng.
 */
export async function getRevenueTrend() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const phieuThus = await prisma.phieuThu.findMany({
    where: { NgayThu: { gte: sixMonthsAgo } },
    select: { NgayThu: true, SoTienThu: true },
  });

  // Init 6 tháng = 0
  const months = [];
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      thang: `T${d.getMonth() + 1}`,
      doanhThu: 0,
    });
  }
  const monthMap = Object.fromEntries(months.map((m) => [m.key, m]));

  for (const pt of phieuThus) {
    const key = `${pt.NgayThu.getFullYear()}-${String(pt.NgayThu.getMonth() + 1).padStart(2, '0')}`;
    if (monthMap[key]) {
      monthMap[key].doanhThu += Number(pt.SoTienThu);
    }
  }

  return months.map(({ thang, doanhThu }) => ({ thang, doanhThu }));
}
