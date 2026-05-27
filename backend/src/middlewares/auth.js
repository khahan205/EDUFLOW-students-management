import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/api-error.js';
import { prisma } from '../config/prisma.js';

/**
 * Verify JWT trong header `Authorization: Bearer <token>`.
 * Attach req.user = { id, username, role, hoTen } để các route sau dùng.
 *
 * Throw 401 nếu:
 *   - Không có Authorization header
 *   - Token invalid/expired
 *   - User trong token không còn tồn tại trong DB / đã bị disable
 */
export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Thiếu Authorization header.');
    }
    const token = header.slice(7);

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      throw ApiError.unauthorized(
        err.name === 'TokenExpiredError'
          ? 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.'
          : 'Token không hợp lệ.',
      );
    }

    const user = await prisma.taiKhoan.findUnique({
      where: { MaTK: payload.id },
      select: {
        MaTK: true,
        Username: true,
        HoTen: true,
        Email: true,
        VaiTro: true,
        TrangThai: true,
      },
    });

    if (!user) {
      throw ApiError.unauthorized('Tài khoản không tồn tại.');
    }
    if (user.TrangThai !== 'ACTIVE') {
      throw ApiError.unauthorized('Tài khoản đã bị vô hiệu hoá.');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
