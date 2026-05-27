import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import {
  loginCtrl,
  meCtrl,
  changePasswordCtrl,
  logoutCtrl,
} from './auth.controller.js';

const router = Router();

router.post('/login', loginCtrl);
router.get('/me', authenticate, meCtrl);
router.post('/change-password', authenticate, changePasswordCtrl);
router.post('/logout', authenticate, logoutCtrl);

export default router;
