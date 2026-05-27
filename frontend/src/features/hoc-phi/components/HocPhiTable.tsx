import { IconCash, IconHistory, IconPrinter } from '@tabler/icons-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { ActionButton } from '@/components/common/ActionButton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrencyVND } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ThuHocPhiRow } from '@/types';

interface Props {
  rows: ThuHocPhiRow[];
  onPay: (row: ThuHocPhiRow) => void;
  onHistory: (row: ThuHocPhiRow) => void;
  onPrint: (row: ThuHocPhiRow) => void;
}

export function HocPhiTable({ rows, onPay, onHistory, onPrint }: Props) {
  return (
    <Card>
      {rows.length === 0 ? (
        <EmptyState message="Chưa có phiếu học phí nào" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã SV</TableHead>
              <TableHead>Sinh viên</TableHead>
              <TableHead>HK</TableHead>
              <TableHead className="text-right">Tổng</TableHead>
              <TableHead className="text-right">Đã đóng</TableHead>
              <TableHead className="text-right">Còn lại</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={`${r.MaSV}-${r.MaHK}-${i}`}>
                <TableCell className="font-mono font-semibold">{r.MaSV}</TableCell>
                <TableCell>{r.TenSV}</TableCell>
                <TableCell>{r.TenHK}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrencyVND(r.Tong)}</TableCell>
                <TableCell className="text-right font-mono font-semibold text-success">
                  {formatCurrencyVND(r.DaDong)}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-mono font-bold',
                    r.ConLai > 0 ? 'text-danger' : 'text-success',
                  )}
                >
                  {formatCurrencyVND(r.ConLai)}
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={r.TrangThai} />
                </TableCell>
                <TableCell className="text-center">
                  {r.ConLai > 0 && (
                    <ActionButton
                      tone="pay"
                      icon={<IconCash className="h-3.5 w-3.5" />}
                      label="Thu tiền"
                      onClick={() => onPay(r)}
                    />
                  )}
                  <ActionButton
                    tone="history"
                    icon={<IconHistory className="h-3.5 w-3.5" />}
                    label="Lịch sử thu"
                    onClick={() => onHistory(r)}
                  />
                  <ActionButton
                    tone="print"
                    icon={<IconPrinter className="h-3.5 w-3.5" />}
                    label="In phiếu"
                    onClick={() => onPrint(r)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
