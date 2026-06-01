import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconUsers,
  IconBook2,
  IconCashBanknote,
  IconChartBar,
  IconPlus,
  IconSettings,
  IconLogout,
  IconSchool,
  IconKey,
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconListCheck,
  IconBuildingSkyscraper,
  IconUser,
  IconChalkboard,
  type Icon,
} from '@tabler/icons-react';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ChangePasswordDialog } from '@/features/auth/components/ChangePasswordDialog';
import type { UserRole } from '@/types';

interface NavItem {
  to: string;
  label: string;
  Icon: Icon;
  roles?: UserRole[];
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: ROUTES.DASHBOARD,       label: 'Dashboard',        Icon: IconLayoutDashboard, roles: ['admin', 'phong-dao-tao', 'phong-tai-chinh', 'co-van'] },
  { to: ROUTES.GIANG_VIEN_PROFILE, label: 'Hồ sơ',         Icon: IconUser,            roles: ['giang-vien'] },
  { to: ROUTES.GIANG_VIEN,      label: 'Lớp của tôi',      Icon: IconChalkboard,      roles: ['giang-vien'], end: true },
  { to: ROUTES.STUDENT_HO_SO,   label: 'Hồ sơ',            Icon: IconUser,            roles: ['sinh-vien'] },
  { to: ROUTES.STUDENT_DANG_KY, label: 'Đăng ký học phần', Icon: IconPlus,            roles: ['sinh-vien'] },
  { to: ROUTES.STUDENT_PHIEU,   label: 'Phiếu đăng ký',   Icon: IconBook2,           roles: ['sinh-vien'] },
  { to: ROUTES.STUDENT_DIEM,    label: 'Bảng điểm',        Icon: IconChartBar,        roles: ['sinh-vien'] },
  { to: ROUTES.STUDENT_HOC_PHI, label: 'Học phí',          Icon: IconCashBanknote,    roles: ['sinh-vien'] },
  { to: ROUTES.SINH_VIEN,       label: 'Sinh viên',        Icon: IconUsers,           roles: ['admin', 'phong-dao-tao'] },
  { to: ROUTES.MON_HOC,         label: 'Môn học',          Icon: IconBook2,           roles: ['admin', 'phong-dao-tao'] },
  { to: ROUTES.MON_HOC_MO,      label: 'Học phần',         Icon: IconCalendarEvent,   roles: ['admin', 'phong-dao-tao'] },
  { to: ROUTES.CHUONG_TRINH_HOC,label: 'Chương trình',     Icon: IconListCheck,       roles: ['admin', 'phong-dao-tao'] },
  { to: ROUTES.KHOA,            label: 'Khoa & Ngành',     Icon: IconBuildingSkyscraper, roles: ['admin', 'phong-dao-tao'] },
  { to: ROUTES.GIANG_VIEN_LIST, label: 'Giảng viên',       Icon: IconUser,            roles: ['admin', 'phong-dao-tao'] },
  { to: ROUTES.HOC_PHI,         label: 'Học phí',          Icon: IconCashBanknote,    roles: ['admin', 'phong-tai-chinh', 'phong-dao-tao'] },
  { to: ROUTES.BAO_CAO,         label: 'Báo cáo',          Icon: IconChartBar,        roles: ['admin', 'phong-dao-tao', 'phong-tai-chinh'] },
  { to: ROUTES.ADMIN,           label: 'Admin',            Icon: IconSettings,        roles: ['admin'] },
  { to: ROUTES.ADMIN,           label: 'Cấu hình',         Icon: IconSettings,        roles: ['phong-dao-tao'] },
];

const ROLE_LABELS: Record<string, string> = {
  admin:            'Quản trị viên',
  'phong-dao-tao':  'Phòng Đào tạo',
  'phong-tai-chinh':'Phòng Tài chính',
  'giang-vien':     'Giảng viên',
  'co-van':         'Cố vấn học tập',
};

const SIDEBAR_KEY = 'sidebar_collapsed';

export function Sidebar() {
  const navigate = useNavigate();
  const user    = useAuthStore((s) => s.user);
  const logout  = useAuthStore((s) => s.logout);
  const role    = user?.role as UserRole | undefined;

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
  });
  const [changePwOpen, setChangePwOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed));
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const visibleNav = NAV.filter(
    (item) => !item.roles || (!!role && item.roles.includes(role)),
  );

  const initial = (user?.fullName || user?.username || 'A').charAt(0).toUpperCase();

  return (
    <>
      <aside
        className={cn(
          'relative flex h-screen shrink-0 flex-col transition-[width] duration-200',
          'bg-teal-900 text-white',
          collapsed ? 'w-20' : 'w-72',
        )}
      >
        {/* Toggle button — giữa sidebar */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-4 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border-2 border-teal-700 bg-teal-900 text-white shadow-lg hover:bg-teal-800"
        >
          {collapsed
            ? <IconChevronRight className="h-4 w-4" />
            : <IconChevronLeft  className="h-4 w-4" />}
        </button>

        {/* Logo */}
        <div className={cn('flex items-center gap-2.5 px-4 py-5', collapsed && 'justify-center px-0')}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/20">
            <IconSchool className="h-5 w-5" />
          </span>
          {!collapsed && (
            <span className="truncate text-base font-bold tracking-tight">Quản lý Sinh viên</span>
          )}
        </div>

        {/* User info */}
        <div className={cn('mx-3 mb-3 rounded-xl bg-white/10 p-3', collapsed && 'mx-2 p-2')}>
          {collapsed ? (
            <div title={user?.username} className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-bold">
              {initial}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/25 text-sm font-bold">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.fullName || user?.username}</p>
                <p className="truncate text-xs text-white/60">{ROLE_LABELS[role ?? ''] ?? role}</p>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 mb-2 border-t border-white/15" />

        {/* Nav items */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
          {visibleNav.map(({ to, label, Icon: ItemIcon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors',
                  collapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white',
                )
              }
            >
              <ItemIcon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-4 mt-1 border-t border-white/15" />

        {/* Bottom actions */}
        <div className="space-y-0.5 px-2 py-3">
          <button
            type="button"
            title={collapsed ? 'Đổi mật khẩu' : undefined}
            onClick={() => setChangePwOpen(true)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white',
              collapsed && 'justify-center px-0',
            )}
          >
            <IconKey className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Đổi mật khẩu</span>}
          </button>

          <button
            type="button"
            title={collapsed ? 'Đăng xuất' : undefined}
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200',
              collapsed && 'justify-center px-0',
            )}
          >
            <IconLogout className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <ChangePasswordDialog open={changePwOpen} onOpenChange={setChangePwOpen} />
    </>
  );
}
