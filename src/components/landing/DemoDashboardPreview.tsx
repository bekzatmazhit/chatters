import React from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { ModelIcon } from '@/components/ui/ModelIcon';

const chartData = [
  { value: 14 },
  { value: 18 },
  { value: 17 },
  { value: 24 },
  { value: 27 },
  { value: 33 },
  { value: 31 },
  { value: 42 },
  { value: 46 },
  { value: 51 },
  { value: 48 },
  { value: 64 },
];

const rows = [
  {
    query: 'лучший сервис мониторинга AI-видимости',
    model: 'gpt-4o',
    mentioned: true,
    position: '#1',
    sentiment: '+0.78',
    sources: '4',
  },
  {
    query: 'альтернативы semrush для AI search',
    model: 'claude-3.5',
    mentioned: true,
    position: '#2',
    sentiment: '+0.51',
    sources: '3',
  },
  {
    query: 'как отслеживать упоминания в ChatGPT',
    model: 'perplexity',
    mentioned: true,
    position: '#1',
    sentiment: '+0.90',
    sources: '5',
  },
  {
    query: 'самый дешевый SEO-инструмент',
    model: 'gemini-2',
    mentioned: false,
    position: '-',
    sentiment: '-',
    sources: '-',
  },
  {
    query: 'платформы для brand monitoring',
    model: 'gpt-4o',
    mentioned: true,
    position: '#3',
    sentiment: '+0.22',
    sources: '6',
  },
  {
    query: 'топ AI visibility tools для B2B',
    model: 'claude-3.5',
    mentioned: false,
    position: '-',
    sentiment: '-',
    sources: '-',
  },
];

const sourceGaps = [
  { domain: 'producthunt.com', citations: 42, models: ['ChatGPT', 'Perplexity'] },
  { domain: 'news.ycombinator.com', citations: 31, models: ['Claude', 'Perplexity'] },
  { domain: 'reddit.com/r/marketing', citations: 28, models: ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'] },
  { domain: 'g2.com/categories/seo', citations: 24, models: ['ChatGPT', 'Gemini'] },
];

export function DemoDashboardPreview() {
  return (
    <div className="mx-auto w-full max-w-[1080px] overflow-hidden rounded-lg border border-border bg-white shadow-[0_24px_80px_rgba(17,24,39,0.07)]">
      <div className="flex flex-col gap-4 border-b border-border px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-content-muted">brand workspace</div>
          <div className="mt-1 text-[15px] font-semibold text-content-primary">B2B SaaS · AI visibility</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['ChatGPT', 'Claude', 'Gemini', 'Perplexity'].map((model) => (
            <span key={model} className="flex items-center gap-1.5 rounded-md border border-border bg-[#fbfbfd] px-2.5 py-1 text-[12px] text-content-secondary">
              <ModelIcon model={model} size={14} className="opacity-80" />
              {model}
            </span>
          ))}
        </div>
      </div>

      <div className="grid border-b border-border md:grid-cols-[1.1fr_0.9fr]">
        <section className="border-b border-border p-5 md:border-b-0 md:border-r md:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-content-muted">доля голоса</span>
            <span className="font-mono text-[11px] text-content-muted">30 дней · 340 запросов</span>
          </div>

          <div className="mb-4 flex h-10 w-full overflow-hidden rounded-md bg-surface">
            {[
              ['34%', 'bg-[#111827] text-white', '34%'],
              ['26%', 'bg-[#5b6472] text-white', '26%'],
              ['18%', 'bg-[#9aa1ad] text-white', '18%'],
              ['12%', 'bg-[#d7dbe3] text-content-primary', '12%'],
              ['', 'bg-[#eef0f4]', '10%'],
            ].map(([label, className, width], index) => (
              <div
                key={`${width}-${index}`}
                className={cn('flex items-center justify-center font-mono text-[12px]', className)}
                style={{ width }}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              ['Ваш бренд', '#111827'],
              ['Конкурент A', '#5b6472'],
              ['Конкурент B', '#9aa1ad'],
              ['Конкурент C', '#d7dbe3'],
              ['Остальные', '#eef0f4'],
            ].map(([label, color]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[12px] text-content-secondary">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-content-muted">объем упоминаний</span>
            <span className="rounded-sm bg-success-bg px-2 py-0.5 font-mono text-[11px] text-success">+433%</span>
          </div>

          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[42px] leading-none text-content-primary">64</div>
              <div className="mt-1 text-[12px] text-content-secondary">упоминания сегодня</div>
            </div>
            <div className="text-right font-mono text-[11px] leading-5 text-content-muted">
              <div>минимум: 12</div>
              <div>среднее: 34</div>
            </div>
          </div>

          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="mentionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111827" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="value"
                  fill="url(#mentionsGradient)"
                  stroke="#111827"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid md:grid-cols-[1.24fr_0.76fr]">
        <section className="overflow-hidden border-b border-border p-5 md:border-b-0 md:border-r md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-content-muted">последние прогоны</span>
            <span className="font-mono text-[11px] text-content-muted">6 из 340</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border">
                  {['Запрос', 'Модель', 'Упомянут', 'Поз.', 'Тон', 'Ист.'].map((head) => (
                    <th key={head} className="pb-3 pr-4 font-mono text-[10px] font-normal uppercase tracking-[0.08em] text-content-muted">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.query}-${row.model}`} className="border-b border-border/60 last:border-0">
                    <td className="max-w-[260px] truncate py-3 pr-4 text-[12px] text-content-primary">{row.query}</td>
                    <td className="py-3 pr-4 font-mono text-[11px] text-content-secondary">
                      <div className="flex items-center gap-1.5">
                        <ModelIcon model={row.model} size={14} className="opacity-70" />
                        {row.model}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 font-mono text-[11px]',
                          row.mentioned ? 'text-success' : 'text-content-muted',
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', row.mentioned ? 'bg-success' : 'bg-content-muted')} />
                        {row.mentioned ? 'да' : 'нет'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-[11px] text-content-primary">{row.position}</td>
                    <td className="py-3 pr-4 font-mono text-[11px]">
                      <span className={row.sentiment.startsWith('+') ? 'text-success' : 'text-content-muted'}>
                        {row.sentiment}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-[11px] text-content-secondary">{row.sources}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-[#fbfbfd] p-5 md:p-6">
          <div className="mb-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-content-muted">пробелы в источниках</span>
            <p className="mt-2 text-[13px] leading-5 text-content-secondary">
              Домены, которые модели цитируют в категории, но где бренд пока не представлен.
            </p>
          </div>

          <div className="grid gap-3">
            {sourceGaps.map((item) => (
              <div key={item.domain} className="rounded-md border border-border bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate font-mono text-[12px] text-content-primary">{item.domain}</div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-content-secondary">
                      <span>цитируют:</span>
                      <div className="flex items-center gap-1">
                        {item.models.map((m) => (
                          <ModelIcon key={m} model={m} size={14} className="opacity-70" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[18px] leading-none text-content-primary">{item.citations}</div>
                    <div className="mt-1 text-[10px] uppercase text-content-muted">цит.</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
