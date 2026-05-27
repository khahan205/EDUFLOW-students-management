import { IconChartBar } from '@tabler/icons-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrencyVND } from '@/lib/format';
import type { RevenueBySemesterRow } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  rows: RevenueBySemesterRow[];
}

export function RevenueBySemester({ rows }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="grid h-7 w-7 place-items-center rounded-md bg-purple-100 text-purple-700">
            <IconChartBar className="h-3.5 w-3.5" />
          </span>
          Doanh thu theo học kỳ
        </CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Năm học</TableHead>
            <TableHead>HK</TableHead>
            <TableHead className="text-right">Tổng</TableHead>
            <TableHead className="text-right">Đã thu</TableHead>
            <TableHead className="text-right">SV</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const isPaid = r.DaThu > 0;
            const isUnpaid = r.DaThu === 0 && r.Tong > 0;
            return (
              <TableRow key={`${r.NamHoc}-${r.HocKy}`}>
                <TableCell>{r.NamHoc}</TableCell>
                <TableCell>{r.HocKy}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrencyVND(r.Tong)}</TableCell>
                <TableCell
                  className={cn(
                    'text-right font-mono font-semibold',
                    isPaid && 'text-success',
                    isUnpaid && r.SoSinhVien > 1 && 'text-coral-600',
                    isUnpaid && r.SoSinhVien <= 1 && 'text-slate-400',
                  )}
                >
                  {formatCurrencyVND(r.DaThu)}
                </TableCell>
                <TableCell className="text-right font-mono">{r.SoSinhVien}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
