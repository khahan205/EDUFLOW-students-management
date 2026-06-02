import { useQuery } from '@tanstack/react-query';
import { IconHistory, IconCash, IconBuildingBank } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { fetchPaymentHistory } from '../api/hoc-phi-api';
import { formatCurrencyVND, formatDate } from '@/lib/format';
import type { ThuHocPhiRow } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: ThuHocPhiRow | null;
}

const MAX_PAYMENTS = 2;

function PaymentMethodBadge({ method }: { method?: string }) {
  if (method === 'CHUYEN_KHOAN') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
        <IconBuildingBank className="h-3 w-3" />
        Chuyển khoản
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
      <IconCash className="h-3 w-3" />
      Tiền mặt
    </span>
  );
}

export function PhieuThuHistoryDialog({ open, onOpenChange, row }: Props) {
  const query = useQuery({
    queryKey: ['hoc-phi', 'history', row?.MaSV, row?.MaHK],
    queryFn: () => fetchPaymentHistory(row!.MaSV, row!.MaHK),
    enabled: open && !!row,
  });

  const soLanDaDong = query.data?.length ?? 0;
  const soLanConLai = MAX_PAYMENTS - soLanDaDong;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconHistory className="h-5 w-5 text-info" />
            Lịch sử thu — {row?.TenSV} · {row?.TenHK}
          </DialogTitle>
        </DialogHeader>

        {/* Chỉ hiện counter lần đóng khi SV còn nợ (chưa đóng đủ) */}
        {row && row.ConLai > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm">
            <span className="text-slate-600">
              Đã đóng <strong>{soLanDaDong}/{MAX_PAYMENTS}</strong> lần trong học kỳ này
            </span>
            {soLanConLai > 0 ? (
              <Badge variant="success">Còn {soLanConLai} lần</Badge>
            ) : (
              <Badge variant="warning">Đã dùng hết lượt đóng</Badge>
            )}
          </div>
        )}
        {row && row.ConLai === 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            <Badge variant="success">Đã đóng đủ học phí</Badge>
            <span>— Lịch sử {soLanDaDong} lần đóng tiền:</span>
          </div>
        )}

        {query.isLoading && <div className="h-32 animate-pulse rounded-lg bg-slate-100" />}
        {query.data && query.data.length === 0 && <EmptyState message="Chưa có phiếu thu nào" />}
        {query.data && query.data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Ngày thu</TableHead>
                <TableHead>Hình thức</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.map((p) => (
                <TableRow key={p.MaPhieuThu}>
                  <TableCell className="font-mono font-semibold">{p.MaPhieuThu}</TableCell>
                  <TableCell>{formatDate(p.NgayThu)}</TableCell>
                  <TableCell>
                    <PaymentMethodBadge method={(p as { HinhThucTT?: string }).HinhThucTT} />
                  </TableCell>
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
