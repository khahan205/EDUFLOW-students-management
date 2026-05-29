import crypto from 'node:crypto';
import { prisma } from '../../config/prisma.js';
import { hashPassword, comparePassword } from '../../utils/hash.js';
import { signToken, verifyToken } from '../../utils/jwt.js';
import { ApiError } from '../../utils/api-error.js';
import { dbRoleToSlug } from '../../utils/role-map.js';

const REFRESH_TOKEN_TTL_DAYS = 30;

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

export async function login({ username, password }) {
  // Accept either username or email
  const isEmail = username.includes('@');
  const account = isEmail
    ? await prisma.taiKhoan.findFirst({ where: { Email: username } })
    : await prisma.taiKhoan.findUnique({ where: { Username: username } });

  if (!account) {
    throw ApiError.unauthorized('Tên đăng nhập hoặc mật khẩu không đúng.');
  }
  if (account.TrangThai !== 'ACTIVE') {
    throw ApiError.unauthorized('Tài khoản đã bị vô hiệu hoá.');
  }

  const ok = await comparePassword(password, account.PasswordHash);
  if (!ok) {
    throw ApiError.unauthorized('Tên đăng nhập hoặc mật khẩu không đúng.');
  }

  // Update last login
  prisma.taiKhoan
    .update({ where: { MaTK: account.MaTK }, data: { LastLoginAt: new Date() } })
    .catch((e) => console.error('Update LastLoginAt failed:', e));

  const accessToken = signToken({
    id: account.MaTK,
    username: account.Username,
    role: account.VaiTro,
  });

  // Generate & store refresh token
  const refreshTokenStr = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { MaTK: account.MaTK, Token: refreshTokenStr, ExpiresAt: expiresAt },
  });

  return {
    user: formatUser(account),
    accessToken,
    refreshToken: refreshTokenStr,
  };
}

export async function refreshAccessToken(token) {
  const stored = await prisma.refreshToken.findUnique({ where: { Token: token } });
  if (!stored) throw ApiError.unauthorized('Refresh token không hợp lệ.');
  if (stored.ExpiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { Token: token } });
    throw ApiError.unauthorized('Refresh token đã hết hạn.');
  }

  const account = await prisma.taiKhoan.findUnique({ where: { MaTK: stored.MaTK } });
  if (!account || account.TrangThai !== 'ACTIVE') {
    throw ApiError.unauthorized('Tài khoản không hoạt động.');
  }

  const accessToken = signToken({
    id: account.MaTK,
    username: account.Username,
    role: account.VaiTro,
  });

  return { accessToken };
}

export async function revokeRefreshToken(token) {
  if (!token) return;
  await prisma.refreshToken.deleteMany({ where: { Token: token } }).catch(() => {});
}

export async function getCurrentUser(userId) {
  const account = await prisma.taiKhoan.findUnique({
    where: { MaTK: userId },
  });
  if (!account) throw ApiError.unauthorized('Tài khoản không tồn tại.');
  return formatUser(account);
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const account = await prisma.taiKhoan.findUnique({ where: { MaTK: userId } });
  if (!account) throw ApiError.notFound('Tài khoản không tồn tại.');

  const ok = await comparePassword(currentPassword, account.PasswordHash);
  if (!ok) throw ApiError.badRequest('Mật khẩu hiện tại không đúng.');

  const newHash = await hashPassword(newPassword);
  await prisma.taiKhoan.update({
    where: { MaTK: userId },
    data: { PasswordHash: newHash, MustChangePassword: false },
  });
}

export async function forgotPassword(username) {
  const account = await prisma.taiKhoan.findUnique({ where: { Username: username } });
  // Always return success to prevent user enumeration
  if (!account || account.TrangThai !== 'ACTIVE') return;

  // Invalidate old tokens
  await prisma.passwordResetToken.deleteMany({ where: { MaTK: account.MaTK } });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { MaTK: account.MaTK, Token: token, ExpiresAt: expiresAt },
  });

  const { sendResetEmail } = await import('../../utils/mailer.js');
  await sendResetEmail(account.Email ?? account.Username, token);
}

export async function resetPassword(token, newPassword) {
  const stored = await prisma.passwordResetToken.findUnique({ where: { Token: token } });
  if (!stored) throw ApiError.badRequest('Token không hợp lệ hoặc đã hết hạn.');
  if (stored.UsedAt) throw ApiError.badRequest('Token đã được sử dụng.');
  if (stored.ExpiresAt < new Date()) throw ApiError.badRequest('Token đã hết hạn.');

  const newHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.taiKhoan.update({
      where: { MaTK: stored.MaTK },
      data: { PasswordHash: newHash, MustChangePassword: false },
    }),
    prisma.passwordResetToken.update({
      where: { Token: token },
      data: { UsedAt: new Date() },
    }),
  ]);
}

export async function resetPasswordByEmail(email, newPassword) {
  const account = await prisma.taiKhoan.findFirst({ where: { Email: email } });
  if (!account || account.TrangThai !== 'ACTIVE') {
    throw ApiError.badRequest('Không tìm thấy tài khoản với email này.');
  }
  const newHash = await hashPassword(newPassword);
  await prisma.taiKhoan.update({
    where: { MaTK: account.MaTK },
    data: { PasswordHash: newHash, MustChangePassword: false },
  });
}

function formatUser(account) {
  return {
    id: String(account.MaTK),
    username: account.Username,
    fullName: account.HoTen,
    email: account.Email ?? '',
    role: dbRoleToSlug(account.VaiTro),
    mustChangePassword: account.MustChangePassword ?? false,
  };
}
