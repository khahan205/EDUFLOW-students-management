import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconUser, IconLock, IconLogin2, IconAlertCircle } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTES } from '@/lib/constants';
import { login } from '../api/auth-api';
import { loginSchema, type LoginInput } from '../schemas/login.schema';

export function LoginForm() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (values: LoginInput) => {
    setError(null);
    setSubmitting(true);
    try {
      const session = await login(values);
      setSession(session);
      toast.success(`Chào mừng ${session.user.fullName}!`);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-700">
            <IconAlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên đăng nhập</FormLabel>
              <FormControl>
                <div className="relative">
                  <IconUser className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="admin"
                    autoComplete="username"
                    autoFocus
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <div className="relative">
                  <IconLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="••••••"
                    autoComplete="current-password"
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          <IconLogin2 className="h-4 w-4" />
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>

        <div className="pt-2 text-center text-[12px] text-slate-500">
          Hệ thống chỉ dành cho cán bộ trường.
          <br />
          Liên hệ quản trị viên để được cấp tài khoản.
        </div>
      </form>
    </Form>
  );
}
