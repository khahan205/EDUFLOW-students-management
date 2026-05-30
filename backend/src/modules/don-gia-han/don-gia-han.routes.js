import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { listDonGiaHan, createDon, duyetDon, tuChoiDon } from './don-gia-han.service.js';

const router = Router();
router.use(authenticate);

const canManage = requireRole('ADMIN', 'PHONG_DAO_TAO', 'PHONG_TAI_CHINH');

// Lấy danh sách đơn (admin/pdt/ptc có thể xem)
router.get('/', canManage, asyncHandler(async (req, res) => {
  const { trangThai, maSV, maHK } = req.query;
  res.json(await listDonGiaHan({ trangThai, maSV, maHK }));
}));

// Tạo đơn (admin/pdt tạo thay SV, hoặc có thể mở cho mọi role)
router.post('/', canManage, asyncHandler(async (req, res) => {
  const { maSV, maHK, lyDo } = req.body;
  if (!maSV || !maHK || !lyDo) return res.status(400).json({ message: 'Thieu thong tin.' });
  res.status(201).json(await createDon({ maSV, maHK, lyDo }));
}));

// Duyệt đơn
router.put('/:id/duyet', canManage, asyncHandler(async (req, res) => {
  const { ngayGiaHan, ghiChu } = req.body;
  if (!ngayGiaHan) return res.status(400).json({ message: 'Thieu ngay gia han.' });
  await duyetDon(Number(req.params.id), { ngayGiaHan, ghiChu });
  res.json({ ok: true });
}));

// Từ chối đơn
router.put('/:id/tu-choi', canManage, asyncHandler(async (req, res) => {
  await tuChoiDon(Number(req.params.id), { ghiChu: req.body.ghiChu });
  res.json({ ok: true });
}));

export default router;
