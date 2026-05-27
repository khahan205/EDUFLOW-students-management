import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrencyVND } from '@/lib/format';
import type { PaymentStatusBreakdown } from '@/types';

interface Props {
  data: PaymentStatusBreakdown[];
}

const TONE_MAP: Record<PaymentStatusBreakdown['status'], string> = {
  'Đã ĐT': 'bg-success',
  'Đã ĐT 1 phần': 'bg-warning',
  'Chưa ĐT': 'bg-slate-400',
};

export function PaymentStatusChart({ data }: Props) {
  const totalCount = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Trạng thái học phí</CardTitle>
      </CardHeader>
      <div>
        {data.map((d) => {
          const pct = (d.count / totalCount) * 100;
          return (
            <div key={d.status} className="border-b border-slate-100 px-5 py-3.5 last:border-b-0">
              <div className="mb-2 flex items-center justify-between text-[13px] font-medium">
                <span className="text-slate-700">{d.status}</span>
                <span className="font-mono text-[12px] text-slate-600">
                  {d.count} SV ({formatCurrencyVND(d.amount)})
                </span>
              </div>
              <Progress value={pct} indicatorClassName={TONE_MAP[d.status]} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
