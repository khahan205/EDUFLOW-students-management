import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { listCTHCtrl, addCTHCtrl, updateCTHCtrl, removeCTHCtrl } from './chuong-trinh-hoc.controller.js';

const router = Router();
router.use(authenticate);

router.get('/', listCTHCtrl);
router.post('/', requireRole('ADMIN', 'PHONG_DAO_TAO'), addCTHCtrl);
router.put('/:id', requireRole('ADMIN', 'PHONG_DAO_TAO'), updateCTHCtrl);
router.delete('/:id', requireRole('ADMIN', 'PHONG_DAO_TAO'), removeCTHCtrl);

export default router;
