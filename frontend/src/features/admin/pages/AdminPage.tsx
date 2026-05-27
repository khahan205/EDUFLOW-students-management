import { IconSettings, IconTool } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

/**
 * Trang quản trị — scaffold cho vòng đầu.
 * Sẽ bao gồm:
 *   - Quản lý vai trò, người dùng
 *   - Cấu hình tham số hệ thống (chung cho cả app)
 *   - Audit log
 *   - Sao lưu/khôi phục dữ liệu
 */
export function AdminPage() {
  return (
    <>
      <PageHeader
        title="Quản trị hệ thống"
        icon={<IconSettings className="h-4 w-4" />}
        iconTone="purple"
      />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-purple-100 text-purple-700">
            <IconTool className="h-8 w-8" />
          </div>
          <div>
            <h2 className="mb-1 text-lg font-bold text-slate-900">
              Tính năng đang được xây dựng
            </h2>
            <p className="max-w-md text-[14px] text-slate-500">
              Trang quản trị sẽ bao gồm quản lý người dùng & vai trò, cấu hình tham số
              hệ thống, audit log, và backup/restore.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to={ROUTES.DASHBOARD}>← Quay về Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
