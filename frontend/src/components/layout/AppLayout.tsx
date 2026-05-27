import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

/**
 * Layout cho các trang đã đăng nhập: navbar trên + nội dung trang.
 * Outlet sẽ render <DashboardPage />, <SinhVienPage />, ... tuỳ route.
 */
export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-6 py-7 pb-20">
        <Outlet />
      </main>
    </div>
  );
}
