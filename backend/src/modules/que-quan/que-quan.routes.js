import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { prisma } from '../../config/prisma.js';
const router = Router();
router.use(authenticate);
const canEdit = requireRole('ADMIN', 'PHONG_DAO_TAO');
router.get('/', asyncHandler(async (_req, res) => {
  res.json(await prisma.queQuan.findMany({ include: { huyen: true }, orderBy: { TenTinh: 'asc' } }));
}));
router.post('/', canEdit, asyncHandler(async (req, res) => {
  const { MaQueQuan, TenTinh, MaHuyen } = req.body;
  if (!MaQueQuan || !TenTinh || !MaHuyen) return res.status(400).json({ message: 'Thieu thong tin.' });
  const exists = await prisma.queQuan.findUnique({ where: { MaQueQuan } });
  if (exists) return res.status(409).json({ message: 'Ma que quan da ton tai.' });
  res.status(201).json(await prisma.queQuan.create({ data: { MaQueQuan, TenTinh, MaHuyen } }));
}));
router.put('/:ma', canEdit, asyncHandler(async (req, res) => {
  const { TenTinh, MaHuyen } = req.body;
  const q = await prisma.queQuan.findUnique({ where: { MaQueQuan: req.params.ma } });
  if (!q) return res.status(404).json({ message: 'Khong tim thay.' });
  res.json(await prisma.queQuan.update({ where: { MaQueQuan: req.params.ma }, data: { TenTinh: TenTinh ?? q.TenTinh, MaHuyen: MaHuyen ?? q.MaHuyen } }));
}));
router.delete('/:ma', canEdit, asyncHandler(async (req, res) => {
  const c = await prisma.sinhVien.count({ where: { MaQueQuan: req.params.ma } });
  if (c > 0) return res.status(409).json({ message: 'Co sinh vien thuoc que quan nay.' });
  await prisma.queQuan.delete({ where: { MaQueQuan: req.params.ma } });
  res.json({ ok: true });
}));
export default router;
