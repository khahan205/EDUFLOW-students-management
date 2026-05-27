import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  /** Icon hiển thị trong khung bo tròn cạnh title */
  icon?: ReactNode;
  /** Tông màu cho icon container */
  iconTone?: 'info' | 'teal' | 'coral' | 'success' | 'danger' | 'purple';
  /** Nút/actions hiển thị ở phía phải */
  actions?: ReactNode;
}

const ICON_TONES = {
  info:    'bg-info-bg text-info-fg',
  teal:    'bg-teal-50 text-teal-700',
  coral:   'bg-coral-50 text-coral-600',
  success: 'bg-success-bg text-success-fg',
  danger:  'bg-danger-bg text-danger-fg',
  purple:  'bg-purple-100 text-purple-700',
} as const;

export function PageHeader({ title, icon, iconTone = 'teal', actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-slate-900">
        {icon && (
          <span
            className={cn(
              'grid h-8 w-8 place-items-center rounded-lg text-base',
              ICON_TONES[iconTone],
            )}
          >
            {icon}
          </span>
        )}
        {title}
      </h1>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
