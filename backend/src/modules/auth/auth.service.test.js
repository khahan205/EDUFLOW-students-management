import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert/strict';

// Mock prisma
const mockFindUnique = mock.fn();
const mockCreate = mock.fn();
const mockUpdate = mock.fn();
const mockDeleteMany = mock.fn();

mock.module('../../config/prisma.js', {
  namedExports: {
    prisma: {
      taiKhoan: { findUnique: mockFindUnique, update: mockUpdate },
      refreshToken: { create: mockCreate, findUnique: mockFindUnique, delete: mock.fn(), deleteMany: mockDeleteMany },
      passwordResetToken: { findUnique: mockFindUnique, create: mockCreate, deleteMany: mockDeleteMany, update: mockUpdate },
      $transaction: mock.fn(async (fn) => fn({ taiKhoan: { update: mockUpdate }, passwordResetToken: { update: mockUpdate } })),
    },
  },
});

mock.module('../../utils/hash.js', {
  namedExports: {
    hashPassword: mock.fn(async (p) => `hashed_${p}`),
    comparePassword: mock.fn(async (plain, hash) => hash === `hashed_${plain}`),
  },
});

mock.module('../../utils/jwt.js', {
  namedExports: {
    signToken: mock.fn(() => 'mock.token'),
    verifyToken: mock.fn(() => ({ id: 1 })),
  },
});

mock.module('../../utils/role-map.js', {
  namedExports: {
    dbRoleToSlug: mock.fn(() => 'admin'),
  },
});

describe('auth.service', async () => {
  describe('login()', () => {
    it('throws 401 when account not found', async () => {
      mockFindUnique.mock.resetCalls();
      mockFindUnique.mock.mockImplementation(async () => null);

      const { login } = await import('./auth.service.js');

      await assert.rejects(
        () => login({ username: 'noone', password: 'pass' }),
        (err) => {
          assert.equal(err.statusCode, 401);
          return true;
        },
      );
    });

    it('throws 401 when password is wrong', async () => {
      mockFindUnique.mock.mockImplementation(async () => ({
        MaTK: 1,
        Username: 'admin',
        PasswordHash: 'hashed_correctpass',
        TrangThai: 'ACTIVE',
        VaiTro: 'ADMIN',
        HoTen: 'Admin',
        Email: null,
        MustChangePassword: false,
      }));

      const { login } = await import('./auth.service.js');

      await assert.rejects(
        () => login({ username: 'admin', password: 'wrongpass' }),
        (err) => {
          assert.equal(err.statusCode, 401);
          return true;
        },
      );
    });
  });

  describe('changePassword()', () => {
    it('throws 400 when current password is wrong', async () => {
      mockFindUnique.mock.mockImplementation(async () => ({
        MaTK: 1,
        PasswordHash: 'hashed_mypassword',
      }));

      const { changePassword } = await import('./auth.service.js');

      await assert.rejects(
        () => changePassword(1, { currentPassword: 'wrongpass', newPassword: 'newpass' }),
        (err) => {
          assert.equal(err.statusCode, 400);
          return true;
        },
      );
    });
  });
});
