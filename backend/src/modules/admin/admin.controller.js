import { asyncHandler } from '../../utils/async-handler.js';
import { validate } from '../../utils/validate.js';
import {
  createAccountSchema,
  updateAccountSchema,
  resetPasswordSchema,
} from './admin.schema.js';
import * as svc from './admin.service.js';

export const listAccountsCtrl = asyncHandler(async (_req, res) => {
  res.json(await svc.listAccounts());
});

export const createAccountCtrl = asyncHandler(async (req, res) => {
  const input = validate(createAccountSchema, req.body);
  res.status(201).json(await svc.createAccount(input));
});

export const updateAccountCtrl = asyncHandler(async (req, res) => {
  const input = validate(updateAccountSchema, req.body);
  res.json(await svc.updateAccount(req.params.id, input, req.user.MaTK));
});

export const resetPasswordCtrl = asyncHandler(async (req, res) => {
  const { newPassword } = validate(resetPasswordSchema, req.body);
  await svc.resetPassword(req.params.id, newPassword);
  res.json({ message: 'Đã đặt lại mật khẩu.' });
});

export const deleteAccountCtrl = asyncHandler(async (req, res) => {
  await svc.deleteAccount(req.params.id, req.user.MaTK);
  res.status(204).end();
});
