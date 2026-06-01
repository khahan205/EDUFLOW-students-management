import { prisma } from '../../config/prisma.js';

/**
 * Dashboard stats — 5 con số tổng quan.
 */
export async function getDashboardStats() {
  const now = new Date();
  const [svDangHoc, monDangMo, dangKy, daThuAgg, overduePhieu] = await Promise.all([
    prisma.sinhVien.count({ where: { TrangThai: 'DANG_HOC' } }),
    prisma.monHocMo.count({ where: { hocKy: { LaHienTai: true } } }),
    prisma.phieuHocPhi.count({ where: { hocKy: { LaHienTai: true } } }),
    prisma.phieuThu.aggregate({ _sum: { SoTienThu: true } }),
    // Đếm SV quá hạn: HanDong < now AND chưa đóng đủ
    prisma.phieuHocPhi.groupBy({
      by: ['MaSV', 'MaHK'],
      where: { HanDong: { lt: now } },
      _sum: { SoTienPhaiDong: true },
    }),
  ]);

  // Lọc những SV thực sự còn nợ (chưa đóng đủ)
  let congNoQuaHan = 0;
  if (overduePhieu.length > 0) {
    const ptAgg = await prisma.phieuThu.groupBy({
      by: ['MaSV', 'MaHK'],
      where: {
        OR: overduePhieu.map((r) => ({ MaSV: r.MaSV, MaHK: r.MaHK })),
      },
      _sum: { SoTienThu: true },
    });
    const thuMap = Object.fromEntries(
      ptAgg.map((r) => [`${r.MaSV}|${r.MaHK}`, Number(r._sum.SoTienThu) || 0]),
    );
    congNoQuaHan = overduePhieu.filter((r) => {
      const phaiDong = Number(r._sum.SoTienPhaiDong) || 0;
      const daThu = thuMap[`${r.MaSV}|${r.MaHK}`] || 0;
      return daThu < phaiDong;
    }).length;
  }

  return {
    sinhVienDangHoc: svDangHoc,
    monHocDangMo: monDangMo,
    dangKyHienTai: dangKy,
    doanhThuDaThu: Number(daThuAgg._sum.SoTienThu) || 0,
    congNoQuaHan,
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
 * Công nợ quá hạn — SV có HanDong < now và chưa đóng đủ học phí.
 */
export async function getOverdueDebts() {
  const now = new Date();

  const overdueGroups = await prisma.phieuHocPhi.groupBy({
    by: ['MaSV', 'MaHK'],
    where: { HanDong: { lt: now } },
    _sum: { SoTienPhaiDong: true },
  });

  if (overdueGroups.length === 0) return [];

  const ptAgg = await prisma.phieuThu.groupBy({
    by: ['MaSV', 'MaHK'],
    where: { OR: overdueGroups.map((r) => ({ MaSV: r.MaSV, MaHK: r.MaHK })) },
    _sum: { SoTienThu: true },
  });
  const thuMap = Object.fromEntries(
    ptAgg.map((r) => [`${r.MaSV}|${r.MaHK}`, Number(r._sum.SoTienThu) || 0]),
  );

  const debtors = overdueGroups.filter((r) => {
    const phaiDong = Number(r._sum.SoTienPhaiDong) || 0;
    return (thuMap[`${r.MaSV}|${r.MaHK}`] || 0) < phaiDong;
  });

  if (debtors.length === 0) return [];

  // Lấy tên SV + HK
  const [svs, hks] = await Promise.all([
    prisma.sinhVien.findMany({
      where: { MaSV: { in: [...new Set(debtors.map((d) => d.MaSV))] } },
      select: { MaSV: true, TenSV: true },
    }),
    prisma.hocKy.findMany({
      where: { MaHK: { in: [...new Set(debtors.map((d) => d.MaHK))] } },
      select: { MaHK: true, TenHK: true, NamHoc: true },
    }),
  ]);
  const svMap = Object.fromEntries(svs.map((s) => [s.MaSV, s.TenSV]));
  const hkMap = Object.fromEntries(hks.map((h) => [h.MaHK, `${h.TenHK} ${h.NamHoc}`]));

  return debtors.map((r) => ({
    MaSV: r.MaSV,
    TenSV: svMap[r.MaSV] ?? r.MaSV,
    MaHK: r.MaHK,
    TenHK: hkMap[r.MaHK] ?? r.MaHK,
    SoTienNo: (Number(r._sum.SoTienPhaiDong) || 0) - (thuMap[`${r.MaSV}|${r.MaHK}`] || 0),
  }));
}

/**
 * BM13.2 — Danh sách sinh viên chưa hoàn thành đóng học phí.
 * Có thể lọc theo maHK. Trả về: MaSV, TenSV, MaHK, TenHK, SoTienDangKy, SoTienPhaiDong, DaDong, ConLai
 */
export async function getSinhVienNoHocPhi(maHK) {
  const wherePhieu = maHK ? { MaHK: maHK } : {};

  const phpAgg = await prisma.phieuHocPhi.groupBy({
    by: ['MaSV', 'MaHK'],
    where: wherePhieu,
    _sum: { SoTienDangKy: true, SoTienPhaiDong: true },
  });

  if (phpAgg.length === 0) return [];

  const ptAgg = await prisma.phieuThu.groupBy({
    by: ['MaSV', 'MaHK'],
    where: { OR: phpAgg.map((r) => ({ MaSV: r.MaSV, MaHK: r.MaHK })) },
    _sum: { SoTienThu: true },
  });
  const thuMap = Object.fromEntries(
    ptAgg.map((r) => [`${r.MaSV}|${r.MaHK}`, Number(r._sum.SoTienThu) || 0]),
  );

  const noRows = phpAgg.filter((r) => {
    const phaiDong = Number(r._sum.SoTienPhaiDong) || 0;
    return (thuMap[`${r.MaSV}|${r.MaHK}`] || 0) < phaiDong;
  });

  if (noRows.length === 0) return [];

  const [svs, hks] = await Promise.all([
    prisma.sinhVien.findMany({
      where: { MaSV: { in: [...new Set(noRows.map((r) => r.MaSV))] } },
      select: { MaSV: true, TenSV: true },
    }),
    prisma.hocKy.findMany({
      where: { MaHK: { in: [...new Set(noRows.map((r) => r.MaHK))] } },
      select: { MaHK: true, TenHK: true, NamHoc: true },
    }),
  ]);
  const svMap = Object.fromEntries(svs.map((s) => [s.MaSV, s.TenSV]));
  const hkMap = Object.fromEntries(hks.map((h) => [h.MaHK, { TenHK: h.TenHK, NamHoc: h.NamHoc }]));

  return noRows.map((r) => {
    const phaiDong = Number(r._sum.SoTienPhaiDong) || 0;
    const dangKy  = Number(r._sum.SoTienDangKy) || 0;
    const daDong  = thuMap[`${r.MaSV}|${r.MaHK}`] || 0;
    return {
      MaSV: r.MaSV,
      TenSV: svMap[r.MaSV] ?? r.MaSV,
      MaHK: r.MaHK,
      TenHK: hkMap[r.MaHK]?.TenHK ?? r.MaHK,
      NamHoc: hkMap[r.MaHK]?.NamHoc ?? '',
      SoTienDangKy: dangKy,
      SoTienPhaiDong: phaiDong,
      DaDong: daDong,
      ConLai: phaiDong - daDong,
    };
  });
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
 * Trend doanh thu — hỗ trợ lọc theo tháng / quý / học kỳ / năm.
 * period: '6thang' | '12thang' | 'quy' | 'hocky' | 'nam'
 */
export async function getRevenueTrend(period = '6thang') {
  const today = new Date();

  /* ── THEO THÁNG (6 hoặc 12) ── */
  if (period === '6thang' || period === '12thang') {
    const count = period === '12thang' ? 12 : 6;
    const from = new Date(today.getFullYear(), today.getMonth() - (count - 1), 1);
    from.setHours(0, 0, 0, 0);
    const phieuThus = await prisma.phieuThu.findMany({
      where: { NgayThu: { gte: from } },
      select: { NgayThu: true, SoTienThu: true },
    });
    const slots = [];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      slots.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: `T${d.getMonth() + 1}/${d.getFullYear()}`, doanhThu: 0 });
    }
    const slotMap = Object.fromEntries(slots.map((s) => [s.key, s]));
    for (const pt of phieuThus) {
      const key = `${pt.NgayThu.getFullYear()}-${String(pt.NgayThu.getMonth() + 1).padStart(2, '0')}`;
      if (slotMap[key]) slotMap[key].doanhThu += Number(pt.SoTienThu);
    }
    return slots.map(({ label, doanhThu }) => ({ thang: label, doanhThu }));
  }

  /* ── THEO QUÝ (8 quý gần nhất) ── */
  if (period === 'quy') {
    const from = new Date(today.getFullYear() - 2, 0, 1);
    const phieuThus = await prisma.phieuThu.findMany({
      where: { NgayThu: { gte: from } },
      select: { NgayThu: true, SoTienThu: true },
    });
    const quyMap = {};
    for (const pt of phieuThus) {
      const y = pt.NgayThu.getFullYear();
      const q = Math.floor(pt.NgayThu.getMonth() / 3) + 1;
      const key = `${y}-Q${q}`;
      if (!quyMap[key]) quyMap[key] = { label: `Q${q}/${y}`, doanhThu: 0, sortKey: `${y}${q}` };
      quyMap[key].doanhThu += Number(pt.SoTienThu);
    }
    return Object.values(quyMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey)).map(({ label, doanhThu }) => ({ thang: label, doanhThu }));
  }

  /* ── THEO HỌC KỲ ── */
  if (period === 'hocky') {
    const hocKys = await prisma.hocKy.findMany({ orderBy: { MaHK: 'asc' } });
    const ptAgg = await prisma.phieuThu.groupBy({ by: ['MaHK'], _sum: { SoTienThu: true } });
    const sumMap = Object.fromEntries(ptAgg.map((p) => [p.MaHK, Number(p._sum.SoTienThu) || 0]));
    return hocKys.map((hk) => ({ thang: `${hk.TenHK} ${hk.NamHoc}`, doanhThu: sumMap[hk.MaHK] || 0 }));
  }

  /* ── THEO NĂM ── */
  if (period === 'nam') {
    const phieuThus = await prisma.phieuThu.findMany({ select: { NgayThu: true, SoTienThu: true } });
    const yearMap = {};
    for (const pt of phieuThus) {
      const y = String(pt.NgayThu.getFullYear());
      if (!yearMap[y]) yearMap[y] = { label: `Năm ${y}`, doanhThu: 0 };
      yearMap[y].doanhThu += Number(pt.SoTienThu);
    }
    return Object.keys(yearMap).sort().map((y) => ({ thang: yearMap[y].label, doanhThu: yearMap[y].doanhThu }));
  }

  return [];
}
