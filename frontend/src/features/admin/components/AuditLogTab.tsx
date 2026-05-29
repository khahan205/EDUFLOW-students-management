import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { apiClient } from '@/services/api-client';

interface AuditLog {
  Id: number;
  MaTK: number | null;
  HanhDong: string;
  DoiTuong: string;
  DoiTuongId: string | null;
  MoTa: string | null;
  IpAddress: string | null;
  ThoiGian: string;
  username?: string;
}

async function fetchAuditLogs(): Promise<AuditLog[]> {
  const { data } = await apiClient.get<AuditLog[]>('/admin/audit-log');
  return data;
}

export function AuditLogTab() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const query = useQuery({ queryKey: ['audit-log'], queryFn: fetchAuditLogs });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (query.data ?? []).filter(
      (r) =>
        !q ||
        r.HanhDong.toLowerCase().includes(q) ||
        r.DoiTuong.toLowerCase().includes(q) ||
        (r.MoTa?.toLowerCase().includes(q) ?? false) ||
        (r.username?.toLowerCase().includes(q) ?? false),
    );
  }, [query.data, search]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  return (
    <Card>
      <CardContent className="p-0">
        <div className="border-b p-4">
          <Input
            placeholder="Tìm kiếm theo hành động, đối tượng, mô tả..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-sm"
          />
        </div>

        {query.isLoading && <div className="h-[200px] animate-pulse m-4 rounded-lg bg-slate-100" />}

        {!query.isLoading && filtered.length === 0 ? (
          <EmptyState message="Chưa có lịch sử hoạt động" />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Hành động</TableHead>
                  <TableHead>Đối tượng</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((log) => (
                  <TableRow key={log.Id}>
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.ThoiGian).toLocaleString('vi-VN')}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.username ?? (log.MaTK ? `#${log.MaTK}` : '—')}
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                        {log.HanhDong}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      {log.DoiTuong}
                      {log.DoiTuongId && <span className="ml-1 text-slate-400">#{log.DoiTuongId}</span>}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-slate-600">
                      {log.MoTa ?? '—'}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-400">
                      {log.IpAddress ?? '—'}
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
