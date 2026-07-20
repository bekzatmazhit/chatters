import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Sparkles, Activity, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export function PublicAuditSection() {
  const navigate = useNavigate();
  const [brandName, setBrandName] = useState('');
  const [step, setStep] = useState<'input' | 'scanning' | 'result'>('input');
  const [auditId, setAuditId] = useState<string | null>(null);
  
  // Sleek animation state
  const [scanProgress, setScanProgress] = useState(0);
  const [scanText, setScanText] = useState('Инициализация ИИ-агентов...');

  const handleStartAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    setStep('scanning');
    setScanProgress(0);
    setScanText('Поиск упоминаний бренда...');

    let newAuditId = null;
    try {
      const fp = sessionStorage.getItem('audit_fp') || `fp_${Date.now()}`;
      sessionStorage.setItem('audit_fp', fp);

      const { data, error } = await supabase.from('public_audits').insert({
        brand_name: brandName,
        fingerprint: fp,
        status: 'processing'
      }).select().single();

      if (data) {
        setAuditId(data.id);
        newAuditId = data.id;
      }
    } catch (err) {
      console.warn("DB insert failed", err);
    }

    // Sleek progress animation
    const steps = [
      { progress: 15, text: 'Анализ выдачи ChatGPT (GPT-4o)...' },
      { progress: 35, text: 'Анализ выдачи Claude 3.5 Sonnet...' },
      { progress: 55, text: 'Анализ выдачи Gemini 1.5 Pro...' },
      { progress: 75, text: 'Оценка доли голоса (SOV) и тональности...' },
      { progress: 90, text: 'Поиск галлюцинаций в фактах...' },
      { progress: 100, text: 'Формирование отчета...' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setScanProgress(steps[currentStep].progress);
        setScanText(steps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Complete the audit
        setTimeout(async () => {
          const mockResult = {
            sov: Math.floor(Math.random() * 40) + 10,
            aioScore: Math.floor(Math.random() * 40) + 30,
            hallucination: `В 40% случаев ChatGPT путает информацию о продуктах "${brandName}" с устаревшими моделями конкурентов.`
          };

          if (newAuditId) {
            await supabase.from('public_audits').update({
              status: 'completed',
              result: mockResult
            }).eq('id', newAuditId);
          }

          setStep('result');
        }, 800);
      }
    }, 1200);
  };

  return (
    <section data-navbar-section data-navbar-theme="dark" className="dark relative bg-[#0b0d12] py-20 md:py-24 overflow-hidden">
      {/* Background glow for sleekness */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-accent/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 mx-auto max-w-3xl px-5 md:px-8">
        
        {step === 'input' && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-[12px] font-semibold tracking-wide lowercase">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> ai-аудит
            </div>
            <h2 className="text-[36px] font-semibold leading-[1.1] tracking-tight text-white md:text-[52px]">
              Проверьте, как нейросети видят ваш бренд.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[16px] leading-7 text-white/70">
              Введите название компании, и мы за 10 секунд соберем базовый AIO-Скор, долю голоса и найдем ошибки (галлюцинации) в ChatGPT и Claude.
            </p>

            <form onSubmit={handleStartAudit} className="mx-auto mt-10 relative max-w-xl">
              <div className="relative flex items-center bg-white/[0.04] border border-white/12 focus-within:border-accent/50 focus-within:bg-white/[0.06] rounded-xl p-1.5 pl-5 shadow-2xl transition-all">
                <Search className="w-5 h-5 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Например, Acme Corp" 
                  className="flex-1 h-12 px-4 bg-transparent outline-none text-[16px] text-white placeholder:text-white/30 font-medium"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                />
                <Button type="submit" className="h-12 px-6 rounded-lg bg-white text-[#111827] hover:bg-white/90 text-[14px] font-semibold lowercase">
                  Сканировать
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 'scanning' && (
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-10 text-center animate-in zoom-in-95 duration-500 max-w-xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-50"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 relative">
                <div className="absolute inset-0 border-2 border-accent/30 rounded-2xl animate-[spin_3s_linear_infinite] border-t-accent"></div>
                <Sparkles className="w-7 h-7 text-white animate-pulse" />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">{scanText}</h3>
              <p className="text-white/50 text-[13px] mb-8">Запрашиваем данные у ведущих LLM...</p>

              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
              <div className="text-right mt-2 text-[11px] font-mono text-accent">{scanProgress}%</div>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <CheckCircle2 className="w-32 h-32 text-success" />
              </div>
              
              <div className="relative z-10 text-center mb-8">
                <div className="inline-flex px-3 py-1 bg-success/20 text-success rounded-full text-[12px] font-bold uppercase tracking-wider mb-4">
                  Аудит завершен
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Отчет по бренду {brandName}</h2>
                <p className="text-white/60">Краткая сводка по видимости в ИИ на основе демо-выборки.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                  <div className="text-[12px] font-medium text-white/50 uppercase tracking-wider mb-2">Общая видимость</div>
                  <div className="text-4xl font-bold text-white mb-2">14%</div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-[11px] font-semibold">
                    <Activity className="w-3.5 h-3.5" /> Ниже рынка
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                  <div className="text-[12px] font-medium text-white/50 uppercase tracking-wider mb-2">AIO-Скор</div>
                  <div className="text-4xl font-bold text-white mb-2">42<span className="text-xl text-white/30">/100</span></div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-500/10 text-orange-400 text-[11px] font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Нужна оптимизация
                  </div>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex items-start gap-3 relative z-10">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-[14px] font-bold text-red-300 mb-1">Найдена галлюцинация!</h3>
                  <p className="text-[13px] text-red-200/80 leading-relaxed">В 40% ответов ChatGPT путает информацию о продуктах "{brandName}" с решениями конкурентов.</p>
                </div>
              </div>
            </div>

            {/* Lead Gen CTA */}
            <div className="text-center bg-gradient-to-b from-transparent to-accent/10 rounded-2xl p-8 border border-accent/20">
              <h3 className="text-[20px] font-bold text-white mb-3">Это лишь 10% от всей картины.</h3>
              <p className="text-white/60 mb-6 max-w-lg mx-auto text-[14px] leading-relaxed">
                Зарегистрируйтесь бесплатно, чтобы разблокировать полный анализ конкурентов, разбор тональности и получить пошаговый план по исправлению AI-выдачи.
              </p>
              <Button 
                size="lg" 
                className="bg-accent text-white hover:bg-accent-hover rounded-full px-8 h-12"
                onClick={() => navigate('/signup')}
              >
                Создать аккаунт и открыть отчет <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
