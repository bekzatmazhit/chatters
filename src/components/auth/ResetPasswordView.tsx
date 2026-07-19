import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordView() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Optionally listen for auth hash changes if supabase handles it via fragment
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // We are ready to update password
      }
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      setError('Пароль должен содержать не менее 8 символов');
      return;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      navigate('/login', { state: { message: 'пароль обновлён, войдите заново' } });
    }
  };

  return (
    <AuthLayout title="Новый пароль" subtitle="Придумайте надежный пароль">
      <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#111827]">Новый пароль</label>
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
          <label className="mb-1.5 block text-sm font-medium text-[#111827]">Повторите пароль</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError(null);
            }}
            placeholder="••••••••"
            className="h-10 w-full rounded-md border border-border bg-[#fbfbfd] px-3 text-sm text-content-primary placeholder:text-content-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {error && <div className="text-[13px] font-medium text-red-500">{error}</div>}

        <Button type="submit" disabled={loading} className="mt-2 h-10 rounded-full w-full lowercase font-semibold text-[14px]">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          сохранить пароль
        </Button>
      </form>
    </AuthLayout>
  );
}
