import { ApiError } from '../utils/api-error.js';

/**
 * Require user phải thuộc 1 trong các role được cho phép.
 * Phải dùng SAU middleware `authenticate`.
 *
 * Usage: router.post('/users', authenticate, requireRole('ADMIN'), handler)
 */
export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowedRoles.includes(req.user.VaiTro)) {
      return next(ApiError.forbidden(`Yêu cầu vai trò: ${allowedRoles.join(' | ')}`));
    }
    next();
  };
}
