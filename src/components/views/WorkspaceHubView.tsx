import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBrands } from '../BrandContext';
import { useTheme } from '../ThemeContext';
import { BrandAvatar } from '@/components/ui/BrandAvatar';
import { ModelIcon } from '@/components/ui/ModelIcon';
import { ScanButton } from '@/components/ScanButton';
import { 
  Search, Moon, Sun, Bell, Settings2, Users, CreditCard, ArrowRightFromLine,
  RefreshCw, Plus, Download, TrendingUp, TrendingDown, PlaySquare, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { supabase } from '@/lib/supabase';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { ExportReportModal, AddCompetitorModal } from '@/components/workspace/QuickActions';

export default function WorkspaceHubView() {
  const { brands } = useBrands();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sovPeriod, setSovPeriod] = useState(30);

  // Modal states
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCompetitorModal, setShowCompetitorModal] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Fake SOV history generator with forecast
  const sovHistory = useMemo(() => {
    const data = [];
    const now = new Date();
    // Generate past data
    for (let i = sovPeriod; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const point = { date: d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }), isForecast: false };
      brands.forEach((b, idx) => {
        const baseSov = 20 + idx * 10;
        const noise = Math.sin(i / 3) * 5;
        point[b.id] = Math.max(0, Math.min(100, Math.round(baseSov + noise + (sovPeriod - i) * 0.2)));
      });
      data.push(point);
    }
    // Generate forecast (if period >= 14)
    if (sovPeriod >= 14) {
      for (let i = 1; i <= 5; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        const point = { date: d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }), isForecast: true };
        brands.forEach((b, idx) => {
          const lastVal = data[data.length - 1][b.id] as number;
          point[b.id] = lastVal + (Math.random() > 0.5 ? 1 : -1) * i;
        });
        data.push(point);
      }
    }
    return data;
  }, [brands, sovPeriod]);

  // Activity Feed
  const activityFeed = [
    { id: 1, text: 'завершено сканирование', project: brands[0]?.name || 'Chatters', time: '10 мин назад', isNegative: false },
    { id: 2, text: 'резкое падение sov', project: brands[1]?.name || 'Acme', time: '1 час назад', isNegative: true },
    { id: 3, text: 'добавлен конкурент', project: brands[0]?.name || 'Chatters', time: '2 часа назад', isNegative: false },
    { id: 4, text: 'лимит запросов исчерпан на 80%', project: 'workspace', time: '3 часа назад', isNegative: true },
    { id: 5, text: 'найдены новые упоминания', project: brands[0]?.name || 'Chatters', time: '5 часов назад', isNegative: false },
    { id: 6, text: 'обновление отчета', project: brands[1]?.name || 'Acme', time: 'вчера', isNegative: false },
  ];

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brands;
    const query = searchQuery.toLowerCase();
    return brands.filter(b => b.name.toLowerCase().includes(query));
  }, [brands, searchQuery]);

  const topChanges = useMemo(() => {
    if (brands.length === 0) return [];
    return brands.map((b, idx) => ({
      id: b.id,
      name: b.name,
      change: idx % 2 === 0 ? (idx + 1) * 2.4 : -(idx + 1) * 1.5,
    })).slice(0, 3);
  }, [brands]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg border border-border shadow-lg font-mono text-[12px]">
          <p className="font-semibold text-content-primary mb-2 uppercase">{label}</p>
          {payload.map((entry: any, index: number) => {
            const brand = brands.find(b => b.name === entry.name);
            return (
              <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-[#fbfbfd] text-content-primary font-sans selection:bg-accent/20">
      
      {/* 1. Header */}
      <header className="h-16 flex-shrink-0 border-b border-border bg-white flex items-center justify-between px-4 sm:px-6 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#111827] flex items-center justify-center text-white font-bold text-[15px] lowercase">
            C
          </div>
          <span className="text-[17px] font-semibold text-[#111827] tracking-tight lowercase hidden sm:block">chatters</span>
        </div>

        <div className="flex-1 max-w-md mx-4 lg:mx-8">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="найти проект..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-12 bg-[#fbfbfd] border border-border rounded-md text-[13px] text-content-primary placeholder-content-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all lowercase"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-content-tertiary bg-white border border-border rounded shadow-sm">⌘K</kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={toggleTheme} className="p-2 text-content-secondary hover:text-content-primary rounded-md hover:bg-surface transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button className="p-2 text-content-secondary hover:text-content-primary rounded-md hover:bg-surface transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="h-8 w-px bg-border mx-1 hidden sm:block"></div>

              <div className="relative">
                <button 
                  className="flex items-center gap-2 p-1 rounded-md hover:bg-surface transition-colors text-left"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="hidden sm:block text-right">
                    <div className="text-[13px] font-medium text-[#111827] leading-tight">Acme Corp</div>
                    <div className="text-[11px] text-content-tertiary lowercase">настройки</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-medium text-[13px]">
                    AC
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                    {/* ── Header: avatar + name + email ── */}
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-medium text-[13px] shrink-0">
                        AC
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-[#111827] truncate">Acme Corp</div>
                        <div className="text-[11px] text-content-tertiary truncate lowercase">alex@acme.corp</div>
                      </div>
                    </div>
                    <div className="h-px bg-border"></div>

                    {/* ── Action items ── */}
                    <div className="py-1">
                      <button
                        className="w-full flex items-center gap-2.5 px-3 h-10 text-[13px] text-content-secondary hover:text-[#111827] hover:bg-[#fbfbfd] rounded-lg mx-1 lowercase transition-colors"
                        onClick={() => { setShowProfileMenu(false); navigate('/workspace-settings'); }}
                      >
                        <Settings2 className="w-[18px] h-[18px] shrink-0" />
                        <span className="leading-none">настройки воркспейса</span>
                      </button>
                      <button
                        className="w-full flex items-center gap-2.5 px-3 h-10 text-[13px] text-content-secondary hover:text-[#111827] hover:bg-[#fbfbfd] rounded-lg mx-1 lowercase transition-colors"
                        onClick={() => { setShowProfileMenu(false); navigate('/workspace-settings/team'); }}
                      >
                        <Users className="w-[18px] h-[18px] shrink-0" />
                        <span className="leading-none">команда</span>
                      </button>
                      <button
                        className="w-full flex items-center gap-2.5 px-3 h-10 text-[13px] text-content-secondary hover:text-[#111827] hover:bg-[#fbfbfd] rounded-lg mx-1 lowercase transition-colors"
                        onClick={() => { setShowProfileMenu(false); navigate('/workspace-settings/billing'); }}
                      >
                        <CreditCard className="w-[18px] h-[18px] shrink-0" />
                        <span className="leading-none">биллинг</span>
                      </button>
                    </div>
                    <div className="h-px bg-border mx-2"></div>

                    {/* ── Logout ── */}
                    <div className="py-1">
                      <button 
                        className="w-full flex items-center gap-2.5 px-3 h-10 text-[13px] text-red-500 hover:text-red-600 hover:bg-red-50/60 rounded-lg mx-1 lowercase transition-colors"
                        onClick={() => { setShowProfileMenu(false); handleSignOut(); }}
                      >
                        <ArrowRightFromLine className="w-[18px] h-[18px] shrink-0" />
                        <span className="leading-none">выйти из аккаунта</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-0 p-4 lg:p-6 mx-auto w-full max-w-7xl">
        
        {/* 2. Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 shrink-0">
          <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between h-[120px]">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-content-tertiary">ai лимиты</div>
            <div>
              <div className="text-2xl font-bold text-[#111827] font-mono">45,200</div>
              <div className="text-[13px] text-content-secondary mt-1 lowercase">из 100,000 запросов</div>
            </div>
            <div className="w-full h-1.5 bg-[#fbfbfd] rounded-full overflow-hidden border border-border/50">
              <div className="h-full bg-accent rounded-full" style={{ width: '45.2%' }}></div>
            </div>
          </div>

          <div 
            className="bg-white border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between h-[120px] cursor-pointer hover:border-accent/50 transition-colors group"
            onClick={() => {/* handle upgrade */}}
          >
            <div className="text-[11px] uppercase tracking-wider font-semibold text-content-tertiary flex justify-between items-center">
              проекты
              {brands.length >= 10 && <span className="text-[10px] text-accent font-medium px-1.5 py-0.5 bg-accent/10 rounded">upgrade</span>}
            </div>
            <div>
              <div className="text-2xl font-bold text-[#111827] font-mono">{brands.length}</div>
              <div className="text-[13px] text-content-secondary mt-1 lowercase">из 10 по тарифу</div>
            </div>
            <div className="w-full h-1.5 bg-[#fbfbfd] rounded-full overflow-hidden border border-border/50">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${(brands.length / 10) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between h-[120px]">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-content-tertiary">активность 24ч</div>
              <div className="flex items-center gap-1 text-green-600 text-[11px] font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                <ArrowUpRight className="w-3 h-3" /> +12%
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#111827] font-mono">1,284</div>
              <div className="text-[13px] text-content-secondary mt-1 lowercase">новых упоминаний</div>
            </div>
            <div className="w-full h-1.5 bg-[#fbfbfd] rounded-full overflow-hidden border border-border/50">
               <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between h-[120px]">
             <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-content-tertiary">aio-скор воркспейса</div>
              <div className="flex items-center gap-1 text-red-600 text-[11px] font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                <ArrowDownRight className="w-3 h-3" /> -2.4
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#111827] font-mono">74.5</div>
              <div className="text-[13px] text-content-secondary mt-1 lowercase">в среднем по брендам</div>
            </div>
            <div className="w-full h-1.5 bg-[#fbfbfd] rounded-full overflow-hidden border border-border/50">
               <div className="h-full bg-orange-500 rounded-full" style={{ width: '74.5%' }}></div>
            </div>
          </div>
        </div>

        {/* Layout Columns */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
          
          {/* Left Column (65%) */}
          <div className="w-full lg:w-[65%] flex flex-col gap-6 min-h-0">
            
            {/* 3.1 Your Projects */}
            <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col flex-1 min-h-0">
              <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-white rounded-t-xl z-10">
                <div className="flex items-center gap-2">
                  <h2 className="text-[12px] uppercase tracking-wider font-bold text-[#111827]">ваши проекты</h2>
                  <span className="px-2 py-0.5 rounded-full bg-surface text-content-secondary text-[11px] font-bold border border-border/50 font-mono">{brands.length}</span>
                </div>
              </div>
              
              <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ gridAutoRows: 'minmax(220px, auto)' }}>
                  {filteredBrands.map((brand, idx) => {
                    const color = brand.color || `hsl(${idx * 60}, 70%, 50%)`;
                    return (
                      <div 
                        key={brand.id}
                        className="bg-[#fbfbfd] border border-border rounded-lg p-4 hover:border-accent/50 cursor-pointer transition-colors group flex flex-col min-h-[220px] shrink-0 select-none"
                        onClick={() => navigate(`/workspace/${brand.name.toLowerCase()}/overview`)}
                      >
                        <div className="flex items-center gap-3 mb-4 shrink-0">
                          <BrandAvatar project={brand} size={40} />
                          <div>
                            <div className="font-bold text-[#111827] group-hover:text-accent transition-colors text-[15px]">{brand.name}</div>
                            {/* Models Mini Strip */}
                            <div className="flex items-center gap-1 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <ModelIcon model="chatgpt" size={12} className="grayscale group-hover:grayscale-0" />
                              <ModelIcon model="claude" size={12} className="grayscale group-hover:grayscale-0" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4 flex-1 min-h-0 flex flex-col justify-center">
                          <div>
                            <div className="flex justify-between text-[12px] mb-1.5 lowercase text-content-secondary">
                              <span>sov (доля голоса)</span>
                              <span className="font-bold text-[#111827] font-mono">{42 + idx * 5}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-border/40 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${42 + idx * 5}%`, backgroundColor: color }}></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-[12px] lowercase text-content-secondary">
                            <span>упоминания</span>
                            <span className="font-bold text-[#111827] font-mono">{(2451 - idx * 200).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-border shrink-0">
                          <button
                            className="flex-1 py-1.5 text-[12px] font-semibold text-content-secondary hover:text-[#111827] hover:bg-white rounded transition-colors text-center lowercase border border-transparent hover:border-border shadow-sm"
                            onClick={e => { e.stopPropagation(); navigate(`/workspace/${brand.name.toLowerCase()}/runs/history`); }}
                          >
                            прогоны
                          </button>
                          <button
                            className="flex-1 py-1.5 text-[12px] font-semibold text-content-secondary hover:text-[#111827] hover:bg-white rounded transition-colors text-center lowercase border border-transparent hover:border-border shadow-sm"
                            onClick={e => { e.stopPropagation(); navigate(`/workspace/${brand.name.toLowerCase()}/analytics/market`); }}
                          >
                            рынок
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* New Brand Card */}
                  <button 
                    className="bg-transparent border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-content-muted hover:text-accent hover:border-accent/50 hover:bg-accent/5 transition-colors min-h-[220px] shrink-0 outline-none"
                    onClick={() => setShowOnboarding(true)}
                  >
                    <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mb-3">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-[13px] font-semibold lowercase">новый бренд</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3.2 SOV Dynamics */}
            <div className="bg-white border border-border rounded-xl shadow-sm p-4 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[12px] uppercase tracking-wider font-bold text-[#111827]">динамика sov</h2>
                <div className="flex bg-[#fbfbfd] rounded-md p-0.5 border border-border">
                  {[7, 30, 90].map(days => (
                    <button
                      key={days}
                      onClick={() => setSovPeriod(days)}
                      className={`px-3 py-1 text-[11px] font-bold rounded lowercase transition-colors ${sovPeriod === days ? 'bg-white shadow-sm text-[#111827] border border-border/50' : 'text-content-secondary hover:text-[#111827]'}`}
                    >
                      {days} дн
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[180px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sovHistory} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
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
                    
                    {/* Forecast separator */}
                    {sovPeriod >= 14 && (
                      <ReferenceLine x={sovHistory[sovHistory.length - 6]?.date} stroke="#9CA3AF" strokeDasharray="3 3" />
                    )}

                    {brands.slice(0, 3).map((brand, idx) => (
                      <Line 
                        key={brand.id}
                        type="monotone" 
                        dataKey={brand.id}
                        name={brand.name}
                        stroke={brand.color || `hsl(${idx * 60}, 70%, 50%)`}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3.3 Two Blocks Row (50/50) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
              
              {/* Top Changes */}
              <div className="bg-white border border-border rounded-xl shadow-sm p-4">
                <h2 className="text-[12px] uppercase tracking-wider font-bold text-[#111827] mb-4">топ изменений за неделю</h2>
                <div className="space-y-2">
                  {topChanges.map((change, idx) => {
                    const brand = brands.find(b => b.name === change.name);
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#fbfbfd] border border-border/50 hover:border-border transition-colors">
                        <div className="flex items-center gap-2">
                          {brand && <BrandAvatar project={brand} size={20} className="shrink-0" />}
                          <div className="text-[13px] font-semibold text-[#111827]">{change.name}</div>
                        </div>
                        <div className={`flex items-center gap-1 text-[13px] font-bold font-mono ${change.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {change.change > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {Math.abs(change.change).toFixed(1)} п.п.
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-border rounded-xl shadow-sm p-4">
                <h2 className="text-[12px] uppercase tracking-wider font-bold text-[#111827] mb-4">быстрые действия</h2>
                <div className="grid grid-cols-3 gap-3 h-[calc(100%-36px)]">
                  {/* Scan button — uses real enqueue-scan pipeline */}
                  <ScanButton
                    workspaceId={brands[0]?.workspace_id}
                    configScope="workspace"
                    label="запустить проверку"
                    variant="outline"
                    className="flex flex-col items-center justify-center gap-2 p-3 h-auto bg-[#fbfbfd] border border-border rounded-lg hover:border-accent hover:text-accent text-[10px] font-bold text-content-secondary lowercase"
                  />
                  <button 
                    onClick={() => setShowCompetitorModal(true)}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-[#fbfbfd] border border-border rounded-lg hover:border-accent hover:text-accent transition-all group"
                  >
                    <Plus className="w-4 h-4 text-content-secondary group-hover:text-accent transition-colors" />
                    <span className="text-[10px] font-bold text-content-secondary group-hover:text-accent text-center lowercase">добавить конкурента</span>
                  </button>
                  <button 
                    onClick={() => setShowExportModal(true)}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-[#fbfbfd] border border-border rounded-lg hover:border-accent hover:text-accent transition-all group"
                  >
                    <Download className="w-4 h-4 text-content-secondary group-hover:text-accent transition-colors" />
                    <span className="text-[10px] font-bold text-content-secondary group-hover:text-accent text-center lowercase">экспорт отчёта</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (35%) */}
          <div className="w-full lg:w-[35%] flex flex-col gap-6 min-h-0">
            
            {/* 4.1 Learning */}
            <div className="bg-white border border-border rounded-xl shadow-sm p-4 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[12px] uppercase tracking-wider font-bold text-[#111827]">обучение</h2>
                <a href="#" className="text-[11px] text-accent hover:underline font-bold lowercase">все туториалы &rarr;</a>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x custom-scrollbar">
                {[1, 2].map(i => (
                  <div key={i} className="min-w-[180px] w-[180px] shrink-0 snap-start group cursor-pointer">
                    <div className="aspect-video bg-[#fbfbfd] border border-border rounded-lg mb-2 relative overflow-hidden flex items-center justify-center group-hover:border-accent/50 transition-colors">
                      <div className="absolute inset-0 bg-[#111827]/5 group-hover:bg-[#111827]/10 transition-colors"></div>
                      <PlaySquare className="w-6 h-6 text-content-tertiary group-hover:text-accent relative z-10 transition-colors" />
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-white/90 backdrop-blur text-[9px] font-bold text-[#111827] rounded lowercase border border-border/50">скоро</div>
                    </div>
                    <div className="text-[13px] font-semibold text-[#111827] line-clamp-1 group-hover:text-accent transition-colors leading-tight">Как настроить онбординг</div>
                    <div className="text-[11px] text-content-tertiary mt-0.5 font-mono">3:45</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4.2 Activity Feed */}
            <div className="bg-white border border-border rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border shrink-0 bg-white z-10">
                <h2 className="text-[12px] uppercase tracking-wider font-bold text-[#111827]">лента событий</h2>
              </div>
              
              <div className="overflow-y-auto flex-1 p-4 custom-scrollbar">
                <div className="space-y-4 relative">
                  <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border/60"></div>
                  {activityFeed.map((event) => (
                    <div key={event.id} className="relative pl-6">
                      <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-white z-10 ${event.isNegative ? 'bg-red-500' : 'bg-accent'}`}></div>
                      <div className={`text-[13px] font-semibold leading-snug lowercase ${event.isNegative ? 'text-red-600' : 'text-[#111827]'}`}>
                        {event.text}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-content-secondary font-bold">{event.project}</span>
                        <span className="text-[10px] text-content-tertiary font-mono">{event.time}</span>
                      </div>
                    </div>
                  ))}
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-white z-10 bg-border"></div>
                    <div className="text-[13px] font-semibold leading-snug text-content-secondary lowercase">начало работы</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-content-tertiary font-mono">2 дня назад</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 border-t border-border shrink-0 bg-white">
                <button
                  className="w-full py-2 text-[12px] text-content-secondary hover:text-[#111827] hover:bg-[#fbfbfd] rounded-lg transition-colors font-bold lowercase"
                  onClick={() => navigate('/workspace')}
                >
                  смотреть все &rarr;
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Custom Scrollbar Styles embedded */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #D1D5DB;
        }
      `}} />

      {/* Modals */}
      {showOnboarding && (
        <OnboardingWizard isModal onClose={() => setShowOnboarding(false)} />
      )}
      <ExportReportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />
      <AddCompetitorModal 
        isOpen={showCompetitorModal} 
        onClose={() => setShowCompetitorModal(false)} 
        brands={brands} 
      />
    </div>
  );
}
