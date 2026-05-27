import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconBook2, IconPlus, IconSettings } from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { fetchMonHocList, deleteMonHoc } from '../api/mon-hoc-api';
import { MonHocTable } from '../components/MonHocTable';
import { MonHocFormDialog } from '../components/MonHocFormDialog';
import { PricingConfigDialog } from '../components/PricingConfigDialog';
import type { MonHoc } from '@/types';

export function MonHocPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [editing, setEditing] = useState<MonHoc | null>(null);
  const [toDelete, setToDelete] = useState<MonHoc | null>(null);

  const listQuery = useQuery({
    queryKey: ['mon-hoc'],
    queryFn: fetchMonHocList,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMonHoc,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mon-hoc'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Đã xoá môn học');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Xoá thất bại'),
  });

  return (
    <>
      <PageHeader
        title="Quản lý Môn học"
        icon={<IconBook2 className="h-4 w-4" />}
        iconTone="success"
        actions={
          <>
            <Button variant="secondary" onClick={() => setPricingOpen(true)}>
              <IconSettings className="h-4 w-4" />
              Cấu hình giá
            </Button>
            <Button
              variant="success"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <IconPlus className="h-4 w-4" />
              Thêm môn
            </Button>
          </>
        }
      />

      {listQuery.isLoading && <div className="h-[400px] animate-pulse rounded-xl bg-slate-100" />}
      {listQuery.data && (
        <MonHocTable
          rows={listQuery.data}
          onEdit={(m) => {
            setEditing(m);
            setFormOpen(true);
          }}
          onDelete={(m) => setToDelete(m)}
        />
      )}

      <MonHocFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
      <PricingConfigDialog open={pricingOpen} onOpenChange={setPricingOpen} />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Xoá môn học"
        description={`Bạn có chắc muốn xoá môn "${toDelete?.TenMH}" (${toDelete?.MaMH})?`}
        confirmText="Xoá"
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.MaMH);
        }}
      />
    </>
  );
}
