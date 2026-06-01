import { IconChartBar } from '@tabler/icons-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { formatCompact, formatCurrencyVND } from '@/lib/format';
import type { RevenueTrendPoint } from '../mocks/bao-cao-mocks';

const PERIODS = [
  { value: '6thang',  label: '6 tháng gần nhất' },
  { value: '12thang', label: '12 tháng gần nhất' },
  { value: 'quy',     label: 'Theo quý' },
  { value: 'hocky',   label: 'Theo học kỳ' },
  { value: 'nam',     label: 'Theo năm' },
];

interface Props {
  data: RevenueTrendPoint[];
  period?: string;
  onPeriodChange?: (p: string) => void;
}

export function RevenueTrend({ data, period = '6thang', onPeriodChange }: Props) {
  const label = PERIODS.find(p => p.value === period)?.label ?? '6 tháng gần nhất';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-teal-100 text-teal-700">
              <IconChartBar className="h-3.5 w-3.5" />
            </span>
            Xu hướng doanh thu ({label.toLowerCase()})
          </CardTitle>
          {onPeriodChange && (
            <Select value={period} onValueChange={onPeriodChange}>
              <SelectTrigger className="w-48 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="h-[260px] pl-2">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Không có dữ liệu cho khoảng thời gian này
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenue-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F766E" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0F766E" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="thang"
                stroke="#64748B"
                fontSize={11}
                interval={0}
                angle={data.length > 8 ? -35 : 0}
                textAnchor={data.length > 8 ? 'end' : 'middle'}
                height={data.length > 8 ? 50 : 30}
              />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickFormatter={(v) => formatCompact(v)}
              />
              <Tooltip
                formatter={(v: number) => [formatCurrencyVND(v), 'Doanh thu']}
                contentStyle={{ border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}
              />
              <Area type="monotone" dataKey="doanhThu" stroke="#0F766E" strokeWidth={2} fill="url(#revenue-area)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
