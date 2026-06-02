import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconCalendarEvent, IconPlus, IconPencil, IconTrash, IconCheck } from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ActionButton } from '@/components/common/ActionButton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { apiClient } from '@/services/api-client';

interface HocKyRow {
  MaHK: string; TenHK: string; NamHoc: string; LaHienTai: boolean;
  NgayBatDau: string | null; NgayKetThuc: string | null; HanDongHP: string | null;
}

const HK_OPTIONS = ['HK1', 'HK2', 'HK3 (Hè)'];

const EMPTY = { MaHK: '', TenHK: 'HK1', NamHoc: '', NgayBatDau: '', NgayKetThuc: '', HanDongHP: '' };

function HocKyDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: HocKyRow | null }) {
  const qc = useQueryClient();
  const isEdit = !!editing;
  const [form, setForm] = useState({ ...EMPTY });

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          MaHK: editing.MaHK, TenHK: editing.TenHK, NamHoc: editing.NamHoc,
          NgayBatDau: editing.NgayBatDau?.slice(0, 10) ?? '',
          NgayKetThuc: editing.NgayKetThuc?.slice(0, 10) ?? '',
          HanDongHP: editing.HanDongHP?.slice(0, 10) ?? '',
        });
      } else {
        const now = new Date();
        const nam = `${now.getFullYear()}-${now.getFullYear() + 1}`;
        setForm({ ...EMPTY, NamHoc: nam });
      }
    }
  }, [open, editing]);

  // Auto-generate MaHK from TenHK + NamHoc
  useEffect(() => {
    if (!isEdit && form.TenHK && form.NamHoc) {
      const slug = form.TenHK.replace('HK', 'HK').replace(' (Hè)', '_HE').replace(/\s/g, '_');
      const year = form.NamHoc.replace('-', '_');
      setForm(f => ({ ...f, MaHK: `${slug}_${year}` }));
    }
  }, [form.TenHK, form.NamHoc, isEdit]);

  const mutation = useMutation({
    mutationFn: () => isEdit
      ? apiClient.put(`/master-data/hoc-ky/${editing!.MaHK}`, { TenHK: form.TenHK, NamHoc: form.NamHoc, NgayBatDau: form.NgayBatDau || null, NgayKetThuc: form.NgayKetThuc || null, HanDongHP: form.HanDongHP || null })
      : apiClient.post('/master-data/hoc-ky', { MaHK: form.MaHK, TenHK: form.TenHK, NamHoc: form.NamHoc, NgayBatDau: form.NgayBatDau || null, NgayKetThuc: form.NgayKetThuc || null, HanDongHP: form.HanDongHP || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hoc-ky-all'] });
      qc.invalidateQueries({ queryKey: ['hoc-ky-list'] });
      toast.success(isEdit ? 'Đã cập nhật học kỳ' : 'Đã thêm học kỳ mới');
      onOpenChange(false);
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Có lỗi xảy ra'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? 'Sửa học kỳ' : 'Thêm học kỳ mới'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Học kỳ <span className="text-red-500">*</span></Label>
              <Select value={form.TenHK} onValueChange={(v) => setForm(f => ({ ...f, TenHK: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HK_OPTIONS.map(hk => <SelectItem key={hk} value={hk}>{hk}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Năm học <span className="text-red-500">*</span></Label>
              <Input placeholder="VD: 2025-2026" value={form.NamHoc} onChange={e => setForm(f => ({ ...f, NamHoc: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Mã học kỳ (tự động)</Label>
            <Input value={form.MaHK} onChange={e => setForm(f => ({ ...f, MaHK: e.target.value }))} disabled={isEdit} className="font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Ngày bắt đầu</Label>
              <Input type="date" value={form.NgayBatDau} onChange={e => setForm(f => ({ ...f, NgayBatDau: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Ngày kết thúc</Label>
              <Input type="date" value={form.NgayKetThuc} onChange={e => setForm(f => ({ ...f, NgayKetThuc: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              Hạn đóng học phí
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">QĐ6</span>
            </Label>
            <Input type="date" value={form.HanDongHP} onChange={e => setForm(f => ({ ...f, HanDongHP: e.target.value }))} />
            <p className="text-xs text-slate-400">Sinh viên đóng sau ngày này → hệ thống ghi "Trễ hạn". Để trống nếu dùng Ngày kết thúc làm mốc.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button disabled={!form.MaHK || !form.TenHK || !form.NamHoc || mutation.isPending} onClick={() => mutation.mutate()}>
            {isEdit ? 'Cập nhật' : 'Thêm học kỳ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function HocKyPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HocKyRow | null>(null);
  const [toDelete, setToDelete] = useState<HocKyRow | null>(null);

  const query = useQuery({
    queryKey: ['hoc-ky-all'],
    queryFn: async () => {
      const { data } = await apiClient.get<HocKyRow[]>('/master-data/hoc-ky');
      return data;
    },
  });

  const setCurrentMutation = useMutation({
    mutationFn: (maHK: string) => apiClient.put(`/master-data/hoc-ky/${maHK}/set-current`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hoc-ky-all'] });
      qc.invalidateQueries({ queryKey: ['hoc-ky-list'] });
      toast.success('Đã đặt làm học kỳ hiện tại');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Lỗi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (maHK: string) => apiClient.delete(`/master-data/hoc-ky/${maHK}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hoc-ky-all'] });
      toast.success('Đã xóa học kỳ');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Không thể xóa'),
  });

  // Group by NamHoc
  const grouped = (query.data ?? []).reduce<Record<string, HocKyRow[]>>((acc, hk) => {
    acc[hk.NamHoc] = [...(acc[hk.NamHoc] ?? []), hk];
    return acc;
  }, {});
  const sortedYears = Object.keys(grouped).sort().reverse();

  return (
    <>
      <PageHeader
        title="Quản lý Học kỳ"
        icon={<IconCalendarEvent className="h-4 w-4" />}
        iconTone="teal"
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <IconPlus className="h-4 w-4" />
            Thêm học kỳ
          </Button>
        }
      />

      <div className="space-y-5">
        {query.isLoading && <div className="h-40 animate-pulse rounded-xl bg-slate-100" />}
        {!query.isLoading && sortedYears.length === 0 && <EmptyState message="Chưa có học kỳ nào" />}

        {sortedYears.map(year => (
          <Card key={year}>
            <CardContent className="p-0">
              <div className="border-b px-5 py-3 bg-slate-50">
                <p className="font-semibold text-slate-700">Năm học {year}</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã học kỳ</TableHead>
                    <TableHead>Học kỳ</TableHead>
                    <TableHead>Ngày bắt đầu</TableHead>
                    <TableHead>Ngày kết thúc</TableHead>
                    <TableHead className="text-amber-700">Hạn đóng HP</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grouped[year].map(hk => (
                    <TableRow key={hk.MaHK}>
                      <TableCell className="font-mono text-sm text-slate-500">{hk.MaHK}</TableCell>
                      <TableCell className="font-semibold">{hk.TenHK}</TableCell>
                      <TableCell className="text-slate-500">
                        {hk.NgayBatDau ? new Date(hk.NgayBatDau).toLocaleDateString('vi-VN') : '—'}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {hk.NgayKetThuc ? new Date(hk.NgayKetThuc).toLocaleDateString('vi-VN') : '—'}
                      </TableCell>
                      <TableCell className={hk.HanDongHP ? 'font-semibold text-amber-700' : 'text-slate-400'}>
                        {hk.HanDongHP ? new Date(hk.HanDongHP).toLocaleDateString('vi-VN') : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        {hk.LaHienTai ? (
                          <Badge variant="success" className="gap-1"><IconCheck className="h-3 w-3" />Hiện tại</Badge>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 text-xs" disabled={setCurrentMutation.isPending}
                            onClick={() => setCurrentMutation.mutate(hk.MaHK)}>
                            Đặt làm hiện tại
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <ActionButton tone="edit" icon={<IconPencil className="h-3.5 w-3.5" />} label="Sửa"
                          onClick={() => { setEditing(hk); setFormOpen(true); }} />
                        <ActionButton tone="delete" icon={<IconTrash className="h-3.5 w-3.5" />} label="Xóa"
                          onClick={() => setToDelete(hk)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      <HocKyDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
      <ConfirmDialog
        open={!!toDelete} onOpenChange={o => !o && setToDelete(null)}
        title="Xóa học kỳ"
        description={`Xóa học kỳ "${toDelete?.TenHK} ${toDelete?.NamHoc}"? Chỉ được phép nếu chưa có phiếu đăng ký nào trong học kỳ này.`}
        confirmText="Xóa"
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.MaHK); }}
      />
    </>
  );
}
