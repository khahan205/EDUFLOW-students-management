import { useState, useMemo } from 'react';

type Direction = 'asc' | 'desc';

interface SortConfig {
  key: string;
  direction: Direction;
}

export function useTableSort<T extends Record<string, unknown>>(data: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const sorted = useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const av = a[sortConfig.key];
      const bv = b[sortConfig.key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = String(av).localeCompare(String(bv), 'vi', { numeric: true });
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [data, sortConfig]);

  function requestSort(key: string) {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc'
          ? { key, direction: 'desc' }
          : null; // third click clears sort
      }
      return { key, direction: 'asc' };
    });
  }

  return { sorted, sortConfig, requestSort };
}
