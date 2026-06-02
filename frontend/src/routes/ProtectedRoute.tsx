import { type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTES } from '@/lib/constants';
import type { UserRole } from '@/types';

interface Props {
  allowedRoles?: UserRole[];
  redirectTo?: string;
  children?: ReactNode;
}

export function ProtectedRoute({ allowedRoles, redirectTo, children }: Props = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  // Bắt buộc đổi mật khẩu nếu MustChangePassword = true
  // Cho phép ở lại /change-password để không bị loop
  if (user?.mustChangePassword && location.pathname !== ROUTES.CHANGE_PASSWORD) {
    return <Navigate to={ROUTES.CHANGE_PASSWORD} replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to={redirectTo ?? ROUTES.DASHBOARD} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
