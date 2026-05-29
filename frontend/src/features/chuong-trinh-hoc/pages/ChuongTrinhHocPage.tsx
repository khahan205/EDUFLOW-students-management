import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconListCheck, IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionButton } from '@/components/common/ActionButton';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { fetchCTH, addToCTH, removeFromCTH, type CTHRow } from '../api/chuong-trinh-hoc-api';

function AddToCTHDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [maNganh, setMaNganh] = useState('');
  const [maMH, setMaMH] = useState('');
  const [hocKy, setHocKy] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maNganh || !maMH) { toast.error('Nhập đầy đủ thông tin.'); return; }
    setSubmitting(true);
    try {
      await addToCTH(maNganh.trim(), maMH.trim(), Number(hocKy));
      qc.invalidateQueries({ queryKey: ['chuong-trinh-hoc'] });
      toast.success('Đã thêm vào chương trình học');
      onOpenChange(false);
      setMaNganh(''); setMaMH(''); setHocKy('1');
    } catch (err) {
      toast.error((err as { message?: string })?.message ?? 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Thêm môn vào chương trình</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Mã ngành</Label>
            <Input value={maNganh} onChange={(e) => setMaNganh(e.target.value)} placeholder="NG_CNTT" autoFocus />
          </div>
          <div className="space-y-2">
            <Label>Mã môn học</Label>
            <Input value={maMH} onChange={(e) => setMaMH(e.target.value)} placeholder="CS101" />
          </div>
          <div className="space-y-2">
            <Label>Học kỳ thứ tự</Label>
            <Input type="number" min="1" max="12" value={hocKy} onChange={(e) => setHocKy(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Đang thêm...' : 'Thêm'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ChuongTrinhHocPage() {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [toRemove, setToRemove] = useState<CTHRow | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({ queryKey: ['chuong-trinh-hoc'], queryFn: () => fetchCTH() });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (query.data ?? []).filter(
      (r) => !q || r.MaMH.toLowerCase().includes(q) || r.TenMH.toLowerCase().includes(q) || r.MaNganh.toLowerCase().includes(q),
    );
  }, [query.data, search]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const removeMutation = useMutation({
    mutationFn: (row: CTHRow) => removeFromCTH(row.MaCTH),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chuong-trinh-hoc'] });
      toast.success('Đã xoá khỏi chương trình học');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Có lỗi xảy ra'),
  });

  return (
    <>
      <PageHeader
        title="Chương trình Đào tạo"
        icon={<IconListCheck className="h-4 w-4" />}
        iconTone="success"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <IconPlus className="h-4 w-4" />
            Thêm môn
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="border-b p-4">
            <Input
              placeholder="Tìm theo mã ngành, mã môn, tên môn..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="max-w-sm"
            />
          </div>
          {query.isLoading && <div className="h-[200px] animate-pulse m-4 rounded-lg bg-slate-100" />}
          {!query.isLoading && filtered.length === 0 ? (
            <EmptyState message="Chưa có dữ liệu chương trình học" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngành</TableHead>
                    <TableHead>Mã môn</TableHead>
                    <TableHead>Tên môn</TableHead>
                    <TableHead className="text-center">TC</TableHead>
                    <TableHead className="text-center">HK thứ</TableHead>
                    <TableHead className="text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((r) => (
                    <TableRow key={r.MaCTH}>
                      <TableCell className="font-mono text-sm">{r.MaNganh}</TableCell>
                      <TableCell className="font-mono font-semibold">{r.MaMH}</TableCell>
                      <TableCell>{r.TenMH}</TableCell>
                      <TableCell className="text-center">{r.SoTinChi}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="info">HK{r.HocKy}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <ActionButton
                          tone="delete"
                          icon={<IconTrash className="h-3.5 w-3.5" />}
                          label="Xoá khỏi CTH"
                          onClick={() => setToRemove(r)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t px-4">
                <Pagination total={filtered.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AddToCTHDialog open={addOpen} onOpenChange={setAddOpen} />

      <ConfirmDialog
        open={!!toRemove}
        onOpenChange={(o) => !o && setToRemove(null)}
        title="Xoá khỏi chương trình"
        description={`Xoá môn "${toRemove?.TenMH}" khỏi chương trình ngành "${toRemove?.MaNganh}"?`}
        confirmText="Xoá"
        onConfirm={() => { if (toRemove) removeMutation.mutate(toRemove); }}
      />
    </>
  );
}
