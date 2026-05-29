import { prisma } from '../config/prisma.js';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const RESOURCE_LABELS = {
  'sinh-vien': 'Sinh viên',
  'mon-hoc': 'Môn học',
  'dang-ky': 'Đăng ký',
  'hoc-phi': 'Học phí',
  'mon-hoc-mo': 'Mở môn',
  'chuong-trinh-hoc': 'Chương trình học',
  'bao-cao': 'Báo cáo',
};

const ACTION_LABELS = {
  POST: 'Thêm',
  PUT: 'Cập nhật',
  PATCH: 'Cập nhật',
  DELETE: 'Xoá',
};

// Pick the first non-empty meaningful string from an object
function pickName(obj = {}) {
  return (
    obj.TenSV ||
    obj.TenMH ||
    obj.TenHK ||
    obj.HoTen ||
    obj.MaSV ||
    obj.MaMH ||
    obj.MaHK ||
    obj.Username ||
    obj.username ||
    obj.email ||
    null
  );
}

function deriveAuditFields(originalUrl, method, reqBody, resBody) {
  const cleanPath = originalUrl.split('?')[0].replace(/^\/api\//, '').replace(/^\//, '');
  const parts = cleanPath.split('/');
  const seg0 = parts[0]; // 'auth', 'sinh-vien', 'admin', ...
  const seg1 = parts[1] ?? null;
  const seg2 = parts[2] ?? null;

  // Auth routes
  if (seg0 === 'auth') {
    switch (seg1) {
      case 'login':
        return {
          hanhDong: 'Đăng nhập',
          doiTuong: 'Hệ thống',
          doiTuongId: null,
          moTa: `Đăng nhập: ${reqBody?.username || '—'}`,
        };
      case 'logout':
        return {
          hanhDong: 'Đăng xuất',
          doiTuong: 'Hệ thống',
          doiTuongId: null,
          moTa: 'Đăng xuất khỏi hệ thống',
        };
      case 'change-password':
        return {
          hanhDong: 'Đổi mật khẩu',
          doiTuong: 'Tài khoản',
          doiTuongId: null,
          moTa: 'Đổi mật khẩu tài khoản',
        };
      case 'reset-password':
      case 'reset-by-email':
        return {
          hanhDong: 'Đặt lại mật khẩu',
          doiTuong: 'Tài khoản',
          doiTuongId: null,
          moTa: `Đặt lại mật khẩu${reqBody?.email ? ': ' + reqBody.email : ''}`,
        };
      case 'forgot-password':
        return {
          hanhDong: 'Quên mật khẩu',
          doiTuong: 'Tài khoản',
          doiTuongId: null,
          moTa: `Yêu cầu lấy lại mật khẩu: ${reqBody?.username || reqBody?.email || '—'}`,
        };
      default:
        return {
          hanhDong: ACTION_LABELS[method] ?? method,
          doiTuong: 'Xác thực',
          doiTuongId: null,
          moTa: `${method} /auth/${seg1 ?? ''}`,
        };
    }
  }

  // Admin → tai-khoan routes
  if (seg0 === 'admin' && seg1 === 'tai-khoan') {
    const action = ACTION_LABELS[method] ?? method;
    const name = pickName(reqBody) || pickName(resBody) || null;
    return {
      hanhDong: action,
      doiTuong: 'Tài khoản',
      doiTuongId: seg2,
      moTa: `${action} tài khoản${name ? ': ' + name : seg2 ? ' #' + seg2 : ''}`,
    };
  }

  // General resource routes (/api/sinh-vien, /api/mon-hoc, ...)
  const action = ACTION_LABELS[method] ?? method;
  const resourceLabel = RESOURCE_LABELS[seg0] ?? seg0;
  const name = pickName(reqBody) || pickName(resBody) || null;

  let moTa = `${action} ${resourceLabel}`;
  if (name) moTa += `: ${name}`;
  else if (seg1) moTa += ` #${seg1}`;

  return {
    hanhDong: action,
    doiTuong: resourceLabel,
    doiTuongId: seg1,
    moTa,
  };
}

export function auditMiddleware(req, res, next) {
  if (!MUTATING.has(req.method)) return next();

  // Capture before Express routing mutates req.path
  const capturedUrl = req.originalUrl;
  const capturedMethod = req.method;
  const capturedBody = req.body ?? {};

  const originalJson = res.json.bind(res);
  res.json = function (responseBody) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const maTK = req.user?.MaTK ?? null;
      const ip = req.ip ?? req.headers['x-forwarded-for'] ?? null;
      const { hanhDong, doiTuong, doiTuongId, moTa } = deriveAuditFields(
        capturedUrl,
        capturedMethod,
        capturedBody,
        typeof responseBody === 'object' ? responseBody : {},
      );

      prisma.auditLog
        .create({
          data: {
            MaTK: maTK,
            HanhDong: hanhDong,
            DoiTuong: doiTuong,
            DoiTuongId: doiTuongId,
            MoTa: moTa,
            IpAddress: ip ? String(ip).slice(0, 45) : null,
          },
        })
        .catch((e) => console.error('[AuditLog] failed:', e.message));
    }

    return originalJson(responseBody);
  };

  next();
}
