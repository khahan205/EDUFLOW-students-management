import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ROUTES } from '@/lib/constants';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { useAuthStore } from '@/stores/auth-store';

function RootRedirect() {
  const role = useAuthStore((s) => s.user?.role);
  if (role === 'giang-vien') return <Navigate to={ROUTES.GIANG_VIEN_PROFILE} replace />;
  return <Navigate to={ROUTES.DASHBOARD} replace />;
}

import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { ChangePasswordPage } from '@/features/auth/pages/ChangePasswordPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { SinhVienPage } from '@/features/sinh-vien/pages/SinhVienPage';
import { MonHocPage } from '@/features/mon-hoc/pages/MonHocPage';
import { HocPhiPage } from '@/features/hoc-phi/pages/HocPhiPage';
import { BaoCaoPage } from '@/features/bao-cao/pages/BaoCaoPage';
import { AdminPage } from '@/features/admin/pages/AdminPage';
import { MonHocMoPage } from '@/features/mon-hoc-mo/pages/MonHocMoPage';
import { GiangVienPage } from '@/features/giang-vien/pages/GiangVienPage';
import { GiangVienProfilePage } from '@/features/giang-vien/pages/GiangVienProfilePage';
import { GiangVienListPage } from '@/features/giang-vien/pages/GiangVienListPage';
import { ChuongTrinhHocPage } from '@/features/chuong-trinh-hoc/pages/ChuongTrinhHocPage';

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <RootRedirect />,
  },
  // Public pages (no auth required)
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: <ForgotPasswordPage />,
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: <ResetPasswordPage />,
  },
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: ROUTES.LOGIN, element: <LoginPage /> }],
      },
    ],
  },
  // Force password change (must be authenticated)
  {
    element: <ProtectedRoute />,
    children: [
      { path: ROUTES.CHANGE_PASSWORD, element: <ChangePasswordPage /> },
    ],
  },
  // Main app routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: <ProtectedRoute allowedRoles={['admin','phong-dao-tao','phong-tai-chinh','co-van']} redirectTo={ROUTES.GIANG_VIEN_PROFILE}><DashboardPage /></ProtectedRoute> },
          {
            element: <ProtectedRoute allowedRoles={['admin', 'phong-dao-tao']} />,
            children: [
              { path: ROUTES.SINH_VIEN, element: <SinhVienPage /> },
              { path: ROUTES.MON_HOC, element: <MonHocPage /> },
              { path: ROUTES.MON_HOC_MO, element: <MonHocMoPage /> },
              { path: ROUTES.GIANG_VIEN_LIST, element: <GiangVienListPage /> },
              { path: ROUTES.CHUONG_TRINH_HOC, element: <ChuongTrinhHocPage /> },
              { path: ROUTES.DANG_KY, element: <Navigate to={ROUTES.SINH_VIEN} replace /> },
              { path: ROUTES.PHAN_CONG, element: <Navigate to={ROUTES.MON_HOC_MO} replace /> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={['giang-vien']} />,
            children: [
              { path: ROUTES.GIANG_VIEN, element: <GiangVienPage /> },
              { path: ROUTES.GIANG_VIEN_PROFILE, element: <GiangVienProfilePage /> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={['admin', 'phong-tai-chinh']} />,
            children: [
              { path: ROUTES.HOC_PHI, element: <HocPhiPage /> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={['admin', 'phong-dao-tao', 'phong-tai-chinh']} />,
            children: [{ path: ROUTES.BAO_CAO, element: <BaoCaoPage /> }],
          },
          {
            element: <ProtectedRoute allowedRoles={['admin']} />,
            children: [
              { path: ROUTES.ADMIN, element: <AdminPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
]);
