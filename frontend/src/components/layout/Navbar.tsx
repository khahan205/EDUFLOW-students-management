import { NavLink, useNavigate } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconUsers,
  IconBook2,
  IconEdit,
  IconCashBanknote,
  IconChartBar,
  IconSettings,
  IconLogout,
  IconSchool,
  type Icon,
} from '@tabler/icons-react';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTES, APP_FULL_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV: { to: string; label: string; Icon: Icon }[] = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', Icon: IconLayoutDashboard },
  { to: ROUTES.SINH_VIEN, label: 'Sinh viên', Icon: IconUsers },
  { to: ROUTES.MON_HOC, label: 'Môn học', Icon: IconBook2 },
  { to: ROUTES.DANG_KY, label: 'Đăng ký', Icon: IconEdit },
  { to: ROUTES.HOC_PHI, label: 'Học phí', Icon: IconCashBanknote },
  { to: ROUTES.BAO_CAO, label: 'Báo cáo', Icon: IconChartBar },
  { to: ROUTES.ADMIN, label: 'Admin', Icon: IconSettings },
];

export function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const initial = (user?.fullName || user?.username || 'A').charAt(0).toUpperCase();

  return (
    <nav
      className="sticky top-0 z-50 shadow-[0_4px_20px_rgba(15,118,110,0.25)]"
      style={{ background: 'linear-gradient(135deg, #0F766E 0%, #134E4A 100%)' }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-5 px-6 py-3.5 text-white">
        {/* Brand */}
        <NavLink to={ROUTES.DASHBOARD} className="flex items-center gap-2.5 font-bold">
          <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-white/20">
            <IconSchool className="h-[18px] w-[18px]" />
          </span>
          <span className="hidden sm:inline">{APP_FULL_NAME}</span>
        </NavLink>

        {/* Nav links */}
        <ul className="hidden flex-1 flex-wrap gap-1 lg:flex">
          {NAV.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-[7px] text-[13.5px] font-medium transition-colors',
                    isActive
                      ? 'bg-white/20 font-semibold text-white'
                      : 'text-white/85 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Spacer for mobile to push user chip to the right */}
        <div className="flex-1 lg:hidden" />

        {/* User chip */}
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 py-1 pl-1 pr-3 text-[13px] font-medium">
            <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-white/30 text-[11px] font-bold">
              {initial}
            </span>
            <span className="hidden sm:inline">{user?.username || 'admin'}</span>
          </span>
          <Button
            onClick={handleLogout}
            size="sm"
            className="!h-9 border border-white/20 bg-white/15 text-white hover:bg-danger hover:border-transparent"
          >
            <IconLogout className="h-4 w-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
