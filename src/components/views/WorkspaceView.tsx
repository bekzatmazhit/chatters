import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ModelIcon } from '@/components/ui/ModelIcon';
import { 
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, 
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

export default function WorkspaceView() {
  const { slug } = useParams();
  
  const [sovPeriod, setSovPeriod] = useState(30);

  // Generate SOV Data with forecast
  const sovData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = sovPeriod; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const val = Math.max(20, Math.min(80, 50 - (i * 0.3) + Math.sin(i / 2) * 5));
      data.push({ 
        date: d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }), 
        value: Math.round(val),
        isForecast: false
      });
    }
    
    // Add forecast
    if (sovPeriod >= 14) {
      const lastVal = data[data.length - 1].value;
      for (let i = 1; i <= 5; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        data.push({
          date: d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }), 
          value: Math.round(lastVal - i * 1.5), // Simulate stable drop
          isForecast: true
        });
      }
    }
    return data;
  }, [sovPeriod]);

  const isStableDrop = sovPeriod >= 14 && sovData[sovData.length - 1].value < sovData[sovData.length - 6].value;

  // Generate Sentiment Data
  const sentimentData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 14; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const pos = 40 + Math.sin(i) * 10;
      const neg = 20 + Math.cos(i) * 5;
      const neu = 100 - pos - neg;
      data.push({ 
        date: d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
        positive: Math.round(pos),
        neutral: Math.round(neu),
        negative: Math.round(neg)
      });
    }
    return data;
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg border border-border shadow-lg font-mono text-[12px]">
          <p className="font-medium text-content-primary mb-2 uppercase">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-content-secondary lowercase">{entry.name}:</span>
              </div>
              <span className="font-medium text-content-primary">{entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-8">
      
      {/* 1. Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SOV */}
        <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex items-center justify-between">
            <div className="eyebrow">доля голоса (sov)</div>
            <div className="flex items-center gap-1 text-[#0F6E56] text-[11px] font-medium font-mono bg-[#E1F5EE] px-1 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3" /> +4.2%
            </div>
          </div>
          <div className="mt-2">
            <div className="text-[28px] font-medium text-[#111827] font-mono leading-none">42.8%</div>
            <div className="text-[12px] text-content-secondary mt-1.5 lowercase">среди 4 конкурентов</div>
          </div>
        </div>

        {/* Mentions */}
        <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex items-center justify-between">
            <div className="eyebrow">упоминания</div>
            <div className="flex items-center gap-1 text-[#0F6E56] text-[11px] font-medium font-mono bg-[#E1F5EE] px-1 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3" /> +124
            </div>
          </div>
          <div className="mt-2">
            <div className="text-[28px] font-medium text-[#111827] font-mono leading-none">1 842</div>
            <div className="text-[12px] text-content-secondary mt-1.5 lowercase">за последние 7 дней</div>
          </div>
        </div>

        {/* Sentiment */}
        <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex items-center justify-between">
            <div className="eyebrow">тональность</div>
          </div>
          <div className="mt-2">
            <div className="flex items-end gap-2 mb-2">
              <div className="text-[28px] font-medium text-[#111827] font-mono leading-none">58%</div>
              <div className="text-[12px] text-content-secondary mb-0.5 lowercase">позитив</div>
            </div>
            <div className="w-full h-2 bg-[#fbfbfd] rounded-full overflow-hidden flex">
              <div className="h-full bg-[#0F6E56]" style={{ width: '58%' }} title="Позитив"></div>
              <div className="h-full bg-gray-300" style={{ width: '28%' }} title="Нейтрал"></div>
              <div className="h-full bg-[#A32D2D]" style={{ width: '14%' }} title="Негатив"></div>
            </div>
          </div>
        </div>

        {/* AIO Score */}
        <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex items-center justify-between">
            <div className="eyebrow">aio-скор</div>
            <div className="flex items-center gap-1 text-[#A32D2D] text-[11px] font-medium font-mono bg-[#FCEBEB] px-1 py-0.5 rounded">
              <ArrowDownRight className="w-3 h-3" /> -1.5
            </div>
          </div>
          <div className="mt-2">
            <div className="text-[28px] font-medium text-[#111827] font-mono leading-none">76<span className="text-lg text-content-tertiary">/100</span></div>
            <div className="text-[12px] text-content-secondary mt-1.5 lowercase">композитный рейтинг</div>
          </div>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          
          {/* 2. Динамика SOV */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="eyebrow">динамика sov</h2>
              <div className="flex bg-[#fbfbfd] rounded-md p-0.5 border border-border">
                {[7, 30, 90].map(days => (
                  <button
                    key={days}
                    onClick={() => setSovPeriod(days)}
                    className={`px-3 py-1 text-[11px] font-medium rounded lowercase transition-colors font-mono ${sovPeriod === days ? 'bg-white shadow-sm text-[#111827] border border-border/50' : 'text-content-secondary hover:text-[#111827]'}`}
                  >
                    {days} дн
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sovData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }}
                    minTickGap={30}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {sovPeriod >= 14 && (
                    <ReferenceLine x={sovData[sovData.length - 6]?.date} stroke="#9CA3AF" strokeDasharray="3 3" />
                  )}

                  <Line 
                    type="monotone" 
                    dataKey="value"
                    name="SOV"
                    stroke="#6D5FE8"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {isStableDrop && (
              <div className="mt-4 flex items-start gap-2 bg-[#FCEBEB] border border-red-100 p-3 rounded-lg text-[#A32D2D] text-[13px] leading-snug">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#A32D2D] mt-0.5" />
                <span>Замечено устойчивое падение SOV в выдаче. Рекомендуется проанализировать источники конкурентов и обновить базу фактов.</span>
              </div>
            )}
          </div>

          {/* 4. Mini Models Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'chatgpt', name: 'ChatGPT', sov: 48.2 },
              { id: 'claude', name: 'Claude', sov: 35.1 },
              { id: 'gemini', name: 'Gemini', sov: 41.0 },
              { id: 'perplexity', name: 'Perplexity', sov: 52.4 }
            ].map(model => (
              <div key={model.id} className="bg-white border border-border rounded-xl p-3 shadow-sm flex flex-col items-center text-center hover:bg-[#fbfbfd] cursor-pointer transition-colors">
                <ModelIcon model={model.id} size={32} className="mb-2" />
                <span className="text-[12px] font-medium text-[#111827] mb-0.5">{model.name}</span>
                <span className="text-[13px] font-mono font-medium text-[#111827]">{model.sov}%</span>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          
          {/* 3. Sentiment Stacked Area Chart */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-5 h-[324px] flex flex-col">
            <h2 className="eyebrow mb-6 shrink-0">тональность по времени</h2>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sentimentData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }}
                    minTickGap={20}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="positive" name="Позитив" stackId="1" stroke="#0F6E56" fill="#0F6E56" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="neutral" name="Нейтрал" stackId="1" stroke="#d1d5db" fill="#d1d5db" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="negative" name="Негатив" stackId="1" stroke="#A32D2D" fill="#A32D2D" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 shrink-0">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-content-secondary lowercase">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#E1F5EE] border border-[#0F6E56]"></div> позитив
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-content-secondary lowercase">
                <div className="w-2.5 h-2.5 rounded-sm bg-gray-300/20 border border-gray-400"></div> нейтрал
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-content-secondary lowercase">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#FCEBEB] border border-[#A32D2D]"></div> негатив
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* 5. Top Changes */}
            <div className="bg-white border border-border rounded-xl shadow-sm p-5 flex flex-col">
              <h2 className="eyebrow mb-4 shrink-0">топ изменений за неделю</h2>
              <div className="flex-1 space-y-3">
                {[
                  { name: 'ChatGPT 4o', change: -3.2 },
                  { name: 'Claude 3.5 Sonnet', change: 1.8 },
                  { name: 'Perplexity', change: -0.5 },
                  { name: 'Gemini 1.5 Pro', change: 2.1 },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1 pb-2 border-b border-border/50 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-[#111827]">{item.name}</span>
                      <div className={`flex items-center gap-1 text-[12px] font-medium font-mono ${item.change > 0 ? 'text-[#0F6E56]' : 'text-[#A32D2D]'}`}>
                        {item.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(item.change).toFixed(1)} п.п.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Alerts */}
            <div className="bg-white border border-border rounded-xl shadow-sm p-5 flex flex-col">
              <h2 className="eyebrow mb-4 shrink-0">последние алерты</h2>
              <div className="flex-1 space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#A32D2D] mt-1.5 shrink-0"></div>
                  <div>
                    <div className="text-[12px] font-medium text-[#111827] leading-snug">Резкое падение позитива в ChatGPT</div>
                    <div className="text-[10px] text-content-tertiary font-mono mt-0.5">2 часа назад</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0"></div>
                  <div>
                    <div className="text-[12px] font-medium text-[#111827] leading-snug">Новый конкурент в ответах Claude</div>
                    <div className="text-[10px] text-content-tertiary font-mono mt-0.5">вчера</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                  <div>
                    <div className="text-[12px] font-medium text-[#111827] leading-snug">Галлюцинация по тарифам в Gemini</div>
                    <div className="text-[10px] text-content-tertiary font-mono mt-0.5">2 дня назад</div>
                  </div>
                </div>
              </div>
              <Link to={`/workspace/${slug}/monitoring/alerts`} className="block mt-4 pt-3 border-t border-border text-[11px] font-medium text-accent hover:underline lowercase tracking-wide">
                все алерты &rarr;
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
