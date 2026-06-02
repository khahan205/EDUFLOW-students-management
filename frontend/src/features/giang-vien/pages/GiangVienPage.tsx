import { useEffect, useMemo, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  IconChalkboard,
  IconFileSpreadsheet,
  IconUsers,
  IconClipboardList,
} from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { exportToExcel } from '@/lib/export-excel';
import { apiClient } from '@/services/api-client';
import { toast } from 'sonner';
import { fetchMyClasses, type MyClassRow } from '@/features/phan-cong/api/phan-cong-api';
import { fetchSinhVienLop } from '../api/giang-vien-api';

/* ─── types ─── */
interface DiemRow { MaDiem?: number; MaSV: string; DiemGiuaKy: number | null; DiemCuoiKy: number | null; DiemTBHP: number | null; }
type GradeEdit = { gk: string; ck: string; changed: boolean };

function calcTBHP(gk: string, ck: string): number | null {
  const g = parseFloat(gk); const c = parseFloat(ck);
  if (isNaN(g) || isNaN(c)) return null;
  return Math.round((0.3 * g + 0.7 * c) * 100) / 100;
}

function diemColor(d: number | null) {
  if (d == null) return 'text-slate-400';
  if (d >= 8) return 'text-emerald-600 font-bold';
  if (d >= 6.5) return 'text-teal-600 font-semibold';
  if (d >= 5) return 'text-amber-600';
  return 'text-red-600 font-semibold';
}

