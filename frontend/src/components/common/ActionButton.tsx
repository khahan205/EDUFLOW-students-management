import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'edit' | 'delete' | 'pay' | 'history' | 'print' | 'confirm';

const TONES: Record<Tone, string> = {
  edit:    'text-teal-700  bg-teal-50    hover:bg-teal-100',
  delete:  'text-danger    bg-danger-bg  hover:bg-red-100',
  pay:     'text-success   bg-success-bg hover:bg-emerald-100',
  history: 'text-info      bg-info-bg    hover:bg-sky-100',
  print:   'text-purple-700 bg-purple-100 hover:bg-purple-200',
  confirm: 'text-success   bg-success-bg hover:bg-emerald-100',
};

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone: Tone;
  icon: ReactNode;
  label?: string;
}

/**
 * Icon button cho các thao tác trong bảng (edit / delete / pay / print / ...).
 * 30x30, bo nhẹ, scale lên khi hover.
 */
export function ActionButton({ tone, icon, label, className, ...props }: ActionButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        'mr-1 inline-flex h-[30px] w-[30px] items-center justify-center rounded-md text-sm transition-transform hover:scale-110',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
