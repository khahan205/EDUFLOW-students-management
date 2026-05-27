import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import {
  listAccountsCtrl,
  createAccountCtrl,
  updateAccountCtrl,
  resetPasswordCtrl,
  deleteAccountCtrl,
} from './admin.controller.js';

const router = Router();
router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/tai-khoan', listAccountsCtrl);
router.post('/tai-khoan', createAccountCtrl);
router.put('/tai-khoan/:id', updateAccountCtrl);
router.post('/tai-khoan/:id/reset-password', resetPasswordCtrl);
router.delete('/tai-khoan/:id', deleteAccountCtrl);

export default router;
