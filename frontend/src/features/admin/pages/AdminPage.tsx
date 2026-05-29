import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconSettings, IconPlus, IconFileSpreadsheet } from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { exportToExcel } from '@/lib/export-excel';
import { fetchAccounts, deleteAccount, type AccountRow } from '../api/admin-api';
import { AccountTable } from '../components/AccountTable';
import { AccountFormDialog } from '../components/AccountFormDialog';
import { ResetPasswordDialog } from '../components/ResetPasswordDialog';
import { AuditLogTab } from '../components/AuditLogTab';

export function AdminPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AccountRow | null>(null);
  const [toDelete, setToDelete] = useState<AccountRow | null>(null);
  const [resetPwAcc, setResetPwAcc] = useState<AccountRow | null>(null);

  const accountsQuery = useQuery({
    queryKey: ['admin-accounts'],
    queryFn: fetchAccounts,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-accounts'] });
      toast.success('Đã xoá tài khoản');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Xoá thất bại'),
  });

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (acc: AccountRow) => {
    setEditing(acc);
    setFormOpen(true);
  };

  const handleExport = () => {
    if (!accountsQuery.data) return;
    exportToExcel(
      accountsQuery.data,
      [
        { header: 'Tên đăng nhập', key: 'username' },
        { header: 'Họ tên', key: 'fullName' },
        { header: 'Email', key: 'email' },
        { header: 'Vai trò', key: 'role' },
        { header: 'Trạng thái', key: 'status' },
      ],
      'danh-sach-tai-khoan',
    );
  };

  return (
    <>
      <PageHeader
        title="Quản trị hệ thống"
        icon={<IconSettings className="h-4 w-4" />}
        iconTone="purple"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={!accountsQuery.data}>
              <IconFileSpreadsheet className="h-4 w-4" />
              Xuất Excel
            </Button>
            <Button onClick={handleAdd}>
              <IconPlus className="h-4 w-4" />
              Tạo tài khoản
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="accounts">
        <TabsList className="mb-4">
          <TabsTrigger value="accounts">Tài khoản</TabsTrigger>
          <TabsTrigger value="audit">Lịch sử hoạt động</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          {accountsQuery.isLoading && (
            <div className="h-[300px] animate-pulse rounded-xl bg-slate-100" />
          )}
          {accountsQuery.data && (
            <AccountTable
              rows={accountsQuery.data}
              onEdit={handleEdit}
              onDelete={(acc) => setToDelete(acc)}
              onResetPassword={(acc) => setResetPwAcc(acc)}
            />
          )}
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogTab />
        </TabsContent>
      </Tabs>

      <AccountFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />

      <ResetPasswordDialog
        open={!!resetPwAcc}
        onOpenChange={(o) => !o && setResetPwAcc(null)}
        account={resetPwAcc}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Xoá tài khoản"
        description={`Bạn có chắc muốn xoá tài khoản "${toDelete?.username}"? Hành động này không thể hoàn tác.`}
        confirmText="Xoá"
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id);
        }}
      />
    </>
  );
}
