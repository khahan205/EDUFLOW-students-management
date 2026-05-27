import { asyncHandler } from '../../utils/async-handler.js';
import { validate } from '../../utils/validate.js';
import { sinhVienCreateSchema, sinhVienUpdateSchema } from './sinh-vien.schema.js';
import * as svc from './sinh-vien.service.js';

export const listCtrl = asyncHandler(async (_req, res) => {
  res.json(await svc.list());
});

export const getByMaCtrl = asyncHandler(async (req, res) => {
  res.json(await svc.getByMa(req.params.maSV));
});

export const createCtrl = asyncHandler(async (req, res) => {
  const input = validate(sinhVienCreateSchema, req.body);
  const sv = await svc.create(input);
  res.status(201).json(sv);
});

export const updateCtrl = asyncHandler(async (req, res) => {
  const input = validate(sinhVienUpdateSchema, req.body);
  const sv = await svc.update(req.params.maSV, input);
  res.json(sv);
});

export const removeCtrl = asyncHandler(async (req, res) => {
  await svc.remove(req.params.maSV);
  res.status(204).end();
});
