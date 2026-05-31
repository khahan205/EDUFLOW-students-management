import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconShield, IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ActionButton } from '@/components/common/ActionButton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { apiClient } from '@/services/api-client';

interface DoiTuongRow { MaDoiTuong: string; TenDoiTuong: string; TiLeGiamHocPhi: number; }
const EMPTY = { MaDoiTuong: '', TenDoiTuong: '', TiLeGiamHocPhi: '0' };

function DoiTuongDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: DoiTuongRow | null }) {
  const qc = useQueryClient();
  const isEdit = !!editing;
  const [form, setForm] = useState({ ...EMPTY });

  useEffect(() => { if (open) setForm(editing ? { MaDoiTuong: editing.MaDoiTuong, TenDoiTuong: editing.TenDoiTuong, TiLeGiamHocPhi: String(Number(editing.TiLeGiamHocPhi)) } : EMPTY); }, [open, editing]);

  const mutation = useMutation({
    mutationFn: () => isEdit
      ? apiClient.put(`/doi-tuong/${editing!.MaDoiTuong}`, { TenDoiTuong: form.TenDoiTuong, TiLeGiamHocPhi: Number(form.TiLeGiamHocPhi) })
      : apiClient.post('/doi-tuong', { ...form, TiLeGiamHocPhi: Number(form.TiLeGiamHocPhi) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['doi-tuong'] }); toast.success(isEdit ? 'Đã cập nhật' : 'Đã thêm đối tượng'); onOpenChange(false); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Có lỗi xảy ra'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>{isEdit ? 'Sửa đối tượng ưu tiên' : 'Thêm đối tượng ưu tiên'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Mã đối tượng <span className="text-red-500">*</span></Label>
            <Input placeholder="VD: DT_TOPDAU" value={form.MaDoiTuong} onChange={(e) => setForm(f => ({ ...f, MaDoiTuong: e.target.value }))} disabled={isEdit} autoFocus={!isEdit} />
          </div>
          <div className="space-y-1.5">
            <Label>Tên đối tượng <span className="text-red-500">*</span></Label>
            <Input placeholder="VD: Học lực xuất sắc" value={form.TenDoiTuong} onChange={(e) => setForm(f => ({ ...f, TenDoiTuong: e.target.value }))} autoFocus={isEdit} />
          </div>
          <div className="space-y-1.5">
            <Label>Tỉ lệ giảm học phí (0 – 1)</Label>
            <Input type="number" min={0} max={1} step={0.05} placeholder="VD: 0.5 = giảm 50%" value={form.TiLeGiamHocPhi} onChange={(e) => setForm(f => ({ ...f, TiLeGiamHocPhi: e.target.value }))} />
            <p className="text-xs text-slate-400">0 = không giảm · 0.3 = giảm 30% · 1 = miễn 100%</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button disabled={!form.MaDoiTuong || !form.TenDoiTuong || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DoiTuongPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DoiTuongRow | null>(null);
  const [toDelete, setToDelete] = useState<DoiTuongRow | null>(null);
  const query = useQuery({ queryKey: ['doi-tuong'], queryFn: async () => { const { data } = await apiClient.get<DoiTuongRow[]>('/doi-tuong'); return data; } });
  const deleteMutation = useMutation({
    mutationFn: (ma: string) => apiClient.delete(`/doi-tuong/${ma}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['doi-tuong'] }); toast.success('Đã xóa'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Không thể xóa'),
  });

  return (
    <>
      <PageHeader title="Đối tượng ưu tiên" icon={<IconShield className="h-4 w-4" />} iconTone="teal"
        actions={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><IconPlus className="h-4 w-4" />Thêm đối tượng</Button>} />
      <Card><CardContent className="p-0">
        {query.isLoading && <div className="m-4 h-32 animate-pulse rounded-lg bg-slate-100" />}
        {!query.isLoading && (query.data ?? []).length === 0 ? <EmptyState message="Chưa có đối tượng ưu tiên nào" /> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Mã</TableHead><TableHead>Tên đối tượng</TableHead>
              <TableHead className="text-center">Tỉ lệ giảm HP</TableHead><TableHead className="text-center">Thao tác</TableHead>
            </TableRow></TableHeader>
            <TableBody>{(query.data ?? []).map(row => (
              <TableRow key={row.MaDoiTuong}>
                <TableCell className="font-mono font-semibold">{row.MaDoiTuong}</TableCell>
                <TableCell className="font-medium">{row.TenDoiTuong}</TableCell>
                <TableCell className="text-center font-semibold text-teal-700">
                  {Number(row.TiLeGiamHocPhi) > 0 ? `${(Number(row.TiLeGiamHocPhi) * 100).toFixed(0)}%` : '—'}
                </TableCell>
                <TableCell className="text-center">
                  <ActionButton tone="edit" icon={<IconPencil className="h-3.5 w-3.5" />} label="Sửa" onClick={() => { setEditing(row); setFormOpen(true); }} />
                  <ActionButton tone="delete" icon={<IconTrash className="h-3.5 w-3.5" />} label="Xóa" onClick={() => setToDelete(row)} />
                </TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </CardContent></Card>
      <DoiTuongDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title="Xóa đối tượng ưu tiên"
        description={`Xóa đối tượng "${toDelete?.TenDoiTuong}"? Chỉ được phép nếu chưa có sinh viên nào thuộc đối tượng này.`}
        confirmText="Xóa" onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.MaDoiTuong); }} />
    </>
  );
}
