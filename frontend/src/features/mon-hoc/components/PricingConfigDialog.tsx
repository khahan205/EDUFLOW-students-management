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
      donGiaTinChi: 0,
      heSoLT: 1,
      heSoTH: 1.5,
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
      toast.success('Đã lưu cấu hình giá');
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
            <FormField
              control={form.control}
              name="donGiaTinChi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn giá / tín chỉ (VND)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={10_000} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="heSoLT"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hệ số LT</FormLabel>
                    <FormControl>
                      <Input type="number" step={0.1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heSoTH"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hệ số TH</FormLabel>
                    <FormControl>
                      <Input type="number" step={0.1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tiLeMienGiamTopDau"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Miễn giảm top đầu (0-1)</FormLabel>
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
                    <FormLabel>Miễn giảm vùng sâu (0-1)</FormLabel>
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
