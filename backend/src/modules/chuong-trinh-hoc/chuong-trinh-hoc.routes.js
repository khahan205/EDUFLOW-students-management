import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { listCTH, addCTH, updateCTH, deleteCTH } from './chuong-trinh-hoc.service.js';

const router = Router();
router.use(authenticate);
const canEdit = requireRole('ADMIN', 'PHONG_DAO_TAO');

router.get('/', asyncHandler(async (req, res) => {
  res.json(await listCTH({ maNganh: req.query.maNganh }));
}));

router.post('/', canEdit, asyncHandler(async (req, res) => {
  const { maNganh, maMH, hocKy } = req.body;
  res.status(201).json(await addCTH({ maNganh, maMH, hocKy }));
}));

router.put('/:id', canEdit, asyncHandler(async (req, res) => {
  res.json(await updateCTH(req.params.id, { hocKy: req.body.hocKy }));
}));

router.delete('/:id', canEdit, asyncHandler(async (req, res) => {
  await deleteCTH(req.params.id);
  res.json({ ok: true });
}));

export default router;
