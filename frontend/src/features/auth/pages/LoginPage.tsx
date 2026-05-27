import { IconSchool } from '@tabler/icons-react';
import { APP_FULL_NAME, APP_TAGLINE } from '@/lib/constants';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <div className="animate-fade-up rounded-[20px] bg-white/95 p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="mb-6 flex flex-col items-center">
        <div
          className="mb-3 grid h-16 w-16 place-items-center rounded-2xl text-2xl text-white shadow-teal-glow"
          style={{ background: 'linear-gradient(135deg, #0F766E, #F97316)' }}
        >
          <IconSchool className="h-8 w-8" />
        </div>
        <h1 className="text-center text-[22px] font-bold tracking-tight text-slate-900">
          {APP_FULL_NAME}
        </h1>
        <p className="mt-1 text-center text-[13px] text-slate-500">{APP_TAGLINE}</p>
      </div>
      <LoginForm />
    </div>
  );
}
