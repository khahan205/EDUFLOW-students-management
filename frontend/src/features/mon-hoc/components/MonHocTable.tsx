import { useMemo, useState } from 'react';
import { IconEdit, IconTrash, IconArrowsSort, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ActionButton } from '@/components/common/ActionButton';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { useTableSort } from '@/hooks/use-table-sort';
import { formatCurrencyVND } from '@/lib/format';
import type { MonHoc } from '@/types';

interface Props {
  rows: MonHoc[];
  onEdit: (mh: MonHoc) => void;
  onDelete: (mh: MonHoc) => void;
  search: string;
  onSearchChange: (v: string) => void;
  filterLoaiMon: string;
  onFilterLoaiMonChange: (v: string) => void;
}

function SortIcon({ col, sortConfig }: { col: string; sortConfig: { key: string; direction: string } | null }) {
  if (sortConfig?.key !== col) return <IconArrowsSort className="ml-1 inline h-3.5 w-3.5 opacity-40" />;
  return sortConfig.direction === 'asc'
    ? <IconArrowUp className="ml-1 inline h-3.5 w-3.5 text-teal-600" />
    : <IconArrowDown className="ml-1 inline h-3.5 w-3.5 text-teal-600" />;
}

export function MonHocTable({ rows, onEdit, onDelete, search, onSearchChange, filterLoaiMon, onFilterLoaiMonChange }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { sorted, sortConfig, requestSort } = useTableSort(rows as unknown as Record<string, unknown>[]);

  const paginated = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize) as unknown as MonHoc[],
    [sorted, page, pageSize],
  );

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-wrap gap-3 border-b p-4">
          <Input
            placeholder="Tìm theo mã môn, tên môn..."
            value={search}
            onChange={(e) => { onSearchChange(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <Select value={filterLoaiMon || 'all'} onValueChange={(v) => { onFilterLoaiMonChange(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Loại môn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="LT">Lý thuyết</SelectItem>
              <SelectItem value="TH">Thực hành</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState message="Không tìm thấy môn học nào" />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => requestSort('MaMH')}>
                    Mã môn <SortIcon col="MaMH" sortConfig={sortConfig} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => requestSort('TenMH')}>
                    Tên môn <SortIcon col="TenMH" sortConfig={sortConfig} />
                  </TableHead>
                  <TableHead className="text-center">TC</TableHead>
                  <TableHead className="text-right">Học phí</TableHead>
                  <TableHead>HK</TableHead>
                  <TableHead>Khoa</TableHead>
                  <TableHead className="text-center">SL</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((mh) => (
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
