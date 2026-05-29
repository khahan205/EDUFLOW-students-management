import { asyncHandler } from '../../utils/async-handler.js';
import { validate } from '../../utils/validate.js';
import { registerSchema, unregisterSchema } from './dang-ky.schema.js';
import { ApiError } from '../../utils/api-error.js';
import * as svc from './dang-ky.service.js';

export const listStudentsForCourseCtrl = asyncHandler(async (req, res) => {
  const { maHK, maMH } = req.query;
  if (!maHK || !maMH) throw ApiError.badRequest('Thiếu tham số maHK hoặc maMH');
  res.json(await svc.listStudentsForCourse(maHK, maMH));
});

export const getMonMoCtrl = asyncHandler(async (req, res) => {
  const maHK = req.query.ma_hk;
  if (!maHK) throw ApiError.badRequest('Thiếu tham số ma_hk');
  res.json(await svc.getMonMoChoSV(req.params.maSV, maHK));
});

export const registerCtrl = asyncHandler(async (req, res) => {
  const input = validate(registerSchema, req.body);
  res.status(201).json(await svc.register(input));
});

export const unregisterCtrl = asyncHandler(async (req, res) => {
  const input = validate(unregisterSchema, req.body);
  await svc.unregister(input);
  res.status(204).end();
});
