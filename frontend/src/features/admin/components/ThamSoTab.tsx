import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconPencil, IconCheck, IconX, IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import { apiClient } from '@/services/api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ThamSo {
  TenThamSo: string;
  GiaTri: string;
  KieuDuLieu: string;
  MoTa: string;
}

const LABELS: Record<string, string> = {
  don_gia_tin_chi_ly_thuyet:        'Đơn giá / TC môn Lý thuyết (đ)',
  don_gia_tin_chi_thuc_hanh:        'Đơn giá / TC môn Thực hành (đ)',
  ti_le_mien_giam_top_dau:          'Tỉ lệ miễn giảm — Học lực xuất sắc',
  ti_le_mien_giam_vung_sau_xa:      'Tỉ lệ miễn giảm — Vùng sâu vùng xa',
  si_so_toi_da_mac_dinh:            'Sĩ số tối đa mặc định (mỗi lớp)',
  ngan_hang_ten:                    'Ngân hàng nhận học phí',
  ngan_hang_ma_vietqr:              'Mã ngân hàng VietQR',
  ngan_hang_so_tk:                  'Số tài khoản',
  ngan_hang_chu_tk:                 'Chủ tài khoản',
  chuyen_khoan_so_tien_toi_thieu:   'Số tiền tối thiểu chuyển khoản (đ)',
  so_lop_toi_da_gv_per_hk:          'Số lớp tối đa mỗi GV được dạy trong 1 học kỳ',
};

function ThamSoRow({ ts }: { ts: ThamSo }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(ts.GiaTri);

  const updateMutation = useMutation({
    mutationFn: () => apiClient.put(`/master-data/tham-so/${ts.TenThamSo}`, { giaTri: val }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tham-so'] }); toast.success('Đã cập nhật'); setEditing(false); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Cập nhật thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/master-data/tham-so/${ts.TenThamSo}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tham-so'] }); toast.success('Đã xóa tham số'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Xóa thất bại'),
  });

  const handleCancel = () => { setVal(ts.GiaTri); setEditing(false); };

  return (
    <div className="flex items-center justify-between gap-4 border-b py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-800">{LABELS[ts.TenThamSo] ?? ts.TenThamSo}</p>
        <p className="text-xs text-slate-400">{ts.MoTa || <span className="font-mono">{ts.TenThamSo}</span>}</p>
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <Input value={val} onChange={(e) => setVal(e.target.value)} className="w-40 text-right" autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') updateMutation.mutate(); if (e.key === 'Escape') handleCancel(); }} />
          <Button size="sm" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate()}>
            <IconCheck className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}><IconX className="h-4 w-4" /></Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-teal-700">
            {ts.KieuDuLieu === 'number' && Number(ts.GiaTri) > 1000
              ? Number(ts.GiaTri).toLocaleString('vi-VN') + 'đ'
              : ts.GiaTri}
          </span>
          <Button size="sm" variant="ghost" onClick={() => { setVal(ts.GiaTri); setEditing(true); }}>
            <IconPencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600"
            disabled={deleteMutation.isPending}
            onClick={() => { if (confirm(`Xóa tham số "${ts.TenThamSo}"?`)) deleteMutation.mutate(); }}>
            <IconTrash className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function ThemThamSoForm() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tenThamSo: '', giaTri: '', kieuDuLieu: 'string', moTa: '' });

  const mutation = useMutation({
    mutationFn: () => apiClient.post('/master-data/tham-so', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tham-so'] });
      toast.success('Đã thêm tham số mới');
      setForm({ tenThamSo: '', giaTri: '', kieuDuLieu: 'string', moTa: '' });
      setOpen(false);
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Thêm thất bại'),
  });

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="mt-2" onClick={() => setOpen(true)}>
        <IconPlus className="h-4 w-4 mr-1" /> Thêm tham số mới
      </Button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-dashed border-teal-300 bg-teal-50 p-4 space-y-3">
      <p className="text-sm font-semibold text-teal-700">Thêm tham số mới</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Tên tham số (key)</p>
          <Input placeholder="vd: gio_hoc_toi_da" value={form.tenThamSo}
            onChange={(e) => setForm(f => ({ ...f, tenThamSo: e.target.value.toLowerCase().replace(/\s+/g, '_') }))} />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Giá trị</p>
          <Input placeholder="vd: 30" value={form.giaTri}
            onChange={(e) => setForm(f => ({ ...f, giaTri: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Kiểu dữ liệu</p>
          <Select value={form.kieuDuLieu} onValueChange={(v) => setForm(f => ({ ...f, kieuDuLieu: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Số (number)</SelectItem>
              <SelectItem value="string">Văn bản (string)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Mô tả</p>
          <Input placeholder="vd: Số giờ học tối đa mỗi tuần" value={form.moTa}
            onChange={(e) => setForm(f => ({ ...f, moTa: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" disabled={!form.tenThamSo || !form.giaTri || mutation.isPending} onClick={() => mutation.mutate()}>
          <IconCheck className="h-4 w-4 mr-1" /> Lưu
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          <IconX className="h-4 w-4 mr-1" /> Huỷ
        </Button>
      </div>
    </div>
  );
}

export function ThamSoTab() {
  const query = useQuery({
    queryKey: ['tham-so'],
    queryFn: async () => {
      const { data } = await apiClient.get<ThamSo[]>('/master-data/tham-so');
      return data;
    },
  });

  return (
    <Card>
      <CardContent className="pt-4">
        <p className="mb-4 text-sm text-slate-500">
          Thay đổi các tham số cấu hình hệ thống. Mỗi thay đổi có hiệu lực ngay lập tức với các phiếu mới tạo.
        </p>
        {query.isLoading && <div className="h-48 animate-pulse rounded-lg bg-slate-100" />}
        {(query.data ?? []).map((ts) => (
          <ThamSoRow key={ts.TenThamSo} ts={ts} />
        ))}
        <ThemThamSoForm />
      </CardContent>
    </Card>
  );
}
