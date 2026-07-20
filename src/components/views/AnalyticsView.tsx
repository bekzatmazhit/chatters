import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useBrands } from '../BrandContext';
import { supabase } from '@/lib/supabase';
import { ModelIcon } from '@/components/ui/ModelIcon';
import { BrandAvatar } from '@/components/ui/BrandAvatar';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, ExternalLink, ShieldCheck, FileText, 
  Plus, Search, Filter, CheckCircle2, XCircle, MoreVertical, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromptFrequencySelect } from '@/components/PromptFrequencySelect';
import { computeNextScanAt, useTier, type Frequency } from '@/hooks/useTier';

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
  { id: 1, text: 'какой лучший банк для бизнеса в казахстане?', models: ['chatgpt', 'claude', 'gemini'], freq: 45, lastFound: true, active: true, runForPersonas: ['1', '2'] },
  { id: 2, text: 'открыть ип онлайн бесплатно', models: ['chatgpt', 'perplexity'], freq: 12, lastFound: false, active: true, runForPersonas: [] },
  { id: 3, text: 'отзывы о приложении каспи', models: ['claude', 'gemini'], freq: 84, lastFound: true, active: false, runForPersonas: ['3'] },
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

const MOCK_PERSONAS = [
  { id: '1', name: 'Студент', role: 'Студент', city: 'Алматы', language: 'ru', context_notes: 'экономит, ищет кэшбеки', icon_emoji: '🎓', is_active: true, sov: 45, mentions: 120, sentiment: 4.2 },
  { id: '2', name: 'Предприниматель', role: 'Владелец ИП', city: 'Астана', language: 'ru', context_notes: 'важны условия по эквайрингу', icon_emoji: '💼', is_active: true, sov: 38, mentions: 85, sentiment: 3.9 },
  { id: '3', name: 'Пенсионер', role: 'Пенсионер', city: 'Шымкент', language: 'kz', context_notes: 'плохо разбирается в технологиях', icon_emoji: '👵', is_active: false, sov: 20, mentions: 15, sentiment: 2.1 },
];

const MARKET_DATA = [
  { id: '1', name: 'BCC', occurrences: 45, trend: 12 },
  { id: '2', name: 'ForteBank', occurrences: 32, trend: -5 },
  { id: '3', name: 'Jusan', occurrences: 28, trend: 8 },
];

