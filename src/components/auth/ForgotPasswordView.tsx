import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2, MailCheck } from 'lucide-react';

export default function ForgotPasswordView() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Введите корректный email адрес');
      return;
    }

    setLoading(true);
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setIsSent(true);
    }
  };

  if (isSent) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <MailCheck className="h-6 w-6 text-accent" />
          </div>
          <h2 className="mb-2 text-xl font-bold tracking-tight text-[#111827]">Проверьте почту</h2>
          <p className="mb-6 text-[14px] text-content-secondary">
            Мы отправили ссылку для восстановления пароля на <br />
            <span className="font-medium text-[#111827]">{email}</span>
          </p>
          <Link to="/login" className="w-full">
            <Button variant="secondary" className="h-10 w-full rounded-full lowercase font-medium text-[14px]">
              вернуться ко входу
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Восстановление пароля" subtitle="Введите email для сброса пароля">
      <form onSubmit={handleReset} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#111827]">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="name@company.com"
            className="h-10 w-full rounded-md border border-border bg-[#fbfbfd] px-3 text-sm text-content-primary placeholder:text-content-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {error && <div className="text-[13px] font-medium text-red-500">{error}</div>}

        <Button type="submit" disabled={loading} className="mt-2 h-10 rounded-full w-full lowercase font-semibold text-[14px]">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          отправить ссылку
        </Button>
      </form>

      <div className="mt-8 text-center text-[13px] text-content-secondary">
        <Link to="/login" className="font-medium text-accent hover:underline lowercase">
          вернуться ко входу
        </Link>
      </div>
    </AuthLayout>
  );
}
