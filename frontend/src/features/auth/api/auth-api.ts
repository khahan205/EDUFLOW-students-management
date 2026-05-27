import { delay } from '@/lib/delay';
import { USE_MOCK } from '@/lib/constants';
import { apiClient } from '@/services/api-client';
import type { AuthSession, User } from '@/types';
import type { LoginInput } from '../schemas/login.schema';

/**
 * Dev-only mock cho phép FE chạy độc lập trước khi backend ready.
 * Khi VITE_USE_MOCK=false, mọi request sẽ gọi backend thật qua axios.
 */
const DEV_MOCK_USER: User = {
  id: 'u_admin',
  username: 'admin',
  fullName: 'Quản trị viên',
  email: 'admin@eduflow.uit.edu.vn',
  role: 'admin',
};

export async function login(input: LoginInput): Promise<AuthSession> {
  if (USE_MOCK) {
    await delay();
    if (input.username !== 'admin' || input.password !== 'admin') {
      throw {
        code: 'INVALID_CREDENTIALS',
        message: 'Tên đăng nhập hoặc mật khẩu không đúng.',
      };
    }
    return {
      user: DEV_MOCK_USER,
      accessToken: `dev.mock.token.${Date.now()}`,
    };
  }
  const { data } = await apiClient.post<AuthSession>('/auth/login', input);
  return data;
}

export async function getCurrentUser(): Promise<User> {
  if (USE_MOCK) {
    await delay(100);
    return DEV_MOCK_USER;
  }
  const { data } = await apiClient.get<User>('/auth/me');
  return data;
}

export async function logout(): Promise<void> {
  if (USE_MOCK) {
    await delay(100);
    return;
  }
  await apiClient.post('/auth/logout');
}
