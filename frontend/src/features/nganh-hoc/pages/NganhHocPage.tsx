import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconBuildingCommunity, IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/services/api-client';
import type { KhoaRow } from '@/features/khoa/pages/KhoaPage';

interface NganhRow {
  MaNganh: string;
  TenNganh: string;
  MaKhoa: string;
  TenKhoa?: string;
}

const EMPTY = { MaNganh: '', TenNganh: '', MaKhoa: '' };

function NganhDialog({
  open, onOpenChange, editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: NganhRow | null;
}) {
  const qc = useQueryClient();
  const isEdit = !!editing;
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);

  const khoaQuery = useQuery({
    queryKey: ['khoa'],
    queryFn: async () => { const { data } = await apiClient.get<KhoaRow[]>('/khoa'); return data; },
    staleTime: 300_000,
  });

  useEffect(() => {
    if (open) setForm(editing ?? EMPTY);
  }, [open, editing]);

  const handleOpen = (v: boolean) => onOpenChange(v);

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? apiClient.put(`/nganh-hoc/${editing!.MaNganh}`, { TenNganh: form.TenNganh, MaKhoa: form.MaKhoa })
        : apiClient.post('/nganh-hoc', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nganh-hoc'] });
      toast.success(isEdit ? 'Đã cập nhật ngành học' : 'Đã thêm ngành học mới');
      onOpenChange(false);
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Có lỗi xảy ra'),
  });

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa ngành học' : 'Thêm ngành học mới'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Mã ngành <span className="text-red-500">*</span></Label>
            <Input
              placeholder="VD: NG_CNTT"
              value={form.MaNganh}
              onChange={set('MaNganh')}
              disabled={isEdit}
            />
            {!isEdit && <p className="text-xs text-slate-400">Mã ngành không thể thay đổi sau khi tạo</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Tên ngành <span className="text-red-500">*</span></Label>
            <Input
              placeholder="VD: Công nghệ Thông tin"
              value={form.TenNganh}
              onChange={set('TenNganh')}
              autoFocus={isEdit}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Khoa quản lý <span className="text-red-500">*</span></Label>
            <Select value={form.MaKhoa} onValueChange={(v) => setForm(f => ({ ...f, MaKhoa: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="— Chọn khoa —" />
              </SelectTrigger>
              <SelectContent>
                {(khoaQuery.data ?? []).map((k) => (
                  <SelectItem key={k.MaKhoa} value={k.MaKhoa}>{k.TenKhoa}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button
            disabled={!form.MaNganh || !form.TenNganh || !form.MaKhoa || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NganhHocPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NganhRow | null>(null);
  const [toDelete, setToDelete] = useState<NganhRow | null>(null);

  const query = useQuery({
    queryKey: ['nganh-hoc'],
    queryFn: async () => {
      const { data } = await apiClient.get<NganhRow[]>('/nganh-hoc');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (maNganh: string) => apiClient.delete(`/nganh-hoc/${maNganh}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nganh-hoc'] });
      toast.success('Đã xóa ngành học');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Không thể xóa ngành học'),
  });

  const handleAdd = () => { setEditing(null); setFormOpen(true); };
  const handleEdit = (row: NganhRow) => { setEditing(row); setFormOpen(true); };

  return (
    <>
      <PageHeader
        title="Quản lý Ngành học"
        icon={<IconBuildingCommunity className="h-4 w-4" />}
        iconTone="teal"
        actions={
          <Button onClick={handleAdd}>
            <IconPlus className="h-4 w-4" />
            Thêm ngành
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {query.isLoading && <div className="m-4 h-40 animate-pulse rounded-lg bg-slate-100" />}

          {query.isError && (
            <div className="m-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              Lỗi tải dữ liệu: {(query.error as { message?: string })?.message ?? 'Không xác định'}
            </div>
          )}

          {!query.isLoading && !query.isError && (query.data ?? []).length === 0 ? (
            <EmptyState message="Chưa có ngành học nào" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã ngành</TableHead>
                  <TableHead>Tên ngành</TableHead>
                  <TableHead>Khoa</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(query.data ?? []).map((row) => (
                  <TableRow key={row.MaNganh}>
                    <TableCell className="font-mono font-semibold">{row.MaNganh}</TableCell>
                    <TableCell className="font-medium">{row.TenNganh}</TableCell>
                    <TableCell className="text-slate-500">{row.TenKhoa ?? row.MaKhoa}</TableCell>
                    <TableCell className="text-center">
                      <ActionButton
                        tone="edit"
                        icon={<IconPencil className="h-3.5 w-3.5" />}
                        label="Sửa"
                        onClick={() => handleEdit(row)}
                      />
                      <ActionButton
                        tone="delete"
                        icon={<IconTrash className="h-3.5 w-3.5" />}
                        label="Xóa"
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

      <NganhDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Xóa ngành học"
        description={`Xóa ngành "${toDelete?.TenNganh}" (${toDelete?.MaNganh})? Chỉ được phép nếu chưa có sinh viên nào thuộc ngành này.`}
        confirmText="Xóa"
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.MaNganh); }}
      />
    </>
  );
}
