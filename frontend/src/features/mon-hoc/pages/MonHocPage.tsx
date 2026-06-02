import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconBook2, IconPlus, IconSettings, IconFileSpreadsheet, IconLock, IconLockOpen, IconBooks, IconTrash } from '@tabler/icons-react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/services/api-client';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { exportToExcel } from '@/lib/export-excel';
import { fetchMonHocList, deleteMonHoc } from '../api/mon-hoc-api';
import { MonHocTable } from '../components/MonHocTable';
import { MonHocFormDialog } from '../components/MonHocFormDialog';
import { PricingConfigDialog } from '../components/PricingConfigDialog';
import type { MonHoc } from '@/types';

interface YeuCauRow { MaMH: string; MaMHYeuCau: string; TenMHYeuCau: string; MaLoaiMon: string; SoTinChi: number; }

function TienQuyetDialog({ monHoc, onClose, allMonHoc }: { monHoc: MonHoc | null; onClose: () => void; allMonHoc: MonHoc[]; }) {
  const qc = useQueryClient();
  const [selectedMH, setSelectedMH] = useState('');

  const yeuCauQuery = useQuery({
    queryKey: ['tien-quyet', monHoc?.MaMH],
    queryFn: async () => {
      const { data } = await apiClient.get<YeuCauRow[]>(`/mon-hoc/${monHoc!.MaMH}/tien-quyet`);
      return data;
    },
    enabled: !!monHoc,
  });

  const addMutation = useMutation({
    mutationFn: (maMHYeuCau: string) => apiClient.post(`/mon-hoc/${monHoc!.MaMH}/tien-quyet`, { maMHYeuCau }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tien-quyet', monHoc?.MaMH] }); setSelectedMH(''); toast.success('Đã thêm môn tiên quyết'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Thêm thất bại'),
  });

  const removeMutation = useMutation({
    mutationFn: (maMHYC: string) => apiClient.delete(`/mon-hoc/${monHoc!.MaMH}/tien-quyet/${maMHYC}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tien-quyet', monHoc?.MaMH] }); toast.success('Đã xoá'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Xoá thất bại'),
  });

  if (!monHoc) return null;

  const existingSet = new Set((yeuCauQuery.data ?? []).map(r => r.MaMHYeuCau));
  const availableMH = allMonHoc.filter(m => m.MaMH !== monHoc.MaMH && !existingSet.has(m.MaMH));

  return (
    <Dialog open={!!monHoc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Môn tiên quyết — {monHoc.TenMH}</DialogTitle>
          <p className="text-sm text-slate-500 font-mono">{monHoc.MaMH}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Thêm môn tiên quyết</Label>
            <div className="flex gap-2">
              <Select value={selectedMH} onValueChange={setSelectedMH}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="— Chọn môn học —" />
                </SelectTrigger>
                <SelectContent>
                  {availableMH.map((m) => (
                    <SelectItem key={m.MaMH} value={m.MaMH}>
                      {m.TenMH} <span className="text-slate-400">({m.MaMH})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button disabled={!selectedMH || addMutation.isPending} onClick={() => addMutation.mutate(selectedMH)}>
                Thêm
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Danh sách môn tiên quyết hiện tại</Label>
            {yeuCauQuery.isLoading && <div className="h-12 animate-pulse rounded-lg bg-slate-100" />}
            {!yeuCauQuery.isLoading && (yeuCauQuery.data ?? []).length === 0 && (
              <p className="rounded-lg border border-dashed p-4 text-sm text-slate-400 text-center">
                Chưa có môn tiên quyết
              </p>
            )}
            <div className="space-y-2">
              {(yeuCauQuery.data ?? []).map((r) => (
                <div key={r.MaMHYeuCau} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{r.TenMHYeuCau}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-xs text-slate-400">{r.MaMHYeuCau}</span>
                      <Badge variant={r.MaLoaiMon === 'TH' ? 'info' : 'muted'} className="text-[10px]">{r.MaLoaiMon}</Badge>
                      <span className="text-xs text-slate-400">{r.SoTinChi} TC</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(r.MaMHYeuCau)}>
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MonHocPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [editing, setEditing] = useState<MonHoc | null>(null);
  const [toDelete, setToDelete] = useState<MonHoc | null>(null);
  const [prereqMH, setPrereqMH] = useState<MonHoc | null>(null);
  const [search, setSearch] = useState('');
  const [filterLoaiMon, setFilterLoaiMon] = useState('');

  const listQuery = useQuery({ queryKey: ['mon-hoc'], queryFn: fetchMonHocList });

  // Thống kê môn học mở/đóng dựa trên lớp học phần hiện tại
  const monHocMoQuery = useQuery({
    queryKey: ['mon-hoc-mo-all'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ MaMH: string }[]>('/mon-hoc-mo');
      return data;
    },
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    if (!listQuery.data) return [];
    const q = search.toLowerCase();
    return listQuery.data.filter(
      (mh) =>
        (!q || mh.MaMH.toLowerCase().includes(q) || mh.TenMH.toLowerCase().includes(q)) &&
        (!filterLoaiMon || mh.MaLoaiMon === filterLoaiMon),
    );
  }, [listQuery.data, search, filterLoaiMon]);

  const deleteMutation = useMutation({
    mutationFn: deleteMonHoc,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mon-hoc'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Đã xoá môn học');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Xoá thất bại'),
  });

  const handleExport = () => {
    exportToExcel(
      filtered,
      [
        { header: 'Mã môn', key: 'MaMH' },
        { header: 'Tên môn', key: 'TenMH' },
        { header: 'Tín chỉ', key: 'SoTinChi' },
        { header: 'Học kỳ', key: 'HocKy' },
        { header: 'Khoa', key: 'TenKhoa' },
        { header: 'Sĩ số hiện tại', key: 'SiSoHienTai' },
        { header: 'Sĩ số tối đa', key: 'SiSoToiDa' },
      ],
      'danh-sach-mon-hoc',
    );
  };

  return (
    <>
      <PageHeader
        title="Danh sách Môn học"
        icon={<IconBook2 className="h-4 w-4" />}
        iconTone="success"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
              <IconFileSpreadsheet className="h-4 w-4" />
              Xuất Excel
            </Button>
            <Button variant="secondary" onClick={() => setPricingOpen(true)}>
              <IconSettings className="h-4 w-4" />
              Cấu hình giá
            </Button>
            <Button variant="success" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <IconPlus className="h-4 w-4" />
              Thêm môn
            </Button>
          </div>
        }
      />

      {/* Thẻ thống kê */}
      {listQuery.data && (() => {
        const totalMon = listQuery.data.length;
        const openMaMHs = new Set((monHocMoQuery.data ?? []).map(m => m.MaMH));
        const soMoHienTai = listQuery.data.filter(m => openMaMHs.has(m.MaMH)).length;
        const soChua = totalMon - soMoHienTai;
        return (
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { icon: IconBooks,    label: 'Tổng số môn học', value: totalMon,     color: 'text-slate-700',   bg: 'bg-slate-50   border-slate-200' },
              { icon: IconLockOpen, label: 'Đang mở lớp học phần', value: soMoHienTai, color: 'text-teal-700', bg: 'bg-teal-50    border-teal-200' },
              { icon: IconLock,     label: 'Chưa mở lớp học phần', value: soChua,    color: 'text-amber-700',  bg: 'bg-amber-50   border-amber-200' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <Card key={label} className={`border ${bg}`}>
                <CardContent className="flex items-center gap-4 pt-4 pb-4">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
                    <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      })()}

      {listQuery.isLoading && <div className="h-[400px] animate-pulse rounded-xl bg-slate-100" />}
      {listQuery.data && (
        <MonHocTable
          rows={filtered}
          onEdit={(m) => { setEditing(m); setFormOpen(true); }}
          onDelete={(m) => setToDelete(m)}
          onManagePrereq={(m) => setPrereqMH(m)}
          search={search}
          onSearchChange={(v) => setSearch(v)}
          filterLoaiMon={filterLoaiMon}
          onFilterLoaiMonChange={(v) => setFilterLoaiMon(v)}
        />
      )}

      <MonHocFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
      <PricingConfigDialog open={pricingOpen} onOpenChange={setPricingOpen} />
      <TienQuyetDialog monHoc={prereqMH} onClose={() => setPrereqMH(null)} allMonHoc={listQuery.data ?? []} />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Xoá môn học"
        description={`Bạn có chắc muốn xoá môn "${toDelete?.TenMH}" (${toDelete?.MaMH})?`}
        confirmText="Xoá"
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.MaMH); }}
      />
    </>
  );
}
