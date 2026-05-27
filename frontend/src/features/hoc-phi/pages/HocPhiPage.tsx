import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IconCashBanknote } from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { fetchHocPhiRows } from '../api/hoc-phi-api';
import { HocPhiTable } from '../components/HocPhiTable';
import { ThuHocPhiDialog } from '../components/ThuHocPhiDialog';
import { PhieuThuHistoryDialog } from '../components/PhieuThuHistoryDialog';
import type { ThuHocPhiRow } from '@/types';

export function HocPhiPage() {
  const [payOpen, setPayOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<ThuHocPhiRow | null>(null);

  const listQuery = useQuery({
    queryKey: ['hoc-phi'],
    queryFn: fetchHocPhiRows,
  });

  return (
    <>
      <PageHeader
        title="Thu học phí"
        icon={<IconCashBanknote className="h-4 w-4" />}
        iconTone="danger"
      />

      {listQuery.isLoading && <div className="h-[400px] animate-pulse rounded-xl bg-slate-100" />}
      {listQuery.data && (
        <HocPhiTable
          rows={listQuery.data}
          onPay={(r) => {
            setActiveRow(r);
            setPayOpen(true);
          }}
          onHistory={(r) => {
            setActiveRow(r);
            setHistoryOpen(true);
          }}
          onPrint={() => toast.info('Chức năng in phiếu sẽ được thêm khi backend live.')}
        />
      )}

      <ThuHocPhiDialog open={payOpen} onOpenChange={setPayOpen} row={activeRow} />
      <PhieuThuHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} row={activeRow} />
    </>
  );
}
