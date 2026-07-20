import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useBrands } from '../BrandContext';
import { supabase } from '@/lib/supabase';
import { ModelIcon } from '@/components/ui/ModelIcon';
import { ScanButton } from '@/components/ScanButton';
import { useScanJobs } from '@/hooks/useScanJobs';
import { 
  Search, Filter, Calendar, CheckCircle2, XCircle, 
  RefreshCw, Bookmark, Play, ChevronRight, TerminalSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { computeNextScanAt } from '@/hooks/useTier';

// History logs mock
const mockLogs = [
  { id: 1, date: '25.10.2023 14:30', sortDate: '2023-10-25T14:30:00.000Z', prompt: 'какой лучший сервис для управления задачами?', model: 'chatgpt', result: { found: true, competitors: 3 } },
  { id: 2, date: '25.10.2023 12:15', sortDate: '2023-10-25T12:15:00.000Z', prompt: 'топ альтернатив jira', model: 'claude', result: { found: false, competitors: 5 } },
  { id: 3, date: '24.10.2023 09:00', sortDate: '2023-10-24T09:00:00.000Z', prompt: 'сравнение trello и asana', model: 'gemini', result: { found: true, competitors: 1 } },
  { id: 4, date: '24.10.2023 08:45', sortDate: '2023-10-24T08:45:00.000Z', prompt: 'лучшие бесплатные таск трекеры', model: 'perplexity', result: { found: false, competitors: 4 } },
  { id: 5, date: '23.10.2023 18:20', sortDate: '2023-10-23T18:20:00.000Z', prompt: 'какой софт использует apple', model: 'chatgpt', result: { found: true, competitors: 2 } },
];

// Personas mock
const MOCK_PERSONAS = [
  { id: '1', name: 'Студент', role: 'Студент', icon_emoji: '🎓', is_active: true },
  { id: '2', name: 'Предприниматель', role: 'Владелец ИП', icon_emoji: '💼', is_active: true },
];

export default function RunsView() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { brands } = useBrands();
  
  const currentBrand = brands.find(b => b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);
  const projectId = currentBrand?.id;
  
  // Extract tab from URL
  const activeTab = location.pathname.includes('manual') ? 'manual' : 'history';

  const handleTabChange = (tab: string) => {
    navigate(`/workspace/${slug}/runs/${tab}`, { replace: true });
  };

  // Realtime subscription for new mentions from scan pipeline
  const { subscribeToMentions, subscribeToProjectJobs } = useScanJobs(projectId);

  useEffect(() => {
    if (!projectId || activeTab !== 'history') return;

    // Subscribe to new mentions — prepend to history table in realtime
    const unsubMentions = subscribeToMentions(projectId, (newMention) => {
      const formatted = {
        id: newMention.id,
        date: new Date(newMention.created_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }),
        sortDate: newMention.created_at,
        prompt: '...',
        model: newMention.ai_model,
        result: {
          found: newMention.brand_mentioned,
          competitors: newMention.competitors_mentioned?.length || 0,
        },
      };
      setHistoryLogs(prev => [formatted, ...prev]);
    });

    // Subscribe to scan_jobs updates to track active scans
    const unsubJobs = subscribeToProjectJobs(projectId);

    return () => {
      unsubMentions();
      unsubJobs();
    };
  }, [projectId, activeTab, subscribeToMentions, subscribeToProjectJobs]);

  // State for History
  const [historyLogs, setHistoryLogs] = useState<any[]>(mockLogs);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter dropdown states
  const [modelFilterOpen, setModelFilterOpen] = useState(false);
  const [periodFilterOpen, setPeriodFilterOpen] = useState(false);
  const [resultFilterOpen, setResultFilterOpen] = useState(false);
  const [selectedModelFilter, setSelectedModelFilter] = useState<string | null>(null);
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<string | null>(null);
  const [selectedResultFilter, setSelectedResultFilter] = useState<string | null>(null);

  // State for Manual Run
  const [manualPrompt, setManualPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['chatgpt']);
  const [isRunning, setIsRunning] = useState(false);
  const [runResults, setRunResults] = useState<any>(null);
  const [manualHistory, setManualHistory] = useState<any[]>([
    { id: 'm1', prompt: 'лучшие аналоги в 2024 году', models: ['chatgpt', 'claude'], date: 'сегодня в 12:45' },
    { id: 'm2', prompt: 'какие сервисы подходят для стартапа', models: ['gemini'], date: 'вчера в 15:30' }
  ]);

  const toggleModel = (m: string) => {
    if (selectedModels.includes(m)) setSelectedModels(selectedModels.filter(x => x !== m));
    else setSelectedModels([...selectedModels, m]);
  };

  const [personas] = useState<any[]>(MOCK_PERSONAS);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [isGeneratingVariant, setIsGeneratingVariant] = useState(false);

  // Fetch History
  useEffect(() => {
    if (!projectId || activeTab !== 'history') return;
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      try {
        let query = supabase.from('runs').select('*').eq('project_id', projectId).eq('is_manual', false).order('created_at', { ascending: false }).limit(20);
        if (searchQuery) query = query.ilike('prompt_text', `%${searchQuery}%`);
        
        const { data, error } = await query;
        if (error) throw error;
        if (data && data.length > 0) {
          setHistoryLogs(data.map(d => ({
            id: d.id,
            date: new Date(d.created_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }),
            sortDate: d.created_at,
            prompt: d.prompt_text,
            model: d.model,
            result: { found: d.status === 'found', competitors: 0 }
          })));
        } else {
          setHistoryLogs(mockLogs);
        }
      } catch (err) {
        console.warn('Fallback to mock logs', err);
        setHistoryLogs(mockLogs);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [projectId, activeTab, searchQuery]);

  // Fetch Manual History
  useEffect(() => {
    if (!projectId || activeTab !== 'manual') return;
    const fetchManualHistory = async () => {
      try {
        const { data, error } = await supabase.from('runs').select('*').eq('project_id', projectId).eq('is_manual', true).order('created_at', { ascending: false }).limit(5);
        if (error) throw error;
        if (data && data.length > 0) {
          setManualHistory(data.map(d => ({
            id: d.id,
            prompt: d.prompt_text,
            models: [d.model],
            date: new Date(d.created_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
          })));
        }
      } catch (err) {
        console.warn('Fallback to mock manual history', err);
      }
    };
    fetchManualHistory();
  }, [projectId, activeTab, runResults]);

  const handleRun = async () => {
    if (!manualPrompt.trim() || selectedModels.length === 0) return;
    
    // Simulate generate-persona-variant
    let finalPrompt = manualPrompt;
    if (selectedPersona) {
      setIsGeneratingVariant(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const p = personas.find(x => x.id === selectedPersona);
      finalPrompt = `[${p?.name}] Как студент, который хочет сэкономить: ${manualPrompt}`;
      setManualPrompt(finalPrompt);
      setIsGeneratingVariant(false);
    }

    setIsRunning(true);
    setRunResults(selectedModels.map(m => ({ model: m, loading: true, personaId: selectedPersona })));
    
    try {
      const { data, error } = await supabase.functions.invoke('manual-run', {
        body: { project_id: projectId, prompt_text: manualPrompt, models: selectedModels }
      });
      if (error) throw error;
      setRunResults(data.results);
      setIsRunning(false);
    } catch (err) {
      console.warn('Edge function error, using mock output', err);
      setTimeout(() => {
        setRunResults(
          selectedModels.map(m => ({
            model: m,
            personaId: selectedPersona,
            version: m === 'chatgpt' ? 'gpt-4o' : m === 'claude' ? 'claude-3.5-sonnet' : m === 'gemini' ? 'gemini-1.5-pro' : 'sonar-pro',
            response: `Здесь находится сгенерированный ответ от модели ${m}. Упоминание бренда <span class="bg-accent/20 text-accent font-bold px-1 rounded">${currentBrand?.name || slug}</span> найдено в контексте отличного решения для бизнеса, наряду с несколькими альтернативами. Модель также указала ключевые фичи продукта.`,
          }))
        );
        setIsRunning(false);
      }, 2000);
    }
  };

  const handleSavePrompt = async (promptText: string) => {
    try {
      // New prompts default to 'weekly' cadence so the scheduler can pick
      // them up without over-spending API credits on day one.
      const { error } = await supabase.from('tracked_prompts').insert({
        project_id: projectId,
        prompt_text: promptText,
        ai_models: selectedModels,
        is_active: true,
        frequency: 'weekly',
        next_scan_at: computeNextScanAt('weekly'),
      });
      if (error) throw error;
      toast({ title: 'Сохранено в библиотеку', description: 'Промпт успешно добавлен.' });
    } catch (err) {
      console.warn('Fallback: DB not ready', err);
      toast({ title: 'Сохранено локально', description: 'Промпт сохранён в локальной эмуляции.' });
    }
  };

  // State for History Modal
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const filteredHistoryLogs = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return historyLogs.filter((log: any) => {
      const matchesQuery = !query || [log.prompt, log.model, log.date].some((value) => String(value).toLowerCase().includes(query));
      const matchesModel = !selectedModelFilter || log.model === selectedModelFilter;
      const matchesResult = !selectedResultFilter || (selectedResultFilter === 'found' ? log.result?.found : !log.result?.found);

      let matchesPeriod = true;
      if (selectedPeriodFilter && log.sortDate) {
        const date = new Date(log.sortDate);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - 6);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        if (selectedPeriodFilter === 'today') matchesPeriod = date >= startOfToday;
        if (selectedPeriodFilter === 'week') matchesPeriod = date >= startOfWeek;
        if (selectedPeriodFilter === 'month') matchesPeriod = date >= startOfMonth;
      }

      return matchesQuery && matchesModel && matchesResult && matchesPeriod;
    });
  }, [historyLogs, searchQuery, selectedModelFilter, selectedPeriodFilter, selectedResultFilter]);

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto pb-6 relative">
      {/* Tabs Header */}
      <div className="flex items-center gap-6 border-b border-border mb-6">
        <button 
          className={`pb-3 text-[13px] font-medium lowercase transition-colors relative ${activeTab === 'history' ? 'text-[#111827]' : 'text-content-secondary hover:text-[#111827]'}`}
          onClick={() => handleTabChange('history')}
        >
          история
          {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-md"></div>}
        </button>
        <button 
          className={`pb-3 text-[13px] font-medium lowercase transition-colors relative ${activeTab === 'manual' ? 'text-[#111827]' : 'text-content-secondary hover:text-[#111827]'}`}
          onClick={() => handleTabChange('manual')}
        >
          ручной запуск
          {activeTab === 'manual' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-md"></div>}
        </button>
      </div>

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-border rounded-xl shadow-sm">
          {/* Toolbar */}
          <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="поиск по промптам..." 
                className="w-full h-9 pl-9 pr-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none lowercase" 
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Run new scan button */}
              <ScanButton
                projectId={projectId}
                label="запустить скан"
                variant="outline"
                size="sm"
                className="h-9 px-3 text-[13px] font-medium lowercase"
                onScanComplete={() => {
                  // Reload history after scan completes
                  setSearchQuery(q => q); // trigger useEffect re-run
                }}
              />
              {/* Model Filter */}
              <div className="relative">
                <button 
                  onClick={() => setModelFilterOpen(!modelFilterOpen)}
                  className={`h-9 px-3 flex items-center gap-2 rounded-md text-[13px] font-medium lowercase transition-colors ${selectedModelFilter ? 'bg-accent/10 border border-accent text-accent' : 'bg-[#fbfbfd] border border-border text-content-secondary hover:text-[#111827]'}`}
                >
                  <Filter className="w-4 h-4" /> модель
                </button>
                {modelFilterOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-xl z-50 min-w-[160px] py-1">
                    <button onClick={() => { setSelectedModelFilter(null); setModelFilterOpen(false); }} className="w-full px-3 py-2 text-left text-[12px] text-content-secondary hover:bg-[#fbfbfd] lowercase">все</button>
                    {['chatgpt', 'claude', 'gemini', 'perplexity'].map(m => (
                      <button key={m} onClick={() => { setSelectedModelFilter(m); setModelFilterOpen(false); }} className="w-full px-3 py-2 text-left text-[12px] text-content-secondary hover:bg-[#fbfbfd] lowercase flex items-center gap-2">
                        <ModelIcon model={m} size={14} />
                        {m === 'chatgpt' ? 'ChatGPT' : m.charAt(0).toUpperCase() + m.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Period Filter */}
              <div className="relative">
                <button 
                  onClick={() => setPeriodFilterOpen(!periodFilterOpen)}
                  className={`h-9 px-3 flex items-center gap-2 rounded-md text-[13px] font-medium lowercase transition-colors ${selectedPeriodFilter ? 'bg-accent/10 border border-accent text-accent' : 'bg-[#fbfbfd] border border-border text-content-secondary hover:text-[#111827]'}`}
                >
                  <Calendar className="w-4 h-4" /> период
                </button>
                {periodFilterOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-xl z-50 min-w-[140px] py-1">
                    <button onClick={() => { setSelectedPeriodFilter(null); setPeriodFilterOpen(false); }} className="w-full px-3 py-2 text-left text-[12px] text-content-secondary hover:bg-[#fbfbfd] lowercase">все</button>
                    <button onClick={() => { setSelectedPeriodFilter('today'); setPeriodFilterOpen(false); }} className="w-full px-3 py-2 text-left text-[12px] text-content-secondary hover:bg-[#fbfbfd] lowercase">сегодня</button>
                    <button onClick={() => { setSelectedPeriodFilter('week'); setPeriodFilterOpen(false); }} className="w-full px-3 py-2 text-left text-[12px] text-content-secondary hover:bg-[#fbfbfd] lowercase">эта неделя</button>
                    <button onClick={() => { setSelectedPeriodFilter('month'); setPeriodFilterOpen(false); }} className="w-full px-3 py-2 text-left text-[12px] text-content-secondary hover:bg-[#fbfbfd] lowercase">этот месяц</button>
                  </div>
                )}
              </div>
              
              {/* Result Filter */}
              <div className="relative">
                <button 
                  onClick={() => setResultFilterOpen(!resultFilterOpen)}
                  className={`h-9 px-3 flex items-center gap-2 rounded-md text-[13px] font-medium lowercase transition-colors ${selectedResultFilter ? 'bg-accent/10 border border-accent text-accent' : 'bg-[#fbfbfd] border border-border text-content-secondary hover:text-[#111827]'}`}
                >
                  <CheckCircle2 className="w-4 h-4" /> результат
                </button>
                {resultFilterOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-xl z-50 min-w-[140px] py-1">
                    <button onClick={() => { setSelectedResultFilter(null); setResultFilterOpen(false); }} className="w-full px-3 py-2 text-left text-[12px] text-content-secondary hover:bg-[#fbfbfd] lowercase">все</button>
                    <button onClick={() => { setSelectedResultFilter('found'); setResultFilterOpen(false); }} className="w-full px-3 py-2 text-left text-[12px] text-content-secondary hover:bg-[#fbfbfd] lowercase flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-[#0F6E56]" /> найден
                    </button>
                    <button onClick={() => { setSelectedResultFilter('not_found'); setResultFilterOpen(false); }} className="w-full px-3 py-2 text-left text-[12px] text-content-secondary hover:bg-[#fbfbfd] lowercase flex items-center gap-2">
                      <XCircle className="w-3 h-3 text-[#A32D2D]" /> не найден
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Table */}
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            {isHistoryLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-accent animate-spin" />
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#fbfbfd] border-b border-border shadow-sm z-10">
                <tr>
                  <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider">дата / время</th>
                  <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider">промпт</th>
                  <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider">модель</th>
                  <th className="px-4 py-3 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider">результат</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredHistoryLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-[13px] text-content-secondary lowercase">
                      по выбранным фильтрам ничего не найдено
                    </td>
                  </tr>
                ) : filteredHistoryLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#fbfbfd] cursor-pointer group transition-colors" onClick={() => setSelectedLog(log)}>
                    <td className="px-4 py-3 whitespace-nowrap text-[12px] font-mono text-content-secondary">{log.date}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-[#111827] max-w-[300px] truncate" title={log.prompt}>{log.prompt}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ModelIcon model={log.model} size={16} />
                        <span className="text-[12px] font-mono font-medium text-[#111827] capitalize">{log.model === 'chatgpt' ? 'ChatGPT' : log.model.charAt(0).toUpperCase() + log.model.slice(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {log.result.found ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-[#0F6E56] bg-[#E1F5EE] lowercase font-mono">
                            <CheckCircle2 className="w-3 h-3" /> найден
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-[#A32D2D] bg-[#FCEBEB] lowercase font-mono">
                            <XCircle className="w-3 h-3" /> не найден
                          </span>
                        )}
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-border text-[11px] font-mono font-medium text-content-secondary bg-[#fbfbfd]">
                          конк: {log.result.competitors}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Run Tab */}
      {activeTab === 'manual' && (
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-border rounded-xl shadow-sm p-5">
            <h2 className="eyebrow mb-4">новый запрос</h2>
            <textarea 
              value={manualPrompt}
              onChange={e => setManualPrompt(e.target.value)}
              placeholder="Введите промпт для проверки видимости бренда (например: 'какой лучший сервис для X?')..."
              className="w-full h-24 p-3 bg-[#fbfbfd] border border-border rounded-lg text-[13px] text-content-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none custom-scrollbar mb-4"
            />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  {['chatgpt', 'claude', 'gemini', 'perplexity'].map(m => {
                  const isSelected = selectedModels.includes(m);
                  return (
                    <button 
                      key={m}
                      onClick={() => toggleModel(m)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${isSelected ? 'border-accent bg-accent/5 shadow-[0_1px_2px_rgba(109,95,232,0.1)]' : 'border-border bg-[#fbfbfd] hover:border-accent/50 opacity-70 hover:opacity-100'}`}
                    >
                      <ModelIcon model={m} size={16} />
                      <span className="text-[12px] font-medium text-[#111827]">{m === 'chatgpt' ? 'ChatGPT' : m.charAt(0).toUpperCase() + m.slice(1)}</span>
                    </button>
                  );
                })}
                </div>
                
                <div className="h-6 w-px bg-border/50 hidden sm:block"></div>
                
                <select 
                  className="h-9 pl-3 pr-8 rounded-lg border border-border bg-[#fbfbfd] text-[12px] font-medium text-content-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent appearance-none cursor-pointer hover:border-accent/50 transition-colors"
                  value={selectedPersona || ''}
                  onChange={e => setSelectedPersona(e.target.value || null)}
                >
                  <option value="">Без персонажа</option>
                  {personas.filter(p => p.is_active).map(p => (
                    <option key={p.id} value={p.id}>{p.icon_emoji} от лица: {p.name}</option>
                  ))}
                </select>
              </div>
              
              <Button onClick={handleRun} disabled={isRunning || isGeneratingVariant || !manualPrompt.trim() || selectedModels.length === 0} className="h-9 px-6 rounded-md lowercase font-medium text-[13px] w-full sm:w-auto shrink-0">
                {isRunning || isGeneratingVariant ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2 fill-current" />
                )}
                {isGeneratingVariant ? 'переформулируем...' : 'запустить'}
              </Button>
            </div>
          </div>

          {/* Results Area */}
          {(isRunning || runResults) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(runResults || selectedModels.map(m => ({ model: m, loading: true }))).map((res: any, idx: number) => (
                <div key={idx} className="bg-[#0b0d12] rounded-xl border border-white/10 overflow-hidden flex flex-col shadow-xl">
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10 bg-[#161a22]">
                    <div className="flex items-center gap-2.5">
                      <ModelIcon model={res.model} size={18} />
                      <span className="text-[12px] font-medium text-white">{res.model === 'chatgpt' ? 'ChatGPT' : res.model.charAt(0).toUpperCase() + res.model.slice(1)}</span>
                      {!res.loading && <span className="text-[10px] font-mono text-white/40 ml-1">{res.version}</span>}
                      {res.personaId && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-sm bg-white/10 text-white/80 text-[10px] font-medium flex items-center gap-1">
                          {personas.find(p => p.id === res.personaId)?.icon_emoji} {personas.find(p => p.id === res.personaId)?.name}
                        </span>
                      )}
                    </div>
                    {!res.loading && (
                      <button 
                        className="text-white/40 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-medium lowercase bg-white/5 hover:bg-white/10 px-1.5 py-1 rounded" 
                        title="Сохранить в библиотеку"
                        onClick={() => handleSavePrompt(manualPrompt)}
                      >
                        <Bookmark className="w-3.5 h-3.5" /> сохранить
                      </button>
                    )}
                  </div>
                  {/* Terminal Body */}
                  <div className="p-4 flex-1 text-[13px] font-mono text-white/80 leading-relaxed custom-scrollbar max-h-[300px] overflow-y-auto min-h-[120px]">
                    {res.loading ? (
                      <div className="flex items-center gap-3 text-white/40 mt-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Ожидание ответа...</span>
                      </div>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: res.response }} className="opacity-90" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Manual Runs */}
          {!isRunning && !runResults && (
            <div className="bg-white border border-border rounded-xl shadow-sm p-5">
              <h2 className="eyebrow mb-4">история ручных запусков</h2>
              <div className="space-y-3">
                {manualHistory.map(item => (
                  <div key={item.id} className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border hover:border-accent/30 hover:bg-[#fbfbfd] transition-colors group cursor-pointer" onClick={() => setManualPrompt(item.prompt)}>
                    <div>
                      <div className="text-[13px] font-medium text-[#111827] line-clamp-1 group-hover:text-accent transition-colors">{item.prompt}</div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5 opacity-80">
                          {item.models.map((m: string) => <ModelIcon key={`${item.id}-${m}`} model={m} size={14} />)}
                        </div>
                        <span className="text-[10px] font-mono text-content-tertiary">{item.date}</span>
                      </div>
                    </div>
                    <button 
                      className="p-1.5 text-content-muted hover:text-accent rounded-md hover:bg-accent/10 transition-colors" 
                      title="Повторить запрос" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setManualPrompt(item.prompt); 
                        setSelectedModels(item.models);
                        // Trigger run after state updates via setTimeout
                        setTimeout(() => handleRun(), 0);
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Run Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-border bg-[#fbfbfd]">
              <div className="flex items-center gap-3">
                <ModelIcon model={selectedLog.model} size={20} />
                <span className="font-medium text-[#111827] capitalize">{selectedLog.model === 'chatgpt' ? 'ChatGPT' : selectedLog.model.charAt(0).toUpperCase() + selectedLog.model.slice(1)}</span>
                <span className="text-[12px] font-mono text-content-tertiary">{selectedLog.date}</span>
              </div>
              <button className="text-content-muted hover:text-[#111827]" onClick={() => setSelectedLog(null)}>
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-auto custom-scrollbar flex-1">
              <div className="mb-4">
                <div className="eyebrow mb-2">Промпт</div>
                <div className="text-[13px] text-[#111827] font-medium bg-[#fbfbfd] p-3 rounded-md border border-border">{selectedLog.prompt}</div>
              </div>
              <div>
                <div className="eyebrow mb-2">Ответ модели</div>
                <div className="text-[13px] text-content-secondary leading-relaxed bg-[#fbfbfd] p-3 rounded-md border border-border whitespace-pre-wrap">
                  {selectedLog.response_text || `Здесь находится подробный текст ответа нейросети по запросу:\n"${selectedLog.prompt}".\n\nВ реальной БД здесь будет полное содержимое колонки response_text.`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
