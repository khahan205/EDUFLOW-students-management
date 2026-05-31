import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconMap, IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActionButton } from '@/components/common/ActionButton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { apiClient } from '@/services/api-client';
import type { HuyenRow } from './HuyenPage';

interface QueQuanRow { MaQueQuan: string; TenTinh: string; MaHuyen: string; huyen?: HuyenRow; }
const EMPTY = { MaQueQuan: '', TenTinh: '', MaHuyen: '' };

function QueQuanDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: QueQuanRow | null }) {
  const qc = useQueryClient();
  const isEdit = !!editing;
  const [form, setForm] = useState({ ...EMPTY });

  const huyenQuery = useQuery({ queryKey: ['huyen'], staleTime: 300_000, queryFn: async () => { const { data } = await apiClient.get<HuyenRow[]>('/huyen'); return data; } });
  useEffect(() => { if (open) setForm(editing ? { MaQueQuan: editing.MaQueQuan, TenTinh: editing.TenTinh, MaHuyen: editing.MaHuyen } : EMPTY); }, [open, editing]);

  const mutation = useMutation({
    mutationFn: () => isEdit
      ? apiClient.put(`/que-quan/${editing!.MaQueQuan}`, { TenTinh: form.TenTinh, MaHuyen: form.MaHuyen })
      : apiClient.post('/que-quan', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['que-quan'] }); toast.success(isEdit ? 'Đã cập nhật' : 'Đã thêm quê quán'); onOpenChange(false); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Có lỗi xảy ra'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>{isEdit ? 'Sửa quê quán' : 'Thêm quê quán mới'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Mã quê quán <span className="text-red-500">*</span></Label>
            <Input placeholder="VD: QQ_HCM" value={form.MaQueQuan} onChange={(e) => setForm(f => ({ ...f, MaQueQuan: e.target.value }))} disabled={isEdit} autoFocus={!isEdit} />
          </div>
          <div className="space-y-1.5">
            <Label>Tỉnh/Thành phố <span className="text-red-500">*</span></Label>
            <Input placeholder="VD: TP. Hồ Chí Minh" value={form.TenTinh} onChange={(e) => setForm(f => ({ ...f, TenTinh: e.target.value }))} autoFocus={isEdit} />
          </div>
          <div className="space-y-1.5">
            <Label>Huyện/Quận <span className="text-red-500">*</span></Label>
            <Select value={form.MaHuyen} onValueChange={(v) => setForm(f => ({ ...f, MaHuyen: v }))}>
              <SelectTrigger><SelectValue placeholder="— Chọn huyện —" /></SelectTrigger>
              <SelectContent>{(huyenQuery.data ?? []).map(h => <SelectItem key={h.MaHuyen} value={h.MaHuyen}>{h.TenHuyen}{h.LaVungSauVungXa ? ' (vùng sâu)' : ''}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button disabled={!form.MaQueQuan || !form.TenTinh || !form.MaHuyen || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function QueQuanPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<QueQuanRow | null>(null);
  const [toDelete, setToDelete] = useState<QueQuanRow | null>(null);
  const query = useQuery({ queryKey: ['que-quan'], queryFn: async () => { const { data } = await apiClient.get<QueQuanRow[]>('/que-quan'); return data; } });
  const deleteMutation = useMutation({
    mutationFn: (ma: string) => apiClient.delete(`/que-quan/${ma}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['que-quan'] }); toast.success('Đã xóa'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Không thể xóa'),
  });

  return (
    <>
      <PageHeader title="Quản lý Quê quán" icon={<IconMap className="h-4 w-4" />} iconTone="teal"
        actions={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><IconPlus className="h-4 w-4" />Thêm quê quán</Button>} />
      <Card><CardContent className="p-0">
        {query.isLoading && <div className="m-4 h-32 animate-pulse rounded-lg bg-slate-100" />}
        {!query.isLoading && (query.data ?? []).length === 0 ? <EmptyState message="Chưa có quê quán nào" /> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Mã</TableHead><TableHead>Tỉnh/Thành phố</TableHead>
              <TableHead>Huyện/Quận</TableHead><TableHead className="text-center">Vùng sâu</TableHead><TableHead className="text-center">Thao tác</TableHead>
            </TableRow></TableHeader>
            <TableBody>{(query.data ?? []).map(row => (
              <TableRow key={row.MaQueQuan}>
                <TableCell className="font-mono font-semibold">{row.MaQueQuan}</TableCell>
                <TableCell className="font-medium">{row.TenTinh}</TableCell>
                <TableCell className="text-slate-500">{row.huyen?.TenHuyen ?? row.MaHuyen}</TableCell>
                <TableCell className="text-center">{row.huyen?.LaVungSauVungXa ? <Badge variant="warning">Có</Badge> : <span className="text-slate-400">—</span>}</TableCell>
                <TableCell className="text-center">
                  <ActionButton tone="edit" icon={<IconPencil className="h-3.5 w-3.5" />} label="Sửa" onClick={() => { setEditing(row); setFormOpen(true); }} />
                  <ActionButton tone="delete" icon={<IconTrash className="h-3.5 w-3.5" />} label="Xóa" onClick={() => setToDelete(row)} />
                </TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </CardContent></Card>
      <QueQuanDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title="Xóa quê quán"
        description={`Xóa quê quán "${toDelete?.TenTinh}"? Chỉ được phép nếu chưa có sinh viên nào thuộc vùng này.`}
        confirmText="Xóa" onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.MaQueQuan); }} />
    </>
  );
}
