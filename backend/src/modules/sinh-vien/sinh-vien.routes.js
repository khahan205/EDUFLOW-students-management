import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import {
  listCtrl,
  getByMaCtrl,
  createCtrl,
  updateCtrl,
  removeCtrl,
} from './sinh-vien.controller.js';

const router = Router();

// Mọi route yêu cầu đăng nhập
router.use(authenticate);

// Read: ai cũng xem được
router.get('/', listCtrl);
router.get('/:maSV', getByMaCtrl);

// Write: chỉ admin + phòng đào tạo
const canWrite = requireRole('ADMIN', 'PHONG_DAO_TAO');
router.post('/', canWrite, createCtrl);
router.put('/:maSV', canWrite, updateCtrl);
router.delete('/:maSV', canWrite, removeCtrl);

export default router;
