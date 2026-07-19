import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Введите корректный email адрес');
      return;
    }
    if (password.length < 8) {
      setError('Пароль должен содержать не менее 8 символов');
      return;
    }

    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (signInError) {
      setError('неверный email или пароль');
    } else {
      navigate('/workspace');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) setError(error.message);
  };

  return (
    <AuthLayout title="Вход в систему" subtitle="Рады видеть вас снова">
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-[#111827]">Пароль</label>
            <Link to="/forgot-password" className="text-[13px] font-medium text-accent hover:underline lowercase">
              забыли пароль?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            placeholder="••••••••"
            className="h-10 w-full rounded-md border border-border bg-[#fbfbfd] px-3 text-sm text-content-primary placeholder:text-content-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {error && <div className="text-[13px] font-medium text-red-500">{error}</div>}
        {successMessage && <div className="text-[13px] font-medium text-green-500 bg-green-50 p-2 rounded border border-green-100">{successMessage}</div>}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
          />
          <label htmlFor="remember" className="text-[13px] text-content-secondary lowercase">
            запомнить меня
          </label>
        </div>

        <Button type="submit" disabled={loading} className="mt-2 h-10 rounded-full w-full lowercase font-semibold text-[14px]">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          войти
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-[12px] uppercase tracking-wider">
          <span className="bg-white px-2 text-content-muted">или</span>
        </div>
      </div>

      <Button
        variant="secondary"
        onClick={handleGoogleLogin}
        className="h-10 w-full rounded-full lowercase font-medium text-[14px] bg-white border border-border text-[#111827] hover:bg-[#fbfbfd]"
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="mr-2 h-4 w-4" />
        войти через google
      </Button>

      <div className="mt-8 text-center text-[13px] text-content-secondary">
        <span className="lowercase">нет аккаунта?</span>{' '}
        <Link to="/signup" className="font-medium text-accent hover:underline lowercase">
          создать аккаунт
        </Link>
      </div>
    </AuthLayout>
  );
}
