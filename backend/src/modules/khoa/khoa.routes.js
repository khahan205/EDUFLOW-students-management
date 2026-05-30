import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { prisma } from '../../config/prisma.js';

const router = Router();
router.use(authenticate);
const canEdit = requireRole('ADMIN', 'PHONG_DAO_TAO');

router.get('/', asyncHandler(async (_req, res) => {
  const rows = await prisma.$queryRaw`SELECT MaKhoa, TenKhoa FROM KHOA ORDER BY MaKhoa`;
  res.json(rows);
}));

router.post('/', canEdit, asyncHandler(async (req, res) => {
  const { MaKhoa, TenKhoa } = req.body;
  if (!MaKhoa || !TenKhoa) return res.status(400).json({ message: 'Thieu thong tin khoa.' });
  await prisma.$executeRawUnsafe('INSERT INTO KHOA (MaKhoa, TenKhoa) VALUES (?, ?)', MaKhoa, TenKhoa);
  res.status(201).json({ MaKhoa, TenKhoa });
}));

router.put('/:maKhoa', canEdit, asyncHandler(async (req, res) => {
  const { TenKhoa } = req.body;
  if (!TenKhoa) return res.status(400).json({ message: 'Thieu TenKhoa.' });
  const rows = await prisma.$queryRawUnsafe('SELECT MaKhoa FROM KHOA WHERE MaKhoa = ?', req.params.maKhoa);
  if (!rows.length) return res.status(404).json({ message: 'Khoa khong ton tai.' });
  await prisma.$executeRawUnsafe('UPDATE KHOA SET TenKhoa = ? WHERE MaKhoa = ?', TenKhoa, req.params.maKhoa);
  res.json({ MaKhoa: req.params.maKhoa, TenKhoa });
}));

router.delete('/:maKhoa', canEdit, asyncHandler(async (req, res) => {
  const count = await prisma.nganhHoc.count({ where: { MaKhoa: req.params.maKhoa } });
  if (count > 0) return res.status(409).json({ message: 'Co nganh hoc thuoc khoa nay, khong the xoa.' });
  await prisma.$executeRawUnsafe('DELETE FROM KHOA WHERE MaKhoa = ?', req.params.maKhoa);
  res.json({ ok: true });
}));

export default router;
