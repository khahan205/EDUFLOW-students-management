import { delay } from '@/lib/delay';
import { USE_MOCK_AUTH } from '@/lib/constants';
import { apiClient } from '@/services/api-client';
import type { AuthSession, User } from '@/types';
import type { LoginInput } from '../schemas/login.schema';

const DEV_MOCK_USER: User = {
  id: 'u_admin',
  username: 'admin',
  fullName: 'Quản trị viên',
  email: 'admin@eduflow.uit.edu.vn',
  role: 'admin',
  mustChangePassword: false,
};

export async function login(input: LoginInput): Promise<AuthSession> {
  if (USE_MOCK_AUTH) {
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
      refreshToken: `dev.mock.refresh.${Date.now()}`,
    };
  }
  const { data } = await apiClient.post<AuthSession>('/auth/login', input);
  return data;
}

export async function getCurrentUser(): Promise<User> {
  if (USE_MOCK_AUTH) {
    await delay(100);
    return DEV_MOCK_USER;
  }
  const { data } = await apiClient.get<User>('/auth/me');
  return data;
}

export async function logout(): Promise<void> {
  if (USE_MOCK_AUTH) {
    await delay(100);
    return;
  }
  const refreshToken = getStoredRefreshToken();
  await apiClient.post('/auth/logout', { refreshToken });
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  const { data } = await apiClient.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
  return data;
}

export async function forgotPassword(username: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { username });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiClient.post('/auth/reset-password', { token, newPassword });
}

export async function resetPasswordByEmail(email: string, newPassword: string): Promise<void> {
  await apiClient.post('/auth/reset-by-email', { email, newPassword });
}

function getStoredRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem('eduflow_auth');
    if (!raw) return null;
    const persisted = JSON.parse(raw);
    const session = persisted?.state ?? persisted;
    return session?.refreshToken ?? null;
  } catch {
    return null;
  }
}
