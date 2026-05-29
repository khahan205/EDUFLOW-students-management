import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { listCtrl, historyCtrl, payCtrl, searchPhieuDangKyCtrl, searchPhieuThuCtrl } from './hoc-phi.controller.js';

const router = Router();
router.use(authenticate);

router.get('/', listCtrl);
router.get('/:maSV/lich-su', historyCtrl);

// Chỉ phòng tài chính + admin mới được thu tiền
router.post('/thu', requireRole('ADMIN', 'PHONG_TAI_CHINH'), payCtrl);
router.get('/tra-cuu/phieu-dang-ky', searchPhieuDangKyCtrl);
router.get('/tra-cuu/phieu-thu', searchPhieuThuCtrl);

export default router;
