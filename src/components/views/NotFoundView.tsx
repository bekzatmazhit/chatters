import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#@$%&';

function useGlitchText(text: string, active: boolean) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!active) {
      setDisplay(text);
      return;
    }
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((char, idx) => {
            if (char === ' ') return ' ';
            if (idx < iteration) return text[idx];
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          })
          .join('')
      );
      iteration += 0.4;
      if (iteration >= text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [text, active]);

  return display;
}

export default function NotFoundView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [glitchActive, setGlitchActive] = useState(true);
  const [countdown, setCountdown] = useState(8);

  const title = useGlitchText('страница не найдена', glitchActive);

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/');
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  const triggerGlitch = () => {
    setGlitchActive(false);
    setTimeout(() => setGlitchActive(true), 80);
  };

  const suggestions = [
    { label: 'на главную', path: '/' },
    { label: 'войти', path: '/login' },
    { label: 'в мой хаб', path: '/hub' },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(109,95,232,0.16),_transparent_35%),linear-gradient(135deg,_#f8f8ff_0%,_#f3f4f6_100%)] flex items-center justify-center px-5 py-12 font-sans select-none">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-[-10%] top-[-12%] h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-[-8%] bottom-[-12%] h-72 w-72 rounded-full bg-[#111827]/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl rounded-[28px] border border-border bg-white/85 p-8 shadow-[0_30px_100px_rgba(17,24,39,0.08)] backdrop-blur md:p-12">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="text-center lg:text-left">
            <div className="mb-4 inline-flex items-center rounded-full border border-border bg-[#fbfbfd] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-content-secondary">
              404 · route lost
            </div>
            <div
              className="mb-4 text-[92px] font-black leading-none tracking-[-0.05em] text-[#111827] md:text-[132px]"
              onMouseEnter={triggerGlitch}
            >
              <span className="text-accent">4</span>
              <span>0</span>
              <span className="text-accent">4</span>
            </div>
            <h1
              className="mb-4 text-[20px] font-semibold text-[#111827] md:text-[26px]"
              onMouseEnter={triggerGlitch}
            >
              {title}
            </h1>
            <p className="max-w-md text-[15px] leading-7 text-content-secondary">
              Похоже, маршрут ушёл в несуществующий раздел. Мы сохранили для вас быстрые переходы к рабочему пространству и стартовой странице.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-[#fbfbfd] p-5 shadow-sm">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-[12px] font-mono text-content-tertiary">
              <span className="text-content-muted">путь:</span>
              <span className="max-w-[220px] truncate font-semibold text-[#111827]">{location.pathname}</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate(-1)}
                className="h-10 rounded-full border border-border bg-white px-4 text-[13px] font-medium text-content-secondary transition-colors hover:border-[#111827] hover:text-[#111827]"
              >
                ← назад
              </button>
              {suggestions.map((s) => (
                <Link
                  key={s.path}
                  to={s.path}
                  className="flex h-10 items-center rounded-full border border-border bg-white px-4 text-[13px] font-medium text-content-secondary transition-colors hover:border-[#111827] hover:text-[#111827]"
                >
                  {s.label}
                </Link>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-border bg-white p-4">
              <div className="mb-2 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-content-muted">
                <span>автоперенаправление</span>
                <span>{countdown}с</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 8) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
