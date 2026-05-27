import { IconAlertTriangle, IconMoodCheck } from '@tabler/icons-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrencyVND, formatDate } from '@/lib/format';
import type { OverdueDebt } from '../mocks/dashboard-mocks';

interface Props {
  debts: OverdueDebt[];
}

export function OverdueDebts({ debts }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="grid h-7 w-7 place-items-center rounded-md bg-danger-bg text-danger">
            <IconAlertTriangle className="h-3.5 w-3.5" />
          </span>
          Công nợ quá hạn
        </CardTitle>
      </CardHeader>
      {debts.length === 0 ? (
        <EmptyState icon={<IconMoodCheck />} message="Không có công nợ quá hạn" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sinh viên</TableHead>
              <TableHead>Học kỳ</TableHead>
              <TableHead className="text-right">Còn nợ</TableHead>
              <TableHead>Hạn đóng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.map((d) => (
              <TableRow key={`${d.MaSV}-${d.TenHK}`}>
                <TableCell>
                  <div className="font-semibold text-slate-900">{d.TenSV}</div>
                  <div className="text-[11.5px] text-slate-500">{d.MaSV}</div>
                </TableCell>
                <TableCell>{d.TenHK}</TableCell>
                <TableCell className="text-right font-mono font-semibold text-danger">
                  {formatCurrencyVND(d.ConNo)}
                </TableCell>
                <TableCell>{formatDate(d.HanDong)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
