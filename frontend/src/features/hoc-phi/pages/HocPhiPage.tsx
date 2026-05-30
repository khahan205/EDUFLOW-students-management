import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IconCashBanknote, IconFileSpreadsheet } from '@tabler/icons-react';
import { useReactToPrint } from 'react-to-print';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { exportToExcel } from '@/lib/export-excel';
import { apiClient } from '@/services/api-client';
import { fetchHocPhiRows, fetchPaymentHistory } from '../api/hoc-phi-api';
import { HocPhiTable } from '../components/HocPhiTable';
import { ThuHocPhiDialog } from '../components/ThuHocPhiDialog';
import { PhieuThuHistoryDialog } from '../components/PhieuThuHistoryDialog';
import { PhieuThuPrintView } from '../components/PhieuThuPrintView';
import { DonGiaHanTab } from '../components/DonGiaHanTab';
import type { ThuHocPhiRow, PhieuThu } from '@/types';

interface HocKyOption { MaHK: string; TenHK: string; NamHoc: string; }

interface PhieuDKRow {
  MaPhieu: string; MaSV: string; TenSV: string;
  MaMH: string; TenMH: string; SoTinChi: number; MaLoaiMon: string;
  MaHK: string; TenHK: string; NamHoc: string;
  NgayLap: string; SoTienDangKy: number; SoTienPhaiDong: number;
}

interface PhieuThuRow2 {
  MaPhieuThu: string; MaSV: string; TenSV: string;
  MaHK: string; TenHK: string; NamHoc: string;
  NgayThu: string; SoTienThu: number; GhiChu: string;
}

function fmt(n: number) { return n.toLocaleString('vi-VN') + 'đ'; }

