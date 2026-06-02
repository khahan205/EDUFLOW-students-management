import { asyncHandler } from '../../utils/async-handler.js';
import { validate } from '../../utils/validate.js';
import {
  monHocCreateSchema,
  monHocUpdateSchema,
  pricingConfigSchema,
} from './mon-hoc.schema.js';
import * as svc from './mon-hoc.service.js';

export const listCtrl = asyncHandler(async (_req, res) => {
  res.json(await svc.list());
});

export const getByMaCtrl = asyncHandler(async (req, res) => {
  res.json(await svc.getByMa(req.params.maMH));
});

export const createCtrl = asyncHandler(async (req, res) => {
  const input = validate(monHocCreateSchema, req.body);
  res.status(201).json(await svc.create(input));
});

export const updateCtrl = asyncHandler(async (req, res) => {
  const input = validate(monHocUpdateSchema, req.body);
  res.json(await svc.update(req.params.maMH, input));
});

export const removeCtrl = asyncHandler(async (req, res) => {
  await svc.remove(req.params.maMH);
  res.status(204).end();
});

export const getPricingCtrl = asyncHandler(async (_req, res) => {
  res.json(await svc.getPricingConfig());
});

export const updatePricingCtrl = asyncHandler(async (req, res) => {
  const input = validate(pricingConfigSchema, req.body);
  res.json(await svc.updatePricingConfig(input));
});

// BM2 — Môn tiên quyết
export const listYeuCauCtrl = asyncHandler(async (req, res) => {
  res.json(await svc.listYeuCau(req.params.maMH));
});

export const addYeuCauCtrl = asyncHandler(async (req, res) => {
  const { maMHYeuCau } = req.body;
  if (!maMHYeuCau) return res.status(400).json({ message: 'Thiếu maMHYeuCau.' });
  res.status(201).json(await svc.addYeuCau(req.params.maMH, maMHYeuCau));
});

export const removeYeuCauCtrl = asyncHandler(async (req, res) => {
  await svc.removeYeuCau(req.params.maMH, req.params.maMHYeuCau);
  res.status(204).end();
});
