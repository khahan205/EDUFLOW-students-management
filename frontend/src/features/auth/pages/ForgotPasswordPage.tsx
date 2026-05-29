import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { IconMail, IconLock, IconCheck, IconRefresh, IconArrowLeft } from '@tabler/icons-react';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/lib/constants';
import { resetPasswordByEmail } from '../api/auth-api';

type Step = 'email' | 'otp' | 'reset' | 'done';

const STEP_LABELS = ['Email', 'Xác nhận', 'Mật khẩu'] as const;

function StepBar({ current }: { current: Step }) {
  const idx = current === 'done' ? 3 : (['email', 'otp', 'reset'] as Step[]).indexOf(current);
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEP_LABELS.map((label, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={[
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                  done
                    ? 'bg-teal-600 text-white shadow-sm'
                    : active
                    ? 'bg-teal-600 text-white shadow-md ring-4 ring-teal-100'
                    : 'bg-slate-100 text-slate-400',
                ].join(' ')}
              >
                {done ? <IconCheck className="w-4 h-4 stroke-[2.5]" /> : i + 1}
              </div>
              <span
                className={[
                  'text-[11px] font-medium tracking-wide whitespace-nowrap',
                  active ? 'text-teal-700' : done ? 'text-teal-500' : 'text-slate-400',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={[
                  'h-[2px] flex-1 mx-1 mb-5 rounded-full transition-all duration-500',
                  i < idx ? 'bg-teal-500' : 'bg-slate-200',
                ].join(' ')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');

  const updateAndFocus = (newDigits: string[], nextIdx?: number) => {
    onChange(newDigits.join(''));
    if (nextIdx !== undefined) {
      setTimeout(() => refs.current[Math.min(nextIdx, 5)]?.focus(), 0);
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const ch = e.target.value.replace(/\D/g, '').slice(-1);
    const next = digits.map((d, idx) => (idx === i ? ch : d));
    updateAndFocus(next, ch ? i + 1 : i);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[i]) {
        const next = digits.map((d, idx) => (idx === i ? '' : d));
        updateAndFocus(next, i);
      } else if (i > 0) {
        const next = digits.map((d, idx) => (idx === i - 1 ? '' : d));
        updateAndFocus(next, i - 1);
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < 5) {
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] ?? '');
    updateAndFocus(next, Math.min(pasted.length, 5));
  };

  return (
    <div className="flex gap-2.5 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`Chữ số OTP thứ ${i + 1}`}
          title={`Chữ số OTP thứ ${i + 1}`}
          className={[
            'w-11 h-12 text-center text-[22px] font-bold rounded-xl border-2 outline-none',
            'transition-all duration-150 caret-transparent',
            d
              ? 'border-teal-500 bg-teal-50 text-teal-700'
              : 'border-slate-200 bg-slate-50 text-slate-800',
            'focus:border-teal-500 focus:bg-white focus:shadow-sm focus:shadow-teal-100',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const startCountdown = useCallback(() => setCountdown(60), []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!emailOk) { toast.error('Địa chỉ email không hợp lệ.'); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setOtpValue('');
    startCountdown();
    setStep('otp');
    toast.success('Mã OTP đã được gửi đến email của bạn!');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) { toast.error('Vui lòng nhập đủ 6 chữ số.'); return; }
    setStep('reset');
  };

  const handleResend = () => {
    setOtpValue('');
    startCountdown();
    toast.success('Đã gửi lại mã OTP mới!');
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Mật khẩu phải có ít nhất 6 ký tự.'); return; }
    if (newPassword !== confirmPassword) { toast.error('Mật khẩu xác nhận không khớp.'); return; }
    setSubmitting(true);
    try {
      await resetPasswordByEmail(email, newPassword);
      setStep('done');
    } catch (err) {
      toast.error((err as { message?: string })?.message ?? 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const passwordsMismatch = !!confirmPassword && newPassword !== confirmPassword;

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

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="px-8 pt-8 pb-6">

            {step !== 'done' && <StepBar current={step} />}

            {/* STEP 1 — Email */}
            {step === 'email' && (
              <div>
                <h1 className="text-[22px] font-bold text-slate-900 mb-1">Quên mật khẩu</h1>
                <p className="text-sm text-slate-500 mb-6">
                  Nhập email đã đăng ký để nhận mã OTP xác nhận.
                </p>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <IconMail className="w-4 h-4 text-slate-400" />
                      Địa chỉ email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      autoFocus
                      required
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 font-semibold" disabled={submitting}>
                    {submitting
                      ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang gửi...</span>
                      : 'Gửi mã OTP'}
                  </Button>
                  <p className="text-center text-sm text-slate-500">
                    <Link to={ROUTES.LOGIN} className="text-teal-600 hover:text-teal-700 font-medium hover:underline inline-flex items-center gap-1">
                      <IconArrowLeft className="w-3.5 h-3.5" />
                      Quay lại đăng nhập
                    </Link>
                  </p>
                </form>
              </div>
            )}

            {/* STEP 2 — OTP */}
            {step === 'otp' && (
              <div>
                <h1 className="text-[22px] font-bold text-slate-900 mb-1">Nhập mã xác nhận</h1>
                <p className="text-sm text-slate-500 mb-1">
                  Mã OTP đã được gửi đến
                </p>
                <p className="text-sm font-semibold text-teal-700 mb-6 truncate">{email}</p>
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 text-center">Nhập mã 6 chữ số</p>
                    <OtpBoxes value={otpValue} onChange={setOtpValue} />
                  </div>
                  <Button type="submit" className="w-full h-11 font-semibold" disabled={otpValue.length !== 6}>
                    Xác nhận
                  </Button>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 hover:underline"
                    >
                      <IconArrowLeft className="w-3.5 h-3.5" />
                      Đổi email
                    </button>
                    {countdown > 0 ? (
                      <span className="text-xs text-slate-400">
                        Gửi lại sau <span className="font-semibold text-teal-600 tabular-nums">{countdown}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <IconRefresh className="w-3.5 h-3.5" />
                        Gửi lại mã
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3 — Reset */}
            {step === 'reset' && (
              <div>
                <h1 className="text-[22px] font-bold text-slate-900 mb-1">Đặt mật khẩu mới</h1>
                <p className="text-sm text-slate-500 mb-6">Tạo mật khẩu mới cho tài khoản của bạn.</p>
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="newPwd" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <IconLock className="w-4 h-4 text-slate-400" />
                      Mật khẩu mới
                    </Label>
                    <PasswordInput
                      id="newPwd"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      autoFocus
                      required
                      minLength={6}
                      className="h-11"
                      leftIcon={<IconLock className="h-4 w-4" />}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPwd" className="text-sm font-medium text-slate-700">
                      Xác nhận mật khẩu
                    </Label>
                    <PasswordInput
                      id="confirmPwd"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      required
                      className={['h-11', passwordsMismatch ? 'border-red-400 focus-visible:ring-red-200' : ''].join(' ')}
                    />
                    {passwordsMismatch && (
                      <p className="text-xs text-red-500 flex items-center gap-1">Mật khẩu không khớp</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 font-semibold"
                    disabled={submitting || passwordsMismatch}
                  >
                    {submitting
                      ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</span>
                      : 'Đặt lại mật khẩu'}
                  </Button>
                </form>
              </div>
            )}

            {/* DONE */}
            {step === 'done' && (
              <div className="py-4 space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-teal-50 border-4 border-teal-100 flex items-center justify-center">
                    <IconCheck className="w-10 h-10 text-teal-600 stroke-[2]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-[22px] font-bold text-slate-900">Thành công!</h1>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Mật khẩu của tài khoản<br />
                    <span className="font-semibold text-slate-700">{email}</span><br />
                    đã được đặt lại thành công.
                  </p>
                </div>
                <Button className="w-full h-11 font-semibold" onClick={() => navigate(ROUTES.LOGIN)}>
                  Đăng nhập ngay
                </Button>
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
