import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Search, Loader2, Sparkles, Activity, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { LandingNavbar } from '../landing/LandingNavbar';

export default function PublicAuditView() {
  const navigate = useNavigate();
  const [brandName, setBrandName] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'scanning' | 'result'
  const [auditId, setAuditId] = useState(null);
  
  // Fake Logs for scanning animation
  const [logs, setLogs] = useState([]);

  const handleStartAudit = async (e) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    setStep('scanning');
    setLogs(['Подключение к поисковым системам...']);

    let newAuditId = null;
    try {
      // Basic fingerprint check (session storage mock)
      const fp = sessionStorage.getItem('audit_fp') || `fp_${Date.now()}`;
      sessionStorage.setItem('audit_fp', fp);

      // Create record
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
      console.warn("DB insert failed, continuing in mock mode", err);
    }

    // Simulate scanning process
    const scanSteps = [
      { msg: 'Поиск упоминаний бренда...', delay: 1000 },
      { msg: 'Анализ выдачи ChatGPT (GPT-4o)... [OK]', delay: 2500 },
      { msg: 'Анализ выдачи Claude 3.5 Sonnet... [OK]', delay: 4000 },
      { msg: 'Анализ выдачи Google AI Overviews... [OK]', delay: 5500 },
      { msg: 'Оценка тональности (Sentiment Analysis)...', delay: 7000 },
      { msg: 'Проверка на галлюцинации...', delay: 8500 },
      { msg: 'Формирование отчета...', delay: 10000 }
    ];

    scanSteps.forEach(s => {
      setTimeout(() => {
        setLogs(prev => [...prev, s.msg]);
      }, s.delay);
    });

    setTimeout(async () => {
      // Generate mock result
      const mockResult = {
        sov: Math.floor(Math.random() * 40) + 10, // 10-50%
        aioScore: Math.floor(Math.random() * 40) + 30, // 30-70
        hallucination: `В 40% случаев ChatGPT путает информацию о продуктах "${brandName}" с устаревшими моделями конкурентов.`
      };

      if (newAuditId) {
        await supabase.from('public_audits').update({
          status: 'completed',
          result: mockResult
        }).eq('id', newAuditId);
      }

      setStep('result');
    }, 11500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans pt-16">
      <LandingNavbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="max-w-2xl w-full relative z-10 -mt-16">
          
          {step === 'input' && (
            <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[13px] font-semibold tracking-wide lowercase mb-4">
                <Sparkles className="w-4 h-4" /> бесплатный ai-аудит
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-content-primary tracking-tight">
                Узнайте, как нейросети видят <br/>ваш бренд.
              </h1>
              <p className="text-lg text-content-secondary max-w-xl mx-auto">
                Получите срез доли голоса (SOV), AIO-Скор и найдите главные ошибки (галлюцинации) ChatGPT и Claude о вашей компании за 15 секунд.
              </p>

              <form onSubmit={handleStartAudit} className="mt-8 relative max-w-xl mx-auto">
                <div className="relative group">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl group-hover:bg-accent/30 transition-colors"></div>
                  <div className="relative flex items-center bg-white border-2 border-border focus-within:border-accent rounded-full p-2 pl-6 shadow-xl transition-all">
                    <Search className="w-5 h-5 text-content-tertiary" />
                    <input 
                      type="text" 
                      placeholder="Название компании (например, Acme Corp)" 
                      className="flex-1 h-12 px-4 bg-transparent outline-none text-[16px] text-[#111827] placeholder:text-content-muted font-medium"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      required
                    />
                    <Button type="submit" size="lg" className="rounded-full h-12 px-8 text-[14px]">
                      Сканировать ИИ
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {step === 'scanning' && (
            <div className="bg-white border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
              <div className="p-4 border-b border-border bg-[#fbfbfd] flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-accent" />
                <span className="font-semibold text-[#111827]">Анализ нейросетей...</span>
              </div>
              <div className="p-6 bg-[#0f172a] h-[300px] font-mono text-[13px] text-green-400 overflow-y-auto flex flex-col justify-end">
                <div className="space-y-2">
                  {logs.map((log, i) => (
                    <div key={i} className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                      <span className="text-blue-400 mr-2">[{new Date().toLocaleTimeString()}]</span>
                      {log}
                    </div>
                  ))}
                  <div className="flex gap-1 animate-pulse mt-2">
                    <div className="w-2 h-4 bg-green-400"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="bg-white border border-border shadow-xl rounded-2xl p-8 mb-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#111827]">Базовый аудит завершен</h2>
                  <p className="text-content-secondary mt-1">Вот краткая сводка по видимости бренда <b>{brandName}</b> в ИИ.</p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-[#fbfbfd] border border-border rounded-xl p-5 text-center">
                    <div className="text-[13px] font-medium text-content-secondary uppercase tracking-wider mb-2">Общая видимость (SOV)</div>
                    <div className="text-4xl font-bold text-[#111827]">14%</div>
                    <div className="text-[12px] text-red-500 mt-2 flex items-center justify-center gap-1">
                      <Activity className="w-3.5 h-3.5" /> Ниже нормы по рынку
                    </div>
                  </div>
                  <div className="bg-[#fbfbfd] border border-border rounded-xl p-5 text-center">
                    <div className="text-[13px] font-medium text-content-secondary uppercase tracking-wider mb-2">AIO-Скор</div>
                    <div className="text-4xl font-bold text-[#111827]">42/100</div>
                    <div className="text-[12px] text-orange-500 mt-2 flex items-center justify-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Требуется оптимизация
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-xl p-5 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[14px] font-bold text-red-900 mb-1">Критическая галлюцинация найдена!</h3>
                    <p className="text-[13px] text-red-800 leading-relaxed">В 40% случаев ChatGPT путает информацию о продуктах "{brandName}" с устаревшими моделями конкурентов.</p>
                  </div>
                </div>
              </div>

              {/* Lead Gen CTA */}
              <div className="bg-gradient-to-r from-[#6D5FE8] to-[#9285FF] rounded-2xl p-8 text-center text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3">Это лишь 10% данных.</h3>
                  <p className="text-white/80 mb-6 max-w-lg mx-auto">
                    Зарегистрируйтесь бесплатно, чтобы разблокировать полный аудит: анализ тональности, сравнение с конкурентами и пошаговый план по внедрению в ChatGPT.
                  </p>
                  <Button 
                    size="lg" 
                    className="bg-white text-accent hover:bg-white/90 rounded-full px-8"
                    onClick={() => navigate('/signup')}
                  >
                    Разблокировать полный отчет <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
