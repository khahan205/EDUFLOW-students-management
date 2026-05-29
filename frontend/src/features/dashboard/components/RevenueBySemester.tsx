import { IconChartBar, IconFileSpreadsheet } from '@tabler/icons-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrencyVND } from '@/lib/format';
import { exportToExcel } from '@/lib/export-excel';
import type { RevenueBySemesterRow } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  rows: RevenueBySemesterRow[];
}

export function RevenueBySemester({ rows }: Props) {
  const handleExport = () => {
    exportToExcel(
      rows.map((r) => ({ ...r, ConLai: r.Tong - r.DaThu })),
      [
        { header: 'Năm học', key: 'NamHoc' },
        { header: 'Học kỳ', key: 'HocKy' },
        { header: 'Số tiền dự kiến thu (đ)', key: 'Tong' },
        { header: 'Số tiền đã thu (đ)', key: 'DaThu' },
        { header: 'Số tiền còn nợ (đ)', key: 'ConLai' },
        { header: 'Số sinh viên', key: 'SoSinhVien' },
      ],
      'BM13.1-doanh-thu-hoc-ky',
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-purple-100 text-purple-700">
              <IconChartBar className="h-3.5 w-3.5" />
            </span>
            Doanh thu theo học kỳ
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!rows.length}>
            <IconFileSpreadsheet className="h-4 w-4" />
            Xuất Excel
          </Button>
        </div>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Năm học</TableHead>
            <TableHead>HK</TableHead>
            <TableHead className="text-right">Dự kiến thu</TableHead>
            <TableHead className="text-right">Đã thu</TableHead>
            <TableHead className="text-right">Còn nợ</TableHead>
            <TableHead className="text-right">SV</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const conLai = r.Tong - r.DaThu;
            const isFullyPaid = conLai === 0 && r.Tong > 0;
            const hasDebt = conLai > 0;
            return (
              <TableRow key={`${r.NamHoc}-${r.HocKy}`}>
                <TableCell>{r.NamHoc}</TableCell>
                <TableCell>{r.HocKy}</TableCell>
                <TableCell className="text-right font-mono text-slate-600">
                  {formatCurrencyVND(r.Tong)}
                </TableCell>
                <TableCell className={cn(
                  'text-right font-mono font-semibold',
                  isFullyPaid ? 'text-success' : r.DaThu > 0 ? 'text-teal-600' : 'text-slate-400',
                )}>
                  {formatCurrencyVND(r.DaThu)}
                </TableCell>
                <TableCell className={cn(
                  'text-right font-mono font-semibold',
                  hasDebt ? 'text-red-600' : 'text-slate-400',
                )}>
                  {hasDebt ? formatCurrencyVND(conLai) : '—'}
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
