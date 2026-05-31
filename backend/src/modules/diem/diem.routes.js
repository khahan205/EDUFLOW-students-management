import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/api-error.js';

const router = Router();
router.use(authenticate);

function calcTBHP(gk, ck) {
  if (gk == null || ck == null) return null;
  return Math.round((0.3 * gk + 0.7 * ck) * 100) / 100;
}

function toResp(d) {
  return {
    MaDiem: d.MaDiem, MaSV: d.MaSV, MaMH: d.MaMH, MaHK: d.MaHK,
    TenMH: d.monHoc?.TenMH, TenHK: d.hocKy?.TenHK, NamHoc: d.hocKy?.NamHoc,
    TenSV: d.sinhVien?.TenSV,
    DiemGiuaKy: d.DiemGiuaKy, DiemCuoiKy: d.DiemCuoiKy, DiemTBHP: d.DiemTBHP,
  };
}

// Admin/PDT/GV: xem diem
router.get('/', requireRole('ADMIN','PHONG_DAO_TAO','GIANG_VIEN'), asyncHandler(async (req, res) => {
  const { maSV, maHK, maMH } = req.query;
  const rows = await prisma.diem.findMany({
    where: { ...(maSV ? { MaSV: maSV } : {}), ...(maHK ? { MaHK: maHK } : {}), ...(maMH ? { MaMH: maMH } : {}) },
    include: { monHoc: { select: { TenMH: true } }, hocKy: { select: { TenHK: true, NamHoc: true } }, sinhVien: { select: { TenSV: true } } },
    orderBy: [{ MaHK: 'desc' }, { MaSV: 'asc' }],
  });
  res.json(rows.map(toResp));
}));

// SinhVien: xem diem cua minh
router.get('/my', requireRole('SINH_VIEN'), asyncHandler(async (req, res) => {
  const tk = await prisma.taiKhoan.findUnique({ where: { MaTK: req.user.MaTK } });
  if (!tk?.MaSV) throw ApiError.notFound('Chua lien ket tai khoan sinh vien.');
  const rows = await prisma.diem.findMany({
    where: { MaSV: tk.MaSV },
    include: { monHoc: { select: { TenMH: true, SoTinChi: true, MaLoaiMon: true } }, hocKy: { select: { TenHK: true, NamHoc: true } } },
    orderBy: [{ MaHK: 'desc' }, { MaMH: 'asc' }],
  });
  res.json(rows.map(toResp));
}));

// GV/Admin: nhap diem
router.post('/', requireRole('ADMIN','PHONG_DAO_TAO','GIANG_VIEN'), asyncHandler(async (req, res) => {
  const { maSV, maMH, maHK, diemGiuaKy, diemCuoiKy } = req.body;
  if (!maSV || !maMH || !maHK) return res.status(400).json({ message: 'Thieu thong tin.' });
  const gk = diemGiuaKy != null ? Number(diemGiuaKy) : null;
  const ck = diemCuoiKy != null ? Number(diemCuoiKy) : null;
  const diem = await prisma.diem.upsert({
    where: { MaSV_MaMH_MaHK: { MaSV: maSV, MaMH: maMH, MaHK: maHK } },
    create: { MaSV: maSV, MaMH: maMH, MaHK: maHK, DiemGiuaKy: gk, DiemCuoiKy: ck, DiemTBHP: calcTBHP(gk, ck), NgayCapNhat: new Date() },
    update: { DiemGiuaKy: gk, DiemCuoiKy: ck, DiemTBHP: calcTBHP(gk, ck), NgayCapNhat: new Date() },
    include: { monHoc: { select: { TenMH: true } }, hocKy: { select: { TenHK: true, NamHoc: true } }, sinhVien: { select: { TenSV: true } } },
  });
  res.status(201).json(toResp(diem));
}));

router.delete('/:id', requireRole('ADMIN','PHONG_DAO_TAO'), asyncHandler(async (req, res) => {
  await prisma.diem.delete({ where: { MaDiem: Number(req.params.id) } });
  res.json({ ok: true });
}));

export default router;