/* ── Dialog: Nhập điểm ── */
function NhapDiemDialog({ course, onClose }: { course: MyClassRow | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [grades, setGrades] = useState<Record<string, GradeEdit>>({});
  const [saving, setSaving] = useState(false);

  /* Danh sách sinh viên đã đăng ký */
  const svQuery = useQuery({
    queryKey: ['sinh-vien-lop', course?.MaHK, course?.MaMH],
    queryFn: () => fetchSinhVienLop(course!.MaHK, course!.MaMH),
    enabled: !!course,
  });

  /* Điểm hiện tại của lớp */
  const diemQuery = useQuery({
    queryKey: ['diem-lop', course?.MaHK, course?.MaMH],
    queryFn: async () => {
      const { data } = await apiClient.get<DiemRow[]>('/diem', {
        params: { maHK: course!.MaHK, maMH: course!.MaMH },
      });
      return data;
    },
    enabled: !!course,
  });

  // Khởi tạo grade state từ dữ liệu có sẵn khi load xong
  useEffect(() => {
    if (!diemQuery.data) return;
    const init: Record<string, GradeEdit> = {};
    diemQuery.data.forEach((d: DiemRow) => {
      init[d.MaSV] = {
        gk: d.DiemGiuaKy != null ? String(d.DiemGiuaKy) : '',
        ck: d.DiemCuoiKy != null ? String(d.DiemCuoiKy) : '',
        changed: false,
      };
    });
    setGrades(init);
  }, [diemQuery.data]);

  const setGrade = useCallback((maSV: string, field: 'gk' | 'ck', val: string) => {
    setGrades((prev) => ({ ...prev, [maSV]: { ...(prev[maSV] ?? { gk: '', ck: '' }), [field]: val, changed: true } }));
  }, []);

  const handleSaveAll = async () => {
    const changed = Object.entries(grades).filter(([, v]) => v.changed);
    if (changed.length === 0) { toast.info('Không có điểm nào thay đổi'); return; }
    setSaving(true);
    try {
      await Promise.all(
        changed.map(([maSV, v]) =>
          apiClient.post('/diem', {
            maSV, maMH: course!.MaMH, maHK: course!.MaHK,
            diemGiuaKy: v.gk !== '' ? Number(v.gk) : null,
            diemCuoiKy: v.ck !== '' ? Number(v.ck) : null,
          }),
        ),
      );
      qc.invalidateQueries({ queryKey: ['diem-lop', course?.MaHK, course?.MaMH] });
      setGrades((prev) => {
        const next = { ...prev };
        changed.forEach(([maSV]) => { next[maSV] = { ...next[maSV], changed: false }; });
        return next;
      });
      toast.success(`Đã lưu điểm cho ${changed.length} sinh viên`);
    } catch {
      toast.error('Lưu điểm thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const rows = (svQuery.data ?? []).map((sv) => {
      const g = grades[sv.MaSV];
      const tb = g ? calcTBHP(g.gk, g.ck) : null;
      return { MaSV: sv.MaSV, TenSV: sv.TenSV, TenLop: sv.TenLop, DiemGiuaKy: g?.gk || '', DiemCuoiKy: g?.ck || '', DiemTBHP: tb ?? '' };
    });
    exportToExcel(rows, [
      { header: 'Mã SV', key: 'MaSV' }, { header: 'Họ tên', key: 'TenSV' }, { header: 'Lớp', key: 'TenLop' },
      { header: 'Điểm GK', key: 'DiemGiuaKy' }, { header: 'Điểm CK', key: 'DiemCuoiKy' }, { header: 'Điểm TBHP', key: 'DiemTBHP' },
    ], `diem-${course?.MaMH}-${course?.MaHK}`);
  };

  if (!course) return null;

  const svList = svQuery.data ?? [];
  const changedCount = Object.values(grades).filter((v) => v.changed).length;

  return (
    <Dialog open={!!course} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <IconClipboardList className="h-5 w-5 text-teal-600" />
            Nhập điểm
          </DialogTitle>
          <p className="mt-0.5 text-sm text-slate-500">
            {course.TenMH} <span className="font-mono">({course.MaMH})</span> — {course.TenHK} {course.NamHoc}
            <span className="ml-2 text-xs text-slate-400">· TBHP = 0.3 × GK + 0.7 × CK</span>
          </p>
        </DialogHeader>

        <div className="flex items-center justify-between border-b px-6 py-3">
          <span className="text-sm text-slate-500">{svList.length} sinh viên đăng ký</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!svList.length}>
              <IconFileSpreadsheet className="h-4 w-4" />
              Xuất Excel
            </Button>
            <Button size="sm" disabled={changedCount === 0 || saving} onClick={handleSaveAll}>
              {saving ? 'Đang lưu...' : `Lưu điểm${changedCount > 0 ? ` (${changedCount})` : ''}`}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {(svQuery.isLoading || diemQuery.isLoading) && (
            <div className="m-6 h-40 animate-pulse rounded-lg bg-slate-100" />
          )}
          {!svQuery.isLoading && svList.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-400">Chưa có sinh viên đăng ký môn này</div>
          )}
          {svList.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center">#</TableHead>
                  <TableHead>Mã SV</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead className="w-28 text-center">Điểm GK</TableHead>
                  <TableHead className="w-28 text-center">Điểm CK</TableHead>
                  <TableHead className="w-24 text-center">TBHP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {svList.map((sv, idx) => {
                  const g = grades[sv.MaSV] ?? { gk: '', ck: '', changed: false };
                  const tbhp = calcTBHP(g.gk, g.ck);
                  return (
                    <TableRow key={sv.MaSV} className={g.changed ? 'bg-amber-50' : undefined}>
                      <TableCell className="text-center text-slate-400">{idx + 1}</TableCell>
                      <TableCell className="font-mono font-semibold">{sv.MaSV}</TableCell>
                      <TableCell className="font-medium">{sv.TenSV}</TableCell>
                      <TableCell className="text-slate-500">{sv.TenLop ?? '—'}</TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number" min={0} max={10} step={0.5}
                          value={g.gk}
                          onChange={(e) => setGrade(sv.MaSV, 'gk', e.target.value)}
                          className="w-20 text-center mx-auto h-8 text-sm"
                          placeholder="0-10"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number" min={0} max={10} step={0.5}
                          value={g.ck}
                          onChange={(e) => setGrade(sv.MaSV, 'ck', e.target.value)}
                          className="w-20 text-center mx-auto h-8 text-sm"
                          placeholder="0-10"
                        />
                      </TableCell>
                      <TableCell className={`text-center text-base ${diemColor(tbhp)}`}>
                        {tbhp != null ? tbhp.toFixed(2) : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StudentListDialog({
  course,
  onClose,
}: {
  course: MyClassRow | null;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const query = useQuery({
    queryKey: ['sinh-vien-lop', course?.MaHK, course?.MaMH],
    queryFn: () => fetchSinhVienLop(course!.MaHK, course!.MaMH),
    enabled: !!course,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (query.data ?? []).filter(
      (r) =>
        !q ||
        r.MaSV.toLowerCase().includes(q) ||
        r.TenSV.toLowerCase().includes(q) ||
        (r.TenLop?.toLowerCase().includes(q) ?? false),
    );
  }, [query.data, search]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page],
  );

  const handleExport = () => {
    exportToExcel(
      filtered,
      [
        { header: 'Mã SV', key: 'MaSV' },
        { header: 'Họ tên', key: 'TenSV' },
        { header: 'Lớp', key: 'TenLop' },
        { header: 'Giới tính', key: 'GioiTinh' },
        { header: 'Ngày sinh', key: 'NgaySinh' },
        { header: 'Email', key: 'Email' },
      ],
      `danh-sach-lop-${course?.MaMH ?? ''}-${course?.MaHK ?? ''}`,
    );
  };

  if (!course) return null;

  return (
    <Dialog open={!!course} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[85vh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5 text-teal-600" />
            Danh sách sinh viên
          </DialogTitle>
          <p className="mt-0.5 text-sm text-slate-500">
            {course.TenMH} <span className="font-mono">({course.MaMH})</span> — {course.TenHK}
            <span className="ml-2 font-medium text-teal-700">· {query.data?.length ?? 0} sinh viên</span>
          </p>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3 border-b px-6 py-3">
          <Input
            placeholder="Tìm mã SV, họ tên, lớp..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
            <IconFileSpreadsheet className="h-4 w-4" />
            Xuất Excel
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {query.isLoading && (
            <div className="m-6 h-40 animate-pulse rounded-lg bg-slate-100" />
          )}

          {!query.isLoading && filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              {search ? 'Không tìm thấy sinh viên phù hợp' : 'Chưa có sinh viên đăng ký môn này'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center">#</TableHead>
                  <TableHead>Mã SV</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((sv, idx) => (
                  <TableRow key={sv.MaSV}>
                    <TableCell className="text-center text-slate-400">
                      {(page - 1) * pageSize + idx + 1}
                    </TableCell>
                    <TableCell className="font-mono font-semibold">{sv.MaSV}</TableCell>
                    <TableCell className="font-medium">{sv.TenSV}</TableCell>
                    <TableCell className="text-slate-500">{sv.TenLop ?? '—'}</TableCell>
                    <TableCell className="text-slate-500">{sv.GioiTinh ?? '—'}</TableCell>
                    <TableCell className="text-slate-400">
                      {new Date(sv.NgayDangKy).toLocaleDateString('vi-VN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {filtered.length > pageSize && (
          <div className="border-t px-4">
            <Pagination
              total={filtered.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={() => {}}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function GiangVienPage() {
  const [search, setSearch] = useState('');
  const [filterNamHoc, setFilterNamHoc] = useState('');
  const [filterHocKy, setFilterHocKy] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedCourse, setSelectedCourse] = useState<MyClassRow | null>(null);
  const [gradeCourse, setGradeCourse] = useState<MyClassRow | null>(null);

  const query = useQuery({
    queryKey: ['my-classes'],
    queryFn: fetchMyClasses,
  });

  const namHocList = useMemo(() => {
    const set = new Set((query.data ?? []).map((r) => r.NamHoc));
    return Array.from(set).sort().reverse();
  }, [query.data]);

  const hocKyList = useMemo(() => {
    const set = new Set(
      (query.data ?? [])
        .filter((r) => !filterNamHoc || r.NamHoc === filterNamHoc)
        .map((r) => r.TenHK),
    );
    return Array.from(set).sort();
  }, [query.data, filterNamHoc]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (query.data ?? []).filter(
      (r) =>
        (!filterNamHoc || r.NamHoc === filterNamHoc) &&
        (!filterHocKy || r.TenHK === filterHocKy) &&
        (!q || r.MaMH.toLowerCase().includes(q) || r.TenMH.toLowerCase().includes(q)),
    );
  }, [query.data, search, filterNamHoc, filterHocKy]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const handleExport = () => {
    exportToExcel(
      filtered,
      [
        { header: 'Năm học', key: 'NamHoc' },
        { header: 'Học kỳ', key: 'TenHK' },
        { header: 'Mã môn', key: 'MaMH' },
        { header: 'Tên môn học', key: 'TenMH' },
        { header: 'Số tín chỉ', key: 'SoTinChi' },
        { header: 'Sĩ số hiện tại', key: 'SiSoHienTai' },
        { header: 'Sĩ số tối đa', key: 'SiSoToiDa' },
      ],
      'danh-sach-lop-giang-day',
    );
  };

  return (
    <>
      <PageHeader
        title="Lớp học của tôi"
        icon={<IconChalkboard className="h-4 w-4" />}
        iconTone="teal"
        actions={
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={filtered.length === 0}
          >
            <IconFileSpreadsheet className="h-4 w-4" />
            Xuất Excel
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b p-4">
            <Input
              placeholder="Tìm mã môn, tên môn..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-56"
            />
            <Select
              value={filterNamHoc || 'all'}
              onValueChange={(v) => {
                setFilterNamHoc(v === 'all' ? '' : v);
                setFilterHocKy('');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Năm học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả năm học</SelectItem>
                {namHocList.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterHocKy || 'all'}
              onValueChange={(v) => { setFilterHocKy(v === 'all' ? '' : v); setPage(1); }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Học kỳ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả học kỳ</SelectItem>
                {hocKyList.map((hk) => (
                  <SelectItem key={hk} value={hk}>{hk}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(filterNamHoc || filterHocKy || search) && (
              <button
                type="button"
                onClick={() => { setFilterNamHoc(''); setFilterHocKy(''); setSearch(''); setPage(1); }}
                className="text-sm text-slate-500 underline hover:text-slate-800"
              >
                Xoá bộ lọc
              </button>
            )}
          </div>

          {query.isLoading && (
            <div className="m-4 h-[300px] animate-pulse rounded-xl bg-slate-100" />
          )}

          {!query.isLoading && filtered.length === 0 ? (
            <EmptyState message={query.data?.length === 0 ? 'Bạn chưa được phân công lớp học phần nào' : 'Không tìm thấy lớp học phù hợp'} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Năm học</TableHead>
                    <TableHead>Học kỳ</TableHead>
                    <TableHead>Mã môn</TableHead>
                    <TableHead>Tên môn học</TableHead>
                    <TableHead className="text-center">TC</TableHead>
                    <TableHead className="text-center">Sĩ số</TableHead>
                    <TableHead className="text-center">Danh sách SV</TableHead>
                    <TableHead className="text-center">Nhập điểm</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((row) => (
                    <TableRow key={`${row.MaHK}-${row.MaMH}`}>
                      <TableCell className="text-slate-500">{row.NamHoc}</TableCell>
                      <TableCell className="text-slate-500">{row.TenHK}</TableCell>
                      <TableCell className="font-mono font-semibold">{row.MaMH}</TableCell>
                      <TableCell className="font-medium">{row.TenMH}</TableCell>
                      <TableCell className="text-center">{row.SoTinChi}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={row.SiSoHienTai >= row.SiSoToiDa ? 'danger' : 'info'}
                          className="font-mono"
                        >
                          {row.SiSoHienTai}/{row.SiSoToiDa}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCourse(row)}
                        >
                          <IconUsers className="h-4 w-4" />
                          Xem DS ({row.SiSoHienTai})
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setGradeCourse(row)}
                        >
                          <IconClipboardList className="h-4 w-4" />
                          Nhập điểm
                        </Button>
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
                  onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <StudentListDialog
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
      <NhapDiemDialog
        course={gradeCourse}
        onClose={() => setGradeCourse(null)}
      />
    </>
  );
}
