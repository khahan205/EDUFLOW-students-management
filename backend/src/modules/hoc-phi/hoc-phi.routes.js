import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { listCtrl, historyCtrl, payCtrl } from './hoc-phi.controller.js';

const router = Router();
router.use(authenticate);

router.get('/', listCtrl);
router.get('/:maSV/lich-su', historyCtrl);

// Chỉ phòng tài chính + admin mới được thu tiền
router.post('/thu', requireRole('ADMIN', 'PHONG_TAI_CHINH'), payCtrl);

export default router;
