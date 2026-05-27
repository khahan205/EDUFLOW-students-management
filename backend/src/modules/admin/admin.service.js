import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/api-error.js';
import { hashPassword } from '../../utils/hash.js';
import { dbRoleToSlug } from '../../utils/role-map.js';

function toResponse(tk) {
  return {
    id: String(tk.MaTK),
    username: tk.Username,
    fullName: tk.HoTen,
    email: tk.Email ?? '',
    role: dbRoleToSlug(tk.VaiTro),
    status: tk.TrangThai,
    createdAt: tk.NgayTao.toISOString(),
    lastLoginAt: tk.LastLoginAt?.toISOString() ?? null,
  };
}

export async function listAccounts() {
  const rows = await prisma.taiKhoan.findMany({ orderBy: { NgayTao: 'desc' } });
  return rows.map(toResponse);
}

export async function createAccount(input) {
  const exists = await prisma.taiKhoan.findUnique({ where: { Username: input.Username } });
  if (exists) throw ApiError.conflict(`Username "${input.Username}" đã tồn tại.`);

  const passwordHash = await hashPassword(input.Password);
  const tk = await prisma.taiKhoan.create({
    data: {
      Username: input.Username,
      PasswordHash: passwordHash,
      HoTen: input.HoTen,
      Email: input.Email || null,
      VaiTro: input.VaiTro,
    },
  });
  return toResponse(tk);
}

export async function updateAccount(maTK, input, currentUserId) {
  const id = parseInt(maTK, 10);
  if (Number.isNaN(id)) throw ApiError.badRequest('ID không hợp lệ.');

  const exists = await prisma.taiKhoan.findUnique({ where: { MaTK: id } });
  if (!exists) throw ApiError.notFound('Tài khoản không tồn tại.');

  // Không cho admin tự disable hoặc đổi role của chính mình
  if (id === currentUserId) {
    if (input.TrangThai === 'DISABLED' || (input.VaiTro && input.VaiTro !== exists.VaiTro)) {
      throw ApiError.badRequest('Không thể tự thay đổi trạng thái/vai trò của chính mình.');
    }
  }

  const data = { ...input };
  if (data.Email === '') data.Email = null;

  const tk = await prisma.taiKhoan.update({ where: { MaTK: id }, data });
  return toResponse(tk);
}

export async function resetPassword(maTK, newPassword) {
  const id = parseInt(maTK, 10);
  if (Number.isNaN(id)) throw ApiError.badRequest('ID không hợp lệ.');

  const exists = await prisma.taiKhoan.findUnique({ where: { MaTK: id } });
  if (!exists) throw ApiError.notFound('Tài khoản không tồn tại.');

  const passwordHash = await hashPassword(newPassword);
  await prisma.taiKhoan.update({
    where: { MaTK: id },
    data: { PasswordHash: passwordHash },
  });
}

export async function deleteAccount(maTK, currentUserId) {
  const id = parseInt(maTK, 10);
  if (Number.isNaN(id)) throw ApiError.badRequest('ID không hợp lệ.');

  if (id === currentUserId) {
    throw ApiError.badRequest('Không thể xoá tài khoản của chính mình.');
  }

  const exists = await prisma.taiKhoan.findUnique({ where: { MaTK: id } });
  if (!exists) throw ApiError.notFound('Tài khoản không tồn tại.');

  await prisma.taiKhoan.delete({ where: { MaTK: id } });
}
