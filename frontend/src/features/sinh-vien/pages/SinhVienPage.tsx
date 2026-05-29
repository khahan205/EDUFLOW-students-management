import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconUsers,
  IconPlus,
  IconFileSpreadsheet,
  IconTrash,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import { exportToExcel } from '@/lib/export-excel';
import { fetchSinhVienList, deleteSinhVien } from '../api/sinh-vien-api';
import { SinhVienTable } from '../components/SinhVienTable';
import { SinhVienFormDialog } from '../components/SinhVienFormDialog';
import {
  fetchCurrentHocKy,
  fetchMonMoChoSV,
  registerMon,
  unregisterMon,
} from '@/features/dang-ky/api/dang-ky-api';
import { useAuthStore } from '@/stores/auth-store';
import type { SinhVien } from '@/types';

function SinhVienDetailSheet({
  sv,
  onClose,
}: {
  sv: SinhVien | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canEdit = user?.role === 'admin' || user?.role === 'phong-dao-tao';

  const hkQuery = useQuery({
    queryKey: ['current-hk'],
    queryFn: fetchCurrentHocKy,
    enabled: !!sv,
    staleTime: 5 * 60 * 1000,
  });

  const monQuery = useQuery({
    queryKey: ['mon-mo-cho-sv', sv?.MaSV, hkQuery.data?.MaHK],
    queryFn: () => fetchMonMoChoSV(sv!.MaSV, hkQuery.data!.MaHK),
    enabled: !!sv && !!hkQuery.data,
  });

  const registerMutation = useMutation({
    mutationFn: (maMH: string) =>
      registerMon({ maSV: sv!.MaSV, maHK: hkQuery.data!.MaHK, maMH }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mon-mo-cho-sv', sv?.MaSV] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Đã đăng ký môn học');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Đăng ký thất bại'),
  });

  const unregisterMutation = useMutation({
    mutationFn: (maMH: string) =>
      unregisterMon({ maSV: sv!.MaSV, maHK: hkQuery.data!.MaHK, maMH }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mon-mo-cho-sv', sv?.MaSV] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Đã huỷ đăng ký môn học');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Huỷ đăng ký thất bại'),
  });

  const registered = useMemo(
    () => (monQuery.data ?? []).filter((m) => m.daDangKy),
    [monQuery.data],
  );
  const available = useMemo(
    () => (monQuery.data ?? []).filter((m) => !m.daDangKy),
    [monQuery.data],
  );

  const [showAddPanel, setShowAddPanel] = useState(false);

  const isBusy = registerMutation.isPending || unregisterMutation.isPending;
  const initial = sv ? sv.TenSV.trim().split(' ').at(-1)?.charAt(0).toUpperCase() ?? 'S' : 'S';

  return (
    <Dialog open={!!sv} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0">
        {sv && (
          <>
            {/* ── Profile card ── */}
            <div className="border-b px-6 py-5">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-teal-600 text-xl font-bold text-white">
                  {initial}
                </span>
                <div>
                  <DialogTitle className="text-xl font-semibold text-slate-800">
                    {sv.TenSV}
                  </DialogTitle>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {sv.MaSV} · {sv.TenLop ?? 'Chưa có lớp'}
                  </p>
                </div>
              </div>

              {/* Info grid */}
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl bg-slate-50 px-5 py-4 text-sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Email</p>
                  <p className="mt-0.5 text-slate-700">{sv.Email ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Ngày sinh</p>
                  <p className="mt-0.5 text-slate-700">
                    {sv.NgaySinh ? new Date(sv.NgaySinh).toLocaleDateString('vi-VN') : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Giới tính</p>
                  <p className="mt-0.5 text-slate-700">{sv.GioiTinh ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Trạng thái</p>
                  <div className="mt-1">
                    <StatusBadge status={sv.TrangThai ?? 'Đang học'} />
                  </div>
                </div>
                {hkQuery.data && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Học kỳ hiện tại</p>
                    <p className="mt-0.5 font-medium text-teal-700">{hkQuery.data.TenHK}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Scrollable course list ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {(monQuery.isLoading || hkQuery.isLoading) && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                  ))}
                </div>
              )}

              {monQuery.data && (
                <section>
                  {/* Section header */}
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-700">
                      Môn học đã đăng ký
                      <span className="ml-2 rounded-full bg-teal-100 px-2 py-0.5 text-sm font-medium text-teal-700">
                        {registered.length}
                      </span>
                      {hkQuery.data && (
                        <span className="ml-1.5 text-sm font-normal text-slate-400">
                          ({hkQuery.data.TenHK})
                        </span>
                      )}
                    </h3>
                    {canEdit && available.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddPanel((v) => !v)}
                      >
                        <IconPlus className="h-4 w-4" />
                        Thêm môn học
                        {showAddPanel
                          ? <IconChevronUp className="h-3.5 w-3.5" />
                          : <IconChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                  </div>

                  {/* Registered courses */}
                  {registered.length === 0 ? (
                    <p className="mb-4 text-sm text-slate-400">Sinh viên chưa đăng ký môn học nào trong kỳ này.</p>
                  ) : (
                    <div className="mb-4 overflow-hidden rounded-lg border border-slate-200">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tên môn học</TableHead>
                            <TableHead>Mã môn</TableHead>
                            <TableHead className="text-center">TC</TableHead>
                            {canEdit && <TableHead className="text-right">Thao tác</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {registered.map((m) => (
                            <TableRow key={m.MaMH}>
                              <TableCell className="font-medium">{m.TenMH}</TableCell>
                              <TableCell className="font-mono text-slate-500">{m.MaMH}</TableCell>
                              <TableCell className="text-center">{m.SoTinChi}</TableCell>
                              {canEdit && (
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isBusy}
                                    onClick={() => unregisterMutation.mutate(m.MaMH)}
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                  >
                                    <IconTrash className="h-4 w-4" />
                                    Huỷ đăng ký
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Add course panel — admin only, collapsed by default */}
                  {canEdit && showAddPanel && available.length > 0 && (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                      <p className="mb-2 text-xs font-medium text-slate-500">
                        Chọn môn học để thêm vào danh sách đăng ký của sinh viên:
                      </p>
                      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tên môn học</TableHead>
                              <TableHead>Mã môn</TableHead>
                              <TableHead className="text-center">TC</TableHead>
                              <TableHead className="text-center">Sĩ số</TableHead>
                              <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {available.map((m) => {
                              const isFull =
                                m.SiSoHienTai !== undefined &&
                                m.SiSoToiDa !== undefined &&
                                m.SiSoHienTai >= m.SiSoToiDa;
                              return (
                                <TableRow key={m.MaMH}>
                                  <TableCell className="font-medium">{m.TenMH}</TableCell>
                                  <TableCell className="font-mono text-slate-500">{m.MaMH}</TableCell>
                                  <TableCell className="text-center">{m.SoTinChi}</TableCell>
                                  <TableCell className="text-center">
                                    {m.SiSoHienTai !== undefined && m.SiSoToiDa !== undefined ? (
                                      <span className={isFull ? 'font-semibold text-red-600' : 'text-slate-600'}>
                                        {m.SiSoHienTai}/{m.SiSoToiDa}
                                      </span>
                                    ) : '—'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      size="sm"
                                      disabled={isBusy || isFull}
                                      onClick={() => {
                                        registerMutation.mutate(m.MaMH);
                                        setShowAddPanel(false);
                                      }}
                                    >
                                      <IconPlus className="h-4 w-4" />
                                      Thêm
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function SinhVienPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SinhVien | null>(null);
  const [toDelete, setToDelete] = useState<SinhVien | null>(null);
  const [selectedSV, setSelectedSV] = useState<SinhVien | null>(null);
  const [search, setSearch] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('');

  const listQuery = useQuery({
    queryKey: ['sinh-vien'],
    queryFn: fetchSinhVienList,
  });

  const filtered = useMemo(() => {
    if (!listQuery.data) return [];
    const q = search.toLowerCase();
    return listQuery.data.filter(
      (sv) =>
        (!q ||
          sv.MaSV.toLowerCase().includes(q) ||
          sv.TenSV.toLowerCase().includes(q) ||
          (sv.Email?.toLowerCase().includes(q) ?? false)) &&
        (!filterTrangThai || sv.TrangThai === filterTrangThai),
    );
  }, [listQuery.data, search, filterTrangThai]);

  const deleteMutation = useMutation({
    mutationFn: (maSV: string) => deleteSinhVien(maSV),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sinh-vien'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Đã xoá sinh viên');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Xoá thất bại'),
  });

  const handleEdit = (sv: SinhVien) => { setEditing(sv); setFormOpen(true); };
  const handleAdd = () => { setEditing(null); setFormOpen(true); };

  const handleExport = () => {
    exportToExcel(
      filtered,
      [
        { header: 'Mã SV', key: 'MaSV' },
        { header: 'Họ tên', key: 'TenSV' },
        { header: 'Lớp', key: 'TenLop' },
        { header: 'Email', key: 'Email' },
        { header: 'Trạng thái', key: 'TrangThai' },
      ],
      'danh-sach-sinh-vien',
    );
  };

  return (
    <>
      <PageHeader
        title="Quản lý Sinh viên"
        icon={<IconUsers className="h-4 w-4" />}
        iconTone="info"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
              <IconFileSpreadsheet className="h-4 w-4" />
              Xuất Excel
            </Button>
            <Button onClick={handleAdd}>
              <IconPlus className="h-4 w-4" />
              Thêm sinh viên
            </Button>
          </div>
        }
      />

      {listQuery.isLoading && (
        <div className="h-[300px] animate-pulse rounded-xl bg-slate-100" />
      )}

      {listQuery.data && (
        <SinhVienTable
          rows={filtered}
          onEdit={handleEdit}
          onDelete={(sv) => setToDelete(sv)}
          onRowClick={(sv) => setSelectedSV(sv)}
          search={search}
          onSearchChange={(v) => setSearch(v)}
          filterTrangThai={filterTrangThai}
          onFilterTrangThaiChange={(v) => setFilterTrangThai(v)}
        />
      )}

      <SinhVienFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Xoá sinh viên"
        description={`Bạn có chắc muốn xoá sinh viên "${toDelete?.TenSV}" (${toDelete?.MaSV})? Hành động này không thể hoàn tác.`}
        confirmText="Xoá"
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.MaSV); }}
      />

      <SinhVienDetailSheet sv={selectedSV} onClose={() => setSelectedSV(null)} />
    </>
  );
}
