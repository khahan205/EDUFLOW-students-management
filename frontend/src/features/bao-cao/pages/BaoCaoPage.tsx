import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import { IconChartBar, IconFileSpreadsheet, IconPrinter } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportToExcel } from '@/lib/export-excel';
import { apiClient } from '@/services/api-client';
import {
  fetchPaymentStatusBreakdown,
  fetchEnrollmentStats,
  fetchRevenueTrend,
} from '../api/bao-cao-api';
import { PaymentStatusChart } from '../components/PaymentStatusChart';
import { EnrollmentStats } from '../components/EnrollmentStats';
import { RevenueTrend } from '../components/RevenueTrend';

interface HocKyOption { MaHK: string; TenHK: string; NamHoc: string; }
interface SinhVienNoRow {
  MaSV: string; TenSV: string; MaHK: string; TenHK: string; NamHoc: string;
  SoTienDangKy: number; SoTienPhaiDong: number; DaDong: number; ConLai: number;
}

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

export function BaoCaoPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });
  const [filterHK, setFilterHK] = useState('');

  const paymentQuery = useQuery({ queryKey: ['bao-cao', 'payment-status'], queryFn: fetchPaymentStatusBreakdown });
  const enrollmentQuery = useQuery({ queryKey: ['bao-cao', 'enrollment'], queryFn: fetchEnrollmentStats });
  const trendQuery = useQuery({ queryKey: ['bao-cao', 'revenue-trend'], queryFn: fetchRevenueTrend });

  const hocKyQuery = useQuery({
    queryKey: ['hoc-ky-list'],
    queryFn: async () => {
      const { data } = await apiClient.get<HocKyOption[]>('/master-data/hoc-ky');
      return data;
    },
    staleTime: 300_000,
  });

  const noQuery = useQuery({
    queryKey: ['bao-cao', 'sinh-vien-no', filterHK],
    queryFn: async () => {
      const { data } = await apiClient.get<SinhVienNoRow[]>('/bao-cao/sinh-vien-no', {
        params: filterHK ? { maHK: filterHK } : {},
      });
      return data;
    },
  });

  const noData = noQuery.data ?? [];

  const tongNo = useMemo(() => noData.reduce((s, r) => s + r.ConLai, 0), [noData]);

  const handleExportEnrollment = () => {
    if (!enrollmentQuery.data?.length) return;
    exportToExcel(enrollmentQuery.data, [
      { header: 'Mã môn', key: 'MaMH' },
      { header: 'Tên môn học', key: 'TenMH' },
      { header: 'Khoa', key: 'TenKhoa' },
      { header: 'Đã đăng ký', key: 'DaDangKy' },
      { header: 'Tối đa', key: 'ToiDa' },
    ], 'thong-ke-dang-ky-mon');
  };

  const handleExportRevenue = () => {
    if (!trendQuery.data?.length) return;
    exportToExcel(trendQuery.data, [
      { header: 'Tháng', key: 'thang' },
      { header: 'Doanh thu (đ)', key: 'doanhThu' },
    ], 'doanh-thu-theo-thang');
  };

  const handleExportPayment = () => {
    if (!paymentQuery.data?.length) return;
    exportToExcel(paymentQuery.data, [
      { header: 'Trạng thái', key: 'status' },
      { header: 'Số lượng', key: 'count' },
      { header: 'Tổng tiền (đ)', key: 'amount' },
    ], 'trang-thai-hoc-phi');
  };

  // BM13.2 export
  const handleExportNo = () => {
    if (!noData.length) return;
    exportToExcel(noData, [
      { header: 'Mã SV', key: 'MaSV' },
      { header: 'Họ tên', key: 'TenSV' },
      { header: 'Học kỳ', key: 'TenHK' },
      { header: 'Năm học', key: 'NamHoc' },
      { header: 'Số tiền đăng ký (đ)', key: 'SoTienDangKy' },
      { header: 'Số tiền phải đóng (đ)', key: 'SoTienPhaiDong' },
      { header: 'Đã đóng (đ)', key: 'DaDong' },
      { header: 'Còn lại (đ)', key: 'ConLai' },
    ], 'sinh-vien-chua-dong-hoc-phi');
  };

  return (
    <>
      <PageHeader
        title="Báo cáo & Thống kê"
        icon={<IconChartBar className="h-4 w-4" />}
        iconTone="purple"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPayment} disabled={!paymentQuery.data?.length}>
              <IconFileSpreadsheet className="h-4 w-4" />
              Xuất trạng thái HP
            </Button>
            <Button variant="outline" onClick={handleExportEnrollment} disabled={!enrollmentQuery.data?.length}>
              <IconFileSpreadsheet className="h-4 w-4" />
              Xuất thống kê ĐK
            </Button>
            <Button variant="outline" onClick={handleExportRevenue} disabled={!trendQuery.data?.length}>
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

      {/* BM13.2 — Danh sách sinh viên chưa đóng học phí */}
      <Card className="mt-5">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-sm">Danh sách sinh viên chưa hoàn thành đóng học phí</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filterHK || 'all'} onValueChange={(v) => setFilterHK(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tất cả học kỳ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả học kỳ</SelectItem>
                  {(hocKyQuery.data ?? []).map((hk) => (
                    <SelectItem key={hk.MaHK} value={hk.MaHK}>
                      {hk.TenHK} {hk.NamHoc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExportNo} disabled={!noData.length}>
                <IconFileSpreadsheet className="h-4 w-4" />
                Xuất Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {noQuery.isLoading && <div className="m-4 h-32 animate-pulse rounded-lg bg-slate-100" />}
          {!noQuery.isLoading && noData.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Không có sinh viên nào còn nợ học phí</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã SV</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Học kỳ</TableHead>
                    <TableHead className="text-right">Phải đóng</TableHead>
                    <TableHead className="text-right">Đã đóng</TableHead>
                    <TableHead className="text-right text-red-600">Còn lại</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {noData.map((r) => (
                    <TableRow key={`${r.MaSV}-${r.MaHK}`}>
                      <TableCell className="font-mono font-semibold">{r.MaSV}</TableCell>
                      <TableCell className="font-medium">{r.TenSV}</TableCell>
                      <TableCell className="text-slate-500">{r.TenHK} {r.NamHoc}</TableCell>
                      <TableCell className="text-right text-slate-600">{fmt(r.SoTienPhaiDong)}</TableCell>
                      <TableCell className="text-right text-emerald-600">{fmt(r.DaDong)}</TableCell>
                      <TableCell className="text-right font-semibold text-red-600">{fmt(r.ConLai)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between border-t px-4 py-3 text-sm">
                <span className="text-slate-500">{noData.length} sinh viên còn nợ</span>
                <span className="font-semibold text-red-600">Tổng nợ: {fmt(tongNo)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
