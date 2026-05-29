import { apiClient } from '@/services/api-client';

export interface AccountRow {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
  lastLoginAt: string | null;
}

export interface CreateAccountInput {
  Username: string;
  Password: string;
  HoTen: string;
  Email?: string;
  VaiTro: string;
}

export interface UpdateAccountInput {
  HoTen?: string;
  Email?: string;
  VaiTro?: string;
  TrangThai?: 'ACTIVE' | 'DISABLED';
}

export async function fetchAccounts(): Promise<AccountRow[]> {
  const { data } = await apiClient.get<AccountRow[]>('/admin/tai-khoan');
  return data;
}

export async function createAccount(input: CreateAccountInput): Promise<AccountRow> {
  const { data } = await apiClient.post<AccountRow>('/admin/tai-khoan', input);
  return data;
}

export async function updateAccount(id: string, input: UpdateAccountInput): Promise<AccountRow> {
  const { data } = await apiClient.put<AccountRow>(`/admin/tai-khoan/${id}`, input);
  return data;
}

export async function adminResetPassword(id: string, newPassword: string): Promise<void> {
  await apiClient.post(`/admin/tai-khoan/${id}/reset-password`, { newPassword });
}

export async function deleteAccount(id: string): Promise<void> {
  await apiClient.delete(`/admin/tai-khoan/${id}`);
}
