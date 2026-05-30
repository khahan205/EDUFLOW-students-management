import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconBuildingSkyscraper, IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
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

export interface KhoaRow { MaKhoa: string; TenKhoa: string; }

const EMPTY = { MaKhoa: '', TenKhoa: '' };

function KhoaDialog({ open, onOpenChange, editing }: {
  open: boolean; onOpenChange: (v: boolean) => void; editing: KhoaRow | null;
}) {
  const qc = useQueryClient();
  const isEdit = !!editing;
  const [form, setForm] = useState({ ...EMPTY });

  useEffect(() => {
    if (open) setForm(editing ?? EMPTY);
  }, [open, editing]);

  const handleOpen = (v: boolean) => onOpenChange(v);

  const mutation = useMutation({
    mutationFn: () => isEdit
      ? apiClient.put(`/khoa/${editing!.MaKhoa}`, { TenKhoa: form.TenKhoa })
      : apiClient.post('/khoa', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['khoa'] });
      qc.invalidateQueries({ queryKey: ['nganh-hoc'] });
      toast.success(isEdit ? 'Đã cập nhật khoa' : 'Đã thêm khoa mới');
      onOpenChange(false);
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Có lỗi xảy ra'),
  });

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>{isEdit ? 'Sửa khoa' : 'Thêm khoa mới'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Mã khoa <span className="text-red-500">*</span></Label>
            <Input
              placeholder="VD: KHOA_CNTT"
              value={form.MaKhoa}
              onChange={(e) => setForm(f => ({ ...f, MaKhoa: e.target.value }))}
              disabled={isEdit}
              autoFocus={!isEdit}
            />
            {!isEdit && <p className="text-xs text-slate-400">Mã không thể thay đổi sau khi tạo</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Tên khoa <span className="text-red-500">*</span></Label>
            <Input
              placeholder="VD: Khoa Công nghệ Thông tin"
              value={form.TenKhoa}
              onChange={(e) => setForm(f => ({ ...f, TenKhoa: e.target.value }))}
              autoFocus={isEdit}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button
            disabled={!form.MaKhoa || !form.TenKhoa || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function KhoaPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<KhoaRow | null>(null);
  const [toDelete, setToDelete] = useState<KhoaRow | null>(null);

  const query = useQuery({
    queryKey: ['khoa'],
    queryFn: async () => {
      const { data } = await apiClient.get<KhoaRow[]>('/khoa');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (maKhoa: string) => apiClient.delete(`/khoa/${maKhoa}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['khoa'] });
      toast.success('Đã xóa khoa');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Không thể xóa khoa'),
  });

  return (
    <>
      <PageHeader
        title="Quản lý Khoa"
        icon={<IconBuildingSkyscraper className="h-4 w-4" />}
        iconTone="teal"
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <IconPlus className="h-4 w-4" />
            Thêm khoa
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {query.isLoading && <div className="m-4 h-32 animate-pulse rounded-lg bg-slate-100" />}
          {query.isError && (
            <div className="m-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              Lỗi: {(query.error as { message?: string })?.message}
            </div>
          )}
          {!query.isLoading && !query.isError && (query.data ?? []).length === 0 ? (
            <EmptyState message="Chưa có khoa nào" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã khoa</TableHead>
                  <TableHead>Tên khoa</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(query.data ?? []).map((row) => (
                  <TableRow key={row.MaKhoa}>
                    <TableCell className="font-mono font-semibold">{row.MaKhoa}</TableCell>
                    <TableCell className="font-medium">{row.TenKhoa}</TableCell>
                    <TableCell className="text-center">
                      <ActionButton
                        tone="edit" icon={<IconPencil className="h-3.5 w-3.5" />} label="Sửa"
                        onClick={() => { setEditing(row); setFormOpen(true); }}
                      />
                      <ActionButton
                        tone="delete" icon={<IconTrash className="h-3.5 w-3.5" />} label="Xóa"
                        onClick={() => setToDelete(row)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <KhoaDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
      <ConfirmDialog
        open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}
        title="Xóa khoa"
        description={`Xóa khoa "${toDelete?.TenKhoa}"? Chỉ được phép nếu chưa có ngành học nào thuộc khoa này.`}
        confirmText="Xóa"
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.MaKhoa); }}
      />
    </>
  );
}
