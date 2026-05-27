import { Badge } from '@/components/ui/badge';

type PaymentStatus = 'Chưa ĐT' | 'Đã ĐT 1 phần' | 'Đã ĐT';
type StudentStatus = 'Đang học' | 'Bảo lưu' | 'Tốt nghiệp';

interface StatusBadgeProps {
  status: PaymentStatus | StudentStatus;
}

const PAYMENT_MAP: Record<PaymentStatus, 'muted' | 'warning' | 'success'> = {
  'Chưa ĐT': 'muted',
  'Đã ĐT 1 phần': 'warning',
  'Đã ĐT': 'success',
};

const STUDENT_MAP: Record<StudentStatus, 'success' | 'warning' | 'info'> = {
  'Đang học': 'success',
  'Bảo lưu': 'warning',
  'Tốt nghiệp': 'info',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status in PAYMENT_MAP) {
    return <Badge variant={PAYMENT_MAP[status as PaymentStatus]}>{status}</Badge>;
  }
  if (status in STUDENT_MAP) {
    return <Badge variant={STUDENT_MAP[status as StudentStatus]}>{status}</Badge>;
  }
  return <Badge variant="muted">{status}</Badge>;
}
