import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { listPhanCongCtrl, listGiangVienCtrl, assignCtrl, removeCtrl, listMyClassesCtrl } from './phan-cong.controller.js';

const router = Router();
router.use(authenticate);

const canManage = requireRole('ADMIN', 'PHONG_DAO_TAO');

router.get('/', listPhanCongCtrl);
router.get('/my-classes', listMyClassesCtrl);
router.get('/giang-vien', listGiangVienCtrl);
router.post('/', canManage, assignCtrl);
router.delete('/:maHK/:maMH', canManage, removeCtrl);

export default router;
