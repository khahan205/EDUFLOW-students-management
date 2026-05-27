import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCompact, formatCurrencyVND } from '@/lib/format';
import type { RevenueTrendPoint } from '../mocks/bao-cao-mocks';

interface Props {
  data: RevenueTrendPoint[];
}

export function RevenueTrend({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Xu hướng doanh thu (6 tháng gần nhất)</CardTitle>
      </CardHeader>
      <CardContent className="h-[260px] pl-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revenue-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F766E" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#0F766E" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="thang" stroke="#64748B" fontSize={12} />
            <YAxis
              stroke="#64748B"
              fontSize={12}
              tickFormatter={(v) => formatCompact(v)}
            />
            <Tooltip
              formatter={(v: number) => [formatCurrencyVND(v), 'Doanh thu']}
              contentStyle={{
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
              }}
            />
            <Area
              type="monotone"
              dataKey="doanhThu"
              stroke="#0F766E"
              strokeWidth={2}
              fill="url(#revenue-area)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
