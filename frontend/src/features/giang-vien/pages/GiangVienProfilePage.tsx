import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconUser, IconPencil, IconCheck, IconX } from '@tabler/icons-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/services/api-client';

interface GiangVienProfileData {
  MaTK: number;
  HoTen: string;
  Email: string | null;
  Username: string;
  profile: {
    NgaySinh: string | null;
    Khoa: string | null;
    BoMon: string | null;
    HocVi: string | null;
    HocHam: string | null;
    NamCongTac: number | null;
    QuaTrinhCT: string | null;
  } | null;
}

interface ProfileForm {
  ngaySinh: string;
  khoa: string;
  boMon: string;
  hocVi: string;
  hocHam: string;
  namCongTac: string;
  quaTrinhCT: string;
  anhDaiDien: string;
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center">
      <span className="w-48 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="text-base font-medium text-slate-800">
        {value ?? <span className="font-normal italic text-slate-400">Chưa cập nhật</span>}
      </span>
    </div>
  );
}

export function GiangVienProfilePage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    ngaySinh: '', khoa: '', boMon: '', hocVi: '', hocHam: '', namCongTac: '', quaTrinhCT: '', anhDaiDien: '',
  });

  const query = useQuery({
    queryKey: ['gv-profile'],
    queryFn: async () => {
      const { data } = await apiClient.get<GiangVienProfileData>('/giang-vien/profile');
      return data;
    },
  });

  const startEdit = () => {
    const p = query.data?.profile;
    setForm({
      ngaySinh: p?.NgaySinh ? p.NgaySinh.slice(0, 10) : '',
      khoa: p?.Khoa ?? '',
      boMon: p?.BoMon ?? '',
      hocVi: p?.HocVi ?? '',
      hocHam: p?.HocHam ?? '',
      namCongTac: p?.NamCongTac ? String(p.NamCongTac) : '',
      quaTrinhCT: p?.QuaTrinhCT ?? '',
      anhDaiDien: (p as { AnhDaiDien?: string })?.AnhDaiDien ?? '',
    });
    setEditing(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, anhDaiDien: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const mutation = useMutation({
    mutationFn: () => apiClient.put('/giang-vien/profile', {
      ngaySinh: form.ngaySinh || null,
      khoa: form.khoa || null,
      boMon: form.boMon || null,
      hocVi: form.hocVi || null,
      hocHam: form.hocHam || null,
      namCongTac: form.namCongTac ? Number(form.namCongTac) : null,
      quaTrinhCT: form.quaTrinhCT || null,
      anhDaiDien: form.anhDaiDien || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gv-profile'] });
      toast.success('Đã cập nhật hồ sơ');
      setEditing(false);
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Cập nhật thất bại'),
  });

  const d = query.data;
  const p = d?.profile;

  const namCongTacDisplay = p?.NamCongTac
    ? `${p.NamCongTac} (${new Date().getFullYear() - p.NamCongTac} năm)`
    : null;

  return (
    <>
      <PageHeader
        title="Hồ sơ giảng viên"
        icon={<IconUser className="h-4 w-4" />}
        iconTone="teal"
        actions={
          !editing ? (
            <Button variant="outline" onClick={startEdit}>
              <IconPencil className="h-4 w-4" />
              Chỉnh sửa
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>
                <IconX className="h-4 w-4" />
                Huỷ
              </Button>
              <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
                <IconCheck className="h-4 w-4" />
                Lưu
              </Button>
            </div>
          )
        }
      />

      {query.isLoading && <div className="h-64 animate-pulse rounded-xl bg-slate-100" />}

      {d && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Avatar card */}
          <Card className="lg:col-span-1">
            <CardContent className="flex flex-col items-center gap-4 pt-8 pb-6">
              {(p as { AnhDaiDien?: string })?.AnhDaiDien ? (
                <img
                  src={(p as { AnhDaiDien?: string }).AnhDaiDien}
                  alt={d.HoTen}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-teal-100"
                />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-full bg-teal-100 text-4xl font-bold text-teal-700">
                  {d.HoTen.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-center">
                <p className="text-xl font-bold text-slate-800">{d.HoTen}</p>
                {p?.HocHam && <p className="mt-0.5 text-sm text-teal-600 font-medium">{p.HocHam}</p>}
                {p?.HocVi && <p className="text-sm text-slate-500">{p.HocVi}</p>}
              </div>
              <div className="w-full space-y-1 rounded-lg bg-slate-50 px-4 py-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tài khoản</span>
                  <span className="font-mono font-medium">{d.Username}</span>
                </div>
                {d.Email && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email</span>
                    <span className="font-medium">{d.Email}</span>
                  </div>
                )}
                {p?.NamCongTac && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Năm công tác</span>
                    <span className="font-medium">{new Date().getFullYear() - p.NamCongTac} năm</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info card */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              {!editing ? (
                <div className="divide-y divide-slate-100">
                  <InfoRow label="Họ và tên" value={d.HoTen} />
                  <InfoRow
                    label="Ngày sinh"
                    value={p?.NgaySinh ? new Date(p.NgaySinh).toLocaleDateString('vi-VN') : null}
                  />
                  <InfoRow label="Khoa quản lý" value={p?.Khoa} />
                  <InfoRow label="Bộ môn" value={p?.BoMon} />
                  <InfoRow label="Học vị" value={p?.HocVi} />
                  <InfoRow label="Học hàm" value={p?.HocHam} />
                  <InfoRow label="Năm bắt đầu công tác" value={namCongTacDisplay} />
                  <div className="py-3">
                    <p className="mb-2 text-sm text-slate-500">Quá trình công tác</p>
                    <p className="whitespace-pre-wrap text-base text-slate-800">
                      {p?.QuaTrinhCT ?? <span className="italic text-slate-400">Chưa cập nhật</span>}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Photo upload */}
                  <div className="flex items-center gap-4">
                    {form.anhDaiDien ? (
                      <img src={form.anhDaiDien} alt="preview" className="h-16 w-16 rounded-full object-cover ring-2 ring-teal-200" />
                    ) : (
                      <div className="grid h-16 w-16 place-items-center rounded-full bg-teal-100 text-2xl font-bold text-teal-700">
                        {d.HoTen.charAt(0)}
                      </div>
                    )}
                    <div>
                      <Label className="mb-1 block">Ảnh đại diện</Label>
                      <label className="cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                        Chọn ảnh
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                      </label>
                      {form.anhDaiDien && (
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, anhDaiDien: '' }))}
                          className="ml-2 text-xs text-red-500 hover:underline"
                        >
                          Xóa ảnh
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Ngày sinh</Label>
                      <Input
                        type="date"
                        value={form.ngaySinh}
                        onChange={(e) => setForm((f) => ({ ...f, ngaySinh: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Năm bắt đầu công tác</Label>
                      <Input
                        type="number"
                        min={1970}
                        max={new Date().getFullYear()}
                        placeholder="VD: 2010"
                        value={form.namCongTac}
                        onChange={(e) => setForm((f) => ({ ...f, namCongTac: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Khoa quản lý</Label>
                      <Input
                        placeholder="VD: Khoa Công nghệ Thông tin"
                        value={form.khoa}
                        onChange={(e) => setForm((f) => ({ ...f, khoa: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Bộ môn</Label>
                      <Input
                        placeholder="VD: Bộ môn Hệ thống Thông tin"
                        value={form.boMon}
                        onChange={(e) => setForm((f) => ({ ...f, boMon: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Học vị</Label>
                      <Input
                        placeholder="VD: Tiến sĩ, Thạc sĩ, Cử nhân"
                        value={form.hocVi}
                        onChange={(e) => setForm((f) => ({ ...f, hocVi: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Học hàm</Label>
                      <Input
                        placeholder="VD: Giáo sư, Phó Giáo sư, Giảng viên"
                        value={form.hocHam}
                        onChange={(e) => setForm((f) => ({ ...f, hocHam: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Quá trình công tác</Label>
                    <Textarea
                      rows={5}
                      placeholder="VD: 2010-2015: Giảng viên Khoa CNTT, ĐH ABC&#10;2015-nay: Trưởng bộ môn HTTT, ĐH XYZ"
                      value={form.quaTrinhCT}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((f) => ({ ...f, quaTrinhCT: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
