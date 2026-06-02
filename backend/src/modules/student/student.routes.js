import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/api-error.js';

const router = Router();
router.use(authenticate);
const isSinhVien = requireRole('SINH_VIEN');

// Lấy thông tin cá nhân
router.get('/me', isSinhVien, asyncHandler(async (req, res) => {
  const tk = await prisma.taiKhoan.findUnique({ where: { MaTK: req.user.MaTK } });
  if (!tk?.MaSV) throw ApiError.notFound('Chua lien ket tai khoan voi sinh vien.');
  const sv = await prisma.sinhVien.findUnique({
    where: { MaSV: tk.MaSV },
    include: {
      queQuan: { include: { huyen: true } },
      doiTuongUuTien: true,
      nganh: true,
    },
  });
  if (!sv) throw ApiError.notFound('Khong tim thay sinh vien.');
  res.json({ ...sv, MaTK: tk.MaTK, Username: tk.Username });
}));

// Xem mon hoc mo trong HK (mac dinh = HK hien tai, ho tro ?maHK= de chon HK khac)
router.get('/mon-mo', isSinhVien, asyncHandler(async (req, res) => {
  const tk = await prisma.taiKhoan.findUnique({ where: { MaTK: req.user.MaTK } });
  if (!tk?.MaSV) throw ApiError.notFound('Chua lien ket.');
  const { maHK } = req.query;
  const hk = maHK
    ? await prisma.hocKy.findUnique({ where: { MaHK: maHK } })
    : await prisma.hocKy.findFirst({ where: { LaHienTai: true } });
  if (!hk) throw ApiError.notFound('Khong tim thay hoc ky.');
  const monMo = await prisma.monHocMo.findMany({
    where: { MaHK: hk.MaHK },
    include: { monHoc: true },
  });
  const daDangKy = await prisma.phieuHocPhi.findMany({
    where: { MaSV: tk.MaSV, MaHK: hk.MaHK, TrangThai: 'ACTIVE' },
    select: { MaMH: true },
  });
  const daSet = new Set(daDangKy.map(p => p.MaMH));
  // Tra ve kem thong tin HK de FE hien thi
  res.json({
    MaHK: hk.MaHK, TenHK: hk.TenHK, NamHoc: hk.NamHoc,
    monMo: monMo.map(m => ({ ...m.monHoc, daDangKy: daSet.has(m.monHoc.MaMH) })),
  });
}));

// Xem cac mon da dang ky
router.get('/dang-ky', isSinhVien, asyncHandler(async (req, res) => {
  const tk = await prisma.taiKhoan.findUnique({ where: { MaTK: req.user.MaTK } });
  if (!tk?.MaSV) throw ApiError.notFound('Chua lien ket.');
  const { maHK } = req.query;
  const hk = maHK ? await prisma.hocKy.findUnique({ where: { MaHK: maHK } })
    : await prisma.hocKy.findFirst({ where: { LaHienTai: true } });
  if (!hk) throw ApiError.notFound('Khong tim thay hoc ky.');
  const phieu = await prisma.phieuHocPhi.findMany({
    where: { MaSV: tk.MaSV, MaHK: hk.MaHK, TrangThai: 'ACTIVE' },
    include: { monHoc: true, hocKy: true },
  });
  // Tinh so tien da dong
  const ptAgg = await prisma.phieuThu.aggregate({ where: { MaSV: tk.MaSV, MaHK: hk.MaHK }, _sum: { SoTienThu: true } });
  const daDong = Number(ptAgg._sum.SoTienThu) || 0;
  const tongPhaiDong = phieu.reduce((s, p) => s + Number(p.SoTienPhaiDong), 0);
  res.json({
    HocKy: { MaHK: hk.MaHK, TenHK: hk.TenHK, NamHoc: hk.NamHoc },
    monHoc: phieu.map(p => ({
      MaPhieu: p.MaPhieu, MaMH: p.MaMH, TenMH: p.monHoc.TenMH,
      SoTinChi: p.monHoc.SoTinChi, MaLoaiMon: p.monHoc.MaLoaiMon,
      SoTienPhaiDong: Number(p.SoTienPhaiDong), NgayLap: p.NgayLap.toISOString(),
    })),
    TongPhaiDong: tongPhaiDong,
    DaDong: daDong,
    ConLai: tongPhaiDong - daDong,
  });
}));

// Xem phieu thu
router.get('/phieu-thu', isSinhVien, asyncHandler(async (req, res) => {
  const tk = await prisma.taiKhoan.findUnique({ where: { MaTK: req.user.MaTK } });
  if (!tk?.MaSV) throw ApiError.notFound('Chua lien ket.');
  const rows = await prisma.phieuThu.findMany({
    where: { MaSV: tk.MaSV },
    orderBy: { NgayThu: 'desc' },
  });
  res.json(rows.map(r => ({ ...r, SoTienThu: Number(r.SoTienThu) })));
}));

// SV: xem bang diem cua minh
router.get('/diem', isSinhVien, asyncHandler(async (req, res) => {
  const tk = await prisma.taiKhoan.findUnique({ where: { MaTK: req.user.MaTK } });
  if (!tk?.MaSV) throw ApiError.notFound('Chua lien ket.');
  const rows = await prisma.diem.findMany({
    where: { MaSV: tk.MaSV },
    include: { monHoc: { select: { TenMH: true, SoTinChi: true, MaLoaiMon: true } }, hocKy: { select: { TenHK: true, NamHoc: true } } },
    orderBy: [{ MaHK: 'desc' }, { MaMH: 'asc' }],
  });
  res.json(rows.map(r => ({
    MaDiem: r.MaDiem, MaMH: r.MaMH, TenMH: r.monHoc.TenMH, SoTinChi: r.monHoc.SoTinChi,
    MaLoaiMon: r.monHoc.MaLoaiMon, TenHK: r.hocKy.TenHK, NamHoc: r.hocKy.NamHoc,
    DiemGiuaKy: r.DiemGiuaKy, DiemCuoiKy: r.DiemCuoiKy, DiemTBHP: r.DiemTBHP,
  })));
}));

// Admin/PDT: tao tai khoan cho sinh vien
router.post('/create-account', requireRole('ADMIN', 'PHONG_DAO_TAO'), asyncHandler(async (req, res) => {
  const { maSV, password } = req.body;
  if (!maSV || !password) return res.status(400).json({ message: 'Thieu thong tin.' });
  const sv = await prisma.sinhVien.findUnique({ where: { MaSV: maSV } });
  if (!sv) throw ApiError.notFound(`Sinh vien "${maSV}" khong ton tai.`);
  const exists = await prisma.taiKhoan.findFirst({ where: { MaSV: maSV } });
  if (exists) throw ApiError.conflict(`Da co tai khoan cho sinh vien "${maSV}".`);
  const { hashPassword } = await import('../../utils/hash.js');
  const hash = await hashPassword(password);
  const tk = await prisma.taiKhoan.create({
    data: { Username: maSV, PasswordHash: hash, HoTen: sv.TenSV, Email: sv.Email, VaiTro: 'SINH_VIEN', MaSV: maSV, MustChangePassword: true },
  });
  res.status(201).json({ MaTK: tk.MaTK, Username: tk.Username, MaSV: tk.MaSV });
}));

export default router;
