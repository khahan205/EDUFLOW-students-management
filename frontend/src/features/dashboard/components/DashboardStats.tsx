import {
  IconUsers,
  IconBook2,
  IconEdit,
  IconCashBanknote,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { StatCard } from '@/components/common/StatCard';
import { formatCurrencyVND } from '@/lib/format';
import type { DashboardStats as DashboardStatsType } from '@/types';

interface Props {
  stats: DashboardStatsType;
}

export function DashboardStats({ stats }: Props) {
  return (
    <div className="mb-7 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
      <StatCard
        label="Sinh viên đang học"
        value={stats.sinhVienDangHoc}
        tone="info"
        icon={<IconUsers className="h-[18px] w-[18px]" />}
      />
      <StatCard
        label="Môn học đang mở"
        value={stats.monHocDangMo}
        tone="teal"
        icon={<IconBook2 className="h-[18px] w-[18px]" />}
      />
      <StatCard
        label="Đăng ký hiện tại"
        value={stats.dangKyHienTai}
        tone="coral"
        icon={<IconEdit className="h-[18px] w-[18px]" />}
      />
      <StatCard
        label="Doanh thu (đã thu)"
        value={formatCurrencyVND(stats.doanhThuDaThu)}
        tone="success"
        isMoney
        icon={<IconCashBanknote className="h-[18px] w-[18px]" />}
      />
      <StatCard
        label="Công nợ quá hạn"
        value={stats.congNoQuaHan}
        tone="danger"
        icon={<IconAlertTriangle className="h-[18px] w-[18px]" />}
      />
    </div>
  );
}
