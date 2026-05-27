import { asyncHandler } from '../../utils/async-handler.js';
import { validate } from '../../utils/validate.js';
import { loginSchema, changePasswordSchema } from './auth.schema.js';
import * as authService from './auth.service.js';

export const loginCtrl = asyncHandler(async (req, res) => {
  const input = validate(loginSchema, req.body);
  const result = await authService.login(input);
  res.json(result);
});

export const meCtrl = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.MaTK);
  res.json(user);
});

export const changePasswordCtrl = asyncHandler(async (req, res) => {
  const input = validate(changePasswordSchema, req.body);
  await authService.changePassword(req.user.MaTK, input);
  res.json({ message: 'Đổi mật khẩu thành công.' });
});

export const logoutCtrl = asyncHandler(async (_req, res) => {
  // Với JWT stateless, logout chỉ cần FE xoá token.
  // Endpoint này tồn tại để FE gọi cho thống nhất, có thể mở rộng blacklist sau.
  res.json({ message: 'Đã đăng xuất.' });
});
