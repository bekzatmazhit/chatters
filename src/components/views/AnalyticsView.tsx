import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ModelIcon } from '@/components/ui/ModelIcon';
import { BrandAvatar } from '@/components/ui/BrandAvatar';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, ExternalLink, ShieldCheck, FileText, 
  Plus, Search, Filter, CheckCircle2, XCircle, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock Data
const MODELS_DATA = [
  { id: 'chatgpt', name: 'ChatGPT', sov: 42.8, trend: 4.2, runs: 1245 },
  { id: 'claude', name: 'Claude', sov: 35.4, trend: -1.2, runs: 980 },
  { id: 'gemini', name: 'Gemini', sov: 28.1, trend: 2.5, runs: 1102 },
  { id: 'perplexity', name: 'Perplexity', sov: 51.2, trend: 5.4, runs: 1530 },
];

const SOURCES_DATA = [
  { id: 1, domain: 'kaspi.kz', url: 'kaspi.kz/guide', citations: 452, prompt: 'какой банк выбрать', model: 'chatgpt', date: '2023-10-25', own: true },
  { id: 2, domain: 'halykbank.kz', url: 'halykbank.kz/cards', citations: 312, prompt: 'лучшие дебетовые карты', model: 'claude', date: '2023-10-24', own: false },
  { id: 3, domain: 'forbes.kz', url: 'forbes.kz/finances', citations: 128, prompt: 'рейтинг банков рк', model: 'perplexity', date: '2023-10-25', own: false },
  { id: 4, domain: 'nur.kz', url: 'nur.kz/tech', citations: 89, prompt: 'открыть ип онлайн', model: 'gemini', date: '2023-10-23', own: false },
];

const PROMPTS_DATA = [
  { id: 1, text: 'какой лучший банк для бизнеса в казахстане?', models: ['chatgpt', 'claude', 'gemini'], freq: 45, lastFound: true, active: true },
  { id: 2, text: 'открыть ип онлайн бесплатно', models: ['chatgpt', 'perplexity'], freq: 12, lastFound: false, active: true },
  { id: 3, text: 'отзывы о приложении каспи', models: ['claude', 'gemini'], freq: 84, lastFound: true, active: false },
];

const COMPARE_DATA = [
  { query: 'лучший банк', brand: 1, comp1: 2, comp2: 0, comp3: 4 },
  { query: 'карты с кэшбеком', brand: 0, comp1: 1, comp2: 2, comp3: 3 },
  { query: 'кредит для бизнеса', brand: 3, comp1: 1, comp2: 2, comp3: 0 },
];

const COMPARE_SOV_DATA = [
  { name: 'Бренд', sov: 42 },
  { name: 'Конкурент 1', sov: 38 },
  { name: 'Конкурент 2', sov: 25 },
  { name: 'Конкурент 3', sov: 15 },
];

const MARKET_DATA = [
  { id: 1, name: 'BCC', occurrences: 45, trend: 12 },
  { id: 2, name: 'ForteBank', occurrences: 32, trend: -5 },
  { id: 3, name: 'Jusan', occurrences: 28, trend: 8 },
];

