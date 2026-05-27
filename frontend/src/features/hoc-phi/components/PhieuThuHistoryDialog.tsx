import { useQuery } from '@tanstack/react-query';
import { IconHistory } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/common/EmptyState';
import { fetchPaymentHistory } from '../api/hoc-phi-api';
import { formatCurrencyVND, formatDate } from '@/lib/format';
import type { ThuHocPhiRow } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: ThuHocPhiRow | null;
}

export function PhieuThuHistoryDialog({ open, onOpenChange, row }: Props) {
  const query = useQuery({
    queryKey: ['hoc-phi', 'history', row?.MaSV, row?.MaHK],
    queryFn: () => fetchPaymentHistory(row!.MaSV, row!.MaHK),
    enabled: open && !!row,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconHistory className="h-5 w-5 text-info" />
            Lịch sử thu — {row?.TenSV} · {row?.TenHK}
          </DialogTitle>
        </DialogHeader>

        {query.isLoading && <div className="h-32 animate-pulse rounded-lg bg-slate-100" />}
        {query.data && query.data.length === 0 && <EmptyState message="Chưa có phiếu thu nào" />}
        {query.data && query.data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Ngày thu</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.map((p) => (
                <TableRow key={p.MaPhieuThu}>
                  <TableCell className="font-mono font-semibold">{p.MaPhieuThu}</TableCell>
                  <TableCell>{formatDate(p.NgayThu)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-success">
                    {formatCurrencyVND(p.SoTienThu)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
