import { Outlet } from 'react-router-dom';

/**
 * Layout cho các trang chưa đăng nhập (login, đăng ký, quên mật khẩu).
 * Background gradient teal/coral, content centered.
 */
export function AuthLayout() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      style={{
        background:
          'linear-gradient(135deg, #0F766E 0%, #115E59 45%, #134E4A 80%, #F97316 130%)',
      }}
    >
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[350px] w-[350px] rounded-full bg-white/3" />
      <div className="pointer-events-none absolute right-[20%] bottom-[15%] h-[200px] w-[200px] rounded-full bg-coral-500/15 blur-2xl" />

      <div className="relative z-10 w-full max-w-[420px]">
        <Outlet />
      </div>
    </div>
  );
}
