import { IconCheck, IconX } from '@tabler/icons-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrencyVND } from '@/lib/format';
import type { MonHocVoiTrangThai } from '../api/dang-ky-api';

interface Props {
  rows: MonHocVoiTrangThai[];
  hocKy: { TenHK: string; NamHoc: string };
  onRegister: (maMH: string) => void;
  onUnregister: (maMH: string) => void;
  pendingMaMH?: string | null;
}

export function MonHocPickerTable({ rows, hocKy, onRegister, onUnregister, pendingMaMH }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Môn được mở trong{' '}
          <span className="text-teal-700">
            {hocKy.TenHK} · {hocKy.NamHoc}
          </span>
        </CardTitle>
      </CardHeader>

      {rows.length === 0 ? (
        <EmptyState message="Học kỳ này chưa có môn nào được mở" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã môn</TableHead>
              <TableHead>Tên môn</TableHead>
              <TableHead className="text-center">TC</TableHead>
              <TableHead className="text-right">Học phí</TableHead>
              <TableHead className="text-center">Sĩ số</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((mh) => {
              const isFull = (mh.SiSoHienTai ?? 0) >= (mh.SiSoToiDa ?? 0);
              return (
                <TableRow key={mh.MaMH}>
                  <TableCell className="font-mono font-semibold">{mh.MaMH}</TableCell>
                  <TableCell>{mh.TenMH}</TableCell>
                  <TableCell className="text-center font-mono">{mh.SoTinChi}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-success">
                    {formatCurrencyVND(mh.HocPhi ?? 0)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={isFull ? 'danger' : 'info'} className="font-mono">
                      {mh.SiSoHienTai ?? 0}/{mh.SiSoToiDa ?? 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {mh.daDangKy ? (
                      <Badge variant="success">Đã đăng ký</Badge>
                    ) : (
                      <Badge variant="muted">Chưa đăng ký</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {mh.daDangKy ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onUnregister(mh.MaMH)}
                        disabled={pendingMaMH === mh.MaMH}
                      >
                        <IconX className="h-3.5 w-3.5" />
                        Huỷ
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => onRegister(mh.MaMH)}
                        disabled={isFull || pendingMaMH === mh.MaMH}
                      >
                        <IconCheck className="h-3.5 w-3.5" />
                        Đăng ký
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
