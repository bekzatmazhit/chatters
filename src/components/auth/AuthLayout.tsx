import React from 'react';
import { Link } from 'react-router-dom';

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title?: string, subtitle?: string }) {
  return (
    <div className="flex min-h-screen bg-[#fbfbfd] font-sans text-content-primary selection:bg-accent/20">
      {/* Left Form Area */}
      <div className="flex w-full flex-col justify-center px-4 sm:px-6 lg:w-1/2 lg:px-8">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-8 flex justify-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#111827] text-[15px] font-bold text-white transition-colors lowercase">
                C
              </div>
              <span className="text-[15px] font-semibold tracking-tight lowercase text-[#111827]">Chatters</span>
            </Link>
          </div>
          <div className="rounded-xl border border-border bg-white p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            {(title || subtitle) && (
              <div className="mb-6 text-center">
                {title && <h1 className="text-xl font-bold tracking-tight text-[#111827]">{title}</h1>}
                {subtitle && <p className="mt-2 text-sm text-content-secondary">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
      
      {/* Right Image Area */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#0b0d12]">
        <img
          src="/auth-bg.jpg"
          alt="Chatters AI visibility platform"
          className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-lighten"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-[#0b0d12]/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-16 text-white">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
            Видимость в ответах нейросетей — новый поиск
          </h2>
          <p className="text-lg text-white/70 max-w-[500px]">
            Узнайте, рекомендуют ли вас ChatGPT, Claude, Gemini и Perplexity. Отслеживайте тональность, конкурентов и пробелы в источниках.
          </p>
        </div>
      </div>
    </div>
  );
}
