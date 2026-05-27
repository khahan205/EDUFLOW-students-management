import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { EnrollmentStatRow } from '@/types';

interface Props {
  rows: EnrollmentStatRow[];
}

export function EnrollmentStats({ rows }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Thống kê đăng ký môn</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Môn</TableHead>
            <TableHead>Khoa</TableHead>
            <TableHead className="text-center">Đã ĐK</TableHead>
            <TableHead className="text-center">Tối đa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.MaMH}>
              <TableCell>
                <div className="font-semibold text-slate-900">{r.MaMH}</div>
                <div className="text-[11.5px] text-slate-500">{r.TenMH}</div>
              </TableCell>
              <TableCell>{r.TenKhoa}</TableCell>
              <TableCell
                className={cn(
                  'text-center font-mono font-semibold',
                  r.DaDangKy > 0 ? 'text-coral-600' : 'text-slate-500',
                )}
              >
                {r.DaDangKy}
              </TableCell>
              <TableCell className="text-center font-mono text-slate-500">{r.ToiDa}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
