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
    queryKey: ['nganh-for-cth'], staleTime: 300_000,
    queryFn: async () => { const { data } = await apiClient.get<NganhOption[]>('/nganh-hoc'); return data; },
  });
  const monHocQuery = useQuery({
    queryKey: ['mon-hoc-for-cth'], staleTime: 300_000,
    queryFn: async () => { const { data } = await apiClient.get<MonHocOption[]>('/mon-hoc'); return data; },
  });
  // Môn đã có trong CTH của ngành đang chọn
  const cthQuery = useQuery({
    queryKey: ['cth-check', maNganh],
    queryFn: async () => { const { data } = await apiClient.get<{ MaMH: string }[]>('/chuong-trinh-hoc', { params: { maNganh } }); return data; },
    enabled: !!maNganh,
  });
  const daCo = new Set((cthQuery.data ?? []).map(c => c.MaMH));
  const monChuaCo = (monHocQuery.data ?? []).filter(m => !daCo.has(m.MaMH));

  const mutation = useMutation({
    mutationFn: () => addCTH({ maNganh, maMH, hocKy: Number(hocKy) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cth'] });
      toast.success('Đã thêm vào chương trình học');
      onOpenChange(false);
      setMaNganh(''); setMaMH(''); setHocKy('1');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Có lỗi xảy ra'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Thêm môn học vào chương trình</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Ngành học <span className="text-red-500">*</span></Label>
            <Select value={maNganh} onValueChange={(v) => { setMaNganh(v); setMaMH(''); }}>
              <SelectTrigger><SelectValue placeholder="— Chọn ngành —" /></SelectTrigger>
              <SelectContent>
                {(nganhQuery.data ?? []).map((n) => (
                  <SelectItem key={n.MaNganh} value={n.MaNganh}>{n.TenNganh}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Môn học <span className="text-red-500">*</span></Label>
            <Select value={maMH} onValueChange={setMaMH} disabled={!maNganh}>
              <SelectTrigger>
                <SelectValue placeholder={!maNganh ? '— Chọn ngành trước —' : monChuaCo.length === 0 ? '— Đã thêm đủ môn —' : '— Chọn môn học —'} />
              </SelectTrigger>
              <SelectContent>
                {monChuaCo.length === 0 && maNganh ? (
                  <div className="py-3 text-center text-sm text-slate-400">Tất cả môn học đã có trong CTH ngành này</div>
                ) : (
                  monChuaCo.map((m) => (
                    <SelectItem key={m.MaMH} value={m.MaMH}>{m.TenMH} <span className="text-slate-400">({m.MaMH})</span></SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Học kỳ thứ tự trong chương trình</Label>
            <Input type="number" min={1} max={10} value={hocKy} onChange={(e) => setHocKy(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button disabled={!maNganh || !maMH || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Đang thêm...' : 'Thêm'}
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cth'] });
      toast.success('Đã cập nhật');
      onClose();
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Cập nhật thất bại'),
  });

  if (!row) return null;
  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Sửa học kỳ chương trình</DialogTitle></DialogHeader>
        <p className="text-sm text-slate-500">{row.TenMH} — {row.TenNganh}</p>
        <div className="space-y-1.5">
          <Label>Học kỳ thứ tự trong chương trình</Label>
          <Input type="number" min={1} max={10} value={hocKy} onChange={(e) => setHocKy(e.target.value)} autoFocus />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ChuongTrinhHocPage() {
  const qc = useQueryClient();
  const [filterNganh, setFilterNganh] = useState('');
  const [filterKhoa, setFilterKhoa] = useState('');
  const [filterHocKy, setFilterHocKy] = useState('');
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

  // Khoa options: lấy từ ngành (MaKhoa)
  const khoaOptions = useMemo(() => {
    const set = new Set((nganhQuery.data ?? []).map((n) => n.MaKhoa).filter(Boolean));
    return Array.from(set).sort();
  }, [nganhQuery.data]);

  // HocKy options: lấy từ CTH data (thứ tự 1, 2, 3...)
  const hocKyOptions = useMemo(() => {
    const set = new Set((query.data ?? []).map((r) => r.HocKy));
    return Array.from(set).sort((a, b) => a - b);
  }, [query.data]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCTH(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cth'] });
      toast.success('Đã xóa khỏi chương trình');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Xóa thất bại'),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (query.data ?? []).filter((r) => {
      if (filterKhoa && r.MaKhoa !== filterKhoa) return false;
      if (filterHocKy && r.HocKy !== Number(filterHocKy)) return false;
      if (q && !r.MaMH.toLowerCase().includes(q) && !r.TenMH.toLowerCase().includes(q) && !r.TenNganh.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query.data, search, filterKhoa, filterHocKy]);

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
              { header: 'Ngành học', key: 'TenNganh' },
              { header: 'Mã môn', key: 'MaMH' },
              { header: 'Tên môn học', key: 'TenMH' },
              { header: 'Số TC', key: 'SoTinChi' },
              { header: 'Loại môn', key: 'MaLoaiMon' },
              { header: 'Học kỳ', key: 'HocKy' },
            ], 'chuong-trinh-hoc')} disabled={!filtered.length}>
              <IconFileSpreadsheet className="h-4 w-4" />
              Xuất Excel
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <IconPlus className="h-4 w-4" />
              Thêm môn vào CTH
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b p-4">
            <Input
              placeholder="Tìm mã môn, tên môn, tên ngành..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-56"
            />
            <Select value={filterNganh || 'all'} onValueChange={(v) => { setFilterNganh(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tất cả ngành" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả ngành</SelectItem>
                {(nganhQuery.data ?? []).map((n) => (
                  <SelectItem key={n.MaNganh} value={n.MaNganh}>
                    {n.TenNganh} {groupedByNganh[n.MaNganh] ? `(${groupedByNganh[n.MaNganh]})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {khoaOptions.length > 0 && (
              <Select value={filterKhoa || 'all'} onValueChange={(v) => { setFilterKhoa(v === 'all' ? '' : v); setFilterNganh(''); setPage(1); }}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Tất cả khoa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khoa</SelectItem>
                  {khoaOptions.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={filterHocKy || 'all'} onValueChange={(v) => { setFilterHocKy(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Tất cả HK" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả học kỳ</SelectItem>
                {hocKyOptions.map((hk) => (
                  <SelectItem key={hk} value={String(hk)}>Học kỳ {hk}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(search || filterNganh || filterKhoa || filterHocKy) && (
              <button
                type="button"
                onClick={() => { setSearch(''); setFilterNganh(''); setFilterKhoa(''); setFilterHocKy(''); setPage(1); }}
                className="text-sm text-slate-500 underline hover:text-slate-800"
              >
                Xoá bộ lọc
              </button>
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
                    <TableHead>Ngành học</TableHead>
                    <TableHead>Mã môn</TableHead>
                    <TableHead>Tên môn học</TableHead>
                    <TableHead className="text-center">Số TC</TableHead>
                    <TableHead className="text-center">Loại môn</TableHead>
                    <TableHead className="text-center">Học kỳ</TableHead>
                    <TableHead className="text-center">Thao tác</TableHead>
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
                        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-sm font-semibold text-teal-700">
                          HK{r.HocKy}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <ActionButton tone="edit" icon={<IconPencil className="h-3.5 w-3.5" />} label="Sửa" onClick={() => setEditRow(r)} />
                        <ActionButton tone="delete" icon={<IconTrash className="h-3.5 w-3.5" />} label="Xóa" onClick={() => setToDelete(r)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t px-4">
                <Pagination
                  total={filtered.length}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AddDialog open={addOpen} onOpenChange={setAddOpen} />
      <EditDialog row={editRow} onClose={() => setEditRow(null)} />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Xóa khỏi chương trình học"
        description={`Xóa môn "${toDelete?.TenMH}" khỏi chương trình ngành "${toDelete?.TenNganh}"?`}
        confirmText="Xóa"
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.MaCTH); }}
      />
    </>
  );
}