/* ── BM11: Tra cứu phiếu đăng ký ── */
function PhieuDangKyTab() {
  const [maPhieu, setMaPhieu] = useState('');
  const [maSV, setMaSV] = useState('');
  const [maHK, setMaHK] = useState('');
  const [searched, setSearched] = useState(false);

  const hkQuery = useQuery({
    queryKey: ['hoc-ky-list'],
    queryFn: async () => { const { data } = await apiClient.get<HocKyOption[]>('/master-data/hoc-ky'); return data; },
    staleTime: 300_000,
  });

  const query = useQuery({
    queryKey: ['phieu-dang-ky', maPhieu, maSV, maHK],
    queryFn: async () => {
      const { data } = await apiClient.get<PhieuDKRow[]>('/hoc-phi/tra-cuu/phieu-dang-ky', {
        params: { maPhieu: maPhieu || undefined, maSV: maSV || undefined, maHK: maHK || undefined },
      });
      return data;
    },
    enabled: searched,
  });

  const handleSearch = () => setSearched(true);
  const data = query.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Mã phiếu</p>
            <Input placeholder="HP_..." value={maPhieu} onChange={(e) => setMaPhieu(e.target.value)} className="w-36" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Mã SV</p>
            <Input placeholder="22521001" value={maSV} onChange={(e) => setMaSV(e.target.value)} className="w-36" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Học kỳ</p>
            <Select value={maHK || 'all'} onValueChange={(v) => setMaHK(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Tất cả" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả học kỳ</SelectItem>
                {(hkQuery.data ?? []).map((hk) => (
                  <SelectItem key={hk.MaHK} value={hk.MaHK}>{hk.TenHK} {hk.NamHoc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSearch}>Tra cứu</Button>
          {searched && data.length > 0 && (
            <Button variant="outline" onClick={() => exportToExcel(data, [
              { header: 'Mã phiếu', key: 'MaPhieu' },
              { header: 'Mã SV', key: 'MaSV' }, { header: 'Họ tên', key: 'TenSV' },
              { header: 'Mã môn', key: 'MaMH' }, { header: 'Tên môn', key: 'TenMH' },
              { header: 'Số TC', key: 'SoTinChi' }, { header: 'Học kỳ', key: 'TenHK' },
              { header: 'Năm học', key: 'NamHoc' }, { header: 'Ngày lập', key: 'NgayLap' },
              { header: 'Số tiền ĐK (đ)', key: 'SoTienDangKy' },
              { header: 'Số tiền phải đóng (đ)', key: 'SoTienPhaiDong' },
            ], 'phieu-dang-ky')}>
              <IconFileSpreadsheet className="h-4 w-4" />Xuất Excel
            </Button>
          )}
        </CardContent>
      </Card>

      {searched && (
        <Card>
          <CardContent className="p-0">
            {query.isLoading && <div className="m-4 h-40 animate-pulse rounded-lg bg-slate-100" />}
            {!query.isLoading && data.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">Không tìm thấy phiếu đăng ký nào</p>
            )}
            {data.length > 0 && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã phiếu</TableHead>
                      <TableHead>Mã SV</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Môn học</TableHead>
                      <TableHead className="text-center">TC</TableHead>
                      <TableHead>Học kỳ</TableHead>
                      <TableHead>Ngày lập</TableHead>
                      <TableHead className="text-right">Phải đóng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((r) => (
                      <TableRow key={r.MaPhieu}>
                        <TableCell className="font-mono text-sm">{r.MaPhieu}</TableCell>
                        <TableCell className="font-mono font-semibold">{r.MaSV}</TableCell>
                        <TableCell className="font-medium">{r.TenSV}</TableCell>
                        <TableCell>
                          <p className="font-medium">{r.TenMH}</p>
                          <p className="text-xs text-slate-400">{r.MaMH} · {r.MaLoaiMon}</p>
                        </TableCell>
                        <TableCell className="text-center">{r.SoTinChi}</TableCell>
                        <TableCell className="text-slate-500">{r.TenHK} {r.NamHoc}</TableCell>
                        <TableCell className="text-slate-500">
                          {new Date(r.NgayLap).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{fmt(r.SoTienPhaiDong)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="border-t px-4 py-2 text-sm text-slate-500">{data.length} phiếu đăng ký</p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ── BM12: Tra cứu phiếu thu ── */
function PhieuThuTab() {
  const [maPhieuThu, setMaPhieuThu] = useState('');
  const [maSV, setMaSV] = useState('');
  const [maHK, setMaHK] = useState('');
  const [searched, setSearched] = useState(false);

  const hkQuery = useQuery({
    queryKey: ['hoc-ky-list'],
    queryFn: async () => { const { data } = await apiClient.get<HocKyOption[]>('/master-data/hoc-ky'); return data; },
    staleTime: 300_000,
  });

  const query = useQuery({
    queryKey: ['phieu-thu-search', maPhieuThu, maSV, maHK],
    queryFn: async () => {
      const { data } = await apiClient.get<PhieuThuRow2[]>('/hoc-phi/tra-cuu/phieu-thu', {
        params: { maPhieuThu: maPhieuThu || undefined, maSV: maSV || undefined, maHK: maHK || undefined },
      });
      return data;
    },
    enabled: searched,
  });

  const data = query.data ?? [];
  const tongThu = useMemo(() => data.reduce((s, r) => s + r.SoTienThu, 0), [data]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Mã phiếu thu</p>
            <Input placeholder="PT..." value={maPhieuThu} onChange={(e) => setMaPhieuThu(e.target.value)} className="w-36" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Mã SV</p>
            <Input placeholder="22521001" value={maSV} onChange={(e) => setMaSV(e.target.value)} className="w-36" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Học kỳ</p>
            <Select value={maHK || 'all'} onValueChange={(v) => setMaHK(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Tất cả" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả học kỳ</SelectItem>
                {(hkQuery.data ?? []).map((hk) => (
                  <SelectItem key={hk.MaHK} value={hk.MaHK}>{hk.TenHK} {hk.NamHoc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setSearched(true)}>Tra cứu</Button>
          {searched && data.length > 0 && (
            <Button variant="outline" onClick={() => exportToExcel(data, [
              { header: 'Mã phiếu thu', key: 'MaPhieuThu' },
              { header: 'Mã SV', key: 'MaSV' }, { header: 'Họ tên', key: 'TenSV' },
              { header: 'Học kỳ', key: 'TenHK' }, { header: 'Năm học', key: 'NamHoc' },
              { header: 'Ngày thu', key: 'NgayThu' }, { header: 'Số tiền thu (đ)', key: 'SoTienThu' },
              { header: 'Ghi chú', key: 'GhiChu' },
            ], 'phieu-thu')}>
              <IconFileSpreadsheet className="h-4 w-4" />Xuất Excel
            </Button>
          )}
        </CardContent>
      </Card>

      {searched && (
        <Card>
          <CardContent className="p-0">
            {query.isLoading && <div className="m-4 h-40 animate-pulse rounded-lg bg-slate-100" />}
            {!query.isLoading && data.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">Không tìm thấy phiếu thu nào</p>
            )}
            {data.length > 0 && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã phiếu thu</TableHead>
                      <TableHead>Mã SV</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Học kỳ</TableHead>
                      <TableHead>Ngày thu</TableHead>
                      <TableHead className="text-right">Số tiền thu</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((r) => (
                      <TableRow key={r.MaPhieuThu}>
                        <TableCell className="font-mono text-sm">{r.MaPhieuThu}</TableCell>
                        <TableCell className="font-mono font-semibold">{r.MaSV}</TableCell>
                        <TableCell className="font-medium">{r.TenSV}</TableCell>
                        <TableCell className="text-slate-500">{r.TenHK} {r.NamHoc}</TableCell>
                        <TableCell className="text-slate-500">
                          {new Date(r.NgayThu).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-emerald-700">{fmt(r.SoTienThu)}</TableCell>
                        <TableCell className="text-slate-500 text-sm">{r.GhiChu}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-between border-t px-4 py-2 text-sm">
                  <span className="text-slate-500">{data.length} phiếu thu</span>
                  <span className="font-semibold text-emerald-700">Tổng đã thu: {fmt(tongThu)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ── Main Page ── */
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
    exportToExcel(filtered, [
      { header: 'Mã SV', key: 'MaSV' }, { header: 'Họ tên', key: 'TenSV' },
      { header: 'Học kỳ', key: 'TenHK' }, { header: 'Tổng', key: 'Tong' },
      { header: 'Đã đóng', key: 'DaDong' }, { header: 'Còn lại', key: 'ConLai' },
      { header: 'Trạng thái', key: 'TrangThai' },
    ], 'hoc-phi');
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

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Danh sách học phí</TabsTrigger>
          <TabsTrigger value="phieu-dk">Tra cứu phiếu đăng ký</TabsTrigger>
          <TabsTrigger value="phieu-thu">Tra cứu phiếu thu</TabsTrigger>
          <TabsTrigger value="gia-han">Đơn gia hạn</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
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
        </TabsContent>

        <TabsContent value="phieu-dk">
          <PhieuDangKyTab />
        </TabsContent>

        <TabsContent value="phieu-thu">
          <PhieuThuTab />
        </TabsContent>

        <TabsContent value="gia-han">
          <DonGiaHanTab />
        </TabsContent>
      </Tabs>

      <ThuHocPhiDialog open={payOpen} onOpenChange={setPayOpen} row={activeRow} />
      <PhieuThuHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} row={activeRow} />

      {activeRow && (
        <PhieuThuPrintView ref={printRef} row={activeRow} receipts={printReceipts} />
      )}
    </>
  );
}
