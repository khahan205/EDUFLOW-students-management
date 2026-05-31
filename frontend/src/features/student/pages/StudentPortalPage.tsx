import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconUser, IconBook2, IconCashBanknote, IconChartBar, IconQrcode, IconBuildingBank, IconPlus, IconTrash, IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/common/EmptyState';
import { exportToExcel } from '@/lib/export-excel';
import { apiClient } from '@/services/api-client';

interface MonHocOpen { MaMH: string; TenMH: string; SoTinChi: number; MaLoaiMon: string; TenKhoa: string; SiSoHienTai: number; SiSoToiDa: number; daDangKy: boolean; }
interface DangKyInfo { HocKy: { MaHK: string; TenHK: string; NamHoc: string }; monHoc: { MaPhieu: string; MaMH: string; TenMH: string; SoTinChi: number; MaLoaiMon: string; SoTienPhaiDong: number }[]; TongPhaiDong: number; DaDong: number; ConLai: number; }
interface PhieuThuItem { MaPhieuThu: string; NgayThu: string; SoTienThu: number; HinhThucTT: string; GhiChu: string; }
interface Profile { MaSV: string; TenSV: string; NgaySinh: string | null; GioiTinh: string | null; TenLop: string | null; Email: string | null; TrangThai: string; nganh?: { TenNganh: string }; queQuan?: { TenTinh: string; huyen?: { TenHuyen: string } }; doiTuongUuTien?: { TenDoiTuong: string; TiLeGiamHocPhi: number }; }
interface DiemRow { MaDiem: number; MaMH: string; TenMH: string; SoTinChi: number; MaLoaiMon: string; TenHK: string; NamHoc: string; DiemGiuaKy: number | null; DiemCuoiKy: number | null; DiemTBHP: number | null; }
interface ThamSoItem { TenThamSo: string; GiaTri: string; }

