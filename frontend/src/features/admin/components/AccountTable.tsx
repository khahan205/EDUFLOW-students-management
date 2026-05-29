import { useMemo, useState } from 'react';
import { IconEdit, IconTrash, IconKey, IconArrowsSort, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ActionButton } from '@/components/common/ActionButton';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { useTableSort } from '@/hooks/use-table-sort';
import type { AccountRow } from '../api/admin-api';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Quản trị viên',
  'phong-dao-tao': 'Phòng Đào tạo',
  'phong-tai-chinh': 'Phòng Tài chính',
  'giang-vien': 'Giảng viên',
  'co-van': 'Cố vấn',
};

interface Props {
  rows: AccountRow[];
  onEdit: (acc: AccountRow) => void;
  onDelete: (acc: AccountRow) => void;
  onResetPassword: (acc: AccountRow) => void;
}

function SortIcon({ col, sortConfig }: { col: string; sortConfig: { key: string; direction: string } | null }) {
  if (sortConfig?.key !== col) return <IconArrowsSort className="ml-1 inline h-3.5 w-3.5 opacity-40" />;
  return sortConfig.direction === 'asc'
    ? <IconArrowUp className="ml-1 inline h-3.5 w-3.5 text-teal-600" />
    : <IconArrowDown className="ml-1 inline h-3.5 w-3.5 text-teal-600" />;
}

export function AccountTable({ rows, onEdit, onDelete, onResetPassword }: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        !q ||
        r.username.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const { sorted, sortConfig, requestSort } = useTableSort(filtered as unknown as Record<string, unknown>[]);

  const paginated = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize) as unknown as AccountRow[],
    [sorted, page, pageSize],
  );

  return (
    <Card>
      <CardContent className="p-0">
        <div className="border-b p-4">
          <Input
            placeholder="Tìm kiếm theo tên đăng nhập, họ tên, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="Không tìm thấy tài khoản nào" />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => requestSort('username')}>
                    Tên đăng nhập <SortIcon col="username" sortConfig={sortConfig} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => requestSort('fullName')}>
                    Họ tên <SortIcon col="fullName" sortConfig={sortConfig} />
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead>Đăng nhập cuối</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((acc) => (
                  <TableRow key={acc.id}>
                    <TableCell className="font-mono font-semibold">{acc.username}</TableCell>
                    <TableCell>{acc.fullName}</TableCell>
                    <TableCell className="text-slate-500">{acc.email || '—'}</TableCell>
                    <TableCell>{ROLE_LABEL[acc.role] ?? acc.role}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={acc.status === 'ACTIVE' ? 'default' : 'muted'}>
                        {acc.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs">
                      {acc.lastLoginAt
                        ? new Date(acc.lastLoginAt).toLocaleString('vi-VN')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <ActionButton tone="edit" icon={<IconEdit className="h-3.5 w-3.5" />} label="Sửa" onClick={() => onEdit(acc)} />
                      <ActionButton tone="history" icon={<IconKey className="h-3.5 w-3.5" />} label="Đặt lại MK" onClick={() => onResetPassword(acc)} />
                      <ActionButton tone="delete" icon={<IconTrash className="h-3.5 w-3.5" />} label="Xoá" onClick={() => onDelete(acc)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="border-t px-4">
              <Pagination
                total={filtered.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
