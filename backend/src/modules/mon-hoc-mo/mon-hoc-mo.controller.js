import { asyncHandler } from '../../utils/async-handler.js';
import * as svc from './mon-hoc-mo.service.js';

export const listMonHocMoCtrl = asyncHandler(async (req, res) => {
  res.json(await svc.listMonHocMo(req.query.maHK));
});

export const openCourseCtrl = asyncHandler(async (req, res) => {
  const { maHK, maMH, siSoToiDa } = req.body;
  const result = await svc.openCourse({ maHK, maMH, siSoToiDa: siSoToiDa ? Number(siSoToiDa) : undefined });
  res.status(201).json(result);
});

export const updateCourseCtrl = asyncHandler(async (req, res) => {
  const { maHK, maMH } = req.params;
  const { siSoToiDa } = req.body;
  await svc.updateCourse(maHK, maMH, { siSoToiDa: siSoToiDa ? Number(siSoToiDa) : null });
  res.json({ ok: true });
});

export const closeCourseCtrl = asyncHandler(async (req, res) => {
  const { maHK, maMH } = req.params;
  await svc.closeCourse(maHK, maMH);
  res.json({ ok: true });
});
