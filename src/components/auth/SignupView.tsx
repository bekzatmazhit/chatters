import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function SignupView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Введите корректный email адрес');
      return;
    }
    if (password.length < 8) {
      setError('Пароль должен содержать не менее 8 символов');
      return;
    }
    if (!company.trim()) {
      setError('Укажите название компании');
      return;
    }

    setLoading(true);
    setError(null);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: company,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (signUpData?.user) {
      // Create workspace
      const { error: workspaceError } = await supabase
        .from('workspaces')
        .insert([
          { name: company, owner_id: signUpData.user.id }
        ]);
        
      if (workspaceError) {
        // Fallback or log if table doesn't exist yet
        console.error('Failed to create workspace:', workspaceError);
      }
    }

    setLoading(false);
    navigate('/onboarding');
  };

  return (
    <AuthLayout title="Регистрация" subtitle="Создайте аккаунт, чтобы начать">
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
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
          <label className="mb-1.5 block text-sm font-medium text-[#111827]">Пароль</label>
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
          {password.length > 0 && password.length < 8 && (
            <div className="mt-1 text-[12px] text-content-secondary">Мин. 8 символов</div>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#111827]">Название компании</label>
          <input
            type="text"
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              setError(null);
            }}
            placeholder="Acme Corp"
            className="h-10 w-full rounded-md border border-border bg-[#fbfbfd] px-3 text-sm text-content-primary placeholder:text-content-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {error && <div className="text-[13px] font-medium text-red-500">{error}</div>}

        <Button type="submit" disabled={loading} className="mt-2 h-10 rounded-full w-full lowercase font-semibold text-[14px]">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          создать аккаунт
        </Button>
      </form>

      <div className="mt-8 text-center text-[13px] text-content-secondary">
        <span className="lowercase">уже есть аккаунт?</span>{' '}
        <Link to="/login" className="font-medium text-accent hover:underline lowercase">
          войти
        </Link>
      </div>
    </AuthLayout>
  );
}
