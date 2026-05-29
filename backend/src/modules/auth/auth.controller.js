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

export const refreshCtrl = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Thiếu refresh token.' });
  }
  const result = await authService.refreshAccessToken(refreshToken);
  res.json(result);
});

export const logoutCtrl = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.revokeRefreshToken(refreshToken);
  res.json({ message: 'Đã đăng xuất.' });
});

export const forgotPasswordCtrl = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: 'Thiếu tên đăng nhập.' });
  await authService.forgotPassword(username);
  res.json({ message: 'Nếu tài khoản tồn tại, link đặt lại mật khẩu đã được gửi.' });
});

export const resetPasswordCtrl = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Thiếu token hoặc mật khẩu mới.' });
  }
  await authService.resetPassword(token, newPassword);
  res.json({ message: 'Đặt lại mật khẩu thành công.' });
});

export const resetByEmailCtrl = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Thiếu email hoặc mật khẩu mới.' });
  }
  await authService.resetPasswordByEmail(email, newPassword);
  res.json({ message: 'Đặt lại mật khẩu thành công.' });
});
