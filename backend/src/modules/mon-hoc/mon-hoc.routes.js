import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import {
  listCtrl,
  getByMaCtrl,
  createCtrl,
  updateCtrl,
  removeCtrl,
  listYeuCauCtrl,
  addYeuCauCtrl,
  removeYeuCauCtrl,
} from './mon-hoc.controller.js';

const router = Router();
router.use(authenticate);

router.get('/', listCtrl);
router.get('/:maMH', getByMaCtrl);

const canWrite = requireRole('ADMIN', 'PHONG_DAO_TAO');
router.post('/', canWrite, createCtrl);
router.put('/:maMH', canWrite, updateCtrl);
router.delete('/:maMH', canWrite, removeCtrl);

// BM2 — Môn tiên quyết
router.get('/:maMH/tien-quyet', listYeuCauCtrl);
router.post('/:maMH/tien-quyet', canWrite, addYeuCauCtrl);
router.delete('/:maMH/tien-quyet/:maMHYeuCau', canWrite, removeYeuCauCtrl);

export default router;
