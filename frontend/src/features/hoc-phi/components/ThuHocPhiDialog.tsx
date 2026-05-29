import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconCash } from '@tabler/icons-react';
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
import { payTuition } from '../api/hoc-phi-api';
import { thuHocPhiSchema, type ThuHocPhiInput } from '../schemas/thu-hoc-phi.schema';
import { formatCurrencyVND } from '@/lib/format';
import type { ThuHocPhiRow } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: ThuHocPhiRow | null;
}

export function ThuHocPhiDialog({ open, onOpenChange, row }: Props) {
  const qc = useQueryClient();

  const form = useForm<ThuHocPhiInput>({
    resolver: zodResolver(thuHocPhiSchema),
    defaultValues: { soTien: 0, ghiChu: '' },
  });

  useEffect(() => {
    if (open && row) {
      form.reset({ soTien: row.ConLai, ghiChu: '' });
    }
  }, [open, row, form]);

  const mutation = useMutation({
    mutationFn: (input: ThuHocPhiInput) => {
      if (!row) throw new Error('Missing row');
      return payTuition({ maSV: row.MaSV, maHK: row.MaHK, soTien: input.soTien, ghiChu: input.ghiChu });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconCash className="h-5 w-5 text-success" />
            Thu học phí — {row.TenSV}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Tổng</div>
            <div className="font-mono font-semibold text-slate-900">{formatCurrencyVND(row.Tong)}</div>
          </div>
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Đã đóng</div>
            <div className="font-mono font-semibold text-success">{formatCurrencyVND(row.DaDong)}</div>
          </div>
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Còn lại</div>
            <div className="font-mono font-semibold text-danger">{formatCurrencyVND(row.ConLai)}</div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
            <FormField
              control={form.control}
              name="soTien"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền thu lần này (VND)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={row.ConLai} step={100_000} {...field} />
                  </FormControl>
                  <p className="text-[11.5px] text-slate-500">
                    Tối đa: {formatCurrencyVND(row.ConLai)} (không được thu vượt số nợ)
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
              <Button type="submit" variant="success" disabled={mutation.isPending}>
                {mutation.isPending ? 'Đang thu...' : 'Xác nhận thu'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
