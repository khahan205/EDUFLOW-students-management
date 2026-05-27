import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconSearch, IconUserCircle } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
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
import { StatusBadge } from '@/components/common/StatusBadge';
import { fetchSinhVienByMa } from '../api/dang-ky-api';
import { dangKySearchSchema, type DangKySearchInput } from '../schemas/dang-ky.schema';
import type { SinhVien } from '@/types';

interface Props {
  selectedSV: SinhVien | null;
  onSelect: (sv: SinhVien | null) => void;
}

export function SinhVienSearchCard({ selectedSV, onSelect }: Props) {
  const [searching, setSearching] = useState(false);

  const form = useForm<DangKySearchInput>({
    resolver: zodResolver(dangKySearchSchema),
    defaultValues: { maSV: '' },
  });

  const onSubmit = async (values: DangKySearchInput) => {
    setSearching(true);
    try {
      const sv = await fetchSinhVienByMa(values.maSV.trim().toUpperCase());
      onSelect(sv);
      toast.success(`Tìm thấy: ${sv.TenSV}`);
    } catch (err) {
      const message = (err as { message?: string })?.message ?? 'Tìm thất bại';
      toast.error(message);
      onSelect(null);
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    onSelect(null);
    form.reset({ maSV: '' });
  };

  return (
    <Card>
      <CardContent className="py-5">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-3 md:flex-row md:items-end"
          >
            <FormField
              control={form.control}
              name="maSV"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Mã sinh viên</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Nhập mã SV (vd: S001, SV002)..."
                        autoFocus
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={searching}>
                <IconSearch className="h-4 w-4" />
                {searching ? 'Đang tìm...' : 'Tìm SV'}
              </Button>
              {selectedSV && (
                <Button type="button" variant="outline" onClick={handleClear}>
                  Xoá
                </Button>
              )}
            </div>
          </form>
        </Form>

        {selectedSV && (
          <div className="mt-5 flex flex-col items-start gap-4 rounded-lg border border-teal-200 bg-teal-50/50 p-4 md:flex-row md:items-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-teal-700 text-white">
              <IconUserCircle className="h-7 w-7" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-1 text-[13px] md:grid-cols-4">
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Mã SV</div>
                <div className="font-mono font-semibold text-slate-900">{selectedSV.MaSV}</div>
              </div>
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Họ tên</div>
                <div className="font-semibold text-slate-900">{selectedSV.TenSV}</div>
              </div>
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Lớp / Khoa</div>
                <div className="text-slate-700">
                  {selectedSV.TenLop ?? '—'} / {selectedSV.MaNganh === 'NG_CNTT' ? 'CNTT' : selectedSV.MaNganh ?? '—'}
                </div>
              </div>
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Trạng thái</div>
                <StatusBadge status={selectedSV.TrangThai ?? 'Đang học'} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
