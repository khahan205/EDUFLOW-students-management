import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IconCashBanknote, IconFileSpreadsheet } from '@tabler/icons-react';
import { useReactToPrint } from 'react-to-print';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { exportToExcel } from '@/lib/export-excel';
import { fetchHocPhiRows, fetchPaymentHistory } from '../api/hoc-phi-api';
import { HocPhiTable } from '../components/HocPhiTable';
import { ThuHocPhiDialog } from '../components/ThuHocPhiDialog';
import { PhieuThuHistoryDialog } from '../components/PhieuThuHistoryDialog';
import { PhieuThuPrintView } from '../components/PhieuThuPrintView';
import type { ThuHocPhiRow, PhieuThu } from '@/types';

export function HocPhiPage() {
  const [payOpen, setPayOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<ThuHocPhiRow | null>(null);
  const [printReceipts, setPrintReceipts] = useState<PhieuThu[]>([]);
  const [search, setSearch] = useState('');
  const [filterHK, setFilterHK] = useState('');

  const printRef = useRef<HTMLDivElement>(null);

  const listQuery = useQuery({ queryKey: ['hoc-phi'], queryFn: fetchHocPhiRows });

  const filtered = useMemo(() => {
    if (!listQuery.data) return [];
    const q = search.toLowerCase();
    return listQuery.data.filter(
      (r) =>
        (!q || r.MaSV.toLowerCase().includes(q) || r.TenSV.toLowerCase().includes(q)) &&
        (!filterHK || r.MaHK === filterHK),
    );
  }, [listQuery.data, search, filterHK]);

  const hocKyList = useMemo(
    () => [...new Set((listQuery.data ?? []).map((r) => r.MaHK))],
    [listQuery.data],
  );

  const handlePrint = useReactToPrint({ contentRef: printRef });

  const handlePrintRow = async (row: ThuHocPhiRow) => {
    setActiveRow(row);
    try {
      const receipts = await fetchPaymentHistory(row.MaSV, row.MaHK);
      setPrintReceipts(receipts);
      setTimeout(() => handlePrint(), 100);
    } catch {
      setPrintReceipts([]);
      handlePrint();
    }
  };

  const handleExport = () => {
    exportToExcel(
      filtered,
      [
        { header: 'Mã SV', key: 'MaSV' },
        { header: 'Họ tên', key: 'TenSV' },
        { header: 'Học kỳ', key: 'TenHK' },
        { header: 'Tổng', key: 'Tong' },
        { header: 'Đã đóng', key: 'DaDong' },
        { header: 'Còn lại', key: 'ConLai' },
        { header: 'Trạng thái', key: 'TrangThai' },
      ],
      'hoc-phi',
    );
  };

  return (
    <>
      <PageHeader
        title="Thu học phí"
        icon={<IconCashBanknote className="h-4 w-4" />}
        iconTone="danger"
        actions={
          <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
            <IconFileSpreadsheet className="h-4 w-4" />
            Xuất Excel
          </Button>
        }
      />

      {listQuery.isLoading && <div className="h-[400px] animate-pulse rounded-xl bg-slate-100" />}
      {listQuery.data && (
        <HocPhiTable
          rows={filtered}
          onPay={(r) => { setActiveRow(r); setPayOpen(true); }}
          onHistory={(r) => { setActiveRow(r); setHistoryOpen(true); }}
          onPrint={handlePrintRow}
          search={search}
          onSearchChange={(v) => setSearch(v)}
          filterHK={filterHK}
          onFilterHKChange={(v) => setFilterHK(v)}
          hocKyList={hocKyList}
        />
      )}

      <ThuHocPhiDialog open={payOpen} onOpenChange={setPayOpen} row={activeRow} />
      <PhieuThuHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} row={activeRow} />

      {/* Hidden print template */}
      {activeRow && (
        <PhieuThuPrintView ref={printRef} row={activeRow} receipts={printReceipts} />
      )}
    </>
  );
}
