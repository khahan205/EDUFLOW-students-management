import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createMonHoc, updateMonHoc } from '../api/mon-hoc-api';
import { monHocSchema, type MonHocInput } from '../schemas/mon-hoc.schema';
import type { MonHoc } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: MonHoc | null;
}

const EMPTY: MonHocInput = {
  MaMH: '',
  TenMH: '',
  MaLoaiMon: 'LT',
  SoTiet: 45,
  SoTinChi: 3,
  HocPhi: 1_500_000,
  HocKy: 'HK1',
  TenKhoa: 'CNTT',
  SiSoToiDa: 50,
};

export function MonHocFormDialog({ open, onOpenChange, editing }: Props) {
  const qc = useQueryClient();
  const isEdit = !!editing;

  const form = useForm<MonHocInput>({
    resolver: zodResolver(monHocSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) form.reset(editing ? (editing as MonHocInput) : EMPTY);
  }, [open, editing, form]);

  // QĐ2+QĐ5: Tự tính SoTinChi = SoTiet÷15 (LT) hoặc SoTiet÷30 (TH)
  //           Tự tính HocPhi = SoTinChi × 27,000đ (LT) hoặc × 37,000đ (TH)
  const calcTinChi = useCallback(() => {
    const soTiet = form.getValues('SoTiet');
    const loai   = form.getValues('MaLoaiMon');
    if (soTiet && soTiet > 0) {
      const tc = Math.max(1, Math.round(soTiet / (loai === 'TH' ? 30 : 15)));
      form.setValue('SoTinChi', tc, { shouldValidate: true });
      const donGia = loai === 'TH' ? 37_000 : 27_000;
      form.setValue('HocPhi', tc * donGia, { shouldValidate: true });
    }
  }, [form]);

  const mutation = useMutation({
    mutationFn: (input: MonHocInput) =>
      isEdit ? updateMonHoc(editing!.MaMH, input) : createMonHoc(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mon-hoc'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(isEdit ? 'Đã cập nhật môn học' : 'Đã thêm môn học mới');
      onOpenChange(false);
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Có lỗi xảy ra'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa môn học' : 'Thêm môn học mới'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="MaMH"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã môn *</FormLabel>
                    <FormControl>
                      <Input placeholder="MATH101" disabled={isEdit} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="TenMH"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên môn *</FormLabel>
                    <FormControl>
                      <Input placeholder="Toán cao cấp 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="MaLoaiMon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại môn</FormLabel>
                    <Select onValueChange={(v) => { field.onChange(v); calcTinChi(); }} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LT">Lý thuyết</SelectItem>
                        <SelectItem value="TH">Thực hành</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="HocKy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Học kỳ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HK1">HK1</SelectItem>
                        <SelectItem value="HK2">HK2</SelectItem>
                        <SelectItem value="HK3 (Hè)">HK3 (Hè)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="SoTiet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiết</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => { field.onChange(e); setTimeout(calcTinChi, 0); }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="SoTinChi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Số tín chỉ
                      <span className="ml-1 text-xs font-normal text-slate-400">(tự tính: Tiết÷15 LT, Tiết÷30 TH)</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="HocPhi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Học phí (VND)
                      <span className="ml-1 text-xs font-normal text-teal-600">— tự tính theo Tham số hệ thống</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        readOnly
                        className="bg-slate-50 cursor-not-allowed text-teal-700 font-semibold"
                        tabIndex={-1}
                      />
                    </FormControl>
                    <p className="text-xs text-slate-400">LT: SoTC × 27.000đ &nbsp;|&nbsp; TH: SoTC × 37.000đ</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="SiSoToiDa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sĩ số tối đa</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="TenKhoa"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Khoa</FormLabel>
                    <FormControl>
                      <Input placeholder="CNTT" {...field} />
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
                {mutation.isPending ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
