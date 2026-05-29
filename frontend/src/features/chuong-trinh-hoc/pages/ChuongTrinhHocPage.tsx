import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconListCheck, IconPlus, IconTrash, IconPencil, IconFileSpreadsheet } from '@tabler/icons-react';
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
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { exportToExcel } from '@/lib/export-excel';
import { apiClient } from '@/services/api-client';
import { fetchCTH, addCTH, updateCTH, deleteCTH, type CTHRow } from '../api/chuong-trinh-hoc-api';

interface NganhOption { MaNganh: string; TenNganh: string; MaKhoa: string; }
interface MonHocOption { MaMH: string; TenMH: string; SoTinChi: number; }

function AddDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [maNganh, setMaNganh] = useState('');
  const [maMH, setMaMH] = useState('');
  const [hocKy, setHocKy] = useState('1');

  const nganhQuery = useQuery({
    queryKey: ['nganh-hoc'], staleTime: 300_000,
    queryFn: async () => { const { data } = await apiClient.get<NganhOption[]>('/master-data/nganh-hoc'); return data; },
  });
  const monHocQuery = useQuery({
    queryKey: ['mon-hoc-list'], staleTime: 300_000,
    queryFn: async () => { const { data } = await apiClient.get<MonHocOption[]>('/mon-hoc'); return data; },
  });

  const mutation = useMutation({
    mutationFn: () => addCTH({ maNganh, maMH, hocKy: Number(hocKy) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cth'] }); toast.success('Da them vao chuong trinh hoc'); onOpenChange(false); setMaNganh(''); setMaMH(''); setHocKy('1'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Co loi xay ra'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Them mon hoc vao chuong trinh</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nganh hoc <span className="text-red-500">*</span></Label>
            <Select value={maNganh} onValueChange={setMaNganh}>
              <SelectTrigger><SelectValue placeholder="-- Chon nganh --" /></SelectTrigger>
              <SelectContent>
                {(nganhQuery.data ?? []).map((n) => (
                  <SelectItem key={n.MaNganh} value={n.MaNganh}>{n.TenNganh}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Mon hoc <span className="text-red-500">*</span></Label>
            <Select value={maMH} onValueChange={setMaMH}>
              <SelectTrigger><SelectValue placeholder="-- Chon mon hoc --" /></SelectTrigger>
              <SelectContent>
                {(monHocQuery.data ?? []).map((m) => (
                  <SelectItem key={m.MaMH} value={m.MaMH}>{m.TenMH} ({m.MaMH})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Hoc ky trong chuong trinh (thu tu)</Label>
            <Input type="number" min={1} max={10} value={hocKy} onChange={(e) => setHocKy(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huy</Button>
          <Button disabled={!maNganh || !maMH || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Dang them...' : 'Them'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({ row, onClose }: { row: CTHRow | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [hocKy, setHocKy] = useState(String(row?.HocKy ?? 1));

  const mutation = useMutation({
    mutationFn: () => updateCTH(row!.MaCTH, Number(hocKy)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cth'] }); toast.success('Da cap nhat'); onClose(); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Cap nhat that bai'),
  });

  if (!row) return null;
  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Sua hoc ky chuong trinh</DialogTitle></DialogHeader>
        <p className="text-sm text-slate-500">{row.TenMH} — {row.TenNganh}</p>
        <div className="space-y-1.5">
          <Label>Hoc ky thu tu trong chuong trinh</Label>
          <Input type="number" min={1} max={10} value={hocKy} onChange={(e) => setHocKy(e.target.value)} autoFocus />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Huy</Button>
          <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>Luu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ChuongTrinhHocPage() {
  const qc = useQueryClient();
  const [filterNganh, setFilterNganh] = useState('');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<CTHRow | null>(null);
  const [toDelete, setToDelete] = useState<CTHRow | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const nganhQuery = useQuery({
    queryKey: ['nganh-hoc'], staleTime: 300_000,
    queryFn: async () => { const { data } = await apiClient.get<NganhOption[]>('/master-data/nganh-hoc'); return data; },
  });

  const query = useQuery({
    queryKey: ['cth', filterNganh],
    queryFn: () => fetchCTH(filterNganh || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCTH(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cth'] }); toast.success('Da xoa khoi chuong trinh'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Xoa that bai'),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (query.data ?? []).filter(
      (r) => !q || r.MaMH.toLowerCase().includes(q) || r.TenMH.toLowerCase().includes(q) || r.TenNganh.toLowerCase().includes(q),
    );
  }, [query.data, search]);

  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const groupedByNganh = useMemo(() => {
    const map: Record<string, number> = {};
    (query.data ?? []).forEach((r) => { map[r.MaNganh] = (map[r.MaNganh] || 0) + 1; });
    return map;
  }, [query.data]);

  return (
    <>
      <PageHeader
        title="Chương trình học"
        icon={<IconListCheck className="h-4 w-4" />}
        iconTone="teal"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportToExcel(filtered, [
              { header: 'Nganh', key: 'TenNganh' }, { header: 'Ma MH', key: 'MaMH' },
              { header: 'Ten mon hoc', key: 'TenMH' }, { header: 'So TC', key: 'SoTinChi' },
              { header: 'Loai mon', key: 'MaLoaiMon' }, { header: 'Hoc ky', key: 'HocKy' },
            ], 'chuong-trinh-hoc')} disabled={!filtered.length}>
              <IconFileSpreadsheet className="h-4 w-4" />Xuat Excel
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <IconPlus className="h-4 w-4" />Them mon vao CTH
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b p-4">
            <Input
              placeholder="Tim ma mon, ten mon, ten nganh..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-64"
            />
            <Select value={filterNganh || 'all'} onValueChange={(v) => { setFilterNganh(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-52"><SelectValue placeholder="Tat ca nganh" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tat ca nganh</SelectItem>
                {(nganhQuery.data ?? []).map((n) => (
                  <SelectItem key={n.MaNganh} value={n.MaNganh}>
                    {n.TenNganh} {groupedByNganh[n.MaNganh] ? `(${groupedByNganh[n.MaNganh]})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(search || filterNganh) && (
              <button type="button" onClick={() => { setSearch(''); setFilterNganh(''); setPage(1); }} className="text-sm text-slate-500 underline hover:text-slate-800">Xoa bo loc</button>
            )}
          </div>

          {query.isLoading && <div className="m-4 h-64 animate-pulse rounded-lg bg-slate-100" />}
          {!query.isLoading && filtered.length === 0 ? (
            <EmptyState message="Chương trình học chưa có môn học nào" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nganh hoc</TableHead>
                    <TableHead>Ma mon</TableHead>
                    <TableHead>Ten mon hoc</TableHead>
                    <TableHead className="text-center">So TC</TableHead>
                    <TableHead className="text-center">Loai mon</TableHead>
                    <TableHead className="text-center">Hoc ky</TableHead>
                    <TableHead className="text-center">Thao tac</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((r) => (
                    <TableRow key={r.MaCTH}>
                      <TableCell>
                        <p className="font-medium">{r.TenNganh}</p>
                        <p className="text-xs text-slate-400">{r.MaNganh}</p>
                      </TableCell>
                      <TableCell className="font-mono font-semibold">{r.MaMH}</TableCell>
                      <TableCell className="font-medium">{r.TenMH}</TableCell>
                      <TableCell className="text-center">{r.SoTinChi}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={r.MaLoaiMon === 'TH' ? 'info' : 'muted'}>{r.MaLoaiMon}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-sm font-semibold text-teal-700">HK{r.HocKy}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <ActionButton tone="edit" icon={<IconPencil className="h-3.5 w-3.5" />} label="Sua" onClick={() => setEditRow(r)} />
                        <ActionButton tone="delete" icon={<IconTrash className="h-3.5 w-3.5" />} label="Xoa" onClick={() => setToDelete(r)} />
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

      <AddDialog open={addOpen} onOpenChange={setAddOpen} />
      <EditDialog row={editRow} onClose={() => setEditRow(null)} />
      <ConfirmDialog
        open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}
        title="Xoa khoi chuong trinh hoc"
        description={`Xoa mon "${toDelete?.TenMH}" khoi chuong trinh nganh "${toDelete?.TenNganh}"?`}
        confirmText="Xoa"
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.MaCTH); }}
      />
    </>
  );
}
