import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import { IconChartBar, IconFileSpreadsheet, IconPrinter } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { exportToExcel } from '@/lib/export-excel';
import {
  fetchPaymentStatusBreakdown,
  fetchEnrollmentStats,
  fetchRevenueTrend,
} from '../api/bao-cao-api';
import { PaymentStatusChart } from '../components/PaymentStatusChart';
import { EnrollmentStats } from '../components/EnrollmentStats';
import { RevenueTrend } from '../components/RevenueTrend';

export function BaoCaoPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

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

  const handleExportEnrollment = () => {
    if (!enrollmentQuery.data?.length) return;
    exportToExcel(
      enrollmentQuery.data,
      [
        { header: 'Mã môn', key: 'MaMH' },
        { header: 'Tên môn học', key: 'TenMH' },
        { header: 'Khoa', key: 'TenKhoa' },
        { header: 'Đã đăng ký', key: 'DaDangKy' },
        { header: 'Tối đa', key: 'ToiDa' },
      ],
      'thong-ke-dang-ky-mon',
    );
  };

  const handleExportRevenue = () => {
    if (!trendQuery.data?.length) return;
    exportToExcel(
      trendQuery.data,
      [
        { header: 'Tháng', key: 'thang' },
        { header: 'Doanh thu (đ)', key: 'doanhThu' },
      ],
      'doanh-thu-theo-thang',
    );
  };

  const handleExportPayment = () => {
    if (!paymentQuery.data?.length) return;
    exportToExcel(
      paymentQuery.data,
      [
        { header: 'Trạng thái', key: 'status' },
        { header: 'Số lượng', key: 'count' },
        { header: 'Tổng tiền (đ)', key: 'amount' },
      ],
      'trang-thai-hoc-phi',
    );
  };

  return (
    <>
      <PageHeader
        title="Báo cáo & Thống kê"
        icon={<IconChartBar className="h-4 w-4" />}
        iconTone="purple"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportPayment}
              disabled={!paymentQuery.data?.length}
            >
              <IconFileSpreadsheet className="h-4 w-4" />
              Xuất trạng thái HP
            </Button>
            <Button
              variant="outline"
              onClick={handleExportEnrollment}
              disabled={!enrollmentQuery.data?.length}
            >
              <IconFileSpreadsheet className="h-4 w-4" />
              Xuất thống kê ĐK
            </Button>
            <Button
              variant="outline"
              onClick={handleExportRevenue}
              disabled={!trendQuery.data?.length}
            >
              <IconFileSpreadsheet className="h-4 w-4" />
              Xuất doanh thu
            </Button>
            <Button variant="outline" onClick={() => handlePrint()}>
              <IconPrinter className="h-4 w-4" />
              In báo cáo
            </Button>
          </div>
        }
      />

      <div ref={printRef}>
        <div className="mb-5 grid gap-5 lg:grid-cols-2">
          {paymentQuery.data && <PaymentStatusChart data={paymentQuery.data} />}
          {enrollmentQuery.data && <EnrollmentStats rows={enrollmentQuery.data} />}
        </div>
        {trendQuery.data && <RevenueTrend data={trendQuery.data} />}
      </div>
    </>
  );
}
