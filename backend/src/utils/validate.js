import { ApiError } from './api-error.js';

/**
 * Validate request body/query/params với Zod schema.
 * Throw ApiError 400 nếu fail.
 *
 * Usage: validate(schema, req.body)  →  trả về parsed data
 */
export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    throw ApiError.badRequest('Dữ liệu không hợp lệ', { issues });
  }
  return result.data;
}
