import { readFileSync, writeFileSync } from 'fs';

const file = 'C:/eduflow/backend/src/modules/bao-cao/bao-cao.service.js';
let content = readFileSync(file, 'utf8');

// Replace from the function start to end
const startMarker = "/**\n * Trend doanh thu 6";
const startIdx = content.indexOf(startMarker);
if (startIdx === -1) { console.error('Not found'); process.exit(1); }

const endMarker = "return months.map(({ thang, doanhThu }) => ({ thang, doanhThu }));\n}";
const endIdx = content.indexOf(endMarker, startIdx) + endMarker.length;

const newFn = `/**
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
      slots.push({ key: \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}\`, label: \`T\${d.getMonth() + 1}/\${d.getFullYear()}\`, doanhThu: 0 });
    }
    const slotMap = Object.fromEntries(slots.map((s) => [s.key, s]));
    for (const pt of phieuThus) {
      const key = \`\${pt.NgayThu.getFullYear()}-\${String(pt.NgayThu.getMonth() + 1).padStart(2, '0')}\`;
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
      const key = \`\${y}-Q\${q}\`;
      if (!quyMap[key]) quyMap[key] = { label: \`Q\${q}/\${y}\`, doanhThu: 0, sortKey: \`\${y}\${q}\` };
      quyMap[key].doanhThu += Number(pt.SoTienThu);
    }
    return Object.values(quyMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey)).map(({ label, doanhThu }) => ({ thang: label, doanhThu }));
  }

  /* ── THEO HỌC KỲ ── */
  if (period === 'hocky') {
    const hocKys = await prisma.hocKy.findMany({ orderBy: { MaHK: 'asc' } });
    const ptAgg = await prisma.phieuThu.groupBy({ by: ['MaHK'], _sum: { SoTienThu: true } });
    const sumMap = Object.fromEntries(ptAgg.map((p) => [p.MaHK, Number(p._sum.SoTienThu) || 0]));
    return hocKys.map((hk) => ({ thang: \`\${hk.TenHK} \${hk.NamHoc}\`, doanhThu: sumMap[hk.MaHK] || 0 }));
  }

  /* ── THEO NĂM ── */
  if (period === 'nam') {
    const phieuThus = await prisma.phieuThu.findMany({ select: { NgayThu: true, SoTienThu: true } });
    const yearMap = {};
    for (const pt of phieuThus) {
      const y = String(pt.NgayThu.getFullYear());
      if (!yearMap[y]) yearMap[y] = { label: \`Năm \${y}\`, doanhThu: 0 };
      yearMap[y].doanhThu += Number(pt.SoTienThu);
    }
    return Object.keys(yearMap).sort().map((y) => ({ thang: yearMap[y].label, doanhThu: yearMap[y].doanhThu }));
  }

  return [];
}`;

content = content.slice(0, startIdx) + newFn + content.slice(endIdx);
writeFileSync(file, content, 'utf8');
console.log('✓ Patched getRevenueTrend');
