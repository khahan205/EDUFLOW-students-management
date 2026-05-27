import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ROUTES } from '@/lib/constants';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { SinhVienPage } from '@/features/sinh-vien/pages/SinhVienPage';
import { MonHocPage } from '@/features/mon-hoc/pages/MonHocPage';
import { DangKyPage } from '@/features/dang-ky/pages/DangKyPage';
import { HocPhiPage } from '@/features/hoc-phi/pages/HocPhiPage';
import { BaoCaoPage } from '@/features/bao-cao/pages/BaoCaoPage';
import { AdminPage } from '@/features/admin/pages/AdminPage';

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
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
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTES.SINH_VIEN, element: <SinhVienPage /> },
          { path: ROUTES.MON_HOC, element: <MonHocPage /> },
          { path: ROUTES.DANG_KY, element: <DangKyPage /> },
          { path: ROUTES.HOC_PHI, element: <HocPhiPage /> },
          { path: ROUTES.BAO_CAO, element: <BaoCaoPage /> },
          { path: ROUTES.ADMIN, element: <AdminPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
]);
