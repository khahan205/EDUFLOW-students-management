import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import {
  IconUsers,
  IconPrinter,
  IconSearch,
  IconChalkboard,
  IconCalendar,
} from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { apiClient } from '@/services/api-client';

interface GVProfile {
  NgaySinh: string | null;
  Khoa: string | null;
  BoMon: string | null;
  HocVi: string | null;
  HocHam: string | null;
  NamCongTac: number | null;
  QuaTrinhCT: string | null;
  AnhDaiDien: string | null;
}

interface GVStats { soLop: number; tongSinhVien: number; }

interface GiangVienRow {
  MaTK: number;
  HoTen: string;
  Email: string | null;
  Username: string;
  profile: GVProfile | null;
  stats?: GVStats;
}

/* ── Print template ── */
function ProfilePrintView({ gv }: { gv: GiangVienRow }) {
  const p = gv.profile;
  const nam = p?.NamCongTac ? new Date().getFullYear() - p.NamCongTac : null;
  return (
    <div className="p-10 font-sans text-sm text-slate-900">
      <div className="mb-6 flex items-center gap-5 border-b-2 border-teal-700 pb-5">
        {p?.AnhDaiDien ? (
          <img src={p.AnhDaiDien} alt={gv.HoTen} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-full bg-teal-100 text-3xl font-bold text-teal-700">
            {gv.HoTen.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-teal-700">{gv.HoTen}</h1>
          <p className="text-slate-600">{[p?.HocHam, p?.HocVi].filter(Boolean).join(' · ')}</p>
          {gv.Email && <p className="text-slate-500">{gv.Email}</p>}
        </div>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {[
            ['Ngày sinh', p?.NgaySinh ? new Date(p.NgaySinh).toLocaleDateString('vi-VN') : '—'],
            ['Khoa quản lý', p?.Khoa ?? '—'],
            ['Bộ môn', p?.BoMon ?? '—'],
            ['Học vị', p?.HocVi ?? '—'],
            ['Học hàm', p?.HocHam ?? '—'],
            ['Năm bắt đầu công tác', p?.NamCongTac ? `${p.NamCongTac}${nam ? ` (${nam} năm)` : ''}` : '—'],
          ].map(([label, value]) => (
            <tr key={label} className="border-b border-slate-100">
              <td className="w-44 py-2 pr-4 text-slate-500">{label}</td>
              <td className="py-2 font-medium">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {p?.QuaTrinhCT && (
        <div className="mt-5">
          <p className="mb-2 font-semibold text-slate-700">Quá trình công tác</p>
          <p className="whitespace-pre-wrap text-slate-600">{p.QuaTrinhCT}</p>
        </div>
      )}
      <p className="mt-8 text-xs text-slate-400">In ngày: {new Date().toLocaleDateString('vi-VN')}</p>
    </div>
  );
}

/* ── Profile dialog ── */
function ProfileDialog({ gv, onClose }: { gv: GiangVienRow | null; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const detailQuery = useQuery({
    queryKey: ['gv-detail', gv?.MaTK],
    queryFn: async () => {
      const { data } = await apiClient.get<GiangVienRow>(`/giang-vien/${gv!.MaTK}`);
      return data;
    },
    enabled: !!gv,
  });

  if (!gv) return null;
  const detail = detailQuery.data ?? gv;
  const p = detail.profile;
  const stats = detail.stats;
  const nam = p?.NamCongTac ? new Date().getFullYear() - p.NamCongTac : null;

  const infoRows = [
    { label: 'Email', value: detail.Email ?? '—' },
    { label: 'Tài khoản', value: detail.Username },
    { label: 'Ngày sinh', value: p?.NgaySinh ? new Date(p.NgaySinh).toLocaleDateString('vi-VN') : '—' },
    { label: 'Khoa quản lý', value: p?.Khoa ?? '—' },
    { label: 'Bộ môn', value: p?.BoMon ?? '—' },
    { label: 'Học vị', value: p?.HocVi ?? '—' },
    { label: 'Học hàm', value: p?.HocHam ?? '—' },
    { label: 'Năm bắt đầu công tác', value: p?.NamCongTac ? `${p.NamCongTac}${nam ? ` (${nam} năm)` : ''}` : '—' },
  ];

  return (
    <Dialog open={!!gv} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[88vh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0">

        {/* Thin top bar */}
        <DialogHeader className="flex flex-row items-center justify-between border-b bg-white px-5 py-2.5 pr-12">
          <DialogTitle className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Hồ sơ giảng viên
          </DialogTitle>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 text-xs"
            onClick={() => handlePrint()}
          >
            <IconPrinter className="h-3.5 w-3.5" />
            In hồ sơ
          </Button>
        </DialogHeader>

        {/* 2-column body */}
        <div className="flex flex-1 overflow-hidden">

          {/* LEFT: teal column */}
          <div className="flex w-60 shrink-0 flex-col bg-[linear-gradient(160deg,#0F766E_0%,#134E4A_100%)] px-5 py-6 text-white">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              {p?.AnhDaiDien ? (
                <img
                  src={p.AnhDaiDien}
                  alt={detail.HoTen}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-white/30"
                />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-full bg-white/20 text-3xl font-bold ring-4 ring-white/20">
                  {detail.HoTen.charAt(0).toUpperCase()}
                </div>
              )}
              <p className="mt-3 text-lg font-bold leading-tight">{detail.HoTen}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {p?.HocHam && (
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
                    {p.HocHam}
                  </span>
                )}
                {p?.HocVi && (
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs">
                    {p.HocVi}
                  </span>
                )}
                {!p?.HocHam && !p?.HocVi && (
                  <span className="text-xs italic text-white/50">Chưa cập nhật</span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="my-5 border-t border-white/20" />

            {/* Stats */}
            {detailQuery.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-white/10" />
                ))}
              </div>
            ) : stats !== undefined ? (
              <div className="space-y-2">
                {[
                  { icon: IconChalkboard, label: 'Lớp đang dạy', value: stats.soLop },
                  { icon: IconUsers, label: 'Tổng sinh viên', value: stats.tongSinhVien },
                  { icon: IconCalendar, label: 'Năm kinh nghiệm', value: nam ?? '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2.5">
                    <Icon className="h-5 w-5 shrink-0 text-white/60" />
                    <div>
                      <p className="text-lg font-bold leading-none">{value}</p>
                      <p className="mt-0.5 text-[11px] text-white/60">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* RIGHT: info column */}
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {infoRows.map(({ label, value }) => (
                <div key={label} className="flex items-center px-6 py-3">
                  <span className="w-44 shrink-0 text-sm text-slate-400">{label}</span>
                  <span className="text-sm font-medium text-slate-800">{value}</span>
                </div>
              ))}
            </div>

            {p?.QuaTrinhCT && (
              <div className="border-t px-6 py-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Quá trình công tác
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {p.QuaTrinhCT}
                </p>
              </div>
            )}

            {!p?.QuaTrinhCT && (
              <div className="px-6 py-4 text-sm italic text-slate-400">
                Chưa có thông tin quá trình công tác.
              </div>
            )}
          </div>
        </div>

        {/* Hidden print template */}
        <div className="hidden">
          <div ref={printRef}>
            <ProfilePrintView gv={detail} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main page ── */
export function GiangVienListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [selected, setSelected] = useState<GiangVienRow | null>(null);

  const query = useQuery({
    queryKey: ['giang-vien-list'],
    queryFn: async () => {
      const { data } = await apiClient.get<GiangVienRow[]>('/giang-vien');
      return data;
    },
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (query.data ?? []).filter(
      (r) =>
        !q ||
        r.HoTen.toLowerCase().includes(q) ||
        r.Username.toLowerCase().includes(q) ||
        (r.profile?.Khoa?.toLowerCase().includes(q) ?? false) ||
        (r.profile?.BoMon?.toLowerCase().includes(q) ?? false),
    );
  }, [query.data, search]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  return (
    <>
      <PageHeader
        title="Danh sách giảng viên"
        icon={<IconUsers className="h-4 w-4" />}
        iconTone="teal"
      />

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-3 border-b p-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm tên, tài khoản, khoa, bộ môn..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 w-72"
              />
            </div>
            {query.data && (
              <span className="text-sm text-slate-500">{filtered.length} giảng viên</span>
            )}
          </div>

          {query.isLoading && <div className="m-4 h-64 animate-pulse rounded-lg bg-slate-100" />}

          {!query.isLoading && filtered.length === 0 ? (
            <EmptyState message="Không tìm thấy giảng viên nào" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Khoa / Bộ môn</TableHead>
                    <TableHead>Học vị / Học hàm</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Năm CT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((gv, idx) => (
                    <TableRow
                      key={gv.MaTK}
                      className="cursor-pointer hover:bg-teal-50"
                      onClick={() => setSelected(gv)}
                    >
                      <TableCell className="text-center text-slate-400">
                        {(page - 1) * pageSize + idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          {gv.profile?.AnhDaiDien ? (
                            <img
                              src={gv.profile.AnhDaiDien}
                              alt={gv.HoTen}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="grid h-8 w-8 place-items-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                              {gv.HoTen.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-teal-700">{gv.HoTen}</p>
                            <p className="text-xs text-slate-400">{gv.Username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{gv.profile?.Khoa ?? <span className="italic text-slate-400">—</span>}</p>
                        {gv.profile?.BoMon && <p className="text-xs text-slate-500">{gv.profile.BoMon}</p>}
                      </TableCell>
                      <TableCell>
                        {gv.profile?.HocHam && <Badge variant="info" className="mb-0.5 mr-1">{gv.profile.HocHam}</Badge>}
                        {gv.profile?.HocVi && <p className="text-xs text-slate-500">{gv.profile.HocVi}</p>}
                        {!gv.profile?.HocHam && !gv.profile?.HocVi && <span className="italic text-slate-400 text-sm">—</span>}
                      </TableCell>
                      <TableCell className="text-slate-500">{gv.Email ?? '—'}</TableCell>
                      <TableCell className="text-center">
                        {gv.profile?.NamCongTac
                          ? <span className="font-medium">{gv.profile.NamCongTac}</span>
                          : <span className="text-slate-400">—</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t px-4">
                <Pagination
                  total={filtered.length}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={() => {}}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ProfileDialog gv={selected} onClose={() => setSelected(null)} />
    </>
  );
}
