import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import {
  loginCtrl,
  meCtrl,
  changePasswordCtrl,
  refreshCtrl,
  logoutCtrl,
  forgotPasswordCtrl,
  resetPasswordCtrl,
  resetByEmailCtrl,
} from './auth.controller.js';

const router = Router();

router.post('/login', loginCtrl);
router.get('/me', authenticate, meCtrl);
router.post('/change-password', authenticate, changePasswordCtrl);
router.post('/refresh', refreshCtrl);
router.post('/logout', logoutCtrl);
router.post('/forgot-password', forgotPasswordCtrl);
router.post('/reset-password', resetPasswordCtrl);
router.post('/reset-by-email', resetByEmailCtrl);

export default router;
