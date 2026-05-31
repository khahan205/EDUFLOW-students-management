import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconMapPin, IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ActionButton } from '@/components/common/ActionButton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { apiClient } from '@/services/api-client';

export interface HuyenRow { MaHuyen: string; TenHuyen: string; LaVungSauVungXa: boolean; }
const EMPTY = { MaHuyen: '', TenHuyen: '', LaVungSauVungXa: false };

function HuyenDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: HuyenRow | null }) {
  const qc = useQueryClient();
  const isEdit = !!editing;
  const [form, setForm] = useState({ ...EMPTY });

  useEffect(() => { if (open) setForm(editing ?? EMPTY); }, [open, editing]);

  const mutation = useMutation({
    mutationFn: () => isEdit
      ? apiClient.put(`/huyen/${editing!.MaHuyen}`, { TenHuyen: form.TenHuyen, LaVungSauVungXa: form.LaVungSauVungXa })
      : apiClient.post('/huyen', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['huyen'] }); toast.success(isEdit ? 'Đã cập nhật' : 'Đã thêm huyện'); onOpenChange(false); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Có lỗi xảy ra'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>{isEdit ? 'Sửa huyện/quận' : 'Thêm huyện/quận mới'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Mã huyện <span className="text-red-500">*</span></Label>
            <Input placeholder="VD: HCM_Q1" value={form.MaHuyen} onChange={(e) => setForm(f => ({ ...f, MaHuyen: e.target.value }))} disabled={isEdit} autoFocus={!isEdit} />
          </div>
          <div className="space-y-1.5">
            <Label>Tên huyện/quận <span className="text-red-500">*</span></Label>
            <Input placeholder="VD: Quận 1" value={form.TenHuyen} onChange={(e) => setForm(f => ({ ...f, TenHuyen: e.target.value }))} autoFocus={isEdit} />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.LaVungSauVungXa} onChange={(e) => setForm(f => ({ ...f, LaVungSauVungXa: e.target.checked }))} className="h-4 w-4 rounded" />
            <span className="text-sm font-medium">Thuộc vùng sâu vùng xa</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button disabled={!form.MaHuyen || !form.TenHuyen || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function HuyenPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HuyenRow | null>(null);
  const [toDelete, setToDelete] = useState<HuyenRow | null>(null);
  const query = useQuery({ queryKey: ['huyen'], queryFn: async () => { const { data } = await apiClient.get<HuyenRow[]>('/huyen'); return data; } });
  const deleteMutation = useMutation({
    mutationFn: (ma: string) => apiClient.delete(`/huyen/${ma}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['huyen'] }); toast.success('Đã xóa'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Không thể xóa'),
  });

  return (
    <>
      <PageHeader title="Quản lý Huyện / Quận" icon={<IconMapPin className="h-4 w-4" />} iconTone="teal"
        actions={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><IconPlus className="h-4 w-4" />Thêm huyện</Button>} />
      <Card><CardContent className="p-0">
        {query.isLoading && <div className="m-4 h-32 animate-pulse rounded-lg bg-slate-100" />}
        {!query.isLoading && (query.data ?? []).length === 0 ? <EmptyState message="Chưa có huyện nào" /> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Mã huyện</TableHead><TableHead>Tên huyện/quận</TableHead>
              <TableHead className="text-center">Vùng sâu vùng xa</TableHead><TableHead className="text-center">Thao tác</TableHead>
            </TableRow></TableHeader>
            <TableBody>{(query.data ?? []).map(row => (
              <TableRow key={row.MaHuyen}>
                <TableCell className="font-mono font-semibold">{row.MaHuyen}</TableCell>
                <TableCell className="font-medium">{row.TenHuyen}</TableCell>
                <TableCell className="text-center">{row.LaVungSauVungXa ? <Badge variant="warning">Có</Badge> : <span className="text-slate-400">—</span>}</TableCell>
                <TableCell className="text-center">
                  <ActionButton tone="edit" icon={<IconPencil className="h-3.5 w-3.5" />} label="Sửa" onClick={() => { setEditing(row); setFormOpen(true); }} />
                  <ActionButton tone="delete" icon={<IconTrash className="h-3.5 w-3.5" />} label="Xóa" onClick={() => setToDelete(row)} />
                </TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </CardContent></Card>
      <HuyenDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title="Xóa huyện"
        description={`Xóa huyện "${toDelete?.TenHuyen}"? Chỉ được phép nếu chưa có quê quán nào thuộc huyện này.`}
        confirmText="Xóa" onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.MaHuyen); }} />
    </>
  );
}
