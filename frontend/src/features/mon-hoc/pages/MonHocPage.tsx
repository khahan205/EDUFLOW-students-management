import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconBook2, IconPlus, IconSettings, IconFileSpreadsheet } from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { exportToExcel } from '@/lib/export-excel';
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
  const [search, setSearch] = useState('');
  const [filterLoaiMon, setFilterLoaiMon] = useState('');

  const listQuery = useQuery({ queryKey: ['mon-hoc'], queryFn: fetchMonHocList });

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

      {listQuery.isLoading && <div className="h-[400px] animate-pulse rounded-xl bg-slate-100" />}
      {listQuery.data && (
        <MonHocTable
          rows={filtered}
          onEdit={(m) => { setEditing(m); setFormOpen(true); }}
          onDelete={(m) => setToDelete(m)}
          search={search}
          onSearchChange={(v) => setSearch(v)}
          filterLoaiMon={filterLoaiMon}
          onFilterLoaiMonChange={(v) => setFilterLoaiMon(v)}
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
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.MaMH); }}
      />
    </>
  );
}
