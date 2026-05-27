import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionButton } from '@/components/common/ActionButton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrencyVND } from '@/lib/format';
import type { MonHoc } from '@/types';

interface Props {
  rows: MonHoc[];
  onEdit: (mh: MonHoc) => void;
  onDelete: (mh: MonHoc) => void;
}

export function MonHocTable({ rows, onEdit, onDelete }: Props) {
  return (
    <Card>
      {rows.length === 0 ? (
        <EmptyState message="Chưa có môn học nào" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã môn</TableHead>
              <TableHead>Tên môn</TableHead>
              <TableHead className="text-center">TC</TableHead>
              <TableHead className="text-right">Học phí</TableHead>
              <TableHead>HK</TableHead>
              <TableHead>Khoa</TableHead>
              <TableHead className="text-center">SL</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((mh) => (
              <TableRow key={mh.MaMH}>
                <TableCell className="font-mono font-semibold">{mh.MaMH}</TableCell>
                <TableCell>{mh.TenMH}</TableCell>
                <TableCell className="text-center font-mono">{mh.SoTinChi}</TableCell>
                <TableCell className="text-right font-mono font-semibold text-success">
                  {formatCurrencyVND(mh.HocPhi ?? 0)}
                </TableCell>
                <TableCell>{mh.HocKy}</TableCell>
                <TableCell>{mh.TenKhoa}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="info" className="font-mono">
                    {mh.SiSoHienTai ?? 0}/{mh.SiSoToiDa ?? 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <ActionButton tone="edit" icon={<IconEdit className="h-3.5 w-3.5" />} label="Sửa" onClick={() => onEdit(mh)} />
                  <ActionButton tone="delete" icon={<IconTrash className="h-3.5 w-3.5" />} label="Xoá" onClick={() => onDelete(mh)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
