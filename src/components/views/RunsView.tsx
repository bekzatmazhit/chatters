import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ModelIcon } from '@/components/ui/ModelIcon';
import { 
  Search, Filter, Calendar, CheckCircle2, XCircle, 
  RefreshCw, Bookmark, Play, ChevronRight, TerminalSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// History logs mock
const mockLogs = [
  { id: 1, date: '2023-10-25 14:30', prompt: 'какой лучший сервис для управления задачами?', model: 'chatgpt', result: { found: true, competitors: 3 } },
  { id: 2, date: '2023-10-25 12:15', prompt: 'топ альтернатив jira', model: 'claude', result: { found: false, competitors: 5 } },
  { id: 3, date: '2023-10-24 09:00', prompt: 'сравнение trello и asana', model: 'gemini', result: { found: true, competitors: 1 } },
  { id: 4, date: '2023-10-24 08:45', prompt: 'лучшие бесплатные таск трекеры', model: 'perplexity', result: { found: false, competitors: 4 } },
  { id: 5, date: '2023-10-23 18:20', prompt: 'какой софт использует apple', model: 'chatgpt', result: { found: true, competitors: 2 } },
];

export default function RunsView() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract tab from URL
  const activeTab = location.pathname.includes('manual') ? 'manual' : 'history';

  const handleTabChange = (tab: string) => {
    navigate(`/workspace/${slug}/runs/${tab}`, { replace: true });
  };

  // State for Manual Run
  const [manualPrompt, setManualPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['chatgpt']);
  const [isRunning, setIsRunning] = useState(false);
  const [runResults, setRunResults] = useState<any>(null);

  const toggleModel = (m: string) => {
    if (selectedModels.includes(m)) setSelectedModels(selectedModels.filter(x => x !== m));
    else setSelectedModels([...selectedModels, m]);
  };

  const handleRun = () => {
    if (!manualPrompt.trim() || selectedModels.length === 0) return;
    setIsRunning(true);
    setRunResults(null);
    setTimeout(() => {
      setRunResults(
        selectedModels.map(m => ({
          model: m,
          version: m === 'chatgpt' ? 'gpt-4o' : m === 'claude' ? 'claude-3.5-sonnet' : m === 'gemini' ? 'gemini-1.5-pro' : 'sonar-pro',
          response: `Здесь находится сгенерированный ответ от модели ${m}. Упоминание бренда <span class="bg-accent/20 text-accent font-bold px-1 rounded">${slug}</span> найдено в контексте отличного решения для бизнеса, наряду с несколькими альтернативами. Модель также указала ключевые фичи продукта.`,
        }))
      );
      setIsRunning(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto pb-6">
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
              <input type="text" placeholder="поиск по промптам..." className="w-full h-9 pl-9 pr-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none lowercase" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="h-9 px-3 flex items-center gap-2 bg-[#fbfbfd] border border-border rounded-md text-[13px] font-medium text-content-secondary hover:text-[#111827] lowercase transition-colors">
                <Filter className="w-4 h-4" /> модель
              </button>
              <button className="h-9 px-3 flex items-center gap-2 bg-[#fbfbfd] border border-border rounded-md text-[13px] font-medium text-content-secondary hover:text-[#111827] lowercase transition-colors">
                <Calendar className="w-4 h-4" /> период
              </button>
              <button className="h-9 px-3 flex items-center gap-2 bg-[#fbfbfd] border border-border rounded-md text-[13px] font-medium text-content-secondary hover:text-[#111827] lowercase transition-colors">
                <CheckCircle2 className="w-4 h-4" /> результат
              </button>
            </div>
          </div>
          {/* Table */}
          <div className="flex-1 overflow-auto custom-scrollbar">
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
                {mockLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#fbfbfd] cursor-pointer group transition-colors">
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
              <div className="flex flex-wrap items-center gap-2">
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
              
              <Button onClick={handleRun} disabled={isRunning || !manualPrompt.trim() || selectedModels.length === 0} className="h-9 px-6 rounded-md lowercase font-medium text-[13px] w-full sm:w-auto shrink-0">
                {isRunning ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2 fill-current" />
                )}
                запустить
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
                    </div>
                    {!res.loading && (
                      <button className="text-white/40 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-medium lowercase bg-white/5 hover:bg-white/10 px-1.5 py-1 rounded" title="Сохранить в библиотеку">
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
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border hover:border-accent/30 hover:bg-[#fbfbfd] transition-colors group cursor-pointer" onClick={() => setManualPrompt(`промпт из истории ${i}`)}>
                    <div>
                      <div className="text-[13px] font-medium text-[#111827] line-clamp-1 group-hover:text-accent transition-colors">лучшие аналоги {slug} в 2024 году</div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5 opacity-80">
                          <ModelIcon model="chatgpt" size={14} />
                          <ModelIcon model="claude" size={14} />
                        </div>
                        <span className="text-[10px] font-mono text-content-tertiary">сегодня в 12:45</span>
                      </div>
                    </div>
                    <button className="p-1.5 text-content-muted hover:text-accent rounded-md hover:bg-accent/10 transition-colors" title="Повторить запрос" onClick={(e) => { e.stopPropagation(); setManualPrompt(`промпт из истории ${i}`); handleRun(); }}>
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
