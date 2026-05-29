import { asyncHandler } from '../../utils/async-handler.js';
import { validate } from '../../utils/validate.js';
import {
  createAccountSchema,
  updateAccountSchema,
  resetPasswordSchema,
} from './admin.schema.js';
import * as svc from './admin.service.js';
import { prisma } from '../../config/prisma.js';

export const listAuditLogCtrl = asyncHandler(async (_req, res) => {
  const logs = await prisma.auditLog.findMany({
    orderBy: { ThoiGian: 'desc' },
    take: 500,
  });
  // Attach usernames
  const maTKSet = [...new Set(logs.map((l) => l.MaTK).filter(Boolean))];
  const accounts = maTKSet.length
    ? await prisma.taiKhoan.findMany({
        where: { MaTK: { in: maTKSet } },
        select: { MaTK: true, Username: true },
      })
    : [];
  const usernameMap = Object.fromEntries(accounts.map((a) => [a.MaTK, a.Username]));
  res.json(logs.map((l) => ({ ...l, username: l.MaTK ? (usernameMap[l.MaTK] ?? null) : null })));
});

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
