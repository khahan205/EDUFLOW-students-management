import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconCalendarEvent,
  IconPlus,
  IconTrash,
  IconPencil,
  IconUsers,
  IconFileSpreadsheet,
  IconUserCheck,
  IconUserX,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionButton } from '@/components/common/ActionButton';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { exportToExcel } from '@/lib/export-excel';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/services/api-client';
import { fetchMonHocMo, openCourse, updateCourse, closeCourse, type MonHocMoRow } from '../api/mon-hoc-mo-api';
import { fetchSinhVienLop } from '@/features/giang-vien/api/giang-vien-api';
import { fetchGiangVienAccounts, assignGiangVien, removeGiangVien } from '@/features/phan-cong/api/phan-cong-api';
import { useAuthStore } from '@/stores/auth-store';

/* ─── Types for dropdown data ─── */
interface HocKyOption { MaHK: string; TenHK: string; NamHoc: string; }
interface MonHocOption { MaMH: string; TenMH: string; SoTinChi: number; SiSoToiDa: number; }

/* ── Dialog: Phân công giảng viên ── */
function AssignDialog({ row, onClose }: { row: MonHocMoRow | null; onClose: () => void }) {
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
      qc.invalidateQueries({ queryKey: ['mon-hoc-mo'] });
      toast.success('Đã phân công giảng viên');
      onClose();
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Phân công thất bại'),
  });

  const removeMutation = useMutation({
    mutationFn: () => removeGiangVien(row!.MaHK, row!.MaMH),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mon-hoc-mo'] });
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
          <p className="mt-1 text-sm text-slate-500">
            {row.TenMH} <span className="font-mono">({row.MaMH})</span> — {row.TenHK}
          </p>
        </DialogHeader>

        {row.GiangVien && (
          <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-teal-600">Giảng viên hiện tại</p>
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

/* ── Dialog: Thêm lớp học phần ── */
function AddDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [maHK, setMaHK] = useState('');
  const [maMH, setMaMH] = useState('');
  const [siSo, setSiSo] = useState('');

  const hocKyQuery = useQuery({
    queryKey: ['hoc-ky-list'],
    queryFn: async () => {
      const { data } = await apiClient.get<HocKyOption[]>('/master-data/hoc-ky');
      return data;
    },
    staleTime: 300_000,
  });

  const monHocQuery = useQuery({
    queryKey: ['mon-hoc-list'],
    queryFn: async () => {
      const { data } = await apiClient.get<MonHocOption[]>('/mon-hoc');
      return data;
    },
    staleTime: 300_000,
  });

  const selectedMH = (monHocQuery.data ?? []).find((m) => m.MaMH === maMH);

  const mutation = useMutation({
    mutationFn: () => openCourse(maHK, maMH, siSo ? Number(siSo) : undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mon-hoc-mo'] });
      toast.success('Đã thêm lớp học phần');
      onOpenChange(false);
      setMaHK(''); setMaMH(''); setSiSo('');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Có lỗi xảy ra'),
  });

  const hkDisplay = (hk: HocKyOption) => `${hk.TenHK} ${hk.NamHoc}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Thêm lớp học phần</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Học kỳ <span className="text-red-500">*</span></Label>
            <Select value={maHK} onValueChange={setMaHK}>
              <SelectTrigger>
                <SelectValue placeholder="— Chọn học kỳ —" />
              </SelectTrigger>
              <SelectContent>
                {(hocKyQuery.data ?? []).map((hk) => (
                  <SelectItem key={hk.MaHK} value={hk.MaHK}>
                    {hkDisplay(hk)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Môn học <span className="text-red-500">*</span></Label>
            <Select value={maMH} onValueChange={setMaMH}>
              <SelectTrigger>
                <SelectValue placeholder="— Chọn môn học —" />
              </SelectTrigger>
              <SelectContent>
                {(monHocQuery.data ?? []).map((m) => (
                  <SelectItem key={m.MaMH} value={m.MaMH}>
                    {m.TenMH} <span className="text-slate-400">({m.MaMH})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Sĩ số tối đa
              {selectedMH && (
                <span className="ml-1 text-xs font-normal text-slate-400">
                  (mặc định: {selectedMH.SiSoToiDa})
                </span>
              )}
            </Label>
            <Input
              type="number"
              min={1}
              value={siSo}
              onChange={(e) => setSiSo(e.target.value)}
              placeholder={selectedMH ? String(selectedMH.SiSoToiDa) : '50'}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button
            disabled={!maHK || !maMH || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Đang thêm...' : 'Thêm lớp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Dialog: Sửa lớp học phần ── */
function EditDialog({ row, onClose }: { row: MonHocMoRow | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [siSo, setSiSo] = useState('');

  const mutation = useMutation({
    mutationFn: () => updateCourse(row!.MaHK, row!.MaMH, siSo ? Number(siSo) : null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mon-hoc-mo'] });
      toast.success('Đã cập nhật lớp học phần');
      onClose();
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Cập nhật thất bại'),
  });

  const handleOpen = (open: boolean) => {
    if (!open) { onClose(); return; }
    setSiSo(row ? String(row.SiSoToiDa) : '');
  };

  if (!row) return null;

  return (
    <Dialog open={!!row} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Sửa lớp học phần</DialogTitle>
          <p className="mt-1 text-sm text-slate-500">
            {row.TenMH} <span className="font-mono">({row.MaMH})</span> — {row.TenHK}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <div>
              <p className="text-xs text-slate-400">Học kỳ</p>
              <p className="font-medium">{row.TenHK}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Năm học</p>
              <p className="font-medium">{row.NamHoc}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Mã môn</p>
              <p className="font-mono font-semibold">{row.MaMH}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Tín chỉ</p>
              <p className="font-medium">{row.SoTinChi}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sĩ số tối đa</Label>
            <Input
              type="number"
              min={row.SiSoHienTai || 1}
              value={siSo}
              onChange={(e) => setSiSo(e.target.value)}
              autoFocus
            />
            {row.SiSoHienTai > 0 && (
              <p className="text-xs text-slate-400">
                Đã có {row.SiSoHienTai} sinh viên đăng ký — không thể đặt thấp hơn.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button
            disabled={!siSo || Number(siSo) < (row.SiSoHienTai || 1) || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Dialog: Danh sách sinh viên đăng ký ── */
function StudentListDialog({ course, onClose }: { course: MonHocMoRow | null; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const query = useQuery({
    queryKey: ['sinh-vien-lop', course?.MaHK, course?.MaMH],
    queryFn: () => fetchSinhVienLop(course!.MaHK, course!.MaMH),
    enabled: !!course,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (query.data ?? []).filter(
      (r) =>
        !q ||
        r.MaSV.toLowerCase().includes(q) ||
        r.TenSV.toLowerCase().includes(q) ||
        (r.TenLop?.toLowerCase().includes(q) ?? false),
    );
  }, [query.data, search]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page],
  );

  const handleExport = () => {
    exportToExcel(
      filtered,
      [
        { header: 'Mã SV', key: 'MaSV' },
        { header: 'Họ tên', key: 'TenSV' },
        { header: 'Lớp', key: 'TenLop' },
        { header: 'Giới tính', key: 'GioiTinh' },
        { header: 'Ngày sinh', key: 'NgaySinh' },
        { header: 'Email', key: 'Email' },
        { header: 'Ngày đăng ký', key: 'NgayDangKy' },
      ],
      `ds-sv-${course?.MaMH ?? ''}-${course?.MaHK ?? ''}`,
    );
  };

  if (!course) return null;

  return (
    <Dialog open={!!course} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[85vh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5 text-teal-600" />
            Danh sách sinh viên đăng ký
          </DialogTitle>
          <p className="mt-0.5 text-sm text-slate-500">
            {course.TenMH} <span className="font-mono">({course.MaMH})</span> — {course.TenHK}
            <span className="ml-2 font-medium text-teal-700">· {query.data?.length ?? 0} sinh viên</span>
          </p>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3 border-b px-6 py-3">
          <Input
            placeholder="Tìm mã SV, họ tên, lớp..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
            <IconFileSpreadsheet className="h-4 w-4" />
            Xuất Excel
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {query.isLoading && <div className="m-6 h-40 animate-pulse rounded-lg bg-slate-100" />}
          {!query.isLoading && filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              {search ? 'Không tìm thấy sinh viên phù hợp' : 'Chưa có sinh viên đăng ký môn này'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center">#</TableHead>
                  <TableHead>Mã SV</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((sv, idx) => (
                  <TableRow key={sv.MaSV}>
                    <TableCell className="text-center text-slate-400">
                      {(page - 1) * pageSize + idx + 1}
                    </TableCell>
                    <TableCell className="font-mono font-semibold">{sv.MaSV}</TableCell>
                    <TableCell className="font-medium">{sv.TenSV}</TableCell>
                    <TableCell className="text-slate-500">{sv.TenLop ?? '—'}</TableCell>
                    <TableCell className="text-slate-500">{sv.GioiTinh ?? '—'}</TableCell>
                    <TableCell className="text-slate-400">
                      {new Date(sv.NgayDangKy).toLocaleDateString('vi-VN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {filtered.length > pageSize && (
          <div className="border-t px-4">
            <Pagination
              total={filtered.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={() => {}}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ── Main page ── */
export function MonHocMoPage() {
  const qc = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);
  const canManage = role === 'admin' || role === 'phong-dao-tao';

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<MonHocMoRow | null>(null);
  const [toClose, setToClose] = useState<MonHocMoRow | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<MonHocMoRow | null>(null);
  const [assignRow, setAssignRow] = useState<MonHocMoRow | null>(null);
  const [search, setSearch] = useState('');
  const [filterNamHoc, setFilterNamHoc] = useState('');
  const [filterHocKy, setFilterHocKy] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({ queryKey: ['mon-hoc-mo'], queryFn: () => fetchMonHocMo() });

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
        (!q || r.MaMH.toLowerCase().includes(q) || r.TenMH.toLowerCase().includes(q)),
    );
  }, [query.data, search, filterNamHoc, filterHocKy]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const unassignedCount = canManage
    ? (query.data ?? []).filter((r) => !r.GiangVien).length
    : 0;

  const closeMutation = useMutation({
    mutationFn: (row: MonHocMoRow) => closeCourse(row.MaHK, row.MaMH),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mon-hoc-mo'] });
      toast.success('Đã xoá lớp học phần');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Không thể xoá lớp học phần'),
  });

  return (
    <>
      <PageHeader
        title="Lớp học phần"
        icon={<IconCalendarEvent className="h-4 w-4" />}
        iconTone="info"
        actions={
          canManage ? (
            <Button onClick={() => setAddOpen(true)}>
              <IconPlus className="h-4 w-4" />
              Thêm lớp học phần
            </Button>
          ) : undefined
        }
      />

      {unassignedCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <IconUserX className="h-4 w-4 shrink-0" />
          Có <strong className="mx-1">{unassignedCount}</strong> lớp học phần chưa được phân công giảng viên.
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b p-4">
            <Input
              placeholder="Tìm mã môn, tên môn..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-56"
            />
            <Select
              value={filterNamHoc || 'all'}
              onValueChange={(v) => {
                setFilterNamHoc(v === 'all' ? '' : v);
                setFilterHocKy('');
                setPage(1);
              }}
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
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Học kỳ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả học kỳ</SelectItem>
                {hocKyList.map((hk) => (
                  <SelectItem key={hk} value={hk}>{hk}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(filterNamHoc || filterHocKy || search) && (
              <button
                type="button"
                onClick={() => { setFilterNamHoc(''); setFilterHocKy(''); setSearch(''); setPage(1); }}
                className="text-sm text-slate-500 underline hover:text-slate-800"
              >
                Xoá bộ lọc
              </button>
            )}
          </div>

          {query.isLoading && <div className="m-4 h-[200px] animate-pulse rounded-lg bg-slate-100" />}

          {!query.isLoading && filtered.length === 0 ? (
            <EmptyState message="Chưa có lớp học phần nào" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Học kỳ</TableHead>
                    <TableHead>Mã môn</TableHead>
                    <TableHead>Tên môn học</TableHead>
                    <TableHead className="text-center">TC</TableHead>
                    <TableHead className="text-center">Sĩ số</TableHead>
                    <TableHead>Giảng viên phụ trách</TableHead>
                    <TableHead className="text-center">DS Sinh viên</TableHead>
                    {canManage && <TableHead className="text-center">Thao tác</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((r) => (
                    <TableRow key={`${r.MaHK}-${r.MaMH}`}>
                      <TableCell className="text-slate-500">{r.TenHK}</TableCell>
                      <TableCell className="font-mono font-semibold">{r.MaMH}</TableCell>
                      <TableCell>{r.TenMH}</TableCell>
                      <TableCell className="text-center">{r.SoTinChi}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={r.SiSoHienTai >= r.SiSoToiDa ? 'danger' : 'info'}
                          className="font-mono"
                        >
                          {r.SiSoHienTai}/{r.SiSoToiDa}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {r.GiangVien ? (
                          <div>
                            <p className="font-medium text-slate-800">{r.GiangVien.HoTen}</p>
                            {r.GiangVien.Email && (
                              <p className="text-xs text-slate-400">{r.GiangVien.Email}</p>
                            )}
                          </div>
                        ) : canManage ? (
                          <button
                            type="button"
                            onClick={() => setAssignRow(r)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                          >
                            <IconUserCheck className="h-3.5 w-3.5" />
                            Phân công
                          </button>
                        ) : (
                          <Badge variant="warning">Chưa phân công</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCourse(r)}
                        >
                          <IconUsers className="h-4 w-4" />
                          Xem DS ({r.SiSoHienTai})
                        </Button>
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAssignRow(r)}
                            >
                              <IconUserCheck className="h-4 w-4" />
                              {r.GiangVien ? 'Đổi GV' : 'Phân công'}
                            </Button>
                            <ActionButton
                              tone="edit"
                              icon={<IconPencil className="h-3.5 w-3.5" />}
                              label="Sửa"
                              onClick={() => setEditRow(r)}
                            />
                            <ActionButton
                              tone="delete"
                              icon={<IconTrash className="h-3.5 w-3.5" />}
                              label="Xoá"
                              onClick={() => setToClose(r)}
                            />
                          </div>
                        </TableCell>
                      )}
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

      <AddDialog open={addOpen} onOpenChange={setAddOpen} />
      <EditDialog row={editRow} onClose={() => setEditRow(null)} />
      <StudentListDialog course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      <AssignDialog row={assignRow} onClose={() => setAssignRow(null)} />

      <ConfirmDialog
        open={!!toClose}
        onOpenChange={(o) => !o && setToClose(null)}
        title="Xoá lớp học phần"
        description={`Xoá lớp "${toClose?.TenMH}" (${toClose?.MaMH}) trong ${toClose?.TenHK}? Chỉ được phép nếu chưa có sinh viên đăng ký.`}
        confirmText="Xoá lớp"
        onConfirm={() => { if (toClose) closeMutation.mutate(toClose); }}
      />
    </>
  );
}
