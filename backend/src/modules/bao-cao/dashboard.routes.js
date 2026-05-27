import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import {
  dashboardStatsCtrl,
  revenueBySemesterCtrl,
  overdueDebtsCtrl,
} from './bao-cao.controller.js';

const router = Router();
router.use(authenticate);

router.get('/stats', dashboardStatsCtrl);
router.get('/revenue-by-semester', revenueBySemesterCtrl);
router.get('/overdue-debts', overdueDebtsCtrl);

export default router;
