import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'info' | 'teal' | 'coral' | 'success' | 'danger';

interface StatCardProps {
  label: string;
  value: string | number;
  /** Icon hiển thị trong khung bo tròn (mở rộng từ Tabler) */
  icon: ReactNode;
  tone: Tone;
  /** Để bật style "tiền tệ" — chữ số to hơi nhỏ + màu success */
  isMoney?: boolean;
}

const BORDER: Record<Tone, string> = {
  info:    'border-info',
  teal:    'border-teal-500',
  coral:   'border-coral-500',
  success: 'border-success',
  danger:  'border-danger',
};

const ICON_BG: Record<Tone, string> = {
  info:    'bg-info-bg text-info',
  teal:    'bg-teal-50 text-teal-700',
  coral:   'bg-coral-50 text-coral-600',
  success: 'bg-success-bg text-success',
  danger:  'bg-danger-bg text-danger',
};

export function StatCard({ label, value, icon, tone, isMoney = false }: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border-[1.5px] bg-white px-5 py-4 shadow-soft transition-all',
        'hover:-translate-y-0.5 hover:shadow-lifted',
        BORDER[tone],
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div
          className={cn(
            'grid h-[38px] w-[38px] place-items-center rounded-lg text-lg',
            ICON_BG[tone],
          )}
        >
          {icon}
        </div>
      </div>
      <div
        className={cn(
          'mt-2.5 font-bold leading-tight tracking-tight text-slate-900',
          isMoney ? 'text-[22px] text-success' : 'text-[28px]',
        )}
      >
        {value}
      </div>
    </div>
  );
}
