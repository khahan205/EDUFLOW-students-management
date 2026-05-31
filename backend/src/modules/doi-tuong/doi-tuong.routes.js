import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { prisma } from '../../config/prisma.js';
const router = Router();
router.use(authenticate);
const canEdit = requireRole('ADMIN', 'PHONG_DAO_TAO');
router.get('/', asyncHandler(async (_req, res) => {
  res.json(await prisma.doiTuongUuTien.findMany({ orderBy: { TenDoiTuong: 'asc' } }));
}));
router.post('/', canEdit, asyncHandler(async (req, res) => {
  const { MaDoiTuong, TenDoiTuong, TiLeGiamHocPhi } = req.body;
  if (!MaDoiTuong || !TenDoiTuong) return res.status(400).json({ message: 'Thieu thong tin.' });
  const exists = await prisma.doiTuongUuTien.findUnique({ where: { MaDoiTuong } });
  if (exists) return res.status(409).json({ message: 'Ma doi tuong da ton tai.' });
  res.status(201).json(await prisma.doiTuongUuTien.create({ data: { MaDoiTuong, TenDoiTuong, TiLeGiamHocPhi: Number(TiLeGiamHocPhi ?? 0) } }));
}));
router.put('/:ma', canEdit, asyncHandler(async (req, res) => {
  const { TenDoiTuong, TiLeGiamHocPhi } = req.body;
  const d = await prisma.doiTuongUuTien.findUnique({ where: { MaDoiTuong: req.params.ma } });
  if (!d) return res.status(404).json({ message: 'Khong tim thay.' });
  res.json(await prisma.doiTuongUuTien.update({ where: { MaDoiTuong: req.params.ma }, data: { TenDoiTuong: TenDoiTuong ?? d.TenDoiTuong, TiLeGiamHocPhi: TiLeGiamHocPhi !== undefined ? Number(TiLeGiamHocPhi) : d.TiLeGiamHocPhi } }));
}));
router.delete('/:ma', canEdit, asyncHandler(async (req, res) => {
  const c = await prisma.sinhVien.count({ where: { MaDoiTuong: req.params.ma } });
  if (c > 0) return res.status(409).json({ message: 'Co sinh vien thuoc doi tuong nay.' });
  await prisma.doiTuongUuTien.delete({ where: { MaDoiTuong: req.params.ma } });
  res.json({ ok: true });
}));
export default router;
