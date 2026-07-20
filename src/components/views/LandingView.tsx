import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Bell, Check, Database, LineChart, ShieldCheck } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DemoDashboardPreview } from '../landing/DemoDashboardPreview';
import { DemoQueryTerminal } from '../landing/DemoQueryTerminal';
import { LandingNavbar } from '../landing/LandingNavbar';
import { PublicAuditSection } from '../landing/PublicAuditSection';
import PixelBlast from '../effects/PixelBlast';

const SectionLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('eyebrow font-mono text-[11px] tracking-[0.14em] text-content-muted', className)}>
    {children}
  </div>
);

const FeatureCard = ({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) => (
  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
    <div className="mb-7 flex h-9 w-9 items-center justify-center rounded-md bg-white/[0.06] text-white">
      <Icon className="h-4 w-4" />
    </div>
    <h3 className="mb-3 text-[17px] font-semibold text-white">{title}</h3>
    <p className="text-[14px] leading-6 text-content-secondary">{text}</p>
  </div>
);

const PricingCard = ({
  name,
  price,
  description,
  items,
  highlighted,
}: {
  name: string;
  price: string;
  description: string;
  items: string[];
  highlighted?: boolean;
}) => (
  <div
    className={cn(
      'flex min-h-[440px] flex-col rounded-lg border bg-white p-7',
      highlighted ? 'border-[#111827] shadow-[0_20px_60px_rgba(17,24,39,0.08)]' : 'border-border',
    )}
  >
    <div className="mb-7 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-[18px] font-semibold text-content-primary">{name}</h3>
        <p className="mt-2 text-[13px] leading-5 text-content-secondary">{description}</p>
      </div>
      {highlighted && (
        <span className="btn-label rounded-sm bg-[#111827] px-2 py-1 font-mono text-[10px] tracking-[0.12em] text-white">
          выбор команд
        </span>
      )}
    </div>

    <div className="mb-8">
      <span className="font-mono text-[38px] leading-none text-content-primary">{price}</span>
      {price.startsWith('$') && <span className="font-mono text-[13px] text-content-secondary"> / мес</span>}
    </div>

    <ul className="mb-8 flex flex-1 flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[14px] leading-5 text-content-primary">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <span>{item}</span>
        </li>
      ))}
    </ul>

    <Link to="/hub">
      <Button
        variant={highlighted ? 'primary' : 'secondary'}
        className={cn(
          'btn-label h-11 w-full rounded-md',
          highlighted && 'bg-[#111827] hover:bg-black',
        )}
      >
        {highlighted ? 'Попробовать бесплатно' : 'Выбрать тариф'}
      </Button>
    </Link>
  </div>
);

