import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { IconMail, IconArrowLeft, IconCheck, IconTerminal2 } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/lib/constants';
import { forgotPassword } from '../api/auth-api';

export function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    try {
      await forgotPassword(username.trim());
      setSubmitted(true);
    } catch (err) {
      // Backend trả về lỗi nếu tài khoản không tồn tại (nhưng ta vẫn show success để bảo mật)
      setSubmitted(true);
      toast.info('Nếu tài khoản tồn tại, đường dẫn đặt lại mật khẩu đã được tạo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/40 px-4">
      <div className="w-full max-w-[420px]">

        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-extrabold text-base">E</span>
          </div>
          <span className="font-bold text-slate-800 text-xl tracking-tight">EduFlow</span>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="px-8 pt-8 pb-6">

            {!submitted ? (
              <>
                <h1 className="text-[22px] font-bold text-slate-900 mb-1">Quên mật khẩu</h1>
                <p className="text-sm text-slate-500 mb-6">
                  Nhập tên đăng nhập hoặc email để nhận đường dẫn đặt lại mật khẩu.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                      <IconMail className="w-4 h-4 text-slate-400" />
                      Tên đăng nhập hoặc email
                    </Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin hoặc admin@gmail.com"
                      autoFocus
                      required
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                    {loading
                      ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xử lý...</span>
                      : 'Gửi yêu cầu đặt lại mật khẩu'}
                  </Button>
                  <p className="text-center text-sm text-slate-500">
                    <Link to={ROUTES.LOGIN} className="text-teal-600 hover:text-teal-700 font-medium hover:underline inline-flex items-center gap-1">
                      <IconArrowLeft className="w-3.5 h-3.5" />
                      Quay lại đăng nhập
                    </Link>
                  </p>
                </form>
              </>
            ) : (
              <div className="py-4 space-y-5 text-center">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-teal-50 border-4 border-teal-100 flex items-center justify-center">
                    <IconCheck className="w-10 h-10 text-teal-600 stroke-[2]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-[22px] font-bold text-slate-900">Yêu cầu đã gửi</h1>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Đường dẫn đặt lại mật khẩu đã được tạo cho tài khoản <span className="font-semibold text-slate-700">{username}</span>.
                  </p>
                </div>

                {/* Dev mode notice */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left">
                  <div className="flex items-center gap-2 mb-1.5">
                    <IconTerminal2 className="h-4 w-4 text-amber-600 shrink-0" />
                    <p className="text-xs font-semibold text-amber-700">Chế độ phát triển (không có SMTP)</p>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Link đặt lại mật khẩu đã được ghi vào <strong>console của backend</strong>. Mở terminal đang chạy backend và sao chép đường dẫn từ dòng <code className="bg-amber-100 px-1 rounded">[MAILER DEV]</code> để tiếp tục.
                  </p>
                </div>

                <Button className="w-full h-11 font-semibold" onClick={() => setSubmitted(false)} variant="outline">
                  Gửi lại
                </Button>
                <Link to={ROUTES.LOGIN} className="block text-sm text-teal-600 hover:underline">
                  Quay lại đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2025 EduFlow — Hệ thống quản lý sinh viên
        </p>
      </div>
    </div>
  );
}
