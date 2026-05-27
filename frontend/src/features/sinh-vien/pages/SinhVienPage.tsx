import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconUsers, IconPlus } from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { fetchSinhVienList, deleteSinhVien } from '../api/sinh-vien-api';
import { SinhVienTable } from '../components/SinhVienTable';
import { SinhVienFormDialog } from '../components/SinhVienFormDialog';
import type { SinhVien } from '@/types';

export function SinhVienPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SinhVien | null>(null);
  const [toDelete, setToDelete] = useState<SinhVien | null>(null);

  const listQuery = useQuery({
    queryKey: ['sinh-vien'],
    queryFn: fetchSinhVienList,
  });

  const deleteMutation = useMutation({
    mutationFn: (maSV: string) => deleteSinhVien(maSV),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sinh-vien'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Đã xoá sinh viên');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Xoá thất bại'),
  });

  const handleEdit = (sv: SinhVien) => {
    setEditing(sv);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Quản lý Sinh viên"
        icon={<IconUsers className="h-4 w-4" />}
        iconTone="info"
        actions={
          <Button onClick={handleAdd}>
            <IconPlus className="h-4 w-4" />
            Thêm sinh viên
          </Button>
        }
      />

      {listQuery.isLoading && (
        <div className="h-[300px] animate-pulse rounded-xl bg-slate-100" />
      )}

      {listQuery.data && (
        <SinhVienTable
          rows={listQuery.data}
          onEdit={handleEdit}
          onDelete={(sv) => setToDelete(sv)}
        />
      )}

      <SinhVienFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Xoá sinh viên"
        description={`Bạn có chắc muốn xoá sinh viên "${toDelete?.TenSV}" (${toDelete?.MaSV})? Hành động này không thể hoàn tác.`}
        confirmText="Xoá"
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.MaSV);
        }}
      />
    </>
  );
}
