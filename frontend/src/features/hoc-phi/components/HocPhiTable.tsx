import { useMemo, useState } from 'react';
import { IconCash, IconHistory, IconPrinter, IconArrowsSort, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
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
import { formatCurrencyVND } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ThuHocPhiRow } from '@/types';

interface Props {
  rows: ThuHocPhiRow[];
  onPay: (row: ThuHocPhiRow) => void;
  onHistory: (row: ThuHocPhiRow) => void;
  onPrint: (row: ThuHocPhiRow) => void;
  search: string;
  onSearchChange: (v: string) => void;
  filterHK: string;
  onFilterHKChange: (v: string) => void;
  hocKyList: string[];
}

function SortIcon({ col, sortConfig }: { col: string; sortConfig: { key: string; direction: string } | null }) {
  if (sortConfig?.key !== col) return <IconArrowsSort className="ml-1 inline h-3.5 w-3.5 opacity-40" />;
  return sortConfig.direction === 'asc'
    ? <IconArrowUp className="ml-1 inline h-3.5 w-3.5 text-teal-600" />
    : <IconArrowDown className="ml-1 inline h-3.5 w-3.5 text-teal-600" />;
}

export function HocPhiTable({ rows, onPay, onHistory, onPrint, search, onSearchChange, filterHK, onFilterHKChange, hocKyList }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { sorted, sortConfig, requestSort } = useTableSort(rows as unknown as Record<string, unknown>[]);

  const paginated = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize) as unknown as ThuHocPhiRow[],
    [sorted, page, pageSize],
  );

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-wrap gap-3 border-b p-4">
          <Input
            placeholder="Tìm theo mã SV, họ tên..."
            value={search}
            onChange={(e) => { onSearchChange(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <Select value={filterHK || 'all'} onValueChange={(v) => { onFilterHKChange(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Học kỳ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả HK</SelectItem>
              {hocKyList.map((hk) => (
                <SelectItem key={hk} value={hk}>{hk}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState message="Không tìm thấy phiếu học phí nào" />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => requestSort('MaSV')}>
                    Mã SV <SortIcon col="MaSV" sortConfig={sortConfig} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => requestSort('TenSV')}>
                    Sinh viên <SortIcon col="TenSV" sortConfig={sortConfig} />
                  </TableHead>
                  <TableHead>HK</TableHead>
                  <TableHead className="text-right">Tổng</TableHead>
                  <TableHead className="text-right">Đã đóng</TableHead>
                  <TableHead className="text-right">Còn lại</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((r, i) => (
                  <TableRow key={`${r.MaSV}-${r.MaHK}-${i}`}>
                    <TableCell className="font-mono font-semibold">{r.MaSV}</TableCell>
                    <TableCell>{r.TenSV}</TableCell>
                    <TableCell>{r.TenHK}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrencyVND(r.Tong)}</TableCell>
                    <TableCell className="text-right font-mono font-semibold text-success">
                      {formatCurrencyVND(r.DaDong)}
                    </TableCell>
                    <TableCell className={cn('text-right font-mono font-bold', r.ConLai > 0 ? 'text-danger' : 'text-success')}>
                      {formatCurrencyVND(r.ConLai)}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={r.TrangThai} />
                    </TableCell>
                    <TableCell className="text-center">
                      {r.ConLai > 0 && (
                        <ActionButton tone="pay" icon={<IconCash className="h-3.5 w-3.5" />} label="Thu tiền" onClick={() => onPay(r)} />
                      )}
                      <ActionButton tone="history" icon={<IconHistory className="h-3.5 w-3.5" />} label="Lịch sử thu" onClick={() => onHistory(r)} />
                      <ActionButton tone="print" icon={<IconPrinter className="h-3.5 w-3.5" />} label="In phiếu" onClick={() => onPrint(r)} />
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
