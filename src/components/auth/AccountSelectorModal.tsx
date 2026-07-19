import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface AccountSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountSelectorModal({ isOpen, onClose }: AccountSelectorModalProps) {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0b] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : session ? (
          <div className="flex flex-col">
            <h2 className="mb-6 text-xl font-semibold text-white">Выберите аккаунт</h2>
            
            <div className="flex flex-col gap-3">
              {/* Текущий авторизованный аккаунт */}
              <button 
                onClick={() => {
                  onClose();
                  navigate('/workspace');
                }}
                className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 text-left transition-colors hover:border-accent/50 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-white">Текущий аккаунт</span>
                    <span className="text-[13px] text-white/60">{session.user.email}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-accent" />
              </button>

              {/* Добавить аккаунт (переход на логин) */}
              <button 
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="group flex items-center gap-3 rounded-lg border border-transparent p-4 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-white/30 text-white/50 group-hover:border-white/50 group-hover:text-white">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="font-medium text-white/70 group-hover:text-white">Войти в другой аккаунт</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
              <User className="h-6 w-6 text-white/60" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white">Вход в систему</h2>
            <p className="mb-6 text-[14px] text-white/60">
              Вы не авторизованы. Войдите, чтобы продолжить работу с проектами.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="h-11 w-full bg-white text-[#0b0d12] hover:bg-white/90"
              >
                Перейти ко входу
              </Button>
              <Button 
                variant="ghost"
                onClick={() => {
                  onClose();
                  navigate('/signup');
                }}
                className="h-11 w-full text-white/60 hover:bg-white/5 hover:text-white"
              >
                Создать аккаунт
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
