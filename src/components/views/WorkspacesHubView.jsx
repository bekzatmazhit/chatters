import React, { useState, useMemo, useEffect } from 'react';
import { useBrands } from '../BrandContext';
import { useTheme } from '../ThemeContext';
import { BrandAvatar } from '@/components/ui/BrandAvatar';
import { 
  Plus, Star, Activity, FileText, Zap, TrendingUp, ChevronRight, Download, BarChart2,
  Video, PlaySquare, Search, Moon, Sun, Bell, Settings, Users, CreditCard, LogOut,
  RefreshCw, TrendingDown, ArrowUpRight, ArrowDownRight, MoreVertical
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function WorkspacesHubView({ onQuickAction }) {
  const { brands, setActiveBrandId } = useBrands();
  const { theme, toggleTheme } = useTheme();
  
  const [showCreate, setShowCreate] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [sovPeriod, setSovPeriod] = useState(30);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Background Grid Style
  const gridPattern = {
    backgroundImage: `linear-gradient(to right, ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px), linear-gradient(to bottom, ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
    backgroundSize: '24px 24px'
  };

  // Fake SOV history generator
  const sovHistory = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = sovPeriod; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const point = { date: d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }) };
      brands.forEach(b => {
        const seed = b.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const baseSov = (seed % 40) + 20;
        const noise = Math.sin(i / 3) * 5 + Math.cos(i / 7) * 3;
        point[b.id] = Math.max(0, Math.min(100, Math.round(baseSov + noise + (sovPeriod - i) * 0.5)));
      });
      data.push(point);
    }
    return data;
  }, [brands, sovPeriod]);

  // Fake top changes
  const topChanges = useMemo(() => {
    if (brands.length === 0) return [];
    return brands.map(b => {
      const seed = b.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const isUp = seed % 2 === 0;
      const val = (seed % 15) + 1;
      return { id: b.id, name: b.name, change: isUp ? val : -val };
    }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 4);
  }, [brands]);

  // Fake feed
  const activityFeed = [
    { id: 1, type: 'scan_complete', text: 'Завершено сканирование', project: brands[0]?.name || 'Проект 1', time: '10 мин назад' },
    { id: 2, type: 'alert', text: 'Резкое падение SOV', project: brands[1]?.name || 'Проект 2', time: '1 час назад' },
    { id: 3, type: 'competitor', text: 'Добавлен конкурент', project: brands[0]?.name || 'Проект 1', time: '2 часа назад' },
    { id: 4, type: 'limit', text: 'Лимит запросов исчерпан на 80%', project: 'Workspace', time: '3 часа назад' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface p-3 rounded-lg border border-border shadow-lg">
          <p className="text-sm font-medium text-content-primary mb-2">{label}</p>
          {payload.map((entry, index) => {
            const brand = brands.find(b => b.name === entry.name);
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                {brand ? (
                  <BrandAvatar project={brand} size={16} className="shrink-0" />
                ) : (
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                )}
                <span className="text-content-secondary">{entry.name}:</span>
                <span className="font-bold text-content-primary">{entry.value}%</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-screen overflow-hidden lg:overflow-auto flex flex-col bg-background relative z-0">
      
      {/* Background Grids */}
      <div className="fixed top-0 left-0 bottom-0 w-32 md:w-64 pointer-events-none z-[-1]" style={gridPattern}></div>
      <div className="fixed top-0 right-0 bottom-0 w-32 md:w-64 pointer-events-none z-[-1]" style={gridPattern}></div>

      {/* 1. Header */}
      <header className="h-16 flex-shrink-0 border-b border-border bg-surface/50 backdrop-blur-sm flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="text-xl font-bold text-content-primary">chatters</span>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Найти проект..." 
              className="w-full h-9 pl-9 pr-12 bg-background border border-border rounded-md text-sm text-content-primary placeholder-content-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-content-tertiary bg-surface border border-border rounded shadow-sm">⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-content-tertiary bg-surface border border-border rounded shadow-sm">K</kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 text-content-secondary hover:text-content-primary rounded-md hover:bg-background transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button className="p-2 text-content-secondary hover:text-content-primary rounded-md hover:bg-background transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
          </button>

          <div className="h-8 w-px bg-border mx-1"></div>

          <div className="relative">
            <button 
              className="flex items-center gap-3 p-1 rounded-md hover:bg-background transition-colors text-left"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div>
                <div className="text-sm font-medium text-content-primary">Workspace Admin</div>
                <div className="text-[11px] text-content-tertiary">Настройки</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-medium">
                WA
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
                <button className="w-full px-4 py-2 text-sm text-content-secondary hover:text-content-primary hover:bg-background flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Настройки воркспейса
                </button>
                <button className="w-full px-4 py-2 text-sm text-content-secondary hover:text-content-primary hover:bg-background flex items-center gap-2">
                  <Users className="w-4 h-4" /> Команда
                </button>
                <button className="w-full px-4 py-2 text-sm text-content-secondary hover:text-content-primary hover:bg-background flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Биллинг
                </button>
                <div className="h-px bg-border my-1"></div>
                <button className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto min-h-0 z-10 p-6 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* 2. Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between h-[120px]">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-content-tertiary">AI лимиты</div>
            <div>
              <div className="text-2xl font-bold text-content-primary">45,200</div>
              <div className="text-sm text-content-secondary mt-1">из 100,000 запросов</div>
            </div>
            <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '45.2%' }}></div>
            </div>
          </div>

          <div 
            className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between h-[120px] cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => {/* Handle upgrade modal */}}
          >
            <div className="text-[11px] uppercase tracking-wider font-semibold text-content-tertiary">Проекты</div>
            <div>
              <div className="text-2xl font-bold text-content-primary">{brands.length}</div>
              <div className="text-sm text-content-secondary mt-1">из 10 брендов</div>
            </div>
            <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${(brands.length / 10) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between h-[120px]">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-content-tertiary">Активность 24ч</div>
              <div className="flex items-center gap-1 text-green-500 text-xs font-medium bg-green-500/10 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3" /> +12%
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-content-primary">1,284</div>
              <div className="text-sm text-content-secondary mt-1">новых упоминаний</div>
            </div>
            <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between h-[120px]">
             <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-content-tertiary">AIO-скор воркспейса</div>
              <div className="flex items-center gap-1 text-red-500 text-xs font-medium bg-red-500/10 px-1.5 py-0.5 rounded">
                <ArrowDownRight className="w-3 h-3" /> -2.4
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-content-primary">74.5</div>
              <div className="text-sm text-content-secondary mt-1">в среднем по брендам</div>
            </div>
            <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
               <div className="h-full bg-orange-500 rounded-full" style={{ width: '74.5%' }}></div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (approx 65% ~ 8 cols) */}
          <div className="lg:col-span-8 space-y-6 flex flex-col min-h-0">
            
            {/* 3.1 Your Projects */}
            <div className="bg-surface border border-border rounded-xl flex flex-col shadow-sm max-h-[400px]">
              <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                  <h2 className="text-xs uppercase tracking-wider font-bold text-content-primary">Ваши проекты</h2>
                  <span className="px-2 py-0.5 rounded-full bg-background text-content-secondary text-xs font-medium">{brands.length}</span>
                </div>
              </div>
              <div className="p-4 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brands.map(brand => (
                    <div 
                      key={brand.id}
                      className="bg-background border border-border rounded-lg p-4 hover:border-primary/50 cursor-pointer transition-colors group"
                      onClick={() => setActiveBrandId(brand.id)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: brand.color || '#3b82f6' }}>
                            {brand.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-content-primary group-hover:text-primary transition-colors">{brand.name}</div>
                            <div className="text-xs text-content-tertiary">Обновлено 2ч назад</div>
                          </div>
                        </div>
                        <button 
                          className="text-content-tertiary hover:text-yellow-500 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = new Set(favorites);
                            if (next.has(brand.id)) next.delete(brand.id); else next.add(brand.id);
                            setFavorites(next);
                          }}
                        >
                          <Star className={`w-4 h-4 ${favorites.has(brand.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                        </button>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-content-secondary">Доля голоса (SOV)</span>
                            <span className="font-bold text-content-primary">42%</span>
                          </div>
                          <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: '42%', backgroundColor: brand.color || '#3b82f6' }}></div>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-content-secondary">Упоминания</span>
                          <span className="font-bold text-content-primary">2,451</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-border">
                        <button className="flex-1 py-1.5 text-xs font-medium text-content-secondary hover:text-content-primary hover:bg-surface rounded transition-colors text-center">
                          Прогоны
                        </button>
                        <div className="w-px h-3 bg-border"></div>
                        <button className="flex-1 py-1.5 text-xs font-medium text-content-secondary hover:text-content-primary hover:bg-surface rounded transition-colors text-center">
                          Рынок
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* New Brand Card */}
                  <button 
                    className="bg-transparent border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-content-secondary hover:text-primary hover:border-primary/50 transition-colors min-h-[180px]"
                    onClick={() => setShowCreate(true)}
                  >
                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center mb-3">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Новый бренд</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3.2 SOV Dynamics */}
            <div className="bg-surface border border-border rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                  <h2 className="text-xs uppercase tracking-wider font-bold text-content-primary">Динамика SOV</h2>
                </div>
                <div className="flex bg-background rounded-md p-0.5 border border-border">
                  {[7, 30, 90].map(days => (
                    <button
                      key={days}
                      onClick={() => setSovPeriod(days)}
                      className={`px-3 py-1 text-xs font-medium rounded ${sovPeriod === days ? 'bg-surface shadow-sm text-content-primary' : 'text-content-secondary hover:text-content-primary'}`}
                    >
                      {days} дн
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sovHistory} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#333' : '#eee'} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: theme === 'dark' ? '#888' : '#666' }}
                      minTickGap={30}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: theme === 'dark' ? '#888' : '#666' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {brands.slice(0, 5).map((brand, idx) => (
                      <Line 
                        key={brand.id}
                        type="monotone" 
                        dataKey={brand.id}
                        name={brand.name}
                        stroke={brand.color || `hsl(${idx * 60}, 70%, 50%)`}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border">
                {brands.slice(0, 5).map((brand, idx) => (
                  <div key={brand.id} className="flex items-center gap-1.5 text-xs text-content-secondary">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brand.color || `hsl(${idx * 60}, 70%, 50%)` }}></div>
                    {brand.name}
                  </div>
                ))}
                {brands.length > 5 && (
                  <button className="text-xs text-primary font-medium hover:underline">
                    +{brands.length - 5} ещё
                  </button>
                )}
              </div>
            </div>

            {/* 3.3 Two Blocks Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Top Changes */}
              <div className="bg-surface border border-border rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                  <h2 className="text-xs uppercase tracking-wider font-bold text-content-primary">Топ изменений за неделю</h2>
                </div>
                <div className="space-y-1">
                  {topChanges.map((change, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-background transition-colors">
                      <div className="text-sm font-medium text-content-primary">{change.name}</div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${change.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {change.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {Math.abs(change.change)} п.п.
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-surface border border-border rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                  <h2 className="text-xs uppercase tracking-wider font-bold text-content-primary">Быстрые действия</h2>
                </div>
                <div className="grid grid-cols-3 gap-3 h-[calc(100%-32px)]">
                  <button 
                    onClick={() => onQuickAction && onQuickAction('scan')}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-background border border-border rounded-lg hover:border-primary/50 hover:text-primary transition-all group"
                  >
                    <RefreshCw className="w-5 h-5 text-content-secondary group-hover:text-primary transition-colors" />
                    <span className="text-xs font-medium text-content-secondary group-hover:text-primary text-center">Запустить проверку</span>
                  </button>
                  <button 
                    onClick={() => onQuickAction && onQuickAction('competitor')}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-background border border-border rounded-lg hover:border-primary/50 hover:text-primary transition-all group"
                  >
                    <Plus className="w-5 h-5 text-content-secondary group-hover:text-primary transition-colors" />
                    <span className="text-xs font-medium text-content-secondary group-hover:text-primary text-center">Добавить конкурента</span>
                  </button>
                  <button 
                    onClick={() => onQuickAction && onQuickAction('export')}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-background border border-border rounded-lg hover:border-primary/50 hover:text-primary transition-all group"
                  >
                    <Download className="w-5 h-5 text-content-secondary group-hover:text-primary transition-colors" />
                    <span className="text-xs font-medium text-content-secondary group-hover:text-primary text-center">Экспорт отчёта</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column (approx 35% ~ 4 cols) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            
            {/* 4.1 Learning */}
            <div className="bg-surface border border-border rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                  <h2 className="text-xs uppercase tracking-wider font-bold text-content-primary">Обучение</h2>
                </div>
                <a href="#" className="text-xs text-primary hover:underline font-medium">Все туториалы &rarr;</a>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: 'none' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="min-w-[160px] w-[160px] shrink-0 snap-start group cursor-pointer">
                    <div className="aspect-video bg-background border border-border rounded-lg mb-2 relative overflow-hidden flex items-center justify-center group-hover:border-primary/50 transition-colors">
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors"></div>
                      <PlaySquare className="w-8 h-8 text-content-tertiary group-hover:text-primary relative z-10 transition-colors" />
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-surface/80 backdrop-blur text-[10px] font-medium text-content-primary rounded">Скоро</div>
                    </div>
                    <div className="text-sm font-medium text-content-primary line-clamp-1 group-hover:text-primary transition-colors">Как настроить онбординг</div>
                    <div className="text-xs text-content-tertiary mt-0.5">3:45</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4.2 Activity Feed */}
            <div className="bg-surface border border-border rounded-xl shadow-sm p-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                  <h2 className="text-xs uppercase tracking-wider font-bold text-content-primary">Лента событий</h2>
                </div>
              </div>
              <div className="overflow-y-auto pr-2 flex-1 space-y-4">
                {activityFeed.map((event, idx) => (
                  <div key={event.id} className="relative pl-4">
                    {idx !== activityFeed.length - 1 && (
                      <div className="absolute left-[7px] top-5 bottom-[-16px] w-px bg-border"></div>
                    )}
                    <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-surface bg-primary"></div>
                    <div className="text-sm font-medium text-content-primary">{event.text}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-content-secondary font-medium">{event.project}</span>
                      <span className="text-[10px] text-content-tertiary">{event.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-sm text-content-secondary hover:text-content-primary hover:bg-background border border-border rounded-lg transition-colors font-medium shrink-0">
                Смотреть все
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
