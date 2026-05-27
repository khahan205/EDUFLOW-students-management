import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { ActionButton } from '@/components/common/ActionButton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import type { SinhVien } from '@/types';

interface Props {
  rows: SinhVien[];
  onEdit: (sv: SinhVien) => void;
  onDelete: (sv: SinhVien) => void;
}

export function SinhVienTable({ rows, onEdit, onDelete }: Props) {
  return (
    <Card>
      {rows.length === 0 ? (
        <EmptyState message="Chưa có sinh viên nào" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã SV</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Lớp</TableHead>
              <TableHead>Khoa</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((sv) => (
              <TableRow key={sv.MaSV}>
                <TableCell className="font-mono font-semibold">{sv.MaSV}</TableCell>
                <TableCell>{sv.TenSV}</TableCell>
                <TableCell>{sv.TenLop ?? '—'}</TableCell>
                <TableCell>{sv.MaNganh === 'NG_CNTT' ? 'CNTT' : sv.MaNganh ?? '—'}</TableCell>
                <TableCell className="text-slate-600">{sv.Email ?? '—'}</TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={sv.TrangThai ?? 'Đang học'} />
                </TableCell>
                <TableCell className="text-center">
                  <ActionButton
                    tone="edit"
                    icon={<IconEdit className="h-3.5 w-3.5" />}
                    label="Sửa"
                    onClick={() => onEdit(sv)}
                  />
                  <ActionButton
                    tone="delete"
                    icon={<IconTrash className="h-3.5 w-3.5" />}
                    label="Xoá"
                    onClick={() => onDelete(sv)}
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
