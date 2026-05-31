import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconBuildingSkyscraper, IconPlus, IconPencil, IconTrash, IconListCheck } from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ActionButton } from '@/components/common/ActionButton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { apiClient } from '@/services/api-client';

interface KhoaRow { MaKhoa: string; TenKhoa: string; }
interface NganhRow { MaNganh: string; TenNganh: string; MaKhoa: string; }

function KhoaDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: KhoaRow | null }) {
  const qc = useQueryClient();
  const isEdit = !!editing;
  const [form, setForm] = useState({ MaKhoa: '', TenKhoa: '' });
  useEffect(() => { if (open) setForm(editing ?? { MaKhoa: '', TenKhoa: '' }); }, [open, editing]);
  const mutation = useMutation({
    mutationFn: () => isEdit ? apiClient.put(`/khoa/${editing!.MaKhoa}`, { TenKhoa: form.TenKhoa }) : apiClient.post('/khoa', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['khoa'] }); toast.success(isEdit ? 'Đã cập nhật khoa' : 'Đã thêm khoa'); onOpenChange(false); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Lỗi'),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>{isEdit ? 'Sửa khoa' : 'Thêm khoa'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Mã khoa <span className="text-red-500">*</span></Label>
            <Input placeholder="VD: KHOA_CNTT" value={form.MaKhoa} onChange={e => setForm(f => ({ ...f, MaKhoa: e.target.value }))} disabled={isEdit} autoFocus={!isEdit} /></div>
          <div className="space-y-1.5"><Label>Tên khoa <span className="text-red-500">*</span></Label>
            <Input placeholder="VD: Khoa Công nghệ Thông tin" value={form.TenKhoa} onChange={e => setForm(f => ({ ...f, TenKhoa: e.target.value }))} autoFocus={isEdit} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button disabled={!form.MaKhoa || !form.TenKhoa || mutation.isPending} onClick={() => mutation.mutate()}>
            {isEdit ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NganhDialog({ open, onOpenChange, editing, maKhoa }: { open: boolean; onOpenChange: (v: boolean) => void; editing: NganhRow | null; maKhoa: string }) {
  const qc = useQueryClient();
  const isEdit = !!editing;
  const [form, setForm] = useState({ MaNganh: '', TenNganh: '', MaKhoa: maKhoa });
  useEffect(() => { if (open) setForm(editing ? { MaNganh: editing.MaNganh, TenNganh: editing.TenNganh, MaKhoa: editing.MaKhoa } : { MaNganh: '', TenNganh: '', MaKhoa: maKhoa }); }, [open, editing, maKhoa]);
  const mutation = useMutation({
    mutationFn: () => isEdit ? apiClient.put(`/nganh-hoc/${editing!.MaNganh}`, { TenNganh: form.TenNganh, MaKhoa: form.MaKhoa }) : apiClient.post('/nganh-hoc', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['nganh-hoc'] }); toast.success(isEdit ? 'Đã cập nhật ngành' : 'Đã thêm ngành'); onOpenChange(false); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Lỗi'),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>{isEdit ? 'Sửa ngành học' : 'Thêm ngành học'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Mã ngành <span className="text-red-500">*</span></Label>
            <Input placeholder="VD: NG_CNTT" value={form.MaNganh} onChange={e => setForm(f => ({ ...f, MaNganh: e.target.value }))} disabled={isEdit} autoFocus={!isEdit} /></div>
          <div className="space-y-1.5"><Label>Tên ngành <span className="text-red-500">*</span></Label>
            <Input placeholder="VD: Công nghệ Thông tin" value={form.TenNganh} onChange={e => setForm(f => ({ ...f, TenNganh: e.target.value }))} autoFocus={isEdit} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button disabled={!form.MaNganh || !form.TenNganh || mutation.isPending} onClick={() => mutation.mutate()}>{isEdit ? 'Cập nhật' : 'Thêm'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function KhoaNganhPage() {
  const qc = useQueryClient();
  const [selectedKhoa, setSelectedKhoa] = useState<KhoaRow | null>(null);
  const [khoaDialog, setKhoaDialog] = useState(false);
  const [editKhoa, setEditKhoa] = useState<KhoaRow | null>(null);
  const [deleteKhoa, setDeleteKhoa] = useState<KhoaRow | null>(null);
  const [nganhDialog, setNganhDialog] = useState(false);
  const [editNganh, setEditNganh] = useState<NganhRow | null>(null);
  const [deleteNganh, setDeleteNganh] = useState<NganhRow | null>(null);

  const khoaQuery = useQuery({ queryKey: ['khoa'], queryFn: async () => { const { data } = await apiClient.get<KhoaRow[]>('/khoa'); return data; } });
  const nganhQuery = useQuery({ queryKey: ['nganh-hoc'], queryFn: async () => { const { data } = await apiClient.get<NganhRow[]>('/nganh-hoc'); return data; } });

  const khoaList = khoaQuery.data ?? [];
  const allNganh = nganhQuery.data ?? [];
  const filteredNganh = selectedKhoa ? allNganh.filter(n => n.MaKhoa === selectedKhoa.MaKhoa) : allNganh;

  const deleteKhoaMutation = useMutation({
    mutationFn: (maKhoa: string) => apiClient.delete(`/khoa/${maKhoa}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['khoa'] }); toast.success('Đã xóa khoa'); if (selectedKhoa?.MaKhoa === deleteKhoa?.MaKhoa) setSelectedKhoa(null); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Không thể xóa'),
  });
  const deleteNganhMutation = useMutation({
    mutationFn: (maNganh: string) => apiClient.delete(`/nganh-hoc/${maNganh}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['nganh-hoc'] }); toast.success('Đã xóa ngành'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Không thể xóa'),
  });

  return (
    <>
      <PageHeader title="Khoa & Ngành học" icon={<IconBuildingSkyscraper className="h-4 w-4" />} iconTone="teal" />

      <div className="grid grid-cols-[320px_1fr] gap-5">
        {/* LEFT: Danh sách Khoa */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-semibold text-slate-700 whitespace-nowrap">Danh sách Khoa</CardTitle>
              <Button size="sm" onClick={() => { setEditKhoa(null); setKhoaDialog(true); }} title="Thêm khoa mới">
                <IconPlus className="h-4 w-4 mr-1" />Thêm
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            {khoaQuery.isLoading && <div className="h-32 animate-pulse rounded bg-slate-100" />}
            {khoaList.length === 0 && !khoaQuery.isLoading && <p className="py-4 text-center text-xs text-slate-400">Chưa có khoa</p>}
            <div className="space-y-1">
              {khoaList.map(k => (
                <div
                  key={k.MaKhoa}
                  onClick={() => setSelectedKhoa(k.MaKhoa === selectedKhoa?.MaKhoa ? null : k)}
                  className={`group cursor-pointer rounded-lg px-3 py-3 transition-colors ${selectedKhoa?.MaKhoa === k.MaKhoa ? 'bg-teal-600 text-white' : 'hover:bg-slate-100'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-snug">{k.TenKhoa}</p>
                      <p className={`text-sm mt-0.5 ${selectedKhoa?.MaKhoa === k.MaKhoa ? 'text-white/70' : 'text-slate-400'}`}>{k.MaKhoa}</p>
                    </div>
                    <div className="flex shrink-0 gap-1 pt-0.5 opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                      <ActionButton tone="edit" icon={<IconPencil className="h-3.5 w-3.5" />} label="Sửa" onClick={() => { setEditKhoa(k); setKhoaDialog(true); }} />
                      <ActionButton tone="delete" icon={<IconTrash className="h-3.5 w-3.5" />} label="Xóa" onClick={() => setDeleteKhoa(k)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Ngành thuộc Khoa */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <IconListCheck className="h-4 w-4 shrink-0 text-teal-600" />
                  <CardTitle className="text-base font-semibold text-slate-700">
                    {selectedKhoa ? `Ngành — ${selectedKhoa.TenKhoa}` : 'Tất cả ngành học'}
                  </CardTitle>
                  <Badge variant="info">{filteredNganh.length} ngành</Badge>
                </div>
                {!selectedKhoa && (
                  <p className="mt-1 text-xs text-slate-400">Chọn khoa bên trái để lọc ngành</p>
                )}
              </div>
              <Button size="sm" className="shrink-0" disabled={!selectedKhoa}
                onClick={() => { setEditNganh(null); setNganhDialog(true); }}
                title={!selectedKhoa ? 'Chọn khoa trước' : 'Thêm ngành vào khoa này'}>
                <IconPlus className="h-4 w-4 mr-1" />
                Thêm ngành
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {nganhQuery.isLoading && <div className="m-4 h-40 animate-pulse rounded-lg bg-slate-100" />}
            {!nganhQuery.isLoading && filteredNganh.length === 0 ? (
              <EmptyState message={selectedKhoa ? 'Khoa này chưa có ngành học' : 'Chọn khoa ở bên trái để xem ngành'} />
            ) : (
              <table className="w-full">
                <thead className="border-b bg-slate-50">
                  <tr>
                    {['Mã ngành','Tên ngành','Thao tác'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNganh.map(n => (
                    <tr key={n.MaNganh} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-mono font-bold text-teal-700">{n.MaNganh}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{n.TenNganh}</td>
                      <td className="px-5 py-3.5">
                        <ActionButton tone="edit" icon={<IconPencil className="h-4 w-4" />} label="Sửa" onClick={() => { setEditNganh(n); setNganhDialog(true); }} />
                        <ActionButton tone="delete" icon={<IconTrash className="h-4 w-4" />} label="Xóa" onClick={() => setDeleteNganh(n)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      <KhoaDialog open={khoaDialog} onOpenChange={setKhoaDialog} editing={editKhoa} />
      <NganhDialog open={nganhDialog} onOpenChange={setNganhDialog} editing={editNganh} maKhoa={selectedKhoa?.MaKhoa ?? ''} />

      <ConfirmDialog open={!!deleteKhoa} onOpenChange={o => !o && setDeleteKhoa(null)} title="Xóa khoa"
        description={`Xóa khoa "${deleteKhoa?.TenKhoa}"?`} confirmText="Xóa"
        onConfirm={() => { if (deleteKhoa) deleteKhoaMutation.mutate(deleteKhoa.MaKhoa); }} />
      <ConfirmDialog open={!!deleteNganh} onOpenChange={o => !o && setDeleteNganh(null)} title="Xóa ngành"
        description={`Xóa ngành "${deleteNganh?.TenNganh}"?`} confirmText="Xóa"
        onConfirm={() => { if (deleteNganh) deleteNganhMutation.mutate(deleteNganh.MaNganh); }} />
    </>
  );
}
