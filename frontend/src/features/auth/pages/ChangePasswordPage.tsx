import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLock, IconAlertCircle } from '@tabler/icons-react';
import { PasswordInput } from '@/components/ui/password-input';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/services/api-client';
import { ROUTES } from '@/lib/constants';
import { changePasswordSchema, type ChangePasswordInput } from '../schemas/change-password.schema';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ChangePasswordInput) => {
    setError(null);
    setSubmitting(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (user) setUser({ ...user, mustChangePassword: false });
      toast.success('Đổi mật khẩu thành công!');
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Đổi mật khẩu bắt buộc</CardTitle>
          <CardDescription>
            Tài khoản của bạn yêu cầu đổi mật khẩu trước khi tiếp tục.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-700">
                  <IconAlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {name === 'currentPassword' ? 'Mật khẩu hiện tại' :
                         name === 'newPassword' ? 'Mật khẩu mới' : 'Xác nhận mật khẩu mới'}
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          leftIcon={<IconLock className="h-4 w-4" />}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
