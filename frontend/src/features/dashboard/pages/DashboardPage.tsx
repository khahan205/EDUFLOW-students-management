import { useQuery } from '@tanstack/react-query';
import { IconLayoutDashboard, IconClock } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/PageHeader';
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
  });
  const revenueQuery = useQuery({
    queryKey: ['dashboard', 'revenue-by-semester'],
    queryFn: fetchRevenueBySemester,
  });
  const debtsQuery = useQuery({
    queryKey: ['dashboard', 'overdue-debts'],
    queryFn: fetchOverdueDebts,
  });

  return (
    <>
      <PageHeader
        title="Dashboard"
        icon={<IconLayoutDashboard className="h-4 w-4" />}
        iconTone="teal"
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-slate-600">
            <IconClock className="h-3.5 w-3.5 text-teal-600" />
            Học kỳ hiện tại
          </span>
        }
      />

      {statsQuery.data && <DashboardStats stats={statsQuery.data} />}
      {statsQuery.isLoading && (
        <div className="mb-7 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[120px] animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {revenueQuery.data && <RevenueBySemester rows={revenueQuery.data} />}
        {debtsQuery.data && <OverdueDebts debts={debtsQuery.data} />}
      </div>
    </>
  );
}