export default function AnalyticsView() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const pathParts = location.pathname.split('/');
  // Fallback to 'models' if path is just /analytics
  const activeTab = pathParts[pathParts.length - 1] === 'analytics' ? 'models' : pathParts[pathParts.length - 1];

  const handleTabChange = (tab: string) => {
    navigate(`/workspace/${slug}/analytics/${tab}`, { replace: true });
  };

  const tabs = [
    { id: 'models', label: 'по моделям' },
    { id: 'sources', label: 'источники' },
    { id: 'prompts', label: 'промпты' },
    { id: 'compare', label: 'сравнение' },
    { id: 'market', label: 'рынок' },
  ];

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto pb-6">
      {/* Horizontal Tabs under breadcrumbs */}
      <div className="flex items-center gap-6 border-b border-border mb-6">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`pb-3 text-[13px] font-medium lowercase transition-colors relative ${activeTab === tab.id ? 'text-[#111827]' : 'text-content-secondary hover:text-[#111827]'}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-md"></div>}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-6">
        
        {/* TAB: MODELS */}
        {activeTab === 'models' && (
          <>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
              {MODELS_DATA.map(model => (
                <div key={model.id} className="bg-white border border-border rounded-xl p-4 shadow-sm flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <ModelIcon model={model.id} size={28} />
                    <div className="text-[14px] font-medium text-[#111827] capitalize">{model.name}</div>
                  </div>
                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <div className="text-[28px] font-medium text-[#111827] font-mono leading-none mb-1">{model.sov}%</div>
                      <div className="text-[11px] text-content-secondary lowercase font-mono">
                        {model.runs} проверок
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 text-[11px] font-medium font-mono px-1 py-0.5 rounded ${model.trend > 0 ? 'text-[#0F6E56] bg-[#E1F5EE]' : 'text-[#A32D2D] bg-[#FCEBEB]'}`}>
                      {model.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(model.trend)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Bar Chart */}
            <div className="bg-white border border-border rounded-xl p-5 shadow-sm flex-1 min-h-[300px]">
              <h2 className="eyebrow mb-6">сравнение sov по моделям</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MODELS_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'monospace' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'monospace' }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 rounded-lg border border-border shadow-lg font-mono text-[12px] flex items-center gap-2">
                              <ModelIcon model={payload[0].payload.id} size={16} />
                              <span className="font-medium text-[#111827]">{payload[0].value}%</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="sov" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {MODELS_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#6D5FE8" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* TAB: SOURCES */}
        {activeTab === 'sources' && (
          <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col flex-1 min-h-0">
            <div className="p-4 border-b border-border flex items-center justify-between gap-4">
              <div className="relative w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary" />
                <input type="text" placeholder="поиск по доменам..." className="w-full h-9 pl-9 pr-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none lowercase" />
              </div>
              <div className="flex items-center gap-2">
                <button className="h-9 px-3 flex items-center gap-2 bg-[#fbfbfd] border border-border rounded-md text-[13px] font-medium text-content-secondary hover:text-[#111827] lowercase transition-colors">
                  <Filter className="w-4 h-4" /> модель
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#fbfbfd] border-b border-border z-10">
                  <tr>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider">домен / url</th>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider text-right">цитирования</th>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider">промпт</th>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider">модель</th>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider">дата</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {SOURCES_DATA.map(src => (
                    <tr key={src.id} className="hover:bg-[#fbfbfd] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <a href={`https://${src.url}`} target="_blank" rel="noreferrer" className="text-[13px] font-medium text-[#111827] hover:text-accent transition-colors flex items-center gap-1.5">
                            {src.domain} <ExternalLink className="w-3 h-3 text-content-tertiary" />
                          </a>
                          {src.own && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-accent/10 text-accent flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> свой домен
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[13px] font-medium text-[#111827]">{src.citations}</td>
                      <td className="px-4 py-3 text-[12px] text-content-secondary truncate max-w-[200px]" title={src.prompt}>{src.prompt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <ModelIcon model={src.model} size={16} />
                          <span className="text-[12px] font-medium text-[#111827] capitalize">{src.model}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] text-content-secondary">{src.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: PROMPTS */}
        {activeTab === 'prompts' && (
          <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col flex-1 min-h-0">
            <div className="p-4 border-b border-border flex items-center justify-between gap-4">
              <div className="relative w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary" />
                <input type="text" placeholder="поиск промптов..." className="w-full h-9 pl-9 pr-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none lowercase" />
              </div>
              <div className="flex items-center gap-2">
                <button className="h-9 px-3 flex items-center gap-2 bg-[#fbfbfd] border border-border rounded-md text-[13px] font-medium text-content-secondary hover:text-[#111827] lowercase transition-colors">
                  массовое добавление
                </button>
                <Button className="h-9 px-4 rounded-md lowercase font-medium text-[13px]">
                  <Plus className="w-4 h-4 mr-1.5" /> добавить промпт
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#fbfbfd] border-b border-border z-10">
                  <tr>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider w-[40%]">текст промпта</th>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider">модели</th>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider text-right">частота</th>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider">посл. рез-т</th>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider w-[100px]">статус</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {PROMPTS_DATA.map(prompt => (
                    <tr key={prompt.id} className="hover:bg-[#fbfbfd] transition-colors">
                      <td className="px-4 py-3 text-[13px] font-medium text-[#111827] pr-8">{prompt.text}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {prompt.models.map(m => (
                            <ModelIcon key={m} model={m} size={16} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[13px] font-medium text-[#111827]">{prompt.freq}</td>
                      <td className="px-4 py-3">
                        {prompt.lastFound ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium font-mono text-[#0F6E56] bg-[#E1F5EE] lowercase">
                            найден
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium font-mono text-[#A32D2D] bg-[#FCEBEB] lowercase">
                            не найден
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`relative inline-flex h-4 w-7 cursor-pointer items-center rounded-full transition-colors ${prompt.active ? 'bg-accent' : 'bg-border'}`}>
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${prompt.active ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-content-tertiary hover:text-[#111827] transition-colors p-1">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: COMPARE */}
        {activeTab === 'compare' && (
          <div className="flex flex-col gap-6 flex-1 min-h-0">
            {/* Top Chart */}
            <div className="bg-white border border-border rounded-xl p-5 shadow-sm shrink-0 h-[220px] flex flex-col">
              <h2 className="eyebrow mb-4">доля голоса: мы vs конкуренты</h2>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={COMPARE_SOV_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'monospace' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'monospace' }} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: '1px solid #EDEAF5', fontSize: '12px', fontFamily: 'monospace' }} />
                    <Bar dataKey="sov" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {COMPARE_SOV_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#6D5FE8' : '#D1D5DB'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-white border border-border rounded-xl shadow-sm flex-1 flex flex-col min-h-0">
              <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
                <h2 className="eyebrow">матрица позиций по запросам</h2>
                <label className="flex items-center gap-2 cursor-pointer text-[12px] font-medium text-content-secondary lowercase">
                  <input type="checkbox" className="rounded border-border text-accent focus:ring-accent" />
                  только проигрышные промпты
                </label>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="sticky top-0 bg-[#fbfbfd] border-b border-border z-10">
                    <tr>
                      <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider w-1/3">запрос</th>
                      <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider border-l border-border/50 bg-accent/5 text-accent text-center">бренд</th>
                      <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider border-l border-border/50 text-center">конк 1</th>
                      <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider border-l border-border/50 text-center">конк 2</th>
                      <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider border-l border-border/50 text-center">конк 3</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {COMPARE_DATA.map((row, i) => (
                      <tr key={i} className="hover:bg-[#fbfbfd] transition-colors">
                        <td className="px-4 py-3 text-[12px] font-medium text-[#111827]">{row.query}</td>
                        <td className="px-4 py-3 text-center border-l border-border/50 bg-accent/5">
                          {row.brand > 0 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white font-mono text-[11px] font-bold">{row.brand}</span>
                          ) : (
                            <span className="text-content-muted font-mono">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center border-l border-border/50">
                          {row.comp1 > 0 ? <span className="font-mono text-[12px] font-medium text-content-secondary">#{row.comp1}</span> : <span className="text-content-muted font-mono">-</span>}
                        </td>
                        <td className="px-4 py-3 text-center border-l border-border/50">
                          {row.comp2 > 0 ? <span className="font-mono text-[12px] font-medium text-content-secondary">#{row.comp2}</span> : <span className="text-content-muted font-mono">-</span>}
                        </td>
                        <td className="px-4 py-3 text-center border-l border-border/50">
                          {row.comp3 > 0 ? <span className="font-mono text-[12px] font-medium text-content-secondary">#{row.comp3}</span> : <span className="text-content-muted font-mono">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MARKET */}
        {activeTab === 'market' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            {/* Top 5 Market Share */}
            <div className="lg:col-span-1 bg-white border border-border rounded-xl shadow-sm p-5 flex flex-col h-fit">
              <h2 className="eyebrow mb-4">топ-5 доминирующих брендов</h2>
              <div className="space-y-4">
                {[
                  { name: 'Kaspi', sov: 65, color: '#f87171' },
                  { name: 'Halyk', sov: 42, color: '#34d399' },
                  { name: 'BCC', sov: 28, color: '#60a5fa' },
                  { name: 'Forte', sov: 15, color: '#a78bfa' },
                  { name: 'Jusan', sov: 8, color: '#fbbf24' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[12px] font-medium text-[#111827] mb-1.5">
                      <span>{item.name}</span>
                      <span className="font-mono">{item.sov}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#fbfbfd] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.sov}%`, backgroundColor: item.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observed Unadded Competitors */}
            <div className="lg:col-span-2 bg-white border border-border rounded-xl shadow-sm flex flex-col min-h-0">
              <div className="p-4 border-b border-border">
                <h2 className="eyebrow">замеченные конкуренты</h2>
                <p className="text-[12px] text-content-secondary mt-1">Эти бренды часто упоминаются вместе с вашими запросами, но не отслеживаются.</p>
              </div>
              <div className="flex-1 overflow-auto p-2 custom-scrollbar">
                <div className="space-y-2">
                  {MARKET_DATA.map(comp => (
                    <div key={comp.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border hover:bg-[#fbfbfd] transition-colors">
                      <div className="flex items-center gap-3">
                        <BrandAvatar project={{ name: comp.name }} size={32} />
                        <div>
                          <div className="text-[13px] font-medium text-[#111827]">{comp.name}</div>
                          <div className="text-[11px] text-content-tertiary mt-0.5 lowercase font-mono">
                            {comp.occurrences} упоминаний
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-1 text-[11px] font-medium font-mono px-1.5 py-0.5 rounded ${comp.trend > 0 ? 'text-[#0F6E56] bg-[#E1F5EE]' : 'text-[#A32D2D] bg-[#FCEBEB]'}`}>
                          {comp.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(comp.trend)}%
                        </div>
                        <Button variant="outline" className="h-8 px-3 text-[11px] lowercase rounded-md bg-white">
                          <Plus className="w-3.5 h-3.5 mr-1" /> добавить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
