import { asyncHandler } from '../../utils/async-handler.js';
import * as svc from './bao-cao.service.js';

export const dashboardStatsCtrl = asyncHandler(async (_req, res) => {
  res.json(await svc.getDashboardStats());
});

export const revenueBySemesterCtrl = asyncHandler(async (_req, res) => {
  res.json(await svc.getRevenueBySemester());
});

export const overdueDebtsCtrl = asyncHandler(async (_req, res) => {
  res.json(await svc.getOverdueDebts());
});

export const paymentStatusCtrl = asyncHandler(async (_req, res) => {
  res.json(await svc.getPaymentStatusBreakdown());
});

export const enrollmentStatsCtrl = asyncHandler(async (_req, res) => {
  res.json(await svc.getEnrollmentStats());
});

export const revenueTrendCtrl = asyncHandler(async (_req, res) => {
  res.json(await svc.getRevenueTrend());
});

export const sinhVienNoCtrl = asyncHandler(async (req, res) => {
  res.json(await svc.getSinhVienNoHocPhi(req.query.maHK));
});
