import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { listStudentsForCourseCtrl, getMonMoCtrl, registerCtrl, unregisterCtrl } from './dang-ky.controller.js';

const router = Router();
router.use(authenticate);

const canRegister = requireRole('ADMIN', 'PHONG_DAO_TAO');

// Static routes before dynamic :maSV param
router.get('/sinh-vien-lop', listStudentsForCourseCtrl);
router.get('/:maSV/mon-mo', getMonMoCtrl);
router.post('/', canRegister, registerCtrl);
router.delete('/', canRegister, unregisterCtrl);

export default router;
