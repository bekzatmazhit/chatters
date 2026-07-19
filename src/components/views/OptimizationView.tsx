import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ModelIcon } from '@/components/ui/ModelIcon';
import { 
  ListChecks, Wand2, FileText, Download, Share2, Plus, 
  Trash2, Edit2, Search, Filter, AlertTriangle, CheckCircle2,
  GitPullRequest
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
  { id: 2, title: 'Бесплатный тариф', value: 'Да, есть навсегда бесплатный тариф до 3 пользователей.' },
  { id: 3, title: 'Поддержка 24/7', value: 'Служба поддержки работает круглосуточно без выходных.' },
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

  const [expandedBrief, setExpandedBrief] = useState<number | null>(null);

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
          <Button className="h-9 px-5 mb-2 rounded-md lowercase font-medium text-[13px] shadow-sm">
            <Wand2 className="w-4 h-4 mr-2" /> сгенерировать план
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0">
        
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
                  {MOCK_PLAN.critical.length}
                </span>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar space-y-3">
                {MOCK_PLAN.critical.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-content-muted">
                    <ListChecks className="w-8 h-8 mb-3 opacity-20" />
                    <div className="text-[14px] font-semibold text-[#111827] lowercase">пока нет критичных задач</div>
                    <div className="text-[12px] mt-1 lowercase">ИИ-модели корректно отображают вашу главную информацию.</div>
                  </div>
                ) : (
                  MOCK_PLAN.critical.map(task => (
                    <div key={task.id} className="bg-white border border-red-100 rounded-lg p-4 shadow-sm hover:border-red-200 transition-colors">
                      <div className="text-[14px] font-semibold text-[#111827] mb-1.5">{task.title}</div>
                      <div className="text-[13px] text-content-secondary leading-relaxed mb-3">{task.desc}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-content-tertiary lowercase font-mono">
                          <ModelIcon model={task.model} size={14} className="grayscale opacity-70" />
                          выявлено в ответах {task.model}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" className="h-7 px-2.5 text-[11px] lowercase rounded">
                            сгенерировать бриф
                          </Button>
                          <Button variant="outline" className="h-7 px-2.5 text-[11px] lowercase rounded text-content-muted hover:text-[#111827]">
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
                  {MOCK_PLAN.medium.length}
                </span>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar space-y-3">
                {MOCK_PLAN.medium.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-content-muted">
                    <ListChecks className="w-8 h-8 mb-3 opacity-20" />
                    <div className="text-[14px] font-semibold text-[#111827] lowercase">пока нет задач среднего приоритета</div>
                  </div>
                ) : (
                  MOCK_PLAN.medium.map(task => (
                    <div key={task.id} className="bg-white border border-border/60 rounded-lg p-4 shadow-sm hover:border-border transition-colors">
                      <div className="text-[14px] font-semibold text-[#111827] mb-1.5">{task.title}</div>
                      <div className="text-[13px] text-content-secondary leading-relaxed mb-3">{task.desc}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-content-tertiary lowercase font-mono">
                          <ModelIcon model={task.model} size={14} className="grayscale opacity-70" />
                          выявлено в ответах {task.model}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" className="h-7 px-2.5 text-[11px] lowercase rounded">
                            сгенерировать бриф
                          </Button>
                          <Button variant="outline" className="h-7 px-2.5 text-[11px] lowercase rounded text-content-muted hover:text-[#111827]">
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
                {MOCK_BRIEFS.map(brief => (
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
                              {brief.bullets.length ? brief.bullets.map((b, i) => (
                                <li key={i} className="text-[13px] text-content-secondary">{b}</li>
                              )) : <div className="text-[13px] text-content-muted italic">нет тезисов</div>}
                            </ul>
                          </div>
                          <div>
                            <h3 className="eyebrow mb-3">факты для использования</h3>
                            <ul className="list-disc list-inside space-y-1.5">
                              {brief.facts.length ? brief.facts.map((f, i) => (
                                <li key={i} className="text-[13px] text-[#111827] font-medium">{f}</li>
                              )) : <div className="text-[13px] text-content-muted italic">нет фактов</div>}
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                          <Button variant="outline" className="h-8 px-4 text-[12px] lowercase font-medium rounded-md bg-white">
                            <Download className="w-3.5 h-3.5 mr-1.5" /> экспортировать .md
                          </Button>
                          <Button variant="outline" className="h-8 px-4 text-[12px] lowercase font-medium rounded-md bg-white border-blue-200 text-blue-700 hover:bg-blue-50">
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
                  className="w-full md:w-1/3 h-9 px-3 bg-[#fbfbfd] border border-border rounded-md text-[13px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
                <input 
                  type="text" 
                  placeholder="значение / описание факта" 
                  className="w-full md:flex-1 h-9 px-3 bg-[#fbfbfd] border border-border rounded-md text-[13px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
                <Button className="w-full md:w-auto h-9 px-6 rounded-md lowercase font-medium text-[13px] shrink-0">
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
                  {MOCK_FACTS.map(fact => (
                    <div key={fact.id} className="group flex items-start justify-between p-3 rounded-lg hover:bg-[#fbfbfd] transition-colors border border-transparent hover:border-border/50">
                      <div>
                        <div className="text-[13px] font-bold text-[#111827] mb-0.5">{fact.topic || fact.title}</div>
                        <div className="text-[13px] text-content-secondary leading-relaxed">{fact.value}</div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-content-tertiary hover:text-accent hover:bg-accent/10 rounded-md transition-colors" title="Редактировать">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-content-tertiary hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Удалить">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                  {MOCK_HALLUCINATIONS.map(hallu => (
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
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-orange-600">
                            <AlertTriangle className="w-3.5 h-3.5" /> требует проверки
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative group inline-block">
                          <Button variant="outline" disabled className="h-8 px-3 text-[11px] lowercase rounded flex items-center gap-1.5 bg-surface text-content-muted border-border/50">
                            <GitPullRequest className="w-3.5 h-3.5" /> auto-pr
                          </Button>
                          <div className="absolute right-0 bottom-full mb-2 w-[180px] p-2 bg-[#111827] text-white text-[11px] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-center z-50 lowercase font-medium pointer-events-none">
                            подключите интеграцию
                            <svg className="absolute text-[#111827] h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                          </div>
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
