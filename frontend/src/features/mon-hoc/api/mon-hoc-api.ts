import { delay } from '@/lib/delay';
import { USE_MOCK } from '@/lib/constants';
import { apiClient } from '@/services/api-client';
import type { MonHoc } from '@/types';
import { monHocStore, mockPricingConfig } from '../mocks/mon-hoc-mocks';
import type { MonHocInput, PricingConfigInput } from '../schemas/mon-hoc.schema';

export async function fetchMonHocList(): Promise<MonHoc[]> {
  if (USE_MOCK) {
    await delay();
    return monHocStore.list();
  }
  const { data } = await apiClient.get<MonHoc[]>('/mon-hoc');
  return data;
}

export async function createMonHoc(input: MonHocInput): Promise<MonHoc> {
  if (USE_MOCK) {
    await delay();
    if (monHocStore.get(input.MaMH)) {
      throw { code: 'DUPLICATE', message: `Mã môn "${input.MaMH}" đã tồn tại.` };
    }
    return monHocStore.add({ ...input, SiSoHienTai: 0 } as MonHoc);
  }
  const { data } = await apiClient.post<MonHoc>('/mon-hoc', input);
  return data;
}

export async function updateMonHoc(maMH: string, input: MonHocInput): Promise<MonHoc> {
  if (USE_MOCK) {
    await delay();
    const updated = monHocStore.update(maMH, input);
    if (!updated) throw { code: 'NOT_FOUND', message: 'Không tìm thấy môn học.' };
    return updated;
  }
  const { data } = await apiClient.put<MonHoc>(`/mon-hoc/${maMH}`, input);
  return data;
}

export async function deleteMonHoc(maMH: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    monHocStore.remove(maMH);
    return;
  }
  await apiClient.delete(`/mon-hoc/${maMH}`);
}

export async function fetchPricingConfig(): Promise<PricingConfigInput> {
  if (USE_MOCK) {
    await delay();
    return mockPricingConfig;
  }
  const { data } = await apiClient.get<PricingConfigInput>('/master-data/cau-hinh/gia');
  return data;
}

export async function updatePricingConfig(input: PricingConfigInput): Promise<PricingConfigInput> {
  if (USE_MOCK) {
    await delay();
    Object.assign(mockPricingConfig, input);
    return input;
  }
  const { data } = await apiClient.put<PricingConfigInput>('/master-data/cau-hinh/gia', input);
  return data;
}
