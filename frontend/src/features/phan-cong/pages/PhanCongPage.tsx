import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconChalkboard,
  IconUserCheck,
  IconUserX,
  IconFileSpreadsheet,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { exportToExcel } from '@/lib/export-excel';
import {
  fetchPhanCong,
  fetchGiangVienAccounts,
  assignGiangVien,
  removeGiangVien,
  type PhanCongRow,
} from '../api/phan-cong-api';

function AssignDialog({
  row,
  onClose,
}: {
  row: PhanCongRow | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [selectedMaTK, setSelectedMaTK] = useState('');

  const gvQuery = useQuery({
    queryKey: ['giang-vien-accounts'],
    queryFn: fetchGiangVienAccounts,
    enabled: !!row,
    staleTime: 60_000,
  });

  const assignMutation = useMutation({
    mutationFn: () => assignGiangVien({ maHK: row!.MaHK, maMH: row!.MaMH, maTK: Number(selectedMaTK) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['phan-cong'] });
      toast.success('Đã phân công giảng viên');
      onClose();
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Phân công thất bại'),
  });

  const removeMutation = useMutation({
    mutationFn: () => removeGiangVien(row!.MaHK, row!.MaMH),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['phan-cong'] });
      toast.success('Đã huỷ phân công');
      onClose();
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Huỷ phân công thất bại'),
  });

  if (!row) return null;

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Phân công giảng viên</DialogTitle>
          <p className="text-sm text-slate-500 mt-1">
            {row.TenMH} <span className="font-mono">({row.MaMH})</span> — {row.TenHK}
          </p>
        </DialogHeader>

        {row.GiangVien && (
          <div className="rounded-lg bg-teal-50 border border-teal-200 px-4 py-3 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-600 mb-1">Giảng viên hiện tại</p>
            <p className="font-medium text-slate-800">{row.GiangVien.HoTen}</p>
            {row.GiangVien.Email && <p className="text-slate-500">{row.GiangVien.Email}</p>}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">
            {row.GiangVien ? 'Đổi giảng viên:' : 'Chọn giảng viên:'}
          </p>
          <Select value={selectedMaTK} onValueChange={setSelectedMaTK}>
            <SelectTrigger>
              <SelectValue placeholder="— Chọn giảng viên —" />
            </SelectTrigger>
            <SelectContent>
              {(gvQuery.data ?? []).map((gv) => (
                <SelectItem key={gv.MaTK} value={String(gv.MaTK)}>
                  {gv.HoTen}{gv.Email ? ` (${gv.Email})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-2">
          {row.GiangVien && (
            <Button
              variant="ghost"
              className="mr-auto text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={removeMutation.isPending}
              onClick={() => removeMutation.mutate()}
            >
              <IconUserX className="h-4 w-4" />
              Huỷ phân công
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          <Button
            disabled={!selectedMaTK || assignMutation.isPending}
            onClick={() => assignMutation.mutate()}
          >
            <IconUserCheck className="h-4 w-4" />
            {row.GiangVien ? 'Cập nhật' : 'Phân công'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PhanCongPage() {
  const [search, setSearch] = useState('');
  const [filterNamHoc, setFilterNamHoc] = useState('');
  const [filterHocKy, setFilterHocKy] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('');
  const [selectedRow, setSelectedRow] = useState<PhanCongRow | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const query = useQuery({ queryKey: ['phan-cong'], queryFn: fetchPhanCong });

  const namHocList = useMemo(() => {
    const set = new Set((query.data ?? []).map((r) => r.NamHoc));
    return Array.from(set).sort().reverse();
  }, [query.data]);

  const hocKyList = useMemo(() => {
    const set = new Set(
      (query.data ?? [])
        .filter((r) => !filterNamHoc || r.NamHoc === filterNamHoc)
        .map((r) => r.TenHK),
    );
    return Array.from(set).sort();
  }, [query.data, filterNamHoc]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (query.data ?? []).filter(
      (r) =>
        (!filterNamHoc || r.NamHoc === filterNamHoc) &&
        (!filterHocKy || r.TenHK === filterHocKy) &&
        (!filterTrangThai ||
          (filterTrangThai === 'assigned' && r.GiangVien) ||
          (filterTrangThai === 'unassigned' && !r.GiangVien)) &&
        (!q ||
          r.MaMH.toLowerCase().includes(q) ||
          r.TenMH.toLowerCase().includes(q) ||
          (r.GiangVien?.HoTen.toLowerCase().includes(q) ?? false)),
    );
  }, [query.data, search, filterNamHoc, filterHocKy, filterTrangThai]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const handleExport = () => {
    exportToExcel(
      filtered.map((r) => ({
        ...r,
        TenGiangVien: r.GiangVien?.HoTen ?? '',
        EmailGV: r.GiangVien?.Email ?? '',
      })),
      [
        { header: 'Năm học', key: 'NamHoc' },
        { header: 'Học kỳ', key: 'TenHK' },
        { header: 'Mã môn', key: 'MaMH' },
        { header: 'Tên môn học', key: 'TenMH' },
        { header: 'Số TC', key: 'SoTinChi' },
        { header: 'Giảng viên', key: 'TenGiangVien' },
        { header: 'Email GV', key: 'EmailGV' },
      ],
      'phan-cong-giang-day',
    );
  };

  const unassignedCount = (query.data ?? []).filter((r) => !r.GiangVien).length;

  return (
    <>
      <PageHeader
        title="Phân công giảng dạy"
        icon={<IconChalkboard className="h-4 w-4" />}
        iconTone="teal"
        actions={
          <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
            <IconFileSpreadsheet className="h-4 w-4" />
            Xuất Excel
          </Button>
        }
      />

      {unassignedCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <IconUserX className="h-4 w-4 shrink-0" />
          Có <strong>{unassignedCount}</strong> lớp học phần chưa được phân công giảng viên.
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 border-b p-4">
            <Input
              placeholder="Tìm mã môn, tên môn, giảng viên..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-56"
            />
            <Select
              value={filterNamHoc || 'all'}
              onValueChange={(v) => { setFilterNamHoc(v === 'all' ? '' : v); setFilterHocKy(''); setPage(1); }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Năm học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả năm học</SelectItem>
                {namHocList.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterHocKy || 'all'}
              onValueChange={(v) => { setFilterHocKy(v === 'all' ? '' : v); setPage(1); }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Học kỳ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả học kỳ</SelectItem>
                {hocKyList.map((hk) => (
                  <SelectItem key={hk} value={hk}>{hk}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterTrangThai || 'all'}
              onValueChange={(v) => { setFilterTrangThai(v === 'all' ? '' : v); setPage(1); }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="assigned">Đã phân công</SelectItem>
                <SelectItem value="unassigned">Chưa phân công</SelectItem>
              </SelectContent>
            </Select>
            {(filterNamHoc || filterHocKy || filterTrangThai || search) && (
              <button
                type="button"
                onClick={() => { setFilterNamHoc(''); setFilterHocKy(''); setFilterTrangThai(''); setSearch(''); setPage(1); }}
                className="text-sm text-slate-500 underline hover:text-slate-800"
              >
                Xoá bộ lọc
              </button>
            )}
          </div>

          {query.isLoading && <div className="m-4 h-64 animate-pulse rounded-lg bg-slate-100" />}

          {!query.isLoading && filtered.length === 0 ? (
            <EmptyState message="Không tìm thấy lớp học phần nào" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Năm học</TableHead>
                    <TableHead>Học kỳ</TableHead>
                    <TableHead>Mã môn</TableHead>
                    <TableHead>Tên môn học</TableHead>
                    <TableHead className="text-center">TC</TableHead>
                    <TableHead>Giảng viên phụ trách</TableHead>
                    <TableHead className="text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((r) => (
                    <TableRow key={`${r.MaHK}-${r.MaMH}`}>
                      <TableCell className="text-slate-500">{r.NamHoc}</TableCell>
                      <TableCell className="text-slate-500">{r.TenHK}</TableCell>
                      <TableCell className="font-mono font-semibold">{r.MaMH}</TableCell>
                      <TableCell className="font-medium">{r.TenMH}</TableCell>
                      <TableCell className="text-center">{r.SoTinChi}</TableCell>
                      <TableCell>
                        {r.GiangVien ? (
                          <div>
                            <p className="font-medium text-slate-800">{r.GiangVien.HoTen}</p>
                            {r.GiangVien.Email && (
                              <p className="text-xs text-slate-400">{r.GiangVien.Email}</p>
                            )}
                          </div>
                        ) : (
                          <Badge variant="warning">Chưa phân công</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRow(r)}
                        >
                          <IconUserCheck className="h-4 w-4" />
                          {r.GiangVien ? 'Đổi GV' : 'Phân công'}
                        </Button>
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

      <AssignDialog row={selectedRow} onClose={() => setSelectedRow(null)} />
    </>
  );
}
