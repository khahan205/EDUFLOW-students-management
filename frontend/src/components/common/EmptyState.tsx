import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  message: string;
  /** Nội dung phụ (nút, link...) */
  children?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, message, children, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-12 text-center', className)}>
      {icon && <div className="text-3xl text-slate-300">{icon}</div>}
      <p className="text-sm text-slate-400">{message}</p>
      {children}
    </div>
  );
}
