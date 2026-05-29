import * as XLSX from 'xlsx';

interface ColumnDef<T> {
  header: string;
  key: keyof T;
  format?: (val: T[keyof T], row: T) => string | number;
}

export function exportToExcel<T extends object>(
  rows: T[],
  columns: ColumnDef<T>[],
  filename: string,
) {
  const wsData = [
    columns.map((c) => c.header),
    ...rows.map((row) =>
      columns.map((c) => {
        const val = (row as Record<string, unknown>)[c.key as string];
        return c.format ? c.format(val as T[keyof T], row) : (val ?? '');
      }),
    ),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}
