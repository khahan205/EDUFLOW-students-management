import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { prisma } from '../../config/prisma.js';

const router = Router();
router.use(authenticate);
const canEdit = requireRole('ADMIN', 'PHONG_DAO_TAO');

router.get('/', asyncHandler(async (_req, res) => {
  const nganhs = await prisma.nganhHoc.findMany({ orderBy: { MaNganh: 'asc' } });
  const khoas = await prisma.$queryRaw`SELECT MaKhoa, TenKhoa FROM KHOA`;
  const khoaMap = Object.fromEntries(khoas.map(k => [k.MaKhoa, k.TenKhoa]));
  res.json(nganhs.map(n => ({ ...n, TenKhoa: khoaMap[n.MaKhoa] ?? n.MaKhoa })));
}));

router.post('/', canEdit, asyncHandler(async (req, res) => {
  const { MaNganh, TenNganh, MaKhoa } = req.body;
  if (!MaNganh || !TenNganh || !MaKhoa) {
    return res.status(400).json({ message: 'Thieu thong tin nganh hoc.' });
  }
  const exists = await prisma.nganhHoc.findUnique({ where: { MaNganh } });
  if (exists) return res.status(409).json({ message: 'Ma nganh da ton tai.' });
  const nganh = await prisma.nganhHoc.create({ data: { MaNganh, TenNganh, MaKhoa } });
  res.status(201).json(nganh);
}));

router.put('/:maNganh', canEdit, asyncHandler(async (req, res) => {
  const { TenNganh, MaKhoa } = req.body;
  const nganh = await prisma.nganhHoc.findUnique({ where: { MaNganh: req.params.maNganh } });
  if (!nganh) return res.status(404).json({ message: 'Nganh hoc khong ton tai.' });
  const updated = await prisma.nganhHoc.update({
    where: { MaNganh: req.params.maNganh },
    data: { TenNganh: TenNganh ?? nganh.TenNganh, MaKhoa: MaKhoa ?? nganh.MaKhoa },
  });
  res.json(updated);
}));

router.delete('/:maNganh', canEdit, asyncHandler(async (req, res) => {
  const svCount = await prisma.sinhVien.count({ where: { MaNganh: req.params.maNganh } });
  if (svCount > 0) {
    return res.status(409).json({ message: 'Khong the xoa: co sinh vien thuoc nganh nay.' });
  }
  await prisma.nganhHoc.delete({ where: { MaNganh: req.params.maNganh } });
  res.json({ ok: true });
}));

export default router;
