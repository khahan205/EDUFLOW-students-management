import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { prisma } from '../../config/prisma.js';
const router = Router();
router.use(authenticate);
const canEdit = requireRole('ADMIN', 'PHONG_DAO_TAO');
router.get('/', asyncHandler(async (_req, res) => {
  res.json(await prisma.huyen.findMany({ orderBy: { TenHuyen: 'asc' } }));
}));
router.post('/', canEdit, asyncHandler(async (req, res) => {
  const { MaHuyen, TenHuyen, LaVungSauVungXa } = req.body;
  if (!MaHuyen || !TenHuyen) return res.status(400).json({ message: 'Thieu thong tin.' });
  const exists = await prisma.huyen.findUnique({ where: { MaHuyen } });
  if (exists) return res.status(409).json({ message: 'Ma huyen da ton tai.' });
  res.status(201).json(await prisma.huyen.create({ data: { MaHuyen, TenHuyen, LaVungSauVungXa: !!LaVungSauVungXa } }));
}));
router.put('/:ma', canEdit, asyncHandler(async (req, res) => {
  const { TenHuyen, LaVungSauVungXa } = req.body;
  const h = await prisma.huyen.findUnique({ where: { MaHuyen: req.params.ma } });
  if (!h) return res.status(404).json({ message: 'Khong tim thay.' });
  res.json(await prisma.huyen.update({ where: { MaHuyen: req.params.ma }, data: { TenHuyen: TenHuyen ?? h.TenHuyen, LaVungSauVungXa: LaVungSauVungXa !== undefined ? !!LaVungSauVungXa : h.LaVungSauVungXa } }));
}));
router.delete('/:ma', canEdit, asyncHandler(async (req, res) => {
  const c = await prisma.queQuan.count({ where: { MaHuyen: req.params.ma } });
  if (c > 0) return res.status(409).json({ message: 'Co que quan thuoc huyen nay.' });
  await prisma.huyen.delete({ where: { MaHuyen: req.params.ma } });
  res.json({ ok: true });
}));
export default router;
