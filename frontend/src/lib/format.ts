/**
 * Vietnamese-locale formatting helpers.
 */

export function formatCurrencyVND(amount: number, opts?: { showSymbol?: boolean }) {
  const showSymbol = opts?.showSymbol ?? true;
  const formatted = new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(amount);
  return showSymbol ? `${formatted}đ` : formatted;
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n);
}

export function formatDate(d: string | Date, withTime = false) {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '—';
  const opts: Intl.DateTimeFormatOptions = withTime
    ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Intl.DateTimeFormat('vi-VN', opts).format(date);
}

export function formatPercent(n: number, fractionDigits = 0) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n);
}

/** Compact for stat cards: 15.5M, 1.2K */
export function formatCompact(n: number) {
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}
