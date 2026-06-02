import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconCash, IconBuildingBank, IconAlertTriangle } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { apiClient } from '@/services/api-client';
import { payTuition } from '../api/hoc-phi-api';
import { thuHocPhiSchema, type ThuHocPhiInput } from '../schemas/thu-hoc-phi.schema';
import { formatCurrencyVND } from '@/lib/format';
import type { ThuHocPhiRow } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: ThuHocPhiRow | null;
}

interface ThamSo { TenThamSo: string; GiaTri: string; }
interface HocKyItem { MaHK: string; TenHK: string; NamHoc: string; NgayKetThuc: string | null; }

function buildVietQRUrl(bankId: string, accountNo: string, accountName: string, amount: number, content: string) {
  const template = 'compact';
  const base = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png`;
  const params = new URLSearchParams({
    amount: String(amount),
    addInfo: content,
    accountName: accountName,
  });
  return `${base}?${params.toString()}`;
}

export function ThuHocPhiDialog({ open, onOpenChange, row }: Props) {
  const qc = useQueryClient();
  const [hinhThuc, setHinhThuc] = useState<'TIEN_MAT' | 'CHUYEN_KHOAN'>('TIEN_MAT');

  const form = useForm<ThuHocPhiInput>({
    resolver: zodResolver(thuHocPhiSchema),
    defaultValues: { soTien: 0, ghiChu: '' },
  });

  useEffect(() => {
    if (open && row) {
      form.reset({ soTien: row.ConLai, ghiChu: '' });
      setHinhThuc('TIEN_MAT');
    }
  }, [open, row, form]);

  const thamSoQuery = useQuery({
    queryKey: ['tham-so'],
    queryFn: async () => {
      const { data } = await apiClient.get<ThamSo[]>('/master-data/tham-so');
      return data;
    },
    staleTime: 300_000,
    enabled: open,
  });

  // Kiểm tra thời hạn đóng học phí của học kỳ (QĐ6)
  const hocKyQuery = useQuery({
    queryKey: ['hoc-ky-list'],
    queryFn: async () => {
      const { data } = await apiClient.get<HocKyItem[]>('/master-data/hoc-ky');
      return data;
    },
    staleTime: 300_000,
    enabled: open && !!row,
  });
  const currentHK = hocKyQuery.data?.find((hk) => hk.MaHK === row?.MaHK);
  const deadlineDate = currentHK?.NgayKetThuc ? new Date(currentHK.NgayKetThuc) : null;
  const isDeadlinePassed = deadlineDate ? new Date() > deadlineDate : false;

  const thamSoMap = Object.fromEntries(
    (thamSoQuery.data ?? []).map((t) => [t.TenThamSo, t.GiaTri])
  );
  const bankId      = thamSoMap['ngan_hang_ma_vietqr'] ?? 'VCB';
  const accountNo   = thamSoMap['ngan_hang_so_tk']     ?? '1234567890';
  const accountName = thamSoMap['ngan_hang_chu_tk']    ?? 'TRUONG UIT';
  const bankName    = thamSoMap['ngan_hang_ten']        ?? 'Vietcombank';
  const minCK       = Number(thamSoMap['chuyen_khoan_so_tien_toi_thieu'] ?? 1000);

  const soTienWatch = form.watch('soTien');

  const qrUrl = hinhThuc === 'CHUYEN_KHOAN' && row && soTienWatch >= minCK
    ? buildVietQRUrl(bankId, accountNo, accountName, soTienWatch, `HOCPHI ${row.MaSV} ${row.MaHK}`)
    : null;

  const mutation = useMutation({
    mutationFn: (input: ThuHocPhiInput) => {
      if (!row) throw new Error('Missing row');
      return payTuition({
        maSV: row.MaSV,
        maHK: row.MaHK,
        soTien: input.soTien,
        ghiChu: input.ghiChu,
        hinhThucTT: hinhThuc,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hoc-phi'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['bao-cao'] });
      toast.success('Đã lập phiếu thu thành công');
      onOpenChange(false);
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Thu thất bại'),
  });

  if (!row) return null;

  const isBankTransfer = hinhThuc === 'CHUYEN_KHOAN';
  const amountTooSmall = isBankTransfer && soTienWatch < minCK;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconCash className="h-5 w-5 text-success" />
            Thu học phí — {row.TenSV}
          </DialogTitle>
        </DialogHeader>

        {/* Cảnh báo quá hạn đóng học phí (QĐ6) */}
        {isDeadlinePassed && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <IconAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Đã quá thời hạn đóng học phí</p>
              <p className="mt-0.5 text-xs text-red-600">
                Hạn chót: {deadlineDate!.toLocaleDateString('vi-VN')} — Không thể thu học phí sau thời hạn quy định.
              </p>
            </div>
          </div>
        )}

        {/* Tóm tắt số tiền */}
        <div className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Tổng</p>
            <p className="font-mono font-semibold text-slate-900">{formatCurrencyVND(row.Tong)}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Đã đóng</p>
            <p className="font-mono font-semibold text-success">{formatCurrencyVND(row.DaDong)}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Còn lại</p>
            <p className="font-mono font-semibold text-danger">{formatCurrencyVND(row.ConLai)}</p>
          </div>
        </div>

        {/* Hình thức thanh toán */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Hình thức thanh toán</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setHinhThuc('TIEN_MAT')}
              className={`flex items-center gap-2.5 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                hinhThuc === 'TIEN_MAT'
                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <IconCash className="h-5 w-5 shrink-0" />
              Tiền mặt
            </button>
            <button
              type="button"
              onClick={() => setHinhThuc('CHUYEN_KHOAN')}
              className={`flex items-center gap-2.5 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                hinhThuc === 'CHUYEN_KHOAN'
                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <IconBuildingBank className="h-5 w-5 shrink-0" />
              Chuyển khoản
            </button>
          </div>
        </div>

        {/* Thông tin chuyển khoản + QR */}
        {isBankTransfer && (
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-1 text-sm">
                <p className="font-semibold text-teal-800">{bankName}</p>
                <p><span className="text-slate-500">Số TK:</span> <span className="font-mono font-semibold">{accountNo}</span></p>
                <p><span className="text-slate-500">Chủ TK:</span> <span className="font-medium">{accountName}</span></p>
                <p><span className="text-slate-500">Nội dung:</span> <span className="font-mono text-xs">HOCPHI {row.MaSV} {row.MaHK}</span></p>
                {amountTooSmall && (
                  <p className="text-xs text-red-600 font-medium">
                    ⚠ Số tiền tối thiểu chuyển khoản: {formatCurrencyVND(minCK)}
                  </p>
                )}
              </div>
              {qrUrl && (
                <div className="shrink-0">
                  <img
                    src={qrUrl}
                    alt="QR chuyển khoản"
                    className="h-28 w-28 rounded-lg border border-teal-200"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <p className="mt-1 text-center text-[10px] text-slate-400">Quét để CK</p>
                </div>
              )}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
            <FormField
              control={form.control}
              name="soTien"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền thu lần này (VND)</FormLabel>
                  <FormControl>
                    <Input type="number" min={isBankTransfer ? minCK : 1} max={row.ConLai} step={1} {...field} />
                  </FormControl>
                  <p className="text-[11.5px] text-slate-500">
                    Tối đa: {formatCurrencyVND(row.ConLai)}
                    {isBankTransfer && ` · Tối thiểu CK: ${formatCurrencyVND(minCK)}`}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ghiChu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Input placeholder="(không bắt buộc)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Huỷ
              </Button>
              <Button
                type="submit"
                variant="success"
                disabled={mutation.isPending || amountTooSmall || isDeadlinePassed}
                title={isDeadlinePassed ? `Quá hạn đóng HP: ${deadlineDate!.toLocaleDateString('vi-VN')}` : undefined}
              >
                {mutation.isPending ? 'Đang thu...' : 'Xác nhận thu'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
