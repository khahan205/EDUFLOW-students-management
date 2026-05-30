import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconUsers,
  IconBook2,
  IconCashBanknote,
  IconChartBar,
  IconSettings,
  IconLogout,
  IconSchool,
  IconKey,
  IconChevronDown,
  IconCalendarEvent,
  IconChalkboard,
  IconListCheck,
  IconUser,
  type Icon,
} from '@tabler/icons-react';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTES, APP_FULL_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  { to: ROUTES.DASHBOARD, label: 'Dashboard', Icon: IconLayoutDashboard, roles: ['admin', 'phong-dao-tao', 'phong-tai-chinh', 'co-van'] },
  { to: ROUTES.GIANG_VIEN_PROFILE, label: 'Hồ sơ', Icon: IconUser, roles: ['giang-vien'] },
  { to: ROUTES.GIANG_VIEN, label: 'Lớp của tôi', Icon: IconChalkboard, roles: ['giang-vien'], end: true },
  { to: ROUTES.SINH_VIEN, label: 'Sinh viên', Icon: IconUsers, roles: ['admin', 'phong-dao-tao'] },
  { to: ROUTES.GIANG_VIEN_LIST, label: 'Giảng viên', Icon: IconUser, roles: ['admin', 'phong-dao-tao'] },
  { to: ROUTES.MON_HOC, label: 'Môn học', Icon: IconBook2, roles: ['admin', 'phong-dao-tao'] },
  { to: ROUTES.MON_HOC_MO, label: 'Học phần', Icon: IconCalendarEvent, roles: ['admin', 'phong-dao-tao'] },
  { to: ROUTES.CHUONG_TRINH_HOC, label: 'Chương trình', Icon: IconListCheck, roles: ['admin', 'phong-dao-tao'] },
  { to: ROUTES.HOC_PHI, label: 'Học phí', Icon: IconCashBanknote, roles: ['admin', 'phong-tai-chinh', 'phong-dao-tao'] },
  { to: ROUTES.BAO_CAO, label: 'Báo cáo', Icon: IconChartBar, roles: ['admin', 'phong-dao-tao', 'phong-tai-chinh'] },
  { to: ROUTES.ADMIN, label: 'Admin', Icon: IconSettings, roles: ['admin'] },
];

export function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [changePwOpen, setChangePwOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const role = user?.role as UserRole | undefined;
  const initial = (user?.fullName || user?.username || 'A').charAt(0).toUpperCase();

  const visibleNav = NAV.filter(
    (item) => !item.roles || (!!role && item.roles.includes(role)),
  );

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[linear-gradient(135deg,#0F766E_0%,#134E4A_100%)] shadow-[0_4px_20px_rgba(15,118,110,0.25)]">
        <div className="mx-auto flex max-w-[1400px] items-center px-8 py-4 text-white">

          {/* Brand — far left */}
          <NavLink
            to={ROUTES.DASHBOARD}
            className="flex shrink-0 items-center gap-3"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/20">
              <IconSchool className="h-6 w-6" />
            </span>
            <span className="hidden text-xl font-bold tracking-tight sm:inline">{APP_FULL_NAME}</span>
          </NavLink>

          {/* Nav items — centered between brand and user chip */}
          <ul className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
            {visibleNav.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-white/20 font-semibold text-white'
                        : 'text-white/85 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Mobile spacer */}
          <div className="flex-1 lg:hidden" />

          {/* User chip — far right */}
          <div className="flex shrink-0 items-center gap-2.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/15 py-1.5 pl-1.5 pr-4 text-sm font-medium transition-colors hover:bg-white/25"
                >
                  <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-white/30 text-xs font-bold">
                    {initial}
                  </span>
                  <span className="hidden sm:inline">{user?.username || 'admin'}</span>
                  <IconChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setChangePwOpen(true)}>
                  <IconKey className="mr-2 h-4 w-4" />
                  Đổi mật khẩu
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  <IconLogout className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile logout */}
            <Button
              onClick={handleLogout}
              size="sm"
              className="!h-9 border border-white/20 bg-white/15 text-white hover:border-transparent hover:bg-danger lg:hidden"
            >
              <IconLogout className="h-4 w-4" />
            </Button>
          </div>

        </div>
      </nav>

      <ChangePasswordDialog open={changePwOpen} onOpenChange={setChangePwOpen} />
    </>
  );
}
