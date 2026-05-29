import { asyncHandler } from '../../utils/async-handler.js';
import * as svc from './chuong-trinh-hoc.service.js';

export const listCTHCtrl = asyncHandler(async (req, res) => {
  const rows = await svc.listCTH(req.query.maNganh);
  res.json(rows);
});

export const addCTHCtrl = asyncHandler(async (req, res) => {
  const result = await svc.addToCTH(req.body);
  res.status(201).json(result);
});

export const updateCTHCtrl = asyncHandler(async (req, res) => {
  const result = await svc.updateCTH(req.params.id, req.body);
  res.json(result);
});

export const removeCTHCtrl = asyncHandler(async (req, res) => {
  await svc.removeFromCTH(req.params.id);
  res.json({ message: 'Đã xoá khỏi chương trình học.' });
});