export default function LandingView() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-white font-sans text-content-primary selection:bg-accent/20">
      <LandingNavbar />

      <main>
        <section data-navbar-section data-navbar-theme="dark" className="dark relative min-h-screen overflow-hidden bg-[#0A0A0B]">
          <div className="absolute inset-0 z-0">
            {prefersReducedMotion ? (
              <div className="h-full w-full bg-[radial-gradient(circle_at_50%_10%,rgba(74,68,112,0.42),transparent_45%),linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px]" />
            ) : (
              <PixelBlast
                variant="square"
                pixelSize={8.5}
                color="#4A4470"
                patternScale={2.5}
                patternDensity={0.7}
                pixelSizeJitter={0.3}
                enableRipples
                rippleSpeed={0.4}
                rippleThickness={0.12}
                rippleIntensityScale={1.2}
                liquid={false}
                speed={0.4}
                edgeFade={0.3}
                transparent
              />
            )}
          </div>
          <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px] pointer-events-none" />
          <div className="absolute inset-x-0 top-0 z-0 h-[420px] bg-[radial-gradient(circle_at_50%_0%,rgba(109,95,232,0.18),transparent_58%)] pointer-events-none" />
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#0A0A0B]/30 to-[#0A0A0B] pointer-events-none" />
          
          {/* Readability scrim behind text */}
          <div 
            className="absolute inset-0 z-[5] pointer-events-none" 
            style={{ background: "radial-gradient(ellipse 600px 500px at 30% 40%, rgba(10,10,11,0.55) 0%, transparent 70%)" }} 
          />

          <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-20 md:px-8 md:pb-24 md:pt-28">
            <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <SectionLabel className="mb-6 text-[#8791aa]">
                  мониторинг видимости бренда в AI-ответах
                </SectionLabel>
                <h1 className="max-w-3xl text-[42px] font-semibold leading-[1.04] tracking-tight text-white md:text-[68px]">
                  Узнайте, как AI выбирает ваш бренд.
                </h1>
                <p className="mt-7 max-w-2xl text-[17px] leading-8 text-[rgba(255,255,255,0.72)] md:text-[19px]">
                  Chatters показывает, где вас рекомендуют ChatGPT, Claude, Gemini и Perplexity,
                  с кем сравнивают и какие источники влияют на выдачу.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link to="/hub">
                    <Button size="lg" className="btn-label h-12 rounded-md bg-white px-6 text-[#0b0d12] hover:bg-white/90">
                      Запустить проверку
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <a href="#product">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="btn-label h-12 rounded-md border-white/14 bg-white/[0.04] px-6 text-white hover:bg-white/[0.08]"
                    >
                      Посмотреть дашборд
                    </Button>
                  </a>
                </div>

                <div className="mt-10 grid max-w-xl grid-cols-3 gap-5 border-t border-white/10 pt-7">
                  {[
                    ['4', 'AI-модели'],
                    ['340', 'запросов в демо'],
                    ['24ч', 'до первого отчета'],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <div className="font-mono text-[24px] text-white">{value}</div>
                      <div className="mt-1 text-[12px] leading-4 text-[rgba(255,255,255,0.72)]">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <DemoQueryTerminal />
            </div>
          </div>
        </section>

        <section id="product" data-navbar-section data-navbar-theme="light" className="light border-b border-border bg-[#f7f8fb] py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-11 grid gap-7 md:grid-cols-[0.78fr_1fr] md:items-end">
              <div>
                <SectionLabel className="mb-5">01 / рабочий экран</SectionLabel>
                <h2 className="max-w-2xl text-[34px] font-semibold leading-[1.12] tracking-tight md:text-[48px]">
                  Не витрина метрик. Инструмент для решений.
                </h2>
              </div>
              <p className="max-w-2xl text-[16px] leading-7 text-content-secondary">
                На одном экране видно долю голоса, последние ответы моделей, динамику упоминаний
                и источники, где конкуренты уже присутствуют, а вас еще нет.
              </p>
            </div>

            <DemoDashboardPreview />
          </div>
        </section>

        <section id="workflow" data-navbar-section data-navbar-theme="dark" className="dark bg-[#0b0d12] py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-12 max-w-3xl">
              <SectionLabel className="mb-5 text-white/45">02 / как работает</SectionLabel>
              <h2 className="text-[34px] font-semibold leading-[1.12] tracking-tight text-white md:text-[48px]">
                От запроса клиента до понятного списка действий.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <FeatureCard
                icon={Database}
                title="Собираете реальные запросы"
                text="Импортируйте поисковые фразы, категории и вопросы покупателей. Можно начать с короткого списка и расширять его по мере работы."
              />
              <FeatureCard
                icon={BarChart3}
                title="Сравниваете ответы моделей"
                text="Система фиксирует упоминания брендов, позиции, тональность, источники и конкурентов в каждом ответе."
              />
              <FeatureCard
                icon={Bell}
                title="Получаете задачи"
                text="Chatters показывает, какие страницы, обзоры и каталоги стоит закрыть в первую очередь, чтобы улучшить AI-видимость."
              />
            </div>
          </div>
        </section>

        <section data-navbar-section data-navbar-theme="light" className="light border-b border-border bg-white py-20 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[0.8fr_1fr] md:px-8">
            <div>
              <SectionLabel className="mb-5">03 / контроль качества</SectionLabel>
              <h2 className="text-[34px] font-semibold leading-[1.12] tracking-tight md:text-[46px]">
                Спокойная аналитика без лишнего шума.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [LineChart, 'Тренды по дням', 'Отслеживайте рост и падения видимости после публикаций, PR и обновлений сайта.'],
                [ShieldCheck, 'Проверка источников', 'Видно, какие домены модели цитируют и насколько они важны в вашей категории.'],
                [BarChart3, 'Share of Voice', 'Сравнение с конкурентами не в SEO-индексе, а прямо в ответах AI.'],
                [Bell, 'Алерты', 'Команда получает сигнал, когда бренд исчезает из выдачи или появляется новый конкурент.'],
              ].map(([Icon, title, text]) => (
                <div key={title as string} className="rounded-lg border border-border bg-[#fbfbfd] p-6">
                  {React.createElement(Icon as React.ElementType, { className: 'mb-6 h-5 w-5 text-content-primary' })}
                  <h3 className="mb-2 text-[16px] font-semibold">{title as string}</h3>
                  <p className="text-[14px] leading-6 text-content-secondary">{text as string}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" data-navbar-section data-navbar-theme="light" className="light bg-[#f7f8fb] py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-11 max-w-2xl">
              <SectionLabel className="mb-5">04 / тарифы</SectionLabel>
              <h2 className="text-[34px] font-semibold leading-[1.12] tracking-tight md:text-[48px]">
                Простые планы без оплаты за каждый прогон.
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <PricingCard
                name="Starter"
                price="$49"
                description="Для основателей и небольших команд, которые проверяют позиционирование."
                items={[
                  '50 отслеживаемых запросов',
                  'ChatGPT и Perplexity',
                  'Еженедельные прогоны',
                  'Доля голоса и тональность',
                  '1 воркспейс',
                ]}
              />
              <PricingCard
                highlighted
                name="Growth"
                price="$199"
                description="Для маркетинга, PR и продуктовых команд с регулярной отчетностью."
                items={[
                  '500 отслеживаемых запросов',
                  'Все 4 AI-модели',
                  'Ежедневные прогоны',
                  'Пробелы в источниках',
                  'Уведомления в Slack или Telegram',
                ]}
              />
              <PricingCard
                name="Agency"
                price="Custom"
                description="Для агентств и команд, которые ведут несколько брендов."
                items={[
                  'Без лимита воркспейсов',
                  'White-label отчеты',
                  'API-доступ',
                  'Приоритетная поддержка',
                  'Помощь с внедрением',
                ]}
              />
            </div>
          </div>
        </section>

        <PublicAuditSection />
      </main>

      <footer className="light border-t border-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#111827] text-[13px] font-bold text-white lowercase">
              C
            </div>
            <span className="text-[14px] font-semibold text-[#111827] lowercase">Chatters</span>
            <span className="text-[13px] text-content-secondary">© 2026</span>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-[13px] text-content-secondary">
            <a className="hover:text-content-primary lowercase" href="#pricing">
              Тарифы
            </a>
            <Link className="hover:text-content-primary lowercase" to="/sandbox">
              Дизайн-система
            </Link>
            <Link className="hover:text-content-primary lowercase" to="/hub">
              Войти
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
