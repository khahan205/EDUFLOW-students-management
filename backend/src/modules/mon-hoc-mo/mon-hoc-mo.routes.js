import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { listMonHocMoCtrl, openCourseCtrl, updateCourseCtrl, closeCourseCtrl } from './mon-hoc-mo.controller.js';

const router = Router();
router.use(authenticate);

const canManage = requireRole('ADMIN', 'PHONG_DAO_TAO');

router.get('/', listMonHocMoCtrl);
router.post('/', canManage, openCourseCtrl);
router.put('/:maHK/:maMH', canManage, updateCourseCtrl);
router.delete('/:maHK/:maMH', canManage, closeCourseCtrl);

export default router;
