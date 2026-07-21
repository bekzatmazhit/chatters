import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { AccountSelectorModal } from '../auth/AccountSelectorModal';

const navItems = [
  { label: 'Аудит', href: '/audit' },
  { label: 'Как работает', href: '#workflow' },
  { label: 'Тарифы', href: '#pricing' },
  { label: 'Ресерч', href: '/research' },
  { label: 'Документация', href: '/docs' },
];

export function LandingNavbar() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setIsAuthenticated(Boolean(data.session));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-navbar-section]'));
    if (!sections.length) return;

    const updateTheme = () => {
      const probeY = 66;
      const current = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= probeY && rect.bottom >= probeY;
      });

      setTheme(current?.dataset.navbarTheme === 'light' ? 'light' : 'dark');
    };

    const observer = new IntersectionObserver(updateTheme, {
      root: null,
      threshold: [0, 0.1, 0.5, 1],
      rootMargin: '-64px 0px 0px 0px',
    });

    sections.forEach((section) => observer.observe(section));
    updateTheme();
    window.addEventListener('scroll', updateTheme, { passive: true });
    window.addEventListener('resize', updateTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateTheme);
      window.removeEventListener('resize', updateTheme);
    };
  }, []);

  const isLight = theme === 'light';

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header
        data-navbar-theme={theme}
        className={cn(
          'fixed inset-x-0 top-0 z-50 h-16 border-b backdrop-blur-xl transition-colors duration-300',
          isLight
            ? 'border-black/10 bg-white/90 text-[#111827] shadow-[0_10px_32px_rgba(17,24,39,0.06)]'
            : 'border-white/10 bg-[#08090d]/90 text-white shadow-[0_10px_36px_rgba(0,0,0,0.28)]',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md text-[15px] font-bold transition-colors lowercase',
                isLight ? 'bg-[#111827] text-white' : 'bg-white text-[#0b0d12]',
              )}
            >
              C
            </div>
            <span className="text-[15px] font-semibold tracking-tight lowercase">Chatters</span>
          </Link>

          <nav
            className={cn(
              'hidden items-center gap-1 rounded-full border px-1.5 py-1 md:flex',
              isLight ? 'border-black/10 bg-black/5' : 'border-white/10 bg-white/5',
            )}
          >
            {navItems.map((item) =>
              item.href.startsWith('#') ? (
                <a
                  key={item.href}
                  className={cn(
                    'landing-nav-link rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors lowercase',
                    isLight ? 'text-black/60 hover:bg-black/5 hover:text-black' : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )}
                  href={item.href}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  className={cn(
                    'landing-nav-link rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors lowercase',
                    isLight ? 'text-black/60 hover:bg-black/5 hover:text-black' : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )}
                  to={item.href}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <Button
                onClick={() => setIsAccountModalOpen(true)}
                className={cn(
                  'btn-label h-9 rounded-full px-4 lowercase',
                  isLight ? 'bg-[#111827] text-white hover:bg-black' : 'bg-white text-[#0b0d12] hover:bg-white/90',
                )}
              >
                К проектам
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setIsAccountModalOpen(true)}
                  variant="ghost"
                  className={cn(
                    'btn-label hidden h-9 rounded-full px-3 sm:inline-flex lowercase',
                    isLight ? 'text-black/60 hover:bg-black/5 hover:text-black' : 'text-white/60 hover:bg-white/10 hover:text-white',
                  )}
                >
                  Войти
                </Button>
                <Link to="/signup">
                  <Button
                    className={cn(
                      'btn-label h-9 rounded-full px-4 lowercase',
                      isLight ? 'bg-[#111827] text-white hover:bg-black' : 'bg-white text-[#0b0d12] hover:bg-white/90',
                    )}
                  >
                    Начать бесплатно
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}

            <button
              aria-label={isMenuOpen ? 'закрыть меню' : 'открыть меню'}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-full transition md:hidden',
                isLight ? 'text-black hover:bg-black/5' : 'text-white hover:bg-white/8',
              )}
              type="button"
              onClick={() => setIsMenuOpen((value) => !value)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div
            className={cn(
              'fixed inset-x-0 top-16 z-40 min-h-[calc(100vh-64px)] animate-in fade-in duration-200 md:hidden',
              isLight ? 'bg-white/96 text-[#111827]' : 'bg-[#0a0a0b]/96 text-white',
            )}
          >
            <nav className="flex flex-col gap-1 px-5 py-6">
              {navItems.map((item) =>
                item.href.startsWith('#') ? (
                  <a
                    key={item.href}
                    className={cn(
                      'landing-nav-link rounded-md px-1 py-4 text-[22px] font-semibold lowercase',
                      isLight ? 'text-black/78' : 'text-white/82',
                    )}
                    href={item.href}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    className={cn(
                      'landing-nav-link rounded-md px-1 py-4 text-[22px] font-semibold lowercase',
                      isLight ? 'text-black/78' : 'text-white/82',
                    )}
                    to={item.href}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
          </div>
        )}
      </header>

      <AccountSelectorModal 
        isOpen={isAccountModalOpen} 
        onClose={() => setIsAccountModalOpen(false)} 
      />
    </>
  );
}
