import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { fetchPricingConfig, updatePricingConfig } from '../api/mon-hoc-api';
import { pricingConfigSchema, type PricingConfigInput } from '../schemas/mon-hoc.schema';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PricingConfigDialog({ open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const configQuery = useQuery({
    queryKey: ['pricing-config'],
    queryFn: fetchPricingConfig,
    enabled: open,
  });

  const form = useForm<PricingConfigInput>({
    resolver: zodResolver(pricingConfigSchema),
    defaultValues: {
      donGiaLT: 27000,
      donGiaTH: 37000,
      tiLeMienGiamTopDau: 0.5,
      tiLeMienGiamVungSauVungXa: 0.3,
    },
  });

  useEffect(() => {
    if (configQuery.data) form.reset(configQuery.data);
  }, [configQuery.data, form]);

  const mutation = useMutation({
    mutationFn: updatePricingConfig,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pricing-config'] });
      qc.invalidateQueries({ queryKey: ['mon-hoc'] }); // sync lại giá môn học
      toast.success('Đã lưu cấu hình giá — giá các môn học đã được cập nhật tự động');
      onOpenChange(false);
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Lưu thất bại'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cấu hình giá học phí</DialogTitle>
          <DialogDescription>
            Các tham số sẽ áp dụng cho mọi tính toán học phí mới. Không ảnh hưởng đến các phiếu đã lập.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Đơn giá học phí (QĐ5)</p>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="donGiaLT"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn giá Lý Thuyết / TC (VND)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={1_000} {...field} />
                    </FormControl>
                    <p className="text-xs text-slate-400">Mặc định: 27.000đ/TC</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="donGiaTH"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn giá Thực Hành / TC (VND)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={1_000} {...field} />
                    </FormControl>
                    <p className="text-xs text-slate-400">Mặc định: 37.000đ/TC</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 pt-1">Tỉ lệ miễn giảm</p>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="tiLeMienGiamTopDau"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Miễn giảm top đầu (0–1)</FormLabel>
                    <FormControl>
                      <Input type="number" step={0.05} min={0} max={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tiLeMienGiamVungSauVungXa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Miễn giảm vùng sâu (0–1)</FormLabel>
                    <FormControl>
                      <Input type="number" step={0.05} min={0} max={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Huỷ
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                Lưu cấu hình
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
