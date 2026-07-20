import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useBrands } from '../BrandContext';
import { supabase } from '@/lib/supabase';
import { ModelIcon } from '@/components/ui/ModelIcon';
import { 
  Bell, Activity, AlertCircle, Clock, Edit2, Plus, 
  Search, Filter, CheckCircle2, ChevronDown, ChevronRight,
  TrendingDown, FileText, Zap, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Mocks ---
const MOCK_TRIGGERS = [
  { 
    id: 1, 
    metric: 'SOV', 
    operator: '<', 
    value: '30%', 
    channel: 'Slack', 
    model: null, 
    lastTriggered: '2023-10-25 14:30', 
    active: true 
  },
  { 
    id: 2, 
    metric: 'Упоминания', 
    operator: '>', 
    value: '100', 
    channel: 'Telegram', 
    model: 'chatgpt', 
    lastTriggered: 'ещё не срабатывал', 
    active: false 
  },
  { 
    id: 3, 
    metric: 'AIO-Скор', 
    operator: '<', 
    value: '50', 
    channel: 'Email', 
    model: 'claude', 
    lastTriggered: '2023-10-24 09:15', 
    active: true 
  }
];

const MOCK_ALERTS = [
  { id: 1, trigger: 'Падение SOV ниже 30%', time: '10 минут назад', status: 'new' },
  { id: 2, trigger: 'Всплеск упоминаний в ChatGPT', time: 'Вчера 15:45', status: 'viewed' },
  { id: 3, trigger: 'Снижение AIO-Скор (Claude)', time: '24 Окт 09:15', status: 'resolved' },
];

const MOCK_TIMELINE = [
  { id: 1, type: 'metric', title: 'SOV вырос на 4%', desc: 'Общая доля голоса достигла 42%.', time: 'Сегодня 12:00', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 2, type: 'hallucination', title: 'Обнаружена галлюцинация', desc: 'Gemini неверно указывает адреса отделений.', time: 'Вчера 18:30', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-100' },
  { id: 3, type: 'trigger', title: 'Сработал триггер: Всплеск упоминаний', desc: 'Отправлено уведомление в Telegram.', time: 'Вчера 15:45', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  { id: 4, type: 'integration', title: 'Подключен новый источник', desc: 'Успешная интеграция с Google Analytics.', time: '24 Окт 10:00', icon: ShieldAlert, color: 'text-purple-500', bg: 'bg-purple-100' },
];

export default function MonitoringView() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { brands } = useBrands();
  
  const currentBrand = brands.find(b => b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);
  const projectId = currentBrand?.id;
  
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[pathParts.length - 1] === 'monitoring' ? 'triggers' : pathParts[pathParts.length - 1];

  const handleTabChange = (tab: string) => {
    navigate(`/workspace/${slug}/monitoring/${tab}`, { replace: true });
  };

  const tabs = [
    { id: 'triggers', label: 'триггеры' },
    { id: 'alerts', label: 'алерты' },
    { id: 'timeline', label: 'хронология' }
  ];

  // State
  const [triggers, setTriggers] = useState<any[]>(MOCK_TRIGGERS);
  const [alerts, setAlerts] = useState<any[]>(MOCK_ALERTS);
  const [timelineEvents, setTimelineEvents] = useState<any[]>(MOCK_TIMELINE);
  const [expandedTimeline, setExpandedTimeline] = useState<number | null>(null);
  
  // Triggers Modal State
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [editingTriggerId, setEditingTriggerId] = useState<string | null>(null);
  const [newTrigger, setNewTrigger] = useState({ metric: 'SOV', operator: '<', value: '', channel: 'Telegram', model: '' });

  // Fetch Logic
  useEffect(() => {
    if (!projectId) return;
    const fetchData = async () => {
      try {
        if (activeTab === 'triggers') {
          const { data, error } = await supabase.from('triggers').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
          if (error) throw error;
          if (data && data.length > 0) setTriggers(data);
        } else if (activeTab === 'alerts') {
          const { data, error } = await supabase.from('alerts').select('*, triggers(metric, operator, value)').eq('project_id', projectId).order('created_at', { ascending: false });
          if (error) throw error;
          if (data && data.length > 0) setAlerts(data.map((a: any) => ({
            id: a.id,
            trigger: a.triggers ? `${a.triggers.metric} ${a.triggers.operator} ${a.triggers.value}` : a.message,
            time: new Date(a.created_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }),
            status: a.status
          })));
        } else if (activeTab === 'timeline') {
          const { data, error } = await supabase.from('activity_events').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
          if (error) throw error;
          if (data && data.length > 0) setTimelineEvents(data.map((e: any) => ({
            id: e.id,
            type: e.event_type,
            title: e.title,
            desc: e.description,
            time: new Date(e.created_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }),
            icon: e.event_type === 'hallucination' ? AlertCircle : e.event_type === 'trigger' ? Zap : Activity,
            color: e.event_type === 'hallucination' ? 'text-orange-500' : 'text-blue-500',
            bg: e.event_type === 'hallucination' ? 'bg-orange-100' : 'bg-blue-100',
            details: e.details
          })));
        }
      } catch (err) {
        console.warn('Fallback to mock data for', activeTab, err);
      }
    };
    fetchData();
  }, [projectId, activeTab]);

  const handleToggleTrigger = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase.from('triggers').update({ is_active: !currentActive }).eq('id', id);
      if (error) throw error;
      setTriggers(prev => prev.map(t => t.id === id ? { ...t, is_active: !currentActive, active: !currentActive } : t));
    } catch (err) {
      console.warn('Fallback: toggle trigger locally', err);
      setTriggers(prev => prev.map(t => t.id === id ? { ...t, is_active: !currentActive, active: !currentActive } : t));
    }
  };

  const handleSaveTrigger = async () => {
    try {
      if (editingTriggerId) {
        const { error } = await supabase.from('triggers').update(newTrigger).eq('id', editingTriggerId);
        if (error) throw error;
        setTriggers(prev => prev.map(t => t.id === editingTriggerId ? { ...t, ...newTrigger } : t));
      } else {
        const { data, error } = await supabase.from('triggers').insert({
          project_id: projectId,
          ...newTrigger,
          is_active: true
        }).select().single();
        if (error) throw error;
        setTriggers(prev => [data, ...prev]);
      }
      setIsTriggerModalOpen(false);
    } catch (err) {
      console.warn('Fallback: save trigger locally', err);
      if (editingTriggerId) {
        setTriggers(prev => prev.map(t => t.id === editingTriggerId ? { ...t, ...newTrigger } : t));
      } else {
        setTriggers(prev => [{ id: Date.now().toString(), ...newTrigger, is_active: true, active: true, last_triggered: 'только что' }, ...prev]);
      }
      setIsTriggerModalOpen(false);
    }
  };

  const handleAlertStatusCycle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'new' ? 'viewed' : currentStatus === 'viewed' ? 'resolved' : 'new';
    try {
      const { error } = await supabase.from('alerts').update({ status: nextStatus }).eq('id', id);
      if (error) throw error;
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus } : a));
    } catch (err) {
      console.warn('Fallback: cycle alert status locally', err);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus } : a));
    }
  };

  const getAlertStatusBadge = (status: string) => {
    switch(status) {
      case 'new': return <span className="px-2 py-0.5 rounded text-[11px] font-medium font-mono text-white bg-red-500 lowercase">новое</span>;
      case 'viewed': return <span className="px-2 py-0.5 rounded text-[11px] font-medium font-mono text-[#B87503] bg-[#FFF8EB] lowercase">просмотрено</span>;
      case 'resolved': return <span className="px-2 py-0.5 rounded text-[11px] font-medium font-mono text-[#0F6E56] bg-[#E1F5EE] lowercase">решено</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto pb-6">
      
      {/* Horizontal Tabs */}
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

      <div className="flex-1 min-h-0">
        
        {/* TAB: TRIGGERS */}
        {activeTab === 'triggers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {triggers.map(trigger => (
              <div key={trigger.id} className="bg-white border border-border rounded-xl shadow-sm p-5 flex flex-col hover:border-border/80 transition-colors group relative">
                {/* Header: Status and Edit */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {trigger.active !== undefined ? trigger.active : trigger.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium font-mono text-[#0F6E56] bg-[#E1F5EE] lowercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F6E56]"></span> активен
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium font-mono text-content-secondary bg-[#fbfbfd] border border-border lowercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-content-muted"></span> остановлен
                      </span>
                    )}
                  </div>
                  <button 
                    className="text-content-tertiary hover:text-accent transition-colors p-1" 
                    title="Редактировать"
                    onClick={() => {
                      setEditingTriggerId(trigger.id.toString());
                      setNewTrigger({
                        metric: trigger.metric,
                        operator: trigger.operator,
                        value: trigger.value,
                        channel: trigger.channel,
                        model: trigger.model || ''
                      });
                      setIsTriggerModalOpen(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Condition Text */}
                <div className="text-[14px] text-[#111827] leading-relaxed mb-6 font-medium flex-1">
                  <span className="text-content-secondary mr-1">если</span>
                  <span className="bg-[#fbfbfd] border border-border px-1.5 py-0.5 rounded mx-1">{trigger.metric}</span>
                  {trigger.model && (
                    <span className="inline-flex items-center gap-1 bg-[#fbfbfd] border border-border px-1.5 py-0.5 rounded mx-1">
                      в <ModelIcon model={trigger.model} size={14} className="ml-0.5" /> <span className="capitalize">{trigger.model}</span>
                    </span>
                  )}
                  <span className="text-accent font-bold mx-1">{trigger.operator}</span>
                  <span className="font-mono bg-[#fbfbfd] border border-border px-1.5 py-0.5 rounded mx-1">{trigger.value}</span>
                  <span className="text-content-secondary mx-1">→ отправить в</span>
                  <span className="font-bold border-b border-dashed border-content-tertiary mx-1">{trigger.channel}</span>
                </div>

                {/* Footer: Date and Toggle */}
                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                  <div className="flex items-center gap-1.5 text-[11px] text-content-tertiary font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {trigger.last_triggered ? `сработал: ${new Date(trigger.last_triggered).toLocaleString()}` : trigger.lastTriggered || 'никогда'}
                  </div>
                  
                  {/* Custom Toggle Switch */}
                  <button 
                    onClick={() => handleToggleTrigger(trigger.id.toString(), trigger.active !== undefined ? trigger.active : trigger.is_active)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none ${(trigger.active !== undefined ? trigger.active : trigger.is_active) ? 'bg-accent' : 'bg-border'}`}
                  >
                    <span className="sr-only">Toggle active</span>
                    <span className={`pointer-events-none absolute left-0.5 inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${(trigger.active !== undefined ? trigger.active : trigger.is_active) ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            ))}

            {/* Create New Trigger Card */}
            <button 
              onClick={() => {
                setEditingTriggerId(null);
                setNewTrigger({ metric: 'SOV', operator: '<', value: '', channel: 'Telegram', model: '' });
                setIsTriggerModalOpen(true);
              }}
              className="bg-[#fbfbfd] border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center min-h-[220px] text-content-muted hover:text-accent hover:border-accent/50 hover:bg-accent/5 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[13px] font-semibold lowercase">создать новый триггер</span>
            </button>
          </div>
        )}

        {/* TAB: ALERTS */}
        {activeTab === 'alerts' && (
          <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col h-full min-h-0">
            <div className="p-4 border-b border-border flex items-center justify-between gap-4 shrink-0">
              <h2 className="eyebrow">сработавшие алерты</h2>
              <div className="flex items-center gap-2">
                <button className="h-9 px-3 flex items-center gap-2 bg-[#fbfbfd] border border-border rounded-md text-[13px] font-medium text-content-secondary hover:text-[#111827] lowercase transition-colors">
                  <Filter className="w-4 h-4" /> статус
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#fbfbfd] border-b border-border z-10">
                  <tr>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider w-1/2">триггер</th>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider">время</th>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider">статус</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {alerts.map(alert => (
                    <tr key={alert.id} className="hover:bg-[#fbfbfd] transition-colors group">
                      <td className="px-4 py-4 text-[13px] font-medium text-[#111827]">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full ${alert.status === 'new' ? 'bg-red-500' : 'bg-transparent'}`}></div>
                          {alert.trigger}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-[12px] text-content-secondary">{alert.time}</td>
                      <td className="px-4 py-4">{getAlertStatusBadge(alert.status)}</td>
                      <td className="px-4 py-4 text-right">
                        <Button 
                          variant="outline" 
                          onClick={() => handleAlertStatusCycle(alert.id.toString(), alert.status)}
                          className="h-8 px-3 text-[11px] lowercase rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          сменить статус
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col h-full min-h-0">
            <div className="p-4 border-b border-border flex items-center justify-between gap-4 shrink-0">
              <h2 className="eyebrow">общая хронология событий</h2>
              <div className="flex items-center gap-2">
                <button className="h-9 px-3 flex items-center gap-2 bg-[#fbfbfd] border border-border rounded-md text-[13px] font-medium text-content-secondary hover:text-[#111827] lowercase transition-colors">
                  <Filter className="w-4 h-4" /> тип события
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar p-6">
              <div className="relative border-l-2 border-border/60 ml-4 space-y-8 pb-8">
                {timelineEvents.map(event => (
                  <div key={event.id} className="relative pl-8">
                    {/* Timeline Node */}
                    <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-white ${event.bg} flex items-center justify-center shadow-sm`}>
                      <event.icon className={`w-3.5 h-3.5 ${event.color}`} />
                    </div>
                    
                    {/* Event Content */}
                    <div 
                      className="bg-[#fbfbfd] border border-border rounded-xl p-4 cursor-pointer hover:border-accent/40 transition-colors"
                      onClick={() => setExpandedTimeline(expandedTimeline === event.id ? null : event.id)}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-[14px] font-semibold text-[#111827]">{event.title}</div>
                        <div className="text-[11px] font-mono text-content-tertiary">{event.time}</div>
                      </div>
                      
                      <div className="text-[13px] text-content-secondary">
                        {event.desc}
                      </div>

                      {/* Expanded Details Placeholder */}
                      {expandedTimeline === event.id && (
                        <div className="mt-4 pt-4 border-t border-border/60">
                          <h3 className="eyebrow mb-2">детали события</h3>
                          <div className="bg-white border border-border/50 rounded p-3 text-[12px] font-mono text-content-secondary">
                            {JSON.stringify(event, null, 2)}
                          </div>
                          <div className="mt-3 flex justify-end">
                             <Button variant="outline" className="h-8 px-3 text-[11px] lowercase rounded">
                               перейти
                             </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Create / Edit Trigger Modal */}
      {isTriggerModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border bg-[#fbfbfd]">
              <div className="font-medium text-[#111827]">{editingTriggerId ? 'Редактировать триггер' : 'Создать триггер'}</div>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="eyebrow mb-2 block">Метрика</label>
                <select 
                  className="w-full h-9 px-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 outline-none"
                  value={newTrigger.metric}
                  onChange={e => setNewTrigger({...newTrigger, metric: e.target.value})}
                >
                  <option value="SOV">SOV</option>
                  <option value="Упоминания">Упоминания</option>
                  <option value="AIO-Скор">AIO-Скор</option>
                  <option value="Галлюцинации">Галлюцинации</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className="eyebrow mb-2 block">Оператор</label>
                  <select 
                    className="w-full h-9 px-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 outline-none"
                    value={newTrigger.operator}
                    onChange={e => setNewTrigger({...newTrigger, operator: e.target.value})}
                  >
                    <option value="<">&lt; Меньше</option>
                    <option value=">">&gt; Больше</option>
                    <option value="=">= Равно</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="eyebrow mb-2 block">Значение</label>
                  <input 
                    type="text" 
                    placeholder="Например: 30% или 100"
                    className="w-full h-9 px-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 outline-none"
                    value={newTrigger.value}
                    onChange={e => setNewTrigger({...newTrigger, value: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="eyebrow mb-2 block">Модель (опционально)</label>
                <select 
                  className="w-full h-9 px-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 outline-none"
                  value={newTrigger.model}
                  onChange={e => setNewTrigger({...newTrigger, model: e.target.value})}
                >
                  <option value="">Все модели</option>
                  <option value="chatgpt">ChatGPT</option>
                  <option value="claude">Claude</option>
                  <option value="gemini">Gemini</option>
                </select>
              </div>
              <div>
                <label className="eyebrow mb-2 block">Отправить в</label>
                <select 
                  className="w-full h-9 px-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 outline-none"
                  value={newTrigger.channel}
                  onChange={e => setNewTrigger({...newTrigger, channel: e.target.value})}
                >
                  <option value="Telegram">Telegram</option>
                  <option value="Slack">Slack</option>
                  <option value="Email">Email</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-border bg-[#fbfbfd] flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsTriggerModalOpen(false)}>Отмена</Button>
              <Button onClick={handleSaveTrigger}>Сохранить</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
