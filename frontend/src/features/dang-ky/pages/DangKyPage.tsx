import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconEdit } from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { SinhVienSearchCard } from '../components/SinhVienSearchCard';
import { MonHocPickerTable } from '../components/MonHocPickerTable';
import {
  fetchCurrentHocKy,
  fetchMonMoChoSV,
  registerMon,
  unregisterMon,
} from '../api/dang-ky-api';
import type { SinhVien } from '@/types';

export function DangKyPage() {
  const qc = useQueryClient();
  const [selectedSV, setSelectedSV] = useState<SinhVien | null>(null);

  const hocKyQuery = useQuery({
    queryKey: ['hoc-ky', 'current'],
    queryFn: fetchCurrentHocKy,
  });

  const monMoQuery = useQuery({
    queryKey: ['dang-ky', 'mon-mo', selectedSV?.MaSV, hocKyQuery.data?.MaHK],
    queryFn: () => fetchMonMoChoSV(selectedSV!.MaSV, hocKyQuery.data!.MaHK),
    enabled: !!selectedSV && !!hocKyQuery.data,
  });

  const registerMutation = useMutation({
    mutationFn: registerMon,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dang-ky'] });
      qc.invalidateQueries({ queryKey: ['mon-hoc'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['bao-cao'] });
      toast.success('Đã đăng ký môn thành công');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Đăng ký thất bại'),
  });

  const unregisterMutation = useMutation({
    mutationFn: unregisterMon,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dang-ky'] });
      qc.invalidateQueries({ queryKey: ['mon-hoc'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['bao-cao'] });
      toast.success('Đã huỷ đăng ký');
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Huỷ thất bại'),
  });

  return (
    <>
      <PageHeader
        title="Đăng ký môn học"
        icon={<IconEdit className="h-4 w-4" />}
        iconTone="coral"
      />

      <div className="space-y-5">
        <SinhVienSearchCard selectedSV={selectedSV} onSelect={setSelectedSV} />

        {selectedSV && hocKyQuery.data && monMoQuery.data && (
          <MonHocPickerTable
            rows={monMoQuery.data}
            hocKy={hocKyQuery.data}
            onRegister={(maMH) =>
              registerMutation.mutate({
                maSV: selectedSV.MaSV,
                maHK: hocKyQuery.data!.MaHK,
                maMH,
              })
            }
            onUnregister={(maMH) =>
              unregisterMutation.mutate({
                maSV: selectedSV.MaSV,
                maHK: hocKyQuery.data!.MaHK,
                maMH,
              })
            }
            pendingMaMH={
              registerMutation.isPending || unregisterMutation.isPending
                ? (registerMutation.variables?.maMH ?? unregisterMutation.variables?.maMH ?? null)
                : null
            }
          />
        )}

        {selectedSV && monMoQuery.isLoading && (
          <div className="h-[300px] animate-pulse rounded-xl bg-slate-100" />
        )}
      </div>
    </>
  );
}
