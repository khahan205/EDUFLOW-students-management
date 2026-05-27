import { ApiError } from '../utils/api-error.js';
import { isDev } from '../config/env.js';
import { Prisma } from '@prisma/client';

/**
 * Centralized error handler. Mọi error throw ra trong route handler đều
 * được wrap bởi asyncHandler → tới đây để format response.
 */
// eslint-disable-next-line no-unused-vars
export function errorMiddleware(err, _req, res, _next) {
  // ApiError thuần
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  // Prisma error → map về HTTP code phù hợp
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] ?? 'field';
      return res.status(409).json({
        code: 'CONFLICT',
        message: `Giá trị "${field}" đã tồn tại.`,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Không tìm thấy bản ghi.',
      });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({
        code: 'BAD_REQUEST',
        message: 'Vi phạm ràng buộc tham chiếu (foreign key).',
      });
    }
  }

  // Validation error đã không map (zod được wrap bởi validate() trước rồi)
  // → fallback 500
  console.error('[Unhandled error]', err);
  return res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: isDev ? err.message : 'Lỗi server. Vui lòng thử lại sau.',
    stack: isDev ? err.stack : undefined,
  });
}

/** 404 cho route không tồn tại */
// eslint-disable-next-line no-unused-vars
export function notFoundMiddleware(req, res, _next) {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: `Endpoint ${req.method} ${req.path} không tồn tại.`,
  });
}
