import { useMemo, useState } from 'react';
import { IconEdit, IconTrash, IconArrowsSort, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ActionButton } from '@/components/common/ActionButton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { useTableSort } from '@/hooks/use-table-sort';
import type { SinhVien } from '@/types';

interface NganhOption { MaNganh: string; TenNganh: string; }

interface Props {
  rows: SinhVien[];
  onEdit: (sv: SinhVien) => void;
  onDelete: (sv: SinhVien) => void;
  onRowClick?: (sv: SinhVien) => void;
  search: string;
  onSearchChange: (v: string) => void;
  filterTrangThai: string;
  onFilterTrangThaiChange: (v: string) => void;
  filterNganh?: string;
  onFilterNganhChange?: (v: string) => void;
  nganhOptions?: NganhOption[];
}

function SortIcon({ col, sortConfig }: { col: string; sortConfig: { key: string; direction: string } | null }) {
  if (sortConfig?.key !== col) return <IconArrowsSort className="ml-1 inline h-3.5 w-3.5 opacity-40" />;
  return sortConfig.direction === 'asc'
    ? <IconArrowUp className="ml-1 inline h-3.5 w-3.5 text-teal-600" />
    : <IconArrowDown className="ml-1 inline h-3.5 w-3.5 text-teal-600" />;
}

export function SinhVienTable({ rows, onEdit, onDelete, onRowClick, search, onSearchChange, filterTrangThai, onFilterTrangThaiChange, filterNganh, onFilterNganhChange, nganhOptions }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { sorted, sortConfig, requestSort } = useTableSort(rows as unknown as Record<string, unknown>[]);

  const paginated = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize) as unknown as SinhVien[],
    [sorted, page, pageSize],
  );

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-wrap gap-3 border-b p-4">
          <Input
            placeholder="Tìm theo mã SV, họ tên, email..."
            value={search}
            onChange={(e) => { onSearchChange(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <Select value={filterTrangThai || 'all'} onValueChange={(v) => { onFilterTrangThaiChange(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="Đang học">Đang học</SelectItem>
              <SelectItem value="Bảo lưu">Bảo lưu</SelectItem>
              <SelectItem value="Tốt nghiệp">Tốt nghiệp</SelectItem>
            </SelectContent>
          </Select>
          {nganhOptions && onFilterNganhChange && (
            <Select value={filterNganh || 'all'} onValueChange={(v) => { onFilterNganhChange(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Ngành học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả ngành</SelectItem>
                {nganhOptions.map((n) => (
                  <SelectItem key={n.MaNganh} value={n.MaNganh}>{n.TenNganh}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {rows.length === 0 ? (
          <EmptyState message="Không tìm thấy sinh viên nào" />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => requestSort('MaSV')}>
                    Mã SV <SortIcon col="MaSV" sortConfig={sortConfig} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => requestSort('TenSV')}>
                    Họ tên <SortIcon col="TenSV" sortConfig={sortConfig} />
                  </TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead>Khoa</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((sv) => (
                  <TableRow
                    key={sv.MaSV}
                    className={onRowClick ? 'cursor-pointer hover:bg-teal-50' : undefined}
                    onClick={() => onRowClick?.(sv)}
                  >
                    <TableCell className="font-mono font-semibold">{sv.MaSV}</TableCell>
                    <TableCell>{sv.TenSV}</TableCell>
                    <TableCell>{sv.TenLop ?? '—'}</TableCell>
                    <TableCell>{sv.MaNganh === 'NG_CNTT' ? 'CNTT' : sv.MaNganh ?? '—'}</TableCell>
                    <TableCell className="text-slate-600">{sv.Email ?? '—'}</TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={sv.TrangThai ?? 'Đang học'} />
                    </TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <ActionButton tone="edit" icon={<IconEdit className="h-3.5 w-3.5" />} label="Sửa" onClick={() => onEdit(sv)} />
                      <ActionButton tone="delete" icon={<IconTrash className="h-3.5 w-3.5" />} label="Xoá" onClick={() => onDelete(sv)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="border-t px-4">
              <Pagination
                total={rows.length}
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