const TC_MAX = 30;
function fmt(n: number) { return n.toLocaleString('vi-VN') + 'đ'; }
function diemColor(d: number | null) { if (d == null) return 'text-slate-400'; if (d >= 8) return 'text-emerald-600'; if (d >= 6.5) return 'text-teal-600'; if (d >= 5) return 'text-amber-600'; return 'text-red-600'; }
function buildQRUrl(bankId: string, accountNo: string, accountName: string, amount: number, content: string) {
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?${new URLSearchParams({ amount: String(amount), addInfo: content, accountName })}`;
}

function useProfile() { return useQuery({ queryKey: ['student-me'], queryFn: async () => { const { data } = await apiClient.get<Profile>('/student/me'); return data; } }); }
function useDangKy() { return useQuery({ queryKey: ['student-dang-ky'], queryFn: async () => { const { data } = await apiClient.get<DangKyInfo>('/student/dang-ky'); return data; } }); }

/* ═══════════════════════════════════════════════════════════════
   HỒ SƠ
═══════════════════════════════════════════════════════════════ */
export function StudentHoSoPage() {
  const { data: profile, isLoading } = useProfile();
  return (
    <>
      <PageHeader title="Hồ sơ sinh viên" icon={<IconUser className="h-4 w-4" />} iconTone="teal" />
      {isLoading && <div className="h-48 animate-pulse rounded-xl bg-slate-100" />}
      {profile && (
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-teal-100 text-2xl font-bold text-teal-700">{profile.TenSV.charAt(0)}</div>
            <div><p className="text-xl font-bold">{profile.TenSV}</p><p className="text-slate-500">{profile.MaSV} · {profile.TenLop ?? '—'}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-5 text-sm">
            {[
              ['Ngày sinh', profile.NgaySinh ? new Date(profile.NgaySinh).toLocaleDateString('vi-VN') : '—'],
              ['Giới tính', profile.GioiTinh ?? '—'],
              ['Ngành học', profile.nganh?.TenNganh ?? '—'],
              ['Email', profile.Email ?? '—'],
              ['Trạng thái', profile.TrangThai],
              ['Quê quán', profile.queQuan ? `${profile.queQuan.TenTinh}${profile.queQuan.huyen ? ` — ${profile.queQuan.huyen.TenHuyen}` : ''}` : '—'],
              ['Đối tượng ưu tiên', profile.doiTuongUuTien ? `${profile.doiTuongUuTien.TenDoiTuong} (giảm ${(Number(profile.doiTuongUuTien.TiLeGiamHocPhi)*100).toFixed(0)}%)` : 'Không'],
            ].map(([l, v]) => (
              <div key={l} className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{l}</p>
                <p className="font-medium">{v}</p>
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ĐĂNG KÝ HỌC PHẦN (BM5)
═══════════════════════════════════════════════════════════════ */
export function StudentDangKyPage() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  const { data: dangKy } = useDangKy();
  const monMoQuery = useQuery({ queryKey: ['student-mon-mo'], queryFn: async () => { const { data } = await apiClient.get<MonHocOpen[]>('/student/mon-mo'); return data; } });

  const tcDaDangKy = (dangKy?.monHoc ?? []).reduce((s, m) => s + m.SoTinChi, 0);
  const tcConLai = TC_MAX - tcDaDangKy;
  const pctUsed = Math.min((tcDaDangKy / TC_MAX) * 100, 100);

  const registerMutation = useMutation({
    mutationFn: async (maMH: string) => {
      const sv = profile!.MaSV;
      const maHK = dangKy!.HocKy.MaHK;
      return apiClient.post('/dang-ky', { maSV: sv, maHK, maMH });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-mon-mo'] }); qc.invalidateQueries({ queryKey: ['student-dang-ky'] }); toast.success('Đăng ký thành công'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Đăng ký thất bại'),
  });

  const unregisterMutation = useMutation({
    mutationFn: async (maMH: string) => {
      const sv = profile!.MaSV;
      const maHK = dangKy!.HocKy.MaHK;
      return apiClient.delete('/dang-ky', { data: { maSV: sv, maHK, maMH } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-mon-mo'] }); qc.invalidateQueries({ queryKey: ['student-dang-ky'] }); toast.success('Đã huỷ đăng ký'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Huỷ thất bại'),
  });

  return (
    <>
      <PageHeader title="Đăng ký học phần" icon={<IconPlus className="h-4 w-4" />} iconTone="teal" />

      {/* TC counter */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Số tín chỉ học kỳ này:</span>
              <span className={`text-lg font-bold ${tcDaDangKy >= TC_MAX ? 'text-red-600' : tcDaDangKy >= 25 ? 'text-amber-600' : 'text-teal-600'}`}>
                {tcDaDangKy} / {TC_MAX} TC
              </span>
            </div>
            {tcConLai <= 0
              ? <Badge variant="danger">Đã đạt giới hạn 30 TC</Badge>
              : tcConLai <= 5
                ? <Badge variant="warning">Còn {tcConLai} TC</Badge>
                : <Badge variant="success">Còn {tcConLai} TC</Badge>}
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-2 rounded-full transition-all ${tcDaDangKy >= TC_MAX ? 'bg-red-500 w-full' : tcDaDangKy >= 25 ? 'bg-amber-500' : 'bg-teal-500'}`}
              style={tcDaDangKy < TC_MAX ? { width: `${pctUsed}%` } : undefined} />
          </div>
          {dangKy?.HocKy && <p className="mt-2 text-xs text-slate-400">Học kỳ: {dangKy.HocKy.TenHK} {dangKy.HocKy.NamHoc}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Danh sách môn học mở — nhấn nút để đăng ký hoặc huỷ</CardTitle></CardHeader>
        <CardContent className="p-0">
          {monMoQuery.isLoading && <div className="m-4 h-40 animate-pulse rounded-lg bg-slate-100" />}
          {!monMoQuery.isLoading && (monMoQuery.data ?? []).length === 0 && <EmptyState message="Chưa có môn học mở trong học kỳ này" />}
          {(monMoQuery.data ?? []).length > 0 && (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Mã môn</TableHead><TableHead>Tên môn học</TableHead>
                <TableHead className="text-center">Loại</TableHead><TableHead className="text-center">TC</TableHead>
                <TableHead className="text-center">Sĩ số</TableHead><TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow></TableHeader>
              <TableBody>{(monMoQuery.data ?? []).map(m => {
                const wouldExceed = !m.daDangKy && (tcDaDangKy + m.SoTinChi > TC_MAX);
                const isFull = m.SiSoHienTai >= m.SiSoToiDa;
                return (
                  <TableRow key={m.MaMH} className={m.daDangKy ? 'bg-teal-50/50' : ''}>
                    <TableCell className="font-mono font-bold">{m.MaMH}</TableCell>
                    <TableCell className="font-medium">{m.TenMH}</TableCell>
                    <TableCell className="text-center"><Badge variant={m.MaLoaiMon === 'TH' ? 'info' : 'muted'}>{m.MaLoaiMon}</Badge></TableCell>
                    <TableCell className="text-center font-semibold">{m.SoTinChi}</TableCell>
                    <TableCell className="text-center">
                      <span className={isFull ? 'font-semibold text-red-600' : 'text-slate-500'}>
                        {m.SiSoHienTai}/{m.SiSoToiDa}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {m.daDangKy
                        ? <span className="inline-flex items-center gap-1 text-xs text-teal-700"><IconCircleCheck className="h-3.5 w-3.5" />Đã ĐK</span>
                        : isFull
                          ? <span className="text-xs text-red-500">Hết chỗ</span>
                          : wouldExceed
                            ? <span className="inline-flex items-center gap-1 text-xs text-amber-600"><IconAlertCircle className="h-3.5 w-3.5" />Vượt 30TC</span>
                            : <span className="text-xs text-slate-400">Chưa ĐK</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {m.daDangKy ? (
                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 h-7"
                          disabled={unregisterMutation.isPending}
                          onClick={() => unregisterMutation.mutate(m.MaMH)}>
                          <IconTrash className="h-3.5 w-3.5 mr-1" />Huỷ
                        </Button>
                      ) : (
                        <Button size="sm" className="h-7"
                          disabled={isFull || wouldExceed || registerMutation.isPending}
                          title={wouldExceed ? `Thêm môn này sẽ vượt giới hạn 30TC (hiện ${tcDaDangKy}TC)` : isFull ? 'Lớp đã đầy' : ''}
                          onClick={() => registerMutation.mutate(m.MaMH)}>
                          <IconPlus className="h-3.5 w-3.5 mr-1" />Đăng ký
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHIẾU ĐĂNG KÝ (môn đã ĐK + QR)
═══════════════════════════════════════════════════════════════ */
export function StudentPhieuPage() {
  const { data: profile } = useProfile();
  const { data: dangKy, isLoading } = useDangKy();
  const thamSoQuery = useQuery({ queryKey: ['tham-so'], staleTime: 300_000, queryFn: async () => { const { data } = await apiClient.get<ThamSoItem[]>('/master-data/tham-so'); return data; } });
  const tsMap = Object.fromEntries((thamSoQuery.data ?? []).map(t => [t.TenThamSo, t.GiaTri]));

  return (
    <>
      <PageHeader title="Phiếu đăng ký học phần" icon={<IconBook2 className="h-4 w-4" />} iconTone="teal" />
      {isLoading && <div className="h-40 animate-pulse rounded-xl bg-slate-100" />}
      {dangKy && (
        <div className="space-y-4">
          {/* Tóm tắt HP */}
          <div className="grid grid-cols-3 gap-4">
            {[['Tổng phải đóng', fmt(dangKy.TongPhaiDong), 'text-slate-800'],
              ['Đã đóng', fmt(dangKy.DaDong), 'text-emerald-600'],
              ['Còn nợ', fmt(dangKy.ConLai), dangKy.ConLai > 0 ? 'text-red-600' : 'text-slate-400']
            ].map(([l, v, c]) => (
              <Card key={l}><CardContent className="pt-4 pb-4 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wide">{l}</p>
                <p className={`text-lg font-bold mt-1 ${c}`}>{v}</p>
              </CardContent></Card>
            ))}
          </div>

          {/* QR khi còn nợ */}
          {dangKy.ConLai > 0 && (
            <Card className="border-teal-200 bg-teal-50">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-6">
                  <div className="shrink-0 text-center">
                    <img src={buildQRUrl(tsMap['ngan_hang_ma_vietqr'] ?? 'VCB', tsMap['ngan_hang_so_tk'] ?? '1234567890', tsMap['ngan_hang_chu_tk'] ?? 'TRUONG', dangKy.ConLai, `HOCPHI ${profile?.MaSV ?? ''} ${dangKy.HocKy.MaHK}`)}
                      alt="QR CK" className="h-40 w-40 rounded-xl border-2 border-teal-200 bg-white p-1 shadow-sm"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <p className="mt-2 text-xs text-teal-600 font-medium">Quét để chuyển khoản</p>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <IconQrcode className="h-5 w-5 text-teal-600" />
                      <p className="font-semibold text-teal-800">Thanh toán qua chuyển khoản</p>
                    </div>
                    <div className="rounded-lg border border-teal-200 bg-white px-4 py-3 space-y-2 text-sm">
                      <div className="flex gap-2"><IconBuildingBank className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" /><span className="text-slate-500">Ngân hàng:</span><span className="font-semibold">{tsMap['ngan_hang_ten'] ?? 'Vietcombank'}</span></div>
                      <div className="flex gap-2"><span className="text-slate-500 w-28 shrink-0">Số tài khoản:</span><span className="font-mono font-bold text-teal-700 tracking-wider">{tsMap['ngan_hang_so_tk'] ?? '1234567890'}</span></div>
                      <div className="flex gap-2"><span className="text-slate-500 w-28 shrink-0">Số tiền:</span><span className="font-bold text-red-600 text-base">{fmt(dangKy.ConLai)}</span></div>
                      <div className="flex gap-2"><span className="text-slate-500 w-28 shrink-0">Nội dung CK:</span>
                        <code className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">HOCPHI {profile?.MaSV} {dangKy.HocKy.MaHK}</code>
                      </div>
                    </div>
                    <p className="text-xs text-teal-600 italic">⚠ Sau khi chuyển khoản, liên hệ Phòng Tài chính để xác nhận.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Danh sách môn */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Môn đã đăng ký — {dangKy.HocKy.TenHK} {dangKy.HocKy.NamHoc}</CardTitle></CardHeader>
            <CardContent className="p-0">
              {dangKy.monHoc.length === 0 ? <EmptyState message="Chưa đăng ký môn nào" /> : (
                <Table><TableHeader><TableRow>
                  <TableHead>Mã môn</TableHead><TableHead>Tên môn</TableHead>
                  <TableHead className="text-center">TC</TableHead><TableHead className="text-center">Loại</TableHead>
                  <TableHead className="text-right">Học phí</TableHead>
                </TableRow></TableHeader>
                <TableBody>{dangKy.monHoc.map(m => (
                  <TableRow key={m.MaMH}>
                    <TableCell className="font-mono font-bold">{m.MaMH}</TableCell>
                    <TableCell className="font-medium">{m.TenMH}</TableCell>
                    <TableCell className="text-center">{m.SoTinChi}</TableCell>
                    <TableCell className="text-center"><Badge variant={m.MaLoaiMon === 'TH' ? 'info' : 'muted'}>{m.MaLoaiMon}</Badge></TableCell>
                    <TableCell className="text-right font-mono">{fmt(m.SoTienPhaiDong)}</TableCell>
                  </TableRow>
                ))}</TableBody></Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BẢNG ĐIỂM
═══════════════════════════════════════════════════════════════ */
export function StudentDiemPage() {
  const diemQuery = useQuery({ queryKey: ['student-diem'], queryFn: async () => { const { data } = await apiClient.get<DiemRow[]>('/student/diem'); return data; } });
  const diemList = diemQuery.data ?? [];
  const gpaAll = diemList.filter(d => d.DiemTBHP != null);
  const gpa = gpaAll.length > 0 ? (gpaAll.reduce((s, d) => s + d.DiemTBHP! * d.SoTinChi, 0) / gpaAll.reduce((s, d) => s + d.SoTinChi, 0)).toFixed(2) : null;

  return (
    <>
      <PageHeader title="Bảng điểm" icon={<IconChartBar className="h-4 w-4" />} iconTone="teal" />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              Kết quả học tập
              {gpa && <Badge variant="info">GPA: {gpa}</Badge>}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => exportToExcel(diemList, [
              { header: 'Mã môn', key: 'MaMH' }, { header: 'Tên môn', key: 'TenMH' }, { header: 'TC', key: 'SoTinChi' },
              { header: 'HK', key: 'TenHK' }, { header: 'Năm học', key: 'NamHoc' },
              { header: 'Điểm GK', key: 'DiemGiuaKy' }, { header: 'Điểm CK', key: 'DiemCuoiKy' }, { header: 'TBHP', key: 'DiemTBHP' },
            ], 'bang-diem')} disabled={!diemList.length}>Xuất Excel</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {diemQuery.isLoading && <div className="m-4 h-40 animate-pulse rounded-lg bg-slate-100" />}
          {!diemQuery.isLoading && diemList.length === 0 && <EmptyState message="Chưa có điểm nào" />}
          {diemList.length > 0 && (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Mã môn</TableHead><TableHead>Tên môn học</TableHead>
                <TableHead className="text-center">TC</TableHead><TableHead>Học kỳ</TableHead>
                <TableHead className="text-center">Điểm GK</TableHead>
                <TableHead className="text-center">Điểm CK</TableHead>
                <TableHead className="text-center">TBHP</TableHead>
              </TableRow></TableHeader>
              <TableBody>{diemList.map(d => (
                <TableRow key={d.MaDiem}>
                  <TableCell className="font-mono font-bold">{d.MaMH}</TableCell>
                  <TableCell className="font-medium">{d.TenMH}</TableCell>
                  <TableCell className="text-center">{d.SoTinChi}</TableCell>
                  <TableCell className="text-slate-500">{d.TenHK} {d.NamHoc}</TableCell>
                  <TableCell className={`text-center font-semibold ${diemColor(d.DiemGiuaKy)}`}>{d.DiemGiuaKy ?? '—'}</TableCell>
                  <TableCell className={`text-center font-semibold ${diemColor(d.DiemCuoiKy)}`}>{d.DiemCuoiKy ?? '—'}</TableCell>
                  <TableCell className={`text-center text-lg font-bold ${diemColor(d.DiemTBHP)}`}>{d.DiemTBHP ?? '—'}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HỌC PHÍ / LỊCH SỬ ĐÓNG TIỀN
═══════════════════════════════════════════════════════════════ */
export function StudentHocPhiPage() {
  const phieuThuQuery = useQuery({ queryKey: ['student-phieu-thu'], queryFn: async () => { const { data } = await apiClient.get<PhieuThuItem[]>('/student/phieu-thu'); return data; } });
  const rows = phieuThuQuery.data ?? [];
  const tongDaThu = rows.reduce((s, r) => s + r.SoTienThu, 0);

  return (
    <>
      <PageHeader title="Lịch sử đóng học phí" icon={<IconCashBanknote className="h-4 w-4" />} iconTone="teal" />
      {rows.length > 0 && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-3 flex items-center justify-between">
          <span className="text-sm text-emerald-700">Tổng đã đóng tất cả các kỳ</span>
          <span className="font-bold text-emerald-700 text-lg">{fmt(tongDaThu)}</span>
        </div>
      )}
      <Card>
        <CardContent className="p-0">
          {phieuThuQuery.isLoading && <div className="m-4 h-32 animate-pulse rounded-lg bg-slate-100" />}
          {!phieuThuQuery.isLoading && rows.length === 0 && <EmptyState message="Chưa có phiếu thu nào" />}
          {rows.length > 0 && (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Mã phiếu</TableHead><TableHead>Ngày thu</TableHead>
                <TableHead>Hình thức</TableHead><TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow></TableHeader>
              <TableBody>{rows.map(p => (
                <TableRow key={p.MaPhieuThu}>
                  <TableCell className="font-mono">{p.MaPhieuThu}</TableCell>
                  <TableCell>{new Date(p.NgayThu).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell><Badge variant={p.HinhThucTT === 'CHUYEN_KHOAN' ? 'info' : 'muted'}>{p.HinhThucTT === 'CHUYEN_KHOAN' ? 'Chuyển khoản' : 'Tiền mặt'}</Badge></TableCell>
                  <TableCell className="text-right font-mono font-semibold text-emerald-600">{fmt(p.SoTienThu)}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{p.GhiChu}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
