import { useQuery } from '@tanstack/react-query';
import { IconLayoutDashboard, IconClock, IconAlertCircle } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { apiClient } from '@/services/api-client';
interface HKInfo { MaHK: string; TenHK: string; NamHoc: string; }
import {
  fetchDashboardStats,
  fetchRevenueBySemester,
  fetchOverdueDebts,
} from '../api/dashboard-api';
import { DashboardStats } from '../components/DashboardStats';
import { RevenueBySemester } from '../components/RevenueBySemester';
import { OverdueDebts } from '../components/OverdueDebts';

export function DashboardPage() {
  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    retry: 1,
  });
  const revenueQuery = useQuery({
    queryKey: ['dashboard', 'revenue-by-semester'],
    queryFn: fetchRevenueBySemester,
    retry: 1,
  });
  const debtsQuery = useQuery({
    queryKey: ['dashboard', 'overdue-debts'],
    queryFn: fetchOverdueDebts,
    retry: 1,
  });

  const currentHKQuery = useQuery({
    queryKey: ['hoc-ky-current'],
    queryFn: async () => { const { data } = await apiClient.get<HKInfo>('/master-data/hoc-ky/current'); return data; },
    staleTime: 300_000,
  });

  const isAnyError = statsQuery.isError || revenueQuery.isError || debtsQuery.isError;
  const isLoading = statsQuery.isLoading || revenueQuery.isLoading || debtsQuery.isLoading;

  return (
    <>
      <PageHeader
        title="Dashboard"
        icon={<IconLayoutDashboard className="h-4 w-4" />}
        iconTone="teal"
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1.5 text-sm font-semibold text-teal-700">
            <IconClock className="h-3.5 w-3.5" />
            {currentHKQuery.data
              ? `${currentHKQuery.data.TenHK} — ${currentHKQuery.data.NamHoc}`
              : 'Học kỳ hiện tại'}
          </span>
        }
      />

      {isLoading && (
        <>
          <div className="mb-7 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[120px] animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </>
      )}

      {isAnyError && !isLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-700">
          <IconAlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Không thể tải dữ liệu từ server</p>
            <p className="mt-0.5 text-[12.5px] text-red-600">
              Kiểm tra backend đang chạy tại <code className="font-mono">localhost:8000</code> và đã đăng nhập đúng tài khoản.
            </p>
          </div>
        </div>
      )}

      {statsQuery.data && <DashboardStats stats={statsQuery.data} />}

      <div className="grid gap-5 lg:grid-cols-2">
        {revenueQuery.data && <RevenueBySemester rows={revenueQuery.data} />}
        {debtsQuery.data && <OverdueDebts debts={debtsQuery.data} />}
      </div>
    </>
  );
}
