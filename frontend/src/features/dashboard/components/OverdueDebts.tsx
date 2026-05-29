import { IconAlertTriangle, IconMoodCheck } from '@tabler/icons-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrencyVND } from '@/lib/format';

export interface OverdueDebtRow {
  MaSV: string;
  TenSV: string;
  MaHK: string;
  TenHK: string;
  SoTienNo: number;
}

interface Props {
  debts: OverdueDebtRow[];
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.map((d) => (
              <TableRow key={`${d.MaSV}-${d.MaHK}`}>
                <TableCell>
                  <div className="font-semibold text-slate-900">{d.TenSV}</div>
                  <div className="text-[11.5px] text-slate-500">{d.MaSV}</div>
                </TableCell>
                <TableCell>{d.TenHK}</TableCell>
                <TableCell className="text-right font-mono font-semibold text-danger">
                  {formatCurrencyVND(d.SoTienNo)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