export default function AnalyticsView() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { brands } = useBrands();
  
  const currentBrand = brands.find(b => b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);
  const projectId = currentBrand?.id;
  const { tier } = useTier({ projectId });
  
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[pathParts.length - 1] === 'analytics' ? 'models' : pathParts[pathParts.length - 1];

  const handleTabChange = (tab: string) => {
    navigate(`/workspace/${slug}/analytics/${tab}`, { replace: true });
  };

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [modelsData, setModelsData] = useState<any[]>(MODELS_DATA);
  const [sourcesData, setSourcesData] = useState<any[]>(SOURCES_DATA);
  const [promptsData, setPromptsData] = useState<any[]>(PROMPTS_DATA);
  const [compareData, setCompareData] = useState<any[]>(COMPARE_DATA);
  const [compareSovData, setCompareSovData] = useState<any[]>(COMPARE_SOV_DATA);
  const [marketData, setMarketData] = useState<any[]>(MARKET_DATA);
  
  // Search inputs
  const [sourcesSearchQuery, setSourcesSearchQuery] = useState('');
  const [promptsSearchQuery, setPromptsSearchQuery] = useState('');
  
  // Filter dropdowns
  const [sourcesModelFilterOpen, setSourcesModelFilterOpen] = useState(false);
  const [selectedSourcesModelFilter, setSelectedSourcesModelFilter] = useState<string | null>(null);

  const [onlyLosses, setOnlyLosses] = useState(false);
  const [isAddPromptModalOpen, setIsAddPromptModalOpen] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [newPromptText, setNewPromptText] = useState('');
  const [newPromptModels, setNewPromptModels] = useState<string[]>(['chatgpt']);

  // Personas State
  const [personas, setPersonas] = useState<any[]>(MOCK_PERSONAS);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);
  const [isSuggestingPersonas, setIsSuggestingPersonas] = useState(false);
  const [selectedPersonaForExamples, setSelectedPersonaForExamples] = useState<string | null>(null);
  const [newPersona, setNewPersona] = useState({ name: '', role: '', city: '', language: 'ru', context_notes: '', icon_emoji: '👤' });
  const [selectedPersonasForPrompt, setSelectedPersonasForPrompt] = useState<string[]>([]);

  // Fetch Logic depending on active tab
  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'models') {
          // Fake aggregation for models, fallback to dbModelStats if we had it
        } else if (activeTab === 'sources') {
          const { data, error } = await supabase.from('citations').select('*').eq('project_id', projectId).order('frequency', { ascending: false }).limit(50);
          if (data && data.length > 0) {
            setSourcesData(data.map(d => ({
              id: d.id, domain: d.domain, url: d.url, citations: d.frequency,
              prompt: d.prompt, model: d.model, date: new Date(d.created_at).toLocaleDateString('ru-RU'),
              own: false
            })));
          }
        } else if (activeTab === 'prompts') {
          const { data, error } = await supabase.from('tracked_prompts').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
          if (data && data.length > 0) {
            setPromptsData(data.map(d => ({
              id: d.id, text: d.prompt_text, models: d.ai_models || [], freq: 0,
              lastFound: true, active: d.is_active,
              frequency: (d.frequency as Frequency) ?? 'weekly',
              last_scanned_at: d.last_scanned_at,
              next_scan_at: d.next_scan_at,
            })));
          }
        } else if (activeTab === 'compare') {
          // Fetch runs and aggregate
          // Let's just fallback to mock for now if no real data
        } else if (activeTab === 'market') {
          // fetch missed competitors
        }
      } catch (err) {
        console.warn('Fallback: DB table error for Analytics', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [projectId, activeTab]);

  const filteredCompareData = useMemo(() => {
    if (!onlyLosses) return compareData;
    return compareData.filter(row => row.brand === 0 || (row.comp1 > 0 && row.comp1 < row.brand));
  }, [compareData, onlyLosses]);

  const filteredSourcesData = useMemo(() => {
    const query = sourcesSearchQuery.toLowerCase();
    return sourcesData.filter(row => {
      const matchesQuery = !query || row.domain.toLowerCase().includes(query) || row.prompt.toLowerCase().includes(query);
      const matchesModel = !selectedSourcesModelFilter || row.model === selectedSourcesModelFilter;
      return matchesQuery && matchesModel;
    });
  }, [sourcesData, selectedSourcesModelFilter, sourcesSearchQuery]);

  const filteredPromptsData = useMemo(() => {
    const query = promptsSearchQuery.toLowerCase();
    return promptsData.filter(row => !query || row.text.toLowerCase().includes(query));
  }, [promptsData, promptsSearchQuery]);

  // Prompt Handlers
  const handleSavePrompt = async () => {
    if (!newPromptText.trim()) return;
    // New prompts default to 'weekly' (a safe default across all tiers);
    // next_scan_at is computed once so the scheduler can pick it up.
    const defaultFrequency: Frequency = 'weekly';
    const defaultNextScanAt = computeNextScanAt(defaultFrequency);
    try {
      if (isBulkMode) {
        const lines = newPromptText.split('\n').map(line => line.trim()).filter(Boolean);
        const inserts = lines.map(text => ({
          project_id: projectId,
          prompt_text: text,
          ai_models: newPromptModels,
          is_active: true,
          frequency: defaultFrequency,
          next_scan_at: defaultNextScanAt,
        }));
        await supabase.from('tracked_prompts').insert(inserts);
      } else {
        await supabase.from('tracked_prompts').insert({
          project_id: projectId,
          prompt_text: newPromptText,
          ai_models: newPromptModels,
          is_active: true,
          frequency: defaultFrequency,
          next_scan_at: defaultNextScanAt,
        });
      }
      setIsAddPromptModalOpen(false);
      setNewPromptText('');
      // Optimistic update omitted for brevity, reload tab
      handleTabChange('prompts');
    } catch (err) {
      console.warn('Fallback add prompt', err);
      setIsAddPromptModalOpen(false);
    }
  };

  // Update a prompt's per-prompt scan frequency, persisting + recomputing next_scan_at.
  // Tier gating is enforced inside <PromptFrequencySelect>, so by the time we
  // get here the value is allowed for the current tier.
  const handleChangeFrequency = async (promptId: any, next: Frequency) => {
    const nextScanAt = computeNextScanAt(next);
    setPromptsData(prev => prev.map(p => p.id === promptId
      ? { ...p, frequency: next, next_scan_at: nextScanAt }
      : p));
    try {
      await supabase
        .from('tracked_prompts')
        .update({ frequency: next, next_scan_at: nextScanAt })
        .eq('id', promptId);
    } catch (err) {
      console.warn('Update prompt frequency fallback', err);
    }
  };

  const togglePromptStatus = async (id: any, currentStatus: boolean) => {
    setPromptsData(prev => prev.map(p => p.id === id ? { ...p, active: !currentStatus } : p));
    try {
      await supabase.from('tracked_prompts').update({ is_active: !currentStatus }).eq('id', id);
    } catch (err) {
      console.warn('Toggle prompt fallback', err);
    }
  };

  const deletePrompt = async (id: any) => {
    if (!confirm('Удалить промпт?')) return;
    setPromptsData(prev => prev.filter(p => p.id !== id));
    try {
      await supabase.from('tracked_prompts').delete().eq('id', id);
    } catch (err) {
      console.warn('Delete prompt fallback', err);
    }
  };

  // Market Handler
  const handleAddCompetitor = async (name: string, id: string) => {
    try {
      const currentComps = currentBrand?.competitors || [];
      const updatedComps = [...currentComps, name];
      await supabase.from('projects').update({ competitors: updatedComps }).eq('id', projectId);
      setMarketData(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.warn('Add competitor fallback', err);
      setMarketData(prev => prev.filter(m => m.id !== id));
    }
  };

  const tabs = [
    { id: 'models', label: 'по моделям' },
    { id: 'sources', label: 'источники' },
    { id: 'prompts', label: 'промпты' },
    { id: 'personas', label: 'персонажи' },
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
              {modelsData.map(model => (
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
                  <BarChart data={modelsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                      {modelsData.map((entry, index) => (
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
                <input 
                  type="text" 
                  value={sourcesSearchQuery}
                  onChange={e => setSourcesSearchQuery(e.target.value)}
                  placeholder="поиск по доменам..." 
                  className="w-full h-9 pl-9 pr-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none lowercase" 
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setSourcesModelFilterOpen(!sourcesModelFilterOpen)}
                    className={`h-9 px-3 flex items-center gap-2 rounded-md text-[13px] font-medium lowercase transition-colors ${selectedSourcesModelFilter ? 'bg-accent/10 border border-accent text-accent' : 'bg-[#fbfbfd] border border-border text-content-secondary hover:text-[#111827]'}`}
                  >
                    <Filter className="w-4 h-4" /> модель
                  </button>
                  {sourcesModelFilterOpen && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-border rounded-lg shadow-xl z-50 min-w-[160px] py-1">
                      <button onClick={() => { setSelectedSourcesModelFilter(null); setSourcesModelFilterOpen(false); }} className="w-full px-3 py-2 text-left text-[12px] text-content-secondary hover:bg-[#fbfbfd] lowercase">все</button>
                      {['chatgpt', 'claude', 'gemini', 'perplexity'].map(m => (
                        <button key={m} onClick={() => { setSelectedSourcesModelFilter(m); setSourcesModelFilterOpen(false); }} className="w-full px-3 py-2 text-left text-[12px] text-content-secondary hover:bg-[#fbfbfd] lowercase flex items-center gap-2">
                          <ModelIcon model={m} size={14} />
                          {m === 'chatgpt' ? 'ChatGPT' : m.charAt(0).toUpperCase() + m.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-accent animate-spin" />
                </div>
              )}
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
                  {sourcesData.map(src => (
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
          <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col flex-1 min-h-0 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-accent animate-spin" />
              </div>
            )}
            <div className="p-4 border-b border-border flex items-center justify-between gap-4">
              <div className="relative w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary" />
                <input 
                  type="text" 
                  value={promptsSearchQuery}
                  onChange={e => setPromptsSearchQuery(e.target.value)}
                  placeholder="поиск промптов..." 
                  className="w-full h-9 pl-9 pr-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none lowercase" 
                />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="h-9 px-3 flex items-center gap-2 bg-[#fbfbfd] border border-border rounded-md text-[13px] font-medium text-content-secondary hover:text-[#111827] lowercase transition-colors"
                  onClick={() => { setIsBulkMode(true); setIsAddPromptModalOpen(true); }}
                >
                  массовое добавление
                </button>
                <Button 
                  className="h-9 px-4 rounded-md lowercase font-medium text-[13px]"
                  onClick={() => { setIsBulkMode(false); setIsAddPromptModalOpen(true); }}
                >
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
                  {filteredPromptsData.map(prompt => (
                    <tr key={prompt.id} className={`hover:bg-[#fbfbfd] transition-colors ${!prompt.active ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3 text-[13px] font-medium text-[#111827] pr-8">{prompt.text}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {prompt.models.map((m: string) => (
                            <ModelIcon key={m} model={m} size={16} />
                          ))}
                        </div>
                        {prompt.runForPersonas && prompt.runForPersonas.length > 0 && (
                          <div className="flex items-center gap-0.5 mt-1">
                            {prompt.runForPersonas.map((pid: string) => {
                              const p = personas.find(x => x.id === pid);
                              return p ? <span key={pid} title={p.name} className="text-[12px] opacity-80">{p.icon_emoji}</span> : null;
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <PromptFrequencySelect
                          value={prompt.frequency}
                          tier={tier}
                          onChange={(next) => handleChangeFrequency(prompt.id, next)}
                        />
                      </td>
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
                        <div 
                          className={`relative inline-flex h-4 w-7 cursor-pointer items-center rounded-full transition-colors ${prompt.active ? 'bg-accent' : 'bg-border'}`}
                          onClick={() => togglePromptStatus(prompt.id, prompt.active)}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${prompt.active ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          className="text-content-tertiary hover:text-[#A32D2D] transition-colors p-1"
                          onClick={() => deletePrompt(prompt.id)}
                          title="Удалить"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: PERSONAS */}
        {activeTab === 'personas' && (
          <div className="flex flex-col gap-6 flex-1 min-h-0 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-accent animate-spin" />
              </div>
            )}
            
            {/* Personas Library */}
            <div className="bg-white border border-border rounded-xl shadow-sm p-5 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="eyebrow">библиотека персонажей</h2>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="h-8 px-3 text-[12px] lowercase bg-[#fbfbfd]"
                    onClick={() => {
                      setIsSuggestingPersonas(true);
                      setTimeout(() => {
                        setPersonas(prev => [
                          ...prev,
                          { id: Date.now() + 'a', name: 'Иностранец', role: 'Экспат', city: 'Алматы', language: 'en', context_notes: 'ищет мультивалютную карту', icon_emoji: '🌍', is_active: false, sov: 0, mentions: 0, sentiment: 0 }
                        ]);
                        setIsSuggestingPersonas(false);
                      }, 1500);
                    }}
                    disabled={isSuggestingPersonas}
                  >
                    {isSuggestingPersonas ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                    предложить персонажей
                  </Button>
                  <Button 
                    className="h-8 px-3 text-[12px] lowercase"
                    onClick={() => {
                      setEditingPersonaId(null);
                      setNewPersona({ name: '', role: '', city: '', language: 'ru', context_notes: '', icon_emoji: '👤' });
                      setIsPersonaModalOpen(true);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> создать персонажа
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personas.map(p => (
                  <div key={p.id} className={`border rounded-xl p-4 transition-colors ${p.is_active ? 'border-border/60 hover:border-border bg-white' : 'border-border/40 bg-[#fbfbfd] opacity-70'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-xl">
                          {p.icon_emoji}
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-[#111827]">{p.name}</div>
                          <div className="text-[12px] font-medium text-content-secondary">{p.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          className="text-content-tertiary hover:text-accent transition-colors" 
                          title="Редактировать"
                          onClick={() => {
                            setEditingPersonaId(p.id);
                            setNewPersona({ name: p.name, role: p.role, city: p.city, language: p.language, context_notes: p.context_notes, icon_emoji: p.icon_emoji });
                            setIsPersonaModalOpen(true);
                          }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-content-tertiary font-mono mb-3">
                      {p.city && <span className="px-1.5 py-0.5 rounded bg-[#fbfbfd] border border-border/50">{p.city}</span>}
                      <span className="px-1.5 py-0.5 rounded bg-[#fbfbfd] border border-border/50 uppercase">{p.language}</span>
                    </div>
                    <p className="text-[12px] text-content-secondary leading-relaxed line-clamp-2">
                      {p.context_notes}
                    </p>
                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                      <div className={`text-[11px] font-mono font-medium ${p.is_active ? 'text-[#0F6E56]' : 'text-content-muted'}`}>
                        {p.is_active ? 'Активен' : 'Отключен'}
                      </div>
                      <div 
                        className={`relative inline-flex h-4 w-7 cursor-pointer items-center rounded-full transition-colors ${p.is_active ? 'bg-accent' : 'bg-border'}`}
                        onClick={() => setPersonas(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x))}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${p.is_active ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Analytics */}
            <div className="bg-white border border-border rounded-xl shadow-sm flex-1 flex flex-col min-h-0">
              <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
                <h2 className="eyebrow">сравнение sov по персонажам</h2>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar flex flex-col lg:flex-row min-h-0">
                <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border overflow-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white border-b border-border z-10">
                      <tr>
                        <th className="px-3 py-2 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider">персонаж</th>
                        <th className="px-3 py-2 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider text-right">sov %</th>
                        <th className="px-3 py-2 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider text-right">упоминания</th>
                        <th className="px-3 py-2 font-mono text-[11px] font-medium text-content-muted uppercase tracking-wider text-right">тональность</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {personas.map(p => (
                        <tr key={p.id} className="hover:bg-[#fbfbfd] transition-colors cursor-pointer" onClick={() => setSelectedPersonaForExamples(p.id)}>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{p.icon_emoji}</span>
                              <span className="text-[13px] font-medium text-[#111827]">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right font-mono text-[13px] font-bold text-[#111827]">{p.sov}%</td>
                          <td className="px-3 py-3 text-right font-mono text-[12px] text-content-secondary">{p.mentions}</td>
                          <td className="px-3 py-3 text-right font-mono text-[12px]">
                            <span className={p.sentiment > 3 ? 'text-[#0F6E56]' : 'text-[#A32D2D]'}>{p.sentiment}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="w-full lg:w-1/3 p-4 bg-[#fbfbfd] flex flex-col min-h-0">
                  <h3 className="eyebrow mb-3">примеры ответов {selectedPersonaForExamples && personas.find(x => x.id === selectedPersonaForExamples)?.icon_emoji}</h3>
                  <div className="flex-1 overflow-auto custom-scrollbar space-y-3">
                    <div className="bg-white border border-border rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-content-secondary">
                          <ModelIcon model="chatgpt" size={14} /> chatgpt
                        </div>
                        <span className="text-[10px] uppercase font-bold text-[#0F6E56] bg-[#E1F5EE] px-1.5 py-0.5 rounded">положительно</span>
                      </div>
                      <div className="text-[12px] text-[#111827] leading-relaxed line-clamp-4">
                        "Для студентов отличным выбором будет карта от Halyk, так как они предоставляют бесплатное обслуживание и повышенные бонусы..."
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: COMPARE */}
        {activeTab === 'compare' && (
          <div className="flex flex-col gap-6 flex-1 min-h-0 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-accent animate-spin" />
              </div>
            )}
            {/* Top Chart */}
            <div className="bg-white border border-border rounded-xl p-5 shadow-sm shrink-0 h-[220px] flex flex-col">
              <h2 className="eyebrow mb-4">доля голоса: мы vs конкуренты</h2>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareSovData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'monospace' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'monospace' }} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: '1px solid #EDEAF5', fontSize: '12px', fontFamily: 'monospace' }} />
                    <Bar dataKey="sov" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {compareSovData.map((entry, index) => (
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
                  <input type="checkbox" checked={onlyLosses} onChange={e => setOnlyLosses(e.target.checked)} className="rounded border-border text-accent focus:ring-accent" />
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
                    {filteredCompareData.map((row, i) => (
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-accent animate-spin" />
              </div>
            )}
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
                  {marketData.map(comp => (
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
                        <Button 
                          variant="outline" 
                          className="h-8 px-3 text-[11px] lowercase rounded-md bg-white"
                          onClick={() => handleAddCompetitor(comp.name, comp.id)}
                        >
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

      {/* Add Prompt Modal */}
      {isAddPromptModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border bg-[#fbfbfd]">
              <div className="font-medium text-[#111827]">{isBulkMode ? 'Массовое добавление' : 'Добавить промпт'}</div>
              <button className="text-content-muted hover:text-[#111827]" onClick={() => setIsAddPromptModalOpen(false)}>
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="eyebrow mb-2 block">{isBulkMode ? 'Промпты (каждый с новой строки)' : 'Текст промпта'}</label>
                {isBulkMode ? (
                  <textarea 
                    value={newPromptText}
                    onChange={e => setNewPromptText(e.target.value)}
                    placeholder="какой лучший банк...&#10;топ банков рк..."
                    className="w-full h-32 p-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none custom-scrollbar"
                  />
                ) : (
                  <input 
                    type="text" 
                    value={newPromptText}
                    onChange={e => setNewPromptText(e.target.value)}
                    placeholder="например: какой лучший банк..." 
                    className="w-full h-9 px-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none" 
                  />
                )}
              </div>
              <div>
                <label className="eyebrow mb-2 block">Выбранные модели</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {['chatgpt', 'claude', 'gemini', 'perplexity'].map(m => (
                    <button
                      key={m}
                      className={`h-8 px-3 rounded-md text-[12px] font-medium transition-colors border ${newPromptModels.includes(m) ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-white border-border text-content-secondary hover:text-[#111827]'}`}
                      onClick={() => setNewPromptModels(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}
                    >
                      <div className="flex items-center gap-1.5 capitalize">
                        <ModelIcon model={m} size={14} />
                        {m}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {personas.length > 0 && (
                <div>
                  <label className="eyebrow mb-2 block">Прогонять для персонажей</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {personas.filter(p => p.is_active).map(p => (
                      <button
                        key={p.id}
                        className={`h-8 px-3 rounded-md text-[12px] font-medium transition-colors border ${selectedPersonasForPrompt.includes(p.id) ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-white border-border text-content-secondary hover:text-[#111827]'}`}
                        onClick={() => setSelectedPersonasForPrompt(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{p.icon_emoji}</span>
                          {p.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border bg-[#fbfbfd] flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddPromptModalOpen(false)}>Отмена</Button>
              <Button onClick={handleSavePrompt}>Сохранить</Button>
            </div>
          </div>
        </div>
      )}
      {/* Add Persona Modal */}
      {isPersonaModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border bg-[#fbfbfd]">
              <div className="font-medium text-[#111827]">{editingPersonaId ? 'Редактировать персонажа' : 'Новый персонаж'}</div>
              <button className="text-content-muted hover:text-[#111827]" onClick={() => setIsPersonaModalOpen(false)}>
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="w-16">
                  <label className="eyebrow mb-2 block">Эмодзи</label>
                  <input 
                    type="text" 
                    value={newPersona.icon_emoji}
                    onChange={e => setNewPersona({...newPersona, icon_emoji: e.target.value})}
                    className="w-full h-9 px-0 text-center text-xl bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none" 
                  />
                </div>
                <div className="flex-1">
                  <label className="eyebrow mb-2 block">Название (например: Студент)</label>
                  <input 
                    type="text" 
                    value={newPersona.name}
                    onChange={e => setNewPersona({...newPersona, name: e.target.value})}
                    className="w-full h-9 px-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none" 
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="eyebrow mb-2 block">Роль (опц.)</label>
                  <input 
                    type="text" 
                    value={newPersona.role}
                    onChange={e => setNewPersona({...newPersona, role: e.target.value})}
                    placeholder="Владелец ИП"
                    className="w-full h-9 px-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none" 
                  />
                </div>
                <div className="flex-1">
                  <label className="eyebrow mb-2 block">Город (опц.)</label>
                  <input 
                    type="text" 
                    value={newPersona.city}
                    onChange={e => setNewPersona({...newPersona, city: e.target.value})}
                    placeholder="Алматы"
                    className="w-full h-9 px-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="eyebrow mb-2 block">Доп. контекст (инструкция для ИИ)</label>
                <textarea 
                  value={newPersona.context_notes}
                  onChange={e => setNewPersona({...newPersona, context_notes: e.target.value})}
                  placeholder="Опишите, что важно для этого человека (например: ищет скидки, не разбирается в IT)..."
                  className="w-full h-24 p-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none custom-scrollbar"
                />
              </div>
            </div>
            <div className="p-4 border-t border-border bg-[#fbfbfd] flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsPersonaModalOpen(false)}>Отмена</Button>
              <Button onClick={() => {
                if (editingPersonaId) {
                  setPersonas(prev => prev.map(p => p.id === editingPersonaId ? { ...p, ...newPersona } : p));
                } else {
                  setPersonas(prev => [{ id: Date.now().toString(), ...newPersona, is_active: true, sov: 0, mentions: 0, sentiment: 0 }, ...prev]);
                }
                setIsPersonaModalOpen(false);
              }}>Сохранить</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
