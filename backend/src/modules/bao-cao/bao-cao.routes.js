import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import {
  paymentStatusCtrl,
  enrollmentStatsCtrl,
  revenueTrendCtrl,
} from './bao-cao.controller.js';

const router = Router();
router.use(authenticate);

router.get('/trang-thai-hoc-phi', paymentStatusCtrl);
router.get('/dang-ky-mon', enrollmentStatsCtrl);
router.get('/doanh-thu-trend', revenueTrendCtrl);

export default router;
