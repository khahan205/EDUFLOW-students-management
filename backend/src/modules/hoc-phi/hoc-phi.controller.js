import { asyncHandler } from '../../utils/async-handler.js';
import { validate } from '../../utils/validate.js';
import { paySchema, historyQuerySchema } from './hoc-phi.schema.js';
import * as svc from './hoc-phi.service.js';

export const listCtrl = asyncHandler(async (_req, res) => {
  res.json(await svc.listHocPhiRows());
});

export const historyCtrl = asyncHandler(async (req, res) => {
  const { ma_hk } = validate(historyQuerySchema, req.query);
  res.json(await svc.getHistory(req.params.maSV, ma_hk));
});

export const payCtrl = asyncHandler(async (req, res) => {
  const input = validate(paySchema, req.body);
  res.status(201).json(await svc.pay(input));
});
