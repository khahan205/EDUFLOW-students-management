/**
 * Custom error class. Throw từ controller/service, error middleware sẽ format response.
 */
export class ApiError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details) {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }
  static unauthorized(message = 'Chưa đăng nhập') {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }
  static forbidden(message = 'Không có quyền truy cập') {
    return new ApiError(403, 'FORBIDDEN', message);
  }
  static notFound(message = 'Không tìm thấy tài nguyên') {
    return new ApiError(404, 'NOT_FOUND', message);
  }
  static conflict(message, details) {
    return new ApiError(409, 'CONFLICT', message, details);
  }
  static internal(message = 'Lỗi server') {
    return new ApiError(500, 'INTERNAL_ERROR', message);
  }
}
