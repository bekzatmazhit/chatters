import React, { useState } from 'react';
import { 
  Wand2, FileText, Plus, Database, Sparkles, CheckCircle2, 
  ChevronRight, RefreshCw, BarChart2, Activity, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

// Mock list of tracking prompts for the multi-select
const MOCK_PROMPTS = [
  { id: 'p1', text: 'лучшая crm для малого бизнеса' },
  { id: 'p2', text: 'аналоги amocrm' },
  { id: 'p3', text: 'как выбрать систему учета клиентов' },
  { id: 'p4', text: 'бесплатная crm' }
];

export function SimulatorView({ projectId }: { projectId: string | undefined }) {
  const [inputType, setInputType] = useState('draft_content'); // 'draft_content' | 'fact_change' | 'source_addition'
  const [content, setContent] = useState('');
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const togglePrompt = (id: string) => {
    setSelectedPrompts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSimulate = async () => {
    if (!content.trim() || selectedPrompts.length === 0) return;
    
    setIsSimulating(true);
    setResult(null);

    // Write to DB for history (mock/optimistic approach)
    try {
      if (projectId) {
        await supabase.from('simulations').insert({
          project_id: projectId,
          input_type: inputType,
          input_content: content,
          target_prompt_ids: selectedPrompts,
          status: 'pending'
        });
      }
    } catch (e) {
      console.warn('Failed to save simulation to DB', e);
    }

    // Simulate backend processing
    setTimeout(async () => {
      const mockRes = {
        beforeSov: 15,
        afterSov: 32,
        growth: 17,
        insight: "Если вы опубликуете этот текст на трастовом домене (например, Хабр), вероятность упоминания в ChatGPT по выбранным запросам вырастет, так как текст содержит ключевые LSI, которых не хватало ИИ."
      };
      setResult(mockRes);
      
      // Update DB record (mock/optimistic approach)
      try {
        if (projectId) {
           await supabase.from('simulations').update({
             status: 'completed',
             result: mockRes
           }).eq('project_id', projectId).eq('status', 'pending');
        }
      } catch(e) {}
      
      setIsSimulating(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
      
      {/* LEFT: FORM */}
      <div className="w-full lg:w-[45%] flex flex-col bg-white border border-border rounded-xl shadow-sm overflow-hidden h-full min-h-0">
        <div className="p-5 border-b border-border bg-[#fbfbfd]">
          <h2 className="text-[14px] font-bold text-[#111827] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" /> Настроить симуляцию
          </h2>
          <p className="text-[12px] text-content-secondary mt-1">Оцените влияние контента на ответы ИИ до публикации.</p>
        </div>

        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-6">
          {/* Input Type */}
          <div className="space-y-3">
            <label className="text-[12px] font-semibold text-content-primary uppercase tracking-wide">Тип изменения</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button 
                onClick={() => setInputType('draft_content')}
                className={`p-3 border rounded-lg flex flex-col items-center gap-2 text-[12px] font-medium transition-all ${inputType === 'draft_content' ? 'border-accent bg-accent/5 text-accent' : 'border-border bg-[#fbfbfd] text-content-secondary hover:border-accent/30'}`}
              >
                <FileText className="w-5 h-5" />
                Черновик
              </button>
              <button 
                onClick={() => setInputType('fact_change')}
                className={`p-3 border rounded-lg flex flex-col items-center gap-2 text-[12px] font-medium transition-all ${inputType === 'fact_change' ? 'border-accent bg-accent/5 text-accent' : 'border-border bg-[#fbfbfd] text-content-secondary hover:border-accent/30'}`}
              >
                <Database className="w-5 h-5" />
                Новый факт
              </button>
              <button 
                onClick={() => setInputType('source_addition')}
                className={`p-3 border rounded-lg flex flex-col items-center gap-2 text-[12px] font-medium transition-all ${inputType === 'source_addition' ? 'border-accent bg-accent/5 text-accent' : 'border-border bg-[#fbfbfd] text-content-secondary hover:border-accent/30'}`}
              >
                <Plus className="w-5 h-5" />
                Источник
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <label className="text-[12px] font-semibold text-content-primary uppercase tracking-wide">Контент</label>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Вставьте текст статьи, абзац с фактами или описание источника..."
              className="w-full h-32 p-3 text-[13px] border border-border rounded-lg bg-[#fbfbfd] focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
            ></textarea>
          </div>

          {/* Target Prompts */}
          <div className="space-y-3">
            <label className="text-[12px] font-semibold text-content-primary uppercase tracking-wide">Целевые запросы (влияние)</label>
            <div className="bg-[#fbfbfd] border border-border rounded-lg p-2 max-h-40 overflow-y-auto custom-scrollbar">
              {MOCK_PROMPTS.map(p => (
                <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selectedPrompts.includes(p.id)}
                    onChange={() => togglePrompt(p.id)}
                    className="w-4 h-4 text-accent border-border rounded focus:ring-accent"
                  />
                  <span className="text-[13px] text-content-secondary">{p.text}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-[#fbfbfd]">
          <Button 
            onClick={handleSimulate} 
            disabled={!content.trim() || selectedPrompts.length === 0 || isSimulating}
            className="w-full h-11 rounded-lg text-[14px] font-semibold"
          >
            {isSimulating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
            {isSimulating ? 'Запуск симуляции ИИ...' : 'Рассчитать влияние'}
          </Button>
        </div>
      </div>

      {/* RIGHT: RESULTS */}
      <div className="w-full lg:w-[55%] flex flex-col bg-[#fbfbfd] border border-border rounded-xl shadow-sm overflow-hidden h-full min-h-0 relative">
        {!result && !isSimulating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-white border border-border flex items-center justify-center mb-4 shadow-sm">
              <BarChart2 className="w-8 h-8 text-content-muted" />
            </div>
            <h3 className="text-[16px] font-bold text-[#111827]">Симулятор не запущен</h3>
            <p className="text-[13px] text-content-secondary mt-2 max-w-sm">
              Заполните форму слева и нажмите "Рассчитать влияние", чтобы увидеть предиктивный анализ от Chatters.
            </p>
          </div>
        )}

        {isSimulating && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-accent/20 animate-ping absolute inset-0"></div>
              <div className="w-20 h-20 rounded-full bg-accent text-white flex items-center justify-center relative z-10 shadow-xl">
                <Wand2 className="w-8 h-8 animate-pulse" />
              </div>
            </div>
            <h3 className="text-[15px] font-bold text-[#111827] mt-6">Анализ контекста LLM...</h3>
            <p className="text-[13px] text-content-secondary mt-1">Оцениваем вес новых фактов в векторе.</p>
          </div>
        )}

        {result && !isSimulating && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-[#111827]">Отчет симуляции</h2>
                <p className="text-[13px] text-content-secondary">Прогноз готов с вероятностью 85%.</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-border rounded-xl p-4 shadow-sm text-center">
                <div className="text-[11px] font-bold text-content-secondary uppercase tracking-wider mb-2">До (SOV)</div>
                <div className="text-3xl font-bold text-content-primary">{result.beforeSov}%</div>
              </div>
              <div className="flex items-center justify-center -mx-2 z-10">
                <div className="w-8 h-8 rounded-full bg-[#fbfbfd] border border-border flex items-center justify-center text-content-tertiary">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <div className="bg-white border border-accent/30 rounded-xl p-4 shadow-sm text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-accent/5"></div>
                <div className="relative z-10">
                  <div className="text-[11px] font-bold text-accent uppercase tracking-wider mb-2">После публикации</div>
                  <div className="text-3xl font-bold text-accent">{result.afterSov}%</div>
                </div>
              </div>
            </div>

            {/* Growth Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-[14px] font-bold shadow-sm">
                <Activity className="w-4 h-4" />
                Прогнозируемый рост: +{result.growth} п.п.
              </div>
            </div>

            {/* AI Insight */}
            <div className="bg-[#111827] rounded-xl p-6 shadow-lg mt-6">
              <div className="flex items-center gap-2 mb-3 text-accent-light">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-[14px] font-bold text-white">Вывод AI-Copilot</h3>
              </div>
              <p className="text-[14px] leading-relaxed text-white/80">
                {result.insight}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
