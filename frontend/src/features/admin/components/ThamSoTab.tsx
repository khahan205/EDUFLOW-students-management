import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconPencil, IconCheck, IconX } from '@tabler/icons-react';
import { toast } from 'sonner';
import { apiClient } from '@/services/api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ThamSo {
  TenThamSo: string;
  GiaTri: string;
  KieuDuLieu: string;
  MoTa: string;
}

const LABELS: Record<string, string> = {
  don_gia_tin_chi:                  'Đơn giá / tín chỉ (đ)',
  he_so_lt:                         'Hệ số môn Lý thuyết',
  he_so_th:                         'Hệ số môn Thực hành',
  ti_le_mien_giam_top_dau:          'Tỉ lệ miễn giảm — Học lực xuất sắc',
  ti_le_mien_giam_vung_sau_xa:      'Tỉ lệ miễn giảm — Vùng sâu vùng xa',
  si_so_toi_da_mac_dinh:            'Sĩ số tối đa mặc định (mỗi lớp)',
  ngan_hang_ten:                    'Ngân hàng nhận học phí',
  ngan_hang_ma_vietqr:              'Mã ngân hàng VietQR',
  ngan_hang_so_tk:                  'Số tài khoản',
  ngan_hang_chu_tk:                 'Chủ tài khoản',
  chuyen_khoan_so_tien_toi_thieu:   'Số tiền tối thiểu chuyển khoản (đ)',
};

function ThamSoRow({ ts }: { ts: ThamSo }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(ts.GiaTri);

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.put(`/master-data/tham-so/${ts.TenThamSo}`, { giaTri: val }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tham-so'] });
      toast.success('Đã cập nhật tham số');
      setEditing(false);
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Cập nhật thất bại'),
  });

  const handleCancel = () => {
    setVal(ts.GiaTri);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-800">{LABELS[ts.TenThamSo] ?? ts.TenThamSo}</p>
        <p className="text-xs text-slate-400">{ts.MoTa}</p>
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-36 text-right"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') mutation.mutate();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            <IconCheck className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <IconX className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="font-mono font-semibold text-teal-700">
            {ts.KieuDuLieu === 'number' && Number(ts.GiaTri) > 1000
              ? Number(ts.GiaTri).toLocaleString('vi-VN') + 'đ'
              : ts.GiaTri}
          </span>
          <Button size="sm" variant="ghost" onClick={() => { setVal(ts.GiaTri); setEditing(true); }}>
            <IconPencil className="h-4 w-4" />
          </Button>
        </div>
      )}
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
      </CardContent>
    </Card>
  );
}
