import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconCheck, IconX, IconClock } from '@tabler/icons-react';
import { toast } from 'sonner';
import { apiClient } from '@/services/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/common/EmptyState';

interface DonGiaHanRow {
  MaDon: number; MaSV: string; TenSV: string; TenLop: string | null;
  MaHK: string; TenHK: string; NamHoc: string;
  LyDo: string; TrangThai: string;
  NgayNop: string; NgayXuLy: string | null; NgayGiaHan: string | null;
  GhiChuAdmin: string;
}

const STATUS_BADGE: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' }> = {
  CHO_DUYET: { label: 'Chờ duyệt', variant: 'warning' },
  DA_DUYET:  { label: 'Đã duyệt', variant: 'success' },
  TU_CHOI:   { label: 'Từ chối', variant: 'danger' },
};


function DuyetDialog({ don, onClose }: { don: DonGiaHanRow | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [ngayGiaHan, setNgayGiaHan] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [action, setAction] = useState<'duyet' | 'tu-choi' | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      action === 'duyet'
        ? apiClient.put(`/don-gia-han/${don!.MaDon}/duyet`, { ngayGiaHan, ghiChu })
        : apiClient.put(`/don-gia-han/${don!.MaDon}/tu-choi`, { ghiChu }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['don-gia-han'] });
      toast.success(action === 'duyet' ? 'Đã duyệt đơn gia hạn' : 'Đã từ chối đơn');
      onClose();
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Xử lý thất bại'),
  });

  if (!don) return null;

  return (
    <Dialog open={!!don} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xử lý đơn gia hạn — {don.TenSV}</DialogTitle>
          <p className="text-sm text-slate-500">{don.TenHK} {don.NamHoc} · Mã SV: {don.MaSV}</p>
        </DialogHeader>

        <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Lý do sinh viên:</p>
          <p className="text-slate-700">{don.LyDo}</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Ngày gia hạn (nếu duyệt)</Label>
            <Input type="date" value={ngayGiaHan} onChange={(e) => setNgayGiaHan(e.target.value)} />
            <p className="text-xs text-slate-400">Hạn đóng học phí mới sẽ được cập nhật tự động</p>
          </div>
          <div className="space-y-1.5">
            <Label>Ghi chú của cán bộ</Label>
            <Input placeholder="(không bắt buộc)" value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          <Button
            variant="ghost"
            className="text-red-600 hover:bg-red-50"
            disabled={mutation.isPending}
            onClick={() => { setAction('tu-choi'); mutation.mutate(); }}
          >
            <IconX className="h-4 w-4" />
            Từ chối
          </Button>
          <Button
            disabled={!ngayGiaHan || mutation.isPending}
            onClick={() => { setAction('duyet'); mutation.mutate(); }}
          >
            <IconCheck className="h-4 w-4" />
            Duyệt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DonGiaHanTab() {
  const [filterTrangThai, setFilterTrangThai] = useState('CHO_DUYET');
  const [selectedDon, setSelectedDon] = useState<DonGiaHanRow | null>(null);

  const query = useQuery({
    queryKey: ['don-gia-han', filterTrangThai],
    queryFn: async () => {
      const { data } = await apiClient.get<DonGiaHanRow[]>('/don-gia-han', {
        params: filterTrangThai !== 'TAT_CA' ? { trangThai: filterTrangThai } : {},
      });
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center gap-3 pt-4 pb-4">
          <Select value={filterTrangThai} onValueChange={setFilterTrangThai}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CHO_DUYET">Chờ duyệt</SelectItem>
              <SelectItem value="DA_DUYET">Đã duyệt</SelectItem>
              <SelectItem value="TU_CHOI">Từ chối</SelectItem>
              <SelectItem value="TAT_CA">Tất cả</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-slate-500">
            Danh sách sinh viên xin gia hạn nộp học phí
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {query.isLoading && <div className="m-4 h-48 animate-pulse rounded-lg bg-slate-100" />}
          {!query.isLoading && (query.data ?? []).length === 0 ? (
            <EmptyState message="Không có đơn gia hạn nào" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã SV</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Học kỳ</TableHead>
                  <TableHead>Ngày nộp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày gia hạn</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(query.data ?? []).map((don) => {
                  const s = STATUS_BADGE[don.TrangThai] ?? { label: don.TrangThai, variant: 'muted' as const };
                  return (
                    <TableRow key={don.MaDon}>
                      <TableCell className="font-mono font-semibold">{don.MaSV}</TableCell>
                      <TableCell>
                        <p className="font-medium">{don.TenSV}</p>
                        {don.TenLop && <p className="text-xs text-slate-400">{don.TenLop}</p>}
                      </TableCell>
                      <TableCell className="text-slate-500">{don.TenHK} {don.NamHoc}</TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(don.NgayNop).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {don.NgayGiaHan
                          ? <span className="font-medium text-teal-700">{new Date(don.NgayGiaHan).toLocaleDateString('vi-VN')}</span>
                          : <span className="text-slate-400">—</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        {don.TrangThai === 'CHO_DUYET' ? (
                          <Button size="sm" onClick={() => setSelectedDon(don)}>
                            <IconClock className="h-4 w-4" />
                            Xử lý
                          </Button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedDon(don)}
                            className="text-xs text-teal-600 underline hover:text-teal-800"
                          >
                            Chi tiết
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DuyetDialog don={selectedDon} onClose={() => setSelectedDon(null)} />
    </div>
  );
}
