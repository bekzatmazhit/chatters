import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useBrands } from '../BrandContext';
import { supabase } from '@/lib/supabase';
import { ModelIcon } from '@/components/ui/ModelIcon';
import { 
  ListChecks, Wand2, FileText, Download, Share2, Plus, 
  Trash2, Edit2, Search, Filter, AlertTriangle, CheckCircle2,
  GitPullRequest, RefreshCw, X, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Mocks ---
const MOCK_PLAN = {
  critical: [
    { id: 1, title: 'Добавить страницу тарифов', desc: 'ChatGPT утверждает, что у вас нет бесплатных тарифов, хотя они есть.', model: 'chatgpt' }
  ],
  medium: [
    { id: 2, title: 'Обновить информацию о доставке', desc: 'Claude использует устаревшие сроки доставки (от 2022 года).', model: 'claude' },
    { id: 3, title: 'Добавить сравнение с конкурентом', desc: 'Gemini советует конкурента X при запросе "дешевая альтернатива Y".', model: 'gemini' }
  ]
};

const MOCK_BRIEFS = [
  { id: 1, title: 'Тарифы и бесплатные возможности 2024', query: 'бесплатный тариф', status: 'draft', 
    bullets: ['Описать стартовый план', 'Сравнить с конкурентами', 'Добавить FAQ'], 
    facts: ['Бесплатный тариф есть с 2023 года', 'Включает 5 проектов'] 
  },
  { id: 2, title: 'Обновленные сроки доставки', query: 'доставка сроки', status: 'in progress',
    bullets: ['Указать новые склады', 'Объяснить экспресс-доставку'],
    facts: ['Доставка от 1 дня', 'Склады в 5 городах']
  },
  { id: 3, title: 'Полный гайд по интеграциям', query: 'как интегрировать API', status: 'done',
    bullets: [], facts: []
  }
];

const MOCK_FACTS = [
  { id: 1, topic: 'Год основания', value: 'Компания основана в 2018 году в Алматы.' },
  { id: 2, topic: 'Бесплатный тариф', value: 'Да, есть навсегда бесплатный тариф до 3 пользователей.' },
  { id: 3, topic: 'Поддержка 24/7', value: 'Служба поддержки работает круглосуточно без выходных.' },
];

const MOCK_HALLUCINATIONS = [
  { id: 1, crit: 'critical', model: 'chatgpt', ai: 'Компания не предоставляет API.', real: 'API доступно на всех платных тарифах.', status: 'requires check' },
  { id: 2, crit: 'medium', model: 'claude', ai: 'Главный офис находится в Астане.', real: 'Главный офис в Алматы.', status: 'fixed' },
  { id: 3, crit: 'low', model: 'gemini', ai: 'Поддержка отвечает 2-3 дня.', real: 'Среднее время ответа — 15 минут.', status: 'requires check' },
];

export default function OptimizationView() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { brands } = useBrands();
  
  const currentBrand = brands.find(b => b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);
  const projectId = currentBrand?.id;
  
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[pathParts.length - 1] === 'optimization' ? 'plan' : pathParts[pathParts.length - 1];

  const handleTabChange = (tab: string) => {
    navigate(`/workspace/${slug}/optimization/${tab}`, { replace: true });
  };

  const tabs = [
    { id: 'plan', label: 'план' },
    { id: 'briefs', label: 'брифы' },
    { id: 'facts', label: 'база фактов' },
    { id: 'hallucinations', label: 'галлюцинации' }
  ];

  // --- States ---
  const [isLoading, setIsLoading] = useState(false);
  const [integrations, setIntegrations] = useState<any[]>([]);

  // Tables States
  const [planTasks, setPlanTasks] = useState<{critical: any[], medium: any[]}>(MOCK_PLAN);
  const [briefs, setBriefs] = useState<any[]>(MOCK_BRIEFS);
  const [facts, setFacts] = useState<any[]>(MOCK_FACTS);
  const [hallucinations, setHallucinations] = useState<any[]>(MOCK_HALLUCINATIONS);

  // Interaction states
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [expandedBrief, setExpandedBrief] = useState<number | null>(null);
  const [newFactTopic, setNewFactTopic] = useState('');
  const [newFactValue, setNewFactValue] = useState('');
  const [editingFactId, setEditingFactId] = useState<number | null>(null);
  const [editingFactValue, setEditingFactValue] = useState('');
  const [editingFactTopic, setEditingFactTopic] = useState('');

  // --- Fetch Logic ---
  useEffect(() => {
    if (!projectId) return;
    
    const fetchIntegrations = async () => {
      try {
        const { data } = await supabase.from('integrations').select('*').eq('project_id', projectId);
        if (data) setIntegrations(data);
      } catch (e) { console.warn('Integrations error', e); }
    };
    fetchIntegrations();

    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'plan') {
          const { data } = await supabase.from('aio_tasks').select('*').eq('project_id', projectId);
          if (data && data.length > 0) {
            const critical = data.filter(d => d.priority === 'high' || d.priority === 'critical');
            const medium = data.filter(d => d.priority !== 'high' && d.priority !== 'critical');
            setPlanTasks({ critical, medium });
          }
        } else if (activeTab === 'briefs') {
          const { data } = await supabase.from('content_briefs').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
          if (data && data.length > 0) {
            setBriefs(data.map(d => ({
              id: d.id, title: d.title, query: d.query || d.title, status: d.status || 'draft',
              bullets: d.bullets || [], facts: d.facts || []
            })));
          }
        } else if (activeTab === 'facts') {
          const { data } = await supabase.from('facts').select('*').eq('project_id', projectId);
          if (data && data.length > 0) {
            setFacts(data.map(d => ({
              id: d.id, topic: d.key || d.topic, value: d.value
            })));
          }
        } else if (activeTab === 'hallucinations') {
          const { data } = await supabase.from('hallucinations').select('*').eq('project_id', projectId);
          if (data && data.length > 0) {
            setHallucinations(data.map(d => ({
              id: d.id, crit: d.severity || 'medium', model: d.model || 'unknown',
              ai: d.ai_statement, real: d.real_fact, status: d.status || 'requires check'
            })));
          }
        }
      } catch (err) {
        console.warn('Fallback: Optimization tables missing', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [projectId, activeTab]);

  // Status badge helper for Briefs
  const getBriefStatus = (status: string) => {
    switch(status) {
      case 'draft': return <span className="px-2 py-0.5 rounded text-[11px] font-medium font-mono text-content-secondary bg-[#fbfbfd] border border-border lowercase">черновик</span>;
      case 'in progress': return <span className="px-2 py-0.5 rounded text-[11px] font-medium font-mono text-[#B87503] bg-[#FFF8EB] lowercase">в работе</span>;
      case 'done': return <span className="px-2 py-0.5 rounded text-[11px] font-medium font-mono text-[#0F6E56] bg-[#E1F5EE] lowercase">готово</span>;
      default: return null;
    }
  };

  const getCritBadge = (crit: string) => {
    switch(crit) {
      case 'critical': return <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono text-white bg-red-500 lowercase shadow-sm">critical</span>;
      case 'medium': return <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono text-orange-700 bg-orange-100 lowercase">medium</span>;
      case 'low': return <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono text-blue-700 bg-blue-100 lowercase">low</span>;
      default: return null;
    }
  };

  // --- Handlers ---
  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      await supabase.functions.invoke('generate-aio-plan', { body: { project_id: projectId } });
      // Fake refresh since we use mocks on fallback
      setPlanTasks({ ...MOCK_PLAN }); 
    } catch (err) {
      console.warn('Fallback: generate plan', err);
      setTimeout(() => setIsGeneratingPlan(false), 2000);
      return;
    }
    setIsGeneratingPlan(false);
  };

  const handleCompleteTask = async (taskId: any) => {
    try {
      await supabase.from('aio_tasks').update({ status: 'done' }).eq('id', taskId);
      setPlanTasks(prev => ({
        critical: prev.critical.filter(t => t.id !== taskId),
        medium: prev.medium.filter(t => t.id !== taskId)
      }));
    } catch (err) { 
      console.warn('Fallback complete task', err); 
      setPlanTasks(prev => ({
        critical: prev.critical.filter(t => t.id !== taskId),
        medium: prev.medium.filter(t => t.id !== taskId)
      }));
    }
  };

  const handleGenerateBrief = async (taskId: any) => {
    try {
      await supabase.functions.invoke('generate-content-brief', { body: { task_id: taskId } });
      navigate(`/workspace/${slug}/optimization/briefs`);
    } catch (err) { 
      console.warn('Fallback generate brief', err); 
      navigate(`/workspace/${slug}/optimization/briefs`); 
    }
  };

  const exportBriefToMd = (brief: any) => {
    const mdContent = `# ${brief.title}\n\n**Запрос:** ${brief.query}\n\n## Тезисы\n${brief.bullets.map((b: string) => `- ${b}`).join('\n')}\n\n## Факты\n${brief.facts.map((f: string) => `- ${f}`).join('\n')}`;
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brief.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGoogleDocs = async (brief: any) => {
    const hasGoogle = integrations.some(i => i.provider === 'google_docs' && i.status === 'connected');
    if (!hasGoogle) {
      if (confirm('Интеграция с Google Docs не подключена. Перейти в настройки интеграций?')) {
        navigate(`/workspace/${slug}/settings/integrations`);
      }
      return;
    }
    try {
      await supabase.functions.invoke('export-to-google-docs', { body: { brief_id: brief.id } });
      alert('Успешно отправлено в Google Docs!');
    } catch (err) { 
      console.warn(err); 
      alert('Эмуляция: Успешно отправлено в Google Docs!'); 
    }
  };

  const handleAddFact = async () => {
    if (!newFactTopic.trim() || !newFactValue.trim()) return;
    try {
      const { data } = await supabase.from('facts').insert({ project_id: projectId, key: newFactTopic, value: newFactValue }).select().single();
      if (data) {
        setFacts(prev => [{ id: data.id, topic: data.key, value: data.value }, ...prev]);
      } else {
        throw new Error('No data');
      }
    } catch (err) {
      console.warn('Fallback add fact', err);
      setFacts(prev => [{ id: Date.now(), topic: newFactTopic, value: newFactValue }, ...prev]);
    }
    setNewFactTopic('');
    setNewFactValue('');
  };

  const handleUpdateFact = async (id: any) => {
    try {
      await supabase.from('facts').update({ key: editingFactTopic, value: editingFactValue }).eq('id', id);
      setFacts(prev => prev.map(f => f.id === id ? { ...f, topic: editingFactTopic, value: editingFactValue } : f));
    } catch (err) { console.warn('Fallback update fact', err); }
    setEditingFactId(null);
  };

  const handleDeleteFact = async (id: any) => {
    try {
      await supabase.from('facts').delete().eq('id', id);
      setFacts(prev => prev.filter(f => f.id !== id));
    } catch (err) { 
      console.warn('Fallback delete fact', err); 
      setFacts(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleAutoPr = async (halluId: any) => {
    const hasGithub = integrations.some(i => i.provider === 'github' && i.status === 'connected');
    if (!hasGithub) {
      if (confirm('Интеграция с GitHub не подключена. Перейти в настройки?')) {
        navigate(`/workspace/${slug}/settings/integrations`);
      }
      return;
    }
    try {
      await supabase.functions.invoke('create-pr', { body: { hallucination_id: halluId } });
      setHallucinations(prev => prev.map(h => h.id === halluId ? { ...h, status: 'in_progress' } : h));
      alert('PR создан!');
    } catch (err) {
      console.warn('Fallback auto pr', err);
      setHallucinations(prev => prev.map(h => h.id === halluId ? { ...h, status: 'in_progress' } : h));
      alert('Эмуляция: PR успешно создан!');
    }
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto pb-6">
      
      {/* Header & Tabs */}
      <div className="flex items-center justify-between border-b border-border mb-6">
        <div className="flex items-center gap-6">
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
        {activeTab === 'plan' && (
          <Button onClick={handleGeneratePlan} disabled={isGeneratingPlan} className="h-9 px-5 mb-2 rounded-md lowercase font-medium text-[13px] shadow-sm">
            {isGeneratingPlan ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />} 
            {isGeneratingPlan ? 'выполняется...' : 'сгенерировать план'}
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-accent animate-spin" />
          </div>
        )}
        
        {/* TAB: PLAN */}
        {activeTab === 'plan' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
            {/* Critical Tasks */}
            <div className="flex flex-col bg-[#fbfbfd] border border-border rounded-xl p-5 shadow-sm min-h-0">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="text-[13px] font-bold text-[#111827] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm"></span> критичные задачи
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-white border border-border text-[11px] font-bold font-mono text-content-secondary">
                  {planTasks.critical.length}
                </span>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar space-y-3">
                {planTasks.critical.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-content-muted">
                    <ListChecks className="w-8 h-8 mb-3 opacity-20" />
                    <div className="text-[14px] font-semibold text-[#111827] lowercase">пока нет критичных задач</div>
                    <div className="text-[12px] mt-1 lowercase">ИИ-модели корректно отображают вашу главную информацию.</div>
                  </div>
                ) : (
                  planTasks.critical.map(task => (
                    <div key={task.id} className="bg-white border border-red-100 rounded-lg p-4 shadow-sm hover:border-red-200 transition-colors">
                      <div className="text-[14px] font-semibold text-[#111827] mb-1.5">{task.title}</div>
                      <div className="text-[13px] text-content-secondary leading-relaxed mb-3">{task.desc}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-content-tertiary lowercase font-mono">
                          <ModelIcon model={task.model} size={14} className="grayscale opacity-70" />
                          выявлено в ответах {task.model}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" onClick={() => handleGenerateBrief(task.id)} className="h-7 px-2.5 text-[11px] lowercase rounded">
                            сгенерировать бриф
                          </Button>
                          <Button variant="outline" onClick={() => handleCompleteTask(task.id)} className="h-7 px-2.5 text-[11px] lowercase rounded text-content-muted hover:text-[#111827]">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> выполнено
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Medium Priority */}
            <div className="flex flex-col bg-[#fbfbfd] border border-border rounded-xl p-5 shadow-sm min-h-0">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="text-[13px] font-bold text-[#111827] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400 shadow-sm"></span> средний приоритет
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-white border border-border text-[11px] font-bold font-mono text-content-secondary">
                  {planTasks.medium.length}
                </span>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar space-y-3">
                {planTasks.medium.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-content-muted">
                    <ListChecks className="w-8 h-8 mb-3 opacity-20" />
                    <div className="text-[14px] font-semibold text-[#111827] lowercase">пока нет задач среднего приоритета</div>
                  </div>
                ) : (
                  planTasks.medium.map(task => (
                    <div key={task.id} className="bg-white border border-border/60 rounded-lg p-4 shadow-sm hover:border-border transition-colors">
                      <div className="text-[14px] font-semibold text-[#111827] mb-1.5">{task.title}</div>
                      <div className="text-[13px] text-content-secondary leading-relaxed mb-3">{task.desc}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-content-tertiary lowercase font-mono">
                          <ModelIcon model={task.model} size={14} className="grayscale opacity-70" />
                          выявлено в ответах {task.model}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" onClick={() => handleGenerateBrief(task.id)} className="h-7 px-2.5 text-[11px] lowercase rounded">
                            сгенерировать бриф
                          </Button>
                          <Button variant="outline" onClick={() => handleCompleteTask(task.id)} className="h-7 px-2.5 text-[11px] lowercase rounded text-content-muted hover:text-[#111827]">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> выполнено
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: BRIEFS */}
        {activeTab === 'briefs' && (
          <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col h-full min-h-0">
            <div className="flex-1 overflow-auto custom-scrollbar p-4">
              <div className="space-y-3">
                {briefs.map(brief => (
                  <div key={brief.id} className="border border-border/60 rounded-lg overflow-hidden transition-colors hover:border-border">
                    {/* Brief Header (Clickable) */}
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer bg-white hover:bg-[#fbfbfd]"
                      onClick={() => setExpandedBrief(expandedBrief === brief.id ? null : brief.id)}
                    >
                      <div className="flex items-center gap-4">
                        <FileText className="w-5 h-5 text-content-tertiary" />
                        <div>
                          <div className="text-[14px] font-semibold text-[#111827]">{brief.title}</div>
                          <div className="text-[12px] text-content-secondary mt-0.5 lowercase font-mono">запрос: {brief.query}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getBriefStatus(brief.status)}
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    {expandedBrief === brief.id && (
                      <div className="p-4 bg-[#fbfbfd] border-t border-border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <h3 className="eyebrow mb-3">тезисы для раскрытия</h3>
                            <ul className="list-disc list-inside space-y-1.5">
                              {brief.bullets && brief.bullets.length ? brief.bullets.map((b: string, i: number) => (
                                <li key={i} className="text-[13px] text-content-secondary">{b}</li>
                              )) : <div className="text-[13px] text-content-muted italic">нет тезисов</div>}
                            </ul>
                          </div>
                          <div>
                            <h3 className="eyebrow mb-3">факты для использования</h3>
                            <ul className="list-disc list-inside space-y-1.5">
                              {brief.facts && brief.facts.length ? brief.facts.map((f: string, i: number) => (
                                <li key={i} className="text-[13px] text-[#111827] font-medium">{f}</li>
                              )) : <div className="text-[13px] text-content-muted italic">нет фактов</div>}
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                          <Button variant="outline" onClick={() => exportBriefToMd(brief)} className="h-8 px-4 text-[12px] lowercase font-medium rounded-md bg-white">
                            <Download className="w-3.5 h-3.5 mr-1.5" /> экспортировать .md
                          </Button>
                          <Button variant="outline" onClick={() => handleGoogleDocs(brief)} className="h-8 px-4 text-[12px] lowercase font-medium rounded-md bg-white border-blue-200 text-blue-700 hover:bg-blue-50">
                            <Share2 className="w-3.5 h-3.5 mr-1.5" /> отправить в google docs
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: FACTS */}
        {activeTab === 'facts' && (
          <div className="flex flex-col gap-6 h-full min-h-0">
            {/* Add Fact */}
            <div className="bg-white border border-border rounded-xl shadow-sm p-5 shrink-0">
              <h2 className="eyebrow mb-4">добавить факт</h2>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <input 
                  type="text" 
                  placeholder="тема / сущность (например: Год основания)" 
                  value={newFactTopic}
                  onChange={e => setNewFactTopic(e.target.value)}
                  className="w-full md:w-1/3 h-9 px-3 bg-[#fbfbfd] border border-border rounded-md text-[13px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
                <input 
                  type="text" 
                  placeholder="значение / описание факта" 
                  value={newFactValue}
                  onChange={e => setNewFactValue(e.target.value)}
                  className="w-full md:flex-1 h-9 px-3 bg-[#fbfbfd] border border-border rounded-md text-[13px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
                <Button onClick={handleAddFact} className="w-full md:w-auto h-9 px-6 rounded-md lowercase font-medium text-[13px] shrink-0">
                  <Plus className="w-4 h-4 mr-1.5" /> добавить
                </Button>
              </div>
            </div>

            {/* Facts List */}
            <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col flex-1 min-h-0">
              <div className="p-4 border-b border-border shrink-0">
                <h2 className="eyebrow">список фактов</h2>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar p-2">
                <div className="space-y-1">
                  {facts.map(fact => (
                    <div key={fact.id} className="group flex items-start justify-between p-3 rounded-lg hover:bg-[#fbfbfd] transition-colors border border-transparent hover:border-border/50">
                      {editingFactId === fact.id ? (
                        <div className="flex-1 flex flex-col gap-2 mr-4">
                          <input 
                            type="text" 
                            value={editingFactTopic} 
                            onChange={e => setEditingFactTopic(e.target.value)} 
                            className="w-full md:w-1/3 h-8 px-2 bg-white border border-border rounded-md text-[13px] font-bold text-[#111827]"
                          />
                          <input 
                            type="text" 
                            value={editingFactValue} 
                            onChange={e => setEditingFactValue(e.target.value)} 
                            className="w-full h-8 px-2 bg-white border border-border rounded-md text-[13px] text-content-secondary"
                          />
                          <div className="flex gap-2 mt-1">
                            <Button variant="outline" size="sm" onClick={() => setEditingFactId(null)} className="h-7 text-[11px] px-3 lowercase rounded">отмена</Button>
                            <Button size="sm" onClick={() => handleUpdateFact(fact.id)} className="h-7 text-[11px] px-3 lowercase rounded">сохранить</Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div className="text-[13px] font-bold text-[#111827] mb-0.5">{fact.topic || fact.title}</div>
                            <div className="text-[13px] text-content-secondary leading-relaxed">{fact.value}</div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingFactId(fact.id); setEditingFactTopic(fact.topic || fact.title); setEditingFactValue(fact.value); }} className="p-1.5 text-content-tertiary hover:text-accent hover:bg-accent/10 rounded-md transition-colors" title="Редактировать">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteFact(fact.id)} className="p-1.5 text-content-tertiary hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Удалить">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: HALLUCINATIONS */}
        {activeTab === 'hallucinations' && (
          <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col h-full min-h-0">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary" />
                <input type="text" placeholder="поиск по тексту..." className="w-full h-9 pl-9 pr-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none lowercase" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button className="h-9 px-3 flex items-center gap-2 bg-[#fbfbfd] border border-border rounded-md text-[13px] font-medium text-content-secondary hover:text-[#111827] lowercase transition-colors">
                  <Filter className="w-4 h-4" /> модель
                </button>
                <button className="h-9 px-3 flex items-center gap-2 bg-[#fbfbfd] border border-border rounded-md text-[13px] font-medium text-content-secondary hover:text-[#111827] lowercase transition-colors">
                  критичность
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 bg-[#fbfbfd] border-b border-border z-10">
                  <tr>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider w-[100px]">уровень</th>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider w-[120px]">модель</th>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider w-1/3">утверждение ии</th>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider w-1/3">реальный факт</th>
                    <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider">статус</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {hallucinations.map(hallu => (
                    <tr key={hallu.id} className="hover:bg-[#fbfbfd] transition-colors">
                      <td className="px-4 py-3">{getCritBadge(hallu.crit)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ModelIcon model={hallu.model} size={16} />
                          <span className="text-[12px] font-medium text-[#111827] capitalize">{hallu.model}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#111827] leading-relaxed">
                        <div className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                          {hallu.ai}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-content-secondary leading-relaxed">
                        {hallu.real}
                      </td>
                      <td className="px-4 py-3">
                        {hallu.status === 'fixed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-[#0F6E56]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> исправлено
                          </span>
                        ) : hallu.status === 'in_progress' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-[#B87503]">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> в процессе
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-orange-600">
                            <AlertTriangle className="w-3.5 h-3.5" /> требует проверки
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative group inline-block">
                          <Button 
                            variant="outline" 
                            disabled={hallu.status === 'in_progress' || hallu.status === 'fixed'} 
                            onClick={() => handleAutoPr(hallu.id)}
                            className="h-8 px-3 text-[11px] lowercase rounded flex items-center gap-1.5 bg-surface text-content-muted border-border/50 hover:bg-border/50 transition-colors"
                          >
                            <GitPullRequest className="w-3.5 h-3.5" /> 
                            {hallu.status === 'in_progress' ? 'В процессе' : 'auto-pr'}
                          </Button>
                          {!(hallu.status === 'in_progress' || hallu.status === 'fixed') && !integrations.some(i => i.provider === 'github' && i.status === 'connected') && (
                            <div className="absolute right-0 bottom-full mb-2 w-[180px] p-2 bg-[#111827] text-white text-[11px] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-center z-50 lowercase font-medium pointer-events-none">
                              подключите интеграцию
                              <svg className="absolute text-[#111827] h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
