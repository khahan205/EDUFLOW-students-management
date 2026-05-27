import { useQuery } from '@tanstack/react-query';
import { IconChartBar } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  fetchPaymentStatusBreakdown,
  fetchEnrollmentStats,
  fetchRevenueTrend,
} from '../api/bao-cao-api';
import { PaymentStatusChart } from '../components/PaymentStatusChart';
import { EnrollmentStats } from '../components/EnrollmentStats';
import { RevenueTrend } from '../components/RevenueTrend';

export function BaoCaoPage() {
  const paymentQuery = useQuery({
    queryKey: ['bao-cao', 'payment-status'],
    queryFn: fetchPaymentStatusBreakdown,
  });
  const enrollmentQuery = useQuery({
    queryKey: ['bao-cao', 'enrollment'],
    queryFn: fetchEnrollmentStats,
  });
  const trendQuery = useQuery({
    queryKey: ['bao-cao', 'revenue-trend'],
    queryFn: fetchRevenueTrend,
  });

  return (
    <>
      <PageHeader
        title="Báo cáo & Thống kê"
        icon={<IconChartBar className="h-4 w-4" />}
        iconTone="purple"
      />

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        {paymentQuery.data && <PaymentStatusChart data={paymentQuery.data} />}
        {enrollmentQuery.data && <EnrollmentStats rows={enrollmentQuery.data} />}
      </div>

      {trendQuery.data && <RevenueTrend data={trendQuery.data} />}
    </>
  );
}
