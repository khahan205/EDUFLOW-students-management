import { prisma } from '../../config/prisma.js';
import { hashPassword, comparePassword } from '../../utils/hash.js';
import { signToken } from '../../utils/jwt.js';
import { ApiError } from '../../utils/api-error.js';
import { dbRoleToSlug } from '../../utils/role-map.js';

/**
 * Đăng nhập với username + password.
 * Trả về { user, accessToken } theo shape mà frontend đang dùng.
 */
export async function login({ username, password }) {
  const account = await prisma.taiKhoan.findUnique({
    where: { Username: username },
  });

  // Generic error message để tránh leak thông tin (không nói tài khoản tồn tại không)
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

  // Cập nhật last login (không await để không chậm response)
  prisma.taiKhoan
    .update({ where: { MaTK: account.MaTK }, data: { LastLoginAt: new Date() } })
    .catch((e) => console.error('Update LastLoginAt failed:', e));

  const accessToken = signToken({
    id: account.MaTK,
    username: account.Username,
    role: account.VaiTro,
  });

  return {
    user: formatUser(account),
    accessToken,
  };
}

/**
 * Lấy thông tin user hiện tại (đã verify token bởi middleware).
 */
export async function getCurrentUser(userId) {
  const account = await prisma.taiKhoan.findUnique({
    where: { MaTK: userId },
  });
  if (!account) throw ApiError.unauthorized('Tài khoản không tồn tại.');
  return formatUser(account);
}

/**
 * Đổi mật khẩu — yêu cầu nhập password hiện tại để xác thực.
 */
export async function changePassword(userId, { currentPassword, newPassword }) {
  const account = await prisma.taiKhoan.findUnique({ where: { MaTK: userId } });
  if (!account) throw ApiError.notFound('Tài khoản không tồn tại.');

  const ok = await comparePassword(currentPassword, account.PasswordHash);
  if (!ok) throw ApiError.badRequest('Mật khẩu hiện tại không đúng.');

  const newHash = await hashPassword(newPassword);
  await prisma.taiKhoan.update({
    where: { MaTK: userId },
    data: { PasswordHash: newHash },
  });
}

/**
 * Format DB record → response shape mà frontend đang dùng.
 */
function formatUser(account) {
  return {
    id: String(account.MaTK),
    username: account.Username,
    fullName: account.HoTen,
    email: account.Email ?? '',
    role: dbRoleToSlug(account.VaiTro),
  };
}
